import { motion } from "framer-motion";
import { Flame, TrendingUp, DollarSign, Utensils } from "lucide-react";
import { fadeUp } from "./types";

interface WeeklySummaryProps {
  lang: string;
  weeklyStats: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalCost: number;
    mealCount: number;
  };
}

export function WeeklySummary({ lang, weeklyStats }: WeeklySummaryProps) {
  const stats = [
    {
      label: lang === "bn" ? "মোট ক্যালোরি" : "Total Calories",
      value: weeklyStats.totalCalories,
      unit: "cal",
      icon: Flame,
      color: "text-orange-500",
    },
    {
      label: lang === "bn" ? "মোট প্রোটিন" : "Total Protein",
      value: weeklyStats.totalProtein,
      unit: "g",
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      label: lang === "bn" ? "মোট খরচ" : "Total Cost",
      value: `৳${weeklyStats.totalCost}`,
      unit: "",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: lang === "bn" ? "খাবার সংখ্যা" : "Meals Planned",
      value: weeklyStats.mealCount,
      unit: `/28`,
      icon: Utensils,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          variants={fadeUp}
          custom={i}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <span className="text-xs text-muted-foreground">{stat.label}</span>
          </div>
          <p className="text-xl font-bold">
            {stat.value}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              {stat.unit}
            </span>
          </p>
        </motion.div>
      ))}
    </div>
  );
}
