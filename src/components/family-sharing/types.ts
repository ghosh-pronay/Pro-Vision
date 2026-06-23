import {
  Shield,
  Crown,
  Heart,
  Clipboard,
  DollarSign,
  CalendarDays,
  StickyNote,
  Users,
  Target,
} from "lucide-react";

export type Role = "admin" | "parent" | "child";

export interface FamilyGroup {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  isOnline: boolean;
  privacy: {
    tasks: boolean;
    expenses: boolean;
    calendar: boolean;
    notes: boolean;
  };
}

export interface Activity {
  id: string;
  memberId: string;
  action: string;
  timestamp: number;
  type: "task" | "expense" | "calendar" | "note" | "member" | "goal" | "budget";
}

export interface SharedGoal {
  id: string;
  title: string;
  progress: number;
  target: number;
  assignedTo?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  priority: number;
}

export const AVATARS = ["👨", "👩", "👦", "👧", "👴", "👵", "🧑", "👶"];

export const ROLE_CONFIG: Record<
  Role,
  { en: string; bn: string; color: string; icon: typeof Shield }
> = {
  admin: {
    en: "Admin",
    bn: "অ্যাডমিন",
    color: "text-amber-500 bg-amber-500/10",
    icon: Crown,
  },
  parent: {
    en: "Parent",
    bn: "বাবা/মা",
    color: "text-blue-500 bg-blue-500/10",
    icon: Shield,
  },
  child: {
    en: "Child",
    bn: "সন্তান",
    color: "text-green-500 bg-green-500/10",
    icon: Heart,
  },
};

export const ACTIVITY_ICONS: Record<Activity["type"], typeof Clipboard> = {
  task: Clipboard,
  expense: DollarSign,
  calendar: CalendarDays,
  note: StickyNote,
  member: Users,
  goal: Target,
  budget: DollarSign,
};

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function formatTimeAgo(timestamp: number, lang: "en" | "bn"): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (lang === "bn") {
    if (minutes < 1) return "এইমাত্র";
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘণ্টা আগে`;
    return `${days} দিন আগে`;
  }

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
