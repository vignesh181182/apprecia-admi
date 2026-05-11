import { cn } from "@/lib/utils";
import { type Period, PERIOD_LABEL } from "@/lib/insights-data";

const ORDER: Period[] = ["week", "month", "quarter", "year"];

export function PeriodPicker({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="inline-flex bg-stone-100 rounded-full p-1">
      {ORDER.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "h-8 px-3 rounded-full text-xs font-mobile font-semibold transition-colors",
            value === p ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700",
          )}
        >
          {PERIOD_LABEL[p]}
        </button>
      ))}
    </div>
  );
}
