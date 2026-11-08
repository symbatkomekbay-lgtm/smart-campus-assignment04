import { useEffect, useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { INITIAL_NOW } from "@/lib/fixtures";
import { ROOMS } from "@/lib/roomCatalog";
import { filterRooms } from "@/lib/rooms";
import { FilterPanel } from "@/components/FilterPanel";
import { RoomList } from "@/components/RoomList";
import { AvailabilityPanel } from "@/components/AvailabilityPanel";

const NOW = INITIAL_NOW;

function App() {
  const [attendees, setAttendees] = useState("1");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const attendeeCount = Math.max(0, Math.floor(Number(attendees) || 0));
  const filteredRooms = useMemo(
    () => filterRooms(ROOMS, attendeeCount, selectedEquipment),
    [attendeeCount, selectedEquipment],
  );

  // If the selected room no longer matches the filters, clear the selection.
  useEffect(() => {
    if (selectedRoomId && !filteredRooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(null);
    }
  }, [filteredRooms, selectedRoomId]);

  const selectedRoom = selectedRoomId
    ? (ROOMS.find((r) => r.id === selectedRoomId) ?? null)
    : null;

  function toggleEquipment(eq: string) {
    setSelectedEquipment((prev) =>
      prev.includes(eq) ? prev.filter((x) => x !== eq) : [...prev, eq],
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200 mb-4">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Room Availability Checker</h1>
          <p className="mt-2 text-slate-500 text-sm">Smart Campus — find a room that fits your needs.</p>
        </header>

        <FilterPanel
          attendees={attendees}
          selectedEquipment={selectedEquipment}
          onAttendeesChange={setAttendees}
          onToggleEquipment={toggleEquipment}
        />

        <RoomList
          rooms={filteredRooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
        />

        {selectedRoom && (
          <AvailabilityPanel key={selectedRoom.id} room={selectedRoom} now={NOW} />
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          Times are minutes since midnight (0–1440). Fictional data — no real booking is made.
        </p>
      </div>
    </div>
  );
}

export default App;
