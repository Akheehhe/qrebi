"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adjustWalkin,
  cancelTrip,
  createTrip,
  createVehicle,
  getVehicleForDriver,
  markTripDeparted,
  releaseNoShows,
  requireUser,
  setBoarded,
  setSalesClosed,
} from "@/lib/dal";
import { nowUtcIso, tbilisiLocalToUtcIso } from "@/lib/datetime";
import { dataDir } from "@/lib/paths";
import { CITIES } from "@/lib/constants";
import type { ActionState } from "@/lib/types";

const PRESET_PHOTOS: Record<string, string> = {
  "sprinter-blue": "/images/buses/sprinter-blue.svg",
  "sprinter-yellow": "/images/buses/sprinter-yellow.svg",
  "marshrutka-white": "/images/buses/marshrutka-white.svg",
  "minibus-green": "/images/buses/minibus-green.svg",
  "coach-blue": "/images/buses/coach-blue.svg",
  "coach-red": "/images/buses/coach-red.svg",
};

const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function createVehicleAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const driver = await requireUser("driver");

  const name = String(formData.get("name") ?? "").trim();
  const plate = String(formData.get("plate") ?? "").trim().toUpperCase();
  const capacity = Number.parseInt(String(formData.get("capacity") ?? ""), 10);

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "შეიყვანეთ ავტობუსის მოდელი";
  if (plate.length < 4) fieldErrors.plate = "შეიყვანეთ სახელმწიფო ნომერი";
  if (!Number.isInteger(capacity) || capacity < 4 || capacity > 60) {
    fieldErrors.capacity = "ადგილების რაოდენობა უნდა იყოს 4-დან 60-მდე";
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  let photoUrl =
    PRESET_PHOTOS[String(formData.get("preset") ?? "")] ??
    PRESET_PHOTOS["marshrutka-white"];

  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    const ext = PHOTO_EXTENSIONS[file.type];
    if (!ext) {
      return { fieldErrors: { photo: "ატვირთეთ JPG, PNG ან WebP ფოტო" } };
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return { fieldErrors: { photo: "ფოტო არ უნდა აღემატებოდეს 5MB-ს" } };
    }
    const dir = path.join(dataDir(), "uploads");
    await fs.mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}${ext}`;
    await fs.writeFile(
      path.join(dir, filename),
      Buffer.from(await file.arrayBuffer())
    );
    photoUrl = `/api/uploads/${filename}`;
  }

  await createVehicle({
    driverId: driver.id,
    name,
    plateNumber: plate,
    capacity,
    photoUrl,
  });
  revalidatePath("/driver/vehicles");
  redirect("/driver/vehicles");
}

export async function createTripAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const driver = await requireUser("driver");

  const vehicleId = String(formData.get("vehicleId") ?? "");
  const vehicle = await getVehicleForDriver(vehicleId, driver.id);
  if (!vehicle) {
    return { fieldErrors: { vehicleId: "აირჩიეთ ავტობუსი" } };
  }

  const originCity = String(formData.get("originCity") ?? "");
  const destinationCity = String(formData.get("destinationCity") ?? "");
  const originStation = String(formData.get("originStation") ?? "").trim();
  const departureLocal = String(formData.get("departure") ?? "");
  const price = Number(String(formData.get("price") ?? ""));
  const totalSeats = Number.parseInt(String(formData.get("totalSeats") ?? ""), 10);
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 300) || null;

  const cities = CITIES as readonly string[];
  const fieldErrors: Record<string, string> = {};
  if (!cities.includes(originCity)) {
    fieldErrors.originCity = "აირჩიეთ გასვლის ქალაქი";
  }
  if (!cities.includes(destinationCity)) {
    fieldErrors.destinationCity = "აირჩიეთ დანიშნულების ქალაქი";
  }
  if (
    !fieldErrors.originCity &&
    !fieldErrors.destinationCity &&
    originCity === destinationCity
  ) {
    fieldErrors.destinationCity =
      "გასვლისა და დანიშნულების ქალაქები უნდა განსხვავდებოდეს";
  }
  if (originStation.length < 3) {
    fieldErrors.originStation = "მიუთითეთ გასვლის ადგილი, მაგ. დიდუბის ავტოსადგური";
  }
  const departureUtc = tbilisiLocalToUtcIso(departureLocal);
  if (!departureUtc) {
    fieldErrors.departure = "მიუთითეთ გასვლის თარიღი და დრო";
  } else if (departureUtc <= nowUtcIso()) {
    fieldErrors.departure = "გასვლის დრო უნდა იყოს მომავალში";
  }
  if (!Number.isFinite(price) || price <= 0 || price > 1000) {
    fieldErrors.price = "მიუთითეთ ფასი 1-დან 1000 ლარამდე";
  }
  if (
    !Number.isInteger(totalSeats) ||
    totalSeats < 1 ||
    totalSeats > vehicle.capacity
  ) {
    fieldErrors.totalSeats = `ადგილები უნდა იყოს 1-დან ${vehicle.capacity}-მდე`;
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  await createTrip({
    driverId: driver.id,
    vehicleId,
    originCity,
    originStation,
    destinationCity,
    departureAtUtc: departureUtc!,
    priceGel: price,
    totalSeats,
    notes,
  });

  revalidatePath("/");
  revalidatePath("/trips");
  revalidatePath("/driver");
  redirect("/driver");
}

export async function cancelTripAction(formData: FormData): Promise<void> {
  const driver = await requireUser("driver");
  const tripId = String(formData.get("tripId") ?? "");
  await cancelTrip(tripId, driver.id);
  revalidatePath("/");
  revalidatePath("/trips");
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/driver");
}

// ---------- live boarding mode ----------

export async function adjustWalkinAction(
  tripId: string,
  delta: number
): Promise<void> {
  const driver = await requireUser("driver");
  if (delta !== 1 && delta !== -1) return;
  await adjustWalkin(tripId, driver.id, delta);
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/driver");
}

export async function toggleSalesAction(
  tripId: string,
  closed: boolean
): Promise<void> {
  const driver = await requireUser("driver");
  await setSalesClosed(tripId, driver.id, closed);
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/driver");
}

export async function toggleBoardedAction(
  bookingId: string,
  boarded: boolean
): Promise<void> {
  const driver = await requireUser("driver");
  await setBoarded(bookingId, driver.id, boarded);
}

export async function releaseNoShowsAction(tripId: string): Promise<number> {
  const driver = await requireUser("driver");
  const released = await releaseNoShows(tripId, driver.id);
  if (released > 0) {
    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/driver");
  }
  return released;
}

export async function departTripAction(tripId: string): Promise<boolean> {
  const driver = await requireUser("driver");
  const ok = await markTripDeparted(tripId, driver.id);
  if (ok) {
    revalidatePath("/");
    revalidatePath("/trips");
    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/driver");
    revalidatePath("/driver/fees");
  }
  return ok;
}
