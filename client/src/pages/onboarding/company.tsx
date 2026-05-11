import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, Upload, X } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import { getAccount, updateAccount } from "@/lib/account";

const COLOR_PRESETS = [
  "#1c1917", "#0f172a", "#1e3a8a", "#7c2d12",
  "#065f46", "#831843", "#5b21b6", "#9a3412",
];

export default function OnboardingCompany() {
  const navigate = useNavigate();
  const account = getAccount();

  const [companyName, setCompanyName] = useState(account?.companyName ?? "");
  const [address, setAddress] = useState(account?.address ?? "");
  const [phone, setPhone] = useState(account?.phone ?? "");
  const [logo, setLogo] = useState<string | null>(account?.companyLogo ?? null);
  const [brandColor, setBrandColor] = useState(account?.brandColor ?? "#1c1917");

  if (!account) return null;

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleContinue() {
    updateAccount({
      companyName: companyName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      companyLogo: logo,
      brandColor,
    });
    navigate("/onboarding/admins");
  }

  const canContinue = companyName.trim().length > 0;

  return (
    <WizardLayout
      steps={ONBOARDING_STEPS}
      currentKey="company"
      title="Tell us about your company"
      description="This information appears on your portal, recognition emails, and reports."
      onBack={() => navigate("/onboarding/welcome")}
      onContinue={handleContinue}
      continueDisabled={!canContinue}
    >
      <div className="space-y-4">
        <Card className="border border-stone-200">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">Account ID</Label>
                <Input
                  value={account.accountId}
                  readOnly
                  className="h-9 text-sm border-stone-200 bg-stone-50 font-mono text-stone-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">Admin email</Label>
                <Input
                  value={account.adminEmail}
                  readOnly
                  className="h-9 text-sm border-stone-200 bg-stone-50 text-stone-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-stone-700">
                Company name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                className="h-9 text-sm border-stone-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-stone-700">Company logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden shrink-0">
                  {logo ? (
                    <img src={logo} alt="Company logo" className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-6 h-6 text-stone-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <span className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-stone-200 rounded-md hover:bg-stone-50 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {logo ? "Replace" : "Upload"}
                    </span>
                  </label>
                  {logo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogo(null)}
                      className="text-stone-500 hover:text-stone-900 h-8 gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-stone-500">PNG or SVG, square format works best. Stored locally for now.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-stone-700">Address</Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, city, state, postal code, country"
                className="text-sm border-stone-200 min-h-[72px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-stone-700">Phone number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="h-9 text-sm border-stone-200"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-stone-200">
          <CardContent className="p-5 space-y-3">
            <div>
              <p className="text-sm font-medium text-stone-900">Brand color</p>
              <p className="text-xs text-stone-500 mt-0.5">Used for highlights in your portal and email headers.</p>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBrandColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    brandColor === c ? "border-stone-900 scale-110" : "border-stone-200"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Pick color ${c}`}
                />
              ))}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-stone-200">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-stone-200"
                />
                <span className="text-xs font-mono text-stone-500">{brandColor.toUpperCase()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}
