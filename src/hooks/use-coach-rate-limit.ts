import { useState, useCallback } from "react";

const FREE_DAILY_LIMIT = 50;
const PREMIUM_DAILY_LIMIT = 200;
const STORAGE_KEY = "pv-coach-usage";

interface CoachUsage {
  date: string;
  count: number;
}

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function getStoredUsage(): CoachUsage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const usage = JSON.parse(stored) as CoachUsage;
      if (usage.date === getTodayKey()) {
        return usage;
      }
    }
  } catch (e) {
    console.warn("Failed to parse coach usage:", e);
  }
  return { date: getTodayKey(), count: 0 };
}

function storeUsage(usage: CoachUsage) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function useCoachRateLimit(isPremium: boolean) {
  const [usage, setUsage] = useState<CoachUsage>(getStoredUsage);

  const dailyLimit = isPremium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const remaining = Math.max(0, dailyLimit - usage.count);
  const isLimitReached = remaining <= 0;

  const incrementUsage = useCallback(() => {
    const today = getTodayKey();
    const current = getStoredUsage();
    const newUsage = {
      date: today,
      count: current.date === today ? current.count + 1 : 1,
    };
    storeUsage(newUsage);
    setUsage(newUsage);
    return newUsage.count <= dailyLimit;
  }, [dailyLimit]);

  const resetUsage = useCallback(() => {
    const newUsage = { date: getTodayKey(), count: 0 };
    storeUsage(newUsage);
    setUsage(newUsage);
  }, []);

  return {
    usage: usage.count,
    dailyLimit,
    remaining,
    isLimitReached,
    incrementUsage,
    resetUsage,
  };
}
