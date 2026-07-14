import { Trash2 } from "lucide-react"
import { t, type TranslationKey, type Lang } from "@/i18n/translations"
import type { ExpenseTransaction } from "./types"
import { CATEGORY_ICONS } from "./types"
import type { Wallet as WalletType } from "@/types/wallet"

interface Props {
  lang: Lang
  filtered: ExpenseTransaction[]
  wallets: WalletType[]
  txFilter: "all" | "income" | "expense" | "transfer"
  onFilterChange: (f: "all" | "income" | "expense" | "transfer") => void
  onDelete: (id: string) => void
}

export function TransactionsList({
  lang,
  filtered,
  wallets,
  txFilter,
  onFilterChange,
  onDelete,
}: Props) {
  const t_ = (key: string) => t(key as TranslationKey, lang)

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getWalletName = (walletId: string) => {
    const w = wallets.find((w: WalletType) => w._id === walletId)
    return w ? (lang === "bn" && w.nameBn ? w.nameBn : w.name) : ""
  }

  const getWalletIcon = (walletId: string) => {
    const w = wallets.find((w: WalletType) => w._id === walletId)
    return w?.color || "#6b7280"
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {t_("expense.recentTransactions")}
        </h3>
        <div className="flex glass rounded-xl overflow-hidden">
          {(["all", "income", "expense", "transfer"] as const).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1.5 text-xs font-medium transition-all ${txFilter === f ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]" : "text-muted-foreground hover:text-foreground hover-tab"}`}
            >
              {t_(`expense.tab.${f}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="glass rounded-2xl divide-y divide-border/20">
        {filtered.length === 0 && (
          <div className="p-8 text-center">
            <span className="text-3xl mb-2 block">💰</span>
            <p className="text-sm text-muted-foreground">
              {t_("expense.emptyTransactions")}
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
              style={{ backgroundColor: getWalletIcon(tx.walletId) }}
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
                    ? t_("expense.tab.income")
                    : t_("expense.tab.expense")}
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
              onClick={() => onDelete(tx._id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
              aria-label="Delete transaction"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
