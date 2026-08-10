import Link from "next/link";
import { ArrowRight, Phone, Ticket } from "lucide-react";
import { passengerBookings, requireUser } from "@/lib/dal";
import { formatPrice, formatTbilisiDateTime, isPast } from "@/lib/datetime";
import { Badge } from "@/components/Badge";
import { SubmitButton } from "@/components/SubmitButton";
import { cancelBookingAction } from "@/app/actions/booking";
import type { BookingWithTrip } from "@/lib/types";

function isUpcoming(b: BookingWithTrip): boolean {
  return (
    b.status === "confirmed" &&
    b.tripStatus === "scheduled" &&
    !isPast(b.departureAt)
  );
}

function PaymentBadge({ status }: { status: BookingWithTrip["paymentStatus"] }) {
  return status === "paid" ? (
    <Badge variant="success">გადახდილია</Badge>
  ) : (
    <Badge variant="warning">გადახდა მძღოლთან</Badge>
  );
}

function HistoryBadge({ booking }: { booking: BookingWithTrip }) {
  if (booking.status === "cancelled") {
    return <Badge variant="neutral">გაუქმებული ჯავშანი</Badge>;
  }
  if (booking.tripStatus === "cancelled") {
    return <Badge variant="danger">რეისი გაუქმდა</Badge>;
  }
  return <Badge variant="neutral">შესრულებული</Badge>;
}

export default async function AccountPage() {
  const user = await requireUser();
  const bookings = passengerBookings(user.id);
  const upcoming = bookings
    .filter(isUpcoming)
    .sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  const history = bookings.filter((b) => !isUpcoming(b));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
        ჩემი ჯავშნები
      </h1>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-ink">მოახლოებული მგზავრობები</h2>

        {upcoming.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-line bg-white p-10 text-center">
            <p className="text-subtle">მოახლოებული მგზავრობები არ გაქვს</p>
            <Link
              href="/trips"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-accent-500 px-6 py-3 font-bold text-ink transition hover:bg-accent-600"
            >
              იპოვე რეისი
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {upcoming.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    src={b.vehiclePhotoUrl}
                    alt={b.vehicleName}
                    className="hidden h-20 w-28 shrink-0 rounded-xl object-cover sm:block"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="flex flex-wrap items-center gap-1.5 font-bold text-ink">
                      {b.originCity}
                      <ArrowRight className="h-4 w-4 text-brand-500" />
                      {b.destinationCity}
                    </p>
                    <p className="text-sm text-subtle">
                      {formatTbilisiDateTime(b.departureAt)} · {b.originStation}
                    </p>
                    <p className="text-sm text-subtle">
                      {b.vehicleName} · {b.vehiclePlate}
                    </p>
                    <a
                      href={`tel:${b.driverPhone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-sm text-subtle transition hover:text-brand-600"
                    >
                      <Phone className="h-4 w-4 text-brand-500" />
                      {b.driverPhone}
                    </a>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end sm:text-right">
                    <div>
                      <p className="text-sm text-subtle">{b.seats} ადგილი</p>
                      <p className="text-lg font-bold text-ink">
                        {formatPrice(b.seats * b.priceGel)}
                      </p>
                    </div>
                    <PaymentBadge status={b.paymentStatus} />
                    <div className="mt-1 flex items-center gap-2">
                      <Link
                        href={`/account/tickets/${b.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                      >
                        <Ticket className="h-4 w-4" />
                        ბილეთი
                      </Link>
                      <form action={cancelBookingAction}>
                        <input type="hidden" name="bookingId" value={b.id} />
                        <SubmitButton
                          variant="ghost"
                          className="text-sm !px-4 !py-2.5 text-danger-500"
                        >
                          გაუქმება
                        </SubmitButton>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">ისტორია</h2>
          <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
            {history.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center gap-x-5 gap-y-1.5 p-4 opacity-80"
              >
                <p className="flex items-center gap-1.5 font-semibold text-ink">
                  {b.originCity}
                  <ArrowRight className="h-4 w-4 text-faint" />
                  {b.destinationCity}
                </p>
                <p className="text-sm text-subtle">
                  {formatTbilisiDateTime(b.departureAt)}
                </p>
                <p className="text-sm text-subtle">{b.seats} ადგილი</p>
                <span className="ml-auto">
                  <HistoryBadge booking={b} />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
