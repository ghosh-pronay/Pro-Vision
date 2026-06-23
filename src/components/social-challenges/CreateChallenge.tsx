import { motion } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { Plus, CheckCircle, UserPlus } from "lucide-react";
import { CHALLENGE_TYPES, DURATION_OPTIONS } from "./types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Friend {
  id: string;
  name: string;
  avatar: string;
}

interface CustomChallenge {
  name: string;
  description: string;
  type: string;
  goal: string;
  unit: string;
  duration: number;
  inviteFriends: string[];
}

interface Props {
  customChallenge: CustomChallenge;
  onCustomChallengeChange: (update: Partial<CustomChallenge>) => void;
  friendSearch: string;
  onFriendSearchChange: (val: string) => void;
  friendsList: Friend[];
  onCreate: () => void;
  onToggleFriend: (id: string) => void;
}

export default function CreateChallenge({
  customChallenge,
  onCustomChallengeChange,
  friendSearch,
  onFriendSearchChange,
  friendsList,
  onCreate,
  onToggleFriend,
}: Props) {
  const { lang } = useLang();

  return (
    <motion.div variants={fadeUp} className="glass rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <Plus className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">
          {lang === "bn"
            ? "কাস্টম চ্যালেঞ্জ তৈরি করুন"
            : "Create Custom Challenge"}
        </h2>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {lang === "bn" ? "চ্যালেঞ্জের নাম" : "Challenge Name"}
        </label>
        <input
          type="text"
          value={customChallenge.name}
          onChange={(e) => onCustomChallengeChange({ name: e.target.value })}
          placeholder={lang === "bn" ? "আমার চ্যালেঞ্জ" : "My Challenge"}
          className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {lang === "bn" ? "বিবরণ" : "Description"}
        </label>
        <textarea
          value={customChallenge.description}
          onChange={(e) =>
            onCustomChallengeChange({ description: e.target.value })
          }
          placeholder={
            lang === "bn" ? "চ্যালেঞ্জের বিবরণ" : "Challenge description"
          }
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {lang === "bn" ? "ধরন" : "Type"}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {CHALLENGE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onCustomChallengeChange({ type: type.id })}
              className={`p-3 rounded-xl text-center transition-all ${customChallenge.type === type.id ? "glass bg-primary/20 border border-primary/30" : "glass-subtle hover:bg-foreground/5"}`}
            >
              <div className="text-xl mb-1">{type.icon}</div>
              <div className="text-[10px] text-muted-foreground">
                {lang === "bn" ? type.nameBn : type.nameEn}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {lang === "bn" ? "লক্ষ্য" : "Goal"}
          </label>
          <input
            type="number"
            value={customChallenge.goal}
            onChange={(e) => onCustomChallengeChange({ goal: e.target.value })}
            placeholder="100"
            className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {lang === "bn" ? "একক" : "Unit"}
          </label>
          <select
            value={customChallenge.unit}
            onChange={(e) => onCustomChallengeChange({ unit: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="times">{lang === "bn" ? "বার" : "times"}</option>
            <option value="minutes">
              {lang === "bn" ? "মিনিট" : "minutes"}
            </option>
            <option value="pages">{lang === "bn" ? "পৃষ্ঠা" : "pages"}</option>
            <option value="liters">{lang === "bn" ? "লিটার" : "liters"}</option>
            <option value="steps">{lang === "bn" ? "পা" : "steps"}</option>
            <option value="BDT">BDT</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {lang === "bn" ? "মেয়াদ" : "Duration"}
        </label>
        <div className="flex gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => onCustomChallengeChange({ duration: opt.days })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${customChallenge.duration === opt.days ? "glass bg-primary/20 text-primary border border-primary/30" : "glass text-muted-foreground"}`}
            >
              {lang === "bn" ? opt.labelBn : opt.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {lang === "bn" ? "বন্ধুদের আমন্ত্রণ জানান" : "Invite Friends"}
        </label>
        <input
          type="text"
          value={friendSearch}
          onChange={(e) => onFriendSearchChange(e.target.value)}
          placeholder={lang === "bn" ? "বন্ধু খুঁজুন..." : "Search friends..."}
          className="w-full px-4 py-2.5 rounded-xl glass-subtle border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {friendsList
            .filter((f) =>
              f.name.toLowerCase().includes(friendSearch.toLowerCase()),
            )
            .map((friend) => (
              <button
                key={friend.id}
                onClick={() => onToggleFriend(friend.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-sm transition-all ${customChallenge.inviteFriends.includes(friend.id) ? "glass bg-primary/10" : "glass-subtle hover:bg-foreground/5"}`}
              >
                <span className="text-lg">{friend.avatar}</span>
                <span className="flex-1 text-left">{friend.name}</span>
                {customChallenge.inviteFriends.includes(friend.id) ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            ))}
        </div>
      </div>

      <button
        onClick={onCreate}
        disabled={!customChallenge.name || !customChallenge.goal}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
      >
        {lang === "bn" ? "চ্যালেঞ্জ তৈরি করুন" : "Create Challenge"}
      </button>
    </motion.div>
  );
}
