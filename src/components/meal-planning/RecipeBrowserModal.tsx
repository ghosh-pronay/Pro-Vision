import { motion, AnimatePresence } from "framer-motion";
import { X, UtensilsCrossed, Flame, Clock, Heart } from "lucide-react";
import {
  type MealType,
  type DayOfWeek,
  type RecipeCategory,
  DAYS,
  MEAL_TYPES,
  CATEGORIES,
  RECIPES,
  DIFFICULTY_COLORS,
  fadeIn,
  scaleIn,
} from "./types";

interface RecipeBrowserModalProps {
  lang: string;
  show: boolean;
  onClose: () => void;
  selectedDay: DayOfWeek;
  selectedMealType: MealType;
  selectedCategory: RecipeCategory;
  onSelectDay: (day: DayOfWeek) => void;
  onSelectMealType: (mealType: MealType) => void;
  onSelectCategory: (category: RecipeCategory) => void;
  onAddMeal: (recipeId: string) => void;
  favorites: string[];
  onToggleFavorite: (recipeId: string) => void;
}

export function RecipeBrowserModal({
  lang,
  show,
  onClose,
  selectedDay,
  selectedMealType,
  selectedCategory,
  onSelectDay,
  onSelectMealType,
  onSelectCategory,
  onAddMeal,
  favorites,
  onToggleFavorite,
}: RecipeBrowserModalProps) {
  const filteredRecipes = RECIPES.filter(
    (r) => r.category === selectedCategory,
  );

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={fadeIn.hidden}
          animate={fadeIn.visible}
          exit={fadeIn.hidden}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
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
                  onClick={onClose}
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
                      onClick={() => onSelectDay(day.key)}
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
                        onClick={() => onSelectMealType(mt.key)}
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

            <div className="flex gap-2 p-4 border-b border-border/50 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => onSelectCategory(cat.key)}
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

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredRecipes.map((recipe) => {
                const isFav = favorites.includes(recipe.id);
                return (
                  <motion.div
                    key={recipe.id}
                    whileHover={{ scale: 1.01 }}
                    className="glass-subtle rounded-xl p-4 cursor-pointer"
                    onClick={() => onAddMeal(recipe.id)}
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
                          onToggleFavorite(recipe.id);
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
  );
}
