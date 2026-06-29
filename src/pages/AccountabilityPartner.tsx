import { motion } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { useState, useMemo } from "react"
import {
  Users,
  UserPlus,
  CheckCircle,
  Target,
  MessageCircle,
  Trophy,
  Clock,
  Flame,
  Send,
  X,
  Star,
  Zap,
  TrendingUp,
  Bell,
  Handshake,
} from "lucide-react"

interface Partner {
  _id: string
  name: string
  avatar: string
  sharedHabits: string[]
  streak: number
  completionRate: number
  lastActive: number
  xp: number
}

interface PartnerRequest {
  _id: string
  name: string
  avatar: string
  message: string
  mutualFriends: number
  createdAt: number
}

interface SharedChallenge {
  _id: string
  title: string
  goal: number
  unit: string
  partnerProgress: number
  myProgress: number
  endDate: number
}

interface Message {
  _id: string
  fromMe: boolean
  content: string
  timestamp: number
  type: "nudge" | "celebrate" | "message"
}

interface ActivityFeed {
  _id: string
  partnerName: string
  action: string
  details: string
  timestamp: number
  icon: string
}

const NOW = Date.now()

const weeklyGrowthValues: Record<string, number> = {
  "1": 9,
  "2": 17,
  "3": 12,
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function AccountabilityPartner() {
  const { lang } = useLang()
  const [activeTab, setActiveTab] = useState<
    "partners" | "requests" | "shared" | "messages" | "feed"
  >("partners")
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")

  const [partners, setPartners] = useState<Partner[]>([
    {
      _id: "1",
      name: "Anika Rahman",
      avatar: "AR",
      sharedHabits: [
        lang === "bn" ? "ভোরে ঘুম থেকে ওঠা" : "Wake up early",
        lang === "bn" ? "দৈনিক ব্যায়াম" : "Daily workout",
        lang === "bn" ? "পড়াশোনা" : "Study",
      ],
      streak: 14,
      completionRate: 87,
      lastActive: NOW - 30 * 60 * 1000,
      xp: 2450,
    },
    {
      _id: "2",
      name: "Rahul Ahmed",
      avatar: "RA",
      sharedHabits: [
        lang === "bn" ? "পানি পান করা" : "Drink water",
        lang === "bn" ? "মেডিটেশন" : "Meditation",
        lang === "bn" ? "রান্না শেখা" : "Learn cooking",
      ],
      streak: 7,
      completionRate: 72,
      lastActive: NOW - 2 * 60 * 60 * 1000,
      xp: 1820,
    },
    {
      _id: "3",
      name: "Sara Kabir",
      avatar: "SK",
      sharedHabits: [
        lang === "bn" ? "সকালের রুটিন" : "Morning routine",
        lang === "bn" ? "হাঁটা" : "Walking",
        lang === "bn" ? "স্কিল ডেভেলপমেন্ট" : "Skill development",
      ],
      streak: 21,
      completionRate: 92,
      lastActive: NOW - 45 * 60 * 1000,
      xp: 3100,
    },
  ])

  const [requests, setRequests] = useState<PartnerRequest[]>([
    {
      _id: "1",
      name: "Kabir Hassan",
      avatar: "KH",
      message:
        lang === "bn"
          ? "আমি আপনার সাথে অ্যাকাউন্টেবিলিটি পার্টনার হতে চাই!"
          : "I'd love to be your accountability partner!",
      mutualFriends: 3,
      createdAt: NOW - 1 * 24 * 60 * 60 * 1000,
    },
    {
      _id: "2",
      name: "Nadia Rahman",
      avatar: "NR",
      message:
        lang === "bn"
          ? "আমরা একসাথে লক্ষ্য অর্জন করতে পারি"
          : "We can achieve goals together",
      mutualFriends: 5,
      createdAt: NOW - 2 * 24 * 60 * 60 * 1000,
    },
  ])

  const [sharedChallenges] = useState<SharedChallenge[]>([
    {
      _id: "1",
      title:
        lang === "bn"
          ? "৩০ দিনের ফিটনেস চ্যালেঞ্জ"
          : "30-Day Fitness Challenge",
      goal: 30,
      unit: lang === "bn" ? "দিন" : "days",
      partnerProgress: 18,
      myProgress: 15,
      endDate: NOW + 15 * 24 * 60 * 60 * 1000,
    },
    {
      _id: "2",
      title: lang === "bn" ? "পড়াশোনার ম্যারাথন" : "Reading Marathon",
      goal: 12,
      unit: lang === "bn" ? "বই" : "books",
      partnerProgress: 8,
      myProgress: 6,
      endDate: NOW + 30 * 24 * 60 * 60 * 1000,
    },
  ])

  const [messages, setMessages] = useState<Message[]>([
    {
      _id: "1",
      fromMe: true,
      content:
        lang === "bn" ? "আজ তুমি খুব ভালো করেছ!" : "You did amazing today!",
      timestamp: NOW - 60 * 60 * 1000,
      type: "celebrate",
    },
    {
      _id: "2",
      fromMe: false,
      content: lang === "bn" ? "ধন্যবাদ! তুমিও খুব ভালো!" : "Thanks! You too!",
      timestamp: NOW - 55 * 60 * 1000,
      type: "message",
    },
    {
      _id: "3",
      fromMe: true,
      content:
        lang === "bn" ? "আজ যোগব্যায়াম করেছ?" : "Did you work out today?",
      timestamp: NOW - 30 * 60 * 1000,
      type: "nudge",
    },
  ])

  const [activityFeed] = useState<ActivityFeed[]>([
    {
      _id: "1",
      partnerName: "Anika Rahman",
      action:
        lang === "bn"
          ? "সকালের রুটিন সম্পন্ন করেছে"
          : "Completed morning routine",
      details: lang === "bn" ? "৫টি অভ্যাস সম্পন্ন" : "5 habits completed",
      timestamp: NOW - 1 * 60 * 60 * 1000,
      icon: "check",
    },
    {
      _id: "2",
      partnerName: "Rahul Ahmed",
      action:
        lang === "bn" ? "৭ দিনের স্ট্রিক অর্জন করেছে" : "Achieved 7-day streak",
      details: lang === "bn" ? "ধারাবাহিকতা বজায় রেখেছে" : "Stayed consistent",
      timestamp: NOW - 3 * 60 * 60 * 1000,
      icon: "streak",
    },
    {
      _id: "3",
      partnerName: "Sara Kabir",
      action: lang === "bn" ? "নতুন লক্ষ্য সেট করেছে" : "Set a new goal",
      details:
        lang === "bn" ? "১০০টি পুশআপ চ্যালেঞ্জ" : "100 push-ups challenge",
      timestamp: NOW - 5 * 60 * 60 * 1000,
      icon: "target",
    },
    {
      _id: "4",
      partnerName: "Anika Rahman",
      action: lang === "bn" ? "ব্যাজ অর্জন করেছে" : "Earned a badge",
      details: lang === "bn" ? "ফিটনেস মাস্টার" : "Fitness Master",
      timestamp: NOW - 8 * 60 * 60 * 1000,
      icon: "trophy",
    },
  ])

  const partnersWithStats = useMemo(() => {
    return partners.map((p) => ({
      ...p,
      level: Math.floor(p.xp / 500) + 1,
      weeklyGrowth: weeklyGrowthValues[p._id] ?? 10,
    }))
  }, [partners])

  const handleAcceptRequest = (requestId: string) => {
    const request = requests.find((r) => r._id === requestId)
    if (request) {
      const newPartner: Partner = {
        _id: request._id,
        name: request.name,
        avatar: request.avatar,
        sharedHabits: [],
        streak: 0,
        completionRate: 0,
        // eslint-disable-next-line react-hooks/purity
        lastActive: Date.now(),
        xp: 0,
      }
      setPartners([...partners, newPartner])
      setRequests(requests.filter((r) => r._id !== requestId))
    }
  }

  const handleDeclineRequest = (requestId: string) => {
    setRequests(requests.filter((r) => r._id !== requestId))
  }

  const handleSendMessage = () => {
    if (!messageInput.trim()) return
    const newMessage: Message = {
      _id: Date.now().toString(),
      fromMe: true,
      content: messageInput,
      timestamp: Date.now(),
      type: "message",
    }
    setMessages([...messages, newMessage])
    setMessageInput("")
  }

  const handleSendNudge = (partnerId: string) => {
    const partner = partners.find((p) => p._id === partnerId)
    if (partner) {
      const newMessage: Message = {
        // eslint-disable-next-line react-hooks/purity
        _id: Date.now().toString(),
        fromMe: true,
        content:
          lang === "bn"
            ? `${partner.name}, আজ তোমার অভ্যাসগুলো মনে করো!`
            : `${partner.name}, remember your habits today!`,
        // eslint-disable-next-line react-hooks/purity
        timestamp: Date.now(),
        type: "nudge",
      }
      setMessages([...messages, newMessage])
    }
  }

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    setShowInviteModal(false)
    setInviteEmail("")
    setInviteMessage("")
  }

  const getTimeAgo = (timestamp: number) => {
    // eslint-disable-next-line react-hooks/purity
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return lang === "bn" ? `${minutes} মিনিট আগে` : `${minutes}m ago`
    }
    if (hours < 24) {
      return lang === "bn" ? `${hours} ঘণ্টা আগে` : `${hours}h ago`
    }
    return lang === "bn" ? `${days} দিন আগে` : `${days}d ago`
  }

  const getActivityIcon = (icon: string) => {
    switch (icon) {
      case "check":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "streak":
        return <Flame className="h-5 w-5 text-orange-500" />
      case "target":
        return <Target className="h-5 w-5 text-blue-500" />
      case "trophy":
        return <Trophy className="h-5 w-5 text-yellow-500" />
      default:
        return <Star className="h-5 w-5 text-purple-500" />
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {lang === "bn" ? "জবাবদিহিতা পার্টনার" : "Accountability Partners"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "bn"
              ? "একসাথে লক্ষ্য অর্জন করুন"
              : "Achieve goals together"}
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="cursor-pointer flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          {lang === "bn" ? "পার্টনার আমন্ত্রণ" : "Invite Partner"}
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={fadeUp}
        className="flex gap-1 rounded-xl bg-foreground/5 p-1 overflow-x-auto"
      >
        {(["partners", "requests", "shared", "messages", "feed"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer flex-1 min-w-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "partners"
                ? lang === "bn"
                  ? "পার্টনার"
                  : "Partners"
                : tab === "requests"
                  ? lang === "bn"
                    ? "অনুরোধ"
                    : "Requests"
                  : tab === "shared"
                    ? lang === "bn"
                      ? "শেয়ার্ড"
                      : "Shared"
                    : tab === "messages"
                      ? lang === "bn"
                        ? "বার্তা"
                        : "Messages"
                      : lang === "bn"
                        ? "ফিড"
                        : "Feed"}
            </button>
          ),
        )}
      </motion.div>

      {/* Content */}
      <motion.div variants={fadeUp} className="space-y-4">
        {/* Partners Tab */}
        {activeTab === "partners" && (
          <>
            {partnersWithStats.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">
                  {lang === "bn" ? "কোনো পার্টনার নেই" : "No partners yet"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "bn"
                    ? "আমন্ত্রণ পাঠান এবং একসাথে কাজ করুন"
                    : "Send invitations and work together"}
                </p>
              </div>
            ) : (
              partnersWithStats.map((partner) => (
                <motion.div
                  key={partner._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-4 glass-card-hover"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {partner.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{partner.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Lv.{partner.level}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {partner.sharedHabits.map((habit, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded-lg bg-foreground/5 text-muted-foreground"
                          >
                            {habit}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center gap-1 text-orange-500">
                            <Flame className="h-4 w-4" />
                            <span className="font-bold">{partner.streak}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {lang === "bn" ? "স্ট্রিক" : "Streak"}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-green-500">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-bold">
                              {partner.completionRate}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {lang === "bn" ? "সম্পন্ন" : "Complete"}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center justify-center gap-1 text-blue-500">
                            <Zap className="h-4 w-4" />
                            <span className="font-bold">{partner.xp}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">XP</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(partner.lastActive)}
                      </p>
                      <button
                        onClick={() => handleSendNudge(partner._id)}
                        className="cursor-pointer mt-2 p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
                      >
                        <Bell className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <>
            {requests.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <Handshake className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">
                  {lang === "bn" ? "কোনো অনুরোধ নেই" : "No pending requests"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "bn"
                    ? "নতুন পার্টনার আমন্ত্রণ পাঠান"
                    : "Invite new partners"}
                </p>
              </div>
            ) : (
              requests.map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {request.avatar}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{request.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {request.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.mutualFriends}{" "}
                        {lang === "bn"
                          ? "টি পারস্পরিক বন্ধু"
                          : "mutual friends"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request._id)}
                        className="cursor-pointer p-2 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request._id)}
                        className="cursor-pointer p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}

        {/* Shared Challenges Tab */}
        {activeTab === "shared" && (
          <>
            {sharedChallenges.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">
                  {lang === "bn"
                    ? "কোনো শেয়ার্ড চ্যালেঞ্জ নেই"
                    : "No shared challenges"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "bn"
                    ? "পার্টনারের সাথে চ্যালেঞ্জ শুরু করুন"
                    : "Start a challenge with your partner"}
                </p>
              </div>
            ) : (
              sharedChallenges.map((challenge) => {
                const daysLeft = Math.max(
                  0,
                  Math.ceil((challenge.endDate - NOW) / (1000 * 60 * 60 * 24)),
                )
                const myPercent = Math.min(
                  100,
                  (challenge.myProgress / challenge.goal) * 100,
                )
                const partnerPercent = Math.min(
                  100,
                  (challenge.partnerProgress / challenge.goal) * 100,
                )

                return (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold">{challenge.title}</h3>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {daysLeft} {lang === "bn" ? "দিন বাকি" : "days left"}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{lang === "bn" ? "আমি" : "Me"}</span>
                          <span className="text-muted-foreground">
                            {challenge.myProgress}/{challenge.goal}{" "}
                            {challenge.unit}
                          </span>
                        </div>
                        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${myPercent}%` }}
                            className="h-full bg-primary rounded-full"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{lang === "bn" ? "পার্টনার" : "Partner"}</span>
                          <span className="text-muted-foreground">
                            {challenge.partnerProgress}/{challenge.goal}{" "}
                            {challenge.unit}
                          </span>
                        </div>
                        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${partnerPercent}%` }}
                            className="h-full bg-orange-500 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="glass rounded-2xl p-4 flex flex-col h-[500px]">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-foreground/10">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">
                {lang === "bn"
                  ? "পার্টনারদের সাথে বার্তা"
                  : "Messages with Partners"}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.fromMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground/5"
                    } ${
                      msg.type === "nudge"
                        ? "border border-dashed border-orange-500/50"
                        : ""
                    }`}
                  >
                    {msg.type === "nudge" && (
                      <div className="flex items-center gap-1 text-xs text-orange-500 mb-1">
                        <Bell className="h-3 w-3" />
                        {lang === "bn" ? "নাজ" : "Nudge"}
                      </div>
                    )}
                    {msg.type === "celebrate" && (
                      <div className="flex items-center gap-1 text-xs text-yellow-500 mb-1">
                        <Trophy className="h-3 w-3" />
                        {lang === "bn" ? "অভিনন্দন" : "Celebrate"}
                      </div>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.fromMe
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {getTimeAgo(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={
                  lang === "bn" ? "বার্তা লিখুন..." : "Type a message..."
                }
                className="flex-1 rounded-xl bg-foreground/5 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={handleSendMessage}
                className="cursor-pointer p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Activity Feed Tab */}
        {activeTab === "feed" && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">
                {lang === "bn" ? "পার্টনারদের কার্যক্রম" : "Partner Activity"}
              </h3>
            </div>
            <div className="space-y-3">
              {activityFeed.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-foreground/5"
                >
                  <div className="p-2 rounded-xl bg-foreground/10">
                    {getActivityIcon(activity.icon)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.partnerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.details}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                {lang === "bn" ? "পার্টনার আমন্ত্রণ" : "Invite Partner"}
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="cursor-pointer p-2 rounded-xl hover:bg-foreground/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {lang === "bn" ? "ইমেইল বা ফোন নম্বর" : "Email or Phone"}
                </label>
                <input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={
                    lang === "bn" ? "example@email.com" : "example@email.com"
                  }
                  className="w-full rounded-xl bg-foreground/5 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {lang === "bn" ? "বার্তা (ঐচ্ছিক)" : "Message (optional)"}
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                  placeholder={
                    lang === "bn"
                      ? "একসাথে লক্ষ্য অর্জন করতে চাই..."
                      : "Let's achieve goals together..."
                  }
                  className="w-full rounded-xl bg-foreground/5 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="cursor-pointer flex-1 rounded-xl px-4 py-2 text-sm font-medium bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                  {lang === "bn" ? "বাতিল" : "Cancel"}
                </button>
                <button
                  onClick={handleInvite}
                  className="cursor-pointer flex-1 rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {lang === "bn" ? "আমন্ত্রণ পাঠান" : "Send Invite"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
