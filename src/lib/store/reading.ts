import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const readingList = {
  list(): StoredRecord[] {
    return getStore("readingList");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("readingList");
    const item = {
      _id: generateId(),
      progress: 0,
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("readingList", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("readingList");
    const idx = items.findIndex((r) => r._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data, { updatedAt: now() });
      setStore("readingList", items);
    }
  },
  remove(id: string): void {
    setStore(
      "readingList",
      getStore("readingList").filter((r) => r._id !== id),
    );
  },
};
