import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const BENGALI_MONTHS = [
  "বৈশাখ",
  "জ্যৈষ্ঠ",
  "আষাঢ়",
  "শ্রাবণ",
  "ভাদ্র",
  "আশ্বিন",
  "কার্তিক",
  "অগ্রহায়ণ",
  "পৌষ",
  "মাঘ",
  "ফাল্গুন",
  "চৈত্র",
];

const BENGALI_DAYS = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র"];

const BENGALI_DIGITS: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

function toBengaliDigits(num: number): string {
  return String(num)
    .split("")
    .map((d) => BENGALI_DIGITS[d] ?? d)
    .join("");
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

interface BengaliDate {
  day: number;
  month: number;
  year: number;
}

function englishToBengali(date: Date): BengaliDate {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  let bYear = y - 594;
  let bMonth: number;
  let bDay: number;

  if (m === 3 && d >= 14) {
    bMonth = 0;
    bDay = d - 13;
  } else if (m < 3 || (m === 3 && d < 14)) {
    bMonth = 9 + m;
    bDay = d + 17;
    if (bMonth > 11) {
      bMonth -= 12;
      bYear += 1;
    }
  } else {
    bMonth = m - 4;
    bDay = d - 13;
  }

  const daysInBMonth = getDaysInBengaliMonth(bMonth);
  if (bDay > daysInBMonth) {
    bMonth += 1;
    bDay -= daysInBMonth;
    if (bMonth > 11) {
      bMonth = 0;
      bYear += 1;
    }
  }

  return { day: bDay, month: bMonth, year: bYear };
}

function bengaliToEnglish(bDate: BengaliDate): Date {
  const { day, month, year } = bDate;

  let eYear = year + 593;
  let eMonth: number;
  let eDay: number;

  if (month < 9) {
    eMonth = month + 3;
    eDay = day + 13;
    const daysInMonth = getDaysInMonth(eYear, eMonth);
    if (eDay > daysInMonth) {
      eDay -= daysInMonth;
      eMonth += 1;
    }
  } else {
    eMonth = month - 9;
    eDay = day - 14;
    if (eDay <= 0) {
      if (month === 9) {
        eMonth = 3;
        eDay = day;
      } else {
        eMonth = month - 5 + 12;
        eDay = day + 16;
      }
    }
  }

  if (eMonth >= 12) {
    eMonth -= 12;
    eYear += 1;
  }

  return new Date(eYear, eMonth, Math.max(1, eDay));
}

function getDaysInBengaliMonth(month: number): number {
  const daysInMonths = [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30];
  if (month === 11) {
    const today = new Date();
    const year = today.getFullYear() + 1;
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return isLeap ? 31 : 30;
  }
  return daysInMonths[month];
}

function generateCalendarDays(year: number, month: number): (number | null)[] {
  const daysInMonth = getDaysInBengaliMonth(month);
  const firstDay = (() => {
    const engDate = bengaliToEnglish({ day: 1, month, year });
    return getFirstDayOfMonth(engDate.getFullYear(), engDate.getMonth());
  })();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  return days;
}

interface BanglaCalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

export function BanglaCalendar({
  value,
  onChange,
  className,
}: BanglaCalendarProps) {
  const { lang } = useLang();
  const isBn = lang === "bn";

  const today = useMemo(() => new Date(), []);
  const todayBengali = useMemo(() => englishToBengali(today), [today]);

  const currentBengali = useMemo(
    () => (value ? englishToBengali(value) : todayBengali),
    [value, todayBengali],
  );

  const [viewYear, setViewYear] = useState(currentBengali.year);
  const [viewMonth, setViewMonth] = useState(currentBengali.month);

  const calendarDays = useMemo(
    () => generateCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const handlePrev = useCallback(() => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const handleNext = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth]);

  const handleDateClick = useCallback(
    (day: number) => {
      const selected = bengaliToEnglish({
        day,
        month: viewMonth,
        year: viewYear,
      });
      onChange?.(selected);
    },
    [viewMonth, viewYear, onChange],
  );

  const handleToday = useCallback(() => {
    setViewYear(todayBengali.year);
    setViewMonth(todayBengali.month);
  }, [todayBengali]);

  const isToday = useCallback(
    (day: number) => {
      return (
        day === todayBengali.day &&
        viewMonth === todayBengali.month &&
        viewYear === todayBengali.year
      );
    },
    [todayBengali, viewMonth, viewYear],
  );

  const isSelected = useCallback(
    (day: number) => {
      if (!value) return false;
      const v = englishToBengali(value);
      return day === v.day && viewMonth === v.month && viewYear === v.year;
    },
    [value, viewMonth, viewYear],
  );

  const selectedDisplay = useMemo(() => {
    if (!value) return null;
    const bd = englishToBengali(value);
    const eng = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
    const bn = `${toBengaliDigits(bd.year)}-${toBengaliDigits(bd.month + 1).padStart(2, "0")}-${toBengaliDigits(bd.day).padStart(2, "0")}`;
    const bnMonth = BENGALI_MONTHS[bd.month];
    return { eng, bn, bnMonth, bengali: bd };
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "glass rounded-2xl p-5 w-full max-w-sm select-none",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          {isBn ? "বাংলা ক্যালেন্ডার" : "Bangla Calendar"}
        </h3>
        <button
          onClick={handleToday}
          className={cn(
            "ml-auto text-xs px-2 py-1 rounded-lg transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          {isBn ? "আজ" : "Today"}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrev}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold text-foreground">
            {isBn ? BENGALI_MONTHS[viewMonth] : BENGALI_MONTHS[viewMonth]}{" "}
            {toBengaliDigits(viewYear)}
          </div>
          <div className="text-xs text-muted-foreground">
            {isBn ? `${toBengaliDigits(viewYear)}` : `${viewYear} CE`}
          </div>
        </div>
        <button
          onClick={handleNext}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {BENGALI_DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewYear}-${viewMonth}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const today = isToday(day);
            const selected = isSelected(day);

            return (
              <motion.button
                key={`day-${day}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "aspect-square rounded-xl text-sm font-medium transition-all duration-150 flex items-center justify-center",
                  today &&
                    !selected &&
                    "bg-primary/15 text-primary ring-1 ring-primary/30 font-bold",
                  selected &&
                    "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold",
                  !today && !selected && "text-foreground hover:bg-muted/60",
                )}
              >
                {toBengaliDigits(day)}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {selectedDisplay && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 pt-3 border-t border-border/50"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">
              {isBn ? "নির্বাচিত" : "Selected"}:
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">
              {toBengaliDigits(selectedDisplay.bengali.day)}{" "}
              {selectedDisplay.bnMonth},{" "}
              {toBengaliDigits(selectedDisplay.bengali.year)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({selectedDisplay.eng})
            </span>
          </div>
        </motion.div>
      )}

      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isBn ? "আজকের তারিখ" : "Today's date"}:
          </span>
          <span className="text-xs font-medium text-foreground">
            {toBengaliDigits(todayBengali.day)}{" "}
            {BENGALI_MONTHS[todayBengali.month]}{" "}
            {toBengaliDigits(todayBengali.year)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export {
  englishToBengali,
  bengaliToEnglish,
  toBengaliDigits,
  BENGALI_MONTHS,
  BENGALI_DAYS,
};
