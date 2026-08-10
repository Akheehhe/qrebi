"use client";

import { useActionState, useState } from "react";
import { createTripAction } from "@/app/actions/driver";
import { CITIES, STATION_SUGGESTIONS } from "@/lib/constants";
import { Field, ErrorBanner, inputClass, selectClass } from "@/components/forms";
import { SubmitButton } from "@/components/SubmitButton";
import type { Vehicle } from "@/lib/types";

export function NewTripForm({
  vehicles,
  minDeparture,
}: {
  vehicles: Vehicle[];
  minDeparture: string;
}) {
  const [state, formAction] = useActionState(createTripAction, undefined);
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);

  return (
    <form
      action={formAction}
      className="max-w-2xl space-y-4 rounded-2xl border border-line bg-white p-6"
    >
      <ErrorBanner message={state?.error} />

      <Field label="ავტობუსი" error={state?.fieldErrors?.vehicleId}>
        <select
          name="vehicleId"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className={selectClass}
        >
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} · {v.plateNumber} · {v.capacity} ადგილი
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="საიდან" error={state?.fieldErrors?.originCity}>
          <select
            name="originCity"
            defaultValue="თბილისი"
            className={selectClass}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>
        <Field label="სად" error={state?.fieldErrors?.destinationCity}>
          <select
            name="destinationCity"
            defaultValue=""
            required
            className={selectClass}
          >
            <option value="">აირჩიე ქალაქი</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="გასვლის ადგილი" error={state?.fieldErrors?.originStation}>
        <input
          type="text"
          name="originStation"
          list="stations"
          required
          placeholder="მაგ. დიდუბის ავტოსადგური"
          className={inputClass}
        />
        <datalist id="stations">
          {STATION_SUGGESTIONS.map((station) => (
            <option key={station} value={station} />
          ))}
        </datalist>
      </Field>

      <Field label="გასვლის დრო" error={state?.fieldErrors?.departure}>
        <input
          type="datetime-local"
          name="departure"
          min={minDeparture}
          required
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ფასი (₾)" error={state?.fieldErrors?.price}>
          <input
            type="number"
            name="price"
            min={1}
            max={1000}
            required
            placeholder="35"
            className={inputClass}
          />
        </Field>
        <Field
          label="ადგილების რაოდენობა"
          error={state?.fieldErrors?.totalSeats}
        >
          <input
            type="number"
            name="totalSeats"
            min={1}
            max={selectedVehicle?.capacity}
            required
            placeholder={
              selectedVehicle ? String(selectedVehicle.capacity) : "16"
            }
            className={inputClass}
          />
          {selectedVehicle && (
            <p className="mt-1.5 text-xs text-faint">
              მაქს. {selectedVehicle.capacity}
            </p>
          )}
        </Field>
      </div>

      <Field label="შენიშვნა" error={state?.fieldErrors?.notes}>
        <textarea
          name="notes"
          rows={3}
          maxLength={300}
          placeholder="მაგ. გზაში ერთი შესვენება, Wi-Fi"
          className={inputClass}
        />
      </Field>

      <SubmitButton variant="accent" className="w-full">
        რეისის გამოქვეყნება
      </SubmitButton>
    </form>
  );
}
