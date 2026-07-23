import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, Gift, Info } from "lucide-react";
import { getAccount } from "@/lib/account";
import { currentEmployee } from "@/lib/recognize-data";
import { getWallet, type Wallet as WalletShape } from "@/lib/wallet";
import { isMonetaryActive } from "@/lib/appreciation-policy";

// Compare wallets by value so we can bail out of setState when nothing has
// actually changed. getWallet() returns a fresh object on every call (it
// parses JSON), so referential equality alone would force a re-render on
// every poll tick.
function walletsEqual(a: WalletShape | null, b: WalletShape | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.userId === b.userId &&
    a.period === b.period &&
    a.giveBalance === b.giveBalance &&
    a.giveAllowance === b.giveAllowance &&
    a.receiveBalance === b.receiveBalance &&
    a.lifetimeReceived === b.lifetimeReceived
  );
}

function nextPeriodResetDate(now: Date = new Date()): Date {
  // 1st of the next month, local time.
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function formatResetDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function WalletCard() {
  const account = getAccount();
  // adminEmail is a string — stable across renders even though getAccount()
  // returns a new object reference each call. Memoize the employee lookup
  // and the monetary flag against it so downstream effects don't churn.
  const adminEmail = account?.adminEmail ?? null;
  const employee = useMemo(() => currentEmployee(adminEmail ?? undefined), [adminEmail]);
  const monetary = isMonetaryActive(account);

  const [wallet, setWallet] = useState<WalletShape | null>(() =>
    monetary && employee ? getWallet(employee.id, "employee", account) : null,
  );

  useEffect(() => {
    if (!monetary || !employee) return;
    function refresh() {
      // Read the latest account from storage on each tick — keeping it out
      // of the dep array prevents an infinite loop, since getAccount()
      // hands back a fresh object every call.
      const next = getWallet(employee!.id, "employee", getAccount());
      setWallet((prev) => (walletsEqual(prev, next) ? prev : next));
    }
    refresh();
    window.addEventListener("storage", refresh);
    const timer = window.setInterval(refresh, 3000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(timer);
    };
  }, [monetary, employee]);

  if (!monetary) {
    return (
      <div className="rounded-2xl border border-border bg-muted p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Info className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-mobile font-semibold text-foreground">Monetary recognition is disabled</p>
          <p className="text-xs text-muted-foreground mt-0.5">
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
    <div className="rounded-2xl border border-border bg-white p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-primary/10 border border-primary/15 p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-primary" />
            <p className="text-[11px] font-mobile font-semibold text-primary uppercase tracking-wide">Receive</p>
          </div>
          <p className="text-2xl font-mobile font-bold text-foreground leading-none">
            {wallet.receiveBalance.toLocaleString()}
            <span className="text-sm font-semibold text-muted-foreground ml-1">pts</span>
          </p>
          <Link
            to="/m/rewards"
            className="mt-1 inline-flex items-center justify-center h-8 rounded-full bg-primary text-white text-xs font-mobile font-semibold hover:bg-[#8e6730] transition-colors"
          >
            Redeem
          </Link>
        </div>

        <div className="rounded-xl bg-muted border border-border p-3 flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[11px] font-mobile font-semibold text-muted-foreground uppercase tracking-wide">Give this month</p>
          </div>
          <p className="text-2xl font-mobile font-bold text-foreground leading-none">
            {wallet.giveBalance.toLocaleString()}
            <span className="text-sm font-semibold text-muted-foreground ml-1">
              / {wallet.giveAllowance.toLocaleString()}
            </span>
          </p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-[#465853] transition-all"
              style={{ width: `${givePct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Lifetime received: <strong className="text-muted-foreground">{wallet.lifetimeReceived.toLocaleString()} pts</strong></span>
        <span>Period resets {formatResetDate(resetAt)}</span>
      </div>
    </div>
  );
}
