import { Award, Calendar, Users, Wallet, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/insights/kpi-card";
import { cn } from "@/lib/utils";
import { getAccount } from "@/lib/account";
import type { Program } from "@/lib/programs-data";

function formatK(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return n.toString();
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function DashboardOverview({
  program,
  variant = "mobile",
}: {
  program: Program;
  variant?: "mobile" | "web";
}) {
  const currency = getAccount()?.currency || "₹";
  const usedPct =
    program.budgetAllocated > 0
      ? Math.min(100, Math.round((program.budgetUsed / program.budgetAllocated) * 100))
      : 0;

  return (
    <div className={cn("space-y-4", variant === "web" && "pt-3")}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Nominations"
          value={program.nominations.toLocaleString()}
          delta={program.nominationsDelta}
          Icon={Award}
          tone="amber"
        />
        <KpiCard
          label="Participants"
          value={`${program.participantsRate ?? 0}%`}
          delta={program.participantsDelta}
          Icon={Users}
          tone="rose"
        />
        <KpiCard
          label="Budget used"
          value={`${currency}${formatK(program.budgetUsed)}`}
          Icon={Wallet}
          tone="emerald"
        />
        <KpiCard
          label="Remaining"
          value={`${program.daysLeft} days`}
          Icon={Calendar}
          tone="stone"
        />
      </div>

      <section className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
        <header className="mb-3">
          <h3 className="font-mobile font-semibold text-stone-900">Budget Progress</h3>
        </header>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <p className="text-sm text-stone-900">
            <span className="font-mobile font-semibold">
              {currency}
              {program.budgetUsed.toLocaleString()}
            </span>
            <span className="text-stone-500">
              {" "}
              of {currency}
              {program.budgetAllocated.toLocaleString()}
            </span>
          </p>
          <span className="text-sm font-mobile font-semibold text-stone-700 tabular-nums">
            {usedPct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-700"
            style={{ width: `${usedPct}%` }}
          />
        </div>
        {program.prizes && program.prizes.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {program.prizes.map((p) => (
              <div
                key={p.rank}
                className={cn(
                  "rounded-xl p-3",
                  p.rank === 1
                    ? "bg-emerald-50 border border-emerald-100"
                    : "bg-stone-50 border border-stone-100",
                )}
              >
                <p className="font-mobile text-base font-semibold text-stone-900">
                  {currency}
                  {formatK(p.amount)}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{ordinal(p.rank)} prize</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {program.programLeaderboard && program.programLeaderboard.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
          <header className="flex items-center justify-between mb-3">
            <h3 className="font-mobile font-semibold text-stone-900">Leaderboard</h3>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </header>
          <ul className="divide-y divide-stone-100">
            {program.programLeaderboard.map((row) => (
              <li key={row.rank} className="flex items-center gap-3 py-2.5">
                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-mobile font-semibold flex items-center justify-center shrink-0">
                  {row.rank}
                </span>
                <img
                  src={row.avatar}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mobile font-semibold text-stone-900 truncate">
                    {row.name}
                  </p>
                  <p className="text-xs text-stone-500 truncate">{row.role}</p>
                </div>
                <p className="font-mobile font-semibold text-stone-900 shrink-0 tabular-nums">
                  {row.points}{" "}
                  <span className="text-xs font-normal text-stone-500">pts</span>
                </p>
              </li>
            ))}
          </ul>
          <button className="text-xs text-stone-500 hover:text-stone-900 mt-1">View all</button>
        </section>
      )}

      {program.attentionItems && program.attentionItems.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
          <h3 className="font-mobile font-semibold text-stone-900 mb-2">Needs Attention</h3>
          <ul className="space-y-3">
            {program.attentionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 w-2 h-2 rounded-full shrink-0",
                    item.severity === "high"
                      ? "bg-rose-600"
                      : item.severity === "medium"
                        ? "bg-amber-500"
                        : "bg-stone-300",
                  )}
                />
                <div>
                  <p className="text-sm font-mobile font-semibold text-stone-900 leading-snug">
                    {item.title}
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
