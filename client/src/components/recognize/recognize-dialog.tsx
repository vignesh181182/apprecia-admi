import { useEffect, useState } from "react";
import { Check, ChevronDown, Pencil } from "lucide-react";
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
  type Employee,
  type RecognizeBadge,
} from "@/lib/recognize-data";

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

  const [step, setStep] = useState<Step>("person");
  const [employee, setEmployee] = useState<Employee | undefined>();
  const [badge, setBadge] = useState<RecognizeBadge | undefined>();
  const [reason, setReason] = useState("");
  const [points, setPoints] = useState(POINTS_PRESETS[1]);
  const [sent, setSent] = useState(false);

  const personDone = !!employee;
  const badgeDone = !!badge;
  const canSend = personDone && badgeDone;

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
