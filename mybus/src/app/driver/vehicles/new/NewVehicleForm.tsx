"use client";

import { useActionState, useState } from "react";
import { createVehicleAction } from "@/app/actions/driver";
import { Field, ErrorBanner, inputClass } from "@/components/forms";
import { SubmitButton } from "@/components/SubmitButton";

const PRESETS = [
  { key: "sprinter-blue", label: "ლურჯი სპრინტერი" },
  { key: "sprinter-yellow", label: "ყვითელი სპრინტერი" },
  { key: "marshrutka-white", label: "თეთრი მიკროავტობუსი" },
  { key: "minibus-green", label: "მწვანე მინიბუსი" },
  { key: "coach-blue", label: "ლურჯი ავტობუსი" },
  { key: "coach-red", label: "წითელი ავტობუსი" },
] as const;

export function NewVehicleForm() {
  const [state, formAction] = useActionState(createVehicleAction, undefined);
  const [preset, setPreset] = useState<string>("marshrutka-white");

  return (
    <form
      action={formAction}
      className="max-w-2xl space-y-4 rounded-2xl border border-line bg-white p-6"
    >
      <ErrorBanner message={state?.error} />

      <Field label="მოდელი" error={state?.fieldErrors?.name}>
        <input
          type="text"
          name="name"
          required
          placeholder="მაგ. Mercedes-Benz Sprinter"
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="სახელმწიფო ნომერი" error={state?.fieldErrors?.plate}>
          <input
            type="text"
            name="plate"
            required
            placeholder="TB-123-AB"
            className={inputClass}
          />
        </Field>
        <Field
          label="ადგილების რაოდენობა"
          error={state?.fieldErrors?.capacity}
        >
          <input
            type="number"
            name="capacity"
            min={4}
            max={60}
            required
            placeholder="16"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="აირჩიე ილუსტრაცია">
        <input type="hidden" name="preset" value={preset} />
        <div className="grid grid-cols-3 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPreset(p.key)}
              aria-label={p.label}
              aria-pressed={preset === p.key}
              className="group text-left"
            >
              <img
                src={"/images/buses/" + p.key + ".svg"}
                alt={p.label}
                className={`h-20 w-full rounded-xl border-2 object-cover transition ${
                  preset === p.key
                    ? "border-brand-500"
                    : "border-line group-hover:border-brand-100"
                }`}
              />
            </button>
          ))}
        </div>
      </Field>

      <Field label="ან ატვირთე ფოტო" error={state?.fieldErrors?.photo}>
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm"
        />
        <p className="mt-1.5 text-xs text-faint">
          მაქს. 5MB, ატვირთვისას ილუსტრაციას ჩაანაცვლებს
        </p>
      </Field>

      <SubmitButton className="w-full">შენახვა</SubmitButton>
    </form>
  );
}
