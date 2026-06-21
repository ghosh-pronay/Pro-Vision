import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useMemo } from "react";
import { BarChart3, TrendingUp } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HabitHeatmap() {
  const { lang } = useLang();

  const generateHeatmapData = () => {
    const data: { date: Date; count: number; level: number }[] = [];
    const now = new Date();

    for (let i = 364; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // eslint-disable-next-line react-hooks/purity
      const random = Math.random();
      let count = 0;
      let level = 0;

      if (random > 0.3) {
        // eslint-disable-next-line react-hooks/purity
        count = Math.floor(Math.random() * 5) + 1;
        if (count >= 4) level = 4;
        else if (count >= 3) level = 3;
        else if (count >= 2) level = 2;
        else level = 1;
      }

      data.push({ date, count, level });
    }

    return data;
  };

  const heatmapData = useMemo(() => generateHeatmapData(), []);

  const getMonthLabel = (date: Date, index: number) => {
    if (index === 0 || date.getDate() === 1) {
      return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
        month: "short",
      });
    }
    return "";
  };

  const getWeeks = () => {
    const weeks: (typeof heatmapData)[] = [];
    let currentWeek: (typeof heatmapData)[] = [];

    heatmapData.forEach((data, index) => {
      currentWeek.push(data);
      if (data.date.getDay() === 6 || index === heatmapData.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    return weeks;
  };

  const weeks = getWeeks();
  const totalHabits = heatmapData.reduce((sum, d) => sum + d.count, 0);
  const activeDays = heatmapData.filter((d) => d.count > 0).length;
  const currentStreak = calculateCurrentStreak();
  const longestStreak = calculateLongestStreak();

  function calculateCurrentStreak() {
    let streak = 0;
    for (let i = heatmapData.length - 1; i >= 0; i--) {
      if (heatmapData[i].count > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  function calculateLongestStreak() {
    let longest = 0;
    let current = 0;
    heatmapData.forEach((d) => {
      if (d.count > 0) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    });
    return longest;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-500" />
          {lang === "bn" ? "অভ্যাস হিটম্যাপ" : "Habit Heatmap"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার অভ্যাসের দৃশ্যমান জবাবদিহিতা"
            : "Visual accountability for your habits"}
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="glass rounded-xl p-4 text-center">
          <BarChart3 className="h-5 w-5 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold">{totalHabits}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "মোট হ্যাবিট" : "Total Habits"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{activeDays}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "সক্রিয় দিন" : "Active Days"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <BarChart3 className="h-5 w-5 mx-auto text-orange-500 mb-2" />
          <p className="text-2xl font-bold">{currentStreak}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "বর্তমান স্ট্রিক" : "Current Streak"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{longestStreak}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "দীর্ঘতম স্ট্রিক" : "Longest Streak"}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            {lang === "bn" ? "গত ১২ মাস" : "Last 12 Months"}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{lang === "bn" ? "কম" : "Less"}</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor:
                      level === 0
                        ? "rgba(255,255,255,0.05)"
                        : `hsl(142, ${30 + level * 15}%, ${30 + level * 10}%)`,
                  }}
                />
              ))}
            </div>
            <span>{lang === "bn" ? "বেশি" : "More"}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="flex gap-1 mb-2">
              {weeks.map((week, weekIndex) => {
                const firstDay = week[0];
                const monthLabel = firstDay
                  ? getMonthLabel(firstDay.date, heatmapData.indexOf(firstDay))
                  : "";

                return (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {weekIndex === 0 ||
                    (firstDay && firstDay.date.getDate() <= 7) ? (
                      <div className="text-[10px] text-muted-foreground h-4">
                        {monthLabel}
                      </div>
                    ) : (
                      <div className="h-4" />
                    )}
                    <div className="flex flex-col gap-1">
                      {week.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                          style={{
                            backgroundColor:
                              day.level === 0
                                ? "rgba(255,255,255,0.05)"
                                : `hsl(142, ${30 + day.level * 15}%, ${30 + day.level * 10}%)`,
                          }}
                          title={`${day.date.toLocaleDateString()} - ${day.count} ${lang === "bn" ? "হ্যাবিট" : "habits"}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            />
            <span>0</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: "hsl(142, 45%, 40%)" }}
            />
            <span>1-2</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: "hsl(142, 60%, 50%)" }}
            />
            <span>3-4</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: "hsl(142, 75%, 60%)" }}
            />
            <span>5+</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">
          {lang === "bn" ? "মাসিক সারসংক্ষেপ" : "Monthly Summary"}
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ]
            .slice(0, 6)
            .map((month, index) => {
              const monthData = heatmapData.filter((d) => {
                const date = new Date(d.date);
                return date.getMonth() === index;
              });
              const totalHabits = monthData.reduce(
                (sum, d) => sum + d.count,
                0,
              );
              const activeDays = monthData.filter((d) => d.count > 0).length;

              return (
                <div key={month} className="text-center">
                  <p className="text-sm font-medium mb-1">{month}</p>
                  <div
                    className="h-16 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `hsl(142, ${Math.min(75, totalHabits / 2)}%, ${30 + Math.min(30, totalHabits / 3)}%)`,
                    }}
                  >
                    <span className="text-xs font-bold text-white">
                      {totalHabits}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {activeDays} {lang === "bn" ? "দিন" : "days"}
                  </p>
                </div>
              );
            })}
        </div>
      </motion.div>
    </motion.div>
  );
}
