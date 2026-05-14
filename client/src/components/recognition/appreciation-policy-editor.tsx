import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Calendar, ShieldCheck, Eye } from "lucide-react";
import type { AppreciationPolicy, ApprovalLevel } from "@/lib/account";
import {
  isSendingWindowOpen,
  nextWindowReopenAt,
  resolveApprover,
} from "@/lib/appreciation-policy";
import { EMPLOYEES } from "@/lib/recognize-data";

type Props = {
  policy: AppreciationPolicy;
  onChange: (next: AppreciationPolicy) => void;
  onSave: () => void;
  accountTimezone?: string;
  accountCurrency?: string;
};

const APPROVER_LABELS: Record<ApprovalLevel, { label: string; help: string }> = {
  "direct-manager": { label: "Direct manager", help: "Fastest, most common." },
  "bu-head":        { label: "Business unit head", help: "For BU-level oversight." },
  "function-lead":  { label: "Function lead", help: "For cross-team functions (e.g., Engineering lead)." },
  "hr-admin":       { label: "HR admin", help: "Central HR review." },
};

const TIMEZONES = [
  { value: "pt", label: "Pacific (PT)" },
  { value: "et", label: "Eastern (ET)" },
  { value: "ist", label: "India (IST)" },
  { value: "utc", label: "UTC" },
];

function fmtDateTime(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function toDateInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fromDateInput(value: string, endOfDay = false): string | undefined {
  if (!value) return undefined;
  const d = new Date(value + (endOfDay ? "T23:59:59" : "T00:00:00"));
  return d.toISOString();
}

export function AppreciationPolicyEditor({ policy, onChange, onSave, accountTimezone, accountCurrency }: Props) {
  const currency = accountCurrency || "₹";
  const windowOpen = isSendingWindowOpen(policy);
  const reopenAt = nextWindowReopenAt(policy);
  const sampleSender = EMPLOYEES.find((e) => e.managerId) ?? EMPLOYEES[0];
  const sampleApprover = resolveApprover(sampleSender, policy.approval.approverLevel);

  function patch(updates: Partial<AppreciationPolicy>) {
    onChange({ ...policy, ...updates });
  }
  function patchWindow(updates: Partial<AppreciationPolicy["window"]>) {
    onChange({ ...policy, window: { ...policy.window, ...updates } });
  }
  function patchApproval(updates: Partial<AppreciationPolicy["approval"]>) {
    onChange({ ...policy, approval: { ...policy.approval, ...updates } });
  }
  function patchPointValue(updates: Partial<AppreciationPolicy["pointValue"]>) {
    onChange({
      ...policy,
      pointValue: { ...policy.pointValue, ...updates },
    });
  }

  const pointValueValid =
    policy.pointValue.points > 0 && policy.pointValue.amount > 0;
  const perPoint = pointValueValid
    ? policy.pointValue.amount / policy.pointValue.points
    : 0;

  return (
    <div className="space-y-4">
      {/* 1. Monetary */}
      <Card className="border border-stone-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-stone-500" /> Monetary benefits
          </CardTitle>
          <p className="text-xs text-stone-500">
            Controls whether badges credit points to the receiver.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <div>
              <p className="text-sm font-medium text-stone-900">Allow points and redemption on appreciations</p>
              <p className="text-xs text-stone-500 mt-0.5">
                When off, badges still recognize work but no points are credited and the Rewards catalog is hidden for employees.
              </p>
            </div>
            <Switch
              checked={policy.monetaryEnabled}
              onCheckedChange={(v) => patch({ monetaryEnabled: !!v })}
            />
          </div>

          {policy.monetaryEnabled && (
            <div className="p-3 rounded-lg border border-stone-200 space-y-3">
              <div>
                <p className="text-sm font-medium text-stone-900">Point value</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  How much one point is worth when employees redeem rewards.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Points</Label>
                  <Input
                    type="number"
                    min={1}
                    value={policy.pointValue.points}
                    onChange={(e) =>
                      patchPointValue({ points: Math.max(1, Number(e.target.value) || 0) })
                    }
                    className="h-9 text-sm border-stone-200 w-24"
                  />
                </div>
                <span className="text-sm text-stone-500 pb-2">=</span>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-stone-700">Amount ({currency})</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={policy.pointValue.amount}
                    onChange={(e) =>
                      patchPointValue({ amount: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className="h-9 text-sm border-stone-200 w-28"
                  />
                </div>
              </div>

              <p className="text-xs text-stone-600">
                {pointValueValid
                  ? <>1 point ≈ <strong>{currency}{perPoint.toFixed(2)}</strong>. A 100-pt badge redeems for {currency}{(perPoint * 100).toFixed(2)}.</>
                  : <span className="text-red-600">Both values must be greater than 0.</span>
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Window */}
      <Card className="border border-stone-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-stone-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-500" /> Sending window
          </CardTitle>
          <p className="text-xs text-stone-500">
            Decide when employees can send appreciations.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={policy.window.mode}
            onValueChange={(v) => patchWindow({ mode: v as "always" | "scheduled" })}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            <label className="flex items-start gap-2 p-3 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50">
              <RadioGroupItem value="always" id="window-always" className="mt-0.5" />
              <div>
                <p className="text-sm font-medium text-stone-900">Always open</p>
                <p className="text-xs text-stone-500">Employees can send any time.</p>
              </div>
            </label>
            <label className="flex items-start gap-2 p-3 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50">
              <RadioGroupItem value="scheduled" id="window-scheduled" className="mt-0.5" />
              <div>
                <p className="text-sm font-medium text-stone-900">Scheduled window</p>
                <p className="text-xs text-stone-500">Restrict to a date range.</p>
              </div>
            </label>
          </RadioGroup>

          {policy.window.mode === "scheduled" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">Start date</Label>
                <Input
                  type="date"
                  value={toDateInput(policy.window.startDate)}
                  onChange={(e) => patchWindow({ startDate: fromDateInput(e.target.value) })}
                  className="h-9 text-sm border-stone-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">End date</Label>
                <Input
                  type="date"
                  value={toDateInput(policy.window.endDate)}
                  onChange={(e) => patchWindow({ endDate: fromDateInput(e.target.value, true) })}
                  className="h-9 text-sm border-stone-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-stone-700">Timezone</Label>
                <Select
                  value={policy.window.timezone ?? accountTimezone ?? "pt"}
                  onValueChange={(v) => patchWindow({ timezone: v })}
                >
                  <SelectTrigger className="h-9 text-sm border-stone-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="text-xs text-stone-600 p-3 rounded-lg bg-amber-50 border border-amber-100">
            {policy.window.mode === "always" ? (
              <>Employees can send appreciations any time. Outside any window check the button stays enabled.</>
            ) : policy.window.startDate && policy.window.endDate ? (
              <>
                Employees can send from <strong>{fmtDateTime(policy.window.startDate)}</strong> to{" "}
                <strong>{fmtDateTime(policy.window.endDate)}</strong>. Outside this window the button is disabled.
              </>
            ) : (
              <>Pick a start and end date to define the window.</>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Approval */}
      <Card className="border border-stone-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-stone-500" /> Approval workflow
          </CardTitle>
          <p className="text-xs text-stone-500">
            Optionally require manager approval before badges post to the feed.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-stone-50 border border-stone-200">
            <div>
              <p className="text-sm font-medium text-stone-900">Require approval before badges post</p>
              <p className="text-xs text-stone-500 mt-0.5">
                When on, badges enter a pending queue until the chosen approver decides.
              </p>
            </div>
            <Switch
              checked={policy.approval.required}
              onCheckedChange={(v) => patchApproval({ required: !!v })}
            />
          </div>

          {policy.approval.required && (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-stone-700">Approver level</Label>
                <RadioGroup
                  value={policy.approval.approverLevel}
                  onValueChange={(v) => patchApproval({ approverLevel: v as ApprovalLevel })}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                  {(Object.keys(APPROVER_LABELS) as ApprovalLevel[]).map((level) => (
                    <label
                      key={level}
                      className="flex items-start gap-2 p-3 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50"
                    >
                      <RadioGroupItem value={level} id={`approver-${level}`} className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-stone-900">{APPROVER_LABELS[level].label}</p>
                        <p className="text-xs text-stone-500">{APPROVER_LABELS[level].help}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-1.5 max-w-xs">
                <Label className="text-xs font-medium text-stone-700">Auto-approve after</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={policy.approval.autoApproveAfterHours ?? 0}
                    onChange={(e) =>
                      patchApproval({ autoApproveAfterHours: Number(e.target.value) || 0 })
                    }
                    className="h-9 text-sm border-stone-200"
                  />
                  <span className="text-xs text-stone-500 shrink-0">hours (0 = never)</span>
                </div>
              </div>

              <div className="text-xs text-stone-700 p-3 rounded-lg bg-blue-50 border border-blue-100">
                When <strong>{sampleSender?.name ?? "an employee"}</strong> sends an appreciation, it
                goes to <strong>{sampleApprover?.name ?? "—"}</strong> for review before posting.
                {policy.approval.autoApproveAfterHours
                  ? ` Auto-approves after ${policy.approval.autoApproveAfterHours} hours of inactivity.`
                  : " No auto-approval; the approver must decide manually."}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 4. Status preview */}
      <Card className="border border-stone-200 bg-stone-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-stone-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-stone-500" /> Status preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-stone-700 space-y-1.5">
            <li>
              <strong>Window:</strong>{" "}
              {policy.window.mode === "always"
                ? "Always open"
                : windowOpen
                  ? "Currently open"
                  : reopenAt
                    ? `Closed — reopens ${fmtDateTime(reopenAt.toISOString())}`
                    : "Closed"}
            </li>
            <li>
              <strong>Monetary:</strong>{" "}
              {policy.monetaryEnabled
                ? pointValueValid
                  ? `On — ${policy.pointValue.points} pts = ${currency}${policy.pointValue.amount}`
                  : "On (point value not set)"
                : "Off"}
            </li>
            <li>
              <strong>Approval:</strong>{" "}
              {policy.approval.required
                ? `Required by ${APPROVER_LABELS[policy.approval.approverLevel].label}`
                : "Not required"}
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="sm"
          className="bg-stone-900 hover:bg-stone-700 text-white"
          disabled={policy.monetaryEnabled && !pointValueValid}
          onClick={onSave}
        >
          Save Appreciation Policy
        </Button>
      </div>
    </div>
  );
}
