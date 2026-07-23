import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  oneOnOnes as initialMeetings,
  employeesData,
  type OneOnOne,
  type OneOnOneStatus,
  type AgendaItem,
  type ActionItem,
} from "@/lib/hr-data";
import {
  Search,
  Plus,
  MessageSquare,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  X,
  ArrowRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<OneOnOneStatus, string> = {
  scheduled: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-muted text-muted-foreground",
  overdue: "bg-red-100 text-red-700",
};

const statusLabels: Record<OneOnOneStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  overdue: "Overdue",
};

function fmtDateTime(s: string) {
  return new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(dueDate: string) {
  return new Date(dueDate).getTime() < Date.now();
}

function thisMonth(date: string) {
  const d = new Date(date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export default function OneOnOnes() {
  const { toast } = useToast();
  const [items, setItems] = useState<OneOnOne[]>(initialMeetings);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OneOnOneStatus>("all");
  const [selected, setSelected] = useState<OneOnOne | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const counts = {
    total: items.length,
    scheduled: items.filter((i) => i.status === "scheduled").length,
    completedThisMonth: items.filter((i) => i.status === "completed" && thisMonth(i.scheduledAt)).length,
    overdue: items.filter((i) => i.status === "overdue").length,
  };

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q || i.managerName.toLowerCase().includes(q) || i.employeeName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || i.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  function toggleAgenda(meetingId: string, agendaId: string) {
    setItems((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? { ...m, agendaItems: m.agendaItems.map((a) => (a.id === agendaId ? { ...a, checked: !a.checked } : a)) }
          : m
      )
    );
    setSelected((s) =>
      s && s.id === meetingId
        ? { ...s, agendaItems: s.agendaItems.map((a) => (a.id === agendaId ? { ...a, checked: !a.checked } : a)) }
        : s
    );
  }

  function toggleAction(meetingId: string, actionId: string) {
    setItems((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? { ...m, actionItems: m.actionItems.map((a) => (a.id === actionId ? { ...a, done: !a.done } : a)) }
          : m
      )
    );
    setSelected((s) =>
      s && s.id === meetingId
        ? { ...s, actionItems: s.actionItems.map((a) => (a.id === actionId ? { ...a, done: !a.done } : a)) }
        : s
    );
  }

  function saveNotes(meetingId: string, notes: string) {
    setItems((prev) => prev.map((m) => (m.id === meetingId ? { ...m, notes } : m)));
    setSelected((s) => (s && s.id === meetingId ? { ...s, notes } : s));
  }

  function addAction(meetingId: string, action: ActionItem) {
    setItems((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, actionItems: [...m.actionItems, action] } : m))
    );
    setSelected((s) => (s && s.id === meetingId ? { ...s, actionItems: [...s.actionItems, action] } : s));
    toast({ title: "Action item added", description: action.text });
  }

  function scheduleMeeting(m: OneOnOne) {
    setItems((prev) => [m, ...prev]);
    setScheduleOpen(false);
    toast({ title: "1-on-1 scheduled", description: `${m.managerName} ↔ ${m.employeeName} · ${fmtDateTime(m.scheduledAt)}` });
  }

  return (
    <div className="p-6 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total meetings" value={counts.total} icon={<MessageSquare className="w-4 h-4" />} />
        <KpiCard label="Scheduled" value={counts.scheduled} icon={<CalendarClock className="w-4 h-4" />} accent="text-primary" />
        <KpiCard label="Completed this month" value={counts.completedThisMonth} icon={<CheckCircle2 className="w-4 h-4" />} accent="text-success" />
        <KpiCard label="Overdue" value={counts.overdue} icon={<AlertTriangle className="w-4 h-4" />} accent="text-destructive" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by manager or employee…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm border-border"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "scheduled", "completed", "overdue"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {s === "all" ? "All" : statusLabels[s as OneOnOneStatus]}
              </button>
            ))}
          </div>
        </div>
        <Button
          size="sm"
          className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => setScheduleOpen(true)}
        >
          <Plus className="w-4 h-4" /> Schedule 1-on-1
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              <TableHead className="text-xs font-semibold text-muted-foreground">Manager → Employee</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Date & Time</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Duration</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Agenda</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Action items</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => {
              const overdueActions = m.actionItems.filter((a) => !a.done && isOverdue(a.dueDate)).length;
              return (
                <TableRow key={m.id} className="hover:bg-muted cursor-pointer" onClick={() => setSelected(m)}>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium text-foreground">{m.managerName}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium text-foreground">{m.employeeName}</span>
                      <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs ml-1">{m.department}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(m.scheduledAt)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.duration} min</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                      {m.agendaItems.length} {m.agendaItems.length === 1 ? "item" : "items"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                        {m.actionItems.length}
                      </Badge>
                      {overdueActions > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-destructive font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                          {overdueActions} overdue
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`text-xs ${statusColors[m.status]}`}>
                      {statusLabels[m.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setSelected(m)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                  No 1-on-1s match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <ViewSheet
              meeting={selected}
              onToggleAgenda={(aid) => toggleAgenda(selected.id, aid)}
              onToggleAction={(aid) => toggleAction(selected.id, aid)}
              onSaveNotes={(notes) => saveNotes(selected.id, notes)}
              onAddAction={(a) => addAction(selected.id, a)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Schedule Sheet */}
      <Sheet open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Schedule 1-on-1</SheetTitle>
            <SheetDescription>Set up a manager ↔ employee meeting with an agenda.</SheetDescription>
          </SheetHeader>
          <ScheduleForm onSubmit={scheduleMeeting} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function KpiCard({ label, value, icon, accent = "text-foreground" }: { label: string; value: number; icon: React.ReactNode; accent?: string }) {
  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">{icon}</div>
        </div>
        <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function ViewSheet({
  meeting,
  onToggleAgenda,
  onToggleAction,
  onSaveNotes,
  onAddAction,
}: {
  meeting: OneOnOne;
  onToggleAgenda: (id: string) => void;
  onToggleAction: (id: string) => void;
  onSaveNotes: (notes: string) => void;
  onAddAction: (a: ActionItem) => void;
}) {
  const [notesDraft, setNotesDraft] = useState(meeting.notes ?? "");
  const [newActionText, setNewActionText] = useState("");
  const [newActionOwner, setNewActionOwner] = useState(meeting.employeeName);
  const [newActionDue, setNewActionDue] = useState("");

  function submitAction(e: React.FormEvent) {
    e.preventDefault();
    if (!newActionText.trim() || !newActionDue) return;
    onAddAction({
      id: `ac${Date.now()}`,
      text: newActionText.trim(),
      owner: newActionOwner,
      dueDate: newActionDue,
      done: false,
    });
    setNewActionText("");
    setNewActionDue("");
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-base">{meeting.managerName} ↔ {meeting.employeeName}</SheetTitle>
        <SheetDescription className="text-xs">
          {meeting.department} · {fmtDateTime(meeting.scheduledAt)} · {meeting.duration} min
        </SheetDescription>
      </SheetHeader>

      <div className="mt-4 flex items-center gap-2">
        <Badge variant="secondary" className={`text-xs ${statusColors[meeting.status]}`}>{statusLabels[meeting.status]}</Badge>
      </div>

      {/* Agenda */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Agenda</p>
        <div className="space-y-1.5">
          {meeting.agendaItems.map((a) => (
            <div key={a.id} className="flex items-start gap-2 rounded-lg border border-border px-3 py-2">
              <Checkbox checked={a.checked} onCheckedChange={() => onToggleAgenda(a.id)} className="mt-0.5" />
              <div className="flex-1">
                <p className={`text-sm ${a.checked ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>{a.text}</p>
                <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground mt-1">
                  Added by {a.addedBy}
                </Badge>
              </div>
            </div>
          ))}
          {meeting.agendaItems.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No agenda items yet.</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</p>
        <Textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          onBlur={() => onSaveNotes(notesDraft)}
          placeholder="Capture decisions, themes, follow-ups…"
          rows={4}
          className="text-sm border-border resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">Saved automatically when you leave the field.</p>
      </div>

      {/* Action items */}
      <div className="mt-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Action items</p>
        <div className="space-y-1.5">
          {meeting.actionItems.map((a) => {
            const overdue = !a.done && isOverdue(a.dueDate);
            return (
              <div key={a.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <Checkbox checked={a.done} onCheckedChange={() => onToggleAction(a.id)} />
                <div className="flex-1 flex items-center justify-between gap-2">
                  <p className={`text-sm ${a.done ? "line-through text-muted-foreground" : "text-muted-foreground"}`}>{a.text}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">{a.owner}</Badge>
                    <Badge variant="secondary" className={`text-xs ${overdue ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                      {fmtDate(a.dueDate)}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
          {meeting.actionItems.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No action items yet.</p>
          )}
        </div>

        {/* Add action item form */}
        <form onSubmit={submitAction} className="mt-3 space-y-2 rounded-lg border border-dashed border-border p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClipboardList className="w-3.5 h-3.5" /> Add an action item
          </div>
          <Input
            placeholder="What needs to happen?"
            value={newActionText}
            onChange={(e) => setNewActionText(e.target.value)}
            className="h-9 text-sm border-border"
          />
          <div className="grid grid-cols-2 gap-2">
            <Select value={newActionOwner} onValueChange={setNewActionOwner}>
              <SelectTrigger className="h-9 text-sm border-border">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={meeting.managerName}>{meeting.managerName}</SelectItem>
                <SelectItem value={meeting.employeeName}>{meeting.employeeName}</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newActionDue}
              onChange={(e) => setNewActionDue(e.target.value)}
              className="h-9 text-sm border-border"
            />
          </div>
          <Button type="submit" size="sm" className="h-9 w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Add action
          </Button>
        </form>
      </div>
    </>
  );
}

function ScheduleForm({ onSubmit }: { onSubmit: (m: OneOnOne) => void }) {
  const [managerName, setManagerName] = useState<string>(employeesData[0].name);
  const [employeeName, setEmployeeName] = useState<string>(employeesData[1].name);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [duration, setDuration] = useState<30 | 45 | 60>(30);
  const [agendaText, setAgendaText] = useState<string>("");
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);

  function addAgenda(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && agendaText.trim()) {
      e.preventDefault();
      setAgenda((prev) => [...prev, { id: `a${Date.now()}`, text: agendaText.trim(), addedBy: "manager", checked: false }]);
      setAgendaText("");
    }
  }

  function removeAgenda(id: string) {
    setAgenda((prev) => prev.filter((a) => a.id !== id));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!managerName || !employeeName || !scheduledAt) return;
    const emp = employeesData.find((e) => e.name === employeeName);
    onSubmit({
      id: `oo${Date.now()}`,
      managerId: `m-${Date.now()}`,
      managerName,
      employeeId: emp?.id ?? `e-${Date.now()}`,
      employeeName,
      department: emp?.department ?? "—",
      scheduledAt: new Date(scheduledAt).toISOString(),
      duration,
      status: "scheduled",
      agendaItems: agenda,
      actionItems: [],
      notes: null,
      previousMeetingId: null,
    });
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Manager</Label>
        <Select value={managerName} onValueChange={setManagerName}>
          <SelectTrigger className="h-9 text-sm border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            {employeesData.map((e) => (
              <SelectItem key={e.id} value={e.name}>{e.name} · {e.role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Employee</Label>
        <Select value={employeeName} onValueChange={setEmployeeName}>
          <SelectTrigger className="h-9 text-sm border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            {employeesData.map((e) => (
              <SelectItem key={e.id} value={e.name}>{e.name} · {e.department}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Date & time</Label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="h-9 text-sm border-border"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Duration</Label>
          <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v) as 30 | 45 | 60)}>
            <SelectTrigger className="h-9 text-sm border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Agenda items</Label>
        <Input
          placeholder="Type and press Enter to add…"
          value={agendaText}
          onChange={(e) => setAgendaText(e.target.value)}
          onKeyDown={addAgenda}
          className="h-9 text-sm border-border"
        />
        {agenda.length > 0 && (
          <div className="space-y-1 mt-2">
            {agenda.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded border border-border px-3 py-1.5">
                <span className="text-sm text-muted-foreground">{a.text}</span>
                <button type="button" onClick={() => removeAgenda(a.id)} className="text-muted-foreground hover:text-destructive">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        Schedule meeting
      </Button>
    </form>
  );
}
