import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, TrendingDown } from "lucide-react";
import { t, type TranslationKey, type Lang } from "@/i18n/translations";
import { fadeUp } from "./types";

interface Props {
  lang: Lang;
  totalMonthly: number;
  totalAnnual: number;
  activeCount: number;
  cancelledCount: number;
  upcomingCount: number;
  potentialSavings: number;
}

export function SummaryCards({
  lang,
  totalMonthly,
  totalAnnual,
  activeCount,
  cancelledCount,
  upcomingCount,
  potentialSavings,
}: Props) {
  const t_ = (key: string) => t(key as TranslationKey, lang);

  return (
    <motion.div
      variants={fadeUp}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          <span className="text-white/60 text-sm">
            {t_("subscriptions.totalMonthly")}
          </span>
        </div>
        <p className="text-2xl font-bold text-white">
          ৳{totalMonthly.toLocaleString()}
        </p>
        <p className="text-xs text-white/40 mt-1">
          {lang === "bn"
            ? `বার্ষিক: ৳${totalAnnual.toLocaleString()}`
            : `Annual: ৳${totalAnnual.toLocaleString()}`}
        </p>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <span className="text-white/60 text-sm">
            {t_("subscriptions.activeCount")}
          </span>
        </div>
        <p className="text-2xl font-bold text-white">{activeCount}</p>
        <p className="text-xs text-white/40 mt-1">
          {cancelledCount} {t_("subscriptions.cancelled").toLowerCase()}
        </p>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-orange-400" />
          <span className="text-white/60 text-sm">
            {t_("subscriptions.upcoming")}
          </span>
        </div>
        <p className="text-2xl font-bold text-white">{upcomingCount}</p>
        <p className="text-xs text-white/40 mt-1">
          {t_("subscriptions.upcomingDesc")}
        </p>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-5 h-5 text-yellow-400" />
          <span className="text-white/60 text-sm">
            {t_("subscriptions.potentialSavings")}
          </span>
        </div>
        <p className="text-2xl font-bold text-yellow-400">
          ৳{potentialSavings.toLocaleString()}
        </p>
        <p className="text-xs text-white/40 mt-1">
          {t_("subscriptions.potentialSavingsDesc")}
        </p>
      </div>
    </motion.div>
  );
}
