import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { Calendar, Target, Users, Filter } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { CHALLENGE_TYPES } from "./types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

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
  filterType: string;
  onFilterChange: (type: string) => void;
  onJoin: (id: string) => void;
  getChallengeTypeInfo: (typeId: string) => ChallengeTypeInfo;
}

export default function AvailableChallenges({
  challenges,
  filterType,
  onFilterChange,
  onJoin,
  getChallengeTypeInfo,
}: Props) {
  const { lang } = useLang();

  return (
    <div className="space-y-4">
      <motion.div
        variants={fadeUp}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        <button
          onClick={() => onFilterChange("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterType === "all" ? "glass bg-primary/20 text-primary" : "glass text-muted-foreground"}`}
        >
          {lang === "bn" ? "সব" : "All"}
        </button>
        {CHALLENGE_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => onFilterChange(type.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterType === type.id ? "glass bg-primary/20 text-primary" : "glass text-muted-foreground"}`}
          >
            <span>{type.icon}</span>
            {lang === "bn" ? type.nameBn : type.nameEn}
          </button>
        ))}
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2"
      >
        {challenges.map((challenge) => {
          const typeInfo = getChallengeTypeInfo(challenge.type);
          return (
            <motion.div
              key={challenge._id}
              variants={fadeUp}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${typeInfo.color}20` }}
                  >
                    {typeInfo.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{challenge.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {challenge.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {challenge.duration} {lang === "bn" ? "দিন" : "days"}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  {challenge.goal} {challenge.unit}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {challenge.joinedUsers}
                </span>
              </div>

              <button
                onClick={() => onJoin(challenge._id)}
                className="w-full py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: typeInfo.color, color: "white" }}
              >
                {lang === "bn" ? "যোগ দিন" : "Join Challenge"}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {challenges.length === 0 && (
        <EmptyState
          icon={Filter}
          title={
            lang === "bn"
              ? "কোনো চ্যালেঞ্জ পাওয়া যায়নি"
              : "No challenges found"
          }
          description={
            lang === "bn" ? "অন্য ক্যাটাগরি দেখুন" : "Try a different category"
          }
        />
      )}
    </div>
  );
}
