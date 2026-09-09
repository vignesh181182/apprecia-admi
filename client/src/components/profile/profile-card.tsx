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
            ? "border-primary bg-primary/40"
            : "border-border hover:border-border hover:bg-muted",
          asLink && "cursor-pointer",
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center overflow-hidden shrink-0">
          {account.adminPhotoUrl ? (
            <img
              src={account.adminPhotoUrl}
              alt={account.adminName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-mobile font-semibold text-primary text-base">
              {initial}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-mobile font-semibold text-foreground text-sm leading-tight truncate">
            {account.adminName}
          </p>
          {meta && (
            <p className="text-xs text-muted-foreground leading-snug truncate mt-0.5">
              {meta}
            </p>
          )}
        </div>

        {asLink && (
          <ChevronRight
            className={cn(
              "w-4 h-4 shrink-0 transition-all",
              active
                ? "text-primary"
                : "text-muted-foreground group-hover:text-muted-foreground group-hover:translate-x-0.5",
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
        active ? "border-primary" : "border-border",
      )}
    >
      <div className="rounded-full bg-primary-soft flex items-center justify-center overflow-hidden w-24 h-24">
        {account.adminPhotoUrl ? (
          <img
            src={account.adminPhotoUrl}
            alt={account.adminName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-mobile font-semibold text-primary text-3xl">
            {initial}
          </span>
        )}
      </div>

      <p className="mt-3 font-mobile font-semibold text-foreground leading-tight text-xl">
        {account.adminName}
      </p>
      <p className="mt-0.5 text-muted-foreground leading-snug text-sm">
        {account.adminDesignation || "Member"}
      </p>
      {account.adminDepartment && (
        <p className="mt-1 text-xs text-muted-foreground">{account.adminDepartment}</p>
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
