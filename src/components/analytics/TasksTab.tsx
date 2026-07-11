import { useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { format, subDays, startOfDay } from "date-fns"
import { ChartCard } from "./Charts"
import type { Period } from "./PeriodSelector"

export function TasksTab({ period }: { period: Period }) {
  const tasks = useQuery(api.tasks.list)
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90

  const statusData = useMemo(() => {
    if (!Array.isArray(tasks)) return []
    // eslint-disable-next-line react-hooks/purity -- time snapshot is intentional
    const now = Date.now()
    const pending = tasks.filter(
      (t) => !t.completed && (!t.dueDate || t.dueDate > now),
    ).length
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate <= now,
    ).length
    const completed = tasks.filter((t) => t.completed).length
    return [
      { status: "Pending", count: pending, fill: "#f97316" },
      { status: "Overdue", count: overdue, fill: "#ef4444" },
      { status: "Completed", count: completed, fill: "#22c55e" },
    ]
  }, [tasks])

  const createdPerDay = useMemo(() => {
    if (!Array.isArray(tasks)) return []
    const cutoff = subDays(new Date(), days).getTime()
    const recent = tasks.filter((t: any) => t.createdAt >= cutoff)
    const dayMap: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = startOfDay(subDays(new Date(), i))
      dayMap[format(d, "MMM dd")] = 0
    }
    recent.forEach((t: any) => {
      const key = format(new Date(t.createdAt), "MMM dd")
      if (key in dayMap) dayMap[key]++
    })
    return Object.entries(dayMap).map(([date, count]) => ({ date, count }))
  }, [tasks, days])

  if (tasks === undefined) {
    return (
      <div className="glass rounded-2xl p-6 text-muted-foreground text-sm">
        Loading...
      </div>
    )
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
  )
}
