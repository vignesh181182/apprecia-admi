import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  okrs as initialOKRs,
  employeesData,
  type OKR,
  type OKRStatus,
  type OKRType,
  type KeyResult,
} from "@/lib/hr-data";
import {
  Search,
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<OKRStatus, string> = {
  "on-track": "bg-green-100 text-green-700",
  "at-risk": "bg-amber-100 text-amber-700",
  "off-track": "bg-red-100 text-red-700",
  completed: "bg-muted text-muted-foreground",
};

const statusLabels: Record<OKRStatus, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  "off-track": "Off track",
  completed: "Completed",
};

const statusDot: Record<OKRStatus, string> = {
  "on-track": "bg-green-500",
  "at-risk": "bg-amber-500",
  "off-track": "bg-red-500",
  completed: "bg-stone-400",
};

const typeColors: Record<OKRType, string> = {
  company: "bg-primary text-primary-foreground",
  team: "bg-muted text-foreground",
  individual: "bg-muted text-muted-foreground",
};

const typeLabels: Record<OKRType, string> = {
  company: "Company",
  team: "Team",
  individual: "Individual",
};

export default function OKRs() {
  const { toast } = useToast();
  const [items, setItems] = useState<OKR[]>(initialOKRs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OKRStatus>("all");
  const [quarter, setQuarter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | OKRType>("all");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const counts = {
    total: items.length,
    onTrack: items.filter((o) => o.status === "on-track" || o.status === "completed").length,
    atRisk: items.filter((o) => o.status === "at-risk" || o.status === "off-track").length,
    avgProgress: Math.round(items.reduce((s, o) => s + o.progress, 0) / items.length),
  };

  const filtered = useMemo(() => {
    return items.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch = !q || o.title.toLowerCase().includes(q) || o.owner.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      const matchQuarter = quarter === "all" || o.quarter === quarter;
      const matchType = typeFilter === "all" || o.type === typeFilter;
      return matchSearch && matchStatus && matchQuarter && matchType;
    });
  }, [items, search, statusFilter, quarter, typeFilter]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  function createOKR(o: OKR) {
    setItems((prev) => [o, ...prev]);
    setCreateOpen(false);
    toast({ title: "OKR created", description: `"${o.title}" added for ${o.quarter}.` });
  }

  // ─── Alignment tree ──────────────────────────────────────────────────────
  const companyOKRs = items.filter((o) => o.type === "company");
  const childrenOf = (id: string) => items.filter((o) => o.parentId === id);

  return (
    <div className="p-6 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total OKRs" value={counts.total} icon={<Target className="w-4 h-4" />} />
        <KpiCard label="On track" value={counts.onTrack} icon={<TrendingUp className="w-4 h-4" />} accent="text-success" />
        <KpiCard label="At risk" value={counts.atRisk} icon={<AlertTriangle className="w-4 h-4" />} accent="text-primary" />
        <KpiCard label="Avg progress" value={`${counts.avgProgress}%`} icon={<Activity className="w-4 h-4" />} />
      </div>

      <Tabs defaultValue="list">
        <TabsList className="bg-muted">
          <TabsTrigger value="list" className="text-xs">List view</TabsTrigger>
          <TabsTrigger value="tree" className="text-xs">Alignment tree</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search OKRs…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm border-border"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(["all", "on-track", "at-risk", "off-track", "completed"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      statusFilter === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-white text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {s === "all" ? "All" : statusLabels[s as OKRStatus]}
                  </button>
                ))}
              </div>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger className="h-9 w-32 text-sm border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All quarters</SelectItem>
                  <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                  <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                <SelectTrigger className="h-9 w-32 text-sm border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="h-9 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Add OKR
            </Button>
          </div>

          {/* OKR rows */}
          <div className="space-y-2">
            {filtered.map((o) => {
              const isOpen = expanded.includes(o.id);
              return (
                <Card key={o.id} className="border border-border">
                  <button
                    onClick={() => toggleExpand(o.id)}
                    className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted transition-colors rounded-lg"
                  >
                    <div className="mt-0.5 text-muted-foreground">
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Badge className={`text-xs ${typeColors[o.type]}`} variant="secondary">
                          {typeLabels[o.type]}
                        </Badge>
                        <p className="text-sm font-semibold text-foreground">{o.title}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{o.owner} · {o.ownerDept}</span>
                        <span>·</span>
                        <span>{o.quarter}</span>
                        {o.linkedRecognitions > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1 text-primary">
                              <Sparkles className="w-3 h-3" /> {o.linkedRecognitions} linked recognitions
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress
                          value={o.progress}
                          className={`h-1.5 flex-1 ${o.status === "off-track" ? "[&>div]:bg-destructive" : o.status === "at-risk" ? "[&>div]:bg-primary" : ""}`}
                        />
                        <span className="text-xs font-semibold text-muted-foreground tabular-nums w-10 text-right">{o.progress}%</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${statusColors[o.status]} shrink-0`}>
                      {statusLabels[o.status]}
                    </Badge>
                  </button>

                  {isOpen && (
                    <div className="border-t border-border px-4 py-3 space-y-2 bg-muted/50">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Key results</p>
                      {o.keyResults.map((kr) => (
                        <div key={kr.id} className="flex items-center gap-3 rounded border border-border bg-white p-2.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[kr.status]}`} />
                          <p className="text-sm text-foreground flex-1 truncate">{kr.title}</p>
                          <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-32 text-right">
                            {kr.current.toLocaleString()} / {kr.target.toLocaleString()} {kr.unit}
                          </span>
                          <div className="w-24 shrink-0">
                            <Progress
                              value={kr.progress}
                              className={`h-1.5 ${kr.status === "off-track" ? "[&>div]:bg-destructive" : kr.status === "at-risk" ? "[&>div]:bg-primary" : ""}`}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground tabular-nums shrink-0 w-10 text-right">{kr.progress}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">No OKRs match your filters.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tree" className="mt-4">
          <div className="space-y-3">
            {companyOKRs.map((co) => (
              <TreeNode key={co.id} okr={co} depth={0} childrenOf={childrenOf} />
            ))}
            {companyOKRs.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-10">No company OKRs to align under.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add OKR</SheetTitle>
            <SheetDescription>Create an OKR with up to 4 key results.</SheetDescription>
          </SheetHeader>
          <CreateForm okrs={items} onSubmit={createOKR} />
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

function TreeNode({ okr, depth, childrenOf }: { okr: OKR; depth: number; childrenOf: (id: string) => OKR[] }) {
  const kids = childrenOf(okr.id);
  const cardBg =
    depth === 0 ? "bg-stone-900 text-stone-50 border-stone-900" :
    depth === 1 ? "bg-muted border-border" :
                  "bg-white border-border";

  return (
    <div style={{ marginLeft: depth * 24 }}>
      <Card className={`${cardBg} border`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${statusDot[okr.status]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="secondary" className={`text-xs ${depth === 0 ? "bg-stone-700 text-white" : typeColors[okr.type]}`}>
                  {typeLabels[okr.type]}
                </Badge>
                <p className={`text-sm font-semibold ${depth === 0 ? "text-stone-50" : "text-foreground"}`}>{okr.title}</p>
              </div>
              <p className={`text-xs ${depth === 0 ? "text-muted-foreground" : "text-muted-foreground"}`}>
                {okr.owner} · {okr.ownerDept} · {okr.quarter}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Progress
                  value={okr.progress}
                  className={`h-1.5 flex-1 ${depth === 0 ? "bg-stone-700 [&>div]:bg-white" : okr.status === "off-track" ? "[&>div]:bg-destructive" : okr.status === "at-risk" ? "[&>div]:bg-primary" : ""}`}
                />
                <span className={`text-xs font-semibold tabular-nums w-10 text-right ${depth === 0 ? "text-stone-50" : "text-muted-foreground"}`}>{okr.progress}%</span>
                <Badge variant="secondary" className={`text-xs ${statusColors[okr.status]} shrink-0`}>
                  {statusLabels[okr.status]}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {kids.length > 0 && (
        <div className="mt-2 space-y-2">
          {kids.map((child) => (
            <TreeNode key={child.id} okr={child} depth={depth + 1} childrenOf={childrenOf} />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateForm({ okrs, onSubmit }: { okrs: OKR[]; onSubmit: (o: OKR) => void }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<OKRType>("individual");
  const [owner, setOwner] = useState<string>(employeesData[0].name);
  const [ownerDept, setOwnerDept] = useState<string>(employeesData[0].department);
  const [quarter, setQuarter] = useState<"Q1 2026" | "Q2 2026">("Q2 2026");
  const [parentId, setParentId] = useState<string>("none");
  const [krs, setKRs] = useState<KeyResult[]>([]);
  const [krDraft, setKrDraft] = useState<{ title: string; target: string; unit: string; current: string }>({
    title: "",
    target: "",
    unit: "",
    current: "0",
  });

  function handleOwnerChange(name: string) {
    setOwner(name);
    const emp = employeesData.find((e) => e.name === name);
    if (emp) setOwnerDept(emp.department);
  }

  function addKR() {
    if (!krDraft.title.trim() || !krDraft.target) return;
    const target = Number(krDraft.target);
    const current = Number(krDraft.current);
    setKRs((prev) => [
      ...prev,
      {
        id: `kr${Date.now()}`,
        title: krDraft.title.trim(),
        target,
        current,
        unit: krDraft.unit || "units",
        progress: target > 0 ? Math.round((current / target) * 100) : 0,
        status: "on-track",
      },
    ]);
    setKrDraft({ title: "", target: "", unit: "", current: "0" });
  }

  function removeKR(id: string) {
    setKRs((prev) => prev.filter((k) => k.id !== id));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const avgProgress = krs.length > 0 ? Math.round(krs.reduce((s, k) => s + k.progress, 0) / krs.length) : 0;
    onSubmit({
      id: `ok${Date.now()}`,
      title: title.trim(),
      type,
      owner,
      ownerDept,
      quarter,
      status: "on-track",
      progress: avgProgress,
      keyResults: krs,
      parentId: parentId === "none" ? null : parentId,
      linkedRecognitions: 0,
    });
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Reduce p99 latency by 50%"
          className="h-9 text-sm border-border"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as OKRType)}>
            <SelectTrigger className="h-9 text-sm border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Quarter</Label>
          <Select value={quarter} onValueChange={(v) => setQuarter(v as typeof quarter)}>
            <SelectTrigger className="h-9 text-sm border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Q1 2026">Q1 2026</SelectItem>
              <SelectItem value="Q2 2026">Q2 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Owner</Label>
        <Select value={owner} onValueChange={handleOwnerChange}>
          <SelectTrigger className="h-9 text-sm border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            {employeesData.map((e) => (
              <SelectItem key={e.id} value={e.name}>{e.name} · {e.department}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Parent OKR (optional)</Label>
        <Select value={parentId} onValueChange={setParentId}>
          <SelectTrigger className="h-9 text-sm border-border"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No parent</SelectItem>
            {okrs
              .filter((o) => o.type !== "individual")
              .map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {typeLabels[o.type]} · {o.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key results builder */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Key results</Label>
        <div className="rounded-lg border border-border p-3 space-y-2">
          {krs.length > 0 && (
            <div className="space-y-1">
              {krs.map((kr) => (
                <div key={kr.id} className="flex items-center justify-between rounded border border-border px-2.5 py-1.5">
                  <span className="text-xs text-muted-foreground flex-1 truncate">
                    {kr.title} <span className="text-muted-foreground">· {kr.current}/{kr.target} {kr.unit}</span>
                  </span>
                  <button type="button" onClick={() => removeKR(kr.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Input
            value={krDraft.title}
            onChange={(e) => setKrDraft((p) => ({ ...p, title: e.target.value }))}
            placeholder="Key result title…"
            className="h-9 text-sm border-border"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={krDraft.target}
              onChange={(e) => setKrDraft((p) => ({ ...p, target: e.target.value }))}
              placeholder="Target"
              type="number"
              className="h-9 text-sm border-border"
            />
            <Input
              value={krDraft.current}
              onChange={(e) => setKrDraft((p) => ({ ...p, current: e.target.value }))}
              placeholder="Current"
              type="number"
              className="h-9 text-sm border-border"
            />
            <Input
              value={krDraft.unit}
              onChange={(e) => setKrDraft((p) => ({ ...p, unit: e.target.value }))}
              placeholder="Unit (e.g. users)"
              className="h-9 text-sm border-border"
            />
          </div>
          <Button type="button" size="sm" variant="outline" className="h-9 w-full border-border" onClick={addKR}>
            Add key result
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        Create OKR
      </Button>
    </form>
  );
}
