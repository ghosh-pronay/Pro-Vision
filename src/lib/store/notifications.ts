import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const notifications = {
  list(): StoredRecord[] {
    return getStore("notifications");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("notifications");
    const item = {
      _id: generateId(),
      read: false,
      createdAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("notifications", items);
    return item;
  },
  markRead(id: string): void {
    const items = getStore("notifications");
    const idx = items.findIndex((n) => n._id === id);
    if (idx !== -1) {
      items[idx].read = true;
      setStore("notifications", items);
    }
  },
  markAllRead(): void {
    const items = getStore("notifications");
    items.forEach((n) => {
      n.read = true;
    });
    setStore("notifications", items);
  },
  remove(id: string): void {
    setStore(
      "notifications",
      getStore("notifications").filter((n) => n._id !== id),
    );
  },
};
