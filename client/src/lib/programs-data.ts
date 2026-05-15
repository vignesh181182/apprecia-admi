export type ProgramStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "ending-soon"
  | "ended";

export type ProgramCadence = "monthly" | "quarterly" | "yearly" | "one-off";

export type ProgramCategory = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** 1–10. */
  winnersCount: number;
  /** 0–10000. Hidden when monetary recognition is disabled. */
  prizePoints: number;
};

export type ProgramEligibility = {
  /** Empty = open to all departments. */
  departments: string[];
  /** Empty = open to all locations. */
  locations: string[];
  minTenureMonths: number;
  /** 0 = no exclusion. */
  excludePastWinnersCycles: number;
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
  /** Panel of judges responsible for selecting winners for this program. */
  panel?: PanelMember[];

  // ─── Phase 1.6 — HR-configured fields ────────────────────────────────
  /** ID of the chosen banner preset, e.g. "amber-glow". */
  bannerId?: string;
  /** Inline data URL when the admin uploaded a custom banner image. */
  customBannerDataUrl?: string;
  /** Display emoji for the program (the existing `emoji` field stays as-is). */
  iconEmoji?: string;
  cadence?: ProgramCadence;
  /** ISO date strings. */
  startDate?: string;
  endDate?: string;
  /** Auto-spin a new cycle when the current one ends. */
  repeatAutomatically?: boolean;
  /** Award categories the panel selects winners across. */
  categories?: ProgramCategory[];
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
    panel: [
      { id: "p1", name: "Sarah Chen", role: "VP People Operations", department: "People Ops", avatar: "/m/images/user02.png", lead: true, reviewed: 6, totalToReview: 6 },
      { id: "p2", name: "Aisha Patel", role: "People Partner", department: "People Ops", avatar: "/m/images/user06.png", reviewed: 6, totalToReview: 6 },
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
  return PROGRAMS.find((p) => p.id === id);
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
  const panelLead = program.panel?.find((p) => p.lead);
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
  if (stored) return stored;
  writeStoredNominations(NOMINATIONS);
  return NOMINATIONS;
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
  const seed: StoredProgram[] = [...PROGRAMS, ...PAST_PROGRAMS];
  writeStored(seed);
  return seed;
}

export function getStoredPrograms(): StoredProgram[] {
  return readStored() ?? seedStored();
}

export function getProgramById(id: string): StoredProgram | undefined {
  return getStoredPrograms().find((p) => p.id === id);
}

export function saveProgram(program: StoredProgram): void {
  const all = getStoredPrograms();
  const idx = all.findIndex((p) => p.id === program.id);
  if (idx === -1) all.push(program);
  else all[idx] = program;
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
