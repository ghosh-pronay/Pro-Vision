export interface WalletPreset {
  id: string;
  name: string;
  nameBn: string;
  type: "cash" | "bank" | "credit" | "digital" | "other";
  icon: string;
  color: string;
  category: "cash" | "mfs" | "bank" | "credit" | "custom";
}

export const WALLET_PRESETS: WalletPreset[] = [
  {
    id: "cash-hand",
    name: "Cash (In Hand)",
    nameBn: "নগদ (হাতে)",
    type: "cash",
    icon: "Banknote",
    color: "#22c55e",
    category: "cash",
  },
  {
    id: "cash-reserve",
    name: "Cash (Reserve Fund)",
    nameBn: "নগদ (সঞ্চয় তহবিল)",
    type: "cash",
    icon: "PiggyBank",
    color: "#10b981",
    category: "cash",
  },
  {
    id: "bkash",
    name: "Bkash",
    nameBn: "বিকাশ",
    type: "digital",
    icon: "Smartphone",
    color: "#e91e63",
    category: "mfs",
  },
  {
    id: "nagad",
    name: "Nagad",
    nameBn: "নগদ",
    type: "digital",
    icon: "Smartphone",
    color: "#ff5722",
    category: "mfs",
  },
  {
    id: "rocket",
    name: "Rocket",
    nameBn: "রকেট",
    type: "digital",
    icon: "Rocket",
    color: "#d32f2f",
    category: "mfs",
  },
  {
    id: "upay",
    name: "Upay",
    nameBn: "উপায়",
    type: "digital",
    icon: "Smartphone",
    color: "#4caf50",
    category: "mfs",
  },
  {
    id: "brac-bank",
    name: "Brac Bank",
    nameBn: "ব্র্যাক ব্যাংক",
    type: "bank",
    icon: "Building2",
    color: "#1565c0",
    category: "bank",
  },
  {
    id: "dbbl-bank",
    name: "DBBL Bank",
    nameBn: "ডাচ-বাংলা ব্যাংক",
    type: "bank",
    icon: "Building2",
    color: "#0d47a1",
    category: "bank",
  },
  {
    id: "cc-dbbl",
    name: "Credit Card (DBBL)",
    nameBn: "ক্রেডিট কার্ড (ডাচ-বাংলা)",
    type: "credit",
    icon: "CreditCard",
    color: "#7b1fa2",
    category: "credit",
  },
  {
    id: "cc-shimanto",
    name: "Credit Card (Shimanto)",
    nameBn: "ক্রেডিট কার্ড (শিমান্তো)",
    type: "credit",
    icon: "CreditCard",
    color: "#c2185b",
    category: "credit",
  },
  {
    id: "cc-meghna",
    name: "Credit Card (Meghna)",
    nameBn: "ক্রেডিট কার্ড (মেঘনা)",
    type: "credit",
    icon: "CreditCard",
    color: "#ad1457",
    category: "credit",
  },
  {
    id: "others",
    name: "Others",
    nameBn: "অন্যান্য",
    type: "other",
    icon: "MoreHorizontal",
    color: "#607d8b",
    category: "custom",
  },
];

export const WALLET_CATEGORIES = [
  { id: "cash", name: "Cash", nameBn: "নগদ", icon: "Banknote" },
  {
    id: "mfs",
    name: "Mobile Financial Services",
    nameBn: "মোবাইল ফিনান্সিয়াল সার্ভিস",
    icon: "Smartphone",
  },
  {
    id: "bank",
    name: "Bank Accounts",
    nameBn: "ব্যাংক অ্যাকাউন্ট",
    icon: "Building2",
  },
  {
    id: "credit",
    name: "Credit Cards",
    nameBn: "ক্রেডিট কার্ড",
    icon: "CreditCard",
  },
  { id: "custom", name: "Custom", nameBn: "কাস্টম", icon: "Plus" },
];
