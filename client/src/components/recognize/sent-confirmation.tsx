import { useEffect, useState } from "react";
import { MoreHorizontal, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";
import { badgeImage, type Employee, type RecognizeBadge } from "@/lib/recognize-data";

type Props = {
  employee: Employee;
  badge: RecognizeBadge;
  reason: string;
  points?: number;
  onDone: () => void;
};

export function SentConfirmation({ employee, badge, reason, points, onDone }: Props) {
  const [status, setStatus] = useState<"pending" | "approved">("pending");

  useEffect(() => {
    const timeout = setTimeout(() => setStatus("approved"), 1800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={cn(
        "min-h-full flex flex-col transition-colors duration-500 relative overflow-hidden",
        status === "approved" ? "bg-amber-50/60" : "bg-stone-100",
      )}
    >
      {status === "approved" && <Confetti />}

      <div className="relative flex-1 flex flex-col items-center pt-10 pb-6 px-5">
        <div
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-colors",
            status === "approved" ? "bg-amber-100" : "bg-sky-100",
          )}
        >
          {status === "approved" ? (
            <PartyPopper className="w-7 h-7 text-amber-700" />
          ) : (
            <PendingIcon />
          )}
        </div>

        <h2 className="font-mobile font-semibold text-stone-900 text-xl text-center">
          {status === "approved" ? "You just made someone's day!" : "Good vibes sent! ✌️"}
        </h2>
        <p className="text-sm text-stone-600 text-center mt-2 max-w-xs">
          {status === "approved"
            ? `Your ${points != null ? "recognition" : "appreciation"} is live and the team can now see it.`
            : `Your ${points != null ? "recognition" : "appreciation"} is under review and will go live soon.`}
        </p>

        <article className="bg-white rounded-2xl shadow-sm w-full max-w-md mt-7 overflow-hidden">
          <div
            className={cn(
              "px-4 py-2.5 flex items-center justify-between border-b transition-colors",
              status === "approved"
                ? "bg-amber-50 border-amber-100"
                : "bg-sky-50 border-sky-100",
            )}
          >
            <span className="text-xs text-stone-700 font-medium">Approval Status:</span>
            <span
              className={cn(
                "inline-flex items-center text-xs font-mobile font-semibold rounded-full px-2.5 py-0.5 transition-colors",
                status === "approved"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-sky-100 text-sky-800",
              )}
            >
              {status === "approved" ? "Approved" : "Pending"}
            </span>
          </div>

          <header className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-900 font-mobile font-semibold text-sm shrink-0">
              Y
            </div>
            <p className="flex-1 text-sm text-stone-900 truncate">
              <span className="font-mobile font-semibold">You</span>
              <span className="text-stone-500"> appreciated </span>
              <span className="font-mobile font-semibold">{employee.name}</span>
            </p>
            <button className="p-1 -mr-1 text-stone-400" aria-label="More">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </header>

          <div className="border-t border-stone-100 px-4 py-2.5 flex items-center">
            <img src={employee.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
            <p className="flex-1 ml-3 text-sm text-stone-700 truncate">{employee.name}</p>
            <span className="text-xs text-stone-400 shrink-0">Just now</span>
          </div>

          <div className="px-4 pt-2 pb-1 flex justify-center">
            {badgeImage(badge) ? (
              <img src={badgeImage(badge)} alt={badge.label} className="w-40 h-40 object-contain" />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-7xl">{badge.emoji}</div>
            )}
          </div>

          <div className="px-5 pb-5 pt-1 text-center">
            <h3 className="font-mobile font-semibold text-amber-700 text-lg">{badge.label}</h3>
            {points != null && (
              <p className="text-xs text-amber-700 font-semibold mt-1">+{points.toLocaleString()} points</p>
            )}
            {reason && (
              <>
                <div className="border-t border-stone-100 my-3" />
                <p className="text-sm text-stone-600 leading-relaxed">{reason}</p>
              </>
            )}
          </div>
        </article>
      </div>

      <div className="relative px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={onDone}
          className={cn(
            "w-full h-12 rounded-full font-mobile font-semibold text-sm transition-colors",
            status === "approved"
              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
              : "bg-stone-200 text-stone-700 hover:bg-stone-300",
          )}
        >
          DONE
        </button>
      </div>
    </div>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-sky-700">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Confetti() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none opacity-70"
      viewBox="0 0 400 600"
      preserveAspectRatio="none"
    >
      <g stroke="#a87a3a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5">
        <path d="M30 60c10 12 28 22 50 16" />
        <path d="M340 50c-12 18-28 22-44 18" />
        <path d="M60 120c12 18 30 22 50 12" />
        <path d="M310 110c-8 14-26 26-44 22" />
      </g>
      <g fill="#fbbf24" opacity="0.6">
        <circle cx="50" cy="30" r="3" />
        <circle cx="370" cy="40" r="2.5" />
        <circle cx="200" cy="80" r="3" />
        <circle cx="120" cy="180" r="2" />
        <circle cx="320" cy="200" r="2.5" />
        <circle cx="250" cy="160" r="2" />
      </g>
      <g fill="#a87a3a" opacity="0.5">
        <rect x="80" y="60" width="6" height="2" transform="rotate(30 80 60)" />
        <rect x="280" y="80" width="6" height="2" transform="rotate(-20 280 80)" />
        <rect x="170" y="220" width="6" height="2" transform="rotate(45 170 220)" />
      </g>
    </svg>
  );
}
