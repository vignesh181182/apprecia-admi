import { EmployeeLayout } from "@/components/employee-layout";
import { WinnerCard } from "@/components/ranks/winner-card";
import { PodiumCard } from "@/components/ranks/podium-card";
import { RankRow } from "@/components/ranks/rank-row";
import { MyRankBanner } from "@/components/ranks/my-rank-banner";
import { RanksRightRail } from "@/components/ranks/ranks-right-rail";
import { LEADERBOARD } from "@/lib/mobile-data";
import { useIsMobile } from "@/hooks/use-viewport";

export default function MobileRanks() {
  const isMobile = useIsMobile();
  const winner = LEADERBOARD[0];
  const podium = LEADERBOARD.slice(1, 3);
  const rest = LEADERBOARD.slice(3, 10);

  return (
    <EmployeeLayout rightRail={<RanksRightRail />}>
      <div className="px-5 md:px-0 pt-3 md:pt-0 pb-44 md:pb-6">
        <h2 className="font-mobile text-xl text-stone-900 mb-3 md:hidden">
          <span className="font-semibold">Top 10 Ranks</span>{" "}
          <span className="text-stone-500 font-normal">This Month</span>
        </h2>

        <WinnerCard entry={winner} />

        <div className="grid grid-cols-2 gap-3 mt-3">
          {podium.map((entry) => (
            <PodiumCard key={entry.rank} entry={entry} />
          ))}
        </div>

        <ul className="mt-3 divide-y divide-stone-100">
          {rest.map((entry) => (
            <li key={entry.rank}>
              <RankRow entry={entry} />
            </li>
          ))}
        </ul>

        {!isMobile && (
          <div className="mt-4 pt-4 border-t border-stone-200">
            <MyRankBanner inline />
          </div>
        )}
      </div>

      <MyRankBanner />
    </EmployeeLayout>
  );
}
