import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState } from "react";
import {
  Layout,
  Plus,
  Clock,
  Sun,
  Moon,
  Dumbbell,
  Brain,
  Heart,
  CheckCircle,
  ArrowRight,
  X,
  Trash2,
  Copy,
} from "lucide-react";

interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  category: string;
  habits: { name: string; time?: string }[];
  isCustom: boolean;
}

const PRESET_TEMPLATES: HabitTemplate[] = [
  {
    id: "morning_routine",
    name: "সকালের রুটিন",
    nameEn: "Morning Routine",
    description: "শুরু করুন আপনার দিনটি সুন্দর করে",
    descriptionEn: "Start your day right",
    icon: Sun,
    color: "text-yellow-500",
    category: "routine",
    habits: [
      { name: "Water", time: "06:00" },
      { name: "Meditation", time: "06:15" },
      { name: "Exercise", time: "06:30" },
      { name: "Journal", time: "07:00" },
      { name: "Healthy Breakfast", time: "07:30" },
    ],
    isCustom: false,
  },
  {
    id: "evening_routine",
    name: "সন্ধ্যার রুটিন",
    nameEn: "Evening Routine",
    description: "শান্তিপূর্ণভাবে দিনের অবসান করুন",
    descriptionEn: "Wind down for better sleep",
    icon: Moon,
    color: "text-indigo-500",
    category: "routine",
    habits: [
      { name: "No Screens", time: "21:00" },
      { name: "Reading", time: "21:15" },
      { name: "Gratitude", time: "21:30" },
      { name: "Stretching", time: "21:45" },
      { name: "Sleep by 22:00", time: "22:00" },
    ],
    isCustom: false,
  },
  {
    id: "fitness",
    name: "ফিটনেস রুটিন",
    nameEn: "Fitness Routine",
    description: "সুস্থ থাকুন, ফিট থাকুন",
    descriptionEn: "Stay healthy, stay fit",
    icon: Dumbbell,
    color: "text-red-500",
    category: "health",
    habits: [
      { name: "Morning Walk", time: "06:00" },
      { name: "Workout", time: "17:00" },
      { name: "8 Glasses Water", time: "All Day" },
      { name: "Healthy Meal", time: "12:00" },
      { name: "Stretching", time: "21:00" },
    ],
    isCustom: false,
  },
  {
    id: "productivity",
    name: "উৎপাদনশীলতা",
    nameEn: "Productivity",
    description: "আরও বেশি কাজ করুন",
    descriptionEn: "Get more done",
    icon: Brain,
    color: "text-purple-500",
    category: "work",
    habits: [
      { name: "Plan Day", time: "08:00" },
      { name: "Deep Work (2h)", time: "09:00" },
      { name: "Pomodoro Sessions", time: "All Day" },
      { name: "Review Tasks", time: "17:00" },
      { name: "Prepare Tomorrow", time: "18:00" },
    ],
    isCustom: false,
  },
  {
    id: "wellness",
    name: "সুস্থতা",
    nameEn: "Wellness",
    description: "মানসিক ও শারীরিক সুস্থতা",
    descriptionEn: "Mental & physical wellness",
    icon: Heart,
    color: "text-pink-500",
    category: "health",
    habits: [
      { name: "Meditate 10min", time: "07:00" },
      { name: "No Phone 1h", time: "12:00" },
      { name: "Walk 30min", time: "16:00" },
      { name: "Read 20min", time: "21:00" },
      { name: "Sleep 7+ hours", time: "22:00" },
    ],
    isCustom: false,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HabitTemplates() {
  const { lang } = useLang();
  const [templates, setTemplates] = useState<HabitTemplate[]>(
    PRESET_TEMPLATES.map((t) => ({
      ...t,
      name: lang === "bn" ? t.name : t.nameEn,
      description: lang === "bn" ? t.description : t.descriptionEn,
    })),
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<HabitTemplate | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    habits: [{ name: "", time: "" }],
  });

  const handleApplyTemplate = (template: HabitTemplate) => {
    alert(
      lang === "bn"
        ? `"${template.name}" টেমপ্লেট প্রয়োগ করা হয়েছে!`
        : `"${template.name}" template applied!`,
    );
    setSelectedTemplate(null);
  };

  const handleAddTemplate = () => {
    const template: HabitTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      icon: Layout,
      color: "text-primary",
      category: "custom",
      habits: newTemplate.habits.filter((h) => h.name),
      isCustom: true,
    };
    setTemplates([...templates, template]);
    setShowAddModal(false);
    setNewTemplate({
      name: "",
      description: "",
      habits: [{ name: "", time: "" }],
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layout className="h-6 w-6 text-primary" />
            {lang === "bn" ? "অভ্যাস টেমপ্লেট" : "Habit Templates"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "bn"
              ? "প্রি-বিল্ট রুটিন দিয়ে দ্রুত শুরু করুন"
              : "Get started quickly with pre-built routines"}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "কাস্টম" : "Custom"}
        </button>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5 glass-card-hover cursor-pointer"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`rounded-xl p-3 bg-foreground/5 ${template.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                {template.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    className="cursor-pointer p-1 rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                )}
              </div>
              <h3 className="font-semibold mb-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">
                {template.description}
              </p>
              <div className="space-y-1">
                {template.habits.slice(0, 3).map((habit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>{habit.name}</span>
                    {habit.time && (
                      <span className="ml-auto">{habit.time}</span>
                    )}
                  </div>
                ))}
                {template.habits.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{template.habits.length - 3}{" "}
                    {lang === "bn" ? "আরও" : "more"}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="cursor-pointer p-1 rounded-lg hover:bg-foreground/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedTemplate.description}
            </p>
            <div className="space-y-2 mb-6">
              {selectedTemplate.habits.map((habit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5"
                >
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="flex-1 text-sm">{habit.name}</span>
                  {habit.time && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {habit.time}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="cursor-pointer flex-1 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
              >
                {lang === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                onClick={() => handleApplyTemplate(selectedTemplate)}
                className="cursor-pointer flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {lang === "bn" ? "প্রয়োগ করুন" : "Apply Template"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {lang === "bn" ? "নতুন টেমপ্লেট" : "New Template"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="cursor-pointer p-1 rounded-lg hover:bg-foreground/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={newTemplate.name}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, name: e.target.value })
                }
                placeholder={lang === "bn" ? "টেমপ্লেটের নাম" : "Template name"}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={newTemplate.description}
                onChange={(e) =>
                  setNewTemplate({
                    ...newTemplate,
                    description: e.target.value,
                  })
                }
                placeholder={lang === "bn" ? "বিবরণ" : "Description"}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "bn" ? "অভ্যাস" : "Habits"}
                </label>
                {newTemplate.habits.map((habit, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={habit.name}
                      onChange={(e) => {
                        const habits = [...newTemplate.habits];
                        habits[index].name = e.target.value;
                        setNewTemplate({ ...newTemplate, habits });
                      }}
                      placeholder={
                        lang === "bn" ? "অভ্যাসের নাম" : "Habit name"
                      }
                      className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={habit.time}
                      onChange={(e) => {
                        const habits = [...newTemplate.habits];
                        habits[index].time = e.target.value;
                        setNewTemplate({ ...newTemplate, habits });
                      }}
                      placeholder="08:00"
                      className="w-20 rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    setNewTemplate({
                      ...newTemplate,
                      habits: [...newTemplate.habits, { name: "", time: "" }],
                    })
                  }
                  className="cursor-pointer text-sm text-primary hover:underline"
                >
                  + {lang === "bn" ? "অভ্যাস যোগ করুন" : "Add Habit"}
                </button>
              </div>
              <button
                onClick={handleAddTemplate}
                disabled={!newTemplate.name}
                className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {lang === "bn" ? "টেমপ্লেট তৈরি করুন" : "Create Template"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
