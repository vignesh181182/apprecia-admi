import type { Account } from "./account";
import type { Nomination, PanelMember } from "./programs-data";

export type ShortlistEntry = {
  nominationId: string;
  /** 0–100. */
  score: number;
  /** 1 = top. Assigned after sort. */
  rank: number;
  /** 2-3 sentence "AI" summary, deterministic. */
  reasoning: string;
  /** Bullet-form highlights pulled from the reason. */
  highlights: string[];
  /** Score breakdown for the inspector / audit log. */
  breakdown: ScoreBreakdown;
};

export type ScoreBreakdown = {
  managerApproval: number;
  panelApproval: number;
  reasonQuality: number;
  impactKeywords: number;
  timeliness: number;
  total: number;
};

export type ShortlistAuditEntry = {
  programId: string;
  cycleId: string;
  generatedAt: string;
  inputCount: number;
  entries: ShortlistEntry[];
};

const IMPACT_VERBS = [
  "saved", "delivered", "shipped", "led", "mentored", "fixed", "launched",
  "improved", "drove", "built", "owned", "scaled", "unblocked", "rescued",
];

const SCORE_WEIGHTS = {
  managerApproval: 25,
  panelApproval: 30,
  reasonQuality: 20,
  impactKeywords: 15,
  timeliness: 10,
};

// ─── Hashing (stable across runs) ─────────────────────────────────────

function simpleHash(s: string): number {
  let hash = 5381;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) + hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ─── Scoring components ───────────────────────────────────────────────

function managerApprovalScore(n: Nomination): number {
  if (n.status === "pending-manager") return 0;
  if (n.status === "rejected") return 0;
  // No manager-comment text on the Nomination; treat the presence of a
  // resolved manager (managerName + decidedAt) as "approved with positive
  // comment" → full weight, otherwise neutral.
  const positive = !!n.managerName && !!n.decidedAt;
  return positive ? SCORE_WEIGHTS.managerApproval : Math.floor(SCORE_WEIGHTS.managerApproval * 0.6);
}

/**
 * Without per-panelist votes, derive a deterministic ratio in [0.4, 1.0]
 * keyed by nomination id. Real implementations would replace this with
 * actual vote counts.
 */
export function panelApprovalRatio(nominationId: string, panelSize: number): number {
  if (panelSize <= 0) return 0;
  const h = simpleHash(`panel:${nominationId}`);
  // 0.4 + (0..0.6) so almost everyone gets some panel love but the spread
  // is wide enough for the ranking to differentiate.
  return Math.min(1, 0.4 + (h % 60) / 100);
}

function panelApprovalScore(n: Nomination, panel: PanelMember[]): number {
  const ratio = panelApprovalRatio(n.id, panel.length);
  return Math.round(ratio * SCORE_WEIGHTS.panelApproval);
}

function reasonQualityScore(reason: string): number {
  const len = reason.length;
  let base = 0;
  if (len >= 300) base = 15;
  else if (len >= 100) base = 10;
  else base = 0;

  let bonus = 0;
  if (/\d/.test(reason)) bonus += 3;
  const lower = reason.toLowerCase();
  let verbHits = 0;
  for (const v of IMPACT_VERBS) {
    const re = new RegExp(`\\b${v}\\b`, "g");
    const matches = lower.match(re);
    if (matches) verbHits += matches.length;
  }
  bonus += Math.min(20 - base, verbHits * 2);

  return Math.min(SCORE_WEIGHTS.reasonQuality, base + bonus);
}

function impactKeywordsScore(reason: string): number {
  const lower = reason.toLowerCase();
  let hits = 0;
  for (const v of IMPACT_VERBS) {
    const re = new RegExp(`\\b${v}\\b`, "g");
    const matches = lower.match(re);
    if (matches) hits += matches.length;
  }
  // 3 points per impact verb hit, capped at the impactKeywords budget.
  return Math.min(SCORE_WEIGHTS.impactKeywords, hits * 3);
}

function timelinessScore(n: Nomination, now: Date): number {
  const created = new Date(n.createdAt).getTime();
  const ageDays = (now.getTime() - created) / (1000 * 60 * 60 * 24);
  // Age within a typical 30-day cycle: earlier = better.
  if (ageDays <= 15) return SCORE_WEIGHTS.timeliness;
  if (ageDays <= 25) return Math.floor(SCORE_WEIGHTS.timeliness / 2);
  return 0;
}

export function scoreNomination(
  n: Nomination,
  panel: PanelMember[],
  now: Date = new Date(),
): ScoreBreakdown {
  const managerApproval = managerApprovalScore(n);
  const panelApproval = panelApprovalScore(n, panel);
  const reasonQuality = reasonQualityScore(n.reason);
  const impactKeywords = impactKeywordsScore(n.reason);
  const timeliness = timelinessScore(n, now);
  const total = managerApproval + panelApproval + reasonQuality + impactKeywords + timeliness;
  return { managerApproval, panelApproval, reasonQuality, impactKeywords, timeliness, total };
}

// ─── Reasoning generator ──────────────────────────────────────────────

function splitSentences(reason: string): string[] {
  return reason
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function rankSentence(s: string): number {
  const lower = s.toLowerCase();
  let verbHits = 0;
  for (const v of IMPACT_VERBS) {
    const re = new RegExp(`\\b${v}\\b`, "g");
    const matches = lower.match(re);
    if (matches) verbHits += matches.length;
  }
  const numberBonus = /\d/.test(s) ? 1 : 0;
  // Length matters but we don't want the longest sentence to always win —
  // use a soft ceiling.
  const lenScore = Math.min(20, s.length / 10);
  return verbHits * 5 + numberBonus * 3 + lenScore;
}

export function extractHighlights(reason: string): string[] {
  const sentences = splitSentences(reason);
  if (sentences.length === 0) return [];
  const ranked = sentences
    .map((text) => ({ text, weight: rankSentence(text) }))
    .sort((a, b) => b.weight - a.weight);
  return ranked.slice(0, Math.min(3, sentences.length)).map((r) => r.text);
}

function panelSentiment(ratio: number, panelSize: number): string {
  if (panelSize === 0) return "Approved by the panel lead.";
  if (ratio >= 0.9) return "Panel was unanimous in their support.";
  const approved = Math.max(1, Math.round(ratio * panelSize));
  if (approved === panelSize) return "Panel was unanimous in their support.";
  if (panelSize <= 2) return "Approved by manager and lead reviewer.";
  return `${approved} of ${panelSize} panel members approved this nomination.`;
}

export function generateReasoning(
  n: Nomination,
  score: number,
  highlights: string[],
  panel: PanelMember[],
): string {
  const ratio = panelApprovalRatio(n.id, panel.length);
  const opener = `${n.nomineeName} scored ${score}/100 for this category.`;
  const top = highlights[0] ?? n.reason.slice(0, 140);
  const second = highlights[1];
  const sentiment = panelSentiment(ratio, panel.length);
  return [
    opener,
    second ? `${stripPeriod(top)}. ${stripPeriod(second)}.` : `${stripPeriod(top)}.`,
    sentiment,
  ].join(" ");
}

function stripPeriod(s: string): string {
  return s.replace(/[.!?]+$/g, "");
}

// ─── Public entry point ───────────────────────────────────────────────

export function shortlistNominations(
  nominations: Nomination[],
  account: Account | null,
  panel: PanelMember[],
  now: Date = new Date(),
): ShortlistEntry[] {
  const _ = account; // reserved for future weighting (e.g., currency-aware bonuses)
  const eligible = nominations.filter(
    (n) => n.status === "approved" || n.status === "pending-panel",
  );

  const scored = eligible.map((n) => {
    const breakdown = scoreNomination(n, panel, now);
    const highlights = extractHighlights(n.reason);
    const reasoning = generateReasoning(n, breakdown.total, highlights, panel);
    return {
      nominationId: n.id,
      score: breakdown.total,
      rank: 0,
      reasoning,
      highlights,
      breakdown,
    } as ShortlistEntry;
  });

  // Stable sort: score desc, then nomination id asc to break ties deterministically.
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.nominationId.localeCompare(b.nominationId);
  });
  scored.forEach((e, i) => {
    e.rank = i + 1;
  });
  return scored;
}

// ─── Audit log ────────────────────────────────────────────────────────

function auditKey(programId: string, cycleId: string): string {
  return `engagex_ai_shortlist_log_${programId}_${cycleId}`;
}

export function writeShortlistAudit(
  programId: string,
  cycleId: string,
  entries: ShortlistEntry[],
  now: Date = new Date(),
): void {
  const record: ShortlistAuditEntry = {
    programId,
    cycleId,
    generatedAt: now.toISOString(),
    inputCount: entries.length,
    entries,
  };
  try {
    localStorage.setItem(auditKey(programId, cycleId), JSON.stringify(record));
  } catch {
    // localStorage might be full or denied — non-fatal for the demo.
  }
}

export function readShortlistAudit(
  programId: string,
  cycleId: string,
): ShortlistAuditEntry | null {
  try {
    const raw = localStorage.getItem(auditKey(programId, cycleId));
    if (!raw) return null;
    return JSON.parse(raw) as ShortlistAuditEntry;
  } catch {
    return null;
  }
}

// ─── Score distribution helper (for the chart above the shortlist) ───

export function scoreDistribution(
  entries: ShortlistEntry[],
  bucketSize = 10,
): { range: string; count: number }[] {
  const buckets: { range: string; count: number }[] = [];
  for (let lo = 0; lo < 100; lo += bucketSize) {
    const hi = Math.min(100, lo + bucketSize);
    buckets.push({ range: `${lo}-${hi}`, count: 0 });
  }
  for (const e of entries) {
    const idx = Math.min(buckets.length - 1, Math.floor(e.score / bucketSize));
    buckets[idx].count += 1;
  }
  return buckets;
}
