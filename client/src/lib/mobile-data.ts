export type BadgeKind =
  | "game-changer"
  | "outcome-achiever"
  | "execution-ninja"
  | "moment-impact"
  | "custom-badge-name";

export type FeedKind = "appreciation" | "rnr";

export type RecognitionFeedItem = {
  id: string;
  kind: FeedKind;
  senderName: string;
  senderAvatar: string;
  senderEmail: string;
  recipientName: string;
  recipientAvatar: string;
  recipientEmail: string;
  timeAgo: string;
  badge: BadgeKind;
  badgeLabel: string;
  message: string;
  points?: number;
};

export const ME = "__me__";

export function isMe(emailOrToken: string, account: { adminEmail: string } | null | undefined): boolean {
  if (emailOrToken === ME) return true;
  if (!account) return false;
  return emailOrToken.toLowerCase() === account.adminEmail.toLowerCase();
}

export type LeaderboardEntry = {
  rank: number;
  name: string;
  role: string;
  points: number;
  avatar: string;
};

export const FEED: RecognitionFeedItem[] = [
  {
    id: "f1",
    kind: "appreciation",
    senderName: "Ralph Edwards",
    senderAvatar: "/m/images/user01.png",
    senderEmail: "ralph@example.com",
    recipientName: "You",
    recipientAvatar: "/m/images/user06.png",
    recipientEmail: ME,
    timeAgo: "9m ago",
    badge: "game-changer",
    badgeLabel: "Game Changer",
    message: "Amazing work on turning the project around so fast! You really changed the game.",
  },
  {
    id: "f2",
    kind: "appreciation",
    senderName: "Ralph Edwards",
    senderAvatar: "/m/images/user03.png",
    senderEmail: "ralph@example.com",
    recipientName: "James Wilson",
    recipientAvatar: "/m/images/user07.png",
    recipientEmail: "james@example.com",
    timeAgo: "1h ago",
    badge: "outcome-achiever",
    badgeLabel: "Outcome Achiever",
    message: "Amazing work on turning the project around so fast! You really changed the game.",
  },
  {
    id: "f3",
    kind: "appreciation",
    senderName: "Courtney Henry",
    senderAvatar: "/m/images/user02.png",
    senderEmail: "courtney@example.com",
    recipientName: "You",
    recipientAvatar: "/m/images/user06.png",
    recipientEmail: ME,
    timeAgo: "9m ago",
    badge: "moment-impact",
    badgeLabel: "Moment of Impact",
    message: "The way you ran the kickoff yesterday set the tone for the whole project — appreciate it.",
  },
  {
    id: "f4",
    kind: "appreciation",
    senderName: "Ralph Edwards",
    senderAvatar: "/m/images/user04.png",
    senderEmail: "ralph@example.com",
    recipientName: "Dianne Russell",
    recipientAvatar: "/m/images/user05.png",
    recipientEmail: "dianne@example.com",
    timeAgo: "1h ago",
    badge: "execution-ninja",
    badgeLabel: "Execution Ninja",
    message: "Amazing work on turning the project around so fast! You really changed the game.",
  },
  {
    id: "f5",
    kind: "rnr",
    senderName: "Sarah Chen",
    senderAvatar: "/m/images/user02.png",
    senderEmail: "sarah@example.com",
    recipientName: "You",
    recipientAvatar: "/m/images/user06.png",
    recipientEmail: ME,
    timeAgo: "2h ago",
    badge: "custom-badge-name",
    badgeLabel: "Customer Hero",
    message: "Going above and beyond on the customer escalation last week — you set the bar.",
    points: 250,
  },
  {
    id: "f6",
    kind: "rnr",
    senderName: "Mike Patel",
    senderAvatar: "/m/images/user04.png",
    senderEmail: "mike@example.com",
    recipientName: "Robert Fox",
    recipientAvatar: "/m/images/user03.png",
    recipientEmail: "robert@example.com",
    timeAgo: "5h ago",
    badge: "game-changer",
    badgeLabel: "Game Changer",
    message: "Closing the Q2 deal ahead of schedule changed the whole pipeline forecast.",
    points: 500,
  },
  {
    id: "f7",
    kind: "appreciation",
    senderName: "You",
    senderAvatar: "/m/images/user06.png",
    senderEmail: ME,
    recipientName: "Albert Flores",
    recipientAvatar: "/m/images/user03.png",
    recipientEmail: "albert@example.com",
    timeAgo: "1d ago",
    badge: "execution-ninja",
    badgeLabel: "Execution Ninja",
    message: "The pull request review you did this morning saved us a week of debugging. Thank you.",
  },
  {
    id: "f8",
    kind: "appreciation",
    senderName: "You",
    senderAvatar: "/m/images/user06.png",
    senderEmail: ME,
    recipientName: "Cristofer Botosh",
    recipientAvatar: "/m/images/user06.png",
    recipientEmail: "cristofer@example.com",
    timeAgo: "3d ago",
    badge: "outcome-achiever",
    badgeLabel: "Outcome Achiever",
    message: "Closed the deal with that picky stakeholder — masterclass in patience.",
  },
  {
    id: "f9",
    kind: "rnr",
    senderName: "You",
    senderAvatar: "/m/images/user06.png",
    senderEmail: ME,
    recipientName: "Dianne Russell",
    recipientAvatar: "/m/images/user05.png",
    recipientEmail: "dianne@example.com",
    timeAgo: "5d ago",
    badge: "moment-impact",
    badgeLabel: "Moment of Impact",
    message: "Your design review unblocked the entire mobile redesign — appreciate it.",
    points: 200,
  },
];

export type EarnedBadge = {
  badge: BadgeKind;
  label: string;
  earnedFrom: string;
  earnedDate: string;
};

export const MY_BADGES: EarnedBadge[] = [
  { badge: "game-changer", label: "Game Changer", earnedFrom: "Ralph Edwards", earnedDate: "2026-04-21" },
  { badge: "moment-impact", label: "Moment of Impact", earnedFrom: "Courtney Henry", earnedDate: "2026-04-15" },
  { badge: "custom-badge-name", label: "Customer Hero", earnedFrom: "Sarah Chen", earnedDate: "2026-03-30" },
];

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Ronald Richards", role: "Chief Technology Officer", points: 963, avatar: "/m/images/user01.png" },
  { rank: 2, name: "Courtney Henry", role: "Delivery Head", points: 890, avatar: "/m/images/user02.png" },
  { rank: 3, name: "Albert Flores", role: "Sr Software Engineer", points: 835, avatar: "/m/images/user03.png" },
  { rank: 4, name: "Dianne Russell", role: "UI designer", points: 825, avatar: "/m/images/user04.png" },
  { rank: 5, name: "Robert Fox", role: "Director", points: 790, avatar: "/m/images/user05.png" },
  { rank: 6, name: "Cristofer Botosh", role: "Director", points: 782, avatar: "/m/images/user06.png" },
  { rank: 7, name: "Talan Dias", role: "Director", points: 776, avatar: "/m/images/user07.png" },
  { rank: 8, name: "Gustavo Torff", role: "Director", points: 775, avatar: "/m/images/user01.png" },
  { rank: 9, name: "Charlie Kenter", role: "Director", points: 764, avatar: "/m/images/user02.png" },
  { rank: 10, name: "Miracle Bothman", role: "Director", points: 752, avatar: "/m/images/user03.png" },
];

export const MY_RANK = {
  rank: 12,
  points: 712,
};

export const BADGE_IMAGE: Record<BadgeKind, string> = {
  "game-changer": "/m/images/game-changer.png",
  "outcome-achiever": "/m/images/outcome-achiever.png",
  "execution-ninja": "/m/images/execution-ninja.png",
  "moment-impact": "/m/images/moment-impact.png",
  "custom-badge-name": "/m/images/custom-badge-name.png",
};
