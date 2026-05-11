import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { getAccount } from "@/lib/account";

type Props = {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
};

export function MobileTopBar({ title, showBack, onBack, rightSlot }: Props) {
  const account = getAccount();
  const logoSrc = account?.companyLogo || "/m/svgs/logo.svg";

  return (
    <header className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur supports-[backdrop-filter]:bg-stone-50/80 border-b border-stone-200/60">
      <div className="h-14 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <button
              onClick={onBack}
              className="-ml-2 p-2 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5 text-stone-700" />
            </button>
          ) : (
            <img
              src={logoSrc}
              alt={account?.companyName || "EngageX"}
              className="w-8 h-10 object-contain"
            />
          )}
          {title && (
            <h1 className="font-mobile font-semibold text-base text-stone-900 truncate">
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-1">
          {rightSlot ?? (
            <Link
              to="/m/notifications"
              className="p-2 rounded-full hover:bg-stone-100 transition-colors"
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
