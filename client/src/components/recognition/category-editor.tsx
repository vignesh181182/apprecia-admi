import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { RecognitionCategory, RecognitionCategoryColor } from "@/lib/account";

const EMOJI_OPTIONS = [
  "💡", "🧭", "🤜", "🎨", "✨", "🤝", "🏆", "🚀",
  "🎯", "💪", "🌟", "❤️", "🔥", "👏", "🙌", "⭐",
];

const COLOR_OPTIONS: { value: RecognitionCategoryColor; bg: string; ring: string }[] = [
  { value: "blue", bg: "bg-blue-100", ring: "ring-blue-400" },
  { value: "amber", bg: "bg-amber-100", ring: "ring-amber-400" },
  { value: "stone", bg: "bg-stone-200", ring: "ring-stone-400" },
  { value: "purple", bg: "bg-purple-100", ring: "ring-purple-400" },
  { value: "rose", bg: "bg-rose-100", ring: "ring-rose-400" },
  { value: "green", bg: "bg-green-100", ring: "ring-green-400" },
  { value: "sky", bg: "bg-sky-100", ring: "ring-sky-400" },
  { value: "teal", bg: "bg-teal-100", ring: "ring-teal-400" },
];

export function generateCategoryId(): string {
  return "cat-" + Math.random().toString(36).slice(2, 8);
}

type Props = {
  categories: RecognitionCategory[];
  onChange: (categories: RecognitionCategory[]) => void;
  min?: number;
  max?: number;
};

export function CategoryEditor({ categories, onChange, min = 3, max = 12 }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function update(id: string, patch: Partial<RecognitionCategory>) {
    onChange(categories.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function remove(id: string) {
    if (categories.length <= min) return;
    onChange(categories.filter((c) => c.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function add() {
    if (categories.length >= max) return;
    const newCat: RecognitionCategory = {
      id: generateCategoryId(),
      name: "",
      description: "",
      emoji: "⭐",
      color: COLOR_OPTIONS[categories.length % COLOR_OPTIONS.length].value,
    };
    onChange([...categories, newCat]);
    setExpandedId(newCat.id);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-stone-900">Recognition categories</p>
        <p className="text-xs text-stone-500 mt-0.5">
          Tags employees pick when sending recognitions. Map these to your company values.
          {" "}({categories.length}/{max})
        </p>
      </div>

      <div className="space-y-2">
        {categories.map((cat) => {
          const colorOpt = COLOR_OPTIONS.find((c) => c.value === cat.color) ?? COLOR_OPTIONS[0];
          const isExpanded = expandedId === cat.id;

          return (
            <Card
              key={cat.id}
              className={`border border-stone-200 transition-colors ${isExpanded ? "border-stone-300" : ""}`}
            >
              <CardContent className="p-3 space-y-2">
                {/* Collapsed row */}
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                >
                  <span
                    className={`w-8 h-8 rounded-lg ${colorOpt.bg} flex items-center justify-center text-base shrink-0`}
                  >
                    {cat.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {cat.name || "Untitled category"}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-stone-500 truncate">{cat.description}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-stone-400 hover:text-red-600 shrink-0"
                    disabled={categories.length <= min}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(cat.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Expanded editor */}
                {isExpanded && (
                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-700">Name</label>
                      <Input
                        value={cat.name}
                        onChange={(e) => update(cat.id, { name: e.target.value })}
                        placeholder="e.g. Innovation"
                        className="h-9 text-sm border-stone-200"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-700">Description</label>
                      <Textarea
                        value={cat.description}
                        onChange={(e) => update(cat.id, { description: e.target.value })}
                        placeholder="Short description of this value"
                        className="text-sm border-stone-200 resize-none min-h-[60px]"
                        rows={2}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-700">Emoji</label>
                      <div className="grid grid-cols-8 gap-1.5">
                        {EMOJI_OPTIONS.map((em) => (
                          <button
                            key={em}
                            type="button"
                            className={`w-8 h-8 rounded-md text-base flex items-center justify-center transition-all ${
                              cat.emoji === em
                                ? "bg-stone-200 ring-2 ring-stone-400"
                                : "bg-stone-50 hover:bg-stone-100"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              update(cat.id, { emoji: em });
                            }}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-700">Color</label>
                      <div className="flex gap-2">
                        {COLOR_OPTIONS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                              cat.color === c.value ? `ring-2 ${c.ring} ring-offset-1` : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              update(cat.id, { color: c.value });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length < max && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          className="w-full border-dashed border-stone-300 text-stone-600 gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add category
        </Button>
      )}

      {categories.length < min && (
        <p className="text-xs text-red-500">
          At least {min} categories are required ({min - categories.length} more needed).
        </p>
      )}
    </div>
  );
}
