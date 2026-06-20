import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useRef, useCallback } from "react";
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  Eye,
  Heart,
  MessageCircle,
  Trophy,
  Flame,
  Target,
  Coins,
  BookOpen,
  Dumbbell,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Twitter,
  Facebook,
  Linkedin,
  Link,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Image,
} from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: any;
  color: string;
  unlockedAt: number;
  likes: number;
  shares: number;
  recentSharers: string[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ACHIEVEMENT_TYPES = [
  {
    id: "streak",
    nameEn: "Habit Streak",
    nameBn: "অভ্যাস স্ট্রিক",
    icon: "🔥",
    color: "#ef4444",
  },
  {
    id: "goal",
    nameEn: "Goal Completed",
    nameBn: "লক্ষ্য সম্পন্ন",
    icon: "🎯",
    color: "#22c55e",
  },
  {
    id: "financial",
    nameEn: "Financial Milestone",
    nameBn: "আর্থিক মাইলফলক",
    icon: "💰",
    color: "#f59e0b",
  },
  {
    id: "learning",
    nameEn: "Learning Achievement",
    nameBn: "শেখার অর্জন",
    icon: "📚",
    color: "#3b82f6",
  },
  {
    id: "health",
    nameEn: "Health Goal",
    nameBn: "স্বাস্থ্য লক্ষ্য",
    icon: "💪",
    color: "#10b981",
  },
  {
    id: "social",
    nameEn: "Social Contribution",
    nameBn: "সামাজিক অবদান",
    icon: "🤝",
    color: "#8b5cf6",
  },
];

type CardStyle = "minimal" | "gradient" | "glass" | "dark";

const CARD_STYLES: { id: CardStyle; nameEn: string; nameBn: string }[] = [
  { id: "minimal", nameEn: "Minimal", nameBn: "মিনিমাল" },
  { id: "gradient", nameEn: "Gradient", nameBn: "গ্রেডিয়েন্ট" },
  { id: "glass", nameEn: "Glass", nameBn: "গ্লাস" },
  { id: "dark", nameEn: "Dark", nameBn: "ডার্ক" },
];

export default function AchievementSharing() {
  const { lang } = useLang();
  const previewRef = useRef<HTMLDivElement>(null);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      name: lang === "bn" ? "৭ দিনের অভ্যাস স্ট্রিক" : "7-Day Habit Streak",
      description:
        lang === "bn"
          ? "৭ দিন ধারাবাহিকভাবে অভ্যাস পূরণ করেছেন"
          : "Maintained habits for 7 consecutive days",
      type: "streak",
      icon: Flame,
      color: "#ef4444",
      unlockedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      likes: 24,
      shares: 8,
      recentSharers: ["Rahim", "Karim", "Sara"],
    },
    {
      id: "2",
      name: lang === "bn" ? "সেভিংস লক্ষ্য অর্জন" : "Savings Goal Reached",
      description:
        lang === "bn"
          ? "৳৫০,০০০ সঞ্চয় লক্ষ্য পূরণ হয়েছে"
          : "Reached ৳50,000 savings target",
      type: "financial",
      icon: Coins,
      color: "#f59e0b",
      unlockedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
      likes: 42,
      shares: 15,
      recentSharers: ["Tanjir", "Nusrat", "Farhan"],
    },
    {
      id: "3",
      name: lang === "bn" ? "১০ বই পড়া সম্পন্ন" : "10 Books Read",
      description:
        lang === "bn"
          ? "১০টি বই সম্পূর্ণ পড়ে শেষ করেছেন"
          : "Completed reading 10 books",
      type: "learning",
      icon: BookOpen,
      color: "#3b82f6",
      unlockedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      likes: 31,
      shares: 5,
      recentSharers: ["Anika", "Rakib"],
    },
    {
      id: "4",
      name:
        lang === "bn" ? "৩০ দিন ফিটনেস চ্যালেঞ্জ" : "30-Day Fitness Challenge",
      description:
        lang === "bn"
          ? "৩০ দিন ধারাবাহিক ব্যায়াম সম্পন্ন"
          : "30 days of consistent exercise",
      type: "health",
      icon: Dumbbell,
      color: "#10b981",
      unlockedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      likes: 56,
      shares: 20,
      recentSharers: ["Sumon", "Ruma", "Babul"],
    },
    {
      id: "5",
      name: lang === "bn" ? "সামাজিক সেবা পুরস্কার" : "Community Service Award",
      description:
        lang === "bn"
          ? "১০০ ঘণ্টা সামাজিক সেবা সম্পন্ন"
          : "Completed 100 hours of community service",
      type: "social",
      icon: Users,
      color: "#8b5cf6",
      unlockedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
      likes: 78,
      shares: 30,
      recentSharers: ["Zara", "Kamal", "Lily"],
    },
    {
      id: "6",
      name:
        lang === "bn"
          ? "লক্ষ্য অর্জন: প্রজেক্ট শেষ"
          : "Goal: Project Completed",
      description:
        lang === "bn"
          ? "প্রজেক্ট ম্যানেজমেন্ট সিস্টেম তৈরি করেছেন"
          : "Built a project management system",
      type: "goal",
      icon: Target,
      color: "#22c55e",
      unlockedAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
      likes: 35,
      shares: 12,
      recentSharers: ["Shibli", "Meghna"],
    },
  ]);

  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [cardStyle, setCardStyle] = useState<CardStyle>("gradient");
  const [customMessage, setCustomMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [customBorder, setCustomBorder] = useState("rounded-2xl");
  const [customBg, setCustomBg] = useState<string>("none");

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setAchievements((a) =>
          a.map((x) => (x.id === id ? { ...x, likes: x.likes - 1 } : x)),
        );
      } else {
        next.add(id);
        setAchievements((a) =>
          a.map((x) => (x.id === id ? { ...x, likes: x.likes + 1 } : x)),
        );
      }
      return next;
    });
  };

  const getCardStyleClasses = (style: CardStyle): string => {
    switch (style) {
      case "minimal":
        return "bg-white dark:bg-gray-50 border border-gray-200 dark:border-gray-700 shadow-sm";
      case "gradient":
        return "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl";
      case "glass":
        return "glass bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-xl";
      case "dark":
        return "bg-gray-900 dark:bg-gray-800 text-white border border-gray-700 shadow-xl";
      default:
        return "";
    }
  };

  const getPreviewBg = (style: CardStyle): string => {
    switch (style) {
      case "minimal":
        return "bg-gray-50 dark:bg-gray-900";
      case "gradient":
        return "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30";
      case "glass":
        return "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30";
      case "dark":
        return "bg-gray-950 dark:bg-black";
      default:
        return "bg-gray-50";
    }
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: lang === "bn" ? "long" : "short",
      day: "numeric",
    });
  };

  const buildShareText = (a: Achievement) => {
    const typeName = ACHIEVEMENT_TYPES.find((t) => t.id === a.type);
    const typeLabel = typeName
      ? lang === "bn"
        ? typeName.nameBn
        : typeName.nameEn
      : a.type;
    let text = `${typeName?.icon || "🏆"} ${a.name}\n${a.description}\n`;
    if (customMessage) text += `\n"${customMessage}"\n`;
    text += `\n#ProVision #Achievement #${typeLabel.replace(/\s/g, "")}`;
    return text;
  };

  const handleShare = (platform: string, a: Achievement) => {
    const text = buildShareText(a);
    const encoded = encodeURIComponent(text);
    const url = encodeURIComponent(window.location.href);
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encoded}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encoded}&url=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encoded}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "copy":
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        return;
      case "instagram":
        handleDownloadImage(a);
        return;
    }

    if (shareUrl) window.open(shareUrl, "_blank", "width=600,height=400");

    setAchievements((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, shares: x.shares + 1 } : x)),
    );
  };

  const handleDownloadImage = useCallback(
    (a: Achievement) => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 420;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const styleConfig: Record<
        CardStyle,
        { bg: string; fg: string; cardBg: string }
      > = {
        minimal: { bg: "#f9fafb", fg: "#111827", cardBg: "#ffffff" },
        gradient: { bg: "#f3f4f6", fg: "#ffffff", cardBg: "#6366f1" },
        glass: { bg: "#eff6ff", fg: "#ffffff", cardBg: "#6366f1" },
        dark: { bg: "#030712", fg: "#ffffff", cardBg: "#1f2937" },
      };

      const cfg = styleConfig[cardStyle];

      ctx.fillStyle = cfg.bg;
      ctx.fillRect(0, 0, 800, 420);

      const rx = 20;
      const cw = 720,
        ch = 340,
        cx = 40,
        cy = 40;
      ctx.beginPath();
      ctx.moveTo(cx + rx, cy);
      ctx.lineTo(cx + cw - rx, cy);
      ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + rx);
      ctx.lineTo(cx + cw, cy + ch - rx);
      ctx.quadraticCurveTo(cx + cw, cy + ch, cx + cw - rx, cy + ch);
      ctx.lineTo(cx + rx, cy + ch);
      ctx.quadraticCurveTo(cx, cy + ch, cx, cy + ch - rx);
      ctx.lineTo(cx, cy + rx);
      ctx.quadraticCurveTo(cx, cy, cx + rx, cy);
      ctx.closePath();

      if (cardStyle === "gradient") {
        const grad = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
        grad.addColorStop(0, "#6366f1");
        grad.addColorStop(0.5, "#a855f7");
        grad.addColorStop(1, "#ec4899");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = cfg.cardBg;
      }
      ctx.fill();

      const typeName = ACHIEVEMENT_TYPES.find((t) => t.id === a.type);

      ctx.fillStyle = cfg.fg;
      ctx.textAlign = "center";
      ctx.font = "bold 64px serif";
      ctx.fillText(typeName?.icon || "🏆", 400, 120);

      ctx.font = "bold 32px sans-serif";
      ctx.fillText(a.name, 400, 190);

      ctx.font = "18px sans-serif";
      ctx.globalAlpha = 0.8;
      const descLines = wrapText(ctx, a.description, 600);
      descLines.forEach((line, i) => {
        ctx.fillText(line, 400, 230 + i * 26);
      });
      ctx.globalAlpha = 1;

      if (customMessage) {
        ctx.font = "italic 16px sans-serif";
        ctx.globalAlpha = 0.7;
        const msgLines = wrapText(ctx, `"${customMessage}"`, 560);
        msgLines.forEach((line, i) => {
          ctx.fillText(line, 400, 300 + i * 22);
        });
        ctx.globalAlpha = 1;
      }

      ctx.font = "14px sans-serif";
      ctx.globalAlpha = 0.5;
      ctx.fillText("Made with Pro Vision", 400, 370);
      ctx.globalAlpha = 1;

      const link = document.createElement("a");
      link.download = `achievement-${a.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    },
    [cardStyle, customMessage],
  );

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  const selectedTypeName = selectedAchievement
    ? ACHIEVEMENT_TYPES.find((t) => t.id === selectedAchievement.type)
    : null;

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-3"
      >
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Share2 size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {lang === "bn" ? "অর্জন শেয়ারিং" : "Achievement Sharing"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === "bn"
              ? "আপনার অর্জন বন্ধুদের সাথে শেয়ার করুন"
              : "Share your achievements with friends"}
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" />
          {lang === "bn" ? "আমার অর্জন" : "My Achievements"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((a) => {
            const TypeIcon = a.icon;
            const typeName = ACHIEVEMENT_TYPES.find((t) => t.id === a.type);
            return (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-2xl p-4 cursor-pointer transition-all ${getCardStyleClasses(cardStyle)} ${
                  selectedAchievement?.id === a.id
                    ? "ring-2 ring-indigo-500"
                    : ""
                }`}
                onClick={() => {
                  setSelectedAchievement(a);
                  setShowPreview(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${a.color}20` }}
                    >
                      {typeName?.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{a.name}</h3>
                      <p className="text-xs opacity-70">{a.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-xs opacity-60">
                    {formatDate(a.unlockedAt)}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(a.id);
                      }}
                      className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity"
                    >
                      <Heart
                        size={14}
                        className={
                          likedIds.has(a.id) ? "fill-current text-red-400" : ""
                        }
                      />
                      {a.likes}
                    </button>
                    <span className="flex items-center gap-1 text-xs opacity-60">
                      <Share2 size={12} />
                      {a.shares}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Sparkles size={20} className="text-purple-500" />
          {lang === "bn" ? "কার্ড স্টাইল" : "Card Style"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CARD_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setCardStyle(s.id)}
              className={`rounded-2xl p-4 text-center transition-all border-2 ${
                cardStyle === s.id
                  ? "border-indigo-500 shadow-lg scale-[1.03]"
                  : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div
                className={`w-full h-16 rounded-xl mb-2 ${getCardStyleClasses(s.id)}`}
              />
              <span className="text-sm font-medium">
                {lang === "bn" ? s.nameBn : s.nameEn}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {showPreview && selectedAchievement && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Eye size={20} className="text-blue-500" />
                {lang === "bn" ? "পূর্বরূপ" : "Preview"}
              </h2>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedAchievement(null);
                }}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className={`rounded-2xl p-4 ${getPreviewBg(cardStyle)}`}>
              <div
                ref={previewRef}
                className={`mx-auto max-w-lg rounded-2xl p-6 ${getCardStyleClasses(cardStyle)} ${customBorder}`}
              >
                <div className="text-center space-y-4">
                  <div className="text-5xl">
                    {selectedTypeName?.icon || "🏆"}
                  </div>
                  <h3 className="text-xl font-bold">
                    {selectedAchievement.name}
                  </h3>
                  <p className="text-sm opacity-80">
                    {selectedAchievement.description}
                  </p>
                  {customMessage && (
                    <p className="text-sm italic opacity-70 border-t border-white/20 pt-3">
                      "{customMessage}"
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: selectedAchievement.color + "30",
                      }}
                    >
                      {selectedTypeName
                        ? lang === "bn"
                          ? selectedTypeName.nameBn
                          : selectedTypeName.nameEn
                        : ""}
                    </span>
                    <span className="text-xs opacity-60">
                      {formatDate(selectedAchievement.unlockedAt)}
                    </span>
                  </div>
                  <div className="text-xs opacity-40 pt-2">
                    Made with Pro Vision
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Image size={16} />
                {lang === "bn" ? "কাস্টম ফ্রেমিং" : "Custom Framing"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "rounded-2xl",
                  "rounded-xl",
                  "rounded-lg",
                  "rounded-none",
                  "rounded-3xl",
                ].map((b) => (
                  <button
                    key={b}
                    onClick={() => setCustomBorder(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      customBorder === b
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {b.replace("rounded-", "")}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageCircle size={16} />
                {lang === "bn" ? "কাস্টম বার্তা" : "Custom Message"}
              </h3>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={
                  lang === "bn"
                    ? "আপনার অর্জনের সাথে একটি ব্যক্তিগত নোট যোগ করুন..."
                    : "Add a personal note to your achievement..."
                }
                className="w-full rounded-xl p-3 text-sm bg-white/50 dark:bg-gray-800/50 glass border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={2}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Share2 size={16} />
                {lang === "bn" ? "শেয়ার অপশন" : "Share Options"}
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <button
                  onClick={() => handleShare("facebook", selectedAchievement)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Facebook size={20} />
                  <span className="text-[10px] font-medium">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare("twitter", selectedAchievement)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                >
                  <Twitter size={20} />
                  <span className="text-[10px] font-medium">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare("whatsapp", selectedAchievement)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <MessageCircle size={20} />
                  <span className="text-[10px] font-medium">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare("instagram", selectedAchievement)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
                >
                  <Image size={20} />
                  <span className="text-[10px] font-medium">Instagram</span>
                </button>
                <button
                  onClick={() => handleShare("linkedin", selectedAchievement)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                >
                  <Linkedin size={20} />
                  <span className="text-[10px] font-medium">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare("copy", selectedAchievement)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                  <span className="text-[10px] font-medium">
                    {copied
                      ? lang === "bn"
                        ? "কপি হয়েছে"
                        : "Copied"
                      : lang === "bn"
                        ? "কপি"
                        : "Copy"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <button
                onClick={() => handleDownloadImage(selectedAchievement)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg transition-all"
              >
                <Download size={18} />
                {lang === "bn"
                  ? "ইমেজ হিসেবে ডাউনলোড করুন"
                  : "Download as Image"}
              </button>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Link size={16} />
                {lang === "bn" ? "শেয়ার লিংক" : "Share Link"}
              </h3>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={`https://pro-vision.app/achievement/${selectedAchievement.id}`}
                  className="flex-1 rounded-xl px-3 py-2 text-sm bg-white/50 dark:bg-gray-800/50 glass border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://pro-vision.app/achievement/${selectedAchievement.id}`,
                    );
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setTimelineExpanded(!timelineExpanded)}
          className="w-full flex items-center justify-between text-lg font-semibold mb-3"
        >
          <span className="flex items-center gap-2">
            <Clock size={20} className="text-indigo-500" />
            {lang === "bn" ? "অর্জন টাইমলাইন" : "Achievement Timeline"}
          </span>
          {timelineExpanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>
        <AnimatePresence>
          {timelineExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative pl-8 space-y-4">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 to-purple-500" />
                {achievements
                  .sort((a, b) => b.unlockedAt - a.unlockedAt)
                  .map((a, idx) => {
                    const typeName = ACHIEVEMENT_TYPES.find(
                      (t) => t.id === a.type,
                    );
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative"
                      >
                        <div
                          className="absolute -left-5 top-2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900"
                          style={{ backgroundColor: a.color }}
                        />
                        <div className="glass rounded-2xl p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{typeName?.icon}</span>
                              <div>
                                <h4 className="font-semibold text-sm">
                                  {a.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {a.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-400">
                              {formatDate(a.unlockedAt)}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Heart size={12} /> {a.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 size={12} /> {a.shares}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users size={20} className="text-green-500" />
          {lang === "bn" ? "সামাজিক প্রমাণ" : "Social Proof"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
                <Heart size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {achievements.reduce((s, a) => s + a.likes, 0)}
                </p>
                <p className="text-xs text-gray-500">
                  {lang === "bn" ? "মোট লাইক" : "Total Likes"}
                </p>
              </div>
            </div>
            <div className="flex -space-x-2">
              {["R", "K", "S", "T", "N"].map((l, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-900"
                >
                  {l}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-gray-900">
                +{achievements.reduce((s, a) => s + a.likes, 0) - 5}
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Share2 size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {achievements.reduce((s, a) => s + a.shares, 0)}
                </p>
                <p className="text-xs text-gray-500">
                  {lang === "bn" ? "মোট শেয়ার" : "Total Shares"}
                </p>
              </div>
            </div>
            <div className="space-y-1.5">
              {achievements
                .filter((a) => a.recentSharers.length > 0)
                .slice(0, 3)
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 text-xs text-gray-500"
                  >
                    <TrendingUp size={12} className="text-green-400" />
                    <span>
                      <strong>{a.recentSharers[0]}</strong>
                      {lang === "bn"
                        ? ` এবং অন্যরা "${a.name}" শেয়ার করেছেন`
                        : ` and others shared "${a.name}"`}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
