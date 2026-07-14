import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { t, type Lang, type TranslationKey } from "@/i18n/translations"
import { fadeUp, CATEGORY_ICONS, type ExpenseTransaction } from "./constants"

interface TransactionListProps {
  lang: Lang
  txFilter: "all" | "income" | "expense" | "transfer"
  setTxFilter: (f: "all" | "income" | "expense" | "transfer") => void
  filtered: ExpenseTransaction[]
  onDeleteTarget: (id: string) => void
  getWalletName: (id: string) => string
  getWalletColor: (id: string) => string
  formatDate: (ts: number) => string
}

const FILTERS = ["all", "income", "expense", "transfer"] as const

export function TransactionList({
  lang,
  txFilter,
  setTxFilter,
  filtered,
  onDeleteTarget,
  getWalletName,
  getWalletColor,
  formatDate,
}: TransactionListProps) {
  return (
    <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {t("expense.recentTransactions", lang)}
        </h3>
        <div className="flex glass rounded-xl overflow-hidden">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTxFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${txFilter === f ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]" : "text-muted-foreground hover:text-foreground hover-tab"}`}
            >
              {t(`expense.tab.${f}` as TranslationKey, lang)}
            </button>
          ))}
        </div>
      </div>
      <div className="glass rounded-2xl divide-y divide-border/20">
        {filtered.length === 0 && (
          <div className="p-8 text-center">
            <span className="text-3xl mb-2 block">💰</span>
            <p className="text-sm text-muted-foreground">
              {t("expense.emptyTransactions", lang)}
            </p>
          </div>
        )}
        {filtered.map((tx: ExpenseTransaction) => (
          <div
            key={tx._id}
            className="flex items-center gap-3 px-4 py-3 group hover-row hover-orange"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: getWalletColor(tx.walletId) }}
            >
              {CATEGORY_ICONS[tx.category]?.slice(0, 1) || "📦"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate">
                  {tx.description || tx.category}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    tx.type === "income"
                      ? "bg-[var(--pv-green)]/10 text-[var(--pv-green)]"
                      : "bg-[var(--pv-red)]/10 text-[var(--pv-red)]"
                  }`}
                >
                  {tx.type === "income"
                    ? t("expense.tab.income", lang)
                    : t("expense.tab.expense", lang)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {getWalletName(tx.walletId)} · {tx.category} ·{" "}
                {formatDate(tx.date)}
              </div>
            </div>
            <div
              className={`text-sm font-bold ${tx.type === "income" ? "text-[var(--pv-green)]" : "text-[var(--pv-red)]"}`}
            >
              {tx.type === "income" ? "+" : "-"}৳{tx.amount.toLocaleString()}
            </div>
            <button
              onClick={() => onDeleteTarget(tx._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
              aria-label="Delete transaction"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
