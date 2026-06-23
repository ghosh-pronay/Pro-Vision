import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const sleepLogs = {
  list(): StoredRecord[] {
    return getStore("sleepLogs");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("sleepLogs");
    const item = { _id: generateId(), createdAt: now(), ...data };
    items.unshift(item);
    setStore("sleepLogs", items);
    return item;
  },
  stats(): Record<string, unknown> {
    const items = getStore("sleepLogs");
    const avgHours =
      items.length > 0
        ? Math.round(
            (items.reduce((sum, l) => sum + ((l.hours as number) || 0), 0) /
              items.length) *
              10,
          ) / 10
        : 0;
    return { avgHours, streak: 0, todayHours: items[0]?.hours || 0 };
  },
};
