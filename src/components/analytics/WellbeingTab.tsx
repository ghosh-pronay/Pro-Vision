import { useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { subDays } from "date-fns"
import { ChartCard } from "./Charts"
import type { Period } from "./PeriodSelector"

const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#eab308",
]

const MOOD_EMOJI: Record<string, string> = {
  great: "\u{1F604}",
  good: "\u{1F642}",
  okay: "\u{1F610}",
  bad: "\u{1F614}",
  terrible: "\u{1F622}",
}

export function WellbeingTab({ period }: { period: Period }) {
  const moods = useQuery(api.moods.list)
  const sleepLogs = useQuery(api.sleepLogs.list)
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90

  const moodData = useMemo(() => {
    if (!Array.isArray(moods)) return []
    const cutoff = subDays(new Date(), days).getTime()
    const recent = moods
      .filter((m: any) => m.date >= cutoff)
      .sort((a: any, b: any) => a.date - b.date)
    const dayMap: Record<string, { sum: number; count: number }> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      })
      dayMap[key] = { sum: 0, count: 0 }
    }
    recent.forEach((m) => {
      const d = new Date(m.date)
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      })
      if (key in dayMap) {
        dayMap[key].sum += m.value
        dayMap[key].count++
      }
    })
    return Object.entries(dayMap)
      .map(([date, v]) => ({
        date,
        mood: v.count > 0 ? Math.round((v.sum / v.count) * 10) / 10 : null,
      }))
      .filter((d) => d.mood !== null)
  }, [moods, days])

  const sleepData = useMemo(() => {
    if (!Array.isArray(sleepLogs)) return []
    const cutoff = subDays(new Date(), days).getTime()
    const recent = sleepLogs
      .filter((s: any) => s.date >= cutoff)
      .sort((a: any, b: any) => a.date - b.date)
    const dayMap: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      })
      dayMap[key] = 0
    }
    recent.forEach((s: any) => {
      const d = new Date(s.date)
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      })
      if (key in dayMap) dayMap[key] = s.hours
    })
    return Object.entries(dayMap)
      .map(([date, hours]) => ({ date, hours }))
      .filter((d) => d.hours > 0)
  }, [sleepLogs, days])

  const moodDistribution = useMemo(() => {
    if (!Array.isArray(moods)) return []
    const cutoff = subDays(new Date(), days).getTime()
    const recent = moods.filter((m: any) => m.date >= cutoff)
    const counts: Record<string, number> = {
      great: 0,
      good: 0,
      okay: 0,
      bad: 0,
      terrible: 0,
    }
    recent.forEach((m: any) => {
      if (m.mood in counts) counts[m.mood]++
    })
    return Object.entries(counts)
      .map(([mood, count]) => ({
        name: `${MOOD_EMOJI[mood] || ""} ${mood}`,
        value: count,
      }))
      .filter((d) => d.value > 0)
  }, [moods, days])

  if (moods === undefined || sleepLogs === undefined) {
    return (
      <div className="glass rounded-2xl p-6 text-muted-foreground text-sm">
        Loading...
      </div>
    )
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
            <BarChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis domain={[1, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="mood"
                fill="#ec4899"
                radius={[6, 6, 0, 0]}
                barSize={16}
              />
            </BarChart>
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
                const total = moodDistribution.reduce((s, d) => s + d.value, 0)
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
                )
              })}
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  )
}
