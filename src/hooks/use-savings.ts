import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function useSavingsGoals() {
  const goals = useQuery(api.savingsGoals.list);
  return {
    goals: goals ?? [],
    isLoading: goals === undefined,
  };
}

export function useCreateSavingsGoal() {
  const create = useMutation(api.savingsGoals.create);
  return {
    createGoal: create,
    isLoading: false,
  };
}

export function useUpdateSavingsGoal() {
  const update = useMutation(api.savingsGoals.update);
  return {
    updateGoal: update,
    isLoading: false,
  };
}

export function useDeleteSavingsGoal() {
  const remove = useMutation(api.savingsGoals.remove);
  return {
    deleteGoal: remove,
    isLoading: false,
  };
}
