import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./App";

describe("App integration", () => {
  it("renders the header and filter panel on load", () => {
    render(<App />);
    expect(screen.getByText("Room Availability Checker")).toBeInTheDocument();
    expect(screen.getByLabelText("Attendees")).toBeInTheDocument();
  });

  it("shows matching rooms with default filters (1 attendee, no equipment)", () => {
    render(<App />);
    // 4 non-blocked rooms match with attendees=1, no equipment
    expect(screen.getByText(/Matching rooms \(4\)/)).toBeInTheDocument();
    expect(screen.getByText("Library Study Room B")).toBeInTheDocument();
    expect(screen.getByText("Engineering Lab 104")).toBeInTheDocument();
    expect(screen.getByText("Conference Room A")).toBeInTheDocument();
    expect(screen.getByText("Seminar Room 301")).toBeInTheDocument();
    // blocked room is not shown
    expect(screen.queryByText("Quiet Pod 2")).not.toBeInTheDocument();
  });

  it("filters by attendee count: raising to 12 narrows results", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Attendees"), { target: { value: "12" } });
    // only eng-lab-104 (12) and conference-a (20) qualify, quiet-pod-2 is blocked anyway
    expect(screen.getByText(/Matching rooms \(2\)/)).toBeInTheDocument();
    expect(screen.getByText("Engineering Lab 104")).toBeInTheDocument();
    expect(screen.getByText("Conference Room A")).toBeInTheDocument();
    expect(screen.queryByText("Library Study Room B")).not.toBeInTheDocument();
  });

  it("filters by equipment: selecting Lab Bench narrows to Engineering Lab 104", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Lab Bench" }));
    expect(screen.getByText(/Matching rooms \(1\)/)).toBeInTheDocument();
    expect(screen.getByText("Engineering Lab 104")).toBeInTheDocument();
    expect(screen.queryByText("Library Study Room B")).not.toBeInTheDocument();
  });

  it("shows empty-state message when no rooms match", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Attendees"), { target: { value: "999" } });
    expect(screen.getByText("No rooms match your requirements.")).toBeInTheDocument();
  });

  it("selecting a room shows the availability panel; switching rooms clears the prior result", () => {
    render(<App />);
    // Select Library Study Room B via its room card button
    const libCard = screen.getAllByText("Library Study Room B")[0].closest("button")!;
    fireEvent.click(libCard);
    // Check availability with defaults (660-720)
    fireEvent.click(screen.getByRole("button", { name: /Check Availability/i }));
    expect(screen.getByText("Room is available")).toBeInTheDocument();

    // Now select Conference Room A — the key on AvailabilityPanel changes,
    // which remounts the component and clears the result.
    const confCard = screen.getAllByText("Conference Room A")[0].closest("button")!;
    fireEvent.click(confCard);
    expect(screen.queryByText("Room is available")).not.toBeInTheDocument();
  });

  it("changing filters to exclude the selected room clears the availability panel", async () => {
    render(<App />);
    // Select Library Study Room B (capacity 6)
    fireEvent.click(screen.getByText("Library Study Room B"));
    expect(screen.getByRole("button", { name: /Check Availability/i })).toBeInTheDocument();

    // Raise attendees to 12 — Library Study Room B (cap 6) no longer matches
    fireEvent.change(screen.getByLabelText("Attendees"), { target: { value: "12" } });
    // The availability panel should be gone because the selection was cleared
    expect(screen.queryByRole("button", { name: /Check Availability/i })).not.toBeInTheDocument();
  });
});
