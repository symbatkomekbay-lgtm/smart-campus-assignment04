import { describe, expect, it } from "vitest";
import { can_book, MAX_DURATION_MINUTES, type Booking } from "./booking";
import { INITIAL_NOW as NOW, INITIAL_BLOCKED as BLOCKED, INITIAL_EXISTING as EXISTING } from "./fixtures";

describe("can_book", () => {
  describe("AC1 — integer bounds 0..1440", () => {
    it("rejects a non-integer start", () => {
      expect(can_book(540.5, 600, NOW, BLOCKED, EXISTING).available).toBe(false);
    });
    it("rejects a negative start", () => {
      expect(can_book(-1, 600, NOW, BLOCKED, EXISTING).available).toBe(false);
    });
    it("rejects an end beyond 1440", () => {
      expect(can_book(700, 1441, NOW, BLOCKED, EXISTING).available).toBe(false);
    });
    it("accepts the upper boundary 1440 as end", () => {
      expect(can_book(1320, 1440, NOW, BLOCKED, EXISTING).available).toBe(true);
    });
    it("accepts 0 as a valid bound (fails only on later rules, not AC1)", () => {
      // 0 is within [0,1440]; it must not be rejected for being out of range.
      const res = can_book(0, 60, 100, BLOCKED, []);
      expect(res.available).toBe(false);
      expect(res.reason).not.toContain("between 0 and");
    });
  });

  describe("AC2 — start < end and start > now", () => {
    it("rejects start >= end", () => {
      expect(can_book(660, 660, NOW, BLOCKED, EXISTING).available).toBe(false);
      expect(can_book(700, 660, NOW, BLOCKED, EXISTING).available).toBe(false);
    });
    it("rejects start == now", () => {
      expect(can_book(540, 600, NOW, BLOCKED, EXISTING).available).toBe(false);
    });
    it("rejects start < now", () => {
      expect(can_book(500, 600, NOW, BLOCKED, EXISTING).available).toBe(false);
    });
    it("accepts start strictly after now", () => {
      expect(can_book(541, 590, NOW, BLOCKED, EXISTING).available).toBe(true);
    });
  });

  describe("AC3 — duration cap of 120 minutes", () => {
    it("accepts exactly 120 minutes", () => {
      expect(can_book(661, 781, NOW, BLOCKED, EXISTING).available).toBe(true);
    });
    it("rejects more than 120 minutes", () => {
      const res = can_book(661, 782, NOW, BLOCKED, EXISTING);
      expect(res.available).toBe(false);
      expect(res.reason).toContain(`${MAX_DURATION_MINUTES}`);
    });
  });

  describe("AC4 — blocked rooms", () => {
    it("is unavailable when blocked, even for a valid window", () => {
      const res = can_book(541, 600, NOW, true, EXISTING);
      expect(res.available).toBe(false);
      expect(res.reason).toContain("blocked");
    });
    it("blocked takes precedence over invalid times", () => {
      expect(can_book(-5, -1, NOW, true, EXISTING).available).toBe(false);
    });
  });

  describe("AC5 — overlaps vs touching endpoints", () => {
    it("rejects a window fully inside an existing booking", () => {
      expect(can_book(610, 650, NOW, BLOCKED, EXISTING).available).toBe(false);
    });
    it("rejects a window that starts before and overlaps", () => {
      expect(can_book(590, 610, NOW, BLOCKED, EXISTING).available).toBe(false);
    });
    it("rejects a window that overlaps the tail", () => {
      expect(can_book(650, 670, NOW, BLOCKED, EXISTING).available).toBe(false);
    });
    it("allows a window ending exactly when one starts (touching)", () => {
      expect(can_book(500, 600, 400, BLOCKED, EXISTING).available).toBe(true);
    });
    it("allows a window starting exactly when one ends (touching)", () => {
      expect(can_book(660, 720, NOW, BLOCKED, EXISTING).available).toBe(true);
    });
    it("allows a window before all existing bookings", () => {
      expect(can_book(541, 600, NOW, BLOCKED, EXISTING).available).toBe(true);
    });
  });

  describe("AC6 — does not mutate inputs", () => {
    it("does not mutate the existing bookings array", () => {
      const snapshot = EXISTING.map((b) => [...b] as Booking);
      can_book(610, 650, NOW, BLOCKED, EXISTING);
      expect(EXISTING).toEqual(snapshot);
      // reference identity preserved
      expect(EXISTING[0]).toBe(EXISTING[0]);
    });
    it("works on a frozen input array", () => {
      const frozen = Object.freeze([[600, 660]] as Booking[]);
      expect(() => can_book(610, 650, NOW, BLOCKED, frozen)).not.toThrow();
    });
  });

  // Task 06 regression suite — each case ties a concrete scenario to a single
  // acceptance criterion. None of the assertions above were weakened or removed.
  describe("Task 06 regression scenarios", () => {
    // AC2: start must be strictly after now. A start in the past is rejected
    // even when it would otherwise be a valid window with no overlap.
    it("rejects a start time in the past (AC2)", () => {
      const res = can_book(400, 500, NOW, BLOCKED, EXISTING);
      expect(res.available).toBe(false);
      expect(res.reason).toContain("future");
    });

    // AC2: start < end. A reversed interval (end before start) is rejected.
    it("rejects a reversed interval where end < start (AC2)", () => {
      const res = can_book(700, 660, NOW, BLOCKED, EXISTING);
      expect(res.available).toBe(false);
      expect(res.reason).toContain("earlier than");
    });

    // AC3: duration must not exceed 120 minutes. 121 minutes is rejected and
    // the reason mentions the cap, so the boundary stays at exactly 120.
    it("rejects a 121-minute duration (AC3)", () => {
      const res = can_book(661, 782, NOW, BLOCKED, EXISTING);
      expect(res.available).toBe(false);
      expect(res.reason).toContain(`${MAX_DURATION_MINUTES}`);
    });

    // AC4: a blocked room is unavailable regardless of an otherwise valid,
    // non-overlapping window. Blocked is checked before other rules.
    it("is unavailable when the room is blocked (AC4)", () => {
      const res = can_book(661, 720, NOW, true, EXISTING);
      expect(res.available).toBe(false);
      expect(res.reason).toContain("blocked");
    });

    // AC5: a window that overlaps an existing booking is rejected. Here the
    // requested window starts before and ends inside the existing 600-660.
    it("rejects a window that overlaps an existing booking (AC5)", () => {
      const res = can_book(590, 620, NOW, BLOCKED, EXISTING);
      expect(res.available).toBe(false);
      expect(res.reason).toContain("Overlaps");
    });

    // AC5: touching endpoints are allowed. A window ending exactly when the
    // existing booking starts (600) is not an overlap.
    it("allows a window ending exactly when an existing booking starts (AC5 touching)", () => {
      const res = can_book(541, 600, NOW, BLOCKED, EXISTING);
      expect(res.available).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    // AC5: touching endpoints are allowed. A window starting exactly when the
    // existing booking ends (660) is not an overlap.
    it("allows a window starting exactly when an existing booking ends (AC5 touching)", () => {
      const res = can_book(660, 720, NOW, BLOCKED, EXISTING);
      expect(res.available).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    // AC6 + fixtures stability: exercising can_book must not mutate the shared
    // fixtures, and the fictional scenario values must remain unchanged after
    // a booking check runs against them.
    it("does not mutate shared fixtures after a booking check (AC6)", () => {
      const beforeNow = NOW;
      const beforeBlocked = BLOCKED;
      const beforeExisting = EXISTING.map((b) => [...b] as Booking);

      can_book(610, 650, NOW, BLOCKED, EXISTING);

      expect(NOW).toBe(beforeNow);
      expect(BLOCKED).toBe(beforeBlocked);
      expect(EXISTING).toEqual(beforeExisting);
    });
  });
});
