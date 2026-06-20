import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Receipt,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";

type TransactionStatus = "completed" | "pending" | "failed";
type PaymentMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "bank"
  | "card"
  | "paypal"
  | "stripe";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: TransactionStatus;
  recipient?: string;
  fee?: number;
  reference?: string;
}

interface PaymentReceiptProps {
  transaction: Transaction;
  onDownload?: (transaction: Transaction) => void;
  onShare?: (transaction: Transaction) => void;
}

const METHOD_LABELS: Record<PaymentMethod, { en: string; bn: string }> = {
  bkash: { en: "bKash", bn: "বিকাশ" },
  nagad: { en: "Nagad", bn: "নগদ" },
  rocket: { en: "Rocket", bn: "রকেট" },
  bank: { en: "Bank Transfer", bn: "ব্যাংক ট্রান্সফার" },
  card: { en: "Card Payment", bn: "কার্ড পেমেন্ট" },
  paypal: { en: "PayPal", bn: "পেপাল" },
  stripe: { en: "Stripe", bn: "স্ট্রাইপ" },
};

const STATUS_CONFIG: Record<
  TransactionStatus,
  { icon: typeof CheckCircle2; color: string }
> = {
  completed: { icon: CheckCircle2, color: "text-green-400" },
  pending: { icon: Clock, color: "text-yellow-400" },
  failed: { icon: XCircle, color: "text-red-400" },
};

export default function PaymentReceipt({
  transaction,
  onDownload,
  onShare,
}: PaymentReceiptProps) {
  const { lang } = useLang();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [shared, setShared] = useState(false);

  const statusConfig = STATUS_CONFIG[transaction.status];
  const StatusIcon = statusConfig.icon;

  const handleDownload = () => {
    if (onDownload) {
      onDownload(transaction);
      return;
    }

    const receiptContent = generateReceiptText(transaction);
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${transaction.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (onShare) {
      onShare(transaction);
      return;
    }

    const receiptText = generateReceiptText(transaction);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt - ${transaction.id}`,
          text: receiptText,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(receiptText);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const generateReceiptText = (txn: Transaction): string => {
    const lines = [
      "═══════════════════════════════",
      "        PRO-VISION PAYMENT",
      "═══════════════════════════════",
      "",
      `${lang === "bn" ? "ট্রানজেকশন আইডি" : "Transaction ID"}: ${txn.id}`,
      `${lang === "bn" ? "তারিখ" : "Date"}: ${new Date(txn.date).toLocaleString(lang === "bn" ? "bn-BD" : "en-US")}`,
      `${lang === "bn" ? "পরিমাণ" : "Amount"}: ${txn.currency}${txn.amount.toFixed(2)}`,
      txn.fee
        ? `${lang === "bn" ? "ফি" : "Fee"}: ${txn.currency}${txn.fee.toFixed(2)}`
        : null,
      `${lang === "bn" ? "মোট" : "Total"}: ${txn.currency}${(txn.amount + (txn.fee || 0)).toFixed(2)}`,
      `${lang === "bn" ? "পদ্ধতি" : "Method"}: ${METHOD_LABELS[txn.method][lang]}`,
      `${lang === "bn" ? "অবস্থা" : "Status"}: ${txn.status.toUpperCase()}`,
      txn.recipient
        ? `${lang === "bn" ? "প্রাপক" : "Recipient"}: ${txn.recipient}`
        : null,
      txn.reference
        ? `${lang === "bn" ? "রেফারেন্স" : "Reference"}: ${txn.reference}`
        : null,
      "",
      "═══════════════════════════════",
      `  ${lang === "bn" ? "ধন্যবাদ!" : "Thank you!"}`,
      "═══════════════════════════════",
    ].filter(Boolean);

    return lines.join("\n");
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={receiptRef}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-4"
    >
      <motion.div variants={fadeUp} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
              <Receipt className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold">
              {lang === "bn" ? "পেমেন্ট রিসিট" : "Payment Receipt"}
            </h3>
          </div>
          <div className={`flex items-center gap-2 ${statusConfig.color}`}>
            <StatusIcon className="w-5 h-5" />
            <span className="text-sm font-medium capitalize">
              {transaction.status}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="text-3xl font-bold mb-1">
              {transaction.currency}
              {transaction.amount.toFixed(2)}
            </div>
            {transaction.fee && transaction.fee > 0 && (
              <div className="text-sm text-muted-foreground">
                + {transaction.currency}
                {transaction.fee.toFixed(2)} {lang === "bn" ? "ফি" : "fee"}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {lang === "bn" ? "ট্রানজেকশন আইডি" : "Transaction ID"}
              </span>
              <span className="font-mono text-xs">{transaction.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {lang === "bn" ? "তারিখ" : "Date"}
              </span>
              <span>
                {new Date(transaction.date).toLocaleString(
                  lang === "bn" ? "bn-BD" : "en-US",
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {lang === "bn" ? "পদ্ধতি" : "Method"}
              </span>
              <span>{METHOD_LABELS[transaction.method][lang]}</span>
            </div>
            {transaction.recipient && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {lang === "bn" ? "প্রাপক" : "Recipient"}
                </span>
                <span>{transaction.recipient}</span>
              </div>
            )}
            {transaction.reference && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {lang === "bn" ? "রেফারেন্স" : "Reference"}
                </span>
                <span className="font-mono text-xs">
                  {transaction.reference}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-3">
        <Button
          onClick={handleDownload}
          className="flex-1 glass"
          variant="outline"
        >
          <Download className="w-4 h-4" />
          {lang === "bn" ? "ডাউনলোড" : "Download"}
        </Button>
        <Button
          onClick={handleShare}
          className="flex-1 glass"
          variant="outline"
        >
          <Share2 className="w-4 h-4" />
          {shared
            ? lang === "bn"
              ? "কপি হয়েছে!"
              : "Copied!"
            : lang === "bn"
              ? "শেয়ার"
              : "Share"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
