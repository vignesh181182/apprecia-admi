import { BADGE_IMAGE } from "@/lib/mobile-data";
import type { BadgeStat } from "@/lib/insights-data";

export function BadgeBars({ stats }: { stats: BadgeStat[] }) {
  const max = Math.max(...stats.map((s) => s.count), 1);
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
      <header className="mb-3">
        <h3 className="text-sm font-semibold text-stone-900">Top badges</h3>
        <p className="text-xs text-stone-500 mt-0.5">Most-given this period</p>
      </header>
      <ul className="space-y-3">
        {stats.map((s) => (
          <li key={s.badge} className="flex items-center gap-3">
            <img src={BADGE_IMAGE[s.badge]} alt="" className="w-9 h-9 object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-stone-900 truncate">{s.label}</p>
                <span className="text-xs font-semibold text-stone-700 tabular-nums shrink-0">
                  {s.count}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-700 rounded-full"
                  style={{ width: `${(s.count / max) * 100}%` }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
