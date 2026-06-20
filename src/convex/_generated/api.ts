import { localDB } from "@/lib/data-store";

// This file provides a Convex-compatible API shape backed by localStorage.
// When real Convex is deployed, remove the Vite aliases in vite.config.ts
// and this file will be replaced by the auto-generated Convex API.

export const api = {
  users: {
    currentUser: () => localDB.users.currentUser(),
    upsertUser: (...args: unknown[]) =>
      localDB.users.upsertUser(args[0] as Record<string, unknown>),
    listPremiumUsers: () => localDB.users.listPremiumUsers(),
  },
  userProfiles: {
    get: () => localDB.userProfiles.get(),
    upsert: (...args: unknown[]) =>
      localDB.userProfiles.upsert(args[0] as Record<string, unknown>),
  },
  tasks: {
    list: () => localDB.tasks.list(),
    create: (...args: unknown[]) =>
      localDB.tasks.create(args[0] as Record<string, unknown>),
    toggle: (...args: unknown[]) =>
      localDB.tasks.toggle((args[0] as Record<string, unknown>).id as string),
    remove: (...args: unknown[]) =>
      localDB.tasks.remove((args[0] as Record<string, unknown>).id as string),
    stats: () => localDB.tasks.stats(),
  },
  habits: {
    list: () => localDB.habits.list(),
    create: (...args: unknown[]) =>
      localDB.habits.create(args[0] as Record<string, unknown>),
    update: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.habits.update?.(a.id as string, a) ?? Promise.resolve();
    },
    archive: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.habits.archive?.(a.id as string) ?? Promise.resolve();
    },
    checkIn: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.habits.checkIn(a.id as string, a.date as number);
    },
    remove: (...args: unknown[]) =>
      localDB.habits.remove((args[0] as Record<string, unknown>).id as string),
    useStreakFreeze: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.habits.useStreakFreeze?.(a.id as string, a.date as number) ??
        Promise.resolve();
    },
    stats: () => localDB.habits.stats(),
  },
  wallets: {
    list: () => localDB.wallets.list(),
    create: (...args: unknown[]) =>
      localDB.wallets.create(args[0] as Record<string, unknown>),
    update: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.wallets.update(a.id as string, a);
    },
    remove: (...args: unknown[]) =>
      localDB.wallets.remove((args[0] as Record<string, unknown>).id as string),
  },
  transactions: {
    list: () => localDB.transactions.list(),
    create: (...args: unknown[]) =>
      localDB.transactions.create(args[0] as Record<string, unknown>),
    remove: (...args: unknown[]) =>
      localDB.transactions.remove(
        (args[0] as Record<string, unknown>).id as string,
      ),
    stats: () => localDB.transactions.stats(),
  },
  goals: {
    list: () => localDB.goals.list(),
    create: (...args: unknown[]) =>
      localDB.goals.create(args[0] as Record<string, unknown>),
    update: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.goals.update(a.id as string, a);
    },
    remove: (...args: unknown[]) =>
      localDB.goals.remove((args[0] as Record<string, unknown>).id as string),
  },
  focusSessions: {
    list: () => localDB.focusSessions.list(),
    create: (...args: unknown[]) =>
      localDB.focusSessions.create(args[0] as Record<string, unknown>),
    stats: () => localDB.focusSessions.stats(),
  },
  moods: {
    list: () => localDB.moods.list(),
    create: (...args: unknown[]) =>
      localDB.moods.create(args[0] as Record<string, unknown>),
    stats: () => localDB.moods.stats(),
  },
  sleepLogs: {
    list: () => localDB.sleepLogs.list(),
    create: (...args: unknown[]) =>
      localDB.sleepLogs.create(args[0] as Record<string, unknown>),
    stats: () => localDB.sleepLogs.stats(),
  },
  gratitudeEntries: {
    list: () => localDB.gratitudeEntries.list(),
    create: (...args: unknown[]) =>
      localDB.gratitudeEntries.create(args[0] as Record<string, unknown>),
    remove: (...args: unknown[]) =>
      localDB.gratitudeEntries.remove(
        (args[0] as Record<string, unknown>).id as string,
      ),
    stats: () => localDB.gratitudeEntries.stats(),
  },
  news: {
    fetchNews: (...args: unknown[]) =>
      localDB.news.fetchNews(args[0] as Record<string, unknown>),
  },
  admin: {
    listUsers: () => localDB.admin.listUsers(),
    getStats: () => localDB.admin.getStats(),
    getConfig: () => ({}),
    getChallenges: () => [] as Record<string, unknown>[],
    getFinanceStats: () => ({ totalIncome: 0, totalExpense: 0 }),
    getUserDetail: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      const user =
        localDB.admin
          .listUsers()
          .find((u: Record<string, unknown>) => u._id === a.userId) ?? null;
      if (!user) return null;
      return { user, tasks: [], habits: [], transactions: [] };
    },
    grantPremium: (...args: unknown[]) =>
      localDB.admin.grantPremium(args[0] as Record<string, unknown>),
    revokePremium: (...args: unknown[]) =>
      localDB.admin.revokePremium(args[0] as Record<string, unknown>),
    deleteUser: (...args: unknown[]) =>
      localDB.admin.deleteUser(args[0] as Record<string, unknown>),
    updateUser: (...args: unknown[]) => Promise.resolve(args[0]),
    setConfig: (...args: unknown[]) => Promise.resolve(args[0]),
    bulkSetConfig: (...args: unknown[]) => Promise.resolve(args[0]),
    createChallenge: (...args: unknown[]) => Promise.resolve(args[0]),
    updateChallenge: (...args: unknown[]) => Promise.resolve(args[0]),
    deleteChallenge: (...args: unknown[]) => Promise.resolve(),
    setupFirstAdmin: () => Promise.resolve(),
    hasAdmin: () => true,
  },
  kanban: {
    list: () => localDB.kanban.list(),
    createColumn: (...args: unknown[]) =>
      localDB.kanban.createColumn(args[0] as Record<string, unknown>),
    updateColumn: (...args: unknown[]) =>
      localDB.kanban.updateColumn(args[0] as Record<string, unknown>),
    deleteColumn: (...args: unknown[]) =>
      localDB.kanban.deleteColumn(args[0] as Record<string, unknown>),
    createTask: (...args: unknown[]) =>
      localDB.kanban.createTask(args[0] as Record<string, unknown>),
    updateTask: (...args: unknown[]) =>
      localDB.kanban.updateTask(args[0] as Record<string, unknown>),
    moveTask: (...args: unknown[]) =>
      localDB.kanban.moveTask(args[0] as Record<string, unknown>),
    deleteTask: (...args: unknown[]) =>
      localDB.kanban.deleteTask(args[0] as Record<string, unknown>),
    initializeDefaultColumns: () => localDB.kanban.initializeDefaultColumns(),
  },
  waterLogs: {
    list: () => localDB.waterLogs.listByDate(Date.now()),
    listByDate: (...args: unknown[]) =>
      localDB.waterLogs.listByDate(args[0] as number),
    log: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.waterLogs.addWater(Date.now(), a.glasses as number);
    },
    getTodayTotal: () => localDB.waterLogs.getTodayTotal(),
    addWater: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.waterLogs.addWater(a.date as number, a.glasses as number);
    },
    removeWater: (...args: unknown[]) =>
      localDB.waterLogs.removeWater(
        (args[0] as Record<string, unknown>).id as string,
      ),
    getWeeklyStats: () => localDB.waterLogs.getWeeklyStats(),
  },
  recurringTransactions: {
    list: () => localDB.recurringTransactions.list(),
    create: (...args: unknown[]) =>
      localDB.recurringTransactions.create(args[0] as Record<string, unknown>),
    update: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.recurringTransactions.update(a.id as string, a);
    },
    remove: (...args: unknown[]) =>
      localDB.recurringTransactions.remove(
        (args[0] as Record<string, unknown>).id as string,
      ),
    processDue: () => localDB.recurringTransactions.processDue(),
  },
  investments: {
    list: () => localDB.investments.list(),
    create: (...args: unknown[]) =>
      localDB.investments.create(args[0] as Record<string, unknown>),
    update: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.investments.update(a.id as string, a);
    },
    remove: (...args: unknown[]) =>
      localDB.investments.remove(
        (args[0] as Record<string, unknown>).id as string,
      ),
    stats: () => localDB.investments.stats(),
  },
  loans: {
    list: () => localDB.loans.list(),
    create: (...args: unknown[]) =>
      localDB.loans.create(args[0] as Record<string, unknown>),
    update: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.loans.update(a.id as string, a);
    },
    addPayment: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.loans.addPayment(a.id as string, a.amount as number);
    },
    remove: (...args: unknown[]) =>
      localDB.loans.remove((args[0] as Record<string, unknown>).id as string),
    stats: () => localDB.loans.stats(),
  },
  automation: {
    listRules: () => localDB.automation.listRules(),
    createRule: (...args: unknown[]) =>
      localDB.automation.createRule(args[0] as Record<string, unknown>),
    updateRule: (...args: unknown[]) =>
      localDB.automation.updateRule(args[0] as Record<string, unknown>),
    deleteRule: (...args: unknown[]) =>
      localDB.automation.deleteRule(
        (args[0] as Record<string, unknown>).id as string,
      ),
    getSmartSuggestions: () => localDB.automation.getSmartSuggestions(),
  },
  challenges: {
    listChallenges: () => localDB.challenges.listChallenges(),
    listActive: () => localDB.challenges.listChallenges(),
    create: (...args: unknown[]) =>
      localDB.challenges.create(args[0] as Record<string, unknown>),
    join: (...args: unknown[]) =>
      localDB.challenges.join(args[0] as Record<string, unknown>),
    leave: (...args: unknown[]) =>
      localDB.challenges.leave(args[0] as Record<string, unknown>),
    updateProgress: (...args: unknown[]) =>
      localDB.challenges.updateProgress(args[0] as Record<string, unknown>),
    getLeaderboard: (...args: unknown[]) =>
      localDB.challenges.getLeaderboard(args[0] as Record<string, unknown>),
  },
  challengeParticipants: {
    listByUser: () => [] as Record<string, unknown>[],
    join: (...args: unknown[]) => Promise.resolve(args[0]),
  },
  achievements: {
    listAchievements: () => localDB.achievements.listAchievements(),
    listUserAchievements: () => localDB.achievements.listUserAchievements(),
    unlockAchievement: (...args: unknown[]) =>
      localDB.achievements.unlockAchievement(
        args[0] as Record<string, unknown>,
      ),
    checkAndUnlockAchievements: () =>
      localDB.achievements.checkAndUnlockAchievements(),
  },
  insights: {
    getMoodInsights: () => localDB.insights.getMoodInsights(),
    getHabitInsights: () => localDB.insights.getHabitInsights(),
  },
  expenseGroups: {
    listGroups: () => localDB.expenseGroups.listGroups(),
    createGroup: (...args: unknown[]) =>
      localDB.expenseGroups.createGroup(args[0] as Record<string, unknown>),
    inviteMember: (...args: unknown[]) =>
      localDB.expenseGroups.inviteMember(args[0] as Record<string, unknown>),
    addExpense: (...args: unknown[]) =>
      localDB.expenseGroups.addExpense(args[0] as Record<string, unknown>),
    settleBalance: (...args: unknown[]) =>
      localDB.expenseGroups.settleBalance(args[0] as Record<string, unknown>),
    getBalances: (...args: unknown[]) =>
      localDB.expenseGroups.getBalances(args[0] as Record<string, unknown>),
    getGroupStats: (...args: unknown[]) =>
      localDB.expenseGroups.getGroupStats(args[0] as Record<string, unknown>),
  },
  journal: {
    list: () => localDB.journal.list(),
    create: (...args: unknown[]) =>
      localDB.journal.create(args[0] as Record<string, unknown>),
    update: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.journal.update(a.id as string, a);
    },
    remove: (...args: unknown[]) =>
      localDB.journal.remove((args[0] as Record<string, unknown>).id as string),
  },
  readingList: {
    list: () => localDB.readingList.list(),
    create: (...args: unknown[]) =>
      localDB.readingList.create(args[0] as Record<string, unknown>),
    update: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.readingList.update(a.id as string, a);
    },
    remove: (...args: unknown[]) =>
      localDB.readingList.remove(
        (args[0] as Record<string, unknown>).id as string,
      ),
  },
  mealLogs: {
    list: () => localDB.mealLogs.list(),
    create: (...args: unknown[]) =>
      localDB.mealLogs.create(args[0] as Record<string, unknown>),
    remove: (...args: unknown[]) =>
      localDB.mealLogs.remove(
        (args[0] as Record<string, unknown>).id as string,
      ),
    stats: () => localDB.mealLogs.stats(),
  },
  contacts: {
    list: () => localDB.contacts.list(),
    create: (...args: unknown[]) =>
      localDB.contacts.create(args[0] as Record<string, unknown>),
    update: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.contacts.update(a.id as string, a);
    },
    remove: (...args: unknown[]) =>
      localDB.contacts.remove(
        (args[0] as Record<string, unknown>).id as string,
      ),
    upcomingBirthdays: () => localDB.contacts.upcomingBirthdays(),
  },
  savingsGoals: {
    list: () => localDB.savingsGoals.list(),
    create: (...args: unknown[]) =>
      localDB.savingsGoals.create(args[0] as Record<string, unknown>),
    update: (...args: unknown[]) => {
      const a = args[0] as Record<string, unknown>;
      localDB.savingsGoals.update(a.id as string, a);
    },
    remove: (...args: unknown[]) =>
      localDB.savingsGoals.remove(
        (args[0] as Record<string, unknown>).id as string,
      ),
    stats: () => localDB.savingsGoals.stats(),
  },
  studySessions: {
    list: () => localDB.studySessions.list(),
    create: (...args: unknown[]) =>
      localDB.studySessions.create(args[0] as Record<string, unknown>),
    remove: (...args: unknown[]) =>
      localDB.studySessions.remove(
        (args[0] as Record<string, unknown>).id as string,
      ),
    stats: () => localDB.studySessions.stats(),
  },
  dailyCheckins: {
    list: () => localDB.dailyCheckins.list(),
    create: (...args: unknown[]) =>
      localDB.dailyCheckins.create(args[0] as Record<string, unknown>),
    today: () => localDB.dailyCheckins.today(),
    stats: () => localDB.dailyCheckins.stats(),
  },
  weeklyReport: {
    sendWeeklyReport: () => localDB.weeklyReport.sendWeeklyReport(),
    sendWeeklyReportEmail: (...args: unknown[]) =>
      localDB.weeklyReport.sendWeeklyReportEmail(
        args[0] as Record<string, unknown>,
      ),
  },
  exerciseLogs: {
    list: () => localDB.exerciseLogs.list(),
    create: (...args: unknown[]) =>
      localDB.exerciseLogs.create(args[0] as Record<string, unknown>),
    stats: () => localDB.exerciseLogs.stats(),
  },
  financialReports: {
    balanceSheet: (...args: unknown[]) =>
      localDB.financialReports.balanceSheet(args[0] as Record<string, unknown>),
    incomeExpense: (...args: unknown[]) =>
      localDB.financialReports.incomeExpense(
        args[0] as Record<string, unknown>,
      ),
  },
  apiManagement: {
    getConfig: (...args: unknown[]) =>
      localDB.apiManagement.getConfig(args[0] as Record<string, unknown>),
    updateConfig: (...args: unknown[]) =>
      localDB.apiManagement.updateConfig(args[0] as Record<string, unknown>),
    getHealth: (...args: unknown[]) =>
      localDB.apiManagement.getHealth(args[0] as Record<string, unknown>),
    listKeys: (...args: unknown[]) =>
      localDB.apiManagement.listKeys(args[0] as Record<string, unknown>),
    createKey: (...args: unknown[]) =>
      localDB.apiManagement.createKey(args[0] as Record<string, unknown>),
    revokeKey: (...args: unknown[]) =>
      localDB.apiManagement.revokeKey(args[0] as Record<string, unknown>),
    deleteKey: (...args: unknown[]) =>
      localDB.apiManagement.deleteKey(args[0] as Record<string, unknown>),
    getLogs: (...args: unknown[]) =>
      localDB.apiManagement.getLogs(args[0] as Record<string, unknown>),
    getStats: (...args: unknown[]) =>
      localDB.apiManagement.getStats(args[0] as Record<string, unknown>),
    getDeploymentInfo: (...args: unknown[]) =>
      localDB.apiManagement.getDeploymentInfo(
        args[0] as Record<string, unknown>,
      ),
    logRequest: (...args: unknown[]) =>
      localDB.apiManagement.logRequest(args[0] as Record<string, unknown>),
    clearLogs: (...args: unknown[]) =>
      localDB.apiManagement.clearLogs(args[0] as Record<string, unknown>),
  },
};
