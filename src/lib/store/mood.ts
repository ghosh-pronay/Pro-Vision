import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const moods = {
  list(): StoredRecord[] {
    return getStore("moods");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("moods");
    const item = { _id: generateId(), createdAt: now(), ...data };
    items.unshift(item);
    setStore("moods", items);
    return item;
  },
  stats(): Record<string, unknown> {
    const items = getStore("moods");
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
