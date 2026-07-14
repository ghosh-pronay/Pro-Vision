import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { useState, useMemo } from "react"
import {
  Trophy,
  Clock,
  Award,
  Flame,
  CheckCircle,
  Plus,
  X,
  Share2,
  Zap,
  Copy,
} from "lucide-react"
import { toastSuccess } from "@/lib/toast-helpers"
import {
  CHALLENGE_TYPES,
  ActiveChallenges,
  AvailableChallenges,
  Leaderboard,
  Badges,
  History,
  CreateChallenge,
} from "@/components/social-challenges"

const DAY_MS = 24 * 60 * 60 * 1000
const NOW = Date.now()

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

interface Challenge {
  _id: string
  type: string
  name: string
  description: string
  goal: number
  unit: string
  duration: number
  startDate: number
  endDate: number
  progress: number
  streak: number
  joinedUsers: number
  createdBy: string
  isActive: boolean
  dailyLogs: boolean[]
}

interface LeaderboardEntry {
  rank: number
  name: string
  avatar: string
  streak: number
  completedChallenges: number
  points: number
  isCurrentUser: boolean
}

interface Badge {
  id: string
  nameEn: string
  nameBn: string
  descriptionEn: string
  descriptionBn: string
  icon: string
  color: string
  unlocked: boolean
  unlockedAt?: number
  progress?: number
  maxProgress?: number
}

const BADGES: Badge[] = [
  {
    id: "first_challenge",
    nameEn: "First Steps",
    nameBn: "প্রথম পদক্ষেপ",
    descriptionEn: "Join your first challenge",
    descriptionBn: "আপনার প্রথম চ্যালেঞ্জে যোগ দিন",
    icon: "🎯",
    color: "#3b82f6",
    unlocked: true,
    unlockedAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
  {
    id: "streak_7",
    nameEn: "7-Day Streak",
    nameBn: "৭ দিনের স্ট্রিক",
    descriptionEn: "Maintain a 7-day streak",
    descriptionBn: "৭ দিনের স্ট্রিক বজায় রাখুন",
    icon: "🔥",
    color: "#f59e0b",
    unlocked: true,
    unlockedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
  {
    id: "streak_30",
    nameEn: "30-Day Legend",
    nameBn: "৩০ দিনের কিংবদন্তী",
    descriptionEn: "Maintain a 30-day streak",
    descriptionBn: "৩০ দিনের স্ট্রিক বজায় রাখুন",
    icon: "⚡",
    color: "#8b5cf6",
    unlocked: false,
    progress: 15,
    maxProgress: 30,
  },
  {
    id: "challenge_5",
    nameEn: "Challenge Master",
    nameBn: "চ্যালেঞ্জ মাস্টার",
    descriptionEn: "Complete 5 challenges",
    descriptionBn: "৫টি চ্যালেঞ্জ সম্পন্ন করুন",
    icon: "🏆",
    color: "#22c55e",
    unlocked: true,
    unlockedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "challenge_10",
    nameEn: "Champion",
    nameBn: "চ্যাম্পিয়ন",
    descriptionEn: "Complete 10 challenges",
    descriptionBn: "১০টি চ্যালেঞ্জ সম্পন্ন করুন",
    icon: "👑",
    color: "#f59e0b",
    unlocked: false,
    progress: 7,
    maxProgress: 10,
  },
  {
    id: "invite_friend",
    nameEn: "Social Butterfly",
    nameBn: "সামাজিক প্রজাপতি",
    descriptionEn: "Invite 3 friends to challenges",
    descriptionBn: "৩ জন বন্ধুকে চ্যালেঞ্জে আমন্ত্রণ জানান",
    icon: "🦋",
    color: "#ec4899",
    unlocked: true,
    unlockedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    id: "leaderboard_top",
    nameEn: "Top Performer",
    nameBn: "শীর্ষ পারফরমার",
    descriptionEn: "Reach top 3 in leaderboard",
    descriptionBn: "লিডারবোর্ডে শীর্ষ ৩ তে পৌঁছান",
    icon: "🥇",
    color: "#f59e0b",
    unlocked: false,
    progress: 5,
    maxProgress: 3,
  },
  {
    id: "all_types",
    nameEn: "Versatile",
    nameBn: "বহুমুখী",
    descriptionEn: "Complete one of each challenge type",
    descriptionBn: "প্রতিটি চ্যালেঞ্জ ধরনে একটি সম্পন্ন করুন",
    icon: "🌈",
    color: "#06b6d4",
    unlocked: false,
    progress: 5,
    maxProgress: 8,
  },
]

export default function SocialChallenges() {
  const { lang } = useLang()
  const [activeTab, setActiveTab] = useState<
    "active" | "available" | "leaderboard" | "history" | "badges" | "create"
  >("active")
  const [filterType, setFilterType] = useState<string>("all")
  const [showCheckInModal, setShowCheckInModal] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [checkInValue, setCheckInValue] = useState("")
  const [checkInNote, setCheckInNote] = useState("")
  const [friendSearch, setFriendSearch] = useState("")

  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([
    {
      _id: "ac1",
      type: "water",
      name: lang === "bn" ? "পানির চ্যালেঞ্জ" : "Water Challenge",
      description:
        lang === "bn"
          ? "প্রতিদিন ৩ লিটার পানি পান করুন"
          : "Drink 3 liters of water daily",
      goal: 3,
      unit: "liters",
      duration: 30,
      startDate: NOW - 12 * DAY_MS,
      endDate: NOW + 18 * DAY_MS,
      progress: 40,
      streak: 12,
      joinedUsers: 24,
      createdBy: "you",
      isActive: true,
      dailyLogs: Array(12).fill(true),
    },
    {
      _id: "ac2",
      type: "fitness",
      name: lang === "bn" ? "ফিটনেস চ্যালেঞ্জ" : "Fitness Challenge",
      description:
        lang === "bn" ? "প্রতিদিন ১০০০০ পা হাঁটুন" : "Walk 10,000 steps daily",
      goal: 10000,
      unit: "steps",
      duration: 14,
      startDate: NOW - 5 * DAY_MS,
      endDate: NOW + 9 * DAY_MS,
      progress: 36,
      streak: 5,
      joinedUsers: 18,
      createdBy: "you",
      isActive: true,
      dailyLogs: Array(5).fill(true),
    },
    {
      _id: "ac3",
      type: "gratitude",
      name: lang === "bn" ? "কৃতজ্ঞতা চ্যালেঞ্জ" : "Gratitude Challenge",
      description:
        lang === "bn"
          ? "প্রতিদিন ৩টি কৃতজ্ঞতা লিখুন"
          : "Write 3 things you're grateful for daily",
      goal: 3,
      unit: "items",
      duration: 7,
      startDate: NOW - 3 * DAY_MS,
      endDate: NOW + 4 * DAY_MS,
      progress: 43,
      streak: 3,
      joinedUsers: 42,
      createdBy: "friend",
      isActive: true,
      dailyLogs: Array(3).fill(true),
    },
  ])

  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([
    {
      _id: "av1",
      type: "savings",
      name: lang === "bn" ? "সঞ্চয় চ্যালেঞ্জ" : "Savings Challenge",
      description:
        lang === "bn" ? "প্রতিদিন ১০০ টাকা সঞ্চয় করুন" : "Save 100 BDT daily",
      goal: 100,
      unit: "BDT",
      duration: 30,
      startDate: NOW,
      endDate: NOW + 30 * DAY_MS,
      progress: 0,
      streak: 0,
      joinedUsers: 156,
      createdBy: "system",
      isActive: true,
      dailyLogs: [],
    },
    {
      _id: "av2",
      type: "reading",
      name: lang === "bn" ? "পড়ার চ্যালেঞ্জ" : "Reading Challenge",
      description:
        lang === "bn" ? "প্রতিদিন ২০ পৃষ্ঠা পড়ুন" : "Read 20 pages daily",
      goal: 20,
      unit: "pages",
      duration: 14,
      startDate: NOW,
      endDate: NOW + 14 * DAY_MS,
      progress: 0,
      streak: 0,
      joinedUsers: 89,
      createdBy: "system",
      isActive: true,
      dailyLogs: [],
    },
    {
      _id: "av3",
      type: "no-sugar",
      name: lang === "bn" ? "চিনি ছাড়া চ্যালেঞ্জ" : "No Sugar Challenge",
      description:
        lang === "bn" ? "৭ দিন চিনি এড়িয়ে চলুন" : "Avoid sugar for 7 days",
      goal: 7,
      unit: "days",
      duration: 7,
      startDate: NOW,
      endDate: NOW + 7 * DAY_MS,
      progress: 0,
      streak: 0,
      joinedUsers: 67,
      createdBy: "system",
      isActive: true,
      dailyLogs: [],
    },
    {
      _id: "av4",
      type: "digital-detox",
      name: lang === "bn" ? "ডিজিটাল ডিটক্স" : "Digital Detox",
      description:
        lang === "bn"
          ? "দৈনিক স্ক্রিন সময় ২ ঘণ্টায় কমান"
          : "Reduce screen time to 2 hours daily",
      goal: 2,
      unit: "hours",
      duration: 14,
      startDate: NOW,
      endDate: NOW + 14 * DAY_MS,
      progress: 0,
      streak: 0,
      joinedUsers: 45,
      createdBy: "system",
      isActive: true,
      dailyLogs: [],
    },
    {
      _id: "av5",
      type: "kindness",
      name: lang === "bn" ? "দয়ার কাজ" : "Acts of Kindness",
      description:
        lang === "bn"
          ? "প্রতিদিন একটি দয়ার কাজ করুন"
          : "Perform one act of kindness daily",
      goal: 1,
      unit: "acts",
      duration: 30,
      startDate: NOW,
      endDate: NOW + 30 * DAY_MS,
      progress: 0,
      streak: 0,
      joinedUsers: 203,
      createdBy: "system",
      isActive: true,
      dailyLogs: [],
    },
  ])

  const [leaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      name: "রাহাত",
      avatar: "😊",
      streak: 28,
      completedChallenges: 12,
      points: 2450,
      isCurrentUser: false,
    },
    {
      rank: 2,
      name: "সাবরিনা",
      avatar: "🌟",
      streak: 22,
      completedChallenges: 10,
      points: 2100,
      isCurrentUser: false,
    },
    {
      rank: 3,
      name: lang === "bn" ? "আপনি" : "You",
      avatar: "🎯",
      streak: 15,
      completedChallenges: 7,
      points: 1850,
      isCurrentUser: true,
    },
    {
      rank: 4,
      name: "তানভীর",
      avatar: "🚀",
      streak: 12,
      completedChallenges: 6,
      points: 1600,
      isCurrentUser: false,
    },
    {
      rank: 5,
      name: "নাফিসা",
      avatar: "✨",
      streak: 10,
      completedChallenges: 5,
      points: 1350,
      isCurrentUser: false,
    },
    {
      rank: 6,
      name: "কামরুজ",
      avatar: "💫",
      streak: 8,
      completedChallenges: 4,
      points: 1100,
      isCurrentUser: false,
    },
    {
      rank: 7,
      name: "মাহমুদা",
      avatar: "🌸",
      streak: 6,
      completedChallenges: 3,
      points: 850,
      isCurrentUser: false,
    },
    {
      rank: 8,
      name: "রাশেদ",
      avatar: "⚡",
      streak: 4,
      completedChallenges: 2,
      points: 600,
      isCurrentUser: false,
    },
  ])

  const [badges] = useState<Badge[]>(BADGES)

  const [history] = useState<Challenge[]>([
    {
      _id: "h1",
      type: "fitness",
      name: lang === "bn" ? "ফিটনেস চ্যালেঞ্জ" : "Fitness Challenge",
      description:
        lang === "bn" ? "প্রতিদিন ৫০০০ পা হাঁটুন" : "Walk 5,000 steps daily",
      goal: 5000,
      unit: "steps",
      duration: 7,
      startDate: NOW - 21 * DAY_MS,
      endDate: NOW - 14 * DAY_MS,
      progress: 100,
      streak: 7,
      joinedUsers: 34,
      createdBy: "you",
      isActive: false,
      dailyLogs: Array(7).fill(true),
    },
    {
      _id: "h2",
      type: "gratitude",
      name: lang === "bn" ? "কৃতজ্ঞতা চ্যালেঞ্জ" : "Gratitude Challenge",
      description:
        lang === "bn"
          ? "প্রতিদিন ৩টি কৃতজ্ঞতা লিখুন"
          : "Write 3 things you're grateful for daily",
      goal: 3,
      unit: "items",
      duration: 14,
      startDate: NOW - 30 * DAY_MS,
      endDate: NOW - 16 * DAY_MS,
      progress: 100,
      streak: 14,
      joinedUsers: 56,
      createdBy: "friend",
      isActive: false,
      dailyLogs: Array(14).fill(true),
    },
    {
      _id: "h3",
      type: "water",
      name: lang === "bn" ? "পানির চ্যালেঞ্জ" : "Water Challenge",
      description:
        lang === "bn"
          ? "প্রতিদিন ২ লিটার পানি পান করুন"
          : "Drink 2 liters of water daily",
      goal: 2,
      unit: "liters",
      duration: 30,
      startDate: NOW - 60 * DAY_MS,
      endDate: NOW - 30 * DAY_MS,
      progress: 100,
      streak: 30,
      joinedUsers: 78,
      createdBy: "you",
      isActive: false,
      dailyLogs: Array(30).fill(true),
    },
  ])

  const [customChallenge, setCustomChallenge] = useState({
    name: "",
    description: "",
    type: "savings",
    goal: "",
    unit: "times",
    duration: 7,
    inviteFriends: [] as string[],
  })

  const friendsList = useMemo(
    () => [
      { id: "f1", name: "রাহাত", avatar: "😊" },
      { id: "f2", name: "সাবরিনা", avatar: "🌟" },
      { id: "f3", name: "তানভীর", avatar: "🚀" },
      { id: "f4", name: "নাফিসা", avatar: "✨" },
      { id: "f5", name: "কামরুজ", avatar: "💫" },
      { id: "f6", name: "মাহমুদা", avatar: "🌸" },
    ],
    [],
  )

  const filteredAvailable = useMemo(() => {
    if (filterType === "all") return availableChallenges
    return availableChallenges.filter((c) => c.type === filterType)
  }, [availableChallenges, filterType])

  const stats = useMemo(
    () => ({
      activeCount: activeChallenges.length,
      completedCount: history.length,
      totalStreak: activeChallenges.reduce(
        (max, c) => Math.max(max, c.streak),
        0,
      ),
      badgesEarned: badges.filter((b) => b.unlocked).length,
    }),
    [activeChallenges, history, badges],
  )

  const getChallengeTypeInfo = (typeId: string) =>
    CHALLENGE_TYPES.find((t) => t.id === typeId) || CHALLENGE_TYPES[0]

  const handleJoinChallenge = (challengeId: string) => {
    const challenge = availableChallenges.find((c) => c._id === challengeId)
    if (!challenge) return
    const joined: Challenge = {
      ...challenge,
      startDate: Date.now(),
      endDate: Date.now() + challenge.duration * DAY_MS,
      progress: 0,
      streak: 0,
      dailyLogs: [],
      isActive: true,
    }
    setActiveChallenges((prev) => [...prev, joined])
    setAvailableChallenges((prev) => prev.filter((c) => c._id !== challengeId))
    toastSuccess(
      lang === "bn" ? "চ্যালেঞ্জে যোগ দেওয়া হয়েছে!" : "Challenge joined!",
    )
  }

  const handleCheckIn = (challengeId: string) => {
    setActiveChallenges((prev) =>
      prev.map((c) => {
        if (c._id === challengeId) {
          const newProgress = Math.min(100, c.progress + 100 / c.duration)
          return {
            ...c,
            progress: Math.round(newProgress),
            streak: c.streak + 1,
            dailyLogs: [...c.dailyLogs, true],
          }
        }
        return c
      }),
    )
    setShowCheckInModal(null)
    setCheckInValue("")
    setCheckInNote("")
    toastSuccess(lang === "bn" ? "চেক-ইন সফল হয়েছে!" : "Check-in successful!")
  }

  const handleCreateChallenge = () => {
    if (!customChallenge.name || !customChallenge.goal) return
    const newChallenge: Challenge = {
      _id: Date.now().toString(),
      type: customChallenge.type,
      name: customChallenge.name,
      description: customChallenge.description,
      goal: parseFloat(customChallenge.goal),
      unit: customChallenge.unit,
      duration: customChallenge.duration,
      startDate: Date.now(),
      endDate: Date.now() + customChallenge.duration * 24 * 60 * 60 * 1000,
      progress: 0,
      streak: 0,
      joinedUsers: 1 + customChallenge.inviteFriends.length,
      createdBy: "you",
      isActive: true,
      dailyLogs: [],
    }
    setActiveChallenges((prev) => [...prev, newChallenge])
    setCustomChallenge({
      name: "",
      description: "",
      type: "savings",
      goal: "",
      unit: "times",
      duration: 7,
      inviteFriends: [],
    })
    setActiveTab("active")
    toastSuccess(
      lang === "bn"
        ? "কাস্টম চ্যালেঞ্জ তৈরি হয়েছে!"
        : "Custom challenge created!",
    )
  }

  const handleShareProgress = (challenge?: Challenge) => {
    const shareText = challenge
      ? `${challenge.name}: ${challenge.progress}% ${lang === "bn" ? "সম্পন্ন" : "completed"}! 🔥`
      : `${lang === "bn" ? "আমি Pro-Vision চ্যালেঞ্জে অংশ নিচ্ছি!" : "I'm taking on Pro-Vision challenges!"}`
    navigator.clipboard.writeText(shareText)
    setShowShareModal(false)
    toastSuccess(lang === "bn" ? "কপি হয়েছে!" : "Copied to clipboard!")
  }

  const toggleFriendInvite = (friendId: string) => {
    setCustomChallenge((prev) => ({
      ...prev,
      inviteFriends: prev.inviteFriends.includes(friendId)
        ? prev.inviteFriends.filter((id) => id !== friendId)
        : [...prev.inviteFriends, friendId],
    }))
  }

  const tabs = [
    {
      id: "active" as const,
      labelEn: "Active",
      labelBn: "সক্রিয়",
      icon: Flame,
    },
    {
      id: "available" as const,
      labelEn: "Available",
      labelBn: "উপলব্ধ",
      icon: Plus,
    },
    {
      id: "leaderboard" as const,
      labelEn: "Leaderboard",
      labelBn: "লিডারবোর্ড",
      icon: Trophy,
    },
    {
      id: "history" as const,
      labelEn: "History",
      labelBn: "ইতিহাস",
      icon: Clock,
    },
    { id: "badges" as const, labelEn: "Badges", labelBn: "ব্যাজ", icon: Award },
    { id: "create" as const, labelEn: "Create", labelBn: "তৈরি", icon: Plus },
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {lang === "bn" ? "সামাজিক চ্যালেঞ্জ" : "Social Challenges"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lang === "bn"
                ? "বন্ধুদের সাথে চ্যালেঞ্জ করুন"
                : "Challenge with friends"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-foreground/10 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {lang === "bn" ? "শেয়ার" : "Share"}
        </button>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          {
            labelEn: "Active",
            labelBn: "সক্রিয়",
            value: stats.activeCount,
            icon: Flame,
            color: "text-orange-500",
          },
          {
            labelEn: "Completed",
            labelBn: "সম্পন্ন",
            value: stats.completedCount,
            icon: CheckCircle,
            color: "text-green-500",
          },
          {
            labelEn: "Best Streak",
            labelBn: "সেরা স্ট্রিক",
            value: `${stats.totalStreak}d`,
            icon: Zap,
            color: "text-yellow-500",
          },
          {
            labelEn: "Badges",
            labelBn: "ব্যাজ",
            value: stats.badgesEarned,
            icon: Award,
            color: "text-purple-500",
          },
        ].map((stat) => (
          <div key={stat.labelEn} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">
                {lang === "bn" ? stat.labelBn : stat.labelEn}
              </span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "glass bg-primary/20 text-primary" : "glass text-muted-foreground hover:bg-foreground/5"}`}
          >
            <tab.icon className="w-4 h-4" />
            {lang === "bn" ? tab.labelBn : tab.labelEn}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ActiveChallenges
              challenges={activeChallenges}
              getChallengeTypeInfo={getChallengeTypeInfo}
              onCheckIn={(id) => setShowCheckInModal(id)}
              onShare={() => setShowShareModal(true)}
            />
          </motion.div>
        )}
        {activeTab === "available" && (
          <motion.div
            key="available"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AvailableChallenges
              challenges={filteredAvailable}
              filterType={filterType}
              onFilterChange={setFilterType}
              onJoin={handleJoinChallenge}
              getChallengeTypeInfo={getChallengeTypeInfo}
            />
          </motion.div>
        )}
        {activeTab === "leaderboard" && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Leaderboard entries={leaderboard} />
          </motion.div>
        )}
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <History
              history={history}
              getChallengeTypeInfo={getChallengeTypeInfo}
            />
          </motion.div>
        )}
        {activeTab === "badges" && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Badges badges={badges} />
          </motion.div>
        )}
        {activeTab === "create" && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CreateChallenge
              customChallenge={customChallenge}
              onCustomChallengeChange={(u) =>
                setCustomChallenge((p) => ({ ...p, ...u }))
              }
              friendSearch={friendSearch}
              onFriendSearchChange={setFriendSearch}
              friendsList={friendsList}
              onCreate={handleCreateChallenge}
              onToggleFriend={toggleFriendInvite}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckInModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowCheckInModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {lang === "bn" ? "আজকের চেক-ইন" : "Daily Check-in"}
                </h3>
                <button
                  onClick={() => setShowCheckInModal(null)}
                  className="glass p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm text-muted-foreground">
                    {lang === "bn"
                      ? "আজকের অগ্রগতি রেকর্ড করুন"
                      : "Record today's progress"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "bn" ? "মান" : "Value"}
                  </label>
                  <input
                    type="number"
                    value={checkInValue}
                    onChange={(e) => setCheckInValue(e.target.value)}
                    placeholder={lang === "bn" ? "আজকের মান" : "Today's value"}
                    className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === "bn" ? "নোট (ঐচ্ছিক)" : "Note (optional)"}
                  </label>
                  <textarea
                    value={checkInNote}
                    onChange={(e) => setCheckInNote(e.target.value)}
                    placeholder={
                      lang === "bn" ? "আজকের অনুভূতি..." : "How did it go..."
                    }
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCheckInModal(null)}
                    className="flex-1 py-2.5 rounded-xl glass text-sm font-medium hover:bg-foreground/5 transition-colors"
                  >
                    {lang === "bn" ? "বাতিল" : "Cancel"}
                  </button>
                  <button
                    onClick={() => handleCheckIn(showCheckInModal)}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
                  >
                    {lang === "bn" ? "চেক-ইন করুন" : "Check In"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowInviteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {lang === "bn" ? "বন্ধুদের আমন্ত্রণ জানান" : "Invite Friends"}
                </h3>
                <button
                  onClick={() => setShowInviteModal(null)}
                  className="glass p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-3 glass-subtle rounded-xl"
                  >
                    <span className="text-xl">{friend.avatar}</span>
                    <span className="flex-1 text-sm font-medium">
                      {friend.name}
                    </span>
                    <button
                      onClick={() => {
                        toastSuccess(
                          lang === "bn"
                            ? `${friend.name}-কে আমন্ত্রণ পাঠানো হয়েছে`
                            : `Invitation sent to ${friend.name}`,
                        )
                        setShowInviteModal(null)
                      }}
                      className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
                    >
                      {lang === "bn" ? "আমন্ত্রণ" : "Invite"}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {lang === "bn" ? "অগ্রগতি শেয়ার করুন" : "Share Progress"}
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="glass p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleShareProgress()}
                  className="w-full flex items-center gap-3 p-3 glass-subtle rounded-xl hover:bg-foreground/5 transition-colors"
                >
                  <Copy className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <div className="text-sm font-medium">
                      {lang === "bn" ? "ক্লিপবোর্ডে কপি" : "Copy to Clipboard"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lang === "bn" ? "পাঠ্য কপি করুন" : "Copy text"}
                    </div>
                  </div>
                </button>
                {activeChallenges.slice(0, 2).map((challenge) => (
                  <button
                    key={challenge._id}
                    onClick={() => handleShareProgress(challenge)}
                    className="w-full flex items-center gap-3 p-3 glass-subtle rounded-xl hover:bg-foreground/5 transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-green-500" />
                    <div className="text-left">
                      <div className="text-sm font-medium">
                        {challenge.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {challenge.progress}%{" "}
                        {lang === "bn" ? "সম্পন্ন" : "completed"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
