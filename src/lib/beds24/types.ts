export type Beds24RoomType = {
  id: number;
  propertyId: number;
  name: string;
  qty: number;
  minPrice?: number;
  maxPeople?: number;
  maxAdult?: number;
  maxChildren?: number;
  texts?: Array<{
    language?: string;
    roomDescription?: string;
  }>;
  roomDescription?: string;
  images?: Array<{ url: string; description?: string }>;
};

export type Beds24Availability = {
  roomId: number;
  name?: string;
  availability: Record<string, number>;
  price?: Record<string, number>;
};

export type Beds24Offer = {
  roomId: number;
  offerId?: number;
  name?: string;
  price: number;
  currency?: string;
  nights: number;
};

export type Beds24CreateBookingInput = {
  propertyId: number;
  roomId: number;
  arrival: string;
  departure: string;
  numAdult: number;
  numChild: number;
  guestFirstName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestCountry?: string;
  arrivalTime?: string;
  notes?: string;
  price: number;
  currency: string;
  status?: "confirmed" | "new" | "request";
  invoiceItems?: Array<{
    description: string;
    qty: number;
    amount: number;
  }>;
};

export type Beds24BookingResponse = {
  success: boolean;
  bookId?: number;
  errors?: Array<{ code?: string; message?: string }>;
};
