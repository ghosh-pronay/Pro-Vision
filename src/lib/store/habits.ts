import { createCollection, now, setStore, type StoredRecord } from "./types";

const habitsBase = createCollection<StoredRecord>("habits", { prepend: true });

export const habits = {
  ...habitsBase,
  create(data: Record<string, unknown>): StoredRecord {
    return habitsBase.create({
      completedDates: [],
      ...data,
    });
  },
  checkIn(id: string, date: number): void {
    const items = habitsBase.list();
    const idx = items.findIndex((h) => h._id === id);
    if (idx !== -1) {
      const dates = (items[idx].completedDates as number[]) || [];
      const dateOnly = new Date(date).setHours(0, 0, 0, 0);
      const idx2 = dates.findIndex(
        (d) => new Date(d).setHours(0, 0, 0, 0) === dateOnly,
      );
      if (idx2 !== -1) {
        dates.splice(idx2, 1);
      } else {
        dates.push(date);
      }
      items[idx].completedDates = dates;
      items[idx].updatedAt = now();
      setStore("habits", items);
    }
  },
  stats(): {
    total: number;
    totalStreak: number;
    avgRate: number;
    todayCompleted: number;
  } {
    const items = habitsBase.list();
    const today = new Date().setHours(0, 0, 0, 0);
    const todayCompleted = items.filter((h) =>
      ((h.completedDates as number[]) || []).some(
        (d) => new Date(d).setHours(0, 0, 0, 0) === today,
      ),
    ).length;
    return {
      total: items.length,
      totalStreak: 0,
      avgRate:
        items.length > 0
          ? Math.round((todayCompleted / items.length) * 100)
          : 0,
      todayCompleted,
    };
  },
};
