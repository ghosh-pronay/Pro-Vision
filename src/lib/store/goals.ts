import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const goals = {
  list(): StoredRecord[] {
    return getStore("goals");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("goals");
    const item = {
      _id: generateId(),
      progress: 0,
      status: "active",
      milestones: [],
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("goals", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("goals");
    const idx = items.findIndex((g) => g._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data, { updatedAt: now() });
      setStore("goals", items);
    }
  },
  remove(id: string): void {
    setStore(
      "goals",
      getStore("goals").filter((g) => g._id !== id),
    );
  },
};
