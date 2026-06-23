import { motion } from "framer-motion";
import { Receipt, Plus, Wallet, TrendingUp, Users, Trash2 } from "lucide-react";
import { EXPENSE_CATEGORIES, getCategoryLabel } from "./FamilyConstants";
import type {
  FamilyMember,
  FamilyExpense,
  ExpenseCategory,
} from "./FamilyTypes";

interface ExpensesTabProps {
  expenses: FamilyExpense[];
  members: FamilyMember[];
  lang: string;
  onAddClick: () => void;
  onDelete: (id: string) => void;
  budget: number;
  setBudget: (budget: number) => void;
  totalExpenses: number;
  expensesByCategory: Record<ExpenseCategory, number>;
  splitAmounts: Record<string, number>;
}

function getMemberName(members: FamilyMember[], id: string) {
  return members.find((m) => m.id === id)?.name || "Unknown";
}

export default function ExpensesTab({
  expenses,
  members,
  lang,
  onAddClick,
  onDelete,
  budget,
  setBudget,
  totalExpenses,
  expensesByCategory,
  splitAmounts,
}: ExpensesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Receipt className="size-5 text-amber-500" />
          {lang === "bn" ? "পরিবারের খরচ" : "Family Expenses"}
        </h2>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:brightness-110 transition-all"
        >
          <Plus className="size-4" />
          {lang === "bn" ? "খরচ যোগ করুন" : "Add Expense"}
        </button>
      </div>

      {/* Budget Overview */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Wallet className="size-4" />
            {lang === "bn" ? "মাসিক বাজেট" : "Monthly Budget"}
          </span>
          <button
            onClick={() => {
              const val = prompt(
                lang === "bn" ? "মাসিক বাজেট সেট করুন:" : "Set monthly budget:",
                budget.toString(),
              );
              if (val && !isNaN(Number(val))) setBudget(Number(val));
            }}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {lang === "bn" ? "পরিবর্তন করুন" : "Change"}
          </button>
        </div>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-3xl font-bold">
            ৳{totalExpenses.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-sm mb-1">
            / ৳{budget.toLocaleString()}
          </span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              totalExpenses > budget
                ? "bg-gradient-to-r from-red-500 to-red-400"
                : "bg-gradient-to-r from-green-500 to-emerald-500"
            }`}
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min((totalExpenses / budget) * 100, 100)}%`,
            }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {totalExpenses > budget
            ? `⚠️ ${lang === "bn" ? "বাজেটের বেশি!" : "Over budget!"}`
            : `✅ ৳${(budget - totalExpenses).toLocaleString()} ${
                lang === "bn" ? "বাকি" : "remaining"
              }`}
        </p>
      </div>

      {/* By Category */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <TrendingUp className="size-4" />
          {lang === "bn" ? "ক্যাটাগরি অনুযায়ী" : "By Category"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {EXPENSE_CATEGORIES.map((cat) => {
            const amount = expensesByCategory[cat.key];
            if (amount === 0) return null;
            return (
              <div key={cat.key} className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <cat.icon className={`size-4 ${cat.color}`} />
                  <span className="text-xs capitalize">
                    {getCategoryLabel(cat.key, lang)}
                  </span>
                </div>
                <p className="font-medium text-sm">
                  ৳{amount.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split View */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Users className="size-4" />
          {lang === "bn" ? "খরচ ভাগ" : "Split View"}
        </h3>
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3">
              <span className="text-xl">{m.avatar}</span>
              <span className="flex-1 text-sm">{m.name}</span>
              <span className="font-medium">
                ৳{Math.round(splitAmounts[m.id] || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium mb-3">
          {lang === "bn" ? "সাম্প্রতিক খরচ" : "Recent Expenses"}
        </h3>
        <div className="space-y-2">
          {expenses.slice(0, 5).map((expense) => {
            const catConfig = EXPENSE_CATEGORIES.find(
              (c) => c.key === expense.category,
            );
            return (
              <div
                key={expense.id}
                className="flex items-center gap-3 p-2 bg-white/5 rounded-xl group"
              >
                {catConfig && (
                  <catConfig.icon className={`size-5 ${catConfig.color}`} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {expense.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getMemberName(members, expense.paidBy)} •{" "}
                    {new Date(expense.date).toLocaleDateString(
                      lang === "bn" ? "bn-BD" : "en-US",
                      { month: "short", day: "numeric" },
                    )}
                  </p>
                </div>
                <span className="font-medium text-sm">
                  ৳{expense.amount.toLocaleString()}
                </span>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
