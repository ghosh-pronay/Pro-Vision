import { createCollection, setStore, type StoredRecord } from "./types";

const notificationsBase = createCollection<StoredRecord>("notifications", {
  prepend: true,
});

export const notifications = {
  ...notificationsBase,
  markRead(id: string): void {
    const items = notificationsBase.list();
    const idx = items.findIndex((n) => n._id === id);
    if (idx !== -1) {
      items[idx].read = true;
      setStore("notifications", items);
    }
  },
  markAllRead(): void {
    const items = notificationsBase.list();
    items.forEach((n) => {
      n.read = true;
    });
    setStore("notifications", items);
  },
};
