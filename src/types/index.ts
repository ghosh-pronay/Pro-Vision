export interface StoredRecord {
  _id: string
  createdAt?: number
  updatedAt?: number
}

export type UserRole = "user" | "admin"
export type Language = "en" | "bn"
export type Theme = "light" | "dark" | "oled" | "system"
export type Priority = "low" | "medium" | "high"
export type Frequency = "daily" | "weekly" | "monthly" | "yearly"

export interface User extends StoredRecord {
  name?: string
  email?: string
  tokenIdentifier: string
  image?: string
  role?: UserRole
  isPremium?: boolean
  premiumExpiresAt?: number
}

export interface AvatarConfig {
  skin: string
  hair: string
  outfit: string
  accessories: string[]
  background: string
}

export interface UserProfile extends StoredRecord {
  userId: string
  displayName?: string
  email?: string
  avatar?: string
  avatarConfig?: AvatarConfig
  phone?: string
  dateOfBirth?: number
  gender?: "male" | "female" | "other"
  currency?: string
  language?: Language
  theme?: Theme
  notificationsEnabled?: boolean
  weeklyEmailReport?: boolean
  timezone?: string
  onboarded?: boolean
}

export interface Task extends StoredRecord {
  userId: string
  title: string
  description?: string
  completed: boolean
  priority?: Priority
  dueDate?: number
  listId?: string
  tags?: string[]
  createdAt: number
  updatedAt: number
}

export interface HabitCheckInNote {
  date: number
  note: string
}

export interface Habit extends StoredRecord {
  userId: string
  name: string
  description?: string
  frequency: "daily" | "weekly"
  targetDays?: number[]
  completedDates: number[]
  color?: string
  icon?: string
  category?: string
  archived?: boolean
  reminderTime?: string
  checkInNotes?: HabitCheckInNote[]
  streakFreezes?: number
  maxStreakFreezes?: number
  createdAt: number
  updatedAt: number
}

export type WalletType = "cash" | "bank" | "credit" | "savings" | "digital"

export interface Wallet extends StoredRecord {
  userId: string
  name: string
  type: WalletType
  currency: string
  balance: number
  icon?: string
  color?: string
  isDefault?: boolean
}

export type TransactionType =
  | "income"
  | "expense"
  | "receivable"
  | "payable"
  | "loanTaken"
  | "loanGiven"

export interface Transaction extends StoredRecord {
  userId: string
  walletId: string
  type: TransactionType
  amount: number
  category: string
  description?: string
  date: number
  toWalletId?: string
  receiptUrl?: string
  tags?: string[]
  notes?: string
  createdAt: number
  updatedAt: number
}

export type BudgetPeriod = "weekly" | "monthly" | "yearly"

export interface Budget extends StoredRecord {
  userId: string
  categoryId: string
  amount: number
  spent: number
  period: BudgetPeriod
  startDate: number
  endDate: number
  isActive: boolean
}

export type PayableStatus = "pending" | "partial" | "completed"

export interface Receivable extends StoredRecord {
  userId: string
  fromPerson: string
  amount: number
  description?: string
  dueDate: number
  status: PayableStatus
  receivedAmount: number
}

export interface Payable extends StoredRecord {
  userId: string
  toPerson: string
  amount: number
  description?: string
  dueDate: number
  status: PayableStatus
  paidAmount: number
}

export type LoanType = "given" | "taken"
export type LoanStatus = "active" | "completed" | "overdue"

export interface Loan extends StoredRecord {
  userId: string
  type: LoanType
  personName: string
  amount: number
  paidAmount: number
  interestRate?: number
  startDate: number
  dueDate?: number
  status: LoanStatus
  notes?: string
}

export type GoalStatus = "active" | "completed" | "paused"

export interface Milestone {
  title: string
  completed: boolean
}

export interface Goal extends StoredRecord {
  userId: string
  title: string
  description?: string
  category: string
  deadline: number
  progress: number
  status: GoalStatus
  milestones: Milestone[]
}

export type FocusType = "pomodoro" | "shortBreak" | "longBreak" | "custom"

export interface FocusSession extends StoredRecord {
  userId: string
  duration: number
  completedAt: number
  type: FocusType
  tags?: string[]
  createdAt: number
}

export type MoodType = "great" | "good" | "okay" | "bad" | "terrible"

export interface Mood extends StoredRecord {
  userId: string
  mood: MoodType
  value: number
  note?: string
  date: number
  createdAt: number
}

export type SleepQuality = "great" | "good" | "okay" | "bad"

export interface SleepLog extends StoredRecord {
  userId: string
  hours: number
  quality: SleepQuality
  bedTime: string
  wakeTime: string
  date: number
  notes?: string
  createdAt: number
}

export interface GratitudeEntry extends StoredRecord {
  userId: string
  content: string
  mood?: string
  date: number
}

export interface ExerciseLog extends StoredRecord {
  userId: string
  type: string
  duration: number
  calories?: number
  distance?: number
  notes?: string
  date: number
}

export interface CoachMemory extends StoredRecord {
  userId: string
  key: string
  value: string
  tags: string[]
}

export interface NewsArticle {
  title: string
  description?: string
  url: string
  image?: string
  publishedAt: string
  source: { name: string; url: string }
}

export interface NewsCache extends StoredRecord {
  query: string
  lang: string
  articles: NewsArticle[]
  fetchedAt: number
}

export interface KanbanColumn extends StoredRecord {
  userId: string
  title: string
  order: number
}

export interface KanbanTask extends StoredRecord {
  userId: string
  columnId: string
  title: string
  description?: string
  priority: Priority
  dueDate?: number
  tags?: string[]
  order: number
}

export interface WaterLog extends StoredRecord {
  userId: string
  glasses: number
  date: number
}

export interface RecurringTransaction extends StoredRecord {
  userId: string
  walletId: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  frequency: Frequency
  nextDate: number
  lastProcessed?: number
  isActive: boolean
}

export type InvestmentType =
  | "stock"
  | "mutual_fund"
  | "fd"
  | "rd"
  | "bond"
  | "crypto"
  | "gold"
  | "real_estate"
  | "other"

export interface Investment extends StoredRecord {
  userId: string
  name: string
  type: InvestmentType
  amount: number
  currentValue?: number
  purchaseDate: number
  maturityDate?: number
  interestRate?: number
  notes?: string
}

export interface AutomationRule extends StoredRecord {
  userId: string
  name: string
  type: string
  config: {
    triggerType?: string
    conditions?: Record<string, unknown>
    actions?: Record<string, unknown>
  }
  isActive: boolean
}

export interface Challenge extends StoredRecord {
  title: string
  description: string
  type: string
  goal: number
  unit: string
  startDate: number
  endDate: number
  createdBy: string
  isActive: boolean
}

export interface ChallengeParticipant extends StoredRecord {
  challengeId: string
  userId: string
  progress: number
  joinedAt: number
  lastUpdated: number
}

export interface UserAchievement extends StoredRecord {
  userId: string
  achievementId: string
  unlockedAt: number
}

export interface ExpenseGroup extends StoredRecord {
  userId: string
  name: string
  description?: string
  currency: string
}

export type GroupMemberRole = "admin" | "member"

export interface GroupMember extends StoredRecord {
  groupId: string
  userId: string
  role: GroupMemberRole
  joinedAt: number
}

export type InvitationStatus = "pending" | "accepted" | "declined"

export interface GroupInvitation extends StoredRecord {
  groupId: string
  inviterId: string
  inviteeEmail: string
  status: InvitationStatus
  createdAt: number
}

export interface GroupExpense extends StoredRecord {
  groupId: string
  paidBy: string
  amount: number
  description: string
  category?: string
  splitAmong: string[]
  date: number
}

export interface GroupBalance extends StoredRecord {
  groupId: string
  userId: string
  balance: number
  updatedAt: number
}

export type PartnershipStatus = "pending" | "active" | "declined" | "ended"

export interface Partnership extends StoredRecord {
  userId: string
  partnerId: string
  status: PartnershipStatus
  sharedHabits: string[]
}

export interface JournalEntry extends StoredRecord {
  userId: string
  title: string
  content: string
  mood?: string
  tags?: string[]
  weather?: string
  date: number
}

export type ReadingType = "book" | "article" | "podcast" | "video"
export type ReadingStatus = "want_to_read" | "reading" | "completed"

export interface ReadingItem extends StoredRecord {
  userId: string
  title: string
  author?: string
  type: ReadingType
  status: ReadingStatus
  progress: number
  rating?: number
  notes?: string
  url?: string
  coverUrl?: string
  totalPages?: number
  currentPage?: number
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export interface MealLog extends StoredRecord {
  userId: string
  mealType: MealType
  name: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  notes?: string
  date: number
}

export interface Notification extends StoredRecord {
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  data?: {
    taskId?: string
    habitId?: string
    link?: string
  }
}

export interface NotificationPrefs extends StoredRecord {
  userId: string
  habitReminders: boolean
  taskReminders: boolean
  budgetAlerts: boolean
  dailyDigest: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
}

export interface StreakFreeze extends StoredRecord {
  userId: string
  habitId: string
  date: number
}

export interface DashboardWidget {
  id: string
  enabled: boolean
  order: number
}

export interface DashboardWidgets extends StoredRecord {
  userId: string
  widgets: DashboardWidget[]
}

export interface ThemeSchedule extends StoredRecord {
  userId: string
  enabled: boolean
  lightStart: string
  darkStart: string
}

export type ContactStrength = "close" | "friend" | "acquaintance" | "distant"

export interface Contact extends StoredRecord {
  userId: string
  name: string
  phone?: string
  email?: string
  relationship: string
  birthday?: number
  lastContacted?: number
  notes?: string
  strength?: ContactStrength
  tags?: string[]
}

export interface SavingsGoal extends StoredRecord {
  userId: string
  name: string
  targetAmount: number
  currentAmount: number
  icon?: string
  color?: string
  deadline?: number
  status: GoalStatus
}

export interface StudySession extends StoredRecord {
  userId: string
  subject: string
  duration: number
  notes?: string
  date: number
}

export interface DailyCheckin extends StoredRecord {
  userId: string
  date: number
  mood: string
  energy: number
  topGoal?: string
  notes?: string
}

export interface Payment extends StoredRecord {
  userId: string
  amount: number
  currency: string
  method: string
  category: string
  status: string
  reference?: string
  metadata?: {
    method?: string
    reference?: string
  }
}

export interface Subscription extends StoredRecord {
  userId: string
  plan: string
  status: string
  startDate: number
  endDate?: number
  paymentMethod?: string
  autoRenew: boolean
}

export interface ApiConfig extends StoredRecord {
  endpoint: string
  method: string
  enabled: boolean
  rateLimit: number
  timeout: number
  description?: string
  category: string
}

export interface ApiKey extends StoredRecord {
  key: string
  name: string
  permissions: string[]
  userId?: string
  active: boolean
  lastUsed?: number
  usageCount: number
}

export interface ApiLog extends StoredRecord {
  endpoint: string
  method: string
  userId?: string
  status: number
  responseTime: number
  payloadSize: number
  timestamp: number
  error?: string
}

export interface SiteConfig extends StoredRecord {
  key: string
  value: unknown
  updatedBy?: string
}

export type CheckinMood = "great" | "good" | "neutral" | "bad" | "terrible"

export interface DailyCheckinEntry {
  _id: string
  date: number
  mood: CheckinMood
  energy: number
  topGoal?: string
  notes?: string
}

export interface GratitudeJarEntry {
  _id: string
  content: string
  mood: string
  date: number
}
