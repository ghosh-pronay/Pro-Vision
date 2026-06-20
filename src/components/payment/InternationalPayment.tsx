import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Globe,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/i18n/LanguageContext";

type Currency = "USD" | "EUR" | "GBP" | "BDT";
type CardType = "visa" | "mastercard" | "amex" | "unknown";

const CURRENCIES: Record<
  Currency,
  { symbol: string; name: string; nameBn: string }
> = {
  USD: { symbol: "$", name: "US Dollar", nameBn: "মার্কিন ডলার" },
  EUR: { symbol: "€", name: "Euro", nameBn: "ইউরো" },
  GBP: { symbol: "£", name: "British Pound", nameBn: "ব্রিটিশ পাউন্ড" },
  BDT: { symbol: "৳", name: "Bangladeshi Taka", nameBn: "বাংলাদেশি টাকা" },
};

const CARD_BRANDS: Record<
  CardType,
  { name: string; pattern: RegExp; icon: string }
> = {
  visa: { name: "Visa", pattern: /^4/, icon: "💳" },
  mastercard: { name: "Mastercard", pattern: /^5[1-5]/, icon: "💳" },
  amex: { name: "American Express", pattern: /^3[47]/, icon: "💳" },
  unknown: { name: "Card", pattern: /.*/, icon: "💳" },
};

interface InternationalPaymentProps {
  onPaymentComplete?: (data: {
    cardNumber: string;
    cardholder: string;
    expiry: string;
    amount: number;
    currency: Currency;
    method: "card" | "paypal" | "stripe";
    transactionId: string;
  }) => void;
}

export default function InternationalPayment({
  onPaymentComplete,
}: InternationalPaymentProps) {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<"card" | "paypal" | "stripe">(
    "card",
  );
  const [currency, setCurrency] = useState<Currency>("USD");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholder, setCardholder] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const detectCardType = (number: string): CardType => {
    const cleaned = number.replace(/\D/g, "");
    if (CARD_BRANDS.visa.pattern.test(cleaned)) return "visa";
    if (CARD_BRANDS.mastercard.pattern.test(cleaned)) return "mastercard";
    if (CARD_BRANDS.amex.pattern.test(cleaned)) return "amex";
    return "unknown";
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, "").slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  const validateCardForm = (): boolean => {
    const cleanedCard = cardNumber.replace(/\D/g, "");
    if (cleanedCard.length < 15) {
      setError(
        lang === "bn" ? "সঠিক কার্ড নম্বর দিন" : "Enter valid card number",
      );
      return false;
    }
    if (expiry.length < 5) {
      setError(
        lang === "bn"
          ? "সঠিক মেয়াদ দিন (MM/YY)"
          : "Enter valid expiry (MM/YY)",
      );
      return false;
    }
    if (cvv.length < 3) {
      setError(lang === "bn" ? "সঠিক CVV দিন" : "Enter valid CVV");
      return false;
    }
    if (!cardholder.trim()) {
      setError(
        lang === "bn" ? "কার্ডধারীর নাম লিখুন" : "Enter cardholder name",
      );
      return false;
    }
    if (parseFloat(amount) < 1) {
      setError(
        lang === "bn"
          ? "অনুগ্রহ করে একটি পরিমাণ লিখুন"
          : "Please enter an amount",
      );
      return false;
    }
    setError("");
    return true;
  };

  const handlePayment = async (method: "card" | "paypal" | "stripe") => {
    if (method === "card" && !validateCardForm()) return;

    setLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const transactionId = `INT${Date.now().toString(36).toUpperCase()}`;

      setSuccess(true);
      onPaymentComplete?.({
        cardNumber: cardNumber.replace(/\D/g, ""),
        cardholder,
        expiry,
        amount: parseFloat(amount) || 0,
        currency,
        method,
        transactionId,
      });

      setTimeout(() => {
        setSuccess(false);
        setCardNumber("");
        setExpiry("");
        setCvv("");
        setCardholder("");
        setAmount("");
      }, 3000);
    } catch {
      setError(
        lang === "bn"
          ? "পেমেন্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
          : "Payment failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cardType = detectCardType(cardNumber);
  const currencyConfig = CURRENCIES[currency];

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20">
          <Globe className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-lg font-semibold">
          {lang === "bn" ? "আন্তর্জাতিক পেমেন্ট" : "International Payment"}
        </h3>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-3 gap-2 glass rounded-xl p-1"
      >
        {(["card", "paypal", "stripe"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setError("");
            }}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "card"
              ? "💳 Card"
              : tab === "paypal"
                ? "🅿️ PayPal"
                : "⚡ Stripe"}
          </button>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <label className="block text-sm font-medium mb-2">
          {lang === "bn" ? "মুদ্রা" : "Currency"}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(CURRENCIES) as Currency[]).map((cur) => (
            <button
              key={cur}
              onClick={() => setCurrency(cur)}
              className={`glass rounded-lg py-2 px-3 text-sm transition-all ${
                currency === cur
                  ? "ring-2 ring-primary bg-primary/10"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="font-medium">{CURRENCIES[cur].symbol}</div>
              <div className="text-xs text-muted-foreground">{cur}</div>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass rounded-2xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-400 mb-4" />
            </motion.div>
            <h4 className="text-xl font-semibold mb-2">
              {lang === "bn" ? "পেমেন্ট সফল!" : "Payment Successful!"}
            </h4>
            <p className="text-muted-foreground">
              {currencyConfig.symbol}
              {amount || "0"} {lang === "bn" ? "পাঠানো হয়েছে" : "sent"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {activeTab === "card" && (
              <>
                <motion.div variants={fadeUp}>
                  <label className="block text-sm font-medium mb-2">
                    {lang === "bn" ? "পরিমাণ" : "Amount"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currencyConfig.symbol}
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      className="glass pl-8"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label className="block text-sm font-medium mb-2">
                    {lang === "bn" ? "কার্ড নম্বর" : "Card Number"}
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      maxLength={19}
                      className="glass pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                      {CARD_BRANDS[cardType].icon}
                    </span>
                  </div>
                  {cardType !== "unknown" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {CARD_BRANDS[cardType].name}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {lang === "bn" ? "মেয়াদ" : "Expiry"}
                    </label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      className="glass"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CVV
                    </label>
                    <Input
                      type="password"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      maxLength={4}
                      className="glass"
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <label className="block text-sm font-medium mb-2">
                    {lang === "bn" ? "কার্ডধারীর নাম" : "Cardholder Name"}
                  </label>
                  <Input
                    type="text"
                    placeholder={lang === "bn" ? "নাম লিখুন" : "Enter name"}
                    value={cardholder}
                    onChange={(e) => setCardholder(e.target.value)}
                    className="glass"
                  />
                </motion.div>
              </>
            )}

            {activeTab === "paypal" && (
              <motion.div
                variants={fadeUp}
                className="glass rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">🅿️</div>
                <p className="text-muted-foreground mb-4">
                  {lang === "bn"
                    ? "PayPal এর মাধ্যমে পেমেন্ট করুন"
                    : "Pay securely with PayPal"}
                </p>
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencyConfig.symbol}
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    className="glass pl-8"
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "stripe" && (
              <motion.div
                variants={fadeUp}
                className="glass rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">⚡</div>
                <p className="text-muted-foreground mb-4">
                  {lang === "bn"
                    ? "Stripe দ্বারা নিরাপদে পেমেন্ট করুন"
                    : "Secure payment powered by Stripe"}
                </p>
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencyConfig.symbol}
                  </span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    className="glass pl-8"
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-red-400 glass rounded-xl p-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <motion.div variants={fadeUp}>
              <Button
                onClick={() => handlePayment(activeTab)}
                disabled={loading || !amount}
                className="w-full glass"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    {activeTab === "card"
                      ? lang === "bn"
                        ? "পেমেন্ট করুন"
                        : "Pay Now"
                      : activeTab === "paypal"
                        ? lang === "bn"
                          ? "PayPal এ পেমেন্ট"
                          : "Pay with PayPal"
                        : lang === "bn"
                          ? "Stripe এ পেমেন্ট"
                          : "Pay with Stripe"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
