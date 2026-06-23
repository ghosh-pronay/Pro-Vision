import { StoredRecord, getStore, setStore, generateId, now } from "./types";

export const receivables = {
  list(): StoredRecord[] {
    return getStore("receivables");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("receivables");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("receivables", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("receivables");
    const idx = items.findIndex((r) => r._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data, { updatedAt: now() });
      setStore("receivables", items);
    }
  },
  remove(id: string): void {
    setStore(
      "receivables",
      getStore("receivables").filter((r) => r._id !== id),
    );
  },
};

export const payables = {
  list(): StoredRecord[] {
    return getStore("payables");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("payables");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("payables", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("payables");
    const idx = items.findIndex((p) => p._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data, { updatedAt: now() });
      setStore("payables", items);
    }
  },
  remove(id: string): void {
    setStore(
      "payables",
      getStore("payables").filter((p) => p._id !== id),
    );
  },
};

export const loans = {
  list(): StoredRecord[] {
    return getStore("loans");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("loans");
    const item = {
      _id: generateId(),
      paidAmount: 0,
      status: "active",
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("loans", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("loans");
    const idx = items.findIndex((l) => l._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data, { updatedAt: now() });
      setStore("loans", items);
    }
  },
  addPayment(id: string, amount: number): void {
    const items = getStore("loans");
    const idx = items.findIndex((l) => l._id === id);
    if (idx !== -1) {
      items[idx].paidAmount = ((items[idx].paidAmount as number) || 0) + amount;
      items[idx].updatedAt = now();
      setStore("loans", items);
    }
  },
  remove(id: string): void {
    setStore(
      "loans",
      getStore("loans").filter((l) => l._id !== id),
    );
  },
  stats(): Record<string, unknown> {
    const items = getStore("loans");
    return {
      totalGiven: items
        .filter((l) => l.type === "given")
        .reduce((sum, l) => sum + ((l.amount as number) || 0), 0),
      totalTaken: items
        .filter((l) => l.type === "taken")
        .reduce((sum, l) => sum + ((l.amount as number) || 0), 0),
      pendingGiven: 0,
      pendingTaken: 0,
    };
  },
};

export const investments = {
  list(): StoredRecord[] {
    return getStore("investments");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("investments");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("investments", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("investments");
    const idx = items.findIndex((i) => i._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data, { updatedAt: now() });
      setStore("investments", items);
    }
  },
  remove(id: string): void {
    setStore(
      "investments",
      getStore("investments").filter((i) => i._id !== id),
    );
  },
  stats(): Record<string, unknown> {
    const items = getStore("investments");
    return {
      totalInvested: items.reduce(
        (sum, i) => sum + ((i.amount as number) || 0),
        0,
      ),
      totalCurrent: items.reduce(
        (sum, i) =>
          sum + ((i.currentValue as number) || (i.amount as number) || 0),
        0,
      ),
      totalGainLoss: 0,
    };
  },
};

export const savingsGoals = {
  list(): StoredRecord[] {
    return getStore("savingsGoals");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("savingsGoals");
    const item = {
      _id: generateId(),
      currentAmount: 0,
      status: "active",
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.unshift(item);
    setStore("savingsGoals", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("savingsGoals");
    const idx = items.findIndex((s) => s._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data, { updatedAt: now() });
      setStore("savingsGoals", items);
    }
  },
  remove(id: string): void {
    setStore(
      "savingsGoals",
      getStore("savingsGoals").filter((s) => s._id !== id),
    );
  },
  stats(): Record<string, unknown> {
    const items = getStore("savingsGoals");
    const totalSaved = items.reduce(
      (sum, s) => sum + ((s.currentAmount as number) || 0),
      0,
    );
    const totalTarget = items.reduce(
      (sum, s) => sum + ((s.targetAmount as number) || 0),
      0,
    );
    return {
      totalSaved,
      totalTarget,
      progressPercentage:
        totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
    };
  },
};

export const expenseGroups = {
  listGroups(): StoredRecord[] {
    return getStore("expenseGroups");
  },
  createGroup(data: Record<string, unknown>): StoredRecord {
    const items = getStore("expenseGroups");
    const item = {
      _id: generateId(),
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };
    items.push(item);
    setStore("expenseGroups", items);
    return item;
  },
  inviteMember(): void {},
  addExpense(): void {},
  settleBalance(): void {},
  getBalances(): StoredRecord[] {
    return [];
  },
  getGroupStats(): Record<string, number> {
    return { totalSpent: 0, memberCount: 0 };
  },
};

export const recurringTransactions = {
  list(): StoredRecord[] {
    return getStore("recurringTransactions");
  },
  create(data: Record<string, unknown>): StoredRecord {
    const items = getStore("recurringTransactions");
    const item = { _id: generateId(), ...data };
    items.push(item);
    setStore("recurringTransactions", items);
    return item;
  },
  update(id: string, data: Record<string, unknown>): void {
    const items = getStore("recurringTransactions");
    const idx = items.findIndex((r) => r._id === id);
    if (idx !== -1) {
      Object.assign(items[idx], data);
      setStore("recurringTransactions", items);
    }
  },
  remove(id: string): void {
    setStore(
      "recurringTransactions",
      getStore("recurringTransactions").filter((r) => r._id !== id),
    );
  },
  processDue(): void {},
};

export const financialReports = {
  balanceSheet(): Record<string, unknown> {
    return {
      asOf: Date.now(),
      assets: {
        total: 0,
        current: 0,
        nonCurrent: 0,
        currentBreakdown: [],
        nonCurrentBreakdown: [],
      },
      liabilities: {
        total: 0,
        current: 0,
        nonCurrent: 0,
        currentBreakdown: [],
        nonCurrentBreakdown: [],
      },
      netWorth: 0,
    };
  },
  incomeExpense(): Record<string, unknown> {
    return {
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        netIncome: 0,
        periodIncome: 0,
        periodExpense: 0,
        periodNet: 0,
        compIncome: 0,
        compExpense: 0,
        compNet: 0,
        yearIncome: 0,
        yearExpense: 0,
        yearNet: 0,
        incomeChange: 0,
        expenseChange: 0,
      },
      period: { selected: "", comparison: "", year: 2025 },
      selectedPeriod: {
        income: { categories: [], total: 0 },
        expense: { categories: [], total: 0 },
      },
      comparisonPeriod: {
        income: { categories: [], total: 0 },
        expense: { categories: [], total: 0 },
      },
    };
  },
};
