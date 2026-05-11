import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  Mail,
  AlertTriangle,
  ExternalLink,
  RotateCcw,
  LogOut,
  Building2,
  CheckCircle2,
  Clock,
  Hourglass,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Star,
  Trophy,
  Phone,
  MapPin,
  User,
  Briefcase,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  generateAccountId,
  generateInviteToken,
  saveInvite,
  getInvites,
  setSuperAdminAuthenticated,
  seedDummyCompanies,
  resetAndReseed,
  type InviteRecord,
} from "@/lib/account";
import { BRAND } from "@/lib/brand";
import { EngageXLogo } from "@/components/engagex-logo";

type CompanyStatus = "Active" | "In setup" | "Pending invite";

function statusFor(invite: InviteRecord): CompanyStatus {
  if (invite.setupCompleted) return "Active";
  if (invite.redeemed) return "In setup";
  return "Pending invite";
}

const STATUS_STYLES: Record<CompanyStatus, { bg: string; text: string; Icon: typeof CheckCircle2 }> = {
  Active: { bg: "bg-green-100", text: "text-green-700", Icon: CheckCircle2 },
  "In setup": { bg: "bg-amber-100", text: "text-amber-700", Icon: Hourglass },
  "Pending invite": { bg: "bg-stone-100", text: "text-stone-600", Icon: Clock },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function SuperAdmin() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminDesignation, setAdminDesignation] = useState("");
  const [adminDepartment, setAdminDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [enableRnR, setEnableRnR] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // List state
  const [invites, setInvites] = useState<InviteRecord[]>(getInvites());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CompanyStatus>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // First-load seed: populate dummy companies if the list is empty.
  // No-op on subsequent visits.
  useEffect(() => {
    seedDummyCompanies();
    setInvites(getInvites());
  }, []);

  function toggleExpanded(token: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(token)) next.delete(token);
      else next.add(token);
      return next;
    });
  }

  function createAccount() {
    if (!companyName.trim() || !adminName.trim() || !adminEmail.trim()) {
      toast({
        title: "Missing required fields",
        description: "Company name, admin name, and admin email are required.",
        variant: "destructive",
      });
      return;
    }
    const invite: InviteRecord = {
      token: generateInviteToken(),
      accountId: generateAccountId(),
      adminEmail: adminEmail.trim(),
      adminName: adminName.trim(),
      adminDesignation: adminDesignation.trim(),
      adminDepartment: adminDepartment.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      products: { appreciation: true, rnr: enableRnR },
      createdAt: new Date().toISOString(),
      redeemed: false,
    };
    saveInvite(invite);
    setInvites(getInvites());

    setCompanyName("");
    setAdminName("");
    setAdminEmail("");
    setAdminDesignation("");
    setAdminDepartment("");
    setPhone("");
    setAddress("");
    setEnableRnR(false);
    setShowCreateForm(false);

    toast({
      title: "Company account created",
      description: `Invite link is ready for ${invite.companyName}.`,
    });
  }

  function inviteUrl(token: string) {
    return `${window.location.origin}${window.location.pathname}#/auth/sign-in?invite=${token}`;
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(inviteUrl(token));
    toast({ title: "Invite link copied", description: "Paste it in your browser to simulate the email click." });
  }

  function resetEverything() {
    resetAndReseed();
    setInvites(getInvites());
    toast({
      title: "Reset complete",
      description: "Cleared everything and re-seeded with dummy companies.",
    });
  }

  function signOut() {
    setSuperAdminAuthenticated(false);
    navigate("/superadmin/sign-in");
  }

  // Derived stats
  const stats = useMemo(() => {
    const total = invites.length;
    const active = invites.filter((i) => i.setupCompleted).length;
    const inSetup = invites.filter((i) => i.redeemed && !i.setupCompleted).length;
    const pending = invites.filter((i) => !i.redeemed).length;
    const rnrEnabled = invites.filter((i) => i.products.rnr).length;
    return { total, active, inSetup, pending, rnrEnabled };
  }, [invites]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...invites]
      .filter((inv) => {
        if (statusFilter !== "all" && statusFor(inv) !== statusFilter) return false;
        if (!term) return true;
        return (
          inv.companyName.toLowerCase().includes(term) ||
          inv.adminEmail.toLowerCase().includes(term) ||
          inv.adminName.toLowerCase().includes(term) ||
          inv.accountId.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invites, search, statusFilter]);

  return (
    <div className="min-h-screen w-full bg-stone-50 grain-texture">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EngageXLogo size={32} />
            <div>
              <p className="text-sm font-semibold text-stone-900 leading-tight">{BRAND.name} · Super Admin</p>
              <p className="text-xs text-stone-500 leading-tight">Provision and manage customer accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetEverything}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset all
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-stone-600 hover:text-stone-900 hover:bg-stone-100 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Internal-only banner */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-medium">Internal-only page</p>
            <p className="text-amber-800 mt-0.5">
              This is the {BRAND.name} super admin console. Create new customer accounts, manage product flags
              (Appreciation default, RnR optional), and track onboarding progress. In production this lives behind your
              internal SSO.
            </p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-stone-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">Total companies</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.total}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-stone-900 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-stone-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">Active</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.active}</p>
                  <p className="text-xs text-green-600 mt-0.5">Setup complete</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-stone-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">In setup</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.inSetup}</p>
                  <p className="text-xs text-amber-600 mt-0.5">Onboarding</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Hourglass className="w-4 h-4 text-amber-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-stone-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mb-1">Pending invites</p>
                  <p className="text-2xl font-bold text-stone-900">{stats.pending}</p>
                  <p className="text-xs text-stone-500 mt-0.5">Not yet signed in</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-stone-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies list */}
        <Card className="border border-stone-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-sm font-semibold text-stone-900">
                  Companies <span className="font-normal text-stone-500">({invites.length})</span>
                </CardTitle>
                <p className="text-xs text-stone-500 mt-0.5">
                  All customer accounts provisioned through this console
                </p>
              </div>
              <Button
                onClick={() => setShowCreateForm((v) => !v)}
                className="bg-stone-900 hover:bg-stone-700 text-white gap-1.5 h-9"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5" />
                New company
              </Button>
            </div>

            {/* Search + filter */}
            {invites.length > 0 && (
              <div className="flex items-center gap-2 pt-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <Input
                    placeholder="Search by company, admin, or account ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 text-sm border-stone-200 pl-8"
                  />
                </div>
                <div className="flex items-center gap-1">
                  {(["all", "Active", "In setup", "Pending invite"] as const).map((s) => (
                    <Button
                      key={s}
                      variant={statusFilter === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(s)}
                      className={
                        statusFilter === s
                          ? "h-8 text-xs bg-stone-900 hover:bg-stone-700"
                          : "h-8 text-xs border-stone-200 text-stone-600"
                      }
                    >
                      {s === "all" ? "All" : s}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Inline create form */}
            {showCreateForm && (
              <div className="p-4 rounded-lg border border-stone-200 bg-stone-50 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-900">Create new customer account</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                    className="h-7 text-xs text-stone-500 hover:text-stone-900"
                  >
                    Cancel
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-stone-700">Company name *</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Corp"
                      className="h-9 text-sm border-stone-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-stone-700">Admin name *</Label>
                    <Input
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Jane Doe"
                      className="h-9 text-sm border-stone-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-stone-700">Admin email *</Label>
                    <Input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="jane@acme.com"
                      className="h-9 text-sm border-stone-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-stone-700">Phone</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="h-9 text-sm border-stone-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-stone-700">Admin designation</Label>
                    <Input
                      value={adminDesignation}
                      onChange={(e) => setAdminDesignation(e.target.value)}
                      placeholder="Head of People"
                      className="h-9 text-sm border-stone-200 bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-stone-700">Admin department</Label>
                    <Input
                      value={adminDepartment}
                      onChange={(e) => setAdminDepartment(e.target.value)}
                      placeholder="People Operations"
                      className="h-9 text-sm border-stone-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Address</Label>
                  <Textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-sm border-stone-200 min-h-[60px] bg-white"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide">Products</p>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-stone-200">
                    <div>
                      <p className="text-sm font-medium text-stone-900">Appreciation</p>
                      <p className="text-xs text-stone-500">Always enabled — default product.</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Always on</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-stone-200">
                    <div>
                      <p className="text-sm font-medium text-stone-900">Rewards & Recognition</p>
                      <p className="text-xs text-stone-500">Adds points budget, reward catalog, redemptions.</p>
                    </div>
                    <Switch checked={enableRnR} onCheckedChange={setEnableRnR} />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button onClick={createAccount} className="bg-stone-900 hover:bg-stone-700 text-white gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    Create account & generate invite
                  </Button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {invites.length === 0 && !showCreateForm && (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-5 h-5 text-stone-400" />
                </div>
                <p className="text-sm font-medium text-stone-900">No companies yet</p>
                <p className="text-xs text-stone-500 mt-1 mb-4">
                  Create your first customer account to generate an invite link.
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-stone-900 hover:bg-stone-700 text-white gap-1.5"
                  size="sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create first company
                </Button>
              </div>
            )}

            {/* No-results state */}
            {invites.length > 0 && filtered.length === 0 && (
              <p className="text-sm text-stone-500 text-center py-8">
                No companies match your filters. Try a different search term.
              </p>
            )}

            {/* Companies */}
            {filtered.map((inv) => {
              const status = statusFor(inv);
              const styles = STATUS_STYLES[status];
              const StatusIcon = styles.Icon;
              const isOpen = expanded.has(inv.token);
              return (
                <div
                  key={inv.token}
                  className="rounded-lg border border-stone-200 bg-white overflow-hidden"
                >
                  {/* Summary row */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-stone-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-stone-900 truncate">{inv.companyName}</p>
                            <Badge className={`${styles.bg} ${styles.text} hover:${styles.bg} gap-1 text-xs`}>
                              <StatusIcon className="w-3 h-3" />
                              {status}
                            </Badge>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5 truncate">
                            {inv.adminName} · {inv.adminEmail}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <Badge variant="secondary" className="bg-stone-100 text-stone-600 text-xs font-mono">
                              {inv.accountId}
                            </Badge>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs gap-1">
                              <Star className="w-2.5 h-2.5" />
                              Appreciation
                            </Badge>
                            {inv.products.rnr && (
                              <Badge variant="secondary" className="bg-purple-50 text-purple-700 text-xs gap-1">
                                <Trophy className="w-2.5 h-2.5" />
                                RnR
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLink(inv.token)}
                          className="h-8 border-stone-200 gap-1 text-xs"
                        >
                          <Copy className="w-3 h-3" />
                          Copy link
                        </Button>
                        <Link to={`/auth/sign-in?invite=${inv.token}`}>
                          <Button size="sm" className="h-8 bg-stone-900 hover:bg-stone-700 text-white gap-1 text-xs">
                            <ExternalLink className="w-3 h-3" />
                            Open
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpanded(inv.token)}
                          className="h-8 w-8 p-0 text-stone-500 hover:text-stone-900"
                          aria-label={isOpen ? "Collapse details" : "Expand details"}
                        >
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="border-t border-stone-200 bg-stone-50 p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2.5">
                          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Admin contact</p>
                          <DetailRow icon={User} label="Name" value={inv.adminName} />
                          <DetailRow icon={Mail} label="Email" value={inv.adminEmail} />
                          <DetailRow
                            icon={Briefcase}
                            label="Designation"
                            value={inv.adminDesignation || "—"}
                          />
                          <DetailRow
                            icon={Building2}
                            label="Department"
                            value={inv.adminDepartment || "—"}
                          />
                        </div>
                        <div className="space-y-2.5">
                          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Company info</p>
                          <DetailRow icon={Phone} label="Phone" value={inv.phone || "—"} />
                          <DetailRow icon={MapPin} label="Address" value={inv.address || "—"} multiline />
                          <DetailRow
                            icon={Calendar}
                            label="Created"
                            value={formatDate(inv.createdAt)}
                          />
                          {inv.redeemedAt && (
                            <DetailRow
                              icon={CheckCircle2}
                              label="First sign-in"
                              value={formatDate(inv.redeemedAt)}
                            />
                          )}
                          {inv.setupCompletedAt && (
                            <DetailRow
                              icon={CheckCircle2}
                              label="Setup completed"
                              value={formatDate(inv.setupCompletedAt)}
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Invite link</p>
                        <div className="flex items-center gap-2">
                          <Input
                            readOnly
                            value={inviteUrl(inv.token)}
                            className="h-8 text-xs border-stone-200 bg-white font-mono"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyLink(inv.token)}
                            className="h-8 border-stone-200 gap-1 shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  multiline,
}: {
  icon: typeof User;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-stone-500">{label}</p>
        <p className={`text-stone-900 mt-0.5 ${multiline ? "whitespace-pre-line" : "truncate"}`}>{value}</p>
      </div>
    </div>
  );
}
