import { Users, Wrench } from "lucide-react";
import { EQUIPMENT_OPTIONS } from "@/lib/roomCatalog";

interface FilterPanelProps {
  attendees: string;
  selectedEquipment: readonly string[];
  onAttendeesChange: (value: string) => void;
  onToggleEquipment: (eq: string) => void;
}

export function FilterPanel({
  attendees,
  selectedEquipment,
  onAttendeesChange,
  onToggleEquipment,
}: FilterPanelProps) {
  return (
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
          onChange={(e) => onAttendeesChange(e.target.value)}
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
                onClick={() => onToggleEquipment(eq)}
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
  );
}
