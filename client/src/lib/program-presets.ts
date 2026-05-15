/**
 * Static asset library for the program create/edit form. Hardcoded so the form
 * can render before any user state exists, and so older programs can resolve
 * their banner reference even if the seed list grows in the future.
 */

export type BannerPatternId =
  | "confetti"
  | "trophy"
  | "stars"
  | "waves"
  | "dots"
  | "spotlight"
  | "mountains"
  | "bubbles"
  | "ribbons"
  | "crown"
  | "medal"
  | "streamers";

export type BannerPreset = {
  id: string;
  label: string;
  /** CSS gradient string (used as the base layer of the banner). */
  background: string;
  /** Decorative SVG pattern rendered over the gradient. */
  patternId: BannerPatternId;
  /** Stroke/fill color the pattern uses for its illustrations. */
  accent: string;
};

export const BANNER_PRESETS: BannerPreset[] = [
  { id: "amber-glow",     label: "Trophy",      background: "linear-gradient(180deg, #fbe9c8 0%, #f5d8a3 100%)", patternId: "trophy",    accent: "#7c4a18" },
  { id: "violet-haze",    label: "Crown",       background: "linear-gradient(180deg, #e9e0ff 0%, #d2c3ff 100%)", patternId: "crown",     accent: "#5b21b6" },
  { id: "spring-meadow",  label: "Waves",       background: "linear-gradient(180deg, #d6f5e1 0%, #a7e8c0 100%)", patternId: "waves",     accent: "#166534" },
  { id: "sunbeam",        label: "Confetti",    background: "linear-gradient(180deg, #fff2c8 0%, #ffe093 100%)", patternId: "confetti",  accent: "#ffffff" },
  { id: "blush-bloom",    label: "Bubbles",     background: "linear-gradient(180deg, #fce7f3 0%, #fbcfe8 100%)", patternId: "bubbles",   accent: "#9d174d" },
  { id: "ocean-mist",     label: "Streamers",   background: "linear-gradient(180deg, #e0f2fe 0%, #bae6fd 100%)", patternId: "streamers", accent: "#0c4a6e" },
  { id: "midnight",       label: "Stars",       background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)", patternId: "stars",     accent: "#fde68a" },
  { id: "ember",          label: "Spotlight",   background: "linear-gradient(180deg, #fb923c 0%, #ea580c 100%)", patternId: "spotlight", accent: "#ffffff" },
  { id: "ivy",            label: "Mountains",   background: "linear-gradient(180deg, #65a30d 0%, #3f6212 100%)", patternId: "mountains", accent: "#ecfccb" },
  { id: "skyline",        label: "Ribbons",     background: "linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)", patternId: "ribbons",   accent: "#ffffff" },
  { id: "berry",          label: "Medal",       background: "linear-gradient(180deg, #c084fc 0%, #7c3aed 100%)", patternId: "medal",     accent: "#ffffff" },
  { id: "linen",          label: "Dots",        background: "linear-gradient(180deg, #fafaf9 0%, #e7e5e4 100%)", patternId: "dots",      accent: "#a8a29e" },
];

export function bannerById(id?: string): BannerPreset | undefined {
  if (!id) return undefined;
  return BANNER_PRESETS.find((b) => b.id === id);
}

export const ICON_PRESETS: string[] = [
  "🏆", "🎖️", "⭐", "🌟", "💡", "🚀", "🎯", "🏅",
  "🎉", "💎", "🛡️", "🔥", "🌈", "🌱", "🤝", "💬",
  "🥇", "👑", "🎁", "🧠", "⚡", "💪", "❤️", "✨",
];

export type CategoryPreset = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  winnersCount: number;
  prizePoints: number;
};

export const CATEGORY_PRESETS: CategoryPreset[] = [
  { id: "innovation-champ",    name: "Innovation Champ",    emoji: "💡", description: "Bold ideas that move the business forward.",  winnersCount: 1, prizePoints: 5000 },
  { id: "peoples-champ",       name: "People's Champ",      emoji: "🤝", description: "Voted by peers as a standout teammate.",       winnersCount: 1, prizePoints: 3000 },
  { id: "customer-hero",       name: "Customer Hero",       emoji: "🌟", description: "Went above and beyond for a customer.",        winnersCount: 1, prizePoints: 4000 },
  { id: "mentor-of-the-month", name: "Mentor of the Month", emoji: "🧠", description: "Lifted up the team through coaching.",         winnersCount: 1, prizePoints: 3000 },
  { id: "quick-helper",        name: "Quick Helper",        emoji: "⚡", description: "Always first to unblock a colleague.",         winnersCount: 1, prizePoints: 2000 },
  { id: "years-of-service",    name: "Years of Service",    emoji: "🎉", description: "Anniversary milestone recognition.",           winnersCount: 1, prizePoints: 5000 },
];

export const PROGRAM_LOCATIONS = [
  "San Francisco",
  "New York",
  "Austin",
  "London",
  "Bengaluru",
  "Singapore",
  "Sydney",
  "Remote",
];
