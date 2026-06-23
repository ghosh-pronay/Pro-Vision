import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const contacts = {
  list(): StoredRecord[] {
    return getStore("contacts");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("contacts");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("contacts", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("contacts");
    const idx = items.findIndex((c) => c._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data, { updatedAt: now() });
      setStore("contacts", items);
    }
  },
  remove(id: string): void {
    setStore(
      "contacts",
      getStore("contacts").filter((c) => c._id !== id),
    );
  },
  upcomingBirthdays(): StoredRecord[] {
    const items = getStore("contacts");
    const now2 = new Date();
    const month = now2.getMonth();
    return items.filter((c) => {
      if (!c.birthday) return false;
      const bd = new Date(c.birthday as number);
      return bd.getMonth() === month && bd.getDate() >= now2.getDate();
    });
  },
};

export const userProfiles = {
  get(): StoredRecord | null {
    return getStore("userProfiles")[0] || null;
  },
  upsert(data: Record<string, unknown>): void {
    const items = getStore("userProfiles");
    if (items.length > 0) {
      Object.assign(items[0], data, { updatedAt: now() });
    } else {
      items.push({
        _id: generateId(),
        createdAt: now(),
        updatedAt: now(),
        ...data,
      } as StoredRecord);
    }
    setStore("userProfiles", items);
  },
};

export const users = {
  currentUser(): StoredRecord | null {
    return getStore("users")[0] || null;
  },
  upsertUser(data: Record<string, unknown>): void {
    const items = getStore("users");
    if (items.length > 0) {
      Object.assign(items[0], data, { updatedAt: now() });
    } else {
      items.push({
        _id: generateId(),
        createdAt: now(),
        updatedAt: now(),
        ...data,
      } as StoredRecord);
    }
    setStore("users", items);
  },
  listPremiumUsers(): StoredRecord[] {
    return [];
  },
};
