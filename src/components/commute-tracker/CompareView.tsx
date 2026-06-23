import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useMemo } from "react";
import { TrendingUp, Timer, DollarSign, Star } from "lucide-react";
import {
  fadeUp,
  COMFORT_RATINGS,
  TRANSPORT_MODES,
  type Commute,
} from "./types";

interface CompareViewProps {
  commutes: Commute[];
}

export function CompareView({ commutes }: CompareViewProps) {
  const { lang } = useLang();

  const comparisonData = useMemo(() => {
    return TRANSPORT_MODES.map((mode) => {
      const modeTrips = commutes.filter((c) => c.mode === mode.id);
      const totalDist = modeTrips.reduce((s, c) => s + c.distance, 0);
      const avgTime =
        modeTrips.length > 0
          ? modeTrips.reduce((s, c) => {
              if (c.departure && c.arrival) {
                const dep = new Date(`2000-01-01T${c.departure}`);
                const arr = new Date(`2000-01-01T${c.arrival}`);
                return s + (arr.getTime() - dep.getTime()) / 60000;
              }
              return s + (totalDist > 0 ? (totalDist / mode.avgSpeed) * 60 : 0);
            }, 0) / modeTrips.length
          : totalDist > 0
            ? (totalDist / mode.avgSpeed) * 60
            : 0;
      const avgCost =
        modeTrips.length > 0
          ? modeTrips.reduce((s, c) => s + c.cost, 0) / modeTrips.length
          : mode.avgCost;
      return {
        ...mode,
        trips: modeTrips.length,
        avgTime: Math.round(avgTime),
        avgCost: Math.round(avgCost),
        comfort: COMFORT_RATINGS[mode.id] || 3,
      };
    });
  }, [commutes]);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="glass rounded-2xl p-4 md:p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          {lang === "bn" ? "যাতায়াত তুলনা" : "Commute Comparison"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-medium text-muted-foreground p-3">
                  {lang === "bn" ? "মোড" : "Mode"}
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3">
                  {lang === "bn" ? "গড় সময়" : "Avg Time"}
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3">
                  {lang === "bn" ? "গড় খরচ" : "Avg Cost"}
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3">
                  {lang === "bn" ? "কার্বন" : "Carbon"}
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3">
                  {lang === "bn" ? "আরাম" : "Comfort"}
                </th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3">
                  {lang === "bn" ? "যাত্রা" : "Trips"}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((mode) => (
                <tr
                  key={mode.id}
                  className="border-b border-border/30 hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{mode.icon}</span>
                      <span className="text-sm font-medium">
                        {lang === "bn" ? mode.nameBn : mode.nameEn}
                      </span>
                    </div>
                  </td>
                  <td className="text-center p-3 text-sm">
                    {mode.avgTime > 0 ? `${mode.avgTime} min` : "-"}
                  </td>
                  <td className="text-center p-3 text-sm">৳{mode.avgCost}</td>
                  <td className="text-center p-3 text-sm">
                    {mode.carbon > 0 ? (
                      `${mode.carbon} kg/km`
                    ) : (
                      <span className="text-green-500">0</span>
                    )}
                  </td>
                  <td className="text-center p-3">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${star <= mode.comfort ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="text-center p-3 text-sm font-medium">
                    {mode.trips}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="glass rounded-2xl p-4 md:p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Timer className="w-5 h-5 text-blue-500" />
            {lang === "bn" ? "সময় অনুযায়ী সাজানো" : "Sorted by Time"}
          </h3>
          <div className="space-y-2">
            {comparisonData
              .filter((m) => m.trips > 0)
              .sort((a, b) => a.avgTime - b.avgTime)
              .map((mode, i) => (
                <div
                  key={mode.id}
                  className="flex items-center gap-3 glass-subtle rounded-lg p-2 hover-row"
                >
                  <span className="text-sm font-bold text-muted-foreground w-5">
                    {i + 1}
                  </span>
                  <span className="text-lg">{mode.icon}</span>
                  <span className="text-sm flex-1">
                    {lang === "bn" ? mode.nameBn : mode.nameEn}
                  </span>
                  <span className="text-sm font-medium">
                    {mode.avgTime} min
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-4 md:p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-green-500" />
            {lang === "bn" ? "খরচ অনুযায়ী সাজানো" : "Sorted by Cost"}
          </h3>
          <div className="space-y-2">
            {comparisonData
              .filter((m) => m.trips > 0)
              .sort((a, b) => a.avgCost - b.avgCost)
              .map((mode, i) => (
                <div
                  key={mode.id}
                  className="flex items-center gap-3 glass-subtle rounded-lg p-2 hover-row"
                >
                  <span className="text-sm font-bold text-muted-foreground w-5">
                    {i + 1}
                  </span>
                  <span className="text-lg">{mode.icon}</span>
                  <span className="text-sm flex-1">
                    {lang === "bn" ? mode.nameBn : mode.nameEn}
                  </span>
                  <span className="text-sm font-medium">৳{mode.avgCost}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
