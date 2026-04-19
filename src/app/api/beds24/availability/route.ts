import { NextResponse, type NextRequest } from "next/server";
import { getOffers, getRoomTypes } from "@/lib/beds24/client";
import { isValidIsoDate, nightsBetween } from "@/lib/hotel/dates";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const arrival = searchParams.get("arrival");
  const departure = searchParams.get("departure");
  const adults = Number(searchParams.get("adults") ?? "2");
  const children = Number(searchParams.get("children") ?? "0");

  if (!isValidIsoDate(arrival) || !isValidIsoDate(departure)) {
    return NextResponse.json(
      { error: "Invalid dates (expected YYYY-MM-DD)" },
      { status: 400 }
    );
  }
  const nights = nightsBetween(arrival, departure);
  if (nights < 1) {
    return NextResponse.json(
      { error: "Departure must be after arrival" },
      { status: 400 }
    );
  }

  try {
    const [rooms, offers] = await Promise.all([
      getRoomTypes(),
      getOffers({
        arrival,
        departure,
        numAdults: adults,
        numChildren: children,
      }),
    ]);

    const offerByRoom = new Map<number, (typeof offers)[number]>();
    for (const o of offers) {
      const existing = offerByRoom.get(o.roomId);
      if (!existing || o.price < existing.price) offerByRoom.set(o.roomId, o);
    }

    const results = rooms
      .map((room) => {
        const offer = offerByRoom.get(room.id);
        if (!offer) return null;
        return {
          roomId: room.id,
          name: room.name,
          description:
            room.texts?.[0]?.roomDescription ?? room.roomDescription ?? "",
          maxPeople: room.maxPeople ?? room.maxAdult ?? 2,
          images: room.images ?? [],
          price: offer.price,
          currency: offer.currency,
          nights,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));

    return NextResponse.json({ rooms: results, arrival, departure, nights });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
