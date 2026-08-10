export type Role = "passenger" | "driver";
export type TripStatus = "scheduled" | "departed" | "cancelled";
export type PaymentMethod = "online" | "cash";
export type PaymentStatus = "paid" | "pending";
export type BookingStatus = "confirmed" | "cancelled";

export type ActionState =
  | { error?: string; fieldErrors?: Record<string, string> }
  | undefined;

export interface User {
  id: string;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface Vehicle {
  id: string;
  driverId: string;
  name: string;
  plateNumber: string;
  capacity: number;
  photoUrl: string;
}

export interface TripSummary {
  id: string;
  driverId: string;
  vehicleId: string;
  originCity: string;
  originStation: string;
  destinationCity: string;
  /** UTC ISO timestamp */
  departureAt: string;
  priceGel: number;
  totalSeats: number;
  status: TripStatus;
  notes: string | null;
  vehicleName: string;
  vehiclePlate: string;
  vehiclePhotoUrl: string;
  driverFirstName: string;
  driverLastName: string;
  driverPhone: string;
  seatsTaken: number;
  seatsLeft: number;
}

export interface BookingWithTrip {
  id: string;
  tripId: string;
  seats: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  originCity: string;
  originStation: string;
  destinationCity: string;
  departureAt: string;
  priceGel: number;
  tripStatus: TripStatus;
  vehicleName: string;
  vehiclePlate: string;
  vehiclePhotoUrl: string;
  driverFirstName: string;
  driverLastName: string;
  driverPhone: string;
}

export interface ManifestEntry {
  bookingId: string;
  seats: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
}
