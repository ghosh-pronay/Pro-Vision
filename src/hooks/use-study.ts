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

export function useStudySessions(date?: number) {
  const allSessions = useQuery(api.studySessions.list);
  const isLoading = allSessions === undefined;

  const sessions = useMemo(() => {
    if (!allSessions) return [];
    if (!date) return allSessions;
    const { start, end } = getDateRange(date);
    return allSessions.filter((s) => s.date >= start && s.date < end);
  }, [allSessions, date]);

  return { sessions, isLoading };
}

export function useCreateStudySession() {
  const create = useMutation(api.studySessions.create);
  return {
    createSession: create,
    isLoading: false,
  };
}

export function useDeleteStudySession() {
  const remove = useMutation(api.studySessions.remove);
  return {
    deleteSession: remove,
    isLoading: false,
  };
}

export function useStudyStats() {
  const sessions = useQuery(api.studySessions.list);
  const isLoading = sessions === undefined;

  const stats = useMemo(() => {
    if (!sessions) return { totalHours: 0, sessionsCount: 0, streak: 0 };

    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = today.getTime();

    const dates = new Set(
      sessions.map((s) => new Date(s.date).setHours(0, 0, 0, 0)),
    );

    for (let i = 0; i < 365; i++) {
      if (dates.has(checkDate)) {
        streak++;
        checkDate -= 24 * 60 * 60 * 1000;
      } else {
        break;
      }
    }

    return {
      totalHours,
      sessionsCount: sessions.length,
      streak,
    };
  }, [sessions]);

  return { stats, isLoading };
}
