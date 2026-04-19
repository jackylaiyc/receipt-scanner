import type {
  Beds24Availability,
  Beds24BookingResponse,
  Beds24CreateBookingInput,
  Beds24Offer,
  Beds24RoomType,
} from "./types";

const BEDS24_BASE = "https://api.beds24.com/v2";

type TokenCache = { token: string; expiresAt: number };
let cachedToken: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.token;
  }
  const refresh = process.env.BEDS24_REFRESH_TOKEN;
  if (!refresh) throw new Error("BEDS24_REFRESH_TOKEN not configured");

  const res = await fetch(`${BEDS24_BASE}/authentication/token`, {
    method: "GET",
    headers: { refreshToken: refresh },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Beds24 auth failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { token: string; expiresIn: number };
  cachedToken = {
    token: data.token,
    expiresAt: now + data.expiresIn * 1000,
  };
  return data.token;
}

async function beds24Fetch<T>(
  path: string,
  init: RequestInit & { query?: Record<string, string | number | boolean | undefined> } = {}
): Promise<T> {
  const token = await getAccessToken();
  const { query, ...rest } = init;
  const url = new URL(`${BEDS24_BASE}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    ...rest,
    headers: {
      token,
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Beds24 ${path} failed: ${res.status} ${body}`);
  }
  return (await res.json()) as T;
}

type Beds24ListResponse<T> = {
  success: boolean;
  data: T[];
  count?: number;
};

export async function getRoomTypes(): Promise<Beds24RoomType[]> {
  const propertyId = process.env.BEDS24_PROPERTY_ID;
  if (!propertyId) throw new Error("BEDS24_PROPERTY_ID not configured");

  const res = await beds24Fetch<Beds24ListResponse<Beds24RoomType>>(
    "/properties/rooms",
    {
      method: "GET",
      query: {
        id: propertyId,
        includeTexts: "all",
        includePriceRules: false,
      },
    }
  );
  return res.data;
}

export async function getAvailability(params: {
  arrival: string;
  departure: string;
  roomIds?: number[];
}): Promise<Beds24Availability[]> {
  const propertyId = process.env.BEDS24_PROPERTY_ID;
  if (!propertyId) throw new Error("BEDS24_PROPERTY_ID not configured");

  const res = await beds24Fetch<Beds24ListResponse<Beds24Availability>>(
    "/inventory/rooms/availability",
    {
      method: "GET",
      query: {
        propertyId,
        startDate: params.arrival,
        endDate: params.departure,
        ...(params.roomIds?.length
          ? { roomId: params.roomIds.join(",") }
          : {}),
      },
    }
  );
  return res.data;
}

export async function getOffers(params: {
  arrival: string;
  departure: string;
  numAdults: number;
  numChildren?: number;
  roomId?: number;
}): Promise<Beds24Offer[]> {
  const propertyId = process.env.BEDS24_PROPERTY_ID;
  if (!propertyId) throw new Error("BEDS24_PROPERTY_ID not configured");

  const res = await beds24Fetch<Beds24ListResponse<Beds24Offer>>(
    "/inventory/rooms/offers",
    {
      method: "GET",
      query: {
        propertyId,
        arrival: params.arrival,
        departure: params.departure,
        numAdults: params.numAdults,
        numChildren: params.numChildren ?? 0,
        ...(params.roomId ? { roomId: params.roomId } : {}),
      },
    }
  );
  return res.data;
}

export async function createBooking(
  input: Beds24CreateBookingInput
): Promise<Beds24BookingResponse> {
  const payload = [
    {
      propertyId: input.propertyId,
      roomId: input.roomId,
      arrival: input.arrival,
      departure: input.departure,
      numAdult: input.numAdult,
      numChild: input.numChild,
      firstName: input.guestFirstName,
      lastName: input.guestName,
      email: input.guestEmail,
      phone: input.guestPhone,
      country2: input.guestCountry,
      arrivalTime: input.arrivalTime,
      notes: input.notes,
      price: input.price,
      status: input.status ?? "confirmed",
      invoiceItems: input.invoiceItems ?? [
        {
          description: `Room booking ${input.arrival} → ${input.departure}`,
          qty: 1,
          amount: input.price,
        },
      ],
    },
  ];

  const res = await beds24Fetch<{
    success: boolean;
    data: Array<{ bookId?: number; errors?: Array<{ message?: string }> }>;
  }>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const first = res.data?.[0];
  return {
    success: Boolean(first?.bookId),
    bookId: first?.bookId,
    errors: first?.errors,
  };
}
