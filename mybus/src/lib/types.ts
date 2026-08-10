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
  /** Seats sold online (confirmed bookings). */
  onlineSeatsTaken: number;
  /** Walk-in passengers counted by the driver at the bus. */
  walkinSeats: number;
  /** Online + walk-in combined. */
  seatsTaken: number;
  seatsLeft: number;
  /** Driver manually closed online sales ("ივსება ადგილზე"). */
  salesClosed: boolean;
  /** Online sales auto-close this many minutes before departure. */
  salesCutoffMin: number;
  /** Free cancellation ends this many minutes before departure. */
  cancelCutoffMin: number;
}

export interface LiveTripState {
  id: string;
  originCity: string;
  destinationCity: string;
  departureAt: string;
  status: TripStatus;
  totalSeats: number;
  onlineSeatsTaken: number;
  walkinSeats: number;
  seatsLeft: number;
  salesClosed: boolean;
  salesOpen: boolean;
  salesCloseAt: string;
  priceGel: number;
}

export interface LiveManifestEntry {
  bookingId: string;
  name: string;
  phone: string;
  seats: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  boarded: boolean;
  noShow: boolean;
}

export interface LiveState {
  trip: LiveTripState;
  manifest: LiveManifestEntry[];
}

export interface BookingWithTrip {
  id: string;
  tripId: string;
  seats: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  /** Cancelled outside the cutoff with online payment: money comes back. */
  refundDue: boolean;
  /** Released by the driver because the passenger never boarded. */
  noShow: boolean;
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
  boarded: boolean;
  noShow: boolean;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
}
