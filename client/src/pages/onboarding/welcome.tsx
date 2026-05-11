import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Sparkles } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import { getAccount } from "@/lib/account";
import { BRAND } from "@/lib/brand";

export default function OnboardingWelcome() {
  const navigate = useNavigate();
  const account = getAccount();

  if (!account) {
    return null;
  }

  const firstName = account.adminName.split(" ")[0] || "there";

  return (
    <WizardLayout
      steps={ONBOARDING_STEPS}
      currentKey="welcome"
      title={`Welcome to ${BRAND.name}, ${firstName}!`}
      description="Let's get your account set up. This takes about 5 minutes — you can revisit any of these later from Settings."
      onContinue={() => navigate("/onboarding/company")}
      hideBack
    >
      <div className="space-y-4">
        <Card className="border border-stone-200">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
              Your account
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-stone-500">Account ID</p>
                <p className="font-mono text-stone-900 mt-0.5">{account.accountId}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Admin email</p>
                <p className="text-stone-900 mt-0.5">{account.adminEmail}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
              Products enabled
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Appreciation</p>
                    <p className="text-xs text-stone-500">Peer recognitions, kudos, badges & culture</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      account.products.rnr ? "bg-stone-900" : "bg-stone-300"
                    }`}
                  >
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">Rewards & Recognition</p>
                    <p className="text-xs text-stone-500">Points, reward catalog, redemptions & budget</p>
                  </div>
                </div>
                {account.products.rnr ? (
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Enabled</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-stone-100 text-stone-500">Not enabled</Badge>
                )}
              </div>
            </div>
            {!account.products.rnr && (
              <p className="text-xs text-stone-500 mt-3 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Want to add Rewards & Recognition? Reach out to your {BRAND.name} contact to update your agreement.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}
