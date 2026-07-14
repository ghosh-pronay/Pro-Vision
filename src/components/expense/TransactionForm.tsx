import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, X, Calculator } from "lucide-react"
import { t, type Lang } from "@/i18n/translations"
import FloatingCalculator from "@/components/finance/FloatingCalculator"
import type { Wallet as WalletType } from "@/types/wallet"
import {
  CATEGORY_ICONS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "./constants"

interface TransactionFormProps {
  lang: Lang
  activeTab: "income" | "expense" | "transfer"
  visibleWallets: WalletType[]
  incomeWallet: string
  setIncomeWallet: (v: string) => void
  expenseWallet: string
  setExpenseWallet: (v: string) => void
  setFromWallet: (v: string) => void
  setToWallet: (v: string) => void
  amount: string
  setAmount: (v: string) => void
  category: string
  setCategory: (v: string) => void
  description: string
  setDescription: (v: string) => void
  date: string
  setDate: (v: string) => void
  showCalc: boolean
  setShowCalc: (v: boolean) => void
  effectiveIncomeWallet: string
  effectiveExpenseWallet: string
  effectiveFromWallet: string
  effectiveToWallet: string
  transferFee: number
  isAddingIncome: boolean
  isAddingExpense: boolean
  isTransferring: boolean
  onClose: () => void
  onSubmitIncome: () => void
  onSubmitExpense: () => void
  onSubmitTransfer: () => void
}

const sanitizeAmount = (val: string) => {
  const cleaned = val.replace(/[^0-9.]/g, "")
  const parts = cleaned.split(".")
  if (parts.length > 2) return cleaned.split(".")[0] + "." + parts[1]
  if (parts[1] && parts[1].length > 2)
    return parts[0] + "." + parts[1].slice(0, 2)
  return cleaned
}

export function TransactionForm({
  lang,
  activeTab,
  visibleWallets,
  incomeWallet,
  setIncomeWallet,
  expenseWallet,
  setExpenseWallet,
  setFromWallet,
  setToWallet,
  amount,
  setAmount,
  category,
  setCategory,
  description,
  setDescription,
  date,
  setDate,
  showCalc,
  setShowCalc,
  effectiveIncomeWallet,
  effectiveExpenseWallet,
  effectiveFromWallet,
  effectiveToWallet,
  transferFee,
  isAddingIncome,
  isAddingExpense,
  isTransferring,
  onClose,
  onSubmitIncome,
  onSubmitExpense,
  onSubmitTransfer,
}: TransactionFormProps) {
  const walletOptions = visibleWallets.map((w: WalletType) => (
    <option key={w._id} value={w._id}>
      {lang === "bn" && w.nameBn ? w.nameBn : w.name} — ৳
      {w.balance.toLocaleString()}
      {w.isDefault ? " ★" : ""}
    </option>
  ))

  const calcButton = (
    <button
      type="button"
      onClick={() => setShowCalc(!showCalc)}
      className={`p-2.5 rounded-xl transition-all ${showCalc ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}
    >
      <Calculator className="size-4" />
    </button>
  )

  const calcOverlay = (
    <AnimatePresence>
      {showCalc && (
        <FloatingCalculator
          onResult={(val) => {
            setAmount(val)
            setShowCalc(false)
          }}
          onClose={() => setShowCalc(false)}
        />
      )}
    </AnimatePresence>
  )

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="glass-strong rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {activeTab === "income"
              ? t("expense.addIncome", lang)
              : activeTab === "expense"
                ? t("expense.addExpense", lang)
                : t("expense.fundTransfer", lang)}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {activeTab === "income" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.selectWallet", lang)}
              </label>
              <select
                value={effectiveIncomeWallet}
                onChange={(e) => setIncomeWallet(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
              >
                {walletOptions}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.amount", lang)}
              </label>
              <div className="relative flex items-center gap-1">
                <input
                  value={amount}
                  onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && onSubmitIncome()}
                  placeholder="৳ 0"
                  type="number"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  autoFocus
                />
                {calcButton}
                {calcOverlay}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.category", lang)}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
              >
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat] ?? "📦"} {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.description", lang)}
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("expense.optionalDescription", lang)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.date", lang)}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
              />
            </div>

            <button
              onClick={onSubmitIncome}
              disabled={!incomeWallet || !amount || isAddingIncome}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, var(--pv-green), #16a34a)",
              }}
            >
              {isAddingIncome
                ? t("expense.adding", lang)
                : t("expense.addIncome", lang)}
            </button>
          </div>
        )}

        {activeTab === "expense" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.selectWallet", lang)}
              </label>
              <select
                value={effectiveExpenseWallet}
                onChange={(e) => setExpenseWallet(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
              >
                {walletOptions}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.amount", lang)}
              </label>
              <div className="relative flex items-center gap-1">
                <input
                  value={amount}
                  onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && onSubmitExpense()}
                  placeholder="৳ 0"
                  type="number"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  autoFocus
                />
                {calcButton}
                {calcOverlay}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.category", lang)}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat] ?? "📦"} {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.description", lang)}
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("expense.optionalDescription", lang)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.date", lang)}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
              />
            </div>

            <button
              onClick={onSubmitExpense}
              disabled={!expenseWallet || !amount || isAddingExpense}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, var(--pv-red), #dc2626)",
              }}
            >
              {isAddingExpense
                ? t("expense.adding", lang)
                : t("expense.addExpense", lang)}
            </button>
          </div>
        )}

        {activeTab === "transfer" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.fromWallet", lang)}
              </label>
              <select
                value={effectiveFromWallet}
                onChange={(e) => {
                  setFromWallet(e.target.value)
                  if (e.target.value === effectiveToWallet) {
                    const other = visibleWallets.find(
                      (w: WalletType) => w._id !== e.target.value,
                    )
                    if (other) setToWallet(other._id)
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
              >
                {visibleWallets.map((w: WalletType) => (
                  <option
                    key={w._id}
                    value={w._id}
                    disabled={w._id === effectiveToWallet}
                  >
                    {lang === "bn" && w.nameBn ? w.nameBn : w.name} — ৳
                    {w.balance.toLocaleString()}
                    {w.isDefault ? " ★" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <div className="p-2 rounded-full bg-foreground/5">
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.toWallet", lang)}
              </label>
              <select
                value={effectiveToWallet}
                onChange={(e) => setToWallet(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
              >
                {visibleWallets.map((w: WalletType) => (
                  <option
                    key={w._id}
                    value={w._id}
                    disabled={w._id === effectiveFromWallet}
                  >
                    {lang === "bn" && w.nameBn ? w.nameBn : w.name} — ৳
                    {w.balance.toLocaleString()}
                    {w.isDefault ? " ★" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.amount", lang)}
              </label>
              <input
                value={amount}
                onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && onSubmitTransfer()}
                placeholder="৳ 0"
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>

            {transferFee > 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--pv-orange)]/10">
                <span className="text-xs text-[var(--pv-orange)]">
                  {t("expense.transferFee", lang)}: ৳{transferFee.toFixed(2)}
                </span>
              </div>
            )}

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                {t("expense.description", lang)}
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("expense.optionalDescription", lang)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>

            <button
              onClick={onSubmitTransfer}
              disabled={
                !effectiveFromWallet ||
                !effectiveToWallet ||
                effectiveFromWallet === effectiveToWallet ||
                !amount ||
                isTransferring
              }
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, var(--pv-blue), #2563eb)",
              }}
            >
              {isTransferring
                ? t("expense.transferring", lang)
                : t("expense.transfer", lang)}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
