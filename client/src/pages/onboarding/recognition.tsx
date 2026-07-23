import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Wallet, Bell, Star, BadgeCheck, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import { getAccount, updateAccount, DEFAULT_CATEGORIES } from "@/lib/account";
import type { RecognitionCategory } from "@/lib/account";
import { CategoryEditor } from "@/components/recognition/category-editor";

/** Left-panel feature highlights for the recognition step. */
const RECOGNITION_HIGHLIGHTS: { icon: LucideIcon; tint: string; title: string; desc: string }[] = [
  {
    icon: Star,
    tint: "bg-[#FDE7D6] text-[#F97316]",
    title: "Define your values",
    desc: "Categories that reflect your culture.",
  },
  {
    icon: BadgeCheck,
    tint: "bg-[#EDE9FB] text-[#7C3AED]",
    title: "Stay in control",
    desc: "Optional approval workflow.",
  },
  {
    icon: Trophy,
    tint: "bg-[#FDE7D6] text-[#F97316]",
    title: "Celebrate wins",
    desc: "Recognize great work instantly.",
  },
];

export default function OnboardingRecognition() {
  const navigate = useNavigate();
  const account = getAccount();

  const [categories, setCategories] = useState<RecognitionCategory[]>(
    account?.recognitionCategories?.length ? account.recognitionCategories : DEFAULT_CATEGORIES,
  );
  const [requireApproval, setRequireApproval] = useState(account?.pointsPolicy.requireManagerApproval ?? true);
  const [startingBudget, setStartingBudget] = useState(account?.pointsPolicy.startingBudget ?? 50000);
  const [expiryMonths, setExpiryMonths] = useState(account?.pointsPolicy.expiryMonths ?? 12);
  const [maxPerRecognition, setMaxPerRecognition] = useState(account?.pointsPolicy.maxPerRecognition ?? 500);
  const [weeklyDigest, setWeeklyDigest] = useState(account?.notifications.weeklyDigest ?? true);
  const [budgetAlerts, setBudgetAlerts] = useState(account?.notifications.budgetAlerts ?? true);
  const [recognitionEmails, setRecognitionEmails] = useState(account?.notifications.recognitionEmails ?? true);

  if (!account) return null;

  const rnrEnabled = account.products.rnr;

  const hasMinCategories = categories.length >= 3;
  const allNamed = categories.every((c) => c.name.trim().length > 0);

  function handleContinue() {
    updateAccount({
      recognitionCategories: categories,
      pointsPolicy: {
        startingBudget,
        expiryMonths,
        maxPerRecognition,
        requireManagerApproval: requireApproval,
      },
      notifications: {
        weeklyDigest,
        budgetAlerts,
        recognitionEmails,
      },
    });
    navigate("/onboarding/review");
  }

  return (
    <WizardLayout
      steps={ONBOARDING_STEPS}
      currentKey="recognition"
      title="Set up recognitions"
      onBack={() => navigate("/onboarding/integrations")}
      onContinue={handleContinue}
      continueDisabled={!hasMinCategories || !allNamed}
      panelBg="bg-gradient-to-br from-[#FDF2E9] via-[#FDF1E8] to-[#F7EEF3]"
      aside={
        <div className="flex-1 flex flex-col justify-center">
          {/* Full-bleed illustration */}
          <div className="-mx-8">
            <img
              src="/images/ftu-recognition.png"
              alt="Set up recognitions"
              className="w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Heading + description, centered */}
          <div className="-mt-2 text-center">
            <h2 className="text-[1.5rem] font-bold text-foreground leading-[1.2] whitespace-nowrap">
              Set up recognitions
            </h2>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed max-w-md mx-auto">
              Define the values your team celebrates
              <br />
              and how recognitions get approved.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            {RECOGNITION_HIGHLIGHTS.map(({ icon: Icon, tint, title, desc }) => (
              <div key={title} className="text-center">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center mx-auto ${tint}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-foreground mt-2">{title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <Card className="border border-border">
          <CardContent className="p-5">
            <CategoryEditor categories={categories} onChange={setCategories} />
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Require manager approval</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Peer-to-peer recognitions need manager sign-off before they're published.
                </p>
              </div>
              <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
            </div>
          </CardContent>
        </Card>

        {rnrEnabled && (
          <Card className="border border-border">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Points & budget (Rewards & Recognition)</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Starting org budget</Label>
                  <Input
                    type="number"
                    value={startingBudget}
                    onChange={(e) => setStartingBudget(Number(e.target.value))}
                    className="h-9 text-sm border-border"
                  />
                  <p className="text-xs text-muted-foreground">points / fiscal year</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Points expire after</Label>
                  <Input
                    type="number"
                    value={expiryMonths}
                    onChange={(e) => setExpiryMonths(Number(e.target.value))}
                    className="h-9 text-sm border-border"
                  />
                  <p className="text-xs text-muted-foreground">months</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Max per recognition</Label>
                  <Input
                    type="number"
                    value={maxPerRecognition}
                    onChange={(e) => setMaxPerRecognition(Number(e.target.value))}
                    className="h-9 text-sm border-border"
                  />
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border border-border">
          <CardContent className="p-5 space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Notification defaults</p>
            </div>
            {[
              {
                label: "Recognition emails",
                desc: "Email employees when they receive a recognition.",
                checked: recognitionEmails,
                set: setRecognitionEmails,
              },
              {
                label: "Weekly admin digest",
                desc: "Summary of recognition activity sent to admins every Monday.",
                checked: weeklyDigest,
                set: setWeeklyDigest,
              },
              {
                label: "Budget alerts",
                desc: "Warn admins when a program reaches 80% of its budget.",
                checked: budgetAlerts,
                set: setBudgetAlerts,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-foreground">{row.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.desc}</p>
                </div>
                <Switch checked={row.checked} onCheckedChange={row.set} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}
