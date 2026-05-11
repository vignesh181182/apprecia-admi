import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, X, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-viewport";
import { EmployeeLayout } from "@/components/employee-layout";
import { PersonPicker } from "@/components/recognize/person-picker";
import { BadgePicker } from "@/components/recognize/badge-picker";
import { ContextCard } from "@/components/recognize/context-card";
import { PointsPicker } from "@/components/recognize/points-picker";
import { SentConfirmation } from "@/components/recognize/sent-confirmation";
import { type Employee, type RecognizeBadge, saveMyRecognition, POINTS_PRESETS } from "@/lib/recognize-data";

type Step = "pick-person" | "pick-badge" | "reason" | "sent";

export default function MobileRecognize() {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileFlow />;
  return <WebSinglePage />;
}

function useRecognizeState() {
  const [searchParams] = useSearchParams();
  const kind: "appreciation" | "rnr" = searchParams.get("tab") === "rnr" ? "rnr" : "appreciation";
  const verb = kind === "rnr" ? "Recognize" : "Appreciate";
  const verbing = kind === "rnr" ? "Recognizing" : "Appreciating";
  const verbAction = kind === "rnr" ? "RECOGNIZE" : "APPRECIATE";

  const [employee, setEmployee] = useState<Employee | undefined>();
  const [badge, setBadge] = useState<RecognizeBadge | undefined>();
  const [reason, setReason] = useState("");
  const [points, setPoints] = useState(POINTS_PRESETS[1]);

  function commit(): void {
    if (!employee || !badge) return;
    saveMyRecognition({
      id: Math.random().toString(36).slice(2, 10),
      recipientId: employee.id,
      recipientName: employee.name,
      recipientAvatar: employee.avatar,
      badgeId: badge.id,
      badgeLabel: badge.label,
      badgeKind: badge.badgeKind,
      reason: reason.trim(),
      points: kind === "rnr" ? points : undefined,
      kind,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  }

  return { kind, verb, verbing, verbAction, employee, setEmployee, badge, setBadge, reason, setReason, points, setPoints, commit };
}

function MobileFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("pick-person");
  const s = useRecognizeState();

  function close() {
    navigate(-1);
  }

  if (step === "sent" && s.employee && s.badge) {
    return (
      <EmployeeLayout hideTopBar hideBottomNav showRightRail={false}>
        <SentConfirmation
          employee={s.employee}
          badge={s.badge}
          reason={s.reason}
          points={s.kind === "rnr" ? s.points : undefined}
          onDone={() => navigate("/m" + (s.kind === "rnr" ? "?tab=rnr" : ""))}
        />
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout hideTopBar hideBottomNav showRightRail={false}>
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <header className="px-5 pt-3 pb-2 flex items-center gap-3">
          {step === "pick-person" ? (
            <button onClick={close} aria-label="Close" className="-ml-2 p-2 rounded-full hover:bg-stone-200">
              <X className="w-5 h-5 text-stone-700" />
            </button>
          ) : (
            <button onClick={() => setStep(step === "pick-badge" ? "pick-person" : "pick-badge")} aria-label="Back" className="-ml-2 p-2 rounded-full hover:bg-stone-200">
              <ArrowLeft className="w-5 h-5 text-stone-700" />
            </button>
          )}
          {step === "pick-person" && (
            <h1 className="font-mobile font-semibold text-stone-900 text-xl">{s.verb}</h1>
          )}
          {step !== "pick-person" && s.employee && (
            <div className="flex-1 min-w-0">
              <ContextCard employee={s.employee} badge={step === "reason" ? s.badge : undefined} verb={s.verbing} />
            </div>
          )}
        </header>

        {step === "pick-person" && (
          <div className="flex-1 px-5 pb-6 space-y-3">
            <p className="text-sm text-stone-600">Choose a person to {s.verb.toLowerCase()}</p>
            <PersonPicker
              selectedId={s.employee?.id}
              onSelect={(emp) => {
                s.setEmployee(emp);
                setStep("pick-badge");
              }}
            />
          </div>
        )}

        {step === "pick-badge" && (
          <div className="flex-1 px-5 pb-6">
            <div className="flex items-center justify-between mb-3 mt-2">
              <h2 className="font-mobile font-semibold text-stone-900">Select a badge</h2>
              <button className="p-1 text-stone-500" aria-label="Search badges">
                <Search className="w-4 h-4" />
              </button>
            </div>
            <BadgePicker
              selectedId={s.badge?.id}
              onSelect={(b) => {
                s.setBadge(b);
                setStep("reason");
              }}
            />
          </div>
        )}

        {step === "reason" && (
          <div className="flex-1 flex flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
            <div className="mt-2">
              <p className="text-sm font-mobile font-semibold text-stone-900 mb-2">
                Reason <span className="text-stone-400 font-normal">(Optional)</span>
              </p>
              <textarea
                value={s.reason}
                onChange={(e) => s.setReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full min-h-[120px] p-4 rounded-2xl bg-white border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-300"
              />
            </div>

            {s.kind === "rnr" && (
              <div className="mt-5">
                <PointsPicker value={s.points} onChange={s.setPoints} />
              </div>
            )}

            <div className="flex-1" />
            <button
              type="button"
              onClick={() => {
                s.commit();
                setStep("sent");
              }}
              className="w-full h-13 py-4 rounded-full bg-[#465853] text-white font-mobile font-semibold tracking-wide hover:bg-[#3a4944] transition-colors mt-4"
            >
              {s.verbAction}
            </button>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}

function WebSinglePage() {
  const navigate = useNavigate();
  const s = useRecognizeState();
  const [sent, setSent] = useState(false);

  const canSend = s.employee && s.badge;

  if (sent && s.employee && s.badge) {
    return (
      <EmployeeLayout showRightRail={false}>
        <div className="md:max-w-2xl mx-auto bg-white rounded-3xl border border-stone-200 overflow-hidden">
          <SentConfirmation
            employee={s.employee}
            badge={s.badge}
            reason={s.reason}
            points={s.kind === "rnr" ? s.points : undefined}
            onDone={() => navigate("/m" + (s.kind === "rnr" ? "?tab=rnr" : ""))}
          />
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout
      title={`${s.verb} a teammate`}
      rightRail={<PreviewRail employee={s.employee} badge={s.badge} reason={s.reason} points={s.kind === "rnr" ? s.points : undefined} />}
    >
      <div className="space-y-6 pb-12">
        <Section title="1 · Choose a person" subtitle={`Pick the teammate you want to ${s.verb.toLowerCase()}.`}>
          <PersonPicker
            selectedId={s.employee?.id}
            onSelect={(emp) => s.setEmployee(emp)}
          />
        </Section>

        <Section title="2 · Pick a badge" subtitle="Match the recognition to what they did.">
          <BadgePicker
            selectedId={s.badge?.id}
            onSelect={(b) => s.setBadge(b)}
            layout="grid"
          />
        </Section>

        <Section title="3 · Add a note" subtitle="Tell them why this badge is for them.">
          <textarea
            value={s.reason}
            onChange={(e) => s.setReason(e.target.value)}
            placeholder="Enter reason... (optional)"
            className="w-full min-h-[100px] p-4 rounded-2xl bg-white border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-300"
          />
          {s.kind === "rnr" && (
            <div className="mt-4">
              <PointsPicker value={s.points} onChange={s.setPoints} />
            </div>
          )}
        </Section>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!canSend}
            onClick={() => {
              s.commit();
              setSent(true);
            }}
            className="h-12 px-8 rounded-full bg-[#465853] text-white font-mobile font-semibold text-sm hover:bg-[#3a4944] disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
          >
            {s.verbAction.charAt(0) + s.verbAction.slice(1).toLowerCase()} {s.employee ? s.employee.name.split(" ")[0] : "teammate"}
          </button>
        </div>
      </div>
    </EmployeeLayout>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-stone-200 p-5">
      <header className="mb-3">
        <h2 className="font-mobile font-semibold text-stone-900">{title}</h2>
        {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

function PreviewRail({
  employee,
  badge,
  reason,
  points,
}: {
  employee?: Employee;
  badge?: RecognizeBadge;
  reason: string;
  points?: number;
}) {
  return (
    <aside className="sticky top-[80px] py-2 space-y-4">
      <div className="bg-white rounded-2xl border border-stone-200 p-4">
        <p className="text-xs text-stone-500 uppercase tracking-wide font-mobile font-semibold mb-3">Preview</p>
        {!employee && !badge ? (
          <div className="py-6 text-center">
            <p className="text-sm text-stone-500">Choose a person and badge to see the preview here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {employee && (
              <div className="flex items-center gap-2.5">
                <img src={employee.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-mobile font-semibold text-stone-900 truncate">
                    To: {employee.name}
                  </p>
                  <p className="text-xs text-stone-500 truncate">{employee.role}</p>
                </div>
              </div>
            )}
            {badge && (
              <div className="rounded-xl bg-stone-50 border border-stone-100 p-3 flex items-center gap-3">
                <span className="text-2xl">{badge.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-mobile font-semibold text-amber-800 truncate">{badge.label}</p>
                  <p className="text-xs text-stone-500 truncate">{badge.description}</p>
                </div>
              </div>
            )}
            {points != null && (
              <p className="text-sm font-mobile font-semibold text-amber-800 inline-flex items-center gap-1">
                + {points.toLocaleString()} points
              </p>
            )}
            {reason && (
              <p className="text-sm text-stone-600 leading-snug border-t border-stone-100 pt-3">
                "{reason}"
              </p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
