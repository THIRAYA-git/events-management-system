import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CalendarCheck,
  CreditCard,
  Clock,
  UtensilsCrossed,
  XCircle,
  Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  clearNotifications,
} from "@/api/notification.api";
import type {
  AppNotification,
  NotificationType,
} from "@/types/notification.types";

const POLL_MS = 60_000;

const ICONS: Record<NotificationType, typeof Bell> = {
  booking_confirmation: CalendarCheck,
  payment_receipt: CreditCard,
  event_reminder: Clock,
  catering_update: UtensilsCrossed,
  cancellation: XCircle,
  general: Info,
};

const timeAgo = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : formatDistanceToNow(d, { addSuffix: true });
};

const NotificationBell = ({
  buttonClassName = "text-white hover:bg-card/10",
}: {
  buttonClassName?: string;
}) => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listNotifications();
      setItems(data.notifications);
      setUnread(data.unreadCount);
    } catch {
      // Bell is non-critical: stay silent if the request fails.
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  // Refresh when the popover opens so the list is current.
  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleRead = async (n: AppNotification) => {
    if (n.is_read) return;
    setItems((prev) =>
      prev.map((x) =>
        x.notification_id === n.notification_id ? { ...x, is_read: true } : x
      )
    );
    setUnread((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(n.notification_id);
    } catch {
      load();
    }
  };

  const handleReadAll = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
    setUnread(0);
    try {
      await markAllNotificationsRead();
    } catch {
      load();
    }
  };

  const handleClearAll = async () => {
    setItems([]);
    setUnread(0);
    try {
      await clearNotifications();
    } catch {
      load();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className={`relative rounded-md p-2 ${buttonClassName}`}
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 gap-0 border border-border bg-card p-0 shadow-lg ring-0"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">
            Notifications
          </span>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button
                onClick={handleReadAll}
                className="text-xs font-medium text-violet-700 dark:text-violet-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-medium text-muted-foreground hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            items.map((n) => {
              const Icon = ICONS[n.type] ?? Info;
              return (
                <Link
                  key={n.notification_id}
                  to={n.link}
                  onClick={() => {
                    handleRead(n);
                    setOpen(false);
                  }}
                  className={`flex gap-3 border-b border-border px-4 py-3 hover:bg-muted ${
                    n.is_read ? "" : "bg-violet-50/60 dark:bg-violet-500/10"
                  }`}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-700 dark:text-violet-400" />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm ${
                        n.is_read
                          ? "text-foreground"
                          : "font-semibold text-foreground"
                      }`}
                    >
                      {n.subject ?? "Notification"}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {n.message}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                  )}
                </Link>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
