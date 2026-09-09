// ──────────────────────────────────────────────────────────────────────
// HR assistant — answers questions about the account from the data the app
// already holds (badges, employees, policy). There is no model behind this:
// intents are pattern-matched and the numbers come from `dashboard-stats`,
// the same source the dashboard cards read, so answers can never drift from
// what the HR admin sees on screen.
//
// `askAssistant` is deliberately async and side-effect free — swapping it for
// a real model call later means changing this one function, not the UI.
// ──────────────────────────────────────────────────────────────────────
import { getBadges } from "@/lib/badges";
import { EMPLOYEES } from "@/lib/recognize-data";
import { getAccount } from "@/lib/account";
import {
  getAppreciationStats,
  presetRange,
  type AppreciationStats,
  type DateRange,
} from "@/lib/dashboard-stats";

export type AssistantRole = "user" | "assistant";

export type AssistantLink = {
  label: string;
  /** Router path, e.g. "/approvals". */
  to: string;
};

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  text: string;
  links?: AssistantLink[];
  ts: number;
};

export type AssistantReply = {
  text: string;
  links?: AssistantLink[];
};

const THREAD_KEY = "engagex_assistant_thread";

export const SUGGESTED_PROMPTS = [
  "What needs my attention?",
  "How are we tracking this month?",
  "Who hasn't been recognised?",
  "Which department recognises most?",
];

// ── formatting helpers ────────────────────────────────────────────────

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

function num(n: number): string {
  return Math.round(n).toLocaleString();
}

function delta(n: number): string {
  if (n === 0) return "flat vs the previous period";
  const dir = n > 0 ? "up" : "down";
  return `${dir} ${num(Math.abs(n))} vs the previous period`;
}

function hours(h: number): string {
  if (h <= 0) return "—";
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)} days`;
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function list(items: string[], max = 3): string {
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  const joined =
    shown.length <= 1
      ? shown.join("")
      : `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
  return rest > 0 ? `${joined} (+${rest} more)` : joined;
}

// ── context ───────────────────────────────────────────────────────────

type Ctx = {
  stats: AppreciationStats;
  range: DateRange;
  rangeLabel: string;
  headcount: number;
  departments: string[];
  account: ReturnType<typeof getAccount>;
};

function buildContext(): Ctx {
  const account = getAccount();
  const range = presetRange("this-month");
  const stats = getAppreciationStats(getBadges(), EMPLOYEES, range, undefined, account);
  const departments = Array.from(
    new Set(EMPLOYEES.map((e) => e.businessUnitName?.trim()).filter(Boolean) as string[]),
  );
  return {
    stats,
    range,
    // Always a month-to-date window, so say so plainly rather than printing
    // the raw date span into every sentence.
    rangeLabel: "this month",
    headcount: EMPLOYEES.length,
    departments,
    account,
  };
}

// ── intents ───────────────────────────────────────────────────────────

type Intent = {
  id: string;
  test: RegExp;
  run: (ctx: Ctx) => AssistantReply;
};

const INTENTS: Intent[] = [
  {
    id: "attention",
    test: /\b(?:attention|urgent|todo|to do|what should i|priorit|action|stuck|blocked)\w*/,
    run: ({ stats, rangeLabel }) => {
      const bits: string[] = [];
      const links: AssistantLink[] = [];

      if (stats.approval.pending > 0) {
        bits.push(`${plural(stats.approval.pending, "appreciation")} waiting for approval`);
        links.push({ label: "Review approvals", to: "/approvals" });
      }
      const slow = stats.slowApprovers.filter((a) => a.backlog > 0);
      if (slow.length > 0) {
        bits.push(
          `${list(slow.map((a) => `${a.userName} (${a.backlog} in queue, ~${hours(a.avgDecisionHours)} to decide)`))} are slowing decisions down`,
        );
      }
      const missed = stats.underrecognized.length;
      if (missed > 0) {
        bits.push(missed === 1 ? "1 person has received nothing" : `${missed} people have received nothing`);
        links.push({ label: "See employees", to: "/employees" });
      }
      if (stats.utilization.pct < 50) {
        bits.push(
          `participation is only ${stats.utilization.pct}% (${stats.utilization.active} of ${stats.utilization.total} active)`,
        );
      }

      if (bits.length === 0) {
        return {
          text: `Nothing is blocked for ${rangeLabel} — no pending approvals, and everyone has received at least one appreciation.`,
        };
      }
      return { text: `For ${rangeLabel}, ${list(bits, 4)}.`, links };
    },
  },
  {
    id: "approvals",
    test: /\b(?:approval|approve|approver|pending|waiting|queue|reject|decision)\w*/,
    run: ({ stats, rangeLabel }) => {
      const a = stats.approval;
      const decided = a.approved + a.rejected;
      const text =
        `For ${rangeLabel}: ${plural(a.pending, "appreciation")} pending, ${num(a.approved)} approved, ${num(a.rejected)} rejected. ` +
        (decided > 0
          ? `Average time to a decision is ${hours(a.avgDecisionHours)}.`
          : `Nothing has been decided yet in this window.`);
      return { text, links: [{ label: "Open approvals", to: "/approvals" }] };
    },
  },
  {
    id: "volume",
    test: /\b(?:how many|volume|total|recognition|appreciation|badge|sent|given|count|tracking|doing|this month)\w*/,
    run: ({ stats, rangeLabel }) => {
      const t = stats.totals;
      return {
        text:
          `${num(t.badges)} appreciations were sent in ${rangeLabel} (${delta(t.deltaBadges)}), ` +
          `carrying ${num(t.pointsCirculated)} points (${delta(t.deltaPoints)}). ` +
          `${stats.utilization.active} of ${stats.utilization.total} employees took part — ${stats.utilization.pct}% participation.`,
        links: [{ label: "Open dashboard", to: "/" }],
      };
    },
  },
  {
    id: "points",
    test: /\b(?:point|budget|spend|cost|money|currenc|allowance|circulat)\w*/,
    run: ({ stats, account, rangeLabel }) => {
      const pv = account?.appreciationPolicy.pointValue;
      const monetary = account?.appreciationPolicy.monetaryEnabled;
      const worth =
        monetary && pv && pv.points > 0
          ? ` At ${pv.points} pts = ${account?.currency ?? ""}${pv.amount}, that is about ${account?.currency ?? ""}${num((stats.totals.pointsCirculated / pv.points) * pv.amount)}.`
          : ` Monetary value is turned off, so points are recognition-only.`;
      return {
        text: `${num(stats.totals.pointsCirculated)} points circulated in ${rangeLabel} (${delta(stats.totals.deltaPoints)}).${worth}`,
        links: [{ label: "Budget settings", to: "/budget" }],
      };
    },
  },
  {
    id: "top-people",
    test: /\b(?:top|most|best|leader|leaderboard|rank|who gives|who received|star)\w*/,
    run: ({ stats, rangeLabel }) => {
      const g = stats.topGiver;
      const r = stats.topReceiver;
      if (!g && !r) {
        return { text: `No appreciations have been sent in ${rangeLabel} yet, so there is no leader board to report.` };
      }
      const parts: string[] = [];
      if (g) parts.push(`${g.userName} gave the most (${plural(g.count, "appreciation")})`);
      if (r) parts.push(`${r.userName} received the most (${plural(r.count, "appreciation")})`);
      return { text: `In ${rangeLabel}, ${list(parts, 2)}.`, links: [{ label: "See employees", to: "/employees" }] };
    },
  },
  {
    id: "underrecognized",
    test: /\b(?:under-?recognis|under-?recogniz|nobody|no one|noone|missed|ignored|left out|hasn'?t|haven'?t|havent|never|forgotten|neglect)\w*/,
    run: ({ stats, rangeLabel }) => {
      const u = stats.underrecognized;
      if (u.length === 0) {
        return { text: `Everyone has received at least one appreciation — nothing to flag for ${rangeLabel}.` };
      }
      const withAge = u.map((p) => {
        const d = daysSince(p.lastReceivedAt);
        return d === null ? `${p.userName} (never)` : `${p.userName} (${plural(d, "day")} ago)`;
      });
      return {
        text:
          `${u.length === 1 ? "1 person has" : `${u.length} people have`} gone without recognition: ` +
          `${list(withAge, 4)}.`,
        links: [{ label: "See employees", to: "/employees" }],
      };
    },
  },
  {
    id: "departments",
    test: /\b(?:department|team|business unit|function|group|division)\w*/,
    run: ({ stats, rangeLabel }) => {
      const rows = [...stats.byDepartment].sort((a, b) => b.avgPerEmployee - a.avgPerEmployee);
      if (rows.length === 0) return { text: `There is no department activity to report for ${rangeLabel}.` };
      const best = rows[0];
      const worst = rows[rows.length - 1];
      const text =
        `Per head in ${rangeLabel}, ${best.department} leads with ${best.avgPerEmployee.toFixed(1)} appreciations per employee ` +
        `(${num(best.total)} across ${plural(best.headcount, "person", "people")})` +
        (rows.length > 1
          ? `, and ${worst.department} trails at ${worst.avgPerEmployee.toFixed(1)}.`
          : `.`);
      return { text, links: [{ label: "Open analytics", to: "/analytics" }] };
    },
  },
  {
    id: "categories",
    test: /\b(?:categor|kind of|type of|which badge)\w*/,
    run: ({ stats, rangeLabel }) => {
      const rows = [...stats.byCategory].sort((a, b) => b.count - a.count);
      if (rows.length === 0) return { text: `No categories have been used in ${rangeLabel}.` };
      const top = rows.slice(0, 3).map((c) => `${c.categoryName} (${num(c.count)})`);
      const unused = rows.filter((c) => c.count === 0).map((c) => c.categoryName);
      return {
        text:
          `Most used in ${rangeLabel}: ${list(top, 3)}.` +
          (unused.length > 0 ? ` Unused so far: ${list(unused, 3)}.` : ""),
        links: [{ label: "Manage categories", to: "/categories" }],
      };
    },
  },
  {
    id: "trend",
    test: /\b(?:trend|over time|histor|growth|compare|month over month)\w*/,
    run: ({ stats }) => {
      const t = stats.monthlyTrend;
      if (t.length === 0) return { text: "There is not enough history yet to show a trend." };
      const shown = t.slice(-6);
      const line = shown.map((m) => `${m.label} ${num(m.badges)}`).join(" · ");
      const first = shown[0].badges;
      const last = shown[shown.length - 1].badges;
      const dir = last > first ? "rising" : last < first ? "falling" : "flat";
      return {
        text: `Appreciations by month: ${line}. The trend is ${dir}.`,
        links: [{ label: "Open analytics", to: "/analytics" }],
      };
    },
  },
  {
    id: "policy",
    test: /\b(?:polic|setting|rule|window|configur|approver level|auto.?approve|enabled)\w*/,
    run: ({ account }) => {
      const p = account?.appreciationPolicy;
      if (!p) return { text: "I could not read the appreciation policy for this account." };
      const w =
        p.window.mode === "always"
          ? "the sending window is always open"
          : `sending runs ${p.window.startDate ?? "?"} → ${p.window.endDate ?? "?"}`;
      const a = p.approval.required
        ? `approval is required from the ${p.approval.approverLevel.replace(/-/g, " ")}` +
          (p.approval.autoApproveAfterHours
            ? `, auto-approving after ${p.approval.autoApproveAfterHours}h`
            : "")
        : "approval is not required — appreciations post immediately";
      return {
        text: `Currently ${w}, ${a}, and monetary points are ${p.monetaryEnabled ? "on" : "off"}.`,
        links: [{ label: "Appreciation policy", to: "/appreciation-policy" }],
      };
    },
  },
  {
    id: "people",
    test: /\b(?:employee|headcount|how many people|staff|workforce|roster)\w*/,
    run: ({ headcount, departments }) => ({
      text: `There are ${plural(headcount, "employee")} across ${plural(departments.length, "department")}: ${list(departments, 5)}.`,
      links: [{ label: "Open employees", to: "/employees" }],
    }),
  },
  {
    id: "help",
    test: /\b(?:help|what can you|who are you|capabilit)\w*|^\s*(?:hi|hey|hello)\b/,
    run: () => ({
      text:
        "I answer from this account's live data — appreciations, approvals, points, participation, departments, categories and policy. " +
        "Ask things like “what needs my attention?”, “how are we tracking this month?” or “who hasn't been recognised?”.",
    }),
  },
];

/**
 * Match order, most specific first. The broad buckets ("volume", "top-people")
 * share vocabulary with the narrow ones — "which department recognises most?"
 * contains "most" — so they must be tried last. Ids missing from this list
 * still run, just after everything named here.
 */
const INTENT_ORDER = [
  "help",
  "attention",
  "policy",
  "approvals",
  "underrecognized",
  "departments",
  "categories",
  "trend",
  "people",
  "points",
  "top-people",
  "volume",
];

const ORDERED_INTENTS = [...INTENTS].sort((a, b) => {
  const rank = (i: Intent) => {
    const n = INTENT_ORDER.indexOf(i.id);
    return n === -1 ? INTENT_ORDER.length : n;
  };
  return rank(a) - rank(b);
});

const FALLBACK: AssistantReply = {
  text:
    "I can only answer from this account's recognition data, and I could not match that question. " +
    "Try asking about pending approvals, appreciation volume, points, participation, departments, categories, or the appreciation policy.",
};

/**
 * Answer a question. Async so the call site does not have to change when this
 * is swapped for a real model; the small delay also lets the UI show a
 * thinking state rather than snapping to an answer.
 */
export async function askAssistant(question: string): Promise<AssistantReply> {
  const q = question.toLowerCase().trim();
  if (!q) return FALLBACK;

  await new Promise((r) => setTimeout(r, 260));

  let ctx: Ctx;
  try {
    ctx = buildContext();
  } catch {
    return { text: "I could not read this account's data just now — try reloading the page." };
  }

  const intent = ORDERED_INTENTS.find((i) => i.test.test(q));
  if (!intent) return FALLBACK;

  try {
    return intent.run(ctx);
  } catch {
    return FALLBACK;
  }
}

// ── thread persistence (same localStorage convention as the rest of the app) ──

export function loadThread(): AssistantMessage[] {
  try {
    const raw = localStorage.getItem(THREAD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AssistantMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveThread(messages: AssistantMessage[]): void {
  try {
    // Keep the thread bounded so localStorage cannot grow without limit.
    localStorage.setItem(THREAD_KEY, JSON.stringify(messages.slice(-50)));
  } catch {
    /* storage full or unavailable — the thread is not worth failing over */
  }
}

export function clearThread(): void {
  localStorage.removeItem(THREAD_KEY);
}

let seq = 0;
export function newMessage(role: AssistantRole, text: string, links?: AssistantLink[]): AssistantMessage {
  seq += 1;
  return { id: `${Date.now()}-${seq}`, role, text, links, ts: Date.now() };
}
