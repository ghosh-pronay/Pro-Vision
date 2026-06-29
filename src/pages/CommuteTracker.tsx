import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { useState, useMemo } from "react"
import {
  Navigation,
  Plus,
  CalendarDays,
  TrendingUp,
  BarChart3,
  Clock,
  Sparkles,
} from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import {
  TodayView,
  WeekView,
  HistoryView,
  CompareView,
  ScheduleView,
  CommuteForm,
} from "@/components/commute-tracker"
import {
  TRANSPORT_MODES,
  fadeUp,
  getWeekDates,
  getModeById,
  type Commute,
  type SavedRoute,
} from "@/components/commute-tracker/types"

export default function CommuteTracker() {
  const { lang } = useLang()

  const [commutes, setCommutes] = useState<Commute[]>([])
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([])
  const [selectedMode, setSelectedMode] = useState<string>("")
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<
    "today" | "week" | "history" | "compare" | "schedule"
  >("today")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [routeName, setRouteName] = useState("")

  const [formData, setFormData] = useState({
    from: "",
    to: "",
    departure: "",
    arrival: "",
    cost: 0,
    distance: 0,
    notes: "",
  })

  const today = new Date().toISOString().split("T")[0]

  const todayCommutes = useMemo(
    () => commutes.filter((c) => c.date === today),
    [commutes, today],
  )

  const weekDates = useMemo(() => getWeekDates(), [])

  const weekCommutes = useMemo(
    () => commutes.filter((c) => weekDates.includes(c.date)),
    [commutes, weekDates],
  )

  const weeklyStats = useMemo(() => {
    const totalTrips = weekCommutes.length
    const totalDistance = weekCommutes.reduce((sum, c) => sum + c.distance, 0)
    const totalCost = weekCommutes.reduce((sum, c) => sum + c.cost, 0)
    const totalCarbon = weekCommutes.reduce((sum, c) => {
      const mode = TRANSPORT_MODES.find((m) => m.id === c.mode)
      return sum + (mode ? mode.carbon * c.distance : 0)
    }, 0)
    const totalTime = weekCommutes.reduce((sum, c) => {
      if (c.departure && c.arrival) {
        const dep = new Date(`2000-01-01T${c.departure}`)
        const arr = new Date(`2000-01-01T${c.arrival}`)
        return sum + (arr.getTime() - dep.getTime()) / 60000
      }
      return sum
    }, 0)

    const modeCount: Record<string, number> = {}
    weekCommutes.forEach((c) => {
      modeCount[c.mode] = (modeCount[c.mode] || 0) + 1
    })
    const mostUsedMode =
      Object.entries(modeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || ""

    return {
      totalTrips,
      totalDistance,
      totalCost,
      totalCarbon,
      totalTime,
      mostUsedMode,
    }
  }, [weekCommutes])

  const comparisonData = useMemo(() => {
    return TRANSPORT_MODES.map((mode) => {
      const modeTrips = commutes.filter((c) => c.mode === mode.id)
      const totalDist = modeTrips.reduce((s, c) => s + c.distance, 0)
      const avgTime =
        modeTrips.length > 0
          ? modeTrips.reduce((s, c) => {
              if (c.departure && c.arrival) {
                const dep = new Date(`2000-01-01T${c.departure}`)
                const arr = new Date(`2000-01-01T${c.arrival}`)
                return s + (arr.getTime() - dep.getTime()) / 60000
              }
              return s + (totalDist > 0 ? (totalDist / mode.avgSpeed) * 60 : 0)
            }, 0) / modeTrips.length
          : totalDist > 0
            ? (totalDist / mode.avgSpeed) * 60
            : 0
      const avgCost =
        modeTrips.length > 0
          ? modeTrips.reduce((s, c) => s + c.cost, 0) / modeTrips.length
          : mode.avgCost
      return {
        ...mode,
        trips: modeTrips.length,
        avgTime: Math.round(avgTime),
        avgCost: Math.round(avgCost),
      }
    })
  }, [commutes])

  const fastestRoute = useMemo(() => {
    return (
      comparisonData
        .filter((c) => c.trips > 0)
        .sort((a, b) => a.avgTime - b.avgTime)[0] || null
    )
  }, [comparisonData])

  const cheapestRoute = useMemo(() => {
    return (
      comparisonData
        .filter((c) => c.trips > 0)
        .sort((a, b) => a.avgCost - b.avgCost)[0] || null
    )
  }, [comparisonData])

  const handleSaveCommute = () => {
    if (!selectedMode || !formData.from || !formData.to) return
    const newCommute: Commute = {
      // eslint-disable-next-line react-hooks/purity
      id: Date.now().toString(),
      mode: selectedMode,
      from: formData.from,
      to: formData.to,
      departure: formData.departure,
      arrival: formData.arrival,
      cost: formData.cost,
      distance: formData.distance,
      date: today,
      notes: formData.notes,
    }
    setCommutes((prev) => [newCommute, ...prev])
    resetForm()
  }

  const resetForm = () => {
    setSelectedMode("")
    setFormData({
      from: "",
      to: "",
      departure: "",
      arrival: "",
      cost: 0,
      distance: 0,
      notes: "",
    })
    setShowForm(false)
  }

  const handleDeleteCommute = (id: string) => {
    setCommutes((prev) => prev.filter((c) => c.id !== id))
    setDeleteConfirm(null)
  }

  const handleSaveRoute = () => {
    if (!formData.from || !formData.to || !selectedMode) return
    const route: SavedRoute = {
      id: Date.now().toString(),
      name: routeName || `${formData.from} → ${formData.to}`,
      from: formData.from,
      to: formData.to,
      mode: selectedMode,
      avgCost: formData.cost || getModeById(selectedMode)?.avgCost || 0,
    }
    setSavedRoutes((prev) => [...prev, route])
    setRouteName("")
  }

  const handleSelectRoute = (route: SavedRoute) => {
    setSelectedMode(route.mode)
    setFormData((prev) => ({
      ...prev,
      from: route.from,
      to: route.to,
      cost: route.avgCost,
    }))
    setShowForm(true)
  }

  const handleDeleteRoute = (id: string) => {
    setSavedRoutes((prev) => prev.filter((r) => r.id !== id))
  }

  const tabs = [
    { key: "today" as const, labelEn: "Today", labelBn: "আজ", icon: Sparkles },
    {
      key: "week" as const,
      labelEn: "Week",
      labelBn: "সপ্তাহ",
      icon: CalendarDays,
    },
    {
      key: "history" as const,
      labelEn: "History",
      labelBn: "ইতিহাস",
      icon: BarChart3,
    },
    {
      key: "compare" as const,
      labelEn: "Compare",
      labelBn: "তুলনা",
      icon: TrendingUp,
    },
    {
      key: "schedule" as const,
      labelEn: "Schedule",
      labelBn: "সময়সূচী",
      icon: Clock,
    },
  ]

  return (
    <div className="min-h-screen bg-mesh p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Navigation className="w-7 h-7 text-primary" />
              {lang === "bn" ? "যাতায়াত ট্র্যাকার" : "Commute Tracker"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {lang === "bn"
                ? "আপনার দৈনিক যাতায়াত ট্র্যাক করুন"
                : "Track your daily commutes and optimize your travel"}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {lang === "bn" ? "নতুন যাতায়াত" : "New Commute"}
          </motion.button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "glass-subtle"
                }`}
              >
                <Icon className="w-4 h-4" />
                {lang === "bn" ? tab.labelBn : tab.labelEn}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "today" && (
            <TodayView
              key="today"
              todayCommutes={todayCommutes}
              savedRoutes={savedRoutes}
              fastestRoute={fastestRoute}
              cheapestRoute={cheapestRoute}
              onDeleteCommute={(id) => setDeleteConfirm(id)}
              onSelectRoute={handleSelectRoute}
              onDeleteRoute={handleDeleteRoute}
            />
          )}

          {activeTab === "week" && (
            <WeekView
              key="week"
              weekCommutes={weekCommutes}
              weeklyStats={weeklyStats}
            />
          )}

          {activeTab === "history" && (
            <HistoryView
              key="history"
              commutes={commutes}
              onDeleteCommute={(id) => setDeleteConfirm(id)}
            />
          )}

          {activeTab === "compare" && (
            <CompareView key="compare" commutes={commutes} />
          )}

          {activeTab === "schedule" && <ScheduleView key="schedule" />}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <CommuteForm
            selectedMode={selectedMode}
            formData={formData}
            routeName={routeName}
            onSelectMode={setSelectedMode}
            onUpdateForm={(data) =>
              setFormData((prev) => ({ ...prev, ...data }))
            }
            onUpdateRouteName={setRouteName}
            onSaveCommute={handleSaveCommute}
            onSaveRoute={handleSaveRoute}
            onClose={resetForm}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deleteConfirm !== null}
        onConfirm={() => deleteConfirm && handleDeleteCommute(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        title={lang === "bn" ? "যাতায়াত মুছুন?" : "Delete commute?"}
        description={
          lang === "bn"
            ? "এই যাতায়াত স্থায়ীভাবে মুছে ফেলা হবে।"
            : "This commute will be permanently deleted."
        }
        variant="danger"
      />
    </div>
  )
}
