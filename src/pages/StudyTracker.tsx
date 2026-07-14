import { motion } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { useState, useMemo } from "react"
import {
  BookOpen,
  Plus,
  Clock,
  TrendingUp,
  Calendar,
  X,
  Trash2,
  Brain,
} from "lucide-react"
import { EmptyState } from "@/components/ui/EmptyState"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { toBanglaNumber } from "@/lib/bangla-numbers"
import { toastSuccess } from "@/lib/toast-helpers"

interface StudySession {
  _id: string
  subject: string
  duration: number
  notes?: string
  date: number
}

const NOW = Date.now()

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Bengali",
  "History",
  "Geography",
  "Computer Science",
  "Other",
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function StudyTracker() {
  const { lang } = useLang()
  const [showAddModal, setShowAddModal] = useState(false)
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      _id: "1",
      subject: "Mathematics",
      duration: 60,
      notes: "Calculus practice",
      date: NOW - 1 * 24 * 60 * 60 * 1000,
    },
    {
      _id: "2",
      subject: "Physics",
      duration: 45,
      notes: "Mechanics chapter",
      date: NOW - 1 * 24 * 60 * 60 * 1000,
    },
    {
      _id: "3",
      subject: "English",
      duration: 30,
      date: NOW - 2 * 24 * 60 * 60 * 1000,
    },
  ])

  const [formData, setFormData] = useState({
    subject: "Mathematics",
    duration: "45",
    notes: "",
  })
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const stats = useMemo(() => {
    if (sessions.length === 0) return null
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0)
    const subjectHours: Record<string, number> = {}
    sessions.forEach((s) => {
      subjectHours[s.subject] = (subjectHours[s.subject] || 0) + s.duration
    })
    const topSubject = Object.entries(subjectHours).sort(
      (a, b) => b[1] - a[1],
    )[0]

    return {
      totalSessions: sessions.length,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      topSubject: topSubject ? topSubject[0] : "-",
      avgSession: Math.round(totalMinutes / sessions.length),
    }
  }, [sessions])

  const handleAdd = () => {
    const newSession: StudySession = {
      _id: Date.now().toString(),
      subject: formData.subject,
      duration: parseInt(formData.duration) || 45,
      notes: formData.notes || undefined,
      date: Date.now(),
    }
    setSessions([newSession, ...sessions])
    setShowAddModal(false)
    setFormData({ subject: "Mathematics", duration: "45", notes: "" })
    toastSuccess(lang === "bn" ? "সেশন যোগ হয়েছে" : "Session added")
  }

  const handleDelete = (id: string) => {
    setSessions(sessions.filter((s) => s._id !== id))
    toastSuccess(lang === "bn" ? "সেশন মুছে ফেলা হয়েছে" : "Session deleted")
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-purple-500" />
          {lang === "bn" ? "পড়াশোনা ট্র্যাকার" : "Study Tracker"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার পড়াশোনার সময় ট্র্যাক করুন"
            : "Track your study sessions and improve focus"}
        </p>
      </motion.div>

      {stats && (
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="glass rounded-xl p-4 text-center">
            <BookOpen className="h-5 w-5 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">
              {lang === "bn"
                ? toBanglaNumber(stats.totalSessions)
                : stats.totalSessions}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট সেশন" : "Sessions"}
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
            <Brain className="h-5 w-5 mx-auto text-pink-500 mb-2" />
            <p className="text-lg font-bold truncate">{stats.topSubject}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "শীর্ষ বিষয়" : "Top Subject"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.avgSession}m</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "গড় সেশন" : "Avg Session"}
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
          {lang === "bn" ? "সেশন যোগ করুন" : "Log Session"}
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        {sessions.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={lang === "bn" ? "কোনো সেশন নেই" : "No study sessions yet"}
            description={
              lang === "bn"
                ? "আপনার প্রথম পড়াশোনার সেশন যোগ করুন"
                : "Log your first study session to start tracking"
            }
            action={{
              label: lang === "bn" ? "সেশন যোগ করুন" : "Log Session",
              onClick: () => setShowAddModal(true),
            }}
          />
        ) : (
          sessions.map((session) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4 glass-card-hover"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl p-3 bg-purple-500/10">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{session.subject}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.duration}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(session.date)}
                    </span>
                  </div>
                  {session.notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {session.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setDeleteConfirmId(session._id)}
                  className="cursor-pointer p-2 rounded-lg hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            </motion.div>
          ))
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
                {lang === "bn" ? "পড়াশোনা লগ" : "Log Study Session"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="cursor-pointer p-1 rounded-lg hover:bg-foreground/5"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">
                  {lang === "bn" ? "বিষয়" : "Subject"}
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {lang === "bn" ? "সময় (মিনিট)" : "Duration (min)"}
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  aria-label="Study duration"
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  {lang === "bn" ? "নোট" : "Notes"}
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                />
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

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onConfirm={() => {
          if (deleteConfirmId) handleDelete(deleteConfirmId)
          setDeleteConfirmId(null)
        }}
        onCancel={() => setDeleteConfirmId(null)}
        title={lang === "bn" ? "সেশন মুছুন?" : "Delete session?"}
        description={
          lang === "bn"
            ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
            : "This action cannot be undone."
        }
      />
    </motion.div>
  )
}
