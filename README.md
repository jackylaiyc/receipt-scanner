This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

It hosts two apps side by side:

- **Receipt Scanner** (original) — protected routes under `/capture`, `/dashboard`, `/receipts`, etc.
- **Hotel Booking** — public, multilingual site under `/[locale]/...` (en, ko, ja, zh-TW, zh-CN).

## Hotel Booking Site

**Stack:** Next.js 16 App Router · next-intl 4 · Beds24 API v2 (rooms, availability, bookings) · Stripe Checkout · PayPal Smart Buttons. No database — Beds24 is the source of truth, payment references are written into the booking note.

### Flow

1. Guest picks dates on `/` → `/[locale]/rooms?arrival=...&departure=...&adults=...`
2. Server calls Beds24 `GET /inventory/rooms/offers` + `GET /properties/rooms`
3. Guest opens `/[locale]/rooms/[roomTypeId]` → `Book now` → `/[locale]/book`
4. Booking form:
   - **Pay with card** → `POST /api/checkout/stripe` creates a Checkout Session with booking metadata → guest redirected to Stripe
   - Stripe webhook `POST /api/webhooks/stripe` fires `checkout.session.completed` → calls `POST /v2/bookings` on Beds24 with status `confirmed` and the payment reference in notes
   - **Pay with PayPal** → `POST /api/checkout/paypal/create` → PayPal Smart Button → `POST /api/checkout/paypal/capture` verifies price vs Beds24, captures payment, creates the Beds24 booking synchronously

### Required env vars (see `.env.example`)

```
NEXT_PUBLIC_HOTEL_NAME, NEXT_PUBLIC_HOTEL_CURRENCY, NEXT_PUBLIC_HOTEL_EMAIL
BEDS24_REFRESH_TOKEN, BEDS24_PROPERTY_ID
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
PAYPAL_ENV, PAYPAL_CLIENT_ID, PAYPAL_SECRET, NEXT_PUBLIC_PAYPAL_CLIENT_ID
NEXT_PUBLIC_APP_URL
```

### Self-host quick start

```bash
cp .env.example .env.local  # fill in hotel + Beds24 + Stripe + PayPal values
npm install --legacy-peer-deps
npm run build && npm start
```

Point your Stripe webhook at `https://<your-domain>/api/webhooks/stripe` and subscribe to `checkout.session.completed`.

### End-to-end smoke test

1. `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI)
2. Visit `/en`, pick dates, pick a room, click **Book now**
3. Complete a test card payment — watch logs for Beds24 booking creation
4. Repeat the flow choosing **PayPal** (sandbox buyer account)
5. Verify the new booking appears in your Beds24 inbox with the payment reference in the guest note

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
