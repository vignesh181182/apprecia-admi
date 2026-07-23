import { Search, SlidersHorizontal } from "lucide-react";
import { EmployeeLayout } from "@/components/employee-layout";
import { PointsBanner } from "@/components/rewards/points-banner";
import { CategorySection } from "@/components/rewards/category-section";
import { RewardsRightRail } from "@/components/rewards/rewards-right-rail";
import { REWARD_CATEGORIES } from "@/lib/rewards-data";

export default function MobileRewards() {
  return (
    <EmployeeLayout rightRail={<RewardsRightRail />}>
      <div className="px-5 md:px-0 pt-3 md:pt-0 pb-6 space-y-4">
        <div className="md:hidden">
          <PointsBanner />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search rewards…"
              className="w-full h-11 pl-10 pr-4 rounded-full bg-primary/40 border border-border focus:bg-white focus:border-border focus:outline-none text-sm text-foreground placeholder:text-muted-foreground transition-colors"
            />
          </div>
          <button
            type="button"
            className="w-11 h-11 rounded-full bg-primary/40 border border-border hover:bg-white hover:border-border flex items-center justify-center transition-colors"
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {REWARD_CATEGORIES.map((cat) => (
            <CategorySection key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </EmployeeLayout>
  );
}
