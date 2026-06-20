import { useState, useMemo, memo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface AnalyticsData {
  transactions: Array<{
    amount: number;
    type: "income" | "expense";
    category: string;
    date: number;
  }>;
  habits: Array<{
    name: string;
    checkIns: number[];
    streak: number;
  }>;
  tasks: Array<{
    completed: boolean;
    dueDate?: number;
    createdAt: number;
  }>;
  moods: Array<{
    mood: number;
    date: number;
  }>;
  focusSessions: Array<{
    duration: number;
    date: number;
  }>;
}

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#eab308"];

export function useAnalytics(data: AnalyticsData) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  const dateRange = useMemo(() => {
    const now = new Date();
    if (timeRange === "week") {
      return { start: startOfWeek(now), end: endOfWeek(now) };
    } else if (timeRange === "month") {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    } else {
      return { start: subDays(now, 365), end: now };
    }
  }, [timeRange]);

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= dateRange.start && date <= dateRange.end;
    });
  }, [data.transactions, dateRange]);

  const spendingByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const dailySpending = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const day = format(new Date(t.date), "MMM dd");
        dailyMap[day] = (dailyMap[day] || 0) + t.amount;
      });
    return Object.entries(dailyMap).map(([date, amount]) => ({
      date,
      amount,
    }));
  }, [filteredTransactions]);

  const incomeVsExpense = useMemo(() => {
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach((t) => {
      const month = format(new Date(t.date), "MMM");
      if (!monthlyMap[month]) {
        monthlyMap[month] = { income: 0, expense: 0 };
      }
      if (t.type === "income") {
        monthlyMap[month].income += t.amount;
      } else {
        monthlyMap[month].expense += t.amount;
      }
    });
    return Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      ...data,
    }));
  }, [filteredTransactions]);

  const habitCompletionRate = useMemo(() => {
    const totalDays = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    return data.habits.map((habit) => ({
      name: habit.name,
      rate: Math.round((habit.checkIns.length / totalDays) * 100),
      streak: habit.streak,
    }));
  }, [data.habits, timeRange]);

  const taskCompletionTrend = useMemo(() => {
    const weeklyMap: Record<string, { completed: number; total: number }> = {};
    data.tasks.forEach((task) => {
      const week = format(startOfWeek(new Date(task.createdAt)), "MMM dd");
      if (!weeklyMap[week]) {
        weeklyMap[week] = { completed: 0, total: 0 };
      }
      weeklyMap[week].total++;
      if (task.completed) {
        weeklyMap[week].completed++;
      }
    });
    return Object.entries(weeklyMap).map(([week, data]) => ({
      week,
      ...data,
      rate: Math.round((data.completed / data.total) * 100) || 0,
    }));
  }, [data.tasks]);

  const moodTrend = useMemo(() => {
    const dailyMoods: Record<string, { avg: number; count: number }> = {};
    data.moods.forEach((m) => {
      const day = format(new Date(m.date), "MMM dd");
      if (!dailyMoods[day]) {
        dailyMoods[day] = { avg: 0, count: 0 };
      }
      dailyMoods[day].avg += m.mood;
      dailyMoods[day].count++;
    });
    return Object.entries(dailyMoods).map(([date, data]) => ({
      date,
      mood: Math.round((data.avg / data.count) * 10) / 10,
    }));
  }, [data.moods]);

  const focusTimeByDay = useMemo(() => {
    const dailyFocus: Record<string, number> = {};
    data.focusSessions.forEach((s) => {
      const day = format(new Date(s.date), "MMM dd");
      dailyFocus[day] = (dailyFocus[day] || 0) + s.duration;
    });
    return Object.entries(dailyFocus).map(([day, minutes]) => ({
      day,
      hours: Math.round(minutes / 60 * 10) / 10,
    }));
  }, [data.focusSessions]);

  const summary = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const completedTasks = data.tasks.filter((t) => t.completed).length;
    const avgMood = data.moods.length
      ? data.moods.reduce((sum, m) => sum + m.mood, 0) / data.moods.length
      : 0;
    const totalFocusMinutes = data.focusSessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      totalIncome,
      totalExpense,
      savings: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
      completedTasks,
      taskCompletionRate: data.tasks.length ? Math.round((completedTasks / data.tasks.length) * 100) : 0,
      avgMood: Math.round(avgMood * 10) / 10,
      totalFocusHours: Math.round(totalFocusMinutes / 60 * 10) / 10,
      activeHabits: data.habits.length,
    };
  }, [filteredTransactions, data.tasks, data.moods, data.focusSessions, data.habits]);

  return {
    timeRange,
    setTimeRange,
    spendingByCategory,
    dailySpending,
    incomeVsExpense,
    habitCompletionRate,
    taskCompletionTrend,
    moodTrend,
    focusTimeByDay,
    summary,
    COLORS,
  };
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard = memo(function ChartCard({ title, children, className = "" }: ChartCardProps) {
  return (
    <div className={`glass-strong rounded-2xl p-6 ${className}`}>
      <h3 className="font-semibold text-sm text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
});

interface SpendingPieChartProps {
  data: Array<{ name: string; value: number }>;
  colors: string[];
}

export const SpendingPieChart = memo(function SpendingPieChart({ data, colors }: SpendingPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={150} height={150}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `৳${value.toLocaleString()}`}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {data.slice(0, 5).map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="flex-1 text-muted-foreground">{item.name}</span>
            <span className="font-medium">
              {Math.round((item.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

interface TrendLineChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  color?: string;
}

export const TrendLineChart = memo(function TrendLineChart({ data, xKey, yKey, color = "#6366f1" }: TrendLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${yKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          fill={`url(#gradient-${yKey})`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

interface ComparisonBarChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKeys: Array<{ key: string; color: string; name: string }>;
}

export const ComparisonBarChart = memo(function ComparisonBarChart({ data, xKey, yKeys }: ComparisonBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {yKeys.map((yKey) => (
          <Bar key={yKey.key} dataKey={yKey.key} fill={yKey.color} name={yKey.name} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
});

interface MoodLineChartProps {
  data: Array<{ date: string; mood: number }>;
}

export const MoodLineChart = memo(function MoodLineChart({ data }: MoodLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="mood"
          stroke="#ec4899"
          strokeWidth={2}
          dot={{ fill: "#ec4899", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});
