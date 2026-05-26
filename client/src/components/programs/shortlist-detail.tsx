import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { panelApprovalRatio, type ShortlistEntry } from "@/lib/ai-shortlister";
import type { Nomination } from "@/lib/programs-data";

export function ShortlistDetail({
  entry,
  nomination,
  panelSize,
}: {
  entry: ShortlistEntry;
  nomination: Nomination;
  panelSize: number;
}) {
  const ratio = panelApprovalRatio(nomination.id, panelSize);
  const approved = panelSize > 0 ? Math.max(1, Math.round(ratio * panelSize)) : 0;

  return (
    <>
      <SheetHeader className="text-left">
        <SheetTitle className="font-mobile">
          #{entry.rank} · {nomination.nomineeName}
          <span className="ml-2 text-sm font-normal text-stone-500 tabular-nums">
            {entry.score}/100
          </span>
        </SheetTitle>
      </SheetHeader>

      <div className="mt-4 space-y-4 text-sm text-stone-700">
        <section>
          <p className="font-mobile font-semibold text-stone-900 mb-1">Reasoning</p>
          <p className="leading-relaxed">{entry.reasoning}</p>
        </section>

        {entry.highlights.length > 0 && (
          <section>
            <p className="font-mobile font-semibold text-stone-900 mb-1">Highlights</p>
            <ul className="list-disc pl-5 space-y-1">
              {entry.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </section>
        )}

        {nomination.managerName && (
          <section>
            <p className="font-mobile font-semibold text-stone-900 mb-1">
              Manager review
            </p>
            <p>
              Approved by{" "}
              <span className="font-medium text-stone-900">{nomination.managerName}</span>
              {nomination.decidedAt &&
                ` on ${new Date(nomination.decidedAt).toLocaleDateString()}`}
              .
            </p>
          </section>
        )}

        {panelSize > 0 && (
          <section>
            <p className="font-mobile font-semibold text-stone-900 mb-1">
              Panel vote tally
            </p>
            <p>
              {approved} of {panelSize} panel member{panelSize === 1 ? "" : "s"} approved
              this nomination.
            </p>
          </section>
        )}

        <section className="pt-2 border-t border-stone-100">
          <p className="font-mobile font-semibold text-stone-900 mb-1">
            Original nomination
          </p>
          <p className="leading-relaxed">{nomination.reason}</p>
          <p className="text-xs text-stone-500 mt-2">
            Nominated by{" "}
            <span className="font-medium text-stone-700">{nomination.nominatorName}</span>
          </p>
        </section>
      </div>
    </>
  );
}
