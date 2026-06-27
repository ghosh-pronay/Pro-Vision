import { createCollection, type StoredRecord } from "./types";

const walletsBase = createCollection<StoredRecord>("wallets", {
  prepend: true,
});

export const wallets = {
  ...walletsBase,
};
