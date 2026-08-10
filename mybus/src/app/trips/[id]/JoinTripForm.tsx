"use client";

import { useActionState, useState } from "react";
import { Banknote, CreditCard } from "lucide-react";
import { bookTripAction } from "@/app/actions/booking";
import { ErrorBanner, Field, inputClass, selectClass } from "@/components/forms";
import { SubmitButton } from "@/components/SubmitButton";
import { formatPrice } from "@/lib/datetime";

export function JoinTripForm({
  tripId,
  seatsLeft,
  priceGel,
  defaultPhone,
}: {
  tripId: string;
  seatsLeft: number;
  priceGel: number;
  defaultPhone: string;
}) {
  const [state, formAction] = useActionState(bookTripAction, undefined);
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">(
    "online"
  );

  const maxSeats = Math.min(4, seatsLeft);
  const seatOptions = Array.from({ length: maxSeats }, (_, i) => i + 1);

  const cardClass = (active: boolean) =>
    `flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
      active
        ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-100"
        : "border-line bg-white hover:bg-canvas"
    }`;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tripId" value={tripId} />

      <Field label="ადგილების რაოდენობა">
        <select
          name="seats"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className={selectClass}
        >
          {seatOptions.map((n) => (
            <option key={n} value={n}>
              {n} ადგილი
            </option>
          ))}
        </select>
      </Field>

      <Field label="ტელეფონი" error={state?.fieldErrors?.phone}>
        <input
          type="tel"
          name="phone"
          defaultValue={defaultPhone}
          className={inputClass}
          placeholder="+995 5XX XX XX XX"
        />
        <p className="mt-1.5 text-xs text-faint">
          მძღოლი ამ ნომერზე დაგიკავშირდება
        </p>
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">
          გადახდის მეთოდი
        </span>
        <div className="space-y-2">
          <label className={cardClass(paymentMethod === "online")}>
            <input
              type="radio"
              name="paymentMethod"
              value="online"
              checked={paymentMethod === "online"}
              onChange={() => setPaymentMethod("online")}
              className="sr-only"
            />
            <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
            <span className="block">
              <span className="block text-sm font-semibold text-ink">
                ონლაინ გადახდა ბარათით
              </span>
              <span className="block text-xs text-faint">
                დემო რეჟიმი: გადახდა სიმულირებულია
              </span>
            </span>
          </label>
          <label className={cardClass(paymentMethod === "cash")}>
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
              className="sr-only"
            />
            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
            <span className="block">
              <span className="block text-sm font-semibold text-ink">
                ნაღდი ფული მძღოლთან
              </span>
              <span className="block text-xs text-faint">
                გადაიხდი ჩაჯდომისას
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-subtle">ჯამი</span>
        <span className="text-xl font-bold text-ink">
          {formatPrice(seats * priceGel)}
        </span>
      </div>

      <ErrorBanner message={state?.error ?? state?.fieldErrors?.phone} />

      <SubmitButton variant="accent" className="w-full font-bold">
        ადგილის დაჯავშნა
      </SubmitButton>

      <p className="text-center text-xs text-faint">
        ჯავშნის გაუქმება შესაძლებელია გასვლამდე
      </p>
    </form>
  );
}
