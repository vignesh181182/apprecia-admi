export type BadgeItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
};

export const BADGE_CATEGORIES = [
  "Performance & Impact",
  "Innovation & Thinking",
  "Collaboration & Culture",
  "Growth & Learning",
  "Creativity & Expression",
  "Reliability & Trust",
  "Wellbeing & Human",
  "Managers / Leaders",
  "Celebrations & Lightweight",
] as const;

export type BadgeCategory = typeof BADGE_CATEGORIES[number];

export const INITIAL_BADGES: BadgeItem[] = [
  { id: "b1",  name: "Game Changer",       description: "Created measurable impact",              category: "Performance & Impact",      isActive: true  },
  { id: "b2",  name: "Outcome Achiever",   description: "Delivered beyond expectations",          category: "Performance & Impact",      isActive: true  },
  { id: "b3",  name: "Moment of Impact",   description: "Delivered when it mattered most",        category: "Performance & Impact",      isActive: true  },
  { id: "b4",  name: "Execution Ninja",    description: "Fast, flawless delivery",                category: "Performance & Impact",      isActive: true  },
  { id: "b5",  name: "Sharp Thinking",     description: "Smart, original thinking",               category: "Innovation & Thinking",     isActive: true  },
  { id: "b6",  name: "Unblocked It",       description: "Solved a tough challenge",               category: "Innovation & Thinking",     isActive: true  },
  { id: "b7",  name: "Fresh Approach",     description: "Tried something new",                    category: "Innovation & Thinking",     isActive: true  },
  { id: "b8",  name: "Future Builder",     description: "Thinking ahead, not sideways",           category: "Innovation & Thinking",     isActive: true  },
  { id: "b9",  name: "Idea Machine",       description: "Constant source of ideas",               category: "Innovation & Thinking",     isActive: true  },
  { id: "b10", name: "Culture Carrier",    description: "Lives company values",                   category: "Collaboration & Culture",   isActive: true  },
  { id: "b11", name: "Team Glue",          description: "Keeps people together",                  category: "Collaboration & Culture",   isActive: true  },
  { id: "b12", name: "Collab Champion",    description: "Makes teamwork easy",                    category: "Collaboration & Culture",   isActive: true  },
  { id: "b13", name: "People's MVP",       description: "Trusted and respected",                  category: "Collaboration & Culture",   isActive: true  },
  { id: "b14", name: "Energy Uplifter",    description: "Raises the room's energy",               category: "Collaboration & Culture",   isActive: true  },
  { id: "b15", name: "Safe Space Creator", description: "Inclusive and supportive",               category: "Collaboration & Culture",   isActive: true  },
  { id: "b16", name: "Skill Builder",      description: "Picked up a new capability",             category: "Growth & Learning",         isActive: true  },
  { id: "b17", name: "Growth Mindset",     description: "Learns from mistakes",                   category: "Growth & Learning",         isActive: true  },
  { id: "b18", name: "Level Up Award",     description: "Visible improvement",                    category: "Growth & Learning",         isActive: true  },
  { id: "b19", name: "Curious Cat",        description: "Asks the right questions",               category: "Growth & Learning",         isActive: true  },
  { id: "b20", name: "Creative Spark",     description: "Unique creative input",                  category: "Creativity & Expression",   isActive: true  },
  { id: "b21", name: "Design Sensei",      description: "Visual or UX excellence",                category: "Creativity & Expression",   isActive: true  },
  { id: "b22", name: "Storyteller",        description: "Clear, compelling communication",        category: "Creativity & Expression",   isActive: true  },
  { id: "b23", name: "Brand Builder",      description: "Strengthened brand presence",            category: "Creativity & Expression",   isActive: true  },
  { id: "b24", name: "Vibe Curator",       description: "Elevated look, feel, or tone",           category: "Creativity & Expression",   isActive: true  },
  { id: "b25", name: "Rock Solid",         description: "Always dependable",                      category: "Reliability & Trust",       isActive: true  },
  { id: "b26", name: "Consistency Champ",  description: "Delivers every time",                    category: "Reliability & Trust",       isActive: true  },
  { id: "b27", name: "Quiet Achiever",     description: "Impact without noise",                   category: "Reliability & Trust",       isActive: true  },
  { id: "b28", name: "Burnout Blocker",    description: "Protected team wellbeing",               category: "Wellbeing & Human",         isActive: true  },
  { id: "b29", name: "Empathy Champ",      description: "Led with care",                          category: "Wellbeing & Human",         isActive: true  },
  { id: "b30", name: "Mental Health Ally", description: "Supportive and aware",                   category: "Wellbeing & Human",         isActive: true  },
  { id: "b31", name: "Human First",        description: "Did the right thing",                    category: "Wellbeing & Human",         isActive: true  },
  { id: "b32", name: "Kindness Counts",    description: "Simple, genuine kindness",               category: "Wellbeing & Human",         isActive: true  },
  { id: "b33", name: "Talent Builder",     description: "Helped others grow",                     category: "Managers / Leaders",        isActive: true  },
  { id: "b34", name: "Decisive Leader",    description: "Took timely, confident decisions",       category: "Managers / Leaders",        isActive: true  },
  { id: "b35", name: "Career Enabler",     description: "Actively supported progression",         category: "Managers / Leaders",        isActive: true  },
  { id: "b36", name: "Psych Safety Champ", description: "Created a safe team space",              category: "Managers / Leaders",        isActive: true  },
  { id: "b37", name: "People First Leader",description: "Balanced results with humanity",         category: "Managers / Leaders",        isActive: true  },
  { id: "b38", name: "Thank You",          description: "Simple gratitude — low bar, high impact", category: "Celebrations & Lightweight", isActive: true },
  { id: "b39", name: "Big Win",            description: "Significant success worth celebrating",  category: "Celebrations & Lightweight", isActive: true  },
  { id: "b40", name: "Celebration Time",   description: "Just because",                           category: "Celebrations & Lightweight", isActive: true  },
];

export type CategoryStyle = { color: string; bg: string; chip: string; emoji: string };

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "Performance & Impact":      { color: "text-amber-700",   bg: "bg-amber-100",   chip: "bg-amber-100 text-amber-700",     emoji: "⚡" },
  "Innovation & Thinking":     { color: "text-blue-700",    bg: "bg-blue-100",    chip: "bg-blue-100 text-blue-700",       emoji: "💡" },
  "Collaboration & Culture":   { color: "text-green-700",   bg: "bg-green-100",   chip: "bg-green-100 text-green-700",     emoji: "🤝" },
  "Growth & Learning":         { color: "text-emerald-700", bg: "bg-emerald-100", chip: "bg-emerald-100 text-emerald-700", emoji: "📈" },
  "Creativity & Expression":   { color: "text-pink-700",    bg: "bg-pink-100",    chip: "bg-pink-100 text-pink-700",       emoji: "🎨" },
  "Reliability & Trust":       { color: "text-slate-700",   bg: "bg-slate-100",   chip: "bg-slate-100 text-slate-700",     emoji: "🛡️" },
  "Wellbeing & Human":         { color: "text-rose-700",    bg: "bg-rose-100",    chip: "bg-rose-100 text-rose-700",       emoji: "❤️" },
  "Managers / Leaders":        { color: "text-purple-700",  bg: "bg-purple-100",  chip: "bg-purple-100 text-purple-700",   emoji: "🧭" },
  "Celebrations & Lightweight":{ color: "text-orange-700",  bg: "bg-orange-100",  chip: "bg-orange-100 text-orange-700",   emoji: "🎉" },
};

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? {
    color: "text-stone-700",
    bg: "bg-stone-100",
    chip: "bg-stone-100 text-stone-700",
    emoji: "🏅",
  };
}

export function findBadgeByName(name: string): BadgeItem | undefined {
  return INITIAL_BADGES.find((b) => b.name === name);
}
