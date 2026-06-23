import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { t, type TranslationKey, type Lang } from "@/i18n/translations";
import { CATEGORY_CONFIG, fadeUp } from "./types";
import type { SubCategory } from "./types";

interface CategoryCost {
  category: SubCategory;
  cost: number;
  percentage: number;
}

interface Props {
  lang: Lang;
  categoryCosts: CategoryCost[];
}

export function CostBreakdown({ lang, categoryCosts }: Props) {
  if (categoryCosts.length === 0) return null;

  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">
          {t("subscriptions.costComparison", lang)}
        </h2>
      </div>
      <div className="space-y-3">
        {categoryCosts.map((item) => (
          <div key={item.category}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span>{CATEGORY_CONFIG[item.category].icon}</span>
                <span className="text-sm text-white/80">
                  {t(`subscriptions.${item.category}` as TranslationKey, lang)}
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                ৳
                {item.cost.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
                <span className="text-white/40 ml-1">
                  ({item.percentage.toFixed(0)}%)
                </span>
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full"
                style={{
                  backgroundColor: CATEGORY_CONFIG[item.category].color,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
