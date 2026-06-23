import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const kanban = {
  list(): StoredRecord[] {
    return getStore("kanban");
  },
  createColumn(data: Record<string, unknown>): StoredRecord {
    const items = getStore("kanban");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.push(item);
    setStore("kanban", items);
    return item;
  },
  updateColumn(): void {},
  deleteColumn(): void {},
  createTask(): void {},
  updateTask(): void {},
  moveTask(): void {},
  deleteTask(): void {},
  initializeDefaultColumns(): void {},
};
