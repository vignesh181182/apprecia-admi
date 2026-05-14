import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import {
  ChevronDown,
  Filter,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  Clock,
  Award,
  Coins,
  AlertCircle,
  BellRing,
} from "lucide-react";
import { getAccount, type RecognitionCategoryColor } from "@/lib/account";
import { getBadges } from "@/lib/badges";
import { EMPLOYEES } from "@/lib/recognize-data";
import { useToast } from "@/hooks/use-toast";
import {
  defaultDateRange,
  formatRangeLabel,
  getAppreciationStats,
  listDepartments,
  presetRange,
  type AppreciationStats,
  type DateRange,
  type DateRangePresetId,
} from "@/lib/dashboard-stats";

// ─── Tabbed shell ──────────────────────────────────────────────────────

const APPRECIATION_TAB = "appreciation";
const RNR_TAB = "rnr";

export default function HRDashboard() {
  const account = getAccount();
  const rnrEnabled = !!account?.products.rnr;
  const [searchParams, setSearchParams] = useSearchParams();
  const param = searchParams.get("tab");
  const tab =
    param === RNR_TAB && rnrEnabled
      ? RNR_TAB
      : APPRECIATION_TAB;

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams);
    if (next === APPRECIATION_TAB) params.delete("tab");
    else params.set("tab", next);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="h-full overflow-y-auto p-3 lg:p-6 custom-scrollbar">
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Dashboard</h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Recognition activity, approvals, and program health
            </p>
          </div>
          <TabsList>
            <TabsTrigger value={APPRECIATION_TAB} data-testid="tab-appreciation">
              Appreciation
            </TabsTrigger>
            {rnrEnabled && (
              <TabsTrigger value={RNR_TAB} data-testid="tab-rnr">
                RnR
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value={APPRECIATION_TAB} className="mt-0">
          <AppreciationTab />
        </TabsContent>

        {rnrEnabled && (
          <TabsContent value={RNR_TAB} className="mt-0">
            <RnRTabPlaceholder />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ─── Appreciation tab ──────────────────────────────────────────────────

function AppreciationTab() {
  const account = getAccount();
  const monetaryEnabled = !!account?.appreciationPolicy?.monetaryEnabled;
  const approvalRequired = !!account?.appreciationPolicy?.approval?.required;
  const currency = account?.currency ?? "₹";

  const [preset, setPreset] = useState<DateRangePresetId>("this-month");
  const [customRange, setCustomRange] = useState<DateRange>(defaultDateRange());
  const [departments, setDepartments] = useState<string[]>([]);
  const [badgesVersion, setBadgesVersion] = useState(0);

  // Refresh badges when storage changes (covers approve/reject in another tab).
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "engagex_badges") setBadgesVersion((v) => v + 1);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const range: DateRange = useMemo(
    () => (preset === "custom" ? customRange : presetRange(preset)),
    [preset, customRange],
  );

  const allDepartments = useMemo(() => listDepartments(EMPLOYEES), []);
  const stats: AppreciationStats = useMemo(
    () => getAppreciationStats(getBadges(), EMPLOYEES, range, departments, account),
    [range, departments, account, badgesVersion],
  );

  const hasAnyData =
    stats.totals.badges > 0 || stats.approval.pending > 0 || stats.utilization.active > 0;

  return (
    <div className="space-y-6">
      <FilterBar
        preset={preset}
        setPreset={setPreset}
        customRange={customRange}
        setCustomRange={setCustomRange}
        range={range}
        departments={departments}
        setDepartments={setDepartments}
        allDepartments={allDepartments}
      />

      <KpiStrip
        stats={stats}
        approvalRequired={approvalRequired}
        monetaryEnabled={monetaryEnabled}
        currency={currency}
      />

      <TrendCard data={stats.monthlyTrend} monetaryEnabled={monetaryEnabled} />

      {approvalRequired && (
        <ApprovalFunnelCard stats={stats} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentChart data={stats.byDepartment} />
        <CategoryChart data={stats.byCategory} />
      </div>

      <UnderrecognizedTable data={stats.underrecognized} />

      {!hasAnyData && (
        <Card className="border border-stone-200 bg-stone-50">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-8 h-8 text-stone-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-900 mb-1">No appreciation activity yet</p>
            <p className="text-xs text-stone-500">
              Once employees start sending badges, the dashboard will fill in automatically.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Filter bar ────────────────────────────────────────────────────────

function FilterBar({
  preset,
  setPreset,
  customRange,
  setCustomRange,
  range,
  departments,
  setDepartments,
  allDepartments,
}: {
  preset: DateRangePresetId;
  setPreset: (p: DateRangePresetId) => void;
  customRange: DateRange;
  setCustomRange: (r: DateRange) => void;
  range: DateRange;
  departments: string[];
  setDepartments: (d: string[]) => void;
  allDepartments: string[];
}) {
  const toIso = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <Card className="border border-stone-200">
      <CardContent className="p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-stone-500 shrink-0" />

        <Select value={preset} onValueChange={(v) => setPreset(v as DateRangePresetId)}>
          <SelectTrigger className="w-[170px] h-9 text-sm" data-testid="filter-date-range">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This month</SelectItem>
            <SelectItem value="last-month">Last month</SelectItem>
            <SelectItem value="last-3-months">Last 3 months</SelectItem>
            <SelectItem value="this-year">This year</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="h-9 px-2 text-sm border border-stone-300 rounded-md"
              value={toIso(customRange.start)}
              onChange={(e) => setCustomRange({ ...customRange, start: new Date(e.target.value) })}
              data-testid="filter-custom-start"
            />
            <span className="text-xs text-stone-400">→</span>
            <input
              type="date"
              className="h-9 px-2 text-sm border border-stone-300 rounded-md"
              value={toIso(customRange.end)}
              onChange={(e) => setCustomRange({ ...customRange, end: new Date(e.target.value) })}
              data-testid="filter-custom-end"
            />
          </div>
        )}

        <DepartmentFilter
          all={allDepartments}
          selected={departments}
          onChange={setDepartments}
        />

        <span className="ml-auto text-xs text-stone-500">{formatRangeLabel(range)}</span>
      </CardContent>
    </Card>
  );
}

function DepartmentFilter({
  all,
  selected,
  onChange,
}: {
  all: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const label =
    selected.length === 0
      ? "All departments"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} departments`;

  function toggle(dept: string) {
    if (selected.includes(dept)) onChange(selected.filter((d) => d !== dept));
    else onChange([...selected, dept]);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-sm font-normal"
          data-testid="filter-department"
        >
          {label}
          <ChevronDown className="w-3.5 h-3.5 ml-2 text-stone-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-xs font-medium text-stone-700">Departments</span>
          {selected.length > 0 && (
            <button
              className="text-xs text-stone-500 hover:text-stone-900"
              onClick={() => onChange([])}
            >
              Clear
            </button>
          )}
        </div>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {all.map((d) => (
            <label
              key={d}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-stone-50 cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(d)}
                onCheckedChange={() => toggle(d)}
              />
              <span className="text-sm text-stone-700">{d}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── KPI strip ─────────────────────────────────────────────────────────

function KpiStrip({
  stats,
  approvalRequired,
  monetaryEnabled,
  currency,
}: {
  stats: AppreciationStats;
  approvalRequired: boolean;
  monetaryEnabled: boolean;
  currency: string;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <UtilizationKpi util={stats.utilization} />
      {approvalRequired ? (
        <ApprovalKpi approval={stats.approval} />
      ) : (
        <AutoPublishedKpi approval={stats.approval} />
      )}
      <TotalAppreciationsKpi totals={stats.totals} />
      <TopUserKpi
        label="Top giver"
        user={stats.topGiver}
        emptyText="No givers in range"
      />
      <TopUserKpi
        label="Top receiver"
        user={stats.topReceiver}
        emptyText="No receivers in range"
      />
      {monetaryEnabled && (
        <PointsCirculatedKpi totals={stats.totals} currency={currency} />
      )}
    </div>
  );
}

function KpiCard({
  label,
  children,
  tint,
  testId,
}: {
  label: string;
  children: React.ReactNode;
  tint?: "green" | "amber" | "red";
  testId?: string;
}) {
  const tintClass =
    tint === "green"
      ? "bg-green-50 border-green-200"
      : tint === "amber"
        ? "bg-amber-50 border-amber-200"
        : tint === "red"
          ? "bg-red-50 border-red-200"
          : "border-stone-200 bg-white";
  return (
    <Card className={`border ${tintClass}`} data-testid={testId}>
      <CardContent className="p-4">
        <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-2">
          {label}
        </p>
        {children}
      </CardContent>
    </Card>
  );
}

function UtilizationKpi({ util }: { util: AppreciationStats["utilization"] }) {
  const tint = util.pct >= 70 ? "green" : util.pct >= 40 ? "amber" : "red";
  return (
    <KpiCard label="Utilization" tint={tint} testId="kpi-utilization">
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-stone-900">{util.pct}%</p>
        <Users className="w-4 h-4 text-stone-400" />
      </div>
      <p className="text-xs text-stone-500 mt-1">
        {util.active} of {util.total} employees active
      </p>
    </KpiCard>
  );
}

function ApprovalKpi({ approval }: { approval: AppreciationStats["approval"] }) {
  return (
    <KpiCard label="Approval status" testId="kpi-approval">
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-stone-900">{approval.pending}</p>
        <span className="text-xs text-stone-500">pending</span>
      </div>
      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Avg decision: {approval.avgDecisionHours}h
      </p>
    </KpiCard>
  );
}

function AutoPublishedKpi({ approval }: { approval: AppreciationStats["approval"] }) {
  return (
    <KpiCard label="Approval status" testId="kpi-auto-published">
      <div className="flex items-baseline gap-2">
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Auto-published
        </Badge>
      </div>
      <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        First reaction: {approval.avgFirstReactionHours}h avg
      </p>
    </KpiCard>
  );
}

function TotalAppreciationsKpi({ totals }: { totals: AppreciationStats["totals"] }) {
  const delta = totals.deltaBadges;
  return (
    <KpiCard label="Total appreciations" testId="kpi-total">
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-stone-900">{totals.badges.toLocaleString()}</p>
        <Award className="w-4 h-4 text-stone-400" />
      </div>
      <p
        className={`text-xs mt-1 flex items-center gap-1 ${
          delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-stone-500"
        }`}
      >
        {delta > 0 ? (
          <TrendingUp className="w-3 h-3" />
        ) : delta < 0 ? (
          <TrendingDown className="w-3 h-3" />
        ) : null}
        {delta === 0 ? "No change vs prior" : `${delta > 0 ? "+" : ""}${delta} vs prior period`}
      </p>
    </KpiCard>
  );
}

function TopUserKpi({
  label,
  user,
  emptyText,
}: {
  label: string;
  user: AppreciationStats["topGiver"];
  emptyText: string;
}) {
  return (
    <KpiCard label={label} testId={`kpi-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      {user ? (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.userAvatar} alt={user.userName} />
            <AvatarFallback className="text-xs">
              {user.userName.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-900 truncate">{user.userName}</p>
            <p className="text-xs text-stone-500">{user.count} appreciations</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-stone-400 mt-2">{emptyText}</p>
      )}
    </KpiCard>
  );
}

function PointsCirculatedKpi({
  totals,
  currency,
}: {
  totals: AppreciationStats["totals"];
  currency: string;
}) {
  return (
    <KpiCard label="Points circulated" testId="kpi-points">
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-stone-900">
          {totals.pointsCirculated.toLocaleString()}
        </p>
        <Coins className="w-4 h-4 text-stone-400" />
      </div>
      <p className="text-xs text-stone-500 mt-1">
        {currency}
        {totals.pointsCirculated.toLocaleString()} value
      </p>
    </KpiCard>
  );
}

// ─── Trend chart ───────────────────────────────────────────────────────

function TrendCard({
  data,
  monetaryEnabled,
}: {
  data: AppreciationStats["monthlyTrend"];
  monetaryEnabled: boolean;
}) {
  const empty = data.every((d) => d.badges === 0 && d.points === 0);
  return (
    <Card className="border border-stone-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-stone-900">
          Month-wise trend
        </CardTitle>
        <p className="text-xs text-stone-500">Last 12 months</p>
      </CardHeader>
      <CardContent>
        {empty ? (
          <EmptyChart label="No appreciation data in the last 12 months" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="trend-badges" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a87a3a" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a87a3a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              {monetaryEnabled && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "#78716c" }}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                />
              )}
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="badges"
                name="Badges sent"
                stroke="#a87a3a"
                strokeWidth={2}
                fill="url(#trend-badges)"
                isAnimationActive={false}
              />
              {monetaryEnabled && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="points"
                  name="Points circulated"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  fillOpacity={0}
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Approval funnel ───────────────────────────────────────────────────

function ApprovalFunnelCard({ stats }: { stats: AppreciationStats }) {
  const { toast } = useToast();
  const total =
    stats.approval.approved + stats.approval.pending + stats.approval.rejected;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  return (
    <Card className="border border-stone-200">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold text-stone-900">Approval funnel</CardTitle>
          <p className="text-xs text-stone-500">
            {total === 0 ? "No requests yet" : `${total} request${total === 1 ? "" : "s"} in range`}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs"
          onClick={() =>
            toast({
              title: "Reminder sent",
              description: "Your approvers will see this in their next digest.",
            })
          }
          data-testid="approval-remind"
        >
          <BellRing className="w-3.5 h-3.5 mr-1.5" />
          Send reminder to approvers
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {total === 0 ? (
          <EmptyChart label="No approvals to show for this period" />
        ) : (
          <>
            <div>
              <div className="flex h-8 rounded-md overflow-hidden border border-stone-200">
                <FunnelSegment
                  flex={stats.approval.approved}
                  total={total}
                  color="bg-green-500"
                />
                <FunnelSegment
                  flex={stats.approval.pending}
                  total={total}
                  color="bg-amber-400"
                />
                <FunnelSegment
                  flex={stats.approval.rejected}
                  total={total}
                  color="bg-red-400"
                />
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-stone-600">
                <FunnelLegend
                  swatch="bg-green-500"
                  label="Approved"
                  count={stats.approval.approved}
                  pct={pct(stats.approval.approved)}
                />
                <FunnelLegend
                  swatch="bg-amber-400"
                  label="Pending"
                  count={stats.approval.pending}
                  pct={pct(stats.approval.pending)}
                />
                <FunnelLegend
                  swatch="bg-red-400"
                  label="Rejected"
                  count={stats.approval.rejected}
                  pct={pct(stats.approval.rejected)}
                />
              </div>
            </div>

            {stats.slowApprovers.length > 0 && (
              <div className="border-t border-stone-100 pt-3">
                <p className="text-xs font-medium text-stone-700 mb-2">
                  Slowest approvers
                </p>
                <div className="space-y-2">
                  {stats.slowApprovers.map((a) => (
                    <div key={a.userId} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={a.userAvatar} alt={a.userName} />
                        <AvatarFallback className="text-xs">
                          {a.userName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-stone-700 flex-1 truncate">
                        {a.userName}
                      </span>
                      <span className="text-xs text-stone-500">
                        {a.avgDecisionHours}h avg
                      </span>
                      {a.backlog > 0 && (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
                          {a.backlog} pending
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function FunnelSegment({
  flex,
  total,
  color,
}: {
  flex: number;
  total: number;
  color: string;
}) {
  if (flex === 0) return null;
  const pct = (flex / total) * 100;
  return <div className={color} style={{ width: `${pct}%` }} title={`${flex}`} />;
}

function FunnelLegend({
  swatch,
  label,
  count,
  pct,
}: {
  swatch: string;
  label: string;
  count: number;
  pct: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-sm ${swatch}`} />
      <span>
        {label} <span className="text-stone-400">·</span>{" "}
        <span className="font-medium text-stone-900">{count}</span>{" "}
        <span className="text-stone-400">({pct}%)</span>
      </span>
    </div>
  );
}

// ─── Department + Category charts ──────────────────────────────────────

function DepartmentChart({ data }: { data: AppreciationStats["byDepartment"] }) {
  const companyAvg =
    data.length === 0
      ? 0
      : data.reduce((s, d) => s + d.avgPerEmployee, 0) / data.length;
  const lowThreshold = companyAvg * 0.5;

  return (
    <Card className="border border-stone-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-stone-900">
          Recognition by department
        </CardTitle>
        <p className="text-xs text-stone-500">Avg badges per employee</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyChart label="No department data for this period" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="department"
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
                interval={0}
                height={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 12 }}
                formatter={(value: number) => [value, "Avg / employee"]}
              />
              <Bar dataKey="avgPerEmployee" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.avgPerEmployee < lowThreshold ? "#fca5a5" : "#a87a3a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

const CATEGORY_FILL: Record<RecognitionCategoryColor, string> = {
  blue: "#3b82f6",
  amber: "#f59e0b",
  stone: "#78716c",
  purple: "#a855f7",
  rose: "#f43f5e",
  green: "#22c55e",
  sky: "#0ea5e9",
  teal: "#14b8a6",
};

function CategoryChart({ data }: { data: AppreciationStats["byCategory"] }) {
  return (
    <Card className="border border-stone-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-stone-900">
          Top values used
        </CardTitle>
        <p className="text-xs text-stone-500">Top 6 categories by badge count</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyChart label="No category data for this period" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 16, left: 8, bottom: 5 }}
            >
              <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="categoryName"
                width={110}
                tick={{ fontSize: 11, fill: "#78716c" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e7e5e4", fontSize: 12 }}
                formatter={(value: number) => [value, "Badges"]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.color ? CATEGORY_FILL[d.color as RecognitionCategoryColor] : "#a87a3a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Underrecognized table ─────────────────────────────────────────────

function UnderrecognizedTable({
  data,
}: {
  data: AppreciationStats["underrecognized"];
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  return (
    <Card className="border border-stone-200">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-stone-50 text-left"
            data-testid="underrecognized-toggle"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  Underrecognized employees
                </p>
                <p className="text-xs text-stone-500">
                  {data.length} employee{data.length === 1 ? "" : "s"} received zero badges in this period
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-stone-100">
            {data.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500">
                Everyone received recognition in this period — nice.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Last received</TableHead>
                    <TableHead className="text-xs">Manager</TableHead>
                    <TableHead className="text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 25).map((u) => (
                    <TableRow key={u.userId}>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={u.userAvatar} alt={u.userName} />
                            <AvatarFallback className="text-xs">
                              {u.userName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-stone-900">{u.userName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-stone-600">{u.userRole}</TableCell>
                      <TableCell className="text-xs text-stone-600">{u.department}</TableCell>
                      <TableCell className="text-xs text-stone-500">
                        {u.lastReceivedAt ? timeAgo(u.lastReceivedAt) : "Never"}
                      </TableCell>
                      <TableCell className="text-xs text-stone-600">
                        {u.managerName ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          disabled={!u.managerName}
                          onClick={() =>
                            toast({
                              title: "Nudge queued",
                              description: `${u.managerName} will get a reminder to recognize ${u.userName}.`,
                            })
                          }
                        >
                          Nudge manager
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {data.length > 25 && (
              <p className="text-xs text-stone-400 text-center py-2">
                Showing 25 of {data.length} — sorted by longest without recognition
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// ─── Helpers + RnR placeholder ─────────────────────────────────────────

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-stone-400">
      <Sparkles className="w-6 h-6 mb-2" />
      <p className="text-xs">{label}</p>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

function RnRTabPlaceholder() {
  return (
    <Card className="border border-dashed border-stone-300 bg-stone-50">
      <CardContent className="p-12 text-center">
        <CheckCircle2 className="w-10 h-10 text-stone-400 mx-auto mb-3" />
        <p className="text-base font-semibold text-stone-900 mb-1">
          RnR dashboard coming in next update
        </p>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          Budgets, nominations, panel reviews, and winner pipelines will live here.
        </p>
      </CardContent>
    </Card>
  );
}
