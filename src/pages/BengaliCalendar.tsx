import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo, useCallback } from "react";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  ArrowLeftRight,
  X,
  Info,
  Sparkles,
  PartyPopper,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Sun,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Moon,
} from "lucide-react";

const BENGALI_MONTHS = [
  { bn: "বৈশাখ", en: "Baishakh", days: 30 },
  { bn: "জ্যৈষ্ঠ", en: "Jyoishtho", days: 31 },
  { bn: "আষাঢ়", en: "Asharh", days: 31 },
  { bn: "শ্রাবণ", en: "Shrabon", days: 31 },
  { bn: "ভাদ্র", en: "Bhadro", days: 31 },
  { bn: "আশ্বিন", en: "Ashwin", days: 30 },
  { bn: "কার্তিক", en: "Kartik", days: 30 },
  { bn: "অগ্রহায়ণ", en: "Ogrohayon", days: 30 },
  { bn: "পৌষ", en: "Poush", days: 30 },
  { bn: "মাঘ", en: "Magh", days: 30 },
  { bn: "ফাল্গুন", en: "Falgun", days: 30 },
  { bn: "চৈত্র", en: "Choitro", days: 30 },
];

const BENGALI_DAYS = [
  { bn: "রবিবার", en: "Sun", short: "S" },
  { bn: "সোমবার", en: "Mon", short: "M" },
  { bn: "মঙ্গলবার", en: "Tue", short: "T" },
  { bn: "বুধবার", en: "Wed", short: "W" },
  { bn: "বৃহস্পতিবার", en: "Thu", short: "T" },
  { bn: "শুক্রবার", en: "Fri", short: "F" },
  { bn: "শনিবার", en: "Sat", short: "S" },
];

const AUSPICIOUS_DAYS = [0, 4];

interface BengaliDate {
  year: number;
  month: number;
  day: number;
}

interface Festival {
  name: string;
  nameEn: string;
  month: number;
  day: number;
  description: string;
  descriptionEn: string;
  icon: string;
}

const FESTIVALS: Festival[] = [
  {
    name: "পহেলা বৈশাখ",
    nameEn: "Pohela Baishakh",
    month: 0,
    day: 1,
    description: "বাংলা নববর্ষ উদযাপন",
    descriptionEn: "Bengali New Year celebration",
    icon: "🎉",
  },
  {
    name: "বিজয়া দিবস",
    nameEn: "Victory Day",
    month: 7,
    day: 16,
    description: "মুক্তিযুদ্ধের বিজয় দিবস",
    descriptionEn: "Victory Day of the Liberation War",
    icon: "🇧🇩",
  },
  {
    name: "স্বাধীনতা দিবস",
    nameEn: "Independence Day",
    month: 11,
    day: 27,
    description: "বাংলাদেশের স্বাধীনতা দিবস",
    descriptionEn: "Bangladesh Independence Day",
    icon: "🕊️",
  },
  {
    name: "শবেবারাত",
    nameEn: "Shab-e-Barat",
    month: 6,
    day: 14,
    description: "ক্ষমা ও বর প্রার্থনার রাত",
    descriptionEn: "Night of forgiveness and blessings",
    icon: "🌙",
  },
  {
    name: "ঈদুল ফিতর",
    nameEn: "Eid ul-Fitr",
    month: 1,
    day: 1,
    description: "রমজানের পরের উৎসব",
    descriptionEn: "Festival after Ramadan",
    icon: "🕌",
  },
  {
    name: "ঈদুল আজহা",
    nameEn: "Eid ul-Adha",
    month: 3,
    day: 10,
    description: "কুরবানির ঈদ",
    descriptionEn: "Festival of Sacrifice",
    icon: "🐑",
  },
  {
    name: "দুর্গাপুজা",
    nameEn: "Durga Puja",
    month: 6,
    day: 5,
    description: "দেবী দুর্গার পূজা",
    descriptionEn: "Worship of Goddess Durga",
    icon: "🪷",
  },
];

const toBanglaDigit = (n: number): string => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n.toString().replace(/\d/g, (d) => banglaDigits[parseInt(d)]);
};

function getDaysInBengaliMonth(monthIndex: number): number {
  return BENGALI_MONTHS[monthIndex].days;
}

function getBengaliMonth1stWeekday(
  bengaliYear: number,
  monthIndex: number,
): number {
  const gregorianYear = bengaliYear + 593;
  let monthOffset = 0;
  for (let i = 0; i < monthIndex; i++) {
    monthOffset += BENGALI_MONTHS[i].days;
  }
  const april1 = new Date(gregorianYear, 3, 14);
  const targetDate = new Date(april1.getTime() + monthOffset * 86400000);
  return targetDate.getDay();
}

function gregorianToBengali(date: Date): BengaliDate {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  let bengaliYear: number;
  let bengaliMonth: number;
  let bengaliDay: number;

  if (m > 3 || (m === 3 && d >= 14)) {
    bengaliYear = y - 593;
  } else {
    bengaliYear = y - 594;
  }

  const april1 = new Date(y, 3, 14);
  const diff = Math.floor((date.getTime() - april1.getTime()) / 86400000);

  let accumulated = 0;
  bengaliMonth = 0;
  for (let i = 0; i < 12; i++) {
    const monthDays = BENGALI_MONTHS[i].days;
    if (diff < accumulated + monthDays) {
      bengaliMonth = i;
      bengaliDay = diff - accumulated + 1;
      break;
    }
    accumulated += monthDays;
    if (i === 11) {
      bengaliMonth = 11;
      bengaliDay = diff - accumulated + 1;
    }
  }

  if (bengaliDay < 1) {
    bengaliDay = 1;
  }

  return { year: bengaliYear, month: bengaliMonth, day: bengaliDay };
}

function bengaliToGregorian(bengaliDate: BengaliDate): Date {
  const gregorianYear = bengaliDate.year + 593;
  const april1 = new Date(gregorianYear, 3, 14);

  let daysOffset = 0;
  for (let i = 0; i < bengaliDate.month; i++) {
    daysOffset += BENGALI_MONTHS[i].days;
  }
  daysOffset += bengaliDate.day - 1;

  return new Date(april1.getTime() + daysOffset * 86400000);
}

function getNextFestival(
  currentBengaliDate: BengaliDate,
): { festival: Festival; daysUntil: number } | null {
  let minDays = Infinity;
  let nearest: Festival | null = null;

  for (const festival of FESTIVALS) {
    let daysUntil = 0;
    if (
      festival.month > currentBengaliDate.month ||
      (festival.month === currentBengaliDate.month &&
        festival.day >= currentBengaliDate.day)
    ) {
      for (let i = currentBengaliDate.month; i < festival.month; i++) {
        daysUntil += BENGALI_MONTHS[i].days;
      }
      daysUntil += festival.day - currentBengaliDate.day;
    } else {
      for (let i = currentBengaliDate.month; i < 12; i++) {
        daysUntil += BENGALI_MONTHS[i].days;
      }
      for (let i = 0; i <= festival.month; i++) {
        daysUntil += BENGALI_MONTHS[i].days;
      }
      daysUntil += festival.day - currentBengaliDate.day;
    }

    if (daysUntil >= 0 && daysUntil < minDays) {
      minDays = daysUntil;
      nearest = festival;
    }
  }

  if (nearest && minDays >= 0) {
    return { festival: nearest, daysUntil: minDays };
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function BengaliCalendar() {
  const { lang } = useLang();
  const today = new Date();
  const todayBengali = gregorianToBengali(today);

  const [selectedMonth, setSelectedMonth] = useState(todayBengali.month);
  const [selectedYear, setSelectedYear] = useState(todayBengali.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showConverter, setShowConverter] = useState(false);

  const [convGregorian, setConvGregorian] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
  );
  const [convBengaliYear, setConvBengaliYear] = useState(
    todayBengali.year.toString(),
  );
  const [convBengaliMonth, setConvBengaliMonth] = useState(
    todayBengali.month.toString(),
  );
  const [convBengaliDay, setConvBengaliDay] = useState(
    todayBengali.day.toString(),
  );

  const calendarDays = useMemo(() => {
    const totalDays = getDaysInBengaliMonth(selectedMonth);
    const firstWeekday = getBengaliMonth1stWeekday(selectedYear, selectedMonth);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [selectedYear, selectedMonth]);

  const festivalsThisMonth = useMemo(
    () => FESTIVALS.filter((f) => f.month === selectedMonth),
    [selectedMonth],
  );

  const nextFestival = useMemo(
    () => getNextFestival(todayBengali),
    [todayBengali],
  );

  const getFestivalForDay = useCallback(
    (day: number) =>
      FESTIVALS.find((f) => f.month === selectedMonth && f.day === day),
    [selectedMonth],
  );

  const isToday = useCallback(
    (day: number) =>
      day === todayBengali.day &&
      selectedMonth === todayBengali.month &&
      selectedYear === todayBengali.year,
    [todayBengali, selectedMonth, selectedYear],
  );

  const isAuspicious = useCallback(
    (dayOfWeek: number) => AUSPICIOUS_DAYS.includes(dayOfWeek),
    [],
  );

  const selectedDayOfWeek = useMemo(() => {
    if (selectedDay === null) return -1;
    return (
      getBengaliMonth1stWeekday(selectedYear, selectedMonth) + (selectedDay - 1)
    );
  }, [selectedDay, selectedYear, selectedMonth]);

  const selectedDayFestival = useMemo(
    () => (selectedDay !== null ? getFestivalForDay(selectedDay) : undefined),
    [selectedDay, getFestivalForDay],
  );

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const handleConvertToBengali = () => {
    const parts = convGregorian.split("-");
    if (parts.length === 3) {
      const d = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2]),
      );
      if (!isNaN(d.getTime())) {
        const bengali = gregorianToBengali(d);
        setConvBengaliYear(bengali.year.toString());
        setConvBengaliMonth(bengali.month.toString());
        setConvBengaliDay(bengali.day.toString());
      }
    }
  };

  const handleConvertToGregorian = () => {
    const bengali: BengaliDate = {
      year: Number(convBengaliYear) || todayBengali.year,
      month: Math.min(11, Math.max(0, Number(convBengaliMonth) || 0)),
      day: Math.min(
        BENGALI_MONTHS[Number(convBengaliMonth) || 0].days,
        Math.max(1, Number(convBengaliDay) || 1),
      ),
    };
    const greg = bengaliToGregorian(bengali);
    setConvGregorian(
      `${greg.getFullYear()}-${String(greg.getMonth() + 1).padStart(2, "0")}-${String(greg.getDate()).padStart(2, "0")}`,
    );
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--pv-text)]">
                {lang === "bn" ? "বাংলা পাত্রীয়" : "Bengali Calendar"}
              </h1>
              <p className="text-sm text-[var(--pv-text-muted)] mt-1">
                {lang === "bn"
                  ? `${toBanglaDigit(todayBengali.day)} ${BENGALI_MONTHS[todayBengali.month].bn}, ${toBanglaDigit(todayBengali.year)}`
                  : `${BENGALI_MONTHS[todayBengali.month].en} ${todayBengali.day}, ${todayBengali.year}`}
              </p>
            </div>
            <button
              onClick={() => setShowConverter(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--pv-primary)]/10 text-[var(--pv-primary)] hover:bg-[var(--pv-primary)]/20 transition-colors text-sm font-medium"
            >
              <ArrowLeftRight size={16} />
              {lang === "bn" ? "তারিখ রূপান্তর" : "Date Converter"}
            </button>
          </div>
        </div>
      </motion.div>

      {nextFestival && (
        <motion.div variants={item}>
          <div className="glass rounded-2xl p-6 border-l-4 border-[var(--pv-primary)]">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{nextFestival.festival.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-[var(--pv-primary)]" />
                  <span className="text-xs font-medium text-[var(--pv-primary)] uppercase tracking-wide">
                    {lang === "bn" ? "পরবর্তী উৎসব" : "Upcoming Festival"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[var(--pv-text)]">
                  {lang === "bn"
                    ? nextFestival.festival.name
                    : nextFestival.festival.nameEn}
                </h2>
                <p className="text-sm text-[var(--pv-text-muted)]">
                  {lang === "bn"
                    ? nextFestival.festival.description
                    : nextFestival.festival.descriptionEn}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Clock size={14} className="text-[var(--pv-text-muted)]" />
                  <span className="text-sm font-medium text-[var(--pv-text)]">
                    {nextFestival.daysUntil === 0
                      ? lang === "bn"
                        ? "আজ!"
                        : "Today!"
                      : lang === "bn"
                        ? `${toBanglaDigit(nextFestival.daysUntil)} দিন বাকি`
                        : `${nextFestival.daysUntil} days remaining`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={item}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-[var(--pv-glass)] transition-colors"
            >
              <ChevronLeft size={20} className="text-[var(--pv-text)]" />
            </button>
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(Number(e.target.value));
                  setSelectedDay(null);
                }}
                className="bg-transparent text-lg font-bold text-[var(--pv-text)] rounded-lg px-3 py-1 border border-[var(--pv-glass-border)] focus:outline-none focus:ring-2 focus:ring-[var(--pv-primary)]/50"
              >
                {BENGALI_MONTHS.map((m, i) => (
                  <option
                    key={i}
                    value={i}
                    className="bg-[var(--pv-bg)] text-[var(--pv-text)]"
                  >
                    {lang === "bn" ? m.bn : m.en}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(Number(e.target.value));
                  setSelectedDay(null);
                }}
                className="bg-transparent text-lg font-bold text-[var(--pv-text)] rounded-lg px-3 py-1 border border-[var(--pv-glass-border)] focus:outline-none focus:ring-2 focus:ring-[var(--pv-primary)]/50"
              >
                {Array.from(
                  { length: 11 },
                  (_, i) => todayBengali.year - 5 + i,
                ).map((y) => (
                  <option
                    key={y}
                    value={y}
                    className="bg-[var(--pv-bg)] text-[var(--pv-text)]"
                  >
                    {toBanglaDigit(y)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-[var(--pv-glass)] transition-colors"
            >
              <ChevronRight size={20} className="text-[var(--pv-text)]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {BENGALI_DAYS.map((day, i) => (
              <div
                key={i}
                className={`text-center text-xs font-medium py-2 rounded-lg ${
                  AUSPICIOUS_DAYS.includes(i)
                    ? "text-[var(--pv-primary)]"
                    : "text-[var(--pv-text-muted)]"
                }`}
              >
                <span className="hidden sm:inline">
                  {lang === "bn" ? day.bn : day.en}
                </span>
                <span className="sm:hidden">{day.short}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }

              const dayOfWeek =
                getBengaliMonth1stWeekday(selectedYear, selectedMonth) +
                (day - 1);
              const festival = getFestivalForDay(day);
              const todayFlag = isToday(day);
              const auspicious = isAuspicious(dayOfWeek % 7);
              const selected = selectedDay === day;

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedDay(day);
                    setShowDetail(true);
                  }}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium relative transition-all ${
                    todayFlag
                      ? "bg-[var(--pv-primary)] text-white shadow-lg"
                      : selected
                        ? "bg-[var(--pv-primary)]/20 text-[var(--pv-primary)] ring-2 ring-[var(--pv-primary)]"
                        : festival
                          ? "bg-[var(--pv-accent)]/10 text-[var(--pv-text)]"
                          : auspicious
                            ? "text-[var(--pv-primary)] hover:bg-[var(--pv-glass)]"
                            : "text-[var(--pv-text)] hover:bg-[var(--pv-glass)]"
                  }`}
                >
                  <span className={todayFlag ? "text-white" : ""}>
                    {toBanglaDigit(day)}
                  </span>
                  {festival && (
                    <span className="absolute -top-0.5 -right-0.5 text-[8px]">
                      {festival.icon}
                    </span>
                  )}
                  {auspicious && !festival && !todayFlag && (
                    <Star
                      size={8}
                      className="text-[var(--pv-primary)] fill-current absolute top-0.5 right-0.5"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {festivalsThisMonth.length > 0 && (
        <motion.div variants={item}>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <PartyPopper size={18} className="text-[var(--pv-primary)]" />
              <h2 className="text-lg font-bold text-[var(--pv-text)]">
                {lang === "bn" ? "এই মাসের উৎসব" : "Festivals This Month"}
              </h2>
            </div>
            <div className="space-y-3">
              {festivalsThisMonth.map((festival, i) => {
                let daysUntil = festival.day - todayBengali.day;
                if (
                  selectedMonth !== todayBengali.month ||
                  selectedYear !== todayBengali.year
                ) {
                  daysUntil = festival.day - 1;
                }
                const isPast =
                  selectedMonth === todayBengali.month &&
                  selectedYear === todayBengali.year &&
                  todayBengali.day > festival.day;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--pv-glass)] transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedDay(festival.day);
                      setShowDetail(true);
                    }}
                  >
                    <span className="text-2xl">{festival.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-[var(--pv-text)]">
                        {lang === "bn" ? festival.name : festival.nameEn}
                      </h3>
                      <p className="text-xs text-[var(--pv-text-muted)]">
                        {toBanglaDigit(festival.day)}{" "}
                        {BENGALI_MONTHS[festival.month].bn}
                      </p>
                    </div>
                    <div className="text-right">
                      {isPast ? (
                        <span className="text-xs text-[var(--pv-text-muted)]">
                          {lang === "bn" ? "অতিবাহিত" : "Passed"}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[var(--pv-primary)]">
                          {daysUntil === 0
                            ? lang === "bn"
                              ? "আজ!"
                              : "Today!"
                            : `${toBanglaDigit(daysUntil)} ${lang === "bn" ? "দিন" : "days"}`}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={item}>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} className="text-[var(--pv-primary)]" />
            <h2 className="text-lg font-bold text-[var(--pv-text)]">
              {lang === "bn" ? "শুভ দিনসমূহ" : "Auspicious Days"}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BENGALI_DAYS.map((day, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-center ${
                  AUSPICIOUS_DAYS.includes(i)
                    ? "bg-[var(--pv-primary)]/10 border border-[var(--pv-primary)]/20"
                    : "bg-[var(--pv-glass)]"
                }`}
              >
                <div
                  className={`text-sm font-medium ${
                    AUSPICIOUS_DAYS.includes(i)
                      ? "text-[var(--pv-primary)]"
                      : "text-[var(--pv-text-muted)]"
                  }`}
                >
                  {lang === "bn" ? day.bn : day.en}
                </div>
                {AUSPICIOUS_DAYS.includes(i) && (
                  <div className="text-xs text-[var(--pv-primary)] mt-1">
                    {lang === "bn" ? "শুভ" : "Auspicious"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetail && selectedDay !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDetail(false)}
            />
            <motion.div
              className="glass-strong rounded-2xl p-6 w-full max-w-md relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDetail(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--pv-glass)] transition-colors"
              >
                <X size={18} className="text-[var(--pv-text-muted)]" />
              </button>

              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-[var(--pv-text)] mb-2">
                  {toBanglaDigit(selectedDay)}
                </div>
                <div className="text-lg text-[var(--pv-text)]">
                  {lang === "bn"
                    ? BENGALI_MONTHS[selectedMonth].bn
                    : BENGALI_MONTHS[selectedMonth].en}
                </div>
                <div className="text-sm text-[var(--pv-text-muted)]">
                  {toBanglaDigit(selectedYear)}{" "}
                  {lang === "bn" ? "বঙ্গাব্দ" : "Bengali Era"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-[var(--pv-glass)]">
                  <div className="text-xs text-[var(--pv-text-muted)] mb-1">
                    {lang === "bn" ? "বার" : "Day of Week"}
                  </div>
                  <div className="font-medium text-[var(--pv-text)]">
                    {lang === "bn"
                      ? BENGALI_DAYS[((selectedDayOfWeek % 7) + 7) % 7].bn
                      : BENGALI_DAYS[((selectedDayOfWeek % 7) + 7) % 7].en}
                    {AUSPICIOUS_DAYS.includes(
                      ((selectedDayOfWeek % 7) + 7) % 7,
                    ) && (
                      <span className="ml-2 text-xs text-[var(--pv-primary)]">
                        ★ {lang === "bn" ? "শুভ দিন" : "Auspicious"}
                      </span>
                    )}
                  </div>
                </div>

                {selectedDayFestival && (
                  <div className="p-4 rounded-xl bg-[var(--pv-primary)]/10 border border-[var(--pv-primary)]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {selectedDayFestival.icon}
                      </span>
                      <div>
                        <div className="font-bold text-[var(--pv-text)]">
                          {lang === "bn"
                            ? selectedDayFestival.name
                            : selectedDayFestival.nameEn}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--pv-text-muted)]">
                      {lang === "bn"
                        ? selectedDayFestival.description
                        : selectedDayFestival.descriptionEn}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[var(--pv-glass)]">
                  <div className="text-xs text-[var(--pv-text-muted)] mb-1">
                    {lang === "bn" ? "গ্রেগরীয় তারিখ" : "Gregorian Date"}
                  </div>
                  <div className="font-medium text-[var(--pv-text)]">
                    {(() => {
                      const gregDate = bengaliToGregorian({
                        year: selectedYear,
                        month: selectedMonth,
                        day: selectedDay,
                      });
                      return gregDate.toLocaleDateString(
                        lang === "bn" ? "bn-BD" : "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConverter && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowConverter(false)}
            />
            <motion.div
              className="glass-strong rounded-2xl p-6 w-full max-w-md relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowConverter(false)}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--pv-glass)] transition-colors"
              >
                <X size={18} className="text-[var(--pv-text-muted)]" />
              </button>

              <h2 className="text-lg font-bold text-[var(--pv-text)] mb-6 text-center">
                {lang === "bn" ? "তারিখ রূপান্তর" : "Date Converter"}
              </h2>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[var(--pv-text-muted)]">
                    {lang === "bn" ? "গ্রেগরীয় তারিখ" : "Gregorian Date"}
                  </label>
                  <input
                    type="date"
                    value={convGregorian}
                    onChange={(e) => setConvGregorian(e.target.value)}
                    className="w-full bg-[var(--pv-glass)] rounded-xl px-4 py-3 text-[var(--pv-text)] border border-[var(--pv-glass-border)] focus:outline-none focus:ring-2 focus:ring-[var(--pv-primary)]/50"
                  />
                  <button
                    onClick={handleConvertToBengali}
                    className="w-full py-2 rounded-xl bg-[var(--pv-primary)] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    {lang === "bn" ? "বাংলায় রূপান্তর" : "Convert to Bengali"}{" "}
                    →
                  </button>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-px bg-[var(--pv-glass-border)]" />
                  <ArrowLeftRight
                    size={16}
                    className="mx-3 text-[var(--pv-text-muted)]"
                  />
                  <div className="w-8 h-px bg-[var(--pv-glass-border)]" />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-[var(--pv-text-muted)]">
                    {lang === "bn" ? "বাংলা তারিখ" : "Bengali Date"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={convBengaliDay}
                      onChange={(e) => setConvBengaliDay(e.target.value)}
                      placeholder={lang === "bn" ? "দিন" : "Day"}
                      min={1}
                      max={31}
                      className="w-1/3 bg-[var(--pv-glass)] rounded-xl px-3 py-3 text-center text-[var(--pv-text)] border border-[var(--pv-glass-border)] focus:outline-none focus:ring-2 focus:ring-[var(--pv-primary)]/50"
                    />
                    <select
                      value={convBengaliMonth}
                      onChange={(e) => setConvBengaliMonth(e.target.value)}
                      className="flex-1 bg-[var(--pv-glass)] rounded-xl px-3 py-3 text-[var(--pv-text)] border border-[var(--pv-glass-border)] focus:outline-none focus:ring-2 focus:ring-[var(--pv-primary)]/50"
                    >
                      {BENGALI_MONTHS.map((m, i) => (
                        <option key={i} value={i} className="bg-[var(--pv-bg)]">
                          {lang === "bn" ? m.bn : m.en}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={convBengaliYear}
                      onChange={(e) => setConvBengaliYear(e.target.value)}
                      placeholder={lang === "bn" ? "বছর" : "Year"}
                      className="w-1/3 bg-[var(--pv-glass)] rounded-xl px-3 py-3 text-center text-[var(--pv-text)] border border-[var(--pv-glass-border)] focus:outline-none focus:ring-2 focus:ring-[var(--pv-primary)]/50"
                    />
                  </div>
                  <button
                    onClick={handleConvertToGregorian}
                    className="w-full py-2 rounded-xl bg-[var(--pv-accent)] text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    ←{" "}
                    {lang === "bn"
                      ? "গ্রেগরীয়ে রূপান্তর"
                      : "Convert to Gregorian"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
