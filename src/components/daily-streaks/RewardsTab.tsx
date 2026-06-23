import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useMemo } from "react";
import {
  Star,
  Check,
  ShoppingBag,
  Palette,
  Award,
  UserCircle,
  Zap,
} from "lucide-react";
import { type Reward } from "./types";

interface RewardsTabProps {
  points: number;
  totalPointsEarned: number;
  rewards: Reward[];
  ownedRewards: string[];
  filterCategory: string;
  onFilterChange: (category: string) => void;
  onRedeem: (reward: Reward) => void;
}

const rewardCategories = [
  { id: "all", labelEn: "All", labelBn: "সব", icon: ShoppingBag },
  { id: "theme", labelEn: "Themes", labelBn: "থিম", icon: Palette },
  { id: "badge", labelEn: "Badges", labelBn: "ব্যাজ", icon: Award },
  { id: "profile", labelEn: "Profile", labelBn: "প্রোফাইল", icon: UserCircle },
  { id: "premium", labelEn: "Premium", labelBn: "প্রিমিয়াম", icon: Star },
  { id: "powerup", labelEn: "Power-ups", labelBn: "পাওয়ারআপ", icon: Zap },
];

export function RewardsTab({
  points,
  totalPointsEarned,
  rewards,
  ownedRewards,
  filterCategory,
  onFilterChange,
  onRedeem,
}: RewardsTabProps) {
  const { lang } = useLang();

  const filteredRewards = useMemo(() => {
    if (filterCategory === "all") return rewards;
    return rewards.filter((r) => r.category === filterCategory);
  }, [rewards, filterCategory]);

  return (
    <motion.div
      key="rewards"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">
              {lang === "bn" ? "উপলব্ধ পয়েন্ট" : "Available Points"}
            </p>
            <p className="text-3xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              {points}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm">
              {lang === "bn" ? "মোট অর্জিত" : "Total Earned"}
            </p>
            <p className="text-xl font-semibold">{totalPointsEarned}</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-2">
        <div className="flex gap-2 overflow-x-auto">
          {rewardCategories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFilterChange(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterCategory === cat.id
                  ? "bg-white/20 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {lang === "bn" ? cat.labelBn : cat.labelEn}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRewards.map((reward, idx) => {
          const isOwned = ownedRewards.includes(reward.id);
          const canAfford = points >= reward.cost;
          const RewardIcon = reward.icon;
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className={`glass rounded-xl p-4 ${isOwned ? "ring-1 ring-green-500/30" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <RewardIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">{reward.name}</h4>
                  <p className="text-sm text-white/50 truncate">
                    {reward.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400" />
                      {reward.cost}
                    </span>
                    {isOwned ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {lang === "bn" ? "অর্জিত" : "Owned"}
                      </span>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onRedeem(reward)}
                        disabled={!canAfford}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                          canAfford
                            ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                            : "bg-white/5 text-white/30 cursor-not-allowed"
                        }`}
                      >
                        {lang === "bn" ? "রিডিম" : "Redeem"}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
