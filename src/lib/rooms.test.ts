import { describe, expect, it } from "vitest";
import {
  ROOMS,
  EQUIPMENT_OPTIONS,
  filterRooms,
  matchesFilters,
  type Room,
} from "./rooms";

describe("room catalog", () => {
  it("declares at least 4 rooms with unique ids", () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
    const ids = ROOMS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every room has ordered integer bookings and required fields", () => {
    for (const r of ROOMS) {
      expect(typeof r.id).toBe("string");
      expect(typeof r.name).toBe("string");
      expect(Number.isInteger(r.capacity)).toBe(true);
      expect(r.capacity).toBeGreaterThan(0);
      expect(Array.isArray(r.equipment)).toBe(true);
      expect(typeof r.blocked).toBe("boolean");
      for (const [s, e] of r.existing) {
        expect(Number.isInteger(s)).toBe(true);
        expect(Number.isInteger(e)).toBe(true);
        expect(s).toBeLessThan(e);
      }
    }
  });

  it("includes at least one blocked room and at least one open room", () => {
    expect(ROOMS.some((r) => r.blocked)).toBe(true);
    expect(ROOMS.some((r) => !r.blocked)).toBe(true);
  });
});

describe("EQUIPMENT_OPTIONS", () => {
  it("is the sorted unique set of room equipment", () => {
    const expected = [...new Set(ROOMS.flatMap((r) => r.equipment))].sort();
    expect(EQUIPMENT_OPTIONS).toEqual(expected);
  });
});

describe("matchesFilters", () => {
  const open: Room = ROOMS.find((r) => r.id === "library-b")!;

  it("matches when capacity >= attendees and equipment satisfied", () => {
    expect(matchesFilters(open, 6, ["Projector"])).toBe(true);
    expect(matchesFilters(open, 1, [])).toBe(true);
    expect(matchesFilters(open, 0, [])).toBe(true);
  });

  it("rejects when attendees exceed capacity", () => {
    expect(matchesFilters(open, 7, [])).toBe(false);
  });

  it("requires ALL selected equipment (conjunction)", () => {
    expect(matchesFilters(open, 1, ["Projector", "Whiteboard"])).toBe(true);
    expect(matchesFilters(open, 1, ["Projector", "Lab Bench"])).toBe(false);
  });

  it("never matches a blocked room, regardless of capacity or equipment", () => {
    const blockedRoom = ROOMS.find((r) => r.blocked)!;
    expect(matchesFilters(blockedRoom, 1, [])).toBe(false);
    expect(matchesFilters(blockedRoom, 0, [])).toBe(false);
    expect(matchesFilters(blockedRoom, 1, ["Whiteboard"])).toBe(false);
  });
});

describe("filterRooms", () => {
  it("returns only non-blocked rooms with enough capacity and all equipment", () => {
    const result = filterRooms(ROOMS, 6, ["Projector"]);
    for (const r of result) {
      expect(r.blocked).toBe(false);
      expect(r.capacity).toBeGreaterThanOrEqual(6);
      expect(r.equipment).toContain("Projector");
    }
    expect(result.some((r) => r.id === "library-b")).toBe(true);
  });

  it("excludes blocked rooms even when they would otherwise match", () => {
    const result = filterRooms(ROOMS, 1, []);
    expect(result.every((r) => !r.blocked)).toBe(true);
    expect(result.some((r) => r.id === "quiet-pod-2")).toBe(false);
  });

  it("returns an empty array when attendees exceed every capacity", () => {
    expect(filterRooms(ROOMS, 999, [])).toEqual([]);
  });

  it("returns an empty array when required equipment is unavailable", () => {
    expect(filterRooms(ROOMS, 1, ["Nonexistent"])).toEqual([]);
  });

  it("does not mutate the catalog", () => {
    const snapshot = ROOMS.map((r) => ({
      ...r,
      existing: r.existing.map((b) => [...b] as [number, number]),
    }));
    filterRooms(ROOMS, 5, ["Projector", "Whiteboard"]);
    expect(ROOMS).toEqual(snapshot);
  });

  // --- Task 04 targeted scenarios ---

  it("capacity filtering: boundary — attendees exactly equal capacity matches", () => {
    // conference-a has capacity 20
    expect(filterRooms(ROOMS, 20, []).some((r) => r.id === "conference-a")).toBe(true);
  });

  it("capacity filtering: attendees one above capacity is excluded", () => {
    expect(filterRooms(ROOMS, 21, []).some((r) => r.id === "conference-a")).toBe(false);
  });

  it("equipment filtering: single equipment narrows results correctly", () => {
    const result = filterRooms(ROOMS, 1, ["Lab Bench"]);
    expect(result.every((r) => r.equipment.includes("Lab Bench"))).toBe(true);
    expect(result.some((r) => r.id === "eng-lab-104")).toBe(true);
    expect(result.some((r) => r.id === "library-b")).toBe(false);
  });

  it("multiple equipment: requires ALL selected (conjunction, not disjunction)", () => {
    const result = filterRooms(ROOMS, 1, ["Projector", "Video Conferencing"]);
    // conference-a and seminar-301 both have Projector + Video Conferencing
    const ids = result.map((r) => r.id);
    expect(ids).toContain("conference-a");
    expect(ids).toContain("seminar-301");
    // library-b has Projector but NOT Video Conferencing
    expect(ids).not.toContain("library-b");
    // eng-lab-104 has Projector but NOT Video Conferencing
    expect(ids).not.toContain("eng-lab-104");
  });

  it("multiple equipment: three-item requirement matches only rooms with all three", () => {
    const result = filterRooms(ROOMS, 1, ["Projector", "Whiteboard", "Video Conferencing"]);
    expect(result.every((r) => r.blocked === false)).toBe(true);
    expect(result.some((r) => r.id === "conference-a")).toBe(true);
    expect(result.length).toBe(1);
  });

  it("blocked rooms: a room that would match on capacity+equipment is excluded when blocked", () => {
    // quiet-pod-2 has Whiteboard and capacity 2, but is blocked
    const result = filterRooms(ROOMS, 1, ["Whiteboard"]);
    expect(result.some((r) => r.id === "quiet-pod-2")).toBe(false);
  });

  it("empty results: blocked + capacity + equipment all produce empty", () => {
    expect(filterRooms(ROOMS, 100, ["Projector"])).toEqual([]);
    expect(filterRooms(ROOMS, 1, ["Nonexistent Equipment"])).toEqual([]);
    // only rooms with Whiteboard are library-b, eng-lab-104, conference-a, quiet-pod-2
    // requesting Lab Bench + Video Conferencing matches none
    expect(filterRooms(ROOMS, 1, ["Lab Bench", "Video Conferencing"])).toEqual([]);
  });

  it("zero attendees with no equipment returns all non-blocked rooms", () => {
    const result = filterRooms(ROOMS, 0, []);
    expect(result.length).toBe(ROOMS.filter((r) => !r.blocked).length);
    expect(result.every((r) => !r.blocked)).toBe(true);
  });
});

// Verify each room's own bookings are used independently for overlap checks.
// This ties room-specific booking data to AC5 overlap detection.
describe("room-specific booking conflicts", () => {
  it("library-b has booking [600,660] — a 610-650 window overlaps", () => {
    const lib = ROOMS.find((r) => r.id === "library-b")!;
    expect(lib.existing).toEqual([[600, 660]]);
    // 610-650 is inside 600-660 → overlap
    const overlaps = lib.existing.some(([s, e]) => 610 < e && s < 650);
    expect(overlaps).toBe(true);
  });

  it("eng-lab-104 has bookings [540,600] and [780,840] — a 660-720 window does not overlap", () => {
    const lab = ROOMS.find((r) => r.id === "eng-lab-104")!;
    const overlaps = lab.existing.some(([s, e]) => 660 < e && s < 720);
    expect(overlaps).toBe(false);
  });

  it("conference-a has booking [660,720] — touching at 660 is allowed, 610-660 does not overlap", () => {
    const conf = ROOMS.find((r) => r.id === "conference-a")!;
    const overlaps = conf.existing.some(([s, e]) => 610 < e && s < 660);
    expect(overlaps).toBe(false);
  });

  it("different rooms have independent booking sets", () => {
    const lib = ROOMS.find((r) => r.id === "library-b")!;
    const conf = ROOMS.find((r) => r.id === "conference-a")!;
    expect(lib.existing).not.toEqual(conf.existing);
  });
});
