import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { t } from "@/i18n/translations"
import { useState, useMemo } from "react"
import { Repeat, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toastSuccess, toastError } from "@/lib/toast-helpers"
import { AddWalletModal } from "@/components/wallet/AddWalletModal"
import { WalletForm } from "@/components/wallet/WalletForm"
import type { Wallet as WalletType } from "@/types/wallet"
import {
  ExpenseStats,
  TransactionForm,
  TransactionList,
  WalletManager,
} from "@/components/expense"
import type { ExpenseTransaction } from "@/components/expense"

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Expense() {
  const { lang } = useLang()

  const transactions = (useQuery(api.transactions.list) ?? []) as any[]
  const wallets = (useQuery(api.wallets.list) ?? []) as any[]
  const stats = useQuery(api.transactions.stats) as any
  const createTx = useMutation(api.transactions.create, "transactions")
  const removeTx = useMutation(api.transactions.remove, "transactions")
  const createWallet = useMutation(api.wallets.create, "wallets")
  const updateWallet = useMutation(api.wallets.update, "wallets")
  const removeWallet = useMutation(api.wallets.remove, "wallets")

  const [activeTab, setActiveTab] = useState<"income" | "expense" | "transfer">(
    "income",
  )
  const [showForm, setShowForm] = useState(false)
  const [showCalc, setShowCalc] = useState(false)

  const [incomeWallet, setIncomeWallet] = useState("")
  const [expenseWallet, setExpenseWallet] = useState("")
  const [fromWallet, setFromWallet] = useState("")
  const [toWallet, setToWallet] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [txFilter, setTxFilter] = useState<
    "all" | "income" | "expense" | "transfer"
  >("all")

  const [isAddingIncome, setIsAddingIncome] = useState(false)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const [showAddWalletModal, setShowAddWalletModal] = useState(false)
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null)
  const [deleteWalletId, setDeleteWalletId] = useState<string | null>(null)

  const visibleWallets = useMemo(
    () => wallets.filter((w: WalletType) => !w.isHidden),
    [wallets],
  )

  const defaultWallet = useMemo(
    () =>
      visibleWallets.find((w: WalletType) => w.isDefault) ?? visibleWallets[0],
    [visibleWallets],
  )

  const effectiveIncomeWallet = useMemo(
    () => incomeWallet || defaultWallet?._id || "",
    [incomeWallet, defaultWallet],
  )
  const effectiveExpenseWallet = useMemo(
    () => expenseWallet || defaultWallet?._id || "",
    [expenseWallet, defaultWallet],
  )
  const effectiveFromWallet = useMemo(
    () => fromWallet || defaultWallet?._id || "",
    [fromWallet, defaultWallet],
  )
  const secondWallet = useMemo(
    () =>
      visibleWallets.length > 1
        ? visibleWallets.find((w: WalletType) => w._id !== defaultWallet?._id)
        : undefined,
    [visibleWallets, defaultWallet],
  )
  const effectiveToWallet = useMemo(
    () => toWallet || secondWallet?._id || "",
    [toWallet, secondWallet],
  )

  const totalIncome = stats?.totalIncome ?? 0
  const totalExpense = stats?.totalExpense ?? 0
  const netBalance = totalIncome - totalExpense

  const filtered = useMemo(() => {
    const result = (transactions as ExpenseTransaction[]) || []
    if (txFilter !== "all") {
      if (txFilter === "transfer") {
        return result
          .filter((tx) => tx.type === "income" && tx.toWalletId)
          .slice(0, 10)
      }
      return result.filter((tx) => tx.type === txFilter).slice(0, 10)
    }
    return result.slice(0, 10)
  }, [transactions, txFilter])

  const handleAddIncome = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0 || !effectiveIncomeWallet) return
    setIsAddingIncome(true)
    try {
      await createTx({
        walletId: effectiveIncomeWallet,
        amount: amt,
        category: category || "Salary",
        type: "income",
        description: description || undefined,
        date: new Date(date).getTime(),
      })
      setAmount("")
      setDescription("")
      setCategory("")
      setShowForm(false)
      toastSuccess(lang === "bn" ? "আয় যোগ হয়েছে!" : "Income added!")
    } catch (error) {
      console.error("[Expense]", "Failed to add income", error)
      toastError(lang === "bn" ? "আয় যোগ করতে ব্যর্থ" : "Failed to add income")
    } finally {
      setIsAddingIncome(false)
    }
  }

  const handleAddExpense = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0 || !effectiveExpenseWallet) return
    setIsAddingExpense(true)
    try {
      await createTx({
        walletId: effectiveExpenseWallet,
        amount: amt,
        category: category || "Food & Dining",
        type: "expense",
        description: description || undefined,
        date: new Date(date).getTime(),
      })
      setAmount("")
      setDescription("")
      setCategory("")
      setShowForm(false)
      toastSuccess(lang === "bn" ? "খরচ যোগ হয়েছে!" : "Expense added!")
    } catch (e) {
      console.error("[Expense]", "Failed to add expense", e)
      toastError(
        lang === "bn" ? "খরচ যোগ করতে ব্যর্থ" : "Failed to add expense",
      )
    } finally {
      setIsAddingExpense(false)
    }
  }

  const transferFee = useMemo(() => {
    if (
      !effectiveFromWallet ||
      !effectiveToWallet ||
      effectiveFromWallet === effectiveToWallet
    )
      return 0
    const from = wallets.find(
      (w: WalletType) => w._id === effectiveFromWallet && !w.isHidden,
    )
    const to = wallets.find(
      (w: WalletType) => w._id === effectiveToWallet && !w.isHidden,
    )
    if (from && to && from.type !== to.type) {
      return parseFloat(amount || "0") * 0.01
    }
    return 0
  }, [effectiveFromWallet, effectiveToWallet, wallets, amount])

  const handleTransfer = async () => {
    const amt = parseFloat(amount)
    const totalAmount = amt + transferFee
    if (
      !amt ||
      amt <= 0 ||
      !effectiveFromWallet ||
      !effectiveToWallet ||
      effectiveFromWallet === effectiveToWallet
    )
      return
    setIsTransferring(true)
    try {
      await createTx({
        walletId: effectiveFromWallet,
        amount: totalAmount,
        category: "Transfer",
        type: "expense",
        description: description || undefined,
        date: new Date(date).getTime(),
        toWalletId: effectiveToWallet,
      })
      await createTx({
        walletId: effectiveToWallet,
        amount: amt,
        category: "Transfer",
        type: "income",
        description: description || undefined,
        date: new Date(date).getTime(),
        toWalletId: effectiveFromWallet,
      })
      setAmount("")
      setDescription("")
      setShowForm(false)
      toastSuccess(lang === "bn" ? "স্থানান্তর সম্পন্ন!" : "Transfer complete!")
    } catch (e) {
      console.error("[Expense]", "Failed to transfer", e)
      toastError(lang === "bn" ? "স্থানান্তর ব্যর্থ" : "Transfer failed")
    } finally {
      setIsTransferring(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeTx({ id })
      toastSuccess(
        lang === "bn" ? "লেনদেন মুছে ফেলা হয়েছে" : "Transaction deleted",
      )
    } catch (e) {
      console.error("[Expense]", "Failed to delete transaction", e)
      toastError(
        lang === "bn"
          ? "লেনদেন মুছে ফেলতে ব্যর্থ"
          : "Failed to delete transaction",
      )
    }
  }

  const handleAddWallet = async (
    data: Omit<WalletType, "_id" | "createdAt">,
  ) => {
    try {
      await createWallet({
        name: data.name,
        type: data.type,
        currency: data.currency,
        balance: data.balance,
        icon: data.icon,
        color: data.color,
        isDefault: data.isDefault,
      })
      setShowAddWalletModal(false)
      toastSuccess(lang === "bn" ? "ওয়ালেট যোগ হয়েছে" : "Wallet added")
    } catch (e) {
      console.error("[Expense]", "Failed to add wallet", e)
      toastError(
        lang === "bn" ? "ওয়ালেট যোগ করতে ব্যর্থ" : "Failed to add wallet",
      )
    }
  }

  const handleEditWallet = async (
    data: Omit<WalletType, "_id" | "createdAt">,
  ) => {
    if (!editingWallet) return
    try {
      await updateWallet({
        id: editingWallet._id,
        name: data.name,
        type: data.type,
        balance: data.balance,
        icon: data.icon,
        color: data.color,
        isDefault: data.isDefault,
      })
      setEditingWallet(null)
      toastSuccess(lang === "bn" ? "ওয়ালেট আপডেট হয়েছে" : "Wallet updated")
    } catch (e) {
      console.error("[Expense]", "Failed to update wallet", e)
      toastError(
        lang === "bn" ? "ওয়ালেট আপডেট করতে ব্যর্থ" : "Failed to update wallet",
      )
    }
  }

  const handleDeleteWallet = async (id: string) => {
    try {
      await removeWallet({ id })
      setDeleteWalletId(null)
      toastSuccess(
        lang === "bn" ? "ওয়ালেট মুছে ফেলা হয়েছে" : "Wallet deleted",
      )
    } catch (e) {
      console.error("[Expense]", "Failed to delete wallet", e)
      toastError(
        lang === "bn" ? "ওয়ালেট মুছে ফেলতে ব্যর্থ" : "Failed to delete wallet",
      )
    }
  }

  const handleSetDefault = async (wallet: WalletType) => {
    try {
      await updateWallet({ id: wallet._id, isDefault: true })
      toastSuccess(
        lang === "bn" ? "ডিফল্ট ওয়ালেট সেট হয়েছে" : "Default wallet set",
      )
    } catch (e) {
      console.error("[Expense]", "Failed to set default wallet", e)
      toastError(lang === "bn" ? "সেট করতে ব্যর্থ" : "Failed to set default")
    }
  }

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const todayDate = new Date().toLocaleDateString(
    lang === "bn" ? "bn-BD" : "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  )

  const getWalletName = (walletId: string) => {
    const w = wallets.find((w: WalletType) => w._id === walletId)
    return w ? (lang === "bn" && w.nameBn ? w.nameBn : w.name) : ""
  }

  const getWalletColor = (walletId: string) => {
    const w = wallets.find((w: WalletType) => w._id === walletId)
    return w?.color || "#6b7280"
  }

  const openIncomeForm = () => {
    setActiveTab("income")
    setShowForm(true)
    setCategory("Salary")
  }
  const openExpenseForm = () => {
    setActiveTab("expense")
    setShowForm(true)
    setCategory("Food & Dining")
  }
  const openTransferForm = () => {
    setActiveTab("transfer")
    setShowForm(true)
  }
  const closeForm = () => {
    setShowForm(false)
    setAmount("")
    setDescription("")
    setCategory("")
    setDate(new Date().toISOString().split("T")[0])
    setIncomeWallet("")
    setExpenseWallet("")
    setFromWallet("")
    setToWallet("")
  }

  if (visibleWallets.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Wallet className="size-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t("expense.createWallet", lang)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("expense.createWalletDesc", lang)}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-foreground">
          {lang === "bn" ? "ব্যয় ট্র্যাকার" : "Expense Tracker"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{todayDate}</p>
      </motion.div>

      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <button
          onClick={openIncomeForm}
          className="flex items-center gap-3 p-4 rounded-2xl glass transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ borderLeft: "3px solid var(--pv-green)" }}
        >
          <div className="p-2 rounded-xl bg-[var(--pv-green)]/10">
            <TrendingUp className="size-5 text-[var(--pv-green)]" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">
              {t("expense.addIncome", lang)}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("expense.addIncomeDesc", lang)}
            </div>
          </div>
        </button>
        <button
          onClick={openExpenseForm}
          className="flex items-center gap-3 p-4 rounded-2xl glass transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ borderLeft: "3px solid var(--pv-red)" }}
        >
          <div className="p-2 rounded-xl bg-[var(--pv-red)]/10">
            <TrendingDown className="size-5 text-[var(--pv-red)]" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">
              {t("expense.addExpense", lang)}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("expense.addExpenseDesc", lang)}
            </div>
          </div>
        </button>
        <button
          onClick={openTransferForm}
          className="flex items-center gap-3 p-4 rounded-2xl glass transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ borderLeft: "3px solid var(--pv-blue)" }}
        >
          <div className="p-2 rounded-xl bg-[var(--pv-blue)]/10">
            <Repeat className="size-5 text-[var(--pv-blue)]" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">
              {t("expense.fundTransfer", lang)}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("expense.transferDesc", lang)}
            </div>
          </div>
        </button>
      </motion.div>

      <ExpenseStats
        lang={lang}
        stats={stats}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netBalance={netBalance}
      />

      <AnimatePresence>
        {showForm && (
          <TransactionForm
            lang={lang}
            activeTab={activeTab}
            visibleWallets={visibleWallets}
            incomeWallet={incomeWallet}
            setIncomeWallet={setIncomeWallet}
            expenseWallet={expenseWallet}
            setExpenseWallet={setExpenseWallet}
            setFromWallet={setFromWallet}
            setToWallet={setToWallet}
            amount={amount}
            setAmount={setAmount}
            category={category}
            setCategory={setCategory}
            description={description}
            setDescription={setDescription}
            date={date}
            setDate={setDate}
            showCalc={showCalc}
            setShowCalc={setShowCalc}
            effectiveIncomeWallet={effectiveIncomeWallet}
            effectiveExpenseWallet={effectiveExpenseWallet}
            effectiveFromWallet={effectiveFromWallet}
            effectiveToWallet={effectiveToWallet}
            transferFee={transferFee}
            isAddingIncome={isAddingIncome}
            isAddingExpense={isAddingExpense}
            isTransferring={isTransferring}
            onClose={closeForm}
            onSubmitIncome={handleAddIncome}
            onSubmitExpense={handleAddExpense}
            onSubmitTransfer={handleTransfer}
          />
        )}
      </AnimatePresence>

      <TransactionList
        lang={lang}
        txFilter={txFilter}
        setTxFilter={setTxFilter}
        filtered={filtered}
        onDeleteTarget={setDeleteTarget}
        getWalletName={getWalletName}
        getWalletColor={getWalletColor}
        formatDate={formatDate}
      />

      <WalletManager
        lang={lang}
        visibleWallets={visibleWallets}
        onAdd={() => setShowAddWalletModal(true)}
        onEdit={setEditingWallet}
        onDelete={(id) => setDeleteWalletId(id)}
        onSetDefault={handleSetDefault}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
        title={lang === "bn" ? "লেনদেন মুছে ফেলুন?" : "Delete transaction?"}
        description={
          lang === "bn"
            ? "এই কাজটি ফেরানো যাবে না।"
            : "This action cannot be undone."
        }
        variant="danger"
      />

      {showAddWalletModal && (
        <AddWalletModal
          lang={lang}
          onAdd={handleAddWallet}
          onClose={() => setShowAddWalletModal(false)}
        />
      )}

      {editingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <WalletForm
              lang={lang}
              initialData={editingWallet}
              onSubmit={handleEditWallet}
              onClose={() => setEditingWallet(null)}
            />
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteWalletId}
        onConfirm={() => {
          if (deleteWalletId) handleDeleteWallet(deleteWalletId)
          setDeleteWalletId(null)
        }}
        onCancel={() => setDeleteWalletId(null)}
        title={lang === "bn" ? "ওয়ালেট মুছুন?" : "Delete wallet?"}
        description={
          lang === "bn"
            ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
            : "This action cannot be undone."
        }
        variant="danger"
      />
    </div>
  )
}
