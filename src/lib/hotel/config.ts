export const hotelConfig = {
  name: process.env.NEXT_PUBLIC_HOTEL_NAME ?? "Your Hotel",
  currency: (process.env.NEXT_PUBLIC_HOTEL_CURRENCY ?? "HKD").toUpperCase(),
  contactEmail: process.env.NEXT_PUBLIC_HOTEL_EMAIL ?? "hello@example.com",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
