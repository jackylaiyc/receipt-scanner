import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createPayPalOrder } from "@/lib/paypal/client";
import { hotelConfig } from "@/lib/hotel/config";
import { isValidIsoDate, nightsBetween } from "@/lib/hotel/dates";

const bodySchema = z.object({
  locale: z.string().min(2).max(10),
  roomId: z.coerce.number().int().positive(),
  roomName: z.string().min(1),
  arrival: z.string().refine(isValidIsoDate),
  departure: z.string().refine(isValidIsoDate),
  adults: z.coerce.number().int().min(1).max(20),
  children: z.coerce.number().int().min(0).max(20),
  price: z.coerce.number().positive(),
  currency: z.string().length(3),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
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

  const baseUrl = hotelConfig.appUrl.replace(/\/$/, "");
  try {
    const order = await createPayPalOrder({
      amount: data.price,
      currency: data.currency,
      reference: `room-${data.roomId}-${data.arrival}`,
      description: `${data.roomName} · ${nights} night(s) · ${data.arrival} → ${data.departure}`,
      returnUrl: `${baseUrl}/${data.locale}/book/confirmation`,
      cancelUrl: `${baseUrl}/${data.locale}/book/cancel`,
    });
    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "PayPal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
