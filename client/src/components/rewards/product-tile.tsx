import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import type { RewardProduct } from "@/lib/rewards-data";

export function ProductTile({ product, size = "md" }: { product: RewardProduct; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-24 h-24" : "w-32 h-32 md:w-40 md:h-40";

  return (
    <Link
      to={`/m/rewards/${product.id}`}
      className="group shrink-0 flex flex-col items-start"
    >
      <div
        className={`${dim} rounded-2xl overflow-hidden flex items-center justify-center relative`}
        style={{ background: product.imageBg }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <span className="text-[10px] font-mobile font-semibold text-white/80 px-2 text-center leading-tight">
            {product.name}
          </span>
        )}
      </div>
      <div className="mt-1.5 max-w-[10rem]">
        <p className="text-xs text-stone-700 line-clamp-1 group-hover:text-stone-900">
          {product.name}
        </p>
        <p className="text-xs font-semibold text-amber-800 mt-0.5 inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {product.points.toLocaleString()} pts
        </p>
      </div>
    </Link>
  );
}
