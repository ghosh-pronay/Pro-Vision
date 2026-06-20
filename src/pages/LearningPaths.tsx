import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  Trophy,
  Plus,
  X,
  Trash2,
  Calendar,
  ExternalLink,
  Target,
  Flame,
  Zap,
} from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  nameBn?: string;
  completed: boolean;
  completedAt?: number;
}

interface LearningPath {
  id: string;
  name: string;
  nameBn?: string;
  description: string;
  descriptionBn?: string;
  milestones: Milestone[];
  estimatedHours: number;
  resources: { name: string; url: string }[];
  startDate?: number;
  targetDate?: number;
  status: "active" | "completed" | "paused";
  completedAt?: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SUGGESTED_PATHS = [
  {
    name: "Learn TypeScript",
    nameBn: "টাইপস্ক্রিপ্ট শিখুন",
    description: "Master TypeScript fundamentals and advanced patterns",
    descriptionBn: "টাইপস্ক্রিপ্টের মৌলিক ও উন্নত প্যাটার্ন শিখুন",
    icon: BookOpen,
    color: "text-blue-500",
  },
  {
    name: "Master Tailwind CSS",
    nameBn: "টেলউইন্ড CSS মাস্টার করুন",
    description: "Build modern UIs with utility-first CSS",
    descriptionBn: "ইউটিলিটি-ফার্স্ট CSS দিয়ে আধুনিক UI তৈরি করুন",
    icon: Target,
    color: "text-cyan-500",
  },
  {
    name: "Python for Data Science",
    nameBn: "ডাটা সায়েন্সের জন্য পাইথন",
    description: "Data analysis, visualization, and machine learning basics",
    descriptionBn: "ডাটা বিশ্লেষণ, ভিজ্যুয়ালাইজেশন এবং মেশিন লার্নিং",
    icon: Zap,
    color: "text-green-500",
  },
];

const INITIAL_PATHS: LearningPath[] = [
  {
    id: "1",
    name: "Learn TypeScript",
    nameBn: "টাইপস্ক্রিপ্ট শিখুন",
    description: "Master TypeScript fundamentals and advanced patterns",
    descriptionBn: "টাইপস্ক্রিপ্টের মৌলিক ও উন্নত প্যাটার্ন শিখুন",
    milestones: [
      {
        id: "m1",
        name: "Basic Types & Interfaces",
        nameBn: "বেসিক টাইপ ও ইন্টারফেস",
        completed: true,
        completedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
      {
        id: "m2",
        name: "Functions & Generics",
        nameBn: "ফাংশন ও জেনেরিক্স",
        completed: true,
        completedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      },
      {
        id: "m3",
        name: "Classes & OOP",
        nameBn: "ক্লাস ও OOP",
        completed: false,
      },
      {
        id: "m4",
        name: "Advanced Types",
        nameBn: "উন্নত টাইপ",
        completed: false,
      },
      {
        id: "m5",
        name: "Project: Build a CLI Tool",
        nameBn: "প্রজেক্ট: CLI টুল তৈরি",
        completed: false,
      },
    ],
    estimatedHours: 40,
    resources: [
      {
        name: "TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/handbook/",
      },
      { name: "TS Exercises", url: "https://typescript-exercises.github.io/" },
    ],
    startDate: Date.now() - 14 * 24 * 60 * 60 * 1000,
    targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    status: "active",
  },
  {
    id: "2",
    name: "Master Tailwind CSS",
    nameBn: "টেলউইন্ড CSS মাস্টার করুন",
    description: "Build modern UIs with utility-first CSS",
    descriptionBn: "ইউটিলিটি-ফার্স্ট CSS দিয়ে আধুনিক UI তৈরি করুন",
    milestones: [
      {
        id: "m1",
        name: "Installation & Config",
        nameBn: "ইন্সটলেশন ও কনফিগ",
        completed: true,
        completedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      },
      {
        id: "m2",
        name: "Utility Classes",
        nameBn: "ইউটিলিটি ক্লাস",
        completed: true,
        completedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      },
      {
        id: "m3",
        name: "Responsive Design",
        nameBn: "রেসপন্সিভ ডিজাইন",
        completed: true,
        completedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      },
      {
        id: "m4",
        name: "Custom Components",
        nameBn: "কাস্টম কম্পোনেন্ট",
        completed: false,
      },
    ],
    estimatedHours: 25,
    resources: [
      { name: "Tailwind Docs", url: "https://tailwindcss.com/docs" },
      { name: "Tailwind UI", url: "https://tailwindui.com/" },
    ],
    startDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    targetDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
    status: "active",
  },
  {
    id: "3",
    name: "Python Basics",
    nameBn: "পাইথন বেসিক্স",
    description: "Introduction to Python programming",
    descriptionBn: "পাইথন প্রোগ্রামিংয়ের ভূমিকা",
    milestones: [
      {
        id: "m1",
        name: "Variables & Data Types",
        nameBn: "ভেরিয়েবল ও ডাটা টাইপ",
        completed: true,
        completedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
      },
      {
        id: "m2",
        name: "Control Flow",
        nameBn: "কন্ট্রোল ফ্লো",
        completed: true,
        completedAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
      },
      {
        id: "m3",
        name: "Functions",
        nameBn: "ফাংশন",
        completed: true,
        completedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      },
      {
        id: "m4",
        name: "Data Structures",
        nameBn: "ডাটা স্ট্রাকচার",
        completed: true,
        completedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
      },
      {
        id: "m5",
        name: "File Handling",
        nameBn: "ফাইল হ্যান্ডলিং",
        completed: true,
        completedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      },
    ],
    estimatedHours: 30,
    resources: [],
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
    completedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    status: "completed",
  },
];

export default function LearningPaths() {
  const { lang } = useLang();
  const [paths, setPaths] = useState<LearningPath[]>(
    INITIAL_PATHS.map((p) => ({
      ...p,
      name: lang === "bn" ? p.nameBn || p.name : p.name,
      description:
        lang === "bn" ? p.descriptionBn || p.description : p.description,
      milestones: p.milestones.map((m) => ({
        ...m,
        name: lang === "bn" ? m.nameBn || m.name : m.name,
      })),
    })),
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    estimatedHours: "20",
    targetDate: "",
    milestones: [{ name: "" }],
    resources: [{ name: "", url: "" }],
  });

  const stats = useMemo(() => {
    const activePaths = paths.filter((p) => p.status === "active");
    const completedPaths = paths.filter((p) => p.status === "completed");
    const totalHours = paths.reduce((sum, p) => sum + p.estimatedHours, 0);
    const completedMilestones = paths.reduce(
      (sum, p) => sum + p.milestones.filter((m) => m.completed).length,
      0,
    );
    const totalMilestones = paths.reduce(
      (sum, p) => sum + p.milestones.length,
      0,
    );

    return {
      activeCount: activePaths.length,
      completedCount: completedPaths.length,
      totalHours,
      completedMilestones,
      totalMilestones,
      currentStreak: 5,
    };
  }, [paths]);

  const getProgress = (path: LearningPath) => {
    const completed = path.milestones.filter((m) => m.completed).length;
    return Math.round((completed / path.milestones.length) * 100);
  };

  const getDaysLeft = (targetDate?: number) => {
    if (!targetDate) return null;
    const diff = targetDate - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleAddPath = () => {
    const newPath: LearningPath = {
      id: Date.now().toString(),
      name: formData.name,
      nameBn: formData.name,
      description: formData.description,
      descriptionBn: formData.description,
      milestones: formData.milestones
        .filter((m) => m.name)
        .map((m, i) => ({
          id: `m${Date.now()}-${i}`,
          name: m.name,
          nameBn: m.name,
          completed: false,
        })),
      estimatedHours: parseInt(formData.estimatedHours) || 20,
      resources: formData.resources.filter((r) => r.name && r.url),
      startDate: Date.now(),
      targetDate: formData.targetDate
        ? new Date(formData.targetDate).getTime()
        : undefined,
      status: "active",
    };
    setPaths([newPath, ...paths]);
    setShowAddModal(false);
    setFormData({
      name: "",
      description: "",
      estimatedHours: "20",
      targetDate: "",
      milestones: [{ name: "" }],
      resources: [{ name: "", url: "" }],
    });
  };

  const toggleMilestone = (pathId: string, milestoneId: string) => {
    setPaths(
      paths.map((p) => {
        if (p.id === pathId) {
          const updatedMilestones = p.milestones.map((m) =>
            m.id === milestoneId
              ? {
                  ...m,
                  completed: !m.completed,
                  completedAt: !m.completed ? Date.now() : undefined,
                }
              : m,
          );
          const allCompleted = updatedMilestones.every((m) => m.completed);
          return {
            ...p,
            milestones: updatedMilestones,
            status: allCompleted ? "completed" : "active",
            completedAt: allCompleted ? Date.now() : undefined,
          };
        }
        return p;
      }),
    );
  };

  const handleDeletePath = (id: string) => {
    setPaths(paths.filter((p) => p.id !== id));
  };

  const handleStartPath = (suggestedPath: (typeof SUGGESTED_PATHS)[0]) => {
    setFormData({
      ...formData,
      name: lang === "bn" ? suggestedPath.nameBn : suggestedPath.name,
      description:
        lang === "bn" ? suggestedPath.descriptionBn : suggestedPath.description,
    });
    setShowAddModal(true);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(
      lang === "bn" ? "bn-BD" : "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );
  };

  const activePaths = paths.filter((p) => p.status === "active");
  const completedPaths = paths.filter((p) => p.status === "completed");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-500" />
          {lang === "bn" ? "শেখার পথ" : "Learning Paths"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার শেখার যাত্রা ট্র্যাক করুন"
            : "Track your learning journey with milestones"}
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="glass rounded-xl p-4 text-center">
          <GraduationCap className="h-5 w-5 mx-auto text-indigo-500 mb-2" />
          <p className="text-2xl font-bold">{stats.activeCount}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "সক্রিয় পথ" : "Active Paths"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Trophy className="h-5 w-5 mx-auto text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{stats.completedCount}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "সম্পন্ন" : "Completed"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Clock className="h-5 w-5 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats.totalHours}h</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "মোট সময়" : "Total Hours"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Flame className="h-5 w-5 mx-auto text-orange-500 mb-2" />
          <p className="text-2xl font-bold">{stats.currentStreak}d</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "স্ট্রিক" : "Current Streak"}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "নতুন পথ" : "New Path"}
        </button>
      </motion.div>

      {activePaths.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-4">
          <h2 className="text-lg font-semibold">
            {lang === "bn" ? "সক্রিয় পথ" : "Active Paths"}
          </h2>
          {activePaths.map((path) => {
            const progress = getProgress(path);
            const daysLeft = getDaysLeft(path.targetDate);
            const isExpanded = expandedPath === path.id;

            return (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 glass-card-hover"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-3 bg-indigo-500/10">
                      <GraduationCap className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{path.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {path.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() =>
                        setExpandedPath(isExpanded ? null : path.id)
                      }
                      className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeletePath(path.id)}
                      className="cursor-pointer p-2 rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>

                <div className="relative h-4 bg-foreground/10 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>
                    {progress}% {lang === "bn" ? "সম্পন্ন" : "complete"}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {path.estimatedHours}h
                    </span>
                    {daysLeft !== null && (
                      <span>
                        {daysLeft === 0
                          ? lang === "bn"
                            ? "আজ শেষ!"
                            : "Due today!"
                          : `${daysLeft} ${lang === "bn" ? "দিন বাকি" : "days left"}`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {path.milestones
                    .slice(0, isExpanded ? path.milestones.length : 3)
                    .map((milestone) => (
                      <button
                        key={milestone.id}
                        onClick={() => toggleMilestone(path.id, milestone.id)}
                        className={`cursor-pointer w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                          milestone.completed
                            ? "bg-green-500/10"
                            : "hover:bg-foreground/5"
                        }`}
                      >
                        {milestone.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            milestone.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        >
                          {milestone.name}
                        </span>
                        {milestone.completedAt && (
                          <span className="ml-auto text-xs text-green-500">
                            {formatDate(milestone.completedAt)}
                          </span>
                        )}
                      </button>
                    ))}
                  {!isExpanded && path.milestones.length > 3 && (
                    <button
                      onClick={() => setExpandedPath(path.id)}
                      className="cursor-pointer text-xs text-primary hover:underline"
                    >
                      +{path.milestones.length - 3}{" "}
                      {lang === "bn" ? "আরও" : "more"}
                    </button>
                  )}
                </div>

                {isExpanded && path.resources.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium mb-2">
                      {lang === "bn" ? "রিসোর্স" : "Resources"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {path.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {resource.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {completedPaths.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {lang === "bn" ? "সম্পন্ন পথ" : "Completed Paths"}
          </h2>
          {completedPaths.map((path) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4 opacity-75"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-3 bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{path.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {path.milestones.length} milestones • {path.estimatedHours}h
                  </p>
                </div>
                {path.completedAt && (
                  <span className="text-xs text-green-500">
                    {formatDate(path.completedAt)}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "bn" ? "প্রস্তাবিত পথ" : "Suggested Paths"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SUGGESTED_PATHS.map((suggested, index) => {
            const Icon = suggested.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4 glass-card-hover cursor-pointer"
                onClick={() => handleStartPath(suggested)}
              >
                <div
                  className={`rounded-xl p-3 bg-foreground/5 ${suggested.color} mb-3 inline-block`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-sm">
                  {lang === "bn" ? suggested.nameBn : suggested.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "bn"
                    ? suggested.descriptionBn
                    : suggested.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {lang === "bn" ? "নতুন শেখার পথ" : "New Learning Path"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="cursor-pointer p-1 rounded-lg hover:bg-foreground/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  {lang === "bn" ? "পথের নাম" : "Path Name"}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={
                    lang === "bn" ? "যেমন: পাইথন শিখুন" : "e.g., Learn Python"
                  }
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {lang === "bn" ? "বিবরণ" : "Description"}
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={
                    lang === "bn" ? "সংক্ষিপ্ত বিবরণ" : "Brief description"
                  }
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">
                    {lang === "bn" ? "আনুমানিক সময় (ঘণ্টা)" : "Est. Hours"}
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedHours: e.target.value,
                      })
                    }
                    className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {lang === "bn" ? "টার্গেট তারিখ" : "Target Date"}
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                    className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "bn" ? "মাইলস্টোন" : "Milestones"}
                </label>
                {formData.milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={milestone.name}
                      onChange={(e) => {
                        const milestones = [...formData.milestones];
                        milestones[index].name = e.target.value;
                        setFormData({ ...formData, milestones });
                      }}
                      placeholder={
                        lang === "bn"
                          ? `মাইলস্টোন ${index + 1}`
                          : `Milestone ${index + 1}`
                      }
                      className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                    {index === formData.milestones.length - 1 && (
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            milestones: [...formData.milestones, { name: "" }],
                          })
                        }
                        className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "bn" ? "রিসোর্স" : "Resources"}
                </label>
                {formData.resources.map((resource, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={resource.name}
                      onChange={(e) => {
                        const resources = [...formData.resources];
                        resources[index].name = e.target.value;
                        setFormData({ ...formData, resources });
                      }}
                      placeholder={lang === "bn" ? "নাম" : "Name"}
                      className="w-1/3 rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      type="url"
                      value={resource.url}
                      onChange={(e) => {
                        const resources = [...formData.resources];
                        resources[index].url = e.target.value;
                        setFormData({ ...formData, resources });
                      }}
                      placeholder="https://..."
                      className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                    {index === formData.resources.length - 1 && (
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            resources: [
                              ...formData.resources,
                              { name: "", url: "" },
                            ],
                          })
                        }
                        className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
                      >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddPath}
                disabled={!formData.name}
                className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {lang === "bn" ? "পথ তৈরি করুন" : "Create Path"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
