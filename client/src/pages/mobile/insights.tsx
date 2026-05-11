import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Heart, Users, Activity, BarChart3, Sparkles, Wallet, Trophy } from "lucide-react";
import { EmployeeLayout } from "@/components/employee-layout";
import { KpiCard } from "@/components/insights/kpi-card";
import { TrendChart } from "@/components/insights/trend-chart";
import { BadgeBars } from "@/components/insights/badge-bars";
import { DepartmentBars } from "@/components/insights/department-bars";
import { TopPeople } from "@/components/insights/top-people";
import { PeriodPicker } from "@/components/insights/period-picker";
import { ProgramsRow } from "@/components/insights/rnr/programs-row";
import { TopWinnersRow } from "@/components/insights/rnr/top-winners-row";
import { NeedsAttention } from "@/components/insights/rnr/needs-attention";
import { ApprovalQueueCard } from "@/components/insights/rnr/approval-queue-card";
import { BudgetBurnChart } from "@/components/insights/rnr/budget-burn-chart";
import { useIsMobile } from "@/hooks/use-viewport";
import { getAccount } from "@/lib/account";
import {
  getKpis,
  getTrend,
  getTopBadges,
  getDepartments,
  getTopPeople,
  PERIOD_DAYS,
  type Period,
} from "@/lib/insights-data";
import { getRnRKpis, getBudgetBurn } from "@/lib/rnr-insights-data";
import type { FeedKind } from "@/lib/mobile-data";

export default function MobileInsights() {
  const [searchParams] = useSearchParams();
  const account = getAccount();
  const tab: FeedKind = searchParams.get("tab") === "rnr" ? "rnr" : "appreciation";
  const rnrEnabled = !!account?.products.rnr;

  if (tab === "rnr" && !rnrEnabled) {
    return (
      <EmployeeLayout showRightRail={false}>
        <div className="px-5 md:px-0 pt-3 md:pt-0 pb-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
            <p className="text-sm text-stone-700 font-mobile font-semibold mb-1">RnR isn't enabled</p>
            <p className="text-xs text-stone-500">
              Reach out to your EngageX contact to enable Rewards & Recognition.
            </p>
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  if (tab === "rnr") return <RnRInsights />;
  return <AppreciationInsights />;
}

function AppreciationInsights() {
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState<Period>("month");

  const kpis = useMemo(() => getKpis("appreciation"), []);
  const trend = useMemo(() => getTrend("appreciation", PERIOD_DAYS[period]), [period]);
  const topBadges = useMemo(() => getTopBadges("appreciation"), []);
  const departments = useMemo(() => getDepartments("appreciation"), []);
  const topGivers = useMemo(() => getTopPeople("appreciation", "givers"), []);
  const topReceivers = useMemo(() => getTopPeople("appreciation", "receivers"), []);

  return (
    <EmployeeLayout showRightRail={false}>
      <div className="px-5 md:px-0 pt-3 md:pt-0 pb-6 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-mobile text-xl md:text-2xl font-semibold text-stone-900">
              Appreciation Insights
            </h1>
            <p className="text-xs md:text-sm text-stone-500 mt-0.5">
              How appreciation is moving across your company.
            </p>
          </div>
          <PeriodPicker value={period} onChange={setPeriod} />
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Total recognitions" value={kpis.totalRecognitions.toLocaleString()} delta={kpis.totalDelta} Icon={Heart} tone="rose" />
          <KpiCard label="Active participants" value={kpis.activeParticipants.toLocaleString()} delta={kpis.participantsDelta} Icon={Users} tone="amber" />
          <KpiCard label="Participation rate" value={`${kpis.participationRate}%`} delta={kpis.rateDelta} Icon={Activity} tone="emerald" hint="of workforce" />
          <KpiCard label="Avg per employee" value={kpis.avgPerEmployee.toFixed(2)} delta={kpis.avgDelta} Icon={BarChart3} tone="stone" hint="per month" />
        </div>

        <TrendChart data={trend} height={isMobile ? 200 : 280} />

        {!isMobile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BadgeBars stats={topBadges} />
            <DepartmentBars stats={departments} />
          </div>
        )}
        {isMobile && <BadgeBars stats={topBadges} />}

        {!isMobile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopPeople title="Top givers" hint="Most recognitions sent" people={topGivers} />
            <TopPeople title="Top receivers" hint="Most recognitions earned" people={topReceivers} />
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}

function RnRInsights() {
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState<Period>("month");

  const kpis = useMemo(() => getRnRKpis(period), [period]);
  const trend = useMemo(() => getTrend("rnr", PERIOD_DAYS[period]), [period]);
  const departments = useMemo(() => getDepartments("rnr"), []);
  const burn = useMemo(() => getBudgetBurn(period), [period]);

  return (
    <EmployeeLayout showRightRail={false}>
      <div className="px-5 md:px-0 pt-3 md:pt-0 pb-6 space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-mobile text-xl md:text-2xl font-semibold text-stone-900">RnR Insights</h1>
            <p className="text-xs md:text-sm text-stone-500 mt-0.5">
              How rewards & recognition is moving across your company.
            </p>
          </div>
          <PeriodPicker value={period} onChange={setPeriod} />
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Recognitions this month"
            value={kpis.recognitionsThisMonth.toLocaleString()}
            delta={kpis.recognitionsDelta}
            Icon={Sparkles}
            tone="amber"
          />
          <KpiCard
            label="Active participants"
            value={`${kpis.activeParticipantsRate}%`}
            delta={kpis.activeParticipantsDelta}
            Icon={Users}
            tone="rose"
            hint="of workforce"
          />
          <KpiCard
            label="Budget used"
            value={`${kpis.budgetUsedRate}%`}
            delta={kpis.budgetUsedDelta}
            Icon={Wallet}
            tone="emerald"
          />
          <KpiCard
            label="Active programs"
            value={kpis.activePrograms}
            delta={kpis.activeProgramsDelta}
            Icon={Trophy}
            tone="stone"
          />
        </div>

        <ProgramsRow layout={isMobile ? "scroll" : "grid"} />

        <TopWinnersRow />

        {!isMobile ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ApprovalQueueCard />
            <NeedsAttention />
          </div>
        ) : (
          <>
            <ApprovalQueueCard />
            <NeedsAttention />
          </>
        )}

        {!isMobile && <BudgetBurnChart data={burn} height={280} />}

        {!isMobile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TrendChart data={trend} height={260} />
            <DepartmentBars stats={departments} />
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}
