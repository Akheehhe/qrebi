// Booking-window rules shared by server pages, actions, and the live board.
// Pure functions over plain values; safe to import from client components.

export function salesCloseAtIso(
  departureAtUtc: string,
  salesCutoffMin: number
): string {
  return new Date(
    Date.parse(departureAtUtc) - salesCutoffMin * 60_000
  ).toISOString();
}

export function freeCancelUntilIso(
  departureAtUtc: string,
  cancelCutoffMin: number
): string {
  return new Date(
    Date.parse(departureAtUtc) - cancelCutoffMin * 60_000
  ).toISOString();
}

/**
 * Online sales are open while the trip is scheduled, the driver has not
 * closed them manually, and the cutoff has not passed. Seat availability
 * is checked separately.
 */
export function isSalesOpen(
  trip: {
    status: string;
    salesClosed: boolean;
    departureAt: string;
    salesCutoffMin: number;
  },
  nowMs: number = Date.now()
): boolean {
  if (trip.status !== "scheduled" || trip.salesClosed) return false;
  return nowMs < Date.parse(salesCloseAtIso(trip.departureAt, trip.salesCutoffMin));
}

/** '60' -> '1 საათით', '30' -> '30 წუთით' (adverbial, for '... ადრე'). */
export function cutoffLabel(min: number): string {
  if (min % 60 === 0) return `${min / 60} საათით`;
  return `${min} წუთით`;
}
