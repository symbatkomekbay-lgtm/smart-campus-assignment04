import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterPanel } from "./FilterPanel";
import { EQUIPMENT_OPTIONS } from "@/lib/roomCatalog";

describe("FilterPanel", () => {
  it("renders an input for attendees with the current value", () => {
    render(
      <FilterPanel
        attendees="5"
        selectedEquipment={[]}
        onAttendeesChange={() => {}}
        onToggleEquipment={() => {}}
      />,
    );
    const input = screen.getByLabelText("Attendees") as HTMLInputElement;
    expect(input.value).toBe("5");
  });

  it("renders a toggle button for every equipment option", () => {
    render(
      <FilterPanel
        attendees="1"
        selectedEquipment={[]}
        onAttendeesChange={() => {}}
        onToggleEquipment={() => {}}
      />,
    );
    for (const eq of EQUIPMENT_OPTIONS) {
      expect(screen.getByRole("button", { name: eq })).toBeInTheDocument();
    }
  });

  it("marks selected equipment buttons as pressed", () => {
    render(
      <FilterPanel
        attendees="1"
        selectedEquipment={["Projector"]}
        onAttendeesChange={() => {}}
        onToggleEquipment={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Projector" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Whiteboard" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onAttendeesChange when the input changes", () => {
    const onAttendeesChange = vi.fn();
    render(
      <FilterPanel
        attendees="1"
        selectedEquipment={[]}
        onAttendeesChange={onAttendeesChange}
        onToggleEquipment={() => {}}
      />,
    );
    const input = screen.getByLabelText("Attendees");
    fireEvent.change(input, { target: { value: "10" } });
    expect(onAttendeesChange).toHaveBeenCalledWith("10");
  });

  it("calls onToggleEquipment when an equipment button is clicked", () => {
    const onToggleEquipment = vi.fn();
    render(
      <FilterPanel
        attendees="1"
        selectedEquipment={[]}
        onAttendeesChange={() => {}}
        onToggleEquipment={onToggleEquipment}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Projector" }));
    expect(onToggleEquipment).toHaveBeenCalledWith("Projector");
  });
});
