import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  rewardsData,
  redemptionsData,
  type Reward,
  type RewardStatus,
  type Redemption,
  type RedemptionStatus,
} from "@/lib/hr-data";
import {
  Search,
  Plus,
  Gift,
  Star,
  ShoppingBag,
  Laptop,
  Dumbbell,
  BookOpen,
  Pencil,
  Archive,
  Download,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<RewardStatus, string> = {
  Available: "bg-green-100 text-green-700",
  "Out of Stock": "bg-red-100 text-red-700",
  Archived: "bg-muted text-muted-foreground",
};

const redemptionStatusColors: Record<RedemptionStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Fulfilled: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

const categoryIcons: Record<string, React.ElementType> = {
  "Gift Cards": Gift,
  Merchandise: ShoppingBag,
  Experiences: Star,
  Learning: BookOpen,
  Tech: Laptop,
  Wellness: Dumbbell,
};

const categories = ["All", "Gift Cards", "Merchandise", "Experiences", "Learning", "Tech", "Wellness"];

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function downloadCsv(reward: Reward, all: Redemption[]) {
  const rows = all
    .filter((r) => r.rewardId === reward.id)
    .sort((a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt));
  const header = ["ID", "Employee", "Department", "Status", "Points", "Requested at", "Fulfilled at"];
  const csv = [
    header.join(","),
    ...rows.map((r) =>
      [r.id, r.employeeName, r.department, r.status, r.points, r.requestedAt, r.fulfilledAt ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${reward.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-redemptions.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Rewards() {
  const { toast } = useToast();
  const [items, setItems] = useState<Reward[]>(rewardsData);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const filtered = items.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || r.category === catFilter;
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  function archive(id: string) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Archived" as RewardStatus } : r)));
    toast({ title: "Reward archived", description: "It will no longer be visible to employees." });
  }

  function handleDownload(reward: Reward) {
    downloadCsv(reward, redemptionsData);
    toast({ title: "Download started", description: `Full redemption history for "${reward.name}".` });
  }

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search rewards…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm border-border"
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="h-9 w-40 text-sm border-border">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-40 text-sm border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-9">
              <Plus className="w-4 h-4" /> Add Reward
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Add New Reward</SheetTitle>
              <SheetDescription>Create a new reward for employees to redeem with their points.</SheetDescription>
            </SheetHeader>
            <NewRewardForm onSubmit={() => {
              setSheetOpen(false);
              toast({ title: "Reward added", description: "Employees can now redeem this reward." });
            }} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {(["Available", "Out of Stock", "Archived"] as RewardStatus[]).map((s) => {
          const count = items.filter((r) => r.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${statusFilter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white text-muted-foreground hover:bg-muted"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${s === "Available" ? "bg-success" : s === "Out of Stock" ? "bg-destructive" : "bg-stone-400"}`} />
              {count} {s}
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((reward) => {
          const Icon = categoryIcons[reward.category] ?? Gift;
          const totalRedemptions = redemptionsData.filter((rd) => rd.rewardId === reward.id).length;
          return (
            <Card
              key={reward.id}
              onClick={() => setSelectedReward(reward)}
              className={`border border-border hover:border-border hover:shadow-sm transition-all cursor-pointer ${reward.status === "Archived" ? "opacity-60" : ""}`}
            >
              <CardContent className="p-0">
                {/* Icon area */}
                <div className="h-28 bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center rounded-t-xl border-b border-border">
                  <Icon className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground leading-snug">{reward.name}</p>
                    <Badge className={`text-xs shrink-0 ${statusColors[reward.status]}`} variant="secondary">
                      {reward.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-bold text-foreground">{reward.pointCost.toLocaleString()} pts</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {reward.stock > 0 ? `${reward.stock} left` : "0 left"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{totalRedemptions} redeemed</span>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-muted-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      {reward.status !== "Archived" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-muted-foreground">
                              <Archive className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Archive "{reward.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This reward will no longer be visible to employees. You can restore it later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => archive(reward.id)} className="bg-primary hover:bg-primary/90">
                                Archive
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
            No rewards match your filters.
          </div>
        )}
      </div>

      {/* Redemption History Sheet */}
      <Sheet open={!!selectedReward} onOpenChange={(open) => !open && setSelectedReward(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedReward && (
            <RedemptionHistorySheet
              reward={selectedReward}
              all={redemptionsData}
              onDownload={() => handleDownload(selectedReward)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Redemption History Sheet ────────────────────────────────────────────────

function RedemptionHistorySheet({
  reward,
  all,
  onDownload,
}: {
  reward: Reward;
  all: Redemption[];
  onDownload: () => void;
}) {
  const Icon = categoryIcons[reward.category] ?? Gift;
  const cutoff = Date.now() - THREE_MONTHS_MS;

  const { recent, older, monthlyAvg } = useMemo(() => {
    const forReward = all
      .filter((r) => r.rewardId === reward.id)
      .sort((a, b) => +new Date(b.requestedAt) - +new Date(a.requestedAt));
    const recent = forReward.filter((r) => +new Date(r.requestedAt) >= cutoff);
    const older = forReward.filter((r) => +new Date(r.requestedAt) < cutoff);
    // Avg redemptions per month over the available history
    const dates = forReward.map((r) => +new Date(r.requestedAt));
    let monthlyAvg = 0;
    if (forReward.length > 0) {
      const minMs = Math.min(...dates);
      const monthsSpan = Math.max(1, (Date.now() - minMs) / (30 * 24 * 60 * 60 * 1000));
      monthlyAvg = forReward.length / monthsSpan;
    }
    return { recent, older, monthlyAvg };
  }, [reward.id, all, cutoff]);

  const total = recent.length + older.length;

  return (
    <>
      <SheetHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base truncate">{reward.name}</SheetTitle>
              <SheetDescription className="text-xs">
                <span className="font-semibold text-muted-foreground">{reward.pointCost.toLocaleString()} pts</span> · {reward.category}
              </SheetDescription>
              <Badge variant="secondary" className={`mt-1.5 text-xs ${statusColors[reward.status]}`}>
                {reward.status}
              </Badge>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-2 border-border text-muted-foreground shrink-0"
            onClick={onDownload}
            disabled={total === 0}
          >
            <Download className="w-4 h-4" /> Download CSV
          </Button>
        </div>
      </SheetHeader>

      {/* Stats row */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <StatTile label="All-time" value={total} />
        <StatTile label="Last 3 months" value={recent.length} accent={recent.length > 0 ? "text-green-600" : "text-foreground"} />
        <StatTile label="Avg / month" value={monthlyAvg.toFixed(1)} />
      </div>

      {/* Banner */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-info/15 bg-info/10 px-3 py-2">
        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
        <p className="text-xs text-info">
          Showing <span className="font-semibold">{recent.length}</span> redemption{recent.length === 1 ? "" : "s"} from the last 3 months.
          {older.length > 0 && (
            <> {older.length} older record{older.length === 1 ? "" : "s"} available — use <span className="font-semibold">Download CSV</span> for the full history.</>
          )}
        </p>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="text-xs font-semibold text-muted-foreground">Employee</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Department</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Redeemed on</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map((r) => (
              <TableRow key={r.id} className="hover:bg-muted">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={r.employeeAvatar} />
                      <AvatarFallback className="text-xs">{r.employeeName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-foreground">{r.employeeName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{r.department}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{fmtDate(r.requestedAt)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`text-xs ${redemptionStatusColors[r.status]}`}>
                    {r.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs font-semibold text-foreground tabular-nums">
                  −{r.points.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {recent.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                  {total === 0
                    ? "No redemptions for this reward yet."
                    : `No redemptions in the last 3 months. ${older.length} older record${older.length === 1 ? "" : "s"} available via Download.`}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function StatTile({ label, value, accent = "text-foreground" }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted p-3">
      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-xl font-bold mt-0.5 ${accent}`}>{value}</p>
    </div>
  );
}

function NewRewardForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Reward Name</Label>
        <Input placeholder="e.g. $50 Amazon Gift Card" className="h-9 text-sm border-border" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Description</Label>
        <Textarea placeholder="Brief description of the reward…" className="text-sm border-border resize-none" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Category</Label>
          <Select>
            <SelectTrigger className="h-9 text-sm border-border">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {["Gift Cards", "Merchandise", "Experiences", "Learning", "Tech", "Wellness"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Point Cost</Label>
          <Input type="number" placeholder="e.g. 500" min={1} className="h-9 text-sm border-border" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Stock Quantity</Label>
        <Input type="number" placeholder="e.g. 25" min={0} className="h-9 text-sm border-border" />
      </div>
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        Add Reward
      </Button>
    </form>
  );
}
