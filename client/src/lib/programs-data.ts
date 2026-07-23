export type ProgramStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "ending-soon"
  | "ended";

export type ProgramCadence = "monthly" | "quarterly" | "yearly" | "one-off";

// ─── Category-level model (Phase 1.8) ─────────────────────────────────
//
// Guidelines, eligibility, and the panel of judges now live on each award
// category — not on the program. The program is a container for shared
// settings (banner, icon, cycle, notifications); everything evaluative
// belongs to the category. The migration helper at `normalizeProgram()`
// pushes legacy program-level panel/eligibility down onto every category.

export type CategoryCriterion = {
  id: string;
  label: string;
  /** What "good" looks like for this criterion — feeds AI scoring rationale. */
  description: string;
  /** 0–100. Weights across criteria should sum to ~100. */
  weight: number;
};

export type CategoryGuidelines = {
  /** 1–2 sentence what this award is for. */
  summary: string;
  /** The rubric the panel and AI score against. */
  criteria: CategoryCriterion[];
  /** Longer prose with examples of strong nominations. */
  whatGoodLooksLike: string;
  /** Optional — what makes a nomination ineligible. */
  disqualifiers?: string;
};

export type CategoryEligibility = {
  /** Empty = open to all departments. */
  departments: string[];
  /** Empty = open to all locations. */
  locations: string[];
  /** Empty = open to all roles. */
  roles: string[];
  minTenureMonths: number;
  /** 0 = no exclusion. */
  excludePastWinnersCycles: number;
  /** Free-text note shown to nominators on the nominate dialog. */
  customNote?: string;
};

/** @deprecated Backwards-compatible alias for code that hasn't been migrated yet. */
export type ProgramEligibility = CategoryEligibility;

export type ProgramCategory = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** 1–10. */
  winnersCount: number;
  /** 0–10000. Hidden when monetary recognition is disabled. */
  prizePoints: number;
  /** Phase 1.8 — the rubric the panel and AI score against. */
  guidelines?: CategoryGuidelines;
  /** Phase 1.8 — who can be nominated in this category. */
  eligibility?: CategoryEligibility;
  /** Phase 1.8 — judges for this specific category. Exactly one is lead. */
  panel?: PanelMember[];
  /**
   * Phase 1.10 starter — per-category budget allocation. The program's
   * total `budgetAllocated` is the sum of these. Migration distributes any
   * legacy program-level budget across categories on first read.
   */
  budgetAllocated?: number;
};

export type ProgramNotifications = {
  notifyNominees: boolean;
  notifyAllOnLaunch: boolean;
  announceWinnersToSlack: boolean;
};

export type ProgramBudgetPeriod = "current-cycle" | "annual";

export type ProgramHighlight = {
  iconKey: "target" | "trophy" | "gift" | "users" | "award" | "rocket";
  title: string;
  body: string;
};

export type ProgramPrize = {
  rank: 1 | 2 | 3;
  amount: number;
};

export type ProgramAttentionItem = {
  severity: "high" | "medium" | "low";
  title: string;
  body: string;
};

export type ProgramLeaderboardEntry = {
  rank: number;
  name: string;
  role: string;
  avatar: string;
  points: number;
};

export type PanelMember = {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  /** True for the panel chair / lead. */
  lead?: boolean;
  /** How many nominations this member has already reviewed this cycle. */
  reviewed: number;
  /** Total nominations to review this cycle. */
  totalToReview: number;
};

/** A document attached to a program (guidelines PDF / Word doc). */
export type ProgramDocument = {
  /** Original filename, shown next to the link. */
  name: string;
  /** MIME type, e.g. "application/pdf". */
  type: string;
  /**
   * Either a `data:` URL for a file uploaded by the admin (there is no backend,
   * so it lives in localStorage alongside the program) or an external http(s)
   * link to a doc hosted elsewhere.
   */
  url: string;
};

export type Program = {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
  emoji: string;
  themeBg: string;
  status: ProgramStatus;
  pointsPerWin: number;
  daysLeft: number;
  nominations: number;
  nominationsDelta?: number;
  participantsRate?: number;
  participantsDelta?: number;
  budgetAllocated: number;
  budgetUsed: number;
  prizes?: ProgramPrize[];
  programLeaderboard?: ProgramLeaderboardEntry[];
  attentionItems?: ProgramAttentionItem[];
  topNominee?: {
    name: string;
    nominationCount: number;
  };
  highlights: ProgramHighlight[];
  lastWinner?: {
    name: string;
    team: string;
    avatar: string;
    quote: string;
  };
  /**
   * @deprecated Phase 1.8 — Panels live on each category now. This field
   * is read only by the migration helper, which copies it down onto any
   * category that lacks its own panel and then clears this. Don't read
   * from `program.panel` directly — use `getAllProgramPanelMembers(program)`
   * or iterate `program.categories[].panel`.
   */
  panel?: PanelMember[];

  // ─── Phase 1.6 — HR-configured fields ────────────────────────────────
  /** ID of the chosen banner preset, e.g. "amber-glow". */
  bannerId?: string;
  /** Inline data URL when the admin uploaded a custom banner image. */
  customBannerDataUrl?: string;
  /** Display emoji for the program (the existing `emoji` field stays as-is). */
  iconEmoji?: string;
  cadence?: ProgramCadence;
  /** Detailed guidelines doc (PDF/Word) the admin attaches when creating the program. */
  guidelinesDoc?: ProgramDocument;
  /** ISO date strings. */
  startDate?: string;
  endDate?: string;
  /** Auto-spin a new cycle when the current one ends. */
  repeatAutomatically?: boolean;
  /** Award categories the panel selects winners across. */
  categories?: ProgramCategory[];
  /**
   * @deprecated Phase 1.8 — Eligibility lives on each category now. Read
   * only by the migration helper, which copies it down onto any category
   * that lacks its own eligibility and then clears this.
   */
  eligibility?: ProgramEligibility;
  budgetPeriod?: ProgramBudgetPeriod;
  notifications?: ProgramNotifications;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

export const PROGRAMS: Program[] = [
  {
    id: "employee-of-the-month",
    name: "Employee of the Month",
    shortDesc: "Recognizing outstanding performance and leadership each month.",
    description: "Recognizing outstanding performance and leadership each month.",
    emoji: "🏆",
    themeBg: "linear-gradient(180deg, #fbe9c8 0%, #f5d8a3 100%)",
    status: "active",
    pointsPerWin: 100,
    daysLeft: 8,
    nominations: 28,
    nominationsDelta: 12,
    participantsRate: 67,
    participantsDelta: 12,
    budgetAllocated: 30000,
    budgetUsed: 18400,
    prizes: [
      { rank: 1, amount: 15000 },
      { rank: 2, amount: 8000 },
      { rank: 3, amount: 4500 },
    ],
    programLeaderboard: [
      { rank: 1, name: "Dianne Russell",  role: "UI designer", avatar: "/m/images/user04.png", points: 825 },
      { rank: 2, name: "Robert Fox",      role: "Director",    avatar: "/m/images/user05.png", points: 790 },
      { rank: 3, name: "Cristofer Botosh",role: "Director",    avatar: "/m/images/user06.png", points: 782 },
    ],
    attentionItems: [
      { severity: "medium", title: "Sales dept has 0 appreciations sent", body: "18 employees — consider a nudge" },
    ],
    topNominee: { name: "Courtney Henry", nominationCount: 28 },
    highlights: [
      { iconKey: "target",  title: "Who can participate?", body: "All employees can nominate their peers." },
      { iconKey: "trophy",  title: "How it works",        body: "Nominate a peer who has demonstrated exceptional performance and leadership." },
      { iconKey: "gift",    title: "What's in it for you?", body: "Winners receive recognition, points, and a special badge!" },
    ],
    lastWinner: {
      name: "Aarav Mehta",
      team: "Product Design Team",
      avatar: "/m/images/user03.png",
      quote: "Consistently delivers excellence and inspires the entire team!",
    },
    panel: [
      { id: "p1", name: "Sarah Chen", role: "VP People Operations", department: "People Ops", avatar: "/m/images/user02.png", lead: true, reviewed: 18, totalToReview: 28 },
      { id: "p2", name: "Marcus Johnson", role: "CHRO", department: "Executive", avatar: "/m/images/user05.png", reviewed: 22, totalToReview: 28 },
      { id: "p3", name: "Priya Sharma", role: "Director of Product", department: "Product", avatar: "/m/images/user03.png", reviewed: 14, totalToReview: 28 },
      { id: "p4", name: "James Wilson", role: "Engineering Director", department: "Engineering", avatar: "/m/images/user04.png", reviewed: 11, totalToReview: 28 },
    ],
  },
  {
    id: "peer-to-peer",
    name: "Peer-to-Peer Recognition",
    shortDesc: "Quick kudos for everyday teamwork and small wins.",
    description: "Spot a colleague going above and beyond in the moment? Send them a peer recognition.",
    emoji: "💬",
    themeBg: "linear-gradient(180deg, #e9e0ff 0%, #d2c3ff 100%)",
    status: "active",
    pointsPerWin: 50,
    daysLeft: 5,
    nominations: 14,
    nominationsDelta: 8,
    participantsRate: 54,
    participantsDelta: 6,
    budgetAllocated: 30000,
    budgetUsed: 18000,
    prizes: [
      { rank: 1, amount: 8000 },
      { rank: 2, amount: 5000 },
      { rank: 3, amount: 3000 },
    ],
    programLeaderboard: [
      { rank: 1, name: "Dianne Russell", role: "UI Designer",   avatar: "/m/images/user04.png", points: 612 },
      { rank: 2, name: "Albert Flores",  role: "Sr Engineer",   avatar: "/m/images/user03.png", points: 580 },
      { rank: 3, name: "Courtney Henry", role: "Delivery Head", avatar: "/m/images/user02.png", points: 542 },
    ],
    attentionItems: [
      { severity: "low", title: "Engineering dept lagging", body: "Only 4 kudos this week — usually 12+" },
    ],
    topNominee: { name: "Dianne Russell", nominationCount: 14 },
    highlights: [
      { iconKey: "users",  title: "Who can participate?", body: "All employees can recognize each other." },
      { iconKey: "trophy", title: "How it works",        body: "Send a peer kudos with a note. No nomination cycle — recognize anytime." },
      { iconKey: "gift",   title: "What's in it for you?", body: "Earn points for every recognition received, redeem in the rewards catalog." },
    ],
    lastWinner: {
      name: "Dianne Russell",
      team: "Design Team",
      avatar: "/m/images/user04.png",
      quote: "Always the first to help — sets the bar for collaboration.",
    },
    panel: [
      { id: "p1", name: "Sarah Chen", role: "VP People Operations", department: "People Ops", avatar: "/m/images/user02.png", lead: true, reviewed: 10, totalToReview: 14 },
      { id: "p2", name: "Aisha Patel", role: "People Partner", department: "People Ops", avatar: "/m/images/user06.png", reviewed: 14, totalToReview: 14 },
      { id: "p3", name: "Rahul Kumar", role: "Engineering Manager", department: "Engineering", avatar: "/m/images/user07.png", reviewed: 6, totalToReview: 14 },
    ],
  },
  {
    id: "values-champion",
    name: "Values Champion",
    shortDesc: "Exemplifies our core values in everything they do.",
    description: "Quarterly recognition for someone who lives our company values daily.",
    emoji: "🛡️",
    themeBg: "linear-gradient(180deg, #d6f5e1 0%, #a7e8c0 100%)",
    status: "active",
    pointsPerWin: 200,
    daysLeft: 5,
    nominations: 14,
    nominationsDelta: 4,
    participantsRate: 39,
    participantsDelta: 2,
    budgetAllocated: 30000,
    budgetUsed: 18000,
    prizes: [
      { rank: 1, amount: 12000 },
      { rank: 2, amount: 6000 },
      { rank: 3, amount: 3000 },
    ],
    programLeaderboard: [
      { rank: 1, name: "Albert Flores",  role: "Sr Engineer", avatar: "/m/images/user03.png", points: 480 },
      { rank: 2, name: "Dianne Russell", role: "UI Designer", avatar: "/m/images/user04.png", points: 410 },
      { rank: 3, name: "Robert Fox",     role: "Director",    avatar: "/m/images/user05.png", points: 365 },
    ],
    topNominee: { name: "Dianne Russell", nominationCount: 14 },
    highlights: [
      { iconKey: "award",  title: "Who can participate?", body: "Open to all employees, nominated by peers and managers." },
      { iconKey: "trophy", title: "How it works",        body: "Submit a story of how the nominee embodied a company value." },
      { iconKey: "gift",   title: "What's in it for you?", body: "Quarterly winner receives a special badge, points, and team-wide spotlight." },
    ],
    lastWinner: {
      name: "Albert Flores",
      team: "Engineering",
      avatar: "/m/images/user03.png",
      quote: "A model of integrity and craft — what we aspire to.",
    },
    panel: [
      { id: "p1", name: "Marcus Johnson", role: "CHRO", department: "Executive", avatar: "/m/images/user05.png", lead: true, reviewed: 4, totalToReview: 8 },
      { id: "p2", name: "Sarah Chen", role: "VP People Operations", department: "People Ops", avatar: "/m/images/user02.png", reviewed: 7, totalToReview: 8 },
      { id: "p3", name: "David Kim", role: "Chief of Staff", department: "Executive", avatar: "/m/images/user01.png", reviewed: 5, totalToReview: 8 },
      { id: "p4", name: "Lin Wang", role: "VP Engineering", department: "Engineering", avatar: "/m/images/user04.png", reviewed: 6, totalToReview: 8 },
      { id: "p5", name: "Carla Mendes", role: "VP Customer Success", department: "CS", avatar: "/m/images/user03.png", reviewed: 3, totalToReview: 8 },
    ],
  },
  {
    id: "innovation-award",
    name: "Innovation Award",
    shortDesc: "Bold ideas that move the needle.",
    description: "Quarterly award for the team or person who shipped the most impactful new idea.",
    emoji: "💡",
    themeBg: "linear-gradient(180deg, #fff2c8 0%, #ffe093 100%)",
    status: "ending-soon",
    pointsPerWin: 500,
    daysLeft: 2,
    nominations: 9,
    nominationsDelta: -10,
    participantsRate: 31,
    participantsDelta: 3,
    budgetAllocated: 50000,
    budgetUsed: 12000,
    prizes: [
      { rank: 1, amount: 25000 },
      { rank: 2, amount: 15000 },
      { rank: 3, amount: 10000 },
    ],
    programLeaderboard: [
      { rank: 1, name: "Ronald Richards", role: "CTO",         avatar: "/m/images/user01.png", points: 720 },
      { rank: 2, name: "Albert Flores",   role: "Sr Engineer", avatar: "/m/images/user03.png", points: 510 },
      { rank: 3, name: "Courtney Henry",  role: "Delivery Head", avatar: "/m/images/user02.png", points: 482 },
    ],
    attentionItems: [
      { severity: "high", title: "Closes in 2 days", body: "Review nominations before close" },
    ],
    topNominee: { name: "Ronald Richards", nominationCount: 6 },
    highlights: [
      { iconKey: "rocket", title: "Who can participate?", body: "All employees, individuals or teams." },
      { iconKey: "trophy", title: "How it works",        body: "Submit a brief on the innovation, its impact, and outcomes." },
      { iconKey: "gift",   title: "What's in it for you?", body: "Top-tier points, recognition at all-hands, and an Innovation badge." },
    ],
    panel: [
      { id: "p1", name: "Lin Wang", role: "VP Engineering", department: "Engineering", avatar: "/m/images/user04.png", lead: true, reviewed: 6, totalToReview: 9 },
      { id: "p2", name: "Priya Sharma", role: "Director of Product", department: "Product", avatar: "/m/images/user03.png", reviewed: 9, totalToReview: 9 },
      { id: "p3", name: "Daniel Park", role: "Principal Engineer", department: "Engineering", avatar: "/m/images/user07.png", reviewed: 4, totalToReview: 9 },
      { id: "p4", name: "Maya Rodriguez", role: "Head of Design", department: "Design", avatar: "/m/images/user06.png", reviewed: 7, totalToReview: 9 },
    ],
  },
  {
    id: "years-of-service",
    name: "Years of Service",
    shortDesc: "Celebrate work anniversaries milestone by milestone.",
    description: "Automated milestone recognition at 1, 3, 5, and 10 years.",
    emoji: "🎉",
    themeBg: "linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)",
    status: "active",
    pointsPerWin: 300,
    daysLeft: 28,
    nominations: 6,
    nominationsDelta: 0,
    participantsRate: 100,
    participantsDelta: 0,
    budgetAllocated: 40000,
    budgetUsed: 22000,
    prizes: [
      { rank: 1, amount: 10000 },
      { rank: 2, amount: 5000 },
      { rank: 3, amount: 3000 },
    ],
    programLeaderboard: [
      { rank: 1, name: "Robert Fox",      role: "Director",    avatar: "/m/images/user05.png", points: 300 },
      { rank: 2, name: "Albert Flores",   role: "Sr Engineer", avatar: "/m/images/user03.png", points: 300 },
      { rank: 3, name: "Dianne Russell",  role: "UI Designer", avatar: "/m/images/user04.png", points: 300 },
    ],
    topNominee: { name: "Robert Fox", nominationCount: 1 },
    highlights: [
      { iconKey: "users",  title: "Who can participate?", body: "Automated for everyone hitting a milestone." },
      { iconKey: "trophy", title: "How it works",        body: "We celebrate you on the day. Managers can add a personal note." },
      { iconKey: "gift",   title: "What's in it for you?", body: "Tiered points based on your milestone, plus a special anniversary badge." },
    ],
    categories: [
      {
        id: "yos-1",
        name: "1 Year",
        emoji: "🎈",
        description: "First-year anniversary.",
        winnersCount: 99,
        prizePoints: 100,
        guidelines: defaultGuidelinesForName("First year together"),
        eligibility: { departments: [], locations: [], roles: [], minTenureMonths: 12, excludePastWinnersCycles: 0 },
      },
      {
        id: "yos-3",
        name: "3 Years",
        emoji: "🌱",
        description: "Three years in.",
        winnersCount: 99,
        prizePoints: 300,
        guidelines: defaultGuidelinesForName("Three years in"),
        eligibility: { departments: [], locations: [], roles: [], minTenureMonths: 36, excludePastWinnersCycles: 0 },
      },
      {
        id: "yos-5",
        name: "5 Years",
        emoji: "🌟",
        description: "Half a decade.",
        winnersCount: 99,
        prizePoints: 500,
        guidelines: defaultGuidelinesForName("Half a decade with the team"),
        eligibility: { departments: [], locations: [], roles: [], minTenureMonths: 60, excludePastWinnersCycles: 0 },
      },
      {
        id: "yos-10",
        name: "10 Years",
        emoji: "🏛️",
        description: "A decade and counting.",
        winnersCount: 99,
        prizePoints: 1000,
        guidelines: defaultGuidelinesForName("A decade and counting"),
        eligibility: { departments: [], locations: [], roles: [], minTenureMonths: 120, excludePastWinnersCycles: 0 },
      },
    ],
    panel: [
      { id: "p1", name: "Sarah Chen", role: "VP People Operations", department: "People Ops", avatar: "/m/images/user02.png", lead: true, reviewed: 6, totalToReview: 6 },
      { id: "p2", name: "Aisha Patel", role: "People Partner", department: "People Ops", avatar: "/m/images/user06.png", reviewed: 6, totalToReview: 6 },
    ],
  },
  {
    id: "innovation-sprint-q1",
    name: "Innovation Sprint Q1",
    shortDesc: "Quarterly cycle celebrating breakthrough product wins.",
    description: "A cross-functional sprint where any teammate can nominate someone whose work moved a key product or customer metric this quarter.",
    emoji: "🚀",
    themeBg: "linear-gradient(180deg, #ede9fe 0%, #c4b5fd 100%)",
    status: "active",
    pointsPerWin: 200,
    daysLeft: 0,
    startDate: "2026-02-15T00:00:00.000Z",
    endDate: "2026-05-14T23:59:59.000Z",
    cadence: "quarterly",
    nominations: 12,
    nominationsDelta: 4,
    participantsRate: 72,
    participantsDelta: 9,
    budgetAllocated: 25000,
    budgetUsed: 19200,
    prizes: [
      { rank: 1, amount: 12000 },
      { rank: 2, amount: 5000 },
      { rank: 3, amount: 2000 },
    ],
    programLeaderboard: [
      { rank: 1, name: "Albert Flores",  role: "Sr Software Engineer", avatar: "/m/images/user03.png", points: 200 },
      { rank: 2, name: "Dianne Russell", role: "UI Designer",          avatar: "/m/images/user04.png", points: 180 },
      { rank: 3, name: "James Wilson",   role: "Product Manager",      avatar: "/m/images/user07.png", points: 160 },
    ],
    topNominee: { name: "Albert Flores", nominationCount: 4 },
    highlights: [
      { iconKey: "rocket", title: "Who can participate?", body: "Any teammate, across every team." },
      { iconKey: "target", title: "How it works",        body: "Nominate someone whose work moved a customer or product metric." },
      { iconKey: "award",  title: "What's in it for you?", body: "Up to 12,000 in points + a Sprint Champion badge." },
    ],
    categories: [
      {
        id: "cat-impact",
        name: "Customer Impact",
        emoji: "🎯",
        description: "Measurable wins for customers.",
        winnersCount: 1,
        prizePoints: 200,
        guidelines: {
          summary: "Recognize work that moved a customer metric this quarter.",
          whatGoodLooksLike: "A nomination that names the customer, the metric, and the size of the lift. Bonus for retention or expansion outcomes.",
          criteria: [
            { id: "metric",   label: "Metric moved",      description: "A specific KPI shifted, not a feeling.", weight: 40 },
            { id: "size",     label: "Size of impact",    description: "How much did it move? Scale matters.",   weight: 30 },
            { id: "customer", label: "Customer connection", description: "Was the customer in the room?",        weight: 30 },
          ],
          disqualifiers: "Internal-only improvements with no customer-facing outcome.",
        },
        eligibility: { departments: ["Customer Success", "Product", "Engineering"], locations: [], roles: [], minTenureMonths: 0, excludePastWinnersCycles: 0 },
        panel: [
          { id: "p3", name: "Priya Sharma",   role: "Director of Product",  department: "Product",     avatar: "/m/images/user03.png", lead: true, reviewed: 12, totalToReview: 12 },
          { id: "p4", name: "James Wilson",   role: "Engineering Director", department: "Engineering", avatar: "/m/images/user04.png", reviewed: 12, totalToReview: 12 },
          { id: "p5", name: "Carla Mendes",   role: "VP Customer Success",  department: "CS",          avatar: "/m/images/user03.png", reviewed: 12, totalToReview: 12 },
        ],
      },
      {
        id: "cat-craft",
        name: "Engineering Craft",
        emoji: "🛠️",
        description: "Built it well, shipped it cleanly.",
        winnersCount: 1,
        prizePoints: 200,
        guidelines: {
          summary: "Recognize engineers whose work raised the bar for quality, speed, or reliability.",
          whatGoodLooksLike: "A nomination that points at the artifact (PR, RFC, system) and what others learned from it.",
          criteria: [
            { id: "quality",    label: "Code quality",     description: "Reviewable, tested, maintainable.",       weight: 40 },
            { id: "leverage",   label: "Leverage",          description: "Did it raise the floor for the team?",    weight: 35 },
            { id: "ownership",  label: "Ownership",         description: "Followed through past the merge.",        weight: 25 },
          ],
        },
        eligibility: { departments: ["Engineering"], locations: [], roles: [], minTenureMonths: 0, excludePastWinnersCycles: 0 },
        panel: [
          { id: "p4", name: "James Wilson",    role: "Engineering Director", department: "Engineering", avatar: "/m/images/user04.png", lead: true, reviewed: 12, totalToReview: 12 },
          { id: "p7", name: "Daniel Park",     role: "Principal Engineer",   department: "Engineering", avatar: "/m/images/user07.png", reviewed: 12, totalToReview: 12 },
        ],
      },
      {
        id: "cat-team",
        name: "Team Player",
        emoji: "🤝",
        description: "Made the team stronger this quarter.",
        winnersCount: 1,
        prizePoints: 200,
        guidelines: {
          summary: "Recognize teammates whose collaboration unblocked others or improved how the team works.",
          whatGoodLooksLike: "Concrete moments — pairing, mentoring, unblocking, running a difficult retro.",
          criteria: [
            { id: "collab",   label: "Collaboration",     description: "Made it easier for others to do their job.", weight: 50 },
            { id: "spread",   label: "Spread of impact",  description: "Helped one person vs. many.",                weight: 30 },
            { id: "stretch",  label: "Beyond the role",   description: "Outside their direct lane.",                 weight: 20 },
          ],
        },
        eligibility: { departments: [], locations: [], roles: [], minTenureMonths: 0, excludePastWinnersCycles: 0, customNote: "Open to all teammates — collaboration counts everywhere." },
        panel: [
          { id: "p1", name: "Sarah Chen",      role: "VP People Operations", department: "People Ops",  avatar: "/m/images/user02.png", lead: true, reviewed: 12, totalToReview: 12 },
          { id: "p2", name: "Marcus Johnson",  role: "CHRO",                 department: "Executive",   avatar: "/m/images/user05.png", reviewed: 12, totalToReview: 12 },
        ],
      },
    ],
  },
  {
    id: "spring-spotlight-q1",
    name: "Spring Spotlight — Q1",
    shortDesc: "Cycle ended yesterday — admin should see the Run AI Shortlist CTA.",
    description: "Quarterly cross-functional spotlight for teammates whose work moved a customer or product metric. Cycle just closed and the panel is ready to shortlist winners.",
    emoji: "🌷",
    themeBg: "linear-gradient(180deg, #fde7f3 0%, #f9b8d8 100%)",
    status: "active",
    pointsPerWin: 250,
    daysLeft: 0,
    startDate: "2026-02-15T00:00:00.000Z",
    endDate: "2026-05-15T23:59:59.000Z",
    cadence: "quarterly",
    nominations: 14,
    nominationsDelta: 5,
    participantsRate: 68,
    participantsDelta: 7,
    budgetAllocated: 25000,
    budgetUsed: 18500,
    prizes: [
      { rank: 1, amount: 12000 },
      { rank: 2, amount: 5000 },
      { rank: 3, amount: 2500 },
    ],
    programLeaderboard: [
      { rank: 1, name: "Albert Flores",  role: "Sr Software Engineer", avatar: "/m/images/user03.png", points: 240 },
      { rank: 2, name: "Dianne Russell", role: "UI Designer",          avatar: "/m/images/user04.png", points: 215 },
      { rank: 3, name: "Courtney Henry", role: "Delivery Head",        avatar: "/m/images/user02.png", points: 190 },
    ],
    attentionItems: [
      { severity: "high", title: "Cycle ended — run AI shortlist", body: "14 nominations are waiting to be scored and ranked" },
    ],
    topNominee: { name: "Albert Flores", nominationCount: 4 },
    highlights: [
      { iconKey: "rocket", title: "Who can participate?", body: "Any teammate, across every function." },
      { iconKey: "target", title: "How it works",        body: "Nominate someone whose work moved a customer or product metric this quarter." },
      { iconKey: "award",  title: "What's in it for you?", body: "Up to 12,000 in points + a Spring Spotlight badge." },
    ],
    categories: [
      { id: "cat-impact", name: "Customer Impact",   emoji: "🎯", description: "Measurable wins for customers.",        winnersCount: 1, prizePoints: 250 },
      { id: "cat-craft",  name: "Engineering Craft", emoji: "🛠️", description: "Built it well, shipped it cleanly.",     winnersCount: 1, prizePoints: 250 },
      { id: "cat-team",   name: "Team Player",       emoji: "🤝", description: "Made the team stronger this quarter.",  winnersCount: 1, prizePoints: 250 },
    ],
    panel: [
      { id: "p1", name: "Sarah Chen",     role: "VP People Operations", department: "People Ops",  avatar: "/m/images/user02.png", lead: true, reviewed: 14, totalToReview: 14 },
      { id: "p2", name: "Marcus Johnson", role: "CHRO",                 department: "Executive",   avatar: "/m/images/user05.png", reviewed: 14, totalToReview: 14 },
      { id: "p3", name: "Priya Sharma",   role: "Director of Product",  department: "Product",     avatar: "/m/images/user03.png", reviewed: 14, totalToReview: 14 },
      { id: "p4", name: "James Wilson",   role: "Engineering Director", department: "Engineering", avatar: "/m/images/user04.png", reviewed: 14, totalToReview: 14 },
    ],
  },
  {
    id: "culture-champion",
    name: "Culture Champion",
    shortDesc: "Builds the team we want to work in.",
    description: "Recognize someone who actively shapes our culture for the better.",
    emoji: "🌱",
    themeBg: "linear-gradient(180deg, #fce7f3 0%, #fbcfe8 100%)",
    status: "draft",
    pointsPerWin: 150,
    daysLeft: 14,
    nominations: 0,
    nominationsDelta: 0,
    participantsRate: 0,
    participantsDelta: 0,
    budgetAllocated: 20000,
    budgetUsed: 0,
    prizes: [
      { rank: 1, amount: 8000 },
      { rank: 2, amount: 5000 },
      { rank: 3, amount: 3000 },
    ],
    programLeaderboard: [],
    attentionItems: [
      { severity: "high", title: "Program has 0 nominations", body: "Active for 16 days — no entries yet" },
    ],
    highlights: [
      { iconKey: "users",  title: "Who can participate?", body: "All employees can nominate." },
      { iconKey: "trophy", title: "How it works",        body: "Tell us how the nominee shapes our culture day to day." },
      { iconKey: "gift",   title: "What's in it for you?", body: "Recognition + points + a Culture badge." },
    ],
    panel: [
      { id: "p1", name: "Sarah Chen", role: "VP People Operations", department: "People Ops", avatar: "/m/images/user02.png", lead: true, reviewed: 5, totalToReview: 11 },
      { id: "p2", name: "Marcus Johnson", role: "CHRO", department: "Executive", avatar: "/m/images/user05.png", reviewed: 8, totalToReview: 11 },
      { id: "p3", name: "Maya Rodriguez", role: "Head of Design", department: "Design", avatar: "/m/images/user06.png", reviewed: 7, totalToReview: 11 },
      { id: "p4", name: "David Kim", role: "Chief of Staff", department: "Executive", avatar: "/m/images/user01.png", reviewed: 4, totalToReview: 11 },
    ],
  },
];

export function getProgram(id: string | undefined): Program | undefined {
  if (!id) return undefined;
  const found = PROGRAMS.find((p) => p.id === id);
  return found ? normalizeProgram(found) : undefined;
}

// ─── Category-model normalization (Phase 1.8) ─────────────────────────
//
// Migration entry point. Idempotent. Run on every program read so the
// legacy shape (panel + eligibility at program level, optional categories)
// converges to the new shape (everything per-category). Subsequent writes
// hand back the normalized object.

const DEFAULT_CATEGORY_ELIGIBILITY: CategoryEligibility = {
  departments: [],
  locations: [],
  roles: [],
  minTenureMonths: 0,
  excludePastWinnersCycles: 0,
};

function defaultGuidelinesFor(category: Pick<ProgramCategory, "description" | "name">): CategoryGuidelines {
  return {
    summary: category.description || `Recognize teammates who exemplify ${category.name}.`,
    criteria: [
      {
        id: "overall-impact",
        label: "Overall impact",
        description: "How meaningful and clear is the contribution being recognized?",
        weight: 100,
      },
    ],
    whatGoodLooksLike: "",
  };
}

function defaultGuidelinesForName(summary: string): CategoryGuidelines {
  return {
    summary,
    criteria: [
      { id: "overall-impact", label: "Overall impact", description: "How meaningful is the milestone being recognized?", weight: 100 },
    ],
    whatGoodLooksLike: "",
  };
}

function defaultCategoryFor(program: Pick<Program, "id" | "name" | "emoji" | "shortDesc" | "pointsPerWin">): ProgramCategory {
  return {
    id: `${program.id}-cat-default`,
    name: program.name,
    emoji: program.emoji,
    description: program.shortDesc,
    winnersCount: 1,
    prizePoints: program.pointsPerWin,
  };
}

/**
 * Phase 1.8 migration. Push any legacy program-level panel/eligibility down
 * onto each category, backfill empty guidelines, ensure every program has at
 * least one category, then clear the deprecated program-level fields.
 *
 * Phase 1.10 starter — also distributes any legacy program-level budget
 * across categories that don't yet carry their own allocation, then leaves
 * the program-level total in place as the rollup.
 *
 * Idempotent — safe to call on already-migrated data.
 */
export function normalizeProgram<T extends Program>(program: T): T {
  const fromPanel = program.panel ?? [];
  const fromEligibility = program.eligibility;

  const baseCategories: ProgramCategory[] =
    program.categories && program.categories.length > 0
      ? program.categories
      : [defaultCategoryFor(program)];

  // Budget distribution: only kicks in when no category has its own allocation.
  // Otherwise we trust category-level data and recompute the program total.
  const anyCategoryHasBudget = baseCategories.some(
    (c) => typeof c.budgetAllocated === "number",
  );
  const evenShare =
    !anyCategoryHasBudget && program.budgetAllocated && baseCategories.length > 0
      ? Math.floor(program.budgetAllocated / baseCategories.length)
      : 0;

  const categories = baseCategories.map((c) => {
    const panel = c.panel && c.panel.length > 0 ? c.panel : fromPanel;
    const eligibility = c.eligibility ?? fromEligibility ?? { ...DEFAULT_CATEGORY_ELIGIBILITY };
    const guidelines = c.guidelines ?? defaultGuidelinesFor(c);
    const budgetAllocated = c.budgetAllocated ?? evenShare;
    return { ...c, panel, eligibility, guidelines, budgetAllocated };
  });

  // Recompute the program-level rollup from the (possibly newly distributed)
  // category budgets so the two stay in sync.
  const rolledBudget = categories.reduce((s, c) => s + (c.budgetAllocated ?? 0), 0);

  // Strip the deprecated program-level fields so consumers can't accidentally
  // read them. The migration is the only legitimate reader.
  const { panel: _drop1, eligibility: _drop2, ...rest } = program;
  return {
    ...(rest as T),
    categories,
    budgetAllocated: rolledBudget > 0 ? rolledBudget : program.budgetAllocated,
  } as T;
}

/**
 * Union of every category's panel, deduplicated by member id. Used by the
 * RnR dashboard counters and any view that wants to know "who can judge
 * anywhere in this program."
 */
export function getAllProgramPanelMembers(program: Pick<Program, "categories">): PanelMember[] {
  const seen = new Map<string, PanelMember>();
  for (const c of program.categories ?? []) {
    for (const m of c.panel ?? []) {
      if (!seen.has(m.id)) seen.set(m.id, m);
    }
  }
  return Array.from(seen.values());
}

/**
 * 1.7.1 visibility helper, updated for 1.8. True if the current user can
 * manage this program's post-cycle workflow — either an HR admin or a
 * named member of any category's panel. Falls back to a name match
 * against `account.adminName` because the demo doesn't carry per-employee
 * identity beyond that.
 */
export function currentUserCanManageProgram(
  account: import("./account").Account | null,
  program: Pick<Program, "categories"> | undefined | null,
): boolean {
  if (!account || !program) return false;
  if (account.role === "admin") return true;
  const panel = getAllProgramPanelMembers(program);
  if (panel.length === 0) return false;
  const name = (account.adminName ?? "").trim().toLowerCase();
  if (!name) return false;
  return panel.some((p) => p.name.trim().toLowerCase() === name);
}

/**
 * 1.8 — true if the current user is on this specific category's panel
 * (or is an HR admin). Used by the panel review page to gate per-category
 * inboxes.
 */
export function currentUserCanJudgeCategory(
  account: import("./account").Account | null,
  category: Pick<ProgramCategory, "panel"> | undefined | null,
): boolean {
  if (!account || !category) return false;
  if (account.role === "admin") return true;
  const panel = category.panel ?? [];
  if (panel.length === 0) return false;
  const name = (account.adminName ?? "").trim().toLowerCase();
  if (!name) return false;
  return panel.some((p) => p.name.trim().toLowerCase() === name);
}

/**
 * 1.8 — does this employee meet a category's eligibility rules? The
 * `pastWinnerOf` set is the set of category ids this person has won in
 * recent cycles; pass an empty set if you don't track that yet.
 */
export type EligibilityEmployee = {
  department?: string;
  location?: string;
  role?: string;
  tenureMonths?: number;
  pastWinnerOf?: Set<string>;
};

export function isEligible(
  employee: EligibilityEmployee,
  category: Pick<ProgramCategory, "id" | "eligibility">,
): boolean {
  const rules = category.eligibility;
  if (!rules) return true;
  if (rules.departments.length > 0 && employee.department && !rules.departments.includes(employee.department)) {
    return false;
  }
  if (rules.locations.length > 0 && employee.location && !rules.locations.includes(employee.location)) {
    return false;
  }
  if (rules.roles.length > 0 && employee.role && !rules.roles.includes(employee.role)) {
    return false;
  }
  if (rules.minTenureMonths > 0 && (employee.tenureMonths ?? 0) < rules.minTenureMonths) {
    return false;
  }
  if (rules.excludePastWinnersCycles > 0 && employee.pastWinnerOf?.has(category.id)) {
    return false;
  }
  return true;
}

export function getActivePrograms(): Program[] {
  return [...PROGRAMS, ...PAST_PROGRAMS].filter(
    (p) => p.status === "active" || p.status === "ending-soon",
  );
}

export function getPastPrograms(): PastProgram[] {
  return PAST_PROGRAMS;
}

export function getEndingSoon(): Program[] {
  return PROGRAMS.filter((p) => p.status === "ending-soon" || p.daysLeft <= 7);
}

export type PastProgram = Program & {
  endedOn: string;
  finalWinner: {
    name: string;
    role: string;
    avatar: string;
    amount: number;
  };
};

export const PAST_PROGRAMS: PastProgram[] = [
  {
    id: "employee-of-the-month-april",
    name: "Employee of the Month — April",
    shortDesc: "April cycle of the monthly recognition.",
    description: "April cycle of the monthly recognition.",
    emoji: "🏆",
    themeBg: "linear-gradient(180deg, #fbe9c8 0%, #f5d8a3 100%)",
    status: "ended",
    pointsPerWin: 100,
    daysLeft: 0,
    nominations: 38,
    budgetAllocated: 30000,
    budgetUsed: 27500,
    highlights: [],
    endedOn: "2026-04-30",
    finalWinner: {
      name: "Aarav Mehta",
      role: "Product Design Team",
      avatar: "/m/images/user03.png",
      amount: 15000,
    },
  },
  {
    id: "innovation-award-q1",
    name: "Innovation Award — Q1",
    shortDesc: "First quarter ideation and launches.",
    description: "Q1 cycle.",
    emoji: "💡",
    themeBg: "linear-gradient(180deg, #fff2c8 0%, #ffe093 100%)",
    status: "ended",
    pointsPerWin: 500,
    daysLeft: 0,
    nominations: 17,
    budgetAllocated: 50000,
    budgetUsed: 50000,
    highlights: [],
    endedOn: "2026-03-31",
    finalWinner: {
      name: "Ronald Richards",
      role: "Chief Technology Officer",
      avatar: "/m/images/user01.png",
      amount: 25000,
    },
  },
  {
    id: "values-champion-q1",
    name: "Values Champion — Q1",
    shortDesc: "Lived our values across the quarter.",
    description: "Q1 quarterly cycle.",
    emoji: "🛡️",
    themeBg: "linear-gradient(180deg, #d6f5e1 0%, #a7e8c0 100%)",
    status: "ended",
    pointsPerWin: 200,
    daysLeft: 0,
    nominations: 22,
    budgetAllocated: 30000,
    budgetUsed: 28500,
    highlights: [],
    endedOn: "2026-03-31",
    finalWinner: {
      name: "Courtney Henry",
      role: "Delivery Head",
      avatar: "/m/images/user02.png",
      amount: 12000,
    },
  },
  {
    id: "peer-to-peer-april",
    name: "Peer-to-Peer — April",
    shortDesc: "Continuous peer recognition.",
    description: "April cycle.",
    emoji: "💬",
    themeBg: "linear-gradient(180deg, #e9e0ff 0%, #d2c3ff 100%)",
    status: "ended",
    pointsPerWin: 50,
    daysLeft: 0,
    nominations: 96,
    budgetAllocated: 30000,
    budgetUsed: 29000,
    highlights: [],
    endedOn: "2026-04-30",
    finalWinner: {
      name: "Albert Flores",
      role: "Sr Software Engineer",
      avatar: "/m/images/user03.png",
      amount: 8000,
    },
  },
];

// ─── Nominations ───────────────────────────────────────────────────────
//
// Nominations live as a flat list so the dashboard, panel review pages, and
// future inbox views can derive their own slices. Until the full nomination
// flow ships in a later phase, this is a deterministic seed driven by the
// aggregate counters on each Program above.

export type NominationStatus =
  | "pending-manager"
  | "pending-panel"
  | "approved"
  | "winner"
  | "rejected";

export type Nomination = {
  id: string;
  programId: string;
  cycleId: string;
  categoryId?: string;
  categoryName?: string;
  nomineeId: string;
  nomineeName: string;
  nomineeAvatar: string;
  nomineeRole?: string;
  nomineeDepartment?: string;
  nominatorId: string;
  nominatorName: string;
  nominatorAvatar?: string;
  reason: string;
  createdAt: string;
  status: NominationStatus;
  managerId?: string;
  managerName?: string;
  decidedAt?: string;
  finalRank?: number;
  /** Snapshot of the prize amount for ended programs / winners. */
  prizeAmount?: number;
};

const SEED_NOMINEES: { id: string; name: string; avatar: string; role: string; department: string; managerId?: string; managerName?: string }[] = [
  { id: "u-rahul",      name: "Rahul Albert Floraes", avatar: "/m/images/user03.png", role: "Sr Software Engineer", department: "Engineering", managerId: "u-courtney", managerName: "Courtney Ralph" },
  { id: "u-albert",     name: "Albert Flores",        avatar: "/m/images/user03.png", role: "Sr Software Engineer", department: "Engineering", managerId: "u-courtney", managerName: "Courtney Ralph" },
  { id: "u-dianne",     name: "Dianne Russell",       avatar: "/m/images/user04.png", role: "UI Designer",          department: "Design",      managerId: "u-talan",    managerName: "Talan Dias" },
  { id: "u-courtney",   name: "Courtney Ralph",       avatar: "/m/images/user02.png", role: "Delivery Head",        department: "Engineering", managerId: "u-cristofer", managerName: "Cristofer Botosh" },
  { id: "u-courtney-h", name: "Courtney Henry",       avatar: "/m/images/user02.png", role: "Delivery Head",        department: "Customer Success", managerId: "u-robert", managerName: "Robert Fox" },
  { id: "u-james",      name: "James Wilson",         avatar: "/m/images/user07.png", role: "Product Manager",      department: "Engineering", managerId: "u-cristofer", managerName: "Cristofer Botosh" },
  { id: "u-cristofer",  name: "Cristofer Botosh",     avatar: "/m/images/user06.png", role: "Director",             department: "Engineering", managerId: "u-ralph",    managerName: "Ralph Edwards" },
  { id: "u-talan",      name: "Talan Dias",           avatar: "/m/images/user07.png", role: "Director",             department: "Design",      managerId: "u-ralph",    managerName: "Ralph Edwards" },
  { id: "u-robert",     name: "Robert Fox",           avatar: "/m/images/user05.png", role: "Director",             department: "Customer Success" },
];

const SEED_NOMINATORS: { id: string; name: string; avatar: string }[] = [
  { id: "u-ralph",      name: "Ralph Edwards",        avatar: "/m/images/user01.png" },
  { id: "u-cristofer",  name: "Cristofer Botosh",     avatar: "/m/images/user06.png" },
  { id: "u-talan",      name: "Talan Dias",           avatar: "/m/images/user07.png" },
  { id: "u-courtney",   name: "Courtney Ralph",       avatar: "/m/images/user02.png" },
  { id: "u-james",      name: "James Wilson",         avatar: "/m/images/user07.png" },
  { id: "u-dianne",     name: "Dianne Russell",       avatar: "/m/images/user04.png" },
];

const SEED_REASONS = [
  "Stepped in over the weekend to ship the migration when the on-call engineer was paged for a different incident.",
  "Mentored two new hires through onboarding — both shipped their first PR within a week.",
  "Led the response to the Q2 outage and saved roughly 14k in customer credits.",
  "Delivered the redesign two sprints ahead of schedule and improved conversion by 8%.",
  "Quietly fixed a long-standing flaky test that had been blocking releases for months.",
  "Built the on-call runbook the rest of the team now uses as the default reference.",
  "Took on the difficult cross-team coordination work nobody wanted, and made it look easy.",
  "Drove the customer-success retro and turned the findings into shipped product changes.",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

type NominationDistribution = {
  /** active program: distribution across pending-manager / pending-panel / approved / rejected. */
  pendingManager: number;
  pendingPanel: number;
  approved: number;
  rejected: number;
};

function distribute(total: number, ratios: { pm: number; pp: number; ap: number; rj: number }): NominationDistribution {
  const sum = ratios.pm + ratios.pp + ratios.ap + ratios.rj;
  const pm = Math.round((total * ratios.pm) / sum);
  const pp = Math.round((total * ratios.pp) / sum);
  const ap = Math.round((total * ratios.ap) / sum);
  // Anything left over goes to rejected so totals match exactly.
  const rj = Math.max(0, total - pm - pp - ap);
  return { pendingManager: pm, pendingPanel: pp, approved: ap, rejected: rj };
}

function buildActiveNominations(program: Program): Nomination[] {
  const total = program.nominations;
  if (total === 0) return [];

  // Use panel.reviewed/totalToReview as a hint for how far along the cycle is.
  // Phase 1.8: panels are per-category, so collapse across categories first.
  const allPanel: PanelMember[] = (program.categories ?? []).flatMap((c) => c.panel ?? []);
  const panelLead =
    allPanel.find((p) => p.lead) ?? (program.panel ?? []).find((p) => p.lead);
  const reviewed = panelLead?.reviewed ?? Math.floor(total * 0.5);
  const reviewProgress = total === 0 ? 0 : reviewed / total;

  // The earlier in the cycle, the more pending-manager. Later in the cycle,
  // the more pending-panel and approved.
  const ratios =
    reviewProgress < 0.4
      ? { pm: 5, pp: 2, ap: 2, rj: 1 }
      : reviewProgress < 0.8
        ? { pm: 2, pp: 4, ap: 3, rj: 1 }
        : { pm: 1, pp: 2, ap: 6, rj: 1 };

  const dist = distribute(total, ratios);

  const out: Nomination[] = [];
  let n = 0;
  function makeOne(status: NominationStatus, ageDays: number) {
    const nominee = pick(SEED_NOMINEES, n + program.id.length);
    const nominator = pick(SEED_NOMINATORS.filter((s) => s.id !== nominee.id), n + 3);
    const id = `nom-${program.id}-${n}`;
    const cat = program.categories && program.categories.length > 0
      ? program.categories[n % program.categories.length]
      : undefined;
    n += 1;
    const createdAt = isoDaysAgo(ageDays);
    const decided =
      status === "pending-manager" || status === "pending-panel"
        ? undefined
        : isoDaysAgo(Math.max(0, ageDays - 1));
    out.push({
      id,
      programId: program.id,
      cycleId: "current",
      categoryId: cat?.id,
      categoryName: cat?.name,
      nomineeId: nominee.id,
      nomineeName: nominee.name,
      nomineeAvatar: nominee.avatar,
      nomineeRole: nominee.role,
      nomineeDepartment: nominee.department,
      nominatorId: nominator.id,
      nominatorName: nominator.name,
      nominatorAvatar: nominator.avatar,
      reason: pick(SEED_REASONS, n),
      createdAt,
      status,
      managerId: nominee.managerId,
      managerName: nominee.managerName,
      decidedAt: decided,
    });
  }
  for (let i = 0; i < dist.pendingManager; i++) makeOne("pending-manager", 1 + (i % 6));
  for (let i = 0; i < dist.pendingPanel; i++) makeOne("pending-panel", 4 + (i % 8));
  for (let i = 0; i < dist.approved; i++) makeOne("approved", 7 + (i % 12));
  for (let i = 0; i < dist.rejected; i++) makeOne("rejected", 6 + (i % 10));
  return out;
}

function buildPastNominations(program: PastProgram): Nomination[] {
  const total = program.nominations;
  if (total === 0) return [];
  const winners = Math.min(3, total);
  const rejected = Math.floor(total * 0.15);
  const approved = total - winners - rejected;
  const out: Nomination[] = [];
  let n = 0;

  const winnerEntry: Nomination = {
    id: `nom-${program.id}-w`,
    programId: program.id,
    cycleId: program.id,
    nomineeId: program.finalWinner.name.toLowerCase().replace(/\s+/g, "-"),
    nomineeName: program.finalWinner.name,
    nomineeAvatar: program.finalWinner.avatar,
    nomineeRole: program.finalWinner.role,
    nomineeDepartment: SEED_NOMINEES.find((e) => e.name === program.finalWinner.name)?.department,
    nominatorId: SEED_NOMINATORS[0].id,
    nominatorName: SEED_NOMINATORS[0].name,
    nominatorAvatar: SEED_NOMINATORS[0].avatar,
    reason: pick(SEED_REASONS, 0),
    createdAt: program.endedOn,
    decidedAt: program.endedOn,
    status: "winner",
    finalRank: 1,
    prizeAmount: program.finalWinner.amount,
    managerId: SEED_NOMINEES.find((e) => e.name === program.finalWinner.name)?.managerId,
    managerName: SEED_NOMINEES.find((e) => e.name === program.finalWinner.name)?.managerName,
  };
  out.push(winnerEntry);
  n += 1;

  for (let i = 1; i < winners; i++) {
    const nominee = pick(SEED_NOMINEES, i);
    const nominator = pick(SEED_NOMINATORS.filter((s) => s.id !== nominee.id), i);
    out.push({
      id: `nom-${program.id}-${n}`,
      programId: program.id,
      cycleId: program.id,
      nomineeId: nominee.id,
      nomineeName: nominee.name,
      nomineeAvatar: nominee.avatar,
      nomineeRole: nominee.role,
      nomineeDepartment: nominee.department,
      nominatorId: nominator.id,
      nominatorName: nominator.name,
      nominatorAvatar: nominator.avatar,
      reason: pick(SEED_REASONS, n),
      createdAt: program.endedOn,
      decidedAt: program.endedOn,
      status: "winner",
      finalRank: i + 1,
      managerId: nominee.managerId,
      managerName: nominee.managerName,
    });
    n += 1;
  }
  for (let i = 0; i < approved; i++) {
    const nominee = pick(SEED_NOMINEES, i + 2);
    const nominator = pick(SEED_NOMINATORS.filter((s) => s.id !== nominee.id), i + 1);
    out.push({
      id: `nom-${program.id}-${n}`,
      programId: program.id,
      cycleId: program.id,
      nomineeId: nominee.id,
      nomineeName: nominee.name,
      nomineeAvatar: nominee.avatar,
      nomineeRole: nominee.role,
      nomineeDepartment: nominee.department,
      nominatorId: nominator.id,
      nominatorName: nominator.name,
      nominatorAvatar: nominator.avatar,
      reason: pick(SEED_REASONS, n),
      createdAt: program.endedOn,
      decidedAt: program.endedOn,
      status: "approved",
      managerId: nominee.managerId,
      managerName: nominee.managerName,
    });
    n += 1;
  }
  for (let i = 0; i < rejected; i++) {
    const nominee = pick(SEED_NOMINEES, i + 3);
    const nominator = pick(SEED_NOMINATORS.filter((s) => s.id !== nominee.id), i + 2);
    out.push({
      id: `nom-${program.id}-${n}`,
      programId: program.id,
      cycleId: program.id,
      nomineeId: nominee.id,
      nomineeName: nominee.name,
      nomineeAvatar: nominee.avatar,
      nomineeRole: nominee.role,
      nomineeDepartment: nominee.department,
      nominatorId: nominator.id,
      nominatorName: nominator.name,
      nominatorAvatar: nominator.avatar,
      reason: pick(SEED_REASONS, n),
      createdAt: program.endedOn,
      decidedAt: program.endedOn,
      status: "rejected",
      managerId: nominee.managerId,
      managerName: nominee.managerName,
    });
    n += 1;
  }
  return out;
}

export const NOMINATIONS: Nomination[] = [
  ...PROGRAMS.flatMap(buildActiveNominations),
  ...PAST_PROGRAMS.flatMap(buildPastNominations),
];

export function getNominations(): Nomination[] {
  const stored = readStoredNominations();
  return stored ?? NOMINATIONS;
}

// ─── Nominations storage ──────────────────────────────────────────────

const NOMINATIONS_KEY = "engagex_nominations";

function readStoredNominations(): Nomination[] | null {
  try {
    const raw = localStorage.getItem(NOMINATIONS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Nomination[];
  } catch {
    return null;
  }
}

function writeStoredNominations(list: Nomination[]): void {
  localStorage.setItem(NOMINATIONS_KEY, JSON.stringify(list));
}

function ensureSeeded(): Nomination[] {
  const stored = readStoredNominations();
  if (!stored) {
    writeStoredNominations(NOMINATIONS);
    return NOMINATIONS;
  }
  // Top up: any seeded program that has zero nominations in storage
  // gets its nominations built and merged. Idempotent.
  const existingProgramIds = new Set(stored.map((n) => n.programId));
  const additions: Nomination[] = [];
  for (const p of PROGRAMS) {
    if (existingProgramIds.has(p.id)) continue;
    additions.push(...buildActiveNominations(p));
  }
  for (const p of PAST_PROGRAMS) {
    if (existingProgramIds.has(p.id)) continue;
    additions.push(...buildPastNominations(p));
  }
  if (additions.length === 0) return stored;
  const next = [...stored, ...additions];
  writeStoredNominations(next);
  return next;
}

export function getNominationsForProgram(programId: string): Nomination[] {
  return ensureSeeded().filter((n) => n.programId === programId);
}

export function updateNomination(
  id: string,
  patch: Partial<Nomination>,
): Nomination | null {
  const all = ensureSeeded();
  const idx = all.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  const next = { ...all[idx], ...patch };
  all[idx] = next;
  writeStoredNominations(all);
  return next;
}

/**
 * Promote a set of nominations to winners with explicit ranks. Demotes any
 * existing winners for the same program/cycle that aren't in the new set.
 * Idempotent — calling twice with the same input is safe.
 */
export function declareWinners(
  programId: string,
  cycleId: string,
  selections: { nominationId: string; rank: number }[],
  decidedAt: string = new Date().toISOString(),
): void {
  const all = ensureSeeded();
  const selected = new Map(selections.map((s) => [s.nominationId, s.rank]));
  const next = all.map((n): Nomination => {
    const inScope = n.programId === programId && n.cycleId === cycleId;
    if (!inScope) return n;
    if (selected.has(n.id)) {
      return {
        ...n,
        status: "winner",
        finalRank: selected.get(n.id),
        decidedAt,
      };
    }
    // Anyone previously a winner that isn't in the new set demotes back to
    // approved so the panel can re-shortlist.
    if (n.status === "winner") {
      return { ...n, status: "approved", finalRank: undefined };
    }
    return n;
  });
  writeStoredNominations(next);
}

// ─── Storage layer ────────────────────────────────────────────────────
//
// Programs are persisted to localStorage so HR-created drafts survive reload.
// On first read we materialize the static seed (PROGRAMS + PAST_PROGRAMS),
// then subsequent writes mutate the stored copy. This mirrors the badges
// store in shape.

const PROGRAMS_KEY = "engagex_programs";

export type StoredProgram = Program | PastProgram;

function readStored(): StoredProgram[] | null {
  try {
    const raw = localStorage.getItem(PROGRAMS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredProgram[];
  } catch {
    return null;
  }
}

function writeStored(list: StoredProgram[]): void {
  localStorage.setItem(PROGRAMS_KEY, JSON.stringify(list));
}

function seedStored(): StoredProgram[] {
  const seed: StoredProgram[] = [...PROGRAMS, ...PAST_PROGRAMS].map((p) =>
    normalizeProgram(p as Program) as StoredProgram,
  );
  writeStored(seed);
  return seed;
}

export function getStoredPrograms(): StoredProgram[] {
  const stored = readStored();
  if (!stored) return seedStored();
  // Top up: any seeded program missing from storage gets merged in. Idempotent.
  const ids = new Set(stored.map((p) => p.id));
  const missing: StoredProgram[] = [
    ...PROGRAMS.filter((p) => !ids.has(p.id)),
    ...PAST_PROGRAMS.filter((p) => !ids.has(p.id)),
  ];
  // Always normalize on read so legacy data (panel/eligibility at program
  // level) converges to the category-level shape. Persist if anything
  // actually changed so subsequent reads skip the work.
  const merged: StoredProgram[] = missing.length === 0 ? stored : [...stored, ...missing];
  let mutated = missing.length > 0;
  const normalized = merged.map((p) => {
    const next = normalizeProgram(p as Program) as StoredProgram;
    if (next !== p) mutated = true;
    return next;
  });
  if (mutated) writeStored(normalized);
  return normalized;
}

export function getProgramById(id: string): StoredProgram | undefined {
  return getStoredPrograms().find((p) => p.id === id);
}

const DAY_MS = 1000 * 60 * 60 * 24;

/** Cycle length in days, used to derive a start date from an end date. */
const CADENCE_DAYS: Record<ProgramCadence, number> = {
  monthly: 30,
  quarterly: 90,
  yearly: 365,
  "one-off": 30,
};

/**
 * Effective cycle window for a program.
 *
 * `startDate`/`endDate` are optional and most programs only carry `daysLeft`,
 * so derive the window from the countdown instead of rendering an empty dash:
 * the cycle ends `daysLeft` days from now and spans back by its cadence length.
 * Explicit dates always win, so HR-configured programs render exactly what was
 * saved.
 */
export function getProgramWindow(
  program: Pick<Program, "startDate" | "endDate" | "daysLeft" | "cadence">,
  now: Date = new Date(),
): { start: Date; end: Date } {
  const end = program.endDate
    ? new Date(program.endDate)
    : new Date(now.getTime() + Math.max(0, program.daysLeft ?? 0) * DAY_MS);
  const start = program.startDate
    ? new Date(program.startDate)
    : new Date(end.getTime() - (CADENCE_DAYS[program.cadence ?? "one-off"] ?? 30) * DAY_MS);
  return { start, end };
}

/** Short, locale-aware date label (e.g. "Jul 21, 2026"). */
export function formatProgramDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function saveProgram(program: StoredProgram): void {
  const all = getStoredPrograms();
  const next = normalizeProgram(program as Program) as StoredProgram;
  const idx = all.findIndex((p) => p.id === program.id);
  if (idx === -1) all.push(next);
  else all[idx] = next;
  writeStored(all);
}

export function deleteProgram(id: string): void {
  const all = getStoredPrograms().filter((p) => p.id !== id);
  writeStored(all);
}

export function generateProgramId(): string {
  return "prog-" + Math.random().toString(36).slice(2, 10);
}

/**
 * Run on app mount. Idempotent: flips `scheduled` programs whose start date
 * has arrived to `active`, and `active`/`ending-soon` programs whose end date
 * has passed to `ended`. Also recomputes `daysLeft` so dashboards stay honest
 * across reloads.
 *
 * Returns the count of programs that transitioned, mostly for tests.
 */
export function transitionScheduledPrograms(now: Date = new Date()): number {
  const all = getStoredPrograms();
  let mutated = 0;
  const next = all.map((p): StoredProgram => {
    if (p.status === "ended") return p;

    const start = p.startDate ? new Date(p.startDate) : null;
    const end = p.endDate ? new Date(p.endDate) : null;

    let nextStatus: ProgramStatus = p.status;
    if (p.status === "scheduled" && start && now >= start) {
      nextStatus = end && now > end ? "ended" : "active";
    } else if ((p.status === "active" || p.status === "ending-soon") && end && now > end) {
      nextStatus = "ended";
    }

    let daysLeft = p.daysLeft;
    if (end) {
      const diffMs = end.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      if (
        nextStatus === "active" &&
        daysLeft > 0 &&
        daysLeft <= 7
      ) {
        nextStatus = "ending-soon";
      }
    }

    if (nextStatus === p.status && daysLeft === p.daysLeft) return p;
    mutated += 1;
    return { ...p, status: nextStatus, daysLeft } as StoredProgram;
  });
  if (mutated > 0) writeStored(next);
  return mutated;
}
