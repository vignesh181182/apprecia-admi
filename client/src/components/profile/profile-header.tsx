import { Pencil, Mail, Calendar, Building2 } from "lucide-react";
import type { Account } from "@/lib/account";

export function ProfileHeader({ account }: { account: Account }) {
  const initial = (account.adminName?.[0] || "?").toUpperCase();
  const joined = account.createdAt ? new Date(account.createdAt).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  }) : null;

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-start gap-5">
        <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden shrink-0">
          {account.adminPhotoUrl ? (
            <img src={account.adminPhotoUrl} alt={account.adminName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-mobile font-semibold text-primary text-3xl">{initial}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="font-mobile text-2xl font-semibold text-foreground truncate">
                {account.adminName}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {account.adminDesignation || "Member"}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-border hover:bg-muted text-xs font-medium text-muted-foreground transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {account.adminEmail}
            </span>
            {account.adminDepartment && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {account.adminDepartment}
              </span>
            )}
            {joined && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined {joined}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
