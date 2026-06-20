import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useMemo } from "react";

function getDateRange(date?: number) {
  const target = date ? new Date(date) : new Date();
  const start = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  ).getTime();
  const end = start + 24 * 60 * 60 * 1000;
  return { start, end };
}

export function useMealLogs(date?: number) {
  const allMeals = useQuery(api.mealLogs.list);
  const isLoading = allMeals === undefined;

  const meals = useMemo(() => {
    if (!allMeals) return [];
    if (!date) return allMeals;
    const { start, end } = getDateRange(date);
    return allMeals.filter((m) => m.date >= start && m.date < end);
  }, [allMeals, date]);

  return { meals, isLoading };
}

export function useCreateMeal() {
  const create = useMutation(api.mealLogs.create);
  return {
    createMeal: create,
    isLoading: false,
  };
}

export function useDeleteMeal() {
  const remove = useMutation(api.mealLogs.remove);
  return {
    deleteMeal: remove,
    isLoading: false,
  };
}

export function useNutritionStats(date?: number) {
  const allMeals = useQuery(api.mealLogs.list);
  const isLoading = allMeals === undefined;

  const stats = useMemo(() => {
    if (!allMeals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    let meals = allMeals;
    if (date) {
      const { start, end } = getDateRange(date);
      meals = allMeals.filter((m) => m.date >= start && m.date < end);
    }

    return {
      calories: meals.reduce((sum, m) => sum + (m.calories ?? 0), 0),
      protein: meals.reduce((sum, m) => sum + (m.protein ?? 0), 0),
      carbs: meals.reduce((sum, m) => sum + (m.carbs ?? 0), 0),
      fat: meals.reduce((sum, m) => sum + (m.fat ?? 0), 0),
    };
  }, [allMeals, date]);

  return { stats, isLoading };
}
