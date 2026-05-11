import { Sparkles } from "lucide-react";
import { MY_POINTS } from "@/lib/rewards-data";

export function PointsBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-full bg-gradient-to-r from-amber-50 via-amber-100/80 to-amber-200/60 border border-amber-100 px-4 py-3 flex items-center gap-3"
    >
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-2/3 pointer-events-none opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 90% 50%, rgba(255,210,140,0.65), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute right-6 top-1/2 -translate-y-1/2 text-amber-300/70 pointer-events-none"
      >
        <Sparkles className="w-5 h-5" />
      </div>

      <div className="relative w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path
            d="M12 2L19 6V14L12 18L5 14V6L12 2Z"
            fill="#fbbf24"
            stroke="#92400e"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M9 10L12 13L15 10"
            stroke="#92400e"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="relative flex items-baseline gap-1.5 min-w-0">
        <span className="font-mobile text-xl font-semibold text-stone-900 tabular-nums">
          {MY_POINTS.toLocaleString()}
        </span>
        <span className="text-sm text-stone-600 truncate">points to redeem</span>
      </div>
    </div>
  );
}
