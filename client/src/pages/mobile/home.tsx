import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { EmployeeLayout } from "@/components/employee-layout";
import { MobileTabToggle } from "@/components/mobile/tab-toggle";
import { AppreciationCardExact } from "@/components/mobile/appreciation-card-exact";
import { MobileLeaderboard } from "@/components/mobile/leaderboard";
import { RnRHome } from "@/components/rnr/rnr-home";
import { CelebrationCard } from "@/components/mobile/celebration-card";
import { FEED, type FeedKind, type RecognitionFeedItem } from "@/lib/mobile-data";
import { getCelebrations, type CelebrationItem } from "@/lib/celebrations-data";
import { getAccount } from "@/lib/account";

type FeedBlock =
  | { kind: "appreciation"; key: string; item: RecognitionFeedItem }
  | { kind: "celebration"; key: string; item: CelebrationItem }
  | { kind: "ranks"; key: string };

/**
 * Lays out the appreciation feed: ranks after the first two cards, with
 * celebrations woven in between appreciations.
 *
 * The cadence is proportional rather than fixed — a feed with many
 * appreciations and one birthday spaces them far apart, while a quiet feed
 * alternates. A fixed "every second card" would run out of slots and leave the
 * remaining celebrations stacked in a block at the end. Leftovers are still
 * appended as a backstop so none are ever dropped.
 */
function buildFeed(
  appreciations: RecognitionFeedItem[],
  celebrations: CelebrationItem[],
): FeedBlock[] {
  const blocks: FeedBlock[] = [];
  let next = 0;

  const every = Math.max(1, Math.floor(appreciations.length / (celebrations.length + 1)));

  appreciations.forEach((item, i) => {
    blocks.push({ kind: "appreciation", key: item.id, item });
    if (i === 1) blocks.push({ kind: "ranks", key: "ranks" });
    if ((i + 1) % every === 0 && next < celebrations.length) {
      const c = celebrations[next++];
      blocks.push({ kind: "celebration", key: c.id, item: c });
    }
  });

  while (next < celebrations.length) {
    const c = celebrations[next++];
    blocks.push({ kind: "celebration", key: c.id, item: c });
  }

  return blocks;
}

export default function MobileHome() {
  const account = getAccount();
  const rnrEnabled = !!account?.products.rnr;
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: FeedKind = tabParam === "rnr" && rnrEnabled ? "rnr" : "appreciation";
  const setTab = (next: FeedKind) => {
    const params = new URLSearchParams(searchParams);
    if (next === "appreciation") params.delete("tab");
    else params.set("tab", next);
    setSearchParams(params, { replace: true });
  };

  const items = useMemo(() => FEED.filter((f) => f.kind === "appreciation"), []);
  const blocks = useMemo(() => buildFeed(items, getCelebrations()), [items]);

  if (tab === "rnr") {
    return (
      <EmployeeLayout>
        <div className="md:hidden px-5 pt-3 pb-4">
          <MobileTabToggle value={tab} onChange={setTab} rnrEnabled={rnrEnabled} />
        </div>
        <RnRHome />
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="md:hidden px-5 pt-3 pb-4">
        <MobileTabToggle value={tab} onChange={setTab} rnrEnabled={rnrEnabled} />
      </div>

      <div className="px-5 md:px-0 space-y-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border/70 p-8 text-center">
            <p className="text-sm text-muted-foreground">No recognitions yet — check back soon.</p>
          </div>
        ) : (
          <>
            {blocks.map((block) => {
              if (block.kind === "ranks") return <MobileLeaderboard key={block.key} />;
              if (block.kind === "celebration")
                return <CelebrationCard key={block.key} item={block.item} />;
              return <AppreciationCardExact key={block.key} item={block.item} />;
            })}
          </>
        )}
      </div>
    </EmployeeLayout>
  );
}
