import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { t, type TranslationKey } from "@/i18n/translations"
import { useState } from "react"
import {
  Flame,
  Moon,
  BookOpen,
  Zap,
  Plus,
  Dumbbell,
  Brain,
  HeartPulse,
} from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import BreathingExercise from "@/components/BreathingExercise"
import GuidedMeditation from "@/components/wellbeing/GuidedMeditation"
import HealthTracker from "@/components/wellbeing/HealthTracker"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const MOODS = [
  { emoji: "😞", label: "Very Sad", value: 1, moodKey: "terrible" as const },
  { emoji: "😕", label: "Sad", value: 2, moodKey: "bad" as const },
  { emoji: "😐", label: "Neutral", value: 3, moodKey: "okay" as const },
  { emoji: "🙂", label: "Good", value: 4, moodKey: "good" as const },
  { emoji: "😄", label: "Great", value: 5, moodKey: "great" as const },
]

interface BreathingPhase {
  label: string
  labelBn: string
  seconds: number
  scale: number
}

interface Exercise {
  id: string
  icon: string
  titleKey: TranslationKey
  descKey: TranslationKey
  duration: string
  color: string
  durationMin: number
  phases: BreathingPhase[]
}

const EXERCISES: Exercise[] = [
  {
    id: "1",
    icon: "🫁",
    titleKey: "wellbeing.breathing478",
    descKey: "wellbeing.breathing478Desc",
    duration: "5 min",
    color: "var(--pv-teal)",
    durationMin: 5,
    phases: [
      { label: "Inhale", labelBn: "শ্বাস নিন", seconds: 4, scale: 1.6 },
      { label: "Hold", labelBn: "ধরুন", seconds: 7, scale: 1.6 },
      { label: "Exhale", labelBn: "ছেড়ে দিন", seconds: 8, scale: 1 },
    ],
  },
  {
    id: "2",
    icon: "🧘",
    titleKey: "wellbeing.bodyScan",
    descKey: "wellbeing.bodyScanDesc",
    duration: "10 min",
    color: "var(--pv-lavender)",
    durationMin: 10,
    phases: [
      { label: "Breathe in", labelBn: "শ্বাস নিন", seconds: 4, scale: 1.4 },
      {
        label: "Scan body",
        labelBn: "শরীর স্ক্যান করুন",
        seconds: 6,
        scale: 1.4,
      },
      {
        label: "Release tension",
        labelBn: "টান ছেড়ে দিন",
        seconds: 4,
        scale: 1,
      },
    ],
  },
  {
    id: "3",
    icon: "🌊",
    titleKey: "wellbeing.bellyBreath",
    descKey: "wellbeing.bellyBreathDesc",
    duration: "3 min",
    color: "var(--pv-blue)",
    durationMin: 3,
    phases: [
      { label: "Inhale", labelBn: "পেটে শ্বাস নিন", seconds: 4, scale: 1.6 },
      { label: "Hold", labelBn: "ধরুন", seconds: 2, scale: 1.6 },
      { label: "Exhale", labelBn: "ধীরে ছেড়ে দিন", seconds: 6, scale: 1 },
    ],
  },
  {
    id: "4",
    icon: "🌿",
    titleKey: "wellbeing.boxBreath",
    descKey: "wellbeing.boxBreathDesc",
    duration: "4 min",
    color: "var(--pv-green)",
    durationMin: 4,
    phases: [
      { label: "Inhale", labelBn: "শ্বাস নিন", seconds: 4, scale: 1.5 },
      { label: "Hold", labelBn: "ধরুন", seconds: 4, scale: 1.5 },
      { label: "Exhale", labelBn: "ছেড়ে দিন", seconds: 4, scale: 1 },
      { label: "Hold", labelBn: "ধরুন", seconds: 4, scale: 1 },
    ],
  },
]

const SLEEP_QUALITIES = [
  { val: "bad" as const, emoji: "😴", labelEn: "Poor", labelBn: "খারাপ" },
  { val: "okay" as const, emoji: "😐", labelEn: "Fair", labelBn: "মোটামুটি" },
  { val: "good" as const, emoji: "🙂", labelEn: "Good", labelBn: "ভালো" },
  { val: "great" as const, emoji: "😴✨", labelEn: "Great", labelBn: "দারুণ" },
]

const EXERCISE_TYPES = [
  { type: "Running", emoji: "🏃", color: "var(--pv-orange)" },
  { type: "Walking", emoji: "🚶", color: "var(--pv-green)" },
  { type: "Cycling", emoji: "🚴", color: "var(--pv-blue)" },
  { type: "Swimming", emoji: "🏊", color: "var(--pv-teal)" },
  { type: "Yoga", emoji: "🧘", color: "var(--pv-lavender)" },
  { type: "Gym", emoji: "🏋️", color: "var(--pv-pink)" },
]

export default function Wellbeing() {
  const { lang } = useLang()
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [moodLogged, setMoodLogged] = useState(false)
  const [activeExercise, setActiveExercise] = useState<string | null>(null)
  const [showSleepLog, setShowSleepLog] = useState(false)
  const [sleepHours, setSleepHours] = useState(7)
  const [sleepQuality, setSleepQuality] = useState<
    "bad" | "okay" | "good" | "great"
  >("good")
  const [bedtime, setBedtime] = useState("23:00")
  const [wakeTime, setWakeTime] = useState("07:00")
  const [sleepLogged, setSleepLogged] = useState(false)
  const [showGratitude, setShowGratitude] = useState(false)
  const [gratitudeText, setGratitudeText] = useState("")
  const [gratitudeSaved, setGratitudeSaved] = useState(false)
  const [showExerciseLog, setShowExerciseLog] = useState(false)
  const [exerciseType, setExerciseType] = useState("Running")
  const [exerciseDuration, setExerciseDuration] = useState(30)
  const [exerciseCalories, setExerciseCalories] = useState("")
  const [exerciseNotes, setExerciseNotes] = useState("")
  const [exerciseLogged, setExerciseLogged] = useState(false)
  const [showMeditation, setShowMeditation] = useState(false)
  const [showHealthTracker, setShowHealthTracker] = useState(false)

  const moodStats = useQuery(api.moods.stats) as any
  const sleepStats = useQuery(api.sleepLogs.stats) as any
  const gratitudeEntries = useQuery(api.gratitudeEntries.list) as any
  const gratitudeStats = useQuery(api.gratitudeEntries.stats) as any
  const exerciseLogs = useQuery(api.exerciseLogs.list) as any
  const exerciseStats = useQuery(api.exerciseLogs.stats) as any

  const createMood = useMutation(api.moods.create, "moods")
  const createSleepLog = useMutation(api.sleepLogs.create, "sleepLogs")
  const createGratitude = useMutation(
    api.gratitudeEntries.create,
    "gratitudeEntries",
  )
  const removeGratitude = useMutation(
    api.gratitudeEntries.remove,
    "gratitudeEntries",
  )
  const createExerciseLog = useMutation(api.exerciseLogs.create, "exerciseLogs")

  const logMood = async () => {
    if (selectedMood === null) return
    const moodObj = MOODS.find((m) => m.value === selectedMood)
    if (!moodObj) return
    await createMood({
      mood: moodObj.moodKey,
      value: selectedMood,
      date: Date.now(),
    })
    setMoodLogged(true)
  }

  const moodStreak = moodStats?.moodStreak ?? 0
  const todayMood = moodStats?.todayMood ?? null
  const avgSleep = sleepStats?.avgHours ?? 0
  const sleepStreak = sleepStats?.streak ?? 0
  const lastNightHours = sleepStats?.todayHours ?? 0

  const logSleep = async () => {
    await createSleepLog({
      hours: sleepHours,
      quality: sleepQuality,
      bedTime: bedtime,
      wakeTime,
      date: Date.now(),
    })
    setSleepLogged(true)
    setShowSleepLog(false)
  }

  const saveGratitude = async () => {
    if (!gratitudeText.trim()) return
    await createGratitude({
      content: gratitudeText.trim(),
      date: Date.now(),
    })
    setGratitudeText("")
    setGratitudeSaved(true)
    setTimeout(() => setGratitudeSaved(false), 2000)
  }

  const logExercise = async () => {
    await createExerciseLog({
      type: exerciseType,
      duration: exerciseDuration,
      calories: exerciseCalories ? parseInt(exerciseCalories) : undefined,
      notes: exerciseNotes || undefined,
      date: Date.now(),
    })
    setExerciseLogged(true)
    setShowExerciseLog(false)
    setExerciseDuration(30)
    setExerciseCalories("")
    setExerciseNotes("")
    setTimeout(() => setExerciseLogged(false), 2000)
  }

  const stats = [
    {
      icon: Flame,
      value: moodStreak,
      labelKey: "wellbeing.moodStreak" as TranslationKey,
      color: "var(--pv-orange)",
    },
    {
      icon: Moon,
      value: avgSleep > 0 ? `${avgSleep}h` : "—",
      labelKey: "wellbeing.avgSleep" as TranslationKey,
      color: "var(--pv-blue)",
    },
    {
      icon: Zap,
      value: todayMood
        ? (MOODS.find((m) => m.moodKey === todayMood)?.emoji ?? "—")
        : "—",
      labelKey: "wellbeing.stressLevel" as TranslationKey,
      color: "var(--pv-green)",
    },
  ]

  const sliderPct = ((sleepHours - 1) / 11) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-foreground">
          {t("nav.wellbeing", lang)}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("wellbeing.subtitle", lang)}
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, value, labelKey, color }, i) => (
          <motion.div
            key={i}
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
        className="glass-strong rounded-2xl p-6 glow-blue glass-accent-top"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">
          {t("wellbeing.moodLabel", lang)}
        </h3>
        <div className="flex justify-between mb-6">
          {MOODS.map((mood) => (
            <motion.button
              key={mood.value}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedMood(mood.value)
                setMoodLogged(false)
              }}
              className={`text-3xl p-2 rounded-xl transition-all ${selectedMood === mood.value ? "glass glow-green scale-110" : "hover:bg-foreground/5"}`}
            >
              {mood.emoji}
            </motion.button>
          ))}
        </div>
        {selectedMood !== null && !moodLogged && (
          <button
            onClick={logMood}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
            style={{
              background:
                "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
            }}
          >
            {t("wellbeing.logMood", lang)}
          </button>
        )}
        {moodLogged && (
          <div className="text-center text-sm text-[var(--pv-green)] font-medium">
            {t("wellbeing.moodLogged", lang)}
          </div>
        )}
      </motion.div>

      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {t("wellbeing.breathingTitle", lang)}
        </h3>
        <AnimatePresence mode="wait">
          {activeExercise ? (
            (() => {
              const ex = EXERCISES.find((e) => e.id === activeExercise)
              if (!ex) return null
              return (
                <BreathingExercise
                  key={activeExercise}
                  title={ex.titleKey}
                  titleBn={t(ex.titleKey, lang)}
                  icon={ex.icon}
                  color={ex.color}
                  phases={ex.phases}
                  totalDurationMinutes={ex.durationMin}
                  onClose={() => setActiveExercise(null)}
                />
              )
            })()
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              {EXERCISES.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setActiveExercise(ex.id)}
                  className="glass glass-card-hover rounded-2xl p-4 cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{ex.icon}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full glass"
                      style={{ color: ex.color }}
                    >
                      {ex.duration}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {t(ex.titleKey, lang)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t(ex.descKey, lang)}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        custom={5}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            {t("wellbeing.sleepLog", lang)}
          </h3>
          <button
            onClick={() => {
              setShowSleepLog(!showSleepLog)
              setSleepLogged(false)
            }}
            className="text-xs text-[var(--pv-blue)] font-medium flex items-center gap-1 min-h-[44px]"
          >
            <Plus className="size-3" />
            {lang === "bn" ? "লগ যোগ" : "Log Sleep"}
          </button>
        </div>

        <div className="glass rounded-2xl p-4 mb-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-extrabold text-foreground">
                {avgSleep > 0 ? `${avgSleep}h` : "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {lang === "bn" ? "গড় ঘুম (৭ দিন)" : "Avg (7 days)"}
              </div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-foreground">
                {sleepStreak}
              </div>
              <div className="text-xs text-muted-foreground">
                {lang === "bn" ? "স্ট্রিক" : "Streak"}
              </div>
            </div>
            <div>
              <div className="text-lg font-extrabold text-foreground">
                {lastNightHours > 0 ? `${lastNightHours}h` : "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {lang === "bn" ? "গতরাত" : "Last night"}
              </div>
            </div>
          </div>
        </div>

        {showSleepLog && !sleepLogged && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div className="glass-strong rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">
                    {lang === "bn" ? "ঘুমের পরিমাণ" : "Sleep hours"}
                  </span>
                  <span className="font-bold text-foreground">
                    {sleepHours}h
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--pv-blue) ${sliderPct}%, rgba(255,255,255,0.15) ${sliderPct}%)`,
                  }}
                />
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-2">
                  {lang === "bn" ? "মান" : "Quality"}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SLEEP_QUALITIES.map((q) => (
                    <button
                      key={q.val}
                      onClick={() => setSleepQuality(q.val)}
                      className={`glass rounded-xl py-2 px-1 text-center transition-all min-h-[44px] ${sleepQuality === q.val ? "ring-2 ring-[var(--pv-blue)]" : "hover:bg-foreground/5"}`}
                    >
                      <div className="text-lg">{q.emoji}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {lang === "bn" ? q.labelBn : q.labelEn}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {lang === "bn" ? "ঘুমানোর সময়" : "Bedtime"}
                  </div>
                  <input
                    type="time"
                    value={bedtime}
                    onChange={(e) => setBedtime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground outline-none"
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {lang === "bn" ? "ঘুম থেকে ওঠার সময়" : "Wake time"}
                  </div>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground outline-none"
                  />
                </div>
              </div>

              <button
                onClick={logSleep}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
                }}
              >
                {lang === "bn" ? "ঘুম লগ সংরক্ষণ" : "Save Sleep Log"}
              </button>
            </div>
          </motion.div>
        )}

        {sleepLogged && (
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-sm text-[var(--pv-green)] font-medium">
              {lang === "bn"
                ? "✅ ঘুম লগ সংরক্ষিত! ভালো ঘুম গুরুত্বপূর্ণ।"
                : "✅ Sleep logged! Good sleep matters."}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        custom={6}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {t("wellbeing.gratitude", lang)}
            </h3>
            {gratitudeStats && gratitudeStats.total > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full glass text-[var(--pv-green)]">
                {gratitudeStats.total} {lang === "bn" ? "এন্ট্রি" : "entries"}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setShowGratitude(!showGratitude)
              setGratitudeSaved(false)
            }}
            className="text-xs text-[var(--pv-green)] font-medium flex items-center gap-1 min-h-[44px]"
          >
            <Plus className="size-3" />
            {lang === "bn" ? "এন্ট্রি যোগ" : "Add Entry"}
          </button>
        </div>

        {gratitudeStats && gratitudeStats.total > 0 && (
          <div className="glass rounded-2xl p-4 mb-3">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-extrabold text-foreground">
                  {gratitudeStats.total}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === "bn" ? "মোট" : "Total"}
                </div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-foreground">
                  {gratitudeStats.thisWeek}
                </div>
                <div className="text-xs text-muted-foreground">
                  {lang === "bn" ? "এই সপ্তাহ" : "This week"}
                </div>
              </div>
            </div>
          </div>
        )}

        {showGratitude && !gratitudeSaved && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div className="glass-strong rounded-2xl p-4 space-y-3">
              <textarea
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                placeholder={
                  lang === "bn"
                    ? "আজ আপনি কিসের জন্য কৃতজ্ঞ?..."
                    : "What are you grateful for today?..."
                }
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[80px]"
                autoFocus
              />
              <div className="flex justify-end">
                <button
                  onClick={saveGratitude}
                  disabled={!gratitudeText.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:brightness-110 active:scale-[0.97]"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--pv-green), var(--pv-teal))",
                  }}
                >
                  {lang === "bn" ? "সংরক্ষণ" : "Save"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gratitudeSaved && (
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-sm text-[var(--pv-green)] font-medium">
              {lang === "bn"
                ? "✅ কৃতজ্ঞতা সংরক্ষিত! ভালো অনুভূতি চালিয়ে যান।"
                : "✅ Gratitude saved! Keep the positive feeling going."}
            </div>
          </div>
        )}

        {gratitudeEntries && gratitudeEntries.length > 0 && (
          <div className="space-y-2">
            {gratitudeEntries.slice(0, 5).map((entry: any) => (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl px-4 py-3 group hover-row hover-lavender"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">
                      {entry.content}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1.5">
                      {new Date(entry.createdAt).toLocaleDateString(
                        lang === "bn" ? "bn-BD" : "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeGratitude({ id: entry._id })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <span className="text-sm">✕</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {gratitudeEntries &&
          gratitudeEntries.length === 0 &&
          !showGratitude && (
            <div className="glass rounded-2xl p-6 text-center">
              <BookOpen className="size-8 mx-auto mb-2 text-[var(--pv-green)] opacity-40" />
              <p className="text-xs text-muted-foreground">
                {lang === "bn"
                  ? "আজই আপনার প্রথম কৃতজ্ঞতা লিখুন! 🌱"
                  : "Write your first gratitude entry today! 🌱"}
              </p>
            </div>
          )}
      </motion.div>

      <motion.div
        custom={7}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            {lang === "bn" ? "ব্যায়াম ট্র্যাকার" : "Exercise Tracker"}
          </h3>
          <button
            onClick={() => {
              setShowExerciseLog(!showExerciseLog)
              setExerciseLogged(false)
            }}
            className="text-xs text-[var(--pv-orange)] font-medium flex items-center gap-1 min-h-[44px]"
          >
            <Plus className="size-3" />
            {lang === "bn" ? "ব্যায়াম যোগ" : "Log Exercise"}
          </button>
        </div>

        {exerciseStats &&
          (exerciseStats.totalMinutes > 0 || exerciseStats.thisWeek > 0) && (
            <div className="glass rounded-2xl p-4 mb-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-extrabold text-foreground">
                    {exerciseStats.totalMinutes}m
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lang === "bn" ? "মোট সময়" : "Total time"}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-foreground">
                    {exerciseStats.totalCalories ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lang === "bn" ? "ক্যালোরি" : "Calories"}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-foreground">
                    {exerciseStats.thisWeek}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lang === "bn" ? "এই সপ্তাহ" : "This week"}
                  </div>
                </div>
              </div>
            </div>
          )}

        {showExerciseLog && !exerciseLogged && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div className="glass-strong rounded-2xl p-5 space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">
                  {lang === "bn" ? "ব্যায়ামের ধরন" : "Exercise type"}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {EXERCISE_TYPES.map((et) => (
                    <button
                      key={et.type}
                      onClick={() => setExerciseType(et.type)}
                      className={`glass rounded-xl py-2 px-1 text-center transition-all min-h-[44px] ${exerciseType === et.type ? "ring-2 ring-[var(--pv-orange)]" : "hover:bg-foreground/5"}`}
                    >
                      <div className="text-lg">{et.emoji}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {et.type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">
                    {lang === "bn" ? "সময়কাল (মিনিট)" : "Duration (minutes)"}
                  </span>
                  <span className="font-bold text-foreground">
                    {exerciseDuration}m
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={exerciseDuration}
                  onChange={(e) =>
                    setExerciseDuration(parseInt(e.target.value))
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--pv-orange) ${((exerciseDuration - 5) / 175) * 100}%, rgba(255,255,255,0.15) ${((exerciseDuration - 5) / 175) * 100}%)`,
                  }}
                />
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {lang === "bn" ? "ক্যালোরি (ঐচ্ছিক)" : "Calories (optional)"}
                </div>
                <input
                  type="number"
                  value={exerciseCalories}
                  onChange={(e) => setExerciseCalories(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {lang === "bn" ? "নোট (ঐচ্ছিক)" : "Notes (optional)"}
                </div>
                <input
                  type="text"
                  value={exerciseNotes}
                  onChange={(e) => setExerciseNotes(e.target.value)}
                  placeholder={
                    lang === "bn" ? "অতিরিক্ত নোট..." : "Any notes..."
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>

              <button
                onClick={logExercise}
                className="w-full rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--pv-orange), var(--pv-orange-dark, #c2410c))",
                }}
              >
                {lang === "bn" ? "ব্যায়াম সংরক্ষণ" : "Save Exercise"}
              </button>
            </div>
          </motion.div>
        )}

        {exerciseLogged && (
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-sm text-[var(--pv-orange)] font-medium">
              {lang === "bn"
                ? "✅ ব্যায়াম সংরক্ষিত! চালিয়ে যান।"
                : "✅ Exercise logged! Keep moving."}
            </div>
          </div>
        )}

        {exerciseLogs && exerciseLogs.length > 0 && (
          <div className="space-y-2">
            {exerciseLogs.slice(0, 5).map((log: any) => {
              const et = EXERCISE_TYPES.find((e) => e.type === log.type)
              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl px-4 py-3 hover-row"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{et?.emoji ?? "🏃"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {log.type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.duration}m
                        {log.calories ? ` · ${log.calories} cal` : ""}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString(
                        lang === "bn" ? "bn-BD" : "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {exerciseLogs && exerciseLogs.length === 0 && !showExerciseLog && (
          <div className="glass rounded-2xl p-6 text-center">
            <Dumbbell className="size-8 mx-auto mb-2 text-[var(--pv-orange)] opacity-40" />
            <p className="text-xs text-muted-foreground">
              {lang === "bn"
                ? "আজই আপনার প্রথম ব্যায়াম লগ করুন! 💪"
                : "Log your first exercise today! 💪"}
            </p>
          </div>
        )}
      </motion.div>

      <motion.div
        custom={8}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            {lang === "bn" ? "অতিরিক্ত সুবিধা" : "More Features"}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowMeditation(true)}
            className="glass glass-card-hover rounded-2xl p-4 cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="size-5 text-[var(--pv-lavender)]" />
              <span className="text-xs text-muted-foreground">
                {lang === "bn" ? "১০ মিনিট" : "10 min"}
              </span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {lang === "bn" ? "নির্দেশিত ধ্যান" : "Guided Meditation"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {lang === "bn" ? "শান্তি ও ফোকাসের জন্য" : "For peace & focus"}
            </div>
          </button>
          <button
            onClick={() => setShowHealthTracker(!showHealthTracker)}
            className="glass glass-card-hover rounded-2xl p-4 cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <HeartPulse className="size-5 text-[var(--pv-blue)]" />
              <span className="text-xs text-muted-foreground">
                {lang === "bn" ? "দৈনিক" : "Daily"}
              </span>
            </div>
            <div className="text-sm font-bold text-foreground">
              {lang === "bn" ? "স্বাস্থ্য ট্র্যাকার" : "Health Tracker"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {lang === "bn" ? "পানি ও ব্যায়াম" : "Water & Exercise"}
            </div>
          </button>
        </div>
      </motion.div>

      {showHealthTracker && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <HealthTracker
            waterGoal={2500}
            waterIntakes={(exerciseLogs ?? [])
              .filter((log: any) => log.type === "Water")
              .map((log: any) => ({
                amount: log.duration,
                timestamp: log.createdAt,
              }))}
            exercises={(exerciseLogs ?? []).map((log: any) => ({
              id: log._id,
              type: log.type?.toLowerCase() ?? "other",
              duration: log.duration,
              calories: log.calories ?? 0,
              timestamp: log.createdAt,
            }))}
            onAddWater={(amount) => {
              createExerciseLog({
                type: "Water",
                duration: amount,
                date: Date.now(),
              })
            }}
            onAddExercise={(exercise) => {
              createExerciseLog({
                type: exercise.type,
                duration: exercise.duration,
                calories: exercise.calories,
                date: Date.now(),
              })
            }}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {showMeditation && (
          <GuidedMeditation onClose={() => setShowMeditation(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
