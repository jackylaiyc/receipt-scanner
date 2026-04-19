"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  PayPalButtons,
  PayPalScriptProvider,
} from "@paypal/react-paypal-js";
import { useRouter } from "@/i18n/navigation";

type Props = {
  roomId: number;
  roomName: string;
  arrival: string;
  departure: string;
  adults: number;
  children: number;
  price: number;
  currency: string;
  paypalClientId: string | null;
};

type GuestForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  arrivalTime: string;
  notes: string;
  agreed: boolean;
};

export default function BookingForm(props: Props) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const router = useRouter();
  const [method, setMethod] = useState<"stripe" | "paypal">("stripe");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<GuestForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    arrivalTime: "",
    notes: "",
    agreed: false,
  });

  const readyForPayPal = useMemo(
    () =>
      form.agreed &&
      form.firstName.trim() &&
      form.lastName.trim() &&
      /.+@.+\..+/.test(form.email),
    [form]
  );

  function setField<K extends keyof GuestForm>(key: K, value: GuestForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onStripeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.agreed) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          roomId: props.roomId,
          roomName: props.roomName,
          arrival: props.arrival,
          departure: props.departure,
          adults: props.adults,
          children: props.children,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          country: form.country.trim() || undefined,
          arrivalTime: form.arrivalTime.trim() || undefined,
          notes: form.notes.trim() || undefined,
          price: props.price,
          currency: props.currency,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? t("error"));
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
      setSubmitting(false);
    }
  }

  async function handlePayPalCreate(): Promise<string> {
    const res = await fetch("/api/checkout/paypal/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        roomId: props.roomId,
        roomName: props.roomName,
        arrival: props.arrival,
        departure: props.departure,
        adults: props.adults,
        children: props.children,
        price: props.price,
        currency: props.currency,
      }),
    });
    const data = (await res.json()) as { orderId?: string; error?: string };
    if (!res.ok || !data.orderId) {
      throw new Error(data.error ?? "PayPal create failed");
    }
    return data.orderId;
  }

  async function handlePayPalApprove(orderId: string) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          booking: {
            roomId: props.roomId,
            arrival: props.arrival,
            departure: props.departure,
            adults: props.adults,
            children: props.children,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || undefined,
            country: form.country.trim() || undefined,
            arrivalTime: form.arrivalTime.trim() || undefined,
            notes: form.notes.trim() || undefined,
            price: props.price,
            currency: props.currency,
          },
        }),
      });
      const data = (await res.json()) as {
        bookingId?: number;
        paymentRef?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? t("error"));
      const params = new URLSearchParams({
        ref: String(data.bookingId ?? data.paymentRef ?? orderId),
        provider: "paypal",
      });
      router.push(`/book/confirmation?${params.toString()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error"));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onStripeSubmit} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-lg font-medium text-white">
          {t("guestInfo")}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label={t("firstName")}
            value={form.firstName}
            onChange={(v) => setField("firstName", v)}
            required
          />
          <TextInput
            label={t("lastName")}
            value={form.lastName}
            onChange={(v) => setField("lastName", v)}
            required
          />
          <TextInput
            type="email"
            label={t("email")}
            value={form.email}
            onChange={(v) => setField("email", v)}
            required
          />
          <TextInput
            label={t("phone")}
            value={form.phone}
            onChange={(v) => setField("phone", v)}
          />
          <TextInput
            label={t("country")}
            value={form.country}
            onChange={(v) => setField("country", v)}
            maxLength={2}
            placeholder="HK"
          />
          <TextInput
            label={t("arrivalTime")}
            value={form.arrivalTime}
            onChange={(v) => setField("arrivalTime", v)}
            placeholder="15:00"
          />
        </div>
        <label className="block">
          <span className="text-sm text-slate-300">{t("specialRequests")}</span>
          <textarea
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            rows={3}
            maxLength={500}
            className="mt-1 block w-full rounded bg-slate-800 border border-slate-700 p-2 text-slate-100"
          />
        </label>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-lg font-medium text-white">
          {t("paymentMethod")}
        </legend>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="radio"
            name="method"
            checked={method === "stripe"}
            onChange={() => setMethod("stripe")}
          />
          {t("payWithCard")}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-200">
          <input
            type="radio"
            name="method"
            checked={method === "paypal"}
            onChange={() => setMethod("paypal")}
            disabled={!props.paypalClientId}
          />
          {t("payWithPayPal")}
          {!props.paypalClientId && (
            <span className="text-xs text-slate-500">(unavailable)</span>
          )}
        </label>
      </fieldset>

      <label className="flex items-start gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={form.agreed}
          onChange={(e) => setField("agreed", e.target.checked)}
          className="mt-1"
          required
        />
        <span>{t("agreeTerms")}</span>
      </label>

      {error && (
        <p className="rounded border border-red-900/50 bg-red-900/20 p-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {method === "stripe" ? (
        <button
          type="submit"
          disabled={!form.agreed || submitting}
          className="w-full rounded-md bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {submitting ? t("processing") : t("submit")}
        </button>
      ) : props.paypalClientId ? (
        <div className={readyForPayPal ? "" : "pointer-events-none opacity-50"}>
          <PayPalScriptProvider
            options={{
              clientId: props.paypalClientId,
              currency: props.currency.toUpperCase(),
              intent: "capture",
            }}
          >
            <PayPalButtons
              style={{ layout: "vertical", shape: "rect" }}
              disabled={!readyForPayPal || submitting}
              createOrder={() => handlePayPalCreate()}
              onApprove={async (data) => {
                await handlePayPalApprove(data.orderID);
              }}
              onError={(err) => {
                setError(err instanceof Error ? err.message : t("error"));
              }}
            />
          </PayPalScriptProvider>
        </div>
      ) : null}
    </form>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-1 block w-full rounded bg-slate-800 border border-slate-700 p-2 text-slate-100"
      />
    </label>
  );
}
