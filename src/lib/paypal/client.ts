const PAYPAL_BASE = process.env.PAYPAL_ENV === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

type TokenCache = { token: string; expiresAt: number };
let cached: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt > now + 30_000) return cached.token;

  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  if (!id || !secret) throw new Error("PAYPAL_CLIENT_ID/SECRET not configured");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return data.access_token;
}

export async function createPayPalOrder(params: {
  amount: number;
  currency: string;
  reference: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approveUrl?: string }> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.reference,
          description: params.description,
          amount: {
            currency_code: params.currency.toUpperCase(),
            value: params.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`PayPal create order failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    id: string;
    links: Array<{ rel: string; href: string }>;
  };
  const approve = data.links.find((l) => l.rel === "approve")?.href;
  return { id: data.id, approveUrl: approve };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  id: string;
  status: string;
  captureId?: string;
  payerEmail?: string;
  customId?: string;
}> {
  const token = await getAccessToken();
  const res = await fetch(
    `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    id: string;
    status: string;
    payer?: { email_address?: string };
    purchase_units?: Array<{
      reference_id?: string;
      payments?: {
        captures?: Array<{ id: string; custom_id?: string }>;
      };
    }>;
  };
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    id: data.id,
    status: data.status,
    captureId: capture?.id,
    payerEmail: data.payer?.email_address,
    customId: capture?.custom_id,
  };
}

export async function getPayPalOrder(orderId: string): Promise<{
  id: string;
  status: string;
  customId?: string;
}> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`PayPal get order failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    id: string;
    status: string;
    purchase_units?: Array<{ custom_id?: string }>;
  };
  return {
    id: data.id,
    status: data.status,
    customId: data.purchase_units?.[0]?.custom_id,
  };
}
