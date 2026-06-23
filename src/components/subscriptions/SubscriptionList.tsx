import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit3,
  Trash2,
  CreditCard,
  Star,
  RotateCcw,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { t, type TranslationKey, type Lang } from "@/i18n/translations";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CATEGORY_CONFIG,
  calculateMonthlyCost,
  getDaysUntilRenewal,
  fadeUp,
} from "./types";
import type { Subscription } from "./types";

interface Props {
  lang: Lang;
  now: number;
  filtered: Subscription[];
  onDelete: (id: string) => void;
  onEdit: (sub: Subscription) => void;
  onToggleCancel: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onAddClick: () => void;
}

export function SubscriptionList({
  lang,
  now,
  filtered,
  onDelete,
  onEdit,
  onToggleCancel,
  onRate,
  onAddClick,
}: Props) {
  return (
    <motion.div variants={fadeUp} className="space-y-3 mb-8">
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("subscriptions.noSubscriptions", lang)}
            description={t("subscriptions.noSubscriptionsDesc", lang)}
            action={{
              label: t("subscriptions.add", lang),
              onClick: onAddClick,
            }}
          />
        ) : (
          filtered.map((sub) => {
            const monthlyCost = calculateMonthlyCost(
              sub.amount,
              sub.billingCycle,
            );
            const daysLeft = getDaysUntilRenewal(sub.nextRenewal, now);
            const isUpcoming =
              sub.status === "active" && daysLeft >= 0 && daysLeft <= 30;
            const isExpired = daysLeft < 0 && sub.status === "active";

            return (
              <motion.div
                key={sub._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`glass rounded-2xl p-5 transition ${sub.status === "cancelled" ? "opacity-60" : ""} ${isExpired ? "border-red-500/30 border" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{
                        backgroundColor: `${CATEGORY_CONFIG[sub.category].color}20`,
                      }}
                    >
                      {CATEGORY_CONFIG[sub.category].icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">
                          {sub.name}
                        </h3>
                        {sub.status === "cancelled" && (
                          <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full shrink-0">
                            {t("subscriptions.cancelled", lang)}
                          </span>
                        )}
                        {isUpcoming && daysLeft <= sub.alertBefore && (
                          <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-white/60">
                        <span>৳{sub.amount.toLocaleString()}</span>
                        <span>·</span>
                        <span>
                          {t(
                            `subscriptions.${sub.billingCycle}` as TranslationKey,
                            lang,
                          )}
                        </span>
                        <span>·</span>
                        <span className="text-white/40">
                          {lang === "bn"
                            ? `মাসিক: ৳${monthlyCost.toFixed(0)}`
                            : `Monthly: ৳${monthlyCost.toFixed(0)}`}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {sub.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => onRate(sub._id, star)}
                            className="transition hover:scale-110"
                            title={
                              lang === "bn" ? `${star} রেটিং` : `Rate ${star}`
                            }
                          >
                            <Star
                              className={`w-4 h-4 ${star <= sub.usageRating ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`}
                            />
                          </button>
                        ))}
                        <span className="text-xs text-white/40 ml-1">
                          {sub.usageRating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {sub.status === "active" && (
                      <span className="text-xs text-white/50 mr-2">
                        {daysLeft === 0
                          ? t("subscriptions.today", lang)
                          : daysLeft > 0
                            ? lang === "bn"
                              ? `${daysLeft} দিন বাকি`
                              : `${daysLeft}d left`
                            : t("subscriptions.expired", lang)}
                      </span>
                    )}
                    <button
                      onClick={() => onEdit(sub)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                      title={t("subscriptions.edit", lang)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleCancel(sub._id)}
                      className={`p-2 rounded-lg transition ${sub.status === "active" ? "hover:bg-red-500/10 text-white/60 hover:text-red-400" : "hover:bg-green-500/10 text-white/60 hover:text-green-400"}`}
                      title={
                        sub.status === "active"
                          ? t("subscriptions.markCancelled", lang)
                          : t("subscriptions.reactivated", lang)
                      }
                    >
                      {sub.status === "active" ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(sub._id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition"
                      title={t("subscriptions.delete", lang)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </motion.div>
  );
}
