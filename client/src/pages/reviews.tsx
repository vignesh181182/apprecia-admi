import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  reviewCycles as initialCycles,
  reviewSubmissions as initialSubmissions,
  type ReviewCycle,
  type ReviewCycleStatus,
  type ReviewCycleType,
  type ReviewType,
  type ReviewSubmission,
  type ReviewSubmissionStatus,
  type ReviewCompetency,
} from "@/lib/hr-data";
import {
  Search,
  Plus,
  ScrollText,
  Users,
  CheckCircle2,
  Clock,
  Star,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const cycleStatusColors: Record<ReviewCycleStatus, string> = {
  active: "bg-green-100 text-green-700",
  completed: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
};

const submissionStatusColors: Record<ReviewSubmissionStatus, string> = {
  "not-started": "bg-muted text-muted-foreground",
  "in-progress": "bg-amber-100 text-amber-700",
  submitted: "bg-green-100 text-green-700",
  acknowledged: "bg-blue-100 text-blue-700",
};

const submissionStatusLabels: Record<ReviewSubmissionStatus, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  submitted: "Submitted",
  acknowledged: "Acknowledged",
};

const reviewTypeColors: Record<ReviewType, string> = {
  self: "bg-purple-100 text-purple-700",
  manager: "bg-muted text-foreground",
  peer: "bg-teal-100 text-teal-700",
  upward: "bg-blue-100 text-blue-700",
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(s: string) {
  return new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function Reviews() {
  const { toast } = useToast();
  const [cycles, setCycles] = useState<ReviewCycle[]>(initialCycles);
  const [submissions, setSubmissions] = useState<ReviewSubmission[]>(initialSubmissions);

  const [tab, setTab] = useState<string>("cycles");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<ReviewSubmission | null>(null);

  const [subSearch, setSubSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewSubmissionStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ReviewType>("all");

  const counts = {
    activeCycles: cycles.filter((c) => c.status === "active").length,
    totalParticipants: cycles.reduce((s, c) => s + c.participants, 0),
    avgCompletion: Math.round(cycles.reduce((s, c) => s + c.completionRate, 0) / cycles.length),
    dueThisWeek: submissions.filter((sb) => {
      const c = cycles.find((c) => c.id === sb.cycleId);
      return c?.status === "active" && (sb.status === "in-progress" || sb.status === "not-started");
    }).length,
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const q = subSearch.toLowerCase();
      const matchSearch = !q || s.revieweeName.toLowerCase().includes(q);
      const matchCycle = cycleFilter === "all" || s.cycleId === cycleFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchType = typeFilter === "all" || s.reviewType === typeFilter;
      return matchSearch && matchCycle && matchStatus && matchType;
    });
  }, [submissions, subSearch, cycleFilter, statusFilter, typeFilter]);

  function viewCycleSubmissions(cycleId: string) {
    setCycleFilter(cycleId);
    setTab("submissions");
  }

  function createCycle(c: ReviewCycle) {
    setCycles((prev) => [c, ...prev]);
    setCreateOpen(false);
    toast({ title: "Review cycle created", description: `"${c.name}" is in ${c.status}.` });
  }

  return (
    <div className="p-6 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Active cycles" value={counts.activeCycles} icon={<ScrollText className="w-4 h-4" />} accent="text-success" />
        <KpiCard label="Total participants" value={counts.totalParticipants} icon={<Users className="w-4 h-4" />} />
        <KpiCard label="Avg completion rate" value={`${counts.avgCompletion}%`} icon={<CheckCircle2 className="w-4 h-4" />} />
        <KpiCard label="Due this week" value={counts.dueThisWeek} icon={<Clock className="w-4 h-4" />} accent={counts.dueThisWeek > 0 ? "text-primary" : "text-foreground"} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted">
          <TabsTrigger value="cycles" className="text-xs">Review cycles</TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs">Submissions</TabsTrigger>
        </TabsList>

        {/* Cycles tab */}
        <TabsContent value="cycles" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Create cycle
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {cycles.map((c) => (
              <Card key={c.id} className="border border-border hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{c.type.replace("-", " ")} cycle</p>
                    </div>
                    <Badge variant="secondary" className={`text-xs capitalize ${cycleStatusColors[c.status]}`}>
                      {c.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(c.startDate)} → due {fmtDate(c.dueDate)}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {c.reviewTypes.map((rt) => (
                      <Badge key={rt} variant="secondary" className={`text-xs capitalize ${reviewTypeColors[rt]}`}>
                        {rt}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{c.participants} participants</span>
                    <span className="text-muted-foreground font-medium">{c.completionRate}% complete</span>
                  </div>
                  <Progress value={c.completionRate} className="h-1.5" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">{c.competencies.length} competencies</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => viewCycleSubmissions(c.id)}
                    >
                      View submissions →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Submissions tab */}
        <TabsContent value="submissions" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reviewee…"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="pl-9 h-9 text-sm border-border"
              />
            </div>
            <Select value={cycleFilter} onValueChange={setCycleFilter}>
              <SelectTrigger className="h-9 w-56 text-sm border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cycles</SelectItem>
                {cycles.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="h-9 w-40 text-sm border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="not-started">Not started</SelectItem>
                <SelectItem value="in-progress">In progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger className="h-9 w-36 text-sm border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="self">Self</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="peer">Peer</SelectItem>
                <SelectItem value="upward">Upward</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                  <TableHead className="text-xs font-semibold text-muted-foreground">Reviewee</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Reviewer</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Cycle</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Submitted</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Overall</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((sb) => {
                  const cycle = cycles.find((c) => c.id === sb.cycleId);
                  return (
                    <TableRow key={sb.id} className="hover:bg-muted cursor-pointer" onClick={() => setSelectedSub(sb)}>
                      <TableCell>
                        <p className="text-xs font-medium text-foreground">{sb.revieweeName}</p>
                        <p className="text-xs text-muted-foreground">{sb.revieweeDept}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">{sb.reviewerName}</span>
                          <Badge variant="secondary" className={`text-xs capitalize ${reviewTypeColors[sb.reviewType]}`}>
                            {sb.reviewType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">{cycle?.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-xs ${submissionStatusColors[sb.status]}`}>
                          {submissionStatusLabels[sb.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {sb.submittedAt ? fmtDate(sb.submittedAt) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {sb.overallRating ? (
                          <StarRating value={sb.overallRating} />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedSub(sb)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredSubmissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                      No submissions match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Submission Sheet */}
      <Sheet open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedSub && (
            <SubmissionView
              submission={selectedSub}
              cycle={cycles.find((c) => c.id === selectedSub.cycleId) ?? null}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Create cycle Sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create review cycle</SheetTitle>
            <SheetDescription>Configure cycle settings and competency framework.</SheetDescription>
          </SheetHeader>
          <CreateCycleForm onSubmit={createCycle} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function KpiCard({ label, value, icon, accent = "text-foreground" }: { label: string; value: string | number; icon: React.ReactNode; accent?: string }) {
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

function StarRating({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${dim} ${n <= value ? "text-primary fill-primary" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );
}

function SubmissionView({ submission, cycle }: { submission: ReviewSubmission; cycle: ReviewCycle | null }) {
  const isSubmitted = submission.status === "submitted" || submission.status === "acknowledged";
  const competencies = cycle?.competencies ?? [];

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-base">{submission.revieweeName}</SheetTitle>
        <SheetDescription className="text-xs">
          {submission.revieweeDept} · Reviewed by <span className="font-medium">{submission.reviewerName}</span>
        </SheetDescription>
      </SheetHeader>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className={`text-xs capitalize ${reviewTypeColors[submission.reviewType]}`}>
          {submission.reviewType} review
        </Badge>
        <Badge variant="secondary" className={`text-xs ${submissionStatusColors[submission.status]}`}>
          {submissionStatusLabels[submission.status]}
        </Badge>
        {cycle && (
          <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">{cycle.name}</Badge>
        )}
      </div>

      {!isSubmitted ? (
        <div className="mt-6 rounded-lg border border-border bg-muted p-6 text-center">
          <Clock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            {submission.status === "in-progress" ? "Review in progress" : "Not yet submitted"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {submission.lastActiveAt
              ? `Last active ${fmtDateTime(submission.lastActiveAt)}`
              : "Reviewer hasn't started yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Overall */}
          <div className="mt-6 rounded-lg border border-border bg-muted p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Overall rating</p>
            {submission.overallRating ? (
              <StarRating value={submission.overallRating} size="lg" />
            ) : (
              <p className="text-sm text-muted-foreground">No overall rating</p>
            )}
            {submission.overallComment && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{submission.overallComment}</p>
            )}
          </div>

          {/* Competencies */}
          <div className="mt-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Competencies</p>
            {competencies.map((comp) => {
              const r = submission.ratings.find((rr) => rr.competencyId === comp.id);
              if (!r || r.score === 0) {
                return (
                  <div key={comp.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">{comp.name}</p>
                    <p className="text-xs text-muted-foreground italic mt-1">No rating yet</p>
                  </div>
                );
              }
              return (
                <div key={comp.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{comp.name}</p>
                    <CompetencyDots score={r.score} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{comp.description}</p>
                  {r.comment && <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>}
                </div>
              );
            })}
          </div>

          {submission.submittedAt && (
            <p className="text-xs text-muted-foreground mt-4">Submitted {fmtDateTime(submission.submittedAt)}</p>
          )}
        </>
      )}
    </>
  );
}

function CompetencyDots({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`w-2 h-2 rounded-full ${n <= score ? "bg-stone-900" : "bg-muted"}`}
        />
      ))}
    </div>
  );
}

function CreateCycleForm({ onSubmit }: { onSubmit: (c: ReviewCycle) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ReviewCycleType>("annual");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reviewTypes, setReviewTypes] = useState<ReviewType[]>(["self", "manager"]);
  const [audience, setAudience] = useState<"all" | "department" | "individuals">("all");
  const [competencies, setCompetencies] = useState<ReviewCompetency[]>([]);
  const [compName, setCompName] = useState("");
  const [compDesc, setCompDesc] = useState("");

  function toggleReviewType(t: ReviewType) {
    setReviewTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function addCompetency() {
    if (!compName.trim()) return;
    setCompetencies((prev) => [
      ...prev,
      { id: `c${Date.now()}`, name: compName.trim(), description: compDesc.trim() },
    ]);
    setCompName("");
    setCompDesc("");
  }

  function removeCompetency(id: string) {
    setCompetencies((prev) => prev.filter((c) => c.id !== id));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate || !dueDate || reviewTypes.length === 0) return;
    onSubmit({
      id: `rc${Date.now()}`,
      name: name.trim(),
      type,
      status: "draft",
      startDate,
      endDate: dueDate,
      dueDate,
      reviewTypes,
      participants: audience === "all" ? 248 : audience === "department" ? 50 : 8,
      completionRate: 0,
      competencies,
    });
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Cycle name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mid-Year Review H2 2026"
          className="h-9 text-sm border-border"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as ReviewCycleType)}>
          <SelectTrigger className="h-9 text-sm border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="mid-year">Mid-year</SelectItem>
            <SelectItem value="probation">Probation</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Start date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-sm border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Due date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9 text-sm border-border" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Review types</Label>
        <div className="grid grid-cols-2 gap-2">
          {(["self", "manager", "peer", "upward"] as const).map((rt) => (
            <label key={rt} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-muted">
              <Checkbox checked={reviewTypes.includes(rt)} onCheckedChange={() => toggleReviewType(rt)} />
              <span className="text-sm capitalize text-muted-foreground">{rt}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Participants</Label>
        <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
          <SelectTrigger className="h-9 text-sm border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All employees</SelectItem>
            <SelectItem value="department">By department</SelectItem>
            <SelectItem value="individuals">Select individuals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Competency framework */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Competency framework</Label>
        <div className="rounded-lg border border-border p-3 space-y-2">
          {competencies.length > 0 && (
            <div className="space-y-1">
              {competencies.map((c) => (
                <div key={c.id} className="flex items-start justify-between rounded border border-border px-2.5 py-1.5">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{c.name}</p>
                    {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                  </div>
                  <button type="button" onClick={() => removeCompetency(c.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Input
            value={compName}
            onChange={(e) => setCompName(e.target.value)}
            placeholder="Competency name (e.g. Communication)"
            className="h-9 text-sm border-border"
          />
          <Input
            value={compDesc}
            onChange={(e) => setCompDesc(e.target.value)}
            placeholder="Description (optional)"
            className="h-9 text-sm border-border"
          />
          <Button type="button" size="sm" variant="outline" className="h-9 w-full border-border" onClick={addCompetency}>
            Add competency
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        Create cycle
      </Button>
    </form>
  );
}
