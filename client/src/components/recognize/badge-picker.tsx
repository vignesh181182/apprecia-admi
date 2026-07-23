import { cn } from "@/lib/utils";
import { BADGE_CATEGORIES, type RecognizeBadge } from "@/lib/recognize-data";

export function BadgePicker({
  selectedId,
  onSelect,
  layout = "list",
}: {
  selectedId?: string;
  onSelect: (badge: RecognizeBadge) => void;
  layout?: "list" | "grid";
}) {
  return (
    <div className="space-y-5">
      {BADGE_CATEGORIES.map((cat) => (
        <section key={cat.id}>
          <h3 className="font-mobile font-semibold text-foreground text-sm mb-2">{cat.name}</h3>
          <div className={cn(layout === "grid" ? "grid grid-cols-2 gap-2" : "space-y-2")}>
            {cat.badges.map((b) => {
              const selected = b.id === selectedId;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onSelect(b)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors border",
                    selected
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/40 border-transparent hover:bg-muted/60",
                  )}
                >
                  <span className="text-2xl shrink-0">{b.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-mobile font-semibold text-primary truncate">{b.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{b.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
