import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  checkIns as initialCheckIns,
  type CheckIn,
  type CheckInStatus,
  type Mood,
} from "@/lib/hr-data";
import {
  Search,
  Bell,
  Check,
  AlertCircle,
  ClipboardList,
  ClipboardCheck,
  Hourglass,
  CalendarX,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<CheckInStatus, string> = {
  submitted: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  overdue: "bg-red-100 text-red-700",
};

const statusLabels: Record<CheckInStatus, string> = {
  submitted: "Submitted",
  pending: "Pending",
  overdue: "Overdue",
};

const moodLabels: Record<Mood, string> = {
  1: "Struggling",
  2: "Tough week",
  3: "OK",
  4: "Good",
  5: "Great",
};

const moodColors: Record<Mood, string> = {
  1: "bg-red-500",
  2: "bg-amber-500",
  3: "bg-stone-400",
  4: "bg-emerald-400",
  5: "bg-green-500",
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(s: string) {
  return new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function CheckIns() {
  const { toast } = useToast();
  const [items, setItems] = useState<CheckIn[]>(initialCheckIns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CheckInStatus>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [selected, setSelected] = useState<CheckIn | null>(null);
  const [draftComment, setDraftComment] = useState("");

  const departments = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => i.department))).sort()],
    [items]
  );

  const counts = {
    total: items.length,
    submitted: items.filter((i) => i.status === "submitted").length,
    pending: items.filter((i) => i.status === "pending").length,
    overdue: items.filter((i) => i.status === "overdue").length,
  };

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchSearch = !search || i.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || i.status === statusFilter;
      const matchDept = deptFilter === "all" || i.department === deptFilter;
      return matchSearch && matchStatus && matchDept;
    });
  }, [items, search, statusFilter, deptFilter]);

  function openSheet(c: CheckIn) {
    setSelected(c);
    setDraftComment(c.managerComment ?? "");
  }

  function saveComment() {
    if (!selected) return;
    setItems((prev) =>
      prev.map((i) => (i.id === selected.id ? { ...i, managerComment: draftComment, managerViewed: true } : i))
    );
    setSelected({ ...selected, managerComment: draftComment, managerViewed: true });
    toast({ title: "Comment saved", description: `Reply sent to ${selected.employeeName}.` });
  }

  function sendReminders() {
    const targets = items.filter((i) => i.status !== "submitted").length;
    toast({
      title: "Reminders sent",
      description: `Pinged ${targets} ${targets === 1 ? "person" : "people"} who haven't checked in yet.`,
    });
  }

  return (
    <div className="p-6 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total this week" value={counts.total} icon={<ClipboardList className="w-4 h-4" />} />
        <KpiCard label="Submitted" value={counts.submitted} icon={<ClipboardCheck className="w-4 h-4" />} accent="text-green-600" />
        <KpiCard label="Pending" value={counts.pending} icon={<Hourglass className="w-4 h-4" />} accent="text-amber-600" />
        <KpiCard label="Overdue" value={counts.overdue} icon={<CalendarX className="w-4 h-4" />} accent="text-red-600" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Search by employee name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm border-stone-200"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "submitted", "pending", "overdue"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                }`}
              >
                {s === "all" ? "All" : statusLabels[s as CheckInStatus]}
              </button>
            ))}
          </div>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-9 w-44 text-sm border-stone-200">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>{d === "all" ? "All departments" : d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-9 gap-2 text-stone-600 hover:text-stone-900"
          onClick={sendReminders}
        >
          <Bell className="w-4 h-4" /> Send reminder
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-stone-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-stone-50 hover:bg-stone-50">
              <TableHead className="text-xs font-semibold text-stone-600">Employee</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Week of</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Mood</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Wins</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Blockers</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Status</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600">Manager viewed</TableHead>
              <TableHead className="text-xs font-semibold text-stone-600 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id} className="hover:bg-stone-50 cursor-pointer" onClick={() => openSheet(c)}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-700">
                      {c.employeeAvatar}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-stone-900">{c.employeeName}</p>
                      <p className="text-xs text-stone-500">{c.department}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-stone-700">{fmtDate(c.weekOf)}</TableCell>
                <TableCell>
                  {c.status === "submitted" ? <MoodDots mood={c.mood} /> : <span className="text-xs text-stone-300">—</span>}
                </TableCell>
                <TableCell>
                  {c.wins.length > 0 ? (
                    <Badge variant="secondary" className="text-xs bg-stone-100 text-stone-700">{c.wins.length}</Badge>
                  ) : (
                    <span className="text-xs text-stone-300">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {c.blockers ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    </span>
                  ) : (
                    <span className="text-xs text-stone-300">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={`text-xs ${statusColors[c.status]}`}>
                    {statusLabels[c.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {c.managerViewed ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <span className="text-xs text-stone-300">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-stone-500 hover:text-stone-900"
                    onClick={() => openSheet(c)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-stone-500 py-10">
                  No check-ins match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-12 w-12 rounded-full bg-stone-200 flex items-center justify-center text-sm font-semibold text-stone-700">
                    {selected.employeeAvatar}
                  </div>
                  <div>
                    <SheetTitle className="text-base">{selected.employeeName}</SheetTitle>
                    <SheetDescription className="text-xs">
                      {selected.department} · Week of {fmtDate(selected.weekOf)}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {selected.status !== "submitted" ? (
                <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-6 text-center">
                  <Hourglass className="w-6 h-6 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-stone-700">
                    {selected.status === "overdue" ? "Check-in is overdue" : "Check-in pending"}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {selected.employeeName} hasn't submitted yet for this week.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mood */}
                  <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Mood</p>
                        <p className="text-lg font-bold text-stone-900 mt-0.5">{moodLabels[selected.mood]}</p>
                      </div>
                      <MoodDots mood={selected.mood} />
                    </div>
                  </div>

                  {/* Wins */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">Wins</p>
                    <ul className="space-y-1.5">
                      {selected.wins.map((w, i) => (
                        <li key={i} className="text-sm text-stone-700 flex gap-2">
                          <span className="text-green-600 mt-0.5">●</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Priorities */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">Priorities for next week</p>
                    <ul className="space-y-1.5">
                      {selected.priorities.map((p, i) => (
                        <li key={i} className="text-sm text-stone-700 flex gap-2">
                          <span className="text-stone-400 mt-0.5">●</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Blockers */}
                  {selected.blockers && (
                    <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-red-900 uppercase tracking-wide">Blocker</p>
                          <p className="text-sm text-red-900 mt-0.5">{selected.blockers}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission meta */}
                  <p className="text-xs text-stone-400 mt-4">
                    Submitted {selected.submittedAt ? fmtDateTime(selected.submittedAt) : "—"}
                  </p>

                  {/* Manager comment */}
                  <div className="mt-6 pt-4 border-t border-stone-200 space-y-2">
                    <Label className="text-xs font-medium text-stone-700">Manager comment</Label>
                    <Textarea
                      value={draftComment}
                      onChange={(e) => setDraftComment(e.target.value)}
                      placeholder="Reply or leave a note for the team…"
                      rows={4}
                      className="text-sm border-stone-200 resize-none"
                    />
                    <Button
                      onClick={saveComment}
                      className="w-full bg-stone-900 hover:bg-stone-700 text-white"
                      disabled={draftComment.trim() === (selected.managerComment ?? "").trim()}
                    >
                      Save reply
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function KpiCard({ label, value, icon, accent = "text-stone-900" }: { label: string; value: number; icon: React.ReactNode; accent?: string }) {
  return (
    <Card className="border border-stone-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">{label}</p>
          <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">{icon}</div>
        </div>
        <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function MoodDots({ mood }: { mood: Mood }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`w-2 h-2 rounded-full ${n <= mood ? moodColors[mood] : "bg-stone-200"}`}
        />
      ))}
    </div>
  );
}
