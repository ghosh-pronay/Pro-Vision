import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const focusSessions = {
  list(): StoredRecord[] {
    return getStore("focusSessions");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("focusSessions");
    const item = { _id: generateId(), createdAt: now(), ...data };
    items.unshift(item);
    setStore("focusSessions", items);
    return item;
  },
  stats(): Record<string, unknown> {
    const items = getStore("focusSessions");
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
