import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { POINTS_PRESETS } from "@/lib/recognize-data";

export function PointsPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-sm font-mobile font-semibold text-stone-900 mb-2">Points</p>
      <div className="flex flex-wrap gap-2">
        {POINTS_PRESETS.map((preset) => {
          const selected = preset === value;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-mobile font-semibold transition-colors border",
                selected
                  ? "bg-[#a87a3a] text-white border-[#a87a3a]"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300",
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {preset.toLocaleString()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
