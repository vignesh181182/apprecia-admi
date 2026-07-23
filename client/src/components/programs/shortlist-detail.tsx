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
          <span className="ml-2 text-sm font-normal text-muted-foreground tabular-nums">
            {entry.score}/100
          </span>
        </SheetTitle>
      </SheetHeader>

      <div className="mt-4 space-y-4 text-sm text-muted-foreground">
        <section>
          <p className="font-mobile font-semibold text-foreground mb-1">Reasoning</p>
          <p className="leading-relaxed">{entry.reasoning}</p>
        </section>

        {entry.highlights.length > 0 && (
          <section>
            <p className="font-mobile font-semibold text-foreground mb-1">Highlights</p>
            <ul className="list-disc pl-5 space-y-1">
              {entry.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </section>
        )}

        {entry.criteriaBreakdown.length > 0 && (
          <section>
            <p className="font-mobile font-semibold text-foreground mb-2">
              Scored against the rubric
            </p>
            <ul className="space-y-2">
              {entry.criteriaBreakdown.map((c) => (
                <li key={c.criterionId}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {c.label}{" "}
                      <span className="text-muted-foreground">· weight {c.weight}</span>
                    </span>
                    <span className="tabular-nums text-foreground font-medium">
                      {c.score}/100
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.score >= 70
                          ? "bg-success"
                          : c.score >= 40
                            ? "bg-primary"
                            : "bg-stone-400"
                      }`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {nomination.managerName && (
          <section>
            <p className="font-mobile font-semibold text-foreground mb-1">
              Manager review
            </p>
            <p>
              Approved by{" "}
              <span className="font-medium text-foreground">{nomination.managerName}</span>
              {nomination.decidedAt &&
                ` on ${new Date(nomination.decidedAt).toLocaleDateString()}`}
              .
            </p>
          </section>
        )}

        {panelSize > 0 && (
          <section>
            <p className="font-mobile font-semibold text-foreground mb-1">
              Panel vote tally
            </p>
            <p>
              {approved} of {panelSize} panel member{panelSize === 1 ? "" : "s"} approved
              this nomination.
            </p>
          </section>
        )}

        <section className="pt-2 border-t border-border">
          <p className="font-mobile font-semibold text-foreground mb-1">
            Original nomination
          </p>
          <p className="leading-relaxed">{nomination.reason}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Nominated by{" "}
            <span className="font-medium text-muted-foreground">{nomination.nominatorName}</span>
          </p>
        </section>
      </div>
    </>
  );
}
