import { BADGE_IMAGE } from "@/lib/mobile-data";
import type { BadgeStat } from "@/lib/insights-data";

export function BadgeBars({ stats }: { stats: BadgeStat[] }) {
  const max = Math.max(...stats.map((s) => s.count), 1);
  return (
    <div className="bg-white rounded-2xl border border-border p-4 md:p-5">
      <header className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Top badges</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Most-given this period</p>
      </header>
      <ul className="space-y-3">
        {stats.map((s) => (
          <li key={s.badge} className="flex items-center gap-3">
            <img src={BADGE_IMAGE[s.badge]} alt="" className="w-9 h-9 object-contain shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-foreground truncate">{s.label}</p>
                <span className="text-xs font-semibold text-muted-foreground tabular-nums shrink-0">
                  {s.count}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
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
