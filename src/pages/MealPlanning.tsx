import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo, useCallback } from "react";
import {
  UtensilsCrossed,
  ShoppingCart,
  Share2,
  Heart,
  Check,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  TodayPlan,
  WeeklyCalendar,
  WeeklySummary,
  RecipeBrowserModal,
  GroceryListModal,
  BudgetModal,
  SavePlanModal,
} from "@/components/meal-planning";
import {
  type MealType,
  type DayOfWeek,
  type GroceryItem,
  type RecipeCategory,
  RECIPES,
  DAYS,
  MEAL_TYPES,
  getDefaultPlan,
  fadeUp,
} from "@/components/meal-planning/types";

export default function MealPlanning() {
  const { lang } = useLang();

  const [mealPlan, setMealPlan] = useState(getDefaultPlan);
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
    { name: string; plan: typeof mealPlan }[]
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

  const handleOpenRecipeBrowser = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setShowRecipeBrowser(true);
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
              <Share2 className="w-4 h-4" />
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

        <TodayPlan
          lang={lang}
          todayPlan={todayPlan}
          todayStats={todayStats}
          getRecipeById={getRecipeById}
          onAddMeal={handleOpenRecipeBrowser}
        />

        <WeeklyCalendar
          lang={lang}
          mealPlan={mealPlan}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onSelectMeal={(day, meal) => {
            setSelectedDay(day);
            setSelectedMealType(meal);
            setShowRecipeBrowser(true);
          }}
          onDeleteMeal={(day, meal) => setDeleteConfirmDay({ day, meal })}
          onResetWeek={resetWeek}
          getRecipeById={getRecipeById}
        />

        <WeeklySummary lang={lang} weeklyStats={weeklyStats} />

        {/* Recipe Browser CTA */}
        <motion.div
          variants={fadeUp}
          className="glass rounded-2xl p-4 md:p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
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
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      recipe.difficulty === "easy"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : recipe.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
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

      <RecipeBrowserModal
        lang={lang}
        show={showRecipeBrowser}
        onClose={() => setShowRecipeBrowser(false)}
        selectedDay={selectedDay}
        selectedMealType={selectedMealType}
        selectedCategory={selectedCategory}
        onSelectDay={setSelectedDay}
        onSelectMealType={setSelectedMealType}
        onSelectCategory={setSelectedCategory}
        onAddMeal={handleAddMeal}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      <GroceryListModal
        lang={lang}
        show={showGrocery}
        onClose={() => setShowGrocery(false)}
        groceryList={groceryList}
        onToggleItem={toggleGroceryItem}
      />

      <BudgetModal
        lang={lang}
        show={showBudget}
        onClose={() => setShowBudget(false)}
        weeklyStats={weeklyStats}
        mealPlan={mealPlan}
        getRecipeById={getRecipeById}
      />

      <SavePlanModal
        lang={lang}
        show={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        planName={planName}
        onPlanNameChange={setPlanName}
        onSave={handleSavePlan}
      />

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

      <ConfirmDialog
        open={!!deleteConfirmDay}
        onCancel={() => setDeleteConfirmDay(null)}
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
