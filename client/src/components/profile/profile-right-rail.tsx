import { Award, Sparkles } from "lucide-react";
import { BADGE_IMAGE, MY_BADGES, FEED, isMe, MY_RANK } from "@/lib/mobile-data";
import { getAccount } from "@/lib/account";

export function ProfileRightRail() {
  const account = getAccount();
  const received = FEED.filter((f) => isMe(f.recipientEmail, account));
  const categoryCount = new Map<string, number>();
  received.forEach((r) => {
    categoryCount.set(r.badgeLabel, (categoryCount.get(r.badgeLabel) ?? 0) + 1);
  });
  const topCategories = [...categoryCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <aside className="sticky top-[80px] py-2 space-y-4">
      <section className="bg-gradient-to-br from-primary/10 to-primary/40 rounded-2xl border border-primary/15 p-4">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </span>
          <p className="text-sm font-semibold text-foreground">This month</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-mobile text-2xl font-semibold text-foreground leading-none">
              {received.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Recognitions</p>
          </div>
          <div>
            <p className="font-mobile text-2xl font-semibold text-foreground leading-none">
              #{MY_RANK.rank}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Current rank</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-border p-4">
        <header className="flex items-center gap-1.5 mb-3">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Recent badges</h3>
        </header>
        {MY_BADGES.length === 0 ? (
          <p className="text-xs text-muted-foreground">No badges yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {MY_BADGES.slice(0, 3).map((b, i) => (
              <li key={`${b.badge}-${i}`} className="flex items-center gap-2.5">
                <img src={BADGE_IMAGE[b.badge]} alt="" className="w-10 h-10 object-contain shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">{b.label}</p>
                  <p className="text-xs text-muted-foreground truncate">From {b.earnedFrom}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {topCategories.length > 0 && (
        <section className="bg-white rounded-2xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Most recognized for</h3>
          <ul className="space-y-2">
            {topCategories.map(([label, count]) => (
              <li key={label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-xs font-semibold text-muted-foreground">×{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
