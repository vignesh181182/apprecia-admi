import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, Crown, ArrowRight } from "lucide-react";
import { EmployeeLayout } from "@/components/employee-layout";
import { cn } from "@/lib/utils";
import { getAccount } from "@/lib/account";
import {
  getActivePrograms,
  getPastPrograms,
  type Program,
  type PastProgram,
} from "@/lib/programs-data";

type Tab = "active" | "past";

export default function MobilePrograms() {
  const [tab, setTab] = useState<Tab>("active");
  const active = getActivePrograms();
  const past = getPastPrograms();

  return (
    <EmployeeLayout title="Programs" showRightRail={false}>
      <div className="px-5 md:px-0 pt-3 md:pt-0 pb-6 space-y-4">
        <div className="inline-flex bg-stone-100 rounded-full p-1 gap-1">
          <TabBtn active={tab === "active"} onClick={() => setTab("active")}>
            Active <Count count={active.length} active={tab === "active"} />
          </TabBtn>
          <TabBtn active={tab === "past"} onClick={() => setTab("past")}>
            Past <Count count={past.length} active={tab === "past"} />
          </TabBtn>
        </div>

        {tab === "active" ? <ActiveList programs={active} /> : <PastList programs={past} />}
      </div>
    </EmployeeLayout>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 px-5 rounded-full text-sm font-mobile font-semibold transition-colors inline-flex items-center gap-1.5",
        active ? "bg-[#a87a3a] text-white shadow-sm" : "text-stone-600 hover:text-stone-900",
      )}
    >
      {children}
    </button>
  );
}

function Count({ count, active }: { count: number; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold",
        active ? "bg-white/20 text-white" : "bg-stone-200 text-stone-600",
      )}
    >
      {count}
    </span>
  );
}

function ActiveList({ programs }: { programs: Program[] }) {
  if (programs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
        <p className="text-sm text-stone-600">No active programs right now.</p>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {programs.map((p) => (
        <li key={p.id}>
          <ActiveProgramCard program={p} />
        </li>
      ))}
    </ul>
  );
}

function ActiveProgramCard({ program }: { program: Program }) {
  const account = getAccount();
  const currency = account?.currency || "₹";
  const usedPct = Math.min(100, Math.round((program.budgetUsed / program.budgetAllocated) * 100));
  const urgency = program.daysLeft <= 2 ? "high" : program.daysLeft <= 5 ? "medium" : "low";

  return (
    <Link
      to={`/m/programs/${program.id}`}
      className="block rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-colors h-full bg-white"
    >
      <div className="px-4 pt-4 pb-3" style={{ background: program.themeBg }}>
        <div className="flex items-start gap-3">
          <span className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center text-2xl shrink-0">
            {program.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mobile font-semibold text-stone-900 leading-tight">{program.name}</p>
            <p className="text-xs text-stone-700 mt-1 leading-snug line-clamp-2">{program.shortDesc}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-600 gap-2">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span
              className={cn(
                "font-mobile font-semibold",
                urgency === "high" ? "text-rose-700" : urgency === "medium" ? "text-amber-700" : "text-stone-900",
              )}
            >
              {program.daysLeft}
            </span>{" "}
            days left
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            {program.nominations} nominations
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500">{usedPct}% budget used</span>
            <span className="text-stone-500">
              {currency}
              {program.budgetAllocated.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-700"
              style={{ width: `${usedPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-stone-500">
            {program.status === "ending-soon" ? "Ending soon" : "Active"}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-mobile font-semibold text-[#a87a3a]">
            View <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PastList({ programs }: { programs: PastProgram[] }) {
  if (programs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
        <p className="text-sm text-stone-600">No past programs yet.</p>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {programs.map((p) => (
        <li key={p.id}>
          <PastProgramCard program={p} />
        </li>
      ))}
    </ul>
  );
}

function PastProgramCard({ program }: { program: PastProgram }) {
  const account = getAccount();
  const currency = account?.currency || "₹";

  return (
    <Link
      to={`/m/programs/${program.id}`}
      className="block rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-colors h-full bg-white"
    >
      <div className="px-4 pt-4 pb-3" style={{ background: program.themeBg, opacity: 0.85 }}>
        <div className="flex items-start gap-3">
          <span className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center text-2xl shrink-0">
            {program.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mobile font-semibold text-stone-900 leading-tight truncate">
              {program.name}
            </p>
            <p className="text-xs text-stone-700 mt-1">
              Ended{" "}
              {new Date(program.endedOn).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-3 bg-amber-50/60 border border-amber-100 rounded-xl px-3 py-2">
          <span className="relative shrink-0">
            <img src={program.finalWinner.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
            <Crown className="absolute -top-2 -right-1 w-3.5 h-3.5 text-amber-600 fill-amber-300" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-amber-700 font-mobile font-semibold uppercase tracking-wide">
              Winner
            </p>
            <p className="text-sm font-mobile font-semibold text-stone-900 truncate">
              {program.finalWinner.name}
            </p>
            <p className="text-xs text-stone-500 truncate">{program.finalWinner.role}</p>
          </div>
          <span className="text-xs font-mobile font-semibold text-amber-800 shrink-0">
            {currency}
            {(program.finalWinner.amount / 1000).toFixed(0)}k
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {program.nominations} nominations
          </span>
          <span className="inline-flex items-center gap-1 font-mobile font-semibold text-[#a87a3a]">
            View results <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
