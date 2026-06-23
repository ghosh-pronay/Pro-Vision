import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const transactions = {
  list(): StoredRecord[] {
    return getStore("transactions");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("transactions");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("transactions", items);
    return item;
  },
  remove(id: string): void {
    setStore(
      "transactions",
      getStore("transactions").filter((t) => t._id !== id),
    );
  },
  stats(): Record<string, unknown> {
    const items = getStore("transactions");
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const ms = monthStart.getTime();
    const income = items
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + ((t.amount as number) || 0), 0);
    const expense = items
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + ((t.amount as number) || 0), 0);
    const thisMonthIncome = items
      .filter((t) => t.type === "income" && (t.date as number) >= ms)
      .reduce((s, t) => s + ((t.amount as number) || 0), 0);
    const thisMonthExpense = items
      .filter((t) => t.type === "expense" && (t.date as number) >= ms)
      .reduce((s, t) => s + ((t.amount as number) || 0), 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      categories: [],
      thisMonthIncome,
      thisMonthExpense,
    };
  },
};

export const transactions_extra = {
  list(): StoredRecord[] {
    return getStore("transactions");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("transactions");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("transactions", items);
    return item;
  },
  remove(id: string): void {
    setStore(
      "transactions",
      getStore("transactions").filter((t) => t._id !== id),
    );
  },
};
