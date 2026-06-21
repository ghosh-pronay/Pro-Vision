import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { t, type TranslationKey } from "@/i18n/translations";
import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  WifiOff,
  LayoutGrid,
  List,
  Sparkles,
} from "lucide-react";
import { handleMutationError, handleMutationSuccess } from "@/lib/toast";
import { toastSuccess, toastError } from "@/lib/toast-helpers";
import KanbanBoard from "@/components/tasks/KanbanBoard";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type Priority = "high" | "medium" | "low";

const PRIORITY_COLORS: Record<Priority, string> = {
  high: "var(--pv-orange)",
  medium: "var(--pv-blue)",
  low: "var(--pv-green)",
};

type ViewMode = "list" | "kanban";
type FilterTab = "all" | "today" | "important" | "scheduled";

const SUGGESTED_TASKS = [
  {
    icon: "📧",
    title: { en: "Check and reply to emails", bn: "ইমেইল চেক ও উত্তর দিন" },
    priority: "medium" as Priority,
    tags: ["productivity"],
  },
  {
    icon: "📋",
    title: { en: "Plan tomorrow's tasks", bn: "আগামীকালের কাজ পরিকল্পনা করুন" },
    priority: "high" as Priority,
    tags: ["productivity"],
  },
  {
    icon: "🛒",
    title: { en: "Buy groceries", bn: "বাজার থেকে কিনুন" },
    priority: "medium" as Priority,
    tags: ["errands"],
  },
  {
    icon: "💰",
    title: { en: "Review monthly budget", bn: "মাসিক বাজেট পর্যালোচনা করুন" },
    priority: "high" as Priority,
    tags: ["finance"],
  },
  {
    icon: "📞",
    title: { en: "Call a family member", bn: "পরিবারের কাউকে ফোন করুন" },
    priority: "low" as Priority,
    tags: ["social"],
  },
  {
    icon: "🧹",
    title: { en: "Do laundry", bn: "কাপড় ধুয়ে ফেলুন" },
    priority: "medium" as Priority,
    tags: ["errands"],
  },
  {
    icon: "💊",
    title: { en: "Take daily vitamins", bn: "দৈনিক ভিটামিন খান" },
    priority: "low" as Priority,
    tags: ["health"],
  },
  {
    icon: "📝",
    title: {
      en: "Update resume or portfolio",
      bn: "রিজিউমে বা পোর্টফোলিও আপডেট করুন",
    },
    priority: "medium" as Priority,
    tags: ["career"],
  },
  {
    icon: "🏠",
    title: {
      en: "Clean one room in the house",
      bn: "ঘরের একটি ঘর পরিষ্কার করুন",
    },
    priority: "medium" as Priority,
    tags: ["errands"],
  },
  {
    icon: "📖",
    title: {
      en: "Read an article or book chapter",
      bn: "একটি নিবন্ধ বা বইয়ের অধ্যায় পড়ুন",
    },
    priority: "low" as Priority,
    tags: ["learning"],
  },
  {
    icon: "🧘",
    title: {
      en: "Practice 5 minutes of mindfulness",
      bn: "৫ মিনিট মাইন্ডফুলনেস অনুশীলন করুন",
    },
    priority: "low" as Priority,
    tags: ["wellness"],
  },
  {
    icon: "💼",
    title: {
      en: "Organize work desk or files",
      bn: "কাজের টেবিল বা ফাইল সাজান",
    },
    priority: "medium" as Priority,
    tags: ["productivity"],
  },
  {
    icon: "🚶",
    title: { en: "Take a 15-minute walk", bn: "১৫ মিনিট হাঁটুন" },
    priority: "low" as Priority,
    tags: ["health"],
  },
  {
    icon: "🎁",
    title: {
      en: "Do something kind for someone",
      bn: "কারো জন্য ভালো কিছু করুন",
    },
    priority: "low" as Priority,
    tags: ["social"],
  },
  {
    icon: "📅",
    title: {
      en: "Set goals for the week",
      bn: "সপ্তাহের জন্য লক্ষ্য নির্ধারণ করুন",
    },
    priority: "high" as Priority,
    tags: ["productivity"],
  },
];

export default function Todo() {
  const { lang } = useLang();
  const allTasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  const toggleTask = useMutation(api.tasks.toggle);
  const removeTask = useMutation(api.tasks.remove);

  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newDescription, setNewDescription] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const isOffline = false;

  const filtered = (allTasks ?? []).filter((task) => {
    if (search && !task.title.toLowerCase().includes(search.toLowerCase()))
      return false;

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();
    const todayEnd = todayStart + 86400000;

    switch (filter) {
      case "today":
        if (!task.dueDate) return false;
        return task.dueDate >= todayStart && task.dueDate < todayEnd;
      case "important":
        return task.priority === "high";
      case "scheduled":
        return !!task.dueDate;
      default:
        return true;
    }
  });

  const addTask = async () => {
    if (!newTitle.trim()) return;
    try {
      await createTask({
        title: newTitle,
        priority: newPriority,
        description: newDescription || undefined,
      });
      setNewTitle("");
      setNewDescription("");
      setShowAdd(false);
      handleMutationSuccess(lang === "bn" ? "টাস্ক যোগ হয়েছে" : "Task added");
    } catch (error) {
      handleMutationError(
        error,
        lang === "bn" ? "টাস্ক যোগ করতে ব্যর্থ" : "Failed to add task",
      );
    }
  };

  const handleToggle = async (taskId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await toggleTask({ id: taskId as any });
    } catch (error) {
      handleMutationError(
        error,
        lang === "bn" ? "টাস্ক আপডেট করতে ব্যর্থ" : "Failed to update task",
      );
    }
  };

  const handleRemove = async (taskId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await removeTask({ id: taskId as any });
      handleMutationSuccess(
        lang === "bn" ? "টাস্ক মুছে ফেলা হয়েছে" : "Task deleted",
      );
    } catch (error) {
      handleMutationError(
        error,
        lang === "bn" ? "টাস্ক মুছে ফেলতে ব্যর্থ" : "Failed to delete task",
      );
    }
  };

  const formatDue = (ts?: number) => {
    if (!ts) return "";
    const d = new Date(ts);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    if (diff < 0 && diff > -86400000) return lang === "bn" ? "আজ" : "Today";
    if (diff > 0 && diff < 86400000) return lang === "bn" ? "আজ" : "Today";
    if (diff > 86400000 && diff < 172800000)
      return lang === "bn" ? "আগামীকাল" : "Tomorrow";
    return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const kanbanColumns = useMemo(() => {
    const tasks = filtered;
    return [
      {
        id: "todo",
        title: lang === "bn" ? "করণীয়" : "To Do",
        tasks: tasks
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((task: any) => !task.completed)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((task: any) => ({
            id: task._id,
            title: task.title,
            description: task.description,
            priority: (task.priority as "low" | "medium" | "high") ?? "medium",
            dueDate: task.dueDate,
            tags: task.tags,
          })),
      },
      {
        id: "done",
        title: lang === "bn" ? "সম্পন্ন" : "Done",
        tasks: tasks
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((task: any) => task.completed)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((task: any) => ({
            id: task._id,
            title: task.title,
            description: task.description,
            priority: (task.priority as "low" | "medium" | "high") ?? "medium",
            dueDate: task.dueDate,
            tags: task.tags,
          })),
      },
    ];
  }, [filtered, lang]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doneCount = (allTasks ?? []).filter((t: any) => t.completed).length;
  const totalCount = (allTasks ?? []).length;

  const FILTER_LABELS: Record<FilterTab, string> = {
    all: t("todo.filter.all" as TranslationKey, lang),
    today: lang === "bn" ? "আজ" : "Today",
    important: lang === "bn" ? "গুরুত্বপূর্ণ" : "Important",
    scheduled: lang === "bn" ? "নির্ধারিত" : "Scheduled",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-[var(--pv-orange)]"
        >
          <WifiOff className="size-3.5" />
          {lang === "bn"
            ? "অফলাইন — সর্বশেষ সংরক্ষিত ডেটা দেখাচ্ছে"
            : "Offline — showing last saved data"}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("nav.todo", lang)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {doneCount}/{totalCount} {t("todo.completed", lang)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex glass rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-all ${viewMode === "list" ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]" : "text-muted-foreground hover:text-foreground hover-tab"}`}
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 transition-all ${viewMode === "kanban" ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]" : "text-muted-foreground hover:text-foreground hover-tab"}`}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))",
            }}
          >
            <Plus className="size-4" />
            {t("todo.addTask", lang)}
          </button>
        </div>
      </motion.div>

      {showAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="glass-strong rounded-2xl p-4">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder={t("todo.placeholder", lang)}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none mb-3"
              autoFocus
            />
            <input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder={
                lang === "bn" ? "বিবরণ (ঐচ্ছিক)" : "Description (optional)"
              }
              className="w-full bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/60 outline-none mb-3"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(["high", "medium", "low"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${newPriority === p ? "glass" : "text-muted-foreground hover:bg-foreground/5"}`}
                    style={
                      newPriority === p
                        ? { color: PRIORITY_COLORS[p] }
                        : undefined
                    }
                  >
                    {t(`todo.priority.${p}` as TranslationKey, lang)}
                  </button>
                ))}
              </div>
              <button
                onClick={addTask}
                className="text-sm font-semibold text-[var(--pv-blue)] hover:underline"
              >
                {t("todo.add", lang)}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3">
        <div className="glass rounded-xl px-3 py-2 flex items-center gap-2 flex-1">
          <span className="text-muted-foreground">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("todo.search", lang)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>
        <div className="flex glass rounded-xl overflow-hidden">
          {(["all", "today", "important", "scheduled"] as FilterTab[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-xs font-medium transition-all ${filter === f ? "bg-[var(--pv-blue)]/10 text-[var(--pv-blue)]" : "text-muted-foreground hover:text-foreground hover-tab"}`}
              >
                {FILTER_LABELS[f]}
              </button>
            ),
          )}
        </div>
      </div>

      {(allTasks ?? []).length < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 px-1 mb-3">
            <Sparkles className="size-4 text-[var(--pv-blue)]" />
            <span className="text-sm font-semibold text-foreground">
              {lang === "bn" ? "জনপ্রিয় কাজ" : "Suggested Tasks"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {lang === "bn" ? "এক ক্লিকে যোগ করুন" : "Add with one click"}
            </span>
          </div>
          <div
            className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
            role="list"
            aria-label={lang === "bn" ? "জনপ্রিয় কাজ" : "Suggested Tasks"}
          >
            {SUGGESTED_TASKS.map((task) => {
              const alreadyAdded = (allTasks ?? []).some(
                (existing) =>
                  existing.title === task.title[lang] ||
                  existing.title === task.title.en ||
                  existing.title === task.title.bn,
              );
              return (
                <button
                  key={task.title.en}
                  disabled={alreadyAdded}
                  onClick={async () => {
                    if (alreadyAdded) return;
                    try {
                      await createTask({
                        title: task.title[lang],
                        priority: task.priority,
                        tags: task.tags,
                      });
                      toastSuccess(
                        lang === "bn"
                          ? `"${task.title[lang]}" যোগ হয়েছে!`
                          : `"${task.title[lang]}" added!`,
                      );
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    } catch (error) {
                      toastError(
                        lang === "bn"
                          ? "টাস্ক যোগ করতে ব্যর্থ হয়েছে"
                          : "Failed to add task",
                      );
                    }
                  }}
                  className={`flex items-center gap-2 shrink-0 px-3 py-2 rounded-xl border transition-all ${
                    alreadyAdded
                      ? "border-[var(--pv-green)]/30 bg-[var(--pv-green)]/5 opacity-60 cursor-default"
                      : "border-border/30 hover:border-[var(--pv-green)]/50 hover:bg-[var(--pv-green)]/5 active:scale-95"
                  }`}
                >
                  <span className="text-lg">{task.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-medium text-foreground whitespace-nowrap">
                      {task.title[lang]}
                    </div>
                    <div
                      className="text-[10px] whitespace-nowrap"
                      style={{ color: PRIORITY_COLORS[task.priority] }}
                    >
                      {t(
                        `todo.priority.${task.priority}` as TranslationKey,
                        lang,
                      )}
                    </div>
                  </div>
                  {alreadyAdded ? (
                    <CheckCircle2 className="size-4 text-[var(--pv-green)] shrink-0" />
                  ) : (
                    <Plus className="size-4 text-muted-foreground shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {viewMode === "kanban" ? (
        <div className="overflow-x-auto">
          <KanbanBoard
            columns={kanbanColumns}
            onColumnsChange={() => {}}
            onTaskMove={async (taskId, fromColumn, toColumn) => {
              if (fromColumn === "todo" && toColumn === "done") {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await toggleTask({ id: taskId as any });
                } catch (error) {
                  handleMutationError(
                    error,
                    lang === "bn"
                      ? "টাস্ক আপডেট করতে ব্যর্থ"
                      : "Failed to update task",
                  );
                }
              } else if (fromColumn === "done" && toColumn === "todo") {
                try {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  await toggleTask({ id: taskId as any });
                } catch (error) {
                  handleMutationError(
                    error,
                    lang === "bn"
                      ? "টাস্ক আপডেট করতে ব্যর্থ"
                      : "Failed to update task",
                  );
                }
              }
            }}
            onTaskAdd={async (columnId, task) => {
              try {
                await createTask({
                  title: task.title,
                  priority: task.priority,
                  description: task.description,
                  dueDate: task.dueDate,
                  tags: task.tags,
                });
                handleMutationSuccess(
                  lang === "bn" ? "টাস্ক যোগ হয়েছে" : "Task added",
                );
              } catch (error) {
                handleMutationError(
                  error,
                  lang === "bn"
                    ? "টাস্ক যোগ করতে ব্যর্থ"
                    : "Failed to add task",
                );
              }
            }}
            onTaskDelete={async (taskId) => {
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await removeTask({ id: taskId as any });
                handleMutationSuccess(
                  lang === "bn" ? "টাস্ক মুছে ফেলা হয়েছে" : "Task deleted",
                );
              } catch (error) {
                handleMutationError(
                  error,
                  lang === "bn"
                    ? "টাস্ক মুছে ফেলতে ব্যর্থ"
                    : "Failed to delete task",
                );
              }
            }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <CheckCircle2 className="size-10 mx-auto mb-3 text-[var(--pv-green)] opacity-50" />
              <p className="text-sm text-muted-foreground">
                {t("todo.empty", lang)}
              </p>
            </div>
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filtered.map((task: any, i: number) => (
            <motion.div
              key={task._id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="glass rounded-xl px-4 py-3 flex items-center gap-3 group hover-row"
            >
              <button
                onClick={() => handleToggle(task._id)}
                className="shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="size-5 text-[var(--pv-green)]" />
                ) : (
                  <Circle className="size-5 text-muted-foreground hover:text-[var(--pv-blue)] transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
                >
                  {task.title}
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                    style={{
                      background: `${PRIORITY_COLORS[(task.priority as Priority) ?? "medium"]}15`,
                      color:
                        PRIORITY_COLORS[
                          (task.priority as Priority) ?? "medium"
                        ],
                    }}
                  >
                    {t(
                      `todo.priority.${(task.priority as Priority) ?? "medium"}` as TranslationKey,
                      lang,
                    )}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Calendar className="size-2.5" />
                      {formatDue(task.dueDate)}
                    </span>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1 py-0.5 rounded bg-foreground/5 text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 2 && (
                        <span className="text-[10px] text-muted-foreground/60">
                          +{task.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemove(task._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
              >
                <Trash2 className="size-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
