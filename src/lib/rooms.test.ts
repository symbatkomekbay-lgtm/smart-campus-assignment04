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
});
