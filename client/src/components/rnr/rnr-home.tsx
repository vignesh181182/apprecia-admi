import { Link } from "react-router-dom";
import { Calendar, Users, ArrowRight, Trophy, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccount } from "@/lib/account";
import { getActivePrograms, getEndingSoon, type Program } from "@/lib/programs-data";
import { TOP_WINNERS } from "@/lib/rnr-insights-data";

export function RnRHome() {
  const account = getAccount();
  const firstName = account?.adminName?.split(" ")[0] || "there";
  const active = getActivePrograms();
  const featuredActive = active.slice(0, 6);
  const endingSoon = getEndingSoon();

  return (
    <div className="px-5 md:px-0 pt-3 md:pt-0 pb-6 space-y-5 md:space-y-6">
      <header>
        <h1 className="font-mobile text-2xl md:text-3xl font-semibold text-stone-900 leading-tight">
          Hey {firstName} 👋
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          {active.length} active programs ready for your nomination.
        </p>
      </header>

      {endingSoon.length > 0 && (
        <section>
          <header className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-mobile font-semibold text-stone-900">Ending soon</h2>
              <p className="text-xs text-stone-500 mt-0.5">Don't miss the deadline.</p>
            </div>
          </header>
          <div className="space-y-3">
            {endingSoon.map((p) => (
              <EndingSoonCard key={p.id} program={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <header className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-mobile font-semibold text-stone-900">Active programs</h2>
            <p className="text-xs text-stone-500 mt-0.5">Tap to learn more or nominate.</p>
          </div>
          <Link to="/m/programs" className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-0.5">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredActive.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
      </section>

      <section>
        <header className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-mobile font-semibold text-stone-900">Recent winners</h2>
            <p className="text-xs text-stone-500 mt-0.5">People crushing it across programs.</p>
          </div>
        </header>
        <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-3">
            {TOP_WINNERS.map((w) => (
              <li
                key={w.id}
                className="shrink-0 w-36 bg-amber-50/50 border border-stone-100 rounded-2xl p-3 flex flex-col items-center text-center"
              >
                <img src={w.avatar} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <p className="mt-2.5 text-sm font-mobile font-semibold text-[#a87a3a] leading-tight truncate w-full">
                  {w.name}
                </p>
                <p className="text-xs text-stone-600 truncate w-full mt-0.5">{w.role}</p>
                <p className="text-[11px] text-stone-500 truncate w-full mt-1">{w.programName}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function EndingSoonCard({ program }: { program: Program }) {
  const urgency = program.daysLeft <= 2 ? "high" : program.daysLeft <= 5 ? "medium" : "low";
  return (
    <Link
      to={`/m/programs/${program.id}`}
      className="block rounded-2xl border border-stone-200 bg-white p-4 hover:border-stone-300 transition-colors"
    >
      <div className="flex items-center gap-3">
        <span
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: program.themeBg }}
        >
          {program.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mobile font-semibold text-stone-900 truncate">{program.name}</p>
          <p className="text-xs text-stone-600 mt-0.5 truncate">{program.shortDesc}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-mobile font-semibold",
              urgency === "high" ? "bg-rose-50 text-rose-700 border border-rose-100" : urgency === "medium" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-stone-100 text-stone-700",
            )}
          >
            <Calendar className="w-3 h-3" />
            {program.daysLeft} days
          </span>
          <span className="text-[11px] text-stone-500 mt-1 inline-flex items-center gap-1">
            <Users className="w-3 h-3" />
            {program.nominations} nominations
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      to={`/m/programs/${program.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all h-full bg-white"
    >
      {/* Hero header — colored background */}
      <div
        className="px-5 pt-5 pb-4 flex flex-col gap-3"
        style={{ background: program.themeBg }}
      >
        {/* Top row: icon + days badge */}
        <div className="flex items-start justify-between gap-2">
          <span className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center text-xl shrink-0 shadow-sm">
            {program.emoji}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 backdrop-blur px-2.5 py-1 text-[11px] font-mobile font-semibold text-stone-800 shrink-0">
            <Calendar className="w-3 h-3" />
            {program.daysLeft} days left
          </span>
        </div>

        {/* Title and description take the full card width */}
        <div>
          <p className="font-mobile font-semibold text-base text-stone-900 leading-snug line-clamp-2">
            {program.name}
          </p>
          <p className="text-xs text-stone-700 mt-1.5 leading-relaxed line-clamp-2">
            {program.shortDesc}
          </p>
        </div>
      </div>

      {/* Footer — stays at bottom on equal-height cards */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-2 border-t border-stone-100 mt-auto">
        <span className="text-xs text-stone-600 inline-flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-mobile font-semibold text-stone-900">{program.nominations}</span>
          nominations
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-mobile font-semibold text-[#a87a3a] group-hover:gap-1.5 transition-all">
          Participate <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
