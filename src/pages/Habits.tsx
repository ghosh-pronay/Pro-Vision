import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { t, type Lang, type TranslationKey } from "@/i18n/translations"
import { useState, useMemo, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { logger } from "@/lib/logger"
import {
  Flame,
  Plus,
  CheckCircle2,
  Target,
  TrendingUp,
  Calendar,
  Trash2,
  Sparkles,
  Pencil,
  Archive,
  ArchiveRestore,
  Filter,
  ArrowUpDown,
  X,
  Snowflake,
  MessageSquare,
  Bell,
  Clock,
  Award,
  History,
} from "lucide-react"
import { toastSuccess, toastError } from "@/lib/toast-helpers"
import type { Id } from "../convex/_generated/dataModel"
import type { Habit } from "@/types"
import {
  HABIT_COLORS,
  FREQUENCY_OPTIONS,
  CATEGORIES,
  SORT_OPTIONS,
  SUGGESTED_HABITS,
  type SortKey,
  getMotivationalMessage,
} from "./habits-constants"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface HeatmapCalendarProps {
  lang: Lang
  completedDates: number[]
}

function HeatmapCalendar({ lang, completedDates }: HeatmapCalendarProps) {
  const days = 35
  // eslint-disable-next-line react-hooks/purity -- time snapshot is intentional
  const now = Date.now()
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

interface StreakBarProps {
  bestStreak: number
  currentStreak: number
  lang: Lang
}

function StreakBar({ bestStreak, currentStreak, lang }: StreakBarProps) {
  const max = Math.max(bestStreak, 1)
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="size-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">
          {lang === "bn" ? "স্ট্রিক সারসংক্ষেপ" : "Streak Overview"}
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{lang === "bn" ? "বর্তমান স্ট্রিক" : "Current Streak"}</span>
            <span className="font-semibold text-foreground">
              {currentStreak}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-foreground/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(currentStreak / max) * 100}%`,
                background: "var(--pv-orange)",
              }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{lang === "bn" ? "সেরা স্ট্রিক" : "Best Streak"}</span>
            <span className="font-semibold text-foreground">{bestStreak}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-foreground/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(bestStreak / max) * 100}%`,
                background: "var(--pv-blue)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface WeeklyBarProps {
  completedDates: number[]
  lang: Lang
}

function WeeklyBar({ completedDates, lang }: WeeklyBarProps) {
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

export default function Habits() {
  const { lang } = useLang()

  const habits = useQuery(api.habits.list) as Habit[] | undefined
  const habitStats = useQuery(api.habits.stats) as
    | {
        total: number
        totalStreak: number
        avgRate: number
        todayCompleted: number
      }
    | undefined
  const createHabit = useMutation(api.habits.create, "habits")
  const updateHabit = useMutation(api.habits.update, "habits")
  const archiveHabit = useMutation(api.habits.archive, "habits")
  const removeHabit = useMutation(api.habits.remove, "habits")
  const checkInHabit = useMutation(api.habits.checkIn, "habits")
  const applyStreakFreeze = useMutation(api.habits.useStreakFreeze, "habits")

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newIcon, setNewIcon] = useState("💪")
  const [newFrequency, setNewFrequency] = useState<"daily" | "weekly">("daily")
  const [newDescription, setNewDescription] = useState("")
  const [newCategory, setNewCategory] = useState("other")

  const [editingHabit, setEditingHabit] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editFrequency, setEditFrequency] = useState<"daily" | "weekly">(
    "daily",
  )
  const [editIcon, setEditIcon] = useState("💪")
  const [editCategory, setEditCategory] = useState("other")
  const [editReminder, setEditReminder] = useState("")

  const [sortBy, setSortBy] = useState<SortKey>("newest")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterFrequency, setFilterFrequency] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [checkInNote, setCheckInNote] = useState("")
  const [activeCheckIn, setActiveCheckIn] = useState<string | null>(null)

  const [detailHabit, setDetailHabit] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<"history" | "weekly">("history")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const allHabits = useMemo(() => habits ?? [], [habits])
  const stats = habitStats ?? {
    total: 0,
    totalStreak: 0,
    avgRate: 0,
    todayCompleted: 0,
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = today.getTime()

  const checkedToday = useMemo(
    () =>
      new Set(
        allHabits
          .filter((h) => (h.completedDates ?? []).some((d) => d >= todayStart))
          .map((h) => h._id),
      ),
    [allHabits, todayStart],
  )

  const activeHabits = useMemo(
    () => allHabits.filter((h) => (showArchived ? true : !h.archived)),
    [allHabits, showArchived],
  )

  const allCompletedDates = useMemo(
    () => allHabits.flatMap((h) => h.completedDates ?? []),
    [allHabits],
  )

  const bestStreak = useMemo(() => {
    let best = 0
    for (const h of allHabits) {
      const dates = (h.completedDates ?? [])
        .map((d) => new Date(d).setHours(0, 0, 0, 0))
        .sort((a, b) => b - a)
      let streak = 0
      for (let i = 0; i < dates.length; i++) {
        if (i === 0 || dates[i - 1] - dates[i] <= 86400000) {
          streak++
          best = Math.max(best, streak)
        } else {
          streak = 1
        }
      }
    }
    return best
  }, [allHabits])

  const currentStreak = useMemo(() => {
    let streak = 0
    const todayMs = todayStart
    for (let i = 0; i <= 365; i++) {
      const dayMs = todayMs - i * 86400000
      const anyCompleted = allHabits.some((h) =>
        (h.completedDates ?? []).some(
          (d) => new Date(d).setHours(0, 0, 0, 0) === dayMs,
        ),
      )
      if (anyCompleted) streak++
      else break
    }
    return streak
  }, [allHabits, todayStart])

  const totalStreak = bestStreak

  const getHabitStreak = useCallback((completedDates: number[]) => {
    const dates = completedDates
      .map((d) => new Date(d).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a)
    let streak = 0
    for (let j = 0; j < dates.length; j++) {
      if (j === 0 || dates[j - 1] - dates[j] <= 86400000) {
        streak++
      } else break
    }
    return streak
  }, [])

  const getCompletionRate = useCallback(
    (completedDates: number[]) => {
      return completedDates.length
        ? Math.min(
            100,
            Math.round(
              (completedDates.filter((d) => d > todayStart - 30 * 86400000)
                .length /
                30) *
                100,
            ),
          )
        : 0
    },
    [todayStart],
  )

  const filteredHabits = useMemo(() => {
    let result = activeHabits

    if (filterCategory) {
      result = result.filter((h) => h.category === filterCategory)
    }
    if (filterFrequency) {
      result = result.filter((h) => h.frequency === filterFrequency)
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "streak":
          return (
            getHabitStreak(b.completedDates ?? []) -
            getHabitStreak(a.completedDates ?? [])
          )
        case "completion":
          return (
            getCompletionRate(b.completedDates ?? []) -
            getCompletionRate(a.completedDates ?? [])
          )
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return (b.createdAt ?? 0) - (a.createdAt ?? 0)
      }
    })

    return result
  }, [
    activeHabits,
    filterCategory,
    filterFrequency,
    sortBy,
    getHabitStreak,
    getCompletionRate,
  ])

  const groupedHabits = useMemo(() => {
    const groups: Record<string, typeof filteredHabits> = {}
    for (const habit of filteredHabits) {
      const cat = habit.category || "other"
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(habit)
    }
    return groups
  }, [filteredHabits])

  const motivationalMessage = useMemo(
    () => getMotivationalMessage(currentStreak, lang),
    [currentStreak, lang],
  )

  const addHabit = async () => {
    if (!newName.trim()) return
    try {
      await createHabit({
        name: newName,
        description: newDescription || undefined,
        icon: newIcon || "💪",
        frequency: newFrequency,
        category: newCategory,
      })
      toastSuccess(
        lang === "bn" ? `"${newName}" যোগ হয়েছে!` : `"${newName}" added!`,
      )
      setNewName("")
      setNewIcon("💪")
      setNewFrequency("daily")
      setNewDescription("")
      setNewCategory("other")
      setShowAdd(false)
    } catch (_error) {
      logger.error("Habits", "Failed to add habit", _error)
      toastError(
        lang === "bn" ? "অভ্যাস যোগ করতে ব্যর্থ হয়েছে" : "Failed to add habit",
      )
    }
  }

  const saveEdit = async () => {
    if (!editingHabit || !editName.trim()) return
    try {
      await updateHabit({
        id: editingHabit as Id<"habits">,
        name: editName,
        description: editDescription || undefined,
        frequency: editFrequency,
        icon: editIcon,
        category: editCategory,
        reminderTime: editReminder || undefined,
      })
      setEditingHabit(null)
    } catch (_error) {
      logger.error("Habits", "Failed to save edit", _error)
      toastError(
        lang === "bn" ? "সম্পাদনা সংরক্ষণ করতে ব্যর্থ" : "Failed to save edit",
      )
    }
  }

  const startEdit = (habit: (typeof allHabits)[number]) => {
    setEditingHabit(habit._id)
    setEditName(habit.name)
    setEditDescription(habit.description ?? "")
    setEditFrequency(habit.frequency)
    setEditIcon(habit.icon ?? "💪")
    setEditCategory(habit.category ?? "other")
    setEditReminder(habit.reminderTime ?? "")
  }

  const toggleCheckIn = async (habitId: string, note?: string) => {
    await checkInHabit({
      id: habitId as Id<"habits">,
      // eslint-disable-next-line react-hooks/purity -- time snapshot is intentional
      date: Date.now(),
      note: note || undefined,
    })
    setActiveCheckIn(null)
    setCheckInNote("")
  }

  const handleFreeze = async (habitId: string) => {
    try {
      await applyStreakFreeze({ id: habitId as Id<"habits"> })
    } catch (e) {
      logger.error("Habits", "Failed to apply streak freeze", e)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await removeHabit({ id: deleteTarget })
      setDeleteTarget(null)
      toastSuccess(lang === "bn" ? "অভ্যাস মুছে ফেলা হয়েছে" : "Habit deleted")
    } catch (_error) {
      logger.error("Habits", "Failed to delete habit", _error)
      toastError(
        lang === "bn" ? "অভ্যাস মুছে ফেলতে ব্যর্থ" : "Failed to delete habit",
      )
    }
  }

  if (habits === undefined) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">Loading habits...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("nav.habits", lang)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("habits.subtitle", lang)}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
          style={{
            background:
              "linear-gradient(135deg, var(--pv-green), var(--pv-teal))",
          }}
        >
          <Plus className="size-4" />
          {lang === "bn" ? "অভ্যাস যোগ" : "Add Habit"}
        </button>
      </motion.div>

      {motivationalMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-2xl p-4 flex items-center gap-3"
        >
          <Award className="size-6 text-[var(--pv-orange)]" />
          <span className="text-sm font-medium text-foreground">
            {motivationalMessage}
          </span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="size-4 text-[var(--pv-orange)]" />
          <span className="text-sm font-semibold text-foreground">
            {lang === "bn" ? "জনপ্রিয় অভ্যাস" : "Suggested Habits"}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {lang === "bn" ? "এক ক্লিকে যোগ করুন" : "Add with one click"}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {SUGGESTED_HABITS.map((habit) => {
            const alreadyAdded = allHabits.some(
              (h) =>
                h.name === habit.name[lang] ||
                h.name === habit.name.en ||
                h.name === habit.name.bn,
            )
            return (
              <button
                key={habit.name.en}
                disabled={alreadyAdded}
                onClick={async () => {
                  if (alreadyAdded) return
                  try {
                    await createHabit({
                      name: habit.name[lang],
                      description: habit.description[lang],
                      icon: habit.icon,
                      frequency: "daily",
                      category: habit.category,
                    })
                    toastSuccess(
                      lang === "bn"
                        ? `"${habit.name[lang]}" যোগ হয়েছে!`
                        : `"${habit.name[lang]}" added!`,
                    )
                  } catch (_error) {
                    logger.error(
                      "Habits",
                      "Failed to add suggested habit",
                      _error,
                    )
                    toastError(
                      lang === "bn"
                        ? "অভ্যাস যোগ করতে ব্যর্থ হয়েছে"
                        : "Failed to add habit",
                    )
                  }
                }}
                className={`flex items-center gap-2 shrink-0 px-3 py-2 rounded-xl border transition-all ${
                  alreadyAdded
                    ? "border-[var(--pv-green)]/30 bg-[var(--pv-green)]/5 opacity-60 cursor-default"
                    : "border-border/30 hover:border-[var(--pv-green)]/50 hover:bg-[var(--pv-green)]/5 active:scale-95"
                }`}
              >
                <span className="text-lg">{habit.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-medium text-foreground whitespace-nowrap">
                    {habit.name[lang]}
                  </div>
                  <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {habit.description[lang]}
                  </div>
                </div>
                {alreadyAdded ? (
                  <CheckCircle2 className="size-4 text-[var(--pv-green)] shrink-0" />
                ) : (
                  <Plus className="size-4 text-muted-foreground group-hover:text-[var(--pv-green)] shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {showAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="glass-strong rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="size-4 text-[var(--pv-green)]" />
              <span className="text-sm font-semibold text-foreground">
                {lang === "bn"
                  ? "নতুন অভ্যাস তৈরি করুন"
                  : "Create Custom Habit"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-12 text-center text-xl bg-transparent outline-none"
                placeholder="💪"
                maxLength={2}
                aria-label={lang === "bn" ? "অভ্যাসের আইকন" : "Habit icon"}
              />
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
                placeholder={
                  lang === "bn" ? "অভ্যাসের নাম..." : "Habit name..."
                }
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                autoFocus
                aria-label={lang === "bn" ? "অভ্যাসের নাম" : "Habit name"}
              />
            </div>
            <input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder={
                lang === "bn"
                  ? "বিবরণ (ঐচ্ছিক)..."
                  : "Description (optional)..."
              }
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
              aria-label={
                lang === "bn" ? "অভ্যাসের বিবরণ" : "Habit description"
              }
            />
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setNewCategory(cat.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    newCategory === cat.id
                      ? "border-[var(--pv-green)] text-[var(--pv-green)] bg-[var(--pv-green)]/10"
                      : "border-border/40 text-muted-foreground hover-chip"
                  }`}
                >
                  {cat.icon} {cat.label[lang]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setNewFrequency(opt.value)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    newFrequency === opt.value
                      ? "border-[var(--pv-green)] text-[var(--pv-green)] bg-[var(--pv-green)]/10"
                      : "border-border/40 text-muted-foreground hover-chip"
                  }`}
                >
                  {lang === "bn"
                    ? opt.value === "daily"
                      ? "দৈনিক"
                      : "সাপ্তাহিক"
                    : opt.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={addHabit}
                className="text-sm font-semibold text-[var(--pv-green)] hover:underline"
              >
                {lang === "bn" ? "যোগ করুন" : "Add"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {editingHabit && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div className="glass-strong rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil className="size-4 text-[var(--pv-blue)]" />
                <span className="text-sm font-semibold text-foreground">
                  {lang === "bn" ? "অভ্যাস সম্পাদনা" : "Edit Habit"}
                </span>
              </div>
              <button
                onClick={() => setEditingHabit(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label={
                  lang === "bn" ? "সম্পাদনা বন্ধ করুন" : "Close edit habit"
                }
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                className="w-12 text-center text-xl bg-transparent outline-none"
                maxLength={2}
                aria-label={
                  lang === "bn" ? "অভ্যাসের আইকন সম্পাদনা" : "Edit habit icon"
                }
              />
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                className="flex-1 bg-transparent text-sm text-foreground outline-none"
                aria-label={
                  lang === "bn" ? "অভ্যাসের নাম সম্পাদনা" : "Edit habit name"
                }
              />
            </div>
            <input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder={lang === "bn" ? "বিবরণ..." : "Description..."}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
              aria-label={
                lang === "bn"
                  ? "অভ্যাসের বিবরণ সম্পাদনা"
                  : "Edit habit description"
              }
            />
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setEditCategory(cat.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    editCategory === cat.id
                      ? "border-[var(--pv-blue)] text-[var(--pv-blue)] bg-[var(--pv-blue)]/10"
                      : "border-border/40 text-muted-foreground hover-chip"
                  }`}
                >
                  {cat.icon} {cat.label[lang]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEditFrequency(opt.value)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    editFrequency === opt.value
                      ? "border-[var(--pv-blue)] text-[var(--pv-blue)] bg-[var(--pv-blue)]/10"
                      : "border-border/40 text-muted-foreground hover-chip"
                  }`}
                >
                  {lang === "bn"
                    ? opt.value === "daily"
                      ? "দৈনিক"
                      : "সাপ্তাহিক"
                    : opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Bell className="size-3.5 text-muted-foreground" />
              <input
                type="time"
                value={editReminder}
                onChange={(e) => setEditReminder(e.target.value)}
                className="bg-transparent text-xs text-foreground outline-none"
                aria-label={lang === "bn" ? "রিমাইন্ডার সময়" : "Reminder time"}
              />
              {editReminder && (
                <button
                  onClick={() => setEditReminder("")}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={
                    lang === "bn" ? "রিমাইন্ডার মুছুন" : "Clear reminder"
                  }
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={saveEdit}
                className="text-sm font-semibold text-[var(--pv-blue)] hover:underline"
              >
                {lang === "bn" ? "সংরক্ষণ" : "Save"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Flame,
            value: totalStreak,
            labelKey: "habits.totalStreak" as TranslationKey,
            color: "var(--pv-orange)",
          },
          {
            icon: Target,
            value: `${stats.todayCompleted}/${allHabits.filter((h) => !h.archived).length}`,
            labelKey: "habits.todayProgress" as TranslationKey,
            color: "var(--pv-green)",
          },
          {
            icon: TrendingUp,
            value: `${stats.avgRate}%`,
            labelKey: "habits.avgRate" as TranslationKey,
            color: "var(--pv-blue)",
          },
        ].map(({ icon: Icon, value, labelKey, color }, i) => (
          <motion.div
            key={labelKey}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="glass rounded-2xl p-4 text-center"
          >
            <Icon className="size-5 mx-auto mb-1.5" style={{ color }} />
            <div className="text-xl font-extrabold text-foreground">
              {value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t(labelKey, lang)}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <HeatmapCalendar lang={lang} completedDates={allCompletedDates} />
      </motion.div>

      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <StreakBar
          bestStreak={bestStreak}
          currentStreak={currentStreak}
          lang={lang}
        />
      </motion.div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
            showFilters || filterCategory || filterFrequency
              ? "border-[var(--pv-blue)] text-[var(--pv-blue)] bg-[var(--pv-blue)]/10"
              : "border-border/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="size-3" />
          {lang === "bn" ? "ফিল্টার" : "Filter"}
        </button>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="appearance-none rounded-lg px-3 py-1.5 text-xs font-medium border border-border/40 text-muted-foreground hover-chip bg-transparent pr-6 outline-none cursor-pointer"
            aria-label={lang === "bn" ? "সাজানোর পদ্ধতি" : "Sort habits by"}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label[lang]}
              </option>
            ))}
          </select>
          <ArrowUpDown className="size-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
            showArchived
              ? "border-[var(--pv-orange)] text-[var(--pv-orange)] bg-[var(--pv-orange)]/10"
              : "border-border/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Archive className="size-3" />
          {lang === "bn" ? "আর্কাইভ" : "Archived"}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="glass rounded-2xl p-4 space-y-3">
              <div>
                <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  {lang === "bn" ? "ক্যাটাগরি" : "Category"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilterCategory(null)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      !filterCategory
                        ? "border-[var(--pv-blue)] text-[var(--pv-blue)] bg-[var(--pv-blue)]/10"
                        : "border-border/40 text-muted-foreground hover-chip"
                    }`}
                  >
                    {lang === "bn" ? "সব" : "All"}
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                        filterCategory === cat.id
                          ? "border-[var(--pv-blue)] text-[var(--pv-blue)] bg-[var(--pv-blue)]/10"
                          : "border-border/40 text-muted-foreground hover-chip"
                      }`}
                    >
                      {cat.icon} {cat.label[lang]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                  {lang === "bn" ? "বারম্বারতা" : "Frequency"}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setFilterFrequency(null)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                      !filterFrequency
                        ? "border-[var(--pv-blue)] text-[var(--pv-blue)] bg-[var(--pv-blue)]/10"
                        : "border-border/40 text-muted-foreground hover-chip"
                    }`}
                  >
                    {lang === "bn" ? "সব" : "All"}
                  </button>
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterFrequency(opt.value)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                        filterFrequency === opt.value
                          ? "border-[var(--pv-blue)] text-[var(--pv-blue)] bg-[var(--pv-blue)]/10"
                          : "border-border/40 text-muted-foreground hover-chip"
                      }`}
                    >
                      {lang === "bn"
                        ? opt.value === "daily"
                          ? "দৈনিক"
                          : "সাপ্তাহিক"
                        : opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {(filterCategory || filterFrequency) && (
                <button
                  onClick={() => {
                    setFilterCategory(null)
                    setFilterFrequency(null)
                  }}
                  className="text-[10px] text-red-500 hover:underline"
                >
                  {lang === "bn" ? "ফিল্টার মুছুন" : "Clear filters"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {detailHabit &&
        (() => {
          const habit = allHabits.find((h) => h._id === detailHabit)
          if (!habit) return null
          const completedDates = (habit.completedDates ?? []) as number[]
          const notes = (habit.checkInNotes ?? []) as {
            date: number
            note: string
          }[]
          const streak = getHabitStreak(completedDates)
          const rate = getCompletionRate(completedDates)
          const freezes = habit.streakFreezes ?? 0
          const maxFreezes = habit.maxStreakFreezes ?? 3

          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <div className="glass-strong rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{habit.icon}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {habit.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setDetailHabit(null)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={
                      lang === "bn"
                        ? "বিস্তারিত বন্ধ করুন"
                        : "Close habit details"
                    }
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="glass rounded-xl p-2">
                    <div className="text-lg font-bold text-foreground">
                      {streak}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {lang === "bn" ? "স্ট্রিক" : "Streak"}
                    </div>
                  </div>
                  <div className="glass rounded-xl p-2">
                    <div className="text-lg font-bold text-foreground">
                      {rate}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {lang === "bn" ? "হার" : "Rate"}
                    </div>
                  </div>
                  <div className="glass rounded-xl p-2">
                    <div className="text-lg font-bold text-foreground">
                      {completedDates.length}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {lang === "bn" ? "মোট" : "Total"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Snowflake className="size-3.5 text-[var(--pv-teal)]" />
                    <span className="text-xs text-muted-foreground">
                      {lang === "bn"
                        ? `স্ট্রিক ফ্রিজ: ${freezes}/${maxFreezes}`
                        : `Streak Freezes: ${freezes}/${maxFreezes}`}
                    </span>
                  </div>
                  {freezes < maxFreezes && (
                    <button
                      onClick={() => handleFreeze(habit._id)}
                      className="text-[10px] text-[var(--pv-teal)] hover:underline"
                    >
                      {lang === "bn" ? "ব্যবহার করুন" : "Use Freeze"}
                    </button>
                  )}
                </div>
                {habit.reminderTime && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {lang === "bn"
                        ? `রিমাইন্ডার: ${habit.reminderTime}`
                        : `Reminder: ${habit.reminderTime}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDetailTab("history")}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      detailTab === "history"
                        ? "border-[var(--pv-blue)] text-[var(--pv-blue)] bg-[var(--pv-blue)]/10"
                        : "border-border/40 text-muted-foreground hover-chip"
                    }`}
                  >
                    <History className="size-3 inline mr-1" />
                    {lang === "bn" ? "ইতিহাস" : "History"}
                  </button>
                  <button
                    onClick={() => setDetailTab("weekly")}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      detailTab === "weekly"
                        ? "border-[var(--pv-blue)] text-[var(--pv-blue)] bg-[var(--pv-blue)]/10"
                        : "border-border/40 text-muted-foreground hover-chip"
                    }`}
                  >
                    <Calendar className="size-3 inline mr-1" />
                    {lang === "bn" ? "সাপ্তাহিক" : "Weekly"}
                  </button>
                </div>
                {detailTab === "weekly" && (
                  <WeeklyBar completedDates={completedDates} lang={lang} />
                )}
                {detailTab === "history" && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notes.length === 0 && completedDates.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        {lang === "bn" ? "এখনো কোনো ডেটা নেই" : "No data yet"}
                      </p>
                    )}
                    {[...notes]
                      .reverse()
                      .slice(0, 20)
                      .map((n, i) => (
                        <div
                          key={i}
                          className="glass rounded-lg p-2 flex items-start gap-2"
                        >
                          <MessageSquare className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(n.date).toLocaleDateString(
                                lang === "bn" ? "bn-BD" : "en-US",
                              )}
                            </div>
                            <div className="text-xs text-foreground">
                              {n.note}
                            </div>
                          </div>
                        </div>
                      ))}
                    {notes.length === 0 && completedDates.length > 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        {lang === "bn"
                          ? "চেক-ইন নোট নেই"
                          : "No check-in notes yet"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })()}

      <div className="space-y-2">
        {filteredHabits.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center">
            <span className="text-4xl mb-3 block">🌱</span>
            <p className="text-sm text-muted-foreground">
              {lang === "bn"
                ? "এখনো কোনো অভ্যাস নেই। + বোতামে ক্লিক করে যোগ করুন!"
                : "No habits yet. Click + to add one!"}
            </p>
          </div>
        )}
        {(() => {
          const todayHabits = filteredHabits.filter((h) => {
            const isChecked = checkedToday.has(h._id)
            return !isChecked && !h.archived
          })
          if (todayHabits.length === 0) return null
          return (
            <div className="glass-strong rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-[var(--pv-orange)]" />
                  <span className="text-sm font-semibold text-foreground">
                    {lang === "bn" ? "আজকের চেক-ইন" : "Today's Check-in"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {todayHabits.length} {lang === "bn" ? "বাকি" : "remaining"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {todayHabits.slice(0, 8).map((habit) => (
                  <button
                    key={habit._id}
                    onClick={() => toggleCheckIn(habit._id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/30 hover:border-[var(--pv-green)]/50 hover:bg-[var(--pv-green)]/5 transition-all active:scale-95"
                  >
                    <span className="text-lg">{habit.icon ?? "💪"}</span>
                    <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                      {habit.name}
                    </span>
                    <CheckCircle2 className="size-4 text-muted-foreground" />
                  </button>
                ))}
                {todayHabits.length > 8 && (
                  <div className="flex items-center px-3 py-2 text-xs text-muted-foreground">
                    +{todayHabits.length - 8} more
                  </div>
                )}
              </div>
            </div>
          )
        })()}
        {(() => {
          const completedCount = allHabits.filter(
            (h) => checkedToday.has(h._id) && !h.archived,
          ).length
          const totalActive = allHabits.filter((h) => !h.archived).length
          if (completedCount === 0 || totalActive === 0) return null
          return (
            <div className="glass rounded-xl p-3 flex items-center gap-3 hover-blue">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">
                    {lang === "bn" ? "আজকের অগ্রগতি" : "Today's Progress"}
                  </span>
                  <span className="text-xs font-bold text-[var(--pv-green)]">
                    {completedCount}/{totalActive}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-foreground/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--pv-green)] transition-all"
                    style={{
                      width: `${(completedCount / totalActive) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )
        })()}
        {CATEGORIES.filter((cat) => groupedHabits[cat.id]?.length > 0).map(
          (cat) => (
            <div key={cat.id} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm">{cat.icon}</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {cat.label[lang]}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({groupedHabits[cat.id].length})
                </span>
              </div>
              {groupedHabits[cat.id].map((habit, i) => {
                const isChecked = checkedToday.has(habit._id)
                const completedDates = (habit.completedDates ?? []) as number[]
                const completionRate = getCompletionRate(completedDates)
                const habitStreak = getHabitStreak(completedDates)
                const color = HABIT_COLORS[i % HABIT_COLORS.length]
                const freezes = habit.streakFreezes ?? 0

                return (
                  <motion.div
                    key={habit._id}
                    className={`glass rounded-xl px-4 py-3 flex items-center gap-3 group hover-row hover-green ${habit.archived ? "opacity-60" : ""}`}
                  >
                    <button
                      onClick={() => toggleCheckIn(habit._id)}
                      className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="size-6" style={{ color }} />
                      ) : (
                        <div
                          className="size-6 rounded-full border-2 border-border/40 hover:border-current transition-colors"
                          style={{ color }}
                        />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{habit.icon ?? "💪"}</span>
                        <span className="text-sm font-medium text-foreground">
                          {habit.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-foreground/5 text-muted-foreground">
                          {habit.frequency === "weekly"
                            ? lang === "bn"
                              ? "সাপ্তাহিক"
                              : "weekly"
                            : lang === "bn"
                              ? "দৈনিক"
                              : "daily"}
                        </span>
                        {habit.archived && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--pv-orange)]/10 text-[var(--pv-orange)]">
                            {lang === "bn" ? "আর্কাইভ" : "Archived"}
                          </span>
                        )}
                        {freezes > 0 && (
                          <Snowflake className="size-3 text-[var(--pv-teal)]" />
                        )}
                        {habit.reminderTime && (
                          <Bell className="size-3 text-muted-foreground" />
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {habit.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Flame
                            className="size-2.5"
                            style={{ color: "var(--pv-orange)" }}
                          />
                          {habitStreak} {t("habits.days", lang)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {completionRate}%
                        </span>
                        {isChecked && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--pv-green)]/10 text-[var(--pv-green)]">
                            {lang === "bn" ? "সম্পন্ন" : "Done"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {activeCheckIn === habit._id ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={checkInNote}
                            onChange={(e) => setCheckInNote(e.target.value)}
                            placeholder={lang === "bn" ? "নোট..." : "Note..."}
                            className="w-20 text-[10px] bg-transparent border border-border/30 rounded px-1.5 py-0.5 outline-none"
                            aria-label={
                              lang === "bn" ? "চেক-ইন নোট" : "Check-in note"
                            }
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                toggleCheckIn(habit._id, checkInNote)
                              if (e.key === "Escape") {
                                setActiveCheckIn(null)
                                setCheckInNote("")
                              }
                            }}
                          />
                          <button
                            onClick={() =>
                              toggleCheckIn(habit._id, checkInNote)
                            }
                            className="text-[10px] text-[var(--pv-green)]"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveCheckIn(habit._id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground min-w-[32px] min-h-[32px] flex items-center justify-center"
                          title={
                            lang === "bn"
                              ? "নোট সহ চেক-ইন"
                              : "Check-in with note"
                          }
                        >
                          <MessageSquare className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setDetailHabit(
                            detailHabit === habit._id ? null : habit._id,
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title={lang === "bn" ? "বিস্তারিত" : "Details"}
                      >
                        <History className="size-3.5" />
                      </button>
                      <button
                        onClick={() => startEdit(habit)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground min-w-[32px] min-h-[32px] flex items-center justify-center"
                        aria-label={
                          lang === "bn" ? "অভ্যাস সম্পাদনা" : "Edit habit"
                        }
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          archiveHabit({ id: habit._id as Id<"habits"> })
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-[var(--pv-orange)] min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        {habit.archived ? (
                          <ArchiveRestore className="size-3.5" />
                        ) : (
                          <Archive className="size-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(habit._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 min-w-[32px] min-h-[32px] flex items-center justify-center -mr-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ),
        )}
      </div>

      {deleteTarget && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="glass-strong rounded-2xl p-6 max-w-sm mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <Trash2 className="size-8 mx-auto mb-2 text-red-500" />
              <h3 className="text-sm font-semibold text-foreground">
                {lang === "bn" ? "অভ্যাস মুছে ফেলুন?" : "Delete Habit?"}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "bn"
                  ? "এটি অপরিবর্তনীয়। সব ইতিহাস এবং স্ট্রিক মুছে যাবে।"
                  : "This cannot be undone. All history and streaks will be lost."}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-border/40 text-muted-foreground hover-chip"
              >
                {lang === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                {lang === "bn" ? "মুছে ফেলুন" : "Delete"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
