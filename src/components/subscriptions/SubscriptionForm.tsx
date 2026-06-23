import { motion } from "framer-motion";
import { X, Repeat, Star } from "lucide-react";
import { t, type Lang } from "@/i18n/translations";
import { PAYMENT_METHODS, ALERT_OPTIONS } from "./types";
import type { BillingCycle, SubCategory } from "./types";

interface FormData {
  name: string;
  amount: string;
  billingCycle: BillingCycle;
  category: SubCategory;
  startDate: string;
  paymentMethod: string;
  autoRenew: boolean;
  alertBefore: number;
  usageRating: number;
}

interface Props {
  lang: Lang;
  editingId: string | null;
  formData: FormData;
  onChange: (fn: (f: FormData) => FormData) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function SubscriptionForm({
  lang,
  editingId,
  formData,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        className="glass rounded-2xl p-6 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {editingId
              ? t("subscriptions.edit", lang)
              : t("subscriptions.add", lang)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">
              {t("subscriptions.name", lang)}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                onChange((f) => ({ ...f, name: e.target.value }))
              }
              placeholder={t("subscriptions.namePlaceholder", lang)}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">
                {t("subscriptions.amount", lang)}
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  onChange((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="0"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">
                {t("subscriptions.billingCycle", lang)}
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    billingCycle: e.target.value as BillingCycle,
                  }))
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="weekly">
                  {t("subscriptions.weekly", lang)}
                </option>
                <option value="monthly">
                  {t("subscriptions.monthly", lang)}
                </option>
                <option value="quarterly">
                  {t("subscriptions.quarterly", lang)}
                </option>
                <option value="semiAnnual">
                  {t("subscriptions.semiAnnual", lang)}
                </option>
                <option value="annual">
                  {t("subscriptions.annual", lang)}
                </option>
                <option value="custom">
                  {t("subscriptions.custom", lang)}
                </option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">
                {t("subscriptions.category", lang)}
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    category: e.target.value as SubCategory,
                  }))
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
              >
                <option value="streaming">
                  {t("subscriptions.streaming", lang)}
                </option>
                <option value="software">
                  {t("subscriptions.software", lang)}
                </option>
                <option value="food">{t("subscriptions.food", lang)}</option>
                <option value="transport">
                  {t("subscriptions.transport", lang)}
                </option>
                <option value="fitness">
                  {t("subscriptions.fitness", lang)}
                </option>
                <option value="education">
                  {t("subscriptions.education", lang)}
                </option>
                <option value="other">{t("subscriptions.other", lang)}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">
                {t("subscriptions.startDate", lang)}
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  onChange((f) => ({ ...f, startDate: e.target.value }))
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">
                {t("subscriptions.paymentMethod", lang)}
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  onChange((f) => ({ ...f, paymentMethod: e.target.value }))
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">
                {t("subscriptions.alertBefore", lang)}
              </label>
              <select
                value={formData.alertBefore}
                onChange={(e) =>
                  onChange((f) => ({
                    ...f,
                    alertBefore: Number(e.target.value),
                  }))
                }
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
              >
                {ALERT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">
              {t("subscriptions.usageRating", lang)}
            </label>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => onChange((f) => ({ ...f, usageRating: star }))}
                  className="transition hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${star <= formData.usageRating ? "text-yellow-400 fill-yellow-400" : "text-white/20"}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/80">
                {t("subscriptions.autoRenew", lang)}
              </span>
            </div>
            <button
              onClick={() =>
                onChange((f) => ({ ...f, autoRenew: !f.autoRenew }))
              }
              className={`w-12 h-6 rounded-full transition-colors ${formData.autoRenew ? "bg-purple-500" : "bg-white/20"}`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.autoRenew ? "translate-x-6" : "translate-x-0.5"}`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl glass text-white/80 hover:text-white transition font-medium"
            >
              {t("subscriptions.cancel", lang)}
            </button>
            <button
              onClick={onSubmit}
              disabled={!formData.name || !formData.amount}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingId
                ? t("subscriptions.save", lang)
                : t("subscriptions.add", lang)}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
