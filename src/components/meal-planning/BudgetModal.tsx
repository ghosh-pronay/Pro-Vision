import { motion, AnimatePresence } from "framer-motion"
import { DollarSign, X } from "lucide-react"
import {
  type MealPlan,
  type Recipe,
  DAYS,
  MEAL_TYPES,
  CATEGORIES,
  fadeIn,
  scaleIn,
} from "./types"

interface BudgetModalProps {
  lang: string
  show: boolean
  onClose: () => void
  weeklyStats: {
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    totalCost: number
    mealCount: number
  }
  mealPlan: MealPlan
  getRecipeById: (id: string) => Recipe | undefined
}

export function BudgetModal({
  lang,
  show,
  onClose,
  weeklyStats,
  mealPlan,
  getRecipeById,
}: BudgetModalProps) {
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
            className="glass-strong rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                {lang === "bn" ? "বাজেট সারসংক্ষেপ" : "Budget Summary"}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                aria-label="Close"
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
                    const recipeId = mealPlan[day.key]?.[mt.key]
                    const recipe = recipeId ? getRecipeById(recipeId) : null
                    return sum + (recipe?.cost || 0)
                  }, 0)
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
                  )
                })}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  {lang === "bn" ? "শ্রেণী অনুযায়ী খরচ" : "Cost by Category"}
                </h4>
                {CATEGORIES.map((cat) => {
                  let catCost = 0
                  DAYS.forEach((day) => {
                    MEAL_TYPES.forEach((mt) => {
                      const recipeId = mealPlan[day.key]?.[mt.key]
                      const recipe = recipeId ? getRecipeById(recipeId) : null
                      if (recipe && recipe.category === cat.key) {
                        catCost += recipe.cost
                      }
                    })
                  })
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
                  )
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
