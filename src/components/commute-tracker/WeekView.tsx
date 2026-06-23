import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import {
  Navigation,
  Route,
  DollarSign,
  Timer,
  Leaf,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { fadeUp, getModeById, type Commute } from "./types";

interface WeekViewProps {
  weekCommutes: Commute[];
  weeklyStats: {
    totalTrips: number;
    totalDistance: number;
    totalCost: number;
    totalCarbon: number;
    totalTime: number;
    mostUsedMode: string;
  };
}

export function WeekView({ weekCommutes, weeklyStats }: WeekViewProps) {
  const { lang } = useLang();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            label: lang === "bn" ? "মোট যাত্রা" : "Total Trips",
            value: weeklyStats.totalTrips,
            icon: Navigation,
            color: "text-blue-500",
          },
          {
            label: lang === "bn" ? "মোট দূরত্ব" : "Total Distance",
            value: `${weeklyStats.totalDistance.toFixed(1)} km`,
            icon: Route,
            color: "text-orange-500",
          },
          {
            label: lang === "bn" ? "মোট খরচ" : "Total Cost",
            value: `৳${weeklyStats.totalCost}`,
            icon: DollarSign,
            color: "text-green-500",
          },
          {
            label: lang === "bn" ? "মোট সময়" : "Total Time",
            value: `${Math.round(weeklyStats.totalTime)} min`,
            icon: Timer,
            color: "text-purple-500",
          },
        ].map((stat, i) => (
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass rounded-xl p-4 hover-lift hover-teal">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">
              {lang === "bn" ? "কার্বন ফুটপ্রিন্ট" : "Carbon Footprint"}
            </span>
          </div>
          <p className="text-xl font-bold">
            {weeklyStats.totalCarbon.toFixed(2)} kg
          </p>
        </div>
        <div className="glass rounded-xl p-4 hover-lift hover-teal">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-muted-foreground">
              {lang === "bn" ? "সবচেয়ে বেশি ব্যবহৃত" : "Most Used Mode"}
            </span>
          </div>
          <p className="text-xl font-bold">
            {weeklyStats.mostUsedMode
              ? `${getModeById(weeklyStats.mostUsedMode)?.icon} ${lang === "bn" ? getModeById(weeklyStats.mostUsedMode)?.nameBn : getModeById(weeklyStats.mostUsedMode)?.nameEn}`
              : "-"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 hover-lift hover-teal">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">
              {lang === "bn" ? "গড় খরচ/যাত্রা" : "Avg Cost/Trip"}
            </span>
          </div>
          <p className="text-xl font-bold">
            ৳
            {weeklyStats.totalTrips > 0
              ? Math.round(weeklyStats.totalCost / weeklyStats.totalTrips)
              : 0}
          </p>
        </div>
        <div className="glass rounded-xl p-4 hover-lift hover-teal">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">
              {lang === "bn" ? "গড় সময়/যাত্রা" : "Avg Time/Trip"}
            </span>
          </div>
          <p className="text-xl font-bold">
            {weeklyStats.totalTrips > 0
              ? Math.round(weeklyStats.totalTime / weeklyStats.totalTrips)
              : 0}{" "}
            min
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 md:p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-blue-500" />
          {lang === "bn" ? "সাপ্তাহিক যাতায়াত" : "Weekly Commutes"}
        </h2>
        <div className="space-y-2">
          {weekCommutes.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={
                lang === "bn"
                  ? "এই সপ্তাহে কোনো যাতায়াত নেই"
                  : "No commutes this week"
              }
              description={
                lang === "bn"
                  ? "নতুন যাতায়াত যোগ করুন"
                  : "Start logging your commutes"
              }
            />
          ) : (
            weekCommutes.map((c) => {
              const mode = getModeById(c.mode);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-subtle rounded-xl p-3 flex items-center gap-3 hover-row"
                >
                  <span className="text-xl">{mode?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {c.from} → {c.to}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.date} ·{" "}
                      {c.departure && c.arrival
                        ? `${c.departure} → ${c.arrival}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium">৳{c.cost}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.distance} km
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
