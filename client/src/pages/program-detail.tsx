import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Pencil,
  Sparkles,
  Trophy,
} from "lucide-react";
import { BannerArt } from "@/components/programs/banner-art";
import { DashboardOverview } from "@/components/programs/dashboard-overview";
import { PanelTab } from "@/components/programs/panel-tab";
import { DetailsTab } from "@/components/programs/details-tab";
import { ScoreDistributionCard } from "@/components/programs/score-distribution-card";
import { AiShortlistPanel } from "@/components/programs/ai-shortlist-panel";
import { WinnerActionStubs } from "@/components/programs/winner-action-stubs";
import {
  getNominationsForProgram,
  getProgramById,
  type Nomination,
  type ProgramStatus,
  type StoredProgram,
} from "@/lib/programs-data";
import {
  shortlistNominations,
  type ShortlistEntry,
} from "@/lib/ai-shortlister";
import { getAccount, isAdmin } from "@/lib/account";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "panel" | "details";

const STATUS_BADGE: Record<ProgramStatus, string> = {
  draft: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  "ending-soon": "bg-orange-100 text-orange-800 hover:bg-orange-100",
  ended: "bg-stone-100 text-stone-700 hover:bg-stone-100",
};

const SHORTLIST_EXIST_PROGRAM_STATUSES: ProgramStatus[] = [
  "active",
  "ending-soon",
  "ended",
];

export default function ProgramDetailAdmin() {
  const { programId = "" } = useParams<{ programId: string }>();
  const [searchParams] = useSearchParams();
  const account = getAccount();
  const admin = isAdmin(account);

  const [version, setVersion] = useState(0);
  const program = useMemo<StoredProgram | undefined>(
    () => (programId ? getProgramById(programId) : undefined),
    [programId, version],
  );

  const initialTab: Tab = (searchParams.get("tab") as Tab | null) ?? "dashboard";
  const [tab, setTab] = useState<Tab>(initialTab);

  if (!admin) {
    return <Navigate to={`/m/programs/${programId}`} replace />;
  }

  if (!program) {
    return (
      <div className="p-6">
        <p className="text-sm text-stone-500">Program not found.</p>
        <Button asChild variant="ghost" size="sm" className="mt-3">
          <Link to="/programs">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to programs
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 pb-12">
      <div className="max-w-5xl mx-auto pt-4 lg:pt-6 space-y-5">
        <Header program={program} />
        <Tabs value={tab} onChange={setTab} />
        {tab === "dashboard" && (
          <DashboardAdminTab
            program={program}
            focus={searchParams.get("focus")}
            onWinnersChanged={() => setVersion((v) => v + 1)}
          />
        )}
        {tab === "panel" && <PanelTab program={program} variant="web" />}
        {tab === "details" && <DetailsTab program={program} variant="web" />}
      </div>
    </div>
  );
}

function Header({ program }: { program: StoredProgram }) {
  return (
    <Card className="border border-stone-200 overflow-hidden">
      <div className="relative h-28 lg:h-32">
        <BannerArt
          bannerId={program.bannerId}
          customDataUrl={program.customBannerDataUrl}
          className="absolute inset-0"
        />
        <div className="relative z-10 h-full flex items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl drop-shadow">
              {program.iconEmoji ?? program.emoji ?? "🏆"}
            </span>
            <div className="text-white drop-shadow min-w-0">
              <p className="text-lg font-semibold truncate">{program.name}</p>
              <p className="text-xs opacity-90 truncate">
                {program.shortDesc ?? program.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={cn("text-xs capitalize", STATUS_BADGE[program.status])}>
              {program.status}
            </Badge>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="h-8 bg-white/85 hover:bg-white text-stone-800"
            >
              <Link to={`/programs/${program.id}/edit`}>
                <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-4 flex items-center gap-4 text-xs text-stone-600 flex-wrap">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {program.startDate
            ? new Date(program.startDate).toLocaleDateString()
            : "—"}{" "}
          →{" "}
          {program.endDate ? new Date(program.endDate).toLocaleDateString() : "—"}
        </span>
        <span className="w-1 h-1 rounded-full bg-stone-300" />
        <span>{program.daysLeft} days left</span>
        <span className="w-1 h-1 rounded-full bg-stone-300" />
        <Link
          to="/programs"
          className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-3 h-3" /> All programs
        </Link>
      </CardContent>
    </Card>
  );
}

function Tabs({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "panel", label: "Panel" },
    { key: "details", label: "Details" },
  ];
  return (
    <div className="inline-flex bg-stone-100 rounded-full p-1 gap-1">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            data-testid={`program-tab-${t.key}`}
            className={cn(
              "h-9 px-4 rounded-full text-sm font-semibold transition-colors",
              active
                ? "bg-[#a87a3a] text-white shadow-sm"
                : "text-stone-600 hover:text-stone-900",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function DashboardAdminTab({
  program,
  focus,
  onWinnersChanged,
}: {
  program: StoredProgram;
  focus: string | null;
  onWinnersChanged: () => void;
}) {
  const canShortlist = SHORTLIST_EXIST_PROGRAM_STATUSES.includes(program.status);

  const [shortlistRun, setShortlistRun] = useState(false);
  useEffect(() => {
    if (focus === "shortlist") setShortlistRun(true);
  }, [focus]);

  const winners = useMemo<Nomination[]>(
    () => getNominationsForProgram(program.id).filter((n) => n.status === "winner"),
    [program.id, shortlistRun],
  );
  const hasWinners = winners.length > 0;

  useEffect(() => {
    if (!focus) return;
    const target = document.querySelector(`[data-focus="${focus}"]`);
    if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focus, shortlistRun, hasWinners]);

  return (
    <div className="space-y-5">
      <DashboardOverview program={program} variant="web" />

      {canShortlist && (
        <ShortlistSection
          program={program}
          shortlistRun={shortlistRun}
          onRun={() => setShortlistRun(true)}
          onConfirmed={() => {
            setShortlistRun(true);
            onWinnersChanged();
          }}
        />
      )}

      {hasWinners && (
        <Card className="border border-stone-200" data-focus="winners">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-stone-900">
                  Winners declared
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Phase-3 publishing actions appear as stubs.
                </p>
              </div>
              <Trophy className="w-4 h-4 text-amber-700" />
            </div>
            <WinnerActionStubs program={program} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ShortlistSection({
  program,
  shortlistRun,
  onRun,
  onConfirmed,
}: {
  program: StoredProgram;
  shortlistRun: boolean;
  onRun: () => void;
  onConfirmed: () => void;
}) {
  const account = getAccount();
  const [open, setOpen] = useState(true);

  const shortlist = useMemo<ShortlistEntry[]>(() => {
    if (!shortlistRun) return [];
    const eligible = getNominationsForProgram(program.id).filter(
      (n) => n.status === "approved" || n.status === "pending-panel",
    );
    return shortlistNominations(eligible, account, program.panel ?? []);
  }, [shortlistRun, program.id, program.panel, account]);

  if (!shortlistRun) {
    return (
      <Card
        className="border border-amber-200 bg-amber-50/40"
        data-focus="shortlist"
      >
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-900">
              Post-cycle AI shortlister
            </p>
            <p className="text-xs text-stone-600 mt-0.5">
              Score every approved nomination and pre-pick the top {Math.min(10, program.nominations || 10)}. The panel lead can override before declaring winners.
            </p>
          </div>
          <Button
            size="sm"
            onClick={onRun}
            className="bg-stone-900 hover:bg-stone-700 text-white shrink-0"
            data-testid="run-shortlist"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Run AI shortlist
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="border border-stone-200" data-focus="shortlist">
        <CollapsibleTrigger asChild>
          <button className="w-full px-5 py-4 flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  AI shortlist & winner selection
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {shortlist.length} scored · top picks pre-selected
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-stone-500 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-5 space-y-4">
            <ScoreDistributionCard shortlist={shortlist} />
            <AiShortlistPanel
              program={program}
              mode="embedded"
              onConfirmed={onConfirmed}
            />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
