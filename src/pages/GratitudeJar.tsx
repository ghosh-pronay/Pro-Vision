import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  Heart,
  Plus,
  Sparkles,
  Calendar,
  X,
  Trash2,
  Smile,
  Frown,
  Meh,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toastSuccess } from "@/lib/toast-helpers";
import { sanitizeInput } from "@/lib/input-sanitizer";

interface GratitudeEntry {
  _id: string;
  content: string;
  mood?: string;
  date: number;
}

const MOODS = [
  { value: "happy", icon: Smile, color: "text-yellow-500", label: "Happy" },
  { value: "neutral", icon: Meh, color: "text-gray-500", label: "Neutral" },
  { value: "sad", icon: Frown, color: "text-blue-500", label: "Sad" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function GratitudeJar() {
  const { lang } = useLang();
  const [showAddModal, setShowAddModal] = useState(false);
  const [entries, setEntries] = useState<GratitudeEntry[]>([
    {
      _id: "1",
      content:
        lang === "bn" ? "আজ সূর্যোদয় দেখেছি" : "Saw a beautiful sunrise today",
      mood: "happy",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 1 * 24 * 60 * 60 * 1000,
    },
    {
      _id: "2",
      content:
        lang === "bn" ? "পরিবারের সাথে রাতের খাবার" : "Had dinner with family",
      mood: "happy",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
    {
      _id: "3",
      content: lang === "bn" ? "একটি ভালো বই পড়েছি" : "Read a good book",
      mood: "neutral",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 3 * 24 * 60 * 60 * 1000,
    },
  ]);

  const [formData, setFormData] = useState({
    content: "",
    mood: "happy",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    const happyCount = entries.filter((e) => e.mood === "happy").length;
    const streak = calculateStreak();
    return {
      totalEntries: entries.length,
      happyCount,
      streak,
    };
  }, [entries]);

  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    const sorted = [...entries].sort((a, b) => b.date - a.date);
    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const hasEntry = sorted.some((e) => {
        const entryDate = new Date(e.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === currentDate.getTime();
      });

      if (hasEntry) {
        streak++;
      } else if (i > 0) {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const handleAdd = () => {
    const newEntry: GratitudeEntry = {
      _id: Date.now().toString(),
      content: sanitizeInput(formData.content),
      mood: formData.mood,
      date: Date.now(),
    };
    setEntries([newEntry, ...entries]);
    setShowAddModal(false);
    setFormData({ content: "", mood: "happy" });
    toastSuccess(lang === "bn" ? "কৃতজ্ঞতা যোগ হয়েছে" : "Gratitude added");
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e._id !== id));
    toastSuccess(lang === "bn" ? "এন্ট্রি মুছে ফেলা হয়েছে" : "Entry deleted");
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
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
          <Heart className="h-6 w-6 text-pink-500" />
          {lang === "bn" ? "কৃতজ্ঞতা জার" : "Gratitude Jar"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "প্রতিদিন কৃতজ্ঞতা লিখুন"
            : "Write down what you're grateful for each day"}
        </p>
      </motion.div>

      {stats && (
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          <div className="glass rounded-xl p-4 text-center">
            <Heart className="h-5 w-5 mx-auto text-pink-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalEntries}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট এন্ট্রি" : "Entries"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Sparkles className="h-5 w-5 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "দিন স্ট্রিক" : "Day Streak"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Smile className="h-5 w-5 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.happyCount}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "সুখি" : "Happy Days"}
            </p>
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "কৃতজ্ঞতা যোগ করুন" : "Add Entry"}
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        {entries.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={lang === "bn" ? "কোনো এন্ট্রি নেই" : "No entries yet"}
            description={
              lang === "bn"
                ? "আজ আপনার প্রথম কৃতজ্ঞতা লিখুন"
                : "Write your first gratitude entry today"
            }
            action={{
              label: lang === "bn" ? "কৃতজ্ঞতা যোগ করুন" : "Add Entry",
              onClick: () => setShowAddModal(true),
            }}
          />
        ) : (
          entries.map((entry) => {
            const moodConfig =
              MOODS.find((m) => m.value === entry.mood) || MOODS[1];
            const MoodIcon = moodConfig.icon;

            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 glass-card-hover"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-xl p-3 bg-pink-500/10 ${moodConfig.color}`}
                  >
                    <MoodIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{entry.content}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteConfirmId(entry._id)}
                    className="cursor-pointer p-2 rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {lang === "bn" ? "কৃতজ্ঞতা যোগ করুন" : "Add Gratitude"}
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
                <label className="text-sm font-medium mb-2 block">
                  {lang === "bn"
                    ? "আজ আপনি কিসের জন্য কৃতজ্ঞ?"
                    : "What are you grateful for today?"}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder={
                    lang === "bn"
                      ? "আপনার কৃতজ্ঞতা লিখুন..."
                      : "Write your gratitude..."
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[100px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {lang === "bn" ? "মনোভাব" : "Mood"}
                </label>
                <div className="flex gap-2">
                  {MOODS.map((mood) => {
                    const MoodIcon = mood.icon;
                    return (
                      <button
                        key={mood.value}
                        onClick={() =>
                          setFormData({ ...formData, mood: mood.value })
                        }
                        className={`cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-lg p-3 transition-colors ${
                          formData.mood === mood.value
                            ? "bg-primary/10 border border-primary"
                            : "bg-foreground/5 hover:bg-foreground/10"
                        }`}
                      >
                        <MoodIcon className={`h-5 w-5 ${mood.color}`} />
                        <span className="text-sm">{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleAdd}
                disabled={!formData.content}
                className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {lang === "bn" ? "সংরক্ষণ" : "Save"}
              </button>
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
