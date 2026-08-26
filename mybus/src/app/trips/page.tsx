import Link from "next/link";
import { ArrowRight, BusFront } from "lucide-react";
import { listTrips } from "@/lib/dal";
import { CITIES } from "@/lib/constants";
import { tbilisiTodayDateInput } from "@/lib/datetime";
import { SearchTripsForm } from "@/components/SearchTripsForm";
import { TripCard } from "@/components/TripCard";

export const metadata = {
  title: "რეისები | MyBus",
};

function asString(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const rawFrom = asString(sp.from);
  const rawTo = asString(sp.to);
  const rawDate = asString(sp.date);
  const rawSort = asString(sp.sort);

  const cities: readonly string[] = CITIES;
  const from = rawFrom && cities.includes(rawFrom) ? rawFrom : undefined;
  const to = rawTo && cities.includes(rawTo) ? rawTo : undefined;
  const date =
    rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : undefined;
  const sort = rawSort === "price" ? ("price" as const) : undefined;

  const trips = await listTrips({ from, to, date, sort });
  const minDate = tbilisiTodayDateInput();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {from && to ? (
        <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-ink sm:text-3xl">
          <span>{from}</span>
          <ArrowRight className="h-6 w-6 shrink-0 text-brand-500" />
          <span>{to}</span>
        </h1>
      ) : (
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          რეისები
        </h1>
      )}

      <div className="mt-5">
        <SearchTripsForm
          defaultFrom={from ?? ""}
          defaultTo={to ?? ""}
          defaultDate={date ?? ""}
          defaultSort={sort ?? ""}
          minDate={minDate}
          variant="bar"
        />
      </div>

      <p className="mt-4 text-sm text-subtle">
        ნაპოვნია {trips.length} რეისი
      </p>

      {trips.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-500">
            <BusFront className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink">
            ამ მიმართულებით რეისები ვერ მოიძებნა
          </h2>
          <p className="mt-2 text-subtle">სცადე სხვა თარიღი ან მიმართულება</p>
          <Link
            href="/trips"
            className="mt-6 inline-flex items-center justify-center rounded-xl border border-line bg-white px-5 py-3 font-semibold text-ink transition hover:bg-canvas"
          >
            ყველა რეისის ნახვა
          </Link>
        </div>
      )}
    </div>
  );
}
