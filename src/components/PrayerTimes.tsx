import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import {
  Clock,
  Bell,
  MapPin,
  Settings,
  Check,
  Sun,
  Sunrise,
  Sunset,
  CloudMoon,
} from "lucide-react";

interface PrayerTime {
  name: string;
  nameBn: string;
  desc: string;
  descBn: string;
  hour: number;
  minute: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const PRAYER_TIMES: PrayerTime[] = [
  {
    name: "Fajr",
    nameBn: "ফজর",
    desc: "Dawn prayer",
    descBn: "ভোরের নামাজ",
    hour: 4,
    minute: 45,
    icon: <Sunrise className="h-4 w-4" />,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    name: "Dhuhr",
    nameBn: "যোহর",
    desc: "Noon prayer",
    descBn: "দুপুরের নামাজ",
    hour: 11,
    minute: 55,
    icon: <Sun className="h-4 w-4" />,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    name: "Asr",
    nameBn: "আসর",
    desc: "Afternoon prayer",
    descBn: "বিকালের নামাজ",
    hour: 15,
    minute: 30,
    icon: <Sun className="h-4 w-4" />,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    name: "Maghrib",
    nameBn: "মাগরিব",
    desc: "Sunset prayer",
    descBn: "সন্ধ্যার নামাজ",
    hour: 18,
    minute: 15,
    icon: <Sunset className="h-4 w-4" />,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    name: "Isha",
    nameBn: "ইশা",
    desc: "Night prayer",
    descBn: "রাতের নামাজ",
    hour: 19,
    minute: 45,
    icon: <CloudMoon className="h-4 w-4" />,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
];

function getCurrentPrayerIndex(): number {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = PRAYER_TIMES.length - 1; i >= 0; i--) {
    const prayerMinutes = PRAYER_TIMES[i].hour * 60 + PRAYER_TIMES[i].minute;
    if (currentMinutes >= prayerMinutes) {
      return i;
    }
  }
  return -1;
}

function getNextPrayerIndex(): number {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < PRAYER_TIMES.length; i++) {
    const prayerMinutes = PRAYER_TIMES[i].hour * 60 + PRAYER_TIMES[i].minute;
    if (currentMinutes < prayerMinutes) {
      return i;
    }
  }
  return 0;
}

function getTimeUntilNext(): string {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nextIndex = getNextPrayerIndex();
  const nextPrayer = PRAYER_TIMES[nextIndex];
  const nextMinutes = nextPrayer.hour * 60 + nextPrayer.minute;

  let diff = nextMinutes - currentMinutes;
  if (diff < 0) {
    diff += 24 * 60;
  }

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

function getBengaliDate(): string {
  const now = new Date();
  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];
  const days = [
    "রবিবার",
    "সোমবার",
    "মঙ্গলবার",
    "বুধবার",
    "বৃহস্পতিবার",
    "শুক্রবার",
    "শনিবার",
  ];
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getHijriDate(): string {
  const now = new Date();
  const approxHijriYear = Math.floor((now.getFullYear() - 622) * (33 / 32));
  const hijriMonths = [
    "মুহাররম",
    "সফর",
    "রবিউল আউয়াল",
    "রবিউল আখির",
    "জুমাদিল আউয়াল",
    "জুমাদিল আখির",
    "রজব",
    "শাবান",
    "রমজান",
    "শাওয়াল",
    "জিলকাদ",
    "জিলহজ",
  ];
  const monthIndex = (now.getMonth() + 1) % 12;
  const day = ((now.getDate() + 10) % 30) + 1;
  return `${day} ${hijriMonths[monthIndex]}, ${approxHijriYear} হিজরি`;
}

export default function PrayerTimes() {
  const { lang } = useLang();
  const [nextPrayerIdx, setNextPrayerIdx] = useState(getNextPrayerIndex());
  const [countdown, setCountdown] = useState(getTimeUntilNext());
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true,
  });
  const [adhanEnabled, setAdhanEnabled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextPrayerIdx(getNextPrayerIndex());
      setCountdown(getTimeUntilNext());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleNotification = useCallback((index: number) => {
    setNotifications((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const toggleAllNotifications = useCallback((enable: boolean) => {
    setNotifications((prev) => {
      const next: Record<number, boolean> = {};
      Object.keys(prev).forEach((key) => {
        next[Number(key)] = enable;
      });
      return next;
    });
  }, []);

  const currentPrayerIdx = getCurrentPrayerIndex();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              {lang === "bn" ? "নামাজের সময়" : "Prayer Times"}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {lang === "bn" ? "ঢাকা, বাংলাদেশ" : "Dhaka, Bangladesh"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-lg p-1.5 hover:bg-foreground/5 transition-colors"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Date Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-foreground/5 p-2 text-center">
          <div className="text-xs text-muted-foreground">
            {lang === "bn" ? "ইংরেজি তারিখ" : "English Date"}
          </div>
          <div className="text-xs font-medium mt-0.5">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
        <div className="rounded-xl bg-foreground/5 p-2 text-center">
          <div className="text-xs text-muted-foreground">
            {lang === "bn" ? "বাংলা তারিখ" : "Bengali Date"}
          </div>
          <div className="text-xs font-medium mt-0.5">{getBengaliDate()}</div>
        </div>
        <div className="rounded-xl bg-foreground/5 p-2 text-center">
          <div className="text-xs text-muted-foreground">
            {lang === "bn" ? "হিজরি তারিখ" : "Hijri Date"}
          </div>
          <div className="text-xs font-medium mt-0.5">{getHijriDate()}</div>
        </div>
      </div>

      {/* Next Prayer Countdown */}
      <div className="rounded-xl bg-primary/10 p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-primary font-medium">
              {lang === "bn" ? "পরবর্তী নামাজ" : "Next Prayer"}
            </div>
            <div className="text-lg font-bold text-primary">
              {lang === "bn"
                ? PRAYER_TIMES[nextPrayerIdx].nameBn
                : PRAYER_TIMES[nextPrayerIdx].name}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-primary/70">
              {lang === "bn" ? "বাকি আছে" : "Time Left"}
            </div>
            <div className="text-2xl font-bold text-primary tabular-nums">
              {countdown}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <div className="rounded-xl bg-foreground/5 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {lang === "bn"
                    ? "নোটিফিকেশন সেটিংস"
                    : "Notification Settings"}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAllNotifications(true)}
                    className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                  >
                    {lang === "bn" ? "সব চালু" : "Enable All"}
                  </button>
                  <button
                    onClick={() => toggleAllNotifications(false)}
                    className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                  >
                    {lang === "bn" ? "সব বন্ধ" : "Disable All"}
                  </button>
                </div>
              </div>

              {/* Individual Prayer Notifications */}
              {PRAYER_TIMES.map((prayer, idx) => (
                <div
                  key={prayer.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`${prayer.color}`}>{prayer.icon}</span>
                    <span className="text-sm">
                      {lang === "bn" ? prayer.nameBn : prayer.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({lang === "bn" ? "১৫ মিনিট আগে" : "15 min before"})
                    </span>
                  </div>
                  <button
                    onClick={() => toggleNotification(idx)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      notifications[idx] ? "bg-primary" : "bg-foreground/20"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        notifications[idx] ? "left-5" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              ))}

              {/* Adhan Sound Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-foreground/10">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">🔊</span>
                  <span className="text-sm">
                    {lang === "bn" ? "আজান শব্দ" : "Adhan Sound"}
                  </span>
                </div>
                <button
                  onClick={() => setAdhanEnabled(!adhanEnabled)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    adhanEnabled ? "bg-primary" : "bg-foreground/20"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      adhanEnabled ? "left-5" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prayer Cards */}
      <div className="space-y-2">
        {PRAYER_TIMES.map((prayer, idx) => {
          const isNext = idx === nextPrayerIdx;
          const isCompleted =
            currentPrayerIdx >= 0 &&
            idx <= currentPrayerIdx &&
            idx !== nextPrayerIdx;
          const isActive = idx === currentPrayerIdx;

          return (
            <motion.div
              key={prayer.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl p-3 transition-all ${
                isNext
                  ? `${prayer.bg} ring-2 ring-offset-1 ${prayer.color.replace(
                      "text-",
                      "ring-",
                    )}`
                  : isActive
                    ? "bg-foreground/5"
                    : "bg-foreground/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg ${prayer.bg} p-2 ${
                      isNext ? prayer.color : "text-muted-foreground"
                    }`}
                  >
                    {prayer.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold text-sm ${
                          isNext ? prayer.color : ""
                        }`}
                      >
                        {lang === "bn" ? prayer.nameBn : prayer.name}
                      </span>
                      {isNext && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full ${prayer.bg} ${prayer.color}`}
                        >
                          {lang === "bn" ? "পরবর্তী" : "Next"}
                        </span>
                      )}
                      {isActive && !isNext && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600">
                          {lang === "bn" ? "চালু" : "Active"}
                        </span>
                      )}
                      {isCompleted && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lang === "bn" ? prayer.descBn : prayer.desc}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-mono font-semibold ${
                      isNext ? prayer.color : "text-foreground"
                    }`}
                  >
                    {formatTime(prayer.hour, prayer.minute)}
                  </div>
                  {notifications[idx] && (
                    <Bell className="h-3 w-3 text-muted-foreground ml-auto" />
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-foreground/10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {lang === "bn"
                ? "২৩.৮১০৩° উত্তর, ৯০.৪১২৫° পূর্ব"
                : "23.8103° N, 90.4125° E"}
            </span>
          </div>
          <span>{lang === "bn" ? "ঢাকা সময়" : "Dhaka Time"}</span>
        </div>
      </div>
    </motion.div>
  );
}
