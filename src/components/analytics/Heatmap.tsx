import { useMemo, memo } from "react";
import { format, startOfYear, eachDayOfInterval, getWeek } from "date-fns";

interface HeatmapData {
  date: string;
  value: number;
  count: number;
}

export function useHeatmap(data: Array<{ date: number; value?: number }>) {
  const heatmapData = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const days = eachDayOfInterval({ start: yearStart, end: now });

    const dayMap: Record<string, { value: number; count: number }> = {};

    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      dayMap[key] = { value: 0, count: 0 };
    });

    data.forEach((item) => {
      const key = format(new Date(item.date), "yyyy-MM-dd");
      if (dayMap[key]) {
        dayMap[key].count++;
        dayMap[key].value += item.value || 1;
      }
    });

    return Object.entries(dayMap).map(([date, data]) => ({
      date,
      ...data,
    }));
  }, [data]);

  const weeks = useMemo(() => {
    const weekMap: Record<number, HeatmapData[]> = {};
    heatmapData.forEach((day) => {
      const date = new Date(day.date);
      const week = getWeek(date);
      if (!weekMap[week]) weekMap[week] = [];
      weekMap[week].push(day);
    });
    return weekMap;
  }, [heatmapData]);

  const maxValue = useMemo(() => {
    return Math.max(...heatmapData.map((d) => d.value), 1);
  }, [heatmapData]);

  const getIntensity = (value: number) => {
    const ratio = value / maxValue;
    if (ratio === 0) return 0;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  const totalDays = heatmapData.length;
  const activeDays = heatmapData.filter((d) => d.value > 0).length;
  const longestStreak = calculateLongestStreak(heatmapData);
  const currentStreak = calculateCurrentStreak(heatmapData);

  return {
    heatmapData,
    weeks,
    maxValue,
    getIntensity,
    totalDays,
    activeDays,
    longestStreak,
    currentStreak,
  };
}

function calculateLongestStreak(data: HeatmapData[]): number {
  let longest = 0;
  let current = 0;

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].value > 0) {
      if (i === 0) {
        current = 1;
      } else {
        const prevDate = new Date(sorted[i - 1].date);
        const currDate = new Date(sorted[i].date);
        const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          current++;
        } else {
          current = 1;
        }
      }
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

function calculateCurrentStreak(data: HeatmapData[]): number {
  const sorted = [...data]
    .sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  let expectedDate = format(new Date(), "yyyy-MM-dd");

  for (const day of sorted) {
    if (day.date === expectedDate && day.value > 0) {
      streak++;
      const prevDate = new Date(day.date);
      prevDate.setDate(prevDate.getDate() - 1);
      expectedDate = format(prevDate, "yyyy-MM-dd");
    } else if (day.date < expectedDate) {
      break;
    }
  }

  return streak;
}

interface YearInReviewData {
  tasks: { completed: number; total: number };
  habits: { checkins: number; streak: number };
  finance: { income: number; expense: number; savings: number };
  focus: { totalMinutes: number };
  moods: { entries: number; avgMood: number };
}

export function generateYearInReview(data: YearInReviewData) {
  const sections = [
    {
      title: "Tasks Completed",
      value: data.tasks.completed,
      subtitle: `out of ${data.tasks.total} tasks`,
      icon: "✅",
      color: "#22c55e",
    },
    {
      title: "Habit Check-ins",
      value: data.habits.checkins,
      subtitle: `Best streak: ${data.habits.streak} days`,
      icon: "🔥",
      color: "#f97316",
    },
    {
      title: "Total Saved",
      value: data.finance.savings,
      subtitle: `৳${data.finance.income.toLocaleString()} earned`,
      icon: "💰",
      color: "#3b82f6",
    },
    {
      title: "Focus Time",
      value: Math.round(data.focus.totalMinutes / 60),
      subtitle: "hours of deep work",
      icon: "⏱️",
      color: "#8b5cf6",
    },
    {
      title: "Mood Entries",
      value: data.moods.entries,
      subtitle: `Average: ${data.moods.avgMood.toFixed(1)}/5`,
      icon: "😊",
      color: "#ec4899",
    },
  ];

  const achievements = [];
  if (data.tasks.completed >= 100) achievements.push({ title: "Century Club", icon: "💯" });
  if (data.habits.streak >= 30) achievements.push({ title: "Monthly Master", icon: "🏆" });
  if (data.finance.savings >= 10000) achievements.push({ title: "Big Saver", icon: "🏦" });
  if (data.focus.totalMinutes >= 6000) achievements.push({ title: "Flow Master", icon: "🧘" });

  return { sections, achievements };
}

export const HeatmapCalendar = memo(function HeatmapCalendar({
  data,
  getIntensity,
  colorScheme = "green",
}: {
  data: HeatmapData[];
  getIntensity: (value: number) => number;
  colorScheme?: "green" | "blue" | "purple" | "orange";
}) {
  const colorMap = {
    green: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    blue: ["#ebedf0", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
    purple: ["#ebedf0", "#c994c7", "#df65b0", "#ce1256", "#67000d"],
    orange: ["#ebedf0", "#fdbe85", "#fd8d3c", "#e6550d", "#7f2704"],
  };

  const colors = colorMap[colorScheme];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 mb-2">
        {months.map((month) => (
          <div key={month} className="text-xs text-muted-foreground w-[30px] text-center">
            {month}
          </div>
        ))}
      </div>
      <div className="flex gap-1">
        {["", "Mon", "", "Wed", "", "Fri", ""].map((day, i) => (
          <div key={i} className="text-xs text-muted-foreground w-4 h-4 flex items-center justify-center">
            {day}
          </div>
        ))}
        <div className="flex gap-[3px]">
          {data.map((day, i) => {
            const intensity = getIntensity(day.value);
            return (
              <div
                key={i}
                className="w-3 h-3 rounded-sm cursor-pointer hover:ring-1 hover:ring-primary/50"
                style={{ backgroundColor: colors[intensity] }}
                title={`${day.date}: ${day.count} entries`}
              />
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span>Less</span>
        {colors.map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
});

export const YearInReviewCard = memo(function YearInReviewCard({
  data,
}: {
  data: YearInReviewData;
}) {
  const { sections, achievements } = generateYearInReview(data);

  return (
    <div className="glass-strong rounded-2xl p-6">
      <h3 className="font-bold text-lg text-foreground mb-6">Year in Review</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-xl p-4"
            style={{ backgroundColor: section.color + "15" }}
          >
            <div className="text-2xl mb-2">{section.icon}</div>
            <div className="text-2xl font-bold" style={{ color: section.color }}>
              {typeof section.value === "number" && section.title === "Total Saved"
                ? `৳${section.value.toLocaleString()}`
                : section.value.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{section.subtitle}</div>
          </div>
        ))}
      </div>

      {achievements.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm text-foreground mb-3">Achievements Unlocked</h4>
          <div className="flex flex-wrap gap-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.title}
                className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1"
              >
                <span>{achievement.icon}</span>
                <span className="text-xs font-medium">{achievement.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
