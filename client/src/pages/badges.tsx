import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Users,
  Lightbulb,
  Target,
  ThumbsUp,
  Shield,
  Zap,
  TrendingUp,
  Sparkles,
  Heart,
  Briefcase,
  Gift,
  Search,
  Tag,
  Award,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TagItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  isActive: boolean;
};

type BadgeItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
};

// ─── Seed Data ─────────────────────────────────────────────────────────────────

const INITIAL_TAGS: TagItem[] = [
  { id: "t1", name: "Great Work", description: "Exceptional output or result", icon: "Star", points: 50, isActive: true },
  { id: "t2", name: "Team Player", description: "Collaboration and support", icon: "Users", points: 50, isActive: true },
  { id: "t3", name: "Innovation", description: "Creative, forward-thinking idea", icon: "Lightbulb", points: 75, isActive: true },
  { id: "t4", name: "Leadership", description: "Guided or inspired the team", icon: "Target", points: 75, isActive: true },
  { id: "t5", name: "Helpful", description: "Went out of their way to help", icon: "ThumbsUp", points: 50, isActive: true },
  { id: "t6", name: "Dedication", description: "Consistent effort and commitment", icon: "Shield", points: 50, isActive: true },
];

const BADGE_CATEGORIES = [
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

const INITIAL_BADGES: BadgeItem[] = [
  // Performance & Impact
  { id: "b1",  name: "Game Changer",       description: "Created measurable impact",              category: "Performance & Impact",      isActive: true  },
  { id: "b2",  name: "Outcome Achiever",   description: "Delivered beyond expectations",          category: "Performance & Impact",      isActive: true  },
  { id: "b3",  name: "Moment of Impact",   description: "Delivered when it mattered most",        category: "Performance & Impact",      isActive: true  },
  { id: "b4",  name: "Execution Ninja",    description: "Fast, flawless delivery",                category: "Performance & Impact",      isActive: true  },
  // Innovation & Thinking
  { id: "b5",  name: "Sharp Thinking",     description: "Smart, original thinking",               category: "Innovation & Thinking",     isActive: true  },
  { id: "b6",  name: "Unblocked It",       description: "Solved a tough challenge",               category: "Innovation & Thinking",     isActive: true  },
  { id: "b7",  name: "Fresh Approach",     description: "Tried something new",                    category: "Innovation & Thinking",     isActive: true  },
  { id: "b8",  name: "Future Builder",     description: "Thinking ahead, not sideways",           category: "Innovation & Thinking",     isActive: true  },
  { id: "b9",  name: "Idea Machine",       description: "Constant source of ideas",               category: "Innovation & Thinking",     isActive: true  },
  // Collaboration & Culture
  { id: "b10", name: "Culture Carrier",    description: "Lives company values",                   category: "Collaboration & Culture",   isActive: true  },
  { id: "b11", name: "Team Glue",          description: "Keeps people together",                  category: "Collaboration & Culture",   isActive: true  },
  { id: "b12", name: "Collab Champion",    description: "Makes teamwork easy",                    category: "Collaboration & Culture",   isActive: true  },
  { id: "b13", name: "People's MVP",       description: "Trusted and respected",                  category: "Collaboration & Culture",   isActive: true  },
  { id: "b14", name: "Energy Uplifter",    description: "Raises the room's energy",               category: "Collaboration & Culture",   isActive: true  },
  { id: "b15", name: "Safe Space Creator", description: "Inclusive and supportive",               category: "Collaboration & Culture",   isActive: true  },
  // Growth & Learning
  { id: "b16", name: "Skill Builder",      description: "Picked up a new capability",             category: "Growth & Learning",         isActive: true  },
  { id: "b17", name: "Growth Mindset",     description: "Learns from mistakes",                   category: "Growth & Learning",         isActive: true  },
  { id: "b18", name: "Level Up Award",     description: "Visible improvement",                    category: "Growth & Learning",         isActive: true  },
  { id: "b19", name: "Curious Cat",        description: "Asks the right questions",               category: "Growth & Learning",         isActive: true  },
  // Creativity & Expression
  { id: "b20", name: "Creative Spark",     description: "Unique creative input",                  category: "Creativity & Expression",   isActive: true  },
  { id: "b21", name: "Design Sensei",      description: "Visual or UX excellence",                category: "Creativity & Expression",   isActive: true  },
  { id: "b22", name: "Storyteller",        description: "Clear, compelling communication",        category: "Creativity & Expression",   isActive: true  },
  { id: "b23", name: "Brand Builder",      description: "Strengthened brand presence",            category: "Creativity & Expression",   isActive: true  },
  { id: "b24", name: "Vibe Curator",       description: "Elevated look, feel, or tone",           category: "Creativity & Expression",   isActive: true  },
  // Reliability & Trust
  { id: "b25", name: "Rock Solid",         description: "Always dependable",                      category: "Reliability & Trust",       isActive: true  },
  { id: "b26", name: "Consistency Champ",  description: "Delivers every time",                    category: "Reliability & Trust",       isActive: true  },
  { id: "b27", name: "Quiet Achiever",     description: "Impact without noise",                   category: "Reliability & Trust",       isActive: true  },
  // Wellbeing & Human
  { id: "b28", name: "Burnout Blocker",    description: "Protected team wellbeing",               category: "Wellbeing & Human",         isActive: true  },
  { id: "b29", name: "Empathy Champ",      description: "Led with care",                          category: "Wellbeing & Human",         isActive: true  },
  { id: "b30", name: "Mental Health Ally", description: "Supportive and aware",                   category: "Wellbeing & Human",         isActive: true  },
  { id: "b31", name: "Human First",        description: "Did the right thing",                    category: "Wellbeing & Human",         isActive: true  },
  { id: "b32", name: "Kindness Counts",    description: "Simple, genuine kindness",               category: "Wellbeing & Human",         isActive: true  },
  // Managers / Leaders
  { id: "b33", name: "Talent Builder",     description: "Helped others grow",                     category: "Managers / Leaders",        isActive: true  },
  { id: "b34", name: "Decisive Leader",    description: "Took timely, confident decisions",       category: "Managers / Leaders",        isActive: true  },
  { id: "b35", name: "Career Enabler",     description: "Actively supported progression",         category: "Managers / Leaders",        isActive: true  },
  { id: "b36", name: "Psych Safety Champ", description: "Created a safe team space",              category: "Managers / Leaders",        isActive: true  },
  { id: "b37", name: "People First Leader",description: "Balanced results with humanity",         category: "Managers / Leaders",        isActive: true  },
  // Celebrations & Lightweight
  { id: "b38", name: "Thank You",          description: "Simple gratitude — low bar, high impact", category: "Celebrations & Lightweight", isActive: true },
  { id: "b39", name: "Big Win",            description: "Significant success worth celebrating",  category: "Celebrations & Lightweight", isActive: true  },
  { id: "b40", name: "Celebration Time",   description: "Just because",                           category: "Celebrations & Lightweight", isActive: true  },
];

// ─── Category Config ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  "Performance & Impact":      { color: "text-amber-700",   bg: "bg-amber-100",   icon: Zap        },
  "Innovation & Thinking":     { color: "text-blue-700",    bg: "bg-blue-100",    icon: Lightbulb  },
  "Collaboration & Culture":   { color: "text-green-700",   bg: "bg-green-100",   icon: Users      },
  "Growth & Learning":         { color: "text-emerald-700", bg: "bg-emerald-100", icon: TrendingUp },
  "Creativity & Expression":   { color: "text-pink-700",    bg: "bg-pink-100",    icon: Sparkles   },
  "Reliability & Trust":       { color: "text-slate-700",   bg: "bg-slate-100",   icon: Shield     },
  "Wellbeing & Human":         { color: "text-rose-700",    bg: "bg-rose-100",    icon: Heart      },
  "Managers / Leaders":        { color: "text-purple-700",  bg: "bg-purple-100",  icon: Briefcase  },
  "Celebrations & Lightweight":{ color: "text-orange-700",  bg: "bg-orange-100",  icon: Gift       },
};

const TAG_ICONS: Record<string, React.ElementType> = {
  Star: Star,
  Users: Users,
  Lightbulb: Lightbulb,
  Target: Target,
  ThumbsUp: ThumbsUp,
  Shield: Shield,
};

const TAG_ICON_OPTIONS = ["Star", "Users", "Lightbulb", "Target", "ThumbsUp", "Shield", "Zap", "Heart", "Gift", "Award"];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BadgesAndTags() {
  const { toast } = useToast();
  const [tags, setTags] = useState<TagItem[]>(INITIAL_TAGS);
  const [badges, setBadges] = useState<BadgeItem[]>(INITIAL_BADGES);

  // ── Tag state
  const [tagSearch, setTagSearch] = useState("");
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const [editTag, setEditTag] = useState<TagItem | null>(null);

  // ── Badge state
  const [badgeSearch, setBadgeSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [badgeSheetOpen, setBadgeSheetOpen] = useState(false);
  const [editBadge, setEditBadge] = useState<BadgeItem | null>(null);

  // ── Tag handlers
  function toggleTag(id: string) {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
  }
  function deleteTag(id: string) {
    setTags((prev) => prev.filter((t) => t.id !== id));
    toast({ title: "Tag deleted" });
  }
  function saveTag(data: Omit<TagItem, "id">) {
    if (editTag) {
      setTags((prev) => prev.map((t) => (t.id === editTag.id ? { ...editTag, ...data } : t)));
      toast({ title: "Tag updated" });
    } else {
      setTags((prev) => [...prev, { id: `t${Date.now()}`, ...data }]);
      toast({ title: "Tag created", description: "It's now visible in the mobile app." });
    }
    setTagSheetOpen(false);
    setEditTag(null);
  }

  // ── Badge handlers
  function toggleBadge(id: string) {
    setBadges((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)));
  }
  function deleteBadge(id: string) {
    setBadges((prev) => prev.filter((b) => b.id !== id));
    toast({ title: "Badge deleted" });
  }
  function saveBadge(data: Omit<BadgeItem, "id">) {
    if (editBadge) {
      setBadges((prev) => prev.map((b) => (b.id === editBadge.id ? { ...editBadge, ...data } : b)));
      toast({ title: "Badge updated" });
    } else {
      setBadges((prev) => [...prev, { id: `b${Date.now()}`, ...data }]);
      toast({ title: "Badge created" });
    }
    setBadgeSheetOpen(false);
    setEditBadge(null);
  }

  // ── Filtered data
  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const filteredBadges = badges.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(badgeSearch.toLowerCase()) ||
      b.description.toLowerCase().includes(badgeSearch.toLowerCase());
    const matchCat = categoryFilter === "All" || b.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const badgesByCategory = BADGE_CATEGORIES.map((cat) => ({
    category: cat,
    items: filteredBadges.filter((b) => b.category === cat),
  })).filter((g) => g.items.length > 0);

  const activeTagCount = tags.filter((t) => t.isActive).length;
  const activeBadgeCount = badges.filter((b) => b.isActive).length;

  return (
    <div className="p-6 space-y-5">
      <Tabs defaultValue="tags">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-stone-100 h-9">
            <TabsTrigger value="tags" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Tag className="w-3.5 h-3.5 mr-1.5" />
              Recognition Tags
              <span className="ml-1.5 text-stone-400 font-normal">({tags.length})</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Award className="w-3.5 h-3.5 mr-1.5" />
              Achievement Badges
              <span className="ml-1.5 text-stone-400 font-normal">({badges.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── TAGS TAB ─────────────────────────────────────────────────────── */}
        <TabsContent value="tags" className="space-y-4 mt-0">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Tags",    value: tags.length },
              { label: "Active",        value: activeTagCount },
              { label: "Total Pts Range", value: `${Math.min(...tags.map(t=>t.points))}–${Math.max(...tags.map(t=>t.points))}` },
            ].map(({ label, value }) => (
              <Card key={label} className="border border-stone-200">
                <CardContent className="p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-1">{label}</p>
                  <p className="text-2xl font-bold text-stone-900">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                placeholder="Search tags…"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="pl-9 h-9 text-sm border-stone-200"
              />
            </div>
            <Sheet open={tagSheetOpen} onOpenChange={(o) => { setTagSheetOpen(o); if (!o) setEditTag(null); }}>
              <SheetTrigger asChild>
                <Button size="sm" className="bg-stone-900 hover:bg-stone-700 text-white gap-2 h-9">
                  <Plus className="w-4 h-4" /> Add Tag
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{editTag ? "Edit Tag" : "New Recognition Tag"}</SheetTitle>
                  <SheetDescription>
                    Tags are the quick-select reasons employees pick when sending an appreciation.
                  </SheetDescription>
                </SheetHeader>
                <TagForm
                  tag={editTag}
                  onSubmit={saveTag}
                  onCancel={() => { setTagSheetOpen(false); setEditTag(null); }}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Tag Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.map((tag) => {
              const Icon = TAG_ICONS[tag.icon] ?? Star;
              return (
                <Card key={tag.id} className={`border border-stone-200 transition-all ${!tag.isActive ? "opacity-50" : "hover:shadow-sm"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{tag.name}</p>
                          <p className="text-xs text-stone-500">{tag.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-sm font-bold text-stone-900">{tag.points} pts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={tag.isActive}
                          onCheckedChange={() => toggleTag(tag.id)}
                          className="scale-75 data-[state=checked]:bg-stone-900"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-stone-400 hover:text-stone-700"
                          onClick={() => { setEditTag(tag); setTagSheetOpen(true); }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-400 hover:text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{tag.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This tag will be removed from the mobile app. Any past appreciations using it are unaffected.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteTag(tag.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredTags.length === 0 && (
              <div className="col-span-full text-center py-12 text-stone-400 text-sm">
                No tags match your search.
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── BADGES TAB ───────────────────────────────────────────────────── */}
        <TabsContent value="badges" className="space-y-4 mt-0">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Badges",      value: badges.length },
              { label: "Active",            value: activeBadgeCount },
              { label: "Categories",        value: BADGE_CATEGORIES.length },
            ].map(({ label, value }) => (
              <Card key={label} className="border border-stone-200">
                <CardContent className="p-4">
                  <p className="text-xs text-stone-500 uppercase tracking-wide font-medium mb-1">{label}</p>
                  <p className="text-2xl font-bold text-stone-900">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                placeholder="Search badges…"
                value={badgeSearch}
                onChange={(e) => setBadgeSearch(e.target.value)}
                className="pl-9 h-9 text-sm border-stone-200"
              />
            </div>
            <Sheet open={badgeSheetOpen} onOpenChange={(o) => { setBadgeSheetOpen(o); if (!o) setEditBadge(null); }}>
              <SheetTrigger asChild>
                <Button size="sm" className="bg-stone-900 hover:bg-stone-700 text-white gap-2 h-9">
                  <Plus className="w-4 h-4" /> Add Badge
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{editBadge ? "Edit Badge" : "New Badge"}</SheetTitle>
                  <SheetDescription>
                    Badges are earned achievements employees can collect over time.
                  </SheetDescription>
                </SheetHeader>
                <BadgeForm
                  badge={editBadge}
                  onSubmit={saveBadge}
                  onCancel={() => { setBadgeSheetOpen(false); setEditBadge(null); }}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {["All", ...BADGE_CATEGORIES].map((cat) => {
              const count = cat === "All"
                ? badges.length
                : badges.filter((b) => b.category === cat).length;
              const cfg = CATEGORY_CONFIG[cat];
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? "border-stone-800 bg-stone-900 text-white"
                      : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {cfg && !isActive && (
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg} ${cfg.color}`} />
                  )}
                  {cat === "All" ? `All (${count})` : `${cat.split(" & ")[0]} (${count})`}
                </button>
              );
            })}
          </div>

          {/* Badges — grouped by category */}
          <div className="space-y-6">
            {badgesByCategory.map(({ category, items }) => {
              const cfg = CATEGORY_CONFIG[category];
              const Icon = cfg?.icon ?? Award;
              return (
                <div key={category}>
                  {/* Category header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${cfg?.bg ?? "bg-stone-100"}`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg?.color ?? "text-stone-600"}`} />
                    </div>
                    <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide">{category}</p>
                    <span className="text-xs text-stone-400">· {items.length} badges</span>
                  </div>

                  {/* Badge rows */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {items.map((badge) => (
                      <Card
                        key={badge.id}
                        className={`border border-stone-200 transition-all ${!badge.isActive ? "opacity-50" : "hover:shadow-sm"}`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {/* Category dot */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg?.bg ?? "bg-stone-100"}`}>
                              <Icon className={`w-4 h-4 ${cfg?.color ?? "text-stone-600"}`} />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-stone-900 truncate">{badge.name}</p>
                                {!badge.isActive && (
                                  <Badge variant="secondary" className="text-xs bg-stone-100 text-stone-400 shrink-0">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 truncate">{badge.description}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <Switch
                                checked={badge.isActive}
                                onCheckedChange={() => toggleBadge(badge.id)}
                                className="scale-75 data-[state=checked]:bg-stone-900"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-stone-400 hover:text-stone-700"
                                onClick={() => { setEditBadge(badge); setBadgeSheetOpen(true); }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-400 hover:text-red-600">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete "{badge.name}"?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This badge will be permanently removed. Employees who've earned it keep their record.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteBadge(badge.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredBadges.length === 0 && (
              <div className="text-center py-16 text-stone-400 text-sm">
                No badges match your search or filter.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Tag Form ──────────────────────────────────────────────────────────────────

function TagForm({
  tag,
  onSubmit,
  onCancel,
}: {
  tag: TagItem | null;
  onSubmit: (data: Omit<TagItem, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName]           = useState(tag?.name ?? "");
  const [description, setDescription] = useState(tag?.description ?? "");
  const [icon, setIcon]           = useState(tag?.icon ?? "Star");
  const [points, setPoints]       = useState(String(tag?.points ?? 50));
  const [isActive, setIsActive]   = useState(tag?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description, icon, points: Number(points), isActive });
  }

  const PreviewIcon = TAG_ICONS[icon] ?? Star;

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      {/* Live preview */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
        <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center">
          <PreviewIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">{name || "Tag name"}</p>
          <p className="text-xs text-stone-500">{points} pts · {isActive ? "Active" : "Inactive"}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Tag Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Great Work"
          className="h-9 text-sm border-stone-200"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short description shown in the app…"
          className="text-sm border-stone-200 resize-none"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">Icon</Label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger className="h-9 text-sm border-stone-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAG_ICON_OPTIONS.map((i) => (
                <SelectItem key={i} value={i}>{i}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-stone-700">Points</Label>
          <Input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            min={1}
            max={500}
            className="h-9 text-sm border-stone-200"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-stone-200">
        <div>
          <p className="text-sm font-medium text-stone-900">Active</p>
          <p className="text-xs text-stone-500">Visible in mobile app</p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          className="data-[state=checked]:bg-stone-900"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1 h-9 text-sm border-stone-200" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 h-9 bg-stone-900 hover:bg-stone-700 text-white text-sm">
          {tag ? "Save Changes" : "Create Tag"}
        </Button>
      </div>
    </form>
  );
}

// ─── Badge Form ────────────────────────────────────────────────────────────────

function BadgeForm({
  badge,
  onSubmit,
  onCancel,
}: {
  badge: BadgeItem | null;
  onSubmit: (data: Omit<BadgeItem, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName]             = useState(badge?.name ?? "");
  const [description, setDescription] = useState(badge?.description ?? "");
  const [category, setCategory]     = useState(badge?.category ?? BADGE_CATEGORIES[0]);
  const [isActive, setIsActive]     = useState(badge?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description, category, isActive });
  }

  const cfg = CATEGORY_CONFIG[category];
  const CatIcon = cfg?.icon ?? Award;

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      {/* Live preview */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg?.bg ?? "bg-stone-100"}`}>
          <CatIcon className={`w-4 h-4 ${cfg?.color ?? "text-stone-600"}`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">{name || "Badge name"}</p>
          <p className="text-xs text-stone-500">{category}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Badge Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Game Changer"
          className="h-9 text-sm border-stone-200"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did the employee do to earn this?"
          className="text-sm border-stone-200 resize-none"
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 text-sm border-stone-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BADGE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-stone-200">
        <div>
          <p className="text-sm font-medium text-stone-900">Active</p>
          <p className="text-xs text-stone-500">Employees can earn this badge</p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          className="data-[state=checked]:bg-stone-900"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1 h-9 text-sm border-stone-200" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 h-9 bg-stone-900 hover:bg-stone-700 text-white text-sm">
          {badge ? "Save Changes" : "Create Badge"}
        </Button>
      </div>
    </form>
  );
}
