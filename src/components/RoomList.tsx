import { CheckCircle2, Search, Users } from "lucide-react";
import type { Room } from "@/lib/rooms";

interface RoomListProps {
  rooms: readonly Room[];
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
}

export function RoomList({ rooms, selectedRoomId, onSelectRoom }: RoomListProps) {
  return (
    <div className="space-y-3 mb-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">
        <Search className="w-4 h-4" /> Matching rooms ({rooms.length})
      </h2>

      {rooms.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 text-center">
          <p className="text-sm text-slate-500">No rooms match your requirements.</p>
          <p className="mt-1 text-xs text-slate-400">
            Try lowering the attendee count or removing equipment filters.
          </p>
        </div>
      ) : (
        rooms.map((room) => {
          const selected = room.id === selectedRoomId;
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onSelectRoom(room.id)}
              aria-pressed={selected}
              className={`w-full text-left rounded-2xl p-4 ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                selected
                  ? "bg-sky-50 ring-sky-400"
                  : "bg-white ring-slate-200 hover:ring-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">{room.name}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {room.capacity} people
                  </p>
                </div>
                {selected && <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {room.equipment.map((eq) => (
                  <span
                    key={eq}
                    className="inline-flex items-center rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-medium"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
