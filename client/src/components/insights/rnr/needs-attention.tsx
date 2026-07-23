import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NEEDS_ATTENTION, type AttentionItem } from "@/lib/rnr-insights-data";

const DOT: Record<AttentionItem["severity"], string> = {
  high: "bg-rose-600",
  medium: "bg-amber-500",
  low: "bg-stone-300",
};

export function NeedsAttention() {
  return (
    <section className="bg-white rounded-2xl border border-border p-4 md:p-5">
      <header className="flex items-center justify-between mb-1">
        <h2 className="font-mobile font-semibold text-foreground">Needs Attention</h2>
        <Link to="/recognitions" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5">
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </header>

      <ul className="divide-y divide-border">
        {NEEDS_ATTENTION.map((item) => {
          const inner = (
            <div className="py-3 flex items-start gap-3">
              <span className={cn("mt-1.5 w-2 h-2 rounded-full shrink-0", DOT[item.severity])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mobile font-semibold text-foreground leading-snug">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.body}</p>
              </div>
              {item.href && <ChevronRight className="w-4 h-4 text-muted-foreground mt-1.5 shrink-0" />}
            </div>
          );
          if (!item.href) return <li key={item.id}>{inner}</li>;
          return (
            <li key={item.id}>
              <Link to={item.href} className="block hover:bg-muted transition-colors -mx-2 px-2 rounded-lg">
                {inner}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
