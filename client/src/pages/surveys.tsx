import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  surveys as initialSurveys,
  surveyTemplates,
  type Survey,
  type SurveyStatus,
  type SurveyType,
  type SurveyQuestion,
  type SurveyQuestionType,
} from "@/lib/hr-data";
import { Search, Plus, BarChart3, Activity, Send, Sparkles, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<SurveyStatus, string> = {
  active: "bg-green-100 text-green-700",
  completed: "bg-stone-100 text-stone-700",
  draft: "bg-stone-100 text-stone-500",
  scheduled: "bg-amber-100 text-amber-700",
};

const typeColors: Record<SurveyType, string> = {
  pulse: "bg-teal-100 text-teal-700",
  lifecycle: "bg-purple-100 text-purple-700",
  custom: "bg-amber-100 text-amber-700",
};

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function scoreColor(score: number) {
  if (score >= 70) return "bg-green-100 text-green-700";
  if (score >= 50) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default function Surveys() {
  const { toast } = useToast();
  const [items, setItems] = useState<Survey[]>(initialSurveys);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | SurveyStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | SurveyType>("all");
  const [selected, setSelected] = useState<Survey | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const counts = {
    total: items.length,
    active: items.filter((s) => s.status === "active").length,
    avgResponseRate: Math.round(
      (items.filter((s) => s.audienceSize > 0).reduce((sum, s) => sum + s.responseCount / s.audienceSize, 0) /
        items.filter((s) => s.audienceSize > 0).length) *
        100
    ),
    avgScore: Math.round(
      items.filter((s) => s.overallScore > 0).reduce((sum, s) => sum + s.overallScore, 0) /
        items.filter((s) => s.overallScore > 0).length
    ),
  };

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.title.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchType = typeFilter === "all" || s.type === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [items, search, statusFilter, typeFilter]);

  function createSurvey(s: Survey) {
    setItems((prev) => [s, ...prev]);
    setCreateOpen(false);
    toast({ title: "Survey created", description: `"${s.title}" is now in ${s.status}.` });
  }

  function useTemplate(name: string) {
    toast({ title: "Template selected", description: `"${name}" loaded into a new survey draft.` });
    setCreateOpen(true);
  }

  return (
    <div className="p-6 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total surveys" value={counts.total} icon={<BarChart3 className="w-4 h-4" />} />
        <KpiCard label="Active now" value={counts.active} icon={<Activity className="w-4 h-4" />} accent="text-green-600" />
        <KpiCard label="Avg response rate" value={`${counts.avgResponseRate}%`} icon={<Send className="w-4 h-4" />} />
        <KpiCard
          label="Avg engagement score"
          value={`${counts.avgScore}`}
          icon={<Sparkles className="w-4 h-4" />}
          accent={counts.avgScore >= 70 ? "text-green-600" : counts.avgScore >= 50 ? "text-amber-600" : "text-red-600"}
        />
      </div>

      <Tabs defaultValue="surveys">
        <TabsList className="bg-stone-100">
          <TabsTrigger value="surveys" className="text-xs">Surveys</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="surveys" className="mt-4 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Search surveys…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm border-stone-200"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(["all", "active", "completed", "draft", "scheduled"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                      statusFilter === s
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                <SelectTrigger className="h-9 w-36 text-sm border-stone-200"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="pulse">Pulse</SelectItem>
                  <SelectItem value="lifecycle">Lifecycle</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="h-9 gap-2 bg-stone-900 hover:bg-stone-700 text-white" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Create survey
            </Button>
          </div>

          {/* Survey cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((s) => {
              const responsePct = s.audienceSize > 0 ? Math.round((s.responseCount / s.audienceSize) * 100) : 0;
              return (
                <Card key={s.id} className="border border-stone-200 hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1.5">
                        <Badge variant="secondary" className={`text-xs w-fit capitalize ${typeColors[s.type]}`}>
                          {s.type}
                        </Badge>
                        <p className="text-sm font-semibold text-stone-900">{s.title}</p>
                      </div>
                      <Badge variant="secondary" className={`text-xs capitalize ${statusColors[s.status]}`}>
                        {s.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-stone-500">
                      {fmtDate(s.launchDate)} → {fmtDate(s.closeDate)}
                    </p>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-stone-600">Responses</span>
                        <span className="text-xs font-medium text-stone-700">
                          {s.responseCount} / {s.audienceSize} · {responsePct}%
                        </span>
                      </div>
                      <Progress value={responsePct} className="h-1.5" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {s.overallScore > 0 ? (
                        <Badge variant="secondary" className={`text-xs ${scoreColor(s.overallScore)}`}>
                          Score: {s.overallScore}
                        </Badge>
                      ) : (
                        <span className="text-xs text-stone-400">No score yet</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-stone-700 hover:text-stone-900"
                        onClick={() => setSelected(s)}
                      >
                        View results →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-sm text-stone-500 py-10">
                No surveys match your filters.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {surveyTemplates.map((t) => (
              <Card key={t.id} className="border border-stone-200 hover:shadow-sm transition-shadow">
                <CardContent className="p-4 space-y-2">
                  <Badge variant="secondary" className="text-xs bg-stone-100 text-stone-600">
                    {t.category}
                  </Badge>
                  <p className="text-sm font-semibold text-stone-900">{t.name}</p>
                  <p className="text-xs text-stone-500">{t.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-stone-500">{t.questionCount} questions</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-stone-700 hover:text-stone-900"
                      onClick={() => useTemplate(t.name)}
                    >
                      Use template →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Results Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && <ResultsSheet survey={selected} />}
        </SheetContent>
      </Sheet>

      {/* Create Sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create survey</SheetTitle>
            <SheetDescription>Configure title, type, audience, and questions.</SheetDescription>
          </SheetHeader>
          <CreateForm onSubmit={createSurvey} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function KpiCard({ label, value, icon, accent = "text-stone-900" }: { label: string; value: string | number; icon: React.ReactNode; accent?: string }) {
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

function ResultsSheet({ survey }: { survey: Survey }) {
  const responsePct = survey.audienceSize > 0 ? Math.round((survey.responseCount / survey.audienceSize) * 100) : 0;
  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className={`text-xs capitalize ${typeColors[survey.type]}`}>{survey.type}</Badge>
          <Badge variant="secondary" className={`text-xs capitalize ${statusColors[survey.status]}`}>{survey.status}</Badge>
        </div>
        <SheetTitle className="text-base">{survey.title}</SheetTitle>
        <SheetDescription className="text-xs">
          {fmtDate(survey.launchDate)} → {fmtDate(survey.closeDate)}
        </SheetDescription>
      </SheetHeader>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Response rate</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{responsePct}%</p>
          <p className="text-xs text-stone-500">{survey.responseCount} of {survey.audienceSize}</p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <p className="text-xs text-stone-500 uppercase tracking-wide font-medium">Overall score</p>
          {survey.overallScore > 0 ? (
            <p className={`text-2xl font-bold mt-1 ${survey.overallScore >= 70 ? "text-green-600" : survey.overallScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
              {survey.overallScore}
            </p>
          ) : (
            <p className="text-2xl font-bold text-stone-400 mt-1">—</p>
          )}
          <p className="text-xs text-stone-500">out of 100</p>
        </div>
      </div>

      {/* Per-question */}
      <div className="mt-6 space-y-4">
        {survey.questions.map((q, qi) => {
          const r = survey.results.find((x) => x.questionId === q.id);
          return (
            <div key={q.id} className="rounded-lg border border-stone-200 p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm text-stone-900 flex-1">
                  <span className="text-stone-400 mr-1.5">Q{qi + 1}.</span>
                  {q.text}
                </p>
                <Badge variant="secondary" className="text-xs bg-stone-100 text-stone-600 capitalize shrink-0">
                  {q.type === "yesno" ? "Yes/No" : q.type}
                </Badge>
              </div>
              {r && q.type === "rating" && r.responses.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const row = r.responses.find((x) => x.score === score);
                    const total = r.responses.reduce((s, x) => s + x.count, 0);
                    const pct = row && total > 0 ? Math.round((row.count / total) * 100) : 0;
                    return (
                      <div key={score} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-stone-500">{score}</span>
                        <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div className="h-full bg-stone-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right text-stone-600 tabular-nums">{row?.count ?? 0}</span>
                      </div>
                    );
                  })}
                  <p className="text-xs text-stone-500 mt-2">Avg: <span className="font-semibold text-stone-700">{r.avgScore.toFixed(1)}</span></p>
                </div>
              )}
              {r && q.type === "yesno" && r.responses.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {[
                    { label: "Yes", count: r.responses.find((x) => x.score === 1)?.count ?? 0, color: "bg-green-500" },
                    { label: "No", count: r.responses.find((x) => x.score === 0)?.count ?? 0, color: "bg-stone-400" },
                  ].map((row) => {
                    const total = r.responses.reduce((s, x) => s + x.count, 0);
                    const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
                    return (
                      <div key={row.label} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-stone-500">{row.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 text-right text-stone-600 tabular-nums">{row.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {r && q.type === "text" && r.textResponses && r.textResponses.length > 0 && (
                <div className="space-y-2 mt-3">
                  {r.textResponses.map((t, i) => (
                    <div key={i} className="rounded border border-stone-200 bg-stone-50 p-2.5">
                      <p className="text-xs text-stone-600 italic">"{t}"</p>
                      <p className="text-xs text-stone-400 mt-1">— Anonymous respondent</p>
                    </div>
                  ))}
                </div>
              )}
              {(!r || (r.responses.length === 0 && (!r.textResponses || r.textResponses.length === 0))) && (
                <p className="text-xs text-stone-400 italic">No responses yet.</p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function CreateForm({ onSubmit }: { onSubmit: (s: Survey) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<SurveyType>("pulse");
  const [audience, setAudience] = useState<"all" | "department" | "group">("all");
  const [launchDate, setLaunchDate] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [newQ, setNewQ] = useState("");
  const [newQType, setNewQType] = useState<SurveyQuestionType>("rating");

  function addQuestion() {
    if (!newQ.trim()) return;
    setQuestions((prev) => [...prev, { id: `q${Date.now()}`, text: newQ.trim(), type: newQType }]);
    setNewQ("");
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !launchDate || !closeDate) return;
    onSubmit({
      id: `s${Date.now()}`,
      title: title.trim(),
      type,
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
      launchDate,
      closeDate,
      audienceSize: audience === "all" ? 248 : 50,
      responseCount: 0,
      overallScore: 0,
      questions,
      results: [],
    });
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q2 Manager Effectiveness"
          className="h-9 text-sm border-stone-200"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as SurveyType)}>
          <SelectTrigger className="h-9 text-sm border-stone-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pulse">Pulse</SelectItem>
            <SelectItem value="lifecycle">Lifecycle</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Audience</Label>
        <Select value={audience} onValueChange={(v) => setAudience(v as typeof audience)}>
          <SelectTrigger className="h-9 text-sm border-stone-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All employees</SelectItem>
            <SelectItem value="department">By department</SelectItem>
            <SelectItem value="group">By group</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">Launch date</Label>
          <Input type="date" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} className="h-9 text-sm border-stone-200" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">Close date</Label>
          <Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} className="h-9 text-sm border-stone-200" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Questions</Label>
        <div className="rounded-lg border border-stone-200 p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              placeholder="Question text…"
              className="h-9 text-sm border-stone-200 flex-1"
            />
            <Select value={newQType} onValueChange={(v) => setNewQType(v as SurveyQuestionType)}>
              <SelectTrigger className="h-9 w-28 text-sm border-stone-200"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating 1–5</SelectItem>
                <SelectItem value="yesno">Yes/No</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" size="sm" variant="outline" className="h-9 border-stone-200" onClick={addQuestion}>
              Add
            </Button>
          </div>

          {questions.length > 0 && (
            <div className="space-y-1">
              {questions.map((q, i) => (
                <div key={q.id} className="flex items-center justify-between rounded border border-stone-200 px-2.5 py-1.5">
                  <span className="text-xs text-stone-700">
                    <span className="text-stone-400 mr-1.5">Q{i + 1}.</span>
                    {q.text}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-xs bg-stone-100 text-stone-600 capitalize">
                      {q.type === "yesno" ? "Yes/No" : q.type}
                    </Badge>
                    <button type="button" onClick={() => removeQuestion(q.id)} className="text-stone-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-700 text-white">
        Create draft survey
      </Button>
    </form>
  );
}
