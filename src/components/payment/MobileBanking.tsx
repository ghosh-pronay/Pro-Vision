import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/i18n/LanguageContext";

type MFSProvider = "bkash" | "nagad" | "rocket";

interface MFSConfig {
  name: string;
  nameBn: string;
  fee: number;
  color: string;
  icon: string;
}

const MFS_PROVIDERS: Record<MFSProvider, MFSConfig> = {
  bkash: {
    name: "bKash",
    nameBn: "বিকাশ",
    fee: 1.5,
    color: "#E2136E",
    icon: "📱",
  },
  nagad: {
    name: "Nagad",
    nameBn: "নগদ",
    fee: 1,
    color: "#F6921E",
    icon: "💳",
  },
  rocket: {
    name: "Rocket",
    nameBn: "রকেট",
    fee: 1.5,
    color: "#8B2D88",
    icon: "🚀",
  },
};

interface MobileBankingProps {
  onPaymentComplete?: (data: {
    provider: MFSProvider;
    phone: string;
    amount: number;
    fee: number;
    total: number;
    transactionId: string;
  }) => void;
}

export default function MobileBanking({
  onPaymentComplete,
}: MobileBankingProps) {
  const { lang } = useLang();
  const [selectedProvider, setSelectedProvider] =
    useState<MFSProvider>("bkash");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const config = MFS_PROVIDERS[selectedProvider];
  const numericAmount = parseFloat(amount) || 0;
  const fee = numericAmount * (config.fee / 100);
  const total = numericAmount + fee;

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  };

  const validateForm = (): boolean => {
    const rawPhone = phone.replace(/\D/g, "");
    if (rawPhone.length !== 11 || !rawPhone.startsWith("01")) {
      setError(
        lang === "bn"
          ? "সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)"
          : "Enter valid mobile number (01XXXXXXXXX)",
      );
      return false;
    }
    if (numericAmount < 1) {
      setError(
        lang === "bn"
          ? "অনুগ্রহ করে একটি পরিমাণ লিখুন"
          : "Please enter an amount",
      );
      return false;
    }
    if (numericAmount > 25000) {
      setError(
        lang === "bn"
          ? "সর্বোচ্চ ৳২৫,০০০ পর্যন্ত পাঠাতে পারবেন"
          : "Maximum ৳25,000 per transaction",
      );
      return false;
    }
    if (pin.length < 4) {
      setError(
        lang === "bn"
          ? "PIN কমপক্ষে ৪ ডিজিট হতে হবে"
          : "PIN must be at least 4 digits",
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const transactionId = `TXN${Date.now().toString(36).toUpperCase()}`;

      setSuccess(true);
      onPaymentComplete?.({
        provider: selectedProvider,
        phone: phone.replace(/\D/g, ""),
        amount: numericAmount,
        fee,
        total,
        transactionId,
      });

      setTimeout(() => {
        setSuccess(false);
        setPhone("");
        setAmount("");
        setPin("");
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
        <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
          <Smartphone className="w-5 h-5 text-pink-400" />
        </div>
        <h3 className="text-lg font-semibold">
          {lang === "bn" ? "মোবাইল ব্যাংকিং" : "Mobile Banking"}
        </h3>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
        {(Object.keys(MFS_PROVIDERS) as MFSProvider[]).map((provider) => {
          const cfg = MFS_PROVIDERS[provider];
          return (
            <button
              key={provider}
              onClick={() => {
                setSelectedProvider(provider);
                setError("");
              }}
              className={`glass rounded-xl p-4 transition-all ${
                selectedProvider === provider
                  ? "ring-2 ring-offset-2 ring-offset-background"
                  : "hover:bg-white/5"
              }`}
              style={{
                borderColor:
                  selectedProvider === provider ? cfg.color : undefined,
                boxShadow:
                  selectedProvider === provider
                    ? `0 0 20px ${cfg.color}33`
                    : undefined,
              }}
            >
              <div className="text-2xl mb-2">{cfg.icon}</div>
              <div className="font-medium text-sm">
                {lang === "bn" ? cfg.nameBn : cfg.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {cfg.fee}% {lang === "bn" ? "ফি" : "fee"}
              </div>
            </button>
          );
        })}
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
              {lang === "bn"
                ? `${config.nameBn} এ ৳${total.toFixed(2)} পাঠানো হয়েছে`
                : `৳${total.toFixed(2)} sent via ${config.name}`}
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
            <motion.div variants={fadeUp}>
              <label className="block text-sm font-medium mb-2">
                {lang === "bn" ? "মোবাইল নম্বর" : "Mobile Number"}
              </label>
              <Input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                maxLength={13}
                className="glass"
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-sm font-medium mb-2">
                {lang === "bn" ? "পরিমাণ (৳)" : "Amount (৳)"}
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max="25000"
                className="glass"
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-sm font-medium mb-2">
                {lang === "bn" ? "PIN" : "PIN"}
              </label>
              <Input
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 5))
                }
                maxLength={5}
                className="glass"
              />
            </motion.div>

            {numericAmount > 0 && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="glass rounded-xl p-4 space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {lang === "bn" ? "পরিমাণ" : "Amount"}
                  </span>
                  <span>৳{numericAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {lang === "bn" ? "সেবা ফি" : "Service Fee"} ({config.fee}%)
                  </span>
                  <span>৳{fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-medium">
                  <span>{lang === "bn" ? "মোট" : "Total"}</span>
                  <span className="text-primary">৳{total.toFixed(2)}</span>
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
                onClick={handleSubmit}
                disabled={loading || !phone || !amount || !pin}
                className="w-full glass"
                style={{
                  backgroundColor: `${config.color}22`,
                  borderColor: config.color,
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {lang === "bn" ? "টাকা পাঠান" : "Send Money"}
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
