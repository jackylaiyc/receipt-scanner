import { createBooking } from "./client";
import type { Beds24BookingResponse } from "./types";

export type BookingMetadata = {
  roomId: string;
  arrival: string;
  departure: string;
  adults: string;
  children: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  arrivalTime?: string;
  notes?: string;
  price: string;
  currency: string;
};

export async function finalizeBooking(
  metadata: BookingMetadata,
  paymentRef: { provider: "stripe" | "paypal"; id: string }
): Promise<Beds24BookingResponse> {
  const propertyId = Number(process.env.BEDS24_PROPERTY_ID);
  const note = `Paid via ${paymentRef.provider.toUpperCase()} — ref ${paymentRef.id}`;
  const combinedNotes = metadata.notes
    ? `${metadata.notes}\n\n${note}`
    : note;

  return createBooking({
    propertyId,
    roomId: Number(metadata.roomId),
    arrival: metadata.arrival,
    departure: metadata.departure,
    numAdult: Number(metadata.adults),
    numChild: Number(metadata.children),
    guestFirstName: metadata.firstName,
    guestName: metadata.lastName,
    guestEmail: metadata.email,
    guestPhone: metadata.phone,
    guestCountry: metadata.country,
    arrivalTime: metadata.arrivalTime,
    notes: combinedNotes,
    price: Number(metadata.price),
    currency: metadata.currency,
    status: "confirmed",
  });
}
