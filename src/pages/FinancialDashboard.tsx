import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  CreditCard,
  Landmark,
  Activity,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface WalletData {
  _id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
}

interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: number;
  wallet: string;
}

interface SavingsGoalData {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon: string;
}

interface Investment {
  _id: string;
  name: string;
  type: string;
  value: number;
  change: number;
  changePercent: number;
  icon: string;
}

interface BudgetAlert {
  _id: string;
  category: string;
  spent: number;
  limit: number;
  severity: "low" | "medium" | "high";
}

const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍽️",
  Transport: "🚌",
  Shopping: "🛒",
  Bills: "⚡",
  Entertainment: "🎬",
  Health: "🏥",
  Education: "📚",
  Salary: "💼",
  Freelance: "💻",
  Investment: "📈",
};

const CATEGORY_COLORS: Record<string, string> = {
  Food: "var(--pv-orange)",
  Transport: "var(--pv-teal)",
  Shopping: "var(--pv-blue)",
  Bills: "var(--pv-lavender)",
  Entertainment: "var(--pv-pink)",
  Health: "var(--pv-green)",
  Education: "var(--pv-blue)",
  Salary: "var(--pv-green)",
  Freelance: "var(--pv-blue)",
  Investment: "var(--pv-green)",
};

export default function FinancialDashboard() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<
    "overview" | "expenses" | "savings" | "investments"
  >("overview");

  const [wallets] = useState<WalletData[]>([
    { _id: "1", name: "bKash", balance: 45200, icon: "📱", color: "#e91e63" },
    { _id: "2", name: "Nagad", balance: 12800, icon: "💳", color: "#ff5722" },
    {
      _id: "3",
      name: "Bank Account",
      balance: 85000,
      icon: "🏦",
      color: "#2196f3",
    },
    { _id: "4", name: "Cash", balance: 3500, icon: "💵", color: "#4caf50" },
  ]);

  const [transactions] = useState<Transaction[]>([
    {
      _id: "1",
      title: lang === "bn" ? "বাসা ভাড়া" : "Rent Payment",
      amount: 15000,
      type: "expense",
      category: "Bills",
      date: Date.now() - 1 * 24 * 60 * 60 * 1000,
      wallet: "bKash",
    },
    {
      _id: "2",
      title: lang === "bn" ? "বাজার" : "Groceries",
      amount: 3200,
      type: "expense",
      category: "Food",
      date: Date.now() - 1 * 24 * 60 * 60 * 1000,
      wallet: "Nagad",
    },
    {
      _id: "3",
      title: lang === "bn" ? "বেতন" : "Salary",
      amount: 65000,
      type: "income",
      category: "Salary",
      date: Date.now() - 2 * 24 * 60 * 60 * 1000,
      wallet: "Bank Account",
    },
    {
      _id: "4",
      title: lang === "bn" ? "অটোরিকশা" : "Auto-rickshaw",
      amount: 150,
      type: "expense",
      category: "Transport",
      date: Date.now() - 2 * 24 * 60 * 60 * 1000,
      wallet: "bKash",
    },
    {
      _id: "5",
      title: lang === "bn" ? "ফ্রিল্যান্স পেমেন্ট" : "Freelance Payment",
      amount: 12000,
      type: "income",
      category: "Freelance",
      date: Date.now() - 3 * 24 * 60 * 60 * 1000,
      wallet: "bKash",
    },
    {
      _id: "6",
      title: lang === "bn" ? "সিনেমা" : "Movie Tickets",
      amount: 600,
      type: "expense",
      category: "Entertainment",
      date: Date.now() - 3 * 24 * 60 * 60 * 1000,
      wallet: "bKash",
    },
    {
      _id: "7",
      title: lang === "bn" ? "ওষুধ" : "Medicine",
      amount: 850,
      type: "expense",
      category: "Health",
      date: Date.now() - 4 * 24 * 60 * 60 * 1000,
      wallet: "Nagad",
    },
    {
      _id: "8",
      title: lang === "bn" ? "বই" : "Books",
      amount: 1200,
      type: "expense",
      category: "Education",
      date: Date.now() - 5 * 24 * 60 * 60 * 1000,
      wallet: "Bank Account",
    },
  ]);

  const [savingsGoals] = useState<SavingsGoalData[]>([
    {
      _id: "1",
      name: lang === "bn" ? "ইমারকেন্সি ফান্ড" : "Emergency Fund",
      targetAmount: 50000,
      currentAmount: 32000,
      color: "#10b981",
      icon: "🛡️",
    },
    {
      _id: "2",
      name: lang === "bn" ? "নতুন ফোন" : "New Phone",
      targetAmount: 25000,
      currentAmount: 18000,
      color: "#3b82f6",
      icon: "📱",
    },
    {
      _id: "3",
      name: lang === "bn" ? "ভ্রমণ" : "Travel Fund",
      targetAmount: 40000,
      currentAmount: 40000,
      color: "#f59e0b",
      icon: "✈️",
    },
    {
      _id: "4",
      name: lang === "bn" ? "গাড়ি" : "Car Fund",
      targetAmount: 200000,
      currentAmount: 45000,
      color: "#8b5cf6",
      icon: "🚗",
    },
  ]);

  const [investments] = useState<Investment[]>([
    {
      _id: "1",
      name: lang === "bn" ? "শেয়ার বাজার" : "Stock Market",
      type: lang === "bn" ? "শেয়ার" : "Stocks",
      value: 125000,
      change: 5200,
      changePercent: 4.3,
      icon: "📈",
    },
    {
      _id: "2",
      name: lang === "bn" ? "মিউচুয়াল ফান্ড" : "Mutual Fund",
      type: lang === "bn" ? "ফান্ড" : "Fund",
      value: 85000,
      change: 1800,
      changePercent: 2.2,
      icon: "🏦",
    },
    {
      _id: "3",
      name: lang === "bn" ? "এফডিআর" : "FDR",
      type: lang === "bn" ? "নিরাপদ" : "Fixed",
      value: 100000,
      change: 1250,
      changePercent: 1.25,
      icon: "🔒",
    },
    {
      _id: "4",
      name: lang === "bn" ? "ডিপিএস" : "DPS",
      type: lang === "bn" ? "আবর্তমান" : "Recurring",
      value: 60000,
      change: 750,
      changePercent: 1.25,
      icon: "💰",
    },
  ]);

  const budgetAlerts = useMemo<BudgetAlert[]>(() => {
    const monthlyExpenses = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    return [
      { _id: "1", category: "Food", spent: 3200, limit: 8000, severity: "low" },
      {
        _id: "2",
        category: "Transport",
        spent: 150,
        limit: 2000,
        severity: "low",
      },
      {
        _id: "3",
        category: "Entertainment",
        spent: 600,
        limit: 3000,
        severity: "medium",
      },
      {
        _id: "4",
        category: "Bills",
        spent: 15000,
        limit: 16000,
        severity: "high",
      },
    ];
  }, [transactions]);

  const stats = useMemo(() => {
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    const monthlyExpenses = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const monthlyIncome = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalSavings = savingsGoals.reduce(
      (sum, g) => sum + g.currentAmount,
      0,
    );
    const totalSavingsTarget = savingsGoals.reduce(
      (sum, g) => sum + g.targetAmount,
      0,
    );
    const totalInvestment = investments.reduce((sum, i) => sum + i.value, 0);
    const totalInvestmentChange = investments.reduce(
      (sum, i) => sum + i.change,
      0,
    );

    const categoryBreakdown = transactions
      .filter((tx) => tx.type === "expense")
      .reduce(
        (acc, tx) => {
          acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

    return {
      totalBalance,
      monthlyExpenses,
      monthlyIncome,
      savingsRate:
        monthlyIncome > 0
          ? Math.round(
              ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100,
            )
          : 0,
      totalSavings,
      totalSavingsTarget,
      savingsProgress:
        totalSavingsTarget > 0
          ? Math.round((totalSavings / totalSavingsTarget) * 100)
          : 0,
      totalInvestment,
      totalInvestmentChange,
      categoryBreakdown,
    };
  }, [wallets, transactions, savingsGoals, investments]);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const tabs = [
    {
      id: "overview" as const,
      label: lang === "bn" ? "সারসংক্ষেপ" : "Overview",
      icon: BarChart3,
    },
    {
      id: "expenses" as const,
      label: lang === "bn" ? "খরচ" : "Expenses",
      icon: CreditCard,
    },
    {
      id: "savings" as const,
      label: lang === "bn" ? "সঞ্চয়" : "Savings",
      icon: PiggyBank,
    },
    {
      id: "investments" as const,
      label: lang === "bn" ? "বিনিয়োগ" : "Investments",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 rounded-xl glass">
          <Wallet className="h-6 w-6 text-[var(--pv-blue)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {lang === "bn" ? "আর্থিক ড্যাশবোর্ড" : "Financial Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lang === "bn"
              ? "আপনার সব আর্থিক তথ্য এক জায়গায়"
              : "All your finances in one place"}
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "glass bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {activeTab === "overview" && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="glass rounded-2xl p-6 glow-blue glass-accent-top">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {lang === "bn" ? "মোট ব্যালেন্স" : "Total Balance"}
                </p>
                <p className="text-3xl font-extrabold text-foreground">
                  ৳{stats.totalBalance.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--pv-green)]/10">
                <DollarSign className="h-6 w-6 text-[var(--pv-green)]" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ArrowDownRight className="h-3 w-3 text-[var(--pv-green)]" />
                  <span className="text-xs text-muted-foreground">
                    {lang === "bn" ? "আয়" : "Income"}
                  </span>
                </div>
                <p className="text-sm font-bold text-[var(--pv-green)]">
                  ৳{stats.monthlyIncome.toLocaleString()}
                </p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ArrowUpRight className="h-3 w-3 text-[var(--pv-orange)]" />
                  <span className="text-xs text-muted-foreground">
                    {lang === "bn" ? "খরচ" : "Expenses"}
                  </span>
                </div>
                <p className="text-sm font-bold text-[var(--pv-orange)]">
                  ৳{stats.monthlyExpenses.toLocaleString()}
                </p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-[var(--pv-blue)]" />
                  <span className="text-xs text-muted-foreground">
                    {lang === "bn" ? "সঞ্চয়ের হার" : "Savings Rate"}
                  </span>
                </div>
                <p className="text-sm font-bold text-[var(--pv-blue)]">
                  {stats.savingsRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <motion.div
              variants={fadeUp}
              className="glass rounded-xl p-4 text-center"
            >
              <PiggyBank className="h-5 w-5 mx-auto text-pink-500 mb-2" />
              <p className="text-lg font-bold">
                ৳{stats.totalSavings.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn" ? "মোট সঞ্চয়" : "Total Saved"}
              </p>
              <p className="text-xs text-[var(--pv-green)] mt-1">
                {stats.savingsProgress}%
              </p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="glass rounded-xl p-4 text-center"
            >
              <TrendingUp className="h-5 w-5 mx-auto text-[var(--pv-blue)] mb-2" />
              <p className="text-lg font-bold">
                ৳{stats.totalInvestment.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn" ? "বিনিয়োগ" : "Investments"}
              </p>
              <p className="text-xs text-[var(--pv-green)] mt-1">
                +৳{stats.totalInvestmentChange.toLocaleString()}
              </p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="glass rounded-xl p-4 text-center"
            >
              <Landmark className="h-5 w-5 mx-auto text-[var(--pv-teal)] mb-2" />
              <p className="text-lg font-bold">{wallets.length}</p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn" ? "ওয়ালেট" : "Wallets"}
              </p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="glass rounded-xl p-4 text-center"
            >
              <Activity className="h-5 w-5 mx-auto text-[var(--pv-orange)] mb-2" />
              <p className="text-lg font-bold">{transactions.length}</p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn" ? "লেনদেন" : "Transactions"}
              </p>
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="glass rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--pv-blue)]" />
              {lang === "bn" ? "খরচের বিভাজন" : "Expense Breakdown"}
            </h3>
            <div className="space-y-2">
              {Object.entries(stats.categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => {
                  const pct =
                    stats.monthlyExpenses > 0
                      ? Math.round((amount / stats.monthlyExpenses) * 100)
                      : 0;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                          {CATEGORY_ICONS[category] || "📦"} {category}
                        </span>
                        <span className="font-medium text-foreground">
                          {pct}% · ৳{amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{
                            background:
                              CATEGORY_COLORS[category] || "var(--pv-orange)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {activeTab === "expenses" && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[var(--pv-orange)]" />
              {lang === "bn" ? "খরচের বিভাজন" : "Expense by Category"}
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.categoryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const pct =
                    stats.monthlyExpenses > 0
                      ? Math.round((amount / stats.monthlyExpenses) * 100)
                      : 0;
                  return (
                    <div key={category} className="glass rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {CATEGORY_ICONS[category] || "📦"}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {category}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {pct}% {lang === "bn" ? "খরচ" : "of total"}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[var(--pv-orange)]">
                          ৳{amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{
                            background:
                              CATEGORY_COLORS[category] || "var(--pv-orange)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {lang === "bn" ? "সাম্প্রতিক খরচ" : "Recent Expenses"}
            </h3>
            <div className="space-y-2">
              {transactions
                .filter((tx) => tx.type === "expense")
                .slice(0, 6)
                .map((tx) => (
                  <div
                    key={tx._id}
                    className="flex items-center gap-3 p-3 glass rounded-xl"
                  >
                    <span className="text-lg">
                      {CATEGORY_ICONS[tx.category] || "📦"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tx.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category} · {tx.wallet} · {formatDate(tx.date)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-[var(--pv-orange)]">
                      -৳{tx.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "savings" && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="glass rounded-2xl p-4 glow-blue glass-accent-top">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  {lang === "bn"
                    ? "সমগ্র সঞ্চয়ের অগ্রগতি"
                    : "Overall Savings Progress"}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  ৳{stats.totalSavings.toLocaleString()} / ৳
                  {stats.totalSavingsTarget.toLocaleString()}
                </p>
              </div>
              <Target className="h-6 w-6 text-[var(--pv-green)]" />
            </div>
            <div className="h-4 rounded-full bg-foreground/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${stats.savingsProgress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-[var(--pv-green)] to-[var(--pv-teal)]"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {stats.savingsProgress}% {lang === "bn" ? "সম্পন্ন" : "complete"}
            </p>
          </div>

          <div className="space-y-3">
            {savingsGoals.map((goal) => {
              const progress = Math.round(
                (goal.currentAmount / goal.targetAmount) * 100,
              );
              return (
                <motion.div
                  key={goal._id}
                  variants={fadeUp}
                  className="glass rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="rounded-xl p-3"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        <span className="text-lg">{goal.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {goal.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          ৳{goal.currentAmount.toLocaleString()} / ৳
                          {goal.targetAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {progress >= 100 && (
                      <CheckCircle className="h-5 w-5 text-[var(--pv-green)]" />
                    )}
                  </div>
                  <div className="h-3 rounded-full bg-foreground/5 overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {progress}% {lang === "bn" ? "সম্পন্ন" : "complete"}
                    </span>
                    <span>
                      {lang === "bn" ? "বাকি" : "remaining"}: ৳
                      {(
                        goal.targetAmount - goal.currentAmount
                      ).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {activeTab === "investments" && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <div className="glass rounded-2xl p-4 glow-blue glass-accent-top">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {lang === "bn" ? "মোট পোর্টফোলিও" : "Total Portfolio"}
                </p>
                <p className="text-3xl font-extrabold text-foreground">
                  ৳{stats.totalInvestment.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--pv-green)]">
                  +৳{stats.totalInvestmentChange.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lang === "bn" ? "এই মাসে" : "This month"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {investments.map((inv) => (
              <motion.div
                key={inv._id}
                variants={fadeUp}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{inv.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {inv.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{inv.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      ৳{inv.value.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {inv.change >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-[var(--pv-green)]" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-[var(--pv-red)]" />
                      )}
                      <p
                        className={`text-xs font-medium ${inv.change >= 0 ? "text-[var(--pv-green)]" : "text-[var(--pv-red)]"}`}
                      >
                        {inv.change >= 0 ? "+" : ""}৳
                        {inv.change.toLocaleString()} ({inv.changePercent}%)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${(inv.value / stats.totalInvestment) * 100}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        inv.change >= 0 ? "var(--pv-green)" : "var(--pv-red)",
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[var(--pv-orange)]" />
          {lang === "bn" ? "বাজেট সতর্কতা" : "Budget Alerts"}
        </h3>
        <div className="space-y-2">
          {budgetAlerts.map((alert) => {
            const pct = Math.round((alert.spent / alert.limit) * 100);
            const remaining = alert.limit - alert.spent;
            return (
              <div
                key={alert._id}
                className={`glass rounded-xl p-3 border-l-4 ${
                  alert.severity === "high"
                    ? "border-[var(--pv-red)]"
                    : alert.severity === "medium"
                      ? "border-[var(--pv-orange)]"
                      : "border-[var(--pv-green)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span>{CATEGORY_ICONS[alert.category] || "📦"}</span>
                    <span className="text-sm font-medium text-foreground">
                      {alert.category}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      alert.severity === "high"
                        ? "text-[var(--pv-red)]"
                        : alert.severity === "medium"
                          ? "text-[var(--pv-orange)]"
                          : "text-[var(--pv-green)]"
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    ৳{alert.spent.toLocaleString()} / ৳
                    {alert.limit.toLocaleString()}
                  </span>
                  <span>
                    {lang === "bn" ? "বাকি" : "remaining"}: ৳
                    {remaining.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-foreground/5 overflow-hidden mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        alert.severity === "high"
                          ? "var(--pv-red)"
                          : alert.severity === "medium"
                            ? "var(--pv-orange)"
                            : "var(--pv-green)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="glass rounded-2xl p-4"
      >
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {lang === "bn" ? "সাম্প্রতিক লেনদেন" : "Recent Transactions"}
        </h3>
        <div className="space-y-2">
          {transactions.slice(0, 5).map((tx) => (
            <div
              key={tx._id}
              className="flex items-center gap-3 p-3 glass rounded-xl"
            >
              <span className="text-lg">
                {CATEGORY_ICONS[tx.category] || "📦"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {tx.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx.wallet} · {formatDate(tx.date)}
                </p>
              </div>
              <p
                className={`text-sm font-bold ${
                  tx.type === "income"
                    ? "text-[var(--pv-green)]"
                    : "text-[var(--pv-orange)]"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}৳{tx.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
