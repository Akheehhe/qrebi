import "server-only";
import { randomUUID } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { SESSION_COOKIE } from "./session";
import { nowUtcIso, tbilisiDayRangeUtc } from "./datetime";
import type {
  BookingWithTrip,
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

const USER_COLS =
  "u.id, u.role, u.first_name, u.last_name, u.email, u.phone, u.password_hash";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT ${USER_COLS} FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`
    )
    .get(token, nowUtcIso()) as DbUserRow | undefined;
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

export function findUserByEmail(
  email: string
): { user: User; passwordHash: string } | null {
  const row = db
    .prepare(`SELECT ${USER_COLS} FROM users u WHERE u.email = ?`)
    .get(email.trim().toLowerCase()) as DbUserRow | undefined;
  return row ? { user: mapUser(row), passwordHash: row.password_hash } : null;
}

export function createUser(input: {
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
}): User {
  const id = randomUUID();
  const email = input.email.trim().toLowerCase();
  db.prepare(
    `INSERT INTO users (id, role, first_name, last_name, email, phone, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.role,
    input.firstName,
    input.lastName,
    email,
    input.phone,
    input.passwordHash
  );
  return {
    id,
    role: input.role,
    firstName: input.firstName,
    lastName: input.lastName,
    email,
    phone: input.phone,
  };
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
  vehicle_name: string;
  vehicle_plate: string;
  vehicle_photo_url: string;
  driver_first_name: string;
  driver_last_name: string;
  driver_phone: string;
  seats_taken: number;
}

const TRIP_SELECT = `
  SELECT t.id, t.driver_id, t.vehicle_id, t.origin_city, t.origin_station,
         t.destination_city, t.departure_at, t.price_gel, t.total_seats,
         t.status, t.notes,
         v.name AS vehicle_name, v.plate_number AS vehicle_plate,
         v.photo_url AS vehicle_photo_url,
         u.first_name AS driver_first_name, u.last_name AS driver_last_name,
         u.phone AS driver_phone,
         COALESCE((SELECT SUM(b.seats) FROM bookings b
                   WHERE b.trip_id = t.id AND b.status = 'confirmed'), 0) AS seats_taken
  FROM trips t
  JOIN vehicles v ON v.id = t.vehicle_id
  JOIN users u ON u.id = t.driver_id
`;

function mapTrip(r: DbTripRow): TripSummary {
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
    seatsTaken: r.seats_taken,
    seatsLeft: Math.max(0, r.total_seats - r.seats_taken),
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

export function listTrips(filters: TripFilters = {}): TripSummary[] {
  const where: string[] = ["t.status = 'scheduled'", "t.departure_at >= ?"];
  const params: (string | number)[] = [nowUtcIso()];
  if (filters.from) {
    where.push("t.origin_city = ?");
    params.push(filters.from);
  }
  if (filters.to) {
    where.push("t.destination_city = ?");
    params.push(filters.to);
  }
  if (filters.date) {
    const range = tbilisiDayRangeUtc(filters.date);
    if (range) {
      where.push("t.departure_at >= ? AND t.departure_at < ?");
      params.push(range[0], range[1]);
    }
  }
  const order =
    filters.sort === "price"
      ? "t.price_gel ASC, t.departure_at ASC"
      : "t.departure_at ASC";
  const limit = Math.min(filters.limit ?? 60, 200);
  const rows = db
    .prepare(
      `${TRIP_SELECT} WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ${limit}`
    )
    .all(...params) as unknown as DbTripRow[];
  return rows.map(mapTrip);
}

export function getTrip(id: string): TripSummary | null {
  const row = db.prepare(`${TRIP_SELECT} WHERE t.id = ?`).get(id) as
    | DbTripRow
    | undefined;
  return row ? mapTrip(row) : null;
}

export function getStats(): { trips: number; drivers: number; routes: number } {
  const now = nowUtcIso();
  const trips = (
    db
      .prepare(
        "SELECT COUNT(*) AS c FROM trips WHERE status = 'scheduled' AND departure_at >= ?"
      )
      .get(now) as { c: number }
  ).c;
  const drivers = (
    db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'driver'").get() as {
      c: number;
    }
  ).c;
  const routes = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT origin_city || '>' || destination_city) AS c
         FROM trips WHERE status = 'scheduled' AND departure_at >= ?`
      )
      .get(now) as { c: number }
  ).c;
  return { trips, drivers, routes };
}

export function popularRoutes(
  limit = 8
): { from: string; to: string; count: number; minPrice: number }[] {
  const rows = db
    .prepare(
      `SELECT origin_city AS from_city, destination_city AS to_city,
              COUNT(*) AS cnt, MIN(price_gel) AS min_price
       FROM trips WHERE status = 'scheduled' AND departure_at >= ?
       GROUP BY origin_city, destination_city
       ORDER BY cnt DESC, min_price ASC LIMIT ${Math.min(limit, 24)}`
    )
    .all(nowUtcIso()) as unknown as {
    from_city: string;
    to_city: string;
    cnt: number;
    min_price: number;
  }[];
  return rows.map((r) => ({
    from: r.from_city,
    to: r.to_city,
    count: r.cnt,
    minPrice: r.min_price,
  }));
}

export function driverTrips(driverId: string): TripSummary[] {
  const rows = db
    .prepare(
      `${TRIP_SELECT} WHERE t.driver_id = ? ORDER BY t.departure_at DESC LIMIT 200`
    )
    .all(driverId) as unknown as DbTripRow[];
  return rows.map(mapTrip);
}

export function createTrip(input: {
  driverId: string;
  vehicleId: string;
  originCity: string;
  originStation: string;
  destinationCity: string;
  departureAtUtc: string;
  priceGel: number;
  totalSeats: number;
  notes: string | null;
}): string {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO trips (id, driver_id, vehicle_id, origin_city, origin_station,
                        destination_city, departure_at, price_gel, total_seats, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.driverId,
    input.vehicleId,
    input.originCity,
    input.originStation,
    input.destinationCity,
    input.departureAtUtc,
    input.priceGel,
    input.totalSeats,
    input.notes
  );
  return id;
}

/** Cancels a scheduled trip owned by the driver. Returns true if a row changed. */
export function cancelTrip(tripId: string, driverId: string): boolean {
  const result = db
    .prepare(
      `UPDATE trips SET status = 'cancelled'
       WHERE id = ? AND driver_id = ? AND status = 'scheduled'`
    )
    .run(tripId, driverId);
  return result.changes > 0;
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

export function driverVehicles(driverId: string): Vehicle[] {
  const rows = db
    .prepare("SELECT * FROM vehicles WHERE driver_id = ? ORDER BY created_at ASC")
    .all(driverId) as unknown as DbVehicleRow[];
  return rows.map(mapVehicle);
}

export function getVehicleForDriver(
  vehicleId: string,
  driverId: string
): Vehicle | null {
  const row = db
    .prepare("SELECT * FROM vehicles WHERE id = ? AND driver_id = ?")
    .get(vehicleId, driverId) as DbVehicleRow | undefined;
  return row ? mapVehicle(row) : null;
}

export function createVehicle(input: {
  driverId: string;
  name: string;
  plateNumber: string;
  capacity: number;
  photoUrl: string;
}): string {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO vehicles (id, driver_id, name, plate_number, capacity, photo_url)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.driverId,
    input.name,
    input.plateNumber,
    input.capacity,
    input.photoUrl
  );
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

const BOOKING_SELECT = `
  SELECT b.id, b.trip_id, b.seats, b.payment_method, b.payment_status,
         b.status AS booking_status, b.created_at,
         b.passenger_name, b.passenger_phone, b.passenger_email,
         t.origin_city, t.origin_station, t.destination_city, t.departure_at,
         t.price_gel, t.status AS trip_status,
         v.name AS vehicle_name, v.plate_number AS vehicle_plate,
         v.photo_url AS vehicle_photo_url,
         u.first_name AS driver_first_name, u.last_name AS driver_last_name,
         u.phone AS driver_phone
  FROM bookings b
  JOIN trips t ON t.id = b.trip_id
  JOIN vehicles v ON v.id = t.vehicle_id
  JOIN users u ON u.id = t.driver_id
`;

function mapBooking(r: DbBookingRow): BookingWithTrip {
  return {
    id: r.id,
    tripId: r.trip_id,
    seats: r.seats,
    paymentMethod: r.payment_method as PaymentMethod,
    paymentStatus: r.payment_status as PaymentStatus,
    status: r.booking_status as BookingWithTrip["status"],
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

export function passengerBookings(userId: string): BookingWithTrip[] {
  const rows = db
    .prepare(
      `${BOOKING_SELECT} WHERE b.passenger_id = ? ORDER BY t.departure_at DESC LIMIT 200`
    )
    .all(userId) as unknown as DbBookingRow[];
  return rows.map(mapBooking);
}

export function getBookingForUser(
  bookingId: string,
  userId: string
): BookingWithTrip | null {
  const row = db
    .prepare(`${BOOKING_SELECT} WHERE b.id = ? AND b.passenger_id = ?`)
    .get(bookingId, userId) as DbBookingRow | undefined;
  return row ? mapBooking(row) : null;
}

export function userHasBooking(tripId: string, userId: string): boolean {
  const row = db
    .prepare(
      `SELECT 1 AS x FROM bookings
       WHERE trip_id = ? AND passenger_id = ? AND status = 'confirmed'`
    )
    .get(tripId, userId);
  return row !== undefined;
}

export function insertBooking(input: {
  tripId: string;
  passengerId: string;
  seats: number;
  name: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}): string {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO bookings (id, trip_id, passenger_id, seats, passenger_name,
                           passenger_phone, passenger_email, payment_method, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    input.tripId,
    input.passengerId,
    input.seats,
    input.name,
    input.phone,
    input.email,
    input.paymentMethod,
    input.paymentStatus
  );
  return id;
}

/** Cancels a confirmed booking owned by the passenger. Returns true if a row changed. */
export function cancelBooking(bookingId: string, userId: string): boolean {
  const result = db
    .prepare(
      `UPDATE bookings SET status = 'cancelled'
       WHERE id = ? AND passenger_id = ? AND status = 'confirmed'`
    )
    .run(bookingId, userId);
  return result.changes > 0;
}

export function tripManifest(tripId: string): ManifestEntry[] {
  const rows = db
    .prepare(
      `SELECT id AS booking_id, seats, payment_method, payment_status, status,
              created_at, passenger_name, passenger_phone, passenger_email
       FROM bookings WHERE trip_id = ? ORDER BY created_at ASC`
    )
    .all(tripId) as unknown as {
    booking_id: string;
    seats: number;
    payment_method: string;
    payment_status: string;
    status: string;
    created_at: string;
    passenger_name: string;
    passenger_phone: string;
    passenger_email: string;
  }[];
  return rows.map((r) => ({
    bookingId: r.booking_id,
    seats: r.seats,
    paymentMethod: r.payment_method as PaymentMethod,
    paymentStatus: r.payment_status as PaymentStatus,
    status: r.status as ManifestEntry["status"],
    createdAt: r.created_at,
    name: r.passenger_name,
    phone: r.passenger_phone,
    email: r.passenger_email,
  }));
}
