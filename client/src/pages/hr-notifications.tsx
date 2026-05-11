import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { hrNotificationsData, type HRNotification } from "@/lib/hr-data";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Check,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig = {
  info: {
    icon: Info,
    iconClass: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-100",
    badgeClass: "bg-green-100 text-green-700",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  error: {
    icon: XCircle,
    iconClass: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
    badgeClass: "bg-red-100 text-red-700",
  },
};

const categories = ["All", "Budget", "Approvals", "Analytics", "Redemptions", "Rewards", "People", "Programs", "Integrations"];

export default function HRNotifications() {
  const [items, setItems] = useState<HRNotification[]>(hrNotificationsData);
  const [catFilter, setCatFilter] = useState("All");
  const [showUnread, setShowUnread] = useState(false);

  const filtered = items.filter((n) => {
    const matchCat = catFilter === "All" || n.category === catFilter;
    const matchUnread = !showUnread || !n.isRead;
    return matchCat && matchUnread;
  });

  const unreadCount = items.filter((n) => !n.isRead).length;

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  function dismiss(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-700 font-medium">
            {unreadCount > 0 ? (
              <>{unreadCount} unread</>
            ) : (
              <>All caught up</>
            )}
          </span>
          {unreadCount > 0 && (
            <Badge className="bg-stone-900 text-white text-xs">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 text-xs border-stone-200", showUnread && "bg-stone-900 text-white border-stone-900")}
            onClick={() => setShowUnread((v) => !v)}
          >
            Unread only
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-stone-200 gap-1"
              onClick={markAllRead}
            >
              <Check className="w-3.5 h-3.5" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
              catFilter === cat
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.map((notif) => {
          const { icon: Icon, iconClass, bg, border, badgeClass } = typeConfig[notif.type];
          return (
            <Card
              key={notif.id}
              className={cn(
                "border transition-all",
                notif.isRead ? "border-stone-200 bg-white" : `${border} ${bg}`
              )}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", notif.isRead ? "bg-stone-100" : bg)}>
                  <Icon className={cn("w-4 h-4", notif.isRead ? "text-stone-500" : iconClass)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn("text-sm font-medium", notif.isRead ? "text-stone-700" : "text-stone-900")}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-stone-900 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-stone-400 hover:text-stone-700"
                          onClick={() => markRead(notif.id)}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-stone-400 hover:text-red-500"
                        onClick={() => dismiss(notif.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className={cn("text-xs mt-0.5", notif.isRead ? "text-stone-500" : "text-stone-600")}>
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={cn("text-xs px-1.5 py-0 h-4", badgeClass)} variant="secondary">
                      {notif.category}
                    </Badge>
                    <span className="text-xs text-stone-400">{notif.time}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle2 className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm text-stone-500">No notifications to show.</p>
          </div>
        )}
      </div>
    </div>
  );
}
