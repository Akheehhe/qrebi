import "server-only";
import { randomUUID } from "node:crypto";
import { rpc } from "./rpc";
import { sendWhatsApp } from "./whatsapp";
import { departureDayLabel, formatTbilisiTime } from "./datetime";
import type { NotificationKind, TripSummary } from "./types";

async function record(input: {
  driverId: string;
  tripId: string;
  kind: NotificationKind;
  toPhone: string;
  body: string;
  delivery: string;
}): Promise<void> {
  await rpc("mybus_record_notification", {
    p_id: randomUUID(),
    p_driver: input.driverId,
    p_trip: input.tripId,
    p_kind: input.kind,
    p_phone: input.toPhone,
    p_body: input.body,
    p_delivery: input.delivery,
  });
}

function tripLine(trip: TripSummary): string {
  return `${trip.originCity} → ${trip.destinationCity}, ${departureDayLabel(
    trip.departureAt
  )} ${formatTbilisiTime(trip.departureAt)}`;
}

/** Fired after a successful online booking. Never throws. */
export async function notifyDriverBooking(
  trip: TripSummary,
  booking: {
    name: string;
    phone: string;
    seats: number;
    paymentMethod: "online" | "cash";
  },
  seatsLeftNow: number
): Promise<void> {
  try {
    const body = [
      "🚌 ახალი ჯავშანი MyBus-ზე",
      tripLine(trip),
      `მგზავრი: ${booking.name}`,
      `ტელეფონი: ${booking.phone}`,
      `ადგილი: ${booking.seats}`,
      booking.paymentMethod === "online"
        ? "გადახდა: ონლაინ, უკვე გადახდილია"
        : "გადახდა: ნაღდით ჩაჯდომისას",
      `დარჩა ${seatsLeftNow} თავისუფალი ადგილი`,
    ].join("\n");
    const delivery = await sendWhatsApp(trip.driverPhone, body);
    await record({
      driverId: trip.driverId,
      tripId: trip.id,
      kind: "booking",
      toPhone: trip.driverPhone,
      body,
      delivery,
    });
  } catch {
    // notification failures must never break the booking itself
  }
}

/** Fired after a passenger cancels a confirmed booking. Never throws. */
export async function notifyDriverCancellation(
  trip: TripSummary,
  booking: { name: string; seats: number },
  seatsLeftNow: number
): Promise<void> {
  try {
    const body = [
      "❌ ჯავშანი გაუქმდა",
      tripLine(trip),
      `მგზავრი: ${booking.name}, ${booking.seats} ადგილი`,
      `გათავისუფლდა ${booking.seats} ადგილი, ახლა თავისუფალია ${seatsLeftNow}`,
    ].join("\n");
    const delivery = await sendWhatsApp(trip.driverPhone, body);
    await record({
      driverId: trip.driverId,
      tripId: trip.id,
      kind: "cancellation",
      toPhone: trip.driverPhone,
      body,
      delivery,
    });
  } catch {
    // best-effort only
  }
}
