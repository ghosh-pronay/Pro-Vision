import React, { useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { subDays } from "date-fns"
import { ChartCard } from "./Charts"
import { useHeatmap, HeatmapCalendar } from "./Heatmap"
import type { Period } from "./PeriodSelector"
import type { Habit } from "@/types"

export const HabitsTab = React.memo(function HabitsTab({
  period,
}: {
  period: Period
}) {
  const habits = useQuery(api.habits.list) as Habit[] | undefined
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90

  const completionData = useMemo(() => {
    if (!Array.isArray(habits)) return []
    const cutoff = subDays(new Date(), days).getTime()
    return habits.map((h) => {
      const recentCheckins = h.completedDates.filter(
        (d: number) => d >= cutoff,
      ).length
      const rate = Math.round((recentCheckins / days) * 100)
      return {
        name: h.name.length > 12 ? h.name.slice(0, 12) + "…" : h.name,
        rate: Math.min(rate, 100),
      }
    })
  }, [habits, days])

  const heatmapData = useMemo(() => {
    if (!Array.isArray(habits)) return []
    const entries: { date: number; value?: number }[] = []
    habits.forEach((h) => {
      h.completedDates.forEach((d: number) => entries.push({ date: d }))
    })
    return entries
  }, [habits])

  const { heatmapData: heatData, getIntensity } = useHeatmap(heatmapData)

  if (habits === undefined) {
    return (
      <div className="glass rounded-2xl p-6 text-muted-foreground text-sm">
        Loading...
      </div>
    )
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
  )
})
