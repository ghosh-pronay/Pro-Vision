import { createCollection, type StoredRecord } from "./types";

const moodsBase = createCollection<StoredRecord>("moods", { prepend: true });

export const moods = {
  ...moodsBase,
  stats(): Record<string, unknown> {
    const items = moodsBase.list();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayMood =
      items.find((m) => (m.date as number) >= todayStart) || null;
    const avgMood =
      items.length > 0
        ? Math.round(
            (items.reduce((sum, m) => sum + ((m.value as number) || 0), 0) /
              items.length) *
              10,
          ) / 10
        : 0;
    return {
      moodStreak: 0,
      todayMood: todayMood
        ? { mood: todayMood.mood, value: todayMood.value }
        : null,
      avgMood,
    };
  },
};
