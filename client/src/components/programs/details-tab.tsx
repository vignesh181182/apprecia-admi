import {
  Award,
  Calendar,
  ChevronRight,
  Edit3,
  Quote,
} from "lucide-react";
import { RecognizeDialog } from "@/components/recognize/recognize-dialog";
import { cn } from "@/lib/utils";
import type { Program, ProgramHighlight } from "@/lib/programs-data";
import { Target, Trophy, Gift, Users, Rocket } from "lucide-react";

const ICON_MAP: Record<ProgramHighlight["iconKey"], React.FC<{ className?: string }>> = {
  target: Target,
  trophy: Trophy,
  gift: Gift,
  users: Users,
  award: Award,
  rocket: Rocket,
};

export function DetailsTab({
  program,
  variant = "mobile",
}: {
  program: Program;
  variant?: "mobile" | "web";
}) {
  return (
    <div className={cn("space-y-4", variant === "web" && "pt-3")}>
      <RewardTeammateCard program={program} />
      <AboutCard program={program} />
      {program.lastWinner && <LastWinnerCard winner={program.lastWinner} />}
    </div>
  );
}

function RewardTeammateCard({ program }: { program: Program }) {
  const featured = (program.programLeaderboard ?? []).slice(0, 3);

  return (
    <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white">
      <div
        className="px-5 pt-5 pb-4 flex items-start gap-3"
        style={{ background: program.themeBg }}
      >
        <span className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center text-xl shrink-0 shadow-sm">
          🎁
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-mobile text-base font-semibold text-stone-900 leading-tight">
            Reward your teammate
          </h3>
          <p className="text-sm text-stone-700 mt-1 leading-snug">
            Recognize a peer who's earned it for this program. They'll be added to the
            leaderboard.
          </p>
        </div>
      </div>

      {featured.length > 0 && (
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-mobile font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Top nominees this cycle
          </p>
          <ul className="space-y-1">
            {featured.map((person) => (
              <li
                key={person.rank}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="relative shrink-0">
                  <img
                    src={person.avatar}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-stone-100"
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[10px] font-mobile font-semibold text-stone-700 tabular-nums">
                    {person.rank}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mobile font-semibold text-stone-900 truncate">
                    {person.name}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    {person.role} ·{" "}
                    <span className="text-stone-700 font-mobile font-semibold">
                      {person.points.toLocaleString()}
                    </span>{" "}
                    pts
                  </p>
                </div>
                <RecognizeDialog
                  kind="rnr"
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-mobile font-semibold transition-colors shrink-0"
                    >
                      <Edit3 className="w-3 h-3" />
                      Nominate
                    </button>
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-t border-stone-100 bg-stone-50/50">
        <div className="text-xs text-stone-600 flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-mobile font-semibold text-stone-900">
              {program.pointsPerWin}
            </span>{" "}
            pts
          </span>
          <span className="w-1 h-1 rounded-full bg-stone-300 shrink-0" />
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-mobile font-semibold text-stone-900">
              {program.daysLeft}
            </span>{" "}
            days left
          </span>
        </div>
        <RecognizeDialog
          kind="rnr"
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-mobile font-semibold text-[#a87a3a] hover:text-[#8e6630] transition-colors shrink-0"
            >
              {featured.length > 0 ? "Nominate someone else" : "Start a nomination"}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        />
      </div>
    </div>
  );
}

export function AboutCard({ program }: { program: Program }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/70 p-5">
      <h2 className="font-mobile font-semibold text-stone-900 mb-3">About this program</h2>
      <p className="text-sm text-stone-600 leading-relaxed">{program.description}</p>
      <div className="mt-5 space-y-4">
        {program.highlights.map((h, i) => {
          const Icon = ICON_MAP[h.iconKey];
          return (
            <div
              key={i}
              className="flex items-start gap-3 pb-4 last:pb-0 border-b border-stone-100 last:border-b-0"
            >
              <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                <Icon className="w-5 h-5 text-amber-700" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mobile font-semibold text-stone-900 text-sm">
                  {h.title}
                </p>
                <p className="text-sm text-stone-600 mt-0.5 leading-relaxed">{h.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LastWinnerCard({ winner }: { winner: NonNullable<Program["lastWinner"]> }) {
  return (
    <div
      className="rounded-2xl border border-amber-100 p-5 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #fdf6e8 0%, #fbecc8 100%)" }}
    >
      <p className="text-xs uppercase tracking-wide font-mobile font-semibold text-amber-700">
        Last month's winner
      </p>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-mobile text-xl font-semibold text-stone-900 leading-tight">
            {winner.name}
          </h3>
          <p className="text-sm text-stone-600 mt-0.5">{winner.team}</p>
          <div className="mt-3 inline-flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2 max-w-md">
            <Quote className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-stone-700 italic leading-snug">{winner.quote}</p>
          </div>
        </div>
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full bg-amber-50 border-4 border-white shadow-sm overflow-hidden">
            <img
              src={winner.avatar}
              alt={winner.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</span>
        </div>
      </div>
    </div>
  );
}
