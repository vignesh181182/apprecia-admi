import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Trophy,
  ChevronRight,
  FileText,
  FileCode2,
  Send,
  MonitorPlay,
  Mail,
  Share2,
  Lock,
  Linkedin,
  Twitter,
  Slack,
  MessageSquare,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getAccount, isAdmin } from "@/lib/account";
import {
  currentUserCanManageProgram,
  getAllProgramPanelMembers,
  getNominationsForProgram,
  type Nomination,
  type ProgramCategory,
  type StoredProgram,
} from "@/lib/programs-data";
import {
  shortlistByCategory,
  shortlistNominations,
  type ShortlistEntry,
} from "@/lib/ai-shortlister";
import { PHASE3_TIP } from "./winner-action-stubs";
import { ShortlistDetail } from "./shortlist-detail";

type Variant = "mobile" | "web";

export function PostCycleMobileSection({
  program,
  variant = "mobile",
}: {
  program: StoredProgram;
  variant?: Variant;
}) {
  const account = getAccount();
  const nominations = useMemo(
    () => getNominationsForProgram(program.id),
    [program.id],
  );
  const winners = useMemo(
    () => nominations.filter((n) => n.status === "winner"),
    [nominations],
  );
  const cycleEnded = useMemo(() => {
    if (program.status === "ended") return true;
    if (program.endDate) return new Date(program.endDate).getTime() < Date.now();
    return false;
  }, [program.status, program.endDate]);

  const canManage = currentUserCanManageProgram(account, program);
  const adminView = isAdmin(account);

  if (winners.length > 0) {
    return (
      <WinnersDeclared
        program={program}
        winners={winners}
        canManage={canManage}
        adminView={adminView}
        variant={variant}
      />
    );
  }

  if (cycleEnded && canManage) {
    return (
      <AiShortlistMobile
        program={program}
        nominations={nominations}
        variant={variant}
      />
    );
  }

  return null;
}

// ─── Section 1: AI shortlist ───────────────────────────────────────────

function AiShortlistMobile({
  program,
  nominations,
  variant,
}: {
  program: StoredProgram;
  nominations: Nomination[];
  variant: Variant;
}) {
  const navigate = useNavigate();
  const account = getAccount();

  const [shortlistRun, setShortlistRun] = useState(false);

  const eligible = useMemo(
    () =>
      nominations.filter(
        (n) => n.status === "approved" || n.status === "pending-panel",
      ),
    [nominations],
  );

  const programPanel = useMemo(
    () => getAllProgramPanelMembers(program),
    [program],
  );

  const nominationById = useMemo(
    () => new Map(nominations.map((n) => [n.id, n])),
    [nominations],
  );

  // Phase 1.8 — score per category against each category's own rubric.
  // Falls back to the unscoped scorer when the program has no categories.
  const categories: ProgramCategory[] = useMemo(
    () =>
      program.categories && program.categories.length > 0
        ? program.categories
        : [
            {
              id: "all",
              name: "All nominations",
              emoji: program.emoji ?? "✨",
              description: "",
              winnersCount: 1,
              prizePoints: program.pointsPerWin ?? 0,
            },
          ],
    [program.categories, program.emoji, program.pointsPerWin],
  );

  const byCategory = useMemo(() => {
    if (!shortlistRun) return new Map<string, ShortlistEntry[]>();
    if (program.categories && program.categories.length > 0) {
      return shortlistByCategory(eligible, account, program.categories);
    }
    // No categories on the program — score everything against the (legacy)
    // program-level panel so the demo still works.
    const flat = shortlistNominations(eligible, account, programPanel);
    return new Map([[categories[0].id, flat]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortlistRun, program.id, program.endDate, eligible.length, programPanel.length]);

  const shortlist = useMemo<ShortlistEntry[]>(() => {
    const flat: ShortlistEntry[] = [];
    for (const arr of byCategory.values()) flat.push(...arr);
    return flat;
  }, [byCategory]);

  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const openEntry = openEntryId
    ? shortlist.find((s) => s.nominationId === openEntryId) ?? null
    : null;
  const openNomination = openEntry ? nominationById.get(openEntry.nominationId) : null;

  if (!shortlistRun) {
    return (
      <section
        className={cn(
          "bg-white rounded-2xl border border-amber-200 mt-4 overflow-hidden",
          variant === "web" && "mt-0",
        )}
        data-testid="post-cycle-shortlist"
      >
        <header
          className="p-4 md:p-5"
          style={program.themeBg ? { background: program.themeBg } : undefined}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mobile font-semibold text-stone-900">
                ✨ Cycle ended — ready to shortlist
              </p>
              <p className="text-sm text-stone-700 mt-1 leading-snug">
                Score {eligible.length} approved nomination
                {eligible.length === 1 ? "" : "s"} and pre-pick the top{" "}
                {Math.min(10, eligible.length)}. You can override before declaring
                winners.
              </p>
            </div>
          </div>
        </header>
        <div className="p-4 md:p-5">
          <button
            type="button"
            onClick={() => setShortlistRun(true)}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#a87a3a] hover:bg-[#8e6630] text-white font-mobile font-semibold transition-colors shadow-sm"
            data-testid="run-shortlist"
          >
            <Sparkles className="w-4 h-4" />
            Run AI Shortlist
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "bg-white rounded-2xl border border-amber-200 mt-4 overflow-hidden",
        variant === "web" && "mt-0",
      )}
      data-testid="post-cycle-shortlist"
    >
      <header
        className="p-4 md:p-5"
        style={program.themeBg ? { background: program.themeBg } : undefined}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mobile font-semibold text-stone-900">
              ✨ Cycle ended — AI shortlist ready
            </p>
            <p className="text-sm text-stone-700 mt-1 leading-snug">
              {eligible.length} approved nomination{eligible.length === 1 ? "" : "s"} were
              scored. Review the top picks below.
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-5 space-y-5">
        {categories.map((cat) => {
          const entries = byCategory.get(cat.id) ?? [];
          if (entries.length === 0) return null;
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{cat.emoji}</span>
                <h4 className="font-mobile font-semibold text-stone-900">{cat.name}</h4>
                <span className="ml-auto text-[11px] font-mobile font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  Max winners: {cat.winnersCount}
                </span>
              </div>

              <div className="overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-1">
                <div className="flex gap-3">
                  {entries.map((entry) => {
                    const nom = nominationById.get(entry.nominationId);
                    if (!nom) return null;
                    return (
                      <button
                        type="button"
                        key={entry.nominationId}
                        onClick={() => setOpenEntryId(entry.nominationId)}
                        className="snap-start shrink-0 w-[280px] text-left bg-white border border-stone-200 rounded-2xl p-4 hover:border-amber-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="px-2 py-0.5 rounded-full bg-stone-900 text-white text-[11px] font-mobile font-semibold">
                            #{entry.rank}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100 text-[11px] font-mobile font-semibold tabular-nums">
                            {entry.score}/100
                          </span>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <img
                            src={nom.nomineeAvatar}
                            alt=""
                            className="w-16 h-16 rounded-full object-cover border border-stone-200"
                          />
                          <p className="mt-2 font-mobile font-semibold text-stone-900 truncate w-full">
                            {nom.nomineeName}
                          </p>
                          <p className="text-xs text-stone-500 truncate w-full">
                            {nom.nomineeRole}
                            {nom.nomineeDepartment && ` · ${nom.nomineeDepartment}`}
                          </p>
                        </div>
                        <p className="text-sm text-stone-700 mt-3 leading-snug line-clamp-3">
                          {entry.reasoning}
                        </p>
                        <p className="mt-3 text-[11px] text-amber-800 font-mobile font-semibold inline-flex items-center gap-1">
                          Tap to expand <ChevronRight className="w-3 h-3" />
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => navigate(`/m/programs/${program.id}/winner-selection`)}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#a87a3a] hover:bg-[#8e6630] text-white font-mobile font-semibold transition-colors shadow-sm"
          data-testid="review-and-select-winners"
        >
          <Trophy className="w-4 h-4" />
          Review and select winners
        </button>
      </div>

      <Sheet
        open={!!openEntryId}
        onOpenChange={(o) => !o && setOpenEntryId(null)}
      >
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
    </section>
  );
}

// ─── Section 2: Winners declared ───────────────────────────────────────

function WinnersDeclared({
  program,
  winners,
  canManage,
  adminView,
  variant,
}: {
  program: StoredProgram;
  winners: Nomination[];
  canManage: boolean;
  adminView: boolean;
  variant: Variant;
}) {
  const account = getAccount();
  const monetaryEnabled = !!account?.appreciationPolicy?.monetaryEnabled;

  const categories: ProgramCategory[] =
    program.categories && program.categories.length > 0
      ? program.categories
      : [
          {
            id: "all",
            name: "Winners",
            emoji: program.emoji ?? "🏆",
            description: "",
            winnersCount: winners.length,
            prizePoints: program.pointsPerWin ?? 0,
          },
        ];

  const byCategory = useMemo(() => {
    const m = new Map<string, Nomination[]>();
    for (const c of categories) m.set(c.id, []);
    const fallback = categories[0].id;
    for (const w of winners) {
      const id = w.categoryId && m.has(w.categoryId) ? w.categoryId : fallback;
      m.get(id)!.push(w);
    }
    Array.from(m.values()).forEach((list) =>
      list.sort((a: Nomination, b: Nomination) => (a.finalRank ?? 99) - (b.finalRank ?? 99)),
    );
    return m;
  }, [categories, winners]);

  const [openId, setOpenId] = useState<string | null>(null);
  const openWinner = openId ? winners.find((w) => w.id === openId) ?? null : null;
  const categoryCount = Array.from(byCategory.values()).filter(
    (l: Nomination[]) => l.length > 0,
  ).length;

  return (
    <>
      <section
        className={cn(
          "bg-white rounded-2xl border border-stone-200 mt-4 overflow-hidden",
          variant === "web" && "mt-0",
        )}
        data-testid="post-cycle-winners"
      >
        <header
          className="p-4 md:p-5 relative"
          style={program.themeBg ? { background: program.themeBg } : undefined}
        >
          <div className="absolute inset-0 pointer-events-none opacity-30 text-2xl select-none">
            <span className="absolute top-2 left-6">🎉</span>
            <span className="absolute top-3 right-8">✨</span>
            <span className="absolute bottom-2 left-10">🎊</span>
            <span className="absolute bottom-3 right-6">🥳</span>
          </div>
          <div className="relative flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mobile font-semibold text-stone-900">
                🏆 Winners declared
              </p>
              <p className="text-sm text-stone-700 mt-1 leading-snug">
                {winners.length} winner{winners.length === 1 ? "" : "s"} across{" "}
                {categoryCount} categor{categoryCount === 1 ? "y" : "ies"}
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-5 space-y-5">
          {categories.map((cat) => {
            const list = byCategory.get(cat.id) ?? [];
            if (list.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{cat.emoji}</span>
                  <h4 className="font-mobile font-semibold text-stone-900">{cat.name}</h4>
                </div>
                <ul className="space-y-2">
                  {list.map((w) => (
                    <li key={w.id}>
                      <WinnerRow
                        winner={w}
                        category={cat}
                        monetaryEnabled={monetaryEnabled}
                        canManage={canManage}
                        onExpand={() => setOpenId(w.id)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {adminView && <HrActionsCard />}
        </div>
      </section>

      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          {openWinner && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="font-mobile">
                  #{openWinner.finalRank ?? "—"} · {openWinner.nomineeName}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm text-stone-700">
                <p className="leading-relaxed">{openWinner.reason}</p>
                <p className="text-xs text-stone-500">
                  Nominated by{" "}
                  <span className="font-medium text-stone-700">
                    {openWinner.nominatorName}
                  </span>
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function WinnerRow({
  winner,
  category,
  monetaryEnabled,
  canManage,
  onExpand,
}: {
  winner: Nomination;
  category: ProgramCategory;
  monetaryEnabled: boolean;
  canManage: boolean;
  onExpand: () => void;
}) {
  const decided = winner.decidedAt ? new Date(winner.decidedAt) : null;
  const prizePoints = category.prizePoints || 0;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-3">
      <button
        type="button"
        onClick={onExpand}
        className="w-full flex items-center gap-3 text-left"
      >
        <img
          src={winner.nomineeAvatar}
          alt=""
          className="w-11 h-11 rounded-full object-cover shrink-0 border border-stone-200"
        />
        <div className="min-w-0 flex-1">
          <p className="font-mobile font-semibold text-stone-900 truncate">
            {winner.nomineeName}
          </p>
          <p className="text-xs text-stone-500 truncate">
            {winner.nomineeRole}
            {winner.nomineeDepartment && ` · ${winner.nomineeDepartment}`}
          </p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Won {timeAgo(decided)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="px-2 py-0.5 rounded-full bg-stone-900 text-white text-[11px] font-mobile font-semibold">
            #{winner.finalRank ?? "—"}
          </span>
          {monetaryEnabled && prizePoints > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100 text-[11px] font-mobile font-semibold tabular-nums">
              {prizePoints} pts
            </span>
          )}
        </div>
      </button>

      {canManage && <PerWinnerActionRow />}
    </div>
  );
}

function PerWinnerActionRow() {
  const { toast } = useToast();
  function fire(label: string, body: string) {
    toast({ title: label, description: body });
  }
  const items: { icon: React.ReactNode; label: string; body: string; ariaLabel: string }[] = [
    {
      icon: <FileText className="w-4 h-4" />,
      label: "Citation",
      ariaLabel: "Create citation",
      body: "Citation editor coming in Phase 3 — will let you add custom text and photo",
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "PDF",
      ariaLabel: "Generate PDF",
      body: "PDF generation coming in Phase 3",
    },
    {
      icon: <FileCode2 className="w-4 h-4" />,
      label: "PPT",
      ariaLabel: "Generate PowerPoint",
      body: "PPT generation coming in Phase 3",
    },
    {
      icon: <Send className="w-4 h-4" />,
      label: "Send to HR",
      ariaLabel: "Send to HR for publishing",
      body: "Workflow coming in Phase 3",
    },
  ];
  return (
    <div className="overflow-x-auto -mx-3 px-3 pt-3 mt-3 border-t border-stone-100">
      <div className="flex gap-2">
        {items.map((it) => (
          <Tooltip key={it.label}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={it.ariaLabel}
                onClick={() => fire(it.ariaLabel, it.body)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-stone-200 bg-white text-stone-700 text-xs font-mobile font-semibold hover:bg-stone-50 active:bg-stone-100 transition-colors"
              >
                {it.icon}
                {it.label}
              </button>
            </TooltipTrigger>
            <TooltipContent>{PHASE3_TIP}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

// ─── Section 3 (HR-only): publishing actions ──────────────────────────

function HrActionsCard() {
  const { toast } = useToast();
  function fire(label: string, body: string) {
    toast({ title: label, description: body });
  }
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mt-2">
      <div className="flex items-center gap-2 mb-3">
        <Lock className="w-3.5 h-3.5 text-stone-500" />
        <h4 className="font-mobile font-semibold text-stone-900">HR actions</h4>
      </div>

      <div className="space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() =>
                fire("Publish to award night display", "Award-night display coming in Phase 3")
              }
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-white border border-stone-200 text-stone-800 text-sm font-mobile font-semibold hover:bg-stone-100 transition-colors"
            >
              <MonitorPlay className="w-4 h-4" />
              🎬 Publish to award night display
            </button>
          </TooltipTrigger>
          <TooltipContent>{PHASE3_TIP}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() =>
                fire("Email announcement", "Email blast coming in Phase 3 (uses SendGrid)")
              }
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-white border border-stone-200 text-stone-800 text-sm font-mobile font-semibold hover:bg-stone-100 transition-colors"
            >
              <Mail className="w-4 h-4" />
              📧 Email announcement
            </button>
          </TooltipTrigger>
          <TooltipContent>{PHASE3_TIP}</TooltipContent>
        </Tooltip>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-white border border-stone-200 text-stone-800 text-sm font-mobile font-semibold hover:bg-stone-100 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              📱 Post to social channels
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" side="top" className="w-56 p-2">
            <SocialOption
              icon={<Linkedin className="w-4 h-4" />}
              label="LinkedIn"
              onClick={() => fire("LinkedIn", "Social post composer coming in Phase 3")}
            />
            <SocialOption
              icon={<Twitter className="w-4 h-4" />}
              label="Twitter / X"
              onClick={() => fire("Twitter", "Social post composer coming in Phase 3")}
            />
            <SocialOption
              icon={<Slack className="w-4 h-4" />}
              label="Slack"
              onClick={() => fire("Slack", "Social post composer coming in Phase 3")}
            />
            <SocialOption
              icon={<MessageSquare className="w-4 h-4" />}
              label="MS Teams"
              onClick={() => fire("MS Teams", "Social post composer coming in Phase 3")}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function SocialOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-stone-700 hover:bg-stone-100 transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────

function timeAgo(date: Date | null): string {
  if (!date) return "recently";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "just now";
  const day = 1000 * 60 * 60 * 24;
  const days = Math.floor(diffMs / day);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
