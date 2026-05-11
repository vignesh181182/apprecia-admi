import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { UserMenuSheet } from "./user-menu-sheet";
import { NotificationsPopover } from "./notifications-popover";
import { getAccount } from "@/lib/account";
import { BRAND } from "@/lib/brand";

export function WebTopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const account = getAccount();

  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const logoSrc = account?.companyLogo || "/m/svgs/logo.svg";
  const companyName = account?.companyName || BRAND.name;
  const rnrEnabled = !!account?.products.rnr;

  const path = location.pathname;
  const isRnRPath =
    path.startsWith("/m/rewards") ||
    path.startsWith("/m/programs") ||
    searchParams.get("tab") === "rnr";
  const activeTab: "appreciation" | "rnr" = isRnRPath ? "rnr" : "appreciation";

  const SECTIONABLE_PATHS = new Set(["/m", "/m/recognize", "/m/ranks", "/m/insights"]);

  function goTab(kind: "appreciation" | "rnr") {
    if (kind === "rnr" && !rnrEnabled) return;
    if (SECTIONABLE_PATHS.has(path)) {
      const params = new URLSearchParams(searchParams);
      if (kind === "appreciation") params.delete("tab");
      else params.set("tab", "rnr");
      const search = params.toString();
      navigate(search ? `${path}?${search}` : path);
      return;
    }
    if ((path.startsWith("/m/rewards") || path.startsWith("/m/programs")) && kind === "appreciation") {
      navigate("/m");
      return;
    }
    navigate(kind === "appreciation" ? "/m" : "/m?tab=rnr");
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto h-16 px-6 flex items-center gap-4">
        <Link to="/m" className="flex items-center gap-2.5 shrink-0">
          <img src={logoSrc} alt="" className="w-8 h-10 object-contain" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-stone-900 truncate max-w-[160px]">
              {companyName}
            </p>
            <p className="text-[11px] text-stone-500">{BRAND.name}</p>
          </div>
        </Link>

        <nav className="flex-1 flex items-center justify-center gap-1" aria-label="Feed sections">
          <TopTab
            label="Appreciation"
            active={activeTab === "appreciation"}
            onClick={() => goTab("appreciation")}
          />
          <TopTab
            label="RnR"
            active={activeTab === "rnr"}
            onClick={() => goTab("rnr")}
            disabled={!rnrEnabled}
            tooltip={!rnrEnabled ? "Rewards & Recognition isn't enabled for your company" : undefined}
          />
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className={cn(
                "p-2 rounded-full transition-colors",
                searchOpen ? "bg-stone-100" : "hover:bg-stone-100",
              )}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search className="w-5 h-5 text-stone-700" />
            </button>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search people, badges, recognitions…"
              className={cn(
                "h-9 pl-3 pr-3 rounded-full bg-stone-100 border border-transparent focus:bg-white focus:border-stone-300 focus:outline-none text-sm text-stone-700 placeholder:text-stone-400 transition-all",
                searchOpen ? "w-64 ml-1 opacity-100" : "w-0 ml-0 opacity-0 pointer-events-none",
              )}
              onBlur={(e) => {
                if (!e.currentTarget.value) setSearchOpen(false);
              }}
            />
          </div>

          <NotificationsPopover />

          <UserMenuSheet />
        </div>
      </div>
    </header>
  );
}

function TopTab({
  label,
  active,
  onClick,
  disabled,
  tooltip,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        "relative h-12 px-6 text-sm font-mobile font-semibold transition-colors",
        active
          ? "text-[#a87a3a]"
          : disabled
          ? "text-stone-300 cursor-not-allowed"
          : "text-stone-600 hover:text-stone-900",
      )}
    >
      {label}
      <span
        className={cn(
          "absolute left-3 right-3 -bottom-px h-0.5 rounded-full transition-all",
          active ? "bg-[#a87a3a]" : "bg-transparent",
        )}
      />
    </button>
  );
}
