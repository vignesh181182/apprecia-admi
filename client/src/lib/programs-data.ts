export type ProgramStatus = "active" | "ending-soon" | "draft" | "ended";

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
