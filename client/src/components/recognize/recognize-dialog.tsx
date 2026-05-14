import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Pencil, Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PersonPicker } from "./person-picker";
import { BadgePicker } from "./badge-picker";
import { PointsPicker } from "./points-picker";
import { SentConfirmation } from "./sent-confirmation";
import {
  POINTS_PRESETS,
  saveMyRecognition,
  EMPLOYEES,
  type Employee,
  type RecognizeBadge,
} from "@/lib/recognize-data";
import { getAccount } from "@/lib/account";
import {
  isSendingWindowOpen,
  nextWindowReopenAt,
  resolveApprover,
} from "@/lib/appreciation-policy";
import { saveBadge } from "@/lib/badges";
import { useToast } from "@/hooks/use-toast";

type Kind = "appreciation" | "rnr";
type Step = "person" | "badge" | "reason";

export function RecognizeDialog({
  kind = "appreciation",
  trigger,
}: {
  kind?: Kind;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg p-0 gap-0 h-[640px] max-h-[90vh] overflow-hidden flex flex-col">
        <RecognizeFlow kind={kind} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function RecognizeFlow({ kind, onClose }: { kind: Kind; onClose: () => void }) {
  const verb = kind === "rnr" ? "Recognize" : "Appreciate";
  const verbAction = kind === "rnr" ? "Recognize" : "Appreciate";
  const { toast } = useToast();

  const account = getAccount();
  const policy = account?.appreciationPolicy;
  // Policy enforcement only applies to peer-to-peer appreciations. RnR
  // nominations follow their own panel-review flow (Phase 3).
  const policyApplies = kind === "appreciation" && !!policy;
  const windowOpen = policyApplies ? isSendingWindowOpen(policy!) : true;
  const reopenAt = policyApplies ? nextWindowReopenAt(policy!) : null;
  const approvalRequired = policyApplies && !!policy?.approval.required;
  const monetaryActive = !policyApplies || !!policy?.monetaryEnabled;

  // Identify the current user as an Employee record so we can resolve
  // managers/BU heads/function leads. Falls back to the first seeded
  // employee for demo flows that don't have a real signed-in user yet.
  const currentUser = useMemo<Employee | undefined>(() => {
    if (!account) return undefined;
    const byEmail = EMPLOYEES.find(
      (e) => e.email.toLowerCase() === account.adminEmail.toLowerCase(),
    );
    return byEmail ?? EMPLOYEES[0];
  }, [account]);

  const [step, setStep] = useState<Step>("person");
  const [employee, setEmployee] = useState<Employee | undefined>();
  const [badge, setBadge] = useState<RecognizeBadge | undefined>();
  const [reason, setReason] = useState("");
  const [points, setPoints] = useState(POINTS_PRESETS[1]);
  const [sent, setSent] = useState(false);

  const personDone = !!employee;
  const badgeDone = !!badge;
  const canSend = personDone && badgeDone && windowOpen;

  if (!windowOpen) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="px-6 pt-6 pb-4 border-b border-stone-100">
          <DialogTitle className="font-mobile text-xl font-semibold text-stone-900">
            {verb} a teammate
          </DialogTitle>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12 gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-700" />
          </div>
          <p className="text-base font-mobile font-semibold text-stone-900">Appreciations are paused</p>
          <p className="text-sm text-stone-600 max-w-sm">
            {reopenAt
              ? `Sending reopens on ${reopenAt.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}.`
              : "Check back later — your HR admin will let you know when sending reopens."}
          </p>
        </div>
        <footer className="px-6 py-4 border-t border-stone-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    );
  }

  if (sent && employee && badge) {
    return (
      <div className="flex-1 overflow-hidden">
        <SentConfirmation
          employee={employee}
          badge={badge}
          reason={reason}
          points={kind === "rnr" ? points : undefined}
          onDone={onClose}
        />
      </div>
    );
  }

  return (
    <>
      <header className="px-6 pt-6 pb-4 border-b border-stone-100">
        <DialogTitle className="font-mobile text-xl font-semibold text-stone-900">
          {verb} a teammate
        </DialogTitle>
        <p className="text-xs text-stone-500 mt-0.5">
          {kind === "rnr"
            ? "Send recognition with points to celebrate someone's impact."
            : "Send a kudos to celebrate someone's contribution."}
        </p>
        {approvalRequired && (
          <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-900">
            <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Your appreciation will go to an approver before posting to the feed.</span>
          </div>
        )}
        {policyApplies && !monetaryActive && (
          <p className="mt-2 text-xs text-stone-500">
            Recognition without points — a meaningful thank-you.
          </p>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <Section
          number={1}
          title="Choose a person"
          state={step === "person" ? "active" : personDone ? "done" : "future"}
          summary={employee ? `${employee.name} · ${employee.role}` : undefined}
          onEdit={() => setStep("person")}
          allowEdit={personDone}
        >
          <PersonPicker
            selectedId={employee?.id}
            onSelect={(emp) => {
              setEmployee(emp);
              setStep("badge");
            }}
          />
        </Section>

        <Section
          number={2}
          title="Pick a badge"
          state={
            !personDone
              ? "future"
              : step === "badge"
                ? "active"
                : badgeDone
                  ? "done"
                  : "future"
          }
          summary={badge ? `${badge.emoji}  ${badge.label}` : undefined}
          onEdit={() => personDone && setStep("badge")}
          allowEdit={badgeDone}
          disabled={!personDone}
        >
          <BadgePicker
            selectedId={badge?.id}
            onSelect={(b) => {
              setBadge(b);
              setStep("reason");
            }}
            layout="grid"
          />
        </Section>

        <Section
          number={3}
          title={kind === "rnr" ? "Add a note & points" : "Add a note"}
          state={!badgeDone ? "future" : step === "reason" ? "active" : "future"}
          onEdit={() => badgeDone && setStep("reason")}
          allowEdit={false}
          disabled={!badgeDone}
        >
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason... (optional)"
            disabled={!badgeDone}
            className="w-full min-h-[100px] p-3 rounded-2xl bg-white border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-300 disabled:bg-stone-50"
          />
          {kind === "rnr" && (
            <div className="mt-4">
              <PointsPicker value={points} onChange={setPoints} />
            </div>
          )}
        </Section>
      </div>

      <footer className="px-6 py-4 border-t border-stone-100 bg-white flex items-center justify-between gap-3">
        <button
          onClick={onClose}
          className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSend}
          onClick={() => {
            if (!canSend || !employee || !badge) return;

            const id = Math.random().toString(36).slice(2, 10);
            const createdAt = new Date().toISOString();
            const sender = currentUser;
            const approver = approvalRequired && sender && policy
              ? resolveApprover(sender, policy.approval.approverLevel, account)
              : null;
            const useApproval = approvalRequired && !!approver;
            const status: "pending-approval" | "approved" = useApproval
              ? "pending-approval"
              : "approved";
            const effectivePoints =
              kind === "rnr" ? points : monetaryActive ? 0 : 0;

            // Keep the legacy outgoing list so the existing "my recognitions"
            // surfaces don't go blank. Source of truth for the feed shifts
            // to engagex_badges in Phase 2.1.
            saveMyRecognition({
              id,
              recipientId: employee.id,
              recipientName: employee.name,
              recipientAvatar: employee.avatar,
              badgeId: badge.id,
              badgeLabel: badge.label,
              badgeKind: badge.badgeKind,
              reason: reason.trim(),
              points: kind === "rnr" ? points : undefined,
              kind,
              status: useApproval ? "pending" : "approved",
              createdAt,
            });

            saveBadge({
              id,
              fromUserId: sender?.id ?? "me",
              fromName: sender?.name ?? account?.adminName ?? "You",
              fromAvatar: sender?.avatar ?? account?.adminPhotoUrl ?? "/m/images/user02.png",
              toUserId: employee.id,
              toName: employee.name,
              toAvatar: employee.avatar,
              badgeId: badge.id,
              badgeLabel: badge.label,
              message: reason.trim(),
              points: effectivePoints,
              kind,
              createdAt,
              status,
              pendingApproverId: useApproval ? approver!.id : undefined,
              pendingApproverName: useApproval ? approver!.name : undefined,
            });

            if (useApproval) {
              toast({
                title: "Sent for approval",
                description: `Your appreciation was sent to ${approver!.name} for review. You'll be notified when it's posted.`,
              });
              onClose();
              return;
            }

            setSent(true);
          }}
          className="h-10 px-6 rounded-full bg-[#465853] text-white font-mobile font-semibold text-sm hover:bg-[#3a4944] disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
        >
          {verbAction} {employee ? employee.name.split(" ")[0] : "teammate"}
        </button>
      </footer>
    </>
  );
}

type SectionState = "future" | "active" | "done";

function Section({
  number,
  title,
  state,
  summary,
  onEdit,
  allowEdit,
  disabled,
  children,
}: {
  number: number;
  title: string;
  state: SectionState;
  summary?: string;
  onEdit?: () => void;
  allowEdit?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const [maxHeight, setMaxHeight] = useState<string | undefined>(state === "active" ? "none" : "0px");
  const isOpen = state === "active";

  useEffect(() => {
    setMaxHeight(isOpen ? "none" : "0px");
  }, [isOpen]);

  return (
    <section
      className={cn(
        "border-b border-stone-100 last:border-b-0",
        disabled && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        disabled={state === "active" || !allowEdit || disabled}
        className={cn(
          "w-full flex items-center gap-3 px-6 py-3.5 text-left transition-colors",
          state === "active" ? "bg-amber-50/50" : "bg-white",
          state !== "active" && allowEdit && "hover:bg-stone-50 cursor-pointer",
        )}
      >
        <span
          className={cn(
            "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-mobile font-semibold border",
            state === "done"
              ? "bg-[#a87a3a] text-white border-[#a87a3a]"
              : state === "active"
                ? "bg-white text-[#a87a3a] border-[#a87a3a]"
                : "bg-stone-100 text-stone-400 border-stone-200",
          )}
        >
          {state === "done" ? <Check className="w-4 h-4" /> : number}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-mobile font-semibold",
              state === "future" ? "text-stone-500" : "text-stone-900",
            )}
          >
            {title}
          </p>
          {state === "done" && summary && (
            <p className="text-xs text-stone-600 mt-0.5 truncate">{summary}</p>
          )}
        </div>
        {state === "done" && allowEdit && (
          <span className="shrink-0 text-xs text-stone-500 inline-flex items-center gap-1">
            <Pencil className="w-3 h-3" />
            Edit
          </span>
        )}
        {state === "future" && !disabled && (
          <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
        )}
      </button>

      <div
        className="overflow-hidden transition-[max-height] duration-200 ease-out"
        style={{ maxHeight }}
      >
        <div className="px-6 pb-5 pt-1">{children}</div>
      </div>
    </section>
  );
}
