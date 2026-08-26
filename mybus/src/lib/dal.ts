import "server-only";
import { randomUUID } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { rpc } from "./rpc";
import { SESSION_COOKIE } from "./session";
import { nowUtcIso, tbilisiDayRangeUtc } from "./datetime";
import { isSalesOpen, salesCloseAtIso } from "./policy";
import { PLATFORM_FEE_GEL } from "./constants";
import type {
  BookingWithTrip,
  DriverFee,
  DriverNotification,
  LiveState,
  ManifestEntry,
  PaymentMethod,
  PaymentStatus,
  Role,
  TripStatus,
  TripSummary,
  User,
  Vehicle,
} from "./types";

// ---------- users & auth ----------

interface DbUserRow {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password_hash: string;
}

function mapUser(r: DbUserRow): User {
  return {
    id: r.id,
    role: r.role as Role,
    firstName: r.first_name,
    lastName: r.last_name,
    email: r.email,
    phone: r.phone,
  };
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = await rpc<DbUserRow | null>("mybus_get_user_by_token", {
    p_token: token,
    p_now: nowUtcIso(),
  });
  return row ? mapUser(row) : null;
});

export async function requireUser(role?: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) {
    redirect(user.role === "driver" ? "/driver" : "/");
  }
  return user;
}

export async function findUserByEmail(
  email: string
): Promise<{ user: User; passwordHash: string } | null> {
  const row = await rpc<DbUserRow | null>("mybus_find_user_by_email", {
    p_email: email.trim().toLowerCase(),
  });
  return row ? { user: mapUser(row), passwordHash: row.password_hash } : null;
}

export async function createUser(input: {
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
}): Promise<User> {
  const id = randomUUID();
  const email = input.email.trim().toLowerCase();
  const result = await rpc<{ ok: boolean; duplicate?: boolean }>(
    "mybus_create_user",
    {
      p_id: id,
      p_role: input.role,
      p_first: input.firstName,
      p_last: input.lastName,
      p_email: email,
      p_phone: input.phone,
      p_hash: input.passwordHash,
    }
  );
  if (!result.ok) throw new Error("duplicate email");
  return {
    id,
    role: input.role,
    firstName: input.firstName,
    lastName: input.lastName,
    email,
    phone: input.phone,
  };
}

export async function updateUserProfile(
  userId: string,
  input: { firstName: string; lastName: string; phone: string }
): Promise<void> {
  await rpc("mybus_update_user_profile", {
    p_id: userId,
    p_first: input.firstName,
    p_last: input.lastName,
    p_phone: input.phone,
  });
}

// ---------- trips ----------

interface DbTripRow {
  id: string;
  driver_id: string;
  vehicle_id: string;
  origin_city: string;
  origin_station: string;
  destination_city: string;
  departure_at: string;
  price_gel: number;
  total_seats: number;
  status: string;
  notes: string | null;
  walkin_seats: number;
  sales_closed: number;
  sales_cutoff_min: number;
  cancel_cutoff_min: number;
  vehicle_name: string;
  vehicle_plate: string;
  vehicle_photo_url: string;
  driver_first_name: string;
  driver_last_name: string;
  driver_phone: string;
  online_taken: number;
}

function mapTrip(r: DbTripRow): TripSummary {
  const seatsTaken = r.online_taken + r.walkin_seats;
  return {
    id: r.id,
    driverId: r.driver_id,
    vehicleId: r.vehicle_id,
    originCity: r.origin_city,
    originStation: r.origin_station,
    destinationCity: r.destination_city,
    departureAt: r.departure_at,
    priceGel: r.price_gel,
    totalSeats: r.total_seats,
    status: r.status as TripStatus,
    notes: r.notes,
    vehicleName: r.vehicle_name,
    vehiclePlate: r.vehicle_plate,
    vehiclePhotoUrl: r.vehicle_photo_url,
    driverFirstName: r.driver_first_name,
    driverLastName: r.driver_last_name,
    driverPhone: r.driver_phone,
    onlineSeatsTaken: r.online_taken,
    walkinSeats: r.walkin_seats,
    seatsTaken,
    seatsLeft: Math.max(0, r.total_seats - seatsTaken),
    salesClosed: r.sales_closed === 1,
    salesCutoffMin: r.sales_cutoff_min,
    cancelCutoffMin: r.cancel_cutoff_min,
  };
}

export interface TripFilters {
  from?: string;
  to?: string;
  /** Tbilisi calendar day 'YYYY-MM-DD' */
  date?: string;
  sort?: "time" | "price";
  limit?: number;
}

export async function listTrips(
  filters: TripFilters = {}
): Promise<TripSummary[]> {
  const range = filters.date ? tbilisiDayRangeUtc(filters.date) : null;
  const rows = await rpc<DbTripRow[]>("mybus_list_trips", {
    p_now: nowUtcIso(),
    p_from: filters.from ?? null,
    p_to: filters.to ?? null,
    p_date_start: range ? range[0] : null,
    p_date_end: range ? range[1] : null,
    p_sort: filters.sort ?? null,
    p_limit: Math.min(filters.limit ?? 200, 500),
  });
  return rows.map(mapTrip);
}

export async function getTrip(id: string): Promise<TripSummary | null> {
  const row = await rpc<DbTripRow | null>("mybus_get_trip", { p_id: id });
  return row ? mapTrip(row) : null;
}

export async function getStats(): Promise<{
  trips: number;
  drivers: number;
  routes: number;
}> {
  return rpc("mybus_get_stats", { p_now: nowUtcIso() });
}

export async function popularRoutes(
  limit = 8
): Promise<{ from: string; to: string; count: number; minPrice: number }[]> {
  const rows = await rpc<
    { from_city: string; to_city: string; cnt: number; min_price: number }[]
  >("mybus_popular_routes", { p_now: nowUtcIso(), p_limit: limit });
  return rows.map((r) => ({
    from: r.from_city,
    to: r.to_city,
    count: r.cnt,
    minPrice: r.min_price,
  }));
}

export async function driverTrips(driverId: string): Promise<TripSummary[]> {
  const rows = await rpc<DbTripRow[]>("mybus_driver_trips", {
    p_driver: driverId,
  });
  return rows.map(mapTrip);
}

export async function createTrip(input: {
  driverId: string;
  vehicleId: string;
  originCity: string;
  originStation: string;
  destinationCity: string;
  departureAtUtc: string;
  priceGel: number;
  totalSeats: number;
  notes: string | null;
}): Promise<string> {
  const id = randomUUID();
  await rpc("mybus_create_trip", {
    p_id: id,
    p_driver: input.driverId,
    p_vehicle: input.vehicleId,
    p_origin: input.originCity,
    p_station: input.originStation,
    p_destination: input.destinationCity,
    p_departure: input.departureAtUtc,
    p_price: input.priceGel,
    p_seats: input.totalSeats,
    p_notes: input.notes,
  });
  return id;
}

/** Cancels a not-yet-departed scheduled trip owned by the driver. Returns true if a row changed. */
export async function cancelTrip(
  tripId: string,
  driverId: string
): Promise<boolean> {
  const result = await rpc<{ changed: boolean }>("mybus_cancel_trip", {
    p_trip: tripId,
    p_driver: driverId,
    p_now: nowUtcIso(),
  });
  return result.changed;
}

/**
 * Adjusts the driver's walk-in seat counter by ±1, clamped to
 * [0, totalSeats - online seats]. Returns the new value, or null if the
 * trip is not the driver's scheduled trip or the clamp made it a no-op.
 */
export async function adjustWalkin(
  tripId: string,
  driverId: string,
  delta: number
): Promise<number | null> {
  const result = await rpc<{ next: number | null }>("mybus_adjust_walkin", {
    p_trip: tripId,
    p_driver: driverId,
    p_delta: delta,
  });
  return result.next;
}

export async function setSalesClosed(
  tripId: string,
  driverId: string,
  closed: boolean
): Promise<boolean> {
  const result = await rpc<{ changed: boolean }>("mybus_set_sales_closed", {
    p_trip: tripId,
    p_driver: driverId,
    p_closed: closed ? 1 : 0,
  });
  return result.changed;
}

export async function setBoarded(
  bookingId: string,
  driverId: string,
  boarded: boolean
): Promise<boolean> {
  const result = await rpc<{ changed: boolean }>("mybus_set_boarded", {
    p_booking: bookingId,
    p_driver: driverId,
    p_boarded: boarded ? 1 : 0,
  });
  return result.changed;
}

/** Cancels every confirmed, not-boarded booking on the driver's trip. Returns freed booking count. */
export async function releaseNoShows(
  tripId: string,
  driverId: string
): Promise<number> {
  const result = await rpc<{ count: number }>("mybus_release_no_shows", {
    p_trip: tripId,
    p_driver: driverId,
  });
  return result.count;
}

/**
 * Marks the driver's scheduled trip as departed and charges the flat
 * platform fee (5₾, simulated payment). This is the platform's only
 * revenue event: no ticket commission, no subscription.
 */
export async function markTripDeparted(
  tripId: string,
  driverId: string
): Promise<boolean> {
  const result = await rpc<{ ok: boolean }>("mybus_mark_trip_departed", {
    p_trip: tripId,
    p_driver: driverId,
    p_fee_id: randomUUID(),
    p_amount: PLATFORM_FEE_GEL,
  });
  return result.ok;
}

export async function driverFees(driverId: string): Promise<{
  fees: DriverFee[];
  totalGel: number;
}> {
  const rows = await rpc<
    {
      id: string;
      trip_id: string;
      amount_gel: number;
      status: string;
      created_at: string;
      origin_city: string;
      destination_city: string;
      departure_at: string;
    }[]
  >("mybus_driver_fees", { p_driver: driverId });
  const fees = rows.map((r) => ({
    id: r.id,
    tripId: r.trip_id,
    originCity: r.origin_city,
    destinationCity: r.destination_city,
    departureAt: r.departure_at,
    amountGel: r.amount_gel,
    status: r.status as DriverFee["status"],
    createdAt: r.created_at,
  }));
  return {
    fees,
    totalGel: fees.reduce((sum, f) => sum + f.amountGel, 0),
  };
}

export async function driverNotifications(
  driverId: string,
  limit = 50
): Promise<DriverNotification[]> {
  const rows = await rpc<
    {
      id: string;
      kind: string;
      to_phone: string;
      body: string;
      delivery: string;
      created_at: string;
    }[]
  >("mybus_driver_notifications", { p_driver: driverId, p_limit: limit });
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind as DriverNotification["kind"],
    toPhone: r.to_phone,
    body: r.body,
    delivery: r.delivery as DriverNotification["delivery"],
    createdAt: r.created_at,
  }));
}

export async function getLiveState(
  tripId: string,
  driverId: string
): Promise<LiveState | null> {
  const trip = await getTrip(tripId);
  if (!trip || trip.driverId !== driverId) return null;
  const manifest = await tripManifest(tripId);
  return {
    trip: {
      id: trip.id,
      originCity: trip.originCity,
      destinationCity: trip.destinationCity,
      departureAt: trip.departureAt,
      status: trip.status,
      totalSeats: trip.totalSeats,
      onlineSeatsTaken: trip.onlineSeatsTaken,
      walkinSeats: trip.walkinSeats,
      seatsLeft: trip.seatsLeft,
      salesClosed: trip.salesClosed,
      salesOpen: isSalesOpen(trip),
      salesCloseAt: salesCloseAtIso(trip.departureAt, trip.salesCutoffMin),
      priceGel: trip.priceGel,
    },
    manifest: manifest.map((m) => ({
      bookingId: m.bookingId,
      name: m.name,
      phone: m.phone,
      seats: m.seats,
      paymentStatus: m.paymentStatus,
      status: m.status,
      boarded: m.boarded,
      noShow: m.noShow,
    })),
  };
}

// ---------- vehicles ----------

interface DbVehicleRow {
  id: string;
  driver_id: string;
  name: string;
  plate_number: string;
  capacity: number;
  photo_url: string;
}

function mapVehicle(r: DbVehicleRow): Vehicle {
  return {
    id: r.id,
    driverId: r.driver_id,
    name: r.name,
    plateNumber: r.plate_number,
    capacity: r.capacity,
    photoUrl: r.photo_url,
  };
}

export async function driverVehicles(driverId: string): Promise<Vehicle[]> {
  const rows = await rpc<DbVehicleRow[]>("mybus_driver_vehicles", {
    p_driver: driverId,
  });
  return rows.map(mapVehicle);
}

export async function getVehicleForDriver(
  vehicleId: string,
  driverId: string
): Promise<Vehicle | null> {
  const row = await rpc<DbVehicleRow | null>("mybus_get_vehicle_for_driver", {
    p_vehicle: vehicleId,
    p_driver: driverId,
  });
  return row ? mapVehicle(row) : null;
}

export async function createVehicle(input: {
  driverId: string;
  name: string;
  plateNumber: string;
  capacity: number;
  photoUrl: string;
}): Promise<string> {
  const id = randomUUID();
  await rpc("mybus_create_vehicle", {
    p_id: id,
    p_driver: input.driverId,
    p_name: input.name,
    p_plate: input.plateNumber,
    p_capacity: input.capacity,
    p_photo: input.photoUrl,
  });
  return id;
}

// ---------- bookings ----------

interface DbBookingRow {
  id: string;
  trip_id: string;
  seats: number;
  payment_method: string;
  payment_status: string;
  booking_status: string;
  refund_due: number;
  no_show: number;
  created_at: string;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  origin_city: string;
  origin_station: string;
  destination_city: string;
  departure_at: string;
  price_gel: number;
  trip_status: string;
  vehicle_name: string;
  vehicle_plate: string;
  vehicle_photo_url: string;
  driver_first_name: string;
  driver_last_name: string;
  driver_phone: string;
}

function mapBooking(r: DbBookingRow): BookingWithTrip {
  return {
    id: r.id,
    tripId: r.trip_id,
    seats: r.seats,
    paymentMethod: r.payment_method as PaymentMethod,
    paymentStatus: r.payment_status as PaymentStatus,
    status: r.booking_status as BookingWithTrip["status"],
    refundDue: r.refund_due === 1,
    noShow: r.no_show === 1,
    createdAt: r.created_at,
    passengerName: r.passenger_name,
    passengerPhone: r.passenger_phone,
    passengerEmail: r.passenger_email,
    originCity: r.origin_city,
    originStation: r.origin_station,
    destinationCity: r.destination_city,
    departureAt: r.departure_at,
    priceGel: r.price_gel,
    tripStatus: r.trip_status as TripStatus,
    vehicleName: r.vehicle_name,
    vehiclePlate: r.vehicle_plate,
    vehiclePhotoUrl: r.vehicle_photo_url,
    driverFirstName: r.driver_first_name,
    driverLastName: r.driver_last_name,
    driverPhone: r.driver_phone,
  };
}

export async function passengerBookings(
  userId: string
): Promise<BookingWithTrip[]> {
  const rows = await rpc<DbBookingRow[]>("mybus_passenger_bookings", {
    p_user: userId,
  });
  return rows.map(mapBooking);
}

export async function getBookingForUser(
  bookingId: string,
  userId: string
): Promise<BookingWithTrip | null> {
  const row = await rpc<DbBookingRow | null>("mybus_get_booking_for_user", {
    p_booking: bookingId,
    p_user: userId,
  });
  return row ? mapBooking(row) : null;
}

export async function userHasBooking(
  tripId: string,
  userId: string
): Promise<boolean> {
  const result = await rpc<{ has: boolean }>("mybus_user_has_booking", {
    p_trip: tripId,
    p_user: userId,
  });
  return result.has;
}

export async function insertBooking(input: {
  tripId: string;
  passengerId: string;
  seats: number;
  name: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}): Promise<string> {
  const id = randomUUID();
  await rpc("mybus_insert_booking", {
    p_id: id,
    p_trip: input.tripId,
    p_passenger: input.passengerId,
    p_seats: input.seats,
    p_name: input.name,
    p_phone: input.phone,
    p_email: input.email,
    p_method: input.paymentMethod,
    p_status: input.paymentStatus,
  });
  return id;
}

/**
 * Cancels a confirmed booking owned by the passenger, only before departure.
 * A paid booking cancelled before the trip's free-cancel cutoff is marked
 * refund-due; inside the cutoff the seat frees up but the money stays.
 */
export async function cancelBooking(
  bookingId: string,
  userId: string
): Promise<{ ok: boolean; refundDue: boolean }> {
  const result = await rpc<{ ok: boolean; refund_due: boolean }>(
    "mybus_cancel_booking",
    { p_booking: bookingId, p_user: userId, p_now: nowUtcIso() }
  );
  return { ok: result.ok, refundDue: result.refund_due };
}

export async function tripManifest(tripId: string): Promise<ManifestEntry[]> {
  const rows = await rpc<
    {
      booking_id: string;
      seats: number;
      payment_method: string;
      payment_status: string;
      status: string;
      boarded: number;
      no_show: number;
      created_at: string;
      passenger_name: string;
      passenger_phone: string;
      passenger_email: string;
    }[]
  >("mybus_trip_manifest", { p_trip: tripId });
  return rows.map((r) => ({
    bookingId: r.booking_id,
    seats: r.seats,
    paymentMethod: r.payment_method as PaymentMethod,
    paymentStatus: r.payment_status as PaymentStatus,
    status: r.status as ManifestEntry["status"],
    boarded: r.boarded === 1,
    noShow: r.no_show === 1,
    createdAt: r.created_at,
    name: r.passenger_name,
    phone: r.passenger_phone,
    email: r.passenger_email,
  }));
}
