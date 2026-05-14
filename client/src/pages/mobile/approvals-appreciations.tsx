import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmployeeLayout } from "@/components/employee-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge as UiBadge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Inbox } from "lucide-react";
import { getAccount } from "@/lib/account";
import { EMPLOYEES } from "@/lib/recognize-data";
import {
  getBadges,
  approveBadge,
  rejectBadge,
  type Badge,
} from "@/lib/badges";

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function ApprovalsAppreciations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const account = getAccount();

  const currentUser = useMemo(() => {
    if (!account) return undefined;
    const byEmail = EMPLOYEES.find(
      (e) => e.email.toLowerCase() === account.adminEmail.toLowerCase(),
    );
    return byEmail ?? EMPLOYEES[0];
  }, [account]);

  const approverId = currentUser?.id ?? "hr-admin";
  const [pending, setPending] = useState<Badge[]>(() =>
    getBadges().filter(
      (b) => b.status === "pending-approval" && b.pendingApproverId === approverId,
    ),
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  function refresh() {
    setPending(
      getBadges().filter(
        (b) => b.status === "pending-approval" && b.pendingApproverId === approverId,
      ),
    );
  }

  function handleApprove(badge: Badge) {
    approveBadge(badge.id, approverId);
    toast({
      title: "Approved",
      description: `${badge.fromName}'s appreciation for ${badge.toName} is now in the feed.`,
    });
    refresh();
  }

  function handleReject(badge: Badge) {
    const comment = rejectComment.trim();
    if (!comment) {
      toast({ title: "Reason required", description: "Add a short note so the sender knows why." });
      return;
    }
    rejectBadge(badge.id, approverId, comment);
    toast({
      title: "Rejected",
      description: `${badge.fromName} will be notified with your reason.`,
    });
    setRejectingId(null);
    setRejectComment("");
    refresh();
  }

  return (
    <EmployeeLayout
      title="Pending appreciations"
      showBack
      onBack={() => navigate(-1)}
      showRightRail={false}
    >
      <div className="px-5 md:px-0 pt-4 md:pt-0 pb-12 space-y-3">
        <p className="text-xs text-stone-500">
          Decide whether each appreciation should post to the feed. Rejecting requires a short reason.
        </p>

        {pending.length === 0 && (
          <Card className="border border-stone-200">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                <Inbox className="w-5 h-5 text-stone-400" />
              </div>
              <p className="text-sm text-stone-600">No appreciations need your review.</p>
            </CardContent>
          </Card>
        )}

        {pending.map((b) => (
          <Card key={b.id} className="border border-stone-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={b.fromAvatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {b.fromName} → {b.toName}
                  </p>
                  <p className="text-xs text-stone-500">{timeAgo(b.createdAt)}</p>
                </div>
                {b.badgeLabel && (
                  <UiBadge variant="secondary" className="bg-stone-100 text-stone-700 text-xs shrink-0">
                    {b.badgeLabel}
                  </UiBadge>
                )}
              </div>

              {b.message && (
                <p className="text-sm text-stone-700 bg-stone-50 rounded-lg p-3 border border-stone-100">
                  {b.message}
                </p>
              )}

              {rejectingId === b.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Reason (shared with the sender)"
                    rows={2}
                    className="text-sm border-stone-200 resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-stone-600"
                      onClick={() => {
                        setRejectingId(null);
                        setRejectComment("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 bg-red-600 hover:bg-red-700 text-white gap-1.5"
                      onClick={() => handleReject(b)}
                    >
                      <X className="w-3.5 h-3.5" /> Confirm reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 justify-end pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 border-stone-200 text-stone-700 gap-1.5"
                    onClick={() => {
                      setRejectingId(b.id);
                      setRejectComment("");
                    }}
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 bg-[#465853] hover:bg-[#3a4944] text-white gap-1.5"
                    onClick={() => handleApprove(b)}
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </EmployeeLayout>
  );
}
