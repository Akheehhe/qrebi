import Link from "next/link";
import {
  ArrowRight,
  Bus,
  CalendarCheck,
  Plus,
  Radio,
  Users,
} from "lucide-react";
import { driverTrips, driverVehicles, requireUser } from "@/lib/dal";
import { formatPrice, formatTbilisiDateTime, isPast } from "@/lib/datetime";
import { cancelTripAction } from "@/app/actions/driver";
import { Badge } from "@/components/Badge";
import { SubmitButton } from "@/components/SubmitButton";
import type { TripSummary } from "@/lib/types";

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-ink">{value}</p>
        <p className="text-sm text-subtle">{label}</p>
      </div>
    </div>
  );
}

function TripStatusBadge({ trip, past }: { trip: TripSummary; past: boolean }) {
  if (trip.status === "cancelled") {
    return <Badge variant="danger">გაუქმებული</Badge>;
  }
  if (trip.status === "scheduled" && !past) {
    return <Badge variant="success">დაგეგმილი</Badge>;
  }
  return <Badge variant="neutral">შესრულებული</Badge>;
}

export default async function DriverDashboardPage() {
  const user = await requireUser("driver");
  const trips = driverTrips(user.id);
  const vehicles = driverVehicles(user.id);

  const upcoming = trips.filter(
    (t) => t.status === "scheduled" && !isPast(t.departureAt)
  );
  const bookedSeats = upcoming.reduce((sum, t) => sum + t.seatsTaken, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<CalendarCheck className="h-5 w-5" />}
          label="აქტიური რეისი"
          value={upcoming.length}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="დაკავებული ადგილი"
          value={bookedSeats}
        />
        <StatCard
          icon={<Bus className="h-5 w-5" />}
          label="ავტობუსი"
          value={vehicles.length}
        />
      </div>

      {vehicles.length === 0 && (
        <div className="rounded-2xl border border-line bg-white p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <Bus className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink">
            დაამატე პირველი ავტობუსი
          </h2>
          <p className="mt-2 text-subtle">
            რეისის გამოქვეყნებამდე საჭიროა ავტობუსის დამატება.
          </p>
          <Link
            href="/driver/vehicles/new"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" />
            ავტობუსის დამატება
          </Link>
        </div>
      )}

      <section>
        <h2 className="text-xl font-bold text-ink">ჩემი რეისები</h2>
        {trips.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-line bg-white p-8 text-center">
            <p className="font-semibold text-ink">რეისები ჯერ არ გაქვს</p>
            <p className="mt-1 text-sm text-subtle">
              გამოაქვეყნე პირველი რეისი და მიიღე ჯავშნები მგზავრებისგან.
            </p>
            <Link
              href="/driver/trips/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 font-bold text-ink transition hover:bg-accent-600"
            >
              <Plus className="h-4 w-4" />
              ახალი რეისი
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {trips.map((trip) => {
              const past = isPast(trip.departureAt);
              const active = trip.status === "scheduled" && !past;
              const pct =
                trip.totalSeats > 0
                  ? Math.min(
                      100,
                      Math.round((trip.seatsTaken / trip.totalSeats) * 100)
                    )
                  : 0;
              return (
                <div
                  key={trip.id}
                  className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-white p-5"
                >
                  <div className="min-w-48">
                    <div className="flex items-center gap-2 font-bold text-ink">
                      <span>{trip.originCity}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-brand-500" />
                      <span>{trip.destinationCity}</span>
                    </div>
                    <p className="mt-1 text-sm text-subtle">
                      {formatTbilisiDateTime(trip.departureAt)} ·{" "}
                      {formatPrice(trip.priceGel)}
                    </p>
                  </div>
                  <div className="min-w-40 text-sm text-subtle">
                    <p className="font-medium text-ink">{trip.vehicleName}</p>
                    <p className="font-mono text-xs">{trip.vehiclePlate}</p>
                  </div>
                  <div className="w-36">
                    <p className="text-sm font-semibold text-ink">
                      {trip.seatsTaken}/{trip.totalSeats}{" "}
                      <span className="font-normal text-subtle">ადგილი</span>
                    </p>
                    <div className="mt-1.5 h-2 rounded-full bg-canvas">
                      <div
                        className="h-2 rounded-full bg-brand-500"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                  <TripStatusBadge trip={trip} past={past} />
                  <div className="ml-auto flex items-center gap-2">
                    {active && (
                      <Link
                        href={`/driver/trips/${trip.id}/live`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-sm font-bold text-ink transition hover:bg-accent-600"
                      >
                        <Radio className="h-4 w-4" />
                        LIVE ჩასხდომა
                      </Link>
                    )}
                    <Link
                      href={`/driver/trips/${trip.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-canvas"
                    >
                      <Users className="h-4 w-4" />
                      მგზავრები ({trip.onlineSeatsTaken})
                    </Link>
                    {active && (
                      <form action={cancelTripAction}>
                        <input type="hidden" name="tripId" value={trip.id} />
                        <SubmitButton
                          variant="ghost"
                          className="px-4 py-2 text-sm text-danger-500 hover:bg-danger-50"
                        >
                          გაუქმება
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
