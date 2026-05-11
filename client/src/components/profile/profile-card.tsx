import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/account";

type Variant = "compact" | "full";

export function ProfileCard({
  account,
  variant = "compact",
  active,
  asLink = true,
}: {
  account: Account;
  variant?: Variant;
  active?: boolean;
  asLink?: boolean;
}) {
  const initial = (account.adminName?.[0] || "?").toUpperCase();

  // Compact: sleek horizontal row — avatar | name + meta | chevron
  if (variant === "compact") {
    const meta = [account.adminDesignation || "Member", account.adminDepartment]
      .filter(Boolean)
      .join(" · ");

    const inner = (
      <div
        className={cn(
          "group flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 transition-all",
          active
            ? "border-[#a87a3a] bg-amber-50/40"
            : "border-stone-200 hover:border-stone-300 hover:bg-stone-50",
          asLink && "cursor-pointer",
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center overflow-hidden shrink-0">
          {account.adminPhotoUrl ? (
            <img
              src={account.adminPhotoUrl}
              alt={account.adminName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-mobile font-semibold text-amber-900 text-base">
              {initial}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mobile font-semibold text-stone-900 text-sm leading-tight truncate">
            {account.adminName}
          </p>
          {meta && (
            <p className="text-xs text-stone-500 leading-snug truncate mt-0.5">
              {meta}
            </p>
          )}
        </div>

        {asLink && (
          <ChevronRight
            className={cn(
              "w-4 h-4 shrink-0 transition-all",
              active
                ? "text-[#a87a3a]"
                : "text-stone-300 group-hover:text-stone-500 group-hover:translate-x-0.5",
            )}
          />
        )}
      </div>
    );

    if (!asLink) return inner;
    return (
      <Link to="/m/profile" aria-label="My profile" className="block">
        {inner}
      </Link>
    );
  }

  // Full: original stacked layout (used elsewhere — kept as-is)
  const inner = (
    <div
      className={cn(
        "rounded-2xl bg-white border transition-colors p-6",
        active ? "border-[#a87a3a]" : "border-stone-200",
      )}
    >
      <div className="rounded-full bg-amber-100 flex items-center justify-center overflow-hidden w-24 h-24">
        {account.adminPhotoUrl ? (
          <img
            src={account.adminPhotoUrl}
            alt={account.adminName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-mobile font-semibold text-amber-900 text-3xl">
            {initial}
          </span>
        )}
      </div>

      <p className="mt-3 font-mobile font-semibold text-stone-900 leading-tight text-xl">
        {account.adminName}
      </p>
      <p className="mt-0.5 text-stone-600 leading-snug text-sm">
        {account.adminDesignation || "Member"}
      </p>
      {account.adminDepartment && (
        <p className="mt-1 text-xs text-stone-500">{account.adminDepartment}</p>
      )}
    </div>
  );

  if (!asLink) return inner;

  return (
    <Link to="/m/profile" aria-label="My profile" className="block">
      {inner}
    </Link>
  );
}
