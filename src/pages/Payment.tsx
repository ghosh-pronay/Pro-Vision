import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState } from "react";
import {
  CreditCard,
  Crown,
  CheckCircle2,
  Star,
  Shield,
  Lock,
  Headphones,
  Smartphone,
  Building2,
  Globe,
  X,
  Zap,
  Users,
  Sparkles,
  Clock,
  Tag,
  Loader2,
  Check,
  AlertCircle,
  Eye,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

interface Plan {
  id: string;
  name: { en: string; bn: string };
  priceBdt: number;
  priceUsd: number;
  period: { en: string; bn: string };
  features: Array<{ en: string; bn: string }>;
  highlight?: boolean;
  icon: React.ReactNode;
  color: string;
  glow: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: { en: "Free", bn: "ফ্রি" },
    priceBdt: 0,
    priceUsd: 0,
    period: { en: "/month", bn: "/মাস" },
    features: [
      { en: "Basic task management", bn: "বেসিক কাজ ব্যবস্থাপনা" },
      { en: "50 Coach messages/day", bn: "প্রতিদিন ৫০টি কোচ বার্তা" },
      { en: "10 wallets", bn: "১০টি ওয়ালেট" },
      { en: "Offline mode", bn: "অফলাইন মোড" },
      { en: "1 user", bn: "১ জন ব্যবহারকারী" },
    ],
    icon: <Zap className="size-5" />,
    color: "var(--pv-teal)",
    glow: "glow-teal",
  },
  {
    id: "pro",
    name: { en: "Pro", bn: "প্রো" },
    priceBdt: 199,
    priceUsd: 2.49,
    period: { en: "/month", bn: "/মাস" },
    highlight: true,
    features: [
      { en: "All features", bn: "সব বৈশিষ্ট্য" },
      { en: "Unlimited wallets", bn: "অসীম ওয়ালেট" },
      { en: "AI Daily Plan Generator", bn: "AI দৈনিক পরিকল্পনা জেনারেটর" },
      { en: "Advanced analytics", bn: "উন্নত অ্যানালিটিক্স" },
      { en: "Ad-free experience", bn: "বিজ্ঞাপন-মুক্ত অভিজ্ঞতা" },
      { en: "1 user", bn: "১ জন ব্যবহারকারী" },
    ],
    icon: <Crown className="size-5" />,
    color: "var(--pv-blue)",
    glow: "glow-blue",
  },
  {
    id: "enterprise",
    name: { en: "Enterprise", bn: "এন্টারপ্রাইজ" },
    priceBdt: 499,
    priceUsd: 5.99,
    period: { en: "/month", bn: "/মাস" },
    features: [
      { en: "All Pro features", bn: "সব প্রো বৈশিষ্ট্য" },
      { en: "Team collaboration", bn: "টিম সহযোগিতা" },
      { en: "Unlimited users", bn: "অসীম ব্যবহারকারী" },
      { en: "Priority support", bn: "অগ্রাধিকার সহাযতা" },
      { en: "Custom integrations", bn: "কাস্টম ইন্টিগ্রেশন" },
      { en: "Admin dashboard", bn: "অ্যাডমিন ড্যাশবোর্ড" },
    ],
    icon: <Users className="size-5" />,
    color: "var(--pv-lavender)",
    glow: "glow-purple",
  },
];

interface PaymentMethod {
  id: string;
  name: { en: string; bn: string };
  icon: React.ReactNode;
  type: "mfs" | "bank" | "international";
  description: { en: string; bn: string };
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "bkash",
    name: { en: "bKash", bn: "বিকাশ" },
    icon: <Smartphone className="size-5" />,
    type: "mfs",
    description: { en: "Mobile Financial Service", bn: "মোবাইল আর্থিক সেবা" },
  },
  {
    id: "nagad",
    name: { en: "Nagad", bn: "নগদ" },
    icon: <Smartphone className="size-5" />,
    type: "mfs",
    description: { en: "Mobile Financial Service", bn: "মোবাইল আর্থিক সেবা" },
  },
  {
    id: "rocket",
    name: { en: "Rocket", bn: "রকেট" },
    icon: <Smartphone className="size-5" />,
    type: "mfs",
    description: { en: "DBBL Mobile Banking", bn: "ডিবিবিএল মোবাইল ব্যাংকিং" },
  },
  {
    id: "dbbl",
    name: { en: "DBBL Nexus", bn: "ডিবিবিএল নেক্সাস" },
    icon: <CreditCard className="size-5" />,
    type: "mfs",
    description: { en: "Debit Card", bn: "ডেবিট কার্ড" },
  },
  {
    id: "bkashbank",
    name: { en: "bKash Bank", bn: "বিকাশ ব্যাংক" },
    icon: <Building2 className="size-5" />,
    type: "bank",
    description: { en: "Direct Bank Transfer", bn: "সরাসরি ব্যাংক ট্রান্সফার" },
  },
  {
    id: "nrb",
    name: { en: "NRB Bank", bn: "এনআরবি ব্যাংক" },
    icon: <Building2 className="size-5" />,
    type: "bank",
    description: {
      en: "NRB Account Transfer",
      bn: "এনআরবি অ্যাকাউন্ট ট্রান্সফার",
    },
  },
  {
    id: "sslcommerz",
    name: { en: "SSL Commerz", bn: "এসএসএল কমার্জ" },
    icon: <Building2 className="size-5" />,
    type: "bank",
    description: { en: "All Banks & Cards", bn: "সব ব্যাংক ও কার্ড" },
  },
  {
    id: "stripe",
    name: { en: "Stripe", bn: "স্ট্রাইপ" },
    icon: <Globe className="size-5" />,
    type: "international",
    description: { en: "Credit/Debit Card", bn: "ক্রেডিট/ডেবিট কার্ড" },
  },
  {
    id: "paypal",
    name: { en: "PayPal", bn: "পেপাল" },
    icon: <Globe className="size-5" />,
    type: "international",
    description: { en: "Global Payment", bn: "গ্লোবাল পেমেন্ট" },
  },
  {
    id: "wise",
    name: { en: "Wise", bn: "ওয়াইজ" },
    icon: <Globe className="size-5" />,
    type: "international",
    description: { en: "International Transfer", bn: "আন্তর্জাতিক ট্রান্সফার" },
  },
];

interface Transaction {
  id: string;
  plan: { en: string; bn: string };
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  date: string;
  method: string;
}

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    plan: { en: "Pro Plan", bn: "প্রো প্ল্যান" },
    amount: 199,
    currency: "BDT",
    status: "completed",
    date: "2026-05-15",
    method: "bKash",
  },
  {
    id: "2",
    plan: { en: "Pro Plan", bn: "প্রো প্ল্যান" },
    amount: 199,
    currency: "BDT",
    status: "completed",
    date: "2026-04-15",
    method: "Nagad",
  },
  {
    id: "3",
    plan: { en: "Enterprise Plan", bn: "এন্টারপ্রাইজ প্ল্যান" },
    amount: 499,
    currency: "BDT",
    status: "pending",
    date: "2026-06-01",
    method: "SSL Commerz",
  },
  {
    id: "4",
    plan: { en: "Pro Plan", bn: "প্রো প্ল্যান" },
    amount: 2.49,
    currency: "USD",
    status: "completed",
    date: "2026-03-15",
    method: "Stripe",
  },
  {
    id: "5",
    plan: { en: "Pro Plan", bn: "প্রো প্ল্যান" },
    amount: 199,
    currency: "BDT",
    status: "failed",
    date: "2026-02-15",
    method: "Rocket",
  },
];

const CURRENCIES = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

export default function Payment() {
  const { lang } = useLang();

  const [currentPlan] = useState<string | null>("pro");
  const [pricingCurrency, setPricingCurrency] = useState<"BDT" | "USD">("BDT");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentTab, setPaymentTab] = useState<
    "mfs" | "bank" | "international"
  >("mfs");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentCurrency, setPaymentCurrency] = useState("BDT");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const currentPlanData = PLANS.find((p) => p.id === currentPlan);
  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan);
  const filteredMethods = PAYMENT_METHODS.filter((m) => m.type === paymentTab);

  const getAmount = (plan: Plan) => {
    return pricingCurrency === "BDT" ? plan.priceBdt : plan.priceUsd;
  };

  const getCurrencySymbol = () => {
    const c = CURRENCIES.find((c) => c.code === paymentCurrency);
    return c?.symbol || "";
  };

  const applyPromo = () => {
    if (promoCode.toUpperCase() === "PRO20") {
      setPromoApplied(true);
      setPromoDiscount(20);
    } else if (promoCode.toUpperCase() === "WELCOME10") {
      setPromoApplied(true);
      setPromoDiscount(10);
    } else {
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const handlePay = async () => {
    setIsPaying(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsPaying(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-[var(--pv-green)] bg-[var(--pv-green)]/10";
      case "pending":
        return "text-[var(--pv-orange)] bg-[var(--pv-orange)]/10";
      case "failed":
        return "text-red-400 bg-red-500/10";
      default:
        return "text-muted-foreground bg-muted/10";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return lang === "bn" ? "সম্পন্ন" : "Completed";
      case "pending":
        return lang === "bn" ? "বিচারাধীন" : "Pending";
      case "failed":
        return lang === "bn" ? "ব্যর্থ" : "Failed";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "bn" ? "পেমেন্ট" : "Payment"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === "bn"
              ? "আপনার সাবস্ক্রিপশন এবং পেমেন্ট পরিচালনা করুন"
              : "Manage your subscription and payments"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-[var(--pv-green)]" />
          <span className="text-xs text-muted-foreground">
            {lang === "bn" ? "SSL এনক্রিপ্টেড" : "SSL Encrypted"}
          </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass rounded-2xl p-6 text-center border border-[var(--pv-green)]/30"
          >
            <div className="size-16 mx-auto mb-4 rounded-full bg-[var(--pv-green)]/20 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-[var(--pv-green)]" />
            </div>
            <h3 className="text-lg font-bold text-foreground">
              {lang === "bn" ? "পেমেন্ট সফল!" : "Payment Successful!"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {lang === "bn"
                ? "আপনার সাবস্ক্রিপশন সফলভাবে আপগ্রেড হয়েছে"
                : "Your subscription has been successfully upgraded"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {currentPlanData && !selectedPlan && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className={`glass rounded-2xl p-6 ${currentPlanData.glow}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="size-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `${currentPlanData.color}20`,
                  color: currentPlanData.color,
                }}
              >
                {currentPlanData.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">
                    {currentPlanData.name[lang]}
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${currentPlanData.color}20`,
                      color: currentPlanData.color,
                    }}
                  >
                    {lang === "bn" ? "বর্তমান" : "Current"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {currentPlanData.priceBdt > 0
                    ? `৳${currentPlanData.priceBdt}${lang === "bn" ? "/মাস" : "/month"}`
                    : lang === "bn"
                      ? "বিনামূল্যে"
                      : "Free"}
                  {" · "}
                  {lang === "bn"
                    ? `পুনর্নবীকরণ: জুলাই ১৫, ২০২৬`
                    : `Renews: Jul 15, 2026`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPlan("enterprise")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium glass hover:bg-foreground/5 transition-all"
              >
                {lang === "bn" ? "আপগ্রেড" : "Upgrade"}
              </button>
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all">
                {lang === "bn" ? "বাতিল" : "Cancel"}
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/20">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Infinity className="size-3.5" />
                <span>
                  {lang === "bn" ? "অসীম ওয়ালেট" : "Unlimited Wallets"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Sparkles className="size-3.5" />
                <span>{lang === "bn" ? "AI কোচ" : "AI Coach"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Star className="size-3.5" />
                <span>{lang === "bn" ? "বিজ্ঞাপন-মুক্ত" : "Ad-free"}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            {selectedPlan
              ? lang === "bn"
                ? "পেমেন্ট করুন"
                : "Make Payment"
              : lang === "bn"
                ? "প্ল্যান নির্বাচন করুন"
                : "Choose a Plan"}
          </h2>
          {!selectedPlan && (
            <div className="flex items-center gap-1 p-1 glass rounded-lg">
              <button
                onClick={() => setPricingCurrency("BDT")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  pricingCurrency === "BDT"
                    ? "bg-[var(--pv-blue)] text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                BDT
              </button>
              <button
                onClick={() => setPricingCurrency("USD")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  pricingCurrency === "USD"
                    ? "bg-[var(--pv-blue)] text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                USD
              </button>
            </div>
          )}
        </div>

        {!selectedPlan && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                className={`glass rounded-2xl p-5 transition-all hover:scale-[1.02] ${
                  plan.highlight
                    ? `border border-[var(--pv-blue)]/30 ${plan.glow}`
                    : ""
                } ${currentPlan === plan.id ? "opacity-60" : ""}`}
              >
                {plan.highlight && (
                  <div className="flex items-center gap-1 mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--pv-blue)] text-white">
                      {lang === "bn" ? "সবচেয়ে জনপ্রিয়" : "MOST POPULAR"}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="size-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${plan.color}20`, color: plan.color }}
                  >
                    {plan.icon}
                  </div>
                  <h3 className="font-bold text-foreground">
                    {plan.name[lang]}
                  </h3>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">
                    {plan.priceBdt === 0
                      ? lang === "bn"
                        ? "বিনামূল্যে"
                        : "Free"
                      : pricingCurrency === "BDT"
                        ? `৳${plan.priceBdt}`
                        : `$${plan.priceUsd}`}
                  </span>
                  {plan.priceBdt > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period[lang]}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2
                        className="size-3.5 shrink-0"
                        style={{ color: plan.color }}
                      />
                      {feature[lang]}
                    </li>
                  ))}
                </ul>

                {currentPlan === plan.id ? (
                  <div className="w-full py-2.5 rounded-xl text-center text-sm font-medium glass text-muted-foreground">
                    {lang === "bn" ? "বর্তমান প্ল্যান" : "Current Plan"}
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.97] ${
                      plan.highlight
                        ? "text-white"
                        : "text-foreground glass hover:bg-foreground/5"
                    }`}
                    style={
                      plan.highlight
                        ? {
                            background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                          }
                        : undefined
                    }
                  >
                    {lang === "bn" ? "এই প্ল্যান নিন" : "Get This Plan"}
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedPlan && selectedPlanData && (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${selectedPlanData.color}20`,
                    color: selectedPlanData.color,
                  }}
                >
                  {selectedPlanData.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    {selectedPlanData.name[lang]}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlanData.priceBdt === 0
                      ? lang === "bn"
                        ? "বিনামূল্যে"
                        : "Free"
                      : pricingCurrency === "BDT"
                        ? `৳${selectedPlanData.priceBdt}/মাস`
                        : `$${selectedPlanData.priceUsd}/month`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setSelectedMethod(null);
                }}
                className="size-8 rounded-lg glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-4"
            >
              <h3 className="font-semibold text-foreground mb-3">
                {lang === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment Method"}
              </h3>

              <div className="flex gap-1 p-1 glass rounded-lg mb-4">
                {[
                  {
                    id: "mfs" as const,
                    icon: Smartphone,
                    label: {
                      en: "Mobile Financial Services",
                      bn: "মোবাইল আর্থিক সেবা",
                    },
                  },
                  {
                    id: "bank" as const,
                    icon: Building2,
                    label: { en: "Bank Transfer", bn: "ব্যাংক ট্রান্সফার" },
                  },
                  {
                    id: "international" as const,
                    icon: Globe,
                    label: { en: "International", bn: "আন্তর্জাতিক" },
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setPaymentTab(tab.id);
                      setSelectedMethod(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      paymentTab === tab.id
                        ? "bg-[var(--pv-blue)] text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    <tab.icon className="size-3.5" />
                    <span className="hidden sm:inline">{tab.label[lang]}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedMethod === method.id
                        ? "glass border-2 border-[var(--pv-blue)]/50 glow-blue"
                        : "glass hover:bg-foreground/5 border-2 border-transparent"
                    }`}
                  >
                    <div className="size-10 rounded-lg bg-[var(--pv-blue)]/10 flex items-center justify-center text-[var(--pv-blue)]">
                      {method.icon}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-foreground">
                        {method.name[lang]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {method.description[lang]}
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <Check className="size-4 text-[var(--pv-blue)] ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            {selectedMethod && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-4 space-y-4"
              >
                <h3 className="font-semibold text-foreground">
                  {lang === "bn" ? "পেমেন্ট তথ্য" : "Payment Details"}
                </h3>

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    {lang === "bn" ? "পরিমাণ" : "Amount"}
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {getCurrencySymbol()}
                      </span>
                      <input
                        type="number"
                        value={
                          selectedPlanData ? getAmount(selectedPlanData) : ""
                        }
                        readOnly
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl glass text-foreground text-sm font-medium border border-border/30 focus:outline-none"
                      />
                    </div>
                    <select
                      value={paymentCurrency}
                      onChange={(e) => setPaymentCurrency(e.target.value)}
                      className="px-3 py-2.5 rounded-xl glass text-foreground text-sm border border-border/30 focus:outline-none bg-transparent"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(selectedMethod === "bkash" ||
                  selectedMethod === "nagad" ||
                  selectedMethod === "rocket") && (
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      {lang === "bn" ? "মোবাইল নম্বর" : "Mobile Number"}
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-3 py-2.5 rounded-xl glass text-foreground text-sm border border-border/30 focus:outline-none focus:border-[var(--pv-blue)]/50 placeholder:text-muted-foreground/50"
                    />
                  </div>
                )}

                {(selectedMethod === "stripe" ||
                  selectedMethod === "paypal" ||
                  selectedMethod === "wise") && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">
                        {lang === "bn" ? "কার্ড নম্বর" : "Card Number"}
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-3 py-2.5 rounded-xl glass text-foreground text-sm border border-border/30 focus:outline-none focus:border-[var(--pv-blue)]/50 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">
                          {lang === "bn" ? "মেয়াদ" : "Expiry"}
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2.5 rounded-xl glass text-foreground text-sm border border-border/30 focus:outline-none focus:border-[var(--pv-blue)]/50 placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1 block">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="w-full px-3 py-2.5 rounded-xl glass text-foreground text-sm border border-border/30 focus:outline-none focus:border-[var(--pv-blue)]/50 placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>
                  </>
                )}

                {(selectedMethod === "bkashbank" ||
                  selectedMethod === "nrb" ||
                  selectedMethod === "sslcommerz") && (
                  <>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">
                        {lang === "bn" ? "অ্যাকাউন্ট নম্বর" : "Account Number"}
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl glass text-foreground text-sm border border-border/30 focus:outline-none focus:border-[var(--pv-blue)]/50 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">
                        {lang === "bn" ? "রাউটিং নম্বর" : "Routing Number"}
                      </label>
                      <input
                        type="text"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl glass text-foreground text-sm border border-border/30 focus:outline-none focus:border-[var(--pv-blue)]/50 placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    {lang === "bn" ? "প্রোমো কোড" : "Promo Code"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={lang === "bn" ? "কোড লিখুন" : "Enter code"}
                      className="flex-1 px-3 py-2.5 rounded-xl glass text-foreground text-sm border border-border/30 focus:outline-none focus:border-[var(--pv-blue)]/50 placeholder:text-muted-foreground/50"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-4 py-2.5 rounded-xl glass text-sm font-medium text-[var(--pv-blue)] hover:bg-foreground/5 transition-all"
                    >
                      {lang === "bn" ? "প্রয়োগ" : "Apply"}
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-xs text-[var(--pv-green)] mt-1 flex items-center gap-1">
                      <Tag className="size-3" />
                      {promoDiscount}%{" "}
                      {lang === "bn"
                        ? "ছাড় প্রয়োগ হয়েছে!"
                        : "discount applied!"}
                    </p>
                  )}
                </div>

                {promoApplied && selectedPlanData && (
                  <div className="p-3 rounded-xl glass border border-[var(--pv-green)]/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {lang === "bn" ? "মূল্য" : "Subtotal"}
                      </span>
                      <span className="text-foreground">
                        {getCurrencySymbol()}
                        {getAmount(selectedPlanData)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-[var(--pv-green)]">
                        {lang === "bn" ? "ছাড়" : "Discount"} ({promoDiscount}%)
                      </span>
                      <span className="text-[var(--pv-green)]">
                        -{getCurrencySymbol()}
                        {(getAmount(selectedPlanData) * promoDiscount) / 100}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-border/20">
                      <span className="font-semibold text-foreground">
                        {lang === "bn" ? "মোট" : "Total"}
                      </span>
                      <span className="font-bold text-foreground">
                        {getCurrencySymbol()}
                        {getAmount(selectedPlanData) -
                          (getAmount(selectedPlanData) * promoDiscount) / 100}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={isPaying}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, var(--pv-blue), var(--pv-blue-dark))`,
                  }}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {lang === "bn" ? "প্রক্রিয়াকরণ..." : "Processing..."}
                    </>
                  ) : (
                    <>
                      <Lock className="size-4" />
                      {lang === "bn" ? "নিরাপদে পেমেন্ট করুন" : "Pay Securely"}
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="glass rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">
            {lang === "bn" ? "সাম্প্রতিক লেনদেন" : "Recent Transactions"}
          </h3>
          <button
            onClick={() => setShowAllTransactions(!showAllTransactions)}
            className="text-xs text-[var(--pv-blue)] hover:underline flex items-center gap-1"
          >
            {showAllTransactions
              ? lang === "bn"
                ? "কম দেখুন"
                : "Show Less"
              : lang === "bn"
                ? "সব দেখুন"
                : "View All"}
            <Eye className="size-3" />
          </button>
        </div>

        <div className="space-y-2">
          {(showAllTransactions
            ? DEMO_TRANSACTIONS
            : DEMO_TRANSACTIONS.slice(0, 3)
          ).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 glass rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`size-9 rounded-lg flex items-center justify-center ${
                    tx.status === "completed"
                      ? "bg-[var(--pv-green)]/10 text-[var(--pv-green)]"
                      : tx.status === "pending"
                        ? "bg-[var(--pv-orange)]/10 text-[var(--pv-orange)]"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {tx.status === "completed" ? (
                    <CheckCircle2 className="size-4" />
                  ) : tx.status === "pending" ? (
                    <Clock className="size-4" />
                  ) : (
                    <AlertCircle className="size-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {tx.plan[lang]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.date)} · {tx.method}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {tx.currency === "BDT" ? "৳" : "$"}
                  {tx.amount}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(tx.status)}`}
                >
                  {getStatusLabel(tx.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 gap-3"
      >
        {[
          {
            icon: Lock,
            title: { en: "SSL Encrypted", bn: "SSL এনক্রিপ্টেড" },
            desc: { en: "256-bit security", bn: "256-বিট সুরক্ষা" },
          },
          {
            icon: Shield,
            title: { en: "Secure Payment", bn: "নিরাপদ পেমেন্ট" },
            desc: { en: "PCI DSS compliant", bn: "PCI DSS সম্মত" },
          },
          {
            icon: Headphones,
            title: { en: "24/7 Support", bn: "২৪/৭ সহায়তা" },
            desc: { en: "Always available", bn: "সবসময় উপলব্ধ" },
          },
        ].map((badge, i) => (
          <div key={i} className="glass rounded-xl p-3 text-center">
            <badge.icon className="size-5 mx-auto mb-1 text-[var(--pv-blue)]" />
            <p className="text-xs font-medium text-foreground">
              {badge.title[lang]}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {badge.desc[lang]}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
