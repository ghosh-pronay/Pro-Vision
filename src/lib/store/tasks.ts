import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const tasks = {
  list(): StoredRecord[] {
    return getStore("tasks");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("tasks");
    const item = {
      _id: generateId(),
      completed: false,
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("tasks", items);
    return item;
  },
  toggle(id: string): void {
    const items = getStore("tasks");
    const idx = items.findIndex((t) => t._id === id);
    if (idx !== -1) {
      items[idx].completed = !items[idx].completed;
      items[idx].updatedAt = now();
      setStore("tasks", items);
    }
  },
  remove(id: string): void {
    setStore(
      "tasks",
      getStore("tasks").filter((t) => t._id !== id),
    );
  },
  stats(): {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  } {
    const items = getStore("tasks");
    const n = now();
    return {
      total: items.length,
      completed: items.filter((t) => t.completed).length,
      pending: items.filter((t) => !t.completed).length,
      overdue: items.filter(
        (t) => !t.completed && t.dueDate && (t.dueDate as number) < n,
      ).length,
    };
  },
};
