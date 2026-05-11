import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
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
  children: React.ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  onSkip?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  hideBack?: boolean;
};

export function WizardLayout({
  steps,
  currentKey,
  title,
  description,
  children,
  onBack,
  onContinue,
  onSkip,
  continueLabel = "Continue",
  continueDisabled = false,
  hideBack = false,
}: Props) {
  const currentIndex = steps.findIndex((s) => s.key === currentKey);
  const currentStep = steps[currentIndex];

  return (
    <div className="min-h-screen w-full bg-stone-50 grain-texture flex flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EngageXLogo size={32} />
            <div>
              <p className="text-sm font-semibold text-stone-900 leading-tight">{BRAND.name}</p>
              <p className="text-xs text-stone-500 leading-tight">First-time setup</p>
            </div>
          </div>
          <p className="text-xs text-stone-500">
            Step {currentIndex + 1} of {steps.length}
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-6 pb-4">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => {
              const done = i < currentIndex;
              const active = i === currentIndex;
              return (
                <div key={s.key} className="flex-1 flex items-center gap-1">
                  <div
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      done ? "bg-stone-900" : active ? "bg-stone-700" : "bg-stone-200",
                    )}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <p className="text-stone-600 font-medium">{currentStep?.label}</p>
            {currentStep?.optional && (
              <span className="text-stone-400">Optional</span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-stone-900 mb-1.5">{title}</h1>
            {description && (
              <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
            )}
          </div>
          {children}
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            {!hideBack && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-stone-600 hover:text-stone-900 gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onSkip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-stone-500 hover:text-stone-900"
              >
                Skip for now
              </Button>
            )}
            {onContinue && (
              <Button
                size="sm"
                onClick={onContinue}
                disabled={continueDisabled}
                className="bg-stone-900 hover:bg-stone-700 text-white gap-1"
              >
                {continueLabel}
                {continueLabel === "Finish" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export const ONBOARDING_STEPS: WizardStep[] = [
  { key: "welcome", label: "Welcome", href: "/onboarding/welcome" },
  { key: "company", label: "Company profile", href: "/onboarding/company" },
  { key: "admins", label: "HR admins", href: "/onboarding/admins" },
  { key: "integrations", label: "Integrations", href: "/onboarding/integrations", optional: true },
  { key: "recognition", label: "Recognition", href: "/onboarding/recognition" },
  { key: "review", label: "Review", href: "/onboarding/review" },
];
