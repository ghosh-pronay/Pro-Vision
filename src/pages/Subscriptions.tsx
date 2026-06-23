import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { useState, useMemo, useEffect } from "react";
import { Plus, Download } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toastSuccess, toastInfo } from "@/lib/toast-helpers";
import {
  SummaryCards,
  UpcomingRenewals,
  CostBreakdown,
  SubscriptionList,
  SubscriptionForm,
} from "@/components/subscriptions";
import type { Subscription, SubCategory } from "@/components/subscriptions";
import {
  calculateMonthlyCost,
  calculateNextRenewal,
  getDaysUntilRenewal,
  emptyForm,
  fadeUp,
  stagger,
} from "@/components/subscriptions";

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

      <SummaryCards
        lang={lang}
        totalMonthly={stats.totalMonthly}
        totalAnnual={stats.totalAnnual}
        activeCount={stats.activeCount}
        cancelledCount={stats.cancelledCount}
        upcomingCount={stats.upcoming.length}
        potentialSavings={stats.potentialSavings}
      />

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

      <UpcomingRenewals lang={lang} upcoming={stats.upcoming} now={now} />
      <CostBreakdown lang={lang} categoryCosts={categoryCosts} />

      <motion.div
        variants={fadeUp}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        <div className="flex gap-2">
          {(["all", "active", "cancelled", "upcoming"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === f ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "glass text-white/60 hover:text-white"}`}
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

      <SubscriptionList
        lang={lang}
        now={now}
        filtered={filteredSubscriptions}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onToggleCancel={handleToggleCancel}
        onRate={handleUsageRating}
        onAddClick={() => {
          setFormData(emptyForm);
          setEditingId(null);
          setShowForm(true);
        }}
      />

      {showForm && (
        <SubscriptionForm
          lang={lang}
          editingId={editingId}
          formData={formData}
          onChange={setFormData}
          onSubmit={handleAddOrUpdate}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteConfirmId}
        onCancel={() => setDeleteConfirmId(null)}
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
