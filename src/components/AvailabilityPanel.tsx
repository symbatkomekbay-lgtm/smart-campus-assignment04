import { useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  XCircle,
} from "lucide-react";
import { can_book, formatTime } from "@/lib/booking";
import type { Room } from "@/lib/rooms";

interface AvailabilityPanelProps {
  room: Room;
  now: number;
}

function TimeInput({
  id,
  label,
  value,
  onChange,
  preview,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  preview: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={0}
        max={1440}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
      />
      <p className="text-xs text-slate-400">{preview}</p>
    </div>
  );
}

export function AvailabilityPanel({ room, now }: AvailabilityPanelProps) {
  const [start, setStart] = useState("660");
  const [end, setEnd] = useState("720");
  const [blocked, setBlocked] = useState(room.blocked);
  const [result, setResult] = useState<{ available: boolean; reason?: string } | null>(null);

  const startNum = Number(start);
  const endNum = Number(end);
  const duration =
    Number.isInteger(startNum) && Number.isInteger(endNum) && endNum > startNum
      ? endNum - startNum
      : null;

  function handleCheck() {
    setResult(can_book(startNum, endNum, now, blocked, room.existing));
  }

  function handleReset() {
    setStart("660");
    setEnd("720");
    setBlocked(room.blocked);
    setResult(null);
  }

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
            Current time: <span className="font-semibold text-slate-800">{formatTime(now)}</span>
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
        <TimeInput
          id="start"
          label="Start time (min)"
          value={start}
          onChange={setStart}
          preview={formatTime(startNum)}
        />
        <TimeInput
          id="end"
          label="End time (min)"
          value={end}
          onChange={setEnd}
          preview={formatTime(endNum)}
        />
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
