import type { LucideIcon } from "lucide-react";
import {
  Medal,
  Shield,
  Award,
  Gem,
  Crown,
  Diamond,
  Palette,
  Trophy,
  UserCircle,
  TrendingUp,
  Bell,
  Snowflake,
} from "lucide-react";

export interface StreakDay {
  date: string;
  completed: boolean;
  pointsEarned: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: LucideIcon;
  category: string;
  unlocked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  streak: number;
  level: string;
  isCurrentUser: boolean;
}

export interface StreakHistory {
  id: string;
  startDate: string;
  endDate: string;
  days: number;
  level: string;
  pointsEarned: number;
}

export interface Milestone {
  days: number;
  label: string;
  labelBn: string;
  celebrated: boolean;
}

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

export const STREAK_LEVELS = [
  {
    level: "bronze",
    nameEn: "Bronze",
    nameBn: "ব্রোঞ্জ",
    minDays: 3,
    color: "#cd7f32",
    icon: Medal,
  },
  {
    level: "silver",
    nameEn: "Silver",
    nameBn: "রূপা",
    minDays: 7,
    color: "#c0c0c0",
    icon: Shield,
  },
  {
    level: "gold",
    nameEn: "Gold",
    nameBn: "সোনা",
    minDays: 14,
    color: "#ffd700",
    icon: Award,
  },
  {
    level: "platinum",
    nameEn: "Platinum",
    nameBn: "প্লাটিনাম",
    minDays: 30,
    color: "#e5e4e2",
    icon: Gem,
  },
  {
    level: "diamond",
    nameEn: "Diamond",
    nameBn: "হীরা",
    minDays: 60,
    color: "#b9f2ff",
    icon: Diamond,
  },
  {
    level: "crown",
    nameEn: "Crown",
    nameBn: "মুকুট",
    minDays: 100,
    color: "#9d00ff",
    icon: Crown,
  },
];

export const LEVEL_BENEFITS: Record<string, { en: string; bn: string }[]> = {
  bronze: [
    { en: "Basic streak tracking", bn: "মৌলিক স্ট্রিক ট্র্যাকিং" },
    { en: "1 freeze token per week", bn: "প্রতি সপ্তাহে ১টি ফ্রিজ টোকেন" },
    { en: "Bronze badge", bn: "ব্রোঞ্জ ব্যাজ" },
  ],
  silver: [
    { en: "Advanced analytics", bn: "উন্নত অ্যানালিটিক্স" },
    { en: "2 freeze tokens per week", bn: "প্রতি সপ্তাহে ২টি ফ্রিজ টোকেন" },
    { en: "Silver badge & profile frame", bn: "রূপা ব্যাজ ও প্রোফাইল ফ্রেম" },
  ],
  gold: [
    { en: "Custom streak themes", bn: "কাস্টম স্ট্রিক থিম" },
    { en: "3 freeze tokens per week", bn: "প্রতি সপ্তাহে ৩টি ফ্রিজ টোকেন" },
    { en: "Gold badge & profile frame", bn: "সোনা ব্যাজ ও প্রোফাইল ফ্রেম" },
  ],
  platinum: [
    { en: "Priority support", bn: "অগ্রাধিকার সহায়তা" },
    { en: "4 freeze tokens per week", bn: "প্রতি সপ্তাহে ৪টি ফ্রিজ টোকেন" },
    {
      en: "Platinum badge & animated frame",
      bn: "প্লাটিনাম ব্যাজ ও অ্যানিমেটেড ফ্রেম",
    },
  ],
  diamond: [
    { en: "Exclusive rewards", bn: "একচেটিয়া পুরস্কার" },
    { en: "5 freeze tokens per week", bn: "প্রতি সপ্তাহে ৫টি ফ্রিজ টোকেন" },
    { en: "Diamond badge & special effects", bn: "হীরা ব্যাজ ও বিশেষ ইফেক্ট" },
  ],
  crown: [
    { en: "All benefits unlocked", bn: "সমস্ত সুবিধা আনলক" },
    { en: "Unlimited freeze tokens", bn: "অসীমিত ফ্রিজ টোকেন" },
    {
      en: "Crown badge & legendary status",
      bn: "মুকুট ব্যাজ ও কিংবদন্তী মর্যাদা",
    },
  ],
};

export const MILESTONES: Milestone[] = [
  {
    days: 3,
    label: "3-Day Streak!",
    labelBn: "৩ দিনের স্ট্রিক!",
    celebrated: false,
  },
  {
    days: 7,
    label: "1 Week Streak!",
    labelBn: "১ সপ্তাহের স্ট্রিক!",
    celebrated: false,
  },
  {
    days: 14,
    label: "2 Week Streak!",
    labelBn: "২ সপ্তাহের স্ট্রিক!",
    celebrated: false,
  },
  {
    days: 30,
    label: "1 Month Streak!",
    labelBn: "১ মাসের স্ট্রিক!",
    celebrated: false,
  },
  {
    days: 60,
    label: "2 Month Streak!",
    labelBn: "২ মাসের স্ট্রিক!",
    celebrated: false,
  },
  {
    days: 100,
    label: "100 Day Legend!",
    labelBn: "১০০ দিনের কিংবদন্তী!",
    celebrated: false,
  },
];

export const DEFAULT_REWARDS: Reward[] = [
  {
    id: "r1",
    name: "Ocean Theme",
    description: "Cool ocean blue theme",
    cost: 100,
    icon: Palette,
    category: "theme",
    unlocked: false,
  },
  {
    id: "r2",
    name: "Sunset Theme",
    description: "Warm sunset colors",
    cost: 100,
    icon: Palette,
    category: "theme",
    unlocked: false,
  },
  {
    id: "r3",
    name: "Forest Theme",
    description: "Natural forest green",
    cost: 100,
    icon: Palette,
    category: "theme",
    unlocked: false,
  },
  {
    id: "r4",
    name: "Explorer Badge",
    description: "Special explorer badge",
    cost: 50,
    icon: Award,
    category: "badge",
    unlocked: false,
  },
  {
    id: "r5",
    name: "Champion Badge",
    description: "Champion achievement badge",
    cost: 75,
    icon: Trophy,
    category: "badge",
    unlocked: false,
  },
  {
    id: "r6",
    name: "Golden Frame",
    description: "Golden profile frame",
    cost: 150,
    icon: UserCircle,
    category: "profile",
    unlocked: false,
  },
  {
    id: "r7",
    name: "Neon Frame",
    description: "Neon glow profile frame",
    cost: 200,
    icon: UserCircle,
    category: "profile",
    unlocked: false,
  },
  {
    id: "r8",
    name: "Advanced Stats",
    description: "Unlock advanced analytics",
    cost: 300,
    icon: TrendingUp,
    category: "premium",
    unlocked: false,
  },
  {
    id: "r9",
    name: "Custom Reminders",
    description: "Customizable reminder system",
    cost: 250,
    icon: Bell,
    category: "premium",
    unlocked: false,
  },
  {
    id: "r10",
    name: "Streak Shield",
    description: "Extra freeze token pack",
    cost: 120,
    icon: Snowflake,
    category: "powerup",
    unlocked: false,
  },
];

export function getHeatmapColor(streak: number) {
  if (streak >= 100) return "#9d00ff";
  if (streak >= 60) return "#b9f2ff";
  if (streak >= 30) return "#e5e4e2";
  if (streak >= 14) return "#ffd700";
  if (streak >= 7) return "#c0c0c0";
  if (streak >= 3) return "#cd7f32";
  return "rgba(255,255,255,0.1)";
}
