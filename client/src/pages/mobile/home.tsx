import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { EmployeeLayout } from "@/components/employee-layout";
import { MobileTabToggle } from "@/components/mobile/tab-toggle";
import { RecognitionCard } from "@/components/mobile/recognition-card";
import { MobileLeaderboard } from "@/components/mobile/leaderboard";
import { RnRHome } from "@/components/rnr/rnr-home";
import { FEED, type FeedKind } from "@/lib/mobile-data";
import { getAccount } from "@/lib/account";

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
          <div className="bg-white rounded-2xl border border-stone-200/70 p-8 text-center">
            <p className="text-sm text-stone-600">No recognitions yet — check back soon.</p>
          </div>
        ) : (
          <>
            {items.slice(0, 2).map((item) => (
              <RecognitionCard key={item.id} item={item} />
            ))}

            <MobileLeaderboard />

            {items.slice(2).map((item) => (
              <RecognitionCard key={item.id} item={item} />
            ))}
          </>
        )}
      </div>
    </EmployeeLayout>
  );
}
