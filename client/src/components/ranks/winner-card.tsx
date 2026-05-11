import type { LeaderboardEntry } from "@/lib/mobile-data";

export function WinnerCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#f4d3b8] via-[#f0d2bd] to-[#e8c4a0] p-3">
      <Confetti />

      <div className="relative flex items-center gap-3">
        <img
          src={entry.avatar}
          alt={entry.name}
          className="w-24 h-24 rounded-2xl object-cover shadow-sm shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 mb-1">
            <CrownIcon className="w-5 h-5 text-amber-700" />
            <span className="font-mobile font-semibold text-[#a87a3a] text-sm">
              No.1
            </span>
          </div>
          <p className="font-mobile font-semibold text-stone-900 text-base leading-tight truncate">
            {entry.name}
          </p>
          <p className="text-xs text-stone-700/80 mt-0.5 truncate">{entry.role}</p>
          <p className="font-mobile font-semibold text-stone-900 text-base mt-1.5">
            {entry.points} <span className="text-xs font-normal text-stone-600">pts</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 7l4 4 5-7 5 7 4-4-2 12H5L3 7z"
        fill="#fbbf24"
        stroke="#92400e"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="3" cy="7" r="1.2" fill="#92400e" />
      <circle cx="21" cy="7" r="1.2" fill="#92400e" />
      <circle cx="12" cy="3.5" r="1.2" fill="#92400e" />
    </svg>
  );
}

function Confetti() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      viewBox="0 0 360 140"
      preserveAspectRatio="xMaxYMin slice"
    >
      <g stroke="#a87a3a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5">
        <path d="M260 8c4 6 12 10 22 8" />
        <path d="M280 26c6 4 14 4 22-2" />
        <path d="M250 36c8 8 20 8 30 0" />
        <path d="M310 14c4 4 10 4 16 0" />
        <path d="M295 50c6 6 16 4 22-2" />
      </g>
      <g fill="#fff" opacity="0.6">
        <circle cx="240" cy="20" r="2" />
        <circle cx="320" cy="40" r="1.5" />
        <circle cx="280" cy="70" r="2" />
        <circle cx="340" cy="20" r="1.5" />
        <circle cx="262" cy="55" r="1" />
      </g>
    </svg>
  );
}
