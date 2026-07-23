import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Plug, Star, CheckCircle2, ListChecks, PencilLine, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import { getAccount, updateAccount, findInviteByAccountId, updateInvite } from "@/lib/account";
import { BRAND } from "@/lib/brand";

/** Left-panel feature highlights for the review step. */
const REVIEW_HIGHLIGHTS: { icon: LucideIcon; tint: string; title: string; desc: string }[] = [
  {
    icon: ListChecks,
    tint: "bg-[#FDE7D6] text-[#F97316]",
    title: "Everything in place",
    desc: "A quick recap of your setup.",
  },
  {
    icon: PencilLine,
    tint: "bg-[#EDE9FB] text-[#7C3AED]",
    title: "Edit anytime",
    desc: "Jump back to any step to tweak.",
  },
  {
    icon: Rocket,
    tint: "bg-[#FDE7D6] text-[#F97316]",
    title: "Go live",
    desc: "Finish and open your dashboard.",
  },
];

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
      onBack={() => navigate("/onboarding/recognition")}
      onContinue={handleFinish}
      continueLabel="Finish"
      panelBg="bg-gradient-to-br from-[#FDF2E9] via-[#FDF1E8] to-[#F7EEF3]"
      aside={
        <div className="flex-1 flex flex-col justify-center">
          {/* Full-bleed illustration */}
          <div className="-mx-8">
            <img
              src="/images/ftu-review.png"
              alt="You're all set"
              className="w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Heading + description, centered */}
          <div className="-mt-2 text-center">
            <h2 className="text-[1.5rem] font-bold text-foreground leading-[1.2] whitespace-nowrap">
              You&apos;re all set
            </h2>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed max-w-md mx-auto">
              Review everything you&apos;ve configured,
              <br />
              then launch your workspace.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            {REVIEW_HIGHLIGHTS.map(({ icon: Icon, tint, title, desc }) => (
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
      <div className="space-y-3">
        <Card className="border border-border cursor-pointer hover:border-border transition-colors" onClick={() => jumpTo("company")}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">Company</p>
                <span className="text-xs text-muted-foreground hover:text-foreground">Edit</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{account.companyName || "Not set"}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                {account.phone && <span>{account.phone}</span>}
                {account.address && <span className="truncate max-w-xs">{account.address.split("\n")[0]}</span>}
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full border border-border"
                    style={{ backgroundColor: account.brandColor }}
                  />
                  {account.brandColor.toUpperCase()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border cursor-pointer hover:border-border transition-colors" onClick={() => jumpTo("admins")}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">HR admins</p>
                <span className="text-xs text-muted-foreground hover:text-foreground">Edit</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {account.hrAdmins.length === 0
                  ? "None added — you're the only admin"
                  : `${account.hrAdmins.length} HR admin${account.hrAdmins.length > 1 ? "s" : ""} will be invited`}
              </p>
              {account.hrAdmins.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {account.hrAdmins.map((a) => a.email).join(", ")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border cursor-pointer hover:border-border transition-colors" onClick={() => jumpTo("integrations")}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Plug className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">Integrations</p>
                <span className="text-xs text-muted-foreground hover:text-foreground">Edit</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {connectedIntegrations.length === 0
                  ? "None connected"
                  : `${connectedIntegrations.length} connector${connectedIntegrations.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border cursor-pointer hover:border-border transition-colors" onClick={() => jumpTo("recognition")}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">Recognition</p>
                <span className="text-xs text-muted-foreground hover:text-foreground">Edit</span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {account.recognitionCategories.length} categories ·{" "}
                {account.pointsPolicy.requireManagerApproval ? "Manager approval on" : "Auto-approve"}
                {account.products.rnr && ` · ${account.pointsPolicy.startingBudget.toLocaleString()} pts budget`}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {account.recognitionCategories.map((cat) => {
                  const colorMap: Record<string, string> = {
                    blue: "bg-blue-100 text-blue-800",
                    amber: "bg-amber-100 text-amber-800",
                    stone: "bg-muted text-muted-foreground",
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

        <Card className="border border-success/20 bg-success/10">
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div className="text-sm text-success">
              <p className="font-medium">Ready to go</p>
              <p className="text-xs text-success mt-0.5">
                Clicking Finish will activate your {BRAND.name} portal and send invites to your HR admins.
              </p>
              <div className="flex gap-1.5 mt-2">
                <Badge className="bg-white text-success border border-success/20 hover:bg-white">
                  Appreciation
                </Badge>
                {account.products.rnr && (
                  <Badge className="bg-white text-success border border-success/20 hover:bg-white">
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
