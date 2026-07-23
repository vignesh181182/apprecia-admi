import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Mail, Shield, AlertCircle, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import { getAccount, updateAccount, type HRAdmin } from "@/lib/account";

/** Left-panel feature highlights for the HR admins step. */
const ADMIN_HIGHLIGHTS: { icon: LucideIcon; tint: string; title: string; desc: string }[] = [
  {
    icon: UserPlus,
    tint: "bg-[#FDE7D6] text-[#F97316]",
    title: "Invite your team",
    desc: "Add HR admins in seconds.",
  },
  {
    icon: ShieldCheck,
    tint: "bg-[#EDE9FB] text-[#7C3AED]",
    title: "Scoped permissions",
    desc: "Full access, minus admin control.",
  },
  {
    icon: Mail,
    tint: "bg-[#FDE7D6] text-[#F97316]",
    title: "Instant invites",
    desc: "Sent when you finish setup.",
  },
];

export default function OnboardingAdmins() {
  const navigate = useNavigate();
  const account = getAccount();

  const [admins, setAdmins] = useState<HRAdmin[]>(account?.hrAdmins ?? []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  if (!account) return null;

  function addAdmin() {
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Both name and email are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (email.toLowerCase() === account!.adminEmail.toLowerCase()) {
      setError("This is the primary admin email — no need to add it again.");
      return;
    }
    if (admins.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      setError("This email is already added.");
      return;
    }
    setAdmins([
      ...admins,
      {
        id: Math.random().toString(36).slice(2, 10),
        name: name.trim(),
        email: email.trim(),
        invitedAt: new Date().toISOString(),
      },
    ]);
    setName("");
    setEmail("");
  }

  function removeAdmin(id: string) {
    setAdmins(admins.filter((a) => a.id !== id));
  }

  function handleContinue() {
    updateAccount({ hrAdmins: admins });
    navigate("/onboarding/integrations");
  }

  function handleSkip() {
    updateAccount({ hrAdmins: admins });
    navigate("/onboarding/integrations");
  }

  return (
    <WizardLayout
      steps={ONBOARDING_STEPS}
      currentKey="admins"
      title="Add your HR admins"
      onBack={() => navigate("/onboarding/company")}
      onContinue={handleContinue}
      onSkip={admins.length === 0 ? handleSkip : undefined}
      continueLabel={admins.length === 0 ? "Next" : `Continue with ${admins.length} admin${admins.length > 1 ? "s" : ""}`}
      panelBg="bg-gradient-to-br from-[#FDF2E9] via-[#FDF1E8] to-[#F7EEF3]"
      aside={
        <div className="flex-1 flex flex-col justify-center">
          {/* Full-bleed illustration */}
          <div className="-mx-8">
            <img
              src="/images/ftu-admin.png"
              alt="Add your HR admins"
              className="w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Heading + description, centered */}
          <div className="-mt-2 text-center">
            <h2 className="text-[1.5rem] font-bold text-foreground leading-[1.2] whitespace-nowrap">
              Add your HR admins
            </h2>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed max-w-md mx-auto">
              Invite teammates to help manage recognition,
              <br />
              rewards, and people across the platform.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            {ADMIN_HIGHLIGHTS.map(({ icon: Icon, tint, title, desc }) => (
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
        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/15">
          <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-primary">
            <p className="font-medium">HR Admin permissions</p>
            <p className="text-primary mt-0.5">
              Full access to programs, recognitions, employees, rewards, analytics, and settings.
              <span className="font-medium"> They cannot add or remove other admins</span> — only you can.
            </p>
          </div>
        </div>

        <Card className="border border-border">
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Full name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="h-9 text-sm border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="h-9 text-sm border-border"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAdmin())}
                />
              </div>
              <div className="flex items-end">
                <Button
                  size="sm"
                  onClick={addAdmin}
                  className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">
                Invitees{" "}
                <span className="text-xs font-normal text-muted-foreground">({admins.length})</span>
              </p>
              {admins.length > 0 && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs">
                  Invites sent on finish
                </Badge>
              )}
            </div>
            {admins.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No HR admins added yet. You can also add them later from Settings → Roles.
              </p>
            ) : (
              <div className="space-y-2">
                {admins.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-sm shrink-0">
                        {a.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3" />
                          {a.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdmin(a.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}
