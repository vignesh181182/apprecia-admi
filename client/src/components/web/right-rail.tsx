import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Sparkles, Cake, UserPlus } from "lucide-react";
import { LEADERBOARD } from "@/lib/mobile-data";
import { RecognizeDialog } from "@/components/recognize/recognize-dialog";

export function WebRightRail() {
  const [searchParams] = useSearchParams();
  const isRnR = searchParams.get("tab") === "rnr";
  return (
    <aside className="sticky top-[80px] py-2 space-y-4">
      {!isRnR && <LeaderboardMini />}
      <QuickRecognize isRnR={isRnR} />
      {!isRnR && <RecentlyActive />}
    </aside>
  );
}

function LeaderboardMini() {
  const top = LEADERBOARD.slice(0, 5);
  return (
    <section className="bg-white rounded-2xl border border-border p-4">
      <header className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Top earners</h3>
        <Link
          to="/m/ranks"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
        >
          See all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </header>
      <ol className="space-y-2.5">
        {top.map((entry) => (
          <li key={entry.rank} className="flex items-center gap-2.5">
            <span className="w-5 text-xs font-semibold text-muted-foreground text-center">
              {entry.rank}
            </span>
            <img
              src={entry.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
              <p className="text-xs text-muted-foreground truncate">{entry.role}</p>
            </div>
            <span className="text-xs font-semibold text-primary shrink-0">
              {entry.points}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function QuickRecognize({ isRnR }: { isRnR: boolean }) {
  const ctaLabel = isRnR ? "Recognize your teammate" : "Appreciate your teammate";
  const heading = isRnR ? "Send some recognition" : "Show some love";
  const description = isRnR
    ? "Recognize a teammate with points for going above and beyond."
    : "Send an appreciation to a teammate who's helped you out.";

  return (
    <section className="bg-gradient-to-br from-primary/10 to-primary/40 rounded-2xl border border-primary/15 p-4">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{heading}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
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
  );
}

function RecentlyActive() {
  const recents = [
    { name: "Sarah Chen", role: "Product Manager", avatar: "/m/images/user02.png", note: "joined recently" },
    { name: "Mike Patel", role: "Engineering", avatar: "/m/images/user04.png", note: "birthday this week", icon: "cake" },
    { name: "Robert Fox", role: "Director", avatar: "/m/images/user03.png", note: "5 yr anniversary" },
  ] as const;

  return (
    <section className="bg-white rounded-2xl border border-border p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Worth a shout-out</h3>
      <ul className="space-y-3">
        {recents.map((p) => (
          <li key={p.name} className="flex items-center gap-2.5">
            <img src={p.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                {p.icon === "cake" && <Cake className="w-3 h-3" />}
                {p.note}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
