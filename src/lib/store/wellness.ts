import { createCollection, now, type StoredRecord } from "./types";

const gratitudeEntriesBase = createCollection<StoredRecord>(
  "gratitudeEntries",
  { prepend: true },
);

export const gratitudeEntries = {
  ...gratitudeEntriesBase,
  stats(): Record<string, unknown> {
    const items = gratitudeEntriesBase.list();
    const weekAgo = now() - 7 * 24 * 60 * 60 * 1000;
    return {
      total: items.length,
      thisWeek: items.filter((e) => (e.createdAt as number) >= weekAgo).length,
    };
  },
};

const exerciseLogsBase = createCollection<StoredRecord>("exerciseLogs", {
  prepend: true,
});

export const exerciseLogs = {
  ...exerciseLogsBase,
  stats(): Record<string, unknown> {
    const items = exerciseLogsBase.list();
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

const waterLogsBase = createCollection<StoredRecord>("waterLogs");

export const waterLogs = {
  ...waterLogsBase,
  listByDate(_date: number): StoredRecord[] {
    const items = waterLogsBase.list();
    const day = new Date(_date).setHours(0, 0, 0, 0);
    return items.filter(
      (w) => new Date(w.date as number).setHours(0, 0, 0, 0) === day,
    );
  },
  getTodayTotal(): number {
    const items = waterLogsBase.list();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    return items
      .filter((w) => (w.date as number) >= todayStart)
      .reduce((sum, w) => sum + ((w.glasses as number) || 0), 0);
  },
  addWater(date: number, glasses: number): void {
    waterLogsBase.create({ date, glasses });
  },
  removeWater(id: string): void {
    waterLogsBase.remove(id);
  },
  getWeeklyStats(): Record<string, number> {
    return {};
  },
};
