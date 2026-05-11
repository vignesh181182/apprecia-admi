import type { Period } from "./insights-data";
import { PERIOD_DAYS } from "./insights-data";

export type TopWinner = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  programName: string;
};

export type AttentionItem = {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  body: string;
  href?: string;
};

export const TOP_WINNERS: TopWinner[] = [
  { id: "tw-1", name: "Ronald Richards", role: "Chief Technology Officer", avatar: "/m/images/user01.png", programName: "Employee of the Month" },
  { id: "tw-2", name: "Courtney Henry",  role: "Delivery Head",            avatar: "/m/images/user02.png", programName: "Peer-to-Peer Recognition" },
  { id: "tw-3", name: "Albert Flores",   role: "Senior Software Engineer", avatar: "/m/images/user03.png", programName: "Values Champion" },
  { id: "tw-4", name: "Dianne Russell",  role: "UI Designer",              avatar: "/m/images/user04.png", programName: "Appreciation" },
  { id: "tw-5", name: "Robert Fox",      role: "Director",                 avatar: "/m/images/user05.png", programName: "Years of Service" },
];

export const NEEDS_ATTENTION: AttentionItem[] = [
  { id: "na-1", severity: "high",   title: "Innovation Award Q2 closes in 2 days", body: "Review nominations before close",            href: "/m/programs/innovation-award" },
  { id: "na-2", severity: "medium", title: "Sales dept has 0 appreciations sent",  body: "18 employees — consider a nudge",            href: "/" },
  { id: "na-3", severity: "medium", title: "Tie in Employee of the Month",         body: "Rahul & James at 11 each — closes in 8 days", href: "/m/programs/employee-of-the-month" },
  { id: "na-4", severity: "high",   title: "Culture Champion has 0 nominations",   body: "Program active — no entries yet",            href: "/m/programs/culture-champion" },
];

export const APPROVAL_QUEUE = {
  pending: 7,
  oldestDays: 3,
};

export type RnRKpis = {
  recognitionsThisMonth: number;
  recognitionsDelta: number;
  activeParticipantsRate: number;
  activeParticipantsDelta: number;
  budgetUsedRate: number;
  budgetUsedDelta: number;
  activePrograms: number;
  activeProgramsDelta: number;
};

export function getRnRKpis(_: Period): RnRKpis {
  return {
    recognitionsThisMonth: 234,
    recognitionsDelta: 12,
    activeParticipantsRate: 71,
    activeParticipantsDelta: 12,
    budgetUsedRate: 72,
    budgetUsedDelta: 8,
    activePrograms: 6,
    activeProgramsDelta: 0,
  };
}

export type BudgetBurnPoint = { date: string; spent: number; pace: number };

export function getBudgetBurn(period: Period): BudgetBurnPoint[] {
  const days = PERIOD_DAYS[period];
  const annualBudget = 200000;
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const progress = (i + 1) / days;
    const accel = Math.min(1, progress + Math.sin((i / days) * Math.PI) * 0.05);
    return {
      date: d.toISOString().slice(0, 10),
      spent: Math.round(annualBudget * accel * 0.78),
      pace: Math.round(annualBudget * progress * 0.85),
    };
  });
}
