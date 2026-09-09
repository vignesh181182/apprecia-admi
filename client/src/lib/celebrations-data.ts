// ──────────────────────────────────────────────────────────────────────
// Celebrations — birthdays, work anniversaries, wedding anniversaries and
// new joiners. These share the employee feed with appreciations but are not
// recognitions: nobody sends them, they simply come round on the calendar.
//
// Dates are generated relative to today so the demo feed always has something
// happening now. Wishes live in localStorage, mirroring `lib/reactions.ts`.
// ──────────────────────────────────────────────────────────────────────

export type CelebrationKind =
  | "birthday"
  | "work-anniversary"
  | "wedding-anniversary"
  | "welcome";

export type CelebrationItem = {
  id: string;
  kind: CelebrationKind;
  personName: string;
  personRole: string;
  personAvatar: string;
  personEmail: string;
  /** ISO date of this year's occurrence. Drives the “Today / in 3 days” label. */
  date: string;
  /** Milestone years — years of service, or years married. Unused otherwise. */
  years?: number;
  /** Wishes already on the card before the signed-in user adds theirs. */
  cheers: number;
};

// ── seed ──────────────────────────────────────────────────────────────

function inDaysIso(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const SEED: CelebrationItem[] = [
  {
    id: "cel-1",
    kind: "birthday",
    personName: "Dianne Russell",
    personRole: "UI Designer",
    personAvatar: "/m/images/user04.png",
    personEmail: "dianne@example.com",
    date: inDaysIso(0),
    cheers: 12,
  },
  {
    id: "cel-2",
    kind: "work-anniversary",
    personName: "Robert Fox",
    personRole: "Director",
    personAvatar: "/m/images/user11.png",
    personEmail: "robert@example.com",
    date: inDaysIso(0),
    years: 5,
    cheers: 23,
  },
  {
    id: "cel-3",
    kind: "wedding-anniversary",
    personName: "Aisha Patel",
    personRole: "People Partner",
    personAvatar: "/m/images/user06.png",
    personEmail: "aisha@example.com",
    date: inDaysIso(1),
    years: 3,
    cheers: 7,
  },
  {
    id: "cel-4",
    kind: "welcome",
    personName: "Sarah Chen",
    personRole: "Product Manager",
    personAvatar: "/m/images/user08.png",
    personEmail: "sarah@example.com",
    date: inDaysIso(-1),
    cheers: 15,
  },
  {
    id: "cel-5",
    kind: "work-anniversary",
    personName: "Talan Dias",
    personRole: "Director",
    personAvatar: "/m/images/user05.png",
    personEmail: "talan@example.com",
    date: inDaysIso(3),
    years: 1,
    cheers: 4,
  },
];

/**
 * Celebrations for the feed: today first, then upcoming soonest-first, then
 * anything just gone. Plain ascending order would bury today's birthday under
 * last week's joiner.
 */
export function getCelebrations(): CelebrationItem[] {
  const rank = (item: CelebrationItem) => {
    const d = daysUntil(item.date);
    return d >= 0 ? d : 1000 + Math.abs(d);
  };
  return [...SEED].sort((a, b) => rank(a) - rank(b));
}

// ── labels ────────────────────────────────────────────────────────────

/** Whole days from today to `iso` — negative for the past. */
export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const then = new Date(iso);
  then.setHours(0, 0, 0, 0);
  return Math.round((then.getTime() - today.getTime()) / 86_400_000);
}

export function whenLabel(iso: string): string {
  const d = daysUntil(iso);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Yesterday";
  if (d > 1) return `In ${d} days`;
  return `${Math.abs(d)} days ago`;
}

export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/** First name, for the friendlier headline wording. */
function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? full;
}

/** The big line on the card. */
export function celebrationTitle(item: CelebrationItem, companyName?: string): string {
  switch (item.kind) {
    case "birthday":
      return `Happy Birthday, ${firstName(item.personName)}!`;
    case "work-anniversary": {
      const years = item.years ?? 1;
      const unit = years === 1 ? "year" : "years";
      // Falls back to "of service" so the headline still reads as a milestone
      // on accounts that have not set a company name.
      return companyName
        ? `${years} ${unit} at ${companyName}`
        : `${years} ${unit} of service`;
    }
    case "wedding-anniversary":
      return `Happy ${ordinal(item.years ?? 1)} Wedding Anniversary`;
    case "welcome":
      return `Welcome aboard, ${firstName(item.personName)}!`;
  }
}

/** The small line under the headline. */
export function celebrationSubtitle(item: CelebrationItem): string {
  switch (item.kind) {
    case "birthday":
      return "Drop a note and make their day.";
    case "work-anniversary":
      return `${firstName(item.personName)} is celebrating a service milestone.`;
    case "wedding-anniversary":
      return `Wishing ${firstName(item.personName)} and their partner many more.`;
    case "welcome":
      return `${firstName(item.personName)} just joined the team — say hello.`;
  }
}

/**
 * Per-kind styling. The hue *is* the occasion here, so these are categorical
 * rather than brand tokens — the same exception the rank tiers use.
 */
export type CelebrationStyle = {
  label: string;
  emoji: string;
  /** Banner surface. */
  banner: string;
  /** Accent text + avatar ring, via `currentColor`. */
  accent: string;
  /** Chip behind the date label. */
  chip: string;
};

export const CELEBRATION_STYLES: Record<CelebrationKind, CelebrationStyle> = {
  birthday: {
    label: "Birthday",
    emoji: "🎂",
    banner: "bg-rose-50", // theme-allow — occasion colour
    accent: "text-rose-500", // theme-allow — occasion colour
    chip: "bg-rose-100 text-rose-700", // theme-allow — occasion colour
  },
  "work-anniversary": {
    label: "Work Anniversary",
    emoji: "🎉",
    banner: "bg-primary-soft",
    accent: "text-primary",
    chip: "bg-primary-soft text-primary",
  },
  "wedding-anniversary": {
    label: "Wedding Anniversary",
    emoji: "💐",
    banner: "bg-violet-50", // theme-allow — occasion colour
    accent: "text-violet-500", // theme-allow — occasion colour
    chip: "bg-violet-100 text-violet-700", // theme-allow — occasion colour
  },
  welcome: {
    label: "New Joiner",
    emoji: "👋",
    banner: "bg-teal-50", // theme-allow — occasion colour
    accent: "text-teal-500", // theme-allow — occasion colour
    chip: "bg-teal-100 text-teal-700", // theme-allow — occasion colour
  },
};

// ── wishes (localStorage, same shape as lib/reactions.ts) ──────────────

export const WISHES = ["🎉", "🎂", "❤️", "👏", "🥳"] as const;
export type Wish = (typeof WISHES)[number];

export type ItemWishes = {
  counts: Partial<Record<Wish, number>>;
  /** The wish the signed-in user has left on this card, if any. */
  mine?: Wish;
};

const KEY = "engagex_celebration_wishes_v1";

type Store = Record<string, ItemWishes>;

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

function write(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — a wish is not worth failing the render over */
  }
}

export function getWishes(itemId: string): ItemWishes {
  return read()[itemId] ?? { counts: {} };
}

/**
 * Toggle the user's wish. Picking a different emoji moves their wish rather
 * than adding a second one, so one person always counts once.
 */
export function toggleWish(itemId: string, emoji: Wish): ItemWishes {
  const store = read();
  const current: ItemWishes = store[itemId] ?? { counts: {} };
  const counts = { ...current.counts };

  if (current.mine) {
    counts[current.mine] = Math.max(0, (counts[current.mine] ?? 0) - 1);
    if (counts[current.mine] === 0) delete counts[current.mine];
  }

  const next: ItemWishes =
    current.mine === emoji
      ? { counts }
      : { counts: { ...counts, [emoji]: (counts[emoji] ?? 0) + 1 }, mine: emoji };

  store[itemId] = next;
  write(store);
  return next;
}

export function totalWishes(state: ItemWishes): number {
  return Object.values(state.counts).reduce((sum, n) => sum + (n ?? 0), 0);
}
