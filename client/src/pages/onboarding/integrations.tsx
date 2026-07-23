import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Cloud, Users, KeyRound, MessageSquare, RefreshCw, Plus, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import {
  getAccount,
  updateAccount,
  type Integrations,
  type CustomIntegration,
  type IntegrationCategory,
} from "@/lib/account";

/** Left-panel feature highlights for the integrations step. */
const INTEGRATION_HIGHLIGHTS: { icon: LucideIcon; tint: string; title: string; desc: string }[] = [
  {
    icon: KeyRound,
    tint: "bg-[#FDE7D6] text-[#F97316]",
    title: "Single sign-on",
    desc: "Let people sign in with your IdP.",
  },
  {
    icon: RefreshCw,
    tint: "bg-[#EDE9FB] text-[#7C3AED]",
    title: "Auto-provision",
    desc: "Sync employees & org structure.",
  },
  {
    icon: MessageSquare,
    tint: "bg-[#FDE7D6] text-[#F97316]",
    title: "Amplify wins",
    desc: "Post recognitions to Slack/Teams.",
  },
];

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

  const [customIntegrations, setCustomIntegrations] = useState<CustomIntegration[]>(
    account?.customIntegrations ?? [],
  );
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<IntegrationCategory>("directory");

  if (!account) return null;

  // Directory & SSO and HRMS/Payroll allow only one active connection each;
  // Communication may have several at once.
  function isSingle(category: IntegrationCategory) {
    return category !== "comms";
  }

  /** Disconnect every built-in + custom connector in a category (used before a single-select connect). */
  function clearCategory(
    category: IntegrationCategory,
    base: Integrations,
    custom: CustomIntegration[],
  ): { nextIntegrations: Integrations; nextCustom: CustomIntegration[] } {
    const nextIntegrations = { ...base };
    CONNECTORS.forEach((c) => {
      if (c.category === category) nextIntegrations[c.key] = "disconnected";
    });
    const nextCustom = custom.map((c) =>
      c.category === category ? { ...c, status: "disconnected" as const } : c,
    );
    return { nextIntegrations, nextCustom };
  }

  function toggle(key: Connector["key"]) {
    const conn = CONNECTORS.find((c) => c.key === key)!;
    if (integrations[key] === "connected") {
      setIntegrations({ ...integrations, [key]: "disconnected" });
      return;
    }
    if (isSingle(conn.category)) {
      const { nextIntegrations, nextCustom } = clearCategory(conn.category, integrations, customIntegrations);
      nextIntegrations[key] = "connected";
      setIntegrations(nextIntegrations);
      setCustomIntegrations(nextCustom);
    } else {
      setIntegrations({ ...integrations, [key]: "connected" });
    }
  }

  function addCustom() {
    const name = newName.trim();
    if (!name) return;
    const entry: CustomIntegration = {
      id: Math.random().toString(36).slice(2, 10),
      name,
      category: newCategory,
      status: "connected",
    };
    if (isSingle(newCategory)) {
      const { nextIntegrations, nextCustom } = clearCategory(newCategory, integrations, customIntegrations);
      setIntegrations(nextIntegrations);
      setCustomIntegrations([...nextCustom, entry]);
    } else {
      setCustomIntegrations([...customIntegrations, entry]);
    }
    setNewName("");
    setNewCategory("directory");
    setAdding(false);
  }

  function toggleCustom(id: string) {
    const target = customIntegrations.find((c) => c.id === id)!;
    if (target.status === "connected") {
      setCustomIntegrations(
        customIntegrations.map((c) => (c.id === id ? { ...c, status: "disconnected" } : c)),
      );
      return;
    }
    if (isSingle(target.category)) {
      const { nextIntegrations, nextCustom } = clearCategory(target.category, integrations, customIntegrations);
      setIntegrations(nextIntegrations);
      setCustomIntegrations(
        nextCustom.map((c) => (c.id === id ? { ...c, status: "connected" } : c)),
      );
    } else {
      setCustomIntegrations(
        customIntegrations.map((c) => (c.id === id ? { ...c, status: "connected" } : c)),
      );
    }
  }

  function removeCustom(id: string) {
    setCustomIntegrations(customIntegrations.filter((c) => c.id !== id));
  }

  function handleNext() {
    updateAccount({ integrations, customIntegrations });
    navigate("/onboarding/recognition");
  }

  const connectedCount =
    CONNECTORS.filter((c) => integrations[c.key] === "connected").length +
    customIntegrations.filter((c) => c.status === "connected").length;

  return (
    <WizardLayout
      steps={ONBOARDING_STEPS}
      currentKey="integrations"
      title="Connect your tools"
      onBack={() => navigate("/onboarding/admins")}
      onContinue={handleNext}
      onSkip={connectedCount === 0 ? handleNext : undefined}
      continueLabel={connectedCount === 0 ? "Next" : `Continue with ${connectedCount} connected`}
      panelBg="bg-gradient-to-br from-[#FDF2E9] via-[#FDF1E8] to-[#F7EEF3]"
      aside={
        <div className="flex-1 flex flex-col justify-center">
          {/* Full-bleed illustration */}
          <div className="-mx-8">
            <img
              src="/images/ftu-integrations.png"
              alt="Connect your tools"
              className="w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Heading + description, centered */}
          <div className="-mt-2 text-center">
            <h2 className="text-[1.5rem] font-bold text-foreground leading-[1.2] whitespace-nowrap">
              Connect your tools
            </h2>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed max-w-md mx-auto">
              Provision employees automatically and amplify
              <br />
              recognitions across the tools you already use.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            {INTEGRATION_HIGHLIGHTS.map(({ icon: Icon, tint, title, desc }) => (
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
      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const items = CONNECTORS.filter((c) => c.category === cat.key);
          const customItems = customIntegrations.filter((c) => c.category === cat.key);
          return (
            <div key={cat.key} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                <span className="text-xs text-muted-foreground truncate">— {cat.description}</span>
                <span
                  className={`ml-auto shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    isSingle(cat.key)
                      ? "bg-primary/10 text-primary"
                      : "bg-success/10 text-success"
                  }`}
                >
                  {isSingle(cat.key) ? "One connection" : "Multiple allowed"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {items.map((c) => {
                  const connected = integrations[c.key] === "connected";
                  return (
                    <Card key={c.key} className="border border-border">
                      <CardContent className="p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
                            {c.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                              {connected && (
                                <Badge className="bg-success/15 text-success hover:bg-success/15 text-xs">
                                  Connected
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.description}</p>
                            <Button
                              size="sm"
                              variant={connected ? "outline" : "ghost"}
                              onClick={() => toggle(c.key)}
                              className={`mt-2 h-7 text-xs ${
                                connected
                                  ? "border-border text-muted-foreground"
                                  : "text-muted-foreground hover:bg-muted"
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

                {customItems.map((c) => {
                  const connected = c.status === "connected";
                  return (
                    <Card key={c.id} className="border border-border">
                      <CardContent className="p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF7A00] to-[#E5397E] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {c.name[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                              <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                                Custom
                              </Badge>
                              {connected && (
                                <Badge className="bg-success/15 text-success hover:bg-success/15 text-xs">
                                  Connected
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              Custom {cat.label.toLowerCase()} integration.
                            </p>
                            <div className="mt-2 flex items-center gap-1">
                              <Button
                                size="sm"
                                variant={connected ? "outline" : "ghost"}
                                onClick={() => toggleCustom(c.id)}
                                className={`h-7 text-xs ${
                                  connected
                                    ? "border-border text-muted-foreground"
                                    : "text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                {connected ? "Disconnect" : "Connect"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeCustom(c.id)}
                                className="h-7 text-xs text-muted-foreground hover:text-destructive px-2"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
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

        {/* Add a custom integration */}
        {adding ? (
          <Card className="border border-border">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Add a custom integration</p>
              <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_auto] gap-2.5">
                <Input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Integration name"
                  className="h-9 text-sm border-border"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as IntegrationCategory)}
                  className="h-9 rounded-md border border-border bg-white px-2.5 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-stone-200"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={addCustom}
                  disabled={!newName.trim()}
                  className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Add
                </Button>
              </div>
              <button
                onClick={() => {
                  setAdding(false);
                  setNewName("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </CardContent>
          </Card>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-xl border-2 border-dashed border-border p-4 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:border-border hover:bg-muted transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add another integration
          </button>
        )}

        <Card className="border border-border bg-muted">
          <CardContent className="p-4 flex items-start gap-3">
            <Cloud className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground">SCIM endpoint</p>
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
