import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RoomList } from "./RoomList";
import type { Room } from "@/lib/rooms";

const rooms: Room[] = [
  {
    id: "room-a",
    name: "Room A",
    capacity: 6,
    equipment: ["Projector"],
    blocked: false,
    existing: [[600, 660]],
  },
  {
    id: "room-b",
    name: "Room B",
    capacity: 12,
    equipment: ["Whiteboard"],
    blocked: false,
    existing: [],
  },
];

describe("RoomList", () => {
  it("renders a button for each room with name and capacity", () => {
    render(
      <RoomList rooms={rooms} selectedRoomId={null} onSelectRoom={() => {}} />,
    );
    expect(screen.getByText("Room A")).toBeInTheDocument();
    expect(screen.getByText("Room B")).toBeInTheDocument();
    expect(screen.getByText(/6 people/)).toBeInTheDocument();
    expect(screen.getByText(/12 people/)).toBeInTheDocument();
  });

  it("shows the matching room count in the heading", () => {
    render(
      <RoomList rooms={rooms} selectedRoomId={null} onSelectRoom={() => {}} />,
    );
    expect(screen.getByText(/Matching rooms \(2\)/)).toBeInTheDocument();
  });

  it("renders equipment tags for each room", () => {
    render(
      <RoomList rooms={rooms} selectedRoomId={null} onSelectRoom={() => {}} />,
    );
    expect(screen.getByText("Projector")).toBeInTheDocument();
    expect(screen.getByText("Whiteboard")).toBeInTheDocument();
  });

  it("shows the empty-state message when no rooms match", () => {
    render(
      <RoomList rooms={[]} selectedRoomId={null} onSelectRoom={() => {}} />,
    );
    expect(screen.getByText("No rooms match your requirements.")).toBeInTheDocument();
  });

  it("calls onSelectRoom with the room id when a card is clicked", () => {
    const onSelectRoom = vi.fn();
    render(
      <RoomList rooms={rooms} selectedRoomId={null} onSelectRoom={onSelectRoom} />,
    );
    fireEvent.click(screen.getByText("Room A"));
    expect(onSelectRoom).toHaveBeenCalledWith("room-a");
  });

  it("marks the selected room as pressed and shows a check icon", () => {
    render(
      <RoomList rooms={rooms} selectedRoomId="room-b" onSelectRoom={() => {}} />,
    );
    const cardB = screen.getByText("Room B").closest("button");
    expect(cardB).toHaveAttribute("aria-pressed", "true");
    const cardA = screen.getByText("Room A").closest("button");
    expect(cardA).toHaveAttribute("aria-pressed", "false");
  });
});
