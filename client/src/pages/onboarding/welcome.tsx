import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Star, Trophy, Sparkles, Check } from "lucide-react";
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
      onContinue={() => navigate("/onboarding/company")}
      hideBack
    >
      <div className="space-y-6">
        <div className="rounded-2xl bg-muted p-6">
          <p className="text-xs font-semibold text-[#B4531F] uppercase tracking-wide mb-3">
            Your account
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Account ID</p>
              <p className="font-mono text-foreground mt-0.5">{account.accountId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Admin email</p>
              <p className="text-foreground mt-0.5">{account.adminEmail}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#B4531F] uppercase tracking-wide mb-3">
            Products enabled
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#E5397E] flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Appreciation</p>
                  <p className="text-xs text-muted-foreground">Peer recognitions, kudos, badges & culture</p>
                </div>
              </div>
              <Badge className="bg-success/15 text-success hover:bg-success/15 gap-1">
                Enabled <Check className="w-3 h-3" />
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-border shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    account.products.rnr
                      ? "bg-gradient-to-br from-[#FF7A00] to-[#E5397E]"
                      : "bg-stone-300"
                  }`}
                >
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Rewards & Recognition</p>
                  <p className="text-xs text-muted-foreground">Points, reward catalog, redemptions & budget</p>
                </div>
              </div>
              {account.products.rnr ? (
                <Badge className="bg-success/15 text-success hover:bg-success/15 gap-1">
                  Enabled <Check className="w-3 h-3" />
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">Not enabled</Badge>
              )}
            </div>
          </div>
          {!account.products.rnr && (
            <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Want to add Rewards & Recognition? Reach out to your {BRAND.name} contact to update your agreement.
            </p>
          )}
        </div>
      </div>
    </WizardLayout>
  );
}
