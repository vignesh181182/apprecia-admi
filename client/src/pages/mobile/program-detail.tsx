import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Award,
  Calendar,
  Users,
  Target,
  Trophy,
  Gift,
  Rocket,
  Edit3,
  Quote,
  Settings,
  UserCheck,
  UserPlus,
  Crown,
  Check,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-viewport";
import { EmployeeLayout } from "@/components/employee-layout";
import { RecognizeDialog } from "@/components/recognize/recognize-dialog";
import { KpiCard } from "@/components/insights/kpi-card";
import { cn } from "@/lib/utils";
import { getProgram, type Program, type ProgramHighlight } from "@/lib/programs-data";
import { isAdmin, getAccount } from "@/lib/account";

const ICON_MAP: Record<ProgramHighlight["iconKey"], React.FC<{ className?: string }>> = {
  target: Target,
  trophy: Trophy,
  gift: Gift,
  users: Users,
  award: Award,
  rocket: Rocket,
};

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
          {tab === "dashboard" && <DashboardTab program={program} />}
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
        {tab === "dashboard" && <DashboardTab program={program} variant="web" />}
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

function DashboardTab({ program, variant = "mobile" }: { program: Program; variant?: "mobile" | "web" }) {
  const currency = getAccount()?.currency || "₹";
  const usedPct = Math.min(100, Math.round((program.budgetUsed / program.budgetAllocated) * 100));

  return (
    <div className={cn("space-y-4", variant === "web" && "pt-3")}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Nominations" value={program.nominations.toLocaleString()} delta={program.nominationsDelta} Icon={Award} tone="amber" />
        <KpiCard label="Participants" value={`${program.participantsRate ?? 0}%`} delta={program.participantsDelta} Icon={Users} tone="rose" />
        <KpiCard label="Budget used" value={`${currency}${formatK(program.budgetUsed)}`} Icon={Wallet} tone="emerald" />
        <KpiCard label="Remaining" value={`${program.daysLeft} days`} Icon={Calendar} tone="stone" />
      </div>

      <section className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
        <header className="mb-3">
          <h3 className="font-mobile font-semibold text-stone-900">Budget Progress</h3>
        </header>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <p className="text-sm text-stone-900">
            <span className="font-mobile font-semibold">{currency}{program.budgetUsed.toLocaleString()}</span>
            <span className="text-stone-500"> of {currency}{program.budgetAllocated.toLocaleString()}</span>
          </p>
          <span className="text-sm font-mobile font-semibold text-stone-700 tabular-nums">{usedPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-700" style={{ width: `${usedPct}%` }} />
        </div>
        {program.prizes && program.prizes.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {program.prizes.map((p) => (
              <div
                key={p.rank}
                className={cn(
                  "rounded-xl p-3",
                  p.rank === 1 ? "bg-emerald-50 border border-emerald-100" : "bg-stone-50 border border-stone-100",
                )}
              >
                <p className="font-mobile text-base font-semibold text-stone-900">
                  {currency}{formatK(p.amount)}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">{ordinal(p.rank)} prize</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {program.programLeaderboard && program.programLeaderboard.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
          <header className="flex items-center justify-between mb-3">
            <h3 className="font-mobile font-semibold text-stone-900">Leaderboard</h3>
            <TrendingUp className="w-4 h-4 text-stone-400" />
          </header>
          <ul className="divide-y divide-stone-100">
            {program.programLeaderboard.map((row) => (
              <li key={row.rank} className="flex items-center gap-3 py-2.5">
                <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 text-xs font-mobile font-semibold flex items-center justify-center shrink-0">
                  {row.rank}
                </span>
                <img src={row.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mobile font-semibold text-stone-900 truncate">{row.name}</p>
                  <p className="text-xs text-stone-500 truncate">{row.role}</p>
                </div>
                <p className="font-mobile font-semibold text-stone-900 shrink-0 tabular-nums">
                  {row.points}{" "}
                  <span className="text-xs font-normal text-stone-500">pts</span>
                </p>
              </li>
            ))}
          </ul>
          <button className="text-xs text-stone-500 hover:text-stone-900 mt-1">View all</button>
        </section>
      )}

      {program.attentionItems && program.attentionItems.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
          <h3 className="font-mobile font-semibold text-stone-900 mb-2">Needs Attention</h3>
          <ul className="space-y-3">
            {program.attentionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 w-2 h-2 rounded-full shrink-0",
                    item.severity === "high" ? "bg-rose-600" : item.severity === "medium" ? "bg-amber-500" : "bg-stone-300",
                  )}
                />
                <div>
                  <p className="text-sm font-mobile font-semibold text-stone-900 leading-snug">{item.title}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PanelTab({ program, variant = "mobile" }: { program: Program; variant?: "mobile" | "web" }) {
  const panel = program.panel ?? [];

  if (panel.length === 0) {
    return (
      <div className={cn("space-y-3", variant === "web" && "pt-3")}>
        <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-sm font-mobile font-semibold text-stone-900">No panel assigned yet</p>
          <p className="text-xs text-stone-500 mt-1 mb-4 max-w-xs mx-auto">
            Add panel members who will review nominations and choose the winners for this program.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#a87a3a] hover:bg-[#8e6630] text-white text-sm font-mobile font-semibold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add panel member
          </button>
        </div>
      </div>
    );
  }

  const lead = panel.find((m) => m.lead);
  const totalReviewed = panel.reduce((sum, m) => sum + m.reviewed, 0);
  const totalCapacity = panel.reduce((sum, m) => sum + m.totalToReview, 0);
  const reviewedPct = totalCapacity > 0 ? Math.round((totalReviewed / totalCapacity) * 100) : 0;

  return (
    <div className={cn("space-y-4", variant === "web" && "pt-3")}>
      {/* Header card — explains the panel role */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4 text-amber-700" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mobile font-semibold text-stone-900 text-sm">
              {panel.length} panel {panel.length === 1 ? "member" : "members"}
              {lead && <span className="text-stone-500 font-normal"> · led by {lead.name}</span>}
            </p>
            <p className="text-xs text-stone-500 mt-0.5 leading-snug">
              These members review nominations and select the winners for this program.
            </p>
          </div>
        </div>

        {/* Overall review progress */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-stone-600">Overall review progress</span>
            <span className="font-mobile font-semibold text-stone-900 tabular-nums">
              {totalReviewed} / {totalCapacity} reviews
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-[#a87a3a] rounded-full transition-all"
              style={{ width: `${reviewedPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Panel members list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-mobile font-semibold text-stone-500 uppercase tracking-wide">
            Panel members
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-mobile font-semibold text-[#a87a3a] hover:text-[#8e6630] transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add member
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {panel.map((m) => (
            <PanelMemberCard key={m.id} member={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelMemberCard({ member }: { member: NonNullable<Program["panel"]>[number] }) {
  const pct = member.totalToReview > 0 ? Math.round((member.reviewed / member.totalToReview) * 100) : 0;
  const allDone = pct === 100;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-stone-300 transition-colors">
      <div className="flex items-start gap-3">
        <img
          src={member.avatar}
          alt=""
          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-100"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-mobile font-semibold text-stone-900 text-sm truncate">{member.name}</p>
            {member.lead && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-mobile font-semibold text-amber-800 uppercase tracking-wide">
                <Crown className="w-2.5 h-2.5" />
                Lead
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 mt-0.5 truncate">{member.role}</p>
          <p className="text-[11px] text-stone-500 mt-0.5 truncate">{member.department}</p>
        </div>
      </div>

      {/* Per-member review progress */}
      <div className="mt-3 pt-3 border-t border-stone-100">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-stone-500">Reviews</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="font-mobile font-semibold text-stone-900 tabular-nums">
              {member.reviewed}/{member.totalToReview}
            </span>
            {allDone && (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 text-[10px] font-mobile font-semibold uppercase tracking-wide">
                <Check className="w-3 h-3" />
                Done
              </span>
            )}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              allDone ? "bg-emerald-500" : "bg-[#a87a3a]",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function DetailsTab({ program, variant = "mobile" }: { program: Program; variant?: "mobile" | "web" }) {
  return (
    <div className={cn("space-y-4", variant === "web" && "pt-3")}>
      <RewardTeammateCard program={program} />
      <AboutCard program={program} />
      {program.lastWinner && <LastWinnerCard winner={program.lastWinner} />}
    </div>
  );
}

function RewardTeammateCard({ program }: { program: Program }) {
  const featured = (program.programLeaderboard ?? []).slice(0, 3);

  return (
    <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white">
      {/* Hero header — theme-colored background */}
      <div
        className="px-5 pt-5 pb-4 flex items-start gap-3"
        style={{ background: program.themeBg }}
      >
        <span className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center text-xl shrink-0 shadow-sm">
          🎁
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-mobile text-base font-semibold text-stone-900 leading-tight">
            Reward your teammate
          </h3>
          <p className="text-sm text-stone-700 mt-1 leading-snug">
            Recognize a peer who's earned it for this program. They'll be added to the leaderboard.
          </p>
        </div>
      </div>

      {/* Featured teammates from the leaderboard */}
      {featured.length > 0 && (
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs font-mobile font-semibold text-stone-500 uppercase tracking-wide mb-2">
            Top nominees this cycle
          </p>
          <ul className="space-y-1">
            {featured.map((person) => (
              <li
                key={person.rank}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="relative shrink-0">
                  <img
                    src={person.avatar}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-stone-100"
                  />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[10px] font-mobile font-semibold text-stone-700 tabular-nums">
                    {person.rank}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mobile font-semibold text-stone-900 truncate">
                    {person.name}
                  </p>
                  <p className="text-xs text-stone-500 truncate">
                    {person.role} ·{" "}
                    <span className="text-stone-700 font-mobile font-semibold">
                      {person.points.toLocaleString()}
                    </span>{" "}
                    pts
                  </p>
                </div>
                <RecognizeDialog
                  kind="rnr"
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-mobile font-semibold transition-colors shrink-0"
                    >
                      <Edit3 className="w-3 h-3" />
                      Nominate
                    </button>
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer — program context + secondary CTA */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-3 border-t border-stone-100 bg-stone-50/50">
        <div className="text-xs text-stone-600 flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-mobile font-semibold text-stone-900">{program.pointsPerWin}</span> pts
          </span>
          <span className="w-1 h-1 rounded-full bg-stone-300 shrink-0" />
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-mobile font-semibold text-stone-900">{program.daysLeft}</span> days left
          </span>
        </div>
        <RecognizeDialog
          kind="rnr"
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-mobile font-semibold text-[#a87a3a] hover:text-[#8e6630] transition-colors shrink-0"
            >
              {featured.length > 0 ? "Nominate someone else" : "Start a nomination"}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        />
      </div>
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

function AboutCard({ program }: { program: Program }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/70 p-5">
      <h2 className="font-mobile font-semibold text-stone-900 mb-3">About this program</h2>
      <p className="text-sm text-stone-600 leading-relaxed">{program.description}</p>
      <div className="mt-5 space-y-4">
        {program.highlights.map((h, i) => {
          const Icon = ICON_MAP[h.iconKey];
          return (
            <div key={i} className="flex items-start gap-3 pb-4 last:pb-0 border-b border-stone-100 last:border-b-0">
              <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                <Icon className="w-5 h-5 text-amber-700" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mobile font-semibold text-stone-900 text-sm">{h.title}</p>
                <p className="text-sm text-stone-600 mt-0.5 leading-relaxed">{h.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LastWinnerCard({ winner }: { winner: NonNullable<Program["lastWinner"]> }) {
  return (
    <div
      className="rounded-2xl border border-amber-100 p-5 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #fdf6e8 0%, #fbecc8 100%)" }}
    >
      <p className="text-xs uppercase tracking-wide font-mobile font-semibold text-amber-700">Last month's winner</p>
      <div className="flex items-center gap-4 mt-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-mobile text-xl font-semibold text-stone-900 leading-tight">{winner.name}</h3>
          <p className="text-sm text-stone-600 mt-0.5">{winner.team}</p>
          <div className="mt-3 inline-flex items-start gap-2 bg-white/70 rounded-xl px-3 py-2 max-w-md">
            <Quote className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-sm text-stone-700 italic leading-snug">{winner.quote}</p>
          </div>
        </div>
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full bg-amber-50 border-4 border-white shadow-sm overflow-hidden">
            <img src={winner.avatar} alt={winner.name} className="w-full h-full object-cover" />
          </div>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">👑</span>
        </div>
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

function formatK(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return n.toString();
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
