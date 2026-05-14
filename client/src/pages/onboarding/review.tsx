import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Plug, Star, CheckCircle2 } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import { getAccount, updateAccount, findInviteByAccountId, updateInvite } from "@/lib/account";
import { BRAND } from "@/lib/brand";

export default function OnboardingReview() {
  const navigate = useNavigate();
  const account = getAccount();

  if (!account) return null;

  const connectedIntegrations = Object.entries(account.integrations)
    .filter(([k, v]) => k !== "ssoProvider" && v === "connected")
    .map(([k]) => k);

  function handleFinish() {
    if (!account) return;
    const completedAt = new Date().toISOString();
    updateAccount({ setupCompleted: true });
    // Also mirror the completion onto the invite record so the super admin
    // dashboard can show this company as fully Active.
    const invite = findInviteByAccountId(account.accountId);
    if (invite) {
      updateInvite(invite.token, {
        setupCompleted: true,
        setupCompletedAt: completedAt,
      });
    }
    navigate("/");
  }

  function jumpTo(step: string) {
    navigate(`/onboarding/${step}`);
  }

  return (
    <WizardLayout
      steps={ONBOARDING_STEPS}
      currentKey="review"
      title="You're all set"
      description="Quick review of what you've configured. Click any section to make changes, or finish to head to your dashboard."
      onBack={() => navigate("/onboarding/recognition")}
      onContinue={handleFinish}
      continueLabel="Finish"
    >
      <div className="space-y-3">
        <Card className="border border-stone-200 cursor-pointer hover:border-stone-300 transition-colors" onClick={() => jumpTo("company")}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-stone-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-stone-900">Company</p>
                <span className="text-xs text-stone-500 hover:text-stone-900">Edit</span>
              </div>
              <p className="text-sm text-stone-700 mt-0.5">{account.companyName || "Not set"}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500">
                {account.phone && <span>{account.phone}</span>}
                {account.address && <span className="truncate max-w-xs">{account.address.split("\n")[0]}</span>}
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full border border-stone-200"
                    style={{ backgroundColor: account.brandColor }}
                  />
                  {account.brandColor.toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 cursor-pointer hover:border-stone-300 transition-colors" onClick={() => jumpTo("admins")}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-stone-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-stone-900">HR admins</p>
                <span className="text-xs text-stone-500 hover:text-stone-900">Edit</span>
              </div>
              <p className="text-sm text-stone-700 mt-0.5">
                {account.hrAdmins.length === 0
                  ? "None added — you're the only admin"
                  : `${account.hrAdmins.length} HR admin${account.hrAdmins.length > 1 ? "s" : ""} will be invited`}
              </p>
              {account.hrAdmins.length > 0 && (
                <p className="text-xs text-stone-500 mt-1 truncate">
                  {account.hrAdmins.map((a) => a.email).join(", ")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 cursor-pointer hover:border-stone-300 transition-colors" onClick={() => jumpTo("integrations")}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Plug className="w-4 h-4 text-stone-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-stone-900">Integrations</p>
                <span className="text-xs text-stone-500 hover:text-stone-900">Edit</span>
              </div>
              <p className="text-sm text-stone-700 mt-0.5">
                {connectedIntegrations.length === 0
                  ? "None connected"
                  : `${connectedIntegrations.length} connector${connectedIntegrations.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200 cursor-pointer hover:border-stone-300 transition-colors" onClick={() => jumpTo("recognition")}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-stone-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-stone-900">Recognition</p>
                <span className="text-xs text-stone-500 hover:text-stone-900">Edit</span>
              </div>
              <p className="text-sm text-stone-700 mt-0.5">
                {account.recognitionCategories.length} categories ·{" "}
                {account.pointsPolicy.requireManagerApproval ? "Manager approval on" : "Auto-approve"}
                {account.products.rnr && ` · ${account.pointsPolicy.startingBudget.toLocaleString()} pts budget`}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {account.recognitionCategories.map((cat) => {
                  const colorMap: Record<string, string> = {
                    blue: "bg-blue-100 text-blue-800",
                    amber: "bg-amber-100 text-amber-800",
                    stone: "bg-stone-100 text-stone-700",
                    purple: "bg-purple-100 text-purple-800",
                    rose: "bg-rose-100 text-rose-800",
                    green: "bg-green-100 text-green-800",
                    sky: "bg-sky-100 text-sky-800",
                    teal: "bg-teal-100 text-teal-800",
                  };
                  const cls = colorMap[cat.color] ?? colorMap.stone;
                  return (
                    <Badge key={cat.id} variant="secondary" className={`${cls} text-xs gap-1 py-0.5`}>
                      <span>{cat.emoji}</span> {cat.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
            <div className="text-sm text-green-900">
              <p className="font-medium">Ready to go</p>
              <p className="text-xs text-green-800 mt-0.5">
                Clicking Finish will activate your {BRAND.name} portal and send invites to your HR admins.
              </p>
              <div className="flex gap-1.5 mt-2">
                <Badge className="bg-white text-green-700 border border-green-200 hover:bg-white">
                  Appreciation
                </Badge>
                {account.products.rnr && (
                  <Badge className="bg-white text-green-700 border border-green-200 hover:bg-white">
                    Rewards & Recognition
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}
