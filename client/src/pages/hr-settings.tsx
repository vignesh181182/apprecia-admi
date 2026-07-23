import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StickyActions } from "@/components/ui/sticky-actions";
import { Building2, Star, Bell, Plug, Shield, Check, AlertTriangle, Wallet, Upload, X, UserPlus, Mail, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAccount, updateAccount, DEFAULT_POINTS_POLICY, type HRAdmin } from "@/lib/account";
import type { PointsPolicy } from "@/lib/account";
import { applyBrandColor } from "@/lib/theme";

const COLOR_PRESETS = [
  "#a87a3a", "#1c1917", "#0f172a", "#1e3a8a",
  "#7c2d12", "#065f46", "#831843", "#5b21b6",
];

export default function HRSettings() {
  const { toast } = useToast();
  const account = getAccount();
  const [pointsPolicy, setPointsPolicy] = useState<PointsPolicy>(
    account?.pointsPolicy ?? DEFAULT_POINTS_POLICY,
  );
  const monetaryActive = !!account?.appreciationPolicy?.monetaryEnabled;

  // ── Company profile state (General tab)
  const [companyName, setCompanyName] = useState(account?.companyName ?? "");
  const [companyAddress, setCompanyAddress] = useState(account?.address ?? "");
  const [companyPhone, setCompanyPhone] = useState(account?.phone ?? "");
  const [companyLogo, setCompanyLogo] = useState<string | null>(account?.companyLogo ?? null);
  const [brandColor, setBrandColor] = useState(account?.brandColor ?? "#1c1917");

  // ── HR Admins state
  const [hrAdmins, setHrAdmins] = useState<HRAdmin[]>(account?.hrAdmins ?? []);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminError, setAdminError] = useState("");

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCompanyLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  function saveCompanyProfile() {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name before saving.",
        variant: "destructive",
      });
      return;
    }
    updateAccount({
      companyName: companyName.trim(),
      address: companyAddress.trim(),
      phone: companyPhone.trim(),
      companyLogo,
      brandColor,
    });
    applyBrandColor(brandColor);
    toast({ title: "Company profile saved", description: "Your changes are visible across the portal." });
  }

  function addHrAdmin() {
    setAdminError("");
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      setAdminError("Both name and email are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(newAdminEmail)) {
      setAdminError("Please enter a valid email address.");
      return;
    }
    if (account && newAdminEmail.toLowerCase() === account.adminEmail.toLowerCase()) {
      setAdminError("This is the primary admin email — no need to add it again.");
      return;
    }
    if (hrAdmins.some((a) => a.email.toLowerCase() === newAdminEmail.toLowerCase())) {
      setAdminError("This email is already added.");
      return;
    }
    const next: HRAdmin[] = [
      ...hrAdmins,
      {
        id: Math.random().toString(36).slice(2, 10),
        name: newAdminName.trim(),
        email: newAdminEmail.trim(),
        invitedAt: new Date().toISOString(),
      },
    ];
    setHrAdmins(next);
    updateAccount({ hrAdmins: next });
    setNewAdminName("");
    setNewAdminEmail("");
    toast({ title: "HR admin added", description: `${newAdminName.trim()} has been invited.` });
  }

  function removeHrAdmin(id: string) {
    const next = hrAdmins.filter((a) => a.id !== id);
    setHrAdmins(next);
    updateAccount({ hrAdmins: next });
    toast({ title: "HR admin removed" });
  }

  function patchPoints(updates: Partial<PointsPolicy>) {
    setPointsPolicy((prev) => ({ ...prev, ...updates }));
  }
  function patchAllowance(updates: Partial<PointsPolicy["monthlyAllowance"]>) {
    setPointsPolicy((prev) => ({
      ...prev,
      monthlyAllowance: { ...prev.monthlyAllowance, ...updates },
    }));
  }
  function patchTierValues(updates: Partial<PointsPolicy["tierValues"]>) {
    setPointsPolicy((prev) => ({
      ...prev,
      tierValues: { ...prev.tierValues, ...updates },
    }));
  }
  function savePointsPolicy() {
    updateAccount({ pointsPolicy });
    toast({ title: "Wallet policy saved", description: "Per-role allowances and tier values updated." });
  }

  function save() {
    toast({ title: "Settings saved", description: "Your changes have been applied." });
  }

  return (
    <div className="p-6 overflow-y-auto h-full custom-scrollbar">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted h-10">
          <TabsTrigger value="general" className="text-xs gap-1.5 h-8">
            <Building2 className="w-3.5 h-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="points" className="text-xs gap-1.5 h-8">
            <Star className="w-3.5 h-3.5" /> Points Policy
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1.5 h-8">
            <Bell className="w-3.5 h-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs gap-1.5 h-8">
            <Plug className="w-3.5 h-3.5" /> Integrations
          </TabsTrigger>
          <TabsTrigger value="hr-admins" className="text-xs gap-1.5 h-8">
            <Users className="w-3.5 h-3.5" /> HR Admins
          </TabsTrigger>
          <TabsTrigger value="roles" className="text-xs gap-1.5 h-8">
            <Shield className="w-3.5 h-3.5" /> Roles
          </TabsTrigger>
        </TabsList>

        {/* ── General ── */}
        <TabsContent value="general" className="space-y-4 mt-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Tell us about your company</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              This information appears on your portal, recognition emails, and reports.
            </p>
          </div>

          <Card className="border border-border">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Account ID</Label>
                  <Input
                    value={account?.accountId ?? ""}
                    readOnly
                    className="h-9 text-sm border-border bg-muted font-mono text-muted-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Admin email</Label>
                  <Input
                    value={account?.adminEmail ?? ""}
                    readOnly
                    className="h-9 text-sm border-border bg-muted text-muted-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Company name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corp"
                  className="h-9 text-sm border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Company logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {companyLogo ? (
                      <img src={companyLogo} alt="Company logo" className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <span className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        {companyLogo ? "Replace" : "Upload"}
                      </span>
                    </label>
                    {companyLogo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCompanyLogo(null)}
                        className="text-muted-foreground hover:text-foreground h-8 gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">PNG or SVG, square format works best. Stored locally for now.</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Address</Label>
                <Textarea
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Street, city, state, postal code, country"
                  className="text-sm border-border min-h-[72px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Phone number</Label>
                <Input
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="h-9 text-sm border-border"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="p-5 space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground">Brand color</p>
                <p className="text-xs text-muted-foreground mt-0.5">Used for highlights in your portal and email headers.</p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBrandColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      brandColor === c ? "border-stone-900 scale-110" : "border-border"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Pick color ${c}`}
                  />
                ))}
                <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-border"
                  />
                  <span className="text-xs font-mono text-muted-foreground">{brandColor.toUpperCase()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <StickyActions>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={saveCompanyProfile}>
              Save Changes
            </Button>
          </StickyActions>
        </TabsContent>

        {/* ── Points Policy ── */}
        <TabsContent value="points" className="space-y-4 mt-0">
          {!monetaryActive && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Monetary recognition is currently disabled in <strong>Appreciation Policy</strong>. These
                settings have no effect until it's re-enabled.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card className="border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" /> Per-role monthly allowance
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    How many points each role can give out per month. Resets on the 1st when "Expire unused" is on.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([
                    { key: "employee", label: "Employee" },
                    { key: "manager",  label: "Manager"  },
                    { key: "admin",    label: "Admin"    },
                  ] as const).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground flex-1">{label}</span>
                      <Input
                        type="number"
                        min={0}
                        value={pointsPolicy.monthlyAllowance[key]}
                        onChange={(e) => patchAllowance({ [key]: Math.max(0, Number(e.target.value) || 0) } as Partial<PointsPolicy["monthlyAllowance"]>)}
                        className="h-8 text-sm border-border w-24 text-right"
                      />
                      <span className="text-xs text-muted-foreground w-12">pts/mo</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 mt-2 rounded-lg bg-muted border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">Expire unused balance on rollover</p>
                      <p className="text-xs text-muted-foreground">When off, leftover give-points carry into next month.</p>
                    </div>
                    <Switch
                      checked={pointsPolicy.expireUnused}
                      onCheckedChange={(v) => patchPoints({ expireUnused: !!v })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold text-foreground">Appreciation tier values</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Points credited when a sender picks each tier. "Thanks" is always free.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([
                    { key: "thanks",      label: "Thanks",      locked: true },
                    { key: "goodJob",     label: "Good Job",    locked: false },
                    { key: "exceptional", label: "Exceptional", locked: false },
                  ] as const).map(({ key, label, locked }) => (
                    <div key={key} className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground flex-1">{label}</span>
                      <Input
                        type="number"
                        min={0}
                        disabled={locked}
                        value={locked ? 0 : pointsPolicy.tierValues[key]}
                        onChange={(e) => patchTierValues({ [key]: Math.max(0, Number(e.target.value) || 0) } as Partial<PointsPolicy["tierValues"]>)}
                        className="h-8 text-sm border-border w-24 text-right disabled:bg-muted"
                      />
                      <span className="text-xs text-muted-foreground w-6">pts</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={savePointsPolicy}>
                  Save Wallet Policy
                </Button>
              </div>
            </div>

            <Card className="border border-border bg-muted h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Live preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">Monthly allowance</p>
                  <ul className="space-y-0.5">
                    <li>Employee: <strong>{pointsPolicy.monthlyAllowance.employee} pts</strong></li>
                    <li>Manager: <strong>{pointsPolicy.monthlyAllowance.manager} pts</strong></li>
                    <li>Admin: <strong>{pointsPolicy.monthlyAllowance.admin} pts</strong></li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Tier credit to receiver</p>
                  <ul className="space-y-0.5">
                    <li>Thanks: <strong>0 pts</strong></li>
                    <li>Good Job: <strong>{pointsPolicy.tierValues.goodJob} pts</strong></li>
                    <li>Exceptional: <strong>{pointsPolicy.tierValues.exceptional} pts</strong></li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  A manager gets <strong>{pointsPolicy.monthlyAllowance.manager} pts</strong> to give each month.
                  Sending an "Exceptional" badge ({pointsPolicy.tierValues.exceptional} pts) credits the receiver's redeemable balance.
                </p>
                <p className="text-muted-foreground">
                  Unused balance {pointsPolicy.expireUnused ? "expires" : "rolls over"} on the 1st.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-foreground">Point Values by Category</CardTitle>
              <p className="text-xs text-muted-foreground">Set the default points awarded for each recognition category.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { category: "Innovation", default: 200 },
                { category: "Leadership", default: 300 },
                { category: "Teamwork", default: 100 },
                { category: "Creativity", default: 150 },
                { category: "Culture", default: 200 },
                { category: "Customer Focus", default: 175 },
              ].map(({ category, default: def }) => (
                <div key={category} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground flex-1">{category}</span>
                  <Input type="number" defaultValue={def} className="h-8 text-sm border-border w-24 text-right" />
                  <span className="text-xs text-muted-foreground w-6">pts</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-foreground">Expiry & Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Points Expire After</Label>
                  <div className="flex gap-2">
                    <Input type="number" defaultValue={12} className="h-9 text-sm border-border" />
                    <Select defaultValue="months">
                      <SelectTrigger className="h-9 text-sm border-border w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Max Points Per Recognition</Label>
                  <Input type="number" defaultValue={500} className="h-9 text-sm border-border" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Require Manager Approval</p>
                  <p className="text-xs text-muted-foreground">All peer-to-peer recognitions need manager sign-off before points are issued.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <StickyActions>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={save}>Save Policy</Button>
          </StickyActions>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications" className="space-y-4 mt-0">
          <Card className="border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-foreground">Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Recognition Received", desc: "Notify employees when they receive a recognition", enabled: true },
                { label: "Recognition Approved", desc: "Notify sender when their recognition is approved", enabled: true },
                { label: "Reward Redemption Update", desc: "Notify employees when redemptions are fulfilled or rejected", enabled: true },
                { label: "Points Expiry Warning", desc: "Warn employees 30 days before points expire", enabled: false },
                { label: "Weekly Digest", desc: "Send admins a weekly summary of recognition activity", enabled: true },
                { label: "Budget Alert (80%)", desc: "Alert admins when a program reaches 80% of its budget", enabled: true },
              ].map(({ label, desc, enabled }) => (
                <div key={label} className="flex items-start justify-between p-3 rounded-lg border border-border hover:border-border transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <Switch defaultChecked={enabled} className="ml-4 shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Integrations ── */}
        <TabsContent value="integrations" className="space-y-4 mt-0">
          {[
            {
              name: "Slack",
              description: "Post recognition shout-outs to a Slack channel automatically.",
              status: "connected",
              detail: "#all-kudos",
            },
            {
              name: "Workday",
              description: "Sync employee data and org structure from Workday.",
              status: "connected",
              detail: "Last sync: 2 hours ago",
            },
            {
              name: "ADP",
              description: "Import payroll and employee records from ADP.",
              status: "disconnected",
              detail: null,
            },
            {
              name: "Microsoft Teams",
              description: "Send recognition notifications directly in Teams.",
              status: "disconnected",
              detail: null,
            },
            {
              name: "Google Workspace SSO",
              description: "Allow employees to sign in using their Google account.",
              status: "connected",
              detail: "acme.com",
            },
          ].map(({ name, description, status, detail }) => (
            <Card key={name} className="border border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-bold text-sm shrink-0">
                  {name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{name}</p>
                    <Badge
                      className={`text-xs ${status === "connected" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                      variant="secondary"
                    >
                      {status === "connected" ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
                </div>
                <Button
                  size="sm"
                  variant={status === "connected" ? "outline" : "default"}
                  className={`shrink-0 text-xs h-8 ${status === "connected" ? "border-border text-muted-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}
                >
                  {status === "connected" ? "Configure" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Appreciation Policy ── */}
        {/* ── HR Admins ── */}
        <TabsContent value="hr-admins" className="space-y-4 mt-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">HR Admins</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Invite teammates to co-manage the account. HR admins can manage everything except adding more admins —
              that stays with you.
            </p>
          </div>

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
              <p className="text-sm font-semibold text-foreground">Invite an HR admin</p>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Full name</Label>
                  <Input
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Jane Doe"
                    className="h-9 text-sm border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                  <Input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="h-9 text-sm border-border"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHrAdmin())}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    size="sm"
                    onClick={addHrAdmin}
                    className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add
                  </Button>
                </div>
              </div>
              {adminError && (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {adminError}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">
                  Current HR admins{" "}
                  <span className="text-xs font-normal text-muted-foreground">({hrAdmins.length})</span>
                </p>
              </div>
              {hrAdmins.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No HR admins yet. Add one above and they'll get an invite email.
                </p>
              ) : (
                <div className="space-y-2">
                  {hrAdmins.map((a) => (
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
                        onClick={() => removeHrAdmin(a.id)}
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
        </TabsContent>

        <TabsContent value="roles" className="space-y-4 mt-0">
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Permission Matrix</CardTitle>
              <p className="text-xs text-muted-foreground">Capabilities granted per role</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-semibold">Permission</th>
                      {["Super Admin", "HR Admin", "Manager", "Employee"].map((role) => (
                        <th key={role} className="py-2 px-3 text-muted-foreground font-semibold text-center w-24">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { perm: "Send Recognitions", vals: [true, true, true, true] },
                      { perm: "Approve Recognitions", vals: [true, true, true, false] },
                      { perm: "Manage Programs", vals: [true, true, false, false] },
                      { perm: "Manage Rewards", vals: [true, true, false, false] },
                      { perm: "Fulfill Redemptions", vals: [true, true, true, false] },
                      { perm: "View Analytics", vals: [true, true, true, false] },
                      { perm: "Edit Settings", vals: [true, false, false, false] },
                      { perm: "Manage Roles", vals: [true, false, false, false] },
                    ].map(({ perm, vals }) => (
                      <tr key={perm} className="hover:bg-muted">
                        <td className="py-2.5 pr-4 text-muted-foreground font-medium">{perm}</td>
                        {vals.map((v, i) => (
                          <td key={i} className="py-2.5 px-3 text-center">
                            {v ? (
                              <Check className="w-4 h-4 text-success mx-auto" />
                            ) : (
                              <span className="block w-4 h-0.5 bg-muted mx-auto rounded" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground">Contact your Super Admin to change role assignments.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
