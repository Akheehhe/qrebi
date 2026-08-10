"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  cancelBooking,
  getBookingForUser,
  getCurrentUser,
  getTrip,
  insertBooking,
  requireUser,
  userHasBooking,
} from "@/lib/dal";
import { nowUtcIso } from "@/lib/datetime";
import { notifyDriverBooking, notifyDriverCancellation } from "@/lib/notify";
import { isSalesOpen } from "@/lib/policy";
import type { ActionState } from "@/lib/types";

const PHONE_RE = /^[+\d][\d\s-]{7,17}$/;

export async function bookTripAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const tripId = String(formData.get("tripId") ?? "");
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/trips/${tripId}`)}`);
  }

  const trip = getTrip(tripId);
  if (!trip || trip.status !== "scheduled") {
    return { error: "რეისი ვერ მოიძებნა ან გაუქმებულია" };
  }
  if (trip.departureAt <= nowUtcIso()) {
    return { error: "ეს რეისი უკვე გავიდა" };
  }
  if (!isSalesOpen(trip)) {
    return {
      error: "ონლაინ ჯავშანი ამ რეისზე დახურულია, ადგილები ნაწილდება ადგილზე",
    };
  }
  if (trip.driverId === user.id) {
    return { error: "საკუთარ რეისზე ადგილის დაჯავშნა შეუძლებელია" };
  }
  if (userHasBooking(tripId, user.id)) {
    return { error: "ამ რეისზე ჯავშანი უკვე გაქვს" };
  }

  const seats = Number.parseInt(String(formData.get("seats") ?? "1"), 10);
  if (!Number.isInteger(seats) || seats < 1 || seats > 4) {
    return { error: "შეგიძლიათ დაჯავშნოთ 1-დან 4-მდე ადგილი" };
  }
  if (seats > trip.seatsLeft) {
    return { error: `დარჩენილია მხოლოდ ${trip.seatsLeft} ადგილი` };
  }

  const phone = String(formData.get("phone") ?? "").trim() || user.phone;
  if (!PHONE_RE.test(phone)) {
    return { fieldErrors: { phone: "შეიყვანეთ სწორი ტელეფონის ნომერი" } };
  }

  const paymentMethod =
    formData.get("paymentMethod") === "cash" ? "cash" : "online";

  const bookingId = insertBooking({
    tripId,
    passengerId: user.id,
    seats,
    name: `${user.firstName} ${user.lastName}`,
    phone,
    email: user.email,
    paymentMethod,
    paymentStatus: paymentMethod === "online" ? "paid" : "pending",
  });

  await notifyDriverBooking(
    trip,
    { name: `${user.firstName} ${user.lastName}`, phone, seats, paymentMethod },
    trip.seatsLeft - seats
  );

  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/account");
  redirect(`/account/tickets/${bookingId}`);
}

export async function cancelBookingAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const bookingId = String(formData.get("bookingId") ?? "");
  const booking = getBookingForUser(bookingId, user.id);
  const { ok } = cancelBooking(bookingId, user.id);
  if (ok && booking) {
    const trip = getTrip(booking.tripId);
    if (trip) {
      await notifyDriverCancellation(
        trip,
        { name: booking.passengerName, seats: booking.seats },
        trip.seatsLeft
      );
    }
  }
  revalidatePath("/account");
}
