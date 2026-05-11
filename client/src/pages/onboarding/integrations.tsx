import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Cloud, Users, KeyRound, MessageSquare } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import { getAccount, updateAccount, type Integrations } from "@/lib/account";

type Connector = {
  key: keyof Omit<Integrations, "ssoProvider">;
  name: string;
  description: string;
  category: "directory" | "hrms" | "comms";
};

const CONNECTORS: Connector[] = [
  {
    key: "activeDirectory",
    name: "Active Directory",
    description: "Sync users and groups from on-prem AD via LDAP/SCIM.",
    category: "directory",
  },
  {
    key: "azureAd",
    name: "Azure AD / Entra ID",
    description: "Provision users and SSO from Microsoft Entra.",
    category: "directory",
  },
  {
    key: "okta",
    name: "Okta",
    description: "SCIM provisioning and SSO via Okta.",
    category: "directory",
  },
  {
    key: "googleWorkspace",
    name: "Google Workspace",
    description: "Sync your directory and enable Google sign-in.",
    category: "directory",
  },
  {
    key: "workday",
    name: "Workday",
    description: "Pull employee records, org structure, and lifecycle events.",
    category: "hrms",
  },
  {
    key: "bambooHr",
    name: "BambooHR",
    description: "Sync employees, departments, and start dates.",
    category: "hrms",
  },
  {
    key: "adp",
    name: "ADP",
    description: "Import payroll and employee records.",
    category: "hrms",
  },
  {
    key: "slack",
    name: "Slack",
    description: "Post recognition shout-outs to a channel automatically.",
    category: "comms",
  },
  {
    key: "msTeams",
    name: "Microsoft Teams",
    description: "Send recognition notifications inside Teams.",
    category: "comms",
  },
];

const CATEGORIES = [
  { key: "directory", label: "Directory & SSO", icon: KeyRound, description: "Authenticate and provision users" },
  { key: "hrms", label: "HRMS / Payroll", icon: Users, description: "Sync employee data and org structure" },
  { key: "comms", label: "Communication", icon: MessageSquare, description: "Post recognitions to your team chat" },
] as const;

export default function OnboardingIntegrations() {
  const navigate = useNavigate();
  const account = getAccount();

  const [integrations, setIntegrations] = useState<Integrations>(
    account?.integrations ?? {
      activeDirectory: "disconnected",
      azureAd: "disconnected",
      okta: "disconnected",
      googleWorkspace: "disconnected",
      workday: "disconnected",
      bambooHr: "disconnected",
      adp: "disconnected",
      slack: "disconnected",
      msTeams: "disconnected",
      ssoProvider: "none",
    },
  );

  if (!account) return null;

  function toggle(key: Connector["key"]) {
    setIntegrations({
      ...integrations,
      [key]: integrations[key] === "connected" ? "disconnected" : "connected",
    });
  }

  function handleNext() {
    updateAccount({ integrations });
    navigate("/onboarding/recognition");
  }

  const connectedCount = CONNECTORS.filter((c) => integrations[c.key] === "connected").length;

  return (
    <WizardLayout
      steps={ONBOARDING_STEPS}
      currentKey="integrations"
      title="Connect your tools"
      description="Optional. Connect a directory to provision employees automatically, or hook up Slack/Teams to amplify recognitions."
      onBack={() => navigate("/onboarding/admins")}
      onContinue={handleNext}
      onSkip={connectedCount === 0 ? handleNext : undefined}
      continueLabel={connectedCount === 0 ? "Continue" : `Continue with ${connectedCount} connected`}
    >
      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const items = CONNECTORS.filter((c) => c.category === cat.key);
          return (
            <div key={cat.key} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-stone-700" />
                <p className="text-sm font-semibold text-stone-900">{cat.label}</p>
                <span className="text-xs text-stone-500">— {cat.description}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {items.map((c) => {
                  const connected = integrations[c.key] === "connected";
                  return (
                    <Card key={c.key} className="border border-stone-200">
                      <CardContent className="p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 font-bold text-sm shrink-0">
                            {c.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-stone-900 truncate">{c.name}</p>
                              {connected && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                                  Connected
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{c.description}</p>
                            <Button
                              size="sm"
                              variant={connected ? "outline" : "ghost"}
                              onClick={() => toggle(c.key)}
                              className={`mt-2 h-7 text-xs ${
                                connected
                                  ? "border-stone-200 text-stone-700"
                                  : "text-stone-700 hover:bg-stone-100"
                              }`}
                            >
                              {connected ? "Disconnect" : "Connect"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        <Card className="border border-stone-200 bg-stone-50">
          <CardContent className="p-4 flex items-start gap-3">
            <Cloud className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-600">
              <p className="font-medium text-stone-900">SCIM endpoint</p>
              <p className="mt-0.5">
                For automated user provisioning, your SCIM token will be available in Settings → Integrations after setup is complete.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}
