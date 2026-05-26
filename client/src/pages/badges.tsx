import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  LayoutGrid,
  List,
  Filter,
} from "lucide-react";

type ViewMode = "cards" | "list";
const VIEW_MODE_KEY = "engagex_badges_view";
function readViewMode(): ViewMode {
  if (typeof window === "undefined") return "list";
  return window.localStorage.getItem(VIEW_MODE_KEY) === "cards" ? "cards" : "list";
}

// ─── Types ────────────────────────────────────────────────────────────────────

type TagColor = "blue" | "amber" | "stone" | "purple" | "rose" | "green" | "sky" | "teal";

type TagItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: TagColor;
  points: number;
  isActive: boolean;
};

const TAG_COLOR_STYLES: Record<TagColor, { bg: string; icon: string; ring: string }> = {
  blue:   { bg: "bg-blue-100",   icon: "text-blue-700",   ring: "ring-blue-400" },
  amber:  { bg: "bg-amber-100",  icon: "text-amber-700",  ring: "ring-amber-400" },
  stone:  { bg: "bg-stone-200",  icon: "text-stone-700",  ring: "ring-stone-400" },
  purple: { bg: "bg-purple-100", icon: "text-purple-700", ring: "ring-purple-400" },
  rose:   { bg: "bg-rose-100",   icon: "text-rose-700",   ring: "ring-rose-400" },
  green:  { bg: "bg-green-100",  icon: "text-green-700",  ring: "ring-green-400" },
  sky:    { bg: "bg-sky-100",    icon: "text-sky-700",    ring: "ring-sky-400" },
  teal:   { bg: "bg-teal-100",   icon: "text-teal-700",   ring: "ring-teal-400" },
};

const TAG_COLOR_ORDER: TagColor[] = ["blue", "amber", "purple", "rose", "green", "sky", "teal", "stone"];

import {
  BADGE_CATEGORIES,
  INITIAL_BADGES,
  type BadgeItem,
} from "@/lib/badges-catalog";

// ─── Seed Data ─────────────────────────────────────────────────────────────────

const INITIAL_TAGS: TagItem[] = [
  { id: "t1", name: "Great Work", description: "Exceptional output or result", icon: "Star", color: "amber", points: 50, isActive: true },
  { id: "t2", name: "Team Player", description: "Collaboration and support", icon: "Users", color: "green", points: 50, isActive: true },
  { id: "t3", name: "Innovation", description: "Creative, forward-thinking idea", icon: "Lightbulb", color: "blue", points: 75, isActive: true },
  { id: "t4", name: "Leadership", description: "Guided or inspired the team", icon: "Target", color: "purple", points: 75, isActive: true },
  { id: "t5", name: "Helpful", description: "Went out of their way to help", icon: "ThumbsUp", color: "sky", points: 50, isActive: true },
  { id: "t6", name: "Dedication", description: "Consistent effort and commitment", icon: "Shield", color: "rose", points: 50, isActive: true },
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

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v === "cards" || v === "list") onChange(v);
      }}
      className="bg-white border border-stone-200 rounded-lg p-0.5 shrink-0"
    >
      <ToggleGroupItem
        value="cards"
        aria-label="Card view"
        data-testid="badges-view-cards"
        className="h-8 px-2.5 data-[state=on]:bg-stone-900 data-[state=on]:text-white"
      >
        <LayoutGrid className="w-4 h-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="list"
        aria-label="List view"
        data-testid="badges-view-list"
        className="h-8 px-2.5 data-[state=on]:bg-stone-900 data-[state=on]:text-white"
      >
        <List className="w-4 h-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type LockedSection = "tags" | "badges";

export default function BadgesAndTags({ lockedSection }: { lockedSection?: LockedSection } = {}) {
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

  // ── View mode (shared across tabs)
  const [viewMode, setViewMode] = useState<ViewMode>(readViewMode);
  useEffect(() => {
    window.localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

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
    <div className="px-6 pt-3 pb-6 space-y-5">
      <Tabs defaultValue={lockedSection ?? "tags"}>
        {!lockedSection && (
          <div className="mb-4">
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
        )}

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
            <div className="flex items-center gap-2">
              <ViewToggle value={viewMode} onChange={setViewMode} />
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
          </div>

          {/* Tag Cards */}
          {viewMode === "cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.map((tag) => {
              const Icon = TAG_ICONS[tag.icon] ?? Star;
              const tagStyle = TAG_COLOR_STYLES[tag.color] ?? TAG_COLOR_STYLES.stone;
              return (
                <Card key={tag.id} className={`border border-stone-200 transition-all ${!tag.isActive ? "opacity-50" : "hover:shadow-sm"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${tagStyle.bg} flex items-center justify-center shrink-0`}>
                          <Icon className={`w-5 h-5 ${tagStyle.icon}`} />
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
          )}

          {/* Tag List */}
          {viewMode === "list" && (
            <Card className="border border-stone-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-50 hover:bg-stone-50">
                    <TableHead className="text-xs uppercase tracking-wide text-stone-500">Tag</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-stone-500 text-right">Points</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-stone-500">Active</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-stone-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => {
                    const Icon = TAG_ICONS[tag.icon] ?? Star;
                    const tagStyle = TAG_COLOR_STYLES[tag.color] ?? TAG_COLOR_STYLES.stone;
                    return (
                      <TableRow
                        key={tag.id}
                        className={`hover:bg-stone-50 ${!tag.isActive ? "opacity-50" : ""}`}
                        data-testid={`tags-row-${tag.id}`}
                      >
                        <TableCell className="min-w-[280px]">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg ${tagStyle.bg} flex items-center justify-center shrink-0`}>
                              <Icon className={`w-4 h-4 ${tagStyle.icon}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-stone-900 truncate">{tag.name}</p>
                              <p className="text-xs text-stone-500 truncate max-w-[320px]">{tag.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-stone-900">
                            <Star className="w-3.5 h-3.5 text-yellow-500" />
                            {tag.points}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={tag.isActive}
                            onCheckedChange={() => toggleTag(tag.id)}
                            className="scale-75 data-[state=checked]:bg-stone-900"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredTags.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-stone-400 text-sm">
                        No tags match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
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
            <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Search badges…"
                  value={badgeSearch}
                  onChange={(e) => setBadgeSearch(e.target.value)}
                  className="pl-9 h-9 text-sm border-stone-200"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-56 text-sm border-stone-200" data-testid="badges-category-filter">
                  <Filter className="w-4 h-4 mr-2 text-stone-400" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All categories ({badges.length})</SelectItem>
                  {BADGE_CATEGORIES.map((cat) => {
                    const count = badges.filter((b) => b.category === cat).length;
                    return (
                      <SelectItem key={cat} value={cat}>
                        {cat} ({count})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <ViewToggle value={viewMode} onChange={setViewMode} />
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
          </div>

          {/* Badges — grouped by category */}
          {viewMode === "cards" && (
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
          )}

          {/* Badge List */}
          {viewMode === "list" && (
            <Card className="border border-stone-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-50 hover:bg-stone-50">
                    <TableHead className="text-xs uppercase tracking-wide text-stone-500">Badge</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-stone-500">Category</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-stone-500">Active</TableHead>
                    <TableHead className="text-xs uppercase tracking-wide text-stone-500 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBadges.map((badge) => {
                    const cfg = CATEGORY_CONFIG[badge.category];
                    const Icon = cfg?.icon ?? Award;
                    return (
                      <TableRow
                        key={badge.id}
                        className={`hover:bg-stone-50 ${!badge.isActive ? "opacity-50" : ""}`}
                        data-testid={`badges-row-${badge.id}`}
                      >
                        <TableCell className="min-w-[280px]">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg?.bg ?? "bg-stone-100"}`}>
                              <Icon className={`w-4 h-4 ${cfg?.color ?? "text-stone-600"}`} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-stone-900 truncate">{badge.name}</p>
                                {!badge.isActive && (
                                  <Badge variant="secondary" className="text-xs bg-stone-100 text-stone-400 shrink-0">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 truncate max-w-[320px]">{badge.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg?.bg ?? "bg-stone-100"} ${cfg?.color ?? "text-stone-700"}`}>
                            <Icon className="w-3 h-3" />
                            {badge.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={badge.isActive}
                            onCheckedChange={() => toggleBadge(badge.id)}
                            className="scale-75 data-[state=checked]:bg-stone-900"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
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
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredBadges.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16 text-stone-400 text-sm">
                        No badges match your search or filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
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
  const [color, setColor]         = useState<TagColor>(tag?.color ?? "blue");
  const [points, setPoints]       = useState(String(tag?.points ?? 50));
  const [isActive, setIsActive]   = useState(tag?.isActive ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description, icon, color, points: Number(points), isActive });
  }

  const PreviewIcon = TAG_ICONS[icon] ?? Star;
  const previewStyle = TAG_COLOR_STYLES[color];

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      {/* Live preview */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
        <div className={`w-10 h-10 rounded-xl ${previewStyle.bg} flex items-center justify-center`}>
          <PreviewIcon className={`w-5 h-5 ${previewStyle.icon}`} />
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

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-stone-700">Color</Label>
        <div className="flex gap-2 flex-wrap">
          {TAG_COLOR_ORDER.map((c) => {
            const s = TAG_COLOR_STYLES[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Pick ${c} color`}
                className={`w-8 h-8 rounded-full ${s.bg} transition-all ${
                  color === c ? `ring-2 ${s.ring} ring-offset-1` : ""
                }`}
              />
            );
          })}
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

      <div className="sticky bottom-0 -mx-6 px-6 pt-3 pb-1 bg-white/95 backdrop-blur border-t border-stone-200 shadow-[0_-4px_12px_-8px_rgba(0,0,0,0.12)] flex gap-2">
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

      <div className="sticky bottom-0 -mx-6 px-6 pt-3 pb-1 bg-white/95 backdrop-blur border-t border-stone-200 shadow-[0_-4px_12px_-8px_rgba(0,0,0,0.12)] flex gap-2">
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
