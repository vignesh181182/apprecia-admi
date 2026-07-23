import { ChevronRight } from "lucide-react";
import { LEADERBOARD } from "@/lib/mobile-data";

export function MobileLeaderboard() {
  return (
    <section className="bg-white rounded-2xl border border-border/70 shadow-sm py-5">
      <header className="px-5 flex items-center justify-between mb-4">
        <h2 className="font-mobile font-semibold text-foreground text-base">
          Ranks <span className="text-muted-foreground font-normal">– This Month</span>
        </h2>
        <button className="p-1 -mr-1 rounded-full hover:bg-muted" aria-label="See all">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      <div className="overflow-x-auto -mx-1 px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ol className="flex gap-3">
          {LEADERBOARD.map((entry) => (
            <li
              key={entry.rank}
              className="relative shrink-0 w-44 rounded-2xl bg-muted border border-border p-3"
            >
              <span className="absolute top-3 left-3 inline-flex items-center justify-center min-w-[24px] h-[22px] rounded-md bg-primary text-primary-foreground text-[11px] font-semibold px-1.5">
                {entry.rank}
              </span>
              <div className="flex flex-col items-center pt-3">
                <img
                  src={entry.avatar}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <p className="mt-3 text-sm font-mobile font-semibold text-foreground text-center truncate max-w-full">
                  {entry.name}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-0.5 truncate max-w-full">
                  {entry.role}
                </p>
                <p className="text-xs font-semibold text-primary mt-1.5">
                  {entry.points} pts
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
