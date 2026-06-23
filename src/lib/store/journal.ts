import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const journal = {
  list(): StoredRecord[] {
    return getStore("journal");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("journal");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("journal", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("journal");
    const idx = items.findIndex((j) => j._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data, { updatedAt: now() });
      setStore("journal", items);
    }
  },
  remove(id: string): void {
    setStore(
      "journal",
      getStore("journal").filter((j) => j._id !== id),
    );
  },
};
