import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ShoppingCart, TrendingUp, UserPlus, Sparkles, ChevronRight, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NOTIFICATIONS, type Notification, type NotificationKind } from "@/lib/notifications-data";

const KIND_ICON: Record<NotificationKind, React.FC<{ className?: string }>> = {
  recognition: Sparkles,
  rnr: Sparkles,
  redemption: ShoppingCart,
  rank: TrendingUp,
  team: UserPlus,
};

export function NotificationsPopover() {
  const [items, setItems] = useState<Notification[]>(NOTIFICATIONS);
  const unreadCount = items.filter((n) => n.unread).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  }

  return (
    <Popover>
      <PopoverTrigger
        className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      >
        <Bell className="w-5 h-5 text-stone-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-700 text-white text-[10px] font-mobile font-semibold flex items-center justify-center leading-none">
            {unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 bg-white border border-stone-200 shadow-lg rounded-2xl overflow-hidden"
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <h3 className="font-mobile font-semibold text-sm text-stone-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[11px] font-mobile font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-1.5 leading-tight py-0.5">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-stone-500 hover:text-stone-900 inline-flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
        </header>

        <ul className="max-h-[420px] overflow-y-auto divide-y divide-stone-100">
          {items.length === 0 ? (
            <li className="px-4 py-10 text-center text-sm text-stone-500">
              You're all caught up.
            </li>
          ) : (
            items.map((n) => <Row key={n.id} n={n} onClick={() => markRead(n.id)} />)
          )}
        </ul>

        <footer className="border-t border-stone-100">
          <Link
            to="/m/notifications"
            className="flex items-center justify-center gap-1 py-2.5 text-sm text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors"
          >
            See all
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </footer>
      </PopoverContent>
    </Popover>
  );
}

function Row({ n, onClick }: { n: Notification; onClick?: () => void }) {
  const Icon = KIND_ICON[n.kind];
  const inner = (
    <div className={cn("flex items-start gap-3 px-4 py-3 transition-colors", n.unread ? "bg-amber-50/40 hover:bg-amber-50" : "hover:bg-stone-50")}>
      {n.avatar ? (
        <div className="relative shrink-0">
          <img src={n.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center border border-stone-100">
            <Icon className="w-2.5 h-2.5 text-amber-700" />
          </span>
        </div>
      ) : (
        <span className="shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-700" />
        </span>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-stone-900 leading-snug">
          <span className="font-mobile font-semibold">{n.title}</span>
        </p>
        <p className="text-xs text-stone-600 mt-0.5 leading-snug line-clamp-2">{n.body}</p>
        <p className="text-[11px] text-stone-400 mt-1">{n.timeAgo}</p>
      </div>

      {n.unread && (
        <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-700" />
      )}
    </div>
  );

  if (n.href) {
    return (
      <li>
        <Link to={n.href} onClick={onClick} className="block">
          {inner}
        </Link>
      </li>
    );
  }
  return (
    <li onClick={onClick} className="cursor-pointer">
      {inner}
    </li>
  );
}
