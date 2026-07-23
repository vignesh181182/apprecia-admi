import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { redemptionsData, type Redemption } from "@/lib/hr-data";
import { Ban, Package, Star, Wallet, Users, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { getAccount } from "@/lib/account";
import { isMonetaryActive } from "@/lib/appreciation-policy";

type Range = "30d" | "90d" | "all";

const RANGES: { id: Range; label: string; days: number | null }[] = [
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
  { id: "all", label: "All time", days: null },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Redemptions() {
  const [account, setAccount] = useState(getAccount());
  const [range, setRange] = useState<Range>("90d");

  useEffect(() => {
    function refresh() {
      setAccount(getAccount());
    }
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  if (!isMonetaryActive(account)) {
    return (
      <div className="p-6">
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center text-center gap-3 py-14 px-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Ban className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground">
              Redemptions are disabled
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              Monetary recognition is currently off at the org level. Re-enable it in{" "}
              <Link
                to="/appreciation-policy"
                className="text-foreground underline underline-offset-2 font-medium"
              >
                Appreciation → Appreciation Policy
              </Link>{" "}
              to start accepting employee redemptions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currency = account?.currency ?? "₹";
  const pv = account?.appreciationPolicy?.pointValue;
  const pointRate = pv && pv.points > 0 ? pv.amount / pv.points : 1;

  const inRange = useMemo<Redemption[]>(() => {
    const days = RANGES.find((r) => r.id === range)?.days ?? null;
    if (days === null) return redemptionsData;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return redemptionsData.filter(
      (r) => new Date(r.requestedAt).getTime() >= cutoff,
    );
  }, [range]);

  // Phase 1.10 — every row in the marketplace ledger is a completed purchase.
  // No approval workflow exists, so we don't differentiate status anywhere.
  const purchases = inRange;
  const totalPts = purchases.reduce((s, r) => s + r.points, 0);
  const totalMoney = Math.round(totalPts * pointRate);
  const uniqueRedeemers = new Set(purchases.map((r) => r.employeeId)).size;
  const avgPts =
    purchases.length > 0 ? Math.round(totalPts / purchases.length) : 0;
  const avgPerPerson =
    uniqueRedeemers === 0 ? 0 : purchases.length / uniqueRedeemers;
  const uniqueProducts = new Set(purchases.map((r) => r.rewardId)).size;

  const kpis = [
    {
      label: "Total redemptions",
      value: purchases.length.toLocaleString(),
      icon: Package,
      sub: `${uniqueProducts} distinct product${uniqueProducts === 1 ? "" : "s"}`,
    },
    {
      label: "Points redeemed",
      value: totalPts.toLocaleString(),
      icon: Star,
      sub: `Avg ${avgPts.toLocaleString()} pts / redemption`,
    },
    {
      label: "Money redeemed",
      value: `${currency}${totalMoney.toLocaleString()}`,
      icon: Wallet,
      sub:
        pointRate === 1
          ? `1 pt = ${currency}1`
          : `${currency}${pointRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} per pt`,
    },
    {
      label: "Active redeemers",
      value: uniqueRedeemers.toLocaleString(),
      icon: Users,
      sub: `${avgPerPerson.toFixed(1)} redemptions / person`,
    },
    {
      label: "Avg basket",
      value: `${currency}${Math.round(avgPts * pointRate).toLocaleString()}`,
      icon: ShoppingBag,
      sub: `${avgPts.toLocaleString()} pts per order`,
    },
  ];

  // Top products — group redemptions by rewardId.
  const productMap = new Map<
    string,
    { name: string; category: string; count: number; points: number }
  >();
  for (const r of purchases) {
    const entry = productMap.get(r.rewardId) ?? {
      name: r.rewardName,
      category: r.rewardCategory,
      count: 0,
      points: 0,
    };
    entry.count += 1;
    entry.points += r.points;
    productMap.set(r.rewardId, entry);
  }
  const topProducts = Array.from(productMap.entries())
    .map(([id, v]) => ({ id, ...v, money: Math.round(v.points * pointRate) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Top redeemers — group redemptions by employeeId.
  const redeemerMap = new Map<
    string,
    {
      name: string;
      avatar: string;
      department: string;
      count: number;
      points: number;
    }
  >();
  for (const r of purchases) {
    const entry = redeemerMap.get(r.employeeId) ?? {
      name: r.employeeName,
      avatar: r.employeeAvatar,
      department: r.department,
      count: 0,
      points: 0,
    };
    entry.count += 1;
    entry.points += r.points;
    redeemerMap.set(r.employeeId, entry);
  }
  const topRedeemers = Array.from(redeemerMap.entries())
    .map(([id, v]) => ({ id, ...v, money: Math.round(v.points * pointRate) }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 8);

  // Category breakdown.
  const categoryMap = new Map<string, { count: number; points: number }>();
  for (const r of purchases) {
    const e = categoryMap.get(r.rewardCategory) ?? { count: 0, points: 0 };
    e.count += 1;
    e.points += r.points;
    categoryMap.set(r.rewardCategory, e);
  }
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([name, v]) => ({
      name,
      ...v,
      money: Math.round(v.points * pointRate),
    }))
    .sort((a, b) => b.points - a.points);
  const maxCategoryPts = Math.max(1, ...categoryBreakdown.map((c) => c.points));

  // Department breakdown.
  const deptMap = new Map<string, { count: number; points: number }>();
  for (const r of purchases) {
    const e = deptMap.get(r.department) ?? { count: 0, points: 0 };
    e.count += 1;
    e.points += r.points;
    deptMap.set(r.department, e);
  }
  const deptBreakdown = Array.from(deptMap.entries())
    .map(([name, v]) => ({
      name,
      ...v,
      money: Math.round(v.points * pointRate),
    }))
    .sort((a, b) => b.points - a.points);
  const maxDeptPts = Math.max(1, ...deptBreakdown.map((d) => d.points));

  // Recent activity (last 5 purchases).
  const recent = [...purchases]
    .sort(
      (a, b) =>
        new Date(b.fulfilledAt ?? b.requestedAt).getTime() -
        new Date(a.fulfilledAt ?? a.requestedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="p-6 space-y-5">
      {/* Range filter */}
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              range === r.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map(({ label, value, icon: Icon, sub }) => (
          <Card key={label} className="border border-border">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  {label}
                </p>
                <p className="text-xl font-semibold text-foreground tabular-nums leading-tight mt-0.5">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top products + Top redeemers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-border">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">
                Most redeemed products
              </p>
              <p className="text-xs text-muted-foreground">
                Ranked by number of redemptions
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs text-right">Redeemed</TableHead>
                  <TableHead className="text-xs text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No redemptions in this range.
                    </TableCell>
                  </TableRow>
                ) : (
                  topProducts.map((p, i) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs tabular-nums text-muted-foreground w-4">
                            {i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm text-foreground truncate">
                              {p.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {p.category}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {p.count}×
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        <span className="text-foreground font-medium">
                          {currency}
                          {p.money.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          {" · "}
                          {p.points.toLocaleString()} pts
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">
                Top redeemers
              </p>
              <p className="text-xs text-muted-foreground">
                Ranked by total points redeemed
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="text-xs">Employee</TableHead>
                  <TableHead className="text-xs text-right">Count</TableHead>
                  <TableHead className="text-xs text-right">Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRedeemers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-sm text-muted-foreground py-8"
                    >
                      No redemptions in this range.
                    </TableCell>
                  </TableRow>
                ) : (
                  topRedeemers.map((emp, i) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs tabular-nums text-muted-foreground w-4">
                            {i + 1}
                          </span>
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={emp.avatar} />
                            <AvatarFallback className="text-xs">
                              {emp.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm text-foreground truncate">
                              {emp.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {emp.department}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {emp.count}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        <span className="text-foreground font-medium">
                          {currency}
                          {emp.money.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          {" · "}
                          {emp.points.toLocaleString()} pts
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Category + Department breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BreakdownCard
          title="By reward category"
          rows={categoryBreakdown}
          maxPts={maxCategoryPts}
          currency={currency}
        />
        <BreakdownCard
          title="By department"
          rows={deptBreakdown}
          maxPts={maxDeptPts}
          currency={currency}
        />
      </div>

      {/* Recent activity */}
      <Card className="border border-border">
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">
              Recent redemptions
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="text-xs">Employee</TableHead>
                <TableHead className="text-xs">Reward</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs text-right">Value</TableHead>
                <TableHead className="text-xs">Redeemed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-sm text-muted-foreground py-6"
                  >
                    No redemptions in this range.
                  </TableCell>
                </TableRow>
              ) : (
                recent.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={r.employeeAvatar} />
                          <AvatarFallback className="text-[10px]">
                            {r.employeeName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-foreground truncate">
                          {r.employeeName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {r.rewardName}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.rewardCategory}
                    </TableCell>
                    <TableCell className="text-right text-xs tabular-nums">
                      <span className="text-foreground font-medium">
                        {currency}
                        {Math.round(r.points * pointRate).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        {" · "}
                        {r.points.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(r.fulfilledAt ?? r.requestedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
  maxPts,
  currency,
}: {
  title: string;
  rows: { name: string; count: number; points: number; money: number }[];
  maxPts: number;
  currency: string;
}) {
  return (
    <Card className="border border-border">
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No data in this range.
          </p>
        ) : (
          <div className="space-y-2.5">
            {rows.map((row) => {
              const pct = Math.round((row.points / maxPts) * 100);
              return (
                <div key={row.name}>
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-muted-foreground truncate">{row.name}</span>
                    <span className="tabular-nums shrink-0">
                      <span className="text-foreground font-medium">
                        {currency}
                        {row.money.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        {" · "}
                        {row.count}×
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-stone-700 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

