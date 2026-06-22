import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ChartCard } from "./Charts";
import { useHeatmap, HeatmapCalendar } from "./Heatmap";

type Period = "7d" | "30d" | "90d";

const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#eab308",
];

const MOOD_EMOJI: Record<string, string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  bad: "😔",
  terrible: "😢",
};

export function PeriodSelector({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  const periods: { id: Period; label: string }[] = [
    { id: "7d", label: "7 Days" },
    { id: "30d", label: "30 Days" },
    { id: "90d", label: "90 Days" },
  ];
  return (
    <div className="flex gap-1 p-1 glass rounded-2xl">
      {periods.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            value === p.id
              ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)] shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function OverviewTab({ period }: { period: Period }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Overview</h3>
      <p className="text-muted-foreground text-sm">
        Analytics overview for {period}.
      </p>
    </div>
  );
}

export function TasksTab({ period }: { period: Period }) {
  const tasks = useQuery(api.tasks.list);
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const statusData = useMemo(() => {
    if (!tasks) return [];
    const now = Date.now();
    const pending = tasks.filter(
      (t) => !t.completed && (!t.dueDate || t.dueDate > now),
    ).length;
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate <= now,
    ).length;
    const completed = tasks.filter((t) => t.completed).length;
    return [
      { status: "Pending", count: pending, fill: "#f97316" },
      { status: "Overdue", count: overdue, fill: "#ef4444" },
      { status: "Completed", count: completed, fill: "#22c55e" },
    ];
  }, [tasks]);

  const createdPerDay = useMemo(() => {
    if (!tasks) return [];
    const cutoff = subDays(new Date(), days).getTime();
    const recent = tasks.filter((t) => t.createdAt >= cutoff);
    const dayMap: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      dayMap[format(d, "MMM dd")] = 0;
    }
    recent.forEach((t) => {
      const key = format(new Date(t.createdAt), "MMM dd");
      if (key in dayMap) dayMap[key]++;
    });
    return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
  }, [tasks, days]);

  if (tasks === undefined) {
    return (
      <div className="glass rounded-2xl p-6 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartCard title="Tasks by Status">
        {statusData.length === 0 || statusData.every((s) => s.count === 0) ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No tasks yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Tasks Created Per Day">
        {createdPerDay.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No data
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={createdPerDay}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: "#6366f1", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

export function HabitsTab({ period }: { period: Period }) {
  const habits = useQuery(api.habits.list);
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const completionData = useMemo(() => {
    if (!habits) return [];
    const cutoff = subDays(new Date(), days).getTime();
    return habits.map((h) => {
      const recentCheckins = h.completedDates.filter((d) => d >= cutoff).length;
      const rate = Math.round((recentCheckins / days) * 100);
      return {
        name: h.name.length > 12 ? h.name.slice(0, 12) + "…" : h.name,
        rate: Math.min(rate, 100),
      };
    });
  }, [habits, days]);

  const heatmapData = useMemo(() => {
    if (!habits) return [];
    const entries: { date: number; value?: number }[] = [];
    habits.forEach((h) => {
      h.completedDates.forEach((d) => entries.push({ date: d }));
    });
    return entries;
  }, [habits]);

  const { heatmapData: heatData, getIntensity } = useHeatmap(heatmapData);

  if (habits === undefined) {
    return (
      <div className="glass rounded-2xl p-6 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartCard title="Habit Completion Rates (%)">
        {completionData.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No habits yet
          </p>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={Math.max(200, completionData.length * 40)}
          >
            <BarChart
              data={completionData}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                width={100}
              />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Bar
                dataKey="rate"
                fill="#6366f1"
                radius={[0, 6, 6, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Daily Activity Heatmap">
        <HeatmapCalendar
          data={heatData}
          getIntensity={getIntensity}
          colorScheme="green"
        />
      </ChartCard>
    </div>
  );
}

export { FinanceTab } from "./FinanceTab";

export function WellbeingTab({ period }: { period: Period }) {
  const moods = useQuery(api.moods.list);
  const sleepLogs = useQuery(api.sleepLogs.list);
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const moodData = useMemo(() => {
    if (!moods) return [];
    const cutoff = subDays(new Date(), days).getTime();
    const recent = moods
      .filter((m) => m.date >= cutoff)
      .sort((a, b) => a.date - b.date);
    const dayMap: Record<string, { sum: number; count: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      dayMap[format(d, "MMM dd")] = { sum: 0, count: 0 };
    }
    recent.forEach((m) => {
      const key = format(new Date(m.date), "MMM dd");
      if (key in dayMap) {
        dayMap[key].sum += m.value;
        dayMap[key].count++;
      }
    });
    return Object.entries(dayMap)
      .map(([date, v]) => ({
        date,
        mood: v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : null,
      }))
      .filter((d) => d.mood !== null);
  }, [moods, days]);

  const sleepData = useMemo(() => {
    if (!sleepLogs) return [];
    const cutoff = subDays(new Date(), days).getTime();
    const recent = sleepLogs
      .filter((s) => s.date >= cutoff)
      .sort((a, b) => a.date - b.date);
    const dayMap: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      dayMap[format(d, "MMM dd")] = 0;
    }
    recent.forEach((s) => {
      const key = format(new Date(s.date), "MMM dd");
      if (key in dayMap) dayMap[key] = s.hours;
    });
    return Object.entries(dayMap)
      .map(([date, hours]) => ({ date, hours }))
      .filter((d) => d.hours > 0);
  }, [sleepLogs, days]);

  const moodDistribution = useMemo(() => {
    if (!moods) return [];
    const cutoff = subDays(new Date(), days).getTime();
    const recent = moods.filter((m) => m.date >= cutoff);
    const counts: Record<string, number> = {
      great: 0,
      good: 0,
      okay: 0,
      bad: 0,
      terrible: 0,
    };
    recent.forEach((m) => {
      if (m.mood in counts) counts[m.mood]++;
    });
    return Object.entries(counts)
      .map(([mood, count]) => ({
        name: `${MOOD_EMOJI[mood] || ""} ${mood}`,
        value: count,
      }))
      .filter((d) => d.value > 0);
  }, [moods, days]);

  if (moods === undefined || sleepLogs === undefined) {
    return (
      <div className="glass rounded-2xl p-6 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartCard title="Mood Over Time">
        {moodData.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No mood entries
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={moodData}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#ec4899"
                fill="url(#moodGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Sleep Hours Per Day">
        {sleepData.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No sleep logs
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sleepData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="hours"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Mood Distribution">
        {moodDistribution.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No mood data
          </p>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {moodDistribution.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {moodDistribution.map((item, index) => {
                const total = moodDistribution.reduce((s, d) => s + d.value, 0);
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <span className="flex-1 text-muted-foreground">
                      {item.name}
                    </span>
                    <span className="font-medium">
                      {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

export function FocusTab({ period }: { period: Period }) {
  const sessions = useQuery(api.focusSessions.list);
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const sessionsPerDay = useMemo(() => {
    if (!sessions) return [];
    const cutoff = subDays(new Date(), days).getTime();
    const recent = sessions.filter((s) => s.createdAt >= cutoff);
    const dayMap: Record<string, number> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i));
      dayMap[format(d, "MMM dd")] = 0;
    }
    recent.forEach((s) => {
      const key = format(new Date(s.createdAt), "MMM dd");
      if (key in dayMap) dayMap[key]++;
    });
    return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
  }, [sessions, days]);

  const modeData = useMemo(() => {
    if (!sessions) return [];
    const cutoff = subDays(new Date(), days).getTime();
    const recent = sessions.filter((s) => s.createdAt >= cutoff);
    const counts: Record<string, number> = {};
    recent.forEach((s) => {
      counts[s.type] = (counts[s.type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => ({ name: type, value: count }))
      .sort((a, b) => b.value - a.value);
  }, [sessions, days]);

  if (sessions === undefined) {
    return (
      <div className="glass rounded-2xl p-6 text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ChartCard title="Focus Sessions Per Day">
        {sessionsPerDay.length === 0 ||
        sessionsPerDay.every((d) => d.count === 0) ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No focus sessions yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionsPerDay}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#06b6d4"
                radius={[6, 6, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Sessions by Mode">
        {modeData.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No sessions
          </p>
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={150} height={150}>
              <PieChart>
                <Pie
                  data={modeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {modeData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {modeData.map((item, index) => {
                const total = modeData.reduce((s, d) => s + d.value, 0);
                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <span className="flex-1 text-muted-foreground capitalize">
                      {item.name}
                    </span>
                    <span className="font-medium">
                      {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

export function GoalsTab() {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Goals</h3>
      <p className="text-muted-foreground text-sm">Goal progress analytics.</p>
    </div>
  );
}

export function InsightsTab({ period }: { period: Period }) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Insights</h3>
      <p className="text-muted-foreground text-sm">Insights for {period}.</p>
    </div>
  );
}
