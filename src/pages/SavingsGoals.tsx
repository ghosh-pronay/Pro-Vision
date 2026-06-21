import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  PiggyBank,
  Plus,
  Target,
  TrendingUp,
  CheckCircle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Pause,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  X,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Edit3,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatBanglaCurrency } from "@/lib/bangla-numbers";
import { toastSuccess } from "@/lib/toast-helpers";

interface SavingsGoal {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  icon?: string;
  color?: string;
  deadline?: number;
  status: "active" | "completed" | "paused";
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SavingsGoals() {
  const { lang } = useLang();
  const [showAddModal, setShowAddModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [showAddFunds, setShowAddFunds] = useState<string | null>(null);
  const [addAmount, setAddAmount] = useState("");

  const [goals, setGoals] = useState<SavingsGoal[]>([
    {
      _id: "1",
      name: lang === "bn" ? "ইমারকেন্সি ফান্ড" : "Emergency Fund",
      targetAmount: 50000,
      currentAmount: 32000,
      color: "#10b981",
      status: "active",
    },
    {
      _id: "2",
      name: lang === "bn" ? "নতুন ফোন" : "New Phone",
      targetAmount: 25000,
      currentAmount: 18000,
      color: "#3b82f6",
      // eslint-disable-next-line react-hooks/purity
      deadline: Date.now() + 90 * 24 * 60 * 60 * 1000,
      status: "active",
    },
    {
      _id: "3",
      name: lang === "bn" ? "ভ্রমণ" : "Travel Fund",
      targetAmount: 40000,
      currentAmount: 40000,
      color: "#f59e0b",
      status: "completed",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    deadline: "",
    color: "#3b82f6",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const activeGoals = goals.filter((g) => g.status === "active");
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    return {
      activeCount: activeGoals.length,
      totalSaved,
      totalTarget,
      overallProgress: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    };
  }, [goals]);

  const handleAddGoal = () => {
    const newGoal: SavingsGoal = {
      _id: Date.now().toString(),
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount) || 0,
      currentAmount: 0,
      color: formData.color,
      deadline: formData.deadline
        ? new Date(formData.deadline).getTime()
        : undefined,
      status: "active",
    };
    setGoals([newGoal, ...goals]);
    setShowAddModal(false);
    setFormData({ name: "", targetAmount: "", deadline: "", color: "#3b82f6" });
    toastSuccess(lang === "bn" ? "লক্ষ্য যোগ হয়েছে" : "Goal added");
  };

  const handleAddFunds = (goalId: string) => {
    const amount = parseFloat(addAmount) || 0;
    setGoals(
      goals.map((g) => {
        if (g._id === goalId) {
          const newAmount = Math.min(g.currentAmount + amount, g.targetAmount);
          return {
            ...g,
            currentAmount: newAmount,
            status: newAmount >= g.targetAmount ? "completed" : g.status,
          };
        }
        return g;
      }),
    );
    setShowAddFunds(null);
    setAddAmount("");
    toastSuccess(lang === "bn" ? "অর্থ যোগ হয়েছে" : "Funds added");
  };

  const handleDelete = (id: string) => {
    setGoals(goals.filter((g) => g._id !== id));
    toastSuccess(lang === "bn" ? "লক্ষ্য মুছে ফেলা হয়েছে" : "Goal deleted");
  };

  const formatCurrency = (amount: number) => {
    return formatBanglaCurrency(amount);
  };

  const getDaysLeft = (deadline?: number) => {
    if (!deadline) return null;
    // eslint-disable-next-line react-hooks/purity
    const diff = deadline - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <PiggyBank className="h-6 w-6 text-pink-500" />
          {lang === "bn" ? "সঞ্চয়ের লক্ষ্য" : "Savings Goals"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার আর্থিক লক্ষ্য ট্র্যাক করুন"
            : "Track your financial goals with visual progress"}
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="glass rounded-xl p-4 text-center">
          <Target className="h-5 w-5 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">{stats.activeCount}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "সক্রিয় লক্ষ্য" : "Active Goals"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <PiggyBank className="h-5 w-5 mx-auto text-pink-500 mb-2" />
          <p className="text-2xl font-bold">
            {formatCurrency(stats.totalSaved)}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "মোট সঞ্চয়" : "Total Saved"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold">
            {Math.round(stats.overallProgress)}%
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "সমগ্র অগ্রগতি" : "Overall Progress"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <CheckCircle className="h-5 w-5 mx-auto text-emerald-500 mb-2" />
          <p className="text-2xl font-bold">
            {goals.filter((g) => g.status === "completed").length}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "সম্পন্ন" : "Completed"}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "নতুন লক্ষ্য" : "New Goal"}
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-4">
        {goals.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title={
              lang === "bn" ? "কোনো সঞ্চয় লক্ষ্য নেই" : "No savings goals yet"
            }
            description={
              lang === "bn"
                ? "আপনার প্রথম সঞ্চয় লক্ষ্য যোগ করুন"
                : "Add your first savings goal to start tracking"
            }
            action={{
              label: lang === "bn" ? "নতুন লক্ষ্য" : "New Goal",
              onClick: () => setShowAddModal(true),
            }}
          />
        ) : (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = getDaysLeft(goal.deadline);

            return (
              <motion.div
                key={goal._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass rounded-2xl p-4 ${goal.status === "completed" ? "opacity-75" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-xl p-3"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <PiggyBank
                        className="h-5 w-5"
                        style={{ color: goal.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{goal.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} /{" "}
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {goal.status === "active" && (
                      <button
                        onClick={() => setShowAddFunds(goal._id)}
                        className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirmId(goal._id)}
                      className="cursor-pointer p-2 rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>

                <div className="relative h-4 bg-foreground/10 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                  {progress >= 100 && (
                    <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white" />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {Math.round(progress)}%{" "}
                    {lang === "bn" ? "সম্পন্ন" : "complete"}
                  </span>
                  {daysLeft !== null && goal.status === "active" && (
                    <span>
                      {daysLeft === 0
                        ? lang === "bn"
                          ? "আজ শেষ!"
                          : "Due today!"
                        : `${daysLeft} ${lang === "bn" ? "দিন বাকি" : "days left"}`}
                    </span>
                  )}
                  {goal.status === "completed" && (
                    <span className="text-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {lang === "bn" ? "সম্পন্ন!" : "Completed!"}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              {lang === "bn" ? "নতুন সঞ্চয় লক্ষ্য" : "New Savings Goal"}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={lang === "bn" ? "লক্ষ্যের নাম" : "Goal name"}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) =>
                  setFormData({ ...formData, targetAmount: e.target.value })
                }
                placeholder={
                  lang === "bn" ? "টার্গেট পরিমাণ (৳)" : "Target amount (৳)"
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "bn" ? "রঙ" : "Color"}
                </label>
                <div className="flex gap-2">
                  {[
                    "#10b981",
                    "#3b82f6",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`cursor-pointer w-8 h-8 rounded-full transition-transform ${
                        formData.color === color
                          ? "scale-110 ring-2 ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleAddGoal}
                disabled={!formData.name || !formData.targetAmount}
                className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {lang === "bn" ? "লক্ষ্য যোগ করুন" : "Add Goal"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddFunds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-sm mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              {lang === "bn" ? "অর্থ যোগ করুন" : "Add Funds"}
            </h3>
            <div className="space-y-3">
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder={lang === "bn" ? "পরিমাণ (৳)" : "Amount (৳)"}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddFunds(null)}
                  className="cursor-pointer flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={() => handleAddFunds(showAddFunds)}
                  disabled={!addAmount}
                  className="cursor-pointer flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {lang === "bn" ? "যোগ করুন" : "Add"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId);
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
        title={lang === "bn" ? "লক্ষ্য মুছুন?" : "Delete goal?"}
        description={
          lang === "bn"
            ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
            : "This action cannot be undone."
        }
      />
    </motion.div>
  );
}
