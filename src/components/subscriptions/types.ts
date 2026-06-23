export type BillingCycle =
  | "monthly"
  | "quarterly"
  | "semiAnnual"
  | "annual"
  | "weekly"
  | "custom";

export type SubCategory =
  | "streaming"
  | "software"
  | "food"
  | "transport"
  | "fitness"
  | "education"
  | "other";

export interface Subscription {
  _id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  category: SubCategory;
  startDate: number;
  nextRenewal: number;
  paymentMethod: string;
  autoRenew: boolean;
  alertBefore: number;
  usageRating: number;
  status: "active" | "cancelled";
  cancelledAt?: number;
}

export const CATEGORY_CONFIG: Record<
  SubCategory,
  { color: string; icon: string }
> = {
  streaming: { color: "#e11d48", icon: "🎬" },
  software: { color: "#7c3aed", icon: "💻" },
  food: { color: "#ea580c", icon: "🍔" },
  transport: { color: "#0891b2", icon: "🚌" },
  fitness: { color: "#16a34a", icon: "🏋️" },
  education: { color: "#2563eb", icon: "📚" },
  other: { color: "#6b7280", icon: "📦" },
};

export const PAYMENT_METHODS = [
  "Bkash",
  "Nagad",
  "Rocket",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "PayPal",
  "Other",
];

export const ALERT_OPTIONS = [
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "1 week" },
  { value: 14, label: "2 weeks" },
  { value: 30, label: "1 month" },
];

export function calculateMonthlyCost(
  amount: number,
  cycle: BillingCycle,
): number {
  switch (cycle) {
    case "weekly":
      return amount * 4.33;
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "semiAnnual":
      return amount / 6;
    case "annual":
      return amount / 12;
    case "custom":
      return amount;
    default:
      return amount;
  }
}

export function calculateNextRenewal(
  startDate: number,
  cycle: BillingCycle,
): number {
  const now = Date.now();
  const start = new Date(startDate);
  const next = new Date(startDate);

  switch (cycle) {
    case "weekly": {
      const diffWeeks = Math.floor(
        (now - startDate) / (7 * 24 * 60 * 60 * 1000),
      );
      next.setTime(start.getTime() + (diffWeeks + 1) * 7 * 24 * 60 * 60 * 1000);
      break;
    }
    case "monthly": {
      const diffMonths = Math.floor(
        (now - startDate) / (30 * 24 * 60 * 60 * 1000),
      );
      next.setTime(
        start.getTime() + (diffMonths + 1) * 30 * 24 * 60 * 60 * 1000,
      );
      break;
    }
    case "quarterly": {
      const diffQuarters = Math.floor(
        (now - startDate) / (90 * 24 * 60 * 60 * 1000),
      );
      next.setTime(
        start.getTime() + (diffQuarters + 1) * 90 * 24 * 60 * 60 * 1000,
      );
      break;
    }
    case "semiAnnual": {
      const diffHalf = Math.floor(
        (now - startDate) / (180 * 24 * 60 * 60 * 1000),
      );
      next.setTime(
        start.getTime() + (diffHalf + 1) * 180 * 24 * 60 * 60 * 1000,
      );
      break;
    }
    case "annual": {
      const diffYears = Math.floor(
        (now - startDate) / (365 * 24 * 60 * 60 * 1000),
      );
      next.setTime(
        start.getTime() + (diffYears + 1) * 365 * 24 * 60 * 60 * 1000,
      );
      break;
    }
    default: {
      next.setTime(now + 30 * 24 * 60 * 60 * 1000);
      break;
    }
  }

  return next.getTime();
}

export function getDaysUntilRenewal(renewalDate: number, now: number): number {
  return Math.ceil((renewalDate - now) / (24 * 60 * 60 * 1000));
}

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
};

export const emptyForm = {
  name: "",
  amount: "",
  billingCycle: "monthly" as BillingCycle,
  category: "streaming" as SubCategory,
  startDate: new Date().toISOString().split("T")[0],
  paymentMethod: "Bkash",
  autoRenew: true,
  alertBefore: 3,
  usageRating: 3,
};
