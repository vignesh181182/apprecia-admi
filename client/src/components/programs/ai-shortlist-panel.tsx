import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ChevronDown, Trophy } from "lucide-react";
import {
  shortlistNominations,
  writeShortlistAudit,
  type ShortlistEntry,
} from "@/lib/ai-shortlister";
import {
  declareWinners,
  getNominationsForProgram,
  type Nomination,
  type StoredProgram,
} from "@/lib/programs-data";
import { getAccount } from "@/lib/account";

const PAGE_SIZE = 12;
const TOP_N = 10;

export type ShortlistMode = "page" | "embedded";

/**
 * AI shortlist + winner-selection UI. In `page` mode it pins a sticky footer
 * with the Confirm action; in `embedded` mode the Confirm action lives inline
 * at the bottom of the card so it can sit inside a tabbed dashboard.
 */
export function AiShortlistPanel({
  program,
  mode,
  onConfirmed,
}: {
  program: StoredProgram;
  mode: ShortlistMode;
  /** Fired after winners are declared. Page mode navigates; embedded mode rerenders. */
  onConfirmed?: (winnerCount: number) => void;
}) {
  const navigate = useNavigate();
  const account = getAccount();
  const { toast } = useToast();

  const [version, setVersion] = useState(0);
  const allNominations = useMemo(
    () => getNominationsForProgram(program.id),
    [program.id, version],
  );
  const eligible = useMemo(
    () =>
      allNominations.filter(
        (n) => n.status === "approved" || n.status === "pending-panel",
      ),
    [allNominations],
  );
  const shortlist = useMemo<ShortlistEntry[]>(
    () => shortlistNominations(eligible, account, program.panel ?? []),
    [eligible, account, program.panel],
  );

  const cycleId = useMemo(() => eligible[0]?.cycleId ?? "current", [eligible]);
  useEffect(() => {
    if (shortlist.length === 0) return;
    writeShortlistAudit(program.id, cycleId, shortlist);
  }, [program.id, cycleId, shortlist]);

  const defaultSelectionCount = useMemo(() => {
    const acrossCats =
      program.categories?.reduce((s, c) => s + c.winnersCount, 0) ?? TOP_N;
    return Math.min(TOP_N, Math.max(1, acrossCats));
  }, [program.categories]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (shortlist.length === 0) return;
    setSelected(
      new Set(shortlist.slice(0, defaultSelectionCount).map((s) => s.nominationId)),
    );
  }, [shortlist, defaultSelectionCount]);

  const [shortlistOpen, setShortlistOpen] = useState(true);
  const [page, setPage] = useState(0);
  const [confirming, setConfirming] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmWinners() {
    setConfirming(true);
    const ordered = shortlist
      .filter((s) => selected.has(s.nominationId))
      .sort((a, b) => a.rank - b.rank);
    declareWinners(
      program.id,
      cycleId,
      ordered.map((o, i) => ({ nominationId: o.nominationId, rank: i + 1 })),
    );
    setVersion((v) => v + 1);
    setConfirming(false);
    toast({
      title: "Winners declared",
      description: `${ordered.length} winner${ordered.length === 1 ? "" : "s"} for ${program.name}.`,
    });
    onConfirmed?.(ordered.length);
    if (mode === "page") {
      navigate(`/programs/${program.id}/winners`);
    }
  }

  const topShortlist = shortlist.slice(0, TOP_N);
  const overflow = shortlist.slice(TOP_N);
  const pageStart = page * PAGE_SIZE;
  const pageItems = overflow.slice(pageStart, pageStart + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(overflow.length / PAGE_SIZE));
  const nominationById = new Map(allNominations.map((n) => [n.id, n]));

  return (
    <>
      <Card className="border border-amber-200 bg-amber-50/40">
        <Collapsible open={shortlistOpen} onOpenChange={setShortlistOpen}>
          <CollapsibleTrigger asChild>
            <button className="w-full p-5 flex items-start justify-between text-left">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    AI shortlist — top {Math.min(TOP_N, shortlist.length)} nominations
                  </p>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {shortlist.length} approved nominations were scored. Top picks are
                    pre-selected — the panel lead can override.
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-stone-500 mt-1 transition-transform ${
                  shortlistOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-5 pb-5 space-y-3">
              {topShortlist.length === 0 ? (
                <p className="text-sm text-stone-500 italic">
                  Nothing eligible yet — approve some nominations first.
                </p>
              ) : (
                topShortlist.map((s) => {
                  const nom = nominationById.get(s.nominationId);
                  if (!nom) return null;
                  return (
                    <ShortlistCard
                      key={s.nominationId}
                      entry={s}
                      nomination={nom}
                      checked={selected.has(s.nominationId)}
                      onToggle={() => toggle(s.nominationId)}
                    />
                  );
                })
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {overflow.length > 0 && (
        <Card className="border border-stone-200">
          <CardContent className="p-5">
            <div className="flex items-baseline justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">
                  All approved nominations
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Browse outside the top {TOP_N} — anyone can be promoted.
                </p>
              </div>
              <span className="text-xs text-stone-400">{overflow.length} more</span>
            </div>
            <div className="space-y-2">
              {pageItems.map((s) => {
                const nom = nominationById.get(s.nominationId);
                if (!nom) return null;
                return (
                  <CompactNomRow
                    key={s.nominationId}
                    entry={s}
                    nomination={nom}
                    checked={selected.has(s.nominationId)}
                    onToggle={() => toggle(s.nominationId)}
                  />
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3 text-xs text-stone-500">
                <span>
                  Page {page + 1} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {mode === "embedded" ? (
        <div className="flex items-center justify-between gap-3 py-2">
          <p className="text-xs text-stone-500">
            {selected.size} of {shortlist.length} selected
          </p>
          <Button
            size="sm"
            onClick={confirmWinners}
            disabled={selected.size === 0 || confirming}
            className="bg-stone-900 hover:bg-stone-700 text-white"
            data-testid="confirm-winners"
          >
            <Trophy className="w-3.5 h-3.5 mr-1.5" />
            Confirm {selected.size} winner{selected.size === 1 ? "" : "s"}
          </Button>
        </div>
      ) : (
        <PageFooter
          selectedCount={selected.size}
          totalCount={shortlist.length}
          confirming={confirming}
          onConfirm={confirmWinners}
        />
      )}
    </>
  );
}

function PageFooter({
  selectedCount,
  totalCount,
  confirming,
  onConfirm,
}: {
  selectedCount: number;
  totalCount: number;
  confirming: boolean;
  onConfirm: () => void;
}) {
  return (
    <div className="sticky -bottom-6 z-30 max-w-5xl mx-auto border-t border-stone-200 bg-white p-3 flex items-center gap-3">
      <p className="text-xs text-stone-500 ml-2">
        {selectedCount} of {totalCount} selected
      </p>
      <div className="ml-auto flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/programs">Cancel</Link>
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          disabled={selectedCount === 0 || confirming}
          className="bg-stone-900 hover:bg-stone-700 text-white"
          data-testid="confirm-winners"
        >
          <Trophy className="w-3.5 h-3.5 mr-1.5" />
          Confirm {selectedCount} winner{selectedCount === 1 ? "" : "s"}
        </Button>
      </div>
    </div>
  );
}

function ShortlistCard({
  entry,
  nomination,
  checked,
  onToggle,
}: {
  entry: ShortlistEntry;
  nomination: Nomination;
  checked: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-stone-200 bg-white rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1.5 shrink-0 w-10">
          <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-semibold">
            {entry.rank}
          </div>
          <span className="text-xs font-semibold text-stone-700">{entry.score}</span>
          <span className="text-[10px] text-stone-400">/100</span>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={nomination.nomineeAvatar} alt={nomination.nomineeName} />
              <AvatarFallback className="text-xs">
                {nomination.nomineeName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900 truncate">
                {nomination.nomineeName}
              </p>
              <p className="text-xs text-stone-500 truncate">
                {nomination.nomineeRole}
                {nomination.nomineeDepartment && ` · ${nomination.nomineeDepartment}`}
              </p>
            </div>
          </div>
          <p className="text-sm text-stone-700 leading-snug">{entry.reasoning}</p>
          {entry.highlights.length > 1 && (
            <ul className="text-xs text-stone-600 space-y-0.5 list-disc pl-4">
              {entry.highlights.slice(0, 3).map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <button className="text-xs text-stone-500 hover:text-stone-900 underline-offset-2 hover:underline">
                {open ? "Hide" : "View"} full nomination
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-3 bg-stone-50 rounded-md text-xs text-stone-700 leading-relaxed">
                <p className="font-medium text-stone-900 mb-1">
                  Nominator: {nomination.nominatorName}
                </p>
                <p>{nomination.reason}</p>
                <BreakdownChips breakdown={entry.breakdown} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <label className="flex items-center gap-2 shrink-0 cursor-pointer">
          <Checkbox checked={checked} onCheckedChange={onToggle} />
          <span className="text-xs text-stone-700 hidden sm:inline">Include</span>
        </label>
      </div>
    </div>
  );
}

function CompactNomRow({
  entry,
  nomination,
  checked,
  onToggle,
}: {
  entry: ShortlistEntry;
  nomination: Nomination;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center gap-3 p-2 border border-stone-100 rounded-md hover:bg-stone-50 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      <span className="text-xs font-mono w-7 text-stone-500">#{entry.rank}</span>
      <Avatar className="h-7 w-7">
        <AvatarImage src={nomination.nomineeAvatar} alt={nomination.nomineeName} />
        <AvatarFallback className="text-xs">
          {nomination.nomineeName.split(" ").map((n) => n[0]).join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-900 truncate">{nomination.nomineeName}</p>
        <p className="text-xs text-stone-500 truncate">{nomination.reason}</p>
      </div>
      <span className="text-xs text-stone-700 font-medium">{entry.score}</span>
    </label>
  );
}

function BreakdownChips({ breakdown }: { breakdown: ShortlistEntry["breakdown"] }) {
  const chips: { label: string; value: number; max: number }[] = [
    { label: "Mgr", value: breakdown.managerApproval, max: 25 },
    { label: "Panel", value: breakdown.panelApproval, max: 30 },
    { label: "Quality", value: breakdown.reasonQuality, max: 20 },
    { label: "Impact", value: breakdown.impactKeywords, max: 15 },
    { label: "Timely", value: breakdown.timeliness, max: 10 },
  ];
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {chips.map((c) => (
        <span
          key={c.label}
          className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600"
        >
          {c.label} {c.value}/{c.max}
        </span>
      ))}
    </div>
  );
}
