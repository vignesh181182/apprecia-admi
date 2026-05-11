export type BadgeLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type RecognitionStatus = 'Pending' | 'Approved' | 'Rejected';
export type ProgramStatus = 'Active' | 'Draft' | 'Ended';
export type RewardStatus = 'Available' | 'Out of Stock' | 'Archived';
export type RedemptionStatus = 'Pending' | 'Fulfilled' | 'Rejected';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type CyclePeriod = 'Monthly' | 'Quarterly' | 'Annually';
export type TxnType = 'Recognition' | 'Redemption' | 'Top-up' | 'Adjustment' | 'Reset' | 'Allowance';
export type TxnDirection = 'credit' | 'debit';
export type AdjustmentReason = 'monthly-allowance' | 'manual-topup' | 'manual-deduction' | 'cycle-reset' | 'campaign-bonus' | 'correction';
export type CheckInStatus = 'submitted' | 'pending' | 'overdue';
export type Mood = 1 | 2 | 3 | 4 | 5;
export type OneOnOneStatus = 'scheduled' | 'completed' | 'cancelled' | 'overdue';
export type SurveyType = 'pulse' | 'lifecycle' | 'custom';
export type SurveyStatus = 'draft' | 'active' | 'completed' | 'scheduled';
export type SurveyQuestionType = 'rating' | 'text' | 'yesno';
export type OKRType = 'company' | 'team' | 'individual';
export type OKRStatus = 'on-track' | 'at-risk' | 'off-track' | 'completed';
export type ReviewCycleType = 'annual' | 'mid-year' | 'probation' | 'quarterly';
export type ReviewCycleStatus = 'draft' | 'active' | 'completed';
export type ReviewType = 'self' | 'manager' | 'peer' | 'upward';
export type ReviewSubmissionStatus = 'not-started' | 'in-progress' | 'submitted' | 'acknowledged';

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  role: string;
  points: number;
  badgeLevel: BadgeLevel;
  joinDate: string;
  recognitionsReceived: number;
  recognitionsGiven: number;
}

export interface Recognition {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  programName: string;
  category: string;
  points: number;
  message: string;
  status: RecognitionStatus;
  createdAt: string;
}

export interface Program {
  id: string;
  name: string;
  type: string;
  description: string;
  pointBudget: number;
  spentPoints: number;
  startDate: string;
  endDate: string;
  enrollmentCount: number;
  status: ProgramStatus;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: string;
  pointCost: number;
  stock: number;
  status: RewardStatus;
  redemptions: number;
}

export interface Redemption {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  rewardId: string;
  rewardName: string;
  rewardCategory: string;
  points: number;
  status: RedemptionStatus;
  requestedAt: string;
  fulfilledAt?: string;
}

export interface HRNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  category: string;
}

export interface DepartmentAllocation {
  department: string;
  allocated: number;
  used: number;
  headcount: number;
}

export interface AllowanceTier {
  level: BadgeLevel;
  monthlyAllowance: number;
}

export interface BudgetSettings {
  totalBudget: number;
  cycle: CyclePeriod;
  cycleStartDate: string;
  cycleEndDate: string;
  defaultEmployeeAllowance: number;
  resetDayOfMonth: number;
  autoReset: boolean;
}

export interface PointTransaction {
  id: string;
  type: TxnType;
  direction: TxnDirection;
  amount: number;
  fromName?: string;
  toName?: string;
  scope: 'org' | 'department' | 'employee';
  scopeName?: string;
  reasonCode?: AdjustmentReason;
  reasonNote?: string;
  adminName?: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  managerId: string;
  managerName: string;
  weekOf: string;
  submittedAt: string | null;
  status: CheckInStatus;
  wins: string[];
  priorities: string[];
  blockers: string | null;
  mood: Mood;
  managerViewed: boolean;
  managerComment: string | null;
}

export interface AgendaItem {
  id: string;
  text: string;
  addedBy: 'manager' | 'employee';
  checked: boolean;
}

export interface ActionItem {
  id: string;
  text: string;
  owner: string;
  dueDate: string;
  done: boolean;
}

export interface OneOnOne {
  id: string;
  managerId: string;
  managerName: string;
  employeeId: string;
  employeeName: string;
  department: string;
  scheduledAt: string;
  duration: 30 | 45 | 60;
  status: OneOnOneStatus;
  agendaItems: AgendaItem[];
  notes: string | null;
  actionItems: ActionItem[];
  previousMeetingId: string | null;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: SurveyQuestionType;
}

export interface SurveyQuestionResult {
  questionId: string;
  avgScore: number;
  responses: { score: number; count: number }[];
  textResponses?: string[];
}

export interface Survey {
  id: string;
  title: string;
  type: SurveyType;
  status: SurveyStatus;
  createdAt: string;
  launchDate: string;
  closeDate: string;
  audienceSize: number;
  responseCount: number;
  overallScore: number;
  questions: SurveyQuestion[];
  results: SurveyQuestionResult[];
}

export interface SurveyTemplate {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  category: string;
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
  status: OKRStatus;
}

export interface OKR {
  id: string;
  title: string;
  type: OKRType;
  owner: string;
  ownerDept: string;
  quarter: 'Q1 2026' | 'Q2 2026';
  status: OKRStatus;
  progress: number;
  keyResults: KeyResult[];
  parentId: string | null;
  linkedRecognitions: number;
}

export interface ReviewCompetency {
  id: string;
  name: string;
  description: string;
}

export interface ReviewCycle {
  id: string;
  name: string;
  type: ReviewCycleType;
  status: ReviewCycleStatus;
  startDate: string;
  endDate: string;
  dueDate: string;
  reviewTypes: ReviewType[];
  participants: number;
  completionRate: number;
  competencies: ReviewCompetency[];
}

export interface CompetencyRating {
  competencyId: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment: string;
}

export interface ReviewSubmission {
  id: string;
  cycleId: string;
  revieweeId: string;
  revieweeName: string;
  revieweeDept: string;
  reviewerId: string;
  reviewerName: string;
  reviewType: ReviewType;
  status: ReviewSubmissionStatus;
  submittedAt: string | null;
  ratings: CompetencyRating[];
  overallRating: 1 | 2 | 3 | 4 | 5 | null;
  overallComment: string | null;
  lastActiveAt: string | null;
}

// ─── Employees ──────────────────────────────────────────────────────────────

export const employeesData: Employee[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@acme.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
    department: "Engineering",
    role: "Senior Engineer",
    points: 2840,
    badgeLevel: "Gold",
    joinDate: "2021-03-15",
    recognitionsReceived: 34,
    recognitionsGiven: 21,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.j@acme.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    department: "Product",
    role: "Product Manager",
    points: 3200,
    badgeLevel: "Platinum",
    joinDate: "2020-07-01",
    recognitionsReceived: 42,
    recognitionsGiven: 38,
  },
  {
    id: "3",
    name: "Priya Sharma",
    email: "priya.s@acme.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
    department: "Design",
    role: "UX Designer",
    points: 1950,
    badgeLevel: "Silver",
    joinDate: "2022-01-10",
    recognitionsReceived: 22,
    recognitionsGiven: 17,
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@acme.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    department: "Engineering",
    role: "Staff Engineer",
    points: 2560,
    badgeLevel: "Gold",
    joinDate: "2020-11-20",
    recognitionsReceived: 29,
    recognitionsGiven: 44,
  },
  {
    id: "5",
    name: "Aisha Okafor",
    email: "aisha.o@acme.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    department: "Sales",
    role: "Account Executive",
    points: 1420,
    badgeLevel: "Silver",
    joinDate: "2022-06-15",
    recognitionsReceived: 18,
    recognitionsGiven: 12,
  },
  {
    id: "6",
    name: "James Rivera",
    email: "james.r@acme.com",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
    department: "Marketing",
    role: "Marketing Lead",
    points: 980,
    badgeLevel: "Bronze",
    joinDate: "2023-02-01",
    recognitionsReceived: 11,
    recognitionsGiven: 9,
  },
  {
    id: "7",
    name: "Emma Wilson",
    email: "emma.w@acme.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    department: "HR",
    role: "HR Business Partner",
    points: 2100,
    badgeLevel: "Gold",
    joinDate: "2021-08-22",
    recognitionsReceived: 27,
    recognitionsGiven: 55,
  },
  {
    id: "8",
    name: "Liam Patel",
    email: "liam.p@acme.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
    department: "Finance",
    role: "Financial Analyst",
    points: 760,
    badgeLevel: "Bronze",
    joinDate: "2023-05-10",
    recognitionsReceived: 8,
    recognitionsGiven: 5,
  },
  {
    id: "9",
    name: "Natalie Brooks",
    email: "natalie.b@acme.com",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
    department: "Customer Success",
    role: "CS Manager",
    points: 1680,
    badgeLevel: "Silver",
    joinDate: "2022-03-18",
    recognitionsReceived: 20,
    recognitionsGiven: 31,
  },
  {
    id: "10",
    name: "Ethan Moore",
    email: "ethan.m@acme.com",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=80&h=80&fit=crop&crop=face",
    department: "Engineering",
    role: "Frontend Engineer",
    points: 1340,
    badgeLevel: "Silver",
    joinDate: "2022-09-05",
    recognitionsReceived: 15,
    recognitionsGiven: 19,
  },
];

// ─── Recognitions ────────────────────────────────────────────────────────────

export const recognitionsData: Recognition[] = [
  {
    id: "1",
    senderId: "4",
    senderName: "David Kim",
    senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    recipientId: "1",
    recipientName: "Sarah Chen",
    recipientAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
    programName: "Peer-to-Peer",
    category: "Innovation",
    points: 150,
    message: "Sarah's solution to the latency problem saved us two sprint cycles. Incredible thinking!",
    status: "Approved",
    createdAt: "2025-04-28T10:30:00Z",
  },
  {
    id: "2",
    senderId: "7",
    senderName: "Emma Wilson",
    senderAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    recipientId: "2",
    recipientName: "Marcus Johnson",
    recipientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    programName: "Employee of the Month",
    category: "Leadership",
    points: 500,
    message: "Marcus led the Q1 launch flawlessly under tight deadlines. True leadership at its best.",
    status: "Approved",
    createdAt: "2025-04-25T14:00:00Z",
  },
  {
    id: "3",
    senderId: "2",
    senderName: "Marcus Johnson",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    recipientId: "3",
    recipientName: "Priya Sharma",
    recipientAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
    programName: "Peer-to-Peer",
    category: "Creativity",
    points: 200,
    message: "Priya's redesign of the onboarding flow reduced drop-off by 40%. Pure creative excellence.",
    status: "Pending",
    createdAt: "2025-04-30T09:15:00Z",
  },
  {
    id: "4",
    senderId: "9",
    senderName: "Natalie Brooks",
    senderAvatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
    recipientId: "5",
    recipientName: "Aisha Okafor",
    recipientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    programName: "Peer-to-Peer",
    category: "Teamwork",
    points: 100,
    message: "Aisha went above and beyond to help onboard our three biggest new accounts this quarter.",
    status: "Approved",
    createdAt: "2025-04-22T16:45:00Z",
  },
  {
    id: "5",
    senderId: "1",
    senderName: "Sarah Chen",
    senderAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
    recipientId: "10",
    recipientName: "Ethan Moore",
    recipientAvatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=80&h=80&fit=crop&crop=face",
    programName: "Peer-to-Peer",
    category: "Teamwork",
    points: 100,
    message: "Ethan jumped in to help debug a critical production issue on his day off. Hero move.",
    status: "Pending",
    createdAt: "2025-05-01T08:00:00Z",
  },
  {
    id: "6",
    senderId: "6",
    senderName: "James Rivera",
    senderAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
    recipientId: "3",
    recipientName: "Priya Sharma",
    recipientAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
    programName: "Peer-to-Peer",
    category: "Collaboration",
    points: 75,
    message: "Priya helped create all the visual assets for our campaign with zero lead time. Absolute legend.",
    status: "Rejected",
    createdAt: "2025-04-18T11:20:00Z",
  },
  {
    id: "7",
    senderId: "3",
    senderName: "Priya Sharma",
    senderAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face",
    recipientId: "7",
    recipientName: "Emma Wilson",
    recipientAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    programName: "Values Champion",
    category: "Culture",
    points: 250,
    message: "Emma built a truly inclusive culture initiative that's already seeing record engagement scores.",
    status: "Approved",
    createdAt: "2025-04-15T13:30:00Z",
  },
  {
    id: "8",
    senderId: "5",
    senderName: "Aisha Okafor",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
    recipientId: "9",
    recipientName: "Natalie Brooks",
    recipientAvatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face",
    programName: "Peer-to-Peer",
    category: "Customer Focus",
    points: 125,
    message: "Natalie personally called every at-risk account this quarter. Churn dropped by 12%.",
    status: "Pending",
    createdAt: "2025-05-01T11:00:00Z",
  },
];

// ─── Programs ─────────────────────────────────────────────────────────────────

export const programsData: Program[] = [
  {
    id: "1",
    name: "Employee of the Month",
    type: "Monthly Award",
    description: "Recognizing outstanding performance and leadership each month.",
    pointBudget: 6000,
    spentPoints: 3500,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    enrollmentCount: 248,
    status: "Active",
  },
  {
    id: "2",
    name: "Peer-to-Peer Recognition",
    type: "Ongoing",
    description: "Empower employees to recognize each other's daily contributions.",
    pointBudget: 25000,
    spentPoints: 14200,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    enrollmentCount: 248,
    status: "Active",
  },
  {
    id: "3",
    name: "Years of Service",
    type: "Milestone",
    description: "Celebrating work anniversaries at 1, 3, 5, and 10 year milestones.",
    pointBudget: 10000,
    spentPoints: 4800,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    enrollmentCount: 32,
    status: "Active",
  },
  {
    id: "4",
    name: "Values Champion",
    type: "Quarterly Award",
    description: "Highlighting employees who best embody our core company values.",
    pointBudget: 5000,
    spentPoints: 1000,
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    enrollmentCount: 248,
    status: "Active",
  },
  {
    id: "5",
    name: "Innovation Sprint Award",
    type: "One-time",
    description: "Recognizing the best ideas submitted during our Q2 Innovation Sprint.",
    pointBudget: 3000,
    spentPoints: 0,
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    enrollmentCount: 0,
    status: "Draft",
  },
  {
    id: "6",
    name: "2024 Holiday Bonus",
    type: "One-time",
    description: "End-of-year bonus recognition for all team members.",
    pointBudget: 12000,
    spentPoints: 12000,
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    enrollmentCount: 240,
    status: "Ended",
  },
];

// ─── Rewards ──────────────────────────────────────────────────────────────────

export const rewardsData: Reward[] = [
  {
    id: "1",
    name: "$25 Amazon Gift Card",
    description: "Shop anything on Amazon with a $25 digital gift card.",
    category: "Gift Cards",
    pointCost: 250,
    stock: 50,
    status: "Available",
    redemptions: 124,
  },
  {
    id: "2",
    name: "$50 Amazon Gift Card",
    description: "Shop anything on Amazon with a $50 digital gift card.",
    category: "Gift Cards",
    pointCost: 500,
    stock: 30,
    status: "Available",
    redemptions: 89,
  },
  {
    id: "3",
    name: "Acme Branded Hoodie",
    description: "Premium heavyweight hoodie with embroidered logo.",
    category: "Merchandise",
    pointCost: 800,
    stock: 0,
    status: "Out of Stock",
    redemptions: 47,
  },
  {
    id: "4",
    name: "Extra PTO Day",
    description: "One additional paid day off, to be used within 90 days.",
    category: "Experiences",
    pointCost: 2000,
    stock: 10,
    status: "Available",
    redemptions: 18,
  },
  {
    id: "5",
    name: "Team Lunch (up to $100)",
    description: "Treat your team to lunch on us — expense up to $100.",
    category: "Experiences",
    pointCost: 1000,
    stock: 20,
    status: "Available",
    redemptions: 31,
  },
  {
    id: "6",
    name: "Udemy Course",
    description: "Access to any Udemy course of your choice.",
    category: "Learning",
    pointCost: 400,
    stock: 100,
    status: "Available",
    redemptions: 76,
  },
  {
    id: "7",
    name: "Wireless Earbuds",
    description: "Sony WH-1000XM5 noise-cancelling wireless earbuds.",
    category: "Tech",
    pointCost: 3000,
    stock: 5,
    status: "Available",
    redemptions: 9,
  },
  {
    id: "8",
    name: "$100 Spa Voucher",
    description: "Relax and recharge with a $100 spa voucher.",
    category: "Wellness",
    pointCost: 1000,
    stock: 15,
    status: "Available",
    redemptions: 22,
  },
];

// ─── Redemptions ─────────────────────────────────────────────────────────────

const _redEmpRoster: Record<string, [string, string, string]> = {
  "1":  ["Sarah Chen",     "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face", "Engineering"],
  "2":  ["Marcus Johnson", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face", "Product"],
  "3":  ["Priya Sharma",   "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face", "Design"],
  "4":  ["David Kim",      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face", "Engineering"],
  "5":  ["Aisha Okafor",   "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face", "Sales"],
  "6":  ["James Rivera",   "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face", "Marketing"],
  "7":  ["Emma Wilson",    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face", "HR"],
  "8":  ["Liam Patel",     "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face", "Finance"],
  "9":  ["Natalie Brooks", "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face", "Customer Success"],
  "10": ["Ethan Moore",    "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=80&h=80&fit=crop&crop=face", "Engineering"],
};

const _redRewardCatalog: Record<string, [string, string, number]> = {
  "1": ["$25 Amazon Gift Card",     "Gift Cards",   250],
  "2": ["$50 Amazon Gift Card",     "Gift Cards",   500],
  "3": ["Acme Branded Hoodie",      "Merchandise",  800],
  "4": ["Extra PTO Day",            "Experiences", 2000],
  "5": ["Team Lunch (up to $100)",  "Experiences", 1000],
  "6": ["Udemy Course",             "Learning",     400],
  "7": ["Wireless Earbuds",         "Tech",        3000],
  "8": ["$100 Spa Voucher",         "Wellness",    1000],
};

function _mkRedemption(
  id: string, eId: string, rId: string,
  requestedAt: string, status: RedemptionStatus, fulfilledAt?: string
): Redemption {
  const [name, avatar, dept] = _redEmpRoster[eId];
  const [rName, rCat, pts] = _redRewardCatalog[rId];
  return {
    id,
    employeeId: eId,
    employeeName: name,
    employeeAvatar: avatar,
    department: dept,
    rewardId: rId,
    rewardName: rName,
    rewardCategory: rCat,
    points: pts,
    status,
    requestedAt,
    fulfilledAt,
  };
}

export const redemptionsData: Redemption[] = [
  // ──── Last 3 months (visible inline) ────
  // May 2026
  _mkRedemption("rd1",  "2",  "4", "2026-05-04T09:00:00Z", "Pending"),
  _mkRedemption("rd2",  "9",  "6", "2026-05-03T14:00:00Z", "Pending"),
  _mkRedemption("rd3",  "1",  "1", "2026-05-02T10:30:00Z", "Fulfilled", "2026-05-03T11:00:00Z"),
  _mkRedemption("rd4",  "10", "2", "2026-05-01T16:00:00Z", "Pending"),
  _mkRedemption("rd5",  "4",  "1", "2026-05-01T08:00:00Z", "Fulfilled", "2026-05-02T09:00:00Z"),
  // April 2026
  _mkRedemption("rd6",  "3",  "6", "2026-04-29T11:00:00Z", "Fulfilled", "2026-04-30T10:00:00Z"),
  _mkRedemption("rd7",  "5",  "1", "2026-04-28T14:00:00Z", "Fulfilled", "2026-04-29T10:00:00Z"),
  _mkRedemption("rd8",  "2",  "1", "2026-04-27T10:00:00Z", "Fulfilled", "2026-04-28T11:00:00Z"),
  _mkRedemption("rd9",  "7",  "5", "2026-04-26T13:00:00Z", "Fulfilled", "2026-04-27T09:00:00Z"),
  _mkRedemption("rd10", "6",  "6", "2026-04-25T15:30:00Z", "Fulfilled", "2026-04-26T11:00:00Z"),
  _mkRedemption("rd11", "1",  "4", "2026-04-24T09:00:00Z", "Fulfilled", "2026-04-25T10:00:00Z"),
  _mkRedemption("rd12", "9",  "2", "2026-04-22T17:00:00Z", "Fulfilled", "2026-04-23T11:00:00Z"),
  _mkRedemption("rd13", "8",  "1", "2026-04-20T11:00:00Z", "Fulfilled", "2026-04-21T10:00:00Z"),
  _mkRedemption("rd14", "10", "6", "2026-04-18T14:00:00Z", "Fulfilled", "2026-04-19T09:00:00Z"),
  _mkRedemption("rd15", "4",  "7", "2026-04-16T16:00:00Z", "Fulfilled", "2026-04-17T11:00:00Z"),
  _mkRedemption("rd16", "3",  "8", "2026-04-15T12:00:00Z", "Fulfilled", "2026-04-16T09:00:00Z"),
  _mkRedemption("rd17", "2",  "2", "2026-04-13T10:00:00Z", "Rejected"),
  _mkRedemption("rd18", "6",  "1", "2026-04-10T15:00:00Z", "Fulfilled", "2026-04-11T10:00:00Z"),
  _mkRedemption("rd19", "7",  "6", "2026-04-08T11:00:00Z", "Fulfilled", "2026-04-09T10:00:00Z"),
  // March 2026
  _mkRedemption("rd20", "1",  "5", "2026-03-30T13:00:00Z", "Fulfilled", "2026-03-31T09:00:00Z"),
  _mkRedemption("rd21", "9",  "4", "2026-03-28T10:00:00Z", "Fulfilled", "2026-03-29T11:00:00Z"),
  _mkRedemption("rd22", "2",  "3", "2026-03-25T16:00:00Z", "Fulfilled", "2026-03-26T10:00:00Z"),
  _mkRedemption("rd23", "5",  "6", "2026-03-22T14:00:00Z", "Fulfilled", "2026-03-23T09:00:00Z"),
  _mkRedemption("rd24", "3",  "1", "2026-03-20T11:00:00Z", "Fulfilled", "2026-03-21T10:00:00Z"),
  _mkRedemption("rd25", "10", "1", "2026-03-18T15:00:00Z", "Fulfilled", "2026-03-19T11:00:00Z"),
  _mkRedemption("rd26", "8",  "8", "2026-03-15T12:00:00Z", "Fulfilled", "2026-03-16T10:00:00Z"),
  _mkRedemption("rd27", "4",  "5", "2026-03-12T10:00:00Z", "Fulfilled", "2026-03-13T11:00:00Z"),
  _mkRedemption("rd28", "7",  "1", "2026-03-10T13:00:00Z", "Fulfilled", "2026-03-11T10:00:00Z"),
  _mkRedemption("rd29", "6",  "2", "2026-03-08T09:00:00Z", "Fulfilled", "2026-03-09T11:00:00Z"),
  _mkRedemption("rd30", "1",  "6", "2026-03-05T16:00:00Z", "Fulfilled", "2026-03-06T10:00:00Z"),
  _mkRedemption("rd31", "9",  "3", "2026-03-02T11:00:00Z", "Rejected"),
  // Feb 2026
  _mkRedemption("rd32", "2",  "6", "2026-02-28T14:00:00Z", "Fulfilled", "2026-03-01T10:00:00Z"),
  _mkRedemption("rd33", "10", "2", "2026-02-25T11:00:00Z", "Fulfilled", "2026-02-26T09:00:00Z"),
  _mkRedemption("rd34", "5",  "5", "2026-02-22T13:00:00Z", "Fulfilled", "2026-02-23T11:00:00Z"),
  _mkRedemption("rd35", "3",  "4", "2026-02-20T10:00:00Z", "Fulfilled", "2026-02-21T10:00:00Z"),
  _mkRedemption("rd36", "8",  "1", "2026-02-18T15:00:00Z", "Fulfilled", "2026-02-19T11:00:00Z"),
  _mkRedemption("rd37", "7",  "8", "2026-02-15T12:00:00Z", "Fulfilled", "2026-02-16T10:00:00Z"),
  _mkRedemption("rd38", "4",  "2", "2026-02-10T16:00:00Z", "Fulfilled", "2026-02-11T11:00:00Z"),
  // ──── Older than 3 months (download-only) ────
  _mkRedemption("rd39", "1",  "1", "2026-01-28T11:00:00Z", "Fulfilled", "2026-01-29T10:00:00Z"),
  _mkRedemption("rd40", "6",  "6", "2026-01-22T14:00:00Z", "Fulfilled", "2026-01-23T11:00:00Z"),
  _mkRedemption("rd41", "9",  "2", "2026-01-15T09:00:00Z", "Fulfilled", "2026-01-16T10:00:00Z"),
  _mkRedemption("rd42", "2",  "5", "2026-01-10T13:00:00Z", "Fulfilled", "2026-01-11T11:00:00Z"),
  _mkRedemption("rd43", "3",  "3", "2026-01-05T16:00:00Z", "Fulfilled", "2026-01-06T10:00:00Z"),
  _mkRedemption("rd44", "6",  "4", "2025-12-28T10:00:00Z", "Rejected"),
  _mkRedemption("rd45", "7",  "4", "2025-12-20T10:00:00Z", "Fulfilled", "2025-12-21T11:00:00Z"),
  _mkRedemption("rd46", "10", "1", "2025-12-15T14:00:00Z", "Fulfilled", "2025-12-16T09:00:00Z"),
  _mkRedemption("rd47", "4",  "6", "2025-12-10T11:00:00Z", "Fulfilled", "2025-12-11T10:00:00Z"),
  _mkRedemption("rd48", "5",  "8", "2025-12-05T13:00:00Z", "Fulfilled", "2025-12-06T10:00:00Z"),
  _mkRedemption("rd49", "1",  "7", "2025-11-25T16:00:00Z", "Fulfilled", "2025-11-26T11:00:00Z"),
  _mkRedemption("rd50", "2",  "1", "2025-11-15T09:00:00Z", "Fulfilled", "2025-11-16T10:00:00Z"),
  _mkRedemption("rd51", "8",  "3", "2025-11-10T11:00:00Z", "Fulfilled", "2025-11-11T10:00:00Z"),
  _mkRedemption("rd52", "9",  "7", "2025-11-05T15:00:00Z", "Fulfilled", "2025-11-06T10:00:00Z"),
];

// ─── HR Notifications ────────────────────────────────────────────────────────

export const hrNotificationsData: HRNotification[] = [
  {
    id: "1",
    type: "warning",
    title: "Budget Alert: Peer-to-Peer Program",
    message: "The Peer-to-Peer program has consumed 57% of its annual budget with 8 months remaining.",
    time: "2 hours ago",
    isRead: false,
    category: "Budget",
  },
  {
    id: "2",
    type: "info",
    title: "3 Recognitions Pending Approval",
    message: "Recognitions from Marcus, Sarah, and Aisha are awaiting your approval.",
    time: "4 hours ago",
    isRead: false,
    category: "Approvals",
  },
  {
    id: "3",
    type: "success",
    title: "April Participation Rate: 78%",
    message: "Participation hit a new all-time high of 78% in April. Great work!",
    time: "1 day ago",
    isRead: false,
    category: "Analytics",
  },
  {
    id: "4",
    type: "info",
    title: "2 Redemption Requests Pending",
    message: "Marcus Johnson and David Kim have pending reward redemption requests.",
    time: "1 day ago",
    isRead: true,
    category: "Redemptions",
  },
  {
    id: "5",
    type: "warning",
    title: "Acme Hoodie Out of Stock",
    message: "The Acme Branded Hoodie reward is now out of stock. Restock to resume redemptions.",
    time: "2 days ago",
    isRead: true,
    category: "Rewards",
  },
  {
    id: "6",
    type: "info",
    title: "New Employee: Liam Patel",
    message: "Liam Patel joined the Finance team. Don't forget to enroll them in recognition programs.",
    time: "3 days ago",
    isRead: true,
    category: "People",
  },
  {
    id: "7",
    type: "success",
    title: "Employee of the Month Awarded",
    message: "Marcus Johnson was awarded Employee of the Month for April 2025.",
    time: "5 days ago",
    isRead: true,
    category: "Programs",
  },
  {
    id: "8",
    type: "error",
    title: "HRIS Sync Failed",
    message: "The scheduled HRIS sync failed at 02:00 AM. Please check integration settings.",
    time: "1 week ago",
    isRead: true,
    category: "Integrations",
  },
];

// ─── Analytics Data ───────────────────────────────────────────────────────────

export const monthlyTrendData = [
  { month: "Jan", recognitions: 38, points: 5200, participants: 142 },
  { month: "Feb", recognitions: 45, points: 6100, participants: 158 },
  { month: "Mar", recognitions: 52, points: 7400, participants: 172 },
  { month: "Apr", recognitions: 61, points: 8900, participants: 193 },
  { month: "May", recognitions: 48, points: 6800, participants: 165 },
  { month: "Jun", recognitions: 55, points: 7600, participants: 178 },
  { month: "Jul", recognitions: 43, points: 5900, participants: 152 },
  { month: "Aug", recognitions: 67, points: 9500, participants: 205 },
  { month: "Sep", recognitions: 59, points: 8200, participants: 188 },
  { month: "Oct", recognitions: 72, points: 10400, participants: 219 },
  { month: "Nov", recognitions: 65, points: 9100, participants: 201 },
  { month: "Dec", recognitions: 58, points: 8000, participants: 182 },
];

export const departmentStatsData = [
  { department: "Engineering", points: 12400, employees: 48, participationRate: 82 },
  { department: "Product", points: 9800, employees: 22, participationRate: 91 },
  { department: "Design", points: 6200, employees: 14, participationRate: 78 },
  { department: "Sales", points: 8100, employees: 36, participationRate: 69 },
  { department: "Marketing", points: 5400, employees: 18, participationRate: 72 },
  { department: "HR", points: 4900, employees: 10, participationRate: 95 },
  { department: "Finance", points: 3100, employees: 12, participationRate: 58 },
  { department: "CS", points: 7200, employees: 28, participationRate: 85 },
];

export const categoryBreakdownData = [
  { category: "Innovation", value: 28, fill: "#1c1917" },
  { category: "Teamwork", value: 24, fill: "#44403c" },
  { category: "Leadership", value: 18, fill: "#78716c" },
  { category: "Creativity", value: 14, fill: "#a8a29e" },
  { category: "Customer Focus", value: 10, fill: "#d6d3d1" },
  { category: "Other", value: 6, fill: "#e7e5e4" },
];

export const budgetBurnData = [
  { month: "Jan", budget: 50000, spent: 5200 },
  { month: "Feb", budget: 50000, spent: 11300 },
  { month: "Mar", budget: 50000, spent: 18700 },
  { month: "Apr", budget: 50000, spent: 27600 },
  { month: "May", budget: 50000, spent: 34400 },
  { month: "Jun", budget: 50000, spent: 42000 },
];

// ─── Budget & Points Economy ──────────────────────────────────────────────────

export const budgetSettings: BudgetSettings = {
  totalBudget: 50000,
  cycle: "Monthly",
  cycleStartDate: "2026-05-01",
  cycleEndDate: "2026-05-31",
  defaultEmployeeAllowance: 500,
  resetDayOfMonth: 1,
  autoReset: true,
};

export const departmentAllocations: DepartmentAllocation[] = [
  { department: "Engineering", allocated: 12000, used: 8200, headcount: 48 },
  { department: "Product",     allocated: 6000,  used: 4100, headcount: 22 },
  { department: "Design",      allocated: 4000,  used: 2300, headcount: 14 },
  { department: "Sales",       allocated: 8000,  used: 4900, headcount: 36 },
  { department: "Marketing",   allocated: 5000,  used: 2800, headcount: 18 },
  { department: "HR",          allocated: 3000,  used: 1900, headcount: 10 },
  { department: "Finance",     allocated: 3500,  used: 1100, headcount: 12 },
  { department: "Customer Success", allocated: 6500, used: 3300, headcount: 28 },
];

export const allowanceTiers: AllowanceTier[] = [
  { level: "Bronze",   monthlyAllowance: 300 },
  { level: "Silver",   monthlyAllowance: 500 },
  { level: "Gold",     monthlyAllowance: 750 },
  { level: "Platinum", monthlyAllowance: 1000 },
];

export const pointTransactions: PointTransaction[] = [
  {
    id: "t1",
    type: "Recognition",
    direction: "debit",
    amount: 150,
    fromName: "David Kim",
    toName: "Sarah Chen",
    scope: "employee",
    scopeName: "Engineering",
    reasonNote: "Recognition: Innovation",
    createdAt: "2026-05-02T10:30:00Z",
  },
  {
    id: "t2",
    type: "Recognition",
    direction: "debit",
    amount: 500,
    fromName: "Emma Wilson",
    toName: "Marcus Johnson",
    scope: "employee",
    scopeName: "Product",
    reasonNote: "Recognition: Leadership",
    createdAt: "2026-05-02T14:00:00Z",
  },
  {
    id: "t3",
    type: "Top-up",
    direction: "credit",
    amount: 5000,
    scope: "department",
    scopeName: "Engineering",
    reasonCode: "manual-topup",
    reasonNote: "Q2 hackathon prizes",
    adminName: "Vignesh (HR Admin)",
    createdAt: "2026-05-01T09:00:00Z",
  },
  {
    id: "t4",
    type: "Allowance",
    direction: "credit",
    amount: 500,
    toName: "Sarah Chen",
    scope: "employee",
    scopeName: "Engineering",
    reasonCode: "monthly-allowance",
    reasonNote: "Monthly give-allowance reset",
    createdAt: "2026-05-01T00:00:00Z",
  },
  {
    id: "t5",
    type: "Redemption",
    direction: "debit",
    amount: 2000,
    fromName: "Marcus Johnson",
    scope: "employee",
    scopeName: "Product",
    reasonNote: "Redeemed: Extra PTO Day",
    createdAt: "2026-04-30T16:20:00Z",
  },
  {
    id: "t6",
    type: "Adjustment",
    direction: "debit",
    amount: 250,
    fromName: "James Rivera",
    scope: "employee",
    scopeName: "Marketing",
    reasonCode: "correction",
    reasonNote: "Duplicate recognition reversal",
    adminName: "Vignesh (HR Admin)",
    createdAt: "2026-04-30T11:00:00Z",
  },
  {
    id: "t7",
    type: "Reset",
    direction: "credit",
    amount: 50000,
    scope: "org",
    scopeName: "Acme Corp",
    reasonCode: "cycle-reset",
    reasonNote: "May 2026 cycle budget reset",
    adminName: "System",
    createdAt: "2026-05-01T00:00:00Z",
  },
  {
    id: "t8",
    type: "Recognition",
    direction: "debit",
    amount: 100,
    fromName: "Natalie Brooks",
    toName: "Aisha Okafor",
    scope: "employee",
    scopeName: "Sales",
    reasonNote: "Recognition: Teamwork",
    createdAt: "2026-04-29T16:45:00Z",
  },
  {
    id: "t9",
    type: "Top-up",
    direction: "credit",
    amount: 1500,
    scope: "department",
    scopeName: "Customer Success",
    reasonCode: "campaign-bonus",
    reasonNote: "Q2 NPS milestone reward",
    adminName: "Vignesh (HR Admin)",
    createdAt: "2026-04-28T13:00:00Z",
  },
  {
    id: "t10",
    type: "Recognition",
    direction: "debit",
    amount: 250,
    fromName: "Priya Sharma",
    toName: "Emma Wilson",
    scope: "employee",
    scopeName: "HR",
    reasonNote: "Recognition: Culture",
    createdAt: "2026-04-25T13:30:00Z",
  },
  {
    id: "t11",
    type: "Adjustment",
    direction: "credit",
    amount: 200,
    toName: "Liam Patel",
    scope: "employee",
    scopeName: "Finance",
    reasonCode: "manual-topup",
    reasonNote: "Onboarding welcome credits",
    adminName: "Vignesh (HR Admin)",
    createdAt: "2026-04-22T10:30:00Z",
  },
  {
    id: "t12",
    type: "Recognition",
    direction: "debit",
    amount: 75,
    fromName: "James Rivera",
    toName: "Priya Sharma",
    scope: "employee",
    scopeName: "Design",
    reasonNote: "Recognition: Collaboration",
    createdAt: "2026-04-18T11:20:00Z",
  },
];

// ─── Weekly Check-ins ────────────────────────────────────────────────────────

export const checkIns: CheckIn[] = [
  // Submitted (12)
  {
    id: "ci1", employeeId: "e1", employeeName: "Priya Nair", employeeAvatar: "PN",
    department: "Engineering", managerId: "m1", managerName: "Rahul Menon",
    weekOf: "2026-04-28", submittedAt: "2026-04-28T16:00:00Z", status: "submitted", mood: 4,
    wins: ["Shipped auth refactor", "Unblocked design review"],
    priorities: ["Complete API integration", "Write unit tests for payment module"],
    blockers: "Waiting on design sign-off for onboarding flow",
    managerViewed: true, managerComment: "Great week! Let's discuss the blocker on Monday.",
  },
  {
    id: "ci2", employeeId: "e2", employeeName: "Wei Zhang", employeeAvatar: "WZ",
    department: "Engineering", managerId: "m1", managerName: "Rahul Menon",
    weekOf: "2026-04-28", submittedAt: "2026-04-28T18:30:00Z", status: "submitted", mood: 5,
    wins: ["Reduced p95 latency by 30%", "Mentored new junior engineer"],
    priorities: ["Roll out caching layer", "Code review on auth refactor"],
    blockers: null,
    managerViewed: true, managerComment: "Phenomenal latency win. Let's write this up.",
  },
  {
    id: "ci3", employeeId: "e3", employeeName: "Ananya Sharma", employeeAvatar: "AS",
    department: "Product", managerId: "m2", managerName: "Diego Hernandez",
    weekOf: "2026-04-28", submittedAt: "2026-04-28T11:15:00Z", status: "submitted", mood: 3,
    wins: ["Shipped onboarding wireframes", "Stakeholder alignment on Q2 roadmap"],
    priorities: ["Run user-test sessions", "Finalize PRD for billing redesign"],
    blockers: "Recruiting hasn't found a UXR yet — slowing down user research",
    managerViewed: false, managerComment: null,
  },
  {
    id: "ci4", employeeId: "e4", employeeName: "James O'Brien", employeeAvatar: "JO",
    department: "Sales", managerId: "m3", managerName: "Olivia Carter",
    weekOf: "2026-04-28", submittedAt: "2026-04-29T09:00:00Z", status: "submitted", mood: 4,
    wins: ["Closed two mid-market deals", "Discovery call with FinTech enterprise lead"],
    priorities: ["Push enterprise pipeline forward", "Prep for QBR"],
    blockers: null,
    managerViewed: true, managerComment: "Strong week. Let's prep the QBR together.",
  },
  {
    id: "ci5", employeeId: "e5", employeeName: "Sara Patel", employeeAvatar: "SP",
    department: "Sales", managerId: "m3", managerName: "Olivia Carter",
    weekOf: "2026-04-28", submittedAt: "2026-04-28T17:00:00Z", status: "submitted", mood: 3,
    wins: ["Hit 80% of quota", "Reactivated two stalled accounts"],
    priorities: ["Push past quota", "Demo prep for new prospect"],
    blockers: "Pricing approval still pending from finance — losing momentum",
    managerViewed: true, managerComment: null,
  },
  {
    id: "ci6", employeeId: "e6", employeeName: "Mei Lin", employeeAvatar: "ML",
    department: "Engineering", managerId: "m1", managerName: "Rahul Menon",
    weekOf: "2026-04-28", submittedAt: "2026-04-28T13:00:00Z", status: "submitted", mood: 4,
    wins: ["Completed migration to new CI/CD", "Doc'd deploy runbook"],
    priorities: ["Onboard team to new pipeline", "Stability review"],
    blockers: null,
    managerViewed: true, managerComment: "Excellent ownership. Will share runbook with leadership.",
  },
  {
    id: "ci7", employeeId: "e7", employeeName: "Lina Park", employeeAvatar: "LP",
    department: "Product", managerId: "m2", managerName: "Diego Hernandez",
    weekOf: "2026-04-28", submittedAt: "2026-04-28T15:30:00Z", status: "submitted", mood: 4,
    wins: ["Launched payments A/B test", "Cross-functional sync with eng"],
    priorities: ["Analyze A/B results", "Plan v2 of payments flow"],
    blockers: null,
    managerViewed: false, managerComment: null,
  },
  {
    id: "ci8", employeeId: "e8", employeeName: "Carla Mendes", employeeAvatar: "CM",
    department: "Design", managerId: "m4", managerName: "Yuki Tanaka",
    weekOf: "2026-04-28", submittedAt: "2026-04-28T19:00:00Z", status: "submitted", mood: 3,
    wins: ["Completed onboarding flow redesign", "Design system audit kicked off"],
    priorities: ["Ship onboarding handoff to eng", "Component library cleanup"],
    blockers: "Need eng pairing time on motion specs",
    managerViewed: true, managerComment: "I'll pair you with Wei next week.",
  },
  {
    id: "ci9", employeeId: "e9", employeeName: "Jonas Lindstrom", employeeAvatar: "JL",
    department: "Marketing", managerId: "m5", managerName: "Tomás Reyes",
    weekOf: "2026-04-28", submittedAt: "2026-04-29T10:30:00Z", status: "submitted", mood: 5,
    wins: ["Campaign launched 3 days early", "Earned media pickup from TechCrunch"],
    priorities: ["Performance reporting", "Plan Q2 webinar series"],
    blockers: null,
    managerViewed: true, managerComment: "Great earned media. Bonus karma.",
  },
  {
    id: "ci10", employeeId: "e10", employeeName: "Amir Khan", employeeAvatar: "AK",
    department: "Marketing", managerId: "m5", managerName: "Tomás Reyes",
    weekOf: "2026-04-28", submittedAt: "2026-04-28T20:00:00Z", status: "submitted", mood: 2,
    wins: ["SEO audit complete"],
    priorities: ["Implement priority SEO fixes", "Recover from algorithm hit"],
    blockers: "Eng bandwidth for technical SEO fixes is constrained",
    managerViewed: true, managerComment: "Let's escalate eng prioritization at Monday's leads sync.",
  },
  {
    id: "ci11", employeeId: "e11", employeeName: "Diego Hernandez", employeeAvatar: "DH",
    department: "Product", managerId: "m6", managerName: "Olivia Carter",
    weekOf: "2026-04-28", submittedAt: "2026-04-28T12:00:00Z", status: "submitted", mood: 4,
    wins: ["Drafted Q2 OKRs", "Aligned engineering leads on roadmap"],
    priorities: ["Finalize OKRs with leadership", "Kick off discovery for billing redesign"],
    blockers: null,
    managerViewed: true, managerComment: null,
  },
  {
    id: "ci12", employeeId: "e12", employeeName: "Ravi Iyer", employeeAvatar: "RI",
    department: "Engineering", managerId: "m1", managerName: "Rahul Menon",
    weekOf: "2026-04-28", submittedAt: "2026-04-29T08:30:00Z", status: "submitted", mood: 3,
    wins: ["Triaged 12 production issues", "On-call rotation handover doc"],
    priorities: ["Reduce on-call noise", "Refactor flaky tests"],
    blockers: "Flaky test suite is eating sprint time — needs structural fix",
    managerViewed: false, managerComment: null,
  },
  // Pending (5) — no submittedAt yet
  {
    id: "ci13", employeeId: "e13", employeeName: "Tomás Reyes", employeeAvatar: "TR",
    department: "Marketing", managerId: "m7", managerName: "Olivia Carter",
    weekOf: "2026-04-28", submittedAt: null, status: "pending", mood: 3,
    wins: [], priorities: [], blockers: null,
    managerViewed: false, managerComment: null,
  },
  {
    id: "ci14", employeeId: "e14", employeeName: "Yuki Tanaka", employeeAvatar: "YT",
    department: "Design", managerId: "m6", managerName: "Olivia Carter",
    weekOf: "2026-04-28", submittedAt: null, status: "pending", mood: 3,
    wins: [], priorities: [], blockers: null,
    managerViewed: false, managerComment: null,
  },
  {
    id: "ci15", employeeId: "e15", employeeName: "Olivia Carter", employeeAvatar: "OC",
    department: "Sales", managerId: "m6", managerName: "Director Sales",
    weekOf: "2026-04-28", submittedAt: null, status: "pending", mood: 3,
    wins: [], priorities: [], blockers: null,
    managerViewed: false, managerComment: null,
  },
  {
    id: "ci16", employeeId: "e16", employeeName: "Rahul Menon", employeeAvatar: "RM",
    department: "Engineering", managerId: "m6", managerName: "Director Engineering",
    weekOf: "2026-04-28", submittedAt: null, status: "pending", mood: 3,
    wins: [], priorities: [], blockers: null,
    managerViewed: false, managerComment: null,
  },
  {
    id: "ci17", employeeId: "e17", employeeName: "Hana Yoshida", employeeAvatar: "HY",
    department: "Product", managerId: "m2", managerName: "Diego Hernandez",
    weekOf: "2026-04-28", submittedAt: null, status: "pending", mood: 3,
    wins: [], priorities: [], blockers: null,
    managerViewed: false, managerComment: null,
  },
  // Overdue (3) — older weekOf, never submitted
  {
    id: "ci18", employeeId: "e18", employeeName: "Marco Rossi", employeeAvatar: "MR",
    department: "Engineering", managerId: "m1", managerName: "Rahul Menon",
    weekOf: "2026-04-21", submittedAt: null, status: "overdue", mood: 3,
    wins: [], priorities: [], blockers: null,
    managerViewed: false, managerComment: null,
  },
  {
    id: "ci19", employeeId: "e19", employeeName: "Aroha Te Wani", employeeAvatar: "AT",
    department: "Sales", managerId: "m3", managerName: "Olivia Carter",
    weekOf: "2026-04-21", submittedAt: null, status: "overdue", mood: 3,
    wins: [], priorities: [], blockers: null,
    managerViewed: false, managerComment: null,
  },
  {
    id: "ci20", employeeId: "e20", employeeName: "Felipe Costa", employeeAvatar: "FC",
    department: "Marketing", managerId: "m5", managerName: "Tomás Reyes",
    weekOf: "2026-04-21", submittedAt: null, status: "overdue", mood: 3,
    wins: [], priorities: [], blockers: null,
    managerViewed: false, managerComment: null,
  },
];

// ─── 1-on-1s ─────────────────────────────────────────────────────────────────

export const oneOnOnes: OneOnOne[] = [
  // Scheduled (8)
  {
    id: "oo1", managerId: "m1", managerName: "Rahul Menon", employeeId: "e1", employeeName: "Priya Nair",
    department: "Engineering", scheduledAt: "2026-05-05T10:00:00", duration: 45, status: "scheduled",
    agendaItems: [
      { id: "a1", text: "Review Q2 OKR progress", addedBy: "manager", checked: false },
      { id: "a2", text: "Career growth discussion", addedBy: "employee", checked: false },
      { id: "a3", text: "Unblock onboarding design dependency", addedBy: "manager", checked: false },
    ],
    actionItems: [
      { id: "ac1", text: "Share updated API spec with design", owner: "Priya Nair", dueDate: "2026-05-08", done: false },
    ],
    notes: null, previousMeetingId: null,
  },
  {
    id: "oo2", managerId: "m1", managerName: "Rahul Menon", employeeId: "e2", employeeName: "Wei Zhang",
    department: "Engineering", scheduledAt: "2026-05-06T11:30:00", duration: 30, status: "scheduled",
    agendaItems: [
      { id: "a4", text: "Latency improvements review", addedBy: "manager", checked: false },
      { id: "a5", text: "Promotion conversation", addedBy: "employee", checked: false },
    ],
    actionItems: [], notes: null, previousMeetingId: null,
  },
  {
    id: "oo3", managerId: "m2", managerName: "Diego Hernandez", employeeId: "e7", employeeName: "Lina Park",
    department: "Product", scheduledAt: "2026-05-07T14:00:00", duration: 60, status: "scheduled",
    agendaItems: [
      { id: "a6", text: "A/B test results walkthrough", addedBy: "employee", checked: false },
      { id: "a7", text: "Q2 roadmap alignment", addedBy: "manager", checked: false },
      { id: "a8", text: "Side project bandwidth", addedBy: "employee", checked: false },
    ],
    actionItems: [], notes: null, previousMeetingId: null,
  },
  {
    id: "oo4", managerId: "m3", managerName: "Olivia Carter", employeeId: "e4", employeeName: "James O'Brien",
    department: "Sales", scheduledAt: "2026-05-08T09:00:00", duration: 30, status: "scheduled",
    agendaItems: [
      { id: "a9", text: "Pipeline review", addedBy: "manager", checked: false },
      { id: "a10", text: "QBR prep", addedBy: "manager", checked: false },
    ],
    actionItems: [], notes: null, previousMeetingId: null,
  },
  {
    id: "oo5", managerId: "m5", managerName: "Tomás Reyes", employeeId: "e9", employeeName: "Jonas Lindstrom",
    department: "Marketing", scheduledAt: "2026-05-09T15:00:00", duration: 45, status: "scheduled",
    agendaItems: [
      { id: "a11", text: "Campaign post-mortem", addedBy: "manager", checked: false },
      { id: "a12", text: "Q2 webinar series planning", addedBy: "employee", checked: false },
    ],
    actionItems: [], notes: null, previousMeetingId: null,
  },
  {
    id: "oo6", managerId: "m4", managerName: "Yuki Tanaka", employeeId: "e8", employeeName: "Carla Mendes",
    department: "Design", scheduledAt: "2026-05-10T13:00:00", duration: 45, status: "scheduled",
    agendaItems: [
      { id: "a13", text: "Design system audit findings", addedBy: "employee", checked: false },
      { id: "a14", text: "Workload check-in", addedBy: "manager", checked: false },
    ],
    actionItems: [], notes: null, previousMeetingId: null,
  },
  {
    id: "oo7", managerId: "m1", managerName: "Rahul Menon", employeeId: "e6", employeeName: "Mei Lin",
    department: "Engineering", scheduledAt: "2026-05-11T10:00:00", duration: 30, status: "scheduled",
    agendaItems: [
      { id: "a15", text: "CI/CD migration retro", addedBy: "manager", checked: false },
    ],
    actionItems: [], notes: null, previousMeetingId: null,
  },
  {
    id: "oo8", managerId: "m2", managerName: "Diego Hernandez", employeeId: "e3", employeeName: "Ananya Sharma",
    department: "Product", scheduledAt: "2026-05-12T11:00:00", duration: 60, status: "scheduled",
    agendaItems: [
      { id: "a16", text: "PRD review for billing redesign", addedBy: "employee", checked: false },
      { id: "a17", text: "UXR hiring plan", addedBy: "employee", checked: false },
    ],
    actionItems: [], notes: null, previousMeetingId: null,
  },
  // Completed (7)
  {
    id: "oo9", managerId: "m1", managerName: "Rahul Menon", employeeId: "e2", employeeName: "Wei Zhang",
    department: "Engineering", scheduledAt: "2026-04-29T11:30:00", duration: 30, status: "completed",
    agendaItems: [
      { id: "a18", text: "Caching layer rollout plan", addedBy: "manager", checked: true },
      { id: "a19", text: "On-call rotation feedback", addedBy: "employee", checked: true },
    ],
    actionItems: [
      { id: "ac2", text: "Draft caching rollout RFC", owner: "Wei Zhang", dueDate: "2026-05-06", done: false },
    ],
    notes: "Wei is feeling stretched on on-call. We'll add Mei to the rotation. Caching rollout looks ready for staged deploy next week.",
    previousMeetingId: null,
  },
  {
    id: "oo10", managerId: "m2", managerName: "Diego Hernandez", employeeId: "e7", employeeName: "Lina Park",
    department: "Product", scheduledAt: "2026-04-30T14:00:00", duration: 45, status: "completed",
    agendaItems: [
      { id: "a20", text: "Payments A/B framework review", addedBy: "manager", checked: true },
      { id: "a21", text: "Career conversation", addedBy: "employee", checked: true },
    ],
    actionItems: [
      { id: "ac3", text: "Send IC track expectations doc", owner: "Diego Hernandez", dueDate: "2026-05-03", done: true },
      { id: "ac4", text: "A/B v2 hypothesis doc", owner: "Lina Park", dueDate: "2026-05-12", done: false },
    ],
    notes: "Lina is interested in the staff PM track. We discussed scope-of-impact expectations.",
    previousMeetingId: null,
  },
  {
    id: "oo11", managerId: "m3", managerName: "Olivia Carter", employeeId: "e5", employeeName: "Sara Patel",
    department: "Sales", scheduledAt: "2026-04-28T09:30:00", duration: 30, status: "completed",
    agendaItems: [
      { id: "a22", text: "Quota status & remaining pipeline", addedBy: "manager", checked: true },
      { id: "a23", text: "Pricing approval delay", addedBy: "employee", checked: true },
    ],
    actionItems: [
      { id: "ac5", text: "Escalate pricing approval to CFO", owner: "Olivia Carter", dueDate: "2026-05-02", done: true },
    ],
    notes: "Pricing escalation already in motion. Sara feeling more confident about hitting quota.",
    previousMeetingId: null,
  },
  {
    id: "oo12", managerId: "m5", managerName: "Tomás Reyes", employeeId: "e10", employeeName: "Amir Khan",
    department: "Marketing", scheduledAt: "2026-04-25T15:00:00", duration: 45, status: "completed",
    agendaItems: [
      { id: "a24", text: "SEO audit results", addedBy: "manager", checked: true },
      { id: "a25", text: "Wellbeing check", addedBy: "manager", checked: true },
    ],
    actionItems: [
      { id: "ac6", text: "Build prioritized SEO fix list", owner: "Amir Khan", dueDate: "2026-04-29", done: true },
      { id: "ac7", text: "Negotiate eng resourcing", owner: "Tomás Reyes", dueDate: "2026-05-05", done: false },
    ],
    notes: "Amir is feeling the squeeze of cross-team dependencies. We'll get eng prioritization moving.",
    previousMeetingId: null,
  },
  {
    id: "oo13", managerId: "m4", managerName: "Yuki Tanaka", employeeId: "e8", employeeName: "Carla Mendes",
    department: "Design", scheduledAt: "2026-04-26T13:00:00", duration: 45, status: "completed",
    agendaItems: [
      { id: "a26", text: "Onboarding flow ship review", addedBy: "manager", checked: true },
      { id: "a27", text: "Design system audit kickoff", addedBy: "employee", checked: true },
    ],
    actionItems: [
      { id: "ac8", text: "Pair with Wei on motion specs", owner: "Carla Mendes", dueDate: "2026-05-08", done: false },
    ],
    notes: "Strong shipping cadence. Audit scope agreed: prioritize buttons, cards, form controls.",
    previousMeetingId: null,
  },
  {
    id: "oo14", managerId: "m1", managerName: "Rahul Menon", employeeId: "e12", employeeName: "Ravi Iyer",
    department: "Engineering", scheduledAt: "2026-04-24T10:00:00", duration: 30, status: "completed",
    agendaItems: [
      { id: "a28", text: "On-call rotation pain points", addedBy: "employee", checked: true },
      { id: "a29", text: "Flaky test plan", addedBy: "manager", checked: true },
    ],
    actionItems: [
      { id: "ac9", text: "Draft flaky test stabilization RFC", owner: "Ravi Iyer", dueDate: "2026-05-10", done: false },
    ],
    notes: "Ravi will lead a structured flake-fix initiative. Will partner with QA team.",
    previousMeetingId: null,
  },
  {
    id: "oo15", managerId: "m2", managerName: "Diego Hernandez", employeeId: "e3", employeeName: "Ananya Sharma",
    department: "Product", scheduledAt: "2026-04-23T11:00:00", duration: 60, status: "completed",
    agendaItems: [
      { id: "a30", text: "Q2 roadmap alignment", addedBy: "manager", checked: true },
      { id: "a31", text: "UXR hiring update", addedBy: "employee", checked: true },
    ],
    actionItems: [
      { id: "ac10", text: "Loop in recruiting on UXR pipeline", owner: "Diego Hernandez", dueDate: "2026-04-30", done: true },
    ],
    notes: "Roadmap aligned. UXR hiring is a critical path — escalating to head of people.",
    previousMeetingId: null,
  },
  // Overdue (3) — past dates, status overdue
  {
    id: "oo16", managerId: "m5", managerName: "Tomás Reyes", employeeId: "e9", employeeName: "Jonas Lindstrom",
    department: "Marketing", scheduledAt: "2026-04-22T15:00:00", duration: 45, status: "overdue",
    agendaItems: [
      { id: "a32", text: "Campaign launch retro", addedBy: "manager", checked: false },
    ],
    actionItems: [], notes: null, previousMeetingId: null,
  },
  {
    id: "oo17", managerId: "m3", managerName: "Olivia Carter", employeeId: "e4", employeeName: "James O'Brien",
    department: "Sales", scheduledAt: "2026-04-20T09:00:00", duration: 30, status: "overdue",
    agendaItems: [
      { id: "a33", text: "Pipeline triage", addedBy: "manager", checked: false },
    ],
    actionItems: [], notes: null, previousMeetingId: null,
  },
  {
    id: "oo18", managerId: "m1", managerName: "Rahul Menon", employeeId: "e6", employeeName: "Mei Lin",
    department: "Engineering", scheduledAt: "2026-04-18T10:00:00", duration: 30, status: "overdue",
    agendaItems: [
      { id: "a34", text: "Q1 retrospective", addedBy: "manager", checked: false },
    ],
    actionItems: [], notes: null, previousMeetingId: null,
  },
];

// ─── Engagement Surveys ──────────────────────────────────────────────────────

export const surveys: Survey[] = [
  // Pulse
  {
    id: "s1", title: "April Pulse Check", type: "pulse", status: "completed",
    createdAt: "2026-04-01", launchDate: "2026-04-07", closeDate: "2026-04-14",
    audienceSize: 248, responseCount: 215, overallScore: 74,
    questions: [
      { id: "q1", text: "How happy are you at work this week?", type: "rating" },
      { id: "q2", text: "Do you feel supported by your manager?", type: "rating" },
      { id: "q3", text: "Is your workload sustainable?", type: "rating" },
      { id: "q4", text: "Do you have what you need to do your best work?", type: "yesno" },
      { id: "q5", text: "Anything you'd like leadership to know?", type: "text" },
    ],
    results: [
      { questionId: "q1", avgScore: 4.1, responses: [{ score: 1, count: 5 }, { score: 2, count: 12 }, { score: 3, count: 38 }, { score: 4, count: 92 }, { score: 5, count: 68 }] },
      { questionId: "q2", avgScore: 4.3, responses: [{ score: 1, count: 4 }, { score: 2, count: 9 }, { score: 3, count: 31 }, { score: 4, count: 88 }, { score: 5, count: 83 }] },
      { questionId: "q3", avgScore: 3.4, responses: [{ score: 1, count: 18 }, { score: 2, count: 28 }, { score: 3, count: 64 }, { score: 4, count: 67 }, { score: 5, count: 38 }] },
      { questionId: "q4", avgScore: 78, responses: [{ score: 1, count: 168 }, { score: 0, count: 47 }] },
      { questionId: "q5", avgScore: 0, responses: [], textResponses: [
        "More headcount in eng would relieve a lot of pressure.",
        "Quarterly all-hands feel disconnected from product reality.",
        "Loving the recognition program — keeps me going.",
      ] },
    ],
  },
  {
    id: "s2", title: "May Week 1 Pulse", type: "pulse", status: "active",
    createdAt: "2026-04-25", launchDate: "2026-05-01", closeDate: "2026-05-08",
    audienceSize: 248, responseCount: 107, overallScore: 68,
    questions: [
      { id: "q6", text: "How happy are you at work this week?", type: "rating" },
      { id: "q7", text: "Do you feel supported by your manager?", type: "rating" },
      { id: "q8", text: "Is your workload sustainable?", type: "rating" },
      { id: "q9", text: "Do you have what you need to do your best work?", type: "yesno" },
      { id: "q10", text: "Anything you'd like leadership to know?", type: "text" },
    ],
    results: [
      { questionId: "q6", avgScore: 3.9, responses: [{ score: 1, count: 4 }, { score: 2, count: 10 }, { score: 3, count: 24 }, { score: 4, count: 41 }, { score: 5, count: 28 }] },
      { questionId: "q7", avgScore: 4.0, responses: [{ score: 1, count: 3 }, { score: 2, count: 11 }, { score: 3, count: 22 }, { score: 4, count: 39 }, { score: 5, count: 32 }] },
      { questionId: "q8", avgScore: 3.1, responses: [{ score: 1, count: 12 }, { score: 2, count: 18 }, { score: 3, count: 32 }, { score: 4, count: 28 }, { score: 5, count: 17 }] },
      { questionId: "q9", avgScore: 71, responses: [{ score: 1, count: 76 }, { score: 0, count: 31 }] },
      { questionId: "q10", avgScore: 0, responses: [] },
    ],
  },
  {
    id: "s3", title: "May Week 2 Pulse", type: "pulse", status: "scheduled",
    createdAt: "2026-04-25", launchDate: "2026-05-08", closeDate: "2026-05-15",
    audienceSize: 248, responseCount: 0, overallScore: 0,
    questions: [
      { id: "q11", text: "How happy are you at work this week?", type: "rating" },
      { id: "q12", text: "Do you feel supported by your manager?", type: "rating" },
      { id: "q13", text: "Is your workload sustainable?", type: "rating" },
      { id: "q14", text: "Do you have what you need to do your best work?", type: "yesno" },
      { id: "q15", text: "Anything you'd like leadership to know?", type: "text" },
    ],
    results: [],
  },
  // Lifecycle
  {
    id: "s4", title: "Q1 Onboarding Survey", type: "lifecycle", status: "completed",
    createdAt: "2026-01-05", launchDate: "2026-03-01", closeDate: "2026-03-15",
    audienceSize: 18, responseCount: 17, overallScore: 81,
    questions: [
      { id: "q16", text: "Did your onboarding meet expectations?", type: "rating" },
      { id: "q17", text: "Did you have the tools and access you needed on day 1?", type: "yesno" },
      { id: "q18", text: "What could have made onboarding better?", type: "text" },
    ],
    results: [
      { questionId: "q16", avgScore: 4.4, responses: [{ score: 3, count: 2 }, { score: 4, count: 6 }, { score: 5, count: 9 }] },
      { questionId: "q17", avgScore: 88, responses: [{ score: 1, count: 15 }, { score: 0, count: 2 }] },
      { questionId: "q18", avgScore: 0, responses: [], textResponses: [
        "More structured intro to cross-functional partners would be helpful.",
        "Would love a 30-day buddy assignment for non-technical questions.",
      ] },
    ],
  },
  {
    id: "s5", title: "30-Day Check-in — Engineering Cohort", type: "lifecycle", status: "completed",
    createdAt: "2026-03-15", launchDate: "2026-04-01", closeDate: "2026-04-08",
    audienceSize: 6, responseCount: 6, overallScore: 79,
    questions: [
      { id: "q19", text: "Are you finding your role engaging?", type: "rating" },
      { id: "q20", text: "Do you have a clear understanding of expectations?", type: "rating" },
      { id: "q21", text: "What's going well?", type: "text" },
    ],
    results: [
      { questionId: "q19", avgScore: 4.2, responses: [{ score: 4, count: 4 }, { score: 5, count: 2 }] },
      { questionId: "q20", avgScore: 3.8, responses: [{ score: 3, count: 2 }, { score: 4, count: 3 }, { score: 5, count: 1 }] },
      { questionId: "q21", avgScore: 0, responses: [], textResponses: [
        "Mentorship has been really strong.",
        "Pairing culture is great for ramp-up.",
      ] },
    ],
  },
  {
    id: "s6", title: "Exit Interview — April", type: "lifecycle", status: "completed",
    createdAt: "2026-04-01", launchDate: "2026-04-01", closeDate: "2026-04-30",
    audienceSize: 2, responseCount: 2, overallScore: 58,
    questions: [
      { id: "q22", text: "What is your primary reason for leaving?", type: "text" },
      { id: "q23", text: "Would you recommend Acme as an employer?", type: "rating" },
      { id: "q24", text: "What could we have done better?", type: "text" },
    ],
    results: [
      { questionId: "q22", avgScore: 0, responses: [], textResponses: [
        "Career growth — couldn't find a clear path internally.",
        "Compensation didn't keep up with market.",
      ] },
      { questionId: "q23", avgScore: 3.0, responses: [{ score: 2, count: 1 }, { score: 4, count: 1 }] },
      { questionId: "q24", avgScore: 0, responses: [], textResponses: [
        "More transparency on promotion criteria.",
        "Faster comp reviews.",
      ] },
    ],
  },
  // Custom
  {
    id: "s7", title: "Manager Effectiveness Q1", type: "custom", status: "completed",
    createdAt: "2026-03-01", launchDate: "2026-03-15", closeDate: "2026-03-29",
    audienceSize: 230, responseCount: 184, overallScore: 71,
    questions: [
      { id: "q25", text: "My manager gives me useful feedback.", type: "rating" },
      { id: "q26", text: "My manager helps me grow professionally.", type: "rating" },
      { id: "q27", text: "I trust my manager.", type: "rating" },
    ],
    results: [
      { questionId: "q25", avgScore: 3.7, responses: [{ score: 1, count: 6 }, { score: 2, count: 18 }, { score: 3, count: 38 }, { score: 4, count: 81 }, { score: 5, count: 41 }] },
      { questionId: "q26", avgScore: 3.4, responses: [{ score: 1, count: 11 }, { score: 2, count: 28 }, { score: 3, count: 42 }, { score: 4, count: 65 }, { score: 5, count: 38 }] },
      { questionId: "q27", avgScore: 4.1, responses: [{ score: 1, count: 4 }, { score: 2, count: 12 }, { score: 3, count: 22 }, { score: 4, count: 76 }, { score: 5, count: 70 }] },
    ],
  },
  {
    id: "s8", title: "Benefits Satisfaction", type: "custom", status: "completed",
    createdAt: "2026-02-15", launchDate: "2026-03-01", closeDate: "2026-03-08",
    audienceSize: 248, responseCount: 191, overallScore: 65,
    questions: [
      { id: "q28", text: "How satisfied are you with our health benefits?", type: "rating" },
      { id: "q29", text: "How satisfied are you with our PTO policy?", type: "rating" },
      { id: "q30", text: "What benefits would you like added?", type: "text" },
    ],
    results: [
      { questionId: "q28", avgScore: 3.5, responses: [{ score: 2, count: 18 }, { score: 3, count: 51 }, { score: 4, count: 78 }, { score: 5, count: 44 }] },
      { questionId: "q29", avgScore: 3.2, responses: [{ score: 1, count: 14 }, { score: 2, count: 32 }, { score: 3, count: 58 }, { score: 4, count: 51 }, { score: 5, count: 36 }] },
      { questionId: "q30", avgScore: 0, responses: [], textResponses: [
        "Mental health support / therapy stipend.",
        "Better parental leave for partners.",
        "Wellness stipend for gym/equipment.",
      ] },
    ],
  },
  {
    id: "s9", title: "Remote Work Policy Feedback", type: "custom", status: "active",
    createdAt: "2026-04-15", launchDate: "2026-04-22", closeDate: "2026-05-06",
    audienceSize: 248, responseCount: 132, overallScore: 0,
    questions: [
      { id: "q31", text: "Do you support our current 3-days-in-office policy?", type: "rating" },
      { id: "q32", text: "Open comments on remote work?", type: "text" },
    ],
    results: [],
  },
  {
    id: "s10", title: "L&D Needs Assessment", type: "custom", status: "draft",
    createdAt: "2026-05-01", launchDate: "2026-05-15", closeDate: "2026-05-29",
    audienceSize: 248, responseCount: 0, overallScore: 0,
    questions: [
      { id: "q33", text: "Which skills do you most want to develop?", type: "text" },
      { id: "q34", text: "How satisfied are you with current learning opportunities?", type: "rating" },
    ],
    results: [],
  },
];

export const surveyTemplates: SurveyTemplate[] = [
  { id: "tpl1", name: "Employee NPS",        description: "Single-question loyalty score with optional follow-up.", questionCount: 2, category: "Loyalty" },
  { id: "tpl2", name: "Manager Effectiveness", description: "Measure managerial support, growth, and trust.",         questionCount: 8, category: "Leadership" },
  { id: "tpl3", name: "Onboarding Experience", description: "30/60/90-day cadence for new joiners.",                  questionCount: 10, category: "Lifecycle" },
  { id: "tpl4", name: "Exit Interview",       description: "Reasons for leaving and improvement signals.",            questionCount: 12, category: "Lifecycle" },
  { id: "tpl5", name: "Remote Work Pulse",    description: "Sentiment on flexibility, productivity, and connection.", questionCount: 6, category: "Work Style" },
  { id: "tpl6", name: "DEI Climate Check",    description: "Belonging, inclusion, and psychological safety.",         questionCount: 9, category: "Culture" },
];

// ─── OKRs & Goals ────────────────────────────────────────────────────────────

export const okrs: OKR[] = [
  // Company (2)
  {
    id: "ok1", title: "Reach 1,000 active users by end of Q2", type: "company", owner: "Diego Hernandez",
    ownerDept: "Product", quarter: "Q2 2026", status: "on-track", progress: 68, parentId: null, linkedRecognitions: 12,
    keyResults: [
      { id: "kr1", title: "Increase weekly active users",       target: 1000, current: 682, unit: "users",    progress: 68, status: "on-track" },
      { id: "kr2", title: "Convert trial-to-paid",               target: 25,   current: 18,  unit: "%",        progress: 72, status: "on-track" },
      { id: "kr3", title: "Reduce day-7 retention drop",         target: 30,   current: 24,  unit: "%",        progress: 80, status: "on-track" },
    ],
  },
  {
    id: "ok2", title: "Reduce annual customer churn to under 5%", type: "company", owner: "Olivia Carter",
    ownerDept: "Customer Success", quarter: "Q2 2026", status: "at-risk", progress: 42, parentId: null, linkedRecognitions: 4,
    keyResults: [
      { id: "kr4", title: "Reduce monthly logo churn",         target: 5,    current: 7.2, unit: "%",  progress: 38, status: "at-risk" },
      { id: "kr5", title: "Improve NPS",                       target: 55,   current: 41,  unit: "NPS", progress: 45, status: "at-risk" },
      { id: "kr6", title: "Expand seat-based revenue",         target: 1.2,  current: 0.5, unit: "$M",  progress: 42, status: "at-risk" },
    ],
  },
  // Team (4)
  {
    id: "ok3", title: "Ship Mobile v2.0", type: "team", owner: "Rahul Menon", ownerDept: "Engineering",
    quarter: "Q2 2026", status: "on-track", progress: 72, parentId: "ok1", linkedRecognitions: 8,
    keyResults: [
      { id: "kr7", title: "Submit to App Store",               target: 1,    current: 0,   unit: "release", progress: 60, status: "on-track" },
      { id: "kr8", title: "Crash-free sessions",               target: 99.9, current: 99.6, unit: "%",        progress: 80, status: "on-track" },
      { id: "kr9", title: "Beta cohort coverage",              target: 200,  current: 156, unit: "users",    progress: 78, status: "on-track" },
    ],
  },
  {
    id: "ok4", title: "Launch 3 new revenue features", type: "team", owner: "Diego Hernandez",
    ownerDept: "Product", quarter: "Q2 2026", status: "on-track", progress: 67, parentId: "ok1", linkedRecognitions: 6,
    keyResults: [
      { id: "kr10", title: "Ship billing redesign",             target: 1, current: 0, unit: "feature", progress: 55, status: "on-track" },
      { id: "kr11", title: "Ship referral program",             target: 1, current: 1, unit: "feature", progress: 100, status: "completed" },
      { id: "kr12", title: "Ship enterprise SSO",               target: 1, current: 0, unit: "feature", progress: 45, status: "at-risk" },
    ],
  },
  {
    id: "ok5", title: "Grow organic traffic 40%", type: "team", owner: "Tomás Reyes",
    ownerDept: "Marketing", quarter: "Q2 2026", status: "at-risk", progress: 35, parentId: "ok1", linkedRecognitions: 2,
    keyResults: [
      { id: "kr13", title: "Increase organic sessions",         target: 40,   current: 14,  unit: "%",   progress: 35, status: "at-risk" },
      { id: "kr14", title: "Earn high-DR backlinks",            target: 30,   current: 12,  unit: "links", progress: 40, status: "at-risk" },
    ],
  },
  {
    id: "ok6", title: "Close 20 enterprise deals", type: "team", owner: "Olivia Carter",
    ownerDept: "Sales", quarter: "Q2 2026", status: "off-track", progress: 25, parentId: "ok2", linkedRecognitions: 3,
    keyResults: [
      { id: "kr15", title: "Closed-won enterprise deals",       target: 20,   current: 5,   unit: "deals", progress: 25, status: "off-track" },
      { id: "kr16", title: "Pipeline coverage",                 target: 4,    current: 2.1, unit: "x",     progress: 53, status: "at-risk" },
    ],
  },
  // Individual (9)
  {
    id: "ok7", title: "Lead auth refactor to ship by May", type: "individual", owner: "Priya Nair",
    ownerDept: "Engineering", quarter: "Q2 2026", status: "on-track", progress: 75, parentId: "ok3", linkedRecognitions: 5,
    keyResults: [
      { id: "kr17", title: "Refactored services migrated",      target: 8,   current: 6, unit: "services", progress: 75, status: "on-track" },
      { id: "kr18", title: "Error rate post-migration",         target: 0.1, current: 0.12, unit: "%",     progress: 80, status: "on-track" },
    ],
  },
  {
    id: "ok8", title: "Reduce p95 latency by 30%", type: "individual", owner: "Wei Zhang",
    ownerDept: "Engineering", quarter: "Q2 2026", status: "on-track", progress: 90, parentId: "ok3", linkedRecognitions: 7,
    keyResults: [
      { id: "kr19", title: "p95 latency reduction",             target: 30,   current: 27,  unit: "%", progress: 90, status: "on-track" },
      { id: "kr20", title: "Deploy caching layer to all services", target: 12, current: 9, unit: "services", progress: 75, status: "on-track" },
    ],
  },
  {
    id: "ok9", title: "Ship onboarding redesign", type: "individual", owner: "Carla Mendes",
    ownerDept: "Design", quarter: "Q2 2026", status: "on-track", progress: 80, parentId: "ok4", linkedRecognitions: 4,
    keyResults: [
      { id: "kr21", title: "Onboarding flow ship",              target: 1,   current: 1, unit: "release", progress: 100, status: "completed" },
      { id: "kr22", title: "Day-1 activation lift",             target: 15,  current: 9, unit: "%", progress: 60, status: "on-track" },
    ],
  },
  {
    id: "ok10", title: "Run 12 user-research sessions", type: "individual", owner: "Ananya Sharma",
    ownerDept: "Product", quarter: "Q2 2026", status: "at-risk", progress: 50, parentId: "ok4", linkedRecognitions: 1,
    keyResults: [
      { id: "kr23", title: "Sessions run",                      target: 12,  current: 5, unit: "sessions", progress: 42, status: "at-risk" },
      { id: "kr24", title: "Insight reports published",         target: 4,   current: 2, unit: "reports", progress: 50, status: "at-risk" },
    ],
  },
  {
    id: "ok11", title: "Deliver Q2 content engine", type: "individual", owner: "Jonas Lindstrom",
    ownerDept: "Marketing", quarter: "Q2 2026", status: "on-track", progress: 70, parentId: "ok5", linkedRecognitions: 3,
    keyResults: [
      { id: "kr25", title: "Long-form articles published",      target: 18,  current: 12, unit: "articles", progress: 67, status: "on-track" },
      { id: "kr26", title: "Webinars run",                      target: 4,   current: 3,  unit: "webinars", progress: 75, status: "on-track" },
    ],
  },
  {
    id: "ok12", title: "Reduce technical SEO debt", type: "individual", owner: "Amir Khan",
    ownerDept: "Marketing", quarter: "Q2 2026", status: "off-track", progress: 28, parentId: "ok5", linkedRecognitions: 1,
    keyResults: [
      { id: "kr27", title: "P0 SEO issues resolved",            target: 25,  current: 7, unit: "issues", progress: 28, status: "off-track" },
    ],
  },
  {
    id: "ok13", title: "Hit personal sales quota", type: "individual", owner: "Sara Patel",
    ownerDept: "Sales", quarter: "Q2 2026", status: "on-track", progress: 85, parentId: "ok6", linkedRecognitions: 2,
    keyResults: [
      { id: "kr28", title: "Closed-won revenue",                target: 250, current: 212, unit: "$k", progress: 85, status: "on-track" },
      { id: "kr29", title: "Net-new logos",                     target: 6,   current: 5,   unit: "logos", progress: 83, status: "on-track" },
    ],
  },
  {
    id: "ok14", title: "Build customer health dashboard", type: "individual", owner: "Natalie Brooks",
    ownerDept: "Customer Success", quarter: "Q2 2026", status: "on-track", progress: 65, parentId: "ok2", linkedRecognitions: 2,
    keyResults: [
      { id: "kr30", title: "Health-score model live",           target: 1,   current: 0,   unit: "model", progress: 50, status: "on-track" },
      { id: "kr31", title: "Account managers onboarded",        target: 12,  current: 9,   unit: "AMs",   progress: 75, status: "on-track" },
    ],
  },
  {
    id: "ok15", title: "Stabilize CI/CD pipeline", type: "individual", owner: "Mei Lin",
    ownerDept: "Engineering", quarter: "Q2 2026", status: "completed", progress: 100, parentId: "ok3", linkedRecognitions: 4,
    keyResults: [
      { id: "kr32", title: "Pipeline migrated",                 target: 1,   current: 1,   unit: "pipeline", progress: 100, status: "completed" },
      { id: "kr33", title: "Mean time-to-deploy",               target: 15,  current: 12,  unit: "min",      progress: 100, status: "completed" },
    ],
  },
];

// ─── Performance Reviews ─────────────────────────────────────────────────────

const midYearCompetencies: ReviewCompetency[] = [
  { id: "c1", name: "Communication",          description: "Clear, timely, and constructive verbal and written communication." },
  { id: "c2", name: "Collaboration",          description: "Effective teamwork, conflict resolution, and cross-functional partnership." },
  { id: "c3", name: "Technical Excellence",   description: "Mastery and continuous improvement of craft and domain skills." },
  { id: "c4", name: "Ownership & Initiative", description: "Proactively identifies, drives, and finishes work end-to-end." },
  { id: "c5", name: "Growth Mindset",         description: "Seeks feedback, embraces learning, recovers from setbacks." },
  { id: "c6", name: "Impact & Results",       description: "Drives outcomes that matter to customers and the business." },
];

export const reviewCycles: ReviewCycle[] = [
  {
    id: "rc1", name: "Annual Review 2025", type: "annual", status: "completed",
    startDate: "2025-12-01", endDate: "2026-01-31", dueDate: "2026-01-31",
    reviewTypes: ["self", "manager", "peer", "upward"],
    participants: 245, completionRate: 94,
    competencies: [
      { id: "c1", name: "Communication", description: "Clear, timely communication." },
      { id: "c2", name: "Collaboration", description: "Effective teamwork." },
      { id: "c3", name: "Technical Excellence", description: "Mastery of craft." },
      { id: "c4", name: "Ownership & Initiative", description: "Drives work end-to-end." },
      { id: "c5", name: "Growth Mindset", description: "Seeks feedback and grows." },
      { id: "c6", name: "Impact & Results", description: "Drives outcomes." },
      { id: "c7", name: "Leadership", description: "Models and inspires high standards." },
    ],
  },
  {
    id: "rc2", name: "Mid-Year Review H1 2026", type: "mid-year", status: "active",
    startDate: "2026-05-01", endDate: "2026-05-31", dueDate: "2026-05-31",
    reviewTypes: ["self", "manager"],
    participants: 42, completionRate: 61,
    competencies: midYearCompetencies,
  },
  {
    id: "rc3", name: "Q1 Probation Reviews", type: "probation", status: "active",
    startDate: "2026-04-01", endDate: "2026-04-30", dueDate: "2026-04-30",
    reviewTypes: ["manager"],
    participants: 5, completionRate: 80,
    competencies: [
      { id: "c1", name: "Communication", description: "Clear, timely communication." },
      { id: "c4", name: "Ownership & Initiative", description: "Drives work end-to-end." },
      { id: "c6", name: "Impact & Results", description: "Drives outcomes." },
    ],
  },
];

export const reviewSubmissions: ReviewSubmission[] = [
  // 8 submitted
  {
    id: "rs1", cycleId: "rc2", revieweeId: "e1", revieweeName: "Priya Nair", revieweeDept: "Engineering",
    reviewerId: "e1", reviewerName: "Priya Nair", reviewType: "self",
    status: "submitted", submittedAt: "2026-05-08T16:00:00Z",
    overallRating: 4, overallComment: "Strong half — shipped auth refactor and unblocked design dependencies. Want to grow systems-design depth.",
    ratings: [
      { competencyId: "c1", score: 4, comment: "Tightened async updates this quarter." },
      { competencyId: "c2", score: 4, comment: "Strong cross-team partnership with design." },
      { competencyId: "c3", score: 4, comment: "Auth refactor was a major architecture win." },
      { competencyId: "c4", score: 5, comment: "End-to-end ownership of migration." },
      { competencyId: "c5", score: 4, comment: "Took feedback on RFC structure." },
      { competencyId: "c6", score: 4, comment: "Migration unblocked downstream teams." },
    ],
    lastActiveAt: "2026-05-08T16:00:00Z",
  },
  {
    id: "rs2", cycleId: "rc2", revieweeId: "e1", revieweeName: "Priya Nair", revieweeDept: "Engineering",
    reviewerId: "m1", reviewerName: "Rahul Menon", reviewType: "manager",
    status: "submitted", submittedAt: "2026-05-09T11:00:00Z",
    overallRating: 4, overallComment: "Priya delivered well above expectations on auth refactor. Growth area: scope-of-impact beyond own team.",
    ratings: [
      { competencyId: "c1", score: 4, comment: "Clear and proactive." },
      { competencyId: "c2", score: 4, comment: "Trusted partner across squads." },
      { competencyId: "c3", score: 5, comment: "Architectural depth shows." },
      { competencyId: "c4", score: 5, comment: "Took initiative without waiting." },
      { competencyId: "c5", score: 4, comment: "Open to feedback, applies it." },
      { competencyId: "c6", score: 4, comment: "Unblocked critical path work." },
    ],
    lastActiveAt: "2026-05-09T11:00:00Z",
  },
  {
    id: "rs3", cycleId: "rc2", revieweeId: "e2", revieweeName: "Wei Zhang", revieweeDept: "Engineering",
    reviewerId: "e2", reviewerName: "Wei Zhang", reviewType: "self",
    status: "submitted", submittedAt: "2026-05-07T18:30:00Z",
    overallRating: 4, overallComment: "Hit latency goals. Want to stretch into platform leadership.",
    ratings: [
      { competencyId: "c1", score: 3, comment: "Working on more proactive comms." },
      { competencyId: "c2", score: 4, comment: "Solid cross-team partnerships." },
      { competencyId: "c3", score: 5, comment: "Caching architecture is staff-level work." },
      { competencyId: "c4", score: 5, comment: "Owned the latency program." },
      { competencyId: "c5", score: 4, comment: "Growing into mentorship." },
      { competencyId: "c6", score: 5, comment: "Material p95 latency reduction." },
    ],
    lastActiveAt: "2026-05-07T18:30:00Z",
  },
  {
    id: "rs4", cycleId: "rc2", revieweeId: "e2", revieweeName: "Wei Zhang", revieweeDept: "Engineering",
    reviewerId: "m1", reviewerName: "Rahul Menon", reviewType: "manager",
    status: "submitted", submittedAt: "2026-05-09T13:00:00Z",
    overallRating: 5, overallComment: "Wei's latency work is some of the highest-impact engineering this year. Promotion case is strong.",
    ratings: [
      { competencyId: "c1", score: 4, comment: "Improving consistently — better written async updates." },
      { competencyId: "c2", score: 4, comment: "Increasingly trusted partner across teams." },
      { competencyId: "c3", score: 5, comment: "Distinguished technical depth." },
      { competencyId: "c4", score: 5, comment: "Defines the bar for ownership." },
      { competencyId: "c5", score: 4, comment: "Embracing mentorship rep." },
      { competencyId: "c6", score: 5, comment: "Massive measurable impact." },
    ],
    lastActiveAt: "2026-05-09T13:00:00Z",
  },
  {
    id: "rs5", cycleId: "rc2", revieweeId: "e7", revieweeName: "Lina Park", revieweeDept: "Product",
    reviewerId: "e7", reviewerName: "Lina Park", reviewType: "self",
    status: "submitted", submittedAt: "2026-05-06T15:30:00Z",
    overallRating: 4, overallComment: "Strong shipping cadence. Growth area: longer-term strategic thinking.",
    ratings: [
      { competencyId: "c1", score: 4, comment: "Stakeholder comms have tightened." },
      { competencyId: "c2", score: 5, comment: "Trusted partner with eng + design." },
      { competencyId: "c3", score: 4, comment: "Strong product craft." },
      { competencyId: "c4", score: 4, comment: "Drove A/B framework." },
      { competencyId: "c5", score: 4, comment: "Actively applying mentorship feedback." },
      { competencyId: "c6", score: 4, comment: "Shipped meaningful payments work." },
    ],
    lastActiveAt: "2026-05-06T15:30:00Z",
  },
  {
    id: "rs6", cycleId: "rc2", revieweeId: "e7", revieweeName: "Lina Park", revieweeDept: "Product",
    reviewerId: "m2", reviewerName: "Diego Hernandez", reviewType: "manager",
    status: "submitted", submittedAt: "2026-05-09T16:30:00Z",
    overallRating: 4, overallComment: "Lina is performing well. To grow into staff PM, will need to lengthen strategic horizon.",
    ratings: [
      { competencyId: "c1", score: 4, comment: "Clear and structured." },
      { competencyId: "c2", score: 5, comment: "Strong cross-functional collaborator." },
      { competencyId: "c3", score: 4, comment: "Solid product craft." },
      { competencyId: "c4", score: 4, comment: "Drives initiatives well." },
      { competencyId: "c5", score: 4, comment: "Engaged with growth feedback." },
      { competencyId: "c6", score: 4, comment: "Material results from A/B program." },
    ],
    lastActiveAt: "2026-05-09T16:30:00Z",
  },
  {
    id: "rs7", cycleId: "rc2", revieweeId: "e8", revieweeName: "Carla Mendes", revieweeDept: "Design",
    reviewerId: "e8", reviewerName: "Carla Mendes", reviewType: "self",
    status: "submitted", submittedAt: "2026-05-05T19:00:00Z",
    overallRating: 4, overallComment: "Onboarding redesign was my highlight. Want more time on systems work.",
    ratings: [
      { competencyId: "c1", score: 4, comment: "Strong design rationale comms." },
      { competencyId: "c2", score: 5, comment: "Closely partnered with eng." },
      { competencyId: "c3", score: 4, comment: "Continues to grow craft." },
      { competencyId: "c4", score: 4, comment: "Self-directed audit kickoff." },
      { competencyId: "c5", score: 5, comment: "Eager learner." },
      { competencyId: "c6", score: 4, comment: "Activation lift from onboarding ship." },
    ],
    lastActiveAt: "2026-05-05T19:00:00Z",
  },
  {
    id: "rs8", cycleId: "rc2", revieweeId: "e9", revieweeName: "Jonas Lindstrom", revieweeDept: "Marketing",
    reviewerId: "m5", reviewerName: "Tomás Reyes", reviewType: "manager",
    status: "submitted", submittedAt: "2026-05-10T10:00:00Z",
    overallRating: 5, overallComment: "Outstanding half — campaign delivery, earned media, mentorship of newer hires. Strong promotion case.",
    ratings: [
      { competencyId: "c1", score: 5, comment: "Excellent narrative comms." },
      { competencyId: "c2", score: 5, comment: "Cross-functional anchor." },
      { competencyId: "c3", score: 4, comment: "Sharp craft, growing into strategy." },
      { competencyId: "c4", score: 5, comment: "Owns campaigns end-to-end." },
      { competencyId: "c5", score: 5, comment: "Constantly raising the bar." },
      { competencyId: "c6", score: 5, comment: "Earned media coverage was a quarter-defining win." },
    ],
    lastActiveAt: "2026-05-10T10:00:00Z",
  },
  // 6 in-progress
  {
    id: "rs9", cycleId: "rc2", revieweeId: "e3", revieweeName: "Ananya Sharma", revieweeDept: "Product",
    reviewerId: "e3", reviewerName: "Ananya Sharma", reviewType: "self",
    status: "in-progress", submittedAt: null,
    overallRating: null, overallComment: null,
    ratings: [
      { competencyId: "c1", score: 4, comment: "Clearer roadmap comms this quarter." },
      { competencyId: "c2", score: 4, comment: "Working closer with design." },
      { competencyId: "c3", score: 0 as unknown as 1, comment: "" },
      { competencyId: "c4", score: 4, comment: "Drove discovery work." },
      { competencyId: "c5", score: 0 as unknown as 1, comment: "" },
      { competencyId: "c6", score: 0 as unknown as 1, comment: "" },
    ],
    lastActiveAt: "2026-05-09T11:30:00Z",
  },
  {
    id: "rs10", cycleId: "rc2", revieweeId: "e3", revieweeName: "Ananya Sharma", revieweeDept: "Product",
    reviewerId: "m2", reviewerName: "Diego Hernandez", reviewType: "manager",
    status: "in-progress", submittedAt: null,
    overallRating: null, overallComment: null, ratings: [],
    lastActiveAt: "2026-05-08T14:00:00Z",
  },
  {
    id: "rs11", cycleId: "rc2", revieweeId: "e6", revieweeName: "Mei Lin", revieweeDept: "Engineering",
    reviewerId: "e6", reviewerName: "Mei Lin", reviewType: "self",
    status: "in-progress", submittedAt: null,
    overallRating: null, overallComment: null, ratings: [],
    lastActiveAt: "2026-05-09T08:00:00Z",
  },
  {
    id: "rs12", cycleId: "rc2", revieweeId: "e4", revieweeName: "James O'Brien", revieweeDept: "Sales",
    reviewerId: "m3", reviewerName: "Olivia Carter", reviewType: "manager",
    status: "in-progress", submittedAt: null,
    overallRating: null, overallComment: null, ratings: [],
    lastActiveAt: "2026-05-09T16:00:00Z",
  },
  {
    id: "rs13", cycleId: "rc2", revieweeId: "e10", revieweeName: "Amir Khan", revieweeDept: "Marketing",
    reviewerId: "e10", reviewerName: "Amir Khan", reviewType: "self",
    status: "in-progress", submittedAt: null,
    overallRating: null, overallComment: null, ratings: [],
    lastActiveAt: "2026-05-08T20:00:00Z",
  },
  {
    id: "rs14", cycleId: "rc2", revieweeId: "e12", revieweeName: "Ravi Iyer", revieweeDept: "Engineering",
    reviewerId: "m1", reviewerName: "Rahul Menon", reviewType: "manager",
    status: "in-progress", submittedAt: null,
    overallRating: null, overallComment: null, ratings: [],
    lastActiveAt: "2026-05-09T09:00:00Z",
  },
  // 4 not-started
  {
    id: "rs15", cycleId: "rc2", revieweeId: "e5", revieweeName: "Sara Patel", revieweeDept: "Sales",
    reviewerId: "e5", reviewerName: "Sara Patel", reviewType: "self",
    status: "not-started", submittedAt: null,
    overallRating: null, overallComment: null, ratings: [], lastActiveAt: null,
  },
  {
    id: "rs16", cycleId: "rc2", revieweeId: "e5", revieweeName: "Sara Patel", revieweeDept: "Sales",
    reviewerId: "m3", reviewerName: "Olivia Carter", reviewType: "manager",
    status: "not-started", submittedAt: null,
    overallRating: null, overallComment: null, ratings: [], lastActiveAt: null,
  },
  {
    id: "rs17", cycleId: "rc2", revieweeId: "e11", revieweeName: "Diego Hernandez", revieweeDept: "Product",
    reviewerId: "e11", reviewerName: "Diego Hernandez", reviewType: "self",
    status: "not-started", submittedAt: null,
    overallRating: null, overallComment: null, ratings: [], lastActiveAt: null,
  },
  {
    id: "rs18", cycleId: "rc2", revieweeId: "e12", revieweeName: "Ravi Iyer", revieweeDept: "Engineering",
    reviewerId: "e12", reviewerName: "Ravi Iyer", reviewType: "self",
    status: "not-started", submittedAt: null,
    overallRating: null, overallComment: null, ratings: [], lastActiveAt: null,
  },
  // 2 acknowledged
  {
    id: "rs19", cycleId: "rc2", revieweeId: "e6", revieweeName: "Mei Lin", revieweeDept: "Engineering",
    reviewerId: "m1", reviewerName: "Rahul Menon", reviewType: "manager",
    status: "acknowledged", submittedAt: "2026-05-08T13:00:00Z",
    overallRating: 5, overallComment: "Mei consistently delivers infrastructure improvements that lift the whole org. Ready for next level.",
    ratings: [
      { competencyId: "c1", score: 4, comment: "Crisp, technical comms." },
      { competencyId: "c2", score: 5, comment: "Goes out of way to support adjacent teams." },
      { competencyId: "c3", score: 5, comment: "CI/CD migration was textbook execution." },
      { competencyId: "c4", score: 5, comment: "Owned end-to-end." },
      { competencyId: "c5", score: 4, comment: "Active growth in mentorship." },
      { competencyId: "c6", score: 5, comment: "Org-wide deploy time wins." },
    ],
    lastActiveAt: "2026-05-09T10:00:00Z",
  },
  {
    id: "rs20", cycleId: "rc2", revieweeId: "e9", revieweeName: "Jonas Lindstrom", revieweeDept: "Marketing",
    reviewerId: "e9", reviewerName: "Jonas Lindstrom", reviewType: "self",
    status: "acknowledged", submittedAt: "2026-05-04T15:00:00Z",
    overallRating: 5, overallComment: "Best half I've had. Earned media pickup is a career milestone.",
    ratings: [
      { competencyId: "c1", score: 5, comment: "Storytelling is my edge." },
      { competencyId: "c2", score: 5, comment: "Tight collaboration with content team." },
      { competencyId: "c3", score: 4, comment: "Always sharpening narrative craft." },
      { competencyId: "c4", score: 5, comment: "Owned campaign top-to-bottom." },
      { competencyId: "c5", score: 5, comment: "Growing into strategy." },
      { competencyId: "c6", score: 5, comment: "Earned media + early launch is a rare double." },
    ],
    lastActiveAt: "2026-05-09T14:00:00Z",
  },
];
