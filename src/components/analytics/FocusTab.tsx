import React, { useMemo } from "react"
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
import type { FocusSession } from "@/types"

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

export const FocusTab = React.memo(function FocusTab({
  period,
}: {
  period: Period
}) {
  const sessions = useQuery(api.focusSessions.list) as
    | FocusSession[]
    | undefined
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90

  const sessionsPerDay = useMemo(() => {
    if (!Array.isArray(sessions)) return []
    const cutoff = subDays(new Date(), days).getTime()
    const recent = sessions.filter((s) => s.createdAt >= cutoff)
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
    recent.forEach((s) => {
      const d = new Date(s.createdAt)
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      })
      if (key in dayMap) dayMap[key]++
    })
    return Object.entries(dayMap).map(([date, count]) => ({ date, count }))
  }, [sessions, days])

  const modeData = useMemo(() => {
    if (!Array.isArray(sessions)) return []
    const cutoff = subDays(new Date(), days).getTime()
    const recent = sessions.filter((s) => s.createdAt >= cutoff)
    const counts: Record<string, number> = {}
    recent.forEach((s) => {
      counts[s.type] = (counts[s.type] || 0) + 1
    })
    return Object.entries(counts)
      .map(([type, count]) => ({ name: type, value: count }))
      .sort((a, b) => b.value - a.value)
  }, [sessions, days])

  if (sessions === undefined) {
    return (
      <div className="glass rounded-2xl p-6 text-muted-foreground text-sm">
        Loading...
      </div>
    )
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
                const total = modeData.reduce((s, d) => s + d.value, 0)
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
                )
              })}
            </div>
          </div>
        )}
      </ChartCard>
    </div>
  )
})
