import { Check, Crown, UserCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Program } from "@/lib/programs-data";

export function PanelTab({
  program,
  variant = "mobile",
}: {
  program: Program;
  variant?: "mobile" | "web";
}) {
  const panel = program.panel ?? [];

  if (panel.length === 0) {
    return (
      <div className={cn("space-y-3", variant === "web" && "pt-3")}>
        <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-sm font-mobile font-semibold text-stone-900">
            No panel assigned yet
          </p>
          <p className="text-xs text-stone-500 mt-1 mb-4 max-w-xs mx-auto">
            Add panel members who will review nominations and choose the winners for this
            program.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-[#a87a3a] hover:bg-[#8e6630] text-white text-sm font-mobile font-semibold transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add panel member
          </button>
        </div>
      </div>
    );
  }

  const lead = panel.find((m) => m.lead);
  const totalReviewed = panel.reduce((sum, m) => sum + m.reviewed, 0);
  const totalCapacity = panel.reduce((sum, m) => sum + m.totalToReview, 0);
  const reviewedPct =
    totalCapacity > 0 ? Math.round((totalReviewed / totalCapacity) * 100) : 0;

  return (
    <div className={cn("space-y-4", variant === "web" && "pt-3")}>
      <div className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4 text-amber-700" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mobile font-semibold text-stone-900 text-sm">
              {panel.length} panel {panel.length === 1 ? "member" : "members"}
              {lead && (
                <span className="text-stone-500 font-normal"> · led by {lead.name}</span>
              )}
            </p>
            <p className="text-xs text-stone-500 mt-0.5 leading-snug">
              These members review nominations and select the winners for this program.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-stone-600">Overall review progress</span>
            <span className="font-mobile font-semibold text-stone-900 tabular-nums">
              {totalReviewed} / {totalCapacity} reviews
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-[#a87a3a] rounded-full transition-all"
              style={{ width: `${reviewedPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-mobile font-semibold text-stone-500 uppercase tracking-wide">
            Panel members
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-mobile font-semibold text-[#a87a3a] hover:text-[#8e6630] transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add member
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {panel.map((m) => (
            <PanelMemberCard key={m.id} member={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PanelMemberCard({
  member,
}: {
  member: NonNullable<Program["panel"]>[number];
}) {
  const pct =
    member.totalToReview > 0
      ? Math.round((member.reviewed / member.totalToReview) * 100)
      : 0;
  const allDone = pct === 100;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 hover:border-stone-300 transition-colors">
      <div className="flex items-start gap-3">
        <img
          src={member.avatar}
          alt=""
          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-100"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-mobile font-semibold text-stone-900 text-sm truncate">
              {member.name}
            </p>
            {member.lead && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[10px] font-mobile font-semibold text-amber-800 uppercase tracking-wide">
                <Crown className="w-2.5 h-2.5" />
                Lead
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 mt-0.5 truncate">{member.role}</p>
          <p className="text-[11px] text-stone-500 mt-0.5 truncate">{member.department}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-stone-500">Reviews</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="font-mobile font-semibold text-stone-900 tabular-nums">
              {member.reviewed}/{member.totalToReview}
            </span>
            {allDone && (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 text-[10px] font-mobile font-semibold uppercase tracking-wide">
                <Check className="w-3 h-3" />
                Done
              </span>
            )}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              allDone ? "bg-emerald-500" : "bg-[#a87a3a]",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
