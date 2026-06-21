import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  X,
  Settings,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";
import { toastSuccess } from "@/lib/toast-helpers";

interface Notification {
  id: string;
  type: "reminder" | "alert" | "achievement" | "info";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface NotificationPrefs {
  habitReminders: boolean;
  taskReminders: boolean;
  budgetAlerts: boolean;
  dailyDigest: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "reminder",
    title: "Morning Meditation",
    message: "Time for your daily meditation session",
    timestamp: Date.now() - 1000 * 60 * 30,
    read: false,
  },
  {
    id: "2",
    type: "alert",
    title: "Budget Limit Reached",
    message: "You've spent 90% of your monthly budget",
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    read: false,
  },
  {
    id: "3",
    type: "achievement",
    title: "7-Day Streak!",
    message: "You've maintained your exercise habit for 7 days straight!",
    timestamp: Date.now() - 1000 * 60 * 60 * 5,
    read: true,
  },
  {
    id: "4",
    type: "info",
    title: "Weekly Report Ready",
    message: "Your weekly productivity report is now available",
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    read: true,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function NotificationsPanel() {
  const { lang } = useLang();
  const [notifications, setNotifications] =
    useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    habitReminders: true,
    taskReminders: true,
    budgetAlerts: true,
    dailyDigest: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
  });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    toastSuccess(lang === "bn" ? "পঠিত হিসাবে চিহ্নিত" : "Marked as read");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const togglePref = (
    key: keyof Omit<NotificationPrefs, "quietHoursStart" | "quietHoursEnd">,
  ) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reminder":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "achievement":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "info":
        return <Info className="h-4 w-4 text-purple-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (lang === "bn") {
      if (minutes < 60) return `${minutes} মিনিট আগে`;
      if (hours < 24) return `${hours} ঘণ্টা আগে`;
      return `${days} দিন আগে`;
    }

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/10 p-2">
            <Bell className="h-4 w-4 text-orange-500" />
          </div>
          <h3 className="font-semibold text-sm">
            {t("nav.notifications" as TranslationKey, lang)}
          </h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-500">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {notifications.length > 0 && (
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="cursor-pointer flex items-center gap-1 rounded-lg bg-foreground/5 px-3 py-1.5 text-xs hover:bg-foreground/10 transition-colors"
            >
              <CheckCheck className="h-3 w-3" />
              {t("notifications.markAllRead" as TranslationKey, lang)}
            </button>
          )}
          <button
            onClick={clearAll}
            className="cursor-pointer flex items-center gap-1 rounded-lg bg-foreground/5 px-3 py-1.5 text-xs hover:bg-foreground/10 transition-colors text-muted-foreground"
          >
            <X className="h-3 w-3" />
            {t("notifications.clear" as TranslationKey, lang)}
          </button>
        </div>
      )}

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">
                {t("settings.notificationsSettings" as TranslationKey, lang)}
              </h4>
              <button
                onClick={() => setShowSettings(false)}
                className="cursor-pointer text-muted-foreground hover:text-foreground hover-tab"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {[
              {
                key: "habitReminders" as const,
                label: t("notifications.habitReminder" as TranslationKey, lang),
              },
              {
                key: "taskReminders" as const,
                label: t("notifications.taskReminder" as TranslationKey, lang),
              },
              {
                key: "budgetAlerts" as const,
                label: t("notifications.budgetAlert" as TranslationKey, lang),
              },
              {
                key: "dailyDigest" as const,
                label: t("notifications.dailyDigest" as TranslationKey, lang),
              },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {pref.label}
                </span>
                <button
                  onClick={() => togglePref(pref.key)}
                  className={`cursor-pointer relative h-5 w-9 rounded-full transition-colors ${
                    prefs[pref.key] ? "bg-primary" : "bg-foreground/10"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      prefs[pref.key] ? "translate-x-4" : ""
                    }`}
                  />
                </button>
              </div>
            ))}

            <div className="border-t border-border pt-3 space-y-2">
              <span className="text-xs text-muted-foreground">
                {lang === "bn" ? "নীরব সময়" : "Quiet Hours"}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={prefs.quietHoursStart}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      quietHoursStart: e.target.value,
                    }))
                  }
                  className="rounded-lg bg-foreground/5 px-2 py-1 text-xs"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <input
                  type="time"
                  value={prefs.quietHoursEnd}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      quietHoursEnd: e.target.value,
                    }))
                  }
                  className="rounded-lg bg-foreground/5 px-2 py-1 text-xs"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {notifications.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <BellOff className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <h4 className="font-semibold text-sm mb-1">
            {t("notifications.empty" as TranslationKey, lang)}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t("notifications.emptyDesc" as TranslationKey, lang)}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`glass rounded-xl p-3 hover-row hover-blue ${
                !notification.read ? "border-l-2 border-primary" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getTypeIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-medium text-sm truncate">
                      {notification.title}
                    </h5>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="cursor-pointer rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      title={t(
                        "notifications.markAllRead" as TranslationKey,
                        lang,
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="cursor-pointer rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
