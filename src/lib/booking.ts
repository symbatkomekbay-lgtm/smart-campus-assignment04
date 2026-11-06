export type Booking = [number, number];

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
}

export const MAX_DURATION_MINUTES = 120;
export const MINUTES_PER_DAY = 1440;

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

/**
 * Determine whether a room can be booked for the window [start, end).
 *
 * Acceptance criteria:
 *  AC1 Times must be integers between 0 and 1440.
 *  AC2 start < end and start > now.
 *  AC3 Duration must not exceed 120 minutes.
 *  AC4 Blocked rooms are unavailable.
 *  AC5 Reject overlapping bookings but allow touching endpoints.
 *  AC6 Do not mutate input data.
 */
export function can_book(
  start: number,
  end: number,
  now: number,
  blocked: boolean,
  existing: readonly Booking[]
): AvailabilityResult {
  // AC6: never mutate the caller's data. Copy defensively for any internal work.
  const bookings = [...existing];

  // AC4: blocked rooms are unavailable regardless of other inputs.
  if (blocked) {
    return { available: false, reason: "This room is blocked and cannot be booked." };
  }

  // AC1: integer bounds in [0, 1440].
  for (const [label, value] of [["start", start], ["end", end]] as const) {
    if (!isInteger(value) || value < 0 || value > MINUTES_PER_DAY) {
      return {
        available: false,
        reason: `${label} must be a whole number between 0 and ${MINUTES_PER_DAY}.`,
      };
    }
  }

  // AC2: ordering and future start.
  if (start >= end) {
    return { available: false, reason: "Start time must be earlier than end time." };
  }
  if (start <= now) {
    return {
      available: false,
      reason: "Start time must be in the future (after the current time).",
    };
  }

  // AC3: duration cap.
  if (end - start > MAX_DURATION_MINUTES) {
    return {
      available: false,
      reason: `Bookings may not exceed ${MAX_DURATION_MINUTES} minutes.`,
    };
  }

  // AC5: reject overlaps, allow touching endpoints (e.g. 600-660 then 660-720).
  for (const [s, e] of bookings) {
    if (start < e && s < end) {
      return {
        available: false,
        reason: `Overlaps an existing booking (${formatTime(s)}–${formatTime(e)}).`,
      };
    }
  }

  return { available: true };
}

/** Format a minute-of-day integer as a human-readable 12-hour clock string. */
export function formatTime(minutes: number): string {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h24 = Math.floor(m / 60);
  const min = m % 60;
  const period = h24 < 12 ? "AM" : "PM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${min.toString().padStart(2, "0")} ${period}`;
}
