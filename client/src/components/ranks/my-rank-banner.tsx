import { getAccount } from "@/lib/account";
import { MY_RANK } from "@/lib/mobile-data";

export function MyRankBanner({ inline }: { inline?: boolean }) {
  const account = getAccount();
  const initial = (account?.adminName?.[0] || "Y").toUpperCase();

  const banner = (
    <div className="bg-[#a87a3a] rounded-full px-3 py-2 flex items-center gap-3 text-white shadow-md">
      <span className="w-9 h-9 rounded-full bg-white text-[#a87a3a] text-sm font-mobile font-semibold flex items-center justify-center shrink-0">
        {MY_RANK.rank}
      </span>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="font-mobile font-semibold">You</span>
        <span className="w-1 h-1 rounded-full bg-white/60" />
        <span className="font-mobile font-semibold">
          {MY_RANK.points} <span className="font-normal opacity-80">points</span>
        </span>
      </div>
      <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold shrink-0">
        {initial}
      </span>
    </div>
  );

  if (inline) return banner;

  return (
    <div className="md:hidden fixed inset-x-0 z-30 px-5 pointer-events-none" style={{ bottom: "calc(72px + 16px + max(16px, env(safe-area-inset-bottom)) + 12px)" }}>
      <div className="pointer-events-auto max-w-md mx-auto">{banner}</div>
    </div>
  );
}
