import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Bus, Clock, MessageCircle, Radio } from "lucide-react";
import { getTrip, requireUser, tripManifest } from "@/lib/dal";
import { formatPrice, formatTbilisiDateTime, formatTbilisiTime } from "@/lib/datetime";
import { waChatLink } from "@/lib/wa";
import { Badge } from "@/components/Badge";

export default async function TripManifestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser("driver");
  const trip = await getTrip(id);
  if (!trip || trip.driverId !== user.id) notFound();

  const manifest = await tripManifest(id);
  const confirmedSeats = manifest
    .filter((m) => m.status === "confirmed")
    .reduce((sum, m) => sum + m.seats, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/driver"
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        ← უკან
      </Link>

      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
              <span>{trip.originCity}</span>
              <ArrowRight className="h-5 w-5 shrink-0 text-brand-500" />
              <span>{trip.destinationCity}</span>
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-subtle">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatTbilisiDateTime(trip.departureAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bus className="h-4 w-4" />
                {trip.vehicleName} ·{" "}
                <span className="font-mono">{trip.vehiclePlate}</span>
              </span>
              <span className="font-bold text-ink">
                {formatPrice(trip.priceGel)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="brand" className="px-3 py-1.5 text-sm">
              {trip.seatsTaken}/{trip.totalSeats} დაკავებულია
            </Badge>
            <Link
              href={`/driver/trips/${trip.id}/live`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-sm font-bold text-ink transition hover:bg-accent-600"
            >
              <Radio className="h-4 w-4" />
              LIVE ჩასხდომა
            </Link>
          </div>
        </div>
        <p className="mt-3 text-sm text-subtle">
          ონლაინ დაჯავშნილია {trip.onlineSeatsTaken}, ადგილზე ჩამჯდარი{" "}
          {trip.walkinSeats}
        </p>
      </div>

      <section>
        <h2 className="text-xl font-bold text-ink">მგზავრების სია</h2>
        <div className="mt-4 rounded-2xl border border-line bg-white">
          {manifest.length === 0 ? (
            <p className="p-10 text-center text-subtle">
              ჯავშნები ჯერ არ არის
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-faint">
                    <th className="px-5 py-3 font-semibold">#</th>
                    <th className="px-5 py-3 font-semibold">
                      სახელი და გვარი
                    </th>
                    <th className="px-5 py-3 font-semibold">ტელეფონი</th>
                    <th className="px-5 py-3 font-semibold">ელფოსტა</th>
                    <th className="px-5 py-3 font-semibold">ადგილი</th>
                    <th className="px-5 py-3 font-semibold">გადახდა</th>
                    <th className="px-5 py-3 font-semibold">სტატუსი</th>
                  </tr>
                </thead>
                <tbody>
                  {manifest.map((entry, i) => (
                    <tr
                      key={entry.bookingId}
                      className={`border-b border-line last:border-b-0 ${
                        entry.status === "cancelled" ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-5 py-3 text-faint">{i + 1}</td>
                      <td className="px-5 py-3 font-semibold text-ink">
                        {entry.name}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-2">
                          <a
                            href={`tel:${entry.phone}`}
                            className="text-brand-600 hover:text-brand-700"
                          >
                            {entry.phone}
                          </a>
                          <a
                            href={waChatLink(
                              entry.phone,
                              `გამარჯობა, ${entry.name}! გწერთ MyBus-ის რეისიდან ${trip.originCity} → ${trip.destinationCity}, ${formatTbilisiTime(trip.departureAt)}.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="მისწერე WhatsApp-ში"
                            className="grid h-7 w-7 place-items-center rounded-full text-white transition hover:opacity-85"
                            style={{ backgroundColor: "#25d366" }}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-subtle">{entry.email}</td>
                      <td className="px-5 py-3 font-semibold text-ink">
                        {entry.seats}
                      </td>
                      <td className="px-5 py-3">
                        {entry.paymentStatus === "paid" ? (
                          <Badge variant="success">გადახდილია</Badge>
                        ) : (
                          <Badge variant="warning">მძღოლთან</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {entry.status === "confirmed" ? (
                          entry.boarded ? (
                            <Badge variant="success">ჩაჯდა</Badge>
                          ) : (
                            <Badge variant="success">დადასტურებული</Badge>
                          )
                        ) : entry.noShow ? (
                          <Badge variant="warning">არ გამოცხადდა</Badge>
                        ) : (
                          <Badge variant="neutral">გაუქმებული</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-3 text-right font-semibold text-ink"
                    >
                      სულ დაჯავშნილია: {confirmedSeats} ადგილი
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
