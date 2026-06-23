import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { Bell, Snowflake, Target } from "lucide-react";

interface SettingsTabProps {
  reminderTime: string;
  freezeTokens: number;
  currentStreak: number;
  longestStreak: number;
  totalPointsEarned: number;
  ownedRewardsCount: number;
  onReminderTimeChange: (time: string) => void;
  onUseFreeze: () => void;
}

export function SettingsTab({
  reminderTime,
  freezeTokens,
  currentStreak,
  longestStreak,
  totalPointsEarned,
  ownedRewardsCount,
  onReminderTimeChange,
  onUseFreeze,
}: SettingsTabProps) {
  const { lang } = useLang();

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-400" />
          {lang === "bn" ? "দৈনিক রিমাইন্ডার" : "Daily Reminder"}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div>
              <p className="font-medium">
                {lang === "bn" ? "রিমাইন্ডার সময়" : "Reminder Time"}
              </p>
              <p className="text-sm text-white/50">
                {lang === "bn"
                  ? "প্রতিদিন রিমাইন্ডার পান"
                  : "Get reminded daily"}
              </p>
            </div>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => onReminderTimeChange(e.target.value)}
              className="bg-white/10 text-white rounded-lg px-3 py-2 text-sm border border-white/20 focus:outline-none focus:border-white/40"
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
            <div>
              <p className="font-medium">
                {lang === "bn" ? "রিমাইন্ডার সক্রিয়" : "Reminder Active"}
              </p>
              <p className="text-sm text-white/50">
                {lang === "bn"
                  ? "নির্ধারিত সময়ে নোটিফিকেশন পান"
                  : "Get notified at set time"}
              </p>
            </div>
            <div className="w-12 h-6 rounded-full bg-purple-500 relative cursor-pointer hover:bg-purple-600 transition-colors">
              <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 right-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-cyan-400" />
          {lang === "bn" ? "স্ট্রিক ফ্রিজ" : "Streak Freeze"}
        </h3>
        <div className="p-4 rounded-xl bg-white/5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-medium">
                {lang === "bn" ? "ফ্রিজ টোকেন" : "Freeze Tokens"}
              </p>
              <p className="text-sm text-white/50">
                {lang === "bn"
                  ? "স্ট্রিক রক্ষা করতে ফ্রিজ ব্যবহার করুন"
                  : "Use freeze to protect your streak"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-cyan-400" />
              <span className="text-xl font-bold">{freezeTokens}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUseFreeze}
              disabled={freezeTokens === 0}
              className="flex-1 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium disabled:opacity-50"
            >
              {lang === "bn" ? "ফ্রিজ ব্যবহার করুন" : "Use Freeze"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-white/10 text-white/70 text-sm font-medium"
            >
              {lang === "bn" ? "আরও কিনুন" : "Buy More"}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-400" />
          {lang === "bn" ? "পরিসংখ্যান" : "Statistics"}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold text-orange-400">
              {currentStreak}
            </p>
            <p className="text-xs text-white/50">
              {lang === "bn" ? "বর্তমান স্ট্রিক" : "Current"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {longestStreak}
            </p>
            <p className="text-xs text-white/50">
              {lang === "bn" ? "দীর্ঘতম" : "Longest"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold text-purple-400">
              {totalPointsEarned}
            </p>
            <p className="text-xs text-white/50">
              {lang === "bn" ? "মোট পয়েন্ট" : "Total Points"}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 text-center">
            <p className="text-2xl font-bold text-green-400">
              {ownedRewardsCount}
            </p>
            <p className="text-xs text-white/50">
              {lang === "bn" ? "পুরস্কার" : "Rewards"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
