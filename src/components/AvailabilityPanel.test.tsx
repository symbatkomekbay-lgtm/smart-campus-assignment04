import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AvailabilityPanel } from "./AvailabilityPanel";
import type { Room } from "@/lib/rooms";

const baseRoom: Room = {
  id: "test-room",
  name: "Test Room",
  capacity: 10,
  equipment: ["Projector"],
  blocked: false,
  existing: [[600, 660]],
};

describe("AvailabilityPanel", () => {
  it("displays the room name and existing bookings", () => {
    render(<AvailabilityPanel room={baseRoom} now={540} />);
    expect(screen.getByText("Test Room")).toBeInTheDocument();
    // existing booking 600-660 → 10:00 AM – 11:00 AM
    expect(screen.getByText(/10:00 AM – 11:00 AM/)).toBeInTheDocument();
  });

  it("shows current time formatted from now", () => {
    render(<AvailabilityPanel room={baseRoom} now={540} />);
    expect(screen.getByText(/9:00 AM/)).toBeInTheDocument();
  });

  it("reports available for a valid non-overlapping future window", () => {
    render(<AvailabilityPanel room={baseRoom} now={540} />);
    // defaults: start 660, end 720 → after now(540), no overlap with 600-660
    fireEvent.click(screen.getByRole("button", { name: /Check Availability/i }));
    expect(screen.getByText("Room is available")).toBeInTheDocument();
  });

  it("reports unavailable for a window overlapping the room's own booking", () => {
    render(<AvailabilityPanel room={baseRoom} now={540} />);
    // set start 610, end 650 → inside existing 600-660
    fireEvent.change(screen.getByLabelText("Start time (min)"), { target: { value: "610" } });
    fireEvent.change(screen.getByLabelText("End time (min)"), { target: { value: "650" } });
    fireEvent.click(screen.getByRole("button", { name: /Check Availability/i }));
    expect(screen.getByText("Room is unavailable")).toBeInTheDocument();
    expect(screen.getByText(/Overlaps/i)).toBeInTheDocument();
  });

  it("respects the blocked toggle: blocking makes the room unavailable", () => {
    render(<AvailabilityPanel room={baseRoom} now={540} />);
    // turn on blocked
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: /Check Availability/i }));
    expect(screen.getByText("Room is unavailable")).toBeInTheDocument();
    expect(screen.getByText("This room is blocked and cannot be booked.")).toBeInTheDocument();
  });

  it("rejects a past start time (AC2)", () => {
    render(<AvailabilityPanel room={baseRoom} now={540} />);
    fireEvent.change(screen.getByLabelText("Start time (min)"), { target: { value: "400" } });
    fireEvent.change(screen.getByLabelText("End time (min)"), { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: /Check Availability/i }));
    expect(screen.getByText("Room is unavailable")).toBeInTheDocument();
    expect(screen.getByText(/future/i)).toBeInTheDocument();
  });

  it("rejects a 121-minute duration (AC3)", () => {
    render(<AvailabilityPanel room={baseRoom} now={540} />);
    // 661 to 782 = 121 min
    fireEvent.change(screen.getByLabelText("Start time (min)"), { target: { value: "661" } });
    fireEvent.change(screen.getByLabelText("End time (min)"), { target: { value: "782" } });
    fireEvent.click(screen.getByRole("button", { name: /Check Availability/i }));
    expect(screen.getByText("Room is unavailable")).toBeInTheDocument();
    expect(screen.getByText(/120/i)).toBeInTheDocument();
  });

  it("clears the result on reset", () => {
    render(<AvailabilityPanel room={baseRoom} now={540} />);
    fireEvent.click(screen.getByRole("button", { name: /Check Availability/i }));
    expect(screen.getByText("Room is available")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
    expect(screen.queryByText("Room is available")).not.toBeInTheDocument();
    expect(screen.queryByText("Room is unavailable")).not.toBeInTheDocument();
  });

  it("uses only the passed room's bookings, not another room's", () => {
    const roomWithDifferentBooking: Room = {
      ...baseRoom,
      id: "other-room",
      existing: [[700, 760]],
    };
    render(<AvailabilityPanel room={roomWithDifferentBooking} now={540} />);
    // 660-720 should overlap 700-760 for this room
    fireEvent.change(screen.getByLabelText("Start time (min)"), { target: { value: "660" } });
    fireEvent.change(screen.getByLabelText("End time (min)"), { target: { value: "720" } });
    fireEvent.click(screen.getByRole("button", { name: /Check Availability/i }));
    expect(screen.getByText("Room is unavailable")).toBeInTheDocument();
    expect(screen.getByText(/Overlaps/i)).toBeInTheDocument();
  });
});
