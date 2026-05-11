import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Wallet, Bell } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import { getAccount, updateAccount, DEFAULT_CATEGORIES } from "@/lib/account";

export default function OnboardingRecognition() {
  const navigate = useNavigate();
  const account = getAccount();

  const [categories, setCategories] = useState<string[]>(
    account?.recognitionCategories?.length ? account.recognitionCategories : DEFAULT_CATEGORIES,
  );
  const [newCategory, setNewCategory] = useState("");
  const [requireApproval, setRequireApproval] = useState(account?.pointsPolicy.requireManagerApproval ?? true);
  const [startingBudget, setStartingBudget] = useState(account?.pointsPolicy.startingBudget ?? 50000);
  const [expiryMonths, setExpiryMonths] = useState(account?.pointsPolicy.expiryMonths ?? 12);
  const [maxPerRecognition, setMaxPerRecognition] = useState(account?.pointsPolicy.maxPerRecognition ?? 500);
  const [weeklyDigest, setWeeklyDigest] = useState(account?.notifications.weeklyDigest ?? true);
  const [budgetAlerts, setBudgetAlerts] = useState(account?.notifications.budgetAlerts ?? true);
  const [recognitionEmails, setRecognitionEmails] = useState(account?.notifications.recognitionEmails ?? true);

  if (!account) return null;

  const rnrEnabled = account.products.rnr;

  function addCategory() {
    const v = newCategory.trim();
    if (!v) return;
    if (categories.some((c) => c.toLowerCase() === v.toLowerCase())) return;
    setCategories([...categories, v]);
    setNewCategory("");
  }

  function removeCategory(c: string) {
    setCategories(categories.filter((x) => x !== c));
  }

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
      description="Define your company values and approval workflow. You can fine-tune all of this in Settings later."
      onBack={() => navigate("/onboarding/integrations")}
      onContinue={handleContinue}
      continueDisabled={categories.length === 0}
    >
      <div className="space-y-4">
        <Card className="border border-stone-200">
          <CardContent className="p-5 space-y-3">
            <div>
              <p className="text-sm font-semibold text-stone-900">Recognition categories</p>
              <p className="text-xs text-stone-500 mt-0.5">
                Tags employees pick when sending recognitions. Map these to your company values.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="bg-stone-100 text-stone-700 hover:bg-stone-100 pr-1 gap-1.5 py-1"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => removeCategory(c)}
                    className="rounded-full p-0.5 hover:bg-stone-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                placeholder="Add a category (e.g. Excellence)"
                className="h-9 text-sm border-stone-200"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCategory}
                className="h-9 border-stone-200 gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200">
              <div>
                <p className="text-sm font-medium text-stone-900">Require manager approval</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Peer-to-peer recognitions need manager sign-off before they're published.
                </p>
              </div>
              <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
            </div>
          </CardContent>
        </Card>

        {rnrEnabled && (
          <Card className="border border-stone-200">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-stone-700" />
                <p className="text-sm font-semibold text-stone-900">Points & budget (Rewards & Recognition)</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Starting org budget</Label>
                  <Input
                    type="number"
                    value={startingBudget}
                    onChange={(e) => setStartingBudget(Number(e.target.value))}
                    className="h-9 text-sm border-stone-200"
                  />
                  <p className="text-xs text-stone-500">points / fiscal year</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Points expire after</Label>
                  <Input
                    type="number"
                    value={expiryMonths}
                    onChange={(e) => setExpiryMonths(Number(e.target.value))}
                    className="h-9 text-sm border-stone-200"
                  />
                  <p className="text-xs text-stone-500">months</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Max per recognition</Label>
                  <Input
                    type="number"
                    value={maxPerRecognition}
                    onChange={(e) => setMaxPerRecognition(Number(e.target.value))}
                    className="h-9 text-sm border-stone-200"
                  />
                  <p className="text-xs text-stone-500">points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border border-stone-200">
          <CardContent className="p-5 space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-4 h-4 text-stone-700" />
              <p className="text-sm font-semibold text-stone-900">Notification defaults</p>
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
                className="flex items-start justify-between p-3 rounded-lg border border-stone-100"
              >
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-stone-900">{row.label}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{row.desc}</p>
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
