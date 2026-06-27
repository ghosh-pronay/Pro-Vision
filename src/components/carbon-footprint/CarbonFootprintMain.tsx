import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Plus, Target, Share2 } from "lucide-react";
import { CarbonSummary } from "./CarbonSummary";
import {
  fadeUp,
  AVG_BANGLADESHI_ANNUAL_TONS,
  getItemsForCategory,
} from "./types";
import type { CarbonLog } from "./types";
import { useState } from "react";
import { generateId } from "@/lib/utils";

interface CarbonFootprintMainProps {
  lang: string;
  todayTotal: number;
  comparisonPercent: number;
  yesterdayTotal: number;
  treesNeeded: number;
  todayLogs: CarbonLog[];
  selectedCategory: "transport" | "food" | "energy" | "shopping";
  onSetSelectedCategory: (
    cat: "transport" | "food" | "energy" | "shopping",
  ) => void;
  onAddLog: (log: CarbonLog) => void;
  onDeleteLog: (id: string) => void;
  monthlyGoal: number;
  onSetMonthlyGoal: (goal: number) => void;
  onShare: () => void;
}

export function CarbonFootprintMain({
  lang,
  todayTotal,
  comparisonPercent,
  yesterdayTotal,
  treesNeeded,
  todayLogs,
  selectedCategory,
  onSetSelectedCategory,
  onAddLog,
  onDeleteLog,
  monthlyGoal,
  onSetMonthlyGoal,
  onShare,
}: CarbonFootprintMainProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [formAmount, setFormAmount] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formSubCategory, setFormSubCategory] = useState("");

  const t = (en: string, bn: string) => (lang === "bn" ? bn : en);

  const categoryConfig = [
    {
      key: "transport",
      color: "from-blue-500 to-cyan-500",
      textColor: "text-blue-500",
      label: t("Transport", "পরিবহন"),
    },
    {
      key: "food",
      color: "from-orange-500 to-red-500",
      textColor: "text-orange-500",
      label: t("Food", "খাদ্য"),
    },
    {
      key: "energy",
      color: "from-yellow-500 to-amber-500",
      textColor: "text-yellow-500",
      label: t("Energy", "শক্তি"),
    },
    {
      key: "shopping",
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-500",
      label: t("Shopping", "শপিং"),
    },
  ];

  const handleAddLog = () => {
    const amount = parseFloat(formAmount);
    if (!amount || amount <= 0) return;
    const items = getItemsForCategory(selectedCategory);
    const item = items.find((i) => i.key === formSubCategory);
    if (!item) return;
    const carbonKg = amount * item.factor;
    const newLog: CarbonLog = {
      id: generateId(),
      category: selectedCategory,
      subCategory: formSubCategory,
      amount,
      unit: item.unit,
      carbonKg,
      date: Date.now(),
      note: formNote.trim() || undefined,
    };
    onAddLog(newLog);
    setFormAmount("");
    setFormNote("");
    setFormSubCategory("");
    setShowAddModal(false);
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="space-y-6 max-w-5xl mx-auto"
      >
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-trend flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-500" />
              {t("Carbon Footprint Tracker", "কার্বন ফুটপ্রিন্ট ট্র্যাকার")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t(
                "Track your daily carbon emissions and reduce your impact",
                "আপনার দৈনিক কার্বন নির্গমন ট্র্যাক করুন এবং প্রভাব কমান",
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGoalModal(true)}
              className="cursor-pointer flex items-center gap-2 rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
            >
              <Target className="h-4 w-4" />
              {t("Goal", "লক্ষ্য")}
            </button>
            <button
              onClick={onShare}
              className="cursor-pointer flex items-center gap-2 rounded-xl border border-foreground/10 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              {t("Share", "শেয়ার")}
            </button>
            <button
              onClick={() => {
                setFormAmount("");
                setFormNote("");
                setFormSubCategory("");
                setShowAddModal(true);
              }}
              className="cursor-pointer flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t("Log Activity", "কার্যকলাপ লগ")}
            </button>
          </div>
        </motion.div>

        <CarbonSummary
          lang={lang}
          todayTotal={todayTotal}
          comparisonPercent={comparisonPercent}
          yesterdayTotal={yesterdayTotal}
          treesNeeded={treesNeeded}
        />

        <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-lg mb-4">
            {t("Today's Log", "আজকের লগ")} ({todayLogs.length})
          </h3>
          {todayLogs.length === 0 ? (
            <div className="text-center py-8">
              <Leaf className="h-12 w-12 text-green-500/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {t(
                  "No activities logged today. Start tracking!",
                  "আজ কোনো কার্যকলাপ লগ হয়নি। ট্র্যাকিং শুরু করুন!",
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayLogs.map((log) => {
                const items = getItemsForCategory(log.category);
                const item = items.find((i) => i.key === log.subCategory);
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-xl border border-foreground/10 p-3 hover:bg-foreground/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item?.icon || "📊"}</span>
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {log.subCategory}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.amount} {log.unit}
                          {log.note ? ` · ${log.note}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-green-500">
                        {log.carbonKg.toFixed(2)} kg
                      </span>
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        className="cursor-pointer p-1 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-semibold text-lg mb-4">
                {t("Log Activity", "কার্যকলাপ লগ")}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Category", "বিভাগ")}
                  </label>
                  <div className="flex gap-2">
                    {categoryConfig.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => {
                          onSetSelectedCategory(
                            cat.key as typeof selectedCategory,
                          );
                          setFormSubCategory("");
                        }}
                        className={`cursor-pointer flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          selectedCategory === cat.key
                            ? `bg-gradient-to-r ${cat.color} text-white`
                            : "bg-foreground/5 hover:bg-foreground/10"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Type", "ধরন")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {getItemsForCategory(selectedCategory).map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setFormSubCategory(item.key)}
                        className={`cursor-pointer rounded-xl p-3 text-center transition-all ${
                          formSubCategory === item.key
                            ? "bg-green-500/20 border-2 border-green-500"
                            : "bg-foreground/5 border-2 border-transparent hover:bg-foreground/10"
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <p className="text-xs font-medium mt-1 capitalize">
                          {item.key}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Amount (", "পরিমাণ (")}
                    {getItemsForCategory(selectedCategory).find(
                      (i) => i.key === formSubCategory,
                    )?.unit || ""}
                    {")"}
                  </label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder={t("Enter amount", "পরিমাণ লিখুন")}
                    className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Note (optional)", "নোট (ঐচ্ছিক)")}
                  </label>
                  <input
                    type="text"
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
                    placeholder={t(
                      "e.g., commute to work",
                      "যেমন, কাজে যাওয়া",
                    )}
                    className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <button
                  onClick={handleAddLog}
                  disabled={!formAmount || !formSubCategory}
                  className="cursor-pointer w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("Add Log", "লগ যোগ করুন")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowGoalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-semibold text-lg mb-4">
                {t("Set Monthly Goal", "মাসিক লক্ষ্য নির্ধারণ")}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t("Monthly CO₂ Goal (kg)", "মাসিক CO₂ লক্ষ্য (কেজি)")}
                  </label>
                  <input
                    type="number"
                    value={monthlyGoal}
                    onChange={(e) =>
                      onSetMonthlyGoal(parseInt(e.target.value) || 50)
                    }
                    className="w-full rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(
                    "Average Bangladeshi produces",
                    "গড় বাংলাদেশি উৎপাদন করে",
                  )}{" "}
                  {(AVG_BANGLADESHI_ANNUAL_TONS * 1000) / 12} kg{" "}
                  {t("CO₂ per month", "CO₂ প্রতি মাসে")}
                </p>
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="cursor-pointer w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  {t("Save Goal", "লক্ষ্য সংরক্ষণ")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { Trash2 } from "lucide-react";
