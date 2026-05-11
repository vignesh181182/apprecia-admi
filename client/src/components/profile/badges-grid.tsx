import { BADGE_IMAGE, type EarnedBadge } from "@/lib/mobile-data";

export function BadgesGrid({ badges }: { badges: EarnedBadge[] }) {
  if (badges.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
        <p className="text-sm text-stone-600">No badges earned yet.</p>
        <p className="text-xs text-stone-400 mt-1">
          Get recognized to earn your first badge.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {badges.map((b, i) => (
        <div
          key={`${b.badge}-${i}`}
          className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col items-center text-center"
        >
          <img src={BADGE_IMAGE[b.badge]} alt={b.label} className="w-24 h-24 object-contain" />
          <p className="mt-2 font-mobile font-semibold text-amber-800 text-sm">{b.label}</p>
          <p className="text-xs text-stone-500 mt-0.5">From {b.earnedFrom}</p>
          <p className="text-[11px] text-stone-400 mt-0.5">
            {new Date(b.earnedDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
