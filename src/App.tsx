import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  Search,
  Unlock,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";
import { can_book, formatTime } from "@/lib/booking";
import { INITIAL_NOW } from "@/lib/fixtures";
import { EQUIPMENT_OPTIONS, ROOMS, filterRooms, type Room } from "@/lib/rooms";

const NOW = INITIAL_NOW;

function AvailabilityPanel({ room }: { room: Room }) {
  const [start, setStart] = useState("660");
  const [end, setEnd] = useState("720");
  const [blocked, setBlocked] = useState(room.blocked);
  const [result, setResult] = useState<{ available: boolean; reason?: string } | null>(null);

  function handleCheck() {
    const s = Number(start);
    const e = Number(end);
    setResult(can_book(s, e, NOW, blocked, room.existing));
  }

  function handleReset() {
    setStart("660");
    setEnd("720");
    setBlocked(room.blocked);
    setResult(null);
  }

  const startNum = Number(start);
  const endNum = Number(end);
  const duration =
    Number.isInteger(startNum) && Number.isInteger(endNum) && endNum > startNum
      ? endNum - startNum
      : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 space-y-6">
      <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-1.5">
        <div className="flex items-center gap-2 text-slate-600">
          <CalendarCheck className="w-4 h-4 text-sky-500" />
          <span className="font-semibold text-slate-800">{room.name}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>
            Current time: <span className="font-semibold text-slate-800">{formatTime(NOW)}</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
          <span>Existing bookings:</span>
          {room.existing.length === 0 ? (
            <span className="text-slate-400">None</span>
          ) : (
            room.existing.map((b, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-md bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-medium"
              >
                {formatTime(b[0])} – {formatTime(b[1])}
              </span>
            ))
          )}
        </div>
      </div>

      <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
          {blocked ? (
            <Lock className="w-4 h-4 text-rose-500" />
          ) : (
            <Unlock className="w-4 h-4 text-emerald-500" />
          )}
          Room is blocked
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={blocked}
          onClick={() => setBlocked((b) => !b)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
            blocked ? "bg-rose-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 mt-0.5 ${
              blocked ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="start" className="block text-sm font-medium text-slate-700">
            Start time (min)
          </label>
          <input
            id="start"
            type="number"
            min={0}
            max={1440}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
          />
          <p className="text-xs text-slate-400">{formatTime(startNum)}</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="end" className="block text-sm font-medium text-slate-700">
            End time (min)
          </label>
          <input
            id="end"
            type="number"
            min={0}
            max={1440}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
          />
          <p className="text-xs text-slate-400">{formatTime(endNum)}</p>
        </div>
      </div>

      {duration !== null && (
        <p className="text-xs text-slate-500 -mt-2">
          Duration: <span className="font-medium text-slate-700">{duration} min</span>
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCheck}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:bg-sky-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <CalendarCheck className="w-4 h-4" />
          Check Availability
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          Reset
        </button>
      </div>

      {result && (
        <div
          className={`flex items-start gap-3 rounded-xl p-4 text-sm transition ${
            result.available ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"
          }`}
        >
          {result.available ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">
              {result.available ? "Room is available" : "Room is unavailable"}
            </p>
            {result.reason && <p className="mt-0.5 text-sm">{result.reason}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

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

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 space-y-5 mb-6">
          <div className="space-y-1.5">
            <label
              htmlFor="attendees"
              className="flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <Users className="w-4 h-4 text-slate-400" /> Attendees
            </label>
            <input
              id="attendees"
              type="number"
              min={0}
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Wrench className="w-4 h-4 text-slate-400" /> Required equipment
            </span>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((eq) => {
                const active = selectedEquipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquipment(eq)}
                    aria-pressed={active}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                      active
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">
            <Search className="w-4 h-4" /> Matching rooms ({filteredRooms.length})
          </h2>

          {filteredRooms.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 text-center">
              <p className="text-sm text-slate-500">No rooms match your requirements.</p>
              <p className="mt-1 text-xs text-slate-400">
                Try lowering the attendee count or removing equipment filters.
              </p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const selected = room.id === selectedRoomId;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setSelectedRoomId(room.id)}
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

        {selectedRoom && <AvailabilityPanel key={selectedRoom.id} room={selectedRoom} />}

        <p className="mt-6 text-center text-xs text-slate-400">
          Times are minutes since midnight (0–1440). Fictional data — no real booking is made.
        </p>
      </div>
    </div>
  );
}

export default App;
