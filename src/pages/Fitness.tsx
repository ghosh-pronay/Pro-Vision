import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  Dumbbell,
  Plus,
  Clock,
  Flame,
  TrendingUp,
  Calendar,
  X,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Workout {
  _id: string;
  type: string;
  duration: number;
  calories?: number;
  distance?: number;
  notes?: string;
  date: number;
}

const NOW = Date.now();

const WORKOUT_TYPES = [
  { value: "running", label: "Running", icon: "🏃" },
  { value: "walking", label: "Walking", icon: "🚶" },
  { value: "cycling", label: "Cycling", icon: "🚴" },
  { value: "swimming", label: "Swimming", icon: "🏊" },
  { value: "gym", label: "Gym", icon: "🏋️" },
  { value: "yoga", label: "Yoga", icon: "🧘" },
  { value: "hiit", label: "HIIT", icon: "⚡" },
  { value: "sports", label: "Sports", icon: "⚽" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Fitness() {
  const { lang } = useLang();
  const [showAddModal, setShowAddModal] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      _id: "1",
      type: "running",
      duration: 30,
      calories: 300,
      distance: 5,
      date: NOW - 1 * 24 * 60 * 60 * 1000,
    },
    {
      _id: "2",
      type: "gym",
      duration: 45,
      calories: 400,
      date: NOW - 2 * 24 * 60 * 60 * 1000,
      notes: "Upper body workout",
    },
    {
      _id: "3",
      type: "yoga",
      duration: 60,
      calories: 200,
      date: NOW - 3 * 24 * 60 * 60 * 1000,
    },
  ]);

  const [formData, setFormData] = useState({
    type: "running",
    duration: "30",
    calories: "",
    distance: "",
    notes: "",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (workouts.length === 0) return null;
    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce(
      (sum, w) => sum + (w.calories || 0),
      0,
    );
    const totalDistance = workouts.reduce(
      (sum, w) => sum + (w.distance || 0),
      0,
    );
    return {
      totalWorkouts: workouts.length,
      totalMinutes,
      totalCalories,
      totalDistance,
      avgDuration: Math.round(totalMinutes / workouts.length),
    };
  }, [workouts]);

  const handleAdd = () => {
    const newWorkout: Workout = {
      _id: Date.now().toString(),
      type: formData.type,
      duration: parseInt(formData.duration) || 30,
      calories: formData.calories ? parseInt(formData.calories) : undefined,
      distance: formData.distance ? parseFloat(formData.distance) : undefined,
      notes: formData.notes || undefined,
      date: Date.now(),
    };
    setWorkouts([newWorkout, ...workouts]);
    setShowAddModal(false);
    setFormData({
      type: "running",
      duration: "30",
      calories: "",
      distance: "",
      notes: "",
    });
  };

  const handleDelete = (id: string) => {
    setWorkouts(workouts.filter((w) => w._id !== id));
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getWorkoutInfo = (type: string) => {
    return WORKOUT_TYPES.find((w) => w.value === type) || WORKOUT_TYPES[0];
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
          <Dumbbell className="h-6 w-6 text-orange-500" />
          {lang === "bn" ? "ফিটনেস ট্র্যাকার" : "Fitness Tracker"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "bn"
            ? "আপনার ব্যায়াম ট্র্যাক করুন"
            : "Track your workouts and stay fit"}
        </p>
      </motion.div>

      {stats && (
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="glass rounded-xl p-4 text-center">
            <Dumbbell className="h-5 w-5 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট ওয়ার্কআউট" : "Total Workouts"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalMinutes}m</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "মোট সময়" : "Total Time"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <Flame className="h-5 w-5 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold">{stats.totalCalories}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "ক্যালোরি" : "Calories"}
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.avgDuration}m</p>
            <p className="text-xs text-muted-foreground">
              {lang === "bn" ? "গড় সময়" : "Avg Duration"}
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
          {lang === "bn" ? "ওয়ার্কআউট যোগ করুন" : "Log Workout"}
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        {workouts.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            title={lang === "bn" ? "কোনো ওয়ার্কআউট নেই" : "No workouts yet"}
            description={
              lang === "bn"
                ? "আপনার প্রথম ওয়ার্কআউট লগ করুন"
                : "Log your first workout to start tracking"
            }
            action={{
              label: lang === "bn" ? "ওয়ার্কআউট যোগ করুন" : "Log Workout",
              onClick: () => setShowAddModal(true),
            }}
          />
        ) : (
          workouts.map((workout) => {
            const workoutInfo = getWorkoutInfo(workout.type);
            return (
              <motion.div
                key={workout._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 glass-card-hover"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl p-3 bg-orange-500/10 text-2xl">
                    {workoutInfo.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{workoutInfo.label}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {workout.duration}m
                      </span>
                      {workout.calories && (
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {workout.calories} cal
                        </span>
                      )}
                      {workout.distance && <span>{workout.distance} km</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(workout.date)}
                      </span>
                    </div>
                    {workout.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {workout.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteConfirmId(workout._id)}
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
                {lang === "bn" ? "ওয়ার্কআউট লগ" : "Log Workout"}
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
                  {lang === "bn" ? "ধরন" : "Type"}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {WORKOUT_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() =>
                        setFormData({ ...formData, type: type.value })
                      }
                      className={`cursor-pointer rounded-lg p-2 text-center transition-colors ${
                        formData.type === type.value
                          ? "bg-primary/10 border border-primary"
                          : "bg-foreground/5 hover:bg-foreground/10"
                      }`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <p className="text-xs mt-1">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {lang === "bn" ? "ক্যালোরি" : "Calories"}
                  </label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) =>
                      setFormData({ ...formData, calories: e.target.value })
                    }
                    className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {lang === "bn" ? "দূরত্ব (কিমি)" : "Distance (km)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) =>
                    setFormData({ ...formData, distance: e.target.value })
                  }
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
          if (deleteConfirmId) handleDelete(deleteConfirmId);
          setDeleteConfirmId(null);
        }}
        onCancel={() => setDeleteConfirmId(null)}
        title={lang === "bn" ? "ওয়ার্কআউট মুছুন?" : "Delete workout?"}
        description={
          lang === "bn"
            ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
            : "This action cannot be undone."
        }
      />
    </motion.div>
  );
}
