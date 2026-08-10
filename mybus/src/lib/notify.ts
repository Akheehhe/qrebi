import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { sendWhatsApp } from "./whatsapp";
import { departureDayLabel, formatTbilisiTime } from "./datetime";
import type { NotificationKind, TripSummary } from "./types";

function record(input: {
  driverId: string;
  tripId: string;
  kind: NotificationKind;
  toPhone: string;
  body: string;
  delivery: string;
}) {
  db.prepare(
    `INSERT INTO notifications (id, driver_id, trip_id, kind, to_phone, body, delivery)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    input.driverId,
    input.tripId,
    input.kind,
    input.toPhone,
    input.body,
    input.delivery
  );
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
    record({
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
    record({
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
