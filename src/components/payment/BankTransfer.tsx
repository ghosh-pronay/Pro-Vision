import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Copy,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/i18n/LanguageContext";

interface Bank {
  id: string;
  name: string;
  nameBn: string;
  code: string;
  type: "private" | "public" | "specialized";
}

const BANGLADESH_BANKS: Bank[] = [
  {
    id: "dbbl",
    name: "Dutch-Bangla Bank (DBBL)",
    nameBn: "ডাচ-বাংলা ব্যাংক",
    code: "019",
    type: "private",
  },
  {
    id: "brac",
    name: "BRAC Bank",
    nameBn: "ব্র্যাক ব্যাংক",
    code: "068",
    type: "private",
  },
  {
    id: "ibbl",
    name: "Islami Bank Bangladesh",
    nameBn: "ইসলামী ব্যাংক বাংলাদেশ",
    code: "021",
    type: "specialized",
  },
  {
    id: "sonali",
    name: "Sonali Bank",
    nameBn: "সোনালী ব্যাংক",
    code: "020",
    type: "public",
  },
  {
    id: "janata",
    name: "Janata Bank",
    nameBn: "জনতা ব্যাংক",
    code: "055",
    type: "public",
  },
  {
    id: "agrani",
    name: "Agrani Bank",
    nameBn: "অগ্রণী ব্যাংক",
    code: "010",
    type: "public",
  },
  {
    id: "prime",
    name: "Prime Bank",
    nameBn: "প্রাইম ব্যাংক",
    code: "100",
    type: "private",
  },
  {
    id: "ucbl",
    name: "UCB",
    nameBn: "ইউনাইটেড কমার্শিয়াল ব্যাংক",
    code: "025",
    type: "private",
  },
  {
    id: "city",
    name: "City Bank",
    nameBn: "সিটি ব্যাংক",
    code: "026",
    type: "private",
  },
  {
    id: "ncc",
    name: "NCC Bank",
    nameBn: "এনসিসি ব্যাংক",
    code: "027",
    type: "private",
  },
  {
    id: "dhaka",
    name: "Dhaka Bank",
    nameBn: "ঢাকা ব্যাংক",
    code: "029",
    type: "private",
  },
  {
    id: "meghna",
    name: "Meghna Bank",
    nameBn: "মেঘনা ব্যাংক",
    code: "140",
    type: "private",
  },
  {
    id: "pubali",
    name: "Pubali Bank",
    nameBn: "পূবালী ব্যাংক",
    code: "050",
    type: "public",
  },
  {
    id: "rupali",
    name: "Rupali Bank",
    nameBn: "রূপালী ব্যাংক",
    code: "022",
    type: "public",
  },
];

interface BankTransferProps {
  onTransferComplete?: (data: {
    bank: string;
    accountNumber: string;
    routingNumber: string;
    amount: number;
    transactionId: string;
  }) => void;
}

export default function BankTransfer({
  onTransferComplete,
}: BankTransferProps) {
  const { lang } = useLang();
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const selectedBankData = BANGLADESH_BANKS.find((b) => b.id === selectedBank);

  const validateForm = (): boolean => {
    if (!selectedBank) {
      setError(lang === "bn" ? "একটি ব্যাংক নির্বাচন করুন" : "Select a bank");
      return false;
    }
    if (accountNumber.length < 10) {
      setError(
        lang === "bn"
          ? "সঠিক অ্যাকাউন্ট নম্বর দিন"
          : "Enter valid account number",
      );
      return false;
    }
    if (routingNumber.length < 9) {
      setError(
        lang === "bn"
          ? "সঠিক রাউটিং নম্বর দিন (৯ ডিজিট)"
          : "Enter valid routing number (9 digits)",
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const transactionId = `BNK${Date.now().toString(36).toUpperCase()}`;

      setSuccess(true);
      onTransferComplete?.({
        bank: selectedBankData?.name || "",
        accountNumber,
        routingNumber,
        amount: parseFloat(amount),
        transactionId,
      });

      setTimeout(() => {
        setSuccess(false);
        setAccountNumber("");
        setRoutingNumber("");
        setAmount("");
      }, 3000);
    } catch {
      setError(
        lang === "bn"
          ? "লেনদেন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
          : "Transaction failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyBankDetails = () => {
    if (!selectedBankData) return;
    const details = `${selectedBankData.name}\n${lang === "bn" ? "অ্যাকাউন্ট" : "Account"}: ${accountNumber}\n${lang === "bn" ? "রাউটিং" : "Routing"}: ${routingNumber}`;
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
          <Building2 className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold">
          {lang === "bn" ? "ব্যাংক ট্রান্সফার" : "Bank Transfer"}
        </h3>
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
              {lang === "bn" ? "ট্রান্সফার সফল!" : "Transfer Successful!"}
            </h4>
            <p className="text-muted-foreground">
              {lang === "bn"
                ? `৳${parseFloat(amount).toFixed(2)} ${selectedBankData?.nameBn} এ পাঠানো হয়েছে`
                : `৳${parseFloat(amount).toFixed(2)} sent to ${selectedBankData?.name}`}
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
                {lang === "bn" ? "ব্যাংক নির্বাচন করুন" : "Select Bank"}
              </label>
              <div className="glass rounded-xl p-1">
                <select
                  value={selectedBank}
                  onChange={(e) => {
                    setSelectedBank(e.target.value);
                    setError("");
                  }}
                  className="w-full bg-transparent px-3 py-2 rounded-lg text-sm focus:outline-none"
                >
                  <option value="" className="bg-gray-900">
                    {lang === "bn"
                      ? "-- ব্যাংক নির্বাচন করুন --"
                      : "-- Select a bank --"}
                  </option>
                  <optgroup
                    label={lang === "bn" ? "বেসরকারি ব্যাংক" : "Private Banks"}
                  >
                    {BANGLADESH_BANKS.filter((b) => b.type === "private").map(
                      (bank) => (
                        <option
                          key={bank.id}
                          value={bank.id}
                          className="bg-gray-900"
                        >
                          {lang === "bn" ? bank.nameBn : bank.name}
                        </option>
                      ),
                    )}
                  </optgroup>
                  <optgroup
                    label={lang === "bn" ? "সরকারি ব্যাংক" : "Public Banks"}
                  >
                    {BANGLADESH_BANKS.filter((b) => b.type === "public").map(
                      (bank) => (
                        <option
                          key={bank.id}
                          value={bank.id}
                          className="bg-gray-900"
                        >
                          {lang === "bn" ? bank.nameBn : bank.name}
                        </option>
                      ),
                    )}
                  </optgroup>
                  <optgroup
                    label={
                      lang === "bn" ? "বিশেষায়িত ব্যাংক" : "Specialized Banks"
                    }
                  >
                    {BANGLADESH_BANKS.filter(
                      (b) => b.type === "specialized",
                    ).map((bank) => (
                      <option
                        key={bank.id}
                        value={bank.id}
                        className="bg-gray-900"
                      >
                        {lang === "bn" ? bank.nameBn : bank.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-sm font-medium mb-2">
                {lang === "bn" ? "অ্যাকাউন্ট নম্বর" : "Account Number"}
              </label>
              <Input
                type="text"
                placeholder={
                  lang === "bn" ? "অ্যাকাউন্ট নম্বর" : "Account number"
                }
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(
                    e.target.value.replace(/\D/g, "").slice(0, 14),
                  )
                }
                maxLength={14}
                className="glass"
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="block text-sm font-medium mb-2">
                {lang === "bn" ? "রাউটিং নম্বর" : "Routing Number"}
              </label>
              <Input
                type="text"
                placeholder="XXX-XXXXX"
                value={routingNumber}
                onChange={(e) =>
                  setRoutingNumber(
                    e.target.value.replace(/\D/g, "").slice(0, 9),
                  )
                }
                maxLength={9}
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
                className="glass"
              />
            </motion.div>

            {selectedBankData && accountNumber && routingNumber && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="glass rounded-xl p-4 hover-lift"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    {lang === "bn" ? "ব্যাংক তথ্য" : "Bank Details"}
                  </span>
                  <button
                    onClick={copyBankDetails}
                    className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs hover:bg-white/10 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        {lang === "bn" ? "কপি হয়েছে" : "Copied"}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        {lang === "bn" ? "কপি" : "Copy"}
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {lang === "bn" ? "ব্যাংক" : "Bank"}
                    </span>
                    <span>
                      {lang === "bn"
                        ? selectedBankData.nameBn
                        : selectedBankData.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {lang === "bn" ? "অ্যাকাউন্ট" : "Account"}
                    </span>
                    <span className="font-mono">{accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {lang === "bn" ? "রাউটিং" : "Routing"}
                    </span>
                    <span className="font-mono">{routingNumber}</span>
                  </div>
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
                disabled={
                  loading ||
                  !selectedBank ||
                  !accountNumber ||
                  !routingNumber ||
                  !amount
                }
                className="w-full glass"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {lang === "bn" ? "ট্রান্সফার করুন" : "Transfer"}
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
