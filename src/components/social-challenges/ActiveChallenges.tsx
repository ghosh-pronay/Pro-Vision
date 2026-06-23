import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import {
  Flame,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Share2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const DAY_MS = 24 * 60 * 60 * 1000;

interface Challenge {
  _id: string;
  type: string;
  name: string;
  description: string;
  goal: number;
  unit: string;
  duration: number;
  startDate: number;
  endDate: number;
  progress: number;
  streak: number;
  joinedUsers: number;
  createdBy: string;
  isActive: boolean;
  dailyLogs: boolean[];
}

interface ChallengeTypeInfo {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  color: string;
}

interface Props {
  challenges: Challenge[];
  getChallengeTypeInfo: (typeId: string) => ChallengeTypeInfo;
  onCheckIn: (id: string) => void;
  onShare: () => void;
}

function getDaysLeft(endDate: number) {
  const diff = endDate - Date.now();
  return Math.max(0, Math.ceil(diff / DAY_MS));
}

export default function ActiveChallenges({
  challenges,
  getChallengeTypeInfo,
  onCheckIn,
  onShare,
}: Props) {
  const { lang } = useLang();

  if (challenges.length === 0) {
    return (
      <EmptyState
        icon={Flame}
        title={
          lang === "bn" ? "কোনো সক্রিয় চ্যালেঞ্জ নেই" : "No Active Challenges"
        }
        description={
          lang === "bn"
            ? "একটি চ্যালেঞ্জে যোগ দিন এবং শুরু করুন!"
            : "Join a challenge and get started!"
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge, idx) => {
        const typeInfo = getChallengeTypeInfo(challenge.type);
        const daysLeft = getDaysLeft(challenge.endDate);
        const elapsedDays = challenge.duration - daysLeft;

        return (
          <motion.div
            key={challenge._id}
            variants={fadeUp}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${typeInfo.color}20` }}
                >
                  {typeInfo.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{challenge.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {challenge.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 glass px-2 py-1 rounded-lg">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-medium">
                    {challenge.streak}d
                  </span>
                </div>
                <button
                  onClick={onShare}
                  className="glass p-2 rounded-lg hover:bg-foreground/10 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  {lang === "bn" ? "অগ্রগতি" : "Progress"}
                </span>
                <span className="font-medium">{challenge.progress}%</span>
              </div>
              <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${challenge.progress}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: typeInfo.color }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {lang === "bn"
                    ? `${elapsedDays}/${challenge.duration} দিন`
                    : `${elapsedDays}/${challenge.duration} days`}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {daysLeft} {lang === "bn" ? "দিন বাকি" : "days left"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {challenge.joinedUsers}
                </span>
              </div>
              <button
                onClick={() => onCheckIn(challenge._id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: `${typeInfo.color}20`,
                  color: typeInfo.color,
                }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {lang === "bn" ? "চেক-ইন" : "Check In"}
              </button>
            </div>

            <div className="flex gap-1 mt-3">
              {Array.from({ length: challenge.duration }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${i < elapsedDays && challenge.dailyLogs[i] ? "" : i < elapsedDays ? "bg-red-500/30" : "bg-foreground/10"}`}
                  style={
                    i < elapsedDays && challenge.dailyLogs[i]
                      ? { backgroundColor: typeInfo.color }
                      : undefined
                  }
                />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
