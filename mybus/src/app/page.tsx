import Link from "next/link";
import {
  ArrowRight,
  BusFront,
  Check,
  CreditCard,
  PhoneCall,
  Search,
  Ticket,
  TicketCheck,
} from "lucide-react";
import { getStats, listTrips, popularRoutes } from "@/lib/dal";
import { formatPrice, tbilisiTodayDateInput } from "@/lib/datetime";
import { SearchTripsForm } from "@/components/SearchTripsForm";
import { TripCard } from "@/components/TripCard";

const TRUST_CHIPS = [
  { icon: TicketCheck, label: "უფასო ჯავშანი" },
  { icon: CreditCard, label: "ონლაინ ან ადგილზე გადახდა" },
  { icon: PhoneCall, label: "პირდაპირი კავშირი მძღოლთან" },
] as const;

const STEPS = [
  {
    icon: Search,
    title: "მოძებნე მარშრუტი",
    text: "აირჩიე საიდან მიდიხარ, სად და როდის.",
  },
  {
    icon: Ticket,
    title: "დაჯავშნე ადგილი",
    text: "აირჩიე ადგილების რაოდენობა და გადაიხადე ონლაინ ან მძღოლთან.",
  },
  {
    icon: BusFront,
    title: "იმგზავრე",
    text: "მიდი გასვლის ადგილზე ზუსტ დროს, შენი ადგილი უკვე დაჯავშნილია.",
  },
] as const;

const DRIVER_BULLETS = [
  "გამოაქვეყნე განრიგი წინასწარ",
  "ნახე მგზავრების სია და კონტაქტები",
  "შეავსე ადგილები ცარიელი მოლოდინის ნაცვლად",
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
          className="pointer-events-none absolute right-1/4 top-10 h-24 w-24 rounded-full bg-accent-500/20"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
            <BusFront className="h-4 w-4" />
            ავტობუსები და მიკროავტობუსები მთელ საქართველოში
          </span>
          <h1 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-5xl">
            იმგზავრე საქართველოში ლოდინის გარეშე
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            აღარ არის საჭირო ავტოსადგურზე მისვლა და საათობით ლოდინი. მძღოლები
            აქვეყნებენ რეისებს წინასწარ, შენ კი ჯავშნი ადგილს ონლაინ.
          </p>
          <div className="mt-8">
            <SearchTripsForm variant="hero" minDate={minDate} />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70">
            {TRUST_CHIPS.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            ))}
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
                  <span className="mt-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-brand-500">
                      დან {formatPrice(r.minPrice)}
                    </span>
                    <span className="text-faint">{r.count} რეისი</span>
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
              ყველა რეისი
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
              ამ მომენტში დაგეგმილი რეისები არ არის. შემოიხედე მოგვიანებით.
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="mt-12">
          <h2 className="text-xl font-bold text-ink">როგორ მუშაობს</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-extrabold text-brand-500">
                    {i + 1}
                  </span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-500/15 text-accent-600">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-subtle">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* DRIVER CTA */}
        <section className="mt-12">
          <div className="relative overflow-hidden rounded-3xl bg-brand-900 p-8 sm:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 right-1/4 h-56 w-56 rounded-full bg-accent-500/10"
            />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                  ხარ მძღოლი? დაამატე შენი რეისები უფასოდ
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {DRIVER_BULLETS.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 text-white/80"
                    >
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-500 text-ink">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/signup?role=driver"
                className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-accent-500 px-7 py-3.5 font-bold text-ink transition hover:bg-accent-600 md:self-center"
              >
                დაიწყე ახლავე
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-12">
          <div className="grid gap-4 rounded-2xl border border-line bg-white p-8 text-center sm:grid-cols-3">
            <div>
              <p className="text-3xl font-extrabold text-brand-500">
                {stats.trips}
              </p>
              <p className="mt-1 text-sm font-medium text-subtle">
                დაგეგმილი რეისი
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand-500">
                {stats.drivers}
              </p>
              <p className="mt-1 text-sm font-medium text-subtle">
                პარტნიორი მძღოლი
              </p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-brand-500">
                {stats.routes}
              </p>
              <p className="mt-1 text-sm font-medium text-subtle">
                მიმართულება
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
