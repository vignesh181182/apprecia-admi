import { Link } from "react-router-dom";
import { Calendar, Users, ArrowRight, Edit3 } from "lucide-react";
import { getAccount } from "@/lib/account";
import { getActivePrograms, type Program, type ProgramCategory } from "@/lib/programs-data";
import { TOP_WINNERS } from "@/lib/rnr-insights-data";

type CategoryEntry = { program: Program; category: ProgramCategory };

function flattenAwardCategories(programs: Program[]): CategoryEntry[] {
  const out: CategoryEntry[] = [];
  for (const program of programs) {
    const cats = program.categories ?? [];
    // Skip the synthesized default category that normalizeProgram adds for
    // programs that didn't declare their own — those are represented well
    // enough by the program card itself.
    const real = cats.filter((c) => c.id !== `${program.id}-cat-default`);
    for (const category of real) {
      out.push({ program, category });
    }
  }
  return out;
}

export function RnRHome() {
  const account = getAccount();
  const firstName = account?.adminName?.split(" ")[0] || "there";
  const active = getActivePrograms();
  const featuredActive = active.slice(0, 6);
  const awardCategories = flattenAwardCategories(active);

  return (
    <div className="px-5 md:px-0 pt-3 md:pt-0 pb-6 space-y-5 md:space-y-6">
      <header>
        <h1 className="font-mobile text-2xl md:text-3xl font-semibold text-foreground leading-tight">
          Hey {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {active.length} active programs ready for your nomination.
        </p>
      </header>

      {awardCategories.length > 0 && (
        <section>
          <header className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-mobile font-semibold text-foreground">Award categories</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Pick a category and nominate a teammate.</p>
            </div>
          </header>
          <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex gap-3 md:grid md:grid-cols-2 md:gap-4">
              {awardCategories.map(({ program, category }) => (
                <li key={`${program.id}-${category.id}`} className="shrink-0 w-72 md:w-auto">
                  <AwardCategoryCard program={program} category={category} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section>
        <header className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-mobile font-semibold text-foreground">Active programs</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Tap to learn more or nominate.</p>
          </div>
          <Link to="/m/programs" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5">
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
            <h2 className="font-mobile font-semibold text-foreground">Recent winners</h2>
            <p className="text-xs text-muted-foreground mt-0.5">People crushing it across programs.</p>
          </div>
        </header>
        <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-3">
            {TOP_WINNERS.map((w) => (
              <li
                key={w.id}
                className="shrink-0 w-36 bg-primary/50 border border-border rounded-2xl p-3 flex flex-col items-center text-center"
              >
                <img src={w.avatar} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <p className="mt-2.5 text-sm font-mobile font-semibold text-primary leading-tight truncate w-full">
                  {w.name}
                </p>
                <p className="text-xs text-muted-foreground truncate w-full mt-0.5">{w.role}</p>
                <p className="text-[11px] text-muted-foreground truncate w-full mt-1">{w.programName}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function AwardCategoryCard({ program, category }: { program: Program; category: ProgramCategory }) {
  const description = category.guidelines?.summary || category.description;
  return (
    <Link
      to={`/m/programs/${program.id}`}
      className="group flex flex-col h-full rounded-2xl overflow-hidden border border-border bg-white hover:border-border hover:shadow-sm transition-all"
    >
      <div
        className="px-4 pt-4 pb-3 flex items-start gap-3"
        style={{ background: program.themeBg }}
      >
        <span className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center text-xl shrink-0 shadow-sm">
          {category.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mobile font-semibold text-foreground leading-snug line-clamp-2">
            {category.name}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{program.name}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 backdrop-blur px-2 py-0.5 text-[11px] font-mobile font-semibold text-foreground shrink-0">
          <Calendar className="w-3 h-3" />
          {program.daysLeft}d
        </span>
      </div>

      {description && (
        <p className="px-4 pt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      <div className="px-4 py-3 mt-auto flex items-center justify-between gap-2 border-t border-border">
        <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
          <Users className="w-3 h-3 text-muted-foreground" />
          {program.nominations} nominations
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-mobile font-semibold text-primary group-hover:gap-1.5 transition-all">
          <Edit3 className="w-3 h-3" />
          Nominate
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

function ProgramCard({ program }: { program: Program }) {
  return (
    <Link
      to={`/m/programs/${program.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden border border-border hover:border-border hover:shadow-sm transition-all h-full bg-white"
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
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 backdrop-blur px-2.5 py-1 text-[11px] font-mobile font-semibold text-foreground shrink-0">
            <Calendar className="w-3 h-3" />
            {program.daysLeft} days left
          </span>
        </div>

        {/* Title and description take the full card width */}
        <div>
          <p className="font-mobile font-semibold text-base text-foreground leading-snug line-clamp-2">
            {program.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
            {program.shortDesc}
          </p>
        </div>
      </div>

      {/* Footer — stays at bottom on equal-height cards */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-2 border-t border-border mt-auto">
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mobile font-semibold text-foreground">{program.nominations}</span>
          nominations
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-mobile font-semibold text-primary group-hover:gap-1.5 transition-all">
          Participate <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
