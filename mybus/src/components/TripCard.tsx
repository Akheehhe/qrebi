import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import {
  departureDayLabel,
  formatPrice,
  formatTbilisiTime,
} from "@/lib/datetime";
import type { TripSummary } from "@/lib/types";
import { Badge } from "./Badge";

function SeatsBadge({ seatsLeft }: { seatsLeft: number }) {
  if (seatsLeft <= 0) return <Badge variant="danger">ადგილები აღარ არის</Badge>;
  if (seatsLeft <= 4) {
    return <Badge variant="warning">დარჩა {seatsLeft} ადგილი</Badge>;
  }
  return <Badge variant="success">{seatsLeft} თავისუფალი ადგილი</Badge>;
}

export function TripCard({ trip }: { trip: TripSummary }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-900/10"
    >
      <div className="relative overflow-hidden">
        <img
          src={trip.vehiclePhotoUrl}
          alt={trip.vehicleName}
          className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-accent-500 px-3 py-1 text-sm font-bold text-ink shadow-sm">
          {formatPrice(trip.priceGel)}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-base font-bold text-ink">
          <span>{trip.originCity}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-brand-500" />
          <span>{trip.destinationCity}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 truncate text-sm text-subtle">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {trip.originStation}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Clock className="h-4 w-4 text-brand-500" />
            {departureDayLabel(trip.departureAt)}, {formatTbilisiTime(trip.departureAt)}
          </span>
          <SeatsBadge seatsLeft={trip.seatsLeft} />
        </div>
      </div>
    </Link>
  );
}
