import { createCollection, type StoredRecord } from "./types";

const readingListBase = createCollection<StoredRecord>("readingList", {
  prepend: true,
});

export const readingList = {
  ...readingListBase,
  create(data: Record<string, unknown>): StoredRecord {
    return readingListBase.create({
      progress: 0,
      ...data,
    });
  },
};
