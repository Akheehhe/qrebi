import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { dataDir } from "./paths";
import { seedDatabase } from "./seed";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('passenger', 'driver')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  origin_city TEXT NOT NULL,
  origin_station TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  departure_at TEXT NOT NULL,
  price_gel REAL NOT NULL,
  total_seats INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'departed', 'cancelled')),
  notes TEXT,
  walkin_seats INTEGER NOT NULL DEFAULT 0,
  sales_closed INTEGER NOT NULL DEFAULT 0,
  sales_cutoff_min INTEGER NOT NULL DEFAULT 30,
  cancel_cutoff_min INTEGER NOT NULL DEFAULT 60,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  passenger_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seats INTEGER NOT NULL DEFAULT 1,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  passenger_email TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('online', 'cash')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'pending')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  boarded INTEGER NOT NULL DEFAULT 0,
  no_show INTEGER NOT NULL DEFAULT 0,
  refund_due INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS platform_fees (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  driver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_gel REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_platform_fees_driver ON platform_fees(driver_id, created_at);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id TEXT REFERENCES trips(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('booking', 'cancellation')),
  to_phone TEXT NOT NULL,
  body TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  delivery TEXT NOT NULL CHECK (delivery IN ('sent', 'simulated', 'failed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_driver ON notifications(driver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_trips_departure ON trips(departure_at);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trip ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`;

declare global {
  // eslint-disable-next-line no-var
  var __mybusDb: DatabaseSync | undefined;
}

/** Adds a column to an existing table; ignores "duplicate column" on re-run. */
function ensureColumn(database: DatabaseSync, table: string, columnDef: string) {
  try {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
  } catch {
    // column already exists
  }
}

function migrate(database: DatabaseSync) {
  ensureColumn(database, "trips", "walkin_seats INTEGER NOT NULL DEFAULT 0");
  ensureColumn(database, "trips", "sales_closed INTEGER NOT NULL DEFAULT 0");
  ensureColumn(database, "trips", "sales_cutoff_min INTEGER NOT NULL DEFAULT 30");
  ensureColumn(database, "trips", "cancel_cutoff_min INTEGER NOT NULL DEFAULT 60");
  ensureColumn(database, "bookings", "boarded INTEGER NOT NULL DEFAULT 0");
  ensureColumn(database, "bookings", "no_show INTEGER NOT NULL DEFAULT 0");
  ensureColumn(database, "bookings", "refund_due INTEGER NOT NULL DEFAULT 0");
}

function openDb(): DatabaseSync {
  const dir = dataDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const database = new DatabaseSync(path.join(dir, "mybus.db"));
  database.exec("PRAGMA journal_mode = WAL");
  database.exec("PRAGMA busy_timeout = 10000");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(SCHEMA_SQL);
  migrate(database);
  // Seed inside an immediate transaction: concurrent processes (e.g. build
  // workers) wait on the write lock, then see the rows and skip.
  database.exec("BEGIN IMMEDIATE");
  try {
    const { c } = database
      .prepare("SELECT COUNT(*) AS c FROM users")
      .get() as { c: number };
    if (c === 0) seedDatabase(database);
    database.exec("COMMIT");
  } catch (err) {
    database.exec("ROLLBACK");
    throw err;
  }
  return database;
}

export const db = globalThis.__mybusDb ?? openDb();
if (!globalThis.__mybusDb) {
  globalThis.__mybusDb = db;
}
