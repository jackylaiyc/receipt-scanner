import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { capturePayPalOrder } from "@/lib/paypal/client";
import { getOffers } from "@/lib/beds24/client";
import { finalizeBooking } from "@/lib/beds24/createBeds24Booking";
import { isValidIsoDate } from "@/lib/hotel/dates";

const bodySchema = z.object({
  orderId: z.string().min(1),
  booking: z.object({
    roomId: z.coerce.number().int().positive(),
    arrival: z.string().refine(isValidIsoDate),
    departure: z.string().refine(isValidIsoDate),
    adults: z.coerce.number().int().min(1).max(20),
    children: z.coerce.number().int().min(0).max(20),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().max(30).optional(),
    country: z.string().max(2).optional(),
    arrivalTime: z.string().max(10).optional(),
    notes: z.string().max(500).optional(),
    price: z.coerce.number().positive(),
    currency: z.string().length(3),
  }),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const { orderId, booking } = parsed.data;

  const verifyOffers = await getOffers({
    arrival: booking.arrival,
    departure: booking.departure,
    numAdults: booking.adults,
    numChildren: booking.children,
    roomId: booking.roomId,
  }).catch(() => []);

  const liveOffer = verifyOffers.find((o) => o.roomId === booking.roomId);
  if (!liveOffer) {
    return NextResponse.json(
      { error: "Room no longer available for the selected dates" },
      { status: 409 }
    );
  }
  if (Math.abs(liveOffer.price - booking.price) > 0.01) {
    return NextResponse.json(
      {
        error: "Price changed since you started booking",
        expected: liveOffer.price,
      },
      { status: 409 }
    );
  }

  let captured;
  try {
    captured = await capturePayPalOrder(orderId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Capture failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
  if (captured.status !== "COMPLETED") {
    return NextResponse.json(
      { error: `Payment not completed (${captured.status})` },
      { status: 402 }
    );
  }

  const result = await finalizeBooking(
    {
      ...booking,
      roomId: String(booking.roomId),
      arrival: booking.arrival,
      departure: booking.departure,
      adults: String(booking.adults),
      children: String(booking.children),
      price: String(booking.price),
      currency: booking.currency.toUpperCase(),
    },
    { provider: "paypal", id: captured.captureId ?? captured.id }
  );

  if (!result.success) {
    console.error("[paypal capture] beds24 booking failed", result.errors);
    return NextResponse.json(
      {
        error:
          "Payment captured but booking creation failed. Our team will contact you.",
        paymentRef: captured.captureId ?? captured.id,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    bookingId: result.bookId,
    paymentRef: captured.captureId ?? captured.id,
  });
}
