import type { LeaderboardEntry } from "@/lib/mobile-data";

export function RankRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 text-xs font-mobile font-semibold flex items-center justify-center shrink-0">
        {entry.rank}
      </span>
      <img
        src={entry.avatar}
        alt=""
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-mobile font-semibold text-stone-900 truncate">
          {entry.name}
        </p>
        <p className="text-xs text-stone-500 truncate">{entry.role}</p>
      </div>
      <p className="font-mobile font-semibold text-stone-900 shrink-0">
        {entry.points}{" "}
        <span className="text-xs font-normal text-stone-500">pts</span>
      </p>
    </div>
  );
}
