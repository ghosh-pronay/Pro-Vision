import { motion } from "framer-motion";
import { Sparkles, Plus, Flame } from "lucide-react";
import { type MealType, type Recipe, MEAL_TYPES, fadeUp } from "./types";

interface TodayPlanProps {
  lang: string;
  todayPlan: { [key in MealType]?: string };
  todayStats: { calories: number; protein: number; carbs: number; fat: number };
  getRecipeById: (id: string) => Recipe | undefined;
  onAddMeal: (mealType: MealType) => void;
}

export function TodayPlan({
  lang,
  todayPlan,
  todayStats,
  getRecipeById,
  onAddMeal,
}: TodayPlanProps) {
  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-4 md:p-6 mb-6">
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
                    {recipe.calories} cal · {recipe.prepTime + recipe.cookTime}{" "}
                    min
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
                onClick={() => onAddMeal(mt.key)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Plus className="w-3 h-3 text-primary" />
              </motion.button>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
