import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight, Wallet } from "lucide-react";
import { t, type Lang } from "@/i18n/translations";
import { fadeUp, toBanglaNumber } from "./constants";

interface ExpenseStatsProps {
  lang: Lang;
  stats: { totalIncome: number; totalExpense: number } | undefined;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export function ExpenseStats({
  lang,
  stats,
  totalIncome,
  totalExpense,
  netBalance,
}: ExpenseStatsProps) {
  return (
    <motion.div
      custom={1}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="glass-strong rounded-2xl p-6 glass-accent-top"
    >
      {stats === undefined ? (
        <div className="grid grid-cols-3 gap-4 text-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl p-3 animate-pulse">
              <div className="h-3 bg-foreground/10 rounded w-16 mx-auto mb-2" />
              <div className="h-5 bg-foreground/10 rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ArrowDown className="size-4 text-[var(--pv-green)]" />
              <span className="text-xs text-muted-foreground">
                {t("expense.totalIncome", lang)}
              </span>
            </div>
            <div className="text-lg font-bold text-[var(--pv-green)]">
              ৳
              {lang === "bn"
                ? toBanglaNumber(totalIncome)
                : totalIncome.toLocaleString()}
            </div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <ArrowUpRight className="size-4 text-[var(--pv-red)]" />
              <span className="text-xs text-muted-foreground">
                {t("expense.totalExpense", lang)}
              </span>
            </div>
            <div className="text-lg font-bold text-[var(--pv-red)]">
              ৳
              {lang === "bn"
                ? toBanglaNumber(totalExpense)
                : totalExpense.toLocaleString()}
            </div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Wallet className="size-4 text-[var(--pv-blue)]" />
              <span className="text-xs text-muted-foreground">
                {t("expense.netBalance", lang)}
              </span>
            </div>
            <div className="text-lg font-bold text-[var(--pv-blue)]">
              ৳
              {lang === "bn"
                ? toBanglaNumber(netBalance)
                : netBalance.toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
