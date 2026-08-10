"use client";

import { useActionState, useState } from "react";
import { BusFront, UserRound } from "lucide-react";
import { signupAction } from "@/app/actions/auth";
import { Field, ErrorBanner, inputClass } from "@/components/forms";
import { SubmitButton } from "@/components/SubmitButton";

const ROLES = [
  {
    value: "passenger",
    icon: UserRound,
    title: "მგზავრი",
    text: "ვეძებ რეისებს და ვჯავშნი ადგილს",
  },
  {
    value: "driver",
    icon: BusFront,
    title: "მძღოლი",
    text: "ვამატებ რეისებს და ვიყვან მგზავრებს",
  },
] as const;

export function SignupForm({
  defaultRole,
  next,
}: {
  defaultRole: "passenger" | "driver";
  next?: string;
}) {
  const [state, formAction] = useActionState(signupAction, undefined);
  const [role, setRole] = useState<"passenger" | "driver">(defaultRole);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <input type="hidden" name="role" value={role} />

      <div className="grid grid-cols-2 gap-3">
        {ROLES.map(({ value, icon: Icon, title, text }) => {
          const selected = role === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              aria-pressed={selected}
              className={`rounded-2xl border p-4 text-left transition ${
                selected
                  ? "border-brand-500 bg-brand-50"
                  : "border-line bg-white hover:bg-canvas"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${selected ? "text-brand-600" : "text-subtle"}`}
              />
              <p className="mt-2 font-semibold text-ink">{title}</p>
              <p className="mt-0.5 text-xs text-subtle">{text}</p>
            </button>
          );
        })}
      </div>

      <ErrorBanner message={state?.error} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="სახელი" error={state?.fieldErrors?.firstName}>
          <input
            type="text"
            name="firstName"
            autoComplete="given-name"
            required
            className={inputClass}
          />
        </Field>
        <Field label="გვარი" error={state?.fieldErrors?.lastName}>
          <input
            type="text"
            name="lastName"
            autoComplete="family-name"
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="ელფოსტა" error={state?.fieldErrors?.email}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </Field>

      <Field label="ტელეფონი" error={state?.fieldErrors?.phone}>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          required
          placeholder="+995 5XX XX XX XX"
          className={inputClass}
        />
      </Field>

      <Field label="პაროლი" error={state?.fieldErrors?.password}>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-faint">მინიმუმ 8 სიმბოლო</p>
      </Field>

      <SubmitButton className="w-full">ანგარიშის შექმნა</SubmitButton>

      <p className="text-center text-xs text-faint">
        რეგისტრაციით ეთანხმები მოხმარების წესებს
      </p>
    </form>
  );
}
