import { cn } from "@/lib/utils";

export type ProfileTab = "received" | "given" | "badges";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "given", label: "Given" },
  { key: "badges", label: "Badges" },
];

export function ProfileTabs({
  value,
  onChange,
  counts,
}: {
  value: ProfileTab;
  onChange: (v: ProfileTab) => void;
  counts?: Partial<Record<ProfileTab, number>>;
}) {
  return (
    <div className="flex border-b border-stone-200">
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              "relative h-11 px-4 text-sm font-mobile font-semibold transition-colors",
              active ? "text-[#a87a3a]" : "text-stone-600 hover:text-stone-900",
            )}
          >
            <span>{t.label}</span>
            {counts?.[t.key] != null && (
              <span
                className={cn(
                  "ml-1.5 text-xs font-medium",
                  active ? "text-[#a87a3a]" : "text-stone-400",
                )}
              >
                {counts[t.key]}
              </span>
            )}
            <span
              className={cn(
                "absolute left-2 right-2 -bottom-px h-0.5 rounded-full transition-all",
                active ? "bg-[#a87a3a]" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
