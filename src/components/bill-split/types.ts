import { Utensils, Bus, Clapperboard, ShoppingBag, Tag } from "lucide-react";

export type SplitMethod = "equal" | "percentage" | "custom";
export type BillCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "other";
export type BillStatus = "pending" | "partial" | "settled";

export interface Participant {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  paid: boolean;
}

export interface Bill {
  _id: string;
  title: string;
  totalAmount: number;
  splitMethod: SplitMethod;
  participants: Participant[];
  category: BillCategory;
  currency: "BDT" | "USD";
  date: number;
  status: BillStatus;
  createdBy: string;
  paidAmount: number;
}

export interface Friend {
  _id: string;
  name: string;
  phone?: string;
}

export const CATEGORIES: {
  key: BillCategory;
  icon: typeof Utensils;
  color: string;
}[] = [
  { key: "food", icon: Utensils, color: "#f59e0b" },
  { key: "transport", icon: Bus, color: "#3b82f6" },
  { key: "entertainment", icon: Clapperboard, color: "#8b5cf6" },
  { key: "shopping", icon: ShoppingBag, color: "#ec4899" },
  { key: "other", icon: Tag, color: "#6b7280" },
];

export const CURRENCIES = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "USD", symbol: "$", name: "US Dollar" },
];

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const slideIn = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export function getCategoryIcon(cat: BillCategory) {
  const found = CATEGORIES.find((c) => c.key === cat);
  return found?.icon || Tag;
}

export function getCategoryColor(cat: BillCategory) {
  const found = CATEGORIES.find((c) => c.key === cat);
  return found?.color || "#6b7280";
}

export function getStatusColor(status: BillStatus) {
  switch (status) {
    case "settled":
      return "text-emerald-500 bg-emerald-500/10";
    case "partial":
      return "text-amber-500 bg-amber-500/10";
    default:
      return "text-red-500 bg-red-500/10";
  }
}

export function formatCurrency(
  amount: number,
  currency?: "BDT" | "USD",
  formatBanglaCurrency?: (n: number) => string,
) {
  if (currency === "USD") {
    return `$${amount.toFixed(2)}`;
  }
  return formatBanglaCurrency ? formatBanglaCurrency(amount) : `৳${amount}`;
}
