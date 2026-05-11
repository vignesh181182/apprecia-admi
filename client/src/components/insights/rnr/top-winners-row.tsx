import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TOP_WINNERS } from "@/lib/rnr-insights-data";

export function TopWinnersRow() {
  return (
    <section>
      <header className="flex items-center justify-between mb-3">
        <h2 className="font-mobile font-semibold text-stone-900">Top winners</h2>
        <Link to="/employees" className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-0.5">
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </header>

      <div className="overflow-x-auto -mx-5 px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0">
        <ul className="flex gap-3">
          {TOP_WINNERS.map((w) => (
            <li
              key={w.id}
              className="shrink-0 w-36 bg-amber-50/50 border border-stone-100 rounded-2xl p-3 flex flex-col items-center text-center"
            >
              <img src={w.avatar} alt="" className="w-20 h-20 rounded-xl object-cover" />
              <p className="mt-2.5 text-sm font-mobile font-semibold text-[#a87a3a] leading-tight truncate w-full">
                {w.name}
              </p>
              <p className="text-xs text-stone-600 truncate w-full mt-0.5">{w.role}</p>
              <p className="text-[11px] text-stone-500 truncate w-full mt-1">{w.programName}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
