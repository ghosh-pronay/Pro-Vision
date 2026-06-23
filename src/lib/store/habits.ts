import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const habits = {
  list(): StoredRecord[] {
    return getStore("habits");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("habits");
    const item = {
      _id: generateId(),
      completedDates: [],
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("habits", items);
    return item;
  },
  checkIn(id: string, date: number): void {
    const items = getStore("habits");
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
  remove(id: string): void {
    setStore(
      "habits",
      getStore("habits").filter((h) => h._id !== id),
    );
  },
  stats(): {
    total: number;
    totalStreak: number;
    avgRate: number;
    todayCompleted: number;
  } {
    const items = getStore("habits");
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
