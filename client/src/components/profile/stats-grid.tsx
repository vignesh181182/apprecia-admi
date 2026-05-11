import { Heart, Send, TrendingUp, Sparkles } from "lucide-react";

export type ProfileStat = {
  label: string;
  value: number | string;
  hint?: string;
  Icon: React.FC<{ className?: string }>;
  tone?: "amber" | "rose" | "emerald" | "stone";
};

const TONE = {
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  stone: "bg-stone-50 text-stone-700 border-stone-100",
};

export function StatsGrid({ stats }: { stats: ProfileStat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl border border-stone-200 p-4">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center border ${TONE[s.tone ?? "stone"]}`}>
            <s.Icon className="w-4 h-4" />
          </div>
          <p className="mt-3 font-mobile text-2xl font-semibold text-stone-900 leading-none">
            {s.value}
          </p>
          <p className="mt-1 text-xs font-medium text-stone-700">{s.label}</p>
          {s.hint && <p className="text-xs text-stone-400 mt-0.5">{s.hint}</p>}
        </div>
      ))}
    </div>
  );
}

export const ICONS = {
  Received: Heart,
  Given: Send,
  Rank: TrendingUp,
  Points: Sparkles,
};
