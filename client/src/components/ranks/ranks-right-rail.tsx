import { useSearchParams } from "react-router-dom";
import { TrendingUp, ArrowUp, Sparkles, UserPlus } from "lucide-react";
import { LEADERBOARD, MY_RANK } from "@/lib/mobile-data";
import { getAccount } from "@/lib/account";
import { RecognizeDialog } from "@/components/recognize/recognize-dialog";

export function RanksRightRail() {
  const account = getAccount();
  const initial = (account?.adminName?.[0] || "Y").toUpperCase();
  const [searchParams] = useSearchParams();
  const isRnR = searchParams.get("tab") === "rnr";
  const ctaLabel = isRnR ? "Recognize your teammate" : "Appreciate your teammate";
  const ctaDescription = isRnR
    ? "Recognize a teammate with points to climb the ranks."
    : "Appreciate a teammate to earn back-pat points.";

  const nextRank = LEADERBOARD[LEADERBOARD.length - 1];
  const pointsToNext = nextRank.points - MY_RANK.points + 1;

  return (
    <aside className="sticky top-[80px] py-2 space-y-4">
      <section className="bg-white rounded-2xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Your standing</h3>
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-primary text-white text-lg font-mobile font-semibold flex items-center justify-center shrink-0">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="font-mobile font-semibold text-foreground text-base">
              Rank #{MY_RANK.rank}
            </p>
            <p className="text-xs text-muted-foreground">
              {MY_RANK.points.toLocaleString()} points this month
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/15">
          <ArrowUp className="w-3.5 h-3.5 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">{pointsToNext.toLocaleString()} pts</span> to break into the top 10
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary/10 to-primary/40 rounded-2xl border border-primary/15 p-4">
        <div className="flex items-start gap-2.5">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Climb the ranks</p>
            <p className="text-xs text-muted-foreground mt-0.5">{ctaDescription}</p>
          </div>
        </div>
        <RecognizeDialog
          kind={isRnR ? "rnr" : "appreciation"}
          trigger={
            <button
              type="button"
              className="mt-3 w-full inline-flex items-center justify-center h-9 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {ctaLabel}
            </button>
          }
        />
      </section>

      <section className="bg-white rounded-2xl border border-border p-4">
        <header className="flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-4 h-4 text-success" />
          <h3 className="text-sm font-semibold text-foreground">Climbers this week</h3>
        </header>
        <ul className="space-y-2.5">
          {LEADERBOARD.slice(3, 7).map((p, i) => (
            <li key={p.rank} className="flex items-center gap-2.5">
              <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.role}</p>
              </div>
              <span className="text-xs font-semibold text-success shrink-0 inline-flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" />
                {[4, 3, 2, 1][i]}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
