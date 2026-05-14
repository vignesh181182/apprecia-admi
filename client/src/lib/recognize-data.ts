import type { BadgeKind } from "./mobile-data";
import { BADGE_IMAGE } from "./mobile-data";

export type Employee = {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  managerId?: string;
  businessUnitId?: string;
  businessUnitName?: string;
  functionLeadId?: string;
};

// Org chart for the mock employees:
// • Ralph Edwards (CTO) — top of Engineering/Product
// • Cristofer Botosh — Director, Engineering BU (function lead: ralph)
// • Talan Dias — Director, Design BU
// • Robert Fox — Director, Customer Success BU
// • Courtney Ralph — Delivery Head, reports to Cristofer
// • Courtney Henry — Delivery Head, reports to Robert
// • James Wilson — Product Manager, reports to Cristofer
// • Rahul / Albert — engineers under Courtney Ralph
// • Dianne — designer under Talan
export const EMPLOYEES: Employee[] = [
  { id: "u-ralph",      name: "Ralph Edwards",        role: "Chief Technology Officer", email: "ralph.edwards@example.com",    avatar: "/m/images/user01.png",
    businessUnitId: "bu-engineering", businessUnitName: "Engineering", functionLeadId: "u-ralph" },
  { id: "u-cristofer",  name: "Cristofer Botosh",     role: "Director",                 email: "cristofer.botosh@example.com", avatar: "/m/images/user06.png",
    managerId: "u-ralph", businessUnitId: "bu-engineering", businessUnitName: "Engineering", functionLeadId: "u-ralph" },
  { id: "u-talan",      name: "Talan Dias",           role: "Director",                 email: "talan.dias@example.com",       avatar: "/m/images/user07.png",
    managerId: "u-ralph", businessUnitId: "bu-design", businessUnitName: "Design", functionLeadId: "u-talan" },
  { id: "u-robert",     name: "Robert Fox",           role: "Director",                 email: "robert.fox@example.com",       avatar: "/m/images/user05.png",
    businessUnitId: "bu-customer-success", businessUnitName: "Customer Success", functionLeadId: "u-robert" },
  { id: "u-courtney",   name: "Courtney Ralph",       role: "Delivery Head",            email: "courtney.ralph@example.com",   avatar: "/m/images/user02.png",
    managerId: "u-cristofer", businessUnitId: "bu-engineering", businessUnitName: "Engineering", functionLeadId: "u-ralph" },
  { id: "u-courtney-h", name: "Courtney Henry",       role: "Delivery Head",            email: "courtney.henry@example.com",   avatar: "/m/images/user02.png",
    managerId: "u-robert", businessUnitId: "bu-customer-success", businessUnitName: "Customer Success", functionLeadId: "u-robert" },
  { id: "u-james",      name: "James Wilson",         role: "Product Manager",          email: "james.wilson@example.com",     avatar: "/m/images/user07.png",
    managerId: "u-cristofer", businessUnitId: "bu-engineering", businessUnitName: "Engineering", functionLeadId: "u-ralph" },
  { id: "u-rahul",      name: "Rahul Albert Floraes", role: "Sr Software Engineer",     email: "rahul.albert@example.com",     avatar: "/m/images/user03.png",
    managerId: "u-courtney", businessUnitId: "bu-engineering", businessUnitName: "Engineering", functionLeadId: "u-ralph" },
  { id: "u-albert",     name: "Albert Flores",        role: "Sr Software Engineer",     email: "albert.flores@example.com",    avatar: "/m/images/user03.png",
    managerId: "u-courtney", businessUnitId: "bu-engineering", businessUnitName: "Engineering", functionLeadId: "u-ralph" },
  { id: "u-dianne",     name: "Dianne Russell",       role: "UI Designer",              email: "dianne.russell@example.com",   avatar: "/m/images/user04.png",
    managerId: "u-talan", businessUnitId: "bu-design", businessUnitName: "Design", functionLeadId: "u-talan" },
];

export type RecognizeBadge = {
  id: string;
  label: string;
  description: string;
  emoji: string;
  badgeKind: BadgeKind;
};

export type BadgeCategory = {
  id: string;
  name: string;
  badges: RecognizeBadge[];
};

export const BADGE_CATEGORIES: BadgeCategory[] = [
  {
    id: "performance",
    name: "Performance & Impact",
    badges: [
      { id: "game-changer",     label: "Game Changer",     description: "Created measurable impact",       emoji: "🏆", badgeKind: "game-changer" },
      { id: "outcome-achiever", label: "Outcome Achiever", description: "Delivered beyond expectations",   emoji: "⚡", badgeKind: "outcome-achiever" },
      { id: "moment-impact",    label: "Moment of Impact", description: "Delivered when it mattered most", emoji: "✅", badgeKind: "moment-impact" },
      { id: "execution-ninja",  label: "Execution Ninja",  description: "Fast, flawless delivery",         emoji: "🥷", badgeKind: "execution-ninja" },
    ],
  },
  {
    id: "innovation",
    name: "Innovation & Thinking",
    badges: [
      { id: "sharp-thinking", label: "Sharp Thinking", description: "Smart, original thinking",     emoji: "🧠", badgeKind: "custom-badge-name" },
      { id: "unblocked-it",   label: "Unblocked It",   description: "Solved a tough challenge",     emoji: "🔒", badgeKind: "custom-badge-name" },
      { id: "fresh-approach", label: "Fresh Approach", description: "Tried something new",          emoji: "💡", badgeKind: "custom-badge-name" },
      { id: "future-builder", label: "Future Builder", description: "Thinking ahead, not sideways", emoji: "🔮", badgeKind: "custom-badge-name" },
    ],
  },
];

export function findBadge(id: string | undefined): RecognizeBadge | undefined {
  if (!id) return undefined;
  for (const cat of BADGE_CATEGORIES) {
    const b = cat.badges.find((x) => x.id === id);
    if (b) return b;
  }
  return undefined;
}

export function findEmployee(id: string | undefined): Employee | undefined {
  if (!id) return undefined;
  return EMPLOYEES.find((e) => e.id === id);
}

/**
 * Resolve the signed-in user to a seeded Employee record. Demo flows that
 * don't have a real authenticated employee yet fall back to the first row.
 */
export function currentEmployee(adminEmail?: string | null): Employee | undefined {
  if (!adminEmail) return EMPLOYEES[0];
  const match = EMPLOYEES.find((e) => e.email.toLowerCase() === adminEmail.toLowerCase());
  return match ?? EMPLOYEES[0];
}

export function badgeImage(badge: RecognizeBadge | undefined): string | undefined {
  if (!badge) return undefined;
  return BADGE_IMAGE[badge.badgeKind];
}

export const POINTS_PRESETS = [100, 250, 500, 1000];

export type PendingRecognition = {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
  badgeId: string;
  badgeLabel: string;
  badgeKind: BadgeKind;
  reason: string;
  points?: number;
  kind: "appreciation" | "rnr";
  status: "pending" | "approved";
  createdAt: string;
};

const KEY = "engagex_my_recognitions";

export function loadMyRecognitions(): PendingRecognition[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PendingRecognition[];
  } catch {
    return [];
  }
}

export function saveMyRecognition(rec: PendingRecognition): void {
  const all = loadMyRecognitions();
  all.unshift(rec);
  localStorage.setItem(KEY, JSON.stringify(all));
}
