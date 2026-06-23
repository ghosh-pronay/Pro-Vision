import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const wallets = {
  list(): StoredRecord[] {
    return getStore("wallets");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("wallets");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("wallets", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("wallets");
    const idx = items.findIndex((w) => w._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data, { updatedAt: now() });
      setStore("wallets", items);
    }
  },
  remove(id: string): void {
    setStore(
      "wallets",
      getStore("wallets").filter((w) => w._id !== id),
    );
  },
};

export const wallets_extra = {
  list(): StoredRecord[] {
    return getStore("wallets");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("wallets");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.push(item);
    setStore("wallets", items);
    return item;
  },
};
