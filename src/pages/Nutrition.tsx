import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Droplets,
  Minus,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MealLog {
  _id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  date: number;
  createdAt: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface WaterLog {
  _id: string;
  glasses: number;
  date: number;
  createdAt: number;
}

const MEAL_TYPES = [
  { value: "breakfast", icon: Coffee, color: "text-orange-500" },
  { value: "lunch", icon: Sun, color: "text-yellow-500" },
  { value: "dinner", icon: Moon, color: "text-indigo-500" },
  { value: "snack", icon: Cookie, color: "text-pink-500" },
] as const;

const CALORIE_GOAL = 2000;
const WATER_GOAL = 8;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Nutrition() {
  const { lang } = useLang();
  const today = new Date().setHours(0, 0, 0, 0);
  const meals = useQuery(api.mealLogs.list);
  const waterLogs = useQuery(api.waterLogs.listByDate, { date: today });
  const createMeal = useMutation(api.mealLogs.create);
  const deleteMeal = useMutation(api.mealLogs.remove);
  const logWater = useMutation(api.waterLogs.addWater);

  const [showMealEditor, setShowMealEditor] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealProtein, setMealProtein] = useState("");
  const [mealCarbs, setMealCarbs] = useState("");
  const [mealFat, setMealFat] = useState("");
  const [mealNotes, setMealNotes] = useState("");

  const todayMeals = useMemo(() => {
    if (!meals) return [];
    return meals
      .filter((m) => new Date(m.date).setHours(0, 0, 0, 0) === today)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [meals, today]);

  const todayWater = useMemo(() => {
    if (!waterLogs || waterLogs.length === 0) return 0;
    const latest = [...waterLogs].sort((a, b) => b.createdAt - a.createdAt)[0];
    return latest?.glasses || 0;
  }, [waterLogs]);

  const todayStats = useMemo(() => {
    const calories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const protein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const carbs = todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const fat = todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);
    return { calories, protein, carbs, fat };
  }, [todayMeals]);

  const handleAddMeal = async () => {
    if (!mealName.trim()) return;

    await createMeal({
      mealType: selectedMealType,
      name: mealName.trim(),
      calories: mealCalories ? parseInt(mealCalories) : undefined,
      protein: mealProtein ? parseInt(mealProtein) : undefined,
      carbs: mealCarbs ? parseInt(mealCarbs) : undefined,
      fat: mealFat ? parseInt(mealFat) : undefined,
      notes: mealNotes.trim() || undefined,
    });

    resetMealEditor();
  };

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal({ id });
  };

  const handleLogWater = async (amount: number) => {
    const newAmount = Math.max(0, todayWater + amount);
    await logWater({ glasses: newAmount, date: today });
  };

  const resetMealEditor = () => {
    setShowMealEditor(false);
    setMealName("");
    setMealCalories("");
    setMealProtein("");
    setMealCarbs("");
    setMealFat("");
    setMealNotes("");
  };

  const getMealIcon = (type: string) => {
    const meal = MEAL_TYPES.find((m) => m.value === type);
    if (!meal) return Coffee;
    return meal.icon;
  };

  const getMealColor = (type: string) => {
    const meal = MEAL_TYPES.find((m) => m.value === type);
    return meal?.color || "text-muted-foreground";
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
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            {lang === "bn" ? "পুষ্টি" : "Nutrition"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "bn"
              ? "আপনার খাবার এবং পুষ্টি ট্র্যাক করুন"
              : "Track your meals and nutrition"}
          </p>
        </div>
        <button
          onClick={() => setShowMealEditor(true)}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {lang === "bn" ? "খাবার যোগ করুন" : "Add Meal"}
        </button>
      </motion.div>

      {/* Daily Progress */}
      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
        {/* Calorie Progress */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">
              {lang === "bn" ? "আজকের ক্যালোরি" : "Today's Calories"}
            </h3>
            <span className="text-sm text-muted-foreground">
              {todayStats.calories} / {CALORIE_GOAL}
            </span>
          </div>
          <div className="h-3 bg-foreground/10 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (todayStats.calories / CALORIE_GOAL) * 100)}%`,
              }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <p className="font-semibold text-blue-500">
                {todayStats.protein}g
              </p>
              <p className="text-muted-foreground">
                {lang === "bn" ? "প্রোটিন" : "Protein"}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <p className="font-semibold text-yellow-500">
                {todayStats.carbs}g
              </p>
              <p className="text-muted-foreground">
                {lang === "bn" ? "কার্বস" : "Carbs"}
              </p>
            </div>
            <div className="rounded-lg bg-pink-500/10 p-2">
              <p className="font-semibold text-pink-500">{todayStats.fat}g</p>
              <p className="text-muted-foreground">
                {lang === "bn" ? "ফ্যাট" : "Fat"}
              </p>
            </div>
          </div>
        </div>

        {/* Water Tracker */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              {lang === "bn" ? "পানি" : "Water"}
            </h3>
            <span className="text-sm text-muted-foreground">
              {todayWater} / {WATER_GOAL} {lang === "bn" ? "গ্লাস" : "glasses"}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 mb-3">
            <button
              onClick={() => handleLogWater(-1)}
              disabled={todayWater === 0}
              className="cursor-pointer rounded-full bg-foreground/10 p-3 hover:bg-foreground/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-5 w-5" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: WATER_GOAL }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`h-8 w-6 rounded-lg flex items-center justify-center text-lg ${
                    i < todayWater ? "bg-blue-500/20" : "bg-foreground/5"
                  }`}
                >
                  {i < todayWater ? "💧" : ""}
                </motion.div>
              ))}
            </div>
            <button
              onClick={() => handleLogWater(1)}
              disabled={todayWater >= WATER_GOAL}
              className="cursor-pointer rounded-full bg-blue-500/20 p-3 hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5 text-blue-500" />
            </button>
          </div>
          <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (todayWater / WATER_GOAL) * 100)}%`,
              }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Today's Meals */}
      <motion.div variants={fadeUp}>
        <h3 className="font-semibold mb-3">
          {lang === "bn" ? "আজকের খাবার" : "Today's Meals"}
        </h3>
        <div className="space-y-3">
          {todayMeals.length === 0 ? (
            <div className="glass rounded-2xl p-6 text-center">
              <UtensilsCrossed className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {lang === "bn"
                  ? "আজ কোনো খাবার লগ করা হয়নি"
                  : "No meals logged today"}
              </p>
            </div>
          ) : (
            todayMeals.map((meal) => {
              const Icon = getMealIcon(meal.mealType);
              return (
                <motion.div
                  key={meal._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-xl p-3 flex items-center gap-3 hover-row"
                >
                  <div
                    className={`rounded-lg p-2 bg-foreground/5 ${getMealColor(meal.mealType)}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{meal.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {meal.calories && <span>{meal.calories} cal</span>}
                      {meal.protein && <span>{meal.protein}g protein</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMeal(meal._id)}
                    className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Add Meal Modal */}
      <AnimatePresence>
        {showMealEditor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={resetMealEditor}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md sm:max-h-[85vh] z-50 glass rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/20">
                <h2 className="font-semibold">
                  {lang === "bn" ? "খাবার যোগ করুন" : "Add Meal"}
                </h2>
                <button
                  onClick={resetMealEditor}
                  className="cursor-pointer p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Meal Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {lang === "bn" ? "খাবারের ধরন" : "Meal Type"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {MEAL_TYPES.map((mt) => {
                      const Icon = mt.icon;
                      return (
                        <button
                          key={mt.value}
                          onClick={() => setSelectedMealType(mt.value)}
                          className={`cursor-pointer flex flex-col items-center gap-1 rounded-xl p-3 transition-colors ${
                            selectedMealType === mt.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-foreground/5 hover:bg-foreground/10"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs capitalize">{mt.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder={
                    lang === "bn" ? "খাবারের নাম..." : "Meal name..."
                  }
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full rounded-xl bg-foreground/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "ক্যালোরি" : "Calories"}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={mealCalories}
                      onChange={(e) => setMealCalories(e.target.value)}
                      className="w-full rounded-xl bg-foreground/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "প্রোটিন (g)" : "Protein (g)"}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={mealProtein}
                      onChange={(e) => setMealProtein(e.target.value)}
                      className="w-full rounded-xl bg-foreground/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "কার্বস (g)" : "Carbs (g)"}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={mealCarbs}
                      onChange={(e) => setMealCarbs(e.target.value)}
                      className="w-full rounded-xl bg-foreground/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {lang === "bn" ? "ফ্যাট (g)" : "Fat (g)"}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={mealFat}
                      onChange={(e) => setMealFat(e.target.value)}
                      className="w-full rounded-xl bg-foreground/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <textarea
                  placeholder={lang === "bn" ? "নোট..." : "Notes..."}
                  value={mealNotes}
                  onChange={(e) => setMealNotes(e.target.value)}
                  className="w-full rounded-xl bg-foreground/5 px-4 py-3 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 p-4 border-t border-border/20">
                <button
                  onClick={resetMealEditor}
                  className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={handleAddMeal}
                  disabled={!mealName.trim()}
                  className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {lang === "bn" ? "যোগ করুন" : "Add"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
