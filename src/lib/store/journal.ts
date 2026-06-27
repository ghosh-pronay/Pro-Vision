import { createCollection, type StoredRecord } from "./types";

const journalBase = createCollection<StoredRecord>("journal", {
  prepend: true,
});

export const journal = {
  ...journalBase,
};
