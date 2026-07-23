import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Lock,
  Users,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { EngageXLogo } from "@/components/engagex-logo";

export type WizardStep = {
  key: string;
  label: string;
  href: string;
  optional?: boolean;
};

type Props = {
  steps: WizardStep[];
  currentKey: string;
  title: string;
  description?: string;
  /** Step-specific content for the left panel. Falls back to the marketing panel when omitted. */
  aside?: React.ReactNode;
  /** Tailwind background classes for the left panel — set per step to match its illustration. */
  panelBg?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  onSkip?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  hideBack?: boolean;
};

/** Shared brand gradient — orange → pink → indigo. */
const BRAND_GRADIENT = "bg-gradient-to-r from-[#FF7A00] via-[#E5397E] to-[#5B5BEF]";

const MARKETING_FEATURES = [
  { icon: Users, tint: "bg-[#FDE7D6] text-[#F97316]", label: "Appreciate anyone, anytime" },
  { icon: Trophy, tint: "bg-[#EDE9FB] text-[#7C3AED]", label: "Motivate with meaningful rewards" },
  { icon: TrendingUp, tint: "bg-[#FDE7D6] text-[#F97316]", label: "Track impact & celebrate wins" },
];

export function WizardLayout({
  steps,
  currentKey,
  title,
  description,
  aside,
  panelBg = "bg-gradient-to-br from-[#FDF6EF] via-[#FCF6F2] to-[#F7F3FB]",
  children,
  onBack,
  onContinue,
  onSkip,
  continueLabel = "Next",
  continueDisabled = false,
  hideBack = false,
}: Props) {
  const currentIndex = steps.findIndex((s) => s.key === currentKey);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#FDF3EC] via-[#FBEFF3] to-[#EEF0FB] flex items-stretch justify-center p-2 sm:p-3 overflow-hidden">
      <div className="w-full grid lg:grid-cols-[0.8fr_1.2fr] grid-rows-[minmax(0,1fr)] gap-3 rounded-[2rem] bg-white/40 border border-white/60 shadow-[0_20px_60px_-20px_rgba(91,91,239,0.25)] backdrop-blur-sm p-2 sm:p-2.5 overflow-hidden">
        <MarketingPanel aside={aside} panelBg={panelBg} />
        <div className="rounded-[1.5rem] bg-white shadow-sm border border-border p-6 sm:p-8 flex flex-col min-h-0">
          {/* Header — fixed */}
          <div className="flex items-start justify-between gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#E5397E]" />
                <h1 className="text-xl font-bold text-foreground">First Time Setup</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-7">{title}</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-[#B4531F] bg-[#FDE7D6] rounded-full px-3 py-1.5">
              Step {currentIndex + 1} of {steps.length}
            </span>
          </div>

          {/* Stepper — fixed */}
          <div className="shrink-0">
            <Stepper steps={steps} currentIndex={currentIndex} />
          </div>

          {/* Page content — the only scrollable region */}
          <div className="flex-1 min-h-0 overflow-y-auto mt-6 pr-1">
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{description}</p>
            )}
            {children}
          </div>

          {/* Actions — fixed */}
          <div className="shrink-0 border-t border-border pt-5 mt-5 space-y-3">
            <div className="flex items-center gap-3">
              {!hideBack && onBack && (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium shrink-0 px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-sm text-muted-foreground hover:text-muted-foreground transition-colors font-medium shrink-0"
                >
                  Skip for now
                </button>
              )}
              {onContinue && (
                <button
                  onClick={onContinue}
                  disabled={continueDisabled}
                  className={cn(
                    "flex-1 h-12 rounded-xl text-white font-semibold text-[15px] inline-flex items-center justify-center gap-2 transition-all",
                    BRAND_GRADIENT,
                    continueDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:shadow-lg hover:shadow-[#E5397E]/25 hover:brightness-105",
                  )}
                >
                  {continueLabel}
                  {continueLabel === "Finish" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5" />
              Your data is secure and private
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ steps, currentIndex }: { steps: WizardStep[]; currentIndex: number }) {
  return (
    <div className="mt-6 flex items-start">
      {steps.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const isLast = i === steps.length - 1;
        return (
          <div
            key={s.key}
            className="relative flex flex-col items-center gap-1.5 flex-1 min-w-0"
          >
            {/* Connector — runs from this circle's center to the next circle's center, behind the circles */}
            {!isLast && (
              <div
                className={cn(
                  "absolute top-4 left-1/2 w-full h-[2px] -translate-y-1/2 rounded-full transition-colors",
                  i < currentIndex ? "bg-[#E5397E]" : "bg-muted",
                )}
              />
            )}
            <div
              className={cn(
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 transition-all",
                active &&
                  "text-white bg-gradient-to-br from-[#FF7A00] to-[#E5397E] shadow-md shadow-[#E5397E]/30",
                done && "text-white bg-gradient-to-br from-[#FF7A00] to-[#E5397E]",
                !active && !done && "text-muted-foreground bg-white border-2 border-border",
              )}
            >
              {done ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-[10px] leading-tight text-center px-0.5",
                active ? "text-foreground font-semibold" : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MarketingPanel({ aside, panelBg }: { aside?: React.ReactNode; panelBg?: string }) {
  return (
    <div className={cn("hidden lg:flex flex-col px-8 py-6 rounded-[1.5rem] min-h-0 overflow-hidden", panelBg)}>
      {/* Brand — shown on every step */}
      <div className="flex items-center gap-3 shrink-0">
        <EngageXLogo size={44} />
        <div>
          <p className="text-lg font-bold text-foreground leading-tight">{BRAND.name}</p>
          <p className="text-xs font-medium leading-tight bg-gradient-to-r from-[#FF7A00] via-[#E5397E] to-[#5B5BEF] bg-clip-text text-transparent">
            {BRAND.tagline}
          </p>
        </div>
      </div>
      {aside ?? <MarketingContent />}
    </div>
  );
}

function MarketingContent() {
  return (
    <>
      {/* Centered content group — vertically centered in the space below the logo */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Hero image — centered backdrop; the text overlaps its transparent lower glow */}
        <div className="flex items-center justify-center pt-2 -mb-2">
          <img
            src="/images/ftu-image.png"
            alt="Recognize and reward your team"
            className="w-[500px] max-w-none object-contain"
            draggable={false}
          />
        </div>

        {/* Headline — pulled up over the image's lower glow so it reads close to the photo */}
        <div className="relative z-10 -mt-16 text-center">
          <h2 className="text-[28px] font-semibold leading-tight">
            <span className="bg-gradient-to-r from-[#FF7A00] to-[#FF9E2C] bg-clip-text text-transparent">
              Recognize.
            </span>{" "}
            <span className="bg-gradient-to-r from-[#E5397E] to-[#C026D3] bg-clip-text text-transparent">
              Reward.
            </span>{" "}
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#5B5BEF] bg-clip-text text-transparent">
              Inspire.
            </span>
          </h2>
          <p className="text-base font-semibold text-foreground mt-2">
            Let's set up your workspace
          </p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-sm mx-auto">
            A few quick steps to personalize your appreciation experience and get your team started.
          </p>
        </div>

        {/* Feature highlights — matches the step 2 style */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {MARKETING_FEATURES.map(({ icon: Icon, tint, label }) => (
            <div key={label} className="text-center">
              <div className={cn("w-11 h-11 rounded-full flex items-center justify-center mx-auto", tint)}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-foreground mt-2 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export const ONBOARDING_STEPS: WizardStep[] = [
  { key: "welcome", label: "Welcome", href: "/onboarding/welcome" },
  { key: "company", label: "Company", href: "/onboarding/company" },
  { key: "admins", label: "HR admins", href: "/onboarding/admins" },
  { key: "integrations", label: "Integrations", href: "/onboarding/integrations", optional: true },
  { key: "recognition", label: "Recognition", href: "/onboarding/recognition" },
  { key: "review", label: "Review", href: "/onboarding/review" },
];
