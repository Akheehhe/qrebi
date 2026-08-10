import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { getCurrentUser, getTrip, userHasBooking } from "@/lib/dal";
import {
  formatPrice,
  formatTbilisiDateYear,
  formatTbilisiTime,
  formatTbilisiWeekday,
  isPast,
} from "@/lib/datetime";
import { Badge } from "@/components/Badge";
import { JoinTripForm } from "./JoinTripForm";

function SeatsBadge({ seatsLeft }: { seatsLeft: number }) {
  if (seatsLeft <= 0) return <Badge variant="danger">ადგილები აღარ არის</Badge>;
  if (seatsLeft <= 4) {
    return <Badge variant="warning">დარჩა {seatsLeft} ადგილი</Badge>;
  }
  return <Badge variant="success">{seatsLeft} თავისუფალი ადგილი</Badge>;
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTrip(id);
  if (!trip) notFound();

  const user = await getCurrentUser();
  const booked = user ? userHasBooking(id, user.id) : false;
  const gone = trip.status === "departed" || isPast(trip.departureAt);
  const tripPath = `/trips/${trip.id}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="mb-6 flex items-center gap-1.5 text-sm text-subtle">
        <Link href="/trips" className="transition hover:text-brand-600">
          რეისები
        </Link>
        <ChevronRight className="h-4 w-4 text-faint" />
        <span className="font-medium text-ink">
          {trip.originCity} - {trip.destinationCity}
        </span>
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* LEFT column */}
        <div className="space-y-6">
          <img
            src={trip.vehiclePhotoUrl}
            alt={trip.vehicleName}
            className="w-full rounded-2xl border border-line object-cover"
          />

          <div className="rounded-2xl border border-line bg-white p-6">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-ink sm:text-3xl">
              {trip.originCity}
              <ArrowRight className="inline h-6 w-6 text-brand-500" />
              {trip.destinationCity}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-faint">გასვლის დღე</p>
                  <p className="font-semibold text-ink">
                    {formatTbilisiWeekday(trip.departureAt)},{" "}
                    {formatTbilisiDateYear(trip.departureAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-faint">გასვლის დრო</p>
                  <p className="text-2xl font-extrabold text-ink">
                    {formatTbilisiTime(trip.departureAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
              <p className="flex items-center gap-2 text-subtle">
                <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
                გასვლა: <span className="font-medium text-ink">{trip.originStation}</span>
              </p>
              <p className="flex flex-wrap items-center gap-2 text-subtle">
                <BusFront className="h-4 w-4 shrink-0 text-brand-500" />
                <span className="font-medium text-ink">{trip.vehicleName}</span>
                <Badge variant="neutral" className="font-mono">
                  {trip.vehiclePlate}
                </Badge>
              </p>
              <p className="flex items-center gap-2 text-subtle">
                <Users className="h-4 w-4 shrink-0 text-brand-500" />
                {trip.seatsTaken}/{trip.totalSeats} ადგილი დაკავებულია
              </p>
            </div>

            {trip.notes && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{trip.notes}</p>
              </div>
            )}
          </div>

          {/* DRIVER CARD */}
          <div className="rounded-2xl border border-line bg-white p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-500 text-lg font-bold text-white">
                {trip.driverFirstName.charAt(0)}
                {trip.driverLastName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">
                  {trip.driverFirstName} {trip.driverLastName}
                </p>
                <Badge variant="brand" className="mt-1">
                  პარტნიორი მძღოლი
                </Badge>
              </div>
              <a
                href={`tel:${trip.driverPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-canvas"
              >
                <Phone className="h-4 w-4 text-brand-500" />
                {trip.driverPhone}
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="self-start lg:sticky lg:top-24">
          <div className="rounded-2xl border border-line bg-white p-6">
            <div className="flex items-end justify-between gap-2">
              <span className="text-sm text-subtle">ფასი ერთ ადგილზე</span>
              <span className="text-3xl font-extrabold text-ink">
                {formatPrice(trip.priceGel)}
              </span>
            </div>
            <div className="mt-3">
              <SeatsBadge seatsLeft={trip.seatsLeft} />
            </div>

            <div className="mt-5 border-t border-line pt-5">
              {trip.status === "cancelled" ? (
                <div className="rounded-xl bg-danger-50 p-4 text-sm font-semibold text-danger-500">
                  ეს რეისი გაუქმებულია
                </div>
              ) : gone ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-canvas p-4 text-sm font-medium text-subtle">
                    ეს რეისი უკვე გავიდა
                  </div>
                  <Link
                    href="/trips"
                    className="flex w-full items-center justify-center rounded-xl border border-line bg-white px-5 py-3 font-semibold text-ink transition hover:bg-canvas"
                  >
                    სხვა რეისების ნახვა
                  </Link>
                </div>
              ) : !user ? (
                <div className="space-y-3">
                  <p className="text-sm text-subtle">
                    ადგილის დასაჯავშნად გაიარე ავტორიზაცია
                  </p>
                  <Link
                    href={`/login?next=${encodeURIComponent(tripPath)}`}
                    className="flex w-full items-center justify-center rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
                  >
                    შესვლა
                  </Link>
                  <Link
                    href={`/signup?next=${encodeURIComponent(tripPath)}`}
                    className="flex w-full items-center justify-center rounded-xl border border-line bg-white px-5 py-3 font-semibold text-ink transition hover:bg-canvas"
                  >
                    რეგისტრაცია
                  </Link>
                </div>
              ) : trip.driverId === user.id ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-canvas p-4 text-sm font-medium text-subtle">
                    ეს შენი რეისია
                  </div>
                  <Link
                    href="/driver"
                    className="flex w-full items-center justify-center rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
                  >
                    გახსენი მძღოლის კაბინეტი
                  </Link>
                </div>
              ) : booked ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 rounded-xl bg-success-50 p-4 text-sm font-semibold text-success-500">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    ამ რეისზე ჯავშანი უკვე გაქვს
                  </div>
                  <Link
                    href="/account"
                    className="flex w-full items-center justify-center rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
                  >
                    ჩემი ჯავშნები
                  </Link>
                </div>
              ) : trip.seatsLeft === 0 ? (
                <div className="rounded-xl bg-danger-50 p-4 text-sm font-semibold text-danger-500">
                  ადგილები ამოიწურა
                </div>
              ) : (
                <JoinTripForm
                  tripId={trip.id}
                  seatsLeft={trip.seatsLeft}
                  priceGel={trip.priceGel}
                  defaultPhone={user.phone}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
