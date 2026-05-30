import type { Account } from "./account";
import type {
  CategoryCriterion,
  CategoryGuidelines,
  Nomination,
  PanelMember,
  ProgramCategory,
} from "./programs-data";

export type CriterionBreakdown = {
  criterionId: string;
  label: string;
  /** 0–100, raw sub-score before weight. */
  score: number;
  /** 0–100, the category's weight on this criterion. */
  weight: number;
};

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
  /** Phase 1.8 — per-criterion sub-scores when scoring against a category rubric. */
  criteriaBreakdown: CriterionBreakdown[];
};

export type ScoreBreakdown = {
  managerApproval: number;
  panelApproval: number;
  reasonQuality: number;
  impactKeywords: number;
  /** Phase 1.8 — when scoring against a category rubric this replaces reasonQuality+impactKeywords. */
  criteria: number;
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

// Phase 1.8 — when scoring against a category rubric, criteria replace the
// reasonQuality + impactKeywords share (35 points). Manager / panel / timeliness
// are unchanged so the total still sums to 100.
const CRITERIA_BUDGET = SCORE_WEIGHTS.reasonQuality + SCORE_WEIGHTS.impactKeywords;

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "what", "how", "who", "why",
  "into", "onto", "their", "they", "them", "have", "has", "had", "was", "were",
  "will", "would", "could", "should", "than", "then", "when", "where",
  "look", "looks", "look's", "looking", "good", "great", "well", "really",
  "very", "much", "more", "most", "less", "least", "any", "all", "some",
  "your", "you", "our", "ours", "his", "her", "him", "she", "ours",
  "value", "values", "people", "person", "team", "teams", "work", "works",
  "make", "makes", "made", "doing", "does", "done", "did", "get", "gets",
  "lookslike", "criteria", "criterion", "rubric",
]);

function extractKeywords(text: string): string[] {
  const out = new Set<string>();
  for (const raw of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 4) continue;
    if (STOPWORDS.has(raw)) continue;
    out.add(raw);
  }
  return Array.from(out);
}

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

/**
 * Score a single criterion 0–100 against the nomination reason. Deterministic.
 * Uses the criterion's label + description as keyword seeds; the IMPACT_VERBS
 * list contributes a small universal floor so a strong reason still scores
 * even when the rubric is sparse.
 */
export function scoreCriterion(criterion: CategoryCriterion, reason: string): number {
  const keywords = extractKeywords(`${criterion.label} ${criterion.description}`);
  const lower = reason.toLowerCase();

  let keywordHits = 0;
  for (const k of keywords) {
    const re = new RegExp(`\\b${k}\\b`, "g");
    const m = lower.match(re);
    if (m) keywordHits += m.length;
  }
  const keywordScore = keywords.length === 0 ? 30 : Math.min(60, keywordHits * 15);

  let verbHits = 0;
  for (const v of IMPACT_VERBS) {
    const re = new RegExp(`\\b${v}\\b`, "g");
    const m = lower.match(re);
    if (m) verbHits += m.length;
  }
  const verbScore = Math.min(25, verbHits * 5);

  let lengthBonus = 0;
  if (reason.length >= 300) lengthBonus = 15;
  else if (reason.length >= 100) lengthBonus = 8;

  return Math.min(100, keywordScore + verbScore + lengthBonus);
}

export function scoreNomination(
  n: Nomination,
  panel: PanelMember[],
  options: { guidelines?: CategoryGuidelines | null; now?: Date } = {},
): { breakdown: ScoreBreakdown; criteriaBreakdown: CriterionBreakdown[] } {
  const now = options.now ?? new Date();
  const managerApproval = managerApprovalScore(n);
  const panelApproval = panelApprovalScore(n, panel);
  const timeliness = timelinessScore(n, now);

  const guidelines = options.guidelines;
  if (guidelines && guidelines.criteria.length > 0) {
    // Phase 1.8 — score against the category's rubric. Criteria budget
    // (35 pts) replaces the legacy reasonQuality + impactKeywords share.
    const weightSum = guidelines.criteria.reduce((s, c) => s + c.weight, 0) || 1;
    const criteriaBreakdown: CriterionBreakdown[] = guidelines.criteria.map((c) => ({
      criterionId: c.id,
      label: c.label,
      score: scoreCriterion(c, n.reason),
      weight: c.weight,
    }));
    const weighted =
      criteriaBreakdown.reduce((s, c) => s + (c.score * c.weight) / 100, 0) / weightSum * 100;
    const criteria = Math.round((weighted / 100) * CRITERIA_BUDGET);
    const total = managerApproval + panelApproval + criteria + timeliness;
    return {
      breakdown: {
        managerApproval,
        panelApproval,
        reasonQuality: 0,
        impactKeywords: 0,
        criteria,
        timeliness,
        total,
      },
      criteriaBreakdown,
    };
  }

  // Original (pre-1.8) scoring when no rubric is provided.
  const reasonQuality = reasonQualityScore(n.reason);
  const impactKeywords = impactKeywordsScore(n.reason);
  const total = managerApproval + panelApproval + reasonQuality + impactKeywords + timeliness;
  return {
    breakdown: {
      managerApproval,
      panelApproval,
      reasonQuality,
      impactKeywords,
      criteria: 0,
      timeliness,
      total,
    },
    criteriaBreakdown: [],
  };
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
  criteria: CriterionBreakdown[] = [],
): string {
  const ratio = panelApprovalRatio(n.id, panel.length);
  const opener = `${n.nomineeName} scored ${score}/100 for this category.`;
  const top = highlights[0] ?? n.reason.slice(0, 140);
  const second = highlights[1];
  const sentiment = panelSentiment(ratio, panel.length);

  // Phase 1.8 — when scoring against a category rubric, point at the
  // strongest and weakest criteria by name so the panel sees why this
  // nomination scored where it did.
  let rubricNote = "";
  if (criteria.length > 0) {
    const sorted = [...criteria].sort((a, b) => b.score - a.score);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    if (sorted.length >= 2 && strongest.score - weakest.score >= 20) {
      rubricNote = ` Strong on ${strongest.label} (${strongest.score}/100) but light on ${weakest.label} (${weakest.score}/100).`;
    } else {
      rubricNote = ` Consistent across the rubric — top on ${strongest.label} (${strongest.score}/100).`;
    }
  }

  return [
    opener,
    second ? `${stripPeriod(top)}. ${stripPeriod(second)}.` : `${stripPeriod(top)}.`,
    sentiment + rubricNote,
  ].join(" ");
}

function stripPeriod(s: string): string {
  return s.replace(/[.!?]+$/g, "");
}

// ─── Public entry point ───────────────────────────────────────────────

export type ShortlistOptions = {
  /** Phase 1.8 — score against this category's rubric. */
  guidelines?: CategoryGuidelines | null;
  now?: Date;
};

export function shortlistNominations(
  nominations: Nomination[],
  account: Account | null,
  panel: PanelMember[],
  options: ShortlistOptions | Date = {},
): ShortlistEntry[] {
  const _ = account; // reserved for future weighting (e.g., currency-aware bonuses)
  // Backwards compat: old callers passed `now: Date` as the 4th arg.
  const opts: ShortlistOptions =
    options instanceof Date ? { now: options } : options;
  const guidelines = opts.guidelines ?? null;
  const now = opts.now ?? new Date();

  const eligible = nominations.filter(
    (n) => n.status === "approved" || n.status === "pending-panel",
  );

  const scored = eligible.map((n) => {
    const { breakdown, criteriaBreakdown } = scoreNomination(n, panel, {
      guidelines,
      now,
    });
    const highlights = extractHighlights(n.reason);
    const reasoning = generateReasoning(
      n,
      breakdown.total,
      highlights,
      panel,
      criteriaBreakdown,
    );
    return {
      nominationId: n.id,
      score: breakdown.total,
      rank: 0,
      reasoning,
      highlights,
      breakdown,
      criteriaBreakdown,
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

/**
 * Phase 1.8 — score nominations per category, using each category's own
 * guidelines and panel. Returns a map keyed by category id. Nominations
 * without a matching categoryId fall through to the first category as a
 * fallback so legacy data still shortlists.
 *
 * Pass an empty `categories` array to bypass per-category scoring; the
 * caller can fall back to the unscoped `shortlistNominations()`.
 */
export function shortlistByCategory(
  nominations: Nomination[],
  account: Account | null,
  categories: ProgramCategory[],
  now: Date = new Date(),
): Map<string, ShortlistEntry[]> {
  const out = new Map<string, ShortlistEntry[]>();
  if (categories.length === 0) return out;

  const fallbackId = categories[0].id;
  const validIds = new Set(categories.map((c) => c.id));

  // Bucket nominations by category id (with fallback) before scoring so the
  // per-category rubric only sees its own nominees.
  const buckets = new Map<string, Nomination[]>();
  for (const c of categories) buckets.set(c.id, []);
  for (const n of nominations) {
    const target = n.categoryId && validIds.has(n.categoryId) ? n.categoryId : fallbackId;
    buckets.get(target)!.push(n);
  }

  for (const c of categories) {
    const noms = buckets.get(c.id) ?? [];
    if (noms.length === 0) {
      out.set(c.id, []);
      continue;
    }
    out.set(
      c.id,
      shortlistNominations(noms, account, c.panel ?? [], {
        guidelines: c.guidelines ?? null,
        now,
      }),
    );
  }
  return out;
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
