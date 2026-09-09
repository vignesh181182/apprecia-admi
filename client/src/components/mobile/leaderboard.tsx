import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LEADERBOARD, type LeaderboardEntry } from "@/lib/mobile-data";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────
// Podium tiers. The hue here *is* the rank — gold / silver / bronze is the
// universally-read podium order — so ranks 2 and 3 are categorical colours
// rather than theme tokens. Rank 1 stays on `primary` so the champion card
// always carries the client's brand colour.
// ──────────────────────────────────────────────────────────────────────
interface Tier {
  /** Card surface + border. */
  card: string;
  /** Drives the wreath, hexagon fill and avatar ring via `currentColor`. */
  accent: string;
  /** Number inside the hexagon. */
  badgeText: string;
  /** Points pill. */
  pill: string;
}

const TIERS: Record<number, Tier> = {
  1: {
    card: "bg-primary-soft border-primary",
    accent: "text-primary",
    badgeText: "text-primary-foreground",
    pill: "bg-primary-soft text-primary",
  },
  2: {
    card: "bg-slate-50 border-slate-200", // theme-allow — silver, 2nd place
    accent: "text-slate-400", // theme-allow — silver, 2nd place
    badgeText: "text-white",
    pill: "bg-slate-100 text-slate-600", // theme-allow — silver, 2nd place
  },
  3: {
    card: "bg-orange-50 border-orange-200", // theme-allow — bronze, 3rd place
    accent: "text-orange-500", // theme-allow — bronze, 3rd place
    badgeText: "text-white",
    pill: "bg-orange-100 text-orange-700", // theme-allow — bronze, 3rd place
  },
};

export function MobileLeaderboard() {
  const [first, second, third] = LEADERBOARD;

  // The 468px width mirrors the fixed frame AppreciationCardExact renders at,
  // so the ranks card lines up with the appreciation cards above and below it.
  return (
    <section className="mx-auto w-[468px] bg-white rounded-2xl border border-border shadow-sm p-5">
      <header className="flex items-center justify-between">
        <h2 className="font-mobile font-semibold text-foreground text-base">
          Ranks <span className="text-muted-foreground font-normal">– This Month</span>
        </h2>
        <Link
          to="/m/ranks"
          className="p-1 -mr-1 rounded-full hover:bg-muted"
          aria-label="See all ranks"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </header>

      <div className="mt-7">
        <PodiumCard entry={first} featured />

        <div className="grid grid-cols-2 gap-3 mt-7">
          <PodiumCard entry={second} />
          <PodiumCard entry={third} />
        </div>
      </div>
    </section>
  );
}

function PodiumCard({
  entry,
  featured = false,
}: {
  entry: LeaderboardEntry;
  featured?: boolean;
}) {
  const tier = TIERS[entry.rank] ?? TIERS[3];

  return (
    <div
      className={cn(
        "relative rounded-2xl border text-center",
        tier.card,
        featured ? "px-4 pt-7 pb-5" : "px-2.5 pt-6 pb-4",
      )}
    >
      {/* Hexagon rank badge, straddling the top edge of the card */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2",
          tier.accent,
          featured ? "-top-4 w-9" : "-top-3.5 w-7",
        )}
      >
        <Hexagon className="w-full h-auto" />
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-mobile font-semibold",
            tier.badgeText,
            featured ? "text-sm" : "text-xs",
          )}
        >
          {entry.rank}
        </span>
      </div>

      {/* Laurel wreath cradling the avatar */}
      <div
        className={cn(
          "relative mx-auto",
          featured ? "w-[9.5rem] h-[9.5rem]" : "w-[5.5rem] h-[5.5rem]",
        )}
      >
        <Wreath className={cn("absolute inset-0 w-full h-full", tier.accent)} />
        <img
          src={entry.avatar}
          alt={entry.name}
          className={cn(
            "absolute inset-[15%] w-[70%] h-[70%] rounded-full object-cover ring-2 ring-current",
            tier.accent,
          )}
        />
      </div>

      <p
        className={cn(
          "font-mobile font-semibold text-foreground leading-tight truncate",
          featured ? "mt-3 text-base" : "mt-2 text-[13px]",
        )}
      >
        {entry.name}
      </p>
      <p
        className={cn(
          "text-muted-foreground leading-snug truncate",
          featured ? "mt-1 text-xs" : "mt-0.5 text-[11px]",
        )}
      >
        {entry.role}
      </p>

      <p
        className={cn(
          "inline-flex items-baseline gap-1 rounded-full font-mobile font-semibold",
          tier.pill,
          featured ? "mt-3 px-4 py-1.5 text-base" : "mt-2 px-3 py-1 text-[13px]",
        )}
      >
        {entry.points}
        <span className={cn("font-normal", featured ? "text-xs" : "text-[10px]")}>pts</span>
      </p>
    </div>
  );
}

function Hexagon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 36" className={className} aria-hidden>
      <path
        d="M16 0.7 30.3 9v18L16 35.3 1.7 27V9z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Two mirrored laurel branches sweeping from the bottom of the avatar up to
 * roughly 2 o'clock. Leaves are placed in polar coordinates around the centre
 * of the 100×100 viewBox so the wreath stays concentric with the avatar at any
 * size. Everything inherits `currentColor` from the tier accent.
 */
function Wreath({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <g>{branch()}</g>
      <g transform="translate(100,0) scale(-1,1)">{branch()}</g>

      {/* confetti flecks */}
      <g fill="currentColor" opacity="0.45">
        <rect x="12" y="24" width="4" height="4" rx="1" transform="rotate(-25 14 26)" />
        <rect x="84" y="30" width="3.5" height="3.5" rx="1" transform="rotate(20 86 32)" />
        <circle cx="20" cy="12" r="1.8" />
        <circle cx="79" cy="14" r="1.5" />
      </g>
    </svg>
  );
}

function branch() {
  const point = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return [50 + radius * Math.cos(rad), 50 + radius * Math.sin(rad)] as const;
  };

  // Stem: an arc from just right of the bottom (88°) up to the upper right (-38°).
  const [sx, sy] = point(88, 41);
  const [ex, ey] = point(-38, 41);

  // Seven leaves fanning outward, tapering toward the tip of the branch. The
  // sweep stops short of the top so the two branches stay open rather than
  // closing into a ring.
  const leaves = Array.from({ length: 7 }, (_, i) => {
    const angle = 84 - i * 19;
    const [x, y] = point(angle, 46.5);
    return { x, y, rot: angle - 55, rx: 8 - i * 0.65, ry: 3.8 - i * 0.22 };
  });

  return (
    <>
      <path
        d={`M ${sx.toFixed(2)} ${sy.toFixed(2)} A 41 41 0 0 0 ${ex.toFixed(2)} ${ey.toFixed(2)}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {leaves.map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.x}
          cy={leaf.y}
          rx={leaf.rx}
          ry={leaf.ry}
          fill="currentColor"
          transform={`rotate(${leaf.rot.toFixed(1)} ${leaf.x.toFixed(2)} ${leaf.y.toFixed(2)})`}
        />
      ))}
    </>
  );
}
