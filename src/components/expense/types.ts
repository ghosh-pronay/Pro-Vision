export interface ExpenseTransaction {
  _id: string;
  type: string;
  amount: number;
  category: string;
  description?: string;
  date: number;
  walletId: string;
  toWalletId?: string;
}

export const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍽️",
  Salary: "💼",
  Freelance: "💻",
  Transfer: "📱",
  Utilities: "⚡",
  Transport: "🚌",
  Cashback: "🎁",
  Shopping: "🛒",
  Health: "🏥",
  Education: "📚",
  "Food & Dining": "🍽️",
  Transportation: "🚌",
  "Bills & Utilities": "⚡",
  "Mobile Recharge": "📱",
  "Internet Bill": "📶",
  Groceries: "🍎",
  Healthcare: "🏥",
  Entertainment: "🎬",
  Clothing: "👕",
  Savings: "💰",
  "Investment Returns": "📈",
  "Gift Received": "🎁",
  "Gift Given": "🎁",
  "Charity/Donation": "❤️",
  Insurance: "🛡️",
  "Loan Payment": "💳",
  Business: "🏢",
  "Other Income": "💵",
  Rent: "🏠",
  "Personal Care": "💆",
  Travel: "✈️",
  "Other Expense": "📦",
};

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment Returns",
  "Gift Received",
  "Other Income",
];

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Bills & Utilities",
  "Rent",
  "Groceries",
  "Healthcare",
  "Education",
  "Entertainment",
  "Clothing",
  "Personal Care",
  "Mobile Recharge",
  "Internet Bill",
  "Savings",
  "Travel",
  "Gift Given",
  "Charity/Donation",
  "Insurance",
  "Loan Payment",
  "Other Expense",
];

export const toBanglaNumber = (n: number): string => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return n
    .toLocaleString("en-US")
    .replace(/\d/g, (d) => banglaDigits[parseInt(d)]);
};
