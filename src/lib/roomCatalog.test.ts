import { describe, expect, it } from "vitest";
import { ROOMS, EQUIPMENT_OPTIONS } from "./roomCatalog";

describe("room catalog data", () => {
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

  it("EQUIPMENT_OPTIONS is the sorted unique set of room equipment", () => {
    const expected = [...new Set(ROOMS.flatMap((r) => r.equipment))].sort();
    expect(EQUIPMENT_OPTIONS).toEqual(expected);
  });

  it("library-b preserves the original fictional fixture values", () => {
    const lib = ROOMS.find((r) => r.id === "library-b");
    expect(lib).toBeDefined();
    expect(lib!.blocked).toBe(false);
    expect(lib!.existing).toEqual([[600, 660]]);
  });
});
