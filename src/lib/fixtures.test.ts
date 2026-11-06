import { describe, expect, it } from "vitest";
import { INITIAL_NOW, INITIAL_BLOCKED, INITIAL_EXISTING } from "./fixtures";

describe("shared fixtures", () => {
  it("exposes the agreed fictional scenario values", () => {
    expect(INITIAL_NOW).toBe(540);
    expect(INITIAL_BLOCKED).toBe(false);
    expect(INITIAL_EXISTING).toEqual([[600, 660]]);
  });

  it("declares exactly one existing booking with ordered integer bounds", () => {
    expect(INITIAL_EXISTING).toHaveLength(1);
    const [s, e] = INITIAL_EXISTING[0];
    expect(Number.isInteger(s)).toBe(true);
    expect(Number.isInteger(e)).toBe(true);
    expect(s).toBeLessThan(e);
  });
});
