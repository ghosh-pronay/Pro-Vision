import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo, useCallback } from "react";
import {
  UtensilsCrossed,
  Plus,
  Clock,
  Flame,
  ShoppingCart,
  Share2,
  Heart,
  X,
  Check,
  CalendarDays,
  TrendingUp,
  DollarSign,
  ChefHat,
  Sparkles,
  Utensils,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type MealType = "breakfast" | "lunch" | "dinner" | "snacks";
type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type Difficulty = "easy" | "medium" | "hard";
type RecipeCategory = "rice" | "curry" | "snacks" | "sweets";

interface Recipe {
  id: string;
  nameEn: string;
  nameBn: string;
  category: RecipeCategory;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  ingredients: string[];
  cost: number;
}

interface MealPlan {
  [day: string]: {
    [meal in MealType]?: string;
  };
}

interface GroceryItem {
  name: string;
  quantity: number;
  checked: boolean;
}

const RECIPES: Recipe[] = [
  {
    id: "biryani",
    nameEn: "Biryani",
    nameBn: "বিরিয়ানি",
    category: "rice",
    calories: 520,
    protein: 28,
    carbs: 55,
    fat: 18,
    prepTime: 30,
    cookTime: 60,
    difficulty: "medium",
    ingredients: ["Rice", "Chicken", "Onion", "Spices", "Yogurt", "Ghee"],
    cost: 250,
  },
  {
    id: "hansi_curry",
    nameEn: "Hansi Curry",
    nameBn: "হান্সি কারি",
    category: "curry",
    calories: 450,
    protein: 35,
    carbs: 20,
    fat: 25,
    prepTime: 20,
    cookTime: 90,
    difficulty: "hard",
    ingredients: ["Chicken", "Onion", "Garlic", "Ginger", "Spices", "Oil"],
    cost: 300,
  },
  {
    id: "fish_curry",
    nameEn: "Fish Curry",
    nameBn: "মাছের ঝোল",
    category: "curry",
    calories: 380,
    protein: 32,
    carbs: 15,
    fat: 20,
    prepTime: 15,
    cookTime: 30,
    difficulty: "easy",
    ingredients: ["Fish", "Turmeric", "Chili", "Onion", "Garlic", "Oil"],
    cost: 200,
  },
  {
    id: "panir_pitha",
    nameEn: "Panir Pitha",
    nameBn: "পানির পিঠা",
    category: "snacks",
    calories: 220,
    protein: 8,
    carbs: 35,
    fat: 6,
    prepTime: 25,
    cookTime: 20,
    difficulty: "medium",
    ingredients: ["Rice Flour", "Coconut", "Jaggery", "Cardamom"],
    cost: 80,
  },
  {
    id: "khichuri",
    nameEn: "Khichuri",
    nameBn: "খিচুড়ি",
    category: "rice",
    calories: 350,
    protein: 18,
    carbs: 50,
    fat: 10,
    prepTime: 10,
    cookTime: 30,
    difficulty: "easy",
    ingredients: ["Rice", "Lentils", "Turmeric", "Ginger", "Ghee"],
    cost: 120,
  },
  {
    id: "rice",
    nameEn: "Plain Rice",
    nameBn: "ভাত",
    category: "rice",
    calories: 200,
    protein: 4,
    carbs: 45,
    fat: 0.5,
    prepTime: 5,
    cookTime: 20,
    difficulty: "easy",
    ingredients: ["Rice", "Water", "Salt"],
    cost: 30,
  },
  {
    id: "dal",
    nameEn: "Lentils",
    nameBn: "ডাল",
    category: "curry",
    calories: 250,
    protein: 20,
    carbs: 35,
    fat: 5,
    prepTime: 10,
    cookTime: 25,
    difficulty: "easy",
    ingredients: ["Lentils", "Onion", "Garlic", "Turmeric", "Cumin", "Oil"],
    cost: 60,
  },
  {
    id: "shak",
    nameEn: "Spinach",
    nameBn: "শাক",
    category: "curry",
    calories: 150,
    protein: 8,
    carbs: 12,
    fat: 8,
    prepTime: 10,
    cookTime: 15,
    difficulty: "easy",
    ingredients: ["Spinach", "Onion", "Garlic", "Chili", "Oil"],
    cost: 40,
  },
  {
    id: "claypot_meat",
    nameEn: "Clay Pot Meat",
    nameBn: "মাটির হাঁড়ির মাংস",
    category: "curry",
    calories: 480,
    protein: 38,
    carbs: 10,
    fat: 30,
    prepTime: 25,
    cookTime: 120,
    difficulty: "hard",
    ingredients: ["Meat", "Onion", "Garlic", "Ginger", "Spices", "Clay Pot"],
    cost: 350,
  },
  {
    id: "fried_pitha",
    nameEn: "Fried Pitha",
    nameBn: "তেলে ভাজা পিঠা",
    category: "snacks",
    calories: 280,
    protein: 6,
    carbs: 40,
    fat: 12,
    prepTime: 20,
    cookTime: 15,
    difficulty: "medium",
    ingredients: ["Rice Flour", "Coconut", "Jaggery", "Oil"],
    cost: 90,
  },
  {
    id: "mishti_pitha",
    nameEn: "Sweet Pitha",
    nameBn: "মিষ্টি পিঠা",
    category: "sweets",
    calories: 300,
    protein: 5,
    carbs: 50,
    fat: 10,
    prepTime: 20,
    cookTime: 25,
    difficulty: "medium",
    ingredients: ["Rice Flour", "Coconut", "Jaggery", "Cardamom", "Milk"],
    cost: 100,
  },
  {
    id: "firni",
    nameEn: "Firni",
    nameBn: "ফিরনি",
    category: "sweets",
    calories: 320,
    protein: 10,
    carbs: 45,
    fat: 12,
    prepTime: 15,
    cookTime: 30,
    difficulty: "easy",
    ingredients: ["Rice Flour", "Milk", "Sugar", "Cardamom", "Nuts"],
    cost: 110,
  },
];

const DAYS: { key: DayOfWeek; en: string; bn: string }[] = [
  { key: "mon", en: "Mon", bn: "সোম" },
  { key: "tue", en: "Tue", bn: "মঙ্গল" },
  { key: "wed", en: "Wed", bn: "বুধ" },
  { key: "thu", en: "Thu", bn: "বৃহ" },
  { key: "fri", en: "Fri", bn: "শুক্র" },
  { key: "sat", en: "Sat", bn: "শনি" },
  { key: "sun", en: "Sun", bn: "রবি" },
];

const MEAL_TYPES: {
  key: MealType;
  en: string;
  bn: string;
  icon: typeof Coffee;
}[] = [
  { key: "breakfast", en: "Breakfast", bn: "নাস্তা", icon: Coffee },
  { key: "lunch", en: "Lunch", bn: "দুপুরের খাবার", icon: Sun },
  { key: "dinner", en: "Dinner", bn: "রাতের খাবার", icon: Moon },
  { key: "snacks", en: "Snacks", bn: "স্ন্যাকস", icon: Cookie },
];

const CATEGORIES: { key: RecipeCategory; en: string; bn: string }[] = [
  { key: "rice", en: "Rice", bn: "ভাত" },
  { key: "curry", en: "Curry", bn: "তরকারি" },
  { key: "snacks", en: "Snacks", bn: "স্ন্যাকস" },
  { key: "sweets", en: "Sweets", bn: "মিষ্টান্ন" },
];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
};

function getDefaultPlan(): MealPlan {
  const plan: MealPlan = {};
  DAYS.forEach((d) => {
    plan[d.key] = {};
  });
  return plan;
}

export default function MealPlanning() {
  const { lang } = useLang();

  const [mealPlan, setMealPlan] = useState<MealPlan>(getDefaultPlan);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    () => DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].key,
  );
  const [showRecipeBrowser, setShowRecipeBrowser] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const [selectedCategory, setSelectedCategory] =
    useState<RecipeCategory>("rice");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [showGrocery, setShowGrocery] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [savedPlans, setSavedPlans] = useState<
    { name: string; plan: MealPlan }[]
  >([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [planName, setPlanName] = useState("");
  const [deleteConfirmDay, setDeleteConfirmDay] = useState<{
    day: DayOfWeek;
    meal: MealType;
  } | null>(null);
  const [showShare, setShowShare] = useState(false);

  const getRecipeById = useCallback(
    (id: string) => RECIPES.find((r) => r.id === id),
    [],
  );

  const getRecipeName = useCallback(
    (id: string) => {
      const recipe = getRecipeById(id);
      if (!recipe) return id;
      return lang === "bn" ? recipe.nameBn : recipe.nameEn;
    },
    [lang, getRecipeById],
  );

  const weeklyStats = useMemo(() => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalCost = 0;
    let mealCount = 0;

    DAYS.forEach((day) => {
      MEAL_TYPES.forEach((mt) => {
        const recipeId = mealPlan[day.key]?.[mt.key];
        if (recipeId) {
          const recipe = getRecipeById(recipeId);
          if (recipe) {
            totalCalories += recipe.calories;
            totalProtein += recipe.protein;
            totalCarbs += recipe.carbs;
            totalFat += recipe.fat;
            totalCost += recipe.cost;
            mealCount++;
          }
        }
      });
    });

    return {
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalCost,
      mealCount,
    };
  }, [mealPlan, getRecipeById]);

  const todayPlan = useMemo(() => {
    const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const todayKey = DAYS[todayIdx].key;
    return mealPlan[todayKey] || {};
  }, [mealPlan]);

  const todayStats = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    MEAL_TYPES.forEach((mt) => {
      const recipeId = todayPlan[mt.key];
      if (recipeId) {
        const recipe = getRecipeById(recipeId);
        if (recipe) {
          calories += recipe.calories;
          protein += recipe.protein;
          carbs += recipe.carbs;
          fat += recipe.fat;
        }
      }
    });
    return { calories, protein, carbs, fat };
  }, [todayPlan, getRecipeById]);

  const filteredRecipes = useMemo(
    () => RECIPES.filter((r) => r.category === selectedCategory),
    [selectedCategory],
  );

  const generateGroceryList = useCallback(() => {
    const ingredientMap: Record<string, number> = {};
    DAYS.forEach((day) => {
      MEAL_TYPES.forEach((mt) => {
        const recipeId = mealPlan[day.key]?.[mt.key];
        if (recipeId) {
          const recipe = getRecipeById(recipeId);
          if (recipe) {
            recipe.ingredients.forEach((ing) => {
              ingredientMap[ing] = (ingredientMap[ing] || 0) + 1;
            });
          }
        }
      });
    });
    const items: GroceryItem[] = Object.entries(ingredientMap).map(
      ([name, quantity]) => ({
        name,
        quantity,
        checked: false,
      }),
    );
    setGroceryList(items);
    setShowGrocery(true);
  }, [mealPlan, getRecipeById]);

  const handleAddMeal = (recipeId: string) => {
    setMealPlan((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [selectedMealType]: recipeId,
      },
    }));
    setShowRecipeBrowser(false);
  };

  const handleRemoveMeal = (day: DayOfWeek, meal: MealType) => {
    setMealPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: undefined,
      },
    }));
    setDeleteConfirmDay(null);
  };

  const toggleFavorite = (recipeId: string) => {
    setFavorites((prev) =>
      prev.includes(recipeId)
        ? prev.filter((id) => id !== recipeId)
        : [...prev, recipeId],
    );
  };

  const toggleGroceryItem = (index: number) => {
    setGroceryList((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const handleSavePlan = () => {
    if (!planName.trim()) return;
    setSavedPlans((prev) => [
      ...prev,
      { name: planName, plan: { ...mealPlan } },
    ]);
    setPlanName("");
    setShowSaveModal(false);
  };

  const handleSharePlan = () => {
    let text =
      lang === "bn"
        ? "আমার সাপ্তাহিক খাদ্য পরিকল্পনা:\n\n"
        : "My Weekly Meal Plan:\n\n";
    DAYS.forEach((day) => {
      const dayName = lang === "bn" ? day.bn : day.en;
      text += `${dayName}:\n`;
      MEAL_TYPES.forEach((mt) => {
        const mealName = lang === "bn" ? mt.bn : mt.en;
        const recipeId = mealPlan[day.key]?.[mt.key];
        const recipeName = recipeId
          ? getRecipeName(recipeId)
          : lang === "bn"
            ? "নেই"
            : "None";
        text += `  ${mealName}: ${recipeName}\n`;
      });
      text += "\n";
    });
    text += `${lang === "bn" ? "মোট খরচ" : "Total Cost"}: ৳${weeklyStats.totalCost}`;

    if (navigator.share) {
      navigator.share({ title: "Pro-Vision Meal Plan", text });
    } else {
      navigator.clipboard.writeText(text);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  const resetWeek = () => {
    setMealPlan(getDefaultPlan());
  };

  return (
    <div className="min-h-screen bg-mesh p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <UtensilsCrossed className="w-7 h-7 text-primary" />
              {lang === "bn"
                ? "সাপ্তাহিক খাদ্য পরিকল্পনা"
                : "Weekly Meal Planning"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {lang === "bn"
                ? "আপনার সপ্তাহের খাবার পরিকল্পনা করুন"
                : "Plan your weekly meals with authentic Bangladeshi recipes"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateGroceryList}
              className="glass px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              {lang === "bn" ? "বাজার তালিকা" : "Grocery List"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowBudget(true)}
              className="glass px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
            >
              <DollarSign className="w-4 h-4" />
              {lang === "bn" ? "বাজেট" : "Budget"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSharePlan}
              className="glass px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              {lang === "bn" ? "শেয়ার" : "Share"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSaveModal(true)}
              className="glass px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
            >
              <Heart className="w-4 h-4" />
              {lang === "bn" ? "সংরক্ষণ" : "Save"}
            </motion.button>
          </div>
        </div>

        {/* Today's Plan */}
        <motion.div
          variants={fadeUp}
          className="glass rounded-2xl p-4 md:p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              {lang === "bn" ? "আজকের পরিকল্পনা" : "Today's Plan"}
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                {todayStats.calories} {lang === "bn" ? "ক্যালোরি" : "cal"}
              </span>
              <span className="text-muted-foreground">
                {todayStats.protein}g {lang === "bn" ? "প্রোটিন" : "protein"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MEAL_TYPES.map((mt) => {
              const Icon = mt.icon;
              const recipeId = todayPlan[mt.key];
              const recipe = recipeId ? getRecipeById(recipeId) : null;
              return (
                <div
                  key={mt.key}
                  className="glass-subtle rounded-xl p-3 relative group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      className={`w-4 h-4 ${
                        mt.key === "breakfast"
                          ? "text-orange-500"
                          : mt.key === "lunch"
                            ? "text-yellow-500"
                            : mt.key === "dinner"
                              ? "text-indigo-500"
                              : "text-pink-500"
                      }`}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {lang === "bn" ? mt.bn : mt.en}
                    </span>
                  </div>
                  {recipe ? (
                    <div>
                      <p className="text-sm font-medium truncate">
                        {lang === "bn" ? recipe.nameBn : recipe.nameEn}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {recipe.calories} cal ·{" "}
                        {recipe.prepTime + recipe.cookTime} min
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      {lang === "bn" ? "এখনো যোগ করা হয়নি" : "Not added yet"}
                    </p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedMealType(mt.key);
                      setShowRecipeBrowser(true);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-3 h-3 text-primary" />
                  </motion.button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Weekly Calendar View */}
        <motion.div
          variants={fadeUp}
          className="glass rounded-2xl p-4 md:p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              {lang === "bn" ? "সাপ্তাহিক ক্যালেন্ডার" : "Weekly Calendar"}
            </h2>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetWeek}
                className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                {lang === "bn" ? "রিসেট" : "Reset Week"}
              </motion.button>
            </div>
          </div>

          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground p-2 w-24">
                    {lang === "bn" ? "বিকেল" : "Meal"}
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day.key}
                      className={`text-center text-xs font-medium p-2 rounded-lg ${
                        selectedDay === day.key
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      <button
                        onClick={() => setSelectedDay(day.key)}
                        className="w-full"
                      >
                        {lang === "bn" ? day.bn : day.en}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEAL_TYPES.map((mt) => {
                  const Icon = mt.icon;
                  return (
                    <tr key={mt.key}>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs font-medium">
                            {lang === "bn" ? mt.bn : mt.en}
                          </span>
                        </div>
                      </td>
                      {DAYS.map((day) => {
                        const recipeId = mealPlan[day.key]?.[mt.key];
                        const recipe = recipeId
                          ? getRecipeById(recipeId)
                          : null;
                        return (
                          <td key={day.key} className="p-1.5">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`h-full min-h-[48px] rounded-lg p-1.5 flex items-center justify-center cursor-pointer transition-colors ${
                                recipe
                                  ? "bg-primary/10 hover:bg-primary/15"
                                  : "bg-muted/50 hover:bg-muted"
                              }`}
                              onClick={() => {
                                setSelectedDay(day.key);
                                setSelectedMealType(mt.key);
                                setShowRecipeBrowser(true);
                              }}
                            >
                              {recipe ? (
                                <div className="text-center w-full relative group">
                                  <p className="text-[10px] font-medium truncate px-1">
                                    {lang === "bn"
                                      ? recipe.nameBn
                                      : recipe.nameEn}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground">
                                    {recipe.calories} cal
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirmDay({
                                        day: day.key,
                                        meal: mt.key,
                                      });
                                    }}
                                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              ) : (
                                <Plus className="w-3 h-3 text-muted-foreground/50" />
                              )}
                            </motion.div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden space-y-4">
            <div className="flex gap-1 overflow-x-auto pb-2">
              {DAYS.map((day) => (
                <button
                  key={day.key}
                  onClick={() => setSelectedDay(day.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedDay === day.key
                      ? "bg-primary text-primary-foreground"
                      : "glass-subtle"
                  }`}
                >
                  {lang === "bn" ? day.bn : day.en}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {MEAL_TYPES.map((mt) => {
                const Icon = mt.icon;
                const recipeId = mealPlan[selectedDay]?.[mt.key];
                const recipe = recipeId ? getRecipeById(recipeId) : null;
                return (
                  <motion.div
                    key={mt.key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedMealType(mt.key);
                      setShowRecipeBrowser(true);
                    }}
                    className="glass-subtle rounded-xl p-3 flex items-center gap-3 cursor-pointer"
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        mt.key === "breakfast"
                          ? "text-orange-500"
                          : mt.key === "lunch"
                            ? "text-yellow-500"
                            : mt.key === "dinner"
                              ? "text-indigo-500"
                              : "text-pink-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        {lang === "bn" ? mt.bn : mt.en}
                      </p>
                      {recipe ? (
                        <p className="text-sm font-medium truncate">
                          {lang === "bn" ? recipe.nameBn : recipe.nameEn}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          {lang === "bn" ? "ট্যাপ করে যোগ করুন" : "Tap to add"}
                        </p>
                      )}
                    </div>
                    {recipe && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmDay({
                            day: selectedDay,
                            meal: mt.key,
                          });
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Weekly Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: lang === "bn" ? "মোট ক্যালোরি" : "Total Calories",
              value: weeklyStats.totalCalories,
              unit: "cal",
              icon: Flame,
              color: "text-orange-500",
            },
            {
              label: lang === "bn" ? "মোট প্রোটিন" : "Total Protein",
              value: weeklyStats.totalProtein,
              unit: "g",
              icon: TrendingUp,
              color: "text-blue-500",
            },
            {
              label: lang === "bn" ? "মোট খরচ" : "Total Cost",
              value: `৳${weeklyStats.totalCost}`,
              unit: "",
              icon: DollarSign,
              color: "text-green-500",
            },
            {
              label: lang === "bn" ? "খাবার সংখ্যা" : "Meals Planned",
              value: weeklyStats.mealCount,
              unit: `/28`,
              icon: Utensils,
              color: "text-purple-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <p className="text-xl font-bold">
                {stat.value}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  {stat.unit}
                </span>
              </p>
            </motion.div>
          ))}
        </div>

        {/* Recipe Browser CTA */}
        <motion.div
          variants={fadeUp}
          className="glass rounded-2xl p-4 md:p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              {lang === "bn" ? "বাংলাদেশি রেসিপি" : "Bangladeshi Recipes"}
            </h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRecipeBrowser(true)}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4" />
              {lang === "bn" ? "সব রেসিপি দেখুন" : "Browse All Recipes"}
            </motion.button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {RECIPES.slice(0, 5).map((recipe) => (
              <motion.div
                key={recipe.id}
                whileHover={{ scale: 1.02 }}
                className="glass-subtle rounded-xl p-3 cursor-pointer relative group"
                onClick={() => {
                  setSelectedMealType("lunch");
                  setShowRecipeBrowser(true);
                }}
              >
                <div className="w-full h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-2">
                  <UtensilsCrossed className="w-6 h-6 text-primary/50" />
                </div>
                <p className="text-xs font-medium truncate">
                  {lang === "bn" ? recipe.nameBn : recipe.nameEn}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">
                    {recipe.calories} cal
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[recipe.difficulty]}`}
                  >
                    {lang === "bn"
                      ? recipe.difficulty === "easy"
                        ? "সহজ"
                        : recipe.difficulty === "medium"
                          ? "মাঝারি"
                          : "কঠিন"
                      : recipe.difficulty}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipe.id);
                  }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-background/50 flex items-center justify-center"
                >
                  <Heart
                    className={`w-3 h-3 ${
                      favorites.includes(recipe.id)
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Saved Plans */}
        {savedPlans.length > 0 && (
          <motion.div
            variants={fadeUp}
            className="glass rounded-2xl p-4 md:p-6"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              {lang === "bn" ? "সংরক্ষিত পরিকল্পনা" : "Saved Plans"}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {savedPlans.map((sp, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="glass-subtle rounded-xl p-3 min-w-[160px] cursor-pointer"
                  onClick={() => setMealPlan({ ...sp.plan })}
                >
                  <p className="text-sm font-medium truncate">{sp.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Object.values(sp.plan).reduce(
                      (count, dayMeals) =>
                        count + Object.values(dayMeals).filter(Boolean).length,
                      0,
                    )}{" "}
                    {lang === "bn" ? "টি খাবার" : "meals"}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Recipe Browser Modal */}
      <AnimatePresence>
        {showRecipeBrowser && (
          <motion.div
            initial={fadeIn.hidden}
            animate={fadeIn.visible}
            exit={fadeIn.hidden}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowRecipeBrowser(false)}
          >
            <motion.div
              initial={scaleIn.hidden}
              animate={scaleIn.visible}
              exit={scaleIn.hidden}
              className="glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    {lang === "bn" ? "রেসিপি বাছাই" : "Select Recipe"}
                  </h3>
                  <button
                    onClick={() => setShowRecipeBrowser(false)}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">
                    {lang === "bn" ? "দিন:" : "Day:"}
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {DAYS.map((day) => (
                      <button
                        key={day.key}
                        onClick={() => setSelectedDay(day.key)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                          selectedDay === day.key
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {lang === "bn" ? day.bn : day.en}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {lang === "bn" ? "বিকেল:" : "Meal:"}
                  </span>
                  <div className="flex gap-1">
                    {MEAL_TYPES.map((mt) => {
                      const Icon = mt.icon;
                      return (
                        <button
                          key={mt.key}
                          onClick={() => setSelectedMealType(mt.key)}
                          className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                            selectedMealType === mt.key
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {lang === "bn" ? mt.bn : mt.en}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 p-4 border-b border-border/50 overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.key
                        ? "bg-primary text-primary-foreground"
                        : "glass-subtle"
                    }`}
                  >
                    {lang === "bn" ? cat.bn : cat.en}
                  </button>
                ))}
              </div>

              {/* Recipe List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredRecipes.map((recipe) => {
                  const isFav = favorites.includes(recipe.id);
                  return (
                    <motion.div
                      key={recipe.id}
                      whileHover={{ scale: 1.01 }}
                      className="glass-subtle rounded-xl p-4 cursor-pointer"
                      onClick={() => handleAddMeal(recipe.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                          <UtensilsCrossed className="w-7 h-7 text-primary/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {lang === "bn" ? recipe.nameBn : recipe.nameEn}
                            </h4>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[recipe.difficulty]}`}
                            >
                              {lang === "bn"
                                ? recipe.difficulty === "easy"
                                  ? "সহজ"
                                  : recipe.difficulty === "medium"
                                    ? "মাঝারি"
                                    : "কঠিন"
                                : recipe.difficulty}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3" />
                              {recipe.calories}{" "}
                              {lang === "bn" ? "ক্যালোরি" : "cal"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {recipe.prepTime + recipe.cookTime} min
                            </span>
                            <span>৳{recipe.cost}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {recipe.ingredients.slice(0, 4).map((ing) => (
                              <span
                                key={ing}
                                className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted"
                              >
                                {ing}
                              </span>
                            ))}
                            {recipe.ingredients.length > 4 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted">
                                +{recipe.ingredients.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(recipe.id);
                          }}
                          className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center shrink-0"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isFav
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grocery List Modal */}
      <AnimatePresence>
        {showGrocery && (
          <motion.div
            initial={fadeIn.hidden}
            animate={fadeIn.visible}
            exit={fadeIn.hidden}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowGrocery(false)}
          >
            <motion.div
              initial={scaleIn.hidden}
              animate={scaleIn.visible}
              exit={scaleIn.hidden}
              className="glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-500" />
                  {lang === "bn" ? "বাজার তালিকা" : "Grocery List"}
                </h3>
                <button
                  onClick={() => setShowGrocery(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {groceryList.length === 0 ? (
                  <EmptyState
                    icon={ShoppingCart}
                    title={lang === "bn" ? "তালিকা খালি" : "No items"}
                    description={
                      lang === "bn"
                        ? "আগে খাবার যোগ করুন"
                        : "Add meals to generate a grocery list"
                    }
                  />
                ) : (
                  <div className="space-y-2">
                    {groceryList.map((item, i) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          item.checked ? "bg-green-500/10" : "glass-subtle"
                        }`}
                        onClick={() => toggleGroceryItem(i)}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            item.checked
                              ? "bg-green-500 border-green-500"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {item.checked && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span
                          className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : ""}`}
                        >
                          {item.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ×{item.quantity}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground text-center">
                  {groceryList.filter((i) => i.checked).length}/
                  {groceryList.length}{" "}
                  {lang === "bn" ? "টি আইটেম সম্পন্ন" : "items checked"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Modal */}
      <AnimatePresence>
        {showBudget && (
          <motion.div
            initial={fadeIn.hidden}
            animate={fadeIn.visible}
            exit={fadeIn.hidden}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowBudget(false)}
          >
            <motion.div
              initial={scaleIn.hidden}
              animate={scaleIn.visible}
              exit={scaleIn.hidden}
              className="glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  {lang === "bn" ? "বাজেট সারসংক্ষেপ" : "Budget Summary"}
                </h3>
                <button
                  onClick={() => setShowBudget(false)}
                  className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {lang === "bn" ? "সাপ্তাহিক খরচ" : "Weekly Cost"}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ৳{weeklyStats.totalCost}
                    </p>
                  </div>
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {lang === "bn" ? "গড় প্রতি খাবার" : "Avg Per Meal"}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      ৳
                      {weeklyStats.mealCount > 0
                        ? Math.round(
                            weeklyStats.totalCost / weeklyStats.mealCount,
                          )
                        : 0}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    {lang === "bn" ? "খাবার অনুযায়ী খরচ" : "Cost by Meal"}
                  </h4>
                  {DAYS.map((day) => {
                    const dayCost = MEAL_TYPES.reduce((sum, mt) => {
                      const recipeId = mealPlan[day.key]?.[mt.key];
                      const recipe = recipeId ? getRecipeById(recipeId) : null;
                      return sum + (recipe?.cost || 0);
                    }, 0);
                    return (
                      <div
                        key={day.key}
                        className="flex items-center justify-between glass-subtle rounded-lg px-3 py-2"
                      >
                        <span className="text-sm">
                          {lang === "bn" ? day.bn : day.en}
                        </span>
                        <span className="text-sm font-medium">৳{dayCost}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">
                    {lang === "bn" ? "শ্রেণী অনুযায়ী খরচ" : "Cost by Category"}
                  </h4>
                  {CATEGORIES.map((cat) => {
                    let catCost = 0;
                    DAYS.forEach((day) => {
                      MEAL_TYPES.forEach((mt) => {
                        const recipeId = mealPlan[day.key]?.[mt.key];
                        const recipe = recipeId
                          ? getRecipeById(recipeId)
                          : null;
                        if (recipe && recipe.category === cat.key) {
                          catCost += recipe.cost;
                        }
                      });
                    });
                    return (
                      <div
                        key={cat.key}
                        className="flex items-center justify-between glass-subtle rounded-lg px-3 py-2"
                      >
                        <span className="text-sm">
                          {lang === "bn" ? cat.bn : cat.en}
                        </span>
                        <span className="text-sm font-medium">৳{catCost}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Plan Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={fadeIn.hidden}
            animate={fadeIn.visible}
            exit={fadeIn.hidden}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={scaleIn.hidden}
              animate={scaleIn.visible}
              exit={scaleIn.hidden}
              className="glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                {lang === "bn" ? "পরিকল্পনা সংরক্ষণ" : "Save Plan"}
              </h3>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder={lang === "bn" ? "পরিকল্পনার নাম" : "Plan name"}
                className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyDown={(e) => e.key === "Enter" && handleSavePlan()}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl glass-subtle text-sm font-medium"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={handleSavePlan}
                  disabled={!planName.trim()}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  {lang === "bn" ? "সংরক্ষণ" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Toast */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 glass-strong rounded-xl px-4 py-3 flex items-center gap-2 z-50"
          >
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              {lang === "bn"
                ? "ক্লিপবোর্ডে কপি করা হয়েছে!"
                : "Copied to clipboard!"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirmDay}
        onOpenChange={() => setDeleteConfirmDay(null)}
        title={lang === "bn" ? "খাবার মুছুন?" : "Remove meal?"}
        description={
          lang === "bn"
            ? "এই খাবারটি পরিকল্পনা থেকে সরানো হবে।"
            : "This meal will be removed from your plan."
        }
        onConfirm={() => {
          if (deleteConfirmDay) {
            handleRemoveMeal(deleteConfirmDay.day, deleteConfirmDay.meal);
          }
        }}
        confirmLabel={lang === "bn" ? "মুছুন" : "Remove"}
      />
    </div>
  );
}
