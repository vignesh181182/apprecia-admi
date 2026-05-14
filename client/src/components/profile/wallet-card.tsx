import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, Gift, Info } from "lucide-react";
import { getAccount } from "@/lib/account";
import { currentEmployee } from "@/lib/recognize-data";
import { getWallet, type Wallet as WalletShape } from "@/lib/wallet";
import { isMonetaryActive } from "@/lib/appreciation-policy";

function nextPeriodResetDate(now: Date = new Date()): Date {
  // 1st of the next month, local time.
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function formatResetDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function WalletCard() {
  const account = getAccount();
  const employee = useMemo(() => currentEmployee(account?.adminEmail), [account]);
  const monetary = isMonetaryActive(account);

  const [wallet, setWallet] = useState<WalletShape | null>(() =>
    monetary && employee ? getWallet(employee.id, "employee", account) : null,
  );

  useEffect(() => {
    if (!monetary || !employee) return;
    function refresh() {
      setWallet(getWallet(employee!.id, "employee", account));
    }
    refresh();
    window.addEventListener("storage", refresh);
    const timer = window.setInterval(refresh, 3000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(timer);
    };
  }, [monetary, employee, account]);

  if (!monetary) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
          <Info className="w-4 h-4 text-stone-600" />
        </div>
        <div>
          <p className="text-sm font-mobile font-semibold text-stone-900">Monetary recognition is disabled</p>
          <p className="text-xs text-stone-600 mt-0.5">
            Badges are recorded but no points are credited. Your HR admin will let you know when this changes.
          </p>
        </div>
      </div>
    );
  }

  if (!wallet) return null;

  const givePct =
    wallet.giveAllowance > 0
      ? Math.min(100, Math.round((wallet.giveBalance / wallet.giveAllowance) * 100))
      : 0;
  const resetAt = nextPeriodResetDate();

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-700" />
            <p className="text-[11px] font-mobile font-semibold text-amber-800 uppercase tracking-wide">Receive</p>
          </div>
          <p className="text-2xl font-mobile font-bold text-stone-900 leading-none">
            {wallet.receiveBalance.toLocaleString()}
            <span className="text-sm font-semibold text-stone-500 ml-1">pts</span>
          </p>
          <Link
            to="/m/rewards"
            className="mt-1 inline-flex items-center justify-center h-8 rounded-full bg-[#a87a3a] text-white text-xs font-mobile font-semibold hover:bg-[#8e6730] transition-colors"
          >
            Redeem
          </Link>
        </div>

        <div className="rounded-xl bg-stone-50 border border-stone-200 p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-stone-600" />
            <p className="text-[11px] font-mobile font-semibold text-stone-600 uppercase tracking-wide">Give this month</p>
          </div>
          <p className="text-2xl font-mobile font-bold text-stone-900 leading-none">
            {wallet.giveBalance.toLocaleString()}
            <span className="text-sm font-semibold text-stone-500 ml-1">
              / {wallet.giveAllowance.toLocaleString()}
            </span>
          </p>
          <div className="h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full bg-[#465853] transition-all"
              style={{ width: `${givePct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-500">
        <span>Lifetime received: <strong className="text-stone-700">{wallet.lifetimeReceived.toLocaleString()} pts</strong></span>
        <span>Period resets {formatResetDate(resetAt)}</span>
      </div>
    </div>
  );
}
