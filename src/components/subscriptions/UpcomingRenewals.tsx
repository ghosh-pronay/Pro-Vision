import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { t, type Lang } from "@/i18n/translations";
import { CATEGORY_CONFIG, getDaysUntilRenewal, fadeUp } from "./types";
import type { Subscription } from "./types";

interface Props {
  lang: Lang;
  upcoming: Subscription[];
  now: number;
}

export function UpcomingRenewals({ lang, upcoming, now }: Props) {
  if (upcoming.length === 0) return null;

  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">
          {t("subscriptions.upcoming", lang)}
        </h2>
        <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
          {upcoming.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {upcoming.map((sub) => {
          const daysLeft = getDaysUntilRenewal(sub.nextRenewal, now);
          const isUrgent = daysLeft <= sub.alertBefore;
          return (
            <motion.div
              key={sub._id}
              layout
              className={`rounded-xl p-4 border transition ${
                isUrgent
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span>{CATEGORY_CONFIG[sub.category].icon}</span>
                    <span className="font-medium text-white">{sub.name}</span>
                  </div>
                  <p className="text-sm text-white/60 mt-1">
                    ৳{sub.amount.toLocaleString()} · {sub.paymentMethod}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isUrgent
                      ? "bg-red-500/30 text-red-300"
                      : "bg-orange-500/20 text-orange-300"
                  }`}
                >
                  {daysLeft === 0
                    ? t("subscriptions.today", lang)
                    : lang === "bn"
                      ? `${daysLeft} দিন বাকি`
                      : `${daysLeft}d`}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
