import type { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { hashPassword } from "./password";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const TBILISI_OFFSET_MS = 4 * HOUR;

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

/** UTC ISO for the given Tbilisi wall-clock time, dayOffset days from today. */
function departAt(dayOffset: number, hour: number, minute = 0): string {
  const nowTbilisi = Date.now() + TBILISI_OFFSET_MS;
  const startOfDayTbilisi = Math.floor(nowTbilisi / DAY) * DAY;
  return iso(
    startOfDayTbilisi +
      dayOffset * DAY +
      hour * HOUR +
      minute * 60 * 1000 -
      TBILISI_OFFSET_MS
  );
}

function currentTbilisiHour(): number {
  return new Date(Date.now() + TBILISI_OFFSET_MS).getUTCHours();
}

interface SeedDriver {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface SeedVehicle {
  driverIdx: number;
  name: string;
  plate: string;
  capacity: number;
  photo: string;
}

interface SeedRoute {
  from: string;
  station: string;
  to: string;
  hour: number;
  minute?: number;
  price: number;
  vehicleIdx: number;
  notes?: string;
}

const DRIVERS: SeedDriver[] = [
  { firstName: "გიორგი", lastName: "მაისურაძე", email: "driver@mybus.ge", phone: "+995 599 11 22 33" },
  { firstName: "დავით", lastName: "ბერიძე", email: "davit.beridze@mybus.ge", phone: "+995 555 44 55 66" },
  { firstName: "ნინო", lastName: "კაპანაძე", email: "nino.kapanadze@mybus.ge", phone: "+995 577 77 88 99" },
  { firstName: "ლევან", lastName: "წიკლაური", email: "levan.tsiklauri@mybus.ge", phone: "+995 591 23 45 67" },
  { firstName: "თამარ", lastName: "გელაშვილი", email: "tamar.gelashvili@mybus.ge", phone: "+995 598 76 54 32" },
  { firstName: "ზურაბ", lastName: "ჩხეიძე", email: "zurab.chkheidze@mybus.ge", phone: "+995 551 11 00 99" },
];

const VEHICLES: SeedVehicle[] = [
  { driverIdx: 0, name: "Mercedes-Benz Sprinter", plate: "TB-101-BM", capacity: 18, photo: "/images/buses/sprinter-blue.svg" },
  { driverIdx: 0, name: "Setra S 515 HD", plate: "TB-515-HD", capacity: 48, photo: "/images/buses/coach-blue.svg" },
  { driverIdx: 1, name: "Ford Transit", plate: "KA-232-FT", capacity: 16, photo: "/images/buses/marshrutka-white.svg" },
  { driverIdx: 2, name: "Mercedes-Benz Sprinter VIP", plate: "BB-747-VP", capacity: 14, photo: "/images/buses/sprinter-yellow.svg" },
  { driverIdx: 3, name: "Volkswagen Crafter", plate: "GG-303-VW", capacity: 17, photo: "/images/buses/minibus-green.svg" },
  { driverIdx: 4, name: "MAN Lion's Coach", plate: "TT-909-MN", capacity: 52, photo: "/images/buses/coach-red.svg" },
  { driverIdx: 5, name: "Toyota HiAce", plate: "ZZ-121-TH", capacity: 12, photo: "/images/buses/marshrutka-white.svg" },
  { driverIdx: 1, name: "Iveco Daily", plate: "KK-454-IV", capacity: 19, photo: "/images/buses/sprinter-blue.svg" },
];

const DIDUBE = "დიდუბის ავტოსადგური";
const ORTACHALA = "ორთაჭალის ავტოსადგური";
const SAMGORI = "სამგორის ავტოსადგური";

// Daily schedule template. Repeated for each of the next 7 days.
const DAILY_ROUTES: SeedRoute[] = [
  { from: "თბილისი", station: DIDUBE, to: "ბათუმი", hour: 8, price: 35, vehicleIdx: 1, notes: "გზაში დაახლოებით 6 საათი, ერთი შესვენება რიკოთზე. Wi-Fi და კონდიციონერი." },
  { from: "თბილისი", station: DIDUBE, to: "ბათუმი", hour: 15, price: 35, vehicleIdx: 5, notes: "კომფორტული ავტობუსი, დამტენი ყველა ადგილთან." },
  { from: "თბილისი", station: DIDUBE, to: "ბათუმი", hour: 23, minute: 30, price: 30, vehicleIdx: 1, notes: "ღამის რეისი, ჩასვლა დილით." },
  { from: "თბილისი", station: DIDUBE, to: "ქუთაისი", hour: 9, price: 20, vehicleIdx: 0, notes: "გზაში დაახლოებით 3.5 საათი." },
  { from: "თბილისი", station: DIDUBE, to: "ქუთაისი", hour: 13, price: 20, vehicleIdx: 2 },
  { from: "თბილისი", station: DIDUBE, to: "ქუთაისი", hour: 18, price: 18, vehicleIdx: 7 },
  { from: "თბილისი", station: DIDUBE, to: "ზუგდიდი", hour: 10, price: 30, vehicleIdx: 4, notes: "ჩერდება სენაკსა და აბაშაში." },
  { from: "თბილისი", station: ORTACHALA, to: "თელავი", hour: 11, price: 12, vehicleIdx: 6, notes: "გომბორის გზით, გზაში 2 საათი." },
  { from: "თბილისი", station: ORTACHALA, to: "სიღნაღი", hour: 16, price: 15, vehicleIdx: 6 },
  { from: "თბილისი", station: DIDUBE, to: "გორი", hour: 12, price: 8, vehicleIdx: 3 },
  { from: "თბილისი", station: DIDUBE, to: "ბორჯომი", hour: 14, price: 15, vehicleIdx: 3, notes: "ჩერდება ხაშურში." },
  { from: "თბილისი", station: DIDUBE, to: "გუდაური", hour: 7, minute: 30, price: 20, vehicleIdx: 4, notes: "თხილამურების გადატანა შესაძლებელია." },
  { from: "თბილისი", station: DIDUBE, to: "სტეფანწმინდა", hour: 9, minute: 30, price: 25, vehicleIdx: 4, notes: "სამხედრო გზით, ხედები გარანტირებულია." },
  { from: "თბილისი", station: SAMGORI, to: "ახალციხე", hour: 10, minute: 30, price: 20, vehicleIdx: 2 },
  { from: "ბათუმი", station: "ბათუმის ავტოსადგური", to: "თბილისი", hour: 9, price: 35, vehicleIdx: 5 },
  { from: "ბათუმი", station: "ბათუმის ავტოსადგური", to: "ქუთაისი", hour: 12, price: 15, vehicleIdx: 7 },
  { from: "ქუთაისი", station: "ქუთაისის ავტოსადგური", to: "თბილისი", hour: 15, minute: 30, price: 20, vehicleIdx: 0 },
  { from: "ზუგდიდი", station: "ზუგდიდის ავტოსადგური", to: "თბილისი", hour: 8, minute: 30, price: 30, vehicleIdx: 4 },
  { from: "თბილისი", station: DIDUBE, to: "მესტია", hour: 6, minute: 30, price: 50, vehicleIdx: 0, notes: "გზაში დაახლოებით 9 საათი, ორი შესვენება." },
  { from: "თბილისი", station: ORTACHALA, to: "ყვარელი", hour: 17, price: 15, vehicleIdx: 6 },
];

const SEED_PASSENGERS = [
  { firstName: "ბექა", lastName: "ლომიძე", email: "demo@mybus.ge", phone: "+995 595 00 11 22" },
  { firstName: "მარიამ", lastName: "ხურციძე", email: "mariam.kh@example.com", phone: "+995 593 12 34 56" },
  { firstName: "გია", lastName: "აბაშიძე", email: "gia.abashidze@example.com", phone: "+995 596 65 43 21" },
  { firstName: "ანა", lastName: "ჯავახიშვილი", email: "ana.j@example.com", phone: "+995 597 88 99 00" },
  { firstName: "სანდრო", lastName: "კვირიკაშვილი", email: "sandro.k@example.com", phone: "+995 592 22 33 44" },
  { firstName: "ელენე", lastName: "დოლიძე", email: "elene.d@example.com", phone: "+995 594 55 66 77" },
];

export function seedDatabase(database: DatabaseSync): void {
  const insertUser = database.prepare(
    `INSERT INTO users (id, role, first_name, last_name, email, phone, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const insertVehicle = database.prepare(
    `INSERT INTO vehicles (id, driver_id, name, plate_number, capacity, photo_url)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const insertTrip = database.prepare(
    `INSERT INTO trips (id, driver_id, vehicle_id, origin_city, origin_station,
                        destination_city, departure_at, price_gel, total_seats, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertBooking = database.prepare(
    `INSERT INTO bookings (id, trip_id, passenger_id, seats, passenger_name,
                           passenger_phone, passenger_email, payment_method, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const driverPassword = hashPassword("Driver123!");
  const demoPassword = hashPassword("Demo123!");
  const otherPassword = hashPassword("Mybus2026!");

  const driverIds = DRIVERS.map((d, i) => {
    const id = randomUUID();
    insertUser.run(
      id,
      "driver",
      d.firstName,
      d.lastName,
      d.email,
      d.phone,
      i === 0 ? driverPassword : otherPassword
    );
    return id;
  });

  const vehicleIds = VEHICLES.map((v) => {
    const id = randomUUID();
    insertVehicle.run(id, driverIds[v.driverIdx], v.name, v.plate, v.capacity, v.photo);
    return id;
  });

  const passengerIds = SEED_PASSENGERS.map((p, i) => {
    const id = randomUUID();
    insertUser.run(
      id,
      "passenger",
      p.firstName,
      p.lastName,
      p.email,
      p.phone,
      i === 0 ? demoPassword : otherPassword
    );
    return id;
  });

  const trips: { id: string; capacity: number; soonRank: number }[] = [];
  const nowHour = currentTbilisiHour();

  for (let day = 0; day < 7; day++) {
    for (let r = 0; r < DAILY_ROUTES.length; r++) {
      const route = DAILY_ROUTES[r];
      // Skip today's departures that are already in the past (or leaving within the hour).
      if (day === 0 && route.hour <= nowHour + 1) continue;
      const vehicle = VEHICLES[route.vehicleIdx];
      const tripId = randomUUID();
      insertTrip.run(
        tripId,
        driverIds[vehicle.driverIdx],
        vehicleIds[route.vehicleIdx],
        route.from,
        route.station,
        route.to,
        departAt(day, route.hour, route.minute ?? 0),
        route.price,
        vehicle.capacity,
        route.notes ?? null
      );
      trips.push({ id: tripId, capacity: vehicle.capacity, soonRank: day * 100 + r });
    }
  }

  // A couple of "leaving soon" trips so the demo always has near-term departures.
  const soonTrips: [number, SeedRoute][] = [
    [2, DAILY_ROUTES[3]],
    [4, DAILY_ROUTES[0]],
  ];
  for (const [hoursFromNow, route] of soonTrips) {
    const vehicle = VEHICLES[route.vehicleIdx];
    const tripId = randomUUID();
    insertTrip.run(
      tripId,
      driverIds[vehicle.driverIdx],
      vehicleIds[route.vehicleIdx],
      route.from,
      route.station,
      route.to,
      iso(Date.now() + hoursFromNow * HOUR),
      route.price,
      vehicle.capacity,
      route.notes ?? null
    );
    trips.unshift({ id: tripId, capacity: vehicle.capacity, soonRank: -1 });
  }

  // Deterministic bookings over the nearest ~30 trips so listings look alive.
  trips.sort((a, b) => a.soonRank - b.soonRank);
  let bookingCounter = 0;
  for (let i = 0; i < Math.min(trips.length, 30); i++) {
    const trip = trips[i];
    // One trip filled completely, the rest partially, some empty.
    let target =
      i === 5 ? trip.capacity : [7, 3, 0, 9, 2, 12, 5, 0, 4, 8][i % 10];
    target = Math.min(target, trip.capacity);
    let remaining = target;
    let passengerCursor = i;
    while (remaining > 0) {
      const seats = Math.min(4, remaining, ((bookingCounter * 3) % 4) + 1);
      const passenger = SEED_PASSENGERS[passengerCursor % SEED_PASSENGERS.length];
      const passengerId = passengerIds[passengerCursor % passengerIds.length];
      const online = bookingCounter % 3 !== 2;
      insertBooking.run(
        randomUUID(),
        trip.id,
        passengerId,
        seats,
        `${passenger.firstName} ${passenger.lastName}`,
        passenger.phone,
        passenger.email,
        online ? "online" : "cash",
        online ? "paid" : "pending"
      );
      remaining -= seats;
      passengerCursor++;
      bookingCounter++;
    }
  }
}
