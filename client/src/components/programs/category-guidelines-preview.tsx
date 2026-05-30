import type { ProgramCategory } from "@/lib/programs-data";
import { renderRichText } from "@/components/ui/rich-textarea";

/**
 * Phase 1.8 — inline preview of a category's rubric.
 *
 * Shows the summary, criteria with weights, "what good looks like", and any
 * disqualifiers. Used inside the nominate dialog (so nominators can write
 * toward the rubric) and the panel review page (so judges score against it).
 *
 * Renders nothing when guidelines aren't set.
 */
export function CategoryGuidelinesPreview({
  category,
  compact = false,
}: {
  category: Pick<ProgramCategory, "name" | "emoji" | "guidelines" | "eligibility">;
  /** When true, hides the long "What good looks like" prose. */
  compact?: boolean;
}) {
  const g = category.guidelines;
  if (!g) return null;

  return (
    <section className="space-y-3 text-sm text-stone-700">
      <header className="flex items-center gap-2">
        <span className="text-xl">{category.emoji}</span>
        <div className="min-w-0">
          <p className="font-mobile font-semibold text-stone-900 truncate">
            {category.name}
          </p>
          {g.summary && (
            <p className="text-xs text-stone-600 leading-snug">{g.summary}</p>
          )}
        </div>
      </header>

      {g.criteria.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
            Scored on
          </p>
          <ul className="space-y-1.5">
            {g.criteria.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-xs">
                <span className="inline-flex items-center justify-center min-w-[2.25rem] h-5 px-1.5 rounded bg-stone-100 text-stone-700 tabular-nums font-medium">
                  {c.weight}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-stone-900">{c.label}</p>
                  {c.description && (
                    <p className="text-stone-600 leading-snug">{c.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!compact && g.whatGoodLooksLike && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1">
            What good looks like
          </p>
          <div
            className="text-xs text-stone-700 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={renderRichText(g.whatGoodLooksLike)}
          />
        </div>
      )}

      {g.disqualifiers && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2">
          <p className="text-xs font-semibold text-amber-900">Disqualifiers</p>
          <p className="text-xs text-amber-900 leading-snug mt-0.5">
            {g.disqualifiers}
          </p>
        </div>
      )}

      {category.eligibility?.customNote && (
        <p className="text-xs italic text-stone-500">
          {category.eligibility.customNote}
        </p>
      )}
    </section>
  );
}
