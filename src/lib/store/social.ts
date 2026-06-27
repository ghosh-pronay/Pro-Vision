import {
  createCollection,
  getStore,
  setStore,
  now,
  type StoredRecord,
} from "./types";

const contactsBase = createCollection<StoredRecord>("contacts", {
  prepend: true,
});

export const contacts = {
  ...contactsBase,
  upcomingBirthdays(): StoredRecord[] {
    const items = contactsBase.list();
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
        _id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
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
        _id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
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
