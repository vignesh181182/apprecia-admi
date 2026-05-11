import type { LeaderboardEntry } from "@/lib/mobile-data";

export function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="relative bg-stone-100 rounded-2xl p-3 flex flex-col items-center text-center">
      <span className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white text-stone-700 text-xs font-mobile font-semibold flex items-center justify-center shadow-sm">
        {entry.rank}
      </span>
      <img
        src={entry.avatar}
        alt={entry.name}
        className="w-20 h-20 rounded-2xl object-cover mt-1 shadow-sm"
      />
      <p className="mt-2.5 font-mobile font-semibold text-[#a87a3a] text-sm leading-tight">
        {entry.name}
      </p>
      <p className="text-xs text-stone-500 mt-0.5">{entry.role}</p>
      <p className="font-mobile font-semibold text-stone-900 mt-1.5 text-base">
        {entry.points}{" "}
        <span className="text-xs font-normal text-stone-500">pts</span>
      </p>
    </div>
  );
}
