import type { Account } from "./account";
import type { Badge } from "./badges";
import type { Employee } from "./recognize-data";

export type DateRange = { start: Date; end: Date };

export type AppreciationStats = {
  utilization: { active: number; total: number; pct: number };
  approval: {
    pending: number;
    approved: number;
    rejected: number;
    avgDecisionHours: number;
    /** Avg hours from badge createdAt → first reaction. Used when approval is disabled. */
    avgFirstReactionHours: number;
  };
  totals: {
    badges: number;
    pointsCirculated: number;
    deltaBadges: number;
    deltaPoints: number;
  };
  topGiver: TopUser | null;
  topReceiver: TopUser | null;
  monthlyTrend: { month: string; label: string; badges: number; points: number }[];
  byDepartment: { department: string; avgPerEmployee: number; total: number; headcount: number }[];
  byCategory: { categoryId: string; categoryName: string; emoji?: string; color?: string; count: number }[];
  slowApprovers: { userId: string; userName: string; userAvatar: string; avgDecisionHours: number; backlog: number }[];
  underrecognized: {
    userId: string;
    userName: string;
    userRole: string;
    userAvatar: string;
    department: string;
    managerId?: string;
    managerName?: string;
    lastReceivedAt: string | null;
  }[];
};

export type TopUser = {
  userId: string;
  userName: string;
  userAvatar: string;
  count: number;
};

const DEFAULT_DEPT = "Unassigned";

function deptOf(emp: Employee | undefined): string {
  return emp?.businessUnitName?.trim() || DEFAULT_DEPT;
}

function inRange(iso: string, range: DateRange): boolean {
  const t = new Date(iso).getTime();
  return t >= range.start.getTime() && t <= range.end.getTime();
}

function hoursBetween(aIso: string, bIso: string): number {
  const ms = new Date(bIso).getTime() - new Date(aIso).getTime();
  return ms / (1000 * 60 * 60);
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function previousRange(range: DateRange): DateRange {
  const span = range.end.getTime() - range.start.getTime();
  return {
    start: new Date(range.start.getTime() - span - 1),
    end: new Date(range.start.getTime() - 1),
  };
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date): string {
  return d.toLocaleString("default", { month: "short" });
}

function topByUserId(
  badges: Badge[],
  pick: (b: Badge) => { id: string; name: string; avatar: string },
): TopUser | null {
  const counts = new Map<string, { name: string; avatar: string; count: number }>();
  for (const b of badges) {
    const u = pick(b);
    const prev = counts.get(u.id);
    if (prev) prev.count += 1;
    else counts.set(u.id, { name: u.name, avatar: u.avatar, count: 1 });
  }
  let top: TopUser | null = null;
  for (const [userId, v] of Array.from(counts.entries())) {
    if (!top || v.count > top.count) {
      top = { userId, userName: v.name, userAvatar: v.avatar, count: v.count };
    }
  }
  return top;
}

export function defaultDateRange(): DateRange {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0);
  return { start, end };
}

/**
 * Compute every Appreciation-tab stat from raw badges + employee directory.
 * Pure: no localStorage reads, no side effects.
 */
export function getAppreciationStats(
  badges: Badge[],
  employees: Employee[],
  range: DateRange,
  departmentFilter?: string[],
  account?: Account | null,
): AppreciationStats {
  const empById = new Map(employees.map((e) => [e.id, e]));
  const deptSet = departmentFilter && departmentFilter.length > 0 ? new Set(departmentFilter) : null;

  const employeesInScope = deptSet
    ? employees.filter((e) => deptSet.has(deptOf(e)))
    : employees;
  const inScopeIds = new Set(employeesInScope.map((e) => e.id));

  const appreciationBadges = badges.filter((b) => b.kind === "appreciation");

  // Filter by department membership of either sender or recipient when a
  // dept filter is set — keeps the chart honest for filtered views.
  function passesDept(b: Badge): boolean {
    if (!deptSet) return true;
    return inScopeIds.has(b.fromUserId) || inScopeIds.has(b.toUserId);
  }

  const inWindow = appreciationBadges.filter((b) => inRange(b.createdAt, range) && passesDept(b));
  const prev = previousRange(range);
  const inPrevWindow = appreciationBadges.filter((b) => inRange(b.createdAt, prev) && passesDept(b));

  // ── Utilization ──────────────────────────────────────────────────────
  const senders = new Set<string>();
  for (const b of inWindow) {
    if (b.status !== "rejected" && inScopeIds.has(b.fromUserId)) senders.add(b.fromUserId);
  }
  const totalEmployees = employeesInScope.length;
  const utilization = {
    active: senders.size,
    total: totalEmployees,
    pct: totalEmployees === 0 ? 0 : Math.round((senders.size / totalEmployees) * 100),
  };

  // ── Approval ─────────────────────────────────────────────────────────
  const pending = inWindow.filter((b) => b.status === "pending-approval").length;
  const approved = inWindow.filter((b) => b.status === "approved").length;
  const rejected = inWindow.filter((b) => b.status === "rejected").length;
  const decisionTimes = inWindow
    .filter((b) => b.approvalDecision && b.approvalDecision.decidedAt)
    .map((b) => hoursBetween(b.createdAt, b.approvalDecision!.decidedAt));
  const reactionTimes = inWindow
    .filter((b) => b.status === "approved")
    .map((b) => {
      const all: number[] = [];
      for (const list of Object.values(b.reactions ?? {})) {
        for (const _ of list) {
          // Reactions don't carry timestamps; skip if we ever introduce them.
        }
      }
      const firstComment = (b.comments ?? [])[0];
      if (firstComment) all.push(hoursBetween(b.createdAt, firstComment.createdAt));
      return all[0];
    })
    .filter((n): n is number => typeof n === "number" && !Number.isNaN(n));

  const approval = {
    pending,
    approved,
    rejected,
    avgDecisionHours: Math.round(avg(decisionTimes) * 10) / 10,
    avgFirstReactionHours: Math.round(avg(reactionTimes) * 10) / 10,
  };

  // ── Totals + delta ───────────────────────────────────────────────────
  const countedNow = inWindow.filter((b) => b.status !== "rejected");
  const countedPrev = inPrevWindow.filter((b) => b.status !== "rejected");
  const pointsNow = countedNow.reduce((s, b) => s + (b.points || 0), 0);
  const pointsPrev = countedPrev.reduce((s, b) => s + (b.points || 0), 0);
  const totals = {
    badges: countedNow.length,
    pointsCirculated: pointsNow,
    deltaBadges: countedNow.length - countedPrev.length,
    deltaPoints: pointsNow - pointsPrev,
  };

  // ── Top giver / receiver ─────────────────────────────────────────────
  const topGiver = topByUserId(countedNow, (b) => ({
    id: b.fromUserId,
    name: b.fromName,
    avatar: b.fromAvatar,
  }));
  const topReceiver = topByUserId(countedNow, (b) => ({
    id: b.toUserId,
    name: b.toName,
    avatar: b.toAvatar,
  }));

  // ── 12-month trend ───────────────────────────────────────────────────
  const trendBuckets = new Map<string, { label: string; badges: number; points: number }>();
  const trendEnd = new Date(range.end.getFullYear(), range.end.getMonth(), 1);
  for (let i = 11; i >= 0; i--) {
    const d = new Date(trendEnd.getFullYear(), trendEnd.getMonth() - i, 1);
    trendBuckets.set(monthKey(d), { label: monthLabel(d), badges: 0, points: 0 });
  }
  const trendStart = new Date(trendEnd.getFullYear(), trendEnd.getMonth() - 11, 1);
  for (const b of appreciationBadges) {
    if (b.status === "rejected") continue;
    if (!passesDept(b)) continue;
    const t = new Date(b.createdAt);
    if (t < trendStart) continue;
    const key = monthKey(t);
    const bucket = trendBuckets.get(key);
    if (!bucket) continue;
    bucket.badges += 1;
    bucket.points += b.points || 0;
  }
  const monthlyTrend = Array.from(trendBuckets.entries()).map(([month, v]) => ({
    month,
    label: v.label,
    badges: v.badges,
    points: v.points,
  }));

  // ── By department ────────────────────────────────────────────────────
  const deptHeadcount = new Map<string, number>();
  for (const e of employeesInScope) {
    const k = deptOf(e);
    deptHeadcount.set(k, (deptHeadcount.get(k) || 0) + 1);
  }
  const deptBadgeCount = new Map<string, number>();
  for (const b of countedNow) {
    const recipient = empById.get(b.toUserId);
    const k = deptOf(recipient);
    if (deptSet && !deptSet.has(k)) continue;
    deptBadgeCount.set(k, (deptBadgeCount.get(k) || 0) + 1);
  }
  const byDepartment = Array.from(deptHeadcount.entries())
    .map(([department, headcount]) => {
      const total = deptBadgeCount.get(department) || 0;
      return {
        department,
        headcount,
        total,
        avgPerEmployee: headcount === 0 ? 0 : Math.round((total / headcount) * 10) / 10,
      };
    })
    .sort((a, b) => b.avgPerEmployee - a.avgPerEmployee);

  // ── By category (top 6) ──────────────────────────────────────────────
  const catCounts = new Map<string, { count: number; name: string }>();
  for (const b of countedNow) {
    const id = b.categoryId || b.badgeId;
    if (!id) continue;
    const name = b.categoryName || b.badgeLabel || id;
    const prev = catCounts.get(id);
    if (prev) prev.count += 1;
    else catCounts.set(id, { count: 1, name });
  }
  const categoryMeta = new Map<string, { emoji?: string; color?: string; name?: string }>();
  for (const cat of account?.recognitionCategories ?? []) {
    categoryMeta.set(cat.id, { emoji: cat.emoji, color: cat.color, name: cat.name });
  }
  const byCategory = Array.from(catCounts.entries())
    .map(([categoryId, v]) => {
      const meta = categoryMeta.get(categoryId);
      return {
        categoryId,
        categoryName: meta?.name || v.name,
        emoji: meta?.emoji,
        color: meta?.color,
        count: v.count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // ── Slow approvers ───────────────────────────────────────────────────
  const approverDecisionTimes = new Map<string, number[]>();
  const approverBacklog = new Map<string, number>();
  const approverNames = new Map<string, { name: string; avatar: string }>();
  for (const b of inWindow) {
    if (b.status === "approved" || b.status === "rejected") {
      if (!b.approvalDecision || b.approvalDecision.decidedBy === "system") continue;
      const key = b.approvalDecision.decidedBy;
      const list = approverDecisionTimes.get(key) || [];
      list.push(hoursBetween(b.createdAt, b.approvalDecision.decidedAt));
      approverDecisionTimes.set(key, list);
    }
    if (b.status === "pending-approval" && b.pendingApproverId) {
      approverBacklog.set(
        b.pendingApproverId,
        (approverBacklog.get(b.pendingApproverId) || 0) + 1,
      );
      if (b.pendingApproverName) {
        const emp = empById.get(b.pendingApproverId);
        approverNames.set(b.pendingApproverId, {
          name: b.pendingApproverName,
          avatar: emp?.avatar || "",
        });
      }
    }
  }
  const slowApprovers = Array.from(approverDecisionTimes.entries())
    .map(([userId, times]) => {
      const emp = empById.get(userId);
      const name = emp?.name || approverNames.get(userId)?.name || userId;
      const avatar = emp?.avatar || approverNames.get(userId)?.avatar || "";
      return {
        userId,
        userName: name,
        userAvatar: avatar,
        avgDecisionHours: Math.round(avg(times) * 10) / 10,
        backlog: approverBacklog.get(userId) || 0,
      };
    })
    .sort((a, b) => b.avgDecisionHours - a.avgDecisionHours)
    .slice(0, 3);

  // ── Underrecognized ──────────────────────────────────────────────────
  const lastReceived = new Map<string, string>();
  for (const b of appreciationBadges) {
    if (b.status === "rejected") continue;
    const prev = lastReceived.get(b.toUserId);
    if (!prev || new Date(b.createdAt) > new Date(prev)) {
      lastReceived.set(b.toUserId, b.createdAt);
    }
  }
  const receivedInWindow = new Set(countedNow.map((b) => b.toUserId));
  const underrecognized = employeesInScope
    .filter((e) => !receivedInWindow.has(e.id))
    .map((e) => {
      const manager = e.managerId ? empById.get(e.managerId) : undefined;
      return {
        userId: e.id,
        userName: e.name,
        userRole: e.role,
        userAvatar: e.avatar,
        department: deptOf(e),
        managerId: e.managerId,
        managerName: manager?.name,
        lastReceivedAt: lastReceived.get(e.id) || null,
      };
    })
    .sort((a, b) => {
      const aT = a.lastReceivedAt ? new Date(a.lastReceivedAt).getTime() : 0;
      const bT = b.lastReceivedAt ? new Date(b.lastReceivedAt).getTime() : 0;
      return aT - bT;
    });

  return {
    utilization,
    approval,
    totals,
    topGiver,
    topReceiver,
    monthlyTrend,
    byDepartment,
    byCategory,
    slowApprovers,
    underrecognized,
  };
}

// ─── Date-range presets ────────────────────────────────────────────────

export type DateRangePresetId =
  | "this-month"
  | "last-month"
  | "last-3-months"
  | "this-year"
  | "custom";

export function presetRange(id: Exclude<DateRangePresetId, "custom">, now: Date = new Date()): DateRange {
  const end = new Date(now);
  if (id === "this-month") {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
  }
  if (id === "last-month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return { start, end: last };
  }
  if (id === "last-3-months") {
    return { start: new Date(now.getFullYear(), now.getMonth() - 2, 1), end };
  }
  // this-year
  return { start: new Date(now.getFullYear(), 0, 1), end };
}

export function listDepartments(employees: Employee[]): string[] {
  const set = new Set<string>();
  for (const e of employees) set.add(deptOf(e));
  return Array.from(set).sort();
}

export function formatRangeLabel(range: DateRange): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(range.start)} → ${fmt(range.end)}`;
}
