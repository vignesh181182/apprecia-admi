# EngageX — Phase 1 Build Plan

This document is the working build plan for EngageX Phase 1. It's designed to be run with **Claude Code in VS Code**, one prompt at a time, with a git commit between each.

The plan was generated after auditing the current codebase, so prompts already account for what's built vs. what's net-new.

---

## Table of contents

1. [Current state of the codebase (audit)](#current-state-of-the-codebase-audit)
2. [How to use this plan with Claude Code](#how-to-use-this-plan-with-claude-code)
3. [Phase 0 — Context primer (run every new session)](#phase-0--context-primer-run-every-new-session)
4. [Phase 1 — Foundations: Values, Policy & Points Wallet](#phase-1--foundations-values-policy--points-wallet)
5. [Phase 2 — Feed + Social Layer](#phase-2--feed--social-layer)
6. [Phase 3 — Programs (the RnR side)](#phase-3--programs-the-rnr-side)
7. [Phase 4 — Rewards, Catalog, and Milestones](#phase-4--rewards-catalog-and-milestones)
8. [Phase 5 — Admin Tooling](#phase-5--admin-tooling)
9. [Phase 6 — Differentiators (last)](#phase-6--differentiators-last)
10. [Timeline](#timeline)

---

## Current state of the codebase (audit)

### What's already in place (don't rebuild)

| Feature | Status in repo |
|---|---|
| Account schema with org config | `client/src/lib/account.ts` — full Account type, role, products, brandColor, integrations |
| `recognitionCategories: string[]` | Already collected during onboarding "Recognition" step. Just `string[]`, not rich objects yet. |
| `pointsPolicy` org-wide config | Already on Account (`startingBudget`, `expiryMonths`, `maxPerRecognition`, `requireManagerApproval`) |
| Onboarding wizard (6 steps) | Welcome → Company profile → HR admins → Integrations → Recognition → Review |
| RecognizeDialog | 5-component dialog at `client/src/components/recognize/` with person picker, badge picker, points picker, reason, sent confirmation |
| Program panel structure | `PanelMember` type and `panel?: PanelMember[]` on `Program` |
| HR Admin web pages | redemptions, budget, recognitions, programs, employees, badges, settings, analytics, hr-dashboard |
| Mobile employee pages | home, insights, notifications, profile, program-detail, programs, ranks, recognize, rewards, settings |
| Rewards data (mock) | `rewards-data.ts` with REWARD_CATEGORIES + REWARD_PRODUCTS |
| Hooks setup | `use-toast`, `use-viewport`, `use-mobile` |
| Super Admin auth + seed companies | Wired in v5 |

### What exists but needs upgrading

- **`recognitionCategories`** is `string[]` — needs to become rich objects (emoji, color, description) for proper value tagging
- **Feed (`FEED`)** is hardcoded mock data in `mobile-data.ts` — not localStorage-backed
- **`Program`** type has no `categories`, `eligibility`, or `cadence` fields — Phase 3 builds these
- **No nomination workflow at all** — Phase 3 builds it from scratch
- **`pointsPolicy`** stores org-wide config but no per-user wallet exists yet
- **No `engagex_badges` storage** — recognitions save as `PendingRecognition[]` in `engagex_my_recognitions` (just current user's outgoing); no central feed store

### What's net-new (Phase 1 builds it)

- Org-wide Appreciation policy (monetary on/off, sending window, approval workflow)
- Per-user points wallet with monthly reset
- Live badge feed (localStorage-backed, social layer)
- Manager-approval inbox for appreciations
- Program categories, eligibility rules, cycle cadence
- Full nomination → manager-approval → panel-review → winner-selection workflow
- Real redemption flow (current rewards page is browse-only mock)
- Auto-posted milestone badges (birthdays, anniversaries)
- Recognition equity dashboard
- Budget tracking layered on programs and departments
- AI writing assist
- Slack webhook stub for winner announcements

---

## How to use this plan with Claude Code

**Setup once:**
```bash
git checkout -b phase1-foundations
# open VS Code's integrated terminal and start Claude Code
```

**For each prompt:**
1. Paste **Phase 0** (orient prompt) at the start of every new Claude Code session — it loads the current code structure into context
2. Then paste **one** numbered prompt (1.1, 1.2, etc.)
3. Let Claude finish, **review the diff carefully** in VS Code's git panel
4. Run `npm run dev` and test the feature in the browser
5. If it works: `git add . && git commit -m "Phase 1.1: rich recognition categories"`
6. If it doesn't: paste the actual error/screenshot back to Claude Code — don't accept a "fix" without understanding the change
7. After a full phase: create a PR, merge, branch off again for the next phase

**Important:** Run prompts in numerical order. Phase 1 migrations are foundations everything else depends on.

**Optional but useful:** drop a `CLAUDE.md` at the repo root. Claude Code reads it automatically every session so you can skip the Phase 0 primer most of the time. Sample content is in the appendix at the bottom of this doc.

---

## Phase 0 — Context primer (run every new session)

This isn't a build prompt — paste it at the start of any new Claude Code session so Claude understands the codebase before making changes.

````
I'm working on EngageX, an employee appreciation + rewards & recognition (R&R) HR app. Before making any code changes, please explore the repo to understand it:

1. Read `client/src/App.tsx` to understand routing and the three flows (Super Admin, HR Admin web, Employee mobile at `/m`).
2. Read `client/src/lib/account.ts` — this is the source of truth for tenant/account state. All persistence is via localStorage.
3. Read `client/src/lib/programs-data.ts` to understand the Program model (categories, panel, rules).
4. Read `client/src/components/web/employee-nav.tsx` and `client/src/components/mobile/bottom-nav.tsx` to see how navigation works.
5. Read the relevant page in `client/src/pages/mobile/` or `client/src/pages/` for the feature I'm about to ask about.

Key conventions:
- TypeScript + React + Tailwind + shadcn/ui + react-router-dom (HashRouter).
- No backend — everything persists in localStorage under `engagex_*` keys.
- Mobile employee app lives under `/m/*`; HR admin web app lives at root.
- Brand color: `#a87a3a` (amber-brown), font is "DM Sans" via the `font-mobile` class.
- Reuse existing shadcn components from `client/src/components/ui/` (Button, Card, Input, Badge, Switch, etc.) — don't create new primitives.

After exploring, summarize what you found in 5-8 bullets and wait for my next instruction. Do not make any code changes yet.
````

---

## Phase 1 — Foundations: Values, Policy & Points Wallet

### Prompt 1.1 — Upgrade `recognitionCategories` to rich values

````
EngageX already has a `recognitionCategories: string[]` field on Account and an onboarding "Recognition" step at `client/src/pages/onboarding/recognition.tsx`. Don't add a new step — upgrade the existing one.

**Schema change in `client/src/lib/account.ts`**:

Replace `recognitionCategories: string[]` with a rich type:

```ts
export type RecognitionCategory = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: "blue" | "amber" | "stone" | "purple" | "rose" | "green" | "sky" | "teal";
};

// On Account:
recognitionCategories: RecognitionCategory[];
```

Replace `DEFAULT_CATEGORIES` with rich objects:
- Innovation (💡, amber, "Bold ideas and creative problem-solving")
- Leadership (🧭, blue, "Setting direction and inspiring others")
- Teamwork (🤜, purple, "Collaboration that lifts the team")
- Creativity (🎨, rose, "Original thinking applied to real work")
- Culture (✨, teal, "Embodying who we are as a company")
- Customer Focus (🤝, green, "Going above for the customer")

**Migration helper** in `account.ts`: when loading an account, if `recognitionCategories` is a `string[]` (old format), transform each entry to a `RecognitionCategory` with a generated id, the string as the `name`, empty description, default emoji, and a color chosen by index. This keeps existing seeded data working.

**Update the onboarding "Recognition" step** at `client/src/pages/onboarding/recognition.tsx`:
- Each category row becomes editable: name input, description textarea, emoji picker (grid of 16 emojis), color swatch picker (8 swatches from the palette above)
- Min 3 required, max 12 allowed
- "Add category" button

**Update `client/src/pages/onboarding/review.tsx`** to show categories with their emoji and color preview.

**Update HR Settings page** (`client/src/pages/hr-settings.tsx`) so admins can edit categories post-onboarding — same UI as the onboarding step but in the settings tab labeled "Recognition Categories".

**Don't touch any badge/recognition UI yet** — wiring categories into the Recognize dialog is in a later prompt.
````

---

### Prompt 1.2 — Org-wide Appreciation policy (monetary, window, approval)

````
Add an org-wide Appreciation policy that controls how badges work. This is a higher-level governance layer that sits alongside the existing `pointsPolicy` (which stays as-is for per-role allowances and tier values).

**Schema in `client/src/lib/account.ts`** — add to the Account type:

```ts
export type ApprovalLevel = "direct-manager" | "bu-head" | "function-lead" | "hr-admin";

export type AppreciationPolicy = {
  // Monetary benefits
  monetaryEnabled: boolean;          // default true; if false, badges have no points and the Rewards tab is hidden

  // Sending window
  window: {
    mode: "always" | "scheduled";    // default "always"
    startDate?: string;              // ISO; required when mode === "scheduled"
    endDate?: string;                // ISO; required when mode === "scheduled"
    timezone?: string;               // defaults to Account.timezone
  };

  // Approval workflow
  approval: {
    required: boolean;               // default false; when true badges enter "pending-approval" before going to the feed
    approverLevel: ApprovalLevel;    // who approves — direct manager / BU head / function lead / HR admin
    autoApproveAfterHours?: number;  // optional escalation — auto-approve if no decision in N hours
  };
};

// On Account:
appreciationPolicy: AppreciationPolicy;
```

**Defaults** (used in `createAccountFromInvite` and in the migration helper for older saved accounts):

```ts
appreciationPolicy: {
  monetaryEnabled: true,
  window: { mode: "always" },
  approval: { required: false, approverLevel: "direct-manager" }
}
```

**Migration helper**: in `getAccount()`, if the loaded account doesn't have `appreciationPolicy`, inject the defaults before returning. Same pattern as Prompt 1.1 — keep older seeded data working.

**Employee record additions** in `client/src/lib/mobile-data.ts` (or wherever employee records live):
- Add `managerId?: string` if not already there
- Add `businessUnitId?: string` and `businessUnitName?: string`
- Add `functionLeadId?: string` (for the "function-lead" approval routing)

Seed all existing mock employees with realistic values so the approver lookup works.

**Helper** in a new file `client/src/lib/appreciation-policy.ts`:

```ts
import type { Account, AppreciationPolicy } from "./account";

export function isSendingWindowOpen(policy: AppreciationPolicy, now = new Date()): boolean;

export function nextWindowReopenAt(policy: AppreciationPolicy, now = new Date()): Date | null;
// Returns when the window next reopens — used for the tooltip on a disabled "Appreciate" button.

export function resolveApprover(senderEmployee, level: ApprovalLevel, account): Employee | null;
// Look up the right approver per level.
```

**HR Admin Settings page** (`client/src/pages/hr-settings.tsx`) — add a new tab labeled "Appreciation Policy" with four sections:

1. **Monetary benefits**
   - Switch: "Allow points and redemption on appreciations"
   - Help text: "When off, badges still recognize work but no points are credited and the Rewards catalog is hidden for employees."

2. **Sending window**
   - Radio: "Always open" / "Scheduled window"
   - When scheduled is selected: two date pickers for start/end, plus a timezone select (defaulting to the account timezone)
   - Live preview: "Employees can send appreciations from {start} to {end}. Outside this window the button is disabled."

3. **Approval workflow**
   - Switch: "Require approval before badges post to the feed"
   - When on:
     - Radio group for approver level (4 options):
       - "Direct manager" — fastest, most common
       - "Business unit head" — for BU-level oversight
       - "Function lead" — for cross-team functions (e.g., Engineering lead)
       - "HR admin" — central HR review
     - Number input: "Auto-approve if no decision within N hours" (0 = never auto-approve)
   - Preview card: "When Sarah sends an appreciation, it goes to {approverName} for review before posting. {Auto-approve text}"

4. **Status preview** (read-only summary)
   - "Window: {state}", "Monetary: {on/off}", "Approval: {required by level, or 'not required'}"

**Update the RecognizeDialog** (`client/src/components/recognize/recognize-dialog.tsx`):

a) **Window enforcement** — when opening the dialog (or when the "Appreciate" trigger button mounts in the parent UI):
   - If `isSendingWindowOpen()` returns false, show an inline message in the dialog: "Appreciations are paused right now. Sending reopens on {date} at {time}." with no Send button.
   - The bottom-nav "Appreciate" CTA on mobile should be visually disabled (50% opacity, no click handler) when the window is closed; tooltip shows the reopen date.

b) **Monetary toggle**:
   - When `monetaryEnabled === false`, hide the tier selector and wallet status entirely. Badge points default to 0. The receiver still gets the badge in the feed, just with no point credit. Skip the `creditReceive()` call.

c) **Approval flow**:
   - When `approval.required === true`, after submit:
     - Create the badge with a new status field: `status: "pending-approval" | "approved" | "rejected"` (default "approved" when no approval needed)
     - Resolve approver via `resolveApprover()` and store `pendingApproverId` on the badge
     - Show a different success toast: "Your appreciation was sent to {approverName} for approval. You'll be notified when it's posted."
   - Update the Badge type in `client/src/lib/badges.ts` to include:
     ```ts
     status: "pending-approval" | "approved" | "rejected";
     pendingApproverId?: string;
     approvalDecision?: { decidedBy: string; decidedAt: string; comment?: string; approved: boolean };
     ```
   - The feed (later prompt) must filter to only show `status === "approved"` badges. Pending and rejected ones don't render to anyone except the sender (under "My Appreciations") and the approver (under their inbox).

**New page** `/m/approvals/appreciations` (visible only to users who are an `approverLevel` somewhere):
- Inbox of pending appreciations awaiting the current user's approval
- Each card: sender → recipient → category chip → message → "Approve" / "Reject" buttons (reject requires a comment)
- On approve: status → "approved", badge appears in the feed, both sender and recipient get notifications
- On reject: status → "rejected", sender gets notified with the reason, no feed post
- Bottom nav gets a notification dot showing pending approvals

**Auto-approval cron-ish behavior**: on app mount in `App.tsx`, run a one-shot helper `processAppreciationAutoApprovals()` that scans pending badges, checks if `now - createdAt > autoApproveAfterHours`, and flips them to approved.

**Update seeded dummy companies** in `seedDummyCompanies()` so each has a sensible default policy:
- Acme Corp: monetary on, always open, approval off (default everyone)
- Northwind: monetary on, always open, approval required (direct-manager, 48h auto-approve)
- Globex: monetary off, scheduled (this month), approval off
- Soylent Corp: monetary on, scheduled (next 30 days), approval required (HR admin)
- Initech: defaults

This makes the policy visible across the dummy data.

**Don't change the RnR / nomination flow** — that's a separate workflow with its own approval (Prompt 3.3 panel review).

**Note for next prompt**: Prompt 1.3 will add the per-user wallet. This prompt's policy controls *whether* monetary is on; Prompt 1.3 controls *how many points* each user gets to give. Keep them as separate concerns.
````

---

### Prompt 1.3 — Per-user wallet layered on existing `pointsPolicy`

````
Add a per-user points wallet alongside the existing org-wide `pointsPolicy` on Account. Don't replace `pointsPolicy` — it stays as the org-level config.

**Extend the existing pointsPolicy** in `client/src/lib/account.ts` to add per-role allowances and tier values:

```ts
pointsPolicy: {
  startingBudget: number;           // existing
  expiryMonths: number;              // existing
  maxPerRecognition: number;         // existing
  requireManagerApproval: boolean;   // existing — note: superseded by appreciationPolicy.approval now; keep for backwards compat
  monthlyAllowance: {                // NEW
    employee: number;                // default 100
    manager: number;                 // default 200
    admin: number;                   // default 300
  };
  tierValues: {                      // NEW
    thanks: number;                  // default 0
    goodJob: number;                 // default 25
    exceptional: number;             // default 100
  };
  expireUnused: boolean;             // NEW, default true
}
```

Add a migration helper in `getAccount()` so any saved account without the new fields gets sensible defaults.

**New file** `client/src/lib/wallet.ts`:

```ts
export type Wallet = {
  userId: string;
  period: string;          // "YYYY-MM"
  giveBalance: number;
  giveAllowance: number;
  receiveBalance: number;
  lifetimeReceived: number;
};

export function getWallet(userId: string, role: "employee" | "manager" | "admin"): Wallet;
export function deductGive(userId, role, amount): boolean;  // false if insufficient
export function creditReceive(userId, amount): void;
export function redeem(userId, amount): boolean;
export function getAllWallets(): Wallet[];
```

Storage: one key per user, `engagex_wallet_${userId}`. On `getWallet`, auto-rollover if `period` doesn't match current month — reset `giveBalance` to allowance if `expireUnused` is true.

**Important: respect `appreciationPolicy.monetaryEnabled`**:
- `deductGive` and `creditReceive` short-circuit and return success without changes when `monetaryEnabled === false`. The wallet ledger stays at 0/0 in that mode.
- Helper to check: `isMonetaryActive(account): boolean`.

**Extend the existing HR Settings page** (`hr-settings.tsx`) — there's likely already a "Points Policy" tab. If yes, add the new fields to it. If not, find where the existing pointsPolicy fields are edited and add controls there:
- Monthly allowance: 3 number inputs for employee/manager/admin
- Tier values: 3 inputs for thanks (lock at 0, disabled) / goodJob / exceptional
- Switch for `expireUnused`
- Live preview card on the side: "A {role} gets {N} pts to give each month. Sending an 'Exceptional' badge ({tierValues.exceptional} pts) credits the receiver's redeemable balance."
- If `monetaryEnabled === false` on the policy, show a banner at the top of this tab: "Monetary recognition is currently disabled in Appreciation Policy. These settings have no effect until it's re-enabled."

**Don't change the Recognize dialog yet** — that's the next prompt.
````

---

### Prompt 1.4 — Update existing Recognize dialog

````
Upgrade the existing RecognizeDialog (`client/src/components/recognize/recognize-dialog.tsx`).

The dialog currently has a 3-step flow: person → badge → reason. Two `kind` modes exist: "appreciation" and "rnr". Update **appreciation mode**:

1. **Replace the `badge` step with a `category` step**:
   - Show the company's `recognitionCategories` as a grid of selectable chips (emoji + name, with category color background when selected)
   - Required — can't proceed without one
   - If 0 categories (shouldn't happen post-migration), fall back to a single "General Appreciation" chip
   - Keep `BadgePicker` and `badge-picker.tsx` files in place for now — `kind="rnr"` may still use them

2. **Replace `PointsPicker` on the reason step with a tier selector**:
   - Three pill buttons side-by-side: "Thanks" (0 pts) · "Good Job" ({tierValues.goodJob} pts) · "Exceptional" ({tierValues.exceptional} pts)
   - When `appreciationPolicy.monetaryEnabled === false`: hide the tier selector entirely. The badge is sent with `points = 0` and the tier defaults to "thanks". Replace the wallet status line with: "Recognition without points — a meaningful thank-you."
   - When monetary is on: wallet status under the buttons reads "{giveBalance} of {giveAllowance} give-points left this month"; disable tiers that exceed the user's `giveBalance`

3. **On submit** — branch on `appreciationPolicy.approval.required`:

   When approval is NOT required:
   - Call `deductGive(currentUserId, currentRole, tierPoints)` (no-op if monetary disabled)
   - Call `creditReceive(recipientUserId, tierPoints)` (no-op if monetary disabled)
   - Save badge with `status: "approved"` so it shows in the feed immediately

   When approval IS required:
   - Resolve approver via `resolveApprover(sender, policy.approval.approverLevel, account)`
   - Save badge with `status: "pending-approval"`, `pendingApproverId: approver.id`
   - Defer the wallet credit until approval — store the intended points on the badge but don't credit yet
   - Show different success toast: "Sent to {approverName} for approval"

4. **Save to `engagex_badges` localStorage list** with this shape:

```ts
type Badge = {
  id: string;
  fromUserId: string;
  toUserId: string;
  categoryId: string;
  tier: "thanks" | "goodJob" | "exceptional";
  points: number;
  message: string;
  createdAt: string;
  status: "pending-approval" | "approved" | "rejected";
  pendingApproverId?: string;
  approvalDecision?: { decidedBy: string; decidedAt: string; comment?: string; approved: boolean };
  reactions: Record<string, string[]>;   // { "👏": ["userId1"] }
  comments: Comment[];
  boosts: Boost[];
};

type Comment = { id: string; userId: string; text: string; createdAt: string };
type Boost = { fromUserId: string; addedPoints: number; message: string; createdAt: string };
```

Add helpers in `client/src/lib/badges.ts` (extend or create): `getBadges()`, `saveBadge(badge)`, `approveBadge(badgeId, approverId, comment?)`, `rejectBadge(badgeId, approverId, comment)`, `toggleReaction(badgeId, userId, emoji)`, `addComment(badgeId, comment)`, `addBoost(badgeId, boost)`.

`approveBadge` is where the deferred wallet credit happens: deducts from sender, credits receiver, then flips status to "approved".

**Keep `saveMyRecognition` / `PendingRecognition`** working too — the dialog still writes to it for backwards compatibility, but the new `engagex_badges` store is now the source of truth for the feed.

**For `kind="rnr"` mode**: leave it untouched. Phase 3 prompts handle the nomination flow as a separate experience.

**Window enforcement** (from Prompt 1.2) should already be wired — if you skipped it, add it now: if `isSendingWindowOpen()` returns false, show "Appreciations are paused — reopens {date}" instead of the dialog content.
````

---

### Prompt 1.5 — Wallet UI on profile and home top bar

````
The wallet exists in localStorage but isn't visible to employees. Make it visible.

**Update `client/src/pages/mobile/profile.tsx`**:
- Above the existing profile content, add a wallet card:
  - Two large stat tiles side-by-side:
    - **Receive balance** (redeemable) — show the receive balance + "Redeem" button → links to /m/rewards
    - **Give balance** (this month) — show give balance / allowance + progress bar
  - Below: "Lifetime received: {N} pts" small text
  - "Period resets {nextResetDate}" small text
- If `appreciationPolicy.monetaryEnabled === false`: replace the wallet card with a simple "Monetary recognition is disabled. Badges are recorded but no points are credited." info card.

**Update mobile home top bar** (or wherever it makes sense):
- Add a small points pill in the header showing receive balance — tap to navigate to /m/rewards
- Hide the pill when monetary is disabled

**Update HR Admin redemptions page** (`client/src/pages/redemptions.tsx`):
- It exists but probably uses mock data. Add a TODO comment "Connects to wallet redemptions in Phase 4.1" and leave the mock UI for now.
- If monetary is disabled, the page shows an empty state: "Redemptions are disabled at the org level. Re-enable monetary recognition in Settings → Appreciation Policy."
````

---



---

## Phase 1.6 — HR Admin Enhancements

These prompts add a tabbed HR Admin dashboard (Appreciation + RnR), replace the existing program creation flow with a richer form (banners, icons, cycles, categories, panel, draft/publish), and add a post-cycle AI-style shortlister for panel leads. The AI uses a deterministic scoring formula — no API key required. PDF/PPT/email/social actions are stubbed in this phase and built out in Phase 3 of the broader roadmap.

### Prompt 1.6.1 — Tabbed HR Dashboard + Appreciation tab

~~~
EngageX has an HR Admin dashboard at `client/src/pages/hr-dashboard.tsx`. Refactor it into a tabbed layout with two tabs: "Appreciation" and "RnR". Build the Appreciation tab fully in this prompt; the RnR tab gets a placeholder for now (filled in next prompt).

**Layout**:
- Keep the page route at `/` (or wherever `hr-dashboard` currently mounts)
- Two-tab structure using shadcn `Tabs` component
- Tab state persisted to URL query param `?tab=appreciation` or `?tab=rnr` so deep-linking works
- Default tab: "Appreciation"
- Hide the RnR tab entirely if `account.products.rnr === false`

**Appreciation tab — sections, top to bottom**:

1. **Filter bar**
   - Date range select: This month / Last month / Last 3 months / This year / Custom (custom shows two date pickers)
   - Department multi-select (pulled from existing employee data)
   - All numbers below recompute when filters change

2. **KPI strip** (6 cards, 2 rows of 3 on mobile / 1 row of 6 on desktop)
   - **Utilization** — % of employees who sent at least 1 badge in the period
     - Subtitle: "{N} of {total} employees active"
     - Color tint: green if ≥70%, amber 40–70%, red < 40%
   - **Approval status** — count of pending badges + average decision time (when `appreciationPolicy.approval.required`)
     - When approval is disabled, replace with "Auto-published" pill and a different KPI: "Avg response time" (time from badge → first reaction)
   - **Total appreciations** — count, with delta vs previous period
   - **Top giver** — name + count this period
   - **Top receiver** — name + count this period
   - **Points circulated** — total points credited via badges this period (hide entirely if `monetaryEnabled === false`)

3. **Month-wise trend** chart (Recharts `LineChart` or `AreaChart`)
   - X-axis: last 12 months
   - Two series: badges sent (primary brand color), points circulated (secondary, dashed)
   - Tooltip shows month + both values
   - Hide the points series when monetary is disabled

4. **Approval funnel** card (only when approval is required)
   - Stacked horizontal bar: Approved / Pending / Rejected with counts and %
   - Below: top 3 slowest approvers (name + avg decision time) to spot bottlenecks
   - Quick action: "Send reminder to approvers" button (toast stub for now)

5. **Recognition by department** — Recharts `BarChart`
   - X-axis: department names
   - Y-axis: avg badges per employee
   - Red tint where < 50% of company average

6. **Top values used** — horizontal bar chart, top 6 categories
   - Bar = count of badges tagged with that category
   - Bar fill uses each category's brand color

7. **Underrecognized employees** table (collapsible, default collapsed)
   - Employees who received 0 badges in the period
   - Columns: name, role, department, last received date, manager
   - Sort by longest-without-recognition
   - "Nudge their manager" button (toast stub)

**New helper** in a new file `client/src/lib/dashboard-stats.ts`:

  export type DateRange = { start: Date; end: Date };

  export function getAppreciationStats(
    badges: Badge[],
    employees: Employee[],
    range: DateRange,
    departmentFilter?: string[]
  ): {
    utilization: { active: number; total: number; pct: number };
    approval: { pending: number; approved: number; rejected: number; avgDecisionHours: number };
    totals: { badges: number; pointsCirculated: number; deltaBadges: number };
    topGiver: { userId: string; count: number } | null;
    topReceiver: { userId: string; count: number } | null;
    monthlyTrend: { month: string; badges: number; points: number }[]; // 12 months
    byDepartment: { department: string; avgPerEmployee: number }[];
    byCategory: { categoryId: string; categoryName: string; count: number }[];
    slowApprovers: { userId: string; avgDecisionHours: number; backlog: number }[];
    underrecognized: { userId: string; lastReceivedAt: string | null }[];
  };

All stats computed from `engagex_badges` and account data. Pure function, no side effects.

**Empty states**:
- If no badges exist in the period, every chart shows "No data for this period" with a small icon
- If approval is disabled, the approval funnel section is hidden entirely

**RnR tab content** for this prompt: a single placeholder card that says "RnR dashboard coming in next update" — next prompt fills this.

**Existing `client/src/pages/hr-dashboard.tsx` content**: preserve any sections that are still useful by moving them into the Appreciation tab. If anything overlaps with the new KPI strip, prefer the new design. Old data sources (mock arrays) can be replaced with the new stats helper.

**Don't break existing routing or sidebar nav** — the dashboard link in the HR admin sidebar should still work and land on the new tabbed page.
~~~

---

### Prompt 1.6.2 — RnR Dashboard tab

~~~
Now build the RnR tab in the HR admin dashboard (the one stubbed out in the previous prompt).

The page is `client/src/pages/hr-dashboard.tsx`. The "RnR" tab is currently a placeholder — replace its content with the full dashboard below.

**Section ordering, top to bottom**:

1. **Filter bar** (reuses the date range + department filter pattern from the Appreciation tab)
   - Add a program multi-select: filter views to one or more programs
   - "Cycle" selector: Current cycle / Last cycle / All cycles

2. **KPI strip** (6 cards)
   - **Total budget** — sum of all program budgets (allocated) + delta vs last period
     - Subtitle: "{currency}{spent} spent ({pct}%)"
   - **Active programs** — count of programs with `status: "active"` or `"ending-soon"`
     - Subtitle: "{N} ending this week"
   - **Budget utilization** — overall % spent
     - Color tint: green < 70%, amber 70–90%, red > 90%
   - **Pending actions** — sum of nominations needing manager approval + nominations needing panel review + cycles awaiting winner selection
     - Make this clickable — drops down a small popover listing each action with a link
   - **Total nominations** this period + delta
   - **Programs hitting target participation** — count of programs where nomination count ≥ target (use 50 as default target)

3. **Budget utilization** — horizontal stacked bar per program
   - One row per active program
   - Allocated bar with spent portion filled, color-coded (green/amber/red by % used)
   - Right side: "{spent} / {allocated} ({pct}%)" + "{days} days left"
   - "Top up" button per row (opens existing top-up dialog if it exists, otherwise a stub)

4. **Pending actions** — itemized list
   - Group by type: "Manager approvals (N)", "Panel reviews (N)", "Winner selection (N)"
   - Each item: program name + category + nominee + nominator + "X days waiting"
   - Action button: "Go to inbox" → navigates to the relevant inbox page

5. **Recent winners** — horizontal scrollable strip
   - Last 10 winners across all programs (where `nomination.status === "winner"`)
   - Each card: avatar, name, program · category, "Won {timeAgo}"
   - "View all winners" link at the end → opens a full-page winners archive

6. **Performance / trend charts** — two side-by-side
   - **Nominations over time** (line chart, 6 months): one line per program (top 5 programs by volume)
   - **Approval funnel** (stacked bar, per program): pending-manager / pending-panel / approved / winner / rejected counts per program

7. **Programs at risk** — table
   - Programs ending soon with low nomination counts (< 50% of expected)
   - Columns: program, days left, current nominations, expected, action
   - Action button: "Promote this program" (toast stub — will tie to email/social in Phase 3)

8. **People who haven't appreciated** (cross-product, lives here since it complements RnR engagement too)
   - Employees who have sent 0 badges AND submitted 0 nominations in the period
   - Sortable table: name, role, department, manager, "Send reminder" button (toast stub)
   - This is the HR-visible engagement gap. Use this list to drive nudge campaigns.

**Helper file** — extend `client/src/lib/dashboard-stats.ts`:

  export function getRnRStats(
    programs: Program[],
    nominations: Nomination[],
    badges: Badge[],
    employees: Employee[],
    account: Account,
    range: DateRange,
    programFilter?: string[]
  ): {
    totalBudget: { allocated: number; spent: number; pct: number };
    activePrograms: { count: number; endingThisWeek: number };
    budgetUtilization: { programId: string; programName: string; allocated: number; spent: number; daysLeft: number }[];
    pendingActions: {
      managerApprovals: PendingItem[];
      panelReviews: PendingItem[];
      winnerSelection: PendingItem[];
    };
    recentWinners: WinnerEntry[];
    nominationsTrend: { month: string; perProgram: Record<string, number> }[];
    approvalFunnel: { programId: string; programName: string; pendingManager: number; pendingPanel: number; approved: number; winner: number; rejected: number }[];
    programsAtRisk: ProgramRiskEntry[];
    nonParticipants: { userId: string; managerId: string }[];
  };

**Empty states**:
- If RnR product isn't enabled (`account.products.rnr === false`), the entire RnR tab is hidden upstream — don't worry about an empty state for that
- If there are no active programs: hero card "No programs yet. Create your first program →" with a CTA link to the program creation page (next prompt builds it)
- Per-section empty states for each chart/table

**Performance note**: with many badges/nominations, the helper could be slow. Memoize the result based on `(range, filters, dataLength)` so the tab doesn't recompute on every render.
~~~

---

### Prompt 1.6.3 — Create/Edit Program form

~~~
Replace the existing program creation flow with a richer create/edit form for HR admins.

**Find and remove the current creation flow** first — likely lives at `client/src/pages/programs.tsx` or there's a dialog inside it. Audit before changing anything.

**New page**: `client/src/pages/program-edit.tsx` with two routes:
- `/programs/new` — create a new program
- `/programs/:programId/edit` — edit an existing one

Both routes render the same form component.

**Form sections** (use a long single-page form, NOT a wizard — admins want to fill it fast):

1. **Basics**
   - Program name (required, max 80 chars)
   - Description (textarea, max 500 chars)
   - **Banner picker** — grid of 12 preset banner gradients + image overlays:
     - Use the existing `themeBg` palette as a starting set
     - Render each as a 16:9 thumbnail
     - Selected one gets a checkmark + ring
     - "Upload custom" button — accepts an image file, stores as data URL in localStorage (50KB max, show error otherwise)
   - **Icon picker** — grid of 24 emoji options (mix of trophy, badge, star, target, idea, etc.) + a "Custom" input for any emoji
     - These can hardcode in a `BANNER_PRESETS` and `ICON_PRESETS` array in a new file `client/src/lib/program-presets.ts`

2. **Cycle**
   - Cadence radio: Monthly / Quarterly / Yearly / One-off
   - Start date (date picker, required, can be future)
   - End date (date picker, required, computed default based on cadence — e.g., monthly = start + 30 days)
   - If cadence ≠ "one-off": "Repeat automatically after end date" toggle (default on)
   - Preview line: "Runs from {start} to {end} — {N} cycles per year"

3. **Award categories**
   - Repeating list, min 1 required, max 8
   - Each row: name input, emoji picker (small), description (short), "Number of winners" number input (1–10), "Prize points per winner" number input (0–10000)
     - When `appreciationPolicy.monetaryEnabled === false`: hide the prize points field; categories run as recognition-only
   - "Add category" button
   - Trash icon to delete; disabled when only 1 category left
   - Preset shortcut chips at top: "Innovation Champ", "People's Champ", "Customer Hero", "Mentor of the Month", "Quick Helper", "Years of Service" — clicking adds a pre-filled row

4. **Eligibility** (optional collapsible section, default open)
   - Departments multi-select (or "Open to all")
   - Locations multi-select (or "Open to all")
   - Min tenure months (number, default 0)
   - "Exclude past winners for the last N cycles" (number, default 0 = no exclusion)

5. **Panel of judges**
   - Searchable employee picker — add multiple panel members
   - Each added member: avatar, name, role, dept, "Mark as Lead" toggle, remove button
   - Exactly one member must be marked Lead
   - Min 1 required, max 12
   - Add a small info card: "Panel members review nominations after manager approval and select the winners."

6. **Budget**
   - Total allocated budget (number, currency from account)
   - Period: "current-cycle" (default for monthly/quarterly) or "annual"
   - Auto-calculated preview: "Budget per winner: {budget / total winners across categories} {currency}"

7. **Notifications** (collapsible, default closed)
   - "Notify nominees when nominated" (default on)
   - "Notify all employees when program goes live" (default on)
   - "Announce winners to Slack" (only shown if `integrations.slackWebhookUrl` is set; for Phase 1 just a toggle)

**Footer bar** (sticky at bottom):
- Left side: "Last saved {timeAgo}" if draft
- Right side: three buttons
  - **Save as draft** — stores program with `status: "draft"`
  - **Publish** — sets `status: "active"` (or `"scheduled"` if start date is future) and shows confirmation: "This program will go live on {date}. Continue?"
  - **Cancel** — back to /programs (warns about unsaved changes if dirty)

**Schema additions** in `client/src/lib/programs-data.ts` — extend Program type with:

  status: "draft" | "scheduled" | "active" | "ending-soon" | "ended";
  bannerId?: string;
  customBannerDataUrl?: string;
  iconEmoji: string;
  cadence: ProgramCadence;
  repeatAutomatically?: boolean;
  notifications: {
    notifyNominees: boolean;
    notifyAllOnLaunch: boolean;
    announceWinnersToSlack: boolean;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;

**Status transitions**:
- New program → `"draft"`
- Saved with future start date and Publish → `"scheduled"`
- Saved with start date today/past and Publish → `"active"`
- Background job (run on app mount in `App.tsx`): `transitionScheduledPrograms()` flips scheduled programs to active when their start date arrives, and flips active programs to ended when end date passes. Same idempotent pattern as `seedDummyCompanies`.

**Programs list page** (`/programs`) updates:
- Add a status filter pill row: All / Draft / Scheduled / Active / Ended
- Each row shows the status badge
- "New program" button → /programs/new
- Each row's edit icon → /programs/{id}/edit
- Draft programs are only visible to HR admins (not to employees)

**Validation**:
- Block Publish if: no name, no categories, no panel lead, end date before start date
- Inline error messages near each invalid field
- Save as draft has lighter validation (just name required)

**Don't touch**: existing program detail page (`program-detail.tsx`), nomination flow, panel review. They consume the data this form produces.
~~~

---

### Prompt 1.6.4 — Post-cycle AI shortlister + post-winner action stubs

~~~
When a program cycle ends, an AI-style shortlister scores all approved nominations and surfaces the top 10 for the panel lead to consider. Use a deterministic mock scoring function — no real API call.

**Where this lives**: extend the winner selection page from Phase 3.4 (panel review and winner selection). If that hasn't been built yet, this prompt creates it from scratch.

**Schema** in `client/src/lib/ai-shortlister.ts`:

  export type ShortlistEntry = {
    nominationId: string;
    score: number;           // 0–100
    rank: number;            // 1 = top
    reasoning: string;       // 2-3 sentence "AI" summary
    highlights: string[];    // 2-3 bullet points pulled from the reason text
  };

  export function shortlistNominations(
    nominations: Nomination[],
    account: Account,
    panel: PanelMember[]
  ): ShortlistEntry[];

**Scoring formula** (deterministic, transparent):

  score =
    (managerApprovalWeight * 25) +              // 25 if manager-approved with positive comment, 15 if neutral
    (panelApprovalRatio * 30) +                 // 0–30 based on % of panel members who voted approve
    (reasonQualityScore * 20) +                 // 0–20: length + presence of specific verbs/numbers
    (impactKeywordsScore * 15) +                // 0–15: keywords like "saved", "shipped", "led", "first"
    (timelinessBonus * 10)                      // 10 if nominated in first half of cycle, 5 if mid, 0 if last week

**Reason quality heuristics**:
- < 100 chars: 0
- 100–300 chars: 10
- 300+ chars: 15
- Contains numbers (matches `/\d/`): +3
- Contains specific verbs (saved, delivered, shipped, led, mentored, fixed, launched, improved): +2 per match (cap at 20)

**Reasoning generator** — composes a short summary deterministically from the data, NOT random. Format:

  "{NomineeName} scored {score}/100 for this category.
  {HighlightOne}. {HighlightTwo}.
  {PanelSentiment}."

Where:
- HighlightOne pulls the highest-impact sentence from the reason (longest sentence with most impact verbs)
- HighlightTwo pulls a second one if the reason is long enough
- PanelSentiment is generated from votes — examples:
  - "Panel was unanimous in their support."
  - "5 of 7 panel members approved this nomination."
  - "Approved by manager and lead reviewer."

The output should feel AI-generated but be 100% deterministic — same input always produces same output. This avoids needing an API key.

**Winner selection page updates** (`client/src/pages/winner-selection.tsx` or wherever panel lead selects winners):

1. **AI Shortlist banner at top** (collapsible, default expanded)
   - "✨ AI shortlist — top 10 nominations" heading
   - "{N} approved nominations were scored. Here are the top 10. The panel lead can override these picks."
   - 10 cards stacked vertically, each showing:
     - Rank pill (1, 2, 3…)
     - Score: "{score}/100"
     - Nominee avatar + name + role
     - Reasoning paragraph (2-3 sentences from the generator above)
     - 2-3 highlight bullets
     - Checkbox: "Include as winner" (top N checked by default based on category's maxWinners)
     - "View full nomination" expandable

2. **Below the shortlist**: full list of all approved nominations, paginated. Lead can still browse and pick from outside the top 10.

3. **Confirm winners** button at bottom — promotes selected nominations to `status: "winner"` with their `finalRank` set by selection order.

**After winners are selected** — the "Winners declared" page (`/programs/:id/winners` or a section on the program detail page):

Show each winner as a card with these action buttons:

- **Create citation** (button stub) — toast: "Citation editor coming in Phase 3 — will let you add custom text and photo"
- **Generate PDF** (button stub) — toast: "PDF generation coming in Phase 3"
- **Generate PowerPoint** (button stub) — toast: "PPT generation coming in Phase 3"
- **Send to HR for publishing** (button stub) — toast: "Workflow coming in Phase 3"

Then a section at the bottom for the HR admin specifically (visible only to admins, gated by role):

- **Publish to award night display** — toast: "Award-night display coming in Phase 3"
- **Email announcement** — toast: "Email blast coming in Phase 3 (uses SendGrid)"
- **Post to social channels** — small grid of buttons (LinkedIn, Twitter, Slack, MS Teams) — each shows a toast: "Social post composer coming in Phase 3"

All these stubs include a tooltip on hover: "Phase 3 feature — Phase 2 ships the foundation." This signals to demo viewers that this is intentional, not broken.

**Audit log entry**: each time the AI shortlist is generated, write a small entry to `engagex_ai_shortlist_log_{programId}_{cycleId}` so it's reproducible. Lets you debug why a specific score was given.

**Visualization**: above the AI shortlist banner, show a horizontal bar chart of score distribution across all approved nominations for the category. Helps the panel lead see where the natural cutoff is.

**Don't change**: nomination flow, manager approval inbox, panel review page. Those upstream stay as-is.
~~~
---


## Phase 2 — Feed + Social Layer

### Prompt 2.1 — Wire the existing FEED-based feed to localStorage badges

````
The mobile home feed at `client/src/pages/mobile/home.tsx` currently uses hardcoded `FEED` from `client/src/lib/mobile-data.ts`. Replace this with live data from `engagex_badges` localStorage.

**Don't delete `FEED`** — leave it as fallback/demo data so the seed-companies flow still has something to show before any real badges exist.

**Approach**:
1. Add a new helper in `client/src/lib/badges.ts`: `getCombinedFeed(account): FeedEntry[]`
   - Returns badges from `engagex_badges`, **filtered to `status === "approved"` only** (pending and rejected don't show in the feed), mapped to a shape compatible with the existing `RecognitionFeedItem` so `RecognitionCard` doesn't need a rewrite
   - If the badges list is empty AND seed flag is set, fall back to FEED entries
   - Sort newest first

2. **Update `RecognitionCard`** (`client/src/components/mobile/recognition-card.tsx`):
   - Make the category chip prominent (use the recognition category's emoji and color from `account.recognitionCategories`)
   - Tier label as a small pill: "Exceptional · 100 pts" or just "Thanks" if 0 pts
   - Hide the points portion when `appreciationPolicy.monetaryEnabled === false` — just show the tier name
   - Footer row: reaction buttons (👏 🎉 💪 ❤️ 🙌 — show count if > 0), comment count, "Boost" button if current user hasn't boosted (hide Boost when monetary disabled)
   - Relative timestamp using a tiny inline `timeAgo()` helper

3. **Update `mobile/home.tsx`**:
   - Replace `FEED.filter(...)` with the new combined feed
   - Use a new hook `useLocalStorageList<Badge>("engagex_badges")` in `client/src/hooks/use-local-storage-list.ts` — listens for `storage` events AND polls every 2 seconds so same-tab writes refresh the feed

4. **Empty state** when both engagex_badges and FEED are empty: "No appreciations yet. Be the first to recognize a teammate!" + CTA that opens RecognizeDialog.

5. **My Appreciations sub-view** (`/m/my-appreciations`) — new page for the sender to see their own pending/rejected badges:
   - Tabs: Approved / Pending / Rejected
   - "Pending" shows badges waiting on approver with the approver's name and "Sent {timeAgo}"
   - "Rejected" shows badges that were declined with the approver's rejection comment

Reactions/comments/boost UI lives in the next prompt — for this one, the buttons exist but only show counts (no-op on click).
````

---

### Prompt 2.2 — Reactions, comments, and boost

````
Add interactive social actions to the appreciation feed.

**Reactions**:
- Tapping a reaction emoji toggles the current user in/out of `badge.reactions[emoji]`
- Show the picker as a small popover that appears when tapping the existing "react" button (use shadcn Popover)
- Available reactions: 👏 🎉 💪 ❤️ 🙌
- Animate the icon when the current user has reacted (`scale-110` + colored background)

**Comments**:
- Tapping the comment icon expands an inline comments thread (don't open a new page)
- Each comment shows: avatar, name, text, "Xm ago"
- Input box at the bottom: "Add a comment..." + send icon
- Comments list reverses (oldest at top, newest at bottom)
- Max 280 chars per comment

**Boost** (requires `appreciationPolicy.monetaryEnabled === true`):
- Tapping "Boost" opens a small inline form below the badge:
  - "Add your own message" textarea
  - Points slider 0 → giver's available balance (max 50 pts boost)
  - "Boost" submit button
- On submit: deducts from booster's wallet, credits the receiver, appends to `badge.boosts[]`
- Display boosts under the original message as a stacked list: "+ Marcus boosted with 25 pts: 'Couldn't agree more!'"
- A user can only boost a given badge once
- Hide the Boost button entirely when monetary is disabled

All three actions must persist to localStorage and the feed must reflect them immediately without a refresh.
````

---

## Phase 3 — Programs (the RnR side)

### Prompt 3.1 — Program categories + eligibility rules

````
Extend the Program model to support multiple categories per program and rich eligibility rules.

**Schema** in `client/src/lib/programs-data.ts`:

```ts
type ProgramCategory = {
  id: string;
  name: string;            // e.g., "Customer Hero"
  description: string;
  emoji: string;
  maxWinners: number;      // 1 = single winner, N = top N winners
  prizePoints: number;     // points awarded to each winner
};

type EligibilityRules = {
  departments?: string[];       // empty = all departments
  locations?: string[];         // empty = all locations
  roles?: string[];             // employee | manager | admin (any combination)
  minTenureMonths?: number;     // 0 = no minimum
  excludePastWinnersWithinCycles?: number;  // e.g., 2 = can't win again for 2 cycles
};

type ProgramCadence = "monthly" | "quarterly" | "annual" | "one-off";
```

Update `Program` type to add:
- `categories: ProgramCategory[]` (replaces the single implicit category — keep backwards compatibility by giving existing seed programs one default category each)
- `eligibility: EligibilityRules`
- `cadence: ProgramCadence`
- `cycleStartDate: string` // ISO
- `cycleEndDate: string` // ISO

**Update all 6 active programs** in `PROGRAMS[]` with realistic categories:
- "Employee of the Month" → 1 category, 1 winner, monthly cadence
- "Peer-to-Peer Recognition" → 3 categories (Collaboration Star, Quick Helper, Mentor of the Month), 1 winner each, monthly
- "Values Champion" → one category PER company value (dynamically generated — for seed data, hardcode 4)
- "Innovation Award" → 2 categories (Big Idea, Process Improvement), 1 winner each, quarterly
- "Years of Service" → 4 categories (1 yr, 3 yrs, 5 yrs, 10 yrs), unlimited winners each, monthly
- "Culture Champion" → 1 category, top 3 winners, quarterly

**New helper**: `isEligible(employee, program): boolean` checking rules against the employee record.

Don't touch the program detail page yet — Prompt 3.2 handles the UI.
````

---

### Prompt 3.2 — Program detail page: show categories + winners per category

````
Update the program detail page (`client/src/pages/mobile/program-detail.tsx`) to render the new category system.

**Dashboard tab** changes:
- Above the existing leaderboard, add a "Categories" section showing each category as a card:
  - Emoji + name + description
  - "Max winners: 1" or "Top 3 winners" pill
  - Prize: "100 pts" pill
  - Nomination count for this category (placeholder 0 for now — wire up in next prompt)

**Details tab** changes:
- After the "Reward your teammate" card you already built, add an "Eligibility" card showing:
  - Departments (or "Open to all departments")
  - Locations (or "Open to all locations")
  - Tenure (or "No minimum tenure")
  - Past winners cooldown if set

**Admin tab (rename from Panel later)** changes:
- The Panel tab stays as-is for now — Prompt 3.4 rebuilds it as the full admin tab

This is purely a presentation change. No new data, no new logic — just render what's now on the Program object.
````

---

### Prompt 3.3 — Nomination flow with manager approval

````
Build the nomination workflow — the core RnR feature.

**Schema** in a new file `client/src/lib/nominations.ts`:

```ts
type NominationStatus =
  | "pending-manager"
  | "pending-panel"
  | "approved"
  | "rejected"
  | "winner"
  | "not-selected";

type Nomination = {
  id: string;
  programId: string;
  categoryId: string;
  nomineeId: string;       // who is being nominated
  nominatorId: string;     // who submitted it
  reason: string;          // min 100 chars
  evidenceUrls?: string[]; // optional, for Phase 2
  managerId: string;       // nominee's manager (looked up from employee record)
  status: NominationStatus;
  managerDecision?: { decidedBy: string; decidedAt: string; comment: string; approved: boolean };
  panelDecisions?: { panelMemberId: string; decidedAt: string; vote: "approve" | "reject"; comment: string }[];
  finalRank?: number;      // 1, 2, 3... when winners are selected
  createdAt: string;
  updatedAt: string;
};
```

Storage key: `engagex_nominations`. Add CRUD helpers.

**Nominee picker** + **submit form**: when an employee taps "Nominate" on a program (or on the new "Reward your teammate" card), open a multi-step dialog:
1. Pick category (cards, one per category in the program)
2. Pick nominee (search-filtered list, exclude self, filter to eligibility rules)
3. Write reason (textarea, min 100 chars, with a char counter + tip: "Be specific. What did they do? What was the impact?")
4. Review + submit

On submit: create nomination with status `pending-manager`, set `managerId` to the nominee's manager from mock employee data.

**My nominations** page at `/m/nominations`:
- Two tabs: "Submitted by me" and "Nominations of me"
- Each row: program · category · nominee/nominator · reason snippet · status badge · created date
- Tapping opens a detail view with the full reason and the current decision state

**Manager approval inbox** at `/m/nominations/inbox` (only visible to managers):
- Shows nominations where current user is `managerId` and status is `pending-manager`
- Approve / Reject buttons with a required comment field
- On approve: status → `pending-panel`
- On reject: status → `rejected`
- Add a notification dot to the bottom nav for pending items

**Update bottom nav** to add a "Nominations" tab (replace one of the less-used existing ones if needed — propose which one).

The panel decision flow comes next.
````

---

### Prompt 3.4 — Panel review and winner selection

````
Build the panel review side of the nomination workflow.

**Panel review page** at `/m/nominations/panel`:
- Visible only to users who are members of any program's panel
- Top section: program selector (if user is on multiple panels)
- For the selected program, group nominations by category
- Each category shows nominations in `pending-panel` status as cards:
  - Nominee avatar + name + role
  - Nominator name + "nominated on {date}"
  - Full reason
  - Manager's approval comment
  - "Approve" / "Reject" buttons + comment field
- Each panel member can vote independently
- When a category has decisions from all panel members, show a "Select winners" button

**Winner selection page** (for panel lead only):
- Shows all `approved` nominations per category, ranked by panel approval ratio
- For each category, lead picks the top `maxWinners` and confirms
- On confirm:
  - Selected nominations → status `winner`, set `finalRank` (1, 2, 3...)
  - Unselected → status `not-selected`
  - Credit `prizePoints` to each winner's wallet (no-op if monetary is disabled)
  - Create a special "winner" badge entry in `engagex_badges` so the appreciation feed announces it
  - Lock the cycle — no new nominations in this category

**Program detail page updates** (`program-detail.tsx`):
- Replace the existing panel tab content with a much richer Admin tab:
  - "Pending manager review" count
  - "Pending panel review" count
  - "Ready to select winners" count
  - Per-category breakdown
  - Quick action buttons that navigate to the relevant inbox
- Past winners section showing the actual `finalRank=1,2,3` nominations from completed cycles

**Notification** logic update: badge the bottom nav with total unread items across nomination inbox + panel review + appreciation approval inbox (whichever apply to the current user's role).
````

---

## Phase 4 — Rewards, Catalog, and Milestones

### Prompt 4.1 — Rewards catalog with three categories

````
Build a functional (mocked) rewards catalog.

**Important**: if `appreciationPolicy.monetaryEnabled === false`, the rewards catalog and redemptions inbox are hidden from navigation entirely. Add a single check that drives both behaviors. The HR admin can still see settings to configure rewards for when monetary is later turned on.

**Schema** in a new file `client/src/lib/rewards.ts`:

```ts
type RewardKind = "gift-card" | "swag" | "charity";
type Reward = {
  id: string;
  kind: RewardKind;
  name: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  inventory?: number; // undefined = unlimited
};

type Redemption = {
  id: string;
  userId: string;
  rewardId: string;
  pointsCost: number;
  status: "requested" | "approved" | "fulfilled" | "rejected";
  createdAt: string;
  fulfilledAt?: string;
  shippingAddress?: string;
};
```

Seed 20 rewards across the 3 kinds:
- 10 gift cards: Amazon ($25/$50/$100), Starbucks ($25), DoorDash ($50), Spotify ($30), Apple App Store ($50), Target ($50), Best Buy ($100), Airbnb ($100) — pointsCost = dollars × 100
- 6 swag items: T-Shirt (1500 pts), Hoodie (3000), Mug (800), Water Bottle (1200), Sticker Pack (300), Hat (1500)
- 4 charity donations: Red Cross ($10), Feeding America ($25), Doctors Without Borders ($50), Local Food Bank ($10) — pointsCost = dollars × 100

Use placeholder image URLs — use a `via.placeholder.com` style or a free Unsplash URL.

**Catalog page** at `/m/rewards`:
- Top: current user's receive-balance prominently displayed
- Three tabs: All / Gift Cards / Swag / Charity
- Grid of reward cards (2 cols mobile, 4 cols desktop)
- Each card: image, name, "Redeem for X pts" button (disabled if user can't afford)
- Tapping card opens detail dialog with description, larger image, and a confirm-redeem button
- For swag: require shipping address before confirm

**Redemption flow**:
- On redeem: deduct points, create Redemption with status `requested`, show success toast "Order placed! HR will fulfill within 5 business days."
- For charity: instantly status `fulfilled` with success message "Donation made on your behalf — thank you!"

**My redemptions** page at `/m/rewards/history`:
- List of past redemptions with status badges
- Filter by status

**HR Admin redemptions inbox** at `/redemptions` (web admin):
- Table of all pending redemptions
- Bulk approve / fulfill actions
- Mark fulfilled triggers a feed post: "Sarah just redeemed a $50 Amazon gift card 🎉"
````

---

### Prompt 4.2 — Automated milestones (birthdays + anniversaries)

````
Build auto-posting of milestone badges to the feed.

**Schema additions** in `client/src/lib/mobile-data.ts` or wherever employees are defined:
- Each employee record needs `birthday: string` (MM-DD) and `joinedDate: string` (ISO YYYY-MM-DD)

Seed all existing mock employees with realistic values.

**New file** `client/src/lib/milestones.ts`:
- `getDueMilestones(today: Date): Milestone[]` — finds all employees whose birthday or work anniversary is today
- `processMilestones()` — runs on app load, checks which milestones have already been posted today (using a `engagex_milestones_processed_${YYYY-MM-DD}` key as a flag), and creates badge entries for any that haven't

Milestone badges bypass the approval workflow — they're system-generated and post directly with `status: "approved"`. They also bypass the sending window check.

Milestone badge format:
- Birthday: from="System", to=employee, value="Celebration" (auto-create if missing), tier="thanks", points=0, message="🎂 Happy birthday, {firstName}!"
- Anniversary: from="System", to=employee, message="🎉 Celebrating {N} years at {company} — thank you, {firstName}!"
- Years of service badges trigger receive-points based on tenure: 1 yr = 100 pts, 3 yrs = 300, 5 yrs = 500, 10 yrs = 1000 (skip credit if monetary is disabled)

Call `processMilestones()` once on app mount in `App.tsx` (after the seed runs).

**Admin settings** — add a "Milestones" sub-section in HR Settings:
- Toggle: Auto-post birthdays (default on)
- Toggle: Auto-post work anniversaries (default on)
- Tenure points map (editable: 1 → 100, 3 → 300, etc.)

**Mobile employee profile** — add the employee's birthday and join date to their profile page so it's visible.
````

---

## Phase 5 — Admin Tooling

### Prompt 5.1 — Recognition equity dashboard

````
Build the HR Admin "Insights → Recognition" page showing equity and trends across the org.

The existing `client/src/pages/mobile/insights.tsx` is employee-facing. Build the HR admin version by extending `client/src/pages/analytics.tsx`.

**Sections**:

1. **KPI strip** (4 cards):
   - Total appreciations this month / delta vs last month (count approved badges only)
   - Active givers (% of employees who gave at least 1 approved badge this month)
   - Recognition equity score (% of employees who received at least 1 approved badge this month)
   - Avg appreciations per employee per month

2. **Recognition by department** (bar chart, use Recharts BarChart):
   - X-axis: department names
   - Y-axis: avg appreciations per employee in that dept this month
   - Highlight bars where the value is < 50% of company average in a red tint

3. **Underrecognized employees** (table):
   - Employees who haven't received a badge in the current month
   - Columns: name, role, department, last received date, manager
   - Sort by "longest without recognition" descending
   - Use this to nudge managers — add a "Nudge their manager" button (placeholder action, just shows a toast for now)

4. **Top values this month** (horizontal bar chart):
   - Each company value with count of badges tagged with it
   - Helps HR see which cultural behaviors are most reinforced

5. **Active programs status** (list):
   - For each active program: pending nominations, days remaining, winner selection status

6. **Pending approvals** (new card, when `appreciationPolicy.approval.required` is on):
   - Total appreciations waiting on approver
   - Top approvers with backlog: shows approver name + count of pending items + avg time-to-decide
   - Helps HR spot bottlenecks in the approval workflow

**Filters at top**: date range (this month / last month / quarter), department multi-select.

All data computed from localStorage (`engagex_badges`, `engagex_nominations`). No new persistence needed.
````

---

### Prompt 5.2 — Budget tracking per program and per department

````
Add budget tracking layered onto programs and departments.

**Schema additions**:
- `Program` gains: `budget: { allocated: number; spent: number; period: "current-cycle" | "annual" }`
- `Account` gains: `departmentBudgets: Record<string, { allocated: number; spent: number; periodStart: string }>` — keyed by department name

Update seed data to give each program a realistic budget (e.g., Innovation Award has $2000/quarter, Years of Service has $5000/year) and each department a recognition budget ($500/month for engineering, $400 for sales, etc.).

**Update wallet deductions** to also deduct from the relevant department's budget when an appreciation is sent (pointsCost × $0.01 = $0.50 per 50 pts). Skip when monetary is disabled.

**Update winner selection** to deduct from the program's budget when prize points are awarded.

**HR Admin Budgets page** at `/budgets`:
- Top: company-wide total
- Section 1: Programs table — name, allocated, spent, % used, days remaining in cycle, "Top up" button (shows a dialog to add budget)
- Section 2: Departments table — same shape but for department budgets
- Red row highlighting when > 90% spent
- Export to CSV button

**Block over-spending**: when an admin or employee tries to give recognition that would push the dept budget negative, show an inline warning "{Department} is over budget — confirm anyway?" with a confirm button. HR admins can override; employees can't.
````

---

## Phase 6 — Differentiators (last)

### Prompt 6.1 — AI writing assist for appreciation messages

````
Add an AI writing assist feature to the RecognizeDialog appreciation flow.

The "improve my message" button calls Anthropic's Claude API. Since this app has no real backend, do this client-side with a fetch to Anthropic's API — accept an `ANTHROPIC_API_KEY` env var via Vite (`import.meta.env.VITE_ANTHROPIC_API_KEY`), and stub gracefully if the key is missing (show "AI assist requires setup — contact your admin").

**UI changes** in `RecognizeDialog`:
- On the message-writing step, below the textarea, add a small button: "✨ Make it more specific"
- Disabled if the message is < 5 characters
- On click: shows a spinner, then opens a small popover with the AI's suggestion
- "Use this" button replaces the textarea content; "Try again" re-generates; "Keep mine" closes the popover

**Prompt to Claude** (use Claude Haiku for speed/cost):
```
You're helping an employee write a more specific, meaningful appreciation message to a colleague.

The employee picked the company value: "{valueName}" — {valueDescription}
They wrote: "{originalMessage}"

Rewrite their message to be:
- More specific about WHAT the colleague did
- Connect to the company value
- Stay warm and genuine, not corporate
- Under 280 characters
- Keep their voice and tone

Respond with ONLY the rewritten message. No quotation marks, no preamble.
```

Use a Vercel `/api/improve-message` serverless function if you want to hide the API key — but for Phase 1 a client-side call with a noisy-warning "demo only — keys exposed" is acceptable.

**Settings toggle**: HR admin can turn AI assist on/off in Settings → Recognition.
````

---

### Prompt 6.2 — Slack notification stub (program winners only)

````
Add a basic Slack webhook integration for winner announcements.

This is intentionally minimal — Phase 1 only handles posting winner announcements to a configured Slack channel via incoming webhook (no OAuth, no real Slack app).

**HR Admin Integrations tab** — add a Slack section:
- Input: "Slack incoming webhook URL"
- Save button
- "Test" button → sends a sample message "🎉 EngageX integration test from {company}"

Store the webhook URL on the Account: `integrations.slackWebhookUrl: string`.

**Trigger points**:
- When winners are selected in a program: POST to the webhook with a formatted message:
  ```
  🏆 *{programName} — {categoryName} winners announced!*
  🥇 {winner1Name} ({winner1Role})
  🥈 {winner2Name}
  🥉 {winner3Name}
  Congrats! 🎉
  ```
- HR admin opt-in toggle per program ("Announce winners to Slack")

**Failure handling**: wrap in try/catch, show a toast if it fails, don't block the winner-selection flow.

This is a stub. It demonstrates the integration pattern without building the real Slack app — that's Phase 2.
````

---

## Timeline

Rough effort with Claude Code, assuming focused work:

| Phase | Effort |
|---|---|
| Phase 1 — Foundations (categories upgrade + appreciation policy + wallet + recognize dialog + wallet UI) | 2 days |
| Phase 2 — Feed + social layer | 1 day |
| Phase 3 — Program upgrade + nominations + panel + winner selection | 2 days |
| Phase 4 — Rewards catalog + milestones | 1–2 days |
| Phase 5 — Admin tooling (equity dashboard + budgets) | 1 day |
| Phase 6 — AI assist + Slack stub | 1 day |
| **Total** | **8–9 days** |

Note: Phase 1 is now 5 prompts (1.1–1.5) instead of 4, due to the addition of the Appreciation Policy. Allow an extra day.

---

## Notes

- **Migration safety**: Prompts 1.1, 1.2, and 1.3 all add migration helpers so older saved accounts in `localStorage` don't break. Don't skip them.
- **Seed data**: the super admin "Reset all" button re-seeds 5 dummy companies. After each phase, run Reset all to verify the new fields populate correctly.
- **Don't skip Phase 5.** Recognition equity dashboards and budget tracking are what HR buyers evaluate first — without them, this looks like a chat app with badges. Technical effort is low; perceived value is high.
- **`appreciationPolicy.monetaryEnabled` is the master switch.** Many prompts check it. Watch for any UI that should hide or skip behavior when monetary is off (wallet, rewards, Boost button, points display, redemptions inbox).

---

## Appendix: optional `CLAUDE.md` for the repo root

Drop this in the project root so Claude Code reads it every session and you can skip pasting the Phase 0 primer.

```markdown
# EngageX

Employee appreciation + R&R HR app. TypeScript + React + Tailwind + shadcn/ui + react-router-dom (HashRouter). No backend — all state in localStorage under `engagex_*` keys.

## Conventions
- Mobile employee app: `/m/*` routes; HR admin web app: root
- Brand color: `#a87a3a`, font is "DM Sans" via `font-mobile` class
- Reuse shadcn primitives in `client/src/components/ui/`
- Account state lives in `client/src/lib/account.ts`
- All storage keys prefixed `engagex_`

## Key Account fields to know about
- `recognitionCategories: RecognitionCategory[]` — the "company values"
- `appreciationPolicy` — org-wide monetary on/off, sending window, approval workflow
- `pointsPolicy` — per-role wallet allowances and tier values
- `products: { appreciation, rnr }` — feature flags per company

## Before making code changes
Read `client/src/App.tsx`, `client/src/lib/account.ts`, and the page being modified. Reuse existing patterns; don't introduce new state libraries.
```

— *Generated as part of the EngageX Phase 1 planning session.*
