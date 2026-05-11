export type NotificationKind =
  | "recognition"
  | "rnr"
  | "redemption"
  | "team"
  | "rank";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  timeAgo: string;
  avatar?: string;
  unread: boolean;
  href?: string;
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    kind: "recognition",
    title: "Ralph Edwards appreciated you",
    body: "Game Changer · Amazing work on turning the project around so fast!",
    timeAgo: "9m ago",
    avatar: "/m/images/user01.png",
    unread: true,
    href: "/m",
  },
  {
    id: "n2",
    kind: "rnr",
    title: "Sarah Chen sent you 250 points",
    body: "Customer Hero · Going above and beyond on the customer escalation last week.",
    timeAgo: "2h ago",
    avatar: "/m/images/user02.png",
    unread: true,
    href: "/m?tab=rnr",
  },
  {
    id: "n3",
    kind: "recognition",
    title: "Courtney Henry appreciated you",
    body: "Moment of Impact · The way you ran the kickoff yesterday set the tone.",
    timeAgo: "5h ago",
    avatar: "/m/images/user02.png",
    unread: true,
    href: "/m",
  },
  {
    id: "n4",
    kind: "redemption",
    title: "Your redemption is on the way",
    body: "Lavie Sport 33L · Brown · 43 EU has been dispatched.",
    timeAgo: "Yesterday",
    unread: false,
    href: "/m/rewards",
  },
  {
    id: "n5",
    kind: "rank",
    title: "You climbed two ranks this week",
    body: "Now ranked #12 — 41 points away from breaking into the top 10.",
    timeAgo: "2d ago",
    unread: false,
    href: "/m/ranks",
  },
  {
    id: "n6",
    kind: "team",
    title: "Charlie Kenter joined your team",
    body: "Director — say hello and send some kudos.",
    timeAgo: "3d ago",
    avatar: "/m/images/user06.png",
    unread: false,
    href: "/m",
  },
];

export function getUnreadCount(): number {
  return NOTIFICATIONS.filter((n) => n.unread).length;
}
