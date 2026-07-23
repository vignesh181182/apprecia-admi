import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  budgetSettings as initialBudget,
  departmentAllocations as initialAllocations,
  allowanceTiers as initialTiers,
  pointTransactions as initialTxns,
  type BudgetSettings,
  type DepartmentAllocation,
  type AllowanceTier,
  type PointTransaction,
  type TxnType,
  type AdjustmentReason,
  type CyclePeriod,
} from "@/lib/hr-data";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  Calendar,
  Plus,
  Pencil,
  Check,
  X,
  Search,
  Filter,
  Settings as SettingsIcon,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const txnTypeColors: Record<TxnType, string> = {
  Recognition: "bg-blue-100 text-blue-700",
  Redemption: "bg-pink-100 text-pink-700",
  "Top-up": "bg-green-100 text-green-700",
  Adjustment: "bg-amber-100 text-amber-700",
  Reset: "bg-muted text-muted-foreground",
  Allowance: "bg-purple-100 text-purple-700",
};

const reasonLabels: Record<AdjustmentReason, string> = {
  "monthly-allowance": "Monthly allowance",
  "manual-topup": "Manual top-up",
  "manual-deduction": "Manual deduction",
  "cycle-reset": "Cycle reset",
  "campaign-bonus": "Campaign bonus",
  correction: "Correction",
};

function fmtPts(n: number) {
  return n.toLocaleString();
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(s: string) {
  return new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function daysUntil(dateStr: string) {
  const ms = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export default function Budget() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BudgetSettings>(initialBudget);
  const [allocations, setAllocations] = useState<DepartmentAllocation[]>(initialAllocations);
  const [tiers, setTiers] = useState<AllowanceTier[]>(initialTiers);
  const [txns, setTxns] = useState<PointTransaction[]>(initialTxns);

  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [draftAlloc, setDraftAlloc] = useState<number>(0);

  const [cycleSheetOpen, setCycleSheetOpen] = useState(false);
  const [allowanceSheetOpen, setAllowanceSheetOpen] = useState(false);
  const [adjustSheetOpen, setAdjustSheetOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [directionFilter, setDirectionFilter] = useState<string>("all");

  // ─── KPIs ────────────────────────────────────────────────────────────
  const totalAllocated = allocations.reduce((s, a) => s + a.allocated, 0);
  const totalUsed = allocations.reduce((s, a) => s + a.used, 0);
  const remaining = settings.totalBudget - totalUsed;
  const allocatedPct = Math.round((totalAllocated / settings.totalBudget) * 100);
  const spentPct = Math.round((totalUsed / settings.totalBudget) * 100);
  const cycleDaysLeft = daysUntil(settings.cycleEndDate);

  // ─── Filtered ledger ─────────────────────────────────────────────────
  const filteredTxns = useMemo(() => {
    return txns.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (t.fromName?.toLowerCase().includes(q) ?? false) ||
        (t.toName?.toLowerCase().includes(q) ?? false) ||
        (t.scopeName?.toLowerCase().includes(q) ?? false) ||
        (t.reasonNote?.toLowerCase().includes(q) ?? false);
      const matchType = typeFilter === "all" || t.type === typeFilter;
      const matchDir = directionFilter === "all" || t.direction === directionFilter;
      return matchSearch && matchType && matchDir;
    });
  }, [txns, search, typeFilter, directionFilter]);

  // ─── Handlers ────────────────────────────────────────────────────────
  function startEdit(dept: string, current: number) {
    setEditingDept(dept);
    setDraftAlloc(current);
  }

  function saveEdit() {
    if (!editingDept) return;
    setAllocations((prev) => prev.map((a) => (a.department === editingDept ? { ...a, allocated: draftAlloc } : a)));
    setEditingDept(null);
    toast({ title: "Allocation updated", description: `${editingDept} now has ${fmtPts(draftAlloc)} pts.` });
  }

  function cancelEdit() {
    setEditingDept(null);
  }

  function saveCycle(next: BudgetSettings) {
    setSettings(next);
    setCycleSheetOpen(false);
    toast({ title: "Cycle settings saved", description: `Budget cycle is now ${next.cycle.toLowerCase()}.` });
  }

  function saveTiers(nextDefault: number, nextTiers: AllowanceTier[]) {
    setSettings((s) => ({ ...s, defaultEmployeeAllowance: nextDefault }));
    setTiers(nextTiers);
    setAllowanceSheetOpen(false);
    toast({ title: "Allowance updated", description: "Per-tier give-allowances saved." });
  }

  function applyAdjustment(txn: PointTransaction) {
    setTxns((prev) => [txn, ...prev]);
    setAdjustSheetOpen(false);
    toast({
      title: txn.direction === "credit" ? "Top-up applied" : "Adjustment applied",
      description: `${txn.direction === "credit" ? "+" : "−"}${fmtPts(txn.amount)} pts to ${txn.scopeName ?? "org"}.`,
    });
  }

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Cycle: <span className="font-semibold text-muted-foreground">{settings.cycle}</span> · {fmtDate(settings.cycleStartDate)} → {fmtDate(settings.cycleEndDate)} · resets in {cycleDaysLeft} days
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-2 border-border text-muted-foreground"
            onClick={() => setCycleSheetOpen(true)}
          >
            <SettingsIcon className="w-4 h-4" /> Cycle Settings
          </Button>
          <Button
            size="sm"
            className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setAdjustSheetOpen(true)}
          >
            <Plus className="w-4 h-4" /> Manual Adjustment
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total Budget"
          value={fmtPts(settings.totalBudget)}
          unit="pts"
          icon={<Wallet className="w-4 h-4" />}
        />
        <KpiCard
          label="Allocated"
          value={fmtPts(totalAllocated)}
          unit={`pts · ${allocatedPct}%`}
          icon={<Coins className="w-4 h-4" />}
        />
        <KpiCard
          label="Spent"
          value={fmtPts(totalUsed)}
          unit={`pts · ${spentPct}%`}
          icon={<TrendingDown className="w-4 h-4" />}
          accent={spentPct >= 80 ? "text-red-600" : "text-foreground"}
        />
        <KpiCard
          label="Remaining"
          value={fmtPts(remaining)}
          unit="pts"
          icon={<TrendingUp className="w-4 h-4" />}
          accent={remaining < settings.totalBudget * 0.2 ? "text-amber-600" : "text-green-600"}
        />
      </div>

      {/* Department Allocations */}
      <Card className="border border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <p className="text-sm font-semibold text-foreground">Department Allocations</p>
            <p className="text-xs text-muted-foreground mt-0.5">Click the pencil to edit any department's allocation.</p>
          </div>
          <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
            {allocations.length} departments
          </Badge>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="text-xs font-semibold text-muted-foreground">Department</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Headcount</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Allocated</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Used</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Remaining</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground w-44">Utilization</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((a) => {
                  const pct = a.allocated > 0 ? Math.round((a.used / a.allocated) * 100) : 0;
                  const left = a.allocated - a.used;
                  const isEditing = editingDept === a.department;
                  return (
                    <TableRow key={a.department} className="hover:bg-muted">
                      <TableCell className="text-xs font-medium text-foreground">{a.department}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{a.headcount}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={draftAlloc}
                            onChange={(e) => setDraftAlloc(Number(e.target.value))}
                            className="h-7 w-28 text-xs border-border"
                            min={0}
                            autoFocus
                          />
                        ) : (
                          <span className="text-xs font-semibold text-foreground">{fmtPts(a.allocated)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtPts(a.used)}</TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{fmtPts(left)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={pct}
                            className={`h-1.5 flex-1 ${pct >= 90 ? "[&>div]:bg-destructive" : pct >= 70 ? "[&>div]:bg-primary" : ""}`}
                          />
                          <span className={`text-xs font-medium tabular-nums ${pct >= 90 ? "text-destructive" : "text-muted-foreground"}`}>
                            {pct}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-success hover:text-success hover:bg-success/10" onClick={saveEdit}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-muted-foreground" onClick={cancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-muted-foreground"
                            onClick={() => startEdit(a.department, a.allocated)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total allocated across departments: <span className="font-semibold text-muted-foreground">{fmtPts(totalAllocated)} pts</span></span>
            <span>
              Org budget: <span className="font-semibold text-muted-foreground">{fmtPts(settings.totalBudget)} pts</span> ·{" "}
              <span className={totalAllocated > settings.totalBudget ? "text-destructive font-semibold" : "text-muted-foreground"}>
                {totalAllocated > settings.totalBudget ? `Over by ${fmtPts(totalAllocated - settings.totalBudget)} pts` : `${fmtPts(settings.totalBudget - totalAllocated)} unallocated`}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Per-Employee Allowance */}
      <Card className="border border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <div>
            <p className="text-sm font-semibold text-foreground">Per-Employee Give-Allowance</p>
            <p className="text-xs text-muted-foreground mt-0.5">Points each employee can give per cycle, by badge tier.</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-2 text-xs border-border text-muted-foreground"
            onClick={() => setAllowanceSheetOpen(true)}
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="rounded-lg border border-border bg-muted p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Default</p>
              <p className="text-xl font-bold text-foreground">{fmtPts(settings.defaultEmployeeAllowance)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">pts / {settings.cycle.toLowerCase().replace("ly", "")}</p>
            </div>
            {tiers.map((t) => (
              <div key={t.level} className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">{t.level}</p>
                <p className="text-xl font-bold text-foreground">{fmtPts(t.monthlyAllowance)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">pts / {settings.cycle.toLowerCase().replace("ly", "")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Ledger */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Transaction Ledger</p>
              <p className="text-xs text-muted-foreground mt-0.5">Every point movement — recognitions, redemptions, top-ups, adjustments.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search ledger…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm border-border w-full sm:w-56"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-36 text-sm border-border">
                  <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {(["Recognition", "Redemption", "Top-up", "Adjustment", "Allowance", "Reset"] as TxnType[]).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={directionFilter} onValueChange={setDirectionFilter}>
                <SelectTrigger className="h-9 w-36 text-sm border-border">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All directions</SelectItem>
                  <SelectItem value="credit">Credits (+)</SelectItem>
                  <SelectItem value="debit">Debits (−)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="text-xs font-semibold text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">From → To</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Scope</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Reason</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Actor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTxns.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(t.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${txnTypeColors[t.type]}`} variant="secondary">
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-semibold flex items-center gap-1 ${t.direction === "credit" ? "text-success" : "text-foreground"}`}>
                        {t.direction === "credit" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {t.direction === "credit" ? "+" : "−"}{fmtPts(t.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {t.fromName && t.toName ? (
                        <span><span className="text-muted-foreground">{t.fromName}</span> → <span className="font-medium">{t.toName}</span></span>
                      ) : t.toName ? (
                        <span>→ <span className="font-medium">{t.toName}</span></span>
                      ) : t.fromName ? (
                        <span><span className="text-muted-foreground">{t.fromName}</span> →</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="capitalize text-muted-foreground">{t.scope}</span>
                      {t.scopeName && <span> · {t.scopeName}</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {t.reasonCode && (
                        <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground mr-1">
                          {reasonLabels[t.reasonCode]}
                        </Badge>
                      )}
                      <span className="text-muted-foreground">{t.reasonNote ?? "—"}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.adminName ?? "—"}</TableCell>
                  </TableRow>
                ))}
                {filteredTxns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                      No transactions match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cycle Settings Sheet */}
      <Sheet open={cycleSheetOpen} onOpenChange={setCycleSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Cycle Settings</SheetTitle>
            <SheetDescription>Configure the budget cycle period, total budget, and reset cadence.</SheetDescription>
          </SheetHeader>
          <CycleSettingsForm initial={settings} onSubmit={saveCycle} />
        </SheetContent>
      </Sheet>

      {/* Allowance Sheet */}
      <Sheet open={allowanceSheetOpen} onOpenChange={setAllowanceSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Give-Allowance</SheetTitle>
            <SheetDescription>Set how many points each employee can give per cycle, by badge tier.</SheetDescription>
          </SheetHeader>
          <AllowanceForm
            initialDefault={settings.defaultEmployeeAllowance}
            initialTiers={tiers}
            onSubmit={saveTiers}
          />
        </SheetContent>
      </Sheet>

      {/* Manual Adjustment Sheet */}
      <Sheet open={adjustSheetOpen} onOpenChange={setAdjustSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Manual Adjustment</SheetTitle>
            <SheetDescription>Top up or deduct points at the org, department, or employee level.</SheetDescription>
          </SheetHeader>
          <AdjustmentForm departments={allocations.map((a) => a.department)} onSubmit={applyAdjustment} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  unit,
  icon,
  accent = "text-foreground",
}: {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">{icon}</div>
        </div>
        <p className={`text-2xl font-bold ${accent}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{unit}</p>
      </CardContent>
    </Card>
  );
}

function CycleSettingsForm({ initial, onSubmit }: { initial: BudgetSettings; onSubmit: (next: BudgetSettings) => void }) {
  const [draft, setDraft] = useState<BudgetSettings>(initial);

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(draft);
      }}
    >
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Total Org Budget (pts)</Label>
        <Input
          type="number"
          value={draft.totalBudget}
          onChange={(e) => setDraft({ ...draft, totalBudget: Number(e.target.value) })}
          className="h-9 text-sm border-border"
          min={0}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Cycle Period</Label>
        <Select value={draft.cycle} onValueChange={(v) => setDraft({ ...draft, cycle: v as CyclePeriod })}>
          <SelectTrigger className="h-9 text-sm border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Monthly">Monthly</SelectItem>
            <SelectItem value="Quarterly">Quarterly</SelectItem>
            <SelectItem value="Annually">Annually</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Cycle Start</Label>
          <Input
            type="date"
            value={draft.cycleStartDate}
            onChange={(e) => setDraft({ ...draft, cycleStartDate: e.target.value })}
            className="h-9 text-sm border-border"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Cycle End</Label>
          <Input
            type="date"
            value={draft.cycleEndDate}
            onChange={(e) => setDraft({ ...draft, cycleEndDate: e.target.value })}
            className="h-9 text-sm border-border"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Reset Day of Month</Label>
        <Input
          type="number"
          min={1}
          max={28}
          value={draft.resetDayOfMonth}
          onChange={(e) => setDraft({ ...draft, resetDayOfMonth: Number(e.target.value) })}
          className="h-9 text-sm border-border"
        />
        <p className="text-xs text-muted-foreground">Day of month when employee allowances reset.</p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
        <div>
          <p className="text-xs font-medium text-foreground">Auto-reset allowances</p>
          <p className="text-xs text-muted-foreground">Restore everyone's give-allowance on each cycle reset.</p>
        </div>
        <Switch checked={draft.autoReset} onCheckedChange={(v) => setDraft({ ...draft, autoReset: v })} />
      </div>

      <div className="pt-2 flex items-center gap-2 rounded-lg border border-info/15 bg-info/10 px-3 py-2">
        <Calendar className="w-4 h-4 text-info shrink-0" />
        <p className="text-xs text-info">
          Cycle resets in <span className="font-semibold">{daysUntil(draft.cycleEndDate)} days</span>.
        </p>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        Save Cycle Settings
      </Button>
    </form>
  );
}

function AllowanceForm({
  initialDefault,
  initialTiers,
  onSubmit,
}: {
  initialDefault: number;
  initialTiers: AllowanceTier[];
  onSubmit: (defaultAllowance: number, tiers: AllowanceTier[]) => void;
}) {
  const [defaultAllowance, setDefaultAllowance] = useState<number>(initialDefault);
  const [tiers, setTiers] = useState<AllowanceTier[]>(initialTiers);

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(defaultAllowance, tiers);
      }}
    >
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Default Allowance (pts / cycle)</Label>
        <Input
          type="number"
          value={defaultAllowance}
          onChange={(e) => setDefaultAllowance(Number(e.target.value))}
          className="h-9 text-sm border-border"
          min={0}
        />
        <p className="text-xs text-muted-foreground">Applied to anyone without a tier-specific override.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">Per-Tier Overrides</Label>
        <div className="space-y-2">
          {tiers.map((t, idx) => (
            <div key={t.level} className="grid grid-cols-3 gap-2 items-center">
              <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground justify-self-start">
                {t.level}
              </Badge>
              <Input
                type="number"
                value={t.monthlyAllowance}
                onChange={(e) =>
                  setTiers((prev) =>
                    prev.map((p, i) => (i === idx ? { ...p, monthlyAllowance: Number(e.target.value) } : p))
                  )
                }
                className="h-9 text-sm border-border col-span-2"
                min={0}
              />
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        Save Allowance
      </Button>
    </form>
  );
}

function AdjustmentForm({
  departments,
  onSubmit,
}: {
  departments: string[];
  onSubmit: (txn: PointTransaction) => void;
}) {
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [scope, setScope] = useState<"org" | "department" | "employee">("department");
  const [scopeName, setScopeName] = useState<string>(departments[0] ?? "");
  const [amount, setAmount] = useState<number>(500);
  const [reasonCode, setReasonCode] = useState<AdjustmentReason>("manual-topup");
  const [reasonNote, setReasonNote] = useState<string>("");

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const txn: PointTransaction = {
          id: `t${Date.now()}`,
          type: direction === "credit" ? "Top-up" : "Adjustment",
          direction,
          amount,
          scope,
          scopeName: scope === "org" ? "Acme Corp" : scopeName,
          reasonCode,
          reasonNote: reasonNote.trim() || undefined,
          adminName: "Vignesh (HR Admin)",
          createdAt: new Date().toISOString(),
        };
        onSubmit(txn);
      }}
    >
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Direction</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setDirection("credit");
              setReasonCode("manual-topup");
            }}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              direction === "credit"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5 inline mr-1.5" /> Credit (top-up)
          </button>
          <button
            type="button"
            onClick={() => {
              setDirection("debit");
              setReasonCode("manual-deduction");
            }}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              direction === "debit"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 inline mr-1.5" /> Debit (deduct)
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Scope</Label>
        <Select value={scope} onValueChange={(v) => setScope(v as "org" | "department" | "employee")}>
          <SelectTrigger className="h-9 text-sm border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="org">Whole organization</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="employee">Individual employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {scope === "department" && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Department</Label>
          <Select value={scopeName} onValueChange={setScopeName}>
            <SelectTrigger className="h-9 text-sm border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {scope === "employee" && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Employee</Label>
          <Input
            placeholder="Employee name…"
            value={scopeName}
            onChange={(e) => setScopeName(e.target.value)}
            className="h-9 text-sm border-border"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Amount (pts)</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="h-9 text-sm border-border"
          min={1}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Reason Code</Label>
        <Select value={reasonCode} onValueChange={(v) => setReasonCode(v as AdjustmentReason)}>
          <SelectTrigger className="h-9 text-sm border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {direction === "credit" ? (
              <>
                <SelectItem value="manual-topup">Manual top-up</SelectItem>
                <SelectItem value="campaign-bonus">Campaign bonus</SelectItem>
                <SelectItem value="correction">Correction</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="manual-deduction">Manual deduction</SelectItem>
                <SelectItem value="correction">Correction</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Note (optional)</Label>
        <Textarea
          value={reasonNote}
          onChange={(e) => setReasonNote(e.target.value)}
          placeholder="Add context for the audit log…"
          className="text-sm border-border resize-none"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        Apply {direction === "credit" ? "Top-up" : "Adjustment"}
      </Button>
    </form>
  );
}
