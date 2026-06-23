import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { Clock, CheckCircle, Flame } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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
  history: Challenge[];
  getChallengeTypeInfo: (typeId: string) => ChallengeTypeInfo;
}

export default function History({ history, getChallengeTypeInfo }: Props) {
  const { lang } = useLang();

  if (history.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title={lang === "bn" ? "কোনো ইতিহাস নেই" : "No History Yet"}
        description={
          lang === "bn"
            ? "চ্যালেঞ্জ সম্পন্ন করলে এখানে দেখা যাবে"
            : "Completed challenges will appear here"
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {history.map((challenge) => {
        const typeInfo = getChallengeTypeInfo(challenge.type);
        return (
          <motion.div
            key={challenge._id}
            variants={fadeUp}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl opacity-70"
                style={{ backgroundColor: `${typeInfo.color}20` }}
              >
                {typeInfo.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{challenge.name}</h3>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {challenge.description}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>
                  {challenge.duration} {lang === "bn" ? "দিন" : "days"}
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {challenge.streak}d streak
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
