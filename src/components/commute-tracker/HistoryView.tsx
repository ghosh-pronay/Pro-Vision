import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo, useCallback } from "react";
import {
  Navigation,
  Route,
  DollarSign,
  Leaf,
  CalendarDays,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  fadeUp,
  getModeById,
  monthNamesEn,
  monthNamesBn,
  type Commute,
} from "./types";

interface HistoryViewProps {
  commutes: Commute[];
  onDeleteCommute: (id: string) => void;
}

export function HistoryView({ commutes, onDeleteCommute }: HistoryViewProps) {
  const { lang } = useLang();
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const monthDates = useMemo(() => {
    const dates: string[] = [];
    const year = calendarYear;
    const month = calendarMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i).toISOString().split("T")[0]);
    }
    return dates;
  }, [calendarMonth, calendarYear]);

  const monthCommutes = useMemo(
    () => commutes.filter((c) => monthDates.includes(c.date)),
    [commutes, monthDates],
  );

  const monthlyStats = useMemo(() => {
    const totalTrips = monthCommutes.length;
    const totalDistance = monthCommutes.reduce((sum, c) => sum + c.distance, 0);
    const totalCost = monthCommutes.reduce((sum, c) => sum + c.cost, 0);
    const totalCarbon = monthCommutes.reduce((sum, c) => {
      const mode = getModeById(c.mode);
      return sum + (mode ? mode.carbon * c.distance : 0);
    }, 0);
    return { totalTrips, totalDistance, totalCost, totalCarbon };
  }, [monthCommutes]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [calendarMonth, calendarYear]);

  const getCommutesForDate = useCallback(
    (day: number) => {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return commutes.filter((c) => c.date === dateStr);
    },
    [commutes, calendarMonth, calendarYear],
  );

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="glass rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-500" />
            {lang === "bn" ? "যাতায়াত ক্যালেন্ডার" : "Commute Calendar"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (calendarMonth === 0) {
                  setCalendarMonth(11);
                  setCalendarYear((y) => y - 1);
                } else {
                  setCalendarMonth((m) => m - 1);
                }
              }}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {lang === "bn"
                ? monthNamesBn[calendarMonth]
                : monthNamesEn[calendarMonth]}{" "}
              {calendarYear}
            </span>
            <button
              onClick={() => {
                if (calendarMonth === 11) {
                  setCalendarMonth(0);
                  setCalendarYear((y) => y + 1);
                } else {
                  setCalendarMonth((m) => m + 1);
                }
              }}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {(lang === "bn"
            ? ["সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি", "রবি"]
            : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          ).map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const dayCommutes = getCommutesForDate(day);
            const isToday =
              calendarYear === new Date().getFullYear() &&
              calendarMonth === new Date().getMonth() &&
              day === new Date().getDate();
            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                className={`relative rounded-lg p-1.5 min-h-[48px] flex flex-col items-center cursor-pointer transition-colors ${
                  isToday
                    ? "bg-primary/20 ring-1 ring-primary"
                    : dayCommutes.length > 0
                      ? "bg-muted/80"
                      : "hover:bg-muted/50"
                }`}
              >
                <span
                  className={`text-xs font-medium ${isToday ? "text-primary" : ""}`}
                >
                  {day}
                </span>
                {dayCommutes.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                    {dayCommutes.slice(0, 3).map((c) => {
                      const mode = getModeById(c.mode);
                      return (
                        <span key={c.id} className="text-[8px]">
                          {mode?.icon}
                        </span>
                      );
                    })}
                    {dayCommutes.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">
                        +{dayCommutes.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: lang === "bn" ? "এই মাসের যাত্রা" : "Monthly Trips",
            value: monthlyStats.totalTrips,
            icon: Navigation,
            color: "text-blue-500",
          },
          {
            label: lang === "bn" ? "মোট দূরত্ব" : "Total Distance",
            value: `${monthlyStats.totalDistance.toFixed(1)} km`,
            icon: Route,
            color: "text-orange-500",
          },
          {
            label: lang === "bn" ? "মোট খরচ" : "Total Cost",
            value: `৳${monthlyStats.totalCost}`,
            icon: DollarSign,
            color: "text-green-500",
          },
          {
            label: lang === "bn" ? "কার্বন" : "Carbon",
            value: `${monthlyStats.totalCarbon.toFixed(2)} kg`,
            icon: Leaf,
            color: "text-emerald-500",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            custom={i}
            className="glass rounded-xl p-4 hover-lift hover-teal"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 md:p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          {lang === "bn" ? "সমস্ত যাতায়াত" : "All Commutes"}
        </h2>
        {commutes.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={lang === "bn" ? "এখনো কোনো যাতায়াত নেই" : "No commutes yet"}
            description={
              lang === "bn"
                ? "আপনার প্রথম যাতায়াত যোগ করুন"
                : "Add your first commute to get started"
            }
          />
        ) : (
          <div className="space-y-2">
            {commutes.map((c) => {
              const mode = getModeById(c.mode);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-subtle rounded-xl p-3 flex items-center gap-3 hover-row"
                >
                  <span className="text-xl">{mode?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {c.from} → {c.to}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.date} · {lang === "bn" ? mode?.nameBn : mode?.nameEn}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">৳{c.cost}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.distance} km
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteCommute(c.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
