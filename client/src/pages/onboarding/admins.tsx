import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, X, Mail, Shield, AlertCircle } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import { getAccount, updateAccount, type HRAdmin } from "@/lib/account";

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
      description="HR admins can manage everything except adding more admins. You stay the only super admin for this account."
      onBack={() => navigate("/onboarding/company")}
      onContinue={handleContinue}
      onSkip={admins.length === 0 ? handleSkip : undefined}
      continueLabel={admins.length === 0 ? "Continue" : `Continue with ${admins.length} admin${admins.length > 1 ? "s" : ""}`}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-medium">HR Admin permissions</p>
            <p className="text-amber-800 mt-0.5">
              Full access to programs, recognitions, employees, rewards, analytics, and settings.
              <span className="font-medium"> They cannot add or remove other admins</span> — only you can.
            </p>
          </div>
        </div>

        <Card className="border border-stone-200">
          <CardContent className="p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">Full name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="h-9 text-sm border-stone-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="h-9 text-sm border-stone-200"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAdmin())}
                />
              </div>
              <div className="flex items-end">
                <Button
                  size="sm"
                  onClick={addAdmin}
                  className="h-9 bg-stone-900 hover:bg-stone-700 text-white gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add
                </Button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-stone-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-stone-900">
                Invitees{" "}
                <span className="text-xs font-normal text-stone-500">({admins.length})</span>
              </p>
              {admins.length > 0 && (
                <Badge variant="secondary" className="bg-stone-100 text-stone-600 text-xs">
                  Invites sent on finish
                </Badge>
              )}
            </div>
            {admins.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-6">
                No HR admins added yet. You can also add them later from Settings → Roles.
              </p>
            ) : (
              <div className="space-y-2">
                {admins.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-stone-100 hover:border-stone-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 font-semibold text-sm shrink-0">
                        {a.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{a.name}</p>
                        <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3" />
                          {a.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAdmin(a.id)}
                      className="text-stone-400 hover:text-red-600"
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
