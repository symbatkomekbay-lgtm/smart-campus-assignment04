import type { Booking } from "./booking";
import { INITIAL_BLOCKED, INITIAL_EXISTING } from "./fixtures";

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  existing: Booking[];
}

export const ROOMS: readonly Room[] = [
  {
    id: "library-b",
    name: "Library Study Room B",
    capacity: 6,
    equipment: ["Projector", "Whiteboard"],
    blocked: INITIAL_BLOCKED,
    existing: INITIAL_EXISTING,
  },
  {
    id: "eng-lab-104",
    name: "Engineering Lab 104",
    capacity: 12,
    equipment: ["Projector", "Whiteboard", "Lab Bench"],
    blocked: false,
    existing: [
      [540, 600],
      [780, 840],
    ],
  },
  {
    id: "conference-a",
    name: "Conference Room A",
    capacity: 20,
    equipment: ["Projector", "Video Conferencing", "Whiteboard"],
    blocked: false,
    existing: [[660, 720]],
  },
  {
    id: "quiet-pod-2",
    name: "Quiet Pod 2",
    capacity: 2,
    equipment: ["Whiteboard"],
    blocked: true,
    existing: [[600, 660]],
  },
  {
    id: "seminar-301",
    name: "Seminar Room 301",
    capacity: 8,
    equipment: ["Projector", "Video Conferencing"],
    blocked: false,
    existing: [[700, 760]],
  },
];

export const EQUIPMENT_OPTIONS: readonly string[] = [
  ...new Set(ROOMS.flatMap((r) => r.equipment)),
].sort();

/**
 * A room matches when it is not blocked, has capacity >= attendees, and
 * contains ALL of the required equipment. Blocked rooms never match.
 */
export function matchesFilters(
  room: Room,
  attendees: number,
  requiredEquipment: readonly string[],
): boolean {
  if (room.blocked) return false;
  if (room.capacity < attendees) return false;
  return requiredEquipment.every((eq) => room.equipment.includes(eq));
}

export function filterRooms(
  rooms: readonly Room[],
  attendees: number,
  requiredEquipment: readonly string[],
): Room[] {
  return rooms.filter((r) => matchesFilters(r, attendees, requiredEquipment));
}
