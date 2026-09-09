import { useState } from "react";
import { cn } from "@/lib/utils";
import { getAccount } from "@/lib/account";
import {
  CELEBRATION_STYLES,
  celebrationSubtitle,
  celebrationTitle,
  getWishes,
  toggleWish,
  totalWishes,
  whenLabel,
  WISHES,
  type CelebrationItem,
  type Wish,
} from "@/lib/celebrations-data";

/**
 * A calendar moment in the employee feed — birthday, work or wedding
 * anniversary, or a new joiner. Sits at the same 468px width as
 * AppreciationCardExact so the feed keeps one column edge-to-edge.
 */
export function CelebrationCard({ item }: { item: CelebrationItem }) {
  const account = getAccount();
  const style = CELEBRATION_STYLES[item.kind];
  const [wishes, setWishes] = useState(() => getWishes(item.id));

  const count = item.cheers + totalWishes(wishes);
  // Once the user has wished, count them separately so the tally never reads
  // as if a stranger left their wish.
  const others = wishes.mine ? count - 1 : count;
  const summary = wishes.mine
    ? others === 0
      ? "You wished"
      : `You and ${others} ${others === 1 ? "other" : "others"} wished`
    : `${count} ${count === 1 ? "wish" : "wishes"}`;

  function wish(emoji: Wish) {
    setWishes(toggleWish(item.id, emoji));
  }

  return (
    <article className="mx-auto w-[468px] overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      {/* Occasion banner */}
      <div className={cn("flex items-center gap-2 px-5 py-2.5", style.banner)}>
        <span className="text-base leading-none" aria-hidden>
          {style.emoji}
        </span>
        <span className={cn("text-xs font-semibold", style.accent)}>{style.label}</span>
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium",
            style.chip,
          )}
        >
          {whenLabel(item.date)}
        </span>
      </div>

      <div className="flex flex-col items-center px-6 pb-5 pt-6 text-center">
        <div className={style.accent}>
          <img
            src={item.personAvatar}
            alt={item.personName}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-current"
          />
        </div>

        <h3 className="mt-4 text-xl font-semibold leading-tight text-foreground">
          {celebrationTitle(item, account?.companyName)}
        </h3>

        <p className="mt-1.5 text-sm font-medium text-foreground">{item.personName}</p>
        <p className="text-xs text-muted-foreground">{item.personRole}</p>

        <p className="mt-3 max-w-[320px] text-sm text-muted-foreground">
          {celebrationSubtitle(item)}
        </p>
      </div>

      {/* Wish bar */}
      <div className="flex items-center gap-2 border-t border-border px-5 py-3">
        <div className="flex items-center gap-1.5">
          {WISHES.map((emoji) => {
            const picked = wishes.mine === emoji;
            const n = wishes.counts[emoji] ?? 0;
            return (
              <button
                key={emoji}
                onClick={() => wish(emoji)}
                aria-pressed={picked}
                aria-label={`Send ${emoji}`}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition-colors",
                  picked
                    ? "border-primary bg-primary-soft"
                    : "border-border bg-muted hover:border-primary",
                )}
              >
                <span aria-hidden>{emoji}</span>
                {n > 0 && <span className="text-[11px] text-muted-foreground">{n}</span>}
              </button>
            );
          })}
        </div>

        <p className="ml-auto text-xs text-muted-foreground">{summary}</p>
      </div>
    </article>
  );
}
