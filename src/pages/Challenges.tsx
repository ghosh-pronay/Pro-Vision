import { motion } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { useState } from "react"
import { Trophy, Users, Target, Clock, Crown, Award } from "lucide-react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import type { Id } from "../convex/_generated/dataModel"

const CHALLENGE_TYPES = [
  { value: "habits", icon: Target, color: "text-green-500" },
  { value: "focus", icon: Clock, color: "text-red-500" },
  { value: "tasks", icon: Target, color: "text-blue-500" },
] as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Challenges() {
  const { lang } = useLang()
  const challenges = useQuery(api.challenges.listChallenges) as any
  const myChallenges = useQuery(
    (api.challenges as any).listUserChallenges,
  ) as any
  const joinChallenge = useMutation(
    (api.challenges as any).joinChallenge,
    "challenges",
  )

  const [activeTab, setActiveTab] = useState<
    "active" | "joined" | "leaderboard"
  >("active")
  const [selectedChallengeId, setSelectedChallengeId] =
    useState<Id<"challenges"> | null>(null)

  const leaderboardChallengeId =
    selectedChallengeId ??
    (myChallenges?.[0]?._id as Id<"challenges"> | undefined)

  const leaderboard = useQuery(
    api.challenges.getLeaderboard,
    (leaderboardChallengeId
      ? { challengeId: leaderboardChallengeId }
      : undefined) as any,
  ) as any

  const handleJoin = async (challengeId: string) => {
    await joinChallenge({ challengeId: challengeId as Id<"challenges"> })
  }

  const getDaysLeft = (endDate: number) => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now()
    const diff = endDate - now
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const getChallengeIcon = (type: string) => {
    const challengeType = CHALLENGE_TYPES.find((t) => t.value === type)
    return challengeType?.icon || Target
  }

  const getChallengeColor = (type: string) => {
    const challengeType = CHALLENGE_TYPES.find((t) => t.value === type)
    return challengeType?.color || "text-muted-foreground"
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
            <Trophy className="h-6 w-6 text-primary" />
            {lang === "bn" ? "চ্যালেঞ্জ" : "Challenges"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "bn"
              ? "চ্যালেঞ্জে যোগ দিন এবং প্রতিযোগিতা করুন"
              : "Join challenges and compete with others"}
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={fadeUp}
        className="flex gap-1 rounded-xl bg-foreground/5 p-1"
      >
        {(["active", "joined", "leaderboard"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover-tab"
            }`}
          >
            {tab === "active"
              ? lang === "bn"
                ? "সক্রিয়"
                : "Active"
              : tab === "joined"
                ? lang === "bn"
                  ? "যোগদান করেছেন"
                  : "Joined"
                : lang === "bn"
                  ? "লিডারবোর্ড"
                  : "Leaderboard"}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div variants={fadeUp} className="space-y-4">
        {activeTab === "active" && (
          <>
            {!challenges || challenges.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">
                  {lang === "bn"
                    ? "কোনো সক্রিয় চ্যালেঞ্জ নেই"
                    : "No active challenges"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "bn"
                    ? "নতুন চ্যালেঞ্জের জন্য পরে দেখুন"
                    : "Check back later for new challenges"}
                </p>
              </div>
            ) : (
              challenges.map((challenge: any) => {
                const Icon = getChallengeIcon(challenge.type)
                const daysLeft = getDaysLeft(challenge.endDate)
                const isJoined = (myChallenges ?? []).some(
                  (c: any) => c._id === challenge._id,
                )

                return (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4 glass-card-hover"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-xl p-3 bg-foreground/5 ${getChallengeColor(challenge.type)}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {challenge.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {challenge.goal} {challenge.unit}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {daysLeft}{" "}
                            {lang === "bn" ? "দিন বাকি" : "days left"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoin(challenge._id)}
                        disabled={isJoined}
                        className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                          isJoined
                            ? "bg-green-500/10 text-green-500 cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        {isJoined
                          ? lang === "bn"
                            ? "যোগদান করেছেন"
                            : "Joined"
                          : lang === "bn"
                            ? "যোগ দিন"
                            : "Join"}
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </>
        )}

        {activeTab === "joined" && (
          <>
            {!myChallenges || myChallenges.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">
                  {lang === "bn"
                    ? "আপনি কোনো চ্যালেঞ্জে যোগদান করেননি"
                    : "You haven't joined any challenges"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "bn"
                    ? "সক্রিয় চ্যালেঞ্জে যোগ দিন"
                    : "Join an active challenge to get started"}
                </p>
              </div>
            ) : (
              myChallenges.map((challenge: any) => {
                const Icon = getChallengeIcon(challenge.type)
                const daysLeft = getDaysLeft(challenge.endDate)
                const progress = challenge.progress || 0
                const progressPercent = Math.min(
                  100,
                  (progress / challenge.goal) * 100,
                )

                return (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-xl p-3 bg-foreground/5 ${getChallengeColor(challenge.type)}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {challenge.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span>
                            {progress} / {challenge.goal} {challenge.unit}
                          </span>
                          <span>
                            {daysLeft}{" "}
                            {lang === "bn" ? "দিন বাকি" : "days left"}
                          </span>
                        </div>
                        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className="h-full bg-primary rounded-full"
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

        {activeTab === "leaderboard" && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold">
                  {lang === "bn" ? "শীর্ষ প্রতিযোগী" : "Top Competitors"}
                </h3>
              </div>
              {myChallenges && myChallenges.length > 0 && (
                <select
                  value={leaderboardChallengeId ?? ""}
                  onChange={(e) =>
                    setSelectedChallengeId(e.target.value as Id<"challenges">)
                  }
                  className="text-xs rounded-lg bg-foreground/5 px-2 py-1 border-none outline-none"
                >
                  {myChallenges.map((c: any) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {!leaderboardChallengeId ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  {lang === "bn"
                    ? "লিডারবোর্ড দেখতে একটি চ্যালেঞ্জে যোগ দিন"
                    : "Join a challenge to see its leaderboard"}
                </p>
              </div>
            ) : !leaderboard || leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  {lang === "bn"
                    ? "এখনো কোনো অংশগ্রহণকারী নেই"
                    : "No participants yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry: any, idx: any) => {
                  const rank = idx + 1
                  const badge =
                    rank === 1
                      ? "🥇"
                      : rank === 2
                        ? "🥈"
                        : rank === 3
                          ? "🥉"
                          : ""
                  return (
                    <div
                      key={entry.userId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5"
                    >
                      <span className="text-lg w-8 text-center font-bold">
                        {badge || `#${rank}`}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">
                          {entry.name ||
                            (lang === "bn" ? "ব্যবহারকারী" : "User")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {entry.progress}{" "}
                          {lang === "bn" ? "পয়েন্ট" : "points"}
                        </p>
                      </div>
                      {rank <= 3 && (
                        <Award
                          className={`h-5 w-5 ${
                            rank === 1
                              ? "text-yellow-500"
                              : rank === 2
                                ? "text-gray-400"
                                : "text-orange-500"
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
