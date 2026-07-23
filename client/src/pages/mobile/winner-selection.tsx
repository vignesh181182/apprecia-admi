import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Check, Trophy, Info } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getAccount } from "@/lib/account";
import {
  currentUserCanManageProgram,
  declareWinners,
  getAllProgramPanelMembers,
  getNominationsForProgram,
  getProgramById,
  type Nomination,
  type ProgramCategory,
} from "@/lib/programs-data";
import {
  shortlistByCategory,
  shortlistNominations,
  type ShortlistEntry,
} from "@/lib/ai-shortlister";
import { ShortlistDetail } from "@/components/programs/shortlist-detail";

export default function MobileWinnerSelection() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const account = getAccount();
  const program = getProgramById(id);

  const nominations = useMemo(
    () => (program ? getNominationsForProgram(program.id) : []),
    [program],
  );

  const eligible = useMemo(
    () =>
      nominations.filter(
        (n) => n.status === "approved" || n.status === "pending-panel",
      ),
    [nominations],
  );

  const alreadyHasWinners = useMemo(
    () => nominations.some((n) => n.status === "winner"),
    [nominations],
  );

  const programPanel = useMemo(
    () => (program ? getAllProgramPanelMembers(program) : []),
    [program],
  );
  const shortlist = useMemo<ShortlistEntry[]>(() => {
    if (!program) return [];
    // Phase 1.8 — per-category scoring when the program has categories.
    if (program.categories && program.categories.length > 0) {
      const byCat = shortlistByCategory(eligible, account, program.categories);
      const flat: ShortlistEntry[] = [];
      for (const arr of byCat.values()) flat.push(...arr);
      flat.sort((a, b) => b.score - a.score || a.nominationId.localeCompare(b.nominationId));
      flat.forEach((e, i) => {
        e.rank = i + 1;
      });
      return flat;
    }
    return shortlistNominations(eligible, account, programPanel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program?.id, eligible.length, programPanel.length]);

  const nominationById = useMemo(
    () => new Map(nominations.map((n) => [n.id, n])),
    [nominations],
  );

  const categories: ProgramCategory[] = useMemo(() => {
    if (!program) return [];
    if (program.categories && program.categories.length > 0) return program.categories;
    return [
      {
        id: "all",
        name: "Winners",
        emoji: program.emoji ?? "🏆",
        description: "",
        winnersCount: Math.max(1, Math.min(3, shortlist.length)),
        prizePoints: program.pointsPerWin ?? 0,
      },
    ];
  }, [program, shortlist.length]);

  const byCategory = useMemo(() => {
    const m = new Map<string, ShortlistEntry[]>();
    for (const c of categories) m.set(c.id, []);
    if (categories.length === 0) return m;
    const fallbackId = categories[0].id;
    for (const e of shortlist) {
      const nom = nominationById.get(e.nominationId);
      const catId =
        nom?.categoryId && m.has(nom.categoryId) ? nom.categoryId : fallbackId;
      m.get(catId)!.push(e);
    }
    return m;
  }, [categories, shortlist, nominationById]);

  const defaultSelected = useMemo(() => {
    const out = new Set<string>();
    for (const cat of categories) {
      const entries = byCategory.get(cat.id) ?? [];
      for (const e of entries.slice(0, cat.winnersCount)) out.add(e.nominationId);
    }
    return out;
  }, [categories, byCategory]);

  const [selected, setSelected] = useState<Set<string>>(defaultSelected);
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!program) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-muted">
        <p className="text-sm text-muted-foreground mb-2">Program not found.</p>
        <Link to="/m/programs" className="text-sm text-primary underline">
          Back to programs
        </Link>
      </div>
    );
  }

  if (!currentUserCanManageProgram(account, program)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-muted">
        <p className="text-sm text-muted-foreground mb-2">
          You don't have permission to declare winners for this program.
        </p>
        <Link to={`/m/programs/${program.id}`} className="text-sm text-primary underline">
          Back to program
        </Link>
      </div>
    );
  }

  if (alreadyHasWinners) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-muted text-center">
        <Trophy className="w-8 h-8 text-primary mb-3" />
        <p className="text-sm text-muted-foreground mb-3">
          Winners have already been declared for this cycle.
        </p>
        <Link
          to={`/m/programs/${program.id}`}
          className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-white text-sm font-mobile font-semibold"
        >
          View winners
        </Link>
      </div>
    );
  }

  if (eligible.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-muted text-center">
        <p className="text-sm text-muted-foreground mb-3">
          No eligible nominations to score.
        </p>
        <Link to={`/m/programs/${program.id}`} className="text-sm text-primary underline">
          Back to program
        </Link>
      </div>
    );
  }

  const openEntry = openEntryId
    ? shortlist.find((s) => s.nominationId === openEntryId) ?? null
    : null;
  const openNomination = openEntry ? nominationById.get(openEntry.nominationId) : null;

  function toggle(entry: ShortlistEntry, category: ProgramCategory) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(entry.nominationId)) {
        next.delete(entry.nominationId);
        return next;
      }
      const cap = category.winnersCount;
      const entriesInCat = byCategory.get(category.id) ?? [];
      const selectedInCat = entriesInCat.filter((e) => next.has(e.nominationId));
      if (selectedInCat.length >= cap) {
        // Swap the lowest-scored selection in this category for the new one.
        const lowest = selectedInCat.reduce((a, b) => (a.score <= b.score ? a : b));
        next.delete(lowest.nominationId);
        const lowestNom = nominationById.get(lowest.nominationId);
        toast({
          title: `Swapped in ${nominationById.get(entry.nominationId)?.nomineeName ?? "nominee"}`,
          description: `${category.name} is capped at ${cap} winner${cap === 1 ? "" : "s"} — replaced ${lowestNom?.nomineeName ?? "the lowest-scored pick"}.`,
        });
      }
      next.add(entry.nominationId);
      return next;
    });
  }

  function handleConfirm() {
    if (submitting || selected.size === 0) return;
    setSubmitting(true);
    // Rank selected nominations by their AI shortlist position, compressed to 1..N.
    const selectedEntries = shortlist
      .filter((e) => selected.has(e.nominationId))
      .sort((a, b) => a.rank - b.rank);
    const selections = selectedEntries.map((e, i) => ({
      nominationId: e.nominationId,
      rank: i + 1,
    }));
    declareWinners(program!.id, "current", selections);
    toast({
      title: "Winners declared",
      description: `${selections.length} winner${selections.length === 1 ? "" : "s"} for ${program!.name}`,
    });
    navigate(`/m/programs/${program!.id}`, { replace: true });
  }

  const selectionCount = selected.size;

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <header
        className="px-5 pt-3 pb-4"
        style={program.themeBg ? { background: program.themeBg } : undefined}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="-ml-2 p-2 mb-1 rounded-full hover:bg-black/5 inline-flex"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/50 flex items-center justify-center text-2xl shrink-0">
            {program.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-mobile text-lg font-semibold text-foreground leading-tight truncate">
              {program.name}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pick winners across {categories.length} categor
              {categories.length === 1 ? "y" : "ies"}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-4 pb-40 space-y-5">
        {categories.map((cat) => {
          const entries = byCategory.get(cat.id) ?? [];
          if (entries.length === 0) return null;
          const selectedInCat = entries.filter((e) => selected.has(e.nominationId)).length;
          return (
            <section key={cat.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{cat.emoji}</span>
                <h2 className="font-mobile font-semibold text-foreground">{cat.name}</h2>
                <span
                  className={cn(
                    "ml-auto text-[11px] font-mobile font-semibold px-2 py-0.5 rounded-full",
                    selectedInCat >= cat.winnersCount
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {selectedInCat}/{cat.winnersCount} selected
                </span>
              </div>

              <ul className="space-y-2">
                {entries.map((entry) => {
                  const nom = nominationById.get(entry.nominationId);
                  if (!nom) return null;
                  const isSelected = selected.has(entry.nominationId);
                  return (
                    <li key={entry.nominationId}>
                      <div
                        className={cn(
                          "bg-white border rounded-2xl p-3 transition-colors",
                          isSelected ? "border-amber-400 ring-1 ring-amber-300" : "border-border",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => toggle(entry, cat)}
                          className="w-full flex items-center gap-3 text-left"
                          aria-pressed={isSelected}
                        >
                          <span
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "bg-primary border-primary text-white"
                                : "bg-white border-border text-transparent",
                            )}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </span>
                          <img
                            src={nom.nomineeAvatar}
                            alt=""
                            className="w-11 h-11 rounded-full object-cover shrink-0 border border-border"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-mobile font-semibold text-foreground truncate">
                              {nom.nomineeName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {nom.nomineeRole}
                              {nom.nomineeDepartment && ` · ${nom.nomineeDepartment}`}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[11px] font-mobile font-semibold">
                              #{entry.rank}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15 text-[11px] font-mobile font-semibold tabular-nums">
                              {entry.score}/100
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setOpenEntryId(entry.nominationId)}
                          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-full bg-muted hover:bg-muted text-xs text-muted-foreground font-mobile font-semibold transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                          View reasoning &amp; details
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Ready to declare</p>
            <p className="font-mobile font-semibold text-foreground tabular-nums">
              {selectionCount} of {shortlist.length} selected
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={selectionCount === 0 || submitting}
                className="inline-flex items-center justify-center gap-2 px-5 h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-mobile font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="confirm-winners"
              >
                <Trophy className="w-4 h-4" />
                Confirm winners
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Declare {selectionCount} winner{selectionCount === 1 ? "" : "s"}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will finalize winners for {program.name}. You can re-run the
                  shortlist from the program page if you change your mind, but the
                  announcement actions will fire as soon as you confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirm}
                  className="bg-primary hover:bg-primary/90"
                >
                  Declare winners
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </footer>

      <Sheet open={!!openEntryId} onOpenChange={(o) => !o && setOpenEntryId(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          {openEntry && openNomination && (
            <ShortlistDetail
              entry={openEntry}
              nomination={openNomination}
              panelSize={programPanel.length}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
