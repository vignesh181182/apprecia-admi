import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, Upload, X, MapPin, Phone, ImageIcon, ShieldCheck, Users, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WizardLayout, ONBOARDING_STEPS } from "@/components/onboarding/wizard-layout";
import { getAccount, updateAccount } from "@/lib/account";

/** Gradient-border style for the logo upload button. */
const GRADIENT_BORDER: React.CSSProperties = {
  background:
    "linear-gradient(#fff, #fff) padding-box, linear-gradient(90deg, #FF7A00, #E5397E, #5B5BEF) border-box",
  border: "1.5px solid transparent",
};

/** Left-panel feature highlights for the company step. */
const COMPANY_HIGHLIGHTS: { icon: LucideIcon; tint: string; title: string; desc: string }[] = [
  {
    icon: ShieldCheck,
    tint: "bg-[#FDE7D6] text-[#F97316]",
    title: "Build your identity",
    desc: "Showcase your brand across the platform.",
  },
  {
    icon: Users,
    tint: "bg-[#EDE9FB] text-[#7C3AED]",
    title: "Personalize experience",
    desc: "Tailor recognition to reflect your culture.",
  },
  {
    icon: TrendingUp,
    tint: "bg-[#FDE7D6] text-[#F97316]",
    title: "Drive impact",
    desc: "Get insights that help you grow together.",
  },
];

export default function OnboardingCompany() {
  const navigate = useNavigate();
  const account = getAccount();

  const [companyName, setCompanyName] = useState(account?.companyName ?? "");
  const [address, setAddress] = useState(account?.address ?? "");
  const [phone, setPhone] = useState(account?.phone ?? "");
  const [logo, setLogo] = useState<string | null>(account?.companyLogo ?? null);
  const [brandColor] = useState(account?.brandColor ?? "#1c1917");

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
      onBack={() => navigate("/onboarding/welcome")}
      onContinue={handleContinue}
      continueDisabled={!canContinue}
      panelBg="bg-gradient-to-br from-[#FDF2E9] via-[#FDF1E8] to-[#F7EEF3]"
      aside={
        <div className="flex-1 flex flex-col justify-center">
          {/* Full-bleed illustration — cancels the panel's side padding so there is no gap */}
          <div className="-mx-8">
            <img
              src="/images/ftu-compnay.png"
              alt="Set up your company"
              className="w-full object-contain"
              draggable={false}
            />
          </div>

          {/* Heading + description, centered */}
          <div className="-mt-2 text-center">
            <h2 className="text-[1.5rem] font-bold text-foreground leading-[1.2] whitespace-nowrap">
              Let&apos;s set up your company
            </h2>
            <p className="text-base text-muted-foreground mt-3 leading-relaxed max-w-md mx-auto">
              This information appears on your portal,
              <br />
              recognition emails and reports.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-3 gap-3">
            {COMPANY_HIGHLIGHTS.map(({ icon: Icon, tint, title, desc }) => (
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
      <div className="space-y-5">
        {/* Form */}
        <Card className="border border-border">
          <CardContent className="p-6 space-y-5">
            {/* Company logo — dashed dropzone */}
            <div className="rounded-2xl border-2 border-dashed border-border p-5 space-y-3">
              <Label className="text-sm font-semibold text-foreground">Company logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {logo ? (
                    <img src={logo} alt="Company logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <span
                        style={GRADIENT_BORDER}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-semibold text-foreground hover:brightness-95 transition-all"
                      >
                        <Upload className="w-4 h-4 text-[#E5397E]" />
                        {logo ? "Replace" : "Upload"}
                      </span>
                    </label>
                    {logo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setLogo(null)}
                        className="text-muted-foreground hover:text-foreground h-9 gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">PNG or SVG, square format works best. Stored locally for now.</p>
                </div>
              </div>
            </div>

            {/* Company name */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">
                Company name <span className="text-[#E5397E]">*</span>
              </Label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className="h-11 pl-9 text-sm border-border"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Address</Label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, state, postal code, country"
                  className="text-sm pl-9 border-border min-h-[88px]"
                />
              </div>
            </div>

            {/* Phone number */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-foreground">Phone number</Label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-11 pl-9 text-sm border-border"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </WizardLayout>
  );
}
