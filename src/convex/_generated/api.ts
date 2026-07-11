import { localDB } from "@/lib/store/index"
import type { StoredRecord } from "@/lib/store/types"

function requireAdminGuard() {
  const profile = localDB.userProfiles.get()
  if (!profile || (profile as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized: admin role required")
  }
}

export const api = {
  users: {
    currentUser: (): StoredRecord | null => localDB.users.currentUser(),
    upsertUser: (..._args: unknown[]): void =>
      localDB.users.upsertUser(_args[0] as Record<string, unknown>),
    listPremiumUsers: (): StoredRecord[] => localDB.users.listPremiumUsers(),
  },
  userProfiles: {
    get: (): StoredRecord | null => localDB.userProfiles.get(),
    upsert: (..._args: unknown[]): void =>
      localDB.userProfiles.upsert(_args[0] as Record<string, unknown>),
  },
  tasks: {
    list: (): StoredRecord[] => localDB.tasks.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.tasks.create(_args[0] as Record<string, unknown>),
    toggle: (..._args: unknown[]): void =>
      localDB.tasks.toggle((_args[0] as Record<string, unknown>).id as string),
    remove: (..._args: unknown[]): void =>
      localDB.tasks.remove((_args[0] as Record<string, unknown>).id as string),
    stats: (): {
      total: number
      completed: number
      pending: number
      overdue: number
    } => localDB.tasks.stats(),
  },
  habits: {
    list: (): StoredRecord[] => localDB.habits.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.habits.create(_args[0] as Record<string, unknown>),
    update: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.habits.update(a.id as string, a)
    },
    archive: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.habits.remove(a.id as string)
    },
    checkIn: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.habits.checkIn(a.id as string, a.date as number)
    },
    remove: (..._args: unknown[]): void =>
      localDB.habits.remove((_args[0] as Record<string, unknown>).id as string),
    useStreakFreeze: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.habits.checkIn(a.id as string, a.date as number)
    },
    stats: (): {
      total: number
      totalStreak: number
      avgRate: number
      todayCompleted: number
    } => localDB.habits.stats(),
  },
  wallets: {
    list: (): StoredRecord[] => localDB.wallets.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.wallets.create(_args[0] as Record<string, unknown>),
    update: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.wallets.update(a.id as string, a)
    },
    remove: (..._args: unknown[]): void =>
      localDB.wallets.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
  },
  transactions: {
    list: (): StoredRecord[] => localDB.transactions.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.transactions.create(_args[0] as Record<string, unknown>),
    remove: (..._args: unknown[]): void =>
      localDB.transactions.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
    stats: (): Record<string, unknown> => localDB.transactions.stats(),
  },
  goals: {
    list: (): StoredRecord[] => localDB.goals.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.goals.create(_args[0] as Record<string, unknown>),
    update: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.goals.update(a.id as string, a)
    },
    remove: (..._args: unknown[]): void =>
      localDB.goals.remove((_args[0] as Record<string, unknown>).id as string),
  },
  focusSessions: {
    list: (): StoredRecord[] => localDB.focusSessions.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.focusSessions.create(_args[0] as Record<string, unknown>),
    stats: (): Record<string, unknown> => localDB.focusSessions.stats(),
  },
  moods: {
    list: (): StoredRecord[] => localDB.moods.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.moods.create(_args[0] as Record<string, unknown>),
    stats: (): Record<string, unknown> => localDB.moods.stats(),
  },
  sleepLogs: {
    list: (): StoredRecord[] => localDB.sleepLogs.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.sleepLogs.create(_args[0] as Record<string, unknown>),
    stats: (): Record<string, unknown> => localDB.sleepLogs.stats(),
  },
  gratitudeEntries: {
    list: (): StoredRecord[] => localDB.gratitudeEntries.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.gratitudeEntries.create(_args[0] as Record<string, unknown>),
    remove: (..._args: unknown[]): void =>
      localDB.gratitudeEntries.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
    stats: (): Record<string, unknown> => localDB.gratitudeEntries.stats(),
  },
  news: {
    fetchNews: (..._args: unknown[]): Record<string, unknown> =>
      localDB.news.fetchNews(),
  },
  admin: {
    listUsers: (): StoredRecord[] => {
      requireAdminGuard()
      return localDB.admin.listUsers()
    },
    getStats: (): Record<string, number> => {
      requireAdminGuard()
      return localDB.admin.getStats()
    },
    getConfig: (): Record<string, unknown> => {
      requireAdminGuard()
      return {}
    },
    getChallenges: (): Record<string, unknown>[] => {
      requireAdminGuard()
      return []
    },
    getFinanceStats: (): { totalIncome: number; totalExpense: number } => {
      requireAdminGuard()
      return { totalIncome: 0, totalExpense: 0 }
    },
    getUserDetail: (
      ..._args: unknown[]
    ): {
      user: StoredRecord | null
      tasks: never[]
      habits: never[]
      transactions: never[]
    } | null => {
      requireAdminGuard()
      const a = _args[0] as Record<string, unknown>
      const user =
        localDB.admin
          .listUsers()
          .find((u: Record<string, unknown>) => u._id === a.userId) ?? null
      if (!user) return null
      return {
        user: user as StoredRecord,
        tasks: [],
        habits: [],
        transactions: [],
      }
    },
    grantPremium: (..._args: unknown[]): Promise<void> => {
      requireAdminGuard()
      return Promise.resolve()
    },
    revokePremium: (..._args: unknown[]): Promise<void> => {
      requireAdminGuard()
      return Promise.resolve()
    },
    deleteUser: (..._args: unknown[]): Promise<void> => {
      requireAdminGuard()
      return Promise.resolve()
    },
    updateUser: (..._args: unknown[]): Promise<unknown> => {
      requireAdminGuard()
      return Promise.resolve(_args[0])
    },
    setConfig: (..._args: unknown[]): Promise<unknown> => {
      requireAdminGuard()
      return Promise.resolve(_args[0])
    },
    bulkSetConfig: (..._args: unknown[]): Promise<unknown> => {
      requireAdminGuard()
      return Promise.resolve(_args[0])
    },
    createChallenge: (..._args: unknown[]): Promise<unknown> => {
      requireAdminGuard()
      return Promise.resolve(_args[0])
    },
    updateChallenge: (..._args: unknown[]): Promise<unknown> => {
      requireAdminGuard()
      return Promise.resolve(_args[0])
    },
    deleteChallenge: (..._args: unknown[]): Promise<void> => Promise.resolve(),
    setupFirstAdmin: (): Promise<void> => Promise.resolve(),
    hasAdmin: (): true => true,
  },
  kanban: {
    list: (): StoredRecord[] => localDB.kanban.list(),
    createColumn: (..._args: unknown[]): StoredRecord =>
      localDB.kanban.createColumn(_args[0] as Record<string, unknown>),
    updateColumn: (..._args: unknown[]): void => localDB.kanban.updateColumn(),
    deleteColumn: (..._args: unknown[]): void => localDB.kanban.deleteColumn(),
    createTask: (..._args: unknown[]): void => localDB.kanban.createTask(),
    updateTask: (..._args: unknown[]): void => localDB.kanban.updateTask(),
    moveTask: (..._args: unknown[]): void => localDB.kanban.moveTask(),
    deleteTask: (..._args: unknown[]): void => localDB.kanban.deleteTask(),
    initializeDefaultColumns: (): void =>
      localDB.kanban.initializeDefaultColumns(),
  },
  waterLogs: {
    list: (): StoredRecord[] => localDB.waterLogs.listByDate(Date.now()),
    listByDate: (..._args: unknown[]): StoredRecord[] =>
      localDB.waterLogs.listByDate(_args[0] as number),
    log: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.waterLogs.addWater(Date.now(), a.glasses as number)
    },
    getTodayTotal: (): number => localDB.waterLogs.getTodayTotal(),
    addWater: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.waterLogs.addWater(a.date as number, a.glasses as number)
    },
    removeWater: (..._args: unknown[]): void =>
      localDB.waterLogs.removeWater(
        (_args[0] as Record<string, unknown>).id as string,
      ),
    getWeeklyStats: (): Record<string, number> =>
      localDB.waterLogs.getWeeklyStats(),
  },
  recurringTransactions: {
    list: (): StoredRecord[] => localDB.recurringTransactions.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.recurringTransactions.create(_args[0] as Record<string, unknown>),
    update: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.recurringTransactions.update(a.id as string, a)
    },
    remove: (..._args: unknown[]): void =>
      localDB.recurringTransactions.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
    processDue: (): void => localDB.recurringTransactions.processDue(),
  },
  investments: {
    list: (): StoredRecord[] => localDB.investments.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.investments.create(_args[0] as Record<string, unknown>),
    update: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.investments.update(a.id as string, a)
    },
    remove: (..._args: unknown[]): void =>
      localDB.investments.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
    stats: (): Record<string, unknown> => localDB.investments.stats(),
  },
  loans: {
    list: (): StoredRecord[] => localDB.loans.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.loans.create(_args[0] as Record<string, unknown>),
    update: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.loans.update(a.id as string, a)
    },
    addPayment: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.loans.addPayment(a.id as string, a.amount as number)
    },
    remove: (..._args: unknown[]): void =>
      localDB.loans.remove((_args[0] as Record<string, unknown>).id as string),
    stats: (): Record<string, unknown> => localDB.loans.stats(),
  },
  automation: {
    listRules: (): StoredRecord[] => localDB.automation.listRules(),
    createRule: (..._args: unknown[]): StoredRecord =>
      localDB.automation.createRule(_args[0] as Record<string, unknown>),
    updateRule: (..._args: unknown[]): void => localDB.automation.updateRule(),
    deleteRule: (..._args: unknown[]): void =>
      localDB.automation.deleteRule(
        (_args[0] as Record<string, unknown>).id as string,
      ),
    getSmartSuggestions: (): string[] =>
      localDB.automation.getSmartSuggestions(),
  },
  challenges: {
    listChallenges: (): StoredRecord[] => localDB.challenges.listChallenges(),
    listActive: (): StoredRecord[] => localDB.challenges.listChallenges(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.challenges.create(_args[0] as Record<string, unknown>),
    join: (..._args: unknown[]): void => localDB.challenges.join(),
    leave: (..._args: unknown[]): void => localDB.challenges.leave(),
    updateProgress: (..._args: unknown[]): void =>
      localDB.challenges.updateProgress(),
    getLeaderboard: (..._args: unknown[]): StoredRecord[] =>
      localDB.challenges.getLeaderboard(),
  },
  challengeParticipants: {
    listByUser: (): StoredRecord[] => [],
    join: (..._args: unknown[]): Promise<unknown> => Promise.resolve(_args[0]),
  },
  achievements: {
    listAchievements: (): StoredRecord[] =>
      localDB.achievements.listAchievements(),
    listUserAchievements: (): StoredRecord[] =>
      localDB.achievements.listUserAchievements(),
    unlockAchievement: (..._args: unknown[]): void =>
      localDB.achievements.unlockAchievement(
        _args[0] as Record<string, unknown>,
      ),
    checkAndUnlockAchievements: (): void =>
      localDB.achievements.checkAndUnlockAchievements(),
  },
  insights: {
    getMoodInsights: (): Record<string, unknown> =>
      localDB.insights.getMoodInsights(),
    getHabitInsights: (): Record<string, unknown> =>
      localDB.insights.getHabitInsights(),
  },
  expenseGroups: {
    listGroups: (): StoredRecord[] => localDB.expenseGroups.listGroups(),
    createGroup: (..._args: unknown[]): StoredRecord =>
      localDB.expenseGroups.createGroup(_args[0] as Record<string, unknown>),
    inviteMember: (..._args: unknown[]): void =>
      localDB.expenseGroups.inviteMember(),
    addExpense: (..._args: unknown[]): void =>
      localDB.expenseGroups.addExpense(),
    settleBalance: (..._args: unknown[]): void =>
      localDB.expenseGroups.settleBalance(),
    getBalances: (..._args: unknown[]): StoredRecord[] =>
      localDB.expenseGroups.getBalances(),
    getGroupStats: (..._args: unknown[]): Record<string, number> =>
      localDB.expenseGroups.getGroupStats(),
  },
  journal: {
    list: (): StoredRecord[] => localDB.journal.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.journal.create(_args[0] as Record<string, unknown>),
    update: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.journal.update(a.id as string, a)
    },
    remove: (..._args: unknown[]): void =>
      localDB.journal.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
  },
  readingList: {
    list: (): StoredRecord[] => localDB.readingList.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.readingList.create(_args[0] as Record<string, unknown>),
    update: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.readingList.update(a.id as string, a)
    },
    remove: (..._args: unknown[]): void =>
      localDB.readingList.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
  },
  mealLogs: {
    list: (): StoredRecord[] => localDB.mealLogs.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.mealLogs.create(_args[0] as Record<string, unknown>),
    remove: (..._args: unknown[]): void =>
      localDB.mealLogs.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
    stats: (): Record<string, unknown> => localDB.mealLogs.stats(),
  },
  contacts: {
    list: (): StoredRecord[] => localDB.contacts.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.contacts.create(_args[0] as Record<string, unknown>),
    update: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.contacts.update(a.id as string, a)
    },
    remove: (..._args: unknown[]): void =>
      localDB.contacts.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
    upcomingBirthdays: (): StoredRecord[] =>
      localDB.contacts.upcomingBirthdays(),
  },
  savingsGoals: {
    list: (): StoredRecord[] => localDB.savingsGoals.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.savingsGoals.create(_args[0] as Record<string, unknown>),
    update: (..._args: unknown[]): void => {
      const a = _args[0] as Record<string, unknown>
      localDB.savingsGoals.update(a.id as string, a)
    },
    remove: (..._args: unknown[]): void =>
      localDB.savingsGoals.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
    stats: (): Record<string, unknown> => localDB.savingsGoals.stats(),
  },
  studySessions: {
    list: (): StoredRecord[] => localDB.studySessions.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.studySessions.create(_args[0] as Record<string, unknown>),
    remove: (..._args: unknown[]): void =>
      localDB.studySessions.remove(
        (_args[0] as Record<string, unknown>).id as string,
      ),
    stats: (): Record<string, unknown> => localDB.studySessions.stats(),
  },
  dailyCheckins: {
    list: (): StoredRecord[] => localDB.dailyCheckins.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.dailyCheckins.create(_args[0] as Record<string, unknown>),
    today: (): StoredRecord | null => localDB.dailyCheckins.today(),
    stats: (): Record<string, unknown> => localDB.dailyCheckins.stats(),
  },
  weeklyReport: {
    sendWeeklyReport: (): void => localDB.weeklyReport.sendWeeklyReport(),
    sendWeeklyReportEmail: (..._args: unknown[]): void =>
      localDB.weeklyReport.sendWeeklyReportEmail(),
  },
  exerciseLogs: {
    list: (): StoredRecord[] => localDB.exerciseLogs.list(),
    create: (..._args: unknown[]): StoredRecord =>
      localDB.exerciseLogs.create(_args[0] as Record<string, unknown>),
    stats: (): Record<string, unknown> => localDB.exerciseLogs.stats(),
  },
  financialReports: {
    balanceSheet: (..._args: unknown[]): Record<string, unknown> =>
      localDB.financialReports.balanceSheet(),
    incomeExpense: (..._args: unknown[]): Record<string, unknown> =>
      localDB.financialReports.incomeExpense(),
  },
  apiManagement: {
    getConfig: (..._args: unknown[]): StoredRecord[] =>
      localDB.apiManagement.getConfig(),
    updateConfig: (..._args: unknown[]): void =>
      localDB.apiManagement.updateConfig(_args[0] as Record<string, unknown>),
    getHealth: (..._args: unknown[]): StoredRecord[] =>
      localDB.apiManagement.getHealth(),
    listKeys: (..._args: unknown[]): StoredRecord[] =>
      localDB.apiManagement.listKeys(),
    createKey: (..._args: unknown[]): StoredRecord =>
      localDB.apiManagement.createKey(_args[0] as Record<string, unknown>),
    revokeKey: (..._args: unknown[]): void =>
      localDB.apiManagement.revokeKey(_args[0] as Record<string, unknown>),
    deleteKey: (..._args: unknown[]): void =>
      localDB.apiManagement.deleteKey(_args[0] as Record<string, unknown>),
    getLogs: (..._args: unknown[]): StoredRecord[] =>
      localDB.apiManagement.getLogs(_args[0] as Record<string, unknown>),
    getStats: (..._args: unknown[]): Record<string, unknown> =>
      localDB.apiManagement.getStats(),
    getDeploymentInfo: (..._args: unknown[]): Record<string, unknown> =>
      localDB.apiManagement.getDeploymentInfo(),
    logRequest: (..._args: unknown[]): void =>
      localDB.apiManagement.logRequest(_args[0] as Record<string, unknown>),
    clearLogs: (..._args: unknown[]): void => localDB.apiManagement.clearLogs(),
  },
}
