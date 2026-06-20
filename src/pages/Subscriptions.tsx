import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  X,
  Edit3,
  Trash2,
  CreditCard,
  Bell,
  AlertTriangle,
  Clock,
  Download,
  Star,
  TrendingDown,
  TrendingUp,
  BarChart3,
  RotateCcw,
  Repeat,
  DollarSign,
  FileText,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toastSuccess, toastInfo } from "@/lib/toast-helpers";

type BillingCycle =
  | "monthly"
  | "quarterly"
  | "semiAnnual"
  | "annual"
  | "weekly"
  | "custom";

type SubCategory =
  | "streaming"
  | "software"
  | "food"
  | "transport"
  | "fitness"
  | "education"
  | "other";

interface Subscription {
  _id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  category: SubCategory;
  startDate: number;
  nextRenewal: number;
  paymentMethod: string;
  autoRenew: boolean;
  alertBefore: number;
  usageRating: number;
  status: "active" | "cancelled";
  cancelledAt?: number;
}

const CATEGORY_CONFIG: Record<SubCategory, { color: string; icon: string }> = {
  streaming: { color: "#e11d48", icon: "🎬" },
  software: { color: "#7c3aed", icon: "💻" },
  food: { color: "#ea580c", icon: "🍔" },
  transport: { color: "#0891b2", icon: "🚌" },
  fitness: { color: "#16a34a", icon: "🏋️" },
  education: { color: "#2563eb", icon: "📚" },
  other: { color: "#6b7280", icon: "📦" },
};

const PAYMENT_METHODS = [
  "Bkash",
  "Nagad",
  "Rocket",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "PayPal",
  "Other",
];

const ALERT_OPTIONS = [
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "1 month" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
};

function calculateMonthlyCost(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "weekly":
      return amount * 4.33;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "semiAnnual":
      return amount / 6;
    case "annual":
      return amount / 12;
    case "custom":
      return amount;
    default:
      return amount;
  }
}

function calculateNextRenewal(startDate: number, cycle: BillingCycle): number {
  const now = Date.now();
  const start = new Date(startDate);
  const next = new Date(startDate);

  switch (cycle) {
    case "weekly": {
      const diffWeeks = Math.floor(
        (now - startDate) / (7 * 24 * 60 * 60 * 1000),
      );
      next.setTime(start.getTime() + (diffWeeks + 1) * 7 * 24 * 60 * 60 * 1000);
      break;
    }
    case "monthly": {
      const diffMonths = Math.floor(
        (now - startDate) / (30 * 24 * 60 * 60 * 1000),
      );
      next.setTime(
        start.getTime() + (diffMonths + 1) * 30 * 24 * 60 * 60 * 1000,
      );
      break;
    }
    case "quarterly": {
      const diffQuarters = Math.floor(
        (now - startDate) / (90 * 24 * 60 * 60 * 1000),
      );
      next.setTime(
        start.getTime() + (diffQuarters + 1) * 90 * 24 * 60 * 60 * 1000,
      );
      break;
    }
    case "semiAnnual": {
      const diffHalf = Math.floor(
        (now - startDate) / (180 * 24 * 60 * 60 * 1000),
      );
      next.setTime(
        start.getTime() + (diffHalf + 1) * 180 * 24 * 60 * 60 * 1000,
      );
      break;
    }
    case "annual": {
      const diffYears = Math.floor(
        (now - startDate) / (365 * 24 * 60 * 60 * 1000),
      );
      next.setTime(
        start.getTime() + (diffYears + 1) * 365 * 24 * 60 * 60 * 1000,
      );
      break;
    }
    default: {
      next.setTime(now + 30 * 24 * 60 * 60 * 1000);
      break;
    }
  }

  return next.getTime();
}

function getDaysUntilRenewal(renewalDate: number, now: number): number {
  return Math.ceil((renewalDate - now) / (24 * 60 * 60 * 1000));
}

const emptyForm = {
  name: "",
  amount: "",
  billingCycle: "monthly" as BillingCycle,
  category: "streaming" as SubCategory,
  startDate: new Date().toISOString().split("T")[0],
  paymentMethod: "Bkash",
  autoRenew: true,
  alertBefore: 3,
  usageRating: 3,
};

export default function Subscriptions() {
  const { lang } = useLang();
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const now = Date.now();
    return [
      {
        _id: "1",
        name: "Netflix",
        amount: 800,
        billingCycle: "monthly",
        category: "streaming",
        startDate: now - 90 * 24 * 60 * 60 * 1000,
        nextRenewal: now + 5 * 24 * 60 * 60 * 1000,
        paymentMethod: "Credit Card",
        autoRenew: true,
        alertBefore: 3,
        usageRating: 4,
        status: "active",
      },
      {
        _id: "2",
        name: "Spotify",
        amount: 200,
        billingCycle: "monthly",
        category: "streaming",
        startDate: now - 60 * 24 * 60 * 60 * 1000,
        nextRenewal: now + 12 * 24 * 60 * 60 * 1000,
        paymentMethod: "Bkash",
        autoRenew: true,
        alertBefore: 1,
        usageRating: 5,
        status: "active",
      },
      {
        _id: "3",
        name: "ChatGPT Plus",
        amount: 4500,
        billingCycle: "monthly",
        category: "software",
        startDate: now - 120 * 24 * 60 * 60 * 1000,
        nextRenewal: now + 20 * 24 * 60 * 60 * 1000,
        paymentMethod: "Credit Card",
        autoRenew: true,
        alertBefore: 7,
        usageRating: 5,
        status: "active",
      },
      {
        _id: "4",
        name: "Adobe Creative Cloud",
        amount: 12000,
        billingCycle: "annual",
        category: "software",
        startDate: now - 200 * 24 * 60 * 60 * 1000,
        nextRenewal: now + 165 * 24 * 60 * 60 * 1000,
        paymentMethod: "Credit Card",
        autoRenew: true,
        alertBefore: 30,
        usageRating: 2,
        status: "active",
      },
      {
        _id: "5",
        name: "Gym Membership",
        amount: 2500,
        billingCycle: "monthly",
        category: "fitness",
        startDate: now - 45 * 24 * 60 * 60 * 1000,
        nextRenewal: now + 2 * 24 * 60 * 60 * 1000,
        paymentMethod: "Nagad",
        autoRenew: false,
        alertBefore: 7,
        usageRating: 1,
        status: "active",
      },
      {
        _id: "6",
        name: "Old Subscription",
        amount: 500,
        billingCycle: "monthly",
        category: "other",
        startDate: now - 180 * 24 * 60 * 60 * 1000,
        nextRenewal: now - 10 * 24 * 60 * 60 * 1000,
        paymentMethod: "Bkash",
        autoRenew: false,
        alertBefore: 3,
        usageRating: 1,
        status: "cancelled",
        cancelledAt: now - 15 * 24 * 60 * 60 * 1000,
      },
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "active" | "cancelled" | "upcoming"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "cost" | "renewal">("renewal");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const stats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const cancelled = subscriptions.filter((s) => s.status === "cancelled");
    const totalMonthly = active.reduce(
      (sum, s) => sum + calculateMonthlyCost(s.amount, s.billingCycle),
      0,
    );
    const totalAnnual = totalMonthly * 12;
    const potentialSavings = active
      .filter((s) => s.usageRating <= 2)
      .reduce(
        (sum, s) => sum + calculateMonthlyCost(s.amount, s.billingCycle) * 12,
        0,
      );
    const upcoming = active.filter((s) => {
      const days = getDaysUntilRenewal(s.nextRenewal, now);
      return days >= 0 && days <= 30;
    });
    return {
      activeCount: active.length,
      cancelledCount: cancelled.length,
      totalMonthly,
      totalAnnual,
      potentialSavings,
      upcoming,
    };
  }, [subscriptions, now]);

  const filteredSubscriptions = useMemo(() => {
    let result = [...subscriptions];

    switch (filter) {
      case "active":
        result = result.filter((s) => s.status === "active");
        break;
      case "cancelled":
        result = result.filter((s) => s.status === "cancelled");
        break;
      case "upcoming":
        result = result.filter((s) => {
          const days = getDaysUntilRenewal(s.nextRenewal, now);
          return s.status === "active" && days >= 0 && days <= 30;
        });
        break;
    }

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "cost")
        return (
          calculateMonthlyCost(b.amount, b.billingCycle) -
          calculateMonthlyCost(a.amount, a.billingCycle)
        );
      return a.nextRenewal - b.nextRenewal;
    });

    return result;
  }, [subscriptions, filter, sortBy, now]);

  const categoryCosts = useMemo(() => {
    const costs: Record<string, number> = {};
    subscriptions
      .filter((s) => s.status === "active")
      .forEach((s) => {
        costs[s.category] =
          (costs[s.category] || 0) +
          calculateMonthlyCost(s.amount, s.billingCycle);
      });
    return Object.entries(costs)
      .map(([cat, cost]) => ({
        category: cat as SubCategory,
        cost,
        percentage:
          stats.totalMonthly > 0 ? (cost / stats.totalMonthly) * 100 : 0,
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [subscriptions, stats.totalMonthly]);

  const handleAddOrUpdate = () => {
    const startTs = new Date(formData.startDate).getTime();
    const nextRenewal = calculateNextRenewal(startTs, formData.billingCycle);

    if (editingId) {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s._id === editingId
            ? {
                ...s,
                name: formData.name,
                amount: parseFloat(formData.amount) || 0,
                billingCycle: formData.billingCycle,
                category: formData.category,
                startDate: startTs,
                nextRenewal,
                paymentMethod: formData.paymentMethod,
                autoRenew: formData.autoRenew,
                alertBefore: formData.alertBefore,
                usageRating: formData.usageRating,
              }
            : s,
        ),
      );
      toastSuccess(t("subscriptions.updated", lang));
    } else {
      const newSub: Subscription = {
        _id: Date.now().toString(),
        name: formData.name,
        amount: parseFloat(formData.amount) || 0,
        billingCycle: formData.billingCycle,
        category: formData.category,
        startDate: startTs,
        nextRenewal,
        paymentMethod: formData.paymentMethod,
        autoRenew: formData.autoRenew,
        alertBefore: formData.alertBefore,
        usageRating: formData.usageRating,
        status: "active",
      };
      setSubscriptions((prev) => [...prev, newSub]);
      toastSuccess(t("subscriptions.added", lang));
    }

    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleEdit = (sub: Subscription) => {
    setFormData({
      name: sub.name,
      amount: sub.amount.toString(),
      billingCycle: sub.billingCycle,
      category: sub.category,
      startDate: new Date(sub.startDate).toISOString().split("T")[0],
      paymentMethod: sub.paymentMethod,
      autoRenew: sub.autoRenew,
      alertBefore: sub.alertBefore,
      usageRating: sub.usageRating,
    });
    setEditingId(sub._id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s._id !== id));
    setDeleteConfirmId(null);
    toastSuccess(t("subscriptions.removed", lang));
  };

  const handleToggleCancel = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s._id !== id) return s;
        if (s.status === "active") {
          toastInfo(t("subscriptions.cancelledSuccess", lang));
          return {
            ...s,
            status: "cancelled" as const,
            cancelledAt: Date.now(),
          };
        }
        toastSuccess(t("subscriptions.reactivated", lang));
        return { ...s, status: "active" as const, cancelledAt: undefined };
      }),
    );
  };

  const handleUsageRating = (id: string, rating: number) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, usageRating: rating } : s)),
    );
  };

  const handleExport = () => {
    const rows = [
      [
        "Name",
        "Amount",
        "Cycle",
        "Category",
        "Monthly Cost",
        "Status",
        "Payment Method",
        "Usage",
      ],
      ...subscriptions.map((s) => [
        s.name,
        s.amount.toString(),
        s.billingCycle,
        s.category,
        calculateMonthlyCost(s.amount, s.billingCycle).toFixed(2),
        s.status,
        s.paymentMethod,
        s.usageRating.toString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriptions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toastInfo(lang === "bn" ? "এক্সপোর্ট সম্পন্ন!" : "Export complete!");
  };

  return (
    <motion.div
      className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t("subscriptions.title", lang)}
        </h1>
        <p className="text-white/60 mb-8">
          {lang === "bn"
            ? "আপনার সব সাবস্ক্রিপশন এক জায়গায় ট্র্যাক করুন"
            : "Track all your subscriptions in one place"}
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-white/60 text-sm">
              {t("subscriptions.totalMonthly", lang)}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">
            {lang === "bn"
              ? `৳${stats.totalMonthly.toLocaleString()}`
              : `৳${stats.totalMonthly.toLocaleString()}`}
          </p>
          <p className="text-xs text-white/40 mt-1">
            {lang === "bn"
              ? `বার্ষিক: ৳${stats.totalAnnual.toLocaleString()}`
              : `Annual: ৳${stats.totalAnnual.toLocaleString()}`}
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-white/60 text-sm">
              {t("subscriptions.activeCount", lang)}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.activeCount}</p>
          <p className="text-xs text-white/40 mt-1">
            {stats.cancelledCount}{" "}
            {t("subscriptions.cancelled", lang).toLowerCase()}
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <span className="text-white/60 text-sm">
              {t("subscriptions.upcoming", lang)}
            </span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.upcoming.length}
          </p>
          <p className="text-xs text-white/40 mt-1">
            {t("subscriptions.upcomingDesc", lang)}
          </p>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-yellow-400" />
            <span className="text-white/60 text-sm">
              {t("subscriptions.potentialSavings", lang)}
            </span>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            {lang === "bn"
              ? `৳${stats.potentialSavings.toLocaleString()}`
              : `৳${stats.potentialSavings.toLocaleString()}`}
          </p>
          <p className="text-xs text-white/40 mt-1">
            {t("subscriptions.potentialSavingsDesc", lang)}
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => {
            setFormData(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          {t("subscriptions.add", lang)}
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-white/80 hover:text-white transition"
        >
          <Download className="w-4 h-4" />
          {t("subscriptions.export", lang)}
        </button>
      </motion.div>

      {/* Upcoming Renewals */}
      {stats.upcoming.length > 0 && (
        <motion.div variants={fadeUp} className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">
              {t("subscriptions.upcoming", lang)}
            </h2>
            <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full">
              {stats.upcoming.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.upcoming.map((sub) => {
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
                        <span className="font-medium text-white">
                          {sub.name}
                        </span>
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
      )}

      {/* Cost by Category */}
      {categoryCosts.length > 0 && (
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
                      {t(
                        `subscriptions.${item.category}` as TranslationKey,
                        lang,
                      )}
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
      )}

      {/* Filters */}
      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        <div className="flex gap-2">
          {(["all", "active", "cancelled", "upcoming"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "glass text-white/60 hover:text-white"
              }`}
            >
              {t(`subscriptions.${f}` as TranslationKey, lang)}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-white/10 text-white/80 text-sm rounded-xl px-4 py-2 border border-white/10 focus:outline-none focus:border-purple-500/50"
        >
          <option value="renewal">
            {t("subscriptions.sortByRenewal", lang)}
          </option>
          <option value="cost">{t("subscriptions.sortByCost", lang)}</option>
          <option value="name">{t("subscriptions.sortByName", lang)}</option>
        </select>
      </motion.div>

      {/* Subscriptions List */}
      <motion.div variants={fadeUp} className="space-y-3 mb-8">
        <AnimatePresence mode="popLayout">
          {filteredSubscriptions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t("subscriptions.noSubscriptions", lang)}
              description={t("subscriptions.noSubscriptionsDesc", lang)}
              action={{
                label: t("subscriptions.add", lang),
                onClick: () => {
                  setFormData(emptyForm);
                  setEditingId(null);
                  setShowForm(true);
                },
              }}
            />
          ) : (
            filteredSubscriptions.map((sub) => {
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
                  className={`glass rounded-2xl p-5 transition ${
                    sub.status === "cancelled" ? "opacity-60" : ""
                  } ${isExpired ? "border-red-500/30 border" : ""}`}
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

                        {/* Usage Rating */}
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleUsageRating(sub._id, star)}
                              className="transition hover:scale-110"
                              title={
                                lang === "bn" ? `${star} রেটিং` : `Rate ${star}`
                              }
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= sub.usageRating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-white/20"
                                }`}
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
                        onClick={() => handleEdit(sub)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                        title={t("subscriptions.edit", lang)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleCancel(sub._id)}
                        className={`p-2 rounded-lg transition ${
                          sub.status === "active"
                            ? "hover:bg-red-500/10 text-white/60 hover:text-red-400"
                            : "hover:bg-green-500/10 text-white/60 hover:text-green-400"
                        }`}
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
                        onClick={() => setDeleteConfirmId(sub._id)}
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

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
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
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
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
                      setFormData((f) => ({ ...f, name: e.target.value }))
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
                        setFormData((f) => ({ ...f, amount: e.target.value }))
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
                        setFormData((f) => ({
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
                        setFormData((f) => ({
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
                      <option value="food">
                        {t("subscriptions.food", lang)}
                      </option>
                      <option value="transport">
                        {t("subscriptions.transport", lang)}
                      </option>
                      <option value="fitness">
                        {t("subscriptions.fitness", lang)}
                      </option>
                      <option value="education">
                        {t("subscriptions.education", lang)}
                      </option>
                      <option value="other">
                        {t("subscriptions.other", lang)}
                      </option>
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
                        setFormData((f) => ({
                          ...f,
                          startDate: e.target.value,
                        }))
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
                        setFormData((f) => ({
                          ...f,
                          paymentMethod: e.target.value,
                        }))
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
                        setFormData((f) => ({
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
                        onClick={() =>
                          setFormData((f) => ({ ...f, usageRating: star }))
                        }
                        className="transition hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formData.usageRating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-white/20"
                          }`}
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
                      setFormData((f) => ({ ...f, autoRenew: !f.autoRenew }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      formData.autoRenew ? "bg-purple-500" : "bg-white/20"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        formData.autoRenew ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="flex-1 py-3 rounded-xl glass text-white/80 hover:text-white transition font-medium"
                  >
                    {t("subscriptions.cancel", lang)}
                  </button>
                  <button
                    onClick={handleAddOrUpdate}
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
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId);
        }}
        title={t("subscriptions.delete", lang)}
        description={
          lang === "bn"
            ? "আপনি কি নিশ্চিত এই সাবস্ক্রিপশনটি মুছে ফেলতে চান?"
            : "Are you sure you want to delete this subscription?"
        }
      />
    </motion.div>
  );
}
