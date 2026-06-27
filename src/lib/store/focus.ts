import { createCollection, type StoredRecord } from "./types";

const focusSessionsBase = createCollection<StoredRecord>("focusSessions", {
  prepend: true,
});

export const focusSessions = {
  ...focusSessionsBase,
  stats(): Record<string, unknown> {
    const items = focusSessionsBase.list();
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayMinutes = items
      .filter((s) => (s.completedAt as number) >= todayStart)
      .reduce((sum, s) => sum + ((s.duration as number) || 0), 0);
    return {
      sessions: items.length,
      totalMinutes: items.reduce(
        (sum, s) => sum + ((s.duration as number) || 0),
        0,
      ),
      totalHours:
        Math.round(
          (items.reduce((sum, s) => sum + ((s.duration as number) || 0), 0) /
            60) *
            10,
        ) / 10,
      todayMinutes,
    };
  },
};
