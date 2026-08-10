import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Bus, Phone } from "lucide-react";
import { getBookingForUser, requireUser } from "@/lib/dal";
import {
  formatPrice,
  formatTbilisiDateYear,
  formatTbilisiTime,
} from "@/lib/datetime";
import { Badge } from "@/components/Badge";

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase text-faint">{label}</p>
      <div className="font-semibold text-ink">{children}</div>
    </div>
  );
}

export default async function TicketPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const user = await requireUser();
  const b = getBookingForUser(bookingId, user.id);
  if (!b) notFound();

  const cancelled = b.status === "cancelled" || b.tripStatus === "cancelled";
  const dimmed = cancelled ? "opacity-60" : "";

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-xl shadow-brand-900/5">
        {/* Header band */}
        <div className="flex items-center justify-between gap-3 bg-brand-500 p-5 text-white">
          <p className="flex items-center gap-2 font-extrabold">
            <Bus className="h-5 w-5" />
            MyBus.ge
          </p>
          <p className="text-sm">ელექტრონული ბილეთი</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {cancelled && (
            <div className="mb-5 rounded-xl bg-danger-50 p-4 text-sm font-semibold text-danger-500">
              {b.status === "cancelled"
                ? "ეს ჯავშანი გაუქმებულია"
                : b.paymentStatus === "paid"
                  ? "ეს რეისი გაუქმდა, თანხა დაგიბრუნდება"
                  : "ეს რეისი გაუქმდა"}
            </div>
          )}

          <div className={dimmed}>
            <p className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-ink">
              {b.originCity}
              <ArrowRight className="inline h-6 w-6 text-accent-500" />
              {b.destinationCity}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Detail label="თარიღი">
                {formatTbilisiDateYear(b.departureAt)}
              </Detail>
              <Detail label="დრო">
                <span className="text-lg">
                  {formatTbilisiTime(b.departureAt)}
                </span>
              </Detail>
              <Detail label="გასვლის ადგილი">{b.originStation}</Detail>
              <Detail label="ავტობუსი">
                {b.vehicleName}{" "}
                <span className="font-mono">{b.vehiclePlate}</span>
              </Detail>
              <Detail label="მგზავრი">{b.passengerName}</Detail>
              <Detail label="ადგილები">{b.seats}</Detail>
              <Detail label="თანხა">
                {formatPrice(b.seats * b.priceGel)}
              </Detail>
              <Detail label="გადახდა">
                {b.paymentStatus === "paid" ? (
                  <Badge variant="success">გადახდილია</Badge>
                ) : (
                  <Badge variant="warning">გადახდა მძღოლთან</Badge>
                )}
              </Detail>
            </div>

            <p className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-sm text-subtle">
              მძღოლი:{" "}
              <span className="font-semibold text-ink">
                {b.driverFirstName} {b.driverLastName}
              </span>
              <a
                href={`tel:${b.driverPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 font-medium transition hover:text-brand-600"
              >
                <Phone className="h-4 w-4 text-brand-500" />
                {b.driverPhone}
              </a>
            </p>
          </div>
        </div>

        {/* Perforation */}
        <div className="relative border-t-2 border-dashed border-line">
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-canvas" />
          <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-canvas" />
        </div>

        {/* Stub */}
        <div className={`p-6 ${dimmed}`}>
          <p className="mx-auto w-fit rounded-full bg-canvas px-5 py-2 text-center font-mono text-lg font-bold tracking-widest text-ink">
            {b.id.slice(0, 8).toUpperCase()}
          </p>
          <div
            className="mt-4 h-14 w-full rounded"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #12172b 0 2px, transparent 2px 5px)",
            }}
          />
          <p className="mt-3 text-center text-xs text-faint">
            აჩვენე ეს ბილეთი მძღოლს ჩაჯდომისას
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-5 py-3 font-semibold text-ink transition hover:bg-canvas"
        >
          <ArrowLeft className="h-4 w-4" />
          ჩემი ჯავშნები
        </Link>
        <Link
          href="/trips"
          className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600"
        >
          სხვა რეისები
        </Link>
      </div>
    </div>
  );
}
