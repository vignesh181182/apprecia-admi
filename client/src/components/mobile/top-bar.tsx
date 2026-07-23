import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getAccount } from "@/lib/account";
import { currentEmployee } from "@/lib/recognize-data";
import { getWallet } from "@/lib/wallet";
import { isMonetaryActive } from "@/lib/appreciation-policy";

type Props = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
};

function useReceiveBalance(): number | null {
  const account = getAccount();
  const employee = useMemo(() => currentEmployee(account?.adminEmail), [account]);
  const monetary = isMonetaryActive(account);

  const [balance, setBalance] = useState<number | null>(() =>
    monetary && employee ? getWallet(employee.id, "employee", account).receiveBalance : null,
  );

  useEffect(() => {
    if (!monetary || !employee) {
      setBalance(null);
      return;
    }
    function refresh() {
      setBalance(getWallet(employee!.id, "employee", account).receiveBalance);
    }
    refresh();
    window.addEventListener("storage", refresh);
    const timer = window.setInterval(refresh, 3000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(timer);
    };
  }, [monetary, employee, account]);

  return balance;
}

export function MobileTopBar({ title, showBack, onBack, rightSlot }: Props) {
  const account = getAccount();
  const logoSrc = account?.companyLogo || "/m/svgs/logo.svg";
  const receiveBalance = useReceiveBalance();

  return (
    <header className="sticky top-0 z-30 bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/80 border-b border-border/60">
      <div className="h-14 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <button
              onClick={onBack}
              className="-ml-2 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          ) : (
            <img
              src={logoSrc}
              alt={account?.companyName || "EngageX"}
              className="w-8 h-10 object-contain"
            />
          )}
          {title && (
            <h1 className="font-mobile font-semibold text-base text-foreground truncate">
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {receiveBalance !== null && (
            <Link
              to="/m/rewards"
              aria-label={`${receiveBalance} points available — open rewards`}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full bg-primary/10 border border-primary/15 text-primary text-xs font-mobile font-semibold hover:bg-primary/15 transition-colors"
            >
              <span className="text-primary">★</span>
              {receiveBalance.toLocaleString()}
              <span className="text-primary/70 font-medium">pts</span>
            </Link>
          )}
          {rightSlot ?? (
            <Link
              to="/m/notifications"
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Notifications"
            >
              <img src="/m/icons/bell-notification.svg" alt="" className="w-6 h-6" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
