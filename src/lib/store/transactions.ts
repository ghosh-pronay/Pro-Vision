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
    let totalIncome = 0;
    let totalExpense = 0;
    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    for (const t of items) {
      const amount = (t.amount as number) || 0;
      if (t.type === "income") {
        totalIncome += amount;
        if ((t.date as number) >= ms) thisMonthIncome += amount;
      } else if (t.type === "expense") {
        totalExpense += amount;
        if ((t.date as number) >= ms) thisMonthExpense += amount;
      }
    }
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categories: [],
      thisMonthIncome,
      thisMonthExpense,
    };
  },
};
