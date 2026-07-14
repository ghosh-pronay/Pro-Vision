import { motion } from "framer-motion"
import { CalendarDays, Plus, X, Trash2 } from "lucide-react"
import {
  type MealType,
  type DayOfWeek,
  type MealPlan,
  type Recipe,
  DAYS,
  MEAL_TYPES,
  fadeUp,
} from "./types"

interface WeeklyCalendarProps {
  lang: string
  mealPlan: MealPlan
  selectedDay: DayOfWeek
  onSelectDay: (day: DayOfWeek) => void
  onSelectMeal: (day: DayOfWeek, meal: MealType) => void
  onDeleteMeal: (day: DayOfWeek, meal: MealType) => void
  onResetWeek: () => void
  getRecipeById: (id: string) => Recipe | undefined
}

export function WeeklyCalendar({
  lang,
  mealPlan,
  selectedDay,
  onSelectDay,
  onSelectMeal,
  onDeleteMeal,
  onResetWeek,
  getRecipeById,
}: WeeklyCalendarProps) {
  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-4 md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-500" />
          {lang === "bn" ? "সাপ্তাহিক ক্যালেন্ডার" : "Weekly Calendar"}
        </h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResetWeek}
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
                    onClick={() => onSelectDay(day.key)}
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
              const Icon = mt.icon
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
                    const recipeId = mealPlan[day.key]?.[mt.key]
                    const recipe = recipeId ? getRecipeById(recipeId) : null
                    return (
                      <td key={day.key} className="p-1.5">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`h-full min-h-[48px] rounded-lg p-1.5 flex items-center justify-center cursor-pointer transition-colors ${
                            recipe
                              ? "bg-primary/10 hover:bg-primary/15"
                              : "bg-muted/50 hover:bg-muted"
                          }`}
                          onClick={() => onSelectMeal(day.key, mt.key)}
                        >
                          {recipe ? (
                            <div className="text-center w-full relative group">
                              <p className="text-[10px] font-medium truncate px-1">
                                {lang === "bn" ? recipe.nameBn : recipe.nameEn}
                              </p>
                              <p className="text-[9px] text-muted-foreground">
                                {recipe.calories} cal
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteMeal(day.key, mt.key)
                                }}
                                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Delete meal"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <Plus className="w-3 h-3 text-muted-foreground/50" />
                          )}
                        </motion.div>
                      </td>
                    )
                  })}
                </tr>
              )
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
              onClick={() => onSelectDay(day.key)}
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
            const Icon = mt.icon
            const recipeId = mealPlan[selectedDay]?.[mt.key]
            const recipe = recipeId ? getRecipeById(recipeId) : null
            return (
              <motion.div
                key={mt.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectMeal(selectedDay, mt.key)}
                className="glass-subtle rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-foreground/5 transition-colors"
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
                      e.stopPropagation()
                      onDeleteMeal(selectedDay, mt.key)
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Delete meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
