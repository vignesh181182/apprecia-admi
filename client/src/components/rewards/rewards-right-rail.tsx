import { Link } from "react-router-dom";
import { Flame, ArrowUpRight } from "lucide-react";
import { PointsBanner } from "./points-banner";
import { getTrendingProducts } from "@/lib/rewards-data";

export function RewardsRightRail() {
  const trending = getTrendingProducts(5);

  return (
    <aside className="sticky top-[80px] py-2 space-y-4">
      <div className="rounded-2xl">
        <PointsBanner />
      </div>

      <section className="bg-white rounded-2xl border border-stone-200 p-4">
        <header className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-amber-700" />
            </span>
            <h3 className="text-sm font-semibold text-stone-900">Trending now</h3>
          </div>
          <Link
            to="/m/rewards"
            className="text-xs text-stone-500 hover:text-stone-900"
          >
            See all
          </Link>
        </header>

        <ol className="space-y-2.5">
          {trending.map((p) => (
            <li key={p.id}>
              <Link
                to={`/m/rewards/${p.id}`}
                className="group flex items-center gap-3 -mx-1 px-1 py-1 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                  style={{ background: p.imageBg }}
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-stone-900 truncate group-hover:text-amber-900">
                    {p.name}
                  </p>
                  <p className="text-xs text-stone-500 inline-flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                    {p.redemptions} redemptions
                  </p>
                </div>
                <span className="text-xs font-semibold text-amber-800 shrink-0">
                  {p.points.toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
