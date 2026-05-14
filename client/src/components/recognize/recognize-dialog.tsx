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
import { getAccount, type RecognitionCategory, type RecognitionCategoryColor } from "@/lib/account";
import {
  isSendingWindowOpen,
  nextWindowReopenAt,
  resolveApprover,
} from "@/lib/appreciation-policy";
import { saveBadge, type BadgeTier } from "@/lib/badges";
import { deductGive, creditReceive, getWallet } from "@/lib/wallet";
import { useToast } from "@/hooks/use-toast";

type Kind = "appreciation" | "rnr";
type Step = "person" | "badge" | "reason";

const CATEGORY_COLOR_CLASSES: Record<RecognitionCategoryColor, { bg: string; bgSelected: string; ring: string; text: string }> = {
  blue:   { bg: "bg-blue-50",   bgSelected: "bg-blue-100",   ring: "ring-blue-300",   text: "text-blue-900" },
  amber:  { bg: "bg-amber-50",  bgSelected: "bg-amber-100",  ring: "ring-amber-300",  text: "text-amber-900" },
  stone:  { bg: "bg-stone-100", bgSelected: "bg-stone-200",  ring: "ring-stone-400",  text: "text-stone-900" },
  purple: { bg: "bg-purple-50", bgSelected: "bg-purple-100", ring: "ring-purple-300", text: "text-purple-900" },
  rose:   { bg: "bg-rose-50",   bgSelected: "bg-rose-100",   ring: "ring-rose-300",   text: "text-rose-900" },
  green:  { bg: "bg-green-50",  bgSelected: "bg-green-100",  ring: "ring-green-300",  text: "text-green-900" },
  sky:    { bg: "bg-sky-50",    bgSelected: "bg-sky-100",    ring: "ring-sky-300",    text: "text-sky-900" },
  teal:   { bg: "bg-teal-50",   bgSelected: "bg-teal-100",   ring: "ring-teal-300",   text: "text-teal-900" },
};

const FALLBACK_CATEGORY: RecognitionCategory = {
  id: "general-appreciation",
  name: "General Appreciation",
  description: "Recognition without a specific value tag.",
  emoji: "🤝",
  color: "stone",
};

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
  const [category, setCategory] = useState<RecognitionCategory | undefined>();
  const [tier, setTier] = useState<BadgeTier>("thanks");
  const [reason, setReason] = useState("");
  const [points, setPoints] = useState(POINTS_PRESETS[1]);
  const [sent, setSent] = useState(false);

  // Available categories with a safety fallback so the picker can never end up empty.
  const availableCategories = useMemo<RecognitionCategory[]>(
    () => (account?.recognitionCategories?.length ? account.recognitionCategories : [FALLBACK_CATEGORY]),
    [account],
  );

  const tierValues = account?.pointsPolicy?.tierValues ?? { thanks: 0, goodJob: 25, exceptional: 100 };
  const wallet = monetaryActive && currentUser
    ? getWallet(currentUser.id, "employee", account)
    : null;

  const personDone = !!employee;
  // For appreciation the second step is the category picker; for rnr it stays
  // the existing badge picker. Keep both states alive so switching kind mid-
  // session (rare) doesn't lose progress.
  const secondStepDone = kind === "appreciation" ? !!category : !!badge;
  const canSend = personDone && secondStepDone && windowOpen;

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

  if (sent && employee) {
    const confirmationBadge: RecognizeBadge | undefined = kind === "rnr"
      ? badge
      : category
        ? {
            id: category.id,
            label: category.name,
            description: category.description,
            emoji: category.emoji,
            badgeKind: "custom-badge-name",
          }
        : undefined;
    const confirmationPoints =
      kind === "rnr"
        ? points
        : monetaryActive && tierValues[tier] > 0
          ? tierValues[tier]
          : undefined;
    if (confirmationBadge) {
      return (
        <div className="flex-1 overflow-hidden">
          <SentConfirmation
            employee={employee}
            badge={confirmationBadge}
            reason={reason}
            points={confirmationPoints}
            onDone={onClose}
          />
        </div>
      );
    }
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
          title={kind === "appreciation" ? "Pick a value" : "Pick a badge"}
          state={
            !personDone
              ? "future"
              : step === "badge"
                ? "active"
                : secondStepDone
                  ? "done"
                  : "future"
          }
          summary={
            kind === "appreciation"
              ? category ? `${category.emoji}  ${category.name}` : undefined
              : badge ? `${badge.emoji}  ${badge.label}` : undefined
          }
          onEdit={() => personDone && setStep("badge")}
          allowEdit={secondStepDone}
          disabled={!personDone}
        >
          {kind === "appreciation" ? (
            <CategoryPicker
              categories={availableCategories}
              selectedId={category?.id}
              onSelect={(c) => {
                setCategory(c);
                setStep("reason");
              }}
            />
          ) : (
            <BadgePicker
              selectedId={badge?.id}
              onSelect={(b) => {
                setBadge(b);
                setStep("reason");
              }}
              layout="grid"
            />
          )}
        </Section>

        <Section
          number={3}
          title={kind === "rnr" ? "Add a note & points" : "Add a note"}
          state={!secondStepDone ? "future" : step === "reason" ? "active" : "future"}
          onEdit={() => secondStepDone && setStep("reason")}
          allowEdit={false}
          disabled={!secondStepDone}
        >
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason... (optional)"
            disabled={!secondStepDone}
            className="w-full min-h-[100px] p-3 rounded-2xl bg-white border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-300 disabled:bg-stone-50"
          />
          {kind === "rnr" && (
            <div className="mt-4">
              <PointsPicker value={points} onChange={setPoints} />
            </div>
          )}
          {kind === "appreciation" && monetaryActive && (
            <div className="mt-4">
              <TierSelector
                value={tier}
                onChange={setTier}
                tierValues={tierValues}
                giveBalance={wallet?.giveBalance ?? 0}
              />
              {wallet && (
                <p className="text-xs text-stone-500 mt-2">
                  {wallet.giveBalance.toLocaleString()} of {wallet.giveAllowance.toLocaleString()} give-points left this month
                </p>
              )}
            </div>
          )}
          {kind === "appreciation" && !monetaryActive && (
            <p className="text-xs text-stone-500 mt-3">
              Recognition without points — a meaningful thank-you.
            </p>
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
            if (!canSend || !employee) return;
            if (kind === "appreciation" && !category) return;
            if (kind === "rnr" && !badge) return;

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
              kind === "rnr"
                ? points
                : monetaryActive
                  ? tierValues[tier]
                  : 0;

            // Keep the legacy outgoing list so the existing "my recognitions"
            // surfaces don't go blank. Source of truth for the feed shifts
            // to engagex_badges in Phase 2.1.
            saveMyRecognition({
              id,
              recipientId: employee.id,
              recipientName: employee.name,
              recipientAvatar: employee.avatar,
              badgeId: kind === "rnr" ? badge!.id : category!.id,
              badgeLabel: kind === "rnr" ? badge!.label : category!.name,
              badgeKind: kind === "rnr" ? badge!.badgeKind : "custom-badge-name",
              reason: reason.trim(),
              points: kind === "rnr" ? points : effectivePoints || undefined,
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
              categoryId: kind === "appreciation" ? category!.id : undefined,
              categoryName: kind === "appreciation" ? category!.name : undefined,
              categoryEmoji: kind === "appreciation" ? category!.emoji : undefined,
              tier: kind === "appreciation" ? tier : undefined,
              badgeId: kind === "rnr" ? badge!.id : undefined,
              badgeLabel: kind === "rnr" ? badge!.label : undefined,
              message: reason.trim(),
              points: effectivePoints,
              kind,
              createdAt,
              status,
              pendingApproverId: useApproval ? approver!.id : undefined,
              pendingApproverName: useApproval ? approver!.name : undefined,
              reactions: {},
              comments: [],
              boosts: [],
            });

            // Immediate wallet movement when no approval is required.
            // approveBadge() handles the deferred case at approval time.
            if (!useApproval && kind === "appreciation" && effectivePoints > 0) {
              deductGive(sender?.id ?? "me", "employee", effectivePoints, account);
              creditReceive(employee.id, effectivePoints, account);
            }

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

function CategoryPicker({
  categories,
  selectedId,
  onSelect,
}: {
  categories: RecognitionCategory[];
  selectedId?: string;
  onSelect: (c: RecognitionCategory) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map((cat) => {
        const isSelected = cat.id === selectedId;
        const cls = CATEGORY_COLOR_CLASSES[cat.color] ?? CATEGORY_COLOR_CLASSES.stone;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat)}
            className={cn(
              "rounded-2xl p-3 border text-left transition-all",
              isSelected
                ? `${cls.bgSelected} ${cls.text} border-transparent ring-2 ${cls.ring}`
                : `${cls.bg} border-stone-200 hover:border-stone-300`,
            )}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0">{cat.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-mobile font-semibold", isSelected ? "" : "text-stone-900")}>
                  {cat.name}
                </p>
                {cat.description && (
                  <p
                    className={cn(
                      "text-[11px] mt-0.5 line-clamp-2",
                      isSelected ? "" : "text-stone-500",
                    )}
                  >
                    {cat.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function TierSelector({
  value,
  onChange,
  tierValues,
  giveBalance,
}: {
  value: BadgeTier;
  onChange: (t: BadgeTier) => void;
  tierValues: { thanks: number; goodJob: number; exceptional: number };
  giveBalance: number;
}) {
  const tiers: { id: BadgeTier; label: string; points: number }[] = [
    { id: "thanks",      label: "Thanks",     points: tierValues.thanks },
    { id: "goodJob",     label: "Good Job",   points: tierValues.goodJob },
    { id: "exceptional", label: "Exceptional", points: tierValues.exceptional },
  ];
  return (
    <div className="flex gap-2">
      {tiers.map((t) => {
        const disabled = t.points > giveBalance;
        const isSelected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(t.id)}
            className={cn(
              "flex-1 h-12 rounded-full text-sm font-mobile font-semibold transition-all border",
              isSelected
                ? "bg-[#465853] text-white border-[#465853]"
                : "bg-white text-stone-700 border-stone-200 hover:border-stone-300",
              disabled && "opacity-40 cursor-not-allowed",
            )}
          >
            <div className="leading-tight">
              <div>{t.label}</div>
              <div className={cn("text-[10px] font-medium", isSelected ? "text-white/80" : "text-stone-500")}>
                {t.points > 0 ? `${t.points} pts` : "free"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
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
