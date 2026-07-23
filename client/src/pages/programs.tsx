import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  formatProgramDate,
  getProgramWindow,
  getStoredPrograms,
  type ProgramStatus,
  type StoredProgram,
} from "@/lib/programs-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAccount, isAdmin } from "@/lib/account";
import {
  Plus,
  Users,
  Calendar,
  Pencil,
  Star,
  LayoutGrid,
  List,
  ChevronDown,
  Trophy,
  Award,
} from "lucide-react";
import { BannerArt } from "@/components/programs/banner-art";

type ViewMode = "cards" | "list";
const VIEW_MODE_KEY = "engagex_programs_view";

function readViewMode(): ViewMode {
  if (typeof window === "undefined") return "list";
  return window.localStorage.getItem(VIEW_MODE_KEY) === "cards" ? "cards" : "list";
}

const STATUS_FILTERS: { id: "all" | ProgramStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "scheduled", label: "Scheduled" },
  { id: "active", label: "Active" },
  { id: "ended", label: "Ended" },
];

const statusBadgeClass: Record<ProgramStatus, string> = {
  draft: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  "ending-soon": "bg-orange-100 text-orange-800 hover:bg-orange-100",
  ended: "bg-muted text-muted-foreground hover:bg-muted",
};

export default function Programs() {
  const account = getAccount();
  const adminView = isAdmin(account);
  const currency = account?.currency ?? "₹";

  const [statusFilter, setStatusFilter] = useState<"all" | ProgramStatus>("all");
  const [viewMode, setViewMode] = useState<ViewMode>(readViewMode);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    window.localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Refresh when storage changes (covers another tab editing programs).
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "engagex_programs") setVersion((v) => v + 1);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const all = useMemo<StoredProgram[]>(() => {
    const list = getStoredPrograms();
    // Drafts only show to HR admins.
    return adminView ? list : list.filter((p) => p.status !== "draft");
  }, [adminView, version]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return all;
    if (statusFilter === "active") {
      return all.filter((p) => p.status === "active" || p.status === "ending-soon");
    }
    return all.filter((p) => p.status === statusFilter);
  }, [all, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    for (const f of STATUS_FILTERS) {
      if (f.id === "all") continue;
      if (f.id === "active") {
        c[f.id] = all.filter((p) => p.status === "active" || p.status === "ending-soon").length;
      } else {
        c[f.id] = all.filter((p) => p.status === f.id).length;
      }
    }
    return c;
  }, [all]);

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              data-testid={`programs-filter-${f.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                statusFilter === f.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {f.label} ({counts[f.id] ?? 0})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => {
              if (v === "cards" || v === "list") setViewMode(v);
            }}
            className="bg-white border border-border rounded-lg p-0.5"
          >
            <ToggleGroupItem
              value="cards"
              aria-label="Card view"
              data-testid="programs-view-cards"
              className="h-8 px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="list"
              aria-label="List view"
              data-testid="programs-view-list"
              className="h-8 px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <List className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {adminView && (
            <Button
              asChild
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-9"
            >
              <Link to="/programs/new" data-testid="programs-new">
                <Plus className="w-4 h-4" /> New program
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryStat label="Active programs" value={counts.active ?? 0} />
        <SummaryStat
          label="Total budget"
          value={`${currency}${all
            .filter((p) => p.status !== "ended")
            .reduce((s, p) => s + p.budgetAllocated, 0)
            .toLocaleString()}`}
        />
        <SummaryStat
          label="Total nominations"
          value={all.reduce((s, p) => s + p.nominations, 0).toLocaleString()}
        />
      </div>

      {/* Program Cards */}
      {viewMode === "cards" && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((prog) => {
          const pct =
            prog.budgetAllocated === 0
              ? 0
              : Math.round((prog.budgetUsed / prog.budgetAllocated) * 100);
          const isOverBudget = pct >= 80;
          const ended = prog.status === "ended";

          return (
            <Card
              key={prog.id}
              className={`border border-border hover:shadow-sm transition-all ${
                ended ? "opacity-70" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/programs/${prog.id}`}
                    className="flex items-start gap-3 min-w-0 hover:opacity-90"
                    data-testid={`programs-open-${prog.id}`}
                  >
                    <div className="w-12 h-12 rounded-xl shrink-0 relative overflow-hidden flex items-center justify-center">
                      <BannerArt
                        bannerId={prog.bannerId}
                        customDataUrl={prog.customBannerDataUrl}
                        className="absolute inset-0"
                      />
                      <span className="relative z-10 text-xl drop-shadow-sm">
                        {prog.iconEmoji ?? prog.emoji ?? "🏆"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{prog.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {prog.description ?? prog.shortDesc}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      className={`text-xs ${statusBadgeClass[prog.status]}`}
                      variant="secondary"
                    >
                      {prog.status}
                    </Badge>
                    {adminView && (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-muted-foreground"
                      >
                        <Link
                          to={`/programs/${prog.id}/edit`}
                          data-testid={`programs-edit-${prog.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-primary" /> Budget
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        isOverBudget ? "text-red-600" : "text-muted-foreground"
                      }`}
                    >
                      {currency}
                      {prog.budgetUsed.toLocaleString()} / {currency}
                      {prog.budgetAllocated.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-1.5 ${
                      isOverBudget
                        ? "[&>div]:bg-destructive"
                        : pct >= 60
                          ? "[&>div]:bg-primary"
                          : ""
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    {prog.nominations} nomination{prog.nominations === 1 ? "" : "s"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    {formatProgramDate(getProgramWindow(prog).end)}
                  </div>
                </div>

                {(prog.status === "active" ||
                  prog.status === "ending-soon" ||
                  prog.status === "ended") && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs flex-1">
                      <Link to={`/programs/${prog.id}?focus=shortlist`}>
                        Pick winners
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="h-7 text-xs flex-1">
                      <Link to={`/programs/${prog.id}?focus=winners`}>
                        View winners
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
            No programs found.
          </div>
        )}
      </div>
      )}

      {/* Program List */}
      {viewMode === "list" && (
        <Card className="border border-border overflow-hidden">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Program</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground w-[104px]">Status</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground w-[210px]">Budget</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground text-right w-[112px]">Nominations</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground w-[104px]">End date</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-muted-foreground w-[104px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((prog) => {
                const pct =
                  prog.budgetAllocated === 0
                    ? 0
                    : Math.round((prog.budgetUsed / prog.budgetAllocated) * 100);
                const isOverBudget = pct >= 80;
                const ended = prog.status === "ended";

                return (
                  <TableRow
                    key={prog.id}
                    className={`hover:bg-muted ${ended ? "opacity-70" : ""}`}
                    data-testid={`programs-row-${prog.id}`}
                  >
                    <TableCell className="min-w-0">
                      <Link
                        to={`/programs/${prog.id}`}
                        className="flex items-center gap-3 hover:opacity-90 min-w-0"
                        data-testid={`programs-open-${prog.id}`}
                      >
                        <div className="w-10 h-10 rounded-lg shrink-0 relative overflow-hidden flex items-center justify-center">
                          <BannerArt
                            bannerId={prog.bannerId}
                            customDataUrl={prog.customBannerDataUrl}
                            className="absolute inset-0"
                          />
                          <span className="relative z-10 text-lg drop-shadow-sm">
                            {prog.iconEmoji ?? prog.emoji ?? "🏆"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{prog.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {prog.description ?? prog.shortDesc}
                          </p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs whitespace-nowrap ${statusBadgeClass[prog.status]}`} variant="secondary">
                        {prog.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="w-3 h-3 text-primary" />
                          {pct}%
                        </span>
                        <span
                          className={`text-xs font-medium whitespace-nowrap ${
                            isOverBudget ? "text-red-600" : "text-muted-foreground"
                          }`}
                        >
                          {currency}
                          {prog.budgetUsed.toLocaleString()} / {currency}
                          {prog.budgetAllocated.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={pct}
                        className={`h-1.5 ${
                          isOverBudget
                            ? "[&>div]:bg-destructive"
                            : pct >= 60
                              ? "[&>div]:bg-primary"
                              : ""
                        }`}
                      />
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {prog.nominations}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {formatProgramDate(getProgramWindow(prog).end)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const canPick =
                          prog.status === "active" ||
                          prog.status === "ending-soon" ||
                          prog.status === "ended";
                        if (!canPick && !adminView) return null;
                        return (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                data-testid={`programs-action-${prog.id}`}
                              >
                                Action
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              {canPick && (
                                <>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/programs/${prog.id}?focus=shortlist`}>
                                      <Trophy className="w-4 h-4 mr-2" />
                                      Pick winners
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/programs/${prog.id}?focus=winners`}>
                                      <Award className="w-4 h-4 mr-2" />
                                      Winners
                                    </Link>
                                  </DropdownMenuItem>
                                </>
                              )}
                              {canPick && adminView && <DropdownMenuSeparator />}
                              {adminView && (
                                <DropdownMenuItem asChild>
                                  <Link
                                    to={`/programs/${prog.id}/edit`}
                                    data-testid={`programs-edit-${prog.id}`}
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                    No programs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
