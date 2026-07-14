import { motion } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import {
  Navigation,
  DollarSign,
  Route,
  Leaf,
  Clock,
  Bookmark,
  Sparkles,
  X,
  Trash2,
} from "lucide-react"
import { EmptyState } from "@/components/ui/EmptyState"
import { fadeUp, getModeById, type Commute, type SavedRoute } from "./types"

interface TodayViewProps {
  todayCommutes: Commute[]
  savedRoutes: SavedRoute[]
  fastestRoute: {
    icon: string
    nameEn: string
    nameBn: string
    avgTime: number
  } | null
  cheapestRoute: {
    icon: string
    nameEn: string
    nameBn: string
    avgCost: number
  } | null
  onDeleteCommute: (id: string) => void
  onSelectRoute: (route: SavedRoute) => void
  onDeleteRoute: (id: string) => void
}

export function TodayView({
  todayCommutes,
  savedRoutes,
  fastestRoute,
  cheapestRoute,
  onDeleteCommute,
  onSelectRoute,
  onDeleteRoute,
}: TodayViewProps) {
  const { lang } = useLang()

  const stats = [
    {
      label: lang === "bn" ? "আজকের যাত্রা" : "Today's Trips",
      value: todayCommutes.length,
      icon: Navigation,
      color: "text-blue-500",
    },
    {
      label: lang === "bn" ? "আজকের খরচ" : "Today's Cost",
      value: `৳${todayCommutes.reduce((s, c) => s + c.cost, 0)}`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: lang === "bn" ? "দূরত্ব" : "Distance",
      value: `${todayCommutes.reduce((s, c) => s + c.distance, 0).toFixed(1)} km`,
      icon: Route,
      color: "text-orange-500",
    },
    {
      label: lang === "bn" ? "কার্বন" : "Carbon",
      value: `${todayCommutes
        .reduce((s, c) => {
          const m = getModeById(c.mode)
          return s + (m ? m.carbon * c.distance : 0)
        }, 0)
        .toFixed(2)} kg`,
      icon: Leaf,
      color: "text-emerald-500",
    },
  ]

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            custom={i}
            className="glass rounded-xl p-4 hover-lift hover-teal"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl p-4 md:p-6 mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-500" />
          {lang === "bn" ? "আজকের যাতায়াত" : "Today's Commutes"}
        </h2>
        {todayCommutes.length === 0 ? (
          <EmptyState
            icon={Navigation}
            title={
              lang === "bn"
                ? "আজকে এখনো কোনো যাতায়াত নেই"
                : "No commutes today"
            }
            description={
              lang === "bn"
                ? "নতুন যাতায়াত যোগ করতে উপরের বোতামে ক্লিক করুন"
                : "Click the button above to add a new commute"
            }
          />
        ) : (
          <div className="space-y-3">
            {todayCommutes.map((c) => {
              const mode = getModeById(c.mode)
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-subtle rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mode?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {lang === "bn" ? mode?.nameBn : mode?.nameEn}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {c.departure && c.arrival
                            ? `${c.departure} → ${c.arrival}`
                            : ""}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {c.from} → {c.to}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">৳{c.cost}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.distance} km
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteCommute(c.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete commute"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {savedRoutes.length > 0 && (
        <div className="glass rounded-2xl p-4 md:p-6 mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Bookmark className="w-5 h-5 text-yellow-500" />
            {lang === "bn" ? "সংরক্ষিত রুট" : "Saved Routes"}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {savedRoutes.map((route) => {
              const mode = getModeById(route.mode)
              return (
                <motion.div
                  key={route.id}
                  whileHover={{ scale: 1.02 }}
                  className="glass-subtle rounded-xl p-3 min-w-[180px] cursor-pointer relative group"
                  onClick={() => onSelectRoute(route)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{mode?.icon}</span>
                    <span className="text-sm font-medium truncate">
                      {route.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {route.from} → {route.to}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ৳{route.avgCost}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteRoute(route.id)
                    }}
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Delete route"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="glass rounded-2xl p-4 md:p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {lang === "bn" ? "দ্রুততম রুট" : "Fastest Route"}
          </h3>
          {fastestRoute ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{fastestRoute.icon}</span>
              <div>
                <p className="font-medium">
                  {lang === "bn" ? fastestRoute.nameBn : fastestRoute.nameEn}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fastestRoute.avgTime}{" "}
                  {lang === "bn" ? "মিনিট গড়" : "min avg"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lang === "bn" ? "ডেটা নেই" : "No data yet"}
            </p>
          )}
        </div>
        <div className="glass rounded-2xl p-4 md:p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-green-500" />
            {lang === "bn" ? "সাশ্রয়ী রুট" : "Cheapest Route"}
          </h3>
          {cheapestRoute ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cheapestRoute.icon}</span>
              <div>
                <p className="font-medium">
                  {lang === "bn" ? cheapestRoute.nameBn : cheapestRoute.nameEn}
                </p>
                <p className="text-xs text-muted-foreground">
                  ৳{cheapestRoute.avgCost} {lang === "bn" ? "গড়" : "avg"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {lang === "bn" ? "ডেটা নেই" : "No data yet"}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
