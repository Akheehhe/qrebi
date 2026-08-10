"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Field, ErrorBanner, inputClass } from "@/components/forms";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <ErrorBanner message={state?.error} />
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
      <Field label="პაროლი" error={state?.fieldErrors?.password}>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <SubmitButton className="w-full">შესვლა</SubmitButton>
    </form>
  );
}
