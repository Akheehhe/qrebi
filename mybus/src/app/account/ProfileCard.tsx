"use client";

import { useActionState, useState } from "react";
import { Mail, Pencil, Phone, UserRound, X } from "lucide-react";
import { updateProfileAction } from "@/app/actions/auth";
import { Field, ErrorBanner, inputClass } from "@/components/forms";
import { SubmitButton } from "@/components/SubmitButton";
import type { User } from "@/lib/types";

export function ProfileCard({ user }: { user: User }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState(updateProfileAction, undefined);
  const [seenState, setSeenState] = useState(state);

  // Close the edit form right after a successful save (render-time adjustment).
  if (state !== seenState) {
    setSeenState(state);
    if (state?.ok) setEditing(false);
  }

  if (!editing) {
    return (
      <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-500 text-xl font-bold text-white">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold text-ink">
              {user.firstName} {user.lastName}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-subtle">
              <Mail className="h-4 w-4 shrink-0 text-brand-500" />
              <span className="truncate">{user.email}</span>
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-subtle">
              <Phone className="h-4 w-4 shrink-0 text-brand-500" />
              {user.phone}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas"
          >
            <Pencil className="h-4 w-4" />
            შეცვლა
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <form action={formAction} className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-bold text-ink">
            <UserRound className="h-5 w-5 text-brand-500" />
            პროფილის შეცვლა
          </p>
          <button
            type="button"
            onClick={() => setEditing(false)}
            aria-label="დახურვა"
            className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white text-subtle transition hover:bg-canvas"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ErrorBanner message={state?.error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="სახელი" error={state?.fieldErrors?.firstName}>
            <input
              type="text"
              name="firstName"
              defaultValue={user.firstName}
              required
              className={inputClass}
            />
          </Field>
          <Field label="გვარი" error={state?.fieldErrors?.lastName}>
            <input
              type="text"
              name="lastName"
              defaultValue={user.lastName}
              required
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="ტელეფონი" error={state?.fieldErrors?.phone}>
          <input
            type="tel"
            name="phone"
            defaultValue={user.phone}
            required
            placeholder="+995 5XX XX XX XX"
            className={inputClass}
          />
        </Field>
        <SubmitButton>შენახვა</SubmitButton>
      </form>
    </section>
  );
}
