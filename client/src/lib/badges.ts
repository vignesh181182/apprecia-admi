import type { Account, AppreciationPolicy } from "./account";
import { getAccount } from "./account";
import { creditReceive, deductGive } from "./wallet";

export type BadgeStatus = "pending-approval" | "approved" | "rejected";
export type BadgeTier = "thanks" | "goodJob" | "exceptional";

export type BadgeApprovalDecision = {
  decidedBy: string;
  decidedAt: string;
  comment?: string;
  approved: boolean;
};

export type BadgeComment = {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
};

export type BadgeBoost = {
  fromUserId: string;
  fromName?: string;
  addedPoints: number;
  message: string;
  createdAt: string;
};

export type Badge = {
  id: string;
  fromUserId: string;
  fromName: string;
  fromAvatar: string;
  toUserId: string;
  toName: string;
  toAvatar: string;

  /** Appreciation badges: the chosen recognitionCategories[].id. RnR badges
   *  may leave this blank and fall back to badgeId/badgeLabel below. */
  categoryId?: string;
  categoryName?: string;
  categoryEmoji?: string;

  /** Appreciation tier — undefined for rnr-style nominations. */
  tier?: BadgeTier;

  /** Legacy badge metadata kept for rnr mode and the existing feed seed. */
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

  reactions: Record<string, string[]>;
  comments: BadgeComment[];
  boosts: BadgeBoost[];
};

const KEY = "engagex_badges";

function ensureSocialFields(b: Badge): Badge {
  return {
    ...b,
    reactions: b.reactions ?? {},
    comments: b.comments ?? [],
    boosts: b.boosts ?? [],
  };
}

export function getBadges(): Badge[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Badge[]).map(ensureSocialFields);
  } catch {
    return [];
  }
}

function writeAll(badges: Badge[]): void {
  localStorage.setItem(KEY, JSON.stringify(badges));
}

export function saveBadge(badge: Badge): void {
  const all = getBadges();
  all.unshift(ensureSocialFields(badge));
  writeAll(all);
}

export function updateBadge(id: string, patch: Partial<Badge>): Badge | null {
  const all = getBadges();
  const idx = all.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  const next = ensureSocialFields({ ...all[idx], ...patch });
  all[idx] = next;
  writeAll(all);
  return next;
}

/**
 * Approve a pending appreciation. This is also where the deferred wallet
 * movement happens: deduct the sender's give-balance, credit the receiver's
 * redeemable balance, then flip the status. Both calls are no-ops when
 * monetary recognition is disabled at the org level.
 *
 * The sender's role isn't recorded on the badge, so we default to
 * "employee" for the wallet lookup. The role only influences the *allowance*
 * snapshot in the wallet record; the deduction itself just decreases
 * giveBalance. If wallet allowances ever depend on the actual role at
 * approval time, store sender's role on the badge at send time.
 */
export function approveBadge(
  id: string,
  approverId: string,
  comment?: string,
  account: Account | null = getAccount(),
): Badge | null {
  const badge = getBadges().find((b) => b.id === id);
  if (!badge) return null;

  if (badge.kind === "appreciation" && badge.points > 0) {
    deductGive(badge.fromUserId, "employee", badge.points, account);
    creditReceive(badge.toUserId, badge.points, account);
  }

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

/** Toggle the given user's reaction with a specific emoji on a badge. */
export function toggleReaction(badgeId: string, userId: string, emoji: string): Badge | null {
  const all = getBadges();
  const idx = all.findIndex((b) => b.id === badgeId);
  if (idx === -1) return null;
  const badge = all[idx];
  const list = badge.reactions[emoji] ?? [];
  const exists = list.includes(userId);
  const nextList = exists ? list.filter((u) => u !== userId) : [...list, userId];
  const nextReactions = { ...badge.reactions, [emoji]: nextList };
  if (nextList.length === 0) delete nextReactions[emoji];
  const next = { ...badge, reactions: nextReactions };
  all[idx] = next;
  writeAll(all);
  return next;
}

export function addComment(badgeId: string, comment: BadgeComment): Badge | null {
  const all = getBadges();
  const idx = all.findIndex((b) => b.id === badgeId);
  if (idx === -1) return null;
  const next = { ...all[idx], comments: [...all[idx].comments, comment] };
  all[idx] = next;
  writeAll(all);
  return next;
}

export function addBoost(
  badgeId: string,
  boost: BadgeBoost,
  account: Account | null = getAccount(),
): Badge | null {
  const all = getBadges();
  const idx = all.findIndex((b) => b.id === badgeId);
  if (idx === -1) return null;
  const target = all[idx];
  // Block double-boost from the same user.
  if (target.boosts.some((b) => b.fromUserId === boost.fromUserId)) return target;

  if (boost.addedPoints > 0) {
    deductGive(boost.fromUserId, "employee", boost.addedPoints, account);
    creditReceive(target.toUserId, boost.addedPoints, account);
  }

  const next = {
    ...target,
    boosts: [...target.boosts, boost],
    points: target.points + boost.addedPoints,
  };
  all[idx] = next;
  writeAll(all);
  return next;
}

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

    // Run the same deferred wallet movement as a manual approval.
    if (b.kind === "appreciation" && b.points > 0) {
      deductGive(b.fromUserId, "employee", b.points, account);
      creditReceive(b.toUserId, b.points, account);
    }

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
