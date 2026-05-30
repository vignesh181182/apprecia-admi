import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { RichTextarea } from "@/components/ui/rich-textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  Trash2,
  Plus,
  Search,
  Crown,
  AlertCircle,
  Check,
  ArrowLeft,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { BannerArt } from "@/components/programs/banner-art";
import { getAccount } from "@/lib/account";
import { EMPLOYEES, type Employee } from "@/lib/recognize-data";
import {
  generateProgramId,
  getProgramById,
  saveProgram,
  type CategoryCriterion,
  type CategoryEligibility,
  type CategoryGuidelines,
  type PanelMember,
  type Program,
  type ProgramBudgetPeriod,
  type ProgramCadence,
  type ProgramCategory,
  type ProgramNotifications,
  type ProgramStatus,
  type StoredProgram,
} from "@/lib/programs-data";
import {
  BANNER_PRESETS,
  CATEGORY_PRESETS,
  ICON_PRESETS,
  PROGRAM_LOCATIONS,
  bannerById,
} from "@/lib/program-presets";
import { listDepartments } from "@/lib/dashboard-stats";
import { useToast } from "@/hooks/use-toast";

// ─── Form state ────────────────────────────────────────────────────────

type FormState = {
  id: string;
  isNew: boolean;
  status: ProgramStatus;
  name: string;
  description: string;
  bannerId: string;
  customBannerDataUrl?: string;
  iconEmoji: string;
  cadence: ProgramCadence;
  startDate: string;
  endDate: string;
  repeatAutomatically: boolean;
  /** Phase 1.8 — each category owns its own guidelines, eligibility, and panel. */
  categories: ProgramCategory[];
  budgetAllocated: number;
  budgetPeriod: ProgramBudgetPeriod;
  notifications: ProgramNotifications;
  createdAt?: string;
  updatedAt?: string;
};

const DEFAULT_NOTIFICATIONS: ProgramNotifications = {
  notifyNominees: true,
  notifyAllOnLaunch: true,
  announceWinnersToSlack: false,
};

const DEFAULT_ELIGIBILITY: CategoryEligibility = {
  departments: [],
  locations: [],
  roles: [],
  minTenureMonths: 0,
  excludePastWinnersCycles: 0,
};

function defaultEndDateFor(cadence: ProgramCadence, start: string): string {
  if (!start) return "";
  const startDate = new Date(start);
  const end = new Date(startDate);
  if (cadence === "monthly") end.setDate(end.getDate() + 30);
  else if (cadence === "quarterly") end.setMonth(end.getMonth() + 3);
  else if (cadence === "yearly") end.setFullYear(end.getFullYear() + 1);
  else end.setDate(end.getDate() + 14); // one-off default
  return end.toISOString().slice(0, 10);
}

function newCriterion(): CategoryCriterion {
  return {
    id: "crit-" + Math.random().toString(36).slice(2, 8),
    label: "",
    description: "",
    weight: 0,
  };
}

function defaultGuidelines(): CategoryGuidelines {
  return {
    summary: "",
    whatGoodLooksLike: "",
    criteria: [
      {
        id: "crit-overall",
        label: "Overall impact",
        description: "How meaningful and clear is the contribution being recognized?",
        weight: 100,
      },
    ],
  };
}

function newCategoryRow(): ProgramCategory {
  return {
    id: "cat-" + Math.random().toString(36).slice(2, 8),
    name: "",
    emoji: "🏆",
    description: "",
    winnersCount: 1,
    prizePoints: 1000,
    // budgetAllocated is derived from winnersCount × prizePoints × pointRate
    // at save time — no need to seed a separate value.
    guidelines: defaultGuidelines(),
    eligibility: { ...DEFAULT_ELIGIBILITY },
    panel: [],
  };
}

function makeBlankForm(): FormState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: generateProgramId(),
    isNew: true,
    status: "draft",
    name: "",
    description: "",
    bannerId: BANNER_PRESETS[0].id,
    iconEmoji: ICON_PRESETS[0],
    cadence: "monthly",
    startDate: today,
    endDate: defaultEndDateFor("monthly", today),
    repeatAutomatically: true,
    categories: [
      {
        ...newCategoryRow(),
        name: "Top Performer",
        description: "Standout contributor for this cycle.",
      },
    ],
    budgetAllocated: 10000,
    budgetPeriod: "current-cycle",
    notifications: { ...DEFAULT_NOTIFICATIONS },
  };
}

function ensureCategoryDefaults(c: ProgramCategory): ProgramCategory {
  return {
    ...c,
    guidelines: c.guidelines ?? defaultGuidelines(),
    eligibility: c.eligibility ?? { ...DEFAULT_ELIGIBILITY },
    panel: c.panel ?? [],
  };
}

function fromExisting(program: StoredProgram): FormState {
  const isoFromDaysLeft = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const today = new Date().toISOString().slice(0, 10);
  const startGuess = program.startDate ?? today;
  const endGuess =
    program.endDate ??
    (program.daysLeft > 0
      ? isoFromDaysLeft(program.daysLeft)
      : defaultEndDateFor(program.cadence ?? "monthly", startGuess));

  // Phase 1.8: programs coming in are normalized, but defend against any
  // category missing guidelines/eligibility/panel (e.g. brand-new draft).
  const categories =
    program.categories && program.categories.length > 0
      ? program.categories.map(ensureCategoryDefaults)
      : [
          ensureCategoryDefaults({
            ...newCategoryRow(),
            name: "Winner",
            description: program.shortDesc ?? "",
            winnersCount: 1,
            prizePoints: program.pointsPerWin ?? 1000,
          }),
        ];

  return {
    id: program.id,
    isNew: false,
    status: program.status,
    name: program.name,
    description: program.description ?? program.shortDesc ?? "",
    bannerId: program.bannerId ?? BANNER_PRESETS[0].id,
    customBannerDataUrl: program.customBannerDataUrl,
    iconEmoji: program.iconEmoji ?? program.emoji ?? "🏆",
    cadence: program.cadence ?? "monthly",
    startDate: startGuess,
    endDate: endGuess,
    repeatAutomatically: program.repeatAutomatically ?? true,
    categories,
    budgetAllocated: program.budgetAllocated,
    budgetPeriod: program.budgetPeriod ?? "current-cycle",
    notifications: program.notifications ?? { ...DEFAULT_NOTIFICATIONS },
    createdAt: program.createdAt,
    updatedAt: program.updatedAt,
  };
}

// ─── Validation ────────────────────────────────────────────────────────

type ValidationErrors = {
  name?: string;
  categories?: string;
  panel?: string;
  endDate?: string;
};

function validatePublish(form: FormState): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!form.name.trim()) errors.name = "Program name is required.";
  if (form.categories.length === 0) {
    errors.categories = "Add at least one category.";
  } else {
    // Phase 1.8 — each category must be self-sufficient.
    for (const c of form.categories) {
      if (!c.name.trim()) {
        errors.categories = "Every category needs a name.";
        break;
      }
      const panel = c.panel ?? [];
      if (panel.length === 0) {
        errors.categories = `Add a panel to "${c.name}".`;
        break;
      }
      const leads = panel.filter((p) => p.lead).length;
      if (leads !== 1) {
        errors.categories = `Mark exactly one panel lead for "${c.name}".`;
        break;
      }
      const criteria = c.guidelines?.criteria ?? [];
      if (criteria.length === 0 || criteria.some((cr) => !cr.label.trim())) {
        errors.categories = `Add at least one named criterion to "${c.name}".`;
        break;
      }
      if (c.winnersCount < 1) {
        errors.categories = `"${c.name}" needs at least 1 winner.`;
        break;
      }
    }
  }
  if (form.endDate && form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
    errors.endDate = "End date must be on or after the start date.";
  }
  return errors;
}

function validateDraft(form: FormState): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!form.name.trim()) errors.name = "Program name is required.";
  return errors;
}

// ─── Wizard config ─────────────────────────────────────────────────────

const WIZARD_STEPS: { id: string; label: string; hint: string }[] = [
  { id: "basics",        label: "Basics",                hint: "Name, banner, icon" },
  { id: "cycle",         label: "Cycle",                 hint: "Cadence and dates" },
  { id: "categories",    label: "Categories",            hint: "Awards, panels & rubric" },
  { id: "notifications", label: "Notification settings", hint: "Who gets notified & when" },
  { id: "publish",       label: "Summary",               hint: "Review & publish" },
];

// ─── Page ──────────────────────────────────────────────────────────────

export default function ProgramEdit() {
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();
  const account = getAccount();
  const monetaryEnabled = !!account?.appreciationPolicy?.monetaryEnabled;
  const currency = account?.currency ?? "₹";
  // 1 point = `pointRate` currency units. Reads the conversion configured in
  // Appreciation Policy (e.g. 100 pts = ₹50 → 0.5). Falls back to 1:1.
  const pv = account?.appreciationPolicy?.pointValue;
  const pointRate = pv && pv.points > 0 ? pv.amount / pv.points : 1;
  const slackConnected = account?.integrations.slack === "connected";
  const { toast } = useToast();

  const initialState = useMemo<FormState>(() => {
    if (!programId) return makeBlankForm();
    const existing = getProgramById(programId);
    return existing ? fromExisting(existing) : makeBlankForm();
  }, [programId]);

  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>(initialState.updatedAt);
  const [step, setStep] = useState(0);
  const [farthestStep, setFarthestStep] = useState(0);

  function patch(p: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...p }));
    setDirty(true);
  }

  function persist(status: ProgramStatus): StoredProgram | null {
    const errs = status === "draft" ? validateDraft(form) : validatePublish(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return null;
    }
    setErrors({});
    const now = new Date().toISOString();
    const banner = bannerById(form.bannerId);
    const totalWinners = form.categories.reduce((s, c) => s + c.winnersCount, 0);
    // Phase 1.10 starter — spend is derived from each category's points and the
    // appreciation-policy point value. Persist per-category and program totals
    // so dashboards/rollups don't need to recompute the conversion.
    const normalizedCategories = form.categories.map((c) => ({
      ...c,
      budgetAllocated: categoryMoneyTotal(c, pointRate),
    }));
    const rolledBudget = normalizedCategories.reduce(
      (s, c) => s + (c.budgetAllocated ?? 0),
      0,
    );
    const pointsPerWin = totalWinners === 0 ? 0 : Math.floor(rolledBudget / totalWinners);

    const next: StoredProgram = {
      id: form.id,
      name: form.name.trim(),
      shortDesc: form.description.slice(0, 140),
      description: form.description,
      emoji: form.iconEmoji,
      iconEmoji: form.iconEmoji,
      themeBg: banner?.background ?? BANNER_PRESETS[0].background,
      bannerId: form.bannerId,
      customBannerDataUrl: form.customBannerDataUrl,
      status,
      pointsPerWin,
      daysLeft: form.endDate
        ? Math.max(
            0,
            Math.ceil(
              (new Date(form.endDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 0,
      nominations: 0,
      budgetAllocated: rolledBudget,
      budgetUsed: 0,
      highlights: [],
      cadence: form.cadence,
      startDate: form.startDate,
      endDate: form.endDate,
      repeatAutomatically: form.repeatAutomatically,
      categories: normalizedCategories,
      budgetPeriod: form.budgetPeriod,
      notifications: form.notifications,
      createdAt: form.createdAt ?? now,
      updatedAt: now,
      publishedAt: status === "active" || status === "scheduled" ? now : undefined,
    };
    saveProgram(next);
    setLastSavedAt(now);
    setDirty(false);
    return next;
  }

  function handleSaveDraft() {
    const saved = persist("draft");
    if (saved) {
      toast({ title: "Draft saved", description: "You can keep editing or publish later." });
      // Stay on the page; URL transitions from /new → /:id/edit if needed.
      if (!programId) navigate(`/programs/${saved.id}/edit`, { replace: true });
    }
  }

  function handlePublish() {
    const errs = validatePublish(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setConfirmPublish(true);
  }

  function confirmAndPublish() {
    const future = form.startDate ? new Date(form.startDate) > new Date() : false;
    const status: ProgramStatus = future ? "scheduled" : "active";
    const saved = persist(status);
    setConfirmPublish(false);
    if (saved) {
      toast({
        title: status === "scheduled" ? "Program scheduled" : "Program published",
        description:
          status === "scheduled"
            ? `Will go live on ${new Date(form.startDate).toLocaleDateString()}.`
            : "Live now — employees can start nominating.",
      });
      navigate("/programs");
    }
  }

  function handleCancel() {
    if (dirty) setConfirmCancel(true);
    else navigate("/programs");
  }

  // Browser-level guard against tab close with unsaved changes.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const totalWinnersAcrossCategories = form.categories.reduce(
    (s, c) => s + c.winnersCount,
    0,
  );
  // Phase 1.10 starter — spend is derived from each category's winners × prizePoints × rate.
  const totalBudgetRollup = form.categories.reduce(
    (s, c) => s + categoryMoneyTotal(c, pointRate),
    0,
  );
  const perWinnerPreview =
    totalWinnersAcrossCategories === 0
      ? 0
      : Math.floor(totalBudgetRollup / totalWinnersAcrossCategories);

  const stepGate = (target: number): ValidationErrors => {
    const errs: ValidationErrors = {};
    if (target > 0 && !form.name.trim()) errs.name = "Program name is required.";
    if (target > 1 && form.endDate && form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
      errs.endDate = "End date must be on or after the start date.";
    }
    if (
      target > 2 &&
      (form.categories.length === 0 || form.categories.some((c) => !c.name.trim()))
    ) {
      errs.categories = "Each category needs a name.";
    }
    return errs;
  };

  function goToStep(target: number) {
    if (target === step) return;
    // Always allow moving backward; gate forward jumps lightly.
    if (target < step) {
      setStep(target);
      return;
    }
    const errs = stepGate(target);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(target);
    setFarthestStep((f) => Math.max(f, target));
  }

  function nextStep() {
    goToStep(Math.min(WIZARD_STEPS.length - 1, step + 1));
  }
  function prevStep() {
    setStep((s) => Math.max(0, s - 1));
    setErrors({});
  }

  const isLastStep = step === WIZARD_STEPS.length - 1;

  return (
    <div className="relative">
      <div className="px-4 lg:px-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {/* Sticky top — header + stepper. -top-4/-top-6 absorbs <main>'s padding so
              the bar reaches the viewport top with no peek-through. */}
          <div className="sticky -top-4 lg:-top-6 z-20 bg-white pt-4 lg:pt-6 pb-4 space-y-4 -mx-4 lg:-mx-6 px-4 lg:px-6 border-b border-stone-200">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-stone-900">
                    {form.isNew ? "New program" : "Edit program"}
                  </h1>
                  <p className="text-sm text-stone-500 mt-0.5">
                    Step {step + 1} of {WIZARD_STEPS.length} · {WIZARD_STEPS[step].label} —{" "}
                    <span className="text-stone-400">{WIZARD_STEPS[step].hint}</span>
                  </p>
                </div>
                <Badge
                  className={
                    form.status === "active"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : form.status === "scheduled"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : form.status === "ended"
                          ? "bg-stone-100 text-stone-700 hover:bg-stone-100"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                  }
                >
                  {form.status}
                </Badge>
              </div>

              {/* Stepper */}
              <Stepper
                currentStep={step}
                farthestStep={farthestStep}
                onJump={goToStep}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="space-y-6 pt-6">
          {/* Step content */}
          {step === 0 && <BasicsSection form={form} patch={patch} errors={errors} />}

          {step === 1 && <CycleSection form={form} patch={patch} errors={errors} />}

          {step === 2 && (
            <>
              <CategoriesSection
                form={form}
                patch={patch}
                errors={errors}
                monetaryEnabled={monetaryEnabled}
                currency={currency}
                pointRate={pointRate}
              />
              <BudgetSection
                form={form}
                patch={patch}
                currency={currency}
                perWinnerPreview={perWinnerPreview}
              />
            </>
          )}

          {step === 3 && (
            <NotificationsSection
              form={form}
              patch={patch}
              slackConnected={slackConnected}
            />
          )}

          {step === 4 && (
            <ReviewCard
              form={form}
              currency={currency}
              perWinnerPreview={perWinnerPreview}
              onJump={goToStep}
            />
          )}
          </div>
        </div>
      </div>

      {/* Sticky footer — stays inside the program card, pinned to viewport bottom.
          -bottom-6 (-24px) compensates for <main>'s p-6 so the footer reaches viewport edge.
          max-w-4xl mx-auto aligns the footer with the centered page content. */}
      <div className="sticky -bottom-6 z-30 max-w-4xl mx-auto border-t border-stone-200 bg-white p-3 flex items-center gap-3">
        <p className="text-xs text-stone-500 ml-2">
          {lastSavedAt
            ? `Last saved ${timeAgoShort(lastSavedAt)}`
            : dirty
              ? "Unsaved changes"
              : "No changes yet"}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            data-testid="program-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            data-testid="program-save-draft"
          >
            Save as draft
          </Button>
          {step > 0 && (
            <Button variant="outline" size="sm" onClick={prevStep}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          )}
          {isLastStep ? (
            <Button
              size="sm"
              onClick={handlePublish}
              data-testid="program-publish"
              className="bg-stone-900 hover:bg-stone-700 text-white"
            >
              Publish
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={nextStep}
              data-testid="program-next"
              className="bg-stone-900 hover:bg-stone-700 text-white"
            >
              Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {form.startDate && new Date(form.startDate) > new Date()
                ? "Schedule this program?"
                : "Publish this program?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {form.startDate && new Date(form.startDate) > new Date()
                ? `It will go live on ${new Date(form.startDate).toLocaleDateString()}. Employees won't see it until then.`
                : "Employees will be able to nominate immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAndPublish}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved edits. Leaving will lose them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/programs")}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Sections ──────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
  rightSlot,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <Card className="border border-stone-200">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
            {description && (
              <p className="text-xs text-stone-500 mt-0.5">{description}</p>
            )}
          </div>
          {rightSlot}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {message}
    </p>
  );
}

// Basics
function BasicsSection({
  form,
  patch,
  errors,
}: {
  form: FormState;
  patch: (p: Partial<FormState>) => void;
  errors: ValidationErrors;
}) {
  function onUploadBanner(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024) {
      alert("Custom banner must be under 50KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      patch({ customBannerDataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  return (
    <SectionCard
      title="Basics"
      description="Show employees what this program is about at a glance."
    >
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">
          Program name <span className="text-red-500">*</span>
        </Label>
        <Input
          value={form.name}
          onChange={(e) => patch({ name: e.target.value.slice(0, 80) })}
          placeholder="e.g. Innovation Award"
          maxLength={80}
          className="h-9 text-sm"
          data-testid="program-name"
        />
        <p className="text-xs text-stone-400">{form.name.length}/80</p>
        <FieldError message={errors.name} />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => patch({ description: e.target.value.slice(0, 500) })}
          placeholder="What problem does this program solve? Who is it for?"
          maxLength={500}
          rows={3}
          className="text-sm resize-none"
          data-testid="program-description"
        />
        <p className="text-xs text-stone-400">{form.description.length}/500</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-stone-700">Banner</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {BANNER_PRESETS.map((b) => {
            const selected = form.bannerId === b.id && !form.customBannerDataUrl;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => patch({ bannerId: b.id, customBannerDataUrl: undefined })}
                className={`aspect-video rounded-lg border-2 transition relative overflow-hidden ${
                  selected ? "border-stone-900 ring-2 ring-stone-900/20" : "border-stone-200 hover:border-stone-400"
                }`}
                title={b.label}
              >
                <BannerArt bannerId={b.id} className="absolute inset-0" />
                {selected && (
                  <Check className="w-4 h-4 text-white absolute top-1 right-1 drop-shadow z-10" />
                )}
                <span className="absolute bottom-1 left-1.5 text-[10px] font-medium text-white/90 drop-shadow z-10">
                  {b.label}
                </span>
              </button>
            );
          })}
          <label
            className={`aspect-video rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition relative overflow-hidden ${
              form.customBannerDataUrl
                ? "border-stone-900 ring-2 ring-stone-900/20"
                : "border-dashed border-stone-300 hover:border-stone-500 text-stone-500"
            }`}
          >
            {form.customBannerDataUrl ? (
              <>
                <BannerArt customDataUrl={form.customBannerDataUrl} className="absolute inset-0" />
                <Check className="w-4 h-4 text-white drop-shadow relative z-10" />
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span className="text-xs">Upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onUploadBanner}
            />
          </label>
        </div>
        <p className="text-xs text-stone-400">Custom upload max 50KB (data URL).</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-stone-700">Icon</Label>
        <div className="flex flex-wrap gap-1.5">
          {ICON_PRESETS.map((emoji) => {
            const selected = form.iconEmoji === emoji;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => patch({ iconEmoji: emoji })}
                className={`w-9 h-9 rounded-md border text-lg leading-none transition ${
                  selected
                    ? "border-stone-900 bg-stone-50 ring-1 ring-stone-900/20"
                    : "border-stone-200 hover:border-stone-400"
                }`}
              >
                {emoji}
              </button>
            );
          })}
          <Input
            value={form.iconEmoji}
            onChange={(e) => patch({ iconEmoji: e.target.value.slice(0, 4) })}
            placeholder="Custom"
            maxLength={4}
            className="w-20 h-9 text-sm text-center"
            data-testid="program-icon-custom"
          />
        </div>
      </div>
    </SectionCard>
  );
}

// Cycle
function CycleSection({
  form,
  patch,
  errors,
}: {
  form: FormState;
  patch: (p: Partial<FormState>) => void;
  errors: ValidationErrors;
}) {
  function onCadence(c: ProgramCadence) {
    patch({ cadence: c, endDate: defaultEndDateFor(c, form.startDate) });
  }
  function onStart(d: string) {
    patch({ startDate: d, endDate: form.endDate || defaultEndDateFor(form.cadence, d) });
  }

  const cyclesPerYear =
    form.cadence === "monthly"
      ? 12
      : form.cadence === "quarterly"
        ? 4
        : form.cadence === "yearly"
          ? 1
          : 1;

  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <SectionCard
      title="Cycle"
      description="When the program opens, closes, and whether it auto-repeats."
    >
      <div className="space-y-2">
        <Label className="text-xs font-medium text-stone-700">Cadence</Label>
        <div className="flex flex-wrap gap-2">
          {(["monthly", "quarterly", "yearly", "one-off"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCadence(c)}
              className={`px-3 py-1.5 rounded-md border text-sm transition capitalize ${
                form.cadence === c
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
              }`}
            >
              {c.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">
            Start date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => onStart(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">
            End date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => patch({ endDate: e.target.value })}
            className="h-9 text-sm"
          />
          <FieldError message={errors.endDate} />
        </div>
      </div>

      {form.cadence !== "one-off" && (
        <label className="flex items-center justify-between p-3 rounded-md border border-stone-200">
          <div>
            <p className="text-sm font-medium text-stone-900">Repeat automatically</p>
            <p className="text-xs text-stone-500">Spin up the next cycle when this one ends.</p>
          </div>
          <Switch
            checked={form.repeatAutomatically}
            onCheckedChange={(v) => patch({ repeatAutomatically: v })}
          />
        </label>
      )}

      <p className="text-xs text-stone-500 italic">
        Runs from {fmt(form.startDate)} to {fmt(form.endDate)} —{" "}
        {form.cadence === "one-off" ? "one-off" : `${cyclesPerYear} cycles per year`}
      </p>
    </SectionCard>
  );
}

// Categories
type CategorySheetState =
  | null
  | { mode: "new"; draft: ProgramCategory }
  | { mode: "edit"; draft: ProgramCategory; index: number };

// ─── Derived totals (points & money) ──────────────────────────────────
//
// Each category's spend is `winnersCount × prizePoints` in points. Multiply
// by `pointRate` (configured under Appreciation Policy → pointValue) to get
// the monetary value. The program's budget is the sum across categories.

function categoryPointsTotal(c: ProgramCategory): number {
  return c.winnersCount * c.prizePoints;
}

function categoryMoneyTotal(c: ProgramCategory, rate: number): number {
  return Math.round(categoryPointsTotal(c) * rate);
}

function CategoriesSection({
  form,
  patch,
  errors,
  monetaryEnabled,
  currency,
  pointRate,
}: {
  form: FormState;
  patch: (p: Partial<FormState>) => void;
  errors: ValidationErrors;
  monetaryEnabled: boolean;
  currency: string;
  pointRate: number;
}) {
  const [sheet, setSheet] = useState<CategorySheetState>(null);

  const totalPoints = form.categories.reduce(
    (s, c) => s + categoryPointsTotal(c),
    0,
  );
  const totalMoney = form.categories.reduce(
    (s, c) => s + categoryMoneyTotal(c, pointRate),
    0,
  );
  const totalWinners = form.categories.reduce((s, c) => s + c.winnersCount, 0);

  function remove(idx: number) {
    if (form.categories.length <= 1) return;
    patch({ categories: form.categories.filter((_, i) => i !== idx) });
  }
  function openAdd() {
    if (form.categories.length >= 8) return;
    setSheet({ mode: "new", draft: ensureCategoryDefaults(newCategoryRow()) });
  }
  function openEdit(idx: number) {
    setSheet({
      mode: "edit",
      index: idx,
      draft: ensureCategoryDefaults({ ...form.categories[idx] }),
    });
  }
  function addPreset(presetId: string) {
    if (form.categories.length >= 8) return;
    const preset = CATEGORY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    patch({
      categories: [
        ...form.categories,
        ensureCategoryDefaults({
          id: "cat-" + Math.random().toString(36).slice(2, 8),
          name: preset.name,
          emoji: preset.emoji,
          description: preset.description,
          winnersCount: preset.winnersCount,
          prizePoints: monetaryEnabled ? preset.prizePoints : 0,
        }),
      ],
    });
  }
  function saveSheet(next: ProgramCategory) {
    if (!sheet) return;
    if (sheet.mode === "new") {
      patch({ categories: [...form.categories, next] });
    } else {
      patch({
        categories: form.categories.map((c, i) => (i === sheet.index ? next : c)),
      });
    }
    setSheet(null);
  }

  return (
    <>
      <SectionCard
        title="Award categories"
        description="Each category owns its own rubric, eligibility, panel of judges, and budget. Min 1, max 8."
        rightSlot={
          <div className="flex items-center gap-3">
            {monetaryEnabled && (
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wide text-stone-500">
                  Total spend
                </p>
                <p className="text-sm font-semibold text-stone-900 tabular-nums leading-tight">
                  {totalPoints.toLocaleString()} pts
                </p>
                <p className="text-xs text-stone-600 tabular-nums leading-tight">
                  ≈ {currency}
                  {totalMoney.toLocaleString()}
                </p>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openAdd}
              disabled={form.categories.length >= 8}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add category
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => addPreset(p.id)}
              disabled={form.categories.length >= 8}
              className="text-xs px-2 py-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-50"
            >
              {p.emoji} {p.name}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {form.categories.map((cat, i) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              currency={currency}
              monetaryEnabled={monetaryEnabled}
              pointRate={pointRate}
              canRemove={form.categories.length > 1}
              onEdit={() => openEdit(i)}
              onRemove={() => remove(i)}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
          <span>
            {form.categories.length} categor{form.categories.length === 1 ? "y" : "ies"} ·{" "}
            {totalWinners} winner{totalWinners === 1 ? "" : "s"} total
          </span>
          {monetaryEnabled && (
            <span className="tabular-nums">
              Program spend:{" "}
              <span className="text-stone-900 font-medium">
                {totalPoints.toLocaleString()} pts
              </span>{" "}
              ({currency}
              {totalMoney.toLocaleString()})
            </span>
          )}
        </div>

        <FieldError message={errors.categories} />
      </SectionCard>

      <SectionCard
        title="Program spend"
        description="Auto-computed from each category's winners × points. Edit allocations inside each category."
      >
        <div className="rounded-md border border-stone-200 bg-stone-50 p-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-stone-500">
                Total points
              </p>
              <p className="text-2xl font-semibold text-stone-900 tabular-nums leading-tight">
                {totalPoints.toLocaleString()} pts
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-stone-500">
                Monetary value
              </p>
              <p className="text-2xl font-semibold text-stone-900 tabular-nums leading-tight">
                {currency}
                {totalMoney.toLocaleString()}
              </p>
            </div>
          </div>

          <ul className="divide-y divide-stone-200 border-t border-stone-200">
            {form.categories.map((c) => {
              const pts = categoryPointsTotal(c);
              const money = categoryMoneyTotal(c, pointRate);
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between py-2 text-xs"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{c.emoji}</span>
                    <span className="truncate text-stone-700">
                      {c.name || "(unnamed)"}
                    </span>
                    <span className="text-stone-400 shrink-0">
                      {c.winnersCount}×{c.prizePoints}
                    </span>
                  </span>
                  <span className="tabular-nums shrink-0 text-right">
                    <span className="text-stone-900 font-medium">
                      {pts.toLocaleString()} pts
                    </span>
                    <span className="text-stone-500">
                      {" "}({currency}
                      {money.toLocaleString()})
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="text-[11px] text-stone-500 border-t border-stone-200 pt-2">
            Conversion:{" "}
            {pointRate === 1
              ? `1 pt = ${currency}1`
              : `${currency}${pointRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} per point`}{" "}
            (configured in Settings → Appreciation Policy).
          </p>
        </div>
      </SectionCard>

      <Sheet
        open={sheet !== null}
        onOpenChange={(open) => {
          if (!open) setSheet(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl md:!max-w-[52rem] p-0 overflow-hidden flex flex-col"
        >
          {sheet && (
            <CategoryEditorSheet
              key={sheet.mode === "edit" ? sheet.draft.id : "new"}
              initial={sheet.draft}
              mode={sheet.mode}
              currency={currency}
              monetaryEnabled={monetaryEnabled}
              pointRate={pointRate}
              otherCategories={
                sheet.mode === "edit"
                  ? form.categories.filter((_, j) => j !== sheet.index)
                  : form.categories
              }
              onCancel={() => setSheet(null)}
              onSave={saveSheet}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function CategoryRow({
  category,
  currency,
  monetaryEnabled,
  pointRate,
  canRemove,
  onEdit,
  onRemove,
}: {
  category: ProgramCategory;
  currency: string;
  monetaryEnabled: boolean;
  pointRate: number;
  canRemove: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const panelSize = (category.panel ?? []).length;
  const lead = (category.panel ?? []).find((p) => p.lead);
  const criteriaCount = (category.guidelines?.criteria ?? []).length;
  const points = categoryPointsTotal(category);
  const money = categoryMoneyTotal(category, pointRate);
  const restricted =
    (category.eligibility?.departments.length ?? 0) > 0 ||
    (category.eligibility?.locations.length ?? 0) > 0 ||
    (category.eligibility?.roles.length ?? 0) > 0 ||
    (category.eligibility?.minTenureMonths ?? 0) > 0;

  return (
    <div className="group flex items-start gap-3 p-3 border border-stone-200 rounded-lg bg-white hover:border-stone-300 transition-colors">
      <span className="text-2xl leading-none mt-0.5 shrink-0">
        {category.emoji || "🏆"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-sm font-semibold text-stone-900 truncate">
            {category.name || "(unnamed category)"}
          </p>
          {restricted && (
            <span className="text-[10px] uppercase tracking-wide font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5">
              Restricted
            </span>
          )}
        </div>
        {category.description && (
          <p className="text-xs text-stone-500 truncate mt-0.5">
            {category.description}
          </p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-stone-600">
          <SummaryPill>
            {category.winnersCount} winner{category.winnersCount === 1 ? "" : "s"}
          </SummaryPill>
          <SummaryPill>
            {panelSize} judge{panelSize === 1 ? "" : "s"}
            {lead && <span className="text-stone-400"> · lead {lead.name}</span>}
          </SummaryPill>
          <SummaryPill>
            {criteriaCount} criter{criteriaCount === 1 ? "ion" : "ia"}
          </SummaryPill>
          <SummaryPill>
            <span className="text-stone-400">Prize:</span>{" "}
            {currency}
            {Math.round(category.prizePoints * pointRate).toLocaleString()}
            {" · "}
            {category.prizePoints.toLocaleString()} pts / winner
          </SummaryPill>
        </div>
        {monetaryEnabled && (
          <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-stone-100">
            <span className="text-[11px] uppercase tracking-wide text-stone-500">
              Total spend
            </span>
            <span className="text-xs tabular-nums text-stone-900 font-medium">
              {points.toLocaleString()} pts{" "}
              <span className="text-stone-500 font-normal">
                ({currency}
                {money.toLocaleString()})
              </span>
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0 text-stone-500 hover:text-stone-900"
          title="Edit category"
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={!canRemove}
          className="h-8 w-8 p-0 text-stone-400 hover:text-red-600"
          title={canRemove ? "Remove category" : "Programs need at least one category"}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function SummaryPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap">
      {children}
    </span>
  );
}

const CATEGORY_STEPS: { id: string; label: string }[] = [
  { id: "basics", label: "Basics" },
  { id: "guidelines", label: "Guidelines" },
  { id: "eligibility", label: "Eligibility" },
  { id: "rewards", label: "Rewards" },
  { id: "panel", label: "Panel of judges" },
];

function CategoryEditorSheet({
  initial,
  mode,
  currency,
  monetaryEnabled,
  pointRate,
  otherCategories,
  onCancel,
  onSave,
}: {
  initial: ProgramCategory;
  mode: "new" | "edit";
  currency: string;
  monetaryEnabled: boolean;
  pointRate: number;
  otherCategories: ProgramCategory[];
  onCancel: () => void;
  onSave: (next: ProgramCategory) => void;
}) {
  const [draft, setDraft] = useState<ProgramCategory>(initial);
  // Mini-wizard state. Edit mode unlocks every step from the start so
  // admins can jump to whichever section they want to tweak.
  const [step, setStep] = useState(0);
  const [farthest, setFarthest] = useState(mode === "edit" ? CATEGORY_STEPS.length - 1 : 0);
  const [showStepError, setShowStepError] = useState(false);

  function updateDraft(p: Partial<ProgramCategory>) {
    setDraft((prev) => ({ ...prev, ...p }));
  }

  function copyPanelFrom(srcId: string) {
    const src = otherCategories.find((c) => c.id === srcId);
    if (!src) return;
    updateDraft({ panel: [...(src.panel ?? [])] });
  }

  const panel = draft.panel ?? [];
  const guidelines = draft.guidelines ?? defaultGuidelines();
  const eligibility = draft.eligibility ?? { ...DEFAULT_ELIGIBILITY };
  const criteriaCount = guidelines.criteria.length;
  const weightTotal = guidelines.criteria.reduce((s, c) => s + c.weight, 0);
  const weightOff = Math.abs(weightTotal - 100) > 5;

  function stepValidationError(idx: number): string | null {
    if (idx === 0) {
      if (!draft.name.trim()) return "Category name is required.";
      if (draft.winnersCount < 1) return "Winners must be at least 1.";
    } else if (idx === 1) {
      const criteria = draft.guidelines?.criteria ?? [];
      if (criteria.length === 0) return "Add at least one criterion.";
      if (criteria.some((cr) => !cr.label.trim())) {
        return "Every criterion needs a label.";
      }
    } else if (idx === 4) {
      if (panel.length === 0) return "Add at least one panel member.";
      const leads = panel.filter((p) => p.lead).length;
      if (leads !== 1) return "Mark exactly one panel member as Lead.";
    }
    return null;
  }

  function goToStep(target: number) {
    if (target === step) return;
    if (target < step) {
      setStep(target);
      setShowStepError(false);
      return;
    }
    // Forward jump — only allow if we've already been there OR the current
    // step is valid.
    if (target <= farthest) {
      setStep(target);
      setShowStepError(false);
      return;
    }
    if (stepValidationError(step)) {
      setShowStepError(true);
      return;
    }
    setStep(target);
    setFarthest((f) => Math.max(f, target));
    setShowStepError(false);
  }

  function nextStep() {
    goToStep(Math.min(CATEGORY_STEPS.length - 1, step + 1));
  }
  function prevStep() {
    setStep((s) => Math.max(0, s - 1));
    setShowStepError(false);
  }

  function handleSave() {
    // Find the first invalid step and jump there.
    for (let i = 0; i < CATEGORY_STEPS.length; i++) {
      const err = stepValidationError(i);
      if (err) {
        setStep(i);
        setShowStepError(true);
        return;
      }
    }
    // Phase 1.10 starter — budget is derived from points × rate. Persist the
    // computed value so dashboards / rollups don't need the conversion rate.
    const derivedBudget = categoryMoneyTotal(draft, pointRate);
    onSave({ ...draft, budgetAllocated: derivedBudget });
  }

  const currentError = showStepError ? stepValidationError(step) : null;
  const isFirstStep = step === 0;
  const isLastStep = step === CATEGORY_STEPS.length - 1;
  const draftPoints = categoryPointsTotal(draft);
  const draftMoney = categoryMoneyTotal(draft, pointRate);

  return (
    <>
      <SheetHeader className="px-6 pt-6 pb-4 border-b border-stone-200">
        <SheetTitle>
          {mode === "new" ? "Add category" : "Edit category"}
        </SheetTitle>
        <SheetDescription>
          Configure who can be nominated, what the panel scores against, and how prize budget is allocated.
        </SheetDescription>
      </SheetHeader>

      <CategoryStepper
        steps={CATEGORY_STEPS}
        current={step}
        farthest={farthest}
        onJump={goToStep}
      />

      <div className="flex-1 overflow-y-auto">
        {step === 0 && (
          <div className="px-6 py-5 space-y-5">
            <p className="text-xs text-stone-500 -mt-1">
              Name the award and set how many winners take it home.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <Input
                value={draft.emoji}
                onChange={(e) => updateDraft({ emoji: e.target.value.slice(0, 4) })}
                placeholder="🏆"
                maxLength={4}
                className="md:col-span-1 h-9 text-sm text-center"
              />
              <Input
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value.slice(0, 50) })}
                placeholder="Category name"
                maxLength={50}
                className="md:col-span-11 h-9 text-sm"
                autoFocus={mode === "new"}
              />
              <Input
                value={draft.description}
                onChange={(e) =>
                  updateDraft({ description: e.target.value.slice(0, 120) })
                }
                placeholder="Short description (shown to nominators)"
                maxLength={120}
                className="md:col-span-12 h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">Winners</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={draft.winnersCount}
                  onChange={(e) =>
                    updateDraft({
                      winnersCount: clamp(Number(e.target.value || 1), 1, 10),
                    })
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="px-6 py-5">
            <p className="text-xs text-stone-500 mb-3">
              The rubric the panel and AI score against.
            </p>
            <GuidelinesEditor
              guidelines={guidelines}
              onChange={(g) => updateDraft({ guidelines: g })}
              weightOff={weightOff}
              weightTotal={weightTotal}
              criteriaCount={criteriaCount}
            />
          </div>
        )}

        {step === 2 && (
          <div className="px-6 py-5">
            <p className="text-xs text-stone-500 mb-3">
              Who can be nominated in this category. Leave fields empty for "open to all."
            </p>
            <CategoryEligibilityEditor
              eligibility={eligibility}
              onChange={(e) => updateDraft({ eligibility: e })}
            />
          </div>
        )}

        {step === 3 && (
          <div className="px-6 py-5 space-y-5">
            <p className="text-xs text-stone-500 -mt-1">
              Set the prize points each winner receives in this category.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-stone-600">
                  Prize points / winner
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={10000}
                  value={draft.prizePoints}
                  onChange={(e) =>
                    updateDraft({
                      prizePoints: clamp(Number(e.target.value || 0), 0, 10000),
                    })
                  }
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <CategorySpendSummary
              category={draft}
              currency={currency}
              pointRate={pointRate}
              monetaryEnabled={monetaryEnabled}
            />
          </div>
        )}

        {step === 4 && (
          <div className="px-6 py-5">
            <p className="text-xs text-stone-500 mb-3">
              Reviewers for this category. Exactly one Lead.
            </p>
            <CategoryPanelEditor
              panel={panel}
              otherCategories={otherCategories}
              onChange={(p) => updateDraft({ panel: p })}
              onCopyPanelFrom={copyPanelFrom}
            />
          </div>
        )}
      </div>

      {currentError && (
        <div className="px-6 py-2.5 bg-red-50 border-t border-red-200 flex items-start gap-2 text-sm text-red-800">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{currentError}</span>
        </div>
      )}

      {monetaryEnabled && (
        <div className="px-6 py-2.5 border-t border-stone-200 bg-stone-50 flex items-baseline justify-between">
          <span className="text-[11px] uppercase tracking-wide text-stone-500">
            Category spend
          </span>
          <span className="text-sm tabular-nums">
            <span className="font-semibold text-stone-900">
              {draftPoints.toLocaleString()} pts
            </span>
            <span className="text-stone-500">
              {" "}
              ({currency}
              {draftMoney.toLocaleString()})
            </span>
          </span>
        </div>
      )}

      <footer className="px-6 py-3 border-t border-stone-200 flex items-center justify-between gap-2 bg-white">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 mr-2 hidden sm:inline">
            Step {step + 1} of {CATEGORY_STEPS.length}
          </span>
          {!isFirstStep && (
            <Button type="button" variant="outline" size="sm" onClick={prevStep}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          )}
          {isLastStep ? (
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="bg-stone-900 hover:bg-stone-700 text-white"
            >
              {mode === "new" ? "Add category" : "Save changes"}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={nextStep}
              className="bg-stone-900 hover:bg-stone-700 text-white"
            >
              Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </footer>
    </>
  );
}

function validateCategory(c: ProgramCategory): string | null {
  if (!c.name.trim()) return "Category name is required.";
  const panel = c.panel ?? [];
  if (panel.length === 0) return "Add at least one panel member.";
  const leads = panel.filter((p) => p.lead).length;
  if (leads !== 1) return "Mark exactly one panel member as Lead.";
  const criteria = c.guidelines?.criteria ?? [];
  if (criteria.length === 0) return "Add at least one criterion.";
  if (criteria.some((cr) => !cr.label.trim())) {
    return "Every criterion needs a label.";
  }
  if (c.winnersCount < 1) return "Winners must be at least 1.";
  return null;
}

function CategorySpendSummary({
  category,
  currency,
  pointRate,
  monetaryEnabled = true,
}: {
  category: ProgramCategory;
  currency: string;
  pointRate: number;
  monetaryEnabled?: boolean;
}) {
  const points = categoryPointsTotal(category);
  const money = categoryMoneyTotal(category, pointRate);
  const perWinnerMoney = Math.round(category.prizePoints * pointRate);
  const rateNote =
    pointRate === 1
      ? `1 pt = ${currency}1`
      : `${currency}${pointRate.toLocaleString(undefined, { maximumFractionDigits: 4 })} per point`;

  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-stone-500">
            Per winner
          </p>
          <p className="text-xl font-semibold text-stone-900 tabular-nums leading-tight">
            {category.prizePoints.toLocaleString()} pts
          </p>
          {monetaryEnabled && (
            <p className="text-xs text-stone-600 tabular-nums mt-0.5">
              ≈ {currency}
              {perWinnerMoney.toLocaleString()}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-stone-500">
            Category budget
          </p>
          <p className="text-xl font-semibold text-stone-900 tabular-nums leading-tight">
            {points.toLocaleString()} pts
          </p>
          {monetaryEnabled && (
            <p className="text-xs text-stone-600 tabular-nums mt-0.5">
              ≈ {currency}
              {money.toLocaleString()}
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-stone-600 leading-relaxed border-t border-stone-200 pt-2">
        {category.winnersCount} winner{category.winnersCount === 1 ? "" : "s"} ×{" "}
        {category.prizePoints.toLocaleString()} pts each ={" "}
        <span className="text-stone-900 font-medium tabular-nums">
          {points.toLocaleString()} pts
        </span>
        {monetaryEnabled && (
          <>
            {" "}
            ≈{" "}
            <span className="text-stone-900 font-medium tabular-nums">
              {currency}
              {money.toLocaleString()}
            </span>
          </>
        )}
      </p>
      {monetaryEnabled && (
        <p className="text-[11px] text-stone-500">
          Conversion: {rateNote} (configured in Settings → Appreciation Policy).
        </p>
      )}
    </div>
  );
}

function CategorySubSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          {title}
        </h3>
        {hint && <p className="text-xs text-stone-500 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function GuidelinesEditor({
  guidelines,
  onChange,
  weightOff,
  weightTotal,
  criteriaCount,
}: {
  guidelines: CategoryGuidelines;
  onChange: (g: CategoryGuidelines) => void;
  weightOff: boolean;
  weightTotal: number;
  criteriaCount: number;
}) {
  function patch(p: Partial<CategoryGuidelines>) {
    onChange({ ...guidelines, ...p });
  }
  function updateCriterion(idx: number, p: Partial<CategoryCriterion>) {
    const next = guidelines.criteria.map((c, i) => (i === idx ? { ...c, ...p } : c));
    patch({ criteria: next });
  }
  function removeCriterion(idx: number) {
    if (guidelines.criteria.length <= 1) return;
    patch({ criteria: guidelines.criteria.filter((_, i) => i !== idx) });
  }
  function addCriterion() {
    if (guidelines.criteria.length >= 6) return;
    patch({ criteria: [...guidelines.criteria, newCriterion()] });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-stone-600">What good looks like</Label>
        <RichTextarea
          value={guidelines.whatGoodLooksLike}
          onChange={(v) => patch({ whatGoodLooksLike: v })}
          placeholder="Describe in detail what a strong nomination looks like — concrete moments, outcomes, scale. Use **bold** and *italic* to highlight expectations."
          maxLength={2000}
          rows={8}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-stone-600">Criteria ({criteriaCount}/6)</Label>
          <span className={`text-xs ${weightOff ? "text-amber-700" : "text-stone-500"}`}>
            Weights total: {weightTotal}
            {weightOff ? " (should be ~100)" : ""}
          </span>
        </div>
        {guidelines.criteria.map((c, i) => (
          <div
            key={c.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start"
          >
            <Input
              value={c.label}
              onChange={(e) => updateCriterion(i, { label: e.target.value.slice(0, 60) })}
              placeholder="e.g. Customer impact"
              className="md:col-span-3 h-9 text-sm"
            />
            <Input
              value={c.description}
              onChange={(e) =>
                updateCriterion(i, { description: e.target.value.slice(0, 200) })
              }
              placeholder="What to look for"
              className="md:col-span-6 h-9 text-sm"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={c.weight}
              onChange={(e) =>
                updateCriterion(i, { weight: clamp(Number(e.target.value || 0), 0, 100) })
              }
              className="md:col-span-2 h-9 text-sm tabular-nums text-center"
              title="Weight"
            />
            <div className="md:col-span-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCriterion(i)}
                disabled={guidelines.criteria.length <= 1}
                className="h-9 w-9 p-0 text-stone-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCriterion}
          disabled={guidelines.criteria.length >= 6}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add criterion
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-stone-600">Disqualifiers (optional)</Label>
        <Textarea
          value={guidelines.disqualifiers ?? ""}
          onChange={(e) =>
            patch({ disqualifiers: e.target.value.slice(0, 400) || undefined })
          }
          placeholder="What makes a nomination ineligible?"
          maxLength={400}
          className="text-sm"
          rows={2}
        />
      </div>
    </div>
  );
}

function CategoryEligibilityEditor({
  eligibility,
  onChange,
}: {
  eligibility: CategoryEligibility;
  onChange: (e: CategoryEligibility) => void;
}) {
  const allDepartments = useMemo(() => listDepartments(EMPLOYEES), []);
  function patchE(p: Partial<CategoryEligibility>) {
    onChange({ ...eligibility, ...p });
  }
  function toggleArr(arr: string[], v: string): string[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChipPicker
          label="Departments"
          placeholder="Open to all"
          options={allDepartments}
          selected={eligibility.departments}
          onToggle={(v) => patchE({ departments: toggleArr(eligibility.departments, v) })}
        />
        <ChipPicker
          label="Locations"
          placeholder="Open to all"
          options={PROGRAM_LOCATIONS}
          selected={eligibility.locations}
          onToggle={(v) => patchE({ locations: toggleArr(eligibility.locations, v) })}
        />
      </div>
      <ChipPicker
        label="Roles"
        placeholder="Open to all roles"
        options={["employee", "manager", "admin"]}
        selected={eligibility.roles}
        onToggle={(v) => patchE({ roles: toggleArr(eligibility.roles, v) })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-stone-600">Min tenure (months)</Label>
          <Input
            type="number"
            min={0}
            value={eligibility.minTenureMonths}
            onChange={(e) =>
              patchE({ minTenureMonths: Math.max(0, Number(e.target.value || 0)) })
            }
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-stone-600">
            Exclude winners from last N cycles
          </Label>
          <Input
            type="number"
            min={0}
            value={eligibility.excludePastWinnersCycles}
            onChange={(e) =>
              patchE({
                excludePastWinnersCycles: Math.max(0, Number(e.target.value || 0)),
              })
            }
            className="h-9 text-sm"
          />
          <p className="text-xs text-stone-400">0 = no exclusion</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-stone-600">
          Custom eligibility note (shown to nominators)
        </Label>
        <Input
          value={eligibility.customNote ?? ""}
          onChange={(e) =>
            patchE({ customNote: e.target.value.slice(0, 200) || undefined })
          }
          placeholder="Optional — e.g. 'Excludes the executive team.'"
          maxLength={200}
          className="h-9 text-sm"
        />
      </div>
    </div>
  );
}

function CategoryPanelEditor({
  panel,
  otherCategories,
  onChange,
  onCopyPanelFrom,
}: {
  panel: PanelMember[];
  otherCategories: ProgramCategory[];
  onChange: (p: PanelMember[]) => void;
  onCopyPanelFrom: (srcId: string) => void;
}) {
  function addEmployee(emp: Employee) {
    if (panel.some((m) => m.id === emp.id)) return;
    if (panel.length >= 12) return;
    const next: PanelMember = {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      department: emp.businessUnitName ?? "—",
      avatar: emp.avatar,
      lead: panel.length === 0,
      reviewed: 0,
      totalToReview: 0,
    };
    onChange([...panel, next]);
  }
  function remove(id: string) {
    const next = panel.filter((m) => m.id !== id);
    if (next.length > 0 && !next.some((n) => n.lead)) {
      next[0] = { ...next[0], lead: true };
    }
    onChange(next);
  }
  function setLead(id: string) {
    onChange(panel.map((m) => ({ ...m, lead: m.id === id })));
  }

  const copySources = otherCategories.filter((c) => (c.panel ?? []).length > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <EmployeePicker excludeIds={panel.map((m) => m.id)} onPick={addEmployee} />
        {copySources.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                Copy panel from…
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-2">
              <p className="text-xs text-stone-500 px-2 pb-1">
                Reuse another category's judges
              </p>
              {copySources.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCopyPanelFrom(c.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-stone-50 text-left"
                >
                  <span className="text-sm">{c.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{c.name || "(unnamed)"}</p>
                    <p className="text-xs text-stone-500">
                      {(c.panel ?? []).length} judges
                    </p>
                  </div>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {panel.length === 0 ? (
        <p className="text-xs text-stone-500 italic">No judges added yet.</p>
      ) : (
        <div className="space-y-1.5">
          {panel.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 p-2.5 border border-stone-200 rounded-md"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={m.avatar} alt={m.name} />
                <AvatarFallback className="text-xs">
                  {m.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">{m.name}</p>
                <p className="text-xs text-stone-500 truncate">
                  {m.role} · {m.department}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLead(m.id)}
                className={`text-xs flex items-center gap-1 px-2 py-1 rounded-md border transition ${
                  m.lead
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                }`}
                title="Mark as Lead"
              >
                <Crown className="w-3 h-3" /> {m.lead ? "Lead" : "Mark Lead"}
              </button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(m.id)}
                className="h-8 w-8 p-0 text-stone-400 hover:text-red-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function ChipPicker({
  label,
  placeholder,
  options,
  selected,
  onToggle,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-stone-700">{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${
                on
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-stone-400 italic">{placeholder}</p>
      )}
    </div>
  );
}

function EmployeePicker({
  excludeIds,
  onPick,
}: {
  excludeIds: string[];
  onPick: (e: Employee) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EMPLOYEES.filter(
      (e) =>
        !excludeIds.includes(e.id) &&
        (q.length === 0 ||
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          (e.businessUnitName ?? "").toLowerCase().includes(q)),
    ).slice(0, 20);
  }, [query, excludeIds]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Plus className="w-3.5 h-3.5 mr-1" /> Add member
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2 top-2.5 text-stone-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employees…"
            className="h-8 pl-7 text-sm"
            autoFocus
          />
        </div>
        <div className="mt-2 max-h-72 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-stone-400 italic px-2 py-3">No matches</p>
          ) : (
            filtered.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  onPick(e);
                  setQuery("");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-stone-50 text-left"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={e.avatar} alt={e.name} />
                  <AvatarFallback className="text-xs">
                    {e.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm text-stone-900 truncate">{e.name}</p>
                  <p className="text-xs text-stone-500 truncate">
                    {e.role} · {e.businessUnitName}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Budget — period + program-level per-winner average. The spend rollup lives
// inside the Categories step now (Phase 1.10).
function BudgetSection({
  form,
  patch,
  currency,
  perWinnerPreview,
}: {
  form: FormState;
  patch: (p: Partial<FormState>) => void;
  currency: string;
  perWinnerPreview: number;
}) {
  return (
    <SectionCard
      title="Budget period"
      description="Choose how often each category's points budget refreshes."
    >
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Period</Label>
        <div className="flex gap-2">
          {(["current-cycle", "annual"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => patch({ budgetPeriod: p })}
              className={`px-3 py-1.5 rounded-md border text-sm transition capitalize ${
                form.budgetPeriod === p
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
              }`}
            >
              {p.replace("-", " ")}
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-500">
          Determines whether each category's points refresh per cycle or per year.
        </p>
      </div>

      <p className="text-xs text-stone-500 italic">
        Avg per winner across the program: {currency}
        {perWinnerPreview.toLocaleString()}.
      </p>
    </SectionCard>
  );
}

// Notifications
function NotificationsSection({
  form,
  patch,
  slackConnected,
}: {
  form: FormState;
  patch: (p: Partial<FormState>) => void;
  slackConnected: boolean;
}) {
  const [open, setOpen] = useState(false);
  function update(p: Partial<ProgramNotifications>) {
    patch({ notifications: { ...form.notifications, ...p } });
  }
  return (
    <Card className="border border-stone-200">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-5 flex items-center justify-between text-left">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Notifications</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Who gets pinged when things happen.
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-2">
            <NotificationToggle
              label="Notify nominees when nominated"
              checked={form.notifications.notifyNominees}
              onCheckedChange={(v) => update({ notifyNominees: v })}
            />
            <NotificationToggle
              label="Notify all employees when program goes live"
              checked={form.notifications.notifyAllOnLaunch}
              onCheckedChange={(v) => update({ notifyAllOnLaunch: v })}
            />
            {slackConnected && (
              <NotificationToggle
                label="Announce winners to Slack"
                checked={form.notifications.announceWinnersToSlack}
                onCheckedChange={(v) => update({ announceWinnersToSlack: v })}
              />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function NotificationToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between p-3 rounded-md border border-stone-200">
      <span className="text-sm text-stone-900">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────

/**
 * Compact stepper for the Add/Edit category sheet. Renders inline at the
 * top of the sheet — clickable steps with light gating (the page-level
 * Stepper handles the outer 4-step program wizard separately).
 */
function CategoryStepper({
  steps,
  current,
  farthest,
  onJump,
}: {
  steps: { id: string; label: string }[];
  current: number;
  farthest: number;
  onJump: (i: number) => void;
}) {
  return (
    <div className="px-6 py-3 border-b border-stone-200 bg-white">
      <div className="flex items-center flex-nowrap gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {steps.map((s, i) => {
          const reached = i <= farthest;
          const active = i === current;
          const completed = i < current || (reached && !active && i < farthest);
          return (
            <div key={s.id} className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onJump(i)}
                disabled={!reached && !active}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition shrink-0 ${
                  active
                    ? "bg-stone-900 text-white"
                    : reached
                      ? "text-stone-700 hover:bg-stone-50"
                      : "text-stone-400 cursor-not-allowed"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-medium shrink-0 ${
                    active
                      ? "bg-white text-stone-900"
                      : completed
                        ? "bg-green-500 text-white"
                        : reached
                          ? "bg-stone-200 text-stone-700"
                          : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {completed ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="text-xs font-medium whitespace-nowrap">
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span className="w-4 h-px bg-stone-200 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stepper({
  currentStep,
  farthestStep,
  onJump,
}: {
  currentStep: number;
  farthestStep: number;
  onJump: (i: number) => void;
}) {
  return (
    <div className="border border-stone-200 rounded-xl bg-white p-2">
      <div className="flex items-center flex-nowrap gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {WIZARD_STEPS.map((s, i) => {
          const reached = i <= farthestStep;
          const active = i === currentStep;
          const completed = i < currentStep || (reached && !active && i < farthestStep);
          return (
            <div key={s.id} className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onJump(i)}
                disabled={!reached && !active}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition shrink-0 ${
                  active
                    ? "bg-stone-900 text-white"
                    : reached
                      ? "text-stone-700 hover:bg-stone-50"
                      : "text-stone-400 cursor-not-allowed"
                }`}
                data-testid={`wizard-step-${s.id}`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-medium shrink-0 ${
                    active
                      ? "bg-white text-stone-900"
                      : completed
                        ? "bg-green-500 text-white"
                        : reached
                          ? "bg-stone-200 text-stone-700"
                          : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {completed ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span className="text-xs font-medium whitespace-nowrap">{s.label}</span>
              </button>
              {i < WIZARD_STEPS.length - 1 && (
                <span className="w-4 h-px bg-stone-200 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Review card (last step) ──────────────────────────────────────────

function ReviewCard({
  form,
  currency,
  perWinnerPreview,
  onJump,
}: {
  form: FormState;
  currency: string;
  perWinnerPreview: number;
  onJump: (i: number) => void;
}) {
  const fmt = (d: string) =>
    d ? new Date(d).toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const totalWinners = form.categories.reduce((s, c) => s + c.winnersCount, 0);
  // Phase 1.8 — panel is per-category; show the union and the lead of the first category as a hint.
  const allPanel = form.categories.flatMap((c) => c.panel ?? []);
  const uniquePanel = Array.from(new Map(allPanel.map((m) => [m.id, m])).values());
  const firstLead = form.categories
    .map((c) => (c.panel ?? []).find((p) => p.lead))
    .find((p): p is PanelMember => !!p);
  const anyEligibilityRestricted = form.categories.some((c) => {
    const e = c.eligibility;
    if (!e) return false;
    return (
      e.departments.length > 0 ||
      e.locations.length > 0 ||
      e.roles.length > 0 ||
      e.minTenureMonths > 0
    );
  });

  return (
    <Card className="border border-stone-200">
      <CardContent className="p-0">
        <div className="relative h-32 overflow-hidden rounded-t-lg flex items-end p-4">
          <BannerArt
            bannerId={form.bannerId}
            customDataUrl={form.customBannerDataUrl}
            className="absolute inset-0"
          />
          <div className="relative z-10 flex items-center gap-3">
            <span className="text-3xl drop-shadow">{form.iconEmoji}</span>
            <div className="text-white drop-shadow">
              <p className="text-base font-semibold">{form.name || "Untitled program"}</p>
              <p className="text-xs opacity-90 line-clamp-1">
                {form.description || "No description yet"}
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-stone-900">Review</h3>

          <ReviewRow label="Cycle" onEdit={() => onJump(1)}>
            <span className="capitalize">{form.cadence.replace("-", " ")}</span> · {fmt(form.startDate)} → {fmt(form.endDate)}
            {form.cadence !== "one-off" && form.repeatAutomatically && " · auto-repeats"}
          </ReviewRow>

          <ReviewRow label="Categories" onEdit={() => onJump(2)}>
            {form.categories.length} categor{form.categories.length === 1 ? "y" : "ies"} ·{" "}
            {totalWinners} winner{totalWinners === 1 ? "" : "s"} total
            <div className="flex flex-wrap gap-1 mt-1.5">
              {form.categories.map((c) => (
                <Badge
                  key={c.id}
                  variant="secondary"
                  className="bg-stone-100 text-stone-700 text-xs"
                >
                  {c.emoji} {c.name || "(unnamed)"} × {c.winnersCount}
                </Badge>
              ))}
            </div>
          </ReviewRow>

          <ReviewRow label="Panels" onEdit={() => onJump(2)}>
            {uniquePanel.length === 0
              ? "No panel set yet"
              : `${uniquePanel.length} unique judge${uniquePanel.length === 1 ? "" : "s"} across categories`}
            {firstLead && (
              <> · Lead example: <span className="text-stone-900 font-medium">{firstLead.name}</span></>
            )}
          </ReviewRow>

          <ReviewRow label="Eligibility" onEdit={() => onJump(2)}>
            {anyEligibilityRestricted
              ? "Per-category restrictions set — open each category to review"
              : "Open to all employees"}
          </ReviewRow>

          <ReviewRow label="Budget" onEdit={() => onJump(2)}>
            {currency}
            {form.categories
              .reduce((s, c) => s + (c.budgetAllocated ?? 0), 0)
              .toLocaleString()}{" "}
            ({form.budgetPeriod.replace("-", " ")}) · {currency}
            {perWinnerPreview.toLocaleString()} / winner
          </ReviewRow>

          <ReviewRow label="Notifications" onEdit={() => onJump(3)}>
            {[
              form.notifications.notifyNominees && "nominees",
              form.notifications.notifyAllOnLaunch && "all on launch",
              form.notifications.announceWinnersToSlack && "Slack winners",
            ]
              .filter(Boolean)
              .join(" · ") || "none"}
          </ReviewRow>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewRow({
  label,
  children,
  onEdit,
}: {
  label: string;
  children: React.ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-stone-100 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-stone-500 font-medium mb-1">{label}</p>
        <div className="text-sm text-stone-700">{children}</div>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 text-xs shrink-0">
        Edit
      </Button>
    </div>
  );
}

// Helpers
function timeAgoShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
