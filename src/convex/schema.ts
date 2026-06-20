import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    tokenIdentifier: v.string(),
    image: v.optional(v.string()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
    isPremium: v.optional(v.boolean()),
    premiumExpiresAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    avatarConfig: v.optional(
      v.object({
        skin: v.string(),
        hair: v.string(),
        outfit: v.string(),
        accessories: v.array(v.string()),
        background: v.string(),
      }),
    ),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    gender: v.optional(
      v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    ),
    currency: v.optional(v.string()),
    language: v.optional(v.union(v.literal("en"), v.literal("bn"))),
    theme: v.optional(
      v.union(
        v.literal("light"),
        v.literal("dark"),
        v.literal("oled"),
        v.literal("system"),
      ),
    ),
    notificationsEnabled: v.optional(v.boolean()),
    weeklyEmailReport: v.optional(v.boolean()),
    timezone: v.optional(v.string()),
    onboarded: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"]),

  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
    dueDate: v.optional(v.number()),
    listId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  habits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    frequency: v.union(v.literal("daily"), v.literal("weekly")),
    targetDays: v.optional(v.array(v.number())),
    completedDates: v.array(v.number()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.optional(v.string()),
    archived: v.optional(v.boolean()),
    reminderTime: v.optional(v.string()),
    checkInNotes: v.optional(
      v.array(v.object({ date: v.number(), note: v.string() })),
    ),
    streakFreezes: v.optional(v.number()),
    maxStreakFreezes: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  wallets: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("cash"),
      v.literal("bank"),
      v.literal("credit"),
      v.literal("savings"),
      v.literal("digital"),
    ),
    currency: v.string(),
    balance: v.number(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  transactions: defineTable({
    userId: v.id("users"),
    walletId: v.id("wallets"),
    type: v.union(
      v.literal("income"),
      v.literal("expense"),
      v.literal("receivable"),
      v.literal("payable"),
      v.literal("loanTaken"),
      v.literal("loanGiven"),
    ),
    amount: v.number(),
    category: v.string(),
    description: v.optional(v.string()),
    date: v.number(),
    toWalletId: v.optional(v.id("wallets")),
    receiptUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_walletId", ["walletId"])
    .index("by_date", ["date"]),

  budgets: defineTable({
    userId: v.id("users"),
    categoryId: v.string(),
    amount: v.number(),
    spent: v.number(),
    period: v.union(
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly"),
    ),
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  receivables: defineTable({
    userId: v.id("users"),
    fromPerson: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("partial"),
      v.literal("completed"),
    ),
    receivedAmount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  payables: defineTable({
    userId: v.id("users"),
    toPerson: v.string(),
    amount: v.number(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("partial"),
      v.literal("completed"),
    ),
    paidAmount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  loans: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("given"), v.literal("taken")),
    personName: v.string(),
    amount: v.number(),
    paidAmount: v.number(),
    interestRate: v.optional(v.number()),
    startDate: v.number(),
    dueDate: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("overdue"),
    ),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  goals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    deadline: v.number(),
    progress: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
    ),
    milestones: v.array(
      v.object({
        title: v.string(),
        completed: v.boolean(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  focusSessions: defineTable({
    userId: v.id("users"),
    duration: v.number(),
    completedAt: v.number(),
    type: v.union(
      v.literal("pomodoro"),
      v.literal("shortBreak"),
      v.literal("longBreak"),
      v.literal("custom"),
    ),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_completedAt", ["completedAt"]),

  moods: defineTable({
    userId: v.id("users"),
    mood: v.union(
      v.literal("great"),
      v.literal("good"),
      v.literal("okay"),
      v.literal("bad"),
      v.literal("terrible"),
    ),
    value: v.number(),
    note: v.optional(v.string()),
    date: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"]),

  sleepLogs: defineTable({
    userId: v.id("users"),
    hours: v.number(),
    quality: v.union(
      v.literal("great"),
      v.literal("good"),
      v.literal("okay"),
      v.literal("bad"),
    ),
    bedTime: v.string(),
    wakeTime: v.string(),
    date: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"]),

  gratitudeEntries: defineTable({
    userId: v.id("users"),
    content: v.string(),
    mood: v.optional(v.string()),
    date: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"]),

  exerciseLogs: defineTable({
    userId: v.id("users"),
    type: v.string(),
    duration: v.number(),
    calories: v.optional(v.number()),
    distance: v.optional(v.number()),
    notes: v.optional(v.string()),
    date: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"]),

  coachMemory: defineTable({
    userId: v.id("users"),
    key: v.string(),
    value: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_key", ["key"]),

  newsCache: defineTable({
    query: v.string(),
    lang: v.string(),
    articles: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        url: v.string(),
        image: v.optional(v.string()),
        publishedAt: v.string(),
        source: v.object({ name: v.string(), url: v.string() }),
      }),
    ),
    fetchedAt: v.number(),
  }).index("by_query", ["query", "lang"]),

  kanbanColumns: defineTable({
    userId: v.id("users"),
    title: v.string(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  kanbanTasks: defineTable({
    userId: v.id("users"),
    columnId: v.id("kanbanColumns"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_columnId", ["columnId"]),

  waterLogs: defineTable({
    userId: v.id("users"),
    glasses: v.number(),
    date: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"]),

  recurringTransactions: defineTable({
    userId: v.id("users"),
    walletId: v.id("wallets"),
    type: v.union(v.literal("income"), v.literal("expense")),
    amount: v.number(),
    category: v.string(),
    description: v.string(),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("yearly"),
    ),
    nextDate: v.number(),
    lastProcessed: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_userId", ["userId"]),

  investments: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("stock"),
      v.literal("mutual_fund"),
      v.literal("fd"),
      v.literal("rd"),
      v.literal("bond"),
      v.literal("crypto"),
      v.literal("gold"),
      v.literal("real_estate"),
      v.literal("other"),
    ),
    amount: v.number(),
    currentValue: v.optional(v.number()),
    purchaseDate: v.number(),
    maturityDate: v.optional(v.number()),
    interestRate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  automationRules: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.string(),
    config: v.any(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(),
    goal: v.number(),
    unit: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_isActive", ["isActive"]),

  challengeParticipants: defineTable({
    challengeId: v.id("challenges"),
    userId: v.id("users"),
    progress: v.number(),
    joinedAt: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_challengeId", ["challengeId"])
    .index("by_userId", ["userId"]),

  userAchievements: defineTable({
    userId: v.id("users"),
    achievementId: v.string(),
    unlockedAt: v.number(),
  }).index("by_userId", ["userId"]),

  expenseGroups: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    currency: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  groupMembers: defineTable({
    groupId: v.id("expenseGroups"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_groupId", ["groupId"])
    .index("by_userId", ["userId"]),

  groupInvitations: defineTable({
    groupId: v.id("expenseGroups"),
    inviterId: v.id("users"),
    inviteeEmail: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
    ),
    createdAt: v.number(),
  })
    .index("by_groupId", ["groupId"])
    .index("by_inviteeEmail", ["inviteeEmail"]),

  groupExpenses: defineTable({
    groupId: v.id("expenseGroups"),
    paidBy: v.id("users"),
    amount: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
    splitAmong: v.array(v.id("users")),
    date: v.number(),
    createdAt: v.number(),
  }).index("by_groupId", ["groupId"]),

  groupBalances: defineTable({
    groupId: v.id("expenseGroups"),
    userId: v.id("users"),
    balance: v.number(),
    updatedAt: v.number(),
  })
    .index("by_groupId", ["groupId"])
    .index("by_userId", ["userId"]),

  partnerships: defineTable({
    userId: v.id("users"),
    partnerId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("declined"),
      v.literal("ended"),
    ),
    sharedHabits: v.array(v.id("habits")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_partnerId", ["partnerId"]),

  siteConfig: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  }).index("by_key", ["key"]),

  journalEntries: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    mood: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    weather: v.optional(v.string()),
    date: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"]),

  readingList: defineTable({
    userId: v.id("users"),
    title: v.string(),
    author: v.optional(v.string()),
    type: v.union(
      v.literal("book"),
      v.literal("article"),
      v.literal("podcast"),
      v.literal("video"),
    ),
    status: v.union(
      v.literal("want_to_read"),
      v.literal("reading"),
      v.literal("completed"),
    ),
    progress: v.number(),
    rating: v.optional(v.number()),
    notes: v.optional(v.string()),
    url: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    totalPages: v.optional(v.number()),
    currentPage: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  mealLogs: defineTable({
    userId: v.id("users"),
    mealType: v.union(
      v.literal("breakfast"),
      v.literal("lunch"),
      v.literal("dinner"),
      v.literal("snack"),
    ),
    name: v.string(),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    carbs: v.optional(v.number()),
    fat: v.optional(v.number()),
    notes: v.optional(v.string()),
    date: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.string(),
    isRead: v.boolean(),
    data: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_isRead", ["isRead"]),

  notificationPrefs: defineTable({
    userId: v.id("users"),
    habitReminders: v.boolean(),
    taskReminders: v.boolean(),
    budgetAlerts: v.boolean(),
    dailyDigest: v.boolean(),
    quietHoursStart: v.optional(v.string()),
    quietHoursEnd: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  streakFreezes: defineTable({
    userId: v.id("users"),
    habitId: v.id("habits"),
    date: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_habitId", ["habitId"]),

  dashboardWidgets: defineTable({
    userId: v.id("users"),
    widgets: v.array(
      v.object({
        id: v.string(),
        enabled: v.boolean(),
        order: v.number(),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  themeSchedule: defineTable({
    userId: v.id("users"),
    enabled: v.boolean(),
    lightStart: v.string(),
    darkStart: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  contacts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    relationship: v.string(),
    birthday: v.optional(v.number()),
    lastContacted: v.optional(v.number()),
    notes: v.optional(v.string()),
    strength: v.optional(
      v.union(
        v.literal("close"),
        v.literal("friend"),
        v.literal("acquaintance"),
        v.literal("distant"),
      ),
    ),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  savingsGoals: defineTable({
    userId: v.id("users"),
    name: v.string(),
    targetAmount: v.number(),
    currentAmount: v.number(),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    deadline: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("paused"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  studySessions: defineTable({
    userId: v.id("users"),
    subject: v.string(),
    duration: v.number(),
    notes: v.optional(v.string()),
    date: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"]),

  dailyCheckins: defineTable({
    userId: v.id("users"),
    date: v.number(),
    mood: v.string(),
    energy: v.number(),
    topGoal: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_date", ["date"]),

  payments: defineTable({
    userId: v.string(),
    amount: v.number(),
    currency: v.string(),
    method: v.string(),
    category: v.string(),
    status: v.string(),
    reference: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_method", ["method"]),

  paymentMethods: defineTable({
    userId: v.string(),
    type: v.string(),
    last4: v.optional(v.string()),
    brand: v.optional(v.string()),
    isDefault: v.boolean(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  subscriptions: defineTable({
    userId: v.string(),
    plan: v.string(),
    status: v.string(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    paymentMethod: v.optional(v.string()),
    autoRenew: v.boolean(),
  }).index("by_user", ["userId"]),

  apiConfig: defineTable({
    endpoint: v.string(),
    method: v.string(),
    enabled: v.boolean(),
    rateLimit: v.number(),
    timeout: v.number(),
    description: v.optional(v.string()),
    category: v.string(),
    updatedAt: v.number(),
  }).index("by_endpoint", ["endpoint"]),

  apiKeys: defineTable({
    key: v.string(),
    name: v.string(),
    permissions: v.array(v.string()),
    userId: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
    lastUsed: v.optional(v.number()),
    usageCount: v.number(),
  }).index("by_key", ["key"]),

  apiLogs: defineTable({
    endpoint: v.string(),
    method: v.string(),
    userId: v.optional(v.string()),
    status: v.number(),
    responseTime: v.number(),
    payloadSize: v.number(),
    timestamp: v.number(),
    error: v.optional(v.string()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_endpoint", ["endpoint"])
    .index("by_status", ["status"]),
});
