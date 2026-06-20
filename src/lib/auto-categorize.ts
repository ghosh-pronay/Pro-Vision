import { EXPENSE_CATEGORIES } from "./categories";

interface CategorizationResult {
  category: string;
  type: "income" | "expense";
  confidence: number;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Food & Dining": ["food", "restaurant", "cafe", "coffee", "lunch", "dinner", "breakfast", "meal", "pizza", "burger", "tea", "snack"],
  "Transportation": ["uber", "taxi", "bus", "train", "metro", "fuel", "gas", "parking", "transport", "ride"],
  "Shopping": ["shop", "store", "mall", "amazon", "flipkart", "clothes", "shoes", "electronics"],
  "Bills & Utilities": ["electricity", "water", "gas", "internet", "wifi", "bill", "utility"],
  "Mobile Recharge": ["recharge", "mobile", "phone", "airtel", "grameen", "banglalink", "teletalk"],
  "Internet Bill": ["internet", "broadband", "wifi", "gp", "robi", "starlink"],
  "Groceries": ["grocery", "supermarket", "bazaar", "vegetable", "fruit", "milk", "bread"],
  "Healthcare": ["doctor", "hospital", "pharmacy", "medicine", "health", "medical", "clinic"],
  "Education": ["school", "college", "university", "course", "book", "tuition", "education"],
  "Entertainment": ["movie", "netflix", "spotify", "game", "concert", "show", "entertainment"],
  "Clothing": ["clothes", "shirt", "pant", "dress", "fashion", "zara", "h&m"],
  "Savings": ["savings", "fd", "deposit", "investment"],
  "Investment Returns": ["dividend", "interest", "return", "profit", "gain"],
  "Gift Received": ["gift", "present", "bonus", "reward"],
  "Gift Given": ["gift", "present", "birthday", "anniversary"],
  "Charity/Donation": ["donation", "charity", "zakat", "sadaqah", "ngo"],
  "Insurance": ["insurance", "premium", "policy"],
  "Loan Payment": ["loan", "emi", "installment", "repayment"],
  "Salary": ["salary", "wage", "pay", "stipend"],
  "Freelance": ["freelance", "client", "project", "gig", "fiverr", "upwork"],
  "Business": ["business", "revenue", "sales", "profit"],
};

function calculateConfidence(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  let matches = 0;
  for (const keyword of keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      matches++;
    }
  }
  return Math.min(matches / keywords.length, 1);
}

export function categorizeTransaction(
  description: string,
): CategorizationResult {
  const lowerDesc = description.toLowerCase();
  let bestMatch = { category: "Other Expense", type: "expense" as const, confidence: 0 };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const confidence = calculateConfidence(lowerDesc, keywords);
    if (confidence > bestMatch.confidence) {
      const categoryType = EXPENSE_CATEGORIES.income.some(
        (c) => c.name === category,
      )
        ? "income"
        : "expense";
      bestMatch = { category, type: categoryType, confidence };
    }
  }

  if (bestMatch.confidence === 0) {
    if (lowerDesc.includes("income") || lowerDesc.includes("receive") || lowerDesc.includes("earned")) {
      return { category: "Other Income", type: "income", confidence: 0.5 };
    }
    return { category: "Other Expense", type: "expense", confidence: 0 };
  }

  return bestMatch;
}

export function suggestCategories(
  recentTransactions: Array<{ description: string; category: string }>,
): Map<string, string[]> {
  const categoryMap = new Map<string, string[]>();

  for (const transaction of recentTransactions) {
    const existing = categoryMap.get(transaction.category) || [];
    if (!existing.includes(transaction.description)) {
      existing.push(transaction.description);
      categoryMap.set(transaction.category, existing.slice(-5));
    }
  }

  return categoryMap;
}

export function getSmartCategorySuggestion(
  description: string,
  userHistory?: Array<{ description: string; category: string }>,
): CategorizationResult {
  if (userHistory && userHistory.length > 0) {
    const lowerDesc = description.toLowerCase();
    for (const history of userHistory) {
      const historyWords = history.description.toLowerCase().split(/\s+/);
      const descWords = lowerDesc.split(/\s+/);
      const overlap = historyWords.filter((w) => descWords.includes(w)).length;
      if (overlap > 0) {
        const categoryType = EXPENSE_CATEGORIES.income.some(
          (c) => c.name === history.category,
        )
          ? "income"
          : "expense";
        return {
          category: history.category,
          type: categoryType,
          confidence: Math.min(overlap / historyWords.length, 0.9),
        };
      }
    }
  }

  return categorizeTransaction(description);
}
