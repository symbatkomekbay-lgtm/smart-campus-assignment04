import type { Booking } from "./booking";

export interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  existing: Booking[];
}

// Re-export catalog data so callers can import data + logic from one module
// while the catalog itself stays in a data-only file.
export { ROOMS, EQUIPMENT_OPTIONS } from "./roomCatalog";

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
