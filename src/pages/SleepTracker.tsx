import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import { Moon, Sun, Plus, TrendingUp, Clock, Bed, Zap } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface SleepLog {
  _id: string;
  hours: number;
  quality: "great" | "good" | "okay" | "bad";
  bedTime: string;
  wakeTime: string;
  date: number;
  notes?: string;
}

const QUALITY_CONFIG = {
  great: { color: "text-green-500", bg: "bg-green-500/10", label: "Great" },
  good: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Good" },
  okay: { color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Okay" },
  bad: { color: "text-red-500", bg: "bg-red-500/10", label: "Bad" },
};

const NOW = Date.now();

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function SleepTracker() {
  const { lang } = useLang();
  const [showAddModal, setShowAddModal] = useState(false);
  const [logs, setLogs] = useState<SleepLog[]>([
    {
      _id: "1",
      hours: 7.5,
      quality: "good",
      bedTime: "23:00",
      wakeTime: "06:30",
      date: NOW - 1 * 24 * 60 * 60 * 1000,
    },
    {
      _id: "2",
      hours: 6,
      quality: "okay",
      bedTime: "00:30",
      wakeTime: "06:30",
      date: NOW - 2 * 24 * 60 * 60 * 1000,
    },
    {
      _id: "3",
      hours: 8,
      quality: "great",
      bedTime: "22:30",
      wakeTime: "06:30",
      date: NOW - 3 * 24 * 60 * 60 * 1000,
    },
  ]);

  const [formData, setFormData] = useState({
    hours: "7",
    quality: "good" as const,
    bedTime: "23:00",
    wakeTime: "06:30",
    notes: "",
  });

  const stats = useMemo(() => {
    if (logs.length === 0) return null;
    const avgHours = logs.reduce((sum, l) => sum + l.hours, 0) / logs.length;
    const bestQuality = logs.filter((l) => l.quality === "great").length;
    const totalHours = logs.reduce((sum, l) => sum + l.hours, 0);
    return {
      avgHours: avgHours.toFixed(1),
      bestQuality,
      totalHours: totalHours.toFixed(0),
      totalDays: logs.length,
    };
  }, [logs]);

  const handleAdd = () => {
    const newLog: SleepLog = {
      _id: Date.now().toString(),
      hours: parseFloat(formData.hours) || 7,
      quality: formData.quality,
      bedTime: formData.bedTime,
      wakeTime: formData.wakeTime,
      date: Date.now(),
      notes: formData.notes || undefined,
    };
    setLogs([newLog, ...logs]);
    setShowAddModal(false);
    setFormData({
      hours: "7",
      quality: "good",
      bedTime: "23:00",
      wakeTime: "06:30",
      notes: "",
    });
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
          <Moon className="h-6 w-6 text-indigo-500" />
          {lang === "bn" ? "ঘুম ট্র্যাকার" : "Sleep Tracker"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার ঘুমের অভ্যাস ট্র্যাক করুন"
            : "Track your sleep patterns for better health"}
        </p>
      </motion.div>

      {stats && (
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="glass rounded-xl p-4 text-center">
            <Moon className="h-5 w-5 mx-auto text-indigo-500 mb-2" />
            <p className="text-2xl font-bold">{stats.avgHours}h</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "গড় ঘুম" : "Avg Sleep"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Sun className="h-5 w-5 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{stats.bestQuality}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "দারুণ রাত" : "Great Nights"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalHours}h</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট ঘুম" : "Total Sleep"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalDays}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "দিন ট্র্যাক" : "Days Tracked"}
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
          {lang === "bn" ? "লগ যোগ করুন" : "Log Sleep"}
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        {logs.length === 0 ? (
          <EmptyState
            icon={Moon}
            title={lang === "bn" ? "কোনো লগ নেই" : "No sleep logs yet"}
            description={
              lang === "bn"
                ? "আপনার প্রথম ঘুমের লগ যোগ করুন"
                : "Add your first sleep log to start tracking"
            }
            action={{
              label: lang === "bn" ? "লগ যোগ করুন" : "Log Sleep",
              onClick: () => setShowAddModal(true),
            }}
          />
        ) : (
          logs.map((log) => {
            const qualityConfig = QUALITY_CONFIG[log.quality];
            return (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 hover-row hover-teal"
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl p-3 ${qualityConfig.bg}`}>
                    <Moon className={`h-5 w-5 ${qualityConfig.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{log.hours}h</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${qualityConfig.bg} ${qualityConfig.color}`}
                      >
                        {qualityConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Bed className="h-3 w-3" />
                        {log.bedTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {log.wakeTime}
                      </span>
                      <span>{formatDate(log.date)}</span>
                    </div>
                  </div>
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
              {lang === "bn" ? "ঘুম লগ করুন" : "Log Sleep"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  {lang === "bn" ? "ঘুমের ঘন্টা" : "Hours Slept"}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.hours}
                  onChange={(e) =>
                    setFormData({ ...formData, hours: e.target.value })
                  }
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {lang === "bn" ? "মান" : "Quality"}
                </label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {(["great", "good", "okay", "bad"] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setFormData({ ...formData, quality: q })}
                      className={`cursor-pointer rounded-lg p-2 text-xs font-medium transition-colors ${
                        formData.quality === q
                          ? `${QUALITY_CONFIG[q].bg} ${QUALITY_CONFIG[q].color}`
                          : "bg-foreground/5 text-muted-foreground"
                      }`}
                    >
                      {QUALITY_CONFIG[q].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">
                    {lang === "bn" ? "শোয়ার সময়" : "Bedtime"}
                  </label>
                  <input
                    type="time"
                    value={formData.bedTime}
                    onChange={(e) =>
                      setFormData({ ...formData, bedTime: e.target.value })
                    }
                    className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {lang === "bn" ? "ওঠার সময়" : "Wake Time"}
                  </label>
                  <input
                    type="time"
                    value={formData.wakeTime}
                    onChange={(e) =>
                      setFormData({ ...formData, wakeTime: e.target.value })
                    }
                    className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleAdd}
                className="cursor-pointer w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {lang === "bn" ? "সংরক্ষণ" : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
