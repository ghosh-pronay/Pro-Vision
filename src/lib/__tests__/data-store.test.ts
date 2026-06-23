import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { localDB } from "@/lib/data-store";

function clearAllLocalStorage() {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.startsWith("pv_")) {
      localStorage.removeItem(key);
    }
  }
}

beforeEach(() => {
  clearAllLocalStorage();
});

afterEach(() => {
  clearAllLocalStorage();
});

describe("localDB.tasks", () => {
  it("should start with an empty list", () => {
    expect(localDB.tasks.list()).toEqual([]);
  });

  it("should create a task with auto-generated fields", () => {
    const task = localDB.tasks.create({ title: "Buy groceries" });
    expect(task._id).toBeDefined();
    expect(task.title).toBe("Buy groceries");
    expect(task.completed).toBe(false);
    expect(task.createdAt).toBeDefined();
    expect(task.updatedAt).toBeDefined();
  });

  it("should prepend new tasks to the list", () => {
    localDB.tasks.create({ title: "First" });
    localDB.tasks.create({ title: "Second" });
    const list = localDB.tasks.list();
    expect(list[0].title).toBe("Second");
    expect(list[1].title).toBe("First");
  });

  it("should toggle task completion", () => {
    const task = localDB.tasks.create({ title: "Task" });
    expect(task.completed).toBe(false);
    localDB.tasks.toggle(task._id);
    const list = localDB.tasks.list();
    expect(list.find((t) => t._id === task._id)!.completed).toBe(true);
    localDB.tasks.toggle(task._id);
    const list2 = localDB.tasks.list();
    expect(list2.find((t) => t._id === task._id)!.completed).toBe(false);
  });

  it("should ignore toggle for non-existent id", () => {
    localDB.tasks.create({ title: "Task" });
    localDB.tasks.toggle("nonexistent");
    expect(localDB.tasks.list()).toHaveLength(1);
  });

  it("should remove a task", () => {
    const task = localDB.tasks.create({ title: "Task" });
    expect(localDB.tasks.list()).toHaveLength(1);
    localDB.tasks.remove(task._id);
    expect(localDB.tasks.list()).toHaveLength(0);
  });

  it("should ignore remove for non-existent id", () => {
    localDB.tasks.create({ title: "Task" });
    localDB.tasks.remove("nonexistent");
    expect(localDB.tasks.list()).toHaveLength(1);
  });

  it("should return correct stats", () => {
    const now = Date.now();
    localDB.tasks.create({ title: "Pending" });
    const completed = localDB.tasks.create({ title: "Done" });
    localDB.tasks.toggle(completed._id);
    localDB.tasks.create({
      title: "Overdue",
      dueDate: now - 100000,
    });
    const stats = localDB.tasks.stats();
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(1);
    expect(stats.pending).toBe(2);
    expect(stats.overdue).toBe(1);
  });

  it("should return zero stats when empty", () => {
    const stats = localDB.tasks.stats();
    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.overdue).toBe(0);
  });
});

describe("localDB.habits", () => {
  it("should start with an empty list", () => {
    expect(localDB.habits.list()).toEqual([]);
  });

  it("should create a habit with default completedDates", () => {
    const habit = localDB.habits.create({ name: "Exercise" });
    expect(habit._id).toBeDefined();
    expect(habit.name).toBe("Exercise");
    expect(habit.completedDates).toEqual([]);
    expect(habit.createdAt).toBeDefined();
  });

  it("should toggle check-in for a habit", () => {
    const habit = localDB.habits.create({ name: "Read" });
    const today = Date.now();
    localDB.habits.checkIn(habit._id, today);
    const list = localDB.habits.list();
    expect(list[0].completedDates).toContain(today);
  });

  it("should remove check-in when toggling same date", () => {
    const habit = localDB.habits.create({ name: "Read" });
    const today = Date.now();
    localDB.habits.checkIn(habit._id, today);
    localDB.habits.checkIn(habit._id, today);
    const list = localDB.habits.list();
    expect((list[0].completedDates as number[]).length).toBe(0);
  });

  it("should ignore check-in for non-existent id", () => {
    localDB.habits.create({ name: "Habit" });
    localDB.habits.checkIn("nonexistent", Date.now());
    expect(localDB.habits.list()[0].completedDates).toEqual([]);
  });

  it("should remove a habit", () => {
    const habit = localDB.habits.create({ name: "Habit" });
    localDB.habits.remove(habit._id);
    expect(localDB.habits.list()).toHaveLength(0);
  });

  it("should return correct stats", () => {
    localDB.habits.create({ name: "A" });
    localDB.habits.create({ name: "B" });
    const stats = localDB.habits.stats();
    expect(stats.total).toBe(2);
    expect(typeof stats.totalStreak).toBe("number");
    expect(typeof stats.avgRate).toBe("number");
  });

  it("should calculate avgRate based on today completed", () => {
    const h1 = localDB.habits.create({ name: "A" });
    localDB.habits.create({ name: "B" });
    localDB.habits.checkIn(h1._id, Date.now());
    const stats = localDB.habits.stats();
    expect(stats.todayCompleted).toBe(1);
    expect(stats.avgRate).toBe(50);
  });
});

describe("localDB.wallets", () => {
  it("should start with an empty list", () => {
    expect(localDB.wallets.list()).toEqual([]);
  });

  it("should create a wallet", () => {
    const wallet = localDB.wallets.create({
      name: "Cash",
      balance: 1000,
    });
    expect(wallet._id).toBeDefined();
    expect(wallet.name).toBe("Cash");
    expect(wallet.balance).toBe(1000);
  });

  it("should update a wallet", () => {
    const wallet = localDB.wallets.create({ name: "Cash", balance: 1000 });
    localDB.wallets.update(wallet._id, { name: "Bank Account", balance: 5000 });
    const list = localDB.wallets.list();
    expect(list[0].name).toBe("Bank Account");
    expect(list[0].balance).toBe(5000);
  });

  it("should ignore update for non-existent id", () => {
    localDB.wallets.create({ name: "Cash" });
    localDB.wallets.update("nonexistent", { name: "X" });
    expect(localDB.wallets.list()[0].name).toBe("Cash");
  });

  it("should remove a wallet", () => {
    const wallet = localDB.wallets.create({ name: "Cash" });
    localDB.wallets.remove(wallet._id);
    expect(localDB.wallets.list()).toHaveLength(0);
  });
});

describe("localDB.transactions", () => {
  it("should start with an empty list", () => {
    expect(localDB.transactions.list()).toEqual([]);
  });

  it("should create a transaction", () => {
    const tx = localDB.transactions.create({
      type: "income",
      amount: 5000,
      description: "Salary",
    });
    expect(tx._id).toBeDefined();
    expect(tx.type).toBe("income");
    expect(tx.amount).toBe(5000);
  });

  it("should remove a transaction", () => {
    const tx = localDB.transactions.create({ type: "expense", amount: 200 });
    localDB.transactions.remove(tx._id);
    expect(localDB.transactions.list()).toHaveLength(0);
  });

  it("should return correct stats with mixed types", () => {
    const now = Date.now();
    localDB.transactions.create({ type: "income", amount: 10000, date: now });
    localDB.transactions.create({
      type: "expense",
      amount: 3000,
      date: now,
    });
    const stats = localDB.transactions.stats();
    expect(stats.totalIncome).toBe(10000);
    expect(stats.totalExpense).toBe(3000);
    expect(stats.balance).toBe(7000);
    expect(stats.thisMonthIncome).toBe(10000);
    expect(stats.thisMonthExpense).toBe(3000);
  });

  it("should return zero stats when empty", () => {
    const stats = localDB.transactions.stats();
    expect(stats.totalIncome).toBe(0);
    expect(stats.totalExpense).toBe(0);
    expect(stats.balance).toBe(0);
  });

  it("should separate this month vs older transactions", () => {
    const now = Date.now();
    const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
    localDB.transactions.create({
      type: "income",
      amount: 1000,
      date: threeMonthsAgo,
    });
    localDB.transactions.create({
      type: "income",
      amount: 5000,
      date: now,
    });
    const stats = localDB.transactions.stats();
    expect(stats.totalIncome).toBe(6000);
    expect(stats.thisMonthIncome).toBe(5000);
  });
});

describe("localDB.goals", () => {
  it("should start with an empty list", () => {
    expect(localDB.goals.list()).toEqual([]);
  });

  it("should create a goal with defaults", () => {
    const goal = localDB.goals.create({ title: "Learn TypeScript" });
    expect(goal._id).toBeDefined();
    expect(goal.title).toBe("Learn TypeScript");
    expect(goal.progress).toBe(0);
    expect(goal.status).toBe("active");
    expect(goal.milestones).toEqual([]);
  });

  it("should update a goal", () => {
    const goal = localDB.goals.create({ title: "Learn TypeScript" });
    localDB.goals.update(goal._id, { progress: 50 });
    const list = localDB.goals.list();
    expect(list[0].progress).toBe(50);
  });

  it("should ignore update for non-existent id", () => {
    localDB.goals.create({ title: "Goal" });
    localDB.goals.update("nonexistent", { progress: 100 });
    expect(localDB.goals.list()[0].progress).toBe(0);
  });

  it("should remove a goal", () => {
    const goal = localDB.goals.create({ title: "Goal" });
    localDB.goals.remove(goal._id);
    expect(localDB.goals.list()).toHaveLength(0);
  });
});

describe("localDB.focusSessions", () => {
  it("should start with an empty list", () => {
    expect(localDB.focusSessions.list()).toEqual([]);
  });

  it("should create a focus session", () => {
    const session = localDB.focusSessions.create({
      duration: 25,
      task: "Write tests",
    });
    expect(session._id).toBeDefined();
    expect(session.duration).toBe(25);
    expect(session.task).toBe("Write tests");
  });

  it("should return correct stats", () => {
    const now = Date.now();
    localDB.focusSessions.create({
      duration: 30,
      completedAt: now,
    });
    localDB.focusSessions.create({
      duration: 25,
      completedAt: now,
    });
    const stats = localDB.focusSessions.stats();
    expect(stats.sessions).toBe(2);
    expect(stats.totalMinutes).toBe(55);
    expect(stats.todayMinutes).toBe(55);
  });

  it("should return zero stats when empty", () => {
    const stats = localDB.focusSessions.stats();
    expect(stats.sessions).toBe(0);
    expect(stats.totalMinutes).toBe(0);
    expect(stats.totalHours).toBe(0);
    expect(stats.todayMinutes).toBe(0);
  });
});

describe("localDB.moods", () => {
  it("should start with an empty list", () => {
    expect(localDB.moods.list()).toEqual([]);
  });

  it("should create a mood entry", () => {
    const mood = localDB.moods.create({ mood: "happy", value: 8 });
    expect(mood._id).toBeDefined();
    expect(mood.mood).toBe("happy");
    expect(mood.value).toBe(8);
  });

  it("should return correct stats", () => {
    const now = Date.now();
    localDB.moods.create({ mood: "happy", value: 8, date: now });
    localDB.moods.create({ mood: "sad", value: 3, date: now });
    const stats = localDB.moods.stats();
    expect(stats.avgMood).toBe(5.5);
    expect(stats.todayMood).toBeDefined();
  });

  it("should return null todayMood when empty", () => {
    const stats = localDB.moods.stats();
    expect(stats.todayMood).toBeNull();
    expect(stats.avgMood).toBe(0);
  });
});

describe("localDB.sleepLogs", () => {
  it("should start with an empty list", () => {
    expect(localDB.sleepLogs.list()).toEqual([]);
  });

  it("should create a sleep log", () => {
    const log = localDB.sleepLogs.create({ hours: 7.5, quality: "good" });
    expect(log._id).toBeDefined();
    expect(log.hours).toBe(7.5);
    expect(log.quality).toBe("good");
  });

  it("should return correct stats", () => {
    localDB.sleepLogs.create({ hours: 8 });
    localDB.sleepLogs.create({ hours: 6 });
    const stats = localDB.sleepLogs.stats();
    expect(stats.avgHours).toBe(7);
    expect(stats.todayHours).toBe(6);
  });

  it("should return zero stats when empty", () => {
    const stats = localDB.sleepLogs.stats();
    expect(stats.avgHours).toBe(0);
    expect(stats.todayHours).toBe(0);
  });
});

describe("localDB.gratitudeEntries", () => {
  it("should start with an empty list", () => {
    expect(localDB.gratitudeEntries.list()).toEqual([]);
  });

  it("should create a gratitude entry", () => {
    const entry = localDB.gratitudeEntries.create({
      text: "Grateful for family",
    });
    expect(entry._id).toBeDefined();
    expect(entry.text).toBe("Grateful for family");
    expect(entry.createdAt).toBeDefined();
  });

  it("should remove a gratitude entry", () => {
    const entry = localDB.gratitudeEntries.create({ text: "Test" });
    localDB.gratitudeEntries.remove(entry._id);
    expect(localDB.gratitudeEntries.list()).toHaveLength(0);
  });

  it("should return correct stats", () => {
    localDB.gratitudeEntries.create({ text: "A" });
    const stats = localDB.gratitudeEntries.stats();
    expect(stats.total).toBe(1);
    expect(typeof stats.thisWeek).toBe("number");
  });
});

describe("localDB.kanban", () => {
  it("should start with an empty list", () => {
    expect(localDB.kanban.list()).toEqual([]);
  });

  it("should create a kanban column", () => {
    const col = localDB.kanban.createColumn({ title: "To Do", order: 0 });
    expect(col._id).toBeDefined();
    expect(col.title).toBe("To Do");
    expect(col.order).toBe(0);
  });

  it("should append columns to the end of the list", () => {
    localDB.kanban.createColumn({ title: "To Do", order: 0 });
    localDB.kanban.createColumn({ title: "Done", order: 1 });
    const list = localDB.kanban.list();
    expect(list[0].title).toBe("To Do");
    expect(list[1].title).toBe("Done");
  });

  it("should have stub methods that do not throw", () => {
    expect(() => localDB.kanban.updateColumn()).not.toThrow();
    expect(() => localDB.kanban.deleteColumn()).not.toThrow();
    expect(() => localDB.kanban.createTask()).not.toThrow();
    expect(() => localDB.kanban.updateTask()).not.toThrow();
    expect(() => localDB.kanban.moveTask()).not.toThrow();
    expect(() => localDB.kanban.deleteTask()).not.toThrow();
    expect(() => localDB.kanban.initializeDefaultColumns()).not.toThrow();
  });
});

describe("localDB.notifications", () => {
  it("should start with an empty list", () => {
    expect(localDB.notifications.list()).toEqual([]);
  });

  it("should store notification data via setStore for list retrieval", () => {
    const items = [
      {
        _id: "notif_1",
        title: "Test",
        message: "Hello",
        read: false,
        createdAt: Date.now(),
      },
    ];
    localStorage.setItem("pv_notifications", JSON.stringify(items));
    expect(localDB.notifications.list()).toHaveLength(1);
    expect(localDB.notifications.list()[0].title).toBe("Test");
  });
});

describe("localDB.exerciseLogs", () => {
  it("should start with an empty list", () => {
    expect(localDB.exerciseLogs.list()).toEqual([]);
  });

  it("should create an exercise log", () => {
    const log = localDB.exerciseLogs.create({
      type: "Running",
      duration: 30,
      calories: 300,
    });
    expect(log._id).toBeDefined();
    expect(log.type).toBe("Running");
    expect(log.duration).toBe(30);
  });

  it("should return correct stats", () => {
    const now = Date.now();
    localDB.exerciseLogs.create({
      type: "Running",
      duration: 30,
      calories: 300,
      date: now,
    });
    localDB.exerciseLogs.create({
      type: "Cycling",
      duration: 45,
      calories: 400,
      date: now,
    });
    const stats = localDB.exerciseLogs.stats();
    expect(stats.totalMinutes).toBe(75);
    expect(stats.totalCalories).toBe(700);
    expect(stats.thisWeek).toBe(75);
  });
});

describe("localDB.waterLogs", () => {
  it("should start with empty logs", () => {
    expect(localDB.waterLogs.getTodayTotal()).toBe(0);
  });

  it("should add water logs", () => {
    const now = Date.now();
    localDB.waterLogs.addWater(now, 2);
    localDB.waterLogs.addWater(now, 1);
    expect(localDB.waterLogs.getTodayTotal()).toBe(3);
  });

  it("should list logs by date", () => {
    const today = Date.now();
    localDB.waterLogs.addWater(today, 2);
    const logs = localDB.waterLogs.listByDate(today);
    expect(logs).toHaveLength(1);
    expect(logs[0].glasses).toBe(2);
  });

  it("should remove a water log", () => {
    localDB.waterLogs.addWater(Date.now(), 2);
    const logs = localDB.waterLogs.listByDate(Date.now());
    localDB.waterLogs.removeWater(logs[0]._id);
    expect(localDB.waterLogs.getTodayTotal()).toBe(0);
  });

  it("should return empty weekly stats", () => {
    expect(localDB.waterLogs.getWeeklyStats()).toEqual({});
  });
});

describe("localDB.mealLogs", () => {
  it("should start with an empty list", () => {
    expect(localDB.mealLogs.list()).toEqual([]);
  });

  it("should create a meal log", () => {
    const log = localDB.mealLogs.create({
      name: "Lunch",
      calories: 600,
      protein: 30,
      carbs: 60,
      fat: 20,
    });
    expect(log._id).toBeDefined();
    expect(log.name).toBe("Lunch");
  });

  it("should remove a meal log", () => {
    const log = localDB.mealLogs.create({ name: "Snack" });
    localDB.mealLogs.remove(log._id);
    expect(localDB.mealLogs.list()).toHaveLength(0);
  });

  it("should return correct stats", () => {
    localDB.mealLogs.create({
      name: "A",
      calories: 500,
      protein: 25,
      carbs: 50,
      fat: 15,
    });
    localDB.mealLogs.create({
      name: "B",
      calories: 300,
      protein: 10,
      carbs: 40,
      fat: 10,
    });
    const stats = localDB.mealLogs.stats();
    expect(stats.totalCalories).toBe(800);
    expect(stats.totalProtein).toBe(35);
    expect(stats.totalCarbs).toBe(90);
    expect(stats.totalFat).toBe(25);
  });
});

describe("localDB.journal", () => {
  it("should start with an empty list", () => {
    expect(localDB.journal.list()).toEqual([]);
  });

  it("should create a journal entry", () => {
    const entry = localDB.journal.create({
      title: "My Day",
      content: "Today was great",
    });
    expect(entry._id).toBeDefined();
    expect(entry.title).toBe("My Day");
    expect(entry.createdAt).toBeDefined();
  });

  it("should update a journal entry", () => {
    const entry = localDB.journal.create({ title: "Old" });
    localDB.journal.update(entry._id, { title: "New" });
    expect(localDB.journal.list()[0].title).toBe("New");
  });

  it("should remove a journal entry", () => {
    const entry = localDB.journal.create({ title: "X" });
    localDB.journal.remove(entry._id);
    expect(localDB.journal.list()).toHaveLength(0);
  });
});

describe("localDB.readingList", () => {
  it("should start with an empty list", () => {
    expect(localDB.readingList.list()).toEqual([]);
  });

  it("should create a reading item with default progress", () => {
    const item = localDB.readingList.create({
      title: "TypeScript in Depth",
      author: "John",
    });
    expect(item._id).toBeDefined();
    expect(item.progress).toBe(0);
  });

  it("should update a reading item", () => {
    const item = localDB.readingList.create({ title: "Book" });
    localDB.readingList.update(item._id, { progress: 50 });
    expect(localDB.readingList.list()[0].progress).toBe(50);
  });

  it("should remove a reading item", () => {
    const item = localDB.readingList.create({ title: "Book" });
    localDB.readingList.remove(item._id);
    expect(localDB.readingList.list()).toHaveLength(0);
  });
});

describe("localDB.contacts", () => {
  it("should start with an empty list", () => {
    expect(localDB.contacts.list()).toEqual([]);
  });

  it("should create a contact", () => {
    const contact = localDB.contacts.create({
      name: "Alice",
      email: "alice@example.com",
    });
    expect(contact._id).toBeDefined();
    expect(contact.name).toBe("Alice");
  });

  it("should update a contact", () => {
    const contact = localDB.contacts.create({ name: "Alice" });
    localDB.contacts.update(contact._id, { phone: "01712345678" });
    expect(localDB.contacts.list()[0].phone).toBe("01712345678");
  });

  it("should remove a contact", () => {
    const contact = localDB.contacts.create({ name: "Alice" });
    localDB.contacts.remove(contact._id);
    expect(localDB.contacts.list()).toHaveLength(0);
  });

  it("should return upcoming birthdays", () => {
    const now = new Date();
    const upcoming = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 3,
    ).getTime();
    localDB.contacts.create({ name: "Bob", birthday: upcoming });
    expect(localDB.contacts.upcomingBirthdays()).toHaveLength(1);
  });

  it("should not return past birthdays this month", () => {
    const now = new Date();
    const past = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 5,
    ).getTime();
    localDB.contacts.create({ name: "Bob", birthday: past });
    expect(localDB.contacts.upcomingBirthdays()).toHaveLength(0);
  });
});

describe("localDB.savingsGoals", () => {
  it("should start with an empty list", () => {
    expect(localDB.savingsGoals.list()).toEqual([]);
  });

  it("should create a savings goal with defaults", () => {
    const goal = localDB.savingsGoals.create({
      title: "Emergency Fund",
      targetAmount: 100000,
    });
    expect(goal._id).toBeDefined();
    expect(goal.currentAmount).toBe(0);
    expect(goal.status).toBe("active");
  });

  it("should update a savings goal", () => {
    const goal = localDB.savingsGoals.create({
      title: "Car",
      targetAmount: 500000,
    });
    localDB.savingsGoals.update(goal._id, { currentAmount: 100000 });
    expect(localDB.savingsGoals.list()[0].currentAmount).toBe(100000);
  });

  it("should remove a savings goal", () => {
    const goal = localDB.savingsGoals.create({ title: "Trip" });
    localDB.savingsGoals.remove(goal._id);
    expect(localDB.savingsGoals.list()).toHaveLength(0);
  });

  it("should return correct stats", () => {
    localDB.savingsGoals.create({
      title: "A",
      targetAmount: 100000,
      currentAmount: 40000,
    });
    localDB.savingsGoals.create({
      title: "B",
      targetAmount: 200000,
      currentAmount: 100000,
    });
    const stats = localDB.savingsGoals.stats();
    expect(stats.totalSaved).toBe(140000);
    expect(stats.totalTarget).toBe(300000);
    expect(stats.progressPercentage).toBe(47);
  });

  it("should handle zero target gracefully", () => {
    const stats = localDB.savingsGoals.stats();
    expect(stats.progressPercentage).toBe(0);
  });
});

describe("localDB.loans", () => {
  it("should start with an empty list", () => {
    expect(localDB.loans.list()).toEqual([]);
  });

  it("should create a loan with defaults", () => {
    const loan = localDB.loans.create({
      type: "given",
      amount: 50000,
      person: "Rahim",
    });
    expect(loan._id).toBeDefined();
    expect(loan.paidAmount).toBe(0);
    expect(loan.status).toBe("active");
  });

  it("should add payment to a loan", () => {
    const loan = localDB.loans.create({
      type: "given",
      amount: 50000,
    });
    localDB.loans.addPayment(loan._id, 10000);
    expect(localDB.loans.list()[0].paidAmount).toBe(10000);
    localDB.loans.addPayment(loan._id, 5000);
    expect(localDB.loans.list()[0].paidAmount).toBe(15000);
  });

  it("should remove a loan", () => {
    const loan = localDB.loans.create({ type: "taken", amount: 20000 });
    localDB.loans.remove(loan._id);
    expect(localDB.loans.list()).toHaveLength(0);
  });

  it("should return correct stats", () => {
    localDB.loans.create({ type: "given", amount: 50000 });
    localDB.loans.create({ type: "taken", amount: 30000 });
    const stats = localDB.loans.stats();
    expect(stats.totalGiven).toBe(50000);
    expect(stats.totalTaken).toBe(30000);
  });
});

describe("localDB.investments", () => {
  it("should start with an empty list", () => {
    expect(localDB.investments.list()).toEqual([]);
  });

  it("should create an investment", () => {
    const inv = localDB.investments.create({
      name: "DSE Stock",
      amount: 100000,
      currentValue: 120000,
    });
    expect(inv._id).toBeDefined();
    expect(inv.amount).toBe(100000);
  });

  it("should update an investment", () => {
    const inv = localDB.investments.create({ name: "Bond", amount: 50000 });
    localDB.investments.update(inv._id, { currentValue: 55000 });
    expect(localDB.investments.list()[0].currentValue).toBe(55000);
  });

  it("should remove an investment", () => {
    const inv = localDB.investments.create({ name: "Fund" });
    localDB.investments.remove(inv._id);
    expect(localDB.investments.list()).toHaveLength(0);
  });

  it("should return correct stats", () => {
    localDB.investments.create({
      name: "A",
      amount: 100000,
      currentValue: 110000,
    });
    localDB.investments.create({
      name: "B",
      amount: 50000,
      currentValue: 45000,
    });
    const stats = localDB.investments.stats();
    expect(stats.totalInvested).toBe(150000);
    expect(stats.totalCurrent).toBe(155000);
  });
});

describe("localDB.dailyCheckins", () => {
  it("should start with an empty list", () => {
    expect(localDB.dailyCheckins.list()).toEqual([]);
  });

  it("should create a daily checkin", () => {
    const checkin = localDB.dailyCheckins.create({
      date: Date.now(),
      energy: 8,
      mood: "great",
    });
    expect(checkin._id).toBeDefined();
    expect(checkin.energy).toBe(8);
  });

  it("should return today's checkin", () => {
    localDB.dailyCheckins.create({ date: Date.now(), energy: 7 });
    expect(localDB.dailyCheckins.today()).not.toBeNull();
  });

  it("should return null when no checkin today", () => {
    expect(localDB.dailyCheckins.today()).toBeNull();
  });

  it("should return correct stats", () => {
    localDB.dailyCheckins.create({ date: Date.now(), energy: 8 });
    localDB.dailyCheckins.create({ date: Date.now(), energy: 6 });
    const stats = localDB.dailyCheckins.stats();
    expect(stats.avgEnergy).toBe(7);
  });
});

describe("localDB.studySessions", () => {
  it("should start with an empty list", () => {
    expect(localDB.studySessions.list()).toEqual([]);
  });

  it("should create a study session", () => {
    const session = localDB.studySessions.create({
      subject: "Math",
      duration: 60,
    });
    expect(session._id).toBeDefined();
    expect(session.subject).toBe("Math");
  });

  it("should remove a study session", () => {
    const session = localDB.studySessions.create({ subject: "Physics" });
    localDB.studySessions.remove(session._id);
    expect(localDB.studySessions.list()).toHaveLength(0);
  });

  it("should return correct stats", () => {
    localDB.studySessions.create({ subject: "Math", duration: 60 });
    localDB.studySessions.create({ subject: "English", duration: 30 });
    const stats = localDB.studySessions.stats();
    expect(stats.totalHours).toBe(1.5);
    expect(stats.sessionsCount).toBe(2);
  });
});

describe("localDB.recurringTransactions", () => {
  it("should start with an empty list", () => {
    expect(localDB.recurringTransactions.list()).toEqual([]);
  });

  it("should create a recurring transaction", () => {
    const tx = localDB.recurringTransactions.create({
      type: "expense",
      amount: 5000,
      frequency: "monthly",
    });
    expect(tx._id).toBeDefined();
    expect(tx.amount).toBe(5000);
  });

  it("should update a recurring transaction", () => {
    const tx = localDB.recurringTransactions.create({ amount: 5000 });
    localDB.recurringTransactions.update(tx._id, { amount: 7000 });
    expect(localDB.recurringTransactions.list()[0].amount).toBe(7000);
  });

  it("should remove a recurring transaction", () => {
    const tx = localDB.recurringTransactions.create({ amount: 1000 });
    localDB.recurringTransactions.remove(tx._id);
    expect(localDB.recurringTransactions.list()).toHaveLength(0);
  });
});

describe("localDB.expenseGroups", () => {
  it("should start with an empty list", () => {
    expect(localDB.expenseGroups.listGroups()).toEqual([]);
  });

  it("should create an expense group", () => {
    const group = localDB.expenseGroups.createGroup({
      name: "Roommates",
      members: ["Alice", "Bob"],
    });
    expect(group._id).toBeDefined();
    expect(group.name).toBe("Roommates");
  });

  it("should have stub methods that do not throw", () => {
    expect(() => localDB.expenseGroups.inviteMember()).not.toThrow();
    expect(() => localDB.expenseGroups.addExpense()).not.toThrow();
    expect(() => localDB.expenseGroups.settleBalance()).not.toThrow();
    expect(localDB.expenseGroups.getBalances()).toEqual([]);
    expect(localDB.expenseGroups.getGroupStats()).toEqual({
      totalSpent: 0,
      memberCount: 0,
    });
  });
});

describe("localDB.automation", () => {
  it("should start with an empty rule list", () => {
    expect(localDB.automation.listRules()).toEqual([]);
  });

  it("should create an automation rule", () => {
    const rule = localDB.automation.createRule({
      name: "Auto-categorize",
      trigger: "transaction_created",
    });
    expect(rule._id).toBeDefined();
    expect(rule.isActive).toBe(true);
    expect(rule.name).toBe("Auto-categorize");
  });

  it("should delete an automation rule", () => {
    const rule = localDB.automation.createRule({ name: "Test" });
    localDB.automation.deleteRule(rule._id);
    expect(localDB.automation.listRules()).toHaveLength(0);
  });
});

describe("localDB.userProfiles", () => {
  it("should return null when no profile exists", () => {
    expect(localDB.userProfiles.get()).toBeNull();
  });

  it("should create a profile via upsert", () => {
    localDB.userProfiles.upsert({ name: "Test User", email: "test@test.com" });
    const profile = localDB.userProfiles.get();
    expect(profile).not.toBeNull();
    expect(profile!.name).toBe("Test User");
  });

  it("should update existing profile via upsert", () => {
    localDB.userProfiles.upsert({ name: "Old" });
    localDB.userProfiles.upsert({ name: "New" });
    expect(localDB.userProfiles.get()!.name).toBe("New");
  });
});

describe("localDB.users", () => {
  it("should return null when no user exists", () => {
    expect(localDB.users.currentUser()).toBeNull();
  });

  it("should upsert a user", () => {
    localDB.users.upsertUser({ uid: "123", email: "a@b.com" });
    const user = localDB.users.currentUser();
    expect(user).not.toBeNull();
    expect(user!.uid).toBe("123");
  });

  it("should update existing user via upsert", () => {
    localDB.users.upsertUser({ uid: "123" });
    localDB.users.upsertUser({ uid: "456" });
    expect(localDB.users.currentUser()!.uid).toBe("456");
  });

  it("should return empty premium users", () => {
    expect(localDB.users.listPremiumUsers()).toEqual([]);
  });
});

describe("localDB.achievements", () => {
  it("should unlock an achievement", () => {
    localDB.achievements.unlockAchievement({
      achievementId: "first_task",
      name: "First Task",
    });
    expect(localDB.achievements.listUserAchievements()).toHaveLength(1);
  });

  it("should not duplicate achievements", () => {
    localDB.achievements.unlockAchievement({ achievementId: "first_task" });
    localDB.achievements.unlockAchievement({ achievementId: "first_task" });
    expect(localDB.achievements.listUserAchievements()).toHaveLength(1);
  });
});

describe("localDB.challenges", () => {
  it("should create a challenge", () => {
    const challenge = localDB.challenges.create({
      name: "30-Day Fitness",
      description: "Exercise daily",
    });
    expect(challenge._id).toBeDefined();
    expect(challenge.isActive).toBe(true);
    expect(challenge.name).toBe("30-Day Fitness");
  });

  it("should return empty leaderboard", () => {
    expect(localDB.challenges.getLeaderboard()).toEqual([]);
  });
});

describe("localDB.apiManagement", () => {
  it("should return default configs on first call", () => {
    const configs = localDB.apiManagement.getConfig();
    expect(configs.length).toBeGreaterThan(0);
  });

  it("should return existing configs on subsequent calls", () => {
    localDB.apiManagement.getConfig();
    const configs = localDB.apiManagement.getConfig();
    const defaultCount = configs.length;
    expect(defaultCount).toBeGreaterThan(0);
  });

  it("should update an existing config", () => {
    const configs = localDB.apiManagement.getConfig();
    const first = configs[0];
    localDB.apiManagement.updateConfig({
      endpoint: first.endpoint,
      method: first.method,
      rateLimit: 100,
    });
    const updated = localDB.apiManagement.getConfig();
    expect(updated[0].rateLimit).toBe(100);
  });

  it("should create a new config when not found", () => {
    localDB.apiManagement.getConfig();
    localDB.apiManagement.updateConfig({
      endpoint: "/api/custom",
      method: "GET",
      enabled: false,
    });
    const configs = localDB.apiManagement.getConfig();
    const custom = configs.find((c) => c.endpoint === "/api/custom");
    expect(custom).toBeDefined();
    expect(custom!.enabled).toBe(false);
  });

  it("should create and revoke API keys", () => {
    const key = localDB.apiManagement.createKey({ name: "Test Key" });
    expect(key.key).toBeDefined();
    expect(key.active).toBe(true);
    localDB.apiManagement.revokeKey({ id: key._id });
    const keys = localDB.apiManagement.listKeys();
    expect(keys[0].active).toBe(false);
  });

  it("should delete an API key", () => {
    const key = localDB.apiManagement.createKey({ name: "Del" });
    localDB.apiManagement.deleteKey({ id: key._id });
    expect(localDB.apiManagement.listKeys()).toHaveLength(0);
  });

  it("should log and retrieve API logs", () => {
    localDB.apiManagement.logRequest({
      endpoint: "/api/tasks",
      method: "GET",
      status: 200,
      responseTime: 50,
      payloadSize: 1024,
    });
    const logs = localDB.apiManagement.getLogs({});
    expect(logs).toHaveLength(1);
    expect(logs[0].endpoint).toBe("/api/tasks");
  });

  it("should clear logs", () => {
    localDB.apiManagement.logRequest({
      endpoint: "/api/x",
      method: "GET",
      status: 200,
      responseTime: 10,
    });
    localDB.apiManagement.clearLogs();
    expect(localDB.apiManagement.getLogs({})).toHaveLength(0);
  });

  it("should return health info", () => {
    const health = localDB.apiManagement.getHealth();
    expect(Array.isArray(health)).toBe(true);
  });

  it("should return deployment info", () => {
    const info = localDB.apiManagement.getDeploymentInfo();
    expect(typeof info.totalEndpoints).toBe("number");
    expect(typeof info.enabledEndpoints).toBe("number");
  });

  it("should return stats", () => {
    const stats = localDB.apiManagement.getStats();
    expect(typeof stats.totalRequests).toBe("number");
  });
});

describe("Error handling - corrupt localStorage", () => {
  it("should return [] for tasks when localStorage contains invalid JSON", () => {
    localStorage.setItem("pv_tasks", "NOT_VALID_JSON{{{");
    expect(localDB.tasks.list()).toEqual([]);
  });

  it("should return [] for habits when localStorage contains invalid JSON", () => {
    localStorage.setItem("pv_habits", "%%%broken%%%");
    expect(localDB.habits.list()).toEqual([]);
  });

  it("should return [] for wallets when localStorage contains invalid JSON", () => {
    localStorage.setItem("pv_wallets", "{incomplete json");
    expect(localDB.wallets.list()).toEqual([]);
  });

  it("should return [] for transactions when localStorage contains invalid JSON", () => {
    localStorage.setItem("pv_transactions", "[{bad}]");
    expect(localDB.transactions.list()).toEqual([]);
  });

  it("should return null for moods when localStorage contains literal null JSON", () => {
    localStorage.setItem("pv_moods", "null");
    expect(localDB.moods.list()).toBeNull();
  });

  it("should return [] for goals when localStorage contains invalid JSON", () => {
    localStorage.setItem("pv_goals", "undefined");
    expect(localDB.goals.list()).toEqual([]);
  });

  it("should handle valid JSON array that is not an object array", () => {
    localStorage.setItem("pv_tasks", JSON.stringify([1, 2, 3]));
    const list = localDB.tasks.list();
    expect(list).toEqual([1, 2, 3]);
  });

  it("should handle empty string in localStorage", () => {
    localStorage.setItem("pv_tasks", "");
    expect(localDB.tasks.list()).toEqual([]);
  });

  it("should handle corrupted data without crashing other stores", () => {
    localStorage.setItem("pv_tasks", "CORRUPT");
    localStorage.setItem(
      "pv_wallets",
      JSON.stringify([{ _id: "1", name: "A" }]),
    );
    expect(localDB.tasks.list()).toEqual([]);
    expect(localDB.wallets.list()).toHaveLength(1);
  });
});
