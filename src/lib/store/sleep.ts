import { createCollection, type StoredRecord } from "./types";

const sleepLogsBase = createCollection<StoredRecord>("sleepLogs", {
  prepend: true,
});

export const sleepLogs = {
  ...sleepLogsBase,
  stats(): Record<string, unknown> {
    const items = sleepLogsBase.list();
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
