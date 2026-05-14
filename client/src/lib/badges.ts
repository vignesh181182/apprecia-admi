import type { Account, AppreciationPolicy } from "./account";
import { getAccount } from "./account";

export type BadgeStatus = "pending-approval" | "approved" | "rejected";

export type BadgeApprovalDecision = {
  decidedBy: string;
  decidedAt: string;
  comment?: string;
  approved: boolean;
};

/**
 * Minimal Badge shape introduced in Prompt 1.2. Prompt 1.4 will extend this
 * with categoryId/tier/reactions/comments/boosts. Until then, the existing
 * Recognize dialog stores its badge-id + label on the same record so the
 * approval inbox and feed can render meaningful info.
 */
export type Badge = {
  id: string;
  fromUserId: string;
  fromName: string;
  fromAvatar: string;
  toUserId: string;
  toName: string;
  toAvatar: string;
  badgeId?: string;
  badgeLabel?: string;
  message: string;
  points: number;
  kind: "appreciation" | "rnr";
  createdAt: string;
  status: BadgeStatus;
  pendingApproverId?: string;
  pendingApproverName?: string;
  approvalDecision?: BadgeApprovalDecision;
};

const KEY = "engagex_badges";

export function getBadges(): Badge[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Badge[];
  } catch {
    return [];
  }
}

function writeAll(badges: Badge[]): void {
  localStorage.setItem(KEY, JSON.stringify(badges));
}

export function saveBadge(badge: Badge): void {
  const all = getBadges();
  all.unshift(badge);
  writeAll(all);
}

export function updateBadge(id: string, patch: Partial<Badge>): Badge | null {
  const all = getBadges();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  const next = { ...all[idx], ...patch };
  all[idx] = next;
  writeAll(all);
  return next;
}

export function approveBadge(
  id: string,
  approverId: string,
  comment?: string,
): Badge | null {
  return updateBadge(id, {
    status: "approved",
    approvalDecision: {
      decidedBy: approverId,
      decidedAt: new Date().toISOString(),
      approved: true,
      comment,
    },
  });
}

export function rejectBadge(
  id: string,
  approverId: string,
  comment: string,
): Badge | null {
  return updateBadge(id, {
    status: "rejected",
    approvalDecision: {
      decidedBy: approverId,
      decidedAt: new Date().toISOString(),
      approved: false,
      comment,
    },
  });
}

export function getPendingForApprover(approverId: string): Badge[] {
  return getBadges().filter(
    (b) => b.status === "pending-approval" && b.pendingApproverId === approverId,
  );
}

/**
 * Scan pending badges and auto-approve any past the autoApproveAfterHours
 * threshold. No-op when the policy has approval off or no threshold set.
 */
export function processAppreciationAutoApprovals(
  account: Account | null = getAccount(),
  now: Date = new Date(),
): number {
  if (!account) return 0;
  const policy: AppreciationPolicy = account.appreciationPolicy;
  if (!policy?.approval?.required) return 0;
  const threshold = policy.approval.autoApproveAfterHours;
  if (!threshold || threshold <= 0) return 0;

  const all = getBadges();
  let count = 0;
  const next = all.map((b) => {
    if (b.status !== "pending-approval") return b;
    const ageMs = now.getTime() - new Date(b.createdAt).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    if (ageHours < threshold) return b;
    count += 1;
    return {
      ...b,
      status: "approved" as BadgeStatus,
      approvalDecision: {
        decidedBy: "system",
        decidedAt: now.toISOString(),
        approved: true,
        comment: `Auto-approved after ${threshold}h`,
      },
    };
  });
  if (count > 0) writeAll(next);
  return count;
}
