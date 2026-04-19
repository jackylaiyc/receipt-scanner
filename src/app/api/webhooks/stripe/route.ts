import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import {
  finalizeBooking,
  type BookingMetadata,
} from "@/lib/beds24/createBeds24Booking";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata as unknown as BookingMetadata | null;
    if (!meta?.roomId) {
      console.warn("[stripe webhook] session missing metadata", session.id);
      return NextResponse.json({ received: true });
    }
    try {
      const result = await finalizeBooking(meta, {
        provider: "stripe",
        id: session.payment_intent?.toString() ?? session.id,
      });
      if (!result.success) {
        console.error("[stripe webhook] beds24 booking failed", result.errors);
      }
    } catch (err) {
      console.error("[stripe webhook] finalize error", err);
      return NextResponse.json(
        { error: "Failed to create Beds24 booking" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
