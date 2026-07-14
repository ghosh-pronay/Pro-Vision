import { motion, AnimatePresence } from "framer-motion"
import { generateId } from "@/lib/utils"
import { useLang } from "@/i18n/LanguageContext"
import { useState, useMemo } from "react"
import {
  Leaf,
  Plus,
  Trash2,
  Car,
  Beef,
  Zap,
  ShoppingCart,
  Target,
  Award,
  Share2,
  RotateCcw,
  Lightbulb,
  X,
} from "lucide-react"
import { logger } from "@/lib/logger"
import {
  CarbonSummary,
  TRANSPORT_MODES,
  TREES_PER_KG_PER_YEAR,
  AVG_BANGLADESHI_ANNUAL_TONS,
  ECO_TIPS_EN,
  ECO_TIPS_BN,
  ACHIEVEMENTS,
  getDayStart,
  formatDay,
  getItemsForCategory,
  fadeUp,
  staggerContainer,
} from "@/components/carbon-footprint"
import type { CarbonLog } from "@/components/carbon-footprint"

export default function CarbonFootprint() {
  const { lang } = useLang()

  const [dailyLogs, setDailyLogs] = useState<CarbonLog[]>([])
  const [monthlyGoal, setMonthlyGoal] = useState(50)
  const [selectedCategory, setSelectedCategory] = useState<
    "transport" | "food" | "energy" | "shopping"
  >("transport")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)

  const [formAmount, setFormAmount] = useState("")
  const [formNote, setFormNote] = useState("")
  const [formSubCategory, setFormSubCategory] = useState("")

  const today = useMemo(() => getDayStart(Date.now()), []) // eslint-disable-line react-hooks/purity

  const todayLogs = useMemo(
    () => dailyLogs.filter((l) => getDayStart(l.date) === today),
    [dailyLogs, today],
  )

  const yesterdayLogs = useMemo(
    () => dailyLogs.filter((l) => getDayStart(l.date) === today - 86400000),
    [dailyLogs, today],
  )

  const todayTotal = useMemo(
    () => todayLogs.reduce((s, l) => s + l.carbonKg, 0),
    [todayLogs],
  )
  const yesterdayTotal = useMemo(
    () => yesterdayLogs.reduce((s, l) => s + l.carbonKg, 0),
    [yesterdayLogs],
  )

  const treesNeeded = useMemo(
    () => todayTotal / TREES_PER_KG_PER_YEAR,
    [todayTotal],
  )

  const comparisonPercent = useMemo(() => {
    if (yesterdayTotal === 0) return 0
    return ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
  }, [todayTotal, yesterdayTotal])

  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, number> = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
    }
    todayLogs.forEach((l) => {
      cats[l.category] += l.carbonKg
    })
    return cats
  }, [todayLogs])

  const maxCat = useMemo(
    () => Math.max(...Object.values(categoryBreakdown), 1),
    [categoryBreakdown],
  )

  const weeklyTrend = useMemo(() => {
    const days: { day: string; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = today - i * 86400000
      const dayLogs = dailyLogs.filter((l) => getDayStart(l.date) === dayStart)
      const total = dayLogs.reduce((s, l) => s + l.carbonKg, 0)
      days.push({ day: formatDay(dayStart), total })
    }
    return days
  }, [dailyLogs, today])

  const monthlyStats = useMemo(() => {
    const monthStart = today - 30 * 86400000
    const monthLogs = dailyLogs.filter((l) => l.date >= monthStart)
    const total = monthLogs.reduce((s, l) => s + l.carbonKg, 0)
    const avg = monthLogs.length > 0 ? total / 30 : 0
    const dailyGoalKg = monthlyGoal / 30
    const daysOnTrack =
      monthLogs.filter(
        (l: { date: number; carbonKg: number }) =>
          getDayStart(l.date) === today,
      ).length > 0
        ? todayTotal <= dailyGoalKg
        : false
    return {
      total: total.toFixed(1),
      avg: avg.toFixed(1),
      daysOnTrack,
      dailyGoalKg,
    }
  }, [dailyLogs, today, monthlyGoal, todayTotal])

  const avgBangladeshiDaily = useMemo(
    () => (AVG_BANGLADESHI_ANNUAL_TONS * 1000) / 365,
    [],
  )

  const earnedAchievements = useMemo(() => {
    const totalLogs = dailyLogs.length
    const zeroDays = new Set(
      dailyLogs.filter((l) => l.carbonKg === 0).map((l) => getDayStart(l.date)),
    ).size
    const daysBelowAvg = new Set(
      dailyLogs
        .filter((l) => {
          const dayStart = getDayStart(l.date)
          const dayTotal = dailyLogs
            .filter((dl) => getDayStart(dl.date) === dayStart)
            .reduce((s, dl) => s + dl.carbonKg, 0)
          return dayTotal < avgBangladeshiDaily && dayTotal > 0
        })
        .map((l) => getDayStart(l.date)),
    ).size
    const totalOffset = dailyLogs.reduce((s, l) => s + l.carbonKg, 0)
    const treesEarned = Math.floor(totalOffset / TREES_PER_KG_PER_YEAR)

    return ACHIEVEMENTS.filter((a) => {
      switch (a.type) {
        case "count":
          return totalLogs >= a.threshold
        case "days-below-avg":
          return daysBelowAvg >= a.threshold
        case "zero-days":
          return zeroDays >= a.threshold
        case "weekly-goals":
          return daysBelowAvg >= 4
        case "trees-earned":
          return treesEarned >= a.threshold
        default:
          return false
      }
    })
  }, [dailyLogs, avgBangladeshiDaily])

  const currentTip = useMemo(() => {
    const tips = lang === "bn" ? ECO_TIPS_BN : ECO_TIPS_EN
    return tips[tipIndex % tips.length]
  }, [tipIndex, lang])

  const t = (en: string, bn: string) => (lang === "bn" ? bn : en)

  const handleAddLog = () => {
    const amount = parseFloat(formAmount)
    if (!amount || amount <= 0) return

    const items = getItemsForCategory(selectedCategory)
    const item = items.find((i) => i.key === formSubCategory)
    if (!item) return

    const carbonKg = amount * item.factor

    const newLog: CarbonLog = {
      id: generateId(),
      category: selectedCategory,
      subCategory: formSubCategory,
      amount,
      unit: item.unit,
      carbonKg,
      // eslint-disable-next-line react-hooks/purity
      date: Date.now(),
      note: formNote.trim() || undefined,
    }

    setDailyLogs((prev) => [newLog, ...prev])
    resetForm()
    setShowAddModal(false)
  }

  const handleDeleteLog = (id: string) => {
    setDailyLogs((prev) => prev.filter((l) => l.id !== id))
  }

  const resetForm = () => {
    setFormAmount("")
    setFormNote("")
    setFormSubCategory("")
  }

  const handleShare = () => {
    const text = t(
      `🌍 My carbon footprint today: ${todayTotal.toFixed(1)} kg CO₂. That's like needing ${treesNeeded.toFixed(1)} trees to offset! #CarbonFootprint #EcoWarrior`,
      `🌍 আজকের আমার কার্বন ফুটপ্রিন্ট: ${todayTotal.toFixed(1)} কেজি CO₂। এটি অফসেট করতে ${treesNeeded.toFixed(1)}টি গাছ প্রয়োজন! #কার্বনফুটপ্রিন্ট #ইকোওয়ারিয়র`,
    )
    if (navigator.share) {
      navigator
        .share({ text })
        .catch((e) => logger.error("CarbonFootprint", "share failed", e))
    } else {
      navigator.clipboard
        .writeText(text)
        .catch((e) =>
          logger.error("CarbonFootprint", "clipboard write failed", e),
        )
      setShowShareModal(true)
      setTimeout(() => setShowShareModal(false), 2000)
    }
  }

  const categoryConfig = [
    {
      key: "transport",
      icon: Car,
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-500",
      label: t("Transport", "পরিবহন"),
    },
    {
      key: "food",
      icon: Beef,
      color: "from-orange-500 to-red-500",
      textColor: "text-orange-500",
      label: t("Food", "খাদ্য"),
    },
    {
      key: "energy",
      icon: Zap,
      color: "from-yellow-500 to-amber-500",
      textColor: "text-yellow-500",
      label: t("Energy", "শক্তি"),
    },
    {
      key: "shopping",
      icon: ShoppingCart,
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-500",
      label: t("Shopping", "শপিং"),
    },
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-trend flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            {t("Carbon Footprint Tracker", "কার্বন ফুটপ্রিন্ট ট্র্যাকার")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              "Track your daily carbon emissions and reduce your impact",
              "আপনার দৈনিক কার্বন নির্গমন ট্র্যাক করুন এবং প্রভাব কমান",
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGoalModal(true)}
            className="cursor-pointer flex items-center gap-2 rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            <Target className="h-4 w-4" />
            {t("Goal", "লক্ষ্য")}
          </button>
          <button
            onClick={handleShare}
            className="cursor-pointer flex items-center gap-2 rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            {t("Share", "শেয়ার")}
          </button>
          <button
            onClick={() => {
              resetForm()
              setFormSubCategory(TRANSPORT_MODES[0].key)
              setShowAddModal(true)
            }}
            className="cursor-pointer flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("Log Activity", "কার্যকলাপ লগ")}
          </button>
        </div>
      </motion.div>

      {/* Today's Summary */}
      <CarbonSummary
        lang={lang}
        todayTotal={todayTotal}
        comparisonPercent={comparisonPercent}
        yesterdayTotal={yesterdayTotal}
        treesNeeded={treesNeeded}
      />

      {/* Category Breakdown */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4">
          {t("Carbon by Category", "বিভাগ অনুযায়ী কার্বন")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {categoryConfig.map((cat) => {
            const CatIcon = cat.icon
            const value = categoryBreakdown[cat.key] || 0
            const percent = maxCat > 0 ? (value / maxCat) * 100 : 0
            return (
              <div
                key={cat.key}
                className="rounded-xl border border-foreground/10 p-4 hover:bg-foreground/5 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedCategory(cat.key as typeof selectedCategory)
                  setShowAddModal(true)
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CatIcon className={`h-4 w-4 ${cat.textColor}`} />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {value.toFixed(1)} kg
                  </span>
                </div>
                <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${cat.color}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Weekly Trend */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4">
          {t("Weekly Trend", "সাপ্তাহিক প্রবণতা")}
        </h3>
        <div className="flex items-end gap-2 h-40">
          {weeklyTrend.map((day, i) => {
            const maxWeek = Math.max(...weeklyTrend.map((d) => d.total), 1)
            const height = (day.total / maxWeek) * 100
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">
                  {day.total.toFixed(1)}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 4)}%` }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className={`w-full rounded-t-lg ${
                    day.total <= monthlyGoal / 7
                      ? "bg-gradient-to-t from-green-600 to-green-400"
                      : "bg-gradient-to-t from-red-600 to-red-400"
                  }`}
                />
                <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                  {day.day.split(" ")[0]}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            {t("Within goal", "লক্ষ্যের মধ্যে")}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            {t("Exceeded goal", "লক্ষ্য অতিক্রম")}
          </div>
        </div>
      </motion.div>

      {/* Quick Log Section */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4">
          {t("Quick Log", "দ্রুত লগ")}
        </h3>
        <div className="flex gap-2 mb-4 flex-wrap">
          {categoryConfig.map((cat) => (
            <button
              key={cat.key}
              onClick={() =>
                setSelectedCategory(cat.key as typeof selectedCategory)
              }
              className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat.key
                  ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                  : "bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {getItemsForCategory(selectedCategory).map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setFormSubCategory(item.key)
                setShowAddModal(true)
              }}
              className="cursor-pointer rounded-xl border border-foreground/10 p-3 text-center hover:bg-foreground/5 transition-all hover:scale-105"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="text-xs font-medium mt-1 capitalize">{item.key}</p>
              <p className="text-[10px] text-muted-foreground">
                {item.factor} kg/{item.unit}
              </p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Eco Tips */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-lg">
              {t("Eco Tips", "ইকো টিপস")}
            </h3>
          </div>
          <button
            onClick={() => setTipIndex((i) => i + 1)}
            className="cursor-pointer p-2 rounded-full hover:bg-foreground/10 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {currentTip}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Monthly Goal & Achievements */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Monthly Goal */}
        <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-lg">
              {t("Monthly Goal", "মাসিক লক্ষ্য")}
            </h3>
          </div>
          <div className="text-center mb-4">
            <p className="text-3xl font-bold text-green-500">
              {monthlyStats.total} kg
            </p>
            <p className="text-sm text-muted-foreground">
              {t("of", "/")} {monthlyGoal} kg {t("goal", "লক্ষ্য")}
            </p>
          </div>
          <div className="h-4 bg-foreground/10 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (parseFloat(monthlyStats.total) / monthlyGoal) * 100)}%`,
              }}
              className={`h-full rounded-full ${
                parseFloat(monthlyStats.total) <= monthlyGoal
                  ? "bg-gradient-to-r from-green-500 to-emerald-400"
                  : "bg-gradient-to-r from-red-500 to-orange-400"
              }`}
            />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {t("Daily avg:", "দৈনিক গড়:")} {monthlyStats.avg} kg ·{" "}
              {t("Daily goal:", "দৈনিক লক্ষ্য:")}{" "}
              {monthlyStats.dailyGoalKg.toFixed(1)} kg
            </p>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-lg">
              {t("Achievements", "অর্জন")}
            </h3>
          </div>
          {earnedAchievements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t(
                "Log activities to earn eco badges!",
                "ইকো ব্যাজ অর্জনের জন্য কার্যকলাপ লগ করুন!",
              )}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {earnedAchievements.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-center"
                >
                  <span className="text-2xl">{a.icon}</span>
                  <p className="text-xs font-semibold mt-1">
                    {lang === "bn" ? a.titleBn : a.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {lang === "bn" ? a.descBn : a.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Today's Log List */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4">
          {t("Today's Log", "আজকের লগ")} ({todayLogs.length})
        </h3>
        {todayLogs.length === 0 ? (
          <div className="text-center py-8">
            <Leaf className="h-12 w-12 text-green-500/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {t(
                "No activities logged today. Start tracking!",
                "আজ কোনো কার্যকলাপ লগ হয়নি। ট্র্যাকিং শুরু করুন!",
              )}
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {todayLogs.map((log) => (
              <motion.div
                key={log.id}
                variants={fadeUp}
                className="flex items-center justify-between rounded-xl border border-foreground/10 p-3 hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {getItemsForCategory(log.category).find(
                      (i) => i.key === log.subCategory,
                    )?.icon || "📊"}
                  </span>
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {log.subCategory}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.amount} {log.unit}
                      {log.note ? ` · ${log.note}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-green-500">
                    {log.carbonKg.toFixed(2)} kg
                  </span>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="cursor-pointer p-1 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  {t("Log Activity", "কার্যকলাপ লগ")}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="cursor-pointer p-2 rounded-full hover:bg-foreground/10"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Category", "বিভাগ")}
                  </label>
                  <div className="flex gap-2">
                    {categoryConfig.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setSelectedCategory(
                            cat.key as typeof selectedCategory,
                          )
                          setFormSubCategory("")
                        }}
                        className={`cursor-pointer flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          selectedCategory === cat.key
                            ? `bg-gradient-to-r ${cat.color} text-white`
                            : "bg-foreground/5 hover:bg-foreground/10"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Type", "ধরন")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {getItemsForCategory(selectedCategory).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setFormSubCategory(item.key)}
                        className={`cursor-pointer rounded-xl p-3 text-center transition-all ${
                          formSubCategory === item.key
                            ? "bg-green-500/20 border-2 border-green-500"
                            : "bg-foreground/5 border-2 border-transparent hover:bg-foreground/10"
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <p className="text-xs font-medium mt-1 capitalize">
                          {item.key}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Amount (", "পরিমাণ (")}
                    {getItemsForCategory(selectedCategory).find(
                      (i) => i.key === formSubCategory,
                    )?.unit || ""}
                    {")"}
                  </label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder={t("Enter amount", "পরিমাণ লিখুন")}
                    className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                  {formAmount && formSubCategory && (
                    <p className="text-xs text-green-500 mt-1">
                      ≈{" "}
                      {(
                        parseFloat(formAmount) *
                        (getItemsForCategory(selectedCategory).find(
                          (i) => i.key === formSubCategory,
                        )?.factor || 0)
                      ).toFixed(2)}{" "}
                      kg CO₂
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Note (optional)", "নোট (ঐচ্ছিক)")}
                  </label>
                  <input
                    type="text"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder={t(
                      "e.g., commute to work",
                      "যেমন, কাজে যাওয়া",
                    )}
                    className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>

                <button
                  onClick={handleAddLog}
                  disabled={!formAmount || !formSubCategory}
                  className="cursor-pointer w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("Add Log", "লগ যোগ করুন")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">
                  {t("Set Monthly Goal", "মাসিক লক্ষ্য নির্ধারণ")}
                </h3>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="cursor-pointer p-2 rounded-full hover:bg-foreground/10"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Monthly CO₂ Goal (kg)", "মাসিক CO₂ লক্ষ্য (কেজি)")}
                  </label>
                  <input
                    type="number"
                    value={monthlyGoal}
                    onChange={(e) =>
                      setMonthlyGoal(parseInt(e.target.value) || 50)
                    }
                    className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "Average Bangladeshi produces",
                    "গড় বাংলাদেশি উৎপাদন করে",
                  )}{" "}
                  {(AVG_BANGLADESHI_ANNUAL_TONS * 1000) / 12} kg{" "}
                  {t("CO₂ per month", "CO₂ প্রতি মাসে")}
                </p>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="cursor-pointer w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  {t("Save Goal", "লক্ষ্য সংরক্ষণ")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass rounded-xl px-6 py-3 text-sm font-medium"
          >
            {t("Copied to clipboard!", "ক্লিপবোর্ডে কপি হয়েছে!")}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
