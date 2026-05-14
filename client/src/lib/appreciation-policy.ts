import type { Account, AppreciationPolicy, ApprovalLevel } from "./account";
import { getAccount } from "./account";
import { EMPLOYEES, type Employee } from "./recognize-data";

export function isMonetaryActive(account: Account | null = getAccount()): boolean {
  return !!account?.appreciationPolicy?.monetaryEnabled;
}

export function isSendingWindowOpen(
  policy: AppreciationPolicy,
  now: Date = new Date(),
): boolean {
  if (policy.window.mode === "always") return true;
  const { startDate, endDate } = policy.window;
  if (!startDate || !endDate) return true;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
}

/**
 * When does the sending window next reopen?
 * - Always-open → null (no reopening, it's already open).
 * - Scheduled and currently inside the window → null.
 * - Scheduled and before the window → the startDate.
 * - Scheduled and after the window → null (the window has closed for good).
 */
export function nextWindowReopenAt(
  policy: AppreciationPolicy,
  now: Date = new Date(),
): Date | null {
  if (policy.window.mode === "always") return null;
  const { startDate } = policy.window;
  if (!startDate) return null;
  const start = new Date(startDate);
  if (now < start) return start;
  return null;
}

/**
 * Resolve an approver employee for the given sender based on the policy level.
 * Falls back to null when no one fits (caller should handle by auto-approving
 * or surfacing an error).
 */
export function resolveApprover(
  sender: Employee | undefined,
  level: ApprovalLevel,
  account: Account | null = getAccount(),
): Employee | null {
  if (!sender) return null;

  if (level === "direct-manager") {
    if (!sender.managerId) return null;
    return EMPLOYEES.find((e) => e.id === sender.managerId) ?? null;
  }

  if (level === "function-lead") {
    if (!sender.functionLeadId) return null;
    if (sender.functionLeadId === sender.id) return null;
    return EMPLOYEES.find((e) => e.id === sender.functionLeadId) ?? null;
  }

  if (level === "bu-head") {
    if (!sender.businessUnitId) return null;
    // Pick the most senior Director in the same BU who isn't the sender.
    const buMembers = EMPLOYEES.filter(
      (e) => e.businessUnitId === sender.businessUnitId && e.id !== sender.id,
    );
    const director = buMembers.find((e) => e.role.toLowerCase().includes("director"));
    return director ?? buMembers[0] ?? null;
  }

  if (level === "hr-admin") {
    if (!account) return null;
    // Synthesize an Employee from the account admin so the rest of the flow
    // can render an avatar / name without special-casing.
    return {
      id: "hr-admin",
      name: account.adminName,
      role: account.adminDesignation || "HR Admin",
      email: account.adminEmail,
      avatar: account.adminPhotoUrl || "/m/images/user02.png",
    };
  }

  return null;
}
