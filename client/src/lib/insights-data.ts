import { FEED, type FeedKind, type RecognitionFeedItem, type BadgeKind } from "./mobile-data";

export type Period = "week" | "month" | "quarter" | "year";

export const PERIOD_LABEL: Record<Period, string> = {
  week: "Last 7 days",
  month: "This month",
  quarter: "This quarter",
  year: "This year",
};

export const PERIOD_DAYS: Record<Period, number> = {
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
};

export type InsightsKpis = {
  totalRecognitions: number;
  activeParticipants: number;
  participationRate: number;
  avgPerEmployee: number;
  totalDelta: number;
  participantsDelta: number;
  rateDelta: number;
  avgDelta: number;
};

export type TrendPoint = { date: string; recognitions: number };

export type BadgeStat = { label: string; count: number; badge: BadgeKind };

export type DepartmentStat = { name: string; given: number; received: number };

export type PersonStat = { name: string; avatar: string; count: number; role?: string };

export function getKpis(kind: FeedKind): InsightsKpis {
  const items = FEED.filter((f) => f.kind === kind);
  const total = items.length;
  const senders = new Set(items.map((i) => i.senderEmail));
  const recipients = new Set(items.map((i) => i.recipientEmail));
  const activeParticipants = new Set([...senders, ...recipients]).size;

  const workforce = 142;
  const participationRate = Math.round((activeParticipants / workforce) * 100);
  const avg = total > 0 ? Math.round((total / workforce) * 100) / 100 : 0;

  return {
    totalRecognitions: kind === "appreciation" ? 248 : 89,
    activeParticipants: kind === "appreciation" ? 116 : 47,
    participationRate: kind === "appreciation" ? 82 : 33,
    avgPerEmployee: kind === "appreciation" ? 1.74 : 0.62,
    totalDelta: kind === "appreciation" ? 18 : 24,
    participantsDelta: kind === "appreciation" ? 9 : 12,
    rateDelta: kind === "appreciation" ? 4 : 7,
    avgDelta: kind === "appreciation" ? 6 : 14,
  };
}

export function getTrend(kind: FeedKind, days: number): TrendPoint[] {
  const seed = kind === "appreciation" ? 7 : 3;
  const variance = kind === "appreciation" ? 5 : 3;
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const wave = Math.sin((i / days) * Math.PI * 2) * variance;
    const noise = ((i * 31 + (kind === "rnr" ? 11 : 7)) % 7) - 3;
    return {
      date: d.toISOString().slice(0, 10),
      recognitions: Math.max(0, Math.round(seed + wave + noise + (i / days) * 4)),
    };
  });
}

export function getTopBadges(kind: FeedKind): BadgeStat[] {
  const items = FEED.filter((f) => f.kind === kind);
  const counts = new Map<BadgeKind, { count: number; label: string }>();
  for (const item of items) {
    const cur = counts.get(item.badge);
    if (cur) cur.count++;
    else counts.set(item.badge, { count: 1, label: item.badgeLabel });
  }
  if (counts.size === 0) {
    return kind === "appreciation"
      ? [
          { label: "Game Changer", count: 64, badge: "game-changer" },
          { label: "Outcome Achiever", count: 51, badge: "outcome-achiever" },
          { label: "Execution Ninja", count: 47, badge: "execution-ninja" },
          { label: "Moment of Impact", count: 38, badge: "moment-impact" },
          { label: "Customer Hero", count: 22, badge: "custom-badge-name" },
        ]
      : [
          { label: "Customer Hero", count: 28, badge: "custom-badge-name" },
          { label: "Game Changer", count: 24, badge: "game-changer" },
          { label: "Outcome Achiever", count: 18, badge: "outcome-achiever" },
          { label: "Moment of Impact", count: 12, badge: "moment-impact" },
        ];
  }
  return [...counts.entries()]
    .map(([badge, v]) => ({ badge, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count);
}

export function getDepartments(kind: FeedKind): DepartmentStat[] {
  return kind === "appreciation"
    ? [
        { name: "Engineering", given: 84, received: 72 },
        { name: "Product", given: 41, received: 53 },
        { name: "Design", given: 38, received: 28 },
        { name: "Sales", given: 47, received: 51 },
        { name: "Customer Success", given: 22, received: 31 },
        { name: "People Ops", given: 16, received: 13 },
      ]
    : [
        { name: "Engineering", given: 22, received: 18 },
        { name: "Product", given: 14, received: 21 },
        { name: "Design", given: 10, received: 8 },
        { name: "Sales", given: 26, received: 28 },
        { name: "Customer Success", given: 9, received: 14 },
      ];
}

export function getTopPeople(
  kind: FeedKind,
  type: "givers" | "receivers",
): PersonStat[] {
  const samples: { name: string; avatar: string; role: string; givers: number; receivers: number; rnrGivers: number; rnrReceivers: number }[] = [
    { name: "Ronald Richards", avatar: "/m/images/user01.png", role: "Chief Technology Officer", givers: 22, receivers: 31, rnrGivers: 8, rnrReceivers: 14 },
    { name: "Courtney Henry", avatar: "/m/images/user02.png", role: "Delivery Head", givers: 19, receivers: 27, rnrGivers: 6, rnrReceivers: 11 },
    { name: "Albert Flores", avatar: "/m/images/user03.png", role: "Sr Software Engineer", givers: 17, receivers: 24, rnrGivers: 5, rnrReceivers: 9 },
    { name: "Dianne Russell", avatar: "/m/images/user04.png", role: "UI Designer", givers: 14, receivers: 22, rnrGivers: 4, rnrReceivers: 8 },
    { name: "Robert Fox", avatar: "/m/images/user05.png", role: "Director", givers: 12, receivers: 18, rnrGivers: 3, rnrReceivers: 7 },
  ];
  return samples
    .map((s) => ({
      name: s.name,
      avatar: s.avatar,
      role: s.role,
      count:
        kind === "appreciation"
          ? type === "givers"
            ? s.givers
            : s.receivers
          : type === "givers"
            ? s.rnrGivers
            : s.rnrReceivers,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getRecentActivity(kind: FeedKind, limit = 8): RecognitionFeedItem[] {
  return FEED.filter((f) => f.kind === kind).slice(0, limit);
}
