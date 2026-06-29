import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { useI18n } from "@/hooks/use-i18n"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trophy,
  Target,
  Calendar,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Id } from "../convex/_generated/dataModel"

const CATEGORIES = [
  "All",
  "Fitness",
  "Learning",
  "Finance",
  "Career",
  "Personal",
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Goals() {
  const { t } = useI18n()

  const goals = useQuery(api.goals.list)
  const createGoal = useMutation(api.goals.create, "goals")
  const updateGoal = useMutation(api.goals.update, "goals")
  const removeGoal = useMutation(api.goals.remove, "goals")

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "Fitness",
    deadline: "",
    milestones: [] as { title: string; completed: boolean }[],
  })

  type GoalItem = (typeof goals)[number]
  const allGoals: GoalItem[] = goals ?? ([] as GoalItem[])
  const filteredGoals =
    selectedCategory === "All"
      ? allGoals
      : allGoals.filter((g: GoalItem) => g.category === selectedCategory)

  const activeGoals = allGoals.filter(
    (g: GoalItem) => g.status === "active",
  ).length
  const completedGoals = allGoals.filter(
    (g: GoalItem) => g.status === "completed",
  ).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-500/20"
      case "paused":
        return "text-yellow-500 bg-yellow-500/20"
      default:
        return "text-primary bg-primary/20"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return t.goals.status.completed
      case "paused":
        return t.goals.status.paused
      default:
        return t.goals.status.active
    }
  }

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return
    await createGoal({
      title: newGoal.title,
      description: newGoal.description || undefined,
      category: newGoal.category,
      deadline: newGoal.deadline
        ? new Date(newGoal.deadline).getTime()
        : Date.now() + 30 * 24 * 60 * 60 * 1000,
      milestones: newGoal.milestones,
    })
    setNewGoal({
      title: "",
      description: "",
      category: "Fitness",
      deadline: "",
      milestones: [],
    })
    setShowAddModal(false)
  }

  const handleDeleteGoal = async (id: string) => {
    await removeGoal({ id: id as Id<"goals"> })
  }

  const handleToggleStatus = async (goal: GoalItem) => {
    const nextStatus = goal.status === "active" ? "completed" : "active"
    await updateGoal({
      id: goal._id,
      status: nextStatus,
      progress: nextStatus === "completed" ? 100 : goal.progress,
    })
  }

  const handleToggleMilestone = async (
    goal: GoalItem,
    milestoneIndex: number,
  ) => {
    const updatedMilestones = goal.milestones.map((m, i) =>
      i === milestoneIndex ? { ...m, completed: !m.completed } : m,
    )
    const completedCount = updatedMilestones.filter((m) => m.completed).length
    const newProgress =
      updatedMilestones.length > 0
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : goal.progress
    await updateGoal({
      id: goal._id,
      milestones: updatedMilestones,
      progress: newProgress,
    })
  }

  const handleAddMilestoneToGoal = async (goal: GoalItem) => {
    if (!newMilestoneTitle.trim()) return
    const updatedMilestones = [
      ...goal.milestones,
      { title: newMilestoneTitle, completed: false },
    ]
    await updateGoal({
      id: goal._id,
      milestones: updatedMilestones,
    })
    setNewMilestoneTitle("")
  }

  const handleAddMilestoneToNew = () => {
    if (!newMilestoneTitle.trim()) return
    setNewGoal({
      ...newGoal,
      milestones: [
        ...newGoal.milestones,
        { title: newMilestoneTitle, completed: false },
      ],
    })
    setNewMilestoneTitle("")
  }

  const handleRemoveMilestoneFromNew = (index: number) => {
    setNewGoal({
      ...newGoal,
      milestones: newGoal.milestones.filter((_, i) => i !== index),
    })
  }

  if (goals === undefined) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <div className="text-sm text-muted-foreground">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.nav.goals}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.goals.subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
          style={{
            background:
              "linear-gradient(135deg, var(--pv-blue), var(--pv-lavender))",
          }}
        >
          <Plus className="size-4" />
          {t.goals.addGoal}
        </button>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Target,
            value: allGoals.length,
            label: t.nav.goals,
            color: "var(--pv-blue)",
          },
          {
            icon: Trophy,
            value: activeGoals,
            label: t.goals.status.active,
            color: "var(--pv-green)",
          },
          {
            icon: Check,
            value: completedGoals,
            label: t.goals.status.completed,
            color: "var(--pv-lavender)",
          },
        ].map(({ icon: Icon, value, label, color }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="glass rounded-2xl p-4 text-center hover-lift"
          >
            <Icon className="size-5 mx-auto mb-1.5" style={{ color }} />
            <div className="text-xl font-extrabold text-foreground">
              {value}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-white/10 text-muted-foreground hover:bg-white/20",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredGoals.map((goal, i) => {
          const isExpanded = expandedGoalId === goal._id
          const completedMilestones =
            goal.milestones?.filter((m) => m.completed).length ?? 0
          const totalMilestones = goal.milestones?.length ?? 0

          return (
            <motion.div
              key={goal._id}
              custom={i + 3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="glass rounded-2xl p-5 space-y-3 hover-lift hover-green"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="rounded-xl bg-primary/20 p-2 shrink-0">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {goal.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {goal.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      getStatusColor(goal.status),
                    )}
                  >
                    {getStatusLabel(goal.status)}
                  </span>
                  <button
                    onClick={() =>
                      setExpandedGoalId(isExpanded ? null : goal._id)
                    }
                    className="text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center -mr-1"
                  >
                    {isExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {goal.description && (
                <p className="text-sm text-muted-foreground">
                  {goal.description}
                </p>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t.goals.progress}
                  </span>
                  <span className="font-medium text-foreground">
                    {goal.progress}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {goal.deadline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {t.goals.deadline}:{" "}
                    {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}

              {isExpanded && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  {totalMilestones > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        {t.goals.milestones} ({completedMilestones}/
                        {totalMilestones})
                      </p>
                      {goal.milestones.map(
                        (
                          milestone: { title: string; completed: boolean },
                          idx: number,
                        ) => (
                          <button
                            key={idx}
                            onClick={() => handleToggleMilestone(goal, idx)}
                            className="flex items-center gap-2 text-sm w-full text-left min-h-[44px] group"
                          >
                            <div
                              className={cn(
                                "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                milestone.completed
                                  ? "bg-primary border-primary"
                                  : "border-muted-foreground group-hover:border-primary",
                              )}
                            >
                              {milestone.completed && (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            <span
                              className={cn(
                                milestone.completed &&
                                  "line-through text-muted-foreground",
                              )}
                            >
                              {milestone.title}
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddMilestoneToGoal(goal)
                      }
                      placeholder={t.goals.milestonePlaceholder}
                      className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => handleAddMilestoneToGoal(goal)}
                      className="px-3 py-2 rounded-lg bg-white/10 text-sm font-medium hover:bg-white/20 transition-colors min-w-[44px]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleToggleStatus(goal)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm min-h-[44px] hover:bg-white/20 transition-colors"
                    >
                      <Check className="h-3 w-3" />
                      {goal.status === "completed"
                        ? t.goals.status.active
                        : t.goals.status.completed}
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-sm min-h-[44px] hover:bg-red-500/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t.goals.delete}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {filteredGoals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2 text-foreground">
            {t.goals.empty}
          </h3>
          <p className="text-muted-foreground mb-4">{t.goals.emptyDesc}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            {t.goals.addGoal}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {t.goals.addNewGoal}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center -mr-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <input
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
                placeholder={t.goals.goalTitle}
                className="w-full bg-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <input
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
                placeholder={t.goals.description}
                className="w-full bg-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              />
              <select
                value={newGoal.category}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, category: e.target.value })
                }
                className="w-full bg-white/10 rounded-lg px-3 py-2 text-sm text-foreground"
              >
                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={newGoal.deadline}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, deadline: e.target.value })
                }
                className="w-full bg-white/10 rounded-lg px-3 py-2 text-sm text-foreground"
              />

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {t.goals.milestones}
                </p>
                {newGoal.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex-1 text-sm text-foreground">
                      {m.title}
                    </span>
                    <button
                      onClick={() => handleRemoveMilestoneFromNew(idx)}
                      className="text-muted-foreground hover:text-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddMilestoneToNew()
                    }
                    placeholder={t.goals.milestonePlaceholder}
                    className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleAddMilestoneToNew}
                    className="px-3 py-2 rounded-lg bg-white/10 text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20 transition-colors min-h-[44px]"
                >
                  {t.goals.cancel}
                </button>
                <button
                  onClick={handleAddGoal}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors min-h-[44px]"
                >
                  {t.goals.addGoal}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
