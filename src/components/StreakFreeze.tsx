import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { t, type TranslationKey } from "@/i18n/translations"
import {
  Snowflake,
  Calendar,
  Shield,
  Check,
  X,
  Plus,
  AlertTriangle,
} from "lucide-react"

interface FreezeRecord {
  id: string
  habitId: string
  habitName: string
  date: string
  usedAt: number
}

interface HabitOption {
  id: string
  name: string
}

const DEMO_HABITS: HabitOption[] = [
  { id: "1", name: "Morning Meditation" },
  { id: "2", name: "Exercise" },
  { id: "3", name: "Reading" },
  { id: "4", name: "Healthy Eating" },
]

const DEMO_FREEZES: FreezeRecord[] = [
  {
    id: "1",
    habitId: "1",
    habitName: "Morning Meditation",
    date: "2025-01-15",
    usedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "2",
    habitId: "2",
    habitName: "Exercise",
    date: "2025-01-10",
    usedAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
  },
]

const MAX_FREEZES = 3

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function StreakFreeze() {
  const { lang } = useLang()
  const [freezes, setFreezes] = useState<FreezeRecord[]>(DEMO_FREEZES)
  const [showForm, setShowForm] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  )

  const availableFreezes = MAX_FREEZES - freezes.length
  const isLow = availableFreezes <= 1

  const handleUseFreeze = () => {
    if (!selectedHabit || !selectedDate || availableFreezes <= 0) return

    const habit = DEMO_HABITS.find((h) => h.id === selectedHabit)
    if (!habit) return

    const newFreeze: FreezeRecord = {
      id: Date.now().toString(),
      habitId: selectedHabit,
      habitName: habit.name,
      date: selectedDate,
      usedAt: Date.now(),
    }

    setFreezes((prev) => [...prev, newFreeze])
    setShowForm(false)
    setSelectedHabit("")
    setSelectedDate(new Date().toISOString().split("T")[0])
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (lang === "bn") {
      return date.toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <motion.div variants={fadeUp} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 p-2">
            <Snowflake className="h-4 w-4 text-cyan-500" />
          </div>
          <h3 className="font-semibold text-sm">
            {t("habits.streakFreeze" as TranslationKey, lang)}
          </h3>
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-500" />
            <span className="text-sm font-medium">
              {lang === "bn" ? "উপলব্ধ ফ্রিজ" : "Available Freezes"}
            </span>
          </div>
          <span
            className={`text-sm font-bold ${
              isLow ? "text-orange-500" : "text-cyan-500"
            }`}
          >
            {availableFreezes} / {MAX_FREEZES}
          </span>
        </div>

        {isLow && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-orange-500">
              {lang === "bn"
                ? "সতর্কতা: ফ্রিজ কম বাকি আছে!"
                : "Warning: Running low on freezes!"}
            </span>
          </div>
        )}

        <div className="flex gap-1 mb-3">
          {Array.from({ length: MAX_FREEZES }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < availableFreezes ? "bg-cyan-500" : "bg-foreground/10"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          disabled={availableFreezes <= 0}
          className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-foreground/5 py-2 text-sm hover:bg-foreground/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          {t("habits.streakFreezeAvailable" as TranslationKey, lang)}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass rounded-2xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">
                {lang === "bn" ? "ফ্রিজ ব্যবহার করুন" : "Use a Freeze"}
              </h4>
              <button
                onClick={() => setShowForm(false)}
                className="cursor-pointer text-muted-foreground hover:text-foreground hover-tab"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                {lang === "bn" ? "অভ্যাস নির্বাচন করুন" : "Select Habit"}
              </label>
              <select
                value={selectedHabit}
                onChange={(e) => setSelectedHabit(e.target.value)}
                className="w-full rounded-lg bg-foreground/5 px-3 py-2 text-sm"
              >
                <option value="">
                  {lang === "bn" ? "অভ্যাস বাছাই করুন" : "Choose a habit"}
                </option>
                {DEMO_HABITS.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                {lang === "bn" ? "তারিখ নির্বাচন করুন" : "Select Date"}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg bg-foreground/5 px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={handleUseFreeze}
              disabled={!selectedHabit || !selectedDate}
              className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Snowflake className="h-4 w-4" />
              {lang === "bn" ? "ফ্রিজ ব্যবহার করুন" : "Use Freeze"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {freezes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {lang === "bn" ? "ফ্রিজ ইতিহাস" : "Freeze History"}
            </span>
          </div>
          {freezes.map((freeze) => (
            <motion.div
              key={freeze.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-3 hover-lift"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/10 p-2">
                  <Snowflake className="h-4 w-4 text-cyan-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm truncate">
                    {freeze.habitName}
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(freeze.date)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
