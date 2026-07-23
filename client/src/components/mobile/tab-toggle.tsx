import { cn } from "@/lib/utils";
import type { FeedKind } from "@/lib/mobile-data";

type Props = {
  value: FeedKind;
  onChange: (v: FeedKind) => void;
  rnrEnabled: boolean;
};

export function MobileTabToggle({ value, onChange, rnrEnabled }: Props) {
  return (
    <div className="flex bg-muted rounded-full p-1">
      <button
        type="button"
        onClick={() => onChange("appreciation")}
        className={cn(
          "flex-1 h-9 rounded-full text-sm font-mobile font-semibold transition-colors",
          value === "appreciation"
            ? "bg-white text-foreground shadow-sm"
            : "text-muted-foreground hover:text-muted-foreground",
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
            ? "bg-white text-foreground shadow-sm"
            : "text-muted-foreground hover:text-muted-foreground",
          !rnrEnabled && "opacity-50 cursor-not-allowed",
        )}
        title={rnrEnabled ? undefined : "Rewards & Recognition isn't enabled for your company"}
      >
        RnR
      </button>
    </div>
  );
}
