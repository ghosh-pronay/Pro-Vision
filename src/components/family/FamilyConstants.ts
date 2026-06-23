import {
  UtensilsCrossed,
  Droplets,
  PartyPopper,
  Star,
  Heart,
  Calendar,
  Megaphone,
} from "lucide-react";
import type { ExpenseCategory, MemberRole } from "./FamilyTypes";

export const AVATARS = ["👨", "👩", "👦", "👧", "👴", "👵", "🧑", "👶"];

export const ROLE_CONFIG: Record<
  MemberRole,
  { en: string; bn: string; color: string }
> = {
  parent: {
    en: "Parent",
    bn: "বাবা/মা",
    color: "text-blue-500 bg-blue-500/10",
  },
  child: { en: "Child", bn: "সন্তান", color: "text-green-500 bg-green-500/10" },
  grandparent: {
    en: "Grandparent",
    bn: "দাদা/দিদা",
    color: "text-purple-500 bg-purple-500/10",
  },
  sibling: {
    en: "Sibling",
    bn: "ভাই/বোন",
    color: "text-orange-500 bg-orange-500/10",
  },
};

export const EXPENSE_CATEGORIES: {
  key: ExpenseCategory;
  icon: typeof UtensilsCrossed;
  color: string;
}[] = [
  { key: "food", icon: UtensilsCrossed, color: "text-amber-500" },
  { key: "utilities", icon: Droplets, color: "text-blue-500" },
  { key: "entertainment", icon: PartyPopper, color: "text-purple-500" },
  { key: "education", icon: Star, color: "text-green-500" },
  { key: "healthcare", icon: Heart, color: "text-red-500" },
  { key: "transport", icon: Calendar, color: "text-cyan-500" },
  { key: "others", icon: Megaphone, color: "text-gray-500" },
];

export const EVENT_TYPES = [
  "birthday",
  "anniversary",
  "vaccination",
  "checkup",
  "other",
] as const;

export const now = Date.now();

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const INITIAL_MEMBERS = [
  {
    id: "1",
    name: "Rahim Ahmed",
    role: "parent" as const,
    avatar: "👨",
    birthday: now - 365 * 24 * 60 * 60 * 1000 * 30,
  },
  {
    id: "2",
    name: "Fatima Rahman",
    role: "parent" as const,
    avatar: "👩",
    birthday: now - 365 * 24 * 60 * 60 * 1000 * 28,
  },
  {
    id: "3",
    name: "Samir Ahmed",
    role: "child" as const,
    avatar: "👦",
    birthday: now - 365 * 24 * 60 * 60 * 1000 * 8,
  },
  {
    id: "4",
    name: "Nadia Ahmed",
    role: "child" as const,
    avatar: "👧",
    birthday: now - 365 * 24 * 60 * 60 * 1000 * 5,
  },
];

export const INITIAL_GOALS = [
  {
    id: "1",
    title: "Save for vacation",
    description: "Save ৳100,000 for Cox's Bazar trip",
    progress: 65000,
    target: 100000,
    assignedTo: "1",
    deadline: now + 90 * 24 * 60 * 60 * 1000,
  },
  {
    id: "2",
    title: "Family fitness",
    description: "Exercise together 3x per week for a month",
    progress: 8,
    target: 12,
    deadline: now + 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: "3",
    title: "Read 10 books together",
    description: "Family reading challenge",
    progress: 4,
    target: 10,
    deadline: now + 180 * 24 * 60 * 60 * 1000,
  },
];

export const INITIAL_EXPENSES = [
  {
    id: "1",
    title: "Monthly Groceries",
    amount: 8500,
    category: "food" as const,
    date: now - 2 * 24 * 60 * 60 * 1000,
    paidBy: "1",
    splitWith: ["1", "2"],
  },
  {
    id: "2",
    title: "Electricity Bill",
    amount: 3200,
    category: "utilities" as const,
    date: now - 5 * 24 * 60 * 60 * 1000,
    paidBy: "2",
    splitWith: ["1", "2", "3", "4"],
  },
  {
    id: "3",
    title: "School Fees - Samir",
    amount: 12000,
    category: "education" as const,
    date: now - 10 * 24 * 60 * 60 * 1000,
    paidBy: "1",
    splitWith: ["1"],
  },
  {
    id: "4",
    title: "Movie Tickets",
    amount: 2000,
    category: "entertainment" as const,
    date: now - 3 * 24 * 60 * 60 * 1000,
    paidBy: "1",
    splitWith: ["1", "2", "3", "4"],
  },
  {
    id: "5",
    title: "Doctor Visit - Nadia",
    amount: 1500,
    category: "healthcare" as const,
    date: now - 7 * 24 * 60 * 60 * 1000,
    paidBy: "2",
    splitWith: ["1", "2"],
  },
];

export const INITIAL_TASKS = [
  {
    id: "1",
    title: "Fix kitchen tap",
    status: "todo" as const,
    assignedTo: "1",
    dueDate: now + 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "2",
    title: "Clean living room",
    status: "in-progress" as const,
    assignedTo: "3",
    dueDate: now + 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: "3",
    title: "Buy groceries",
    status: "done" as const,
    assignedTo: "2",
  },
  {
    id: "4",
    title: "Wash the car",
    status: "todo" as const,
    assignedTo: "1",
    dueDate: now + 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "5",
    title: "Water the plants",
    status: "in-progress" as const,
    assignedTo: "4",
    dueDate: now,
  },
  {
    id: "6",
    title: "Pay internet bill",
    status: "done" as const,
    assignedTo: "2",
  },
];

export const INITIAL_EVENTS = [
  {
    id: "1",
    title: "Rahim's Birthday",
    date: now + 45 * 24 * 60 * 60 * 1000,
    type: "birthday" as const,
  },
  {
    id: "2",
    title: "Wedding Anniversary",
    date: now + 120 * 24 * 60 * 60 * 1000,
    type: "anniversary" as const,
  },
  {
    id: "3",
    title: "Nadia's Vaccination",
    date: now + 14 * 24 * 60 * 60 * 1000,
    type: "vaccination" as const,
  },
  {
    id: "4",
    title: "Family Health Check-up",
    date: now + 30 * 24 * 60 * 60 * 1000,
    type: "checkup" as const,
  },
];

export function getEventEmoji(type: string): string {
  switch (type) {
    case "birthday":
      return "🎂";
    case "anniversary":
      return "💍";
    case "vaccination":
      return "💉";
    case "checkup":
      return "🏥";
    default:
      return "🎉";
  }
}

export function getCategoryLabel(key: string, lang: string): string {
  if (lang === "bn") {
    switch (key) {
      case "food":
        return "খাদ্য";
      case "utilities":
        return "ইউটিলিটি";
      case "entertainment":
        return "বিনোদন";
      case "education":
        return "শিক্ষা";
      case "healthcare":
        return "স্বাস্থ্যসেবা";
      case "transport":
        return "পরিবহন";
      default:
        return "অন্যান্য";
    }
  }
  return key;
}
