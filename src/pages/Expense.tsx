import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { useState, useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Trash2,
  Calculator,
  Repeat,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronRight,
  X,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import FloatingCalculator from "@/components/finance/FloatingCalculator";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toastSuccess, toastError } from "@/lib/toast-helpers";
import type { Wallet as WalletType } from "@/pages/Wallets";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍽️",
  Salary: "💼",
  Freelance: "💻",
  Transfer: "📱",
  Utilities: "⚡",
  Transport: "🚌",
  Cashback: "🎁",
  Shopping: "🛒",
  Health: "🏥",
  Education: "📚",
  "Food & Dining": "🍽️",
  Transportation: "🚌",
  "Bills & Utilities": "⚡",
  "Mobile Recharge": "📱",
  "Internet Bill": "📶",
  Groceries: "🍎",
  Healthcare: "🏥",
  Entertainment: "🎬",
  Clothing: "👕",
  Savings: "💰",
  "Investment Returns": "📈",
  "Gift Received": "🎁",
  "Gift Given": "🎁",
  "Charity/Donation": "❤️",
  Insurance: "🛡️",
  "Loan Payment": "💳",
  Business: "🏢",
  "Other Income": "💵",
  Rent: "🏠",
  "Personal Care": "💆",
  Travel: "✈️",
  "Other Expense": "📦",
};

interface ExpenseTransaction {
  _id: string;
  type: string;
  amount: number;
  category: string;
  description?: string;
  date: number;
  walletId: string;
  toWalletId?: string;
}

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment Returns",
  "Gift Received",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Rent",
  "Groceries",
  "Healthcare",
  "Education",
  "Entertainment",
  "Clothing",
  "Personal Care",
  "Mobile Recharge",
  "Internet Bill",
  "Savings",
  "Travel",
  "Gift Given",
  "Charity/Donation",
  "Insurance",
  "Loan Payment",
  "Other Expense",
];

const toBanglaNumber = (n: number): string => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n
    .toLocaleString("en-US")
    .replace(/\d/g, (d) => banglaDigits[parseInt(d)]);
};

export default function Expense() {
  const { lang } = useLang();

  const transactions = useQuery(api.transactions.list) ?? [];
  const wallets = useQuery(api.wallets.list) ?? [];
  const stats = useQuery(api.transactions.stats);
  const createTx = useMutation(api.transactions.create);
  const removeTx = useMutation(api.transactions.remove);

  const [activeTab, setActiveTab] = useState<"income" | "expense" | "transfer">(
    "income",
  );
  const [showForm, setShowForm] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const [incomeWallet, setIncomeWallet] = useState("");
  const [expenseWallet, setExpenseWallet] = useState("");
  const [fromWallet, setFromWallet] = useState("");
  const [toWallet, setToWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [txFilter, setTxFilter] = useState<
    "all" | "income" | "expense" | "transfer"
  >("all");

  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const defaultWallet = useMemo(
    () => wallets.find((w: WalletType) => w.isDefault) ?? wallets[0],
    [wallets],
  );

  const effectiveIncomeWallet = useMemo(
    () => incomeWallet || defaultWallet?._id || "",
    [incomeWallet, defaultWallet],
  );
  const effectiveExpenseWallet = useMemo(
    () => expenseWallet || defaultWallet?._id || "",
    [expenseWallet, defaultWallet],
  );
  const effectiveFromWallet = useMemo(
    () => fromWallet || defaultWallet?._id || "",
    [fromWallet, defaultWallet],
  );
  const secondWallet = useMemo(
    () =>
      wallets.length > 1
        ? wallets.find((w: WalletType) => w._id !== defaultWallet?._id)
        : undefined,
    [wallets, defaultWallet],
  );
  const effectiveToWallet = useMemo(
    () => toWallet || secondWallet?._id || "",
    [toWallet, secondWallet],
  );

  const totalIncome = stats?.totalIncome ?? 0;
  const totalExpense = stats?.totalExpense ?? 0;
  const netBalance = totalIncome - totalExpense;

  const filtered = useMemo(() => {
    const result = (transactions as ExpenseTransaction[]) || [];
    if (txFilter !== "all") {
      if (txFilter === "transfer") {
        return result
          .filter((tx) => tx.type === "income" && tx.toWalletId)
          .slice(0, 10);
      }
      return result.filter((tx) => tx.type === txFilter).slice(0, 10);
    }
    return result.slice(0, 10);
  }, [transactions, txFilter]);

  const handleAddIncome = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !effectiveIncomeWallet) return;
    setIsAddingIncome(true);
    try {
      await createTx({
        walletId: effectiveIncomeWallet,
        amount: amt,
        category: category || "Salary",
        type: "income",
        description: description || undefined,
        date: new Date(date).getTime(),
      });
      setAmount("");
      setDescription("");
      setCategory("");
      setShowForm(false);
      toastSuccess(lang === "bn" ? "আয় যোগ হয়েছে!" : "Income added!");
    } catch (error) {
      handleMutationError(
        error,
        lang === "bn" ? "আয় যোগ করতে ব্যর্থ" : "Failed to add income",
      );
    } finally {
      setIsAddingIncome(false);
    }
  };

  const handleAddExpense = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !effectiveExpenseWallet) return;
    setIsAddingExpense(true);
    try {
      await createTx({
        walletId: effectiveExpenseWallet,
        amount: amt,
        category: category || "Food & Dining",
        type: "expense",
        description: description || undefined,
        date: new Date(date).getTime(),
      });
      setAmount("");
      setDescription("");
      setCategory("");
      setShowForm(false);
      toastSuccess(lang === "bn" ? "খরচ যোগ হয়েছে!" : "Expense added!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toastError(
        lang === "bn" ? "খরচ যোগ করতে ব্যর্থ" : "Failed to add expense",
      );
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleTransfer = async () => {
    const amt = parseFloat(amount);
    const totalAmount = amt + transferFee;
    if (
      !amt ||
      amt <= 0 ||
      !effectiveFromWallet ||
      !effectiveToWallet ||
      effectiveFromWallet === effectiveToWallet
    )
      return;
    setIsTransferring(true);
    try {
      await createTx({
        walletId: effectiveFromWallet,
        amount: totalAmount,
        category: "Transfer",
        type: "expense",
        description: description || undefined,
        date: new Date(date).getTime(),
        toWalletId: effectiveToWallet,
      });
      await createTx({
        walletId: effectiveToWallet,
        amount: amt,
        category: "Transfer",
        type: "income",
        description: description || undefined,
        date: new Date(date).getTime(),
        toWalletId: effectiveFromWallet,
      });
      setAmount("");
      setDescription("");
      setShowForm(false);
      toastSuccess(
        lang === "bn" ? "স্থানান্তর সম্পন্ন!" : "Transfer complete!",
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toastError(lang === "bn" ? "স্থানান্তর ব্যর্থ" : "Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeTx({ id });
      toastSuccess(
        lang === "bn" ? "লেনদেন মুছে ফেলা হয়েছে" : "Transaction deleted",
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toastError(
        lang === "bn"
          ? "লেনদেন মুছে ফেলতে ব্যর্থ"
          : "Failed to delete transaction",
      );
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const todayDate = new Date().toLocaleDateString(
    lang === "bn" ? "bn-BD" : "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const getWalletName = (walletId: string) => {
    const w = wallets.find((w: WalletType) => w._id === walletId);
    return w ? (lang === "bn" && w.nameBn ? w.nameBn : w.name) : "";
  };

  const getWalletIcon = (walletId: string) => {
    const w = wallets.find((w: WalletType) => w._id === walletId);
    return w?.color || "#6b7280";
  };

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const transferFee = useMemo(() => {
    if (
      !effectiveFromWallet ||
      !effectiveToWallet ||
      effectiveFromWallet === effectiveToWallet
    )
      return 0;
    const from = wallets.find((w: WalletType) => w._id === effectiveFromWallet);
    const to = wallets.find((w: WalletType) => w._id === effectiveToWallet);
    if (from && to && from.type !== to.type) {
      return parseFloat(amount || "0") * 0.01;
    }
    return 0;
  }, [effectiveFromWallet, effectiveToWallet, wallets, amount]);

  const openIncomeForm = () => {
    setActiveTab("income");
    setShowForm(true);
    setCategory("Salary");
  };

  const openExpenseForm = () => {
    setActiveTab("expense");
    setShowForm(true);
    setCategory("Food & Dining");
  };

  const openTransferForm = () => {
    setActiveTab("transfer");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setAmount("");
    setDescription("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setIncomeWallet("");
    setExpenseWallet("");
    setFromWallet("");
    setToWallet("");
  };

  if (wallets.length === 0) {
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
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
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

      {/* Three Action Buttons */}
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

      {/* Overview Stats Card */}
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
                <ArrowDownLeft className="size-4 text-[var(--pv-green)]" />
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

      {/* Forms */}
      <AnimatePresence>
        {showForm && (
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
                  onClick={closeForm}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Income Form */}
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
                      {wallets.map((w: WalletType) => (
                        <option key={w._id} value={w._id}>
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
                    <div className="relative flex items-center gap-1">
                      <input
                        value={amount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          const parts = val.split(".");
                          if (parts.length > 2) return;
                          if (parts[1] && parts[1].length > 2) return;
                          setAmount(val);
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddIncome()
                        }
                        placeholder="৳ 0"
                        type="number"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowCalc(!showCalc)}
                        className={`p-2.5 rounded-xl transition-all ${showCalc ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}
                      >
                        <Calculator className="size-4" />
                      </button>
                      <AnimatePresence>
                        {showCalc && (
                          <FloatingCalculator
                            onResult={(val) => {
                              setAmount(val);
                              setShowCalc(false);
                            }}
                            onClose={() => setShowCalc(false)}
                          />
                        )}
                      </AnimatePresence>
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
                    onClick={handleAddIncome}
                    disabled={!incomeWallet || !amount || isAddingIncome}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pv-green), #16a34a)",
                    }}
                  >
                    {isAddingIncome
                      ? t("expense.adding", lang)
                      : t("expense.addIncome", lang)}
                  </button>
                </div>
              )}

              {/* Expense Form */}
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
                      {wallets.map((w: WalletType) => (
                        <option key={w._id} value={w._id}>
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
                    <div className="relative flex items-center gap-1">
                      <input
                        value={amount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          const parts = val.split(".");
                          if (parts.length > 2) return;
                          if (parts[1] && parts[1].length > 2) return;
                          setAmount(val);
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddExpense()
                        }
                        placeholder="৳ 0"
                        type="number"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowCalc(!showCalc)}
                        className={`p-2.5 rounded-xl transition-all ${showCalc ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}
                      >
                        <Calculator className="size-4" />
                      </button>
                      <AnimatePresence>
                        {showCalc && (
                          <FloatingCalculator
                            onResult={(val) => {
                              setAmount(val);
                              setShowCalc(false);
                            }}
                            onClose={() => setShowCalc(false)}
                          />
                        )}
                      </AnimatePresence>
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
                    onClick={handleAddExpense}
                    disabled={!expenseWallet || !amount || isAddingExpense}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pv-red), #dc2626)",
                    }}
                  >
                    {isAddingExpense
                      ? t("expense.adding", lang)
                      : t("expense.addExpense", lang)}
                  </button>
                </div>
              )}

              {/* Transfer Form */}
              {activeTab === "transfer" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      {t("expense.fromWallet", lang)}
                    </label>
                    <select
                      value={effectiveFromWallet}
                      onChange={(e) => {
                        setFromWallet(e.target.value);
                        if (e.target.value === effectiveToWallet) {
                          const other = wallets.find(
                            (w: WalletType) => w._id !== e.target.value,
                          );
                          if (other) setToWallet(other._id);
                        }
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
                    >
                      {wallets.map((w: WalletType) => (
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
                      <ArrowLeftRight className="size-4 text-muted-foreground" />
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
                      {wallets.map((w: WalletType) => (
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
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9.]/g, "");
                        const parts = val.split(".");
                        if (parts.length > 2) return;
                        if (parts[1] && parts[1].length > 2) return;
                        setAmount(val);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleTransfer()}
                      placeholder="৳ 0"
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </div>

                  {transferFee > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--pv-orange)]/10">
                      <span className="text-xs text-[var(--pv-orange)]">
                        {t("expense.transferFee", lang)}: ৳
                        {transferFee.toFixed(2)}
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
                    onClick={handleTransfer}
                    disabled={
                      !effectiveFromWallet ||
                      !effectiveToWallet ||
                      effectiveFromWallet === effectiveToWallet ||
                      !amount ||
                      isTransferring
                    }
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pv-blue), #2563eb)",
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
        )}
      </AnimatePresence>

      {/* Recent Transactions */}
      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            {t("expense.recentTransactions", lang)}
          </h3>
          <div className="flex glass rounded-xl overflow-hidden">
            {(["all", "income", "expense", "transfer"] as const).map((f) => (
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
                onClick={() => setDeleteTarget(tx._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Wallet Balance Summary */}
      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            {t("expense.walletBalance", lang)}
          </h3>
          <a
            href="/wallets"
            className="flex items-center gap-1 text-xs text-[var(--pv-blue)] hover:underline"
          >
            {t("expense.viewAll", lang)}
            <ChevronRight className="size-3" />
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {wallets.map((w: WalletType) => (
            <a
              key={w._id}
              href="/wallets"
              className="glass rounded-xl p-3 hover:bg-foreground/5 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: w.color }}
                >
                  <Wallet className="size-3 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground truncate">
                  {lang === "bn" && w.nameBn ? w.nameBn : w.name}
                </span>
                {w.isDefault && (
                  <span className="text-[10px] text-[var(--pv-blue)]">
                    {t("expense.default", lang)}
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-foreground">
                ৳{w.balance.toLocaleString()}
              </div>
            </a>
          ))}
        </div>
      </motion.div>

      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
          setDeleteTarget(null);
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
    </div>
  );
}
