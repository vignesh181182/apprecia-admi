import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getActivePrograms, type Program } from "@/lib/programs-data";
import { getAccount } from "@/lib/account";

export function ProgramsRow({ layout = "scroll" }: { layout?: "scroll" | "grid" }) {
  const programs = getActivePrograms();
  const currency = getAccount()?.currency || "₹";

  return (
    <section>
      <header className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-mobile font-semibold text-stone-900">Programs</h2>
          <p className="text-xs text-stone-500 mt-0.5">{programs.length} active</p>
        </div>
        <Link to="/programs" className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-0.5">
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </header>

      {layout === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} currency={currency} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0">
          <ul className="flex gap-3 md:flex-wrap">
            {programs.map((p) => (
              <li key={p.id} className="shrink-0 w-[280px] md:w-auto md:flex-1 md:min-w-[280px]">
                <ProgramCard program={p} currency={currency} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ProgramCard({ program, currency }: { program: Program; currency: string }) {
  const usedPct = Math.min(100, Math.round((program.budgetUsed / program.budgetAllocated) * 100));

  return (
    <Link
      to={`/m/programs/${program.id}`}
      className="block bg-white rounded-2xl border border-stone-200 p-4 hover:border-stone-300 transition-colors h-full"
    >
      <div className="flex items-start gap-3">
        <span
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: program.themeBg }}
        >
          {program.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mobile font-semibold text-stone-900 leading-tight truncate">{program.name}</p>
          {program.topNominee && (
            <p className="text-sm text-stone-700 truncate mt-0.5">{program.topNominee.name}</p>
          )}
          <p className="text-xs text-stone-500 mt-0.5">{program.nominations} nominations</p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-stone-700 font-medium">{usedPct}% budget used</span>
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

      <p
        className={`text-xs mt-2.5 ${
          program.status === "ending-soon" ? "text-rose-700 font-semibold" : "text-stone-500"
        }`}
      >
        {program.daysLeft} days remaining
      </p>
    </Link>
  );
}
