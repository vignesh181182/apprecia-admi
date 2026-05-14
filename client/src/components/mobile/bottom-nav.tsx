import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getAccount } from "@/lib/account";
import { EMPLOYEES } from "@/lib/recognize-data";
import { getBadges } from "@/lib/badges";

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.6664 8.54138C17.0115 8.54138 17.2913 8.82132 17.2914 9.16638V15.8334C17.2914 17.0989 16.2659 18.1252 15.0004 18.1254H5.00042C3.73479 18.1254 2.70846 17.099 2.70843 15.8334V9.16638C2.70857 8.82132 2.98834 8.54138 3.33343 8.54138C3.6785 8.5414 3.95829 8.82133 3.95843 9.16638V15.8334C3.95846 16.4086 4.42515 16.8754 5.00042 16.8754H15.0004C15.5755 16.8752 16.0414 16.4085 16.0414 15.8334V9.16638C16.0416 8.82141 16.3215 8.54153 16.6664 8.54138ZM9.49651 2.0531C9.81323 1.89474 10.1866 1.89474 10.5033 2.0531L18.6127 6.10778C18.9214 6.26213 19.0463 6.63696 18.892 6.94567C18.7377 7.25429 18.3628 7.38005 18.0541 7.22595L10.0004 3.1986L1.94671 7.22595C1.63797 7.38032 1.26221 7.25441 1.10784 6.94567C0.95368 6.63705 1.07862 6.26218 1.38714 6.10778L9.49651 2.0531Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.9999 12.4998C7.23847 12.4998 4.9999 10.2613 4.9999 7.49984V2.87021C4.9999 2.52533 4.9999 2.3529 5.05015 2.21482C5.1344 1.98335 5.31674 1.80101 5.54821 1.71676C5.68629 1.6665 5.85873 1.6665 6.2036 1.6665H13.7962C14.1411 1.6665 14.3135 1.6665 14.4516 1.71676C14.6831 1.80101 14.8654 1.98335 14.9496 2.21482C14.9999 2.3529 14.9999 2.52533 14.9999 2.87021V7.49984C14.9999 10.2613 12.7613 12.4998 9.9999 12.4998ZM9.9999 12.4998V14.9998M14.9999 3.33317H17.0832C17.4715 3.33317 17.6657 3.33317 17.8188 3.3966C18.023 3.48118 18.1852 3.64341 18.2698 3.8476C18.3332 4.00074 18.3332 4.19489 18.3332 4.58317V4.99984C18.3332 5.77481 18.3332 6.1623 18.248 6.48022C18.0169 7.34295 17.343 8.01682 16.4803 8.24799C16.1624 8.33317 15.7749 8.33317 14.9999 8.33317M4.9999 3.33317H2.91656C2.52828 3.33317 2.33414 3.33317 2.181 3.3966C1.97681 3.48118 1.81458 3.64341 1.73 3.8476C1.66656 4.00074 1.66656 4.19489 1.66656 4.58317V4.99984C1.66656 5.77481 1.66656 6.1623 1.75175 6.48022C1.98292 7.34295 2.65679 8.01682 3.51952 8.24799C3.83743 8.33317 4.22492 8.33317 4.9999 8.33317M6.2036 18.3332H13.7962C14.0007 18.3332 14.1666 18.1673 14.1666 17.9628C14.1666 16.3264 12.84 14.9998 11.2036 14.9998H8.79619C7.1598 14.9998 5.83323 16.3264 5.83323 17.9628C5.83323 18.1673 5.99905 18.3332 6.2036 18.3332Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RecognizeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.75 2.44995C11.44 1.85995 12.57 1.85995 13.27 2.44995L14.85 3.81005C15.15 4.07005 15.71 4.28002 16.11 4.28002H17.81C18.87 4.28002 19.74 5.14996 19.74 6.20996V7.91003C19.74 8.30003 19.95 8.87004 20.21 9.17004L21.57 10.75C22.16 11.44 22.16 12.57 21.57 13.27L20.21 14.85C19.95 15.15 19.74 15.71 19.74 16.11V17.8101C19.74 18.8701 18.87 19.74 17.81 19.74H16.11C15.72 19.74 15.15 19.95 14.85 20.21L13.27 21.5699C12.58 22.1599 11.45 22.1599 10.75 21.5699L9.17002 20.21C8.87002 19.95 8.31001 19.74 7.91001 19.74H6.18C5.12 19.74 4.25 18.8701 4.25 17.8101V16.1C4.25 15.71 4.04001 15.15 3.79001 14.85L2.44 13.26C1.86 12.57 1.86 11.45 2.44 10.76L3.79001 9.17004C4.04001 8.87004 4.25 8.31004 4.25 7.92004V6.20996C4.25 5.14996 5.12 4.28002 6.18 4.28002H7.91001C8.30001 4.28002 8.87002 4.07005 9.17002 3.81005L10.75 2.44995Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 8.5V15.5M8.5 12H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17 1.875C17.6213 1.875 18.125 2.37868 18.125 3V17C18.125 17.6213 17.6213 18.125 17 18.125H3C2.37868 18.125 1.875 17.6213 1.875 17V3C1.875 2.37868 2.37868 1.875 3 1.875H17ZM3.125 16.875H16.875V3.125H3.125V16.875ZM6.66699 10.208C7.01191 10.2082 7.29182 10.4881 7.29199 10.833V13.333C7.29199 13.6781 7.01202 13.9578 6.66699 13.958C6.32181 13.958 6.04199 13.6782 6.04199 13.333V10.833C6.04217 10.488 6.32192 10.208 6.66699 10.208ZM10 8.54199C10.3452 8.54199 10.625 8.82181 10.625 9.16699V13.333C10.625 13.6782 10.3452 13.958 10 13.958C9.65482 13.958 9.375 13.6782 9.375 13.333V9.16699C9.375 8.82181 9.65482 8.54199 10 8.54199ZM13.333 6.04199C13.6782 6.04199 13.958 6.32181 13.958 6.66699V13.333C13.958 13.6782 13.6782 13.958 13.333 13.958C12.988 13.9578 12.708 13.6781 12.708 13.333V6.66699C12.708 6.32192 12.988 6.04217 13.333 6.04199Z"
        fill="currentColor"
      />
    </svg>
  );
}

type Tab = {
  to: string;
  label: string;
  shortLabel?: string;
  Icon: React.FC<{ className?: string }>;
  end?: boolean;
};

const TABS: Tab[] = [
  { to: "/m", label: "Feeds", Icon: HomeIcon, end: true },
  { to: "/m/rewards", label: "Rewards", Icon: TrophyIcon },
  { to: "/m/recognize", label: "Recognize", Icon: RecognizeIcon },
  { to: "/m/ranks", label: "Ranks", Icon: StatsIcon },
];

function usePendingApprovalCount(): number {
  const account = getAccount();
  const approverId = useMemo(() => {
    if (!account) return null;
    const me = EMPLOYEES.find(
      (e) => e.email.toLowerCase() === account.adminEmail.toLowerCase(),
    );
    return (me ?? EMPLOYEES[0])?.id ?? "hr-admin";
  }, [account]);

  const [count, setCount] = useState(0);
  useEffect(() => {
    function refresh() {
      if (!approverId) return setCount(0);
      const pending = getBadges().filter(
        (b) => b.status === "pending-approval" && b.pendingApproverId === approverId,
      );
      setCount(pending.length);
    }
    refresh();
    window.addEventListener("storage", refresh);
    const t = window.setInterval(refresh, 3000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.clearInterval(t);
    };
  }, [approverId]);
  return count;
}

export function MobileBottomNav() {
  const account = getAccount();
  const avatarSrc = account?.companyLogo;
  const pendingApprovals = usePendingApprovalCount();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pointer-events-none"
      aria-label="Primary"
    >
      <div className="pointer-events-auto bg-[#ebebe6] rounded-[36px] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.18)] px-4 h-[72px] flex items-center justify-between gap-1 max-w-md mx-auto">
        {TABS.map((tab) => {
          const { Icon } = tab;
          return (
            <NavLink key={tab.to} to={tab.to} end={tab.end} aria-label={tab.label} className="flex items-center justify-center">
              {({ isActive }) => (
                <span
                  className={cn(
                    "flex items-center gap-2 h-10 rounded-full transition-all duration-200",
                    isActive
                      ? "bg-[#a87a3a] text-white px-4"
                      : "text-[#292927] w-10 justify-center",
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isActive && (
                    <span className="font-mobile text-sm font-semibold">{tab.label}</span>
                  )}
                </span>
              )}
            </NavLink>
          );
        })}

        <NavLink to="/m/profile" aria-label="Profile" className="relative flex items-center justify-center">
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  "block w-10 h-10 rounded-full overflow-hidden ring-2 transition-shadow",
                  isActive ? "ring-[#a87a3a]" : "ring-transparent",
                )}
              >
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full bg-stone-300 flex items-center justify-center text-sm font-semibold text-stone-700">
                    {(account?.adminName?.[0] || "?").toUpperCase()}
                  </span>
                )}
              </span>
              {pendingApprovals > 0 && (
                <span
                  aria-label={`${pendingApprovals} pending approvals`}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-[#ebebe6]"
                >
                  {pendingApprovals > 9 ? "9+" : pendingApprovals}
                </span>
              )}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
