import { createCollection, type StoredRecord } from "./types";

const goalsBase = createCollection<StoredRecord>("goals", { prepend: true });

export const goals = {
  ...goalsBase,
  create(data: Record<string, unknown>): StoredRecord {
    return goalsBase.create({
      progress: 0,
      status: "active",
      milestones: [],
      ...data,
    });
  },
};
