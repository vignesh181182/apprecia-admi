import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, Star, Bell, Plug, Shield, Check, Tags, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAccount, updateAccount, DEFAULT_CATEGORIES, DEFAULT_APPRECIATION_POLICY } from "@/lib/account";
import type { RecognitionCategory, AppreciationPolicy } from "@/lib/account";
import { CategoryEditor } from "@/components/recognition/category-editor";
import { AppreciationPolicyEditor } from "@/components/recognition/appreciation-policy-editor";

export default function HRSettings() {
  const { toast } = useToast();
  const account = getAccount();
  const [categories, setCategories] = useState<RecognitionCategory[]>(
    account?.recognitionCategories?.length ? account.recognitionCategories : DEFAULT_CATEGORIES,
  );
  const [policy, setPolicy] = useState<AppreciationPolicy>(
    account?.appreciationPolicy ?? DEFAULT_APPRECIATION_POLICY,
  );

  function save() {
    toast({ title: "Settings saved", description: "Your changes have been applied." });
  }

  return (
    <div className="p-6 overflow-y-auto h-full custom-scrollbar">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-stone-100 h-10">
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
          <TabsTrigger value="appreciation" className="text-xs gap-1.5 h-8">
            <Sparkles className="w-3.5 h-3.5" /> Appreciation Policy
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs gap-1.5 h-8">
            <Tags className="w-3.5 h-3.5" /> Categories
          </TabsTrigger>
          <TabsTrigger value="roles" className="text-xs gap-1.5 h-8">
            <Shield className="w-3.5 h-3.5" /> Roles
          </TabsTrigger>
        </TabsList>

        {/* ── General ── */}
        <TabsContent value="general" className="space-y-4 mt-0">
          <Card className="border border-stone-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-stone-900">Company Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Company Name</Label>
                  <Input defaultValue="Acme Corp" className="h-9 text-sm border-stone-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Portal Subdomain</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-xs text-stone-500 bg-stone-50 border border-r-0 border-stone-200 rounded-l-lg">rewards.</span>
                    <Input defaultValue="acme.com" className="h-9 text-sm border-stone-200 rounded-l-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Fiscal Year Start</Label>
                  <Select defaultValue="jan">
                    <SelectTrigger className="h-9 text-sm border-stone-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m, i) => (
                        <SelectItem key={m} value={["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"][i]}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Timezone</Label>
                  <Select defaultValue="pt">
                    <SelectTrigger className="h-9 text-sm border-stone-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Pacific Time (PT)</SelectItem>
                      <SelectItem value="mt">Mountain Time (MT)</SelectItem>
                      <SelectItem value="ct">Central Time (CT)</SelectItem>
                      <SelectItem value="et">Eastern Time (ET)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">Admin Email</Label>
                <Input defaultValue="hr-admin@acme.com" type="email" className="h-9 text-sm border-stone-200" />
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" className="bg-stone-900 hover:bg-stone-700 text-white" onClick={save}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Points Policy ── */}
        <TabsContent value="points" className="space-y-4 mt-0">
          <Card className="border border-stone-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-stone-900">Point Values by Category</CardTitle>
              <p className="text-xs text-stone-500">Set the default points awarded for each recognition category.</p>
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
                  <span className="text-sm text-stone-700 flex-1">{category}</span>
                  <Input type="number" defaultValue={def} className="h-8 text-sm border-stone-200 w-24 text-right" />
                  <span className="text-xs text-stone-500 w-6">pts</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-stone-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-stone-900">Expiry & Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Points Expire After</Label>
                  <div className="flex gap-2">
                    <Input type="number" defaultValue={12} className="h-9 text-sm border-stone-200" />
                    <Select defaultValue="months">
                      <SelectTrigger className="h-9 text-sm border-stone-200 w-28">
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
                  <Label className="text-xs font-medium text-stone-700">Max Points Per Recognition</Label>
                  <Input type="number" defaultValue={500} className="h-9 text-sm border-stone-200" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200">
                <div>
                  <p className="text-sm font-medium text-stone-900">Require Manager Approval</p>
                  <p className="text-xs text-stone-500">All peer-to-peer recognitions need manager sign-off before points are issued.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-end">
                <Button size="sm" className="bg-stone-900 hover:bg-stone-700 text-white" onClick={save}>Save Policy</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications" className="space-y-4 mt-0">
          <Card className="border border-stone-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-stone-900">Email Notifications</CardTitle>
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
                <div key={label} className="flex items-start justify-between p-3 rounded-lg border border-stone-100 hover:border-stone-200 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-stone-900">{label}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
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
            <Card key={name} className="border border-stone-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 font-bold text-sm shrink-0">
                  {name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-stone-900">{name}</p>
                    <Badge
                      className={`text-xs ${status === "connected" ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}
                      variant="secondary"
                    >
                      {status === "connected" ? "Connected" : "Disconnected"}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{description}</p>
                  {detail && <p className="text-xs text-stone-400 mt-0.5">{detail}</p>}
                </div>
                <Button
                  size="sm"
                  variant={status === "connected" ? "outline" : "default"}
                  className={`shrink-0 text-xs h-8 ${status === "connected" ? "border-stone-200 text-stone-700" : "bg-stone-900 hover:bg-stone-700 text-white"}`}
                >
                  {status === "connected" ? "Configure" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Appreciation Policy ── */}
        <TabsContent value="appreciation" className="space-y-4 mt-0">
          <AppreciationPolicyEditor
            policy={policy}
            onChange={setPolicy}
            onSave={() => {
              updateAccount({ appreciationPolicy: policy });
              toast({ title: "Appreciation policy saved", description: "Your changes will apply on the next badge sent." });
            }}
            accountTimezone={account?.timezone}
            accountCurrency={account?.currency}
          />
        </TabsContent>

        {/* ── Recognition Categories ── */}
        <TabsContent value="categories" className="space-y-4 mt-0">
          <Card className="border border-stone-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-stone-900">Recognition Categories</CardTitle>
              <p className="text-xs text-stone-500">Manage the values employees can tag when sending recognitions.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <CategoryEditor categories={categories} onChange={setCategories} />
              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  className="bg-stone-900 hover:bg-stone-700 text-white"
                  disabled={categories.length < 3 || !categories.every((c) => c.name.trim())}
                  onClick={() => {
                    updateAccount({ recognitionCategories: categories });
                    toast({ title: "Categories saved", description: "Recognition categories have been updated." });
                  }}
                >
                  Save Categories
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Roles ── */}
        <TabsContent value="roles" className="space-y-4 mt-0">
          <Card className="border border-stone-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-stone-900">Permission Matrix</CardTitle>
              <p className="text-xs text-stone-500">Capabilities granted per role</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-2 pr-4 text-stone-600 font-semibold">Permission</th>
                      {["Super Admin", "HR Admin", "Manager", "Employee"].map((role) => (
                        <th key={role} className="py-2 px-3 text-stone-600 font-semibold text-center w-24">{role}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
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
                      <tr key={perm} className="hover:bg-stone-50">
                        <td className="py-2.5 pr-4 text-stone-700 font-medium">{perm}</td>
                        {vals.map((v, i) => (
                          <td key={i} className="py-2.5 px-3 text-center">
                            {v ? (
                              <Check className="w-4 h-4 text-green-600 mx-auto" />
                            ) : (
                              <span className="block w-4 h-0.5 bg-stone-200 mx-auto rounded" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-stone-500">Contact your Super Admin to change role assignments.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
