import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const gratitudeEntries = {
  list(): StoredRecord[] {
    return getStore("gratitudeEntries");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("gratitudeEntries");
    const item = { _id: generateId(), createdAt: now(), ...data };
    items.unshift(item);
    setStore("gratitudeEntries", items);
    return item;
  },
  remove(id: string): void {
    setStore(
      "gratitudeEntries",
      getStore("gratitudeEntries").filter((e) => e._id !== id),
    );
  },
  stats(): Record<string, unknown> {
    const items = getStore("gratitudeEntries");
    const weekAgo = now() - 7 * 24 * 60 * 60 * 1000;
    return {
      total: items.length,
      thisWeek: items.filter((e) => (e.createdAt as number) >= weekAgo).length,
    };
  },
};

export const exerciseLogs = {
  list(): StoredRecord[] {
    return getStore("exerciseLogs");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("exerciseLogs");
    const item = { _id: generateId(), createdAt: now(), ...data };
    items.unshift(item);
    setStore("exerciseLogs", items);
    return item;
  },
  stats(): Record<string, unknown> {
    const items = getStore("exerciseLogs");
    const weekAgo = now() - 7 * 24 * 60 * 60 * 1000;
    return {
      totalMinutes: items.reduce(
        (sum, e) => sum + ((e.duration as number) || 0),
        0,
      ),
      totalCalories: items.reduce(
        (sum, e) => sum + ((e.calories as number) || 0),
        0,
      ),
      thisWeek: items
        .filter((e) => (e.date as number) >= weekAgo)
        .reduce((sum, e) => sum + ((e.duration as number) || 0), 0),
    };
  },
};

export const waterLogs = {
  listByDate(_date: number): StoredRecord[] {
    const items = getStore("waterLogs");
    const day = new Date(_date).setHours(0, 0, 0, 0);
    return items.filter(
      (w) => new Date(w.date as number).setHours(0, 0, 0, 0) === day,
    );
  },
  getTodayTotal(): number {
    const items = getStore("waterLogs");
    const todayStart = new Date().setHours(0, 0, 0, 0);
    return items
      .filter((w) => (w.date as number) >= todayStart)
      .reduce((sum, w) => sum + ((w.glasses as number) || 0), 0);
  },
  addWater(date: number, glasses: number): void {
    const items = getStore("waterLogs");
    items.push({ _id: generateId(), date, glasses, createdAt: now() });
    setStore("waterLogs", items);
  },
  removeWater(id: string): void {
    setStore(
      "waterLogs",
      getStore("waterLogs").filter((w) => w._id !== id),
    );
  },
  getWeeklyStats(): Record<string, number> {
    return {};
  },
};
