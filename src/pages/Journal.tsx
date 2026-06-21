import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type TranslationKey } from "@/i18n/translations";
import { useState, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Tag,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Cloud,
  Trash2,
  Edit3,
  X,
  Check,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronLeft,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronRight,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { toastSuccess } from "@/lib/toast-helpers";
import { sanitizeInput } from "@/lib/input-sanitizer";

interface JournalEntry {
  _id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  weather?: string;
  date: number;
  createdAt: number;
  updatedAt: number;
}

const MOODS = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😌", label: "Calm", value: "calm" },
  { emoji: "🤔", label: "Thoughtful", value: "thoughtful" },
  { emoji: "😢", label: "Sad", value: "sad" },
  { emoji: "😤", label: "Frustrated", value: "frustrated" },
  { emoji: "😴", label: "Tired", value: "tired" },
  { emoji: "🎉", label: "Excited", value: "excited" },
  { emoji: "💪", label: "Motivated", value: "motivated" },
];

const WEATHER_OPTIONS = [
  { icon: "☀️", label: "Sunny" },
  { icon: "🌤️", label: "Partly Cloudy" },
  { icon: "☁️", label: "Cloudy" },
  { icon: "🌧️", label: "Rainy" },
  { icon: "⛈️", label: "Stormy" },
  { icon: "❄️", label: "Snowy" },
];

const SUGGESTED_TAGS = [
  "Personal",
  "Work",
  "Health",
  "Travel",
  "Ideas",
  "Gratitude",
  "Goals",
  "Reflection",
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Journal() {
  const { lang } = useLang();
  const entries = useQuery(api.journal.list);
  const createEntry = useMutation(api.journal.create);
  const updateEntry = useMutation(api.journal.update);
  const deleteEntry = useMutation(api.journal.remove);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "week" | "month">("all");
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedWeather, setSelectedWeather] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    return entries
      .filter((entry) => {
        const matchesSearch =
          entry.title.toLowerCase().includes(search.toLowerCase()) ||
          entry.content.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
          filter === "all" ||
          (filter === "week" && entry.date >= weekAgo) ||
          (filter === "month" && entry.date >= monthAgo);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => b.date - a.date);
  }, [entries, search, filter]);

  const writingStreak = useMemo(() => {
    if (!entries || entries.length === 0) return 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const sortedDates = entries
      .map((e) => new Date(e.date).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a);
    const uniqueDates = [...new Set(sortedDates)];

    let streak = 0;
    let currentDate = today;

    for (const date of uniqueDates) {
      if (date === currentDate) {
        streak++;
        currentDate -= 86400000;
      } else if (date === currentDate + 86400000) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  }, [entries]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    if (editingEntry) {
      await updateEntry({
        id: editingEntry._id,
        title: sanitizeInput(title.trim()),
        content: sanitizeInput(content.trim()),
        mood: selectedMood || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        weather: selectedWeather || undefined,
      });
      toastSuccess(lang === "bn" ? "এন্ট্রি আপডেট হয়েছে" : "Entry updated");
    } else {
      await createEntry({
        title: sanitizeInput(title.trim()),
        content: sanitizeInput(content.trim()),
        mood: selectedMood || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        weather: selectedWeather || undefined,
      });
      toastSuccess(lang === "bn" ? "এন্ট্রি তৈরি হয়েছে" : "Entry created");
    }

    resetEditor();
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedMood(entry.mood || "");
    setSelectedTags(entry.tags || []);
    setSelectedWeather(entry.weather || "");
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry({ id });
    toastSuccess(lang === "bn" ? "এন্ট্রি মুছে ফেলা হয়েছে" : "Entry deleted");
  };

  const resetEditor = () => {
    setShowEditor(false);
    setEditingEntry(null);
    setTitle("");
    setContent("");
    setSelectedMood("");
    setSelectedTags([]);
    setSelectedWeather("");
    setCustomTag("");
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()]);
      setCustomTag("");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(
      lang === "bn" ? "bn-BD" : "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            {lang === "bn" ? "ডায়েরি" : "Journal"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "bn"
              ? "আপনার চিন্তা লিখুন"
              : "Write your thoughts and reflections"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {writingStreak > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl bg-orange-500/10 px-3 py-1.5">
              <span className="text-orange-500">🔥</span>
              <span className="text-sm font-medium">
                {writingStreak} {lang === "bn" ? "দিনের স্ট্রিক" : "day streak"}
              </span>
            </div>
          )}
          <button
            onClick={() => setShowEditor(true)}
            className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {lang === "bn" ? "নতুন এন্ট্রি" : "New Entry"}
          </button>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={
              lang === "bn" ? "এন্ট্রি খুঁজুন..." : "Search entries..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-foreground/5 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-foreground/5 p-1">
          {(["all", "week", "month"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover-tab"
              }`}
            >
              {f === "all"
                ? lang === "bn"
                  ? "সব"
                  : "All"
                : f === "week"
                  ? lang === "bn"
                    ? "এই সপ্তাহ"
                    : "This Week"
                  : lang === "bn"
                    ? "এই মাসে"
                    : "This Month"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Entries List */}
      <motion.div variants={fadeUp} className="space-y-4">
        {filteredEntries.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={
              lang === "bn"
                ? "এখনো কোনো ডায়েরি এন্ট্রি নেই"
                : "No journal entries yet"
            }
            description={
              lang === "bn"
                ? "আপনার প্রথম এন্ট্রি লিখে শুরু করুন"
                : "Start writing your first entry"
            }
            action={{
              label: lang === "bn" ? "নতুন এন্ট্রি" : "New Entry",
              onClick: () => setShowEditor(true),
            }}
          />
        ) : (
          filteredEntries.map((entry) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4 glass-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">{entry.title}</h3>
                    {entry.mood && (
                      <span className="text-lg">
                        {MOODS.find((m) => m.value === entry.mood)?.emoji}
                      </span>
                    )}
                    {entry.weather && (
                      <span className="text-sm">
                        {WEATHER_OPTIONS.find((w) => w.label === entry.weather)
                          ?.icon || entry.weather}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {entry.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(entry.date)}
                    </span>
                    {entry.tags && entry.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {entry.tags.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(entry._id)}
                    className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={resetEditor}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:max-h-[85vh] z-50 glass rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/20">
                <h2 className="font-semibold">
                  {editingEntry
                    ? lang === "bn"
                      ? "এন্ট্রি সম্পাদনা"
                      : "Edit Entry"
                    : lang === "bn"
                      ? "নতুন এন্ট্রি"
                      : "New Entry"}
                </h2>
                <button
                  onClick={resetEditor}
                  className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <input
                  type="text"
                  placeholder={lang === "bn" ? "শিরোনাম..." : "Title..."}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-foreground/5 px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <textarea
                  placeholder={
                    lang === "bn"
                      ? "আপনার চিন্তা লিখুন..."
                      : "Write your thoughts..."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl bg-foreground/5 px-4 py-3 min-h-[200px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                {/* Mood Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {lang === "bn"
                      ? "আপনি কেমন বোধ করছেন?"
                      : "How are you feeling?"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() =>
                          setSelectedMood(
                            selectedMood === mood.value ? "" : mood.value,
                          )
                        }
                        className={`cursor-pointer flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                          selectedMood === mood.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-foreground/5 hover:bg-foreground/10"
                        }`}
                      >
                        <span>{mood.emoji}</span>
                        <span>{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weather Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {lang === "bn" ? "আবহাওয়া" : "Weather"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEATHER_OPTIONS.map((weather) => (
                      <button
                        key={weather.label}
                        onClick={() =>
                          setSelectedWeather(
                            selectedWeather === weather.label
                              ? ""
                              : weather.label,
                          )
                        }
                        className={`cursor-pointer flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                          selectedWeather === weather.label
                            ? "bg-primary text-primary-foreground"
                            : "bg-foreground/5 hover:bg-foreground/10"
                        }`}
                      >
                        <span>{weather.icon}</span>
                        <span>{weather.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {lang === "bn" ? "ট্যাগ" : "Tags"}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {SUGGESTED_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                          selectedTags.includes(tag)
                            ? "bg-primary text-primary-foreground"
                            : "bg-foreground/5 hover:bg-foreground/10"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={
                        lang === "bn" ? "কাস্টম ট্যাগ..." : "Custom tag..."
                      }
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                      className="flex-1 rounded-xl bg-foreground/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      onClick={addCustomTag}
                      className="cursor-pointer rounded-xl bg-foreground/5 px-3 py-2 text-sm hover:bg-foreground/10 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs"
                        >
                          {tag}
                          <button
                            onClick={() => toggleTag(tag)}
                            className="cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-border/20">
                <button
                  onClick={resetEditor}
                  className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !content.trim()}
                  className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {lang === "bn" ? "সংরক্ষণ করুন" : "Save Entry"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId);
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
        title={lang === "bn" ? "এন্ট্রি মুছুন?" : "Delete entry?"}
        description={
          lang === "bn"
            ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
            : "This action cannot be undone."
        }
      />
    </motion.div>
  );
}
