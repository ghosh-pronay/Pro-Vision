import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useMemo } from "react";

export function useDailyCheckins() {
  const checkins = useQuery(api.dailyCheckins.list);
  return {
    checkins: checkins ?? [],
    isLoading: checkins === undefined,
  };
}

export function useCreateCheckin() {
  const create = useMutation(api.dailyCheckins.create);
  return {
    createCheckin: create,
    isLoading: false,
  };
}

export function useCheckinStreak() {
  const checkins = useQuery(api.dailyCheckins.list);
  const isLoading = checkins === undefined;

  const streak = useMemo(() => {
    if (!checkins || checkins.length === 0) return 0;

    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = today.getTime();

    const dates = new Set(
      checkins.map((c) => new Date(c.date).setHours(0, 0, 0, 0)),
    );

    for (let i = 0; i < 365; i++) {
      if (dates.has(checkDate)) {
        count++;
        checkDate -= 24 * 60 * 60 * 1000;
      } else {
        break;
      }
    }

    return count;
  }, [checkins]);

  return { streak, isLoading };
}
