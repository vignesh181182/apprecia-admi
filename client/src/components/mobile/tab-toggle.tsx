import { cn } from "@/lib/utils";
import type { FeedKind } from "@/lib/mobile-data";

type Props = {
  value: FeedKind;
  onChange: (v: FeedKind) => void;
  rnrEnabled: boolean;
};

export function MobileTabToggle({ value, onChange, rnrEnabled }: Props) {
  return (
    <div className="flex bg-stone-100 rounded-full p-1">
      <button
        type="button"
        onClick={() => onChange("appreciation")}
        className={cn(
          "flex-1 h-9 rounded-full text-sm font-mobile font-semibold transition-colors",
          value === "appreciation"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-500 hover:text-stone-700",
        )}
      >
        Appreciation
      </button>
      <button
        type="button"
        onClick={() => rnrEnabled && onChange("rnr")}
        disabled={!rnrEnabled}
        className={cn(
          "flex-1 h-9 rounded-full text-sm font-mobile font-semibold transition-colors",
          value === "rnr" && rnrEnabled
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-500 hover:text-stone-700",
          !rnrEnabled && "opacity-50 cursor-not-allowed",
        )}
        title={rnrEnabled ? undefined : "Rewards & Recognition isn't enabled for your company"}
      >
        RnR
      </button>
    </div>
  );
}
