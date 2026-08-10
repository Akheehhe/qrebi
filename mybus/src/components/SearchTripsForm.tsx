import { ArrowLeftRight, Search } from "lucide-react";
import { CITIES } from "@/lib/constants";
import { selectClass } from "./forms";

function CityOptions({ placeholder }: { placeholder: string }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {CITIES.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </>
  );
}

export function SearchTripsForm({
  defaultFrom = "",
  defaultTo = "",
  defaultDate = "",
  defaultSort = "",
  minDate,
  variant = "hero",
}: {
  defaultFrom?: string;
  defaultTo?: string;
  defaultDate?: string;
  defaultSort?: string;
  /** Tbilisi 'YYYY-MM-DD', computed server-side */
  minDate: string;
  variant?: "hero" | "bar";
}) {
  if (variant === "bar") {
    return (
      <form
        method="get"
        action="/trips"
        className="grid grid-cols-2 items-end gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1fr_1fr_170px_150px_auto]"
      >
        <select
          name="from"
          defaultValue={defaultFrom}
          aria-label="საიდან"
          className={selectClass}
        >
          <CityOptions placeholder="საიდან" />
        </select>
        <select
          name="to"
          defaultValue={defaultTo}
          aria-label="სად"
          className={selectClass}
        >
          <CityOptions placeholder="სად" />
        </select>
        <input
          type="date"
          name="date"
          defaultValue={defaultDate}
          min={minDate}
          aria-label="თარიღი"
          className={selectClass}
        />
        <select
          name="sort"
          defaultValue={defaultSort}
          aria-label="დალაგება"
          className={selectClass}
        >
          <option value="">დროის მიხედვით</option>
          <option value="price">ფასის მიხედვით</option>
        </select>
        <button
          type="submit"
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600 md:col-span-1"
        >
          <Search className="h-4 w-4" />
          ძებნა
        </button>
      </form>
    );
  }

  return (
    <form
      method="get"
      action="/trips"
      className="grid items-center gap-3 rounded-2xl bg-white p-4 shadow-xl shadow-brand-900/10 md:grid-cols-[1fr_auto_1fr_180px_160px] md:gap-2 md:rounded-full md:py-3 md:pl-6 md:pr-3"
    >
      <select
        name="from"
        defaultValue={defaultFrom}
        aria-label="საიდან"
        className="w-full rounded-xl border border-line bg-white px-4 py-3 font-medium text-ink focus:border-brand-500 focus:outline-none md:rounded-full md:border-transparent md:bg-canvas"
      >
        <CityOptions placeholder="საიდან" />
      </select>
      <span className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500 md:grid">
        <ArrowLeftRight className="h-4 w-4" />
      </span>
      <select
        name="to"
        defaultValue={defaultTo}
        aria-label="სად"
        className="w-full rounded-xl border border-line bg-white px-4 py-3 font-medium text-ink focus:border-brand-500 focus:outline-none md:rounded-full md:border-transparent md:bg-canvas"
      >
        <CityOptions placeholder="სად" />
      </select>
      <input
        type="date"
        name="date"
        defaultValue={defaultDate}
        min={minDate}
        aria-label="თარიღი"
        className="w-full rounded-xl border border-line bg-white px-4 py-3 font-medium text-ink focus:border-brand-500 focus:outline-none md:rounded-full md:border-transparent md:bg-canvas"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 font-bold text-ink transition hover:bg-accent-600 md:rounded-full"
      >
        <Search className="h-5 w-5" />
        მოძებნა
      </button>
    </form>
  );
}
