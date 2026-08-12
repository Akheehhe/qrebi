import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  BusFront,
  Flag,
  Search,
  Ticket,
  Wallet,
} from "lucide-react";
import { getStats, listTrips, popularRoutes } from "@/lib/dal";
import { PLATFORM_FEE_GEL } from "@/lib/constants";
import { formatPrice, tbilisiTodayDateInput } from "@/lib/datetime";
import { SearchTripsForm } from "@/components/SearchTripsForm";
import { TripCard } from "@/components/TripCard";

const STEPS = [
  { icon: Search, title: "მოძებნე", tone: "bg-brand-50 text-brand-500" },
  { icon: Ticket, title: "დაჯავშნე", tone: "bg-accent-400/20 text-accent-600" },
  { icon: BusFront, title: "იმგზავრე", tone: "bg-success-50 text-success-500" },
] as const;

const PRICING = [
  { icon: BadgePercent, value: "0%", label: "საკომისიო" },
  { icon: Wallet, value: "100%", label: "თანხა შენია" },
  { icon: Flag, value: `${PLATFORM_FEE_GEL}₾`, label: "რეისზე" },
] as const;

export default async function HomePage() {
  const routes = popularRoutes(8);
  const trips = listTrips({ limit: 6 });
  const stats = getStats();
  const minDate = tbilisiTodayDateInput();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-24 h-80 w-80 rounded-full bg-brand-900/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.5) 1.5px, transparent 1.5px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex items-center justify-between gap-8">
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-6xl">
              იმგზავრე
              <br />
              <span className="text-accent-400">მარტივად</span>
            </h1>
            <img
              src="/images/buses/coach-blue.svg"
              alt=""
              aria-hidden="true"
              className="hidden w-72 shrink-0 rotate-2 rounded-3xl shadow-2xl shadow-brand-900/40 md:block"
            />
          </div>
          <div className="mt-8">
            <SearchTripsForm variant="hero" minDate={minDate} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* POPULAR ROUTES */}
        {routes.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-ink">
              პოპულარული მიმართულებები
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {routes.map((r) => (
                <Link
                  key={`${r.from}-${r.to}`}
                  href={`/trips?from=${encodeURIComponent(r.from)}&to=${encodeURIComponent(r.to)}`}
                  className="group rounded-2xl border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-lg hover:shadow-brand-900/10"
                >
                  <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
                    <span className="truncate">{r.from}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-brand-500" />
                    <span className="truncate">{r.to}</span>
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-brand-500">
                    {formatPrice(r.minPrice)}-დან
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* UPCOMING TRIPS */}
        <section className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-ink">უახლოესი რეისები</h2>
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-500 transition hover:text-brand-600"
            >
              ყველა
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {trips.length > 0 ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-line bg-white p-10 text-center text-subtle">
              რეისები ჯერ არ არის
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="mt-12">
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {STEPS.map(({ icon: Icon, title, tone }, i) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-white p-5 text-center sm:p-6"
              >
                <span
                  className={`mx-auto grid h-12 w-12 place-items-center rounded-full sm:h-14 sm:w-14 ${tone}`}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                </span>
                <p className="mt-3 text-sm font-extrabold text-ink sm:text-base">
                  {i + 1}. {title}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="mt-12 grid grid-cols-3 gap-3 sm:gap-5">
          {PRICING.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-line bg-white p-5 text-center sm:p-6"
            >
              <Icon className="mx-auto h-6 w-6 text-brand-500" />
              <p className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
                {value}
              </p>
              <p className="mt-1 text-xs font-medium text-subtle sm:text-sm">
                {label}
              </p>
            </div>
          ))}
        </section>

        {/* DRIVER CTA */}
        <section className="mt-12">
          <div className="relative overflow-hidden rounded-3xl bg-brand-900 p-8 text-center sm:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/20"
            />
            <img
              src="/images/buses/sprinter-yellow.svg"
              alt=""
              aria-hidden="true"
              className="relative mx-auto w-44 rounded-2xl sm:w-52"
            />
            <h2 className="relative mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              ხარ მძღოლი?
            </h2>
            <Link
              href="/signup?role=driver"
              className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-8 py-4 text-lg font-bold text-ink transition hover:bg-accent-600"
            >
              დაიწყე ახლავე
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-12">
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-line bg-white p-6 text-center sm:p-8">
            <div>
              <p className="text-2xl font-extrabold text-brand-500 sm:text-3xl">
                {stats.trips}
              </p>
              <p className="mt-1 text-xs font-medium text-subtle sm:text-sm">
                რეისი
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand-500 sm:text-3xl">
                {stats.drivers}
              </p>
              <p className="mt-1 text-xs font-medium text-subtle sm:text-sm">
                მძღოლი
              </p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-brand-500 sm:text-3xl">
                {stats.routes}
              </p>
              <p className="mt-1 text-xs font-medium text-subtle sm:text-sm">
                მიმართულება
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
