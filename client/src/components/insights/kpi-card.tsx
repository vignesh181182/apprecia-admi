import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number | string;
  delta?: number;
  hint?: string;
  Icon: React.FC<{ className?: string }>;
  tone?: "amber" | "emerald" | "rose" | "stone";
};

const TONE = {
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  stone: "bg-stone-50 text-stone-700 border-stone-100",
};

export function KpiCard({ label, value, delta, hint, Icon, tone = "stone" }: Props) {
  const positive = (delta ?? 0) >= 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-9 h-9 rounded-full border flex items-center justify-center", TONE[tone])}>
          <Icon className="w-4 h-4" />
        </div>
        {delta != null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
              positive
                ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                : "text-rose-700 bg-rose-50 border-rose-100",
            )}
          >
            {positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="font-mobile text-2xl md:text-3xl font-semibold text-stone-900 leading-none">
        {value}
      </p>
      <p className="mt-1.5 text-sm font-medium text-stone-700">{label}</p>
      {hint && <p className="text-xs text-stone-400 mt-0.5">{hint}</p>}
    </div>
  );
}
