import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { APPROVAL_QUEUE } from "@/lib/rnr-insights-data";

export function ApprovalQueueCard() {
  return (
    <section className="bg-white rounded-2xl border border-border p-4 md:p-5">
      <header className="flex items-center gap-2 mb-3">
        <span className="w-7 h-7 rounded-full bg-info/10 flex items-center justify-center border border-info/15">
          <Clock className="w-4 h-4 text-info" />
        </span>
        <h2 className="font-mobile font-semibold text-foreground">Pending approvals</h2>
      </header>

      <div className="flex items-baseline gap-3">
        <p className="font-mobile text-3xl font-semibold text-foreground tabular-nums leading-none">
          {APPROVAL_QUEUE.pending}
        </p>
        <p className="text-xs text-muted-foreground">
          oldest <span className="font-semibold text-muted-foreground">{APPROVAL_QUEUE.oldestDays} days</span> old
        </p>
      </div>

      <Link
        to="/recognitions"
        className="mt-4 inline-flex items-center gap-1 text-sm font-mobile font-semibold text-primary hover:text-primary/90"
      >
        Review queue <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}
