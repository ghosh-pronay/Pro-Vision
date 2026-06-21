import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  Users,
  Plus,
  X,
  Target,
  Receipt,
  UtensilsCrossed,
  CalendarDays,
  ListChecks,
  MessageSquare,
  Heart,
  Trophy,
  Wallet,
  Cake,
  Syringe,
  Stethoscope,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronRight,
  Trash2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Edit3,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Check,
  Clock,
  Send,
  Star,
  TrendingUp,
  UserPlus,
  Calendar,
  Megaphone,
  PartyPopper,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Dumbbell,
  Droplets,
  Moon,
  Sun,
  Coffee,
} from "lucide-react";

type TaskStatus = "todo" | "in-progress" | "done";
type ExpenseCategory =
  | "food"
  | "utilities"
  | "entertainment"
  | "education"
  | "healthcare"
  | "transport"
  | "others";
type MemberRole = "parent" | "child" | "grandparent" | "sibling";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type MealType = "breakfast" | "lunch" | "dinner";

interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string;
  birthday?: number;
}

interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  assignedTo?: string;
  deadline?: number;
}

interface FamilyExpense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: number;
  paidBy: string;
  splitWith: string[];
}

interface FamilyTask {
  id: string;
  title: string;
  status: TaskStatus;
  assignedTo: string;
  dueDate?: number;
}

interface FamilyMessage {
  id: string;
  text: string;
  author: string;
  timestamp: number;
}

interface FamilyEvent {
  id: string;
  title: string;
  date: number;
  type: "birthday" | "anniversary" | "vaccination" | "checkup" | "other";
  description?: string;
}

const AVATARS = ["👨", "👩", "👦", "👧", "👴", "👵", "🧑", "👶"];

const ROLE_CONFIG: Record<
  MemberRole,
  { en: string; bn: string; color: string }
> = {
  parent: {
    en: "Parent",
    bn: "বাবা/মা",
    color: "text-blue-500 bg-blue-500/10",
  },
  child: { en: "Child", bn: "সন্তান", color: "text-green-500 bg-green-500/10" },
  grandparent: {
    en: "Grandparent",
    bn: "দাদা/দিদা",
    color: "text-purple-500 bg-purple-500/10",
  },
  sibling: {
    en: "Sibling",
    bn: "ভাই/বোন",
    color: "text-orange-500 bg-orange-500/10",
  },
};

const EXPENSE_CATEGORIES: {
  key: ExpenseCategory;
  icon: typeof UtensilsCrossed;
  color: string;
}[] = [
  { key: "food", icon: UtensilsCrossed, color: "text-amber-500" },
  { key: "utilities", icon: Droplets, color: "text-blue-500" },
  { key: "entertainment", icon: PartyPopper, color: "text-purple-500" },
  { key: "education", icon: Star, color: "text-green-500" },
  { key: "healthcare", icon: Heart, color: "text-red-500" },
  { key: "transport", icon: Calendar, color: "text-cyan-500" },
  { key: "others", icon: Megaphone, color: "text-gray-500" },
];

const EVENT_TYPES = [
  "birthday",
  "anniversary",
  "vaccination",
  "checkup",
  "other",
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export default function FamilyDashboard() {
  const { lang } = useLang();

  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: "1",
      name: "Rahim Ahmed",
      role: "parent",
      avatar: "👨",
      // eslint-disable-next-line react-hooks/purity
      birthday: Date.now() - 365 * 24 * 60 * 60 * 1000 * 30,
    },
    {
      id: "2",
      name: "Fatima Rahman",
      role: "parent",
      avatar: "👩",
      // eslint-disable-next-line react-hooks/purity
      birthday: Date.now() - 365 * 24 * 60 * 60 * 1000 * 28,
    },
    {
      id: "3",
      name: "Samir Ahmed",
      role: "child",
      avatar: "👦",
      // eslint-disable-next-line react-hooks/purity
      birthday: Date.now() - 365 * 24 * 60 * 60 * 1000 * 8,
    },
    {
      id: "4",
      name: "Nadia Ahmed",
      role: "child",
      avatar: "👧",
      // eslint-disable-next-line react-hooks/purity
      birthday: Date.now() - 365 * 24 * 60 * 60 * 1000 * 5,
    },
  ]);

  const [goals, setGoals] = useState<FamilyGoal[]>([
    {
      id: "1",
      title: "Save for vacation",
      description: "Save ৳100,000 for Cox's Bazar trip",
      progress: 65000,
      target: 100000,
      assignedTo: "1",
      // eslint-disable-next-line react-hooks/purity
      deadline: Date.now() + 90 * 24 * 60 * 60 * 1000,
    },
    {
      id: "2",
      title: "Family fitness",
      description: "Exercise together 3x per week for a month",
      progress: 8,
      target: 12,
      // eslint-disable-next-line react-hooks/purity
      deadline: Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
    {
      id: "3",
      title: "Read 10 books together",
      description: "Family reading challenge",
      progress: 4,
      target: 10,
      // eslint-disable-next-line react-hooks/purity
      deadline: Date.now() + 180 * 24 * 60 * 60 * 1000,
    },
  ]);

  const [expenses, setExpenses] = useState<FamilyExpense[]>([
    {
      id: "1",
      title: "Monthly Groceries",
      amount: 8500,
      category: "food",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 2 * 24 * 60 * 60 * 1000,
      paidBy: "1",
      splitWith: ["1", "2"],
    },
    {
      id: "2",
      title: "Electricity Bill",
      amount: 3200,
      category: "utilities",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 5 * 24 * 60 * 60 * 1000,
      paidBy: "2",
      splitWith: ["1", "2", "3", "4"],
    },
    {
      id: "3",
      title: "School Fees - Samir",
      amount: 12000,
      category: "education",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 10 * 24 * 60 * 60 * 1000,
      paidBy: "1",
      splitWith: ["1"],
    },
    {
      id: "4",
      title: "Movie Tickets",
      amount: 2000,
      category: "entertainment",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 3 * 24 * 60 * 60 * 1000,
      paidBy: "1",
      splitWith: ["1", "2", "3", "4"],
    },
    {
      id: "5",
      title: "Doctor Visit - Nadia",
      amount: 1500,
      category: "healthcare",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 7 * 24 * 60 * 60 * 1000,
      paidBy: "2",
      splitWith: ["1", "2"],
    },
  ]);

  const [tasks, setTasks] = useState<FamilyTask[]>([
    {
      id: "1",
      title: "Fix kitchen tap",
      status: "todo",
      assignedTo: "1",
      // eslint-disable-next-line react-hooks/purity
      dueDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
    },
    {
      id: "2",
      title: "Clean living room",
      status: "in-progress",
      assignedTo: "3",
      // eslint-disable-next-line react-hooks/purity
      dueDate: Date.now() + 1 * 24 * 60 * 60 * 1000,
    },
    {
      id: "3",
      title: "Buy groceries",
      status: "done",
      assignedTo: "2",
    },
    {
      id: "4",
      title: "Wash the car",
      status: "todo",
      assignedTo: "1",
      // eslint-disable-next-line react-hooks/purity
      dueDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
    },
    {
      id: "5",
      title: "Water the plants",
      status: "in-progress",
      assignedTo: "4",
      // eslint-disable-next-line react-hooks/purity
      dueDate: Date.now(),
    },
    {
      id: "6",
      title: "Pay internet bill",
      status: "done",
      assignedTo: "2",
    },
  ]);

  const [messages, setMessages] = useState<FamilyMessage[]>([
    {
      id: "1",
      text:
        lang === "bn"
          ? "আজ রাতে পরিবারের খাওয়া আছে!"
          : "Family dinner tonight!",
      author: "1",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 3600000,
    },
    {
      id: "2",
      text:
        lang === "bn"
          ? "আমি বাজার থেকে ফল এনেছি"
          : "I brought fruits from the market",
      author: "2",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 7200000,
    },
    {
      id: "3",
      text:
        lang === "bn"
          ? "সামিরের স্কুলের পরীক্ষা আগামীকাল"
          : "Samir's exam is tomorrow",
      author: "2",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 14400000,
    },
    {
      id: "4",
      text: lang === "bn" ? "আমি সকালে বাড়ি ফিরব" : "I'll be home by morning",
      author: "1",
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now() - 28800000,
    },
  ]);

  const [events, setEvents] = useState<FamilyEvent[]>([
    {
      id: "1",
      title: "Rahim's Birthday",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() + 45 * 24 * 60 * 60 * 1000,
      type: "birthday",
    },
    {
      id: "2",
      title: "Wedding Anniversary",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() + 120 * 24 * 60 * 60 * 1000,
      type: "anniversary",
    },
    {
      id: "3",
      title: "Nadia's Vaccination",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() + 14 * 24 * 60 * 60 * 1000,
      type: "vaccination",
    },
    {
      id: "4",
      title: "Family Health Check-up",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() + 30 * 24 * 60 * 60 * 1000,
      type: "checkup",
    },
  ]);

  const [activeSection, setActiveSection] = useState<
    | "members"
    | "goals"
    | "expenses"
    | "meals"
    | "calendar"
    | "tasks"
    | "messages"
    | "health"
    | "celebrations"
  >("members");

  const [showModal, setShowModal] = useState<
    "member" | "goal" | "expense" | "task" | "event" | "message" | null
  >(null);

  const [modalForm, setModalForm] = useState({
    name: "",
    role: "parent" as MemberRole,
    avatar: "👨",
    title: "",
    description: "",
    amount: 0,
    category: "food" as ExpenseCategory,
    assignedTo: "",
    status: "todo" as TaskStatus,
    eventType: "birthday" as FamilyEvent["type"],
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

  const upcomingEvents = useMemo(
    () =>
      [...events]
        // eslint-disable-next-line react-hooks/purity
        .filter((e) => e.date > Date.now())
        .sort((a, b) => a.date - b.date),
    [events],
  );

  const nextCelebration = useMemo(() => upcomingEvents[0], [upcomingEvents]);

  const daysLeft = useMemo(() => {
    if (!nextCelebration) return null;
    return Math.ceil(
      // eslint-disable-next-line react-hooks/purity
      (nextCelebration.date - Date.now()) / (24 * 60 * 60 * 1000),
    );
  }, [nextCelebration]);

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

  const getMemberName = (id: string) => {
    return members.find((m) => m.id === id)?.name || "Unknown";
  };

  const getMemberAvatar = (id: string) => {
    return members.find((m) => m.id === id)?.avatar || "🧑";
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
          {/* Members Section */}
          {activeSection === "members" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="size-5 text-pink-500" />
                  {lang === "bn" ? "পরিবারের সদস্য" : "Family Members"}
                </h2>
                <button
                  onClick={() => setShowModal("member")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-medium hover:brightness-110 transition-all"
                >
                  <UserPlus className="size-4" />
                  {lang === "bn" ? "সদস্য যোগ করুন" : "Add Member"}
                </button>
              </div>

              {members.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <Users className="size-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {lang === "bn"
                      ? "এখনো কোনো পরিবারের সদস্য নেই"
                      : "No family members yet"}
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    {lang === "bn"
                      ? "আপনার প্রথম পরিবারের সদস্য যোগ করুন"
                      : "Add your first family member"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {members.map((member) => (
                    <motion.div
                      key={member.id}
                      variants={fadeUp}
                      className="glass rounded-2xl p-4 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{member.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.name}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${ROLE_CONFIG[member.role].color}`}
                          >
                            {ROLE_CONFIG[member.role][lang]}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteItem("member", member.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      {member.birthday && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Cake className="size-3" />
                          {new Date(member.birthday).toLocaleDateString(
                            lang === "bn" ? "bn-BD" : "en-US",
                            { month: "long", day: "numeric" },
                          )}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Goals Section */}
          {activeSection === "goals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="size-5 text-blue-500" />
                  {lang === "bn" ? "শেয়ার্ড লক্ষ্য" : "Shared Goals"}
                </h2>
                <button
                  onClick={() => setShowModal("goal")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium hover:brightness-110 transition-all"
                >
                  <Plus className="size-4" />
                  {lang === "bn" ? "লক্ষ্য যোগ করুন" : "Add Goal"}
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <Target className="size-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {lang === "bn" ? "এখনো কোনো লক্ষ্য নেই" : "No goals yet"}
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    {lang === "bn"
                      ? "আপনার প্রথম পরিবারের লক্ষ্য নির্ধারণ করুন"
                      : "Set your first family goal"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <motion.div
                      key={goal.id}
                      variants={fadeUp}
                      className="glass rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">{goal.title}</p>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground">
                              {goal.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {goal.assignedTo && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                {getMemberAvatar(goal.assignedTo)}{" "}
                                {getMemberName(goal.assignedTo)}
                              </span>
                            )}
                            {goal.deadline && (
                              <span className="text-xs text-muted-foreground">
                                •{" "}
                                {new Date(goal.deadline).toLocaleDateString(
                                  lang === "bn" ? "bn-BD" : "en-US",
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteItem("goal", goal.id)}
                          className="text-red-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {lang === "bn" ? "অগ্রগতি" : "Progress"}
                          </span>
                          <span className="font-medium">
                            {goal.progress} / {goal.target}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(
                                (goal.progress / goal.target) * 100,
                                100,
                              )}%`,
                            }}
                            transition={{ duration: 1, delay: 0.3 }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleUpdateGoalProgress(goal.id, -1)
                            }
                            className="px-3 py-1 rounded-lg glass text-xs hover:bg-white/10 transition-all"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleUpdateGoalProgress(goal.id, 1)}
                            className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 transition-all"
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Expenses Section */}
          {activeSection === "expenses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Receipt className="size-5 text-amber-500" />
                  {lang === "bn" ? "পরিবারের খরচ" : "Family Expenses"}
                </h2>
                <button
                  onClick={() => setShowModal("expense")}
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
                        lang === "bn"
                          ? "মাসিক বাজেট সেট করুন:"
                          : "Set monthly budget:",
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
                            {lang === "bn"
                              ? cat.key === "food"
                                ? "খাদ্য"
                                : cat.key === "utilities"
                                  ? "ইউটিলিটি"
                                  : cat.key === "entertainment"
                                    ? "বিনোদন"
                                    : cat.key === "education"
                                      ? "শিক্ষা"
                                      : cat.key === "healthcare"
                                        ? "স্বাস্থ্যসেবা"
                                        : cat.key === "transport"
                                          ? "পরিবহন"
                                          : "অন্যান্য"
                              : cat.key}
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
                          <catConfig.icon
                            className={`size-5 ${catConfig.color}`}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {expense.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getMemberName(expense.paidBy)} •{" "}
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
                          onClick={() =>
                            handleDeleteItem("expense", expense.id)
                          }
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
          )}

          {/* Meals Section */}
          {activeSection === "meals" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UtensilsCrossed className="size-5 text-green-500" />
                {lang === "bn" ? "খাদ্য পরিকল্পনা" : "Meal Plan"}
              </h2>

              {/* Today's Meals */}
              <div className="glass rounded-2xl p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Sun className="size-4 text-amber-500" />
                  {lang === "bn" ? "আজকের খাবার" : "Today's Meals"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        key: "breakfast",
                        icon: Coffee,
                        color: "text-amber-500",
                        bg: "bg-amber-500/10",
                      },
                      {
                        key: "lunch",
                        icon: Sun,
                        color: "text-green-500",
                        bg: "bg-green-500/10",
                      },
                      {
                        key: "dinner",
                        icon: Moon,
                        color: "text-blue-500",
                        bg: "bg-blue-500/10",
                      },
                    ] as const
                  ).map((meal) => (
                    <div key={meal.key} className={`${meal.bg} rounded-xl p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <meal.icon className={`size-4 ${meal.color}`} />
                        <span className="text-sm font-medium capitalize">
                          {lang === "bn"
                            ? meal.key === "breakfast"
                              ? "সকালের নাস্তা"
                              : meal.key === "lunch"
                                ? "দুপুরের খাবার"
                                : "রাতের খাবার"
                            : meal.key}
                        </span>
                      </div>
                      <p className="font-medium">{todayMeals[meal.key].name}</p>
                      <p className="text-xs text-muted-foreground">
                        ~{todayMeals[meal.key].calories}{" "}
                        {lang === "bn" ? "ক্যালোরি" : "calories"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Plan */}
              <div className="glass rounded-2xl p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <CalendarDays className="size-4 text-blue-500" />
                  {lang === "bn" ? "সাপ্তাহিক পরিকল্পনা" : "Weekly Plan"}
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {(lang === "bn"
                    ? ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র"]
                    : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]
                  ).map((day, i) => (
                    <div
                      key={day}
                      className={`text-center p-2 rounded-xl ${
                        i === new Date().getDay()
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/5"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">{day}</p>
                      <div className="mt-1 space-y-1">
                        <div className="text-[10px]">🍛</div>
                        <div className="text-[10px]">🍛</div>
                        <div className="text-[10px]">🍛</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Calendar Section */}
          {activeSection === "calendar" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarDays className="size-5 text-purple-500" />
                  {lang === "bn" ? "পরিবারের ক্যালেন্ডার" : "Family Calendar"}
                </h2>
                <button
                  onClick={() => setShowModal("event")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-medium hover:brightness-110 transition-all"
                >
                  <Plus className="size-4" />
                  {lang === "bn" ? "অনুষ্ঠান যোগ করুন" : "Add Event"}
                </button>
              </div>

              {/* Next Celebration */}
              {nextCelebration && (
                <div className="glass rounded-2xl p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {nextCelebration.type === "birthday"
                        ? "🎂"
                        : nextCelebration.type === "anniversary"
                          ? "💍"
                          : nextCelebration.type === "vaccination"
                            ? "💉"
                            : nextCelebration.type === "checkup"
                              ? "🏥"
                              : "🎉"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{nextCelebration.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {daysLeft} {lang === "bn" ? "দিন বাকি" : "days left"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-pink-500">
                        {daysLeft}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lang === "bn" ? "দিন" : "days"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* All Events */}
              <div className="glass rounded-2xl p-4">
                <h3 className="font-medium mb-3">
                  {lang === "bn" ? "আসন্ন অনুষ্ঠান" : "Upcoming Events"}
                </h3>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="size-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {lang === "bn" ? "কোনো অনুষ্ঠান নেই" : "No events yet"}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {lang === "bn"
                        ? "আপনার প্রথম পরিবারের অনুষ্ঠান যোগ করুন"
                        : "Add your first family event"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...events]
                      .sort((a, b) => a.date - b.date)
                      .map((event) => {
                        const daysUntil = Math.ceil(
                          // eslint-disable-next-line react-hooks/purity
                          (event.date - Date.now()) / (24 * 60 * 60 * 1000),
                        );
                        return (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group"
                          >
                            <div className="text-xl">
                              {event.type === "birthday"
                                ? "🎂"
                                : event.type === "anniversary"
                                  ? "💍"
                                  : event.type === "vaccination"
                                    ? "💉"
                                    : event.type === "checkup"
                                      ? "🏥"
                                      : "🎉"}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {event.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString(
                                  lang === "bn" ? "bn-BD" : "en-US",
                                  {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                daysUntil <= 7
                                  ? "bg-red-500/20 text-red-400"
                                  : daysUntil <= 30
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {daysUntil > 0
                                ? `${daysUntil} ${lang === "bn" ? "দিন" : "d"}`
                                : lang === "bn"
                                  ? "আজ"
                                  : "Today"}
                            </span>
                            <button
                              onClick={() =>
                                handleDeleteItem("event", event.id)
                              }
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {activeSection === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ListChecks className="size-5 text-cyan-500" />
                  {lang === "bn" ? "কাজের বোর্ড" : "Task Board"}
                </h2>
                <button
                  onClick={() => setShowModal("task")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:brightness-110 transition-all"
                >
                  <Plus className="size-4" />
                  {lang === "bn" ? "কাজ যোগ করুন" : "Add Task"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* To Do */}
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <h3 className="font-medium text-sm">
                      {lang === "bn" ? "করতে হবে" : "To Do"}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({tasksByStatus.todo.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasksByStatus.todo.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {lang === "bn" ? "সব আপ টু ডেট!" : "All caught up!"}
                      </p>
                    ) : (
                      tasksByStatus.todo.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white/5 rounded-xl p-3 group"
                        >
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {getMemberAvatar(task.assignedTo)}{" "}
                              {getMemberName(task.assignedTo)}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  handleUpdateTaskStatus(task.id, "in-progress")
                                }
                                className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                              >
                                →
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteItem("task", task.id)
                                }
                                className="opacity-0 group-hover:opacity-100 text-red-500"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </div>
                          {task.dueDate && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Clock className="size-3" />
                              {new Date(task.dueDate).toLocaleDateString(
                                lang === "bn" ? "bn-BD" : "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* In Progress */}
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <h3 className="font-medium text-sm">
                      {lang === "bn" ? "চলমান" : "In Progress"}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({tasksByStatus["in-progress"].length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasksByStatus["in-progress"].length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {lang === "bn" ? "কোনো কাজ নেই" : "No tasks"}
                      </p>
                    ) : (
                      tasksByStatus["in-progress"].map((task) => (
                        <div
                          key={task.id}
                          className="bg-white/5 rounded-xl p-3 group"
                        >
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {getMemberAvatar(task.assignedTo)}{" "}
                              {getMemberName(task.assignedTo)}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  handleUpdateTaskStatus(task.id, "done")
                                }
                                className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateTaskStatus(task.id, "todo")
                                }
                                className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                              >
                                ←
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteItem("task", task.id)
                                }
                                className="opacity-0 group-hover:opacity-100 text-red-500"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Done */}
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <h3 className="font-medium text-sm">
                      {lang === "bn" ? "সম্পন্ন" : "Done"}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      ({tasksByStatus.done.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasksByStatus.done.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {lang === "bn" ? "কোনো কাজ নেই" : "No tasks"}
                      </p>
                    ) : (
                      tasksByStatus.done.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white/5 rounded-xl p-3 opacity-60 group"
                        >
                          <p className="text-sm font-medium line-through">
                            {task.title}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              {getMemberAvatar(task.assignedTo)}{" "}
                              {getMemberName(task.assignedTo)}
                            </span>
                            <button
                              onClick={() => handleDeleteItem("task", task.id)}
                              className="opacity-0 group-hover:opacity-100 text-red-500"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages Section */}
          {activeSection === "messages" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="size-5 text-teal-500" />
                {lang === "bn" ? "বার্তা বোর্ড" : "Message Board"}
              </h2>

              <div className="glass rounded-2xl p-4">
                {/* Messages */}
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="size-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">
                        {lang === "bn"
                          ? "এখনো কোনো বার্তা নেই"
                          : "No messages yet"}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {lang === "bn"
                          ? "আপনার পরিবারের সাথে কথা বলুন"
                          : "Start a conversation with your family"}
                      </p>
                    </div>
                  ) : (
                    [...messages]
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((msg) => {
                        const author = members.find((m) => m.id === msg.author);
                        return (
                          <motion.div
                            key={msg.id}
                            variants={fadeUp}
                            className="flex items-start gap-3 group"
                          >
                            <span className="text-xl mt-1">
                              {author?.avatar || "🧑"}
                            </span>
                            <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-sm p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {author?.name || "Unknown"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(msg.timestamp).toLocaleTimeString(
                                    lang === "bn" ? "bn-BD" : "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                            <button
                              onClick={() =>
                                handleDeleteItem("message", msg.id)
                              }
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all mt-2"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          </motion.div>
                        );
                      })
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={
                      lang === "bn"
                        ? "একটি বার্তা লিখুন..."
                        : "Type a message..."
                    }
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-pink-500/50 transition-all"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Health Section */}
          {activeSection === "health" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Heart className="size-5 text-red-500" />
                {lang === "bn" ? "স্বাস্থ্য ট্র্যাকার" : "Health Tracker"}
              </h2>

              {/* Vaccinations */}
              <div className="glass rounded-2xl p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Syringe className="size-4 text-blue-500" />
                  {lang === "bn" ? "টিকাকরণ" : "Vaccinations"}
                </h3>
                <div className="space-y-2">
                  {events
                    .filter((e) => e.type === "vaccination")
                    .map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl"
                      >
                        <Syringe className="size-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString(
                              lang === "bn" ? "bn-BD" : "en-US",
                              {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                          {lang === "bn" ? "নির্ধারিত" : "Scheduled"}
                        </span>
                      </div>
                    ))}
                  {events.filter((e) => e.type === "vaccination").length ===
                    0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {lang === "bn"
                        ? "কোনো টিকার তারিখ নেই"
                        : "No vaccination dates"}
                    </p>
                  )}
                </div>
              </div>

              {/* Check-up Reminders */}
              <div className="glass rounded-2xl p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Stethoscope className="size-4 text-green-500" />
                  {lang === "bn" ? "চেক-আপ রিমাইন্ডার" : "Check-up Reminders"}
                </h3>
                <div className="space-y-2">
                  {events
                    .filter((e) => e.type === "checkup")
                    .map((event) => {
                      const daysUntil = Math.ceil(
                        // eslint-disable-next-line react-hooks/purity
                        (event.date - Date.now()) / (24 * 60 * 60 * 1000),
                      );
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl"
                        >
                          <Stethoscope className="size-5 text-green-500" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString(
                                lang === "bn" ? "bn-BD" : "en-US",
                                {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              daysUntil <= 7
                                ? "bg-red-500/20 text-red-400"
                                : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {daysUntil}{" "}
                            {lang === "bn" ? "দিন বাকি" : "days left"}
                          </span>
                        </div>
                      );
                    })}
                  {events.filter((e) => e.type === "checkup").length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {lang === "bn"
                        ? "কোনো চেক-আপ নেই"
                        : "No check-up reminders"}
                    </p>
                  )}
                </div>
              </div>

              {/* Family Health Summary */}
              <div className="glass rounded-2xl p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Heart className="size-4 text-red-500" />
                  {lang === "bn"
                    ? "পরিবারের স্বাস্থ্য সারাংশ"
                    : "Family Health Summary"}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white/5 rounded-xl p-3 text-center"
                    >
                      <div className="text-2xl mb-1">{member.avatar}</div>
                      <p className="text-xs font-medium">{member.name}</p>
                      <div className="mt-2 flex justify-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Celebrations Section */}
          {activeSection === "celebrations" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="size-5 text-amber-500" />
                {lang === "bn" ? "উদযাপন" : "Celebrations"}
              </h2>

              {/* Next Celebration */}
              {nextCelebration && (
                <div className="glass rounded-2xl p-6 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-amber-500/20 text-center">
                  <div className="text-5xl mb-3">
                    {nextCelebration.type === "birthday"
                      ? "🎂"
                      : nextCelebration.type === "anniversary"
                        ? "💍"
                        : "🎉"}
                  </div>
                  <h3 className="text-xl font-bold">{nextCelebration.title}</h3>
                  <p className="text-muted-foreground mt-1">
                    {new Date(nextCelebration.date).toLocaleDateString(
                      lang === "bn" ? "bn-BD" : "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10">
                    <span className="text-2xl font-bold text-pink-500">
                      {daysLeft}
                    </span>
                    <span className="text-sm">
                      {lang === "bn" ? "দিন বাকি" : "days left"}
                    </span>
                  </div>
                </div>
              )}

              {/* All Celebrations */}
              <div className="glass rounded-2xl p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <PartyPopper className="size-4 text-amber-500" />
                  {lang === "bn" ? "সব উদযাপন" : "All Celebrations"}
                </h3>
                <div className="space-y-2">
                  {[...events]
                    .sort((a, b) => a.date - b.date)
                    .map((event) => {
                      const daysUntil = Math.ceil(
                        // eslint-disable-next-line react-hooks/purity
                        (event.date - Date.now()) / (24 * 60 * 60 * 1000),
                      );
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group"
                        >
                          <div className="text-xl">
                            {event.type === "birthday"
                              ? "🎂"
                              : event.type === "anniversary"
                                ? "💍"
                                : event.type === "vaccination"
                                  ? "💉"
                                  : event.type === "checkup"
                                    ? "🏥"
                                    : "🎉"}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString(
                                lang === "bn" ? "bn-BD" : "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {daysUntil > 0
                              ? `${daysUntil} ${lang === "bn" ? "দিন" : "days"}`
                              : lang === "bn"
                                ? "আজ!"
                                : "Today!"}
                          </span>
                          <button
                            onClick={() => handleDeleteItem("event", event.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Family Achievements */}
              <div className="glass rounded-2xl p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Star className="size-4 text-amber-500" />
                  {lang === "bn" ? "পরিবারের সাফল্য" : "Family Achievements"}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {
                      icon: "🏆",
                      label:
                        lang === "bn" ? "১০ দিনের স্ট্রিক" : "10-day streak",
                      done: true,
                    },
                    {
                      icon: "📚",
                      label: lang === "bn" ? "৫টি বই পড়েছে" : "5 books read",
                      done: true,
                    },
                    {
                      icon: "💰",
                      label:
                        lang === "bn"
                          ? "সঞ্চয় লক্ষ্য পূরণ"
                          : "Savings goal met",
                      done: false,
                    },
                    {
                      icon: "🏃",
                      label: lang === "bn" ? "পরিবার দৌড়" : "Family run",
                      done: true,
                    },
                    {
                      icon: "🎯",
                      label: lang === "bn" ? "মাসিক লক্ষ্য" : "Monthly goal",
                      done: false,
                    },
                    {
                      icon: "❤️",
                      label:
                        lang === "bn" ? "৩৬৫ দিন একসাথে" : "365 days together",
                      done: false,
                    },
                  ].map((ach, i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-3 text-center ${
                        ach.done ? "bg-amber-500/10" : "bg-white/5 opacity-50"
                      }`}
                    >
                      <div className="text-2xl mb-1">{ach.icon}</div>
                      <p className="text-xs font-medium">{ach.label}</p>
                      {ach.done && (
                        <span className="text-[10px] text-green-500">
                          ✓ {lang === "bn" ? "অর্জিত" : "Achieved"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                          {val[lang]}
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
