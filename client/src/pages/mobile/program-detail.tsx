import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Award,
  Calendar,
  Users,
  Edit3,
  Settings,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-viewport";
import { EmployeeLayout } from "@/components/employee-layout";
import { RecognizeDialog } from "@/components/recognize/recognize-dialog";
import { cn } from "@/lib/utils";
import { getProgram, type Program } from "@/lib/programs-data";
import { isAdmin } from "@/lib/account";
import { DashboardOverview } from "@/components/programs/dashboard-overview";
import { PanelTab } from "@/components/programs/panel-tab";
import { DetailsTab, AboutCard, LastWinnerCard } from "@/components/programs/details-tab";

type AdminTab = "dashboard" | "panel" | "details";

export default function ProgramDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const program = getProgram(id);
  const admin = isAdmin();
  const [tab, setTab] = useState<AdminTab>(admin ? "dashboard" : "details");

  if (!program) {
    return (
      <EmployeeLayout showRightRail={false}>
        <div className="px-5 md:px-0 pt-3 md:pt-0 pb-6 text-center">
          <p className="text-sm text-stone-700 mb-2">Program not found.</p>
          <Link to="/m" className="text-sm text-amber-800 underline">Back to home</Link>
        </div>
      </EmployeeLayout>
    );
  }

  if (!admin) {
    return <EmployeeView program={program} />;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <CompactHero program={program} onBack={() => navigate(-1)} />
        <ProgramTabs value={tab} onChange={setTab} />
        <main className="flex-1 px-5 pb-32 pt-4">
          {tab === "dashboard" && <DashboardOverview program={program} />}
          {tab === "panel" && <PanelTab program={program} />}
          {tab === "details" && <DetailsTab program={program} />}
        </main>
        <NominateCta program={program} fixed />
      </div>
    );
  }

  return (
    <EmployeeLayout showRightRail={false}>
      <div className="space-y-4 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <CompactHero program={program} variant="web" />
        <ProgramTabs value={tab} onChange={setTab} variant="web" />
        {tab === "dashboard" && <DashboardOverview program={program} variant="web" />}
        {tab === "panel" && <PanelTab program={program} variant="web" />}
        {tab === "details" && <DetailsTab program={program} variant="web" />}
      </div>
    </EmployeeLayout>
  );
}

function EmployeeView({ program }: { program: Program }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const statusLabel = program.status === "ending-soon" ? "Ending soon" : program.status === "draft" ? "Draft" : "Active Program";

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: program.themeBg }}>
        <header className="px-5 pt-3 pb-2 flex items-center">
          <button onClick={() => navigate(-1)} aria-label="Back" className="-ml-2 p-2 rounded-full hover:bg-black/5 transition-colors">
            <ChevronLeft className="w-5 h-5 text-stone-800" />
          </button>
        </header>

        <main className="flex-1 px-5 pb-32 space-y-5">
          <Hero program={program} statusLabel={statusLabel} />
          <StatRow program={program} />
          <AboutCard program={program} />
          {program.lastWinner && <LastWinnerCard winner={program.lastWinner} />}
        </main>

        <NominateCta program={program} fixed />
      </div>
    );
  }

  return (
    <EmployeeLayout showRightRail={false}>
      <div className="space-y-4 pb-12">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900">
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <div className="rounded-3xl overflow-hidden border border-stone-200" style={{ background: program.themeBg }}>
          <div className="px-6 pt-6 pb-2"><Hero program={program} statusLabel={statusLabel} /></div>
          <div className="px-6 pb-6"><StatRow program={program} /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <AboutCard program={program} />
            {program.lastWinner && <LastWinnerCard winner={program.lastWinner} />}
          </div>
          <div><NominateCta program={program} /></div>
        </div>
      </div>
    </EmployeeLayout>
  );
}

function CompactHero({ program, onBack, variant = "mobile" }: { program: Program; onBack?: () => void; variant?: "mobile" | "web" }) {
  return (
    <div
      className={cn(
        variant === "mobile" ? "px-5 pt-2 pb-5" : "rounded-3xl px-6 py-5 border border-stone-200",
      )}
      style={{ background: program.themeBg }}
    >
      {onBack && (
        <button onClick={onBack} aria-label="Back" className="-ml-2 p-2 mb-1 rounded-full hover:bg-black/5 inline-flex">
          <ChevronLeft className="w-5 h-5 text-stone-800" />
        </button>
      )}
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-mobile text-xl md:text-2xl font-semibold text-stone-900 leading-tight">{program.name}</h1>
          <p className="text-sm text-stone-700 mt-1.5 leading-snug">{program.shortDesc}</p>
        </div>
        <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/40 flex items-center justify-center text-3xl md:text-4xl">
          {program.emoji}
        </div>
      </div>
    </div>
  );
}

function ProgramTabs({ value, onChange, variant = "mobile" }: { value: AdminTab; onChange: (v: AdminTab) => void; variant?: "mobile" | "web" }) {
  const tabs: { key: AdminTab; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "panel",     label: "Panel" },
    { key: "details",   label: "Details" },
  ];
  return (
    <div className={cn("flex items-center gap-2", variant === "mobile" ? "px-5 mt-3" : "mt-1")}>
      <div className="flex-1 inline-flex bg-stone-100 rounded-full p-1 gap-1">
        {tabs.map((t) => {
          const active = t.key === value;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              className={cn(
                "flex-1 h-9 rounded-full text-sm font-mobile font-semibold transition-colors",
                active ? "bg-[#a87a3a] text-white shadow-sm" : "text-stone-600 hover:text-stone-900",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        aria-label="Program settings"
        className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}

function Hero({ program, statusLabel }: { program: Program; statusLabel: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <span className="inline-flex items-center gap-1.5 bg-amber-50/90 border border-amber-100 rounded-full px-3 py-1 text-xs font-mobile font-semibold text-amber-800">
          <Award className="w-3.5 h-3.5" />
          {statusLabel}
        </span>
        <h1 className="font-mobile text-2xl md:text-3xl font-semibold text-stone-900 mt-3 leading-tight">{program.name}</h1>
        <p className="text-sm text-stone-700 mt-2 leading-relaxed">{program.shortDesc}</p>
      </div>
      <div className="shrink-0 w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/40 flex items-center justify-center text-6xl md:text-7xl">
        {program.emoji}
      </div>
    </div>
  );
}

function StatRow({ program }: { program: Program }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatTile Icon={Award} value={program.pointsPerWin} label="Points" />
      <StatTile Icon={Calendar} value={program.daysLeft} label="Days Left" />
      <StatTile Icon={Users} value={program.nominations} label="Nominations" />
    </div>
  );
}

function StatTile({ Icon, value, label }: { Icon: React.FC<{ className?: string }>; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-stone-700" />
      </span>
      <div className="min-w-0">
        <p className="font-mobile text-lg md:text-xl font-semibold text-stone-900 leading-none tabular-nums">{value}</p>
        <p className="text-xs text-stone-600 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function NominateCta({ program: _, fixed }: { program: Program; fixed?: boolean }) {
  const button = (
    <RecognizeDialog
      kind="rnr"
      trigger={
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 h-13 py-3.5 rounded-full bg-[#a87a3a] hover:bg-[#8e6630] text-white font-mobile font-semibold transition-colors shadow-sm"
        >
          <Edit3 className="w-4 h-4" />
          Nominate a Peer
        </button>
      }
    />
  );

  if (fixed) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-30 px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] bg-gradient-to-t from-stone-50 via-stone-50/90 to-transparent">
        <div className="max-w-md mx-auto">{button}</div>
      </div>
    );
  }
  return button;
}
