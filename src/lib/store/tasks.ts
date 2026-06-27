import { createCollection, setStore, now, type StoredRecord } from "./types";

const tasksBase = createCollection<StoredRecord>("tasks", { prepend: true });

export const tasks = {
  ...tasksBase,
  create(data: Record<string, unknown>): StoredRecord {
    return tasksBase.create({
      completed: false,
      ...data,
    });
  },
  toggle(id: string): void {
    const items = tasksBase.list();
    const idx = items.findIndex((t) => t._id === id);
    if (idx !== -1) {
      items[idx].completed = !items[idx].completed;
      items[idx].updatedAt = now();
      setStore("tasks", items);
    }
  },
  stats(): {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  } {
    const items = tasksBase.list();
    const n = now();
    let completed = 0;
    let pending = 0;
    let overdue = 0;
    for (const t of items) {
      if (t.completed) {
        completed++;
      } else {
        pending++;
        if (t.dueDate && (t.dueDate as number) < n) overdue++;
      }
    }
    return {
      total: items.length,
      completed,
      pending,
      overdue,
    };
  },
};
