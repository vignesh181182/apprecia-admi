const APPROVERS_KEY = "engagex_approval_panel";

const DEFAULT_APPROVER_IDS: string[] = ["2", "4"];

export function getApproverIds(): string[] {
  if (typeof window === "undefined") return DEFAULT_APPROVER_IDS;
  const raw = window.localStorage.getItem(APPROVERS_KEY);
  if (!raw) return DEFAULT_APPROVER_IDS;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : DEFAULT_APPROVER_IDS;
  } catch {
    return DEFAULT_APPROVER_IDS;
  }
}

export function setApproverIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(APPROVERS_KEY, JSON.stringify(ids));
}

export function addApprover(id: string): string[] {
  const current = getApproverIds();
  if (current.includes(id)) return current;
  const next = [...current, id];
  setApproverIds(next);
  return next;
}

export function removeApprover(id: string): string[] {
  const next = getApproverIds().filter((x) => x !== id);
  setApproverIds(next);
  return next;
}
