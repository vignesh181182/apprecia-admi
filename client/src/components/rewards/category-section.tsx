import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProductTile } from "./product-tile";
import { getProductsByCategory, type RewardCategory } from "@/lib/rewards-data";

export function CategorySection({ category }: { category: RewardCategory }) {
  const products = getProductsByCategory(category.id);

  return (
    <section className="bg-white rounded-2xl border border-border/70 p-4">
      <header className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-mobile font-semibold text-foreground text-base">
            {category.name}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {category.itemCount.toLocaleString()} items
          </p>
        </div>
        <Link
          to={`/m/rewards?category=${category.id}`}
          aria-label={`See all ${category.name}`}
          className="w-9 h-9 rounded-full bg-muted hover:bg-muted flex items-center justify-center transition-colors"
        >
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </Link>
      </header>

      <div className="overflow-x-auto -mx-1 px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex gap-3">
          {products.map((p) => (
            <li key={p.id}>
              <ProductTile product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
