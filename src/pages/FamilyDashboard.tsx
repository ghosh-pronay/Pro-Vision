import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  Users,
  Target,
  Receipt,
  UtensilsCrossed,
  CalendarDays,
  ListChecks,
  MessageSquare,
  Heart,
  Trophy,
  X,
} from "lucide-react";

import type {
  FamilyMember,
  FamilyGoal,
  FamilyExpense,
  FamilyTask,
  FamilyMessage,
  FamilyEvent,
  MemberRole,
  ExpenseCategory,
  TaskStatus,
  ModalType,
  ActiveSection,
  ModalForm,
} from "@/components/family/FamilyTypes";

import {
  AVATARS,
  ROLE_CONFIG,
  EXPENSE_CATEGORIES,
  EVENT_TYPES,
  INITIAL_MEMBERS,
  INITIAL_GOALS,
  INITIAL_EXPENSES,
  INITIAL_TASKS,
  INITIAL_EVENTS,
} from "@/components/family/FamilyConstants";

import MembersTab from "@/components/family/MembersTab";
import GoalsTab from "@/components/family/GoalsTab";
import ExpensesTab from "@/components/family/ExpensesTab";
import MealsTab from "@/components/family/MealsTab";
import CalendarTab from "@/components/family/CalendarTab";
import TasksTab from "@/components/family/TasksTab";
import MessagesTab from "@/components/family/MessagesTab";
import HealthTab from "@/components/family/HealthTab";
import CelebrationsTab from "@/components/family/CelebrationsTab";

const now = Date.now();

export default function FamilyDashboard() {
  const { lang } = useLang();

  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_MEMBERS);

  const [goals, setGoals] = useState<FamilyGoal[]>(INITIAL_GOALS);

  const [expenses, setExpenses] = useState<FamilyExpense[]>(INITIAL_EXPENSES);

  const [tasks, setTasks] = useState<FamilyTask[]>(INITIAL_TASKS);

  const [messages, setMessages] = useState<FamilyMessage[]>([
    {
      id: "1",
      text:
        lang === "bn"
          ? "আজ রাতে পরিবারের খাওয়া আছে!"
          : "Family dinner tonight!",
      author: "1",
      timestamp: now - 3600000,
    },
    {
      id: "2",
      text:
        lang === "bn"
          ? "আমি বাজার থেকে ফল এনেছি"
          : "I brought fruits from the market",
      author: "2",
      timestamp: now - 7200000,
    },
    {
      id: "3",
      text:
        lang === "bn"
          ? "সামিরের স্কুলের পরীক্ষা আগামীকাল"
          : "Samir's exam is tomorrow",
      author: "2",
      timestamp: now - 14400000,
    },
    {
      id: "4",
      text: lang === "bn" ? "আমি সকালে বাড়ি ফিরব" : "I'll be home by morning",
      author: "1",
      timestamp: now - 28800000,
    },
  ]);

  const [events, setEvents] = useState<FamilyEvent[]>(INITIAL_EVENTS);

  const [activeSection, setActiveSection] = useState<ActiveSection>("members");

  const [showModal, setShowModal] = useState<ModalType>(null);

  const [modalForm, setModalForm] = useState<ModalForm>({
    name: "",
    role: "parent",
    avatar: "👨",
    title: "",
    description: "",
    amount: 0,
    category: "food",
    assignedTo: "",
    status: "todo",
    eventType: "birthday",
    date: "",
    messageText: "",
    progress: 0,
    target: 100,
    deadline: "",
    paidBy: "",
  });

  const [newMessage, setNewMessage] = useState("");

  const [budget, setBudget] = useState(50000);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );

  const expensesByCategory = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      food: 0,
      utilities: 0,
      entertainment: 0,
      education: 0,
      healthcare: 0,
      transport: 0,
      others: 0,
    };
    expenses.forEach((e) => {
      map[e.category] += e.amount;
    });
    return map;
  }, [expenses]);

  const splitAmounts = useMemo(() => {
    const splits: Record<string, number> = {};
    members.forEach((m) => {
      splits[m.id] = 0;
    });
    expenses.forEach((e) => {
      const share = e.amount / e.splitWith.length;
      e.splitWith.forEach((id) => {
        splits[id] = (splits[id] || 0) + share;
      });
    });
    return splits;
  }, [expenses, members]);

  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter((t) => t.status === "todo"),
      "in-progress": tasks.filter((t) => t.status === "in-progress"),
      done: tasks.filter((t) => t.status === "done"),
    };
  }, [tasks]);

  const todayMeals = useMemo(
    () => ({
      breakfast: {
        name: lang === "bn" ? "পরোটা ও ডিম" : "Paratha & Eggs",
        calories: 450,
      },
      lunch: {
        name: lang === "bn" ? "ভাত, মাছ ও তরকারি" : "Rice, Fish & Curry",
        calories: 650,
      },
      dinner: {
        name: lang === "bn" ? "রুটি ও চিকেন" : "Roti & Chicken",
        calories: 550,
      },
    }),
    [lang],
  );

  const resetModalForm = () => {
    setModalForm({
      name: "",
      role: "parent",
      avatar: "👨",
      title: "",
      description: "",
      amount: 0,
      category: "food",
      assignedTo: "",
      status: "todo",
      eventType: "birthday",
      date: "",
      messageText: "",
      progress: 0,
      target: 100,
      deadline: "",
      paidBy: "",
    });
  };

  const handleAddMember = () => {
    if (!modalForm.name.trim()) return;
    setMembers([
      ...members,
      {
        id: Date.now().toString(),
        name: modalForm.name,
        role: modalForm.role,
        avatar: modalForm.avatar,
        birthday: modalForm.date
          ? new Date(modalForm.date).getTime()
          : undefined,
      },
    ]);
    resetModalForm();
    setShowModal(null);
  };

  const handleAddGoal = () => {
    if (!modalForm.title.trim()) return;
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        title: modalForm.title,
        description: modalForm.description,
        progress: 0,
        target: modalForm.target || 100,
        assignedTo: modalForm.assignedTo || undefined,
        deadline: modalForm.deadline
          ? new Date(modalForm.deadline).getTime()
          : undefined,
      },
    ]);
    resetModalForm();
    setShowModal(null);
  };

  const handleAddExpense = () => {
    if (!modalForm.title.trim() || modalForm.amount <= 0) return;
    const splitWith = modalForm.paidBy
      ? [modalForm.paidBy]
      : members.map((m) => m.id);
    setExpenses([
      ...expenses,
      {
        id: Date.now().toString(),
        title: modalForm.title,
        amount: modalForm.amount,
        category: modalForm.category,
        date: Date.now(),
        paidBy: modalForm.paidBy || members[0]?.id || "",
        splitWith,
      },
    ]);
    resetModalForm();
    setShowModal(null);
  };

  const handleAddTask = () => {
    if (!modalForm.title.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title: modalForm.title,
        status: modalForm.status,
        assignedTo: modalForm.assignedTo || members[0]?.id || "",
        dueDate: modalForm.deadline
          ? new Date(modalForm.deadline).getTime()
          : undefined,
      },
    ]);
    resetModalForm();
    setShowModal(null);
  };

  const handleAddEvent = () => {
    if (!modalForm.title.trim() || !modalForm.date) return;
    setEvents([
      ...events,
      {
        id: Date.now().toString(),
        title: modalForm.title,
        date: new Date(modalForm.date).getTime(),
        type: modalForm.eventType,
        description: modalForm.description,
      },
    ]);
    resetModalForm();
    setShowModal(null);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        text: newMessage,
        author: members[0]?.id || "",
        timestamp: Date.now(),
      },
    ]);
    setNewMessage("");
  };

  const handleDeleteItem = (
    type: "member" | "goal" | "expense" | "task" | "event" | "message",
    id: string,
  ) => {
    switch (type) {
      case "member":
        setMembers(members.filter((m) => m.id !== id));
        break;
      case "goal":
        setGoals(goals.filter((g) => g.id !== id));
        break;
      case "expense":
        setExpenses(expenses.filter((e) => e.id !== id));
        break;
      case "task":
        setTasks(tasks.filter((t) => t.id !== id));
        break;
      case "event":
        setEvents(events.filter((e) => e.id !== id));
        break;
      case "message":
        setMessages(messages.filter((m) => m.id !== id));
        break;
    }
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );
  };

  const handleUpdateGoalProgress = (goalId: string, increment: number) => {
    setGoals(
      goals.map((g) =>
        g.id === goalId
          ? { ...g, progress: Math.min(g.progress + increment, g.target) }
          : g,
      ),
    );
  };

  const sections = [
    {
      key: "members" as const,
      icon: Users,
      label: lang === "bn" ? "সদস্য" : "Members",
    },
    {
      key: "goals" as const,
      icon: Target,
      label: lang === "bn" ? "লক্ষ্য" : "Goals",
    },
    {
      key: "expenses" as const,
      icon: Receipt,
      label: lang === "bn" ? "খরচ" : "Expenses",
    },
    {
      key: "meals" as const,
      icon: UtensilsCrossed,
      label: lang === "bn" ? "খাবার" : "Meals",
    },
    {
      key: "calendar" as const,
      icon: CalendarDays,
      label: lang === "bn" ? "ক্যালেন্ডার" : "Calendar",
    },
    {
      key: "tasks" as const,
      icon: ListChecks,
      label: lang === "bn" ? "কাজ" : "Tasks",
    },
    {
      key: "messages" as const,
      icon: MessageSquare,
      label: lang === "bn" ? "বার্তা" : "Messages",
    },
    {
      key: "health" as const,
      icon: Heart,
      label: lang === "bn" ? "স্বাস্থ্য" : "Health",
    },
    {
      key: "celebrations" as const,
      icon: Trophy,
      label: lang === "bn" ? "উদযাপন" : "Celebrations",
    },
  ];

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xl">
            👨‍👩‍👧‍👦
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {lang === "bn" ? "পরিবার ড্যাশবোর্ড" : "Family Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {members.length} {lang === "bn" ? "সদস্য" : "members"} •{" "}
              {goals.filter((g) => g.progress < g.target).length}{" "}
              {lang === "bn" ? "সক্রিয় লক্ষ্য" : "active goals"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === s.key
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg"
                : "glass hover:bg-white/10"
            }`}
          >
            <s.icon className="size-4" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === "members" && (
            <MembersTab
              members={members}
              lang={lang}
              onAddClick={() => setShowModal("member")}
              onDelete={(id) => handleDeleteItem("member", id)}
            />
          )}

          {activeSection === "goals" && (
            <GoalsTab
              goals={goals}
              members={members}
              lang={lang}
              onAddClick={() => setShowModal("goal")}
              onDelete={(id) => handleDeleteItem("goal", id)}
              onUpdateProgress={handleUpdateGoalProgress}
            />
          )}

          {activeSection === "expenses" && (
            <ExpensesTab
              expenses={expenses}
              members={members}
              lang={lang}
              onAddClick={() => setShowModal("expense")}
              onDelete={(id) => handleDeleteItem("expense", id)}
              budget={budget}
              setBudget={setBudget}
              totalExpenses={totalExpenses}
              expensesByCategory={expensesByCategory}
              splitAmounts={splitAmounts}
            />
          )}

          {activeSection === "meals" && (
            <MealsTab lang={lang} todayMeals={todayMeals} />
          )}

          {activeSection === "calendar" && (
            <CalendarTab
              events={events}
              lang={lang}
              onAddClick={() => setShowModal("event")}
              onDelete={(id) => handleDeleteItem("event", id)}
            />
          )}

          {activeSection === "tasks" && (
            <TasksTab
              tasks={tasks}
              members={members}
              lang={lang}
              onAddClick={() => setShowModal("task")}
              onDelete={(id) => handleDeleteItem("task", id)}
              onUpdateStatus={handleUpdateTaskStatus}
              tasksByStatus={tasksByStatus}
            />
          )}

          {activeSection === "messages" && (
            <MessagesTab
              messages={messages}
              members={members}
              lang={lang}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSend={handleSendMessage}
              onDelete={(id) => handleDeleteItem("message", id)}
            />
          )}

          {activeSection === "health" && (
            <HealthTab events={events} members={members} lang={lang} />
          )}

          {activeSection === "celebrations" && (
            <CelebrationsTab
              events={events}
              lang={lang}
              onDelete={(id) => handleDeleteItem("event", id)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Add Member Modal */}
              {showModal === "member" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {lang === "bn" ? "সদস্য যোগ করুন" : "Add Family Member"}
                    </h3>
                    <button
                      onClick={() => setShowModal(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  {/* Avatar Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {lang === "bn" ? "অবতার" : "Avatar"}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {AVATARS.map((av) => (
                        <button
                          key={av}
                          onClick={() =>
                            setModalForm({ ...modalForm, avatar: av })
                          }
                          className={`text-2xl p-2 rounded-xl transition-all ${
                            modalForm.avatar === av
                              ? "bg-pink-500/20 ring-2 ring-pink-500"
                              : "bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "নাম" : "Name"}
                    </label>
                    <input
                      type="text"
                      value={modalForm.name}
                      onChange={(e) =>
                        setModalForm({ ...modalForm, name: e.target.value })
                      }
                      placeholder={
                        lang === "bn" ? "সদস্যের নাম" : "Member name"
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-pink-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "ভূমিকা" : "Role"}
                    </label>
                    <select
                      value={modalForm.role}
                      onChange={(e) =>
                        setModalForm({
                          ...modalForm,
                          role: e.target.value as MemberRole,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-pink-500/50"
                    >
                      {Object.entries(ROLE_CONFIG).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val[lang as "en" | "bn"]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn"
                        ? "জন্মদিন (ঐচ্ছিক)"
                        : "Birthday (optional)"}
                    </label>
                    <input
                      type="date"
                      value={modalForm.date}
                      onChange={(e) =>
                        setModalForm({ ...modalForm, date: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-pink-500/50"
                    />
                  </div>

                  <button
                    onClick={handleAddMember}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium hover:brightness-110 transition-all"
                  >
                    {lang === "bn" ? "যোগ করুন" : "Add Member"}
                  </button>
                </div>
              )}

              {/* Add Goal Modal */}
              {showModal === "goal" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {lang === "bn" ? "নতুন লক্ষ্য যোগ করুন" : "Add New Goal"}
                    </h3>
                    <button
                      onClick={() => setShowModal(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "শিরোনাম" : "Title"}
                    </label>
                    <input
                      type="text"
                      value={modalForm.title}
                      onChange={(e) =>
                        setModalForm({ ...modalForm, title: e.target.value })
                      }
                      placeholder={
                        lang === "bn" ? "লক্ষ্যের শিরোনাম" : "Goal title"
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "বিবরণ" : "Description"}
                    </label>
                    <textarea
                      value={modalForm.description}
                      onChange={(e) =>
                        setModalForm({
                          ...modalForm,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {lang === "bn" ? "লক্ষ্য" : "Target"}
                      </label>
                      <input
                        type="number"
                        value={modalForm.target}
                        onChange={(e) =>
                          setModalForm({
                            ...modalForm,
                            target: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {lang === "bn" ? "শেষ তারিখ" : "Deadline"}
                      </label>
                      <input
                        type="date"
                        value={modalForm.deadline}
                        onChange={(e) =>
                          setModalForm({
                            ...modalForm,
                            deadline: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "দায়িত্বপ্রাপ্ত" : "Assigned to"}
                    </label>
                    <select
                      value={modalForm.assignedTo}
                      onChange={(e) =>
                        setModalForm({
                          ...modalForm,
                          assignedTo: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">
                        {lang === "bn" ? "নির্বাচন করুন" : "Select"}
                      </option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.avatar} {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddGoal}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:brightness-110 transition-all"
                  >
                    {lang === "bn" ? "যোগ করুন" : "Add Goal"}
                  </button>
                </div>
              )}

              {/* Add Expense Modal */}
              {showModal === "expense" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {lang === "bn" ? "খরচ যোগ করুন" : "Add Expense"}
                    </h3>
                    <button
                      onClick={() => setShowModal(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "শিরোনাম" : "Title"}
                    </label>
                    <input
                      type="text"
                      value={modalForm.title}
                      onChange={(e) =>
                        setModalForm({ ...modalForm, title: e.target.value })
                      }
                      placeholder={
                        lang === "bn" ? "খরচের শিরোনাম" : "Expense title"
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {lang === "bn" ? "পরিমাণ (৳)" : "Amount (৳)"}
                      </label>
                      <input
                        type="number"
                        value={modalForm.amount || ""}
                        onChange={(e) =>
                          setModalForm({
                            ...modalForm,
                            amount: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {lang === "bn" ? "ক্যাটাগরি" : "Category"}
                      </label>
                      <select
                        value={modalForm.category}
                        onChange={(e) =>
                          setModalForm({
                            ...modalForm,
                            category: e.target.value as ExpenseCategory,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500/50"
                      >
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat.key} value={cat.key}>
                            {cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "কে পেমেন্ট করেছেন" : "Paid by"}
                    </label>
                    <select
                      value={modalForm.paidBy}
                      onChange={(e) =>
                        setModalForm({ ...modalForm, paidBy: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="">
                        {lang === "bn" ? "নির্বাচন করুন" : "Select"}
                      </option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.avatar} {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleAddExpense}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:brightness-110 transition-all"
                  >
                    {lang === "bn" ? "যোগ করুন" : "Add Expense"}
                  </button>
                </div>
              )}

              {/* Add Task Modal */}
              {showModal === "task" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {lang === "bn" ? "কাজ যোগ করুন" : "Add Task"}
                    </h3>
                    <button
                      onClick={() => setShowModal(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "শিরোনাম" : "Title"}
                    </label>
                    <input
                      type="text"
                      value={modalForm.title}
                      onChange={(e) =>
                        setModalForm({ ...modalForm, title: e.target.value })
                      }
                      placeholder={
                        lang === "bn" ? "কাজের শিরোনাম" : "Task title"
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {lang === "bn" ? "দায়িত্বপ্রাপ্ত" : "Assigned to"}
                      </label>
                      <select
                        value={modalForm.assignedTo}
                        onChange={(e) =>
                          setModalForm({
                            ...modalForm,
                            assignedTo: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.avatar} {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {lang === "bn" ? "শেষ তারিখ" : "Due Date"}
                      </label>
                      <input
                        type="date"
                        value={modalForm.deadline}
                        onChange={(e) =>
                          setModalForm({
                            ...modalForm,
                            deadline: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddTask}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:brightness-110 transition-all"
                  >
                    {lang === "bn" ? "যোগ করুন" : "Add Task"}
                  </button>
                </div>
              )}

              {/* Add Event Modal */}
              {showModal === "event" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {lang === "bn" ? "অনুষ্ঠান যোগ করুন" : "Add Event"}
                    </h3>
                    <button
                      onClick={() => setShowModal(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "শিরোনাম" : "Title"}
                    </label>
                    <input
                      type="text"
                      value={modalForm.title}
                      onChange={(e) =>
                        setModalForm({ ...modalForm, title: e.target.value })
                      }
                      placeholder={
                        lang === "bn" ? "অনুষ্ঠানের শিরোনাম" : "Event title"
                      }
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {lang === "bn" ? "তারিখ" : "Date"}
                      </label>
                      <input
                        type="date"
                        value={modalForm.date}
                        onChange={(e) =>
                          setModalForm({ ...modalForm, date: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {lang === "bn" ? "ধরন" : "Type"}
                      </label>
                      <select
                        value={modalForm.eventType}
                        onChange={(e) =>
                          setModalForm({
                            ...modalForm,
                            eventType: e.target.value as FamilyEvent["type"],
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
                      >
                        {EVENT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn"
                        ? "বিবরণ (ঐচ্ছিক)"
                        : "Description (optional)"}
                    </label>
                    <textarea
                      value={modalForm.description}
                      onChange={(e) =>
                        setModalForm({
                          ...modalForm,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleAddEvent}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium hover:brightness-110 transition-all"
                  >
                    {lang === "bn" ? "যোগ করুন" : "Add Event"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
