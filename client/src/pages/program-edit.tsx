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
} from "lucide-react";
import { BannerArt } from "@/components/programs/banner-art";
import { getAccount } from "@/lib/account";
import { EMPLOYEES, type Employee } from "@/lib/recognize-data";
import {
  generateProgramId,
  getProgramById,
  saveProgram,
  type PanelMember,
  type Program,
  type ProgramBudgetPeriod,
  type ProgramCadence,
  type ProgramCategory,
  type ProgramEligibility,
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
  categories: ProgramCategory[];
  eligibility: ProgramEligibility;
  panelMembers: PanelMember[];
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

const DEFAULT_ELIGIBILITY: ProgramEligibility = {
  departments: [],
  locations: [],
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

function newCategoryRow(): ProgramCategory {
  return {
    id: "cat-" + Math.random().toString(36).slice(2, 8),
    name: "",
    emoji: "🏆",
    description: "",
    winnersCount: 1,
    prizePoints: 1000,
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
    eligibility: { ...DEFAULT_ELIGIBILITY },
    panelMembers: [],
    budgetAllocated: 10000,
    budgetPeriod: "current-cycle",
    notifications: { ...DEFAULT_NOTIFICATIONS },
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
    categories:
      program.categories && program.categories.length > 0
        ? program.categories
        : [
            {
              ...newCategoryRow(),
              name: "Winner",
              description: program.shortDesc ?? "",
              winnersCount: 1,
              prizePoints: program.pointsPerWin ?? 1000,
            },
          ],
    eligibility: program.eligibility ?? { ...DEFAULT_ELIGIBILITY },
    panelMembers: program.panel ?? [],
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
  if (form.categories.length === 0) errors.categories = "Add at least one category.";
  if (form.categories.some((c) => !c.name.trim())) {
    errors.categories = "All categories need a name.";
  }
  if (!form.panelMembers.some((p) => p.lead)) {
    errors.panel = "Mark exactly one panel member as Lead.";
  }
  if (form.panelMembers.length === 0) {
    errors.panel = "Add at least one panel member.";
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
  { id: "basics",     label: "Basics",       hint: "Name, banner, icon" },
  { id: "cycle",      label: "Cycle",        hint: "Cadence and dates" },
  { id: "categories", label: "Categories",   hint: "Awards & winners" },
  { id: "panel",      label: "Panel",        hint: "Reviewers & eligibility" },
  { id: "publish",    label: "Budget",       hint: "Budget, alerts, review" },
];

// ─── Page ──────────────────────────────────────────────────────────────

export default function ProgramEdit() {
  const navigate = useNavigate();
  const { programId } = useParams<{ programId: string }>();
  const account = getAccount();
  const monetaryEnabled = !!account?.appreciationPolicy?.monetaryEnabled;
  const currency = account?.currency ?? "₹";
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
    const pointsPerWin = totalWinners === 0 ? 0 : Math.floor(form.budgetAllocated / totalWinners);

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
      budgetAllocated: form.budgetAllocated,
      budgetUsed: 0,
      highlights: [],
      cadence: form.cadence,
      startDate: form.startDate,
      endDate: form.endDate,
      repeatAutomatically: form.repeatAutomatically,
      categories: form.categories,
      eligibility: form.eligibility,
      budgetPeriod: form.budgetPeriod,
      notifications: form.notifications,
      panel: form.panelMembers,
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
  const perWinnerPreview =
    totalWinnersAcrossCategories === 0
      ? 0
      : Math.floor(form.budgetAllocated / totalWinnersAcrossCategories);

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
    if (target > 3 && (form.panelMembers.length === 0 || !form.panelMembers.some((p) => p.lead))) {
      errs.panel = "Add a panel and mark exactly one Lead.";
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
            <CategoriesSection
              form={form}
              patch={patch}
              errors={errors}
              monetaryEnabled={monetaryEnabled}
              currency={currency}
            />
          )}

          {step === 3 && (
            <>
              <PanelSection form={form} patch={patch} errors={errors} />
              <EligibilitySection form={form} patch={patch} />
            </>
          )}

          {step === 4 && (
            <>
              <BudgetSection
                form={form}
                patch={patch}
                currency={currency}
                perWinnerPreview={perWinnerPreview}
              />
              <NotificationsSection
                form={form}
                patch={patch}
                slackConnected={slackConnected}
              />
              <ReviewCard
                form={form}
                currency={currency}
                perWinnerPreview={perWinnerPreview}
                onJump={goToStep}
              />
            </>
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
function CategoriesSection({
  form,
  patch,
  errors,
  monetaryEnabled,
  currency,
}: {
  form: FormState;
  patch: (p: Partial<FormState>) => void;
  errors: ValidationErrors;
  monetaryEnabled: boolean;
  currency: string;
}) {
  function update(idx: number, p: Partial<ProgramCategory>) {
    const next = form.categories.map((c, i) => (i === idx ? { ...c, ...p } : c));
    patch({ categories: next });
  }
  function remove(idx: number) {
    if (form.categories.length <= 1) return;
    patch({ categories: form.categories.filter((_, i) => i !== idx) });
  }
  function add() {
    if (form.categories.length >= 8) return;
    patch({ categories: [...form.categories, newCategoryRow()] });
  }
  function addPreset(presetId: string) {
    if (form.categories.length >= 8) return;
    const preset = CATEGORY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    patch({
      categories: [
        ...form.categories,
        {
          id: "cat-" + Math.random().toString(36).slice(2, 8),
          name: preset.name,
          emoji: preset.emoji,
          description: preset.description,
          winnersCount: preset.winnersCount,
          prizePoints: monetaryEnabled ? preset.prizePoints : 0,
        },
      ],
    });
  }

  return (
    <SectionCard
      title="Award categories"
      description="What can someone be recognized for in this program? Min 1, max 8."
      rightSlot={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={form.categories.length >= 8}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add category
        </Button>
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

      <div className="space-y-3">
        {form.categories.map((cat, i) => (
          <div key={cat.id} className="border border-stone-200 rounded-md p-3 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
              <Input
                value={cat.emoji}
                onChange={(e) => update(i, { emoji: e.target.value.slice(0, 4) })}
                placeholder="🏆"
                maxLength={4}
                className="md:col-span-1 h-9 text-sm text-center"
              />
              <Input
                value={cat.name}
                onChange={(e) => update(i, { name: e.target.value.slice(0, 50) })}
                placeholder="Category name"
                maxLength={50}
                className="md:col-span-4 h-9 text-sm"
              />
              <Input
                value={cat.description}
                onChange={(e) => update(i, { description: e.target.value.slice(0, 120) })}
                placeholder="Short description"
                maxLength={120}
                className={monetaryEnabled ? "md:col-span-4 h-9 text-sm" : "md:col-span-6 h-9 text-sm"}
              />
              <div className="md:col-span-1">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={cat.winnersCount}
                  onChange={(e) =>
                    update(i, { winnersCount: clamp(Number(e.target.value || 1), 1, 10) })
                  }
                  className="h-9 text-sm"
                  title="Winners"
                />
              </div>
              {monetaryEnabled && (
                <div className="md:col-span-1">
                  <Input
                    type="number"
                    min={0}
                    max={10000}
                    value={cat.prizePoints}
                    onChange={(e) =>
                      update(i, { prizePoints: clamp(Number(e.target.value || 0), 0, 10000) })
                    }
                    className="h-9 text-sm"
                    title="Prize points per winner"
                  />
                </div>
              )}
              <div className="md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(i)}
                  disabled={form.categories.length <= 1}
                  className="h-9 w-9 p-0 text-stone-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-stone-500">
              {cat.winnersCount} winner{cat.winnersCount === 1 ? "" : "s"}
              {monetaryEnabled
                ? ` · ${currency}${cat.prizePoints.toLocaleString()} per winner`
                : " · recognition only"}
            </p>
          </div>
        ))}
      </div>
      <FieldError message={errors.categories} />
    </SectionCard>
  );
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// Eligibility
function EligibilitySection({
  form,
  patch,
}: {
  form: FormState;
  patch: (p: Partial<FormState>) => void;
}) {
  const [open, setOpen] = useState(true);
  const allDepartments = useMemo(() => listDepartments(EMPLOYEES), []);

  function toggleArr(arr: string[], v: string): string[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }
  function update(p: Partial<ProgramEligibility>) {
    patch({ eligibility: { ...form.eligibility, ...p } });
  }

  return (
    <Card className="border border-stone-200">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-5 flex items-center justify-between text-left">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Eligibility</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {form.eligibility.departments.length === 0 && form.eligibility.locations.length === 0
                  ? "Open to all employees"
                  : `${form.eligibility.departments.length || "All"} departments · ${form.eligibility.locations.length || "All"} locations`}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChipPicker
                label="Departments"
                placeholder="Open to all"
                options={allDepartments}
                selected={form.eligibility.departments}
                onToggle={(v) => update({ departments: toggleArr(form.eligibility.departments, v) })}
              />
              <ChipPicker
                label="Locations"
                placeholder="Open to all"
                options={PROGRAM_LOCATIONS}
                selected={form.eligibility.locations}
                onToggle={(v) => update({ locations: toggleArr(form.eligibility.locations, v) })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">Min tenure (months)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.eligibility.minTenureMonths}
                  onChange={(e) =>
                    update({ minTenureMonths: Math.max(0, Number(e.target.value || 0)) })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">
                  Exclude winners from last N cycles
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.eligibility.excludePastWinnersCycles}
                  onChange={(e) =>
                    update({ excludePastWinnersCycles: Math.max(0, Number(e.target.value || 0)) })
                  }
                  className="h-9 text-sm"
                />
                <p className="text-xs text-stone-400">0 = no exclusion</p>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
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

// Panel of judges
function PanelSection({
  form,
  patch,
  errors,
}: {
  form: FormState;
  patch: (p: Partial<FormState>) => void;
  errors: ValidationErrors;
}) {
  function add(emp: Employee) {
    if (form.panelMembers.some((m) => m.id === emp.id)) return;
    if (form.panelMembers.length >= 12) return;
    const next: PanelMember = {
      id: emp.id,
      name: emp.name,
      role: emp.role,
      department: emp.businessUnitName ?? "—",
      avatar: emp.avatar,
      lead: form.panelMembers.length === 0,
      reviewed: 0,
      totalToReview: 0,
    };
    patch({ panelMembers: [...form.panelMembers, next] });
  }
  function remove(id: string) {
    const next = form.panelMembers.filter((m) => m.id !== id);
    if (next.length > 0 && !next.some((n) => n.lead)) {
      next[0] = { ...next[0], lead: true };
    }
    patch({ panelMembers: next });
  }
  function setLead(id: string) {
    patch({
      panelMembers: form.panelMembers.map((m) => ({ ...m, lead: m.id === id })),
    });
  }

  return (
    <SectionCard
      title="Panel of judges"
      description="Reviewers select winners after manager approval. Min 1, max 12. Exactly one Lead."
      rightSlot={<EmployeePicker excludeIds={form.panelMembers.map((m) => m.id)} onPick={add} />}
    >
      <Card className="border border-stone-100 bg-stone-50/50 p-3">
        <p className="text-xs text-stone-600">
          Panel members review nominations after manager approval and select the winners. The Lead
          gets the AI-shortlister and final say on ties.
        </p>
      </Card>

      {form.panelMembers.length === 0 ? (
        <p className="text-xs text-stone-500 italic">No panel members added yet.</p>
      ) : (
        <div className="space-y-1.5">
          {form.panelMembers.map((m) => (
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
      <FieldError message={errors.panel} />
    </SectionCard>
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

// Budget
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
      title="Budget"
      description="How much is allocated to this program."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">
            Total allocated ({currency})
          </Label>
          <Input
            type="number"
            min={0}
            value={form.budgetAllocated}
            onChange={(e) => patch({ budgetAllocated: Math.max(0, Number(e.target.value || 0)) })}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">Period</Label>
          <div className="flex gap-2">
            {(["current-cycle", "annual"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => patch({ budgetPeriod: p })}
                className={`flex-1 px-3 py-1.5 rounded-md border text-sm transition capitalize ${
                  form.budgetPeriod === p
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                }`}
              >
                {p.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-stone-500 italic">
        Budget per winner: {currency}
        {perWinnerPreview.toLocaleString()} (split across all categories &amp; winners)
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
  const lead = form.panelMembers.find((p) => p.lead);

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

          <ReviewRow label="Panel" onEdit={() => onJump(3)}>
            {form.panelMembers.length === 0
              ? "No panel set yet"
              : `${form.panelMembers.length} member${form.panelMembers.length === 1 ? "" : "s"}`}
            {lead && <> · Lead: <span className="text-stone-900 font-medium">{lead.name}</span></>}
          </ReviewRow>

          <ReviewRow label="Eligibility" onEdit={() => onJump(3)}>
            {form.eligibility.departments.length === 0 && form.eligibility.locations.length === 0
              ? "Open to all employees"
              : `${form.eligibility.departments.length || "All"} dept · ${form.eligibility.locations.length || "All"} loc`}
            {form.eligibility.minTenureMonths > 0 && ` · ${form.eligibility.minTenureMonths}mo min tenure`}
          </ReviewRow>

          <ReviewRow label="Budget" onEdit={() => onJump(4)}>
            {currency}
            {form.budgetAllocated.toLocaleString()} ({form.budgetPeriod.replace("-", " ")}) ·{" "}
            {currency}
            {perWinnerPreview.toLocaleString()} / winner
          </ReviewRow>

          <ReviewRow label="Notifications" onEdit={() => onJump(4)}>
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
