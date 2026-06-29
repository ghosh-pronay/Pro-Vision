import { useMemo } from "react"
import { Calendar } from "lucide-react"
import { t, type Lang } from "@/i18n/translations"

interface HeatmapCalendarProps {
  lang: Lang
  completedDates: number[]
}

export function HeatmapCalendar({
  lang,
  completedDates,
}: HeatmapCalendarProps) {
  const days = 35
  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), [])
  const cells = Array.from({ length: days }, (_, i) => {
    const dayStart = now - (days - 1 - i) * 24 * 60 * 60 * 1000
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    const count = completedDates.filter(
      (d) => d >= dayStart && d < dayEnd,
    ).length
    return {
      day: i,
      level: count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3,
    }
  })

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="size-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">
          {t("habits.heatmap", lang)}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map(({ day, level }) => (
          <div
            key={day}
            className="aspect-square rounded-md transition-colors"
            style={{
              background:
                level === 0
                  ? "var(--foreground)"
                  : level === 1
                    ? "rgba(61,170,92,0.2)"
                    : level === 2
                      ? "rgba(61,170,92,0.45)"
                      : "rgba(61,170,92,0.75)",
              opacity: level === 0 ? 0.04 : 1,
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-2">
        <span className="text-xs text-muted-foreground">
          {t("habits.less", lang)}
        </span>
        {[0, 1, 2, 3].map((l) => (
          <div
            key={l}
            className="size-3 rounded-sm"
            style={{
              background:
                l === 0
                  ? "var(--foreground)"
                  : l === 1
                    ? "rgba(61,170,92,0.2)"
                    : l === 2
                      ? "rgba(61,170,92,0.45)"
                      : "rgba(61,170,92,0.75)",
              opacity: l === 0 ? 0.04 : 1,
            }}
          />
        ))}
        <span className="text-xs text-muted-foreground">
          {t("habits.more", lang)}
        </span>
      </div>
    </div>
  )
}

interface WeeklyBarProps {
  completedDates: number[]
  lang: Lang
}

export function WeeklyBar({ completedDates, lang }: WeeklyBarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay()
  const weekDays =
    lang === "bn"
      ? ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="flex items-end gap-1 h-10">
      {weekDays.map((day, i) => {
        const dayMs = today.getTime() - (dayOfWeek - i) * 86400000
        const done = completedDates.some(
          (d) => new Date(d).setHours(0, 0, 0, 0) === dayMs,
        )
        return (
          <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
            <div
              className="w-full rounded-sm transition-colors"
              style={{
                height: done ? "100%" : "30%",
                background: done ? "var(--pv-green)" : "var(--foreground)",
                opacity: done ? 1 : 0.08,
              }}
            />
            <span
              className="text-[8px]"
              style={{
                color:
                  i === dayOfWeek
                    ? "var(--pv-blue)"
                    : "var(--muted-foreground)",
                fontWeight: i === dayOfWeek ? 700 : 400,
              }}
            >
              {day}
            </span>
          </div>
        )
      })}
    </div>
  )
}
