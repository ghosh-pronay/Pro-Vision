import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, TreePine } from "lucide-react";
import { fadeUp, AVG_BANGLADESHI_ANNUAL_TONS } from "./types";

interface CarbonSummaryProps {
  lang: string;
  todayTotal: number;
  comparisonPercent: number;
  yesterdayTotal: number;
  treesNeeded: number;
}

export function CarbonSummary({
  lang,
  todayTotal,
  comparisonPercent,
  yesterdayTotal,
  treesNeeded,
}: CarbonSummaryProps) {
  const t = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const avgBangladeshiDaily = (AVG_BANGLADESHI_ANNUAL_TONS * 1000) / 365;

  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="text-center sm:text-left">
          <p className="text-sm text-muted-foreground mb-1">
            {t("Today's Carbon", "আজকের কার্বন")}
          </p>
          <p className="text-4xl font-bold text-green-500">
            {todayTotal.toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground">kg CO₂</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">
            {t("vs Yesterday", "গতকালের তুলনায়")}
          </p>
          <div className="flex items-center justify-center gap-1">
            {comparisonPercent > 0 ? (
              <>
                <TrendingUp className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold text-red-500">
                  +{comparisonPercent.toFixed(0)}%
                </span>
              </>
            ) : comparisonPercent < 0 ? (
              <>
                <TrendingDown className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-500">
                  {comparisonPercent.toFixed(0)}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                —
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {yesterdayTotal.toFixed(1)} kg {t("yesterday", "গতকাল")}
          </p>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-sm text-muted-foreground mb-1">
            {t("Trees to Offset", "অফসেটের জন্য গাছ")}
          </p>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <TreePine className="h-8 w-8 text-green-500" />
            <span className="text-3xl font-bold text-green-500">
              {treesNeeded.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("1 tree = 21 kg/year", "১ গাছ = ২১ কেজি/বছর")}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-foreground/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {t("vs Average Bangladeshi", "গড় বাংলাদেশির তুলনায়")}
          </span>
          <span
            className={`text-sm font-medium ${todayTotal < avgBangladeshiDaily ? "text-green-500" : "text-red-500"}`}
          >
            {todayTotal < avgBangladeshiDaily
              ? t(
                  `${((1 - todayTotal / avgBangladeshiDaily) * 100).toFixed(0)}% below`,
                  `${((1 - todayTotal / avgBangladeshiDaily) * 100).toFixed(0)}% কম`,
                )
              : t(
                  `${((todayTotal / avgBangladeshiDaily - 1) * 100).toFixed(0)}% above`,
                  `${((todayTotal / avgBangladeshiDaily - 1) * 100).toFixed(0)}% বেশি`,
                )}
          </span>
        </div>
        <div className="relative h-3 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-green-500/30 rounded-full"
            style={{
              width: `${Math.min(100, (avgBangladeshiDaily / (avgBangladeshiDaily * 2)) * 100)}%`,
            }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, (todayTotal / (avgBangladeshiDaily * 2)) * 100)}%`,
            }}
            className="absolute h-full bg-green-500 rounded-full"
          />
          <div
            className="absolute h-full w-0.5 bg-foreground/30"
            style={{
              left: `${(avgBangladeshiDaily / (avgBangladeshiDaily * 2)) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>0</span>
          <span>
            {t("Avg: ", "গড়: ")}
            {avgBangladeshiDaily.toFixed(1)} kg
          </span>
          <span>{(avgBangladeshiDaily * 2).toFixed(0)} kg</span>
        </div>
      </div>
    </motion.div>
  );
}
