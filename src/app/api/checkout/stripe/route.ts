import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/client";
import { hotelConfig } from "@/lib/hotel/config";
import { toStripeAmount } from "@/lib/hotel/money";
import { isValidIsoDate, nightsBetween } from "@/lib/hotel/dates";

const bodySchema = z.object({
  locale: z.string().min(2).max(10),
  roomId: z.coerce.number().int().positive(),
  roomName: z.string().min(1),
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
});

export async function POST(request: NextRequest) {
  const raw = await request.json();
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const nights = nightsBetween(data.arrival, data.departure);
  if (nights < 1) {
    return NextResponse.json(
      { error: "Departure must be after arrival" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const baseUrl = hotelConfig.appUrl.replace(/\/$/, "");
  const successUrl = `${baseUrl}/${data.locale}/book/confirmation?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/${data.locale}/book/cancel`;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: data.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: data.currency.toLowerCase(),
            unit_amount: toStripeAmount(data.price, data.currency),
            product_data: {
              name: `${data.roomName} · ${nights} night(s)`,
              description: `${data.arrival} → ${data.departure}`,
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        roomId: String(data.roomId),
        roomName: data.roomName,
        arrival: data.arrival,
        departure: data.departure,
        adults: String(data.adults),
        children: String(data.children),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? "",
        country: data.country ?? "",
        arrivalTime: data.arrivalTime ?? "",
        notes: data.notes ?? "",
        price: String(data.price),
        currency: data.currency.toUpperCase(),
      },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
