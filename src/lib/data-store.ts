// localStorage-backed data store that mimics Convex API shape
// When VITE_CONVEX_URL is set, the real Convex SDK takes over

type StoredRecord = { _id: string; [key: string]: unknown };

function getStore<T extends StoredRecord>(key: string): T[] {
  try {
    const raw = localStorage.getItem(`pv_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStore<T extends StoredRecord>(key: string, data: T[]) {
  localStorage.setItem(`pv_${key}`, JSON.stringify(data));
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): number {
  return Date.now();
}

export const localDB = {
  tasks: {
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
  },
  habits: {
    list(): StoredRecord[] {
      return getStore("habits");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("habits");
      const item = {
        _id: generateId(),
        completedDates: [],
        createdAt: now(),
        updatedAt: now(),
        ...data,
      };
      items.unshift(item);
      setStore("habits", items);
      return item;
    },
    checkIn(id: string, date: number): void {
      const items = getStore("habits");
      const idx = items.findIndex((h) => h._id === id);
      if (idx !== -1) {
        const dates = (items[idx].completedDates as number[]) || [];
        const dateOnly = new Date(date).setHours(0, 0, 0, 0);
        const idx2 = dates.findIndex(
          (d) => new Date(d).setHours(0, 0, 0, 0) === dateOnly,
        );
        if (idx2 !== -1) {
          dates.splice(idx2, 1);
        } else {
          dates.push(date);
        }
        items[idx].completedDates = dates;
        items[idx].updatedAt = now();
        setStore("habits", items);
      }
    },
    remove(id: string): void {
      setStore(
        "habits",
        getStore("habits").filter((h) => h._id !== id),
      );
    },
    stats(): {
      total: number;
      totalStreak: number;
      avgRate: number;
      todayCompleted: number;
    } {
      const items = getStore("habits");
      const today = new Date().setHours(0, 0, 0, 0);
      const todayCompleted = items.filter((h) =>
        ((h.completedDates as number[]) || []).some(
          (d) => new Date(d).setHours(0, 0, 0, 0) === today,
        ),
      ).length;
      return {
        total: items.length,
        totalStreak: 0,
        avgRate:
          items.length > 0
            ? Math.round((todayCompleted / items.length) * 100)
            : 0,
        todayCompleted,
      };
    },
  },
  wallets: {
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
  },
  transactions: {
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
  },
  goals: {
    list(): StoredRecord[] {
      return getStore("goals");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("goals");
      const item = {
        _id: generateId(),
        progress: 0,
        status: "active",
        milestones: [],
        createdAt: now(),
        updatedAt: now(),
        ...data,
      };
      items.unshift(item);
      setStore("goals", items);
      return item;
    },
    update(id: string, data: Record<string, unknown>): void {
      const items = getStore("goals");
      const idx = items.findIndex((g) => g._id === id);
      if (idx !== -1) {
        Object.assign(items[idx], data, { updatedAt: now() });
        setStore("goals", items);
      }
    },
    remove(id: string): void {
      setStore(
        "goals",
        getStore("goals").filter((g) => g._id !== id),
      );
    },
  },
  focusSessions: {
    list(): StoredRecord[] {
      return getStore("focusSessions");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("focusSessions");
      const item = { _id: generateId(), createdAt: now(), ...data };
      items.unshift(item);
      setStore("focusSessions", items);
      return item;
    },
    stats(): Record<string, unknown> {
      const items = getStore("focusSessions");
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const todayMinutes = items
        .filter((s) => (s.completedAt as number) >= todayStart)
        .reduce((sum, s) => sum + ((s.duration as number) || 0), 0);
      return {
        sessions: items.length,
        totalMinutes: items.reduce(
          (sum, s) => sum + ((s.duration as number) || 0),
          0,
        ),
        totalHours:
          Math.round(
            (items.reduce((sum, s) => sum + ((s.duration as number) || 0), 0) /
              60) *
              10,
          ) / 10,
        todayMinutes,
      };
    },
  },
  moods: {
    list(): StoredRecord[] {
      return getStore("moods");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("moods");
      const item = { _id: generateId(), createdAt: now(), ...data };
      items.unshift(item);
      setStore("moods", items);
      return item;
    },
    stats(): Record<string, unknown> {
      const items = getStore("moods");
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const todayMood =
        items.find((m) => (m.date as number) >= todayStart) || null;
      const avgMood =
        items.length > 0
          ? Math.round(
              (items.reduce((sum, m) => sum + ((m.value as number) || 0), 0) /
                items.length) *
                10,
            ) / 10
          : 0;
      return {
        moodStreak: 0,
        todayMood: todayMood
          ? { mood: todayMood.mood, value: todayMood.value }
          : null,
        avgMood,
      };
    },
  },
  sleepLogs: {
    list(): StoredRecord[] {
      return getStore("sleepLogs");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("sleepLogs");
      const item = { _id: generateId(), createdAt: now(), ...data };
      items.unshift(item);
      setStore("sleepLogs", items);
      return item;
    },
    stats(): Record<string, unknown> {
      const items = getStore("sleepLogs");
      const avgHours =
        items.length > 0
          ? Math.round(
              (items.reduce((sum, l) => sum + ((l.hours as number) || 0), 0) /
                items.length) *
                10,
            ) / 10
          : 0;
      return { avgHours, streak: 0, todayHours: items[0]?.hours || 0 };
    },
  },
  gratitudeEntries: {
    list(): StoredRecord[] {
      return getStore("gratitudeEntries");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("gratitudeEntries");
      const item = { _id: generateId(), createdAt: now(), ...data };
      items.unshift(item);
      setStore("gratitudeEntries", items);
      return item;
    },
    remove(id: string): void {
      setStore(
        "gratitudeEntries",
        getStore("gratitudeEntries").filter((e) => e._id !== id),
      );
    },
    stats(): Record<string, unknown> {
      const items = getStore("gratitudeEntries");
      const weekAgo = now() - 7 * 24 * 60 * 60 * 1000;
      return {
        total: items.length,
        thisWeek: items.filter((e) => (e.createdAt as number) >= weekAgo)
          .length,
      };
    },
  },
  journal: {
    list(): StoredRecord[] {
      return getStore("journal");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("journal");
      const item = {
        _id: generateId(),
        createdAt: now(),
        updatedAt: now(),
        ...data,
      };
      items.unshift(item);
      setStore("journal", items);
      return item;
    },
    update(id: string, data: Record<string, unknown>): void {
      const items = getStore("journal");
      const idx = items.findIndex((j) => j._id === id);
      if (idx !== -1) {
        Object.assign(items[idx], data, { updatedAt: now() });
        setStore("journal", items);
      }
    },
    remove(id: string): void {
      setStore(
        "journal",
        getStore("journal").filter((j) => j._id !== id),
      );
    },
  },
  readingList: {
    list(): StoredRecord[] {
      return getStore("readingList");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("readingList");
      const item = {
        _id: generateId(),
        progress: 0,
        createdAt: now(),
        updatedAt: now(),
        ...data,
      };
      items.unshift(item);
      setStore("readingList", items);
      return item;
    },
    update(id: string, data: Record<string, unknown>): void {
      const items = getStore("readingList");
      const idx = items.findIndex((r) => r._id === id);
      if (idx !== -1) {
        Object.assign(items[idx], data, { updatedAt: now() });
        setStore("readingList", items);
      }
    },
    remove(id: string): void {
      setStore(
        "readingList",
        getStore("readingList").filter((r) => r._id !== id),
      );
    },
  },
  contacts: {
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
  },
  savingsGoals: {
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
  },
  studySessions: {
    list(): StoredRecord[] {
      return getStore("studySessions");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("studySessions");
      const item = { _id: generateId(), createdAt: now(), ...data };
      items.unshift(item);
      setStore("studySessions", items);
      return item;
    },
    remove(id: string): void {
      setStore(
        "studySessions",
        getStore("studySessions").filter((s) => s._id !== id),
      );
    },
    stats(): Record<string, unknown> {
      const items = getStore("studySessions");
      return {
        totalHours:
          Math.round(
            (items.reduce((sum, s) => sum + ((s.duration as number) || 0), 0) /
              60) *
              10,
          ) / 10,
        sessionsCount: items.length,
        subjectsBreakdown: [],
      };
    },
  },
  dailyCheckins: {
    list(): StoredRecord[] {
      return getStore("dailyCheckins");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("dailyCheckins");
      const item = { _id: generateId(), createdAt: now(), ...data };
      items.unshift(item);
      setStore("dailyCheckins", items);
      return item;
    },
    today(): StoredRecord | null {
      const items = getStore("dailyCheckins");
      const todayStart = new Date().setHours(0, 0, 0, 0);
      return items.find((c) => (c.date as number) >= todayStart) || null;
    },
    stats(): Record<string, unknown> {
      const items = getStore("dailyCheckins");
      return {
        avgMood: 0,
        avgEnergy:
          items.length > 0
            ? Math.round(
                items.reduce((sum, c) => sum + ((c.energy as number) || 0), 0) /
                  items.length,
              )
            : 0,
        streak: 0,
      };
    },
  },
  exerciseLogs: {
    list(): StoredRecord[] {
      return getStore("exerciseLogs");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("exerciseLogs");
      const item = { _id: generateId(), createdAt: now(), ...data };
      items.unshift(item);
      setStore("exerciseLogs", items);
      return item;
    },
    stats(): Record<string, unknown> {
      const items = getStore("exerciseLogs");
      const weekAgo = now() - 7 * 24 * 60 * 60 * 1000;
      return {
        totalMinutes: items.reduce(
          (sum, e) => sum + ((e.duration as number) || 0),
          0,
        ),
        totalCalories: items.reduce(
          (sum, e) => sum + ((e.calories as number) || 0),
          0,
        ),
        thisWeek: items
          .filter((e) => (e.date as number) >= weekAgo)
          .reduce((sum, e) => sum + ((e.duration as number) || 0), 0),
      };
    },
  },
  waterLogs: {
    listByDate(_date: number): StoredRecord[] {
      const items = getStore("waterLogs");
      const day = new Date(_date).setHours(0, 0, 0, 0);
      return items.filter(
        (w) => new Date(w.date as number).setHours(0, 0, 0, 0) === day,
      );
    },
    getTodayTotal(): number {
      const items = getStore("waterLogs");
      const todayStart = new Date().setHours(0, 0, 0, 0);
      return items
        .filter((w) => (w.date as number) >= todayStart)
        .reduce((sum, w) => sum + ((w.glasses as number) || 0), 0);
    },
    addWater(date: number, glasses: number): void {
      const items = getStore("waterLogs");
      items.push({ _id: generateId(), date, glasses, createdAt: now() });
      setStore("waterLogs", items);
    },
    removeWater(id: string): void {
      setStore(
        "waterLogs",
        getStore("waterLogs").filter((w) => w._id !== id),
      );
    },
    getWeeklyStats(): Record<string, number> {
      return {};
    },
  },
  mealLogs: {
    list(): StoredRecord[] {
      return getStore("mealLogs");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("mealLogs");
      const item = { _id: generateId(), createdAt: now(), ...data };
      items.unshift(item);
      setStore("mealLogs", items);
      return item;
    },
    remove(id: string): void {
      setStore(
        "mealLogs",
        getStore("mealLogs").filter((m) => m._id !== id),
      );
    },
    stats(): Record<string, unknown> {
      const items = getStore("mealLogs");
      return {
        totalCalories: items.reduce(
          (sum, m) => sum + ((m.calories as number) || 0),
          0,
        ),
        totalProtein: items.reduce(
          (sum, m) => sum + ((m.protein as number) || 0),
          0,
        ),
        totalCarbs: items.reduce(
          (sum, m) => sum + ((m.carbs as number) || 0),
          0,
        ),
        totalFat: items.reduce((sum, m) => sum + ((m.fat as number) || 0), 0),
      };
    },
  },
  wallets_extra: {
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
  },
  transactions_extra: {
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
  },
  investments: {
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
  },
  loans: {
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
        items[idx].paidAmount =
          ((items[idx].paidAmount as number) || 0) + amount;
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
  },
  notifications: {
    list(): StoredRecord[] {
      return getStore("notifications");
    },
  },
  userProfiles: {
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
  },
  users: {
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
  },
  admin: {
    listUsers(): StoredRecord[] {
      return [];
    },
    getStats(): Record<string, number> {
      return {
        totalUsers: 0,
        activeToday: 0,
        totalTasks: 0,
        totalHabits: 0,
        totalTransactions: 0,
      };
    },
    grantPremium(): void {},
    revokePremium(): void {},
    deleteUser(): void {},
  },
  kanban: {
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
  },
  recurringTransactions: {
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
  },
  automation: {
    listRules(): StoredRecord[] {
      return getStore("automationRules");
    },
    createRule(data: Record<string, unknown>): StoredRecord {
      const items = getStore("automationRules");
      const item = {
        _id: generateId(),
        isActive: true,
        createdAt: now(),
        updatedAt: now(),
        ...data,
      };
      items.push(item);
      setStore("automationRules", items);
      return item;
    },
    updateRule(): void {},
    deleteRule(id: string): void {
      setStore(
        "automationRules",
        getStore("automationRules").filter((r) => r._id !== id),
      );
    },
    getSmartSuggestions(): string[] {
      return [];
    },
  },
  challenges: {
    listChallenges(): StoredRecord[] {
      return getStore("challenges");
    },
    create(data: Record<string, unknown>): StoredRecord {
      const items = getStore("challenges");
      const item = {
        _id: generateId(),
        isActive: true,
        createdAt: now(),
        ...data,
      };
      items.unshift(item);
      setStore("challenges", items);
      return item;
    },
    join(): void {},
    leave(): void {},
    updateProgress(): void {},
    getLeaderboard(): StoredRecord[] {
      return [];
    },
  },
  achievements: {
    listAchievements(): StoredRecord[] {
      return getStore("achievements");
    },
    listUserAchievements(): StoredRecord[] {
      return getStore("userAchievements");
    },
    unlockAchievement(data: Record<string, unknown>): void {
      const items = getStore("userAchievements");
      const exists = items.find((a) => a.achievementId === data.achievementId);
      if (!exists) {
        items.push({
          _id: generateId(),
          unlockedAt: now(),
          ...data,
        } as StoredRecord);
        setStore("userAchievements", items);
      }
    },
    checkAndUnlockAchievements(): void {},
  },
  insights: {
    getMoodInsights(): Record<string, unknown> {
      return { topMoods: [], averageValue: 0, trend: [] };
    },
    getHabitInsights(): Record<string, unknown> {
      return { completionRate: 0, bestDay: "", topHabits: [] };
    },
  },
  expenseGroups: {
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
  },
  news: {
    fetchNews(): Record<string, unknown> {
      return { articles: [], source: "demo" };
    },
  },
  weeklyReport: {
    sendWeeklyReport(): void {},
    sendWeeklyReportEmail(): void {},
  },
  financialReports: {
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
  },
  apiManagement: {
    getConfig(): StoredRecord[] {
      const configs = getStore("apiConfig");
      if (configs.length === 0) {
        const defaults = [
          {
            endpoint: "/api/tasks",
            method: "GET",
            enabled: true,
            rateLimit: 60,
            timeout: 5000,
            category: "core",
            description: "List user tasks",
          },
          {
            endpoint: "/api/tasks",
            method: "POST",
            enabled: true,
            rateLimit: 30,
            timeout: 5000,
            category: "core",
            description: "Create a task",
          },
          {
            endpoint: "/api/habits",
            method: "GET",
            enabled: true,
            rateLimit: 60,
            timeout: 5000,
            category: "core",
            description: "List user habits",
          },
          {
            endpoint: "/api/habits",
            method: "POST",
            enabled: true,
            rateLimit: 30,
            timeout: 5000,
            category: "core",
            description: "Create a habit",
          },
          {
            endpoint: "/api/transactions",
            method: "GET",
            enabled: true,
            rateLimit: 60,
            timeout: 5000,
            category: "finance",
            description: "List transactions",
          },
          {
            endpoint: "/api/transactions",
            method: "POST",
            enabled: true,
            rateLimit: 30,
            timeout: 5000,
            category: "finance",
            description: "Create transaction",
          },
          {
            endpoint: "/api/wallets",
            method: "GET",
            enabled: true,
            rateLimit: 60,
            timeout: 5000,
            category: "finance",
            description: "List wallets",
          },
          {
            endpoint: "/api/wallets",
            method: "POST",
            enabled: true,
            rateLimit: 20,
            timeout: 5000,
            category: "finance",
            description: "Create wallet",
          },
          {
            endpoint: "/api/moods",
            method: "GET",
            enabled: true,
            rateLimit: 60,
            timeout: 5000,
            category: "wellbeing",
            description: "List mood entries",
          },
          {
            endpoint: "/api/moods",
            method: "POST",
            enabled: true,
            rateLimit: 30,
            timeout: 5000,
            category: "wellbeing",
            description: "Log mood",
          },
          {
            endpoint: "/api/sleep",
            method: "GET",
            enabled: true,
            rateLimit: 60,
            timeout: 5000,
            category: "wellbeing",
            description: "List sleep logs",
          },
          {
            endpoint: "/api/sleep",
            method: "POST",
            enabled: true,
            rateLimit: 30,
            timeout: 5000,
            category: "wellbeing",
            description: "Log sleep",
          },
          {
            endpoint: "/api/goals",
            method: "GET",
            enabled: true,
            rateLimit: 60,
            timeout: 5000,
            category: "core",
            description: "List goals",
          },
          {
            endpoint: "/api/goals",
            method: "POST",
            enabled: true,
            rateLimit: 20,
            timeout: 5000,
            category: "core",
            description: "Create goal",
          },
          {
            endpoint: "/api/focus",
            method: "GET",
            enabled: true,
            rateLimit: 60,
            timeout: 5000,
            category: "productivity",
            description: "List focus sessions",
          },
          {
            endpoint: "/api/focus",
            method: "POST",
            enabled: true,
            rateLimit: 30,
            timeout: 5000,
            category: "productivity",
            description: "Start focus session",
          },
          {
            endpoint: "/api/journal",
            method: "GET",
            enabled: true,
            rateLimit: 60,
            timeout: 5000,
            category: "wellbeing",
            description: "List journal entries",
          },
          {
            endpoint: "/api/journal",
            method: "POST",
            enabled: true,
            rateLimit: 30,
            timeout: 5000,
            category: "wellbeing",
            description: "Create journal entry",
          },
          {
            endpoint: "/api/reading",
            method: "GET",
            enabled: true,
            rateLimit: 60,
            timeout: 5000,
            category: "learning",
            description: "List reading items",
          },
          {
            endpoint: "/api/reading",
            method: "POST",
            enabled: true,
            rateLimit: 20,
            timeout: 5000,
            category: "learning",
            description: "Add reading item",
          },
          {
            endpoint: "/api/admin/stats",
            method: "GET",
            enabled: true,
            rateLimit: 10,
            timeout: 10000,
            category: "admin",
            description: "Get admin statistics",
          },
          {
            endpoint: "/api/admin/users",
            method: "GET",
            enabled: true,
            rateLimit: 10,
            timeout: 10000,
            category: "admin",
            description: "List all users",
          },
          {
            endpoint: "/api/admin/config",
            method: "GET",
            enabled: true,
            rateLimit: 10,
            timeout: 5000,
            category: "admin",
            description: "Get system config",
          },
          {
            endpoint: "/api/admin/config",
            method: "PUT",
            enabled: true,
            rateLimit: 5,
            timeout: 5000,
            category: "admin",
            description: "Update system config",
          },
          {
            endpoint: "/api/news",
            method: "GET",
            enabled: true,
            rateLimit: 20,
            timeout: 15000,
            category: "content",
            description: "Fetch news feed",
          },
        ];
        const items = defaults.map((d) => ({
          _id: generateId(),
          ...d,
          updatedAt: now(),
        }));
        setStore("apiConfig", items);
        return items;
      }
      return configs;
    },
    updateConfig(data: Record<string, unknown>): void {
      const items = getStore("apiConfig");
      const existing = items.find(
        (i) => i.endpoint === data.endpoint && i.method === data.method,
      );
      if (existing) {
        if (data.enabled !== undefined) existing.enabled = data.enabled;
        if (data.rateLimit !== undefined) existing.rateLimit = data.rateLimit;
        if (data.timeout !== undefined) existing.timeout = data.timeout;
        existing.updatedAt = now();
        setStore("apiConfig", items);
      } else {
        items.push({
          _id: generateId(),
          endpoint: data.endpoint as string,
          method: data.method as string,
          enabled: (data.enabled as boolean) ?? true,
          rateLimit: (data.rateLimit as number) ?? 60,
          timeout: (data.timeout as number) ?? 5000,
          category: (data.category as string) ?? "core",
          description: data.description as string,
          updatedAt: now(),
        });
        setStore("apiConfig", items);
      }
    },
    getHealth(): StoredRecord[] {
      const configs = getStore("apiConfig");
      const logs = getStore("apiLogs");
      const oneHourAgo = now() - 3600000;
      return configs.map((config) => {
        const endpointLogs = logs.filter(
          (l) =>
            l.endpoint === config.endpoint &&
            l.method === config.method &&
            (l.timestamp as number) >= oneHourAgo,
        );
        const totalRequests = endpointLogs.length;
        const errorRequests = endpointLogs.filter(
          (l) => (l.status as number) >= 400,
        ).length;
        const avgResponseTime =
          totalRequests > 0
            ? endpointLogs.reduce(
                (sum, l) => sum + (l.responseTime as number),
                0,
              ) / totalRequests
            : 0;
        return {
          ...config,
          totalRequests,
          errorRequests,
          errorRate:
            totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0,
          avgResponseTime: Math.round(avgResponseTime),
          uptime:
            totalRequests > 0
              ? ((totalRequests - errorRequests) / totalRequests) * 100
              : 100,
        };
      });
    },
    listKeys(): StoredRecord[] {
      return getStore("apiKeys");
    },
    createKey(data: Record<string, unknown>): StoredRecord {
      const items = getStore("apiKeys");
      const key = `pv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      const item = {
        _id: generateId(),
        key,
        name: data.name as string,
        permissions: (data.permissions as string[]) ?? [],
        active: true,
        createdAt: now(),
        usageCount: 0,
      };
      items.unshift(item);
      setStore("apiKeys", items);
      return item;
    },
    revokeKey(data: Record<string, unknown>): void {
      const items = getStore("apiKeys");
      const item = items.find((i) => i._id === data.id);
      if (item) {
        item.active = false;
        setStore("apiKeys", items);
      }
    },
    deleteKey(data: Record<string, unknown>): void {
      let items = getStore("apiKeys");
      items = items.filter((i) => i._id !== data.id);
      setStore("apiKeys", items);
    },
    getLogs(data: Record<string, unknown>): StoredRecord[] {
      let logs = getStore("apiLogs");
      logs.sort((a, b) => (b.timestamp as number) - (a.timestamp as number));
      if (data.endpoint) {
        logs = logs.filter((l) => l.endpoint === data.endpoint);
      }
      if (data.status) {
        logs = logs.filter((l) => l.status === data.status);
      }
      const limit = (data.limit as number) ?? 100;
      return logs.slice(0, limit);
    },
    getStats(): Record<string, unknown> {
      const logs = getStore("apiLogs");
      const now_ = now();
      const oneDayAgo = now_ - 86400000;
      const oneWeekAgo = now_ - 604800000;
      const todayLogs = logs.filter(
        (l) => (l.timestamp as number) >= oneDayAgo,
      );
      const weekLogs = logs.filter(
        (l) => (l.timestamp as number) >= oneWeekAgo,
      );
      const totalErrors = logs.filter(
        (l) => (l.status as number) >= 400,
      ).length;
      const todayErrors = todayLogs.filter(
        (l) => (l.status as number) >= 400,
      ).length;
      const avgResponseTime =
        logs.length > 0
          ? logs.reduce((sum, l) => sum + (l.responseTime as number), 0) /
            logs.length
          : 0;
      const endpointCounts: Record<string, number> = {};
      logs.forEach((l) => {
        endpointCounts[l.endpoint as string] =
          (endpointCounts[l.endpoint as string] || 0) + 1;
      });
      const topEndpoints = Object.entries(endpointCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, count }));
      const dailyCounts: Record<string, number> = {};
      weekLogs.forEach((l) => {
        const day = new Date(l.timestamp as number).toISOString().split("T")[0];
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });
      const keys = getStore("apiKeys");
      return {
        totalRequests: logs.length,
        todayRequests: todayLogs.length,
        weekRequests: weekLogs.length,
        totalErrors,
        todayErrors,
        errorRate: logs.length > 0 ? (totalErrors / logs.length) * 100 : 0,
        avgResponseTime: Math.round(avgResponseTime),
        topEndpoints,
        dailyCounts,
        activeKeys: keys.filter((k) => k.active).length,
        totalKeys: keys.length,
      };
    },
    getDeploymentInfo(): Record<string, unknown> {
      const configs = getStore("apiConfig");
      const keys = getStore("apiKeys");
      const logs = getStore("apiLogs");
      const categories = [...new Set(configs.map((c) => c.category))];
      return {
        totalEndpoints: configs.length,
        enabledEndpoints: configs.filter((c) => c.enabled).length,
        disabledEndpoints: configs.filter((c) => !c.enabled).length,
        categories,
        totalKeys: keys.length,
        activeKeys: keys.filter((k) => k.active).length,
        totalLogs: logs.length,
        lastActivity:
          logs.length > 0
            ? Math.max(...logs.map((l) => l.timestamp as number))
            : null,
      };
    },
    logRequest(data: Record<string, unknown>): void {
      const items = getStore("apiLogs");
      items.unshift({
        _id: generateId(),
        endpoint: data.endpoint as string,
        method: data.method as string,
        status: data.status as number,
        responseTime: data.responseTime as number,
        payloadSize: data.payloadSize as number,
        userId: data.userId as string,
        error: data.error as string,
        timestamp: now(),
      });
      setStore("apiLogs", items);
    },
    clearLogs(): void {
      setStore("apiLogs", []);
    },
  },
};
