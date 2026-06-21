import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import { useState, useMemo } from "react";
import {
  Receipt,
  Plus,
  Users,
  Calculator,
  History,
  CheckCircle,
  X,
  Trash2,
  ArrowRight,
  QrCode,
  Link2,
  Wallet,
  UserPlus,
  ChevronDown,
  ChevronUp,
  FileText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreditCard,
  ShoppingBag,
  Utensils,
  Bus,
  Clapperboard,
  Tag,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Edit3,
  Check,
  AlertCircle,
  TrendingDown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TrendingUp,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatBanglaCurrency } from "@/lib/bangla-numbers";
import { toastSuccess, toastError } from "@/lib/toast-helpers";

type SplitMethod = "equal" | "percentage" | "custom";
type BillCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "other";
type BillStatus = "pending" | "partial" | "settled";

interface Participant {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  paid: boolean;
}

interface Bill {
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

interface Friend {
  _id: string;
  name: string;
  phone?: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const slideIn = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const CATEGORIES: {
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

const CURRENCIES = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "USD", symbol: "$", name: "US Dollar" },
];

export default function BillSplit() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<"create" | "history" | "balances">(
    "create",
  );
  const [bills, setBills] = useState<Bill[]>([
    {
      _id: "1",
      title: lang === "bn" ? "রেস্তোরাঁয় খাওয়া" : "Dinner at Restaurant",
      totalAmount: 2400,
      splitMethod: "equal",
      participants: [
        { id: "1", name: "Rahim", amount: 800, percentage: 33.33, paid: true },
        { id: "2", name: "Karim", amount: 800, percentage: 33.33, paid: false },
        { id: "3", name: "Jamal", amount: 800, percentage: 33.33, paid: false },
      ],
      category: "food",
      currency: "BDT",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 86400000,
      status: "partial",
      createdBy: "Rahim",
      paidAmount: 800,
    },
    {
      _id: "2",
      title: lang === "bn" ? "সিনেমা টিকেট" : "Movie Tickets",
      totalAmount: 1500,
      splitMethod: "percentage",
      participants: [
        { id: "1", name: "Rahim", amount: 375, percentage: 25, paid: true },
        { id: "2", name: "Karim", amount: 375, percentage: 25, paid: true },
        { id: "3", name: "Jamal", amount: 375, percentage: 25, paid: true },
        { id: "4", name: "Salam", amount: 375, percentage: 25, paid: true },
      ],
      category: "entertainment",
      currency: "BDT",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 172800000,
      status: "settled",
      createdBy: "Karim",
      paidAmount: 1500,
    },
    {
      _id: "3",
      title: lang === "bn" ? "অটোরিকশা ভাড়া" : "Auto Rickshaw Fare",
      totalAmount: 600,
      splitMethod: "custom",
      participants: [
        { id: "1", name: "Rahim", amount: 200, percentage: 33.33, paid: true },
        { id: "2", name: "Karim", amount: 400, percentage: 66.67, paid: false },
      ],
      category: "transport",
      currency: "BDT",
      // eslint-disable-next-line react-hooks/purity
      date: Date.now() - 259200000,
      status: "pending",
      createdBy: "Rahim",
      paidAmount: 200,
    },
  ]);
  const [friends, setFriends] = useState<Friend[]>([
    { _id: "1", name: "Rahim", phone: "+8801712345678" },
    { _id: "2", name: "Karim", phone: "+8801812345678" },
    { _id: "3", name: "Jamal" },
    { _id: "4", name: "Salam", phone: "+8801912345678" },
  ]);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("equal");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    totalAmount: "",
    category: "food" as BillCategory,
    currency: "BDT" as "BDT" | "USD",
    date: new Date().toISOString().split("T")[0],
  });

  const [friendForm, setFriendForm] = useState({
    name: "",
    phone: "",
  });

  const t = (key: string): string => {
    const translations: Record<string, { en: string; bn: string }> = {
      "billSplit.title": {
        en: "Smart Bill Splitting",
        bn: "স্মার্ট বিল স্প্লিটিং",
      },
      "billSplit.subtitle": {
        en: "Split bills easily with friends",
        bn: "বন্ধুদের সাথে সহজে বিল ভাগ করুন",
      },
      "billSplit.createBill": { en: "Create Bill", bn: "বিল তৈরি করুন" },
      "billSplit.totalAmount": { en: "Total Amount", bn: "মোট পরিমাণ" },
      "billSplit.splitMethod": { en: "Split Method", bn: "ভাগ করার পদ্ধতি" },
      "billSplit.equalSplit": { en: "Equal Split", bn: "সমান ভাগ" },
      "billSplit.percentageSplit": { en: "Percentage Split", bn: "শতাংশ ভাগ" },
      "billSplit.customSplit": { en: "Custom Split", bn: "কাস্টম ভাগ" },
      "billSplit.participants": { en: "Participants", bn: "অংশগ্রহণকারী" },
      "billSplit.addParticipant": {
        en: "Add Participant",
        bn: "অংশগ্রহণকারী যোগ করুন",
      },
      "billSplit.balances": {
        en: "Outstanding Balances",
        bn: "বকেয় ব্যালেন্স",
      },
      "billSplit.settleUp": { en: "Settle Up", bn: "সেটেল আপ" },
      "billSplit.friendList": { en: "Friend List", bn: "বন্ধু তালিকা" },
      "billSplit.addFriend": { en: "Add Friend", bn: "বন্ধু যোগ করুন" },
      "billSplit.save": { en: "Save", bn: "সংরক্ষণ করুন" },
      "billSplit.history": { en: "Bill History", bn: "বিলের ইতিহাস" },
      "billSplit.quickActions": { en: "Quick Actions", bn: "দ্রুত পদক্ষেপ" },
      "billSplit.viewHistory": { en: "View History", bn: "ইতিহাস দেখুন" },
      "billSplit.settled": { en: "Settled", bn: "সেটেলড" },
      "billSplit.pending": { en: "Pending", bn: "মুলতুবি" },
      "billSplit.partial": { en: "Partial", bn: "আংশিক" },
      "billSplit.paid": { en: "Paid", bn: "পেইড" },
      "billSplit.unpaid": { en: "Unpaid", bn: "অপেইড" },
      "billSplit.markAsPaid": {
        en: "Mark as Paid",
        bn: "পেইড হিসেবে চিহ্নিত করুন",
      },
      "billSplit.shareBill": { en: "Share Bill", bn: "বিল শেয়ার করুন" },
      "billSplit.generateQR": { en: "Generate QR", bn: "QR তৈরি করুন" },
      "billSplit.copyLink": { en: "Copy Link", bn: "লিংক কপি করুন" },
      "billSplit.whoOwesWhom": { en: "Who Owes Whom", bn: "কে কাকে ঋণী" },
      "billSplit.billTitle": { en: "Bill Title", bn: "বিলের শিরোনাম" },
      "billSplit.category": { en: "Category", bn: "ক্যাটাগরি" },
      "billSplit.date": { en: "Date", bn: "তারিখ" },
      "billSplit.currency": { en: "Currency", bn: "মুদ্রা" },
      "billSplit.name": { en: "Name", bn: "নাম" },
      "billSplit.phone": { en: "Phone (optional)", bn: "ফোন (ঐচ্ছিক)" },
      "billSplit.amount": { en: "Amount", bn: "পরিমাণ" },
      "billSplit.percentage": { en: "Percentage", bn: "শতাংশ" },
      "billSplit.cancel": { en: "Cancel", bn: "বাতিল" },
      "billSplit.delete": { en: "Delete", bn: "মুছুন" },
      "billSplit.confirmDelete": {
        en: "Are you sure you want to delete this bill?",
        bn: "আপনি কি এই বিলটি মুছে ফেলতে চান?",
      },
      "billSplit.noBills": { en: "No bills yet", bn: "এখনো কোনো বিল নেই" },
      "billSplit.noBillsDesc": {
        en: "Create your first bill to start splitting",
        bn: "স্প্লিট করা শুরু করতে আপনার প্রথম বিল তৈরি করুন",
      },
      "billSplit.noFriends": {
        en: "No friends added yet",
        bn: "এখনো কোনো বন্ধু যোগ হয়নি",
      },
      "billSplit.noFriendsDesc": {
        en: "Add friends to split bills with",
        bn: "বিল ভাগ করতে বন্ধু যোগ করুন",
      },
      "billSplit.noBalances": {
        en: "No outstanding balances",
        bn: "কোনো বকেয় ব্যালেন্স নেই",
      },
      "billSplit.noBalancesDesc": {
        en: "All bills are settled!",
        bn: "সব বিল সেটেলড!",
      },
      "billSplit.food": { en: "Food", bn: "খাদ্য" },
      "billSplit.transport": { en: "Transport", bn: "পরিবহন" },
      "billSplit.entertainment": { en: "Entertainment", bn: "বিনোদন" },
      "billSplit.shopping": { en: "Shopping", bn: "শপিং" },
      "billSplit.other": { en: "Other", bn: "অন্যান্য" },
      "billSplit.total": { en: "Total", bn: "মোট" },
      "billSplit.paidBy": { en: "Paid by", bn: "পেইড বাই" },
      "billSplit.shareableLink": {
        en: "Shareable Link",
        bn: "শেয়ারযোগ্য লিংক",
      },
      "billSplit.linkCopied": {
        en: "Link copied to clipboard!",
        bn: "লিংক ক্লিপবোর্ডে কপি হয়েছে!",
      },
      "billSplit.billCreated": {
        en: "Bill created successfully!",
        bn: "বিল সফলভাবে তৈরি হয়েছে!",
      },
      "billSplit.billDeleted": {
        en: "Bill deleted",
        bn: "বিল মুছে ফেলা হয়েছে",
      },
      "billSplit.friendAdded": { en: "Friend added!", bn: "বন্ধু যোগ হয়েছে!" },
      "billSplit.friendDeleted": {
        en: "Friend removed",
        bn: "বন্ধু সরানো হয়েছে",
      },
      "billSplit.billSettled": { en: "Bill settled!", bn: "বিল সেটেলড!" },
      "billSplit.selectFriend": {
        en: "Select from friends",
        bn: "বন্ধুদের থেকে নির্বাচন করুন",
      },
      "billSplit.percentageRemaining": { en: "Remaining", bn: "বাকি" },
      "billSplit.amountMismatch": {
        en: "Amounts don't add up to total",
        bn: "পরিমাণ মোট পরিমাণের সমান নয়",
      },
      "billSplit.percentageMismatch": {
        en: "Percentages don't add up to 100%",
        bn: "শতাংশ ১০০% এর সমান নয়",
      },
    };
    return translations[key]?.[lang] || translations[key]?.en || key;
  };

  const stats = useMemo(() => {
    const totalBills = bills.length;
    const totalAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const unsettled = bills.filter((b) => b.status !== "settled").length;
    const totalOwed = bills.reduce(
      (sum, b) => sum + (b.totalAmount - b.paidAmount),
      0,
    );
    return { totalBills, totalAmount, unsettled, totalOwed };
  }, [bills]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const balances = useMemo(() => {
    const balanceMap: Record<string, number> = {};
    bills
      .filter((b) => b.status !== "settled")
      .forEach((bill) => {
        bill.participants.forEach((p) => {
          if (!p.paid) {
            balanceMap[p.name] = (balanceMap[p.name] || 0) + p.amount;
          }
        });
      });
    return Object.entries(balanceMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [bills]);

  const netBalances = useMemo(() => {
    const net: Record<string, number> = {};
    bills
      .filter((b) => b.status !== "settled")
      .forEach((bill) => {
        bill.participants.forEach((p) => {
          if (!p.paid) {
            net[p.name] = (net[p.name] || 0) - p.amount;
          }
        });
        net[bill.createdBy] =
          (net[bill.createdBy] || 0) + (bill.totalAmount - bill.paidAmount);
      });
    const debtors = Object.entries(net)
      .filter(([, v]) => v < 0)
      .map(([name, amount]) => ({ name, amount: Math.abs(amount) }));
    const creditors = Object.entries(net)
      .filter(([, v]) => v > 0)
      .map(([name, amount]) => ({ name, amount }));
    const transactions: { from: string; to: string; amount: number }[] = [];
    let i = 0,
      j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].amount, creditors[j].amount);
      if (amount > 0) {
        transactions.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount,
        });
      }
      debtors[i].amount -= amount;
      creditors[j].amount -= amount;
      if (debtors[i].amount === 0) i++;
      if (creditors[j].amount === 0) j++;
    }
    return transactions;
  }, [bills]);

  const calculateSplit = () => {
    const total = parseFloat(formData.totalAmount) || 0;
    if (participants.length === 0 || total === 0) return;

    if (splitMethod === "equal") {
      const share = total / participants.length;
      setParticipants(
        participants.map((p) => ({
          ...p,
          amount: Math.round(share * 100) / 100,
          percentage: 100 / participants.length,
        })),
      );
    } else if (splitMethod === "percentage") {
      setParticipants(
        participants.map((p) => ({
          ...p,
          amount: Math.round(((total * p.percentage) / 100) * 100) / 100,
        })),
      );
    }
  };

  const addParticipant = (name?: string) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: name || "",
      amount: 0,
      percentage: 0,
      paid: false,
    };
    setParticipants([...participants, newParticipant]);
    if (name) calculateSplit();
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const updateParticipant = (
    id: string,
    field: keyof Participant,
    value: string | number | boolean,
  ) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
    if (field === "percentage" || field === "amount") {
      setTimeout(calculateSplit, 0);
    }
  };

  const createBill = () => {
    if (!formData.title || !formData.totalAmount || participants.length === 0) {
      toastError(
        lang === "bn"
          ? "অনুগ্রহ করে সব তথ্য পূরণ করুন"
          : "Please fill all fields",
      );
      return;
    }

    const total = parseFloat(formData.totalAmount);
    if (splitMethod === "percentage") {
      const totalPct = participants.reduce((s, p) => s + p.percentage, 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        toastError(t("billSplit.percentageMismatch"));
        return;
      }
    }
    if (splitMethod === "custom") {
      const totalCustom = participants.reduce((s, p) => s + p.amount, 0);
      if (Math.abs(totalCustom - total) > 0.01) {
        toastError(t("billSplit.amountMismatch"));
        return;
      }
    }

    const newBill: Bill = {
      _id: Date.now().toString(),
      title: formData.title,
      totalAmount: total,
      splitMethod,
      participants: participants.map((p) => ({
        ...p,
        amount:
          splitMethod === "equal" ? total / participants.length : p.amount,
        percentage:
          splitMethod === "equal"
            ? 100 / participants.length
            : splitMethod === "percentage"
              ? p.percentage
              : (p.amount / total) * 100,
      })),
      category: formData.category,
      currency: formData.currency,
      date: new Date(formData.date).getTime(),
      status: "pending",
      createdBy: participants[0]?.name || "You",
      paidAmount: 0,
    };

    setBills([newBill, ...bills]);
    setShowCreateForm(false);
    setFormData({
      title: "",
      totalAmount: "",
      category: "food",
      currency: "BDT",
      date: new Date().toISOString().split("T")[0],
    });
    setParticipants([]);
    setSplitMethod("equal");
    toastSuccess(t("billSplit.billCreated"));
  };

  const settleBill = (billId: string) => {
    setBills(
      bills.map((b) =>
        b._id === billId
          ? {
              ...b,
              status: "settled" as BillStatus,
              participants: b.participants.map((p) => ({ ...p, paid: true })),
              paidAmount: b.totalAmount,
            }
          : b,
      ),
    );
    setShowSettleModal(null);
    toastSuccess(t("billSplit.billSettled"));
  };

  const markParticipantPaid = (billId: string, participantId: string) => {
    setBills(
      bills.map((b) => {
        if (b._id !== billId) return b;
        const updatedParticipants = b.participants.map((p) =>
          p.id === participantId ? { ...p, paid: !p.paid } : p,
        );
        const newPaidAmount = updatedParticipants
          .filter((p) => p.paid)
          .reduce((sum, p) => sum + p.amount, 0);
        const allPaid = updatedParticipants.every((p) => p.paid);
        return {
          ...b,
          participants: updatedParticipants,
          paidAmount: newPaidAmount,
          status: allPaid
            ? "settled"
            : newPaidAmount > 0
              ? "partial"
              : "pending",
        };
      }),
    );
  };

  const deleteBill = (billId: string) => {
    setBills(bills.filter((b) => b._id !== billId));
    setDeleteConfirmId(null);
    toastSuccess(t("billSplit.billDeleted"));
  };

  const addFriend = () => {
    if (!friendForm.name) return;
    const newFriend: Friend = {
      _id: Date.now().toString(),
      name: friendForm.name,
      phone: friendForm.phone || undefined,
    };
    setFriends([...friends, newFriend]);
    setFriendForm({ name: "", phone: "" });
    setShowAddFriend(false);
    toastSuccess(t("billSplit.friendAdded"));
  };

  const deleteFriend = (friendId: string) => {
    setFriends(friends.filter((f) => f._id !== friendId));
    toastSuccess(t("billSplit.friendDeleted"));
  };

  const copyShareLink = (billId: string) => {
    const link = `${window.location.origin}/bill/${billId}`;
    navigator.clipboard.writeText(link).then(() => {
      toastSuccess(t("billSplit.linkCopied"));
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(
      lang === "bn" ? "bn-BD" : "en-US",
      { day: "numeric", month: "short", year: "numeric" },
    );
  };

  const getCategoryIcon = (cat: BillCategory) => {
    const found = CATEGORIES.find((c) => c.key === cat);
    return found?.icon || Tag;
  };

  const getCategoryColor = (cat: BillCategory) => {
    const found = CATEGORIES.find((c) => c.key === cat);
    return found?.color || "#6b7280";
  };

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case "settled":
        return "text-emerald-500 bg-emerald-500/10";
      case "partial":
        return "text-amber-500 bg-amber-500/10";
      default:
        return "text-red-500 bg-red-500/10";
    }
  };

  const formatCurrency = (amount: number, currency?: "BDT" | "USD") => {
    if (currency === "USD") {
      return `$${amount.toFixed(2)}`;
    }
    return formatBanglaCurrency(amount);
  };

  const remainingPercentage = useMemo(() => {
    const total = participants.reduce((s, p) => s + p.percentage, 0);
    return 100 - total;
  }, [participants]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Receipt className="h-6 w-6 text-emerald-500" />
          {t("billSplit.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("billSplit.subtitle")}
        </p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="glass rounded-xl p-4 text-center">
          <Receipt className="h-5 w-5 mx-auto text-emerald-500 mb-2" />
          <p className="text-2xl font-bold">{stats.totalBills}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "মোট বিল" : "Total Bills"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <Wallet className="h-5 w-5 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">
            {formatCurrency(stats.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "মোট পরিমাণ" : "Total Amount"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <AlertCircle className="h-5 w-5 mx-auto text-amber-500 mb-2" />
          <p className="text-2xl font-bold">{stats.unsettled}</p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "অসম্পন্ন" : "Unsettled"}
          </p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <TrendingDown className="h-5 w-5 mx-auto text-red-500 mb-2" />
          <p className="text-2xl font-bold">
            {formatCurrency(stats.totalOwed)}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "bn" ? "বকেয়" : "Outstanding"}
          </p>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="flex gap-2">
        {(["create", "history", "balances"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "glass hover:bg-foreground/5"
            }`}
          >
            {tab === "create" && t("billSplit.createBill")}
            {tab === "history" && t("billSplit.history")}
            {tab === "balances" && t("billSplit.balances")}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "create" && (
          <motion.div
            key="create"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            variants={fadeUp}
            className="space-y-4"
          >
            {!showCreateForm ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="cursor-pointer glass rounded-xl p-4 text-left hover:bg-foreground/5 transition-all"
                  >
                    <Plus className="h-5 w-5 text-emerald-500 mb-2" />
                    <p className="font-medium">{t("billSplit.createBill")}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "bn"
                        ? "নতুন বিল তৈরি করুন"
                        : "Create a new bill"}
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className="cursor-pointer glass rounded-xl p-4 text-left hover:bg-foreground/5 transition-all"
                  >
                    <History className="h-5 w-5 text-blue-500 mb-2" />
                    <p className="font-medium">{t("billSplit.viewHistory")}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "bn"
                        ? "পূর্ববর্তী বিল দেখুন"
                        : "View past bills"}
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveTab("balances")}
                    className="cursor-pointer glass rounded-xl p-4 text-left hover:bg-foreground/5 transition-all"
                  >
                    <Calculator className="h-5 w-5 text-purple-500 mb-2" />
                    <p className="font-medium">{t("billSplit.settleUp")}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "bn" ? "বকেয় দেখুন" : "View outstanding"}
                    </p>
                  </button>
                </div>

                {bills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {lang === "bn" ? "সাম্প্রতিক বিল" : "Recent Bills"}
                    </h3>
                    {bills.slice(0, 3).map((bill) => {
                      const CatIcon = getCategoryIcon(bill.category);
                      return (
                        <motion.div
                          key={bill._id}
                          variants={slideIn}
                          className="glass rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="rounded-lg p-2"
                                style={{
                                  backgroundColor: `${getCategoryColor(bill.category)}20`,
                                }}
                              >
                                <CatIcon
                                  className="h-4 w-4"
                                  style={{
                                    color: getCategoryColor(bill.category),
                                  }}
                                />
                              </div>
                              <div>
                                <p className="font-medium">{bill.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(bill.date)} ·{" "}
                                  {bill.participants.length}{" "}
                                  {lang === "bn" ? "জন" : "people"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">
                                {formatCurrency(
                                  bill.totalAmount,
                                  bill.currency,
                                )}
                              </p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(bill.status)}`}
                              >
                                {t(`billSplit.${bill.status}`)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {t("billSplit.createBill")}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setParticipants([]);
                    }}
                    className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      {t("billSplit.billTitle")}
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder={
                        lang === "bn"
                          ? "বিলের শিরোনাম"
                          : "e.g. Dinner at Restaurant"
                      }
                      className="w-full rounded-xl glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {t("billSplit.totalAmount")}
                      </label>
                      <input
                        type="number"
                        value={formData.totalAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            totalAmount: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        className="w-full rounded-xl glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {t("billSplit.currency")}
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currency: e.target.value as "BDT" | "USD",
                          })
                        }
                        className="w-full rounded-xl glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code} ({c.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {t("billSplit.category")}
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value as BillCategory,
                          })
                        }
                        className="w-full rounded-xl glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.key} value={c.key}>
                            {t(`billSplit.${c.key}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {t("billSplit.date")}
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full rounded-xl glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t("billSplit.splitMethod")}
                    </label>
                    <div className="flex gap-2">
                      {(["equal", "percentage", "custom"] as const).map(
                        (method) => (
                          <button
                            key={method}
                            onClick={() => {
                              setSplitMethod(method);
                              if (
                                method === "equal" &&
                                participants.length > 0
                              ) {
                                setTimeout(calculateSplit, 0);
                              }
                            }}
                            className={`cursor-pointer flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                              splitMethod === method
                                ? "bg-primary text-primary-foreground"
                                : "glass hover:bg-foreground/5"
                            }`}
                          >
                            {t(`billSplit.${method}Split`)}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        {t("billSplit.participants")}
                      </label>
                      <div className="flex gap-2">
                        {friends.length > 0 && (
                          <div className="relative">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  addParticipant(e.target.value);
                                  e.target.value = "";
                                }
                              }}
                              className="cursor-pointer appearance-none rounded-lg glass px-3 py-1 text-xs focus:outline-none hover:bg-foreground/5 transition-colors"
                              defaultValue=""
                            >
                              <option value="" disabled>
                                {t("billSplit.selectFriend")}
                              </option>
                              {friends.map((f) => (
                                <option key={f._id} value={f.name}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        <button
                          onClick={() => addParticipant()}
                          className="cursor-pointer flex items-center gap-1 px-3 py-1 rounded-lg glass text-xs hover:bg-foreground/5"
                        >
                          <Plus className="h-3 w-3" />
                          {t("billSplit.addParticipant")}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <AnimatePresence>
                        {participants.map((p) => (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass rounded-xl p-3"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={p.name}
                                onChange={(e) =>
                                  updateParticipant(
                                    p.id,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                placeholder={t("billSplit.name")}
                                className="flex-1 rounded-lg px-3 py-1.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-primary/50"
                              />
                              {splitMethod === "percentage" && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={p.percentage || ""}
                                    onChange={(e) =>
                                      updateParticipant(
                                        p.id,
                                        "percentage",
                                        parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    placeholder="%"
                                    className="w-16 rounded-lg px-2 py-1.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-primary/50"
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    %
                                  </span>
                                </div>
                              )}
                              {splitMethod === "custom" && (
                                <input
                                  type="number"
                                  value={p.amount || ""}
                                  onChange={(e) =>
                                    updateParticipant(
                                      p.id,
                                      "amount",
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  placeholder={t("billSplit.amount")}
                                  className="w-24 rounded-lg px-2 py-1.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-primary/50"
                                />
                              )}
                              {splitMethod === "equal" && (
                                <span className="text-sm font-medium w-24 text-right">
                                  {formData.totalAmount
                                    ? formatCurrency(
                                        parseFloat(formData.totalAmount) /
                                          participants.length,
                                        formData.currency,
                                      )
                                    : "০.০০ টাকা"}
                                </span>
                              )}
                              <button
                                onClick={() => removeParticipant(p.id)}
                                className="cursor-pointer p-1.5 rounded-lg hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {splitMethod === "percentage" &&
                      participants.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span
                            className={
                              remainingPercentage < 0 ? "text-red-500" : ""
                            }
                          >
                            {t("billSplit.percentageRemaining")}:{" "}
                            {remainingPercentage.toFixed(1)}%
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                <button
                  onClick={createBill}
                  className="cursor-pointer w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
                >
                  {t("billSplit.createBill")}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div
            key="history"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            variants={fadeUp}
            className="space-y-4"
          >
            {bills.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title={t("billSplit.noBills")}
                description={t("billSplit.noBillsDesc")}
                action={{
                  label: t("billSplit.createBill"),
                  onClick: () => {
                    setActiveTab("create");
                    setShowCreateForm(true);
                  },
                }}
              />
            ) : (
              bills.map((bill) => {
                const CatIcon = getCategoryIcon(bill.category);
                const isExpanded = expandedBill === bill._id;
                return (
                  <motion.div
                    key={bill._id}
                    variants={slideIn}
                    className="glass rounded-2xl overflow-hidden"
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-foreground/5 rounded-xl transition-colors"
                      onClick={() =>
                        setExpandedBill(isExpanded ? null : bill._id)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="rounded-xl p-3"
                            style={{
                              backgroundColor: `${getCategoryColor(bill.category)}20`,
                            }}
                          >
                            <CatIcon
                              className="h-5 w-5"
                              style={{ color: getCategoryColor(bill.category) }}
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{bill.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(bill.date)} ·{" "}
                              {bill.participants.length}{" "}
                              {lang === "bn" ? "জন" : "people"} ·{" "}
                              {t(`billSplit.${bill.splitMethod}Split`)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="font-bold">
                              {formatCurrency(bill.totalAmount, bill.currency)}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(bill.status)}`}
                            >
                              {t(`billSplit.${bill.status}`)}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-foreground/10"
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" />
                              <span>
                                {t("billSplit.paidBy")}: {bill.createdBy}
                              </span>
                              <span>·</span>
                              <span>
                                {t("billSplit.splitMethod")}:{" "}
                                {t(`billSplit.${bill.splitMethod}Split`)}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {bill.participants.map((p) => (
                                <div
                                  key={p.id}
                                  className="flex items-center justify-between p-2 rounded-lg glass"
                                >
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markParticipantPaid(bill._id, p.id);
                                      }}
                                      className={`cursor-pointer w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        p.paid
                                          ? "bg-emerald-500 border-emerald-500"
                                          : "border-muted-foreground/30"
                                      }`}
                                    >
                                      {p.paid && (
                                        <Check className="h-3 w-3 text-white" />
                                      )}
                                    </button>
                                    <span
                                      className={`text-sm ${p.paid ? "line-through text-muted-foreground" : ""}`}
                                    >
                                      {p.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">
                                      {formatCurrency(p.amount, bill.currency)}
                                    </span>
                                    {splitMethod === "percentage" && (
                                      <span className="text-xs text-muted-foreground">
                                        ({p.percentage.toFixed(1)}%)
                                      </span>
                                    )}
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${
                                        p.paid
                                          ? "text-emerald-500 bg-emerald-500/10"
                                          : "text-red-500 bg-red-500/10"
                                      }`}
                                    >
                                      {p.paid
                                        ? t("billSplit.paid")
                                        : t("billSplit.unpaid")}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-foreground/10">
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyShareLink(bill._id);
                                  }}
                                  className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg glass text-xs hover:bg-foreground/5"
                                >
                                  <Link2 className="h-3 w-3" />
                                  {t("billSplit.copyLink")}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowQRCode(bill._id);
                                  }}
                                  className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg glass text-xs hover:bg-foreground/5"
                                >
                                  <QrCode className="h-3 w-3" />
                                  {t("billSplit.generateQR")}
                                </button>
                              </div>
                              <div className="flex gap-2">
                                {bill.status !== "settled" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowSettleModal(bill._id);
                                    }}
                                    className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs hover:bg-emerald-600"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    {t("billSplit.settleUp")}
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteConfirmId(bill._id);
                                  }}
                                  className="cursor-pointer p-1.5 rounded-lg hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {activeTab === "balances" && (
          <motion.div
            key="balances"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -10 }}
            variants={fadeUp}
            className="space-y-6"
          >
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                {t("billSplit.whoOwesWhom")}
              </h3>

              {netBalances.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title={t("billSplit.noBalances")}
                  description={t("billSplit.noBalancesDesc")}
                />
              ) : (
                netBalances.map((tx, i) => (
                  <motion.div
                    key={`${tx.from}-${tx.to}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-red-500">
                            {tx.from.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{tx.from}</p>
                          <p className="text-xs text-muted-foreground">
                            {lang === "bn" ? "দিতে হবে" : "owes"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {formatCurrency(tx.amount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium">{tx.to}</p>
                          <p className="text-xs text-muted-foreground">
                            {lang === "bn" ? "পাবেন" : "receives"}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-emerald-500">
                            {tx.to.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t("billSplit.friendList")}
                </h3>
                <button
                  onClick={() => setShowAddFriend(true)}
                  className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg glass text-xs hover:bg-foreground/5"
                >
                  <UserPlus className="h-3 w-3" />
                  {t("billSplit.addFriend")}
                </button>
              </div>

              {friends.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={t("billSplit.noFriends")}
                  description={t("billSplit.noFriendsDesc")}
                  action={{
                    label: t("billSplit.addFriend"),
                    onClick: () => setShowAddFriend(true),
                  }}
                />
              ) : (
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <motion.div
                      key={friend._id}
                      variants={slideIn}
                      className="glass rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {friend.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{friend.name}</p>
                          {friend.phone && (
                            <p className="text-xs text-muted-foreground">
                              {friend.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteFriend(friend._id)}
                        className="cursor-pointer p-2 rounded-lg hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddFriend(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {t("billSplit.addFriend")}
                </h3>
                <button
                  onClick={() => setShowAddFriend(false)}
                  className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {t("billSplit.name")}
                  </label>
                  <input
                    type="text"
                    value={friendForm.name}
                    onChange={(e) =>
                      setFriendForm({ ...friendForm, name: e.target.value })
                    }
                    placeholder={lang === "bn" ? "বন্ধুর নাম" : "Friend's name"}
                    className="w-full rounded-xl glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {t("billSplit.phone")}
                  </label>
                  <input
                    type="tel"
                    value={friendForm.phone}
                    onChange={(e) =>
                      setFriendForm({ ...friendForm, phone: e.target.value })
                    }
                    placeholder="+880..."
                    className="w-full rounded-xl glass px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddFriend(false)}
                  className="cursor-pointer flex-1 py-2.5 rounded-xl glass font-medium hover:bg-foreground/5"
                >
                  {t("billSplit.cancel")}
                </button>
                <button
                  onClick={addFriend}
                  className="cursor-pointer flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                >
                  {t("billSplit.save")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showSettleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettleModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-md space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {t("billSplit.settleUp")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lang === "bn"
                      ? "এই বিলটি সম্পন্ন হিসেবে চিহ্নিত করবেন?"
                      : "Mark this bill as settled?"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSettleModal(null)}
                  className="cursor-pointer flex-1 py-2.5 rounded-xl glass font-medium hover:bg-foreground/5"
                >
                  {t("billSplit.cancel")}
                </button>
                <button
                  onClick={() => settleBill(showSettleModal)}
                  className="cursor-pointer flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600"
                >
                  {t("billSplit.settleUp")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showQRCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRCode(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-6 w-full max-w-sm space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {t("billSplit.shareBill")}
                </h3>
                <button
                  onClick={() => setShowQRCode(null)}
                  className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 rounded-2xl bg-white flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="h-24 w-24 text-black mx-auto" />
                    <p className="text-xs text-gray-500 mt-2">
                      Scan to view bill
                    </p>
                  </div>
                </div>
                <div className="w-full">
                  <label className="text-sm font-medium mb-1 block">
                    {t("billSplit.shareableLink")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/bill/${showQRCode}`}
                      className="flex-1 rounded-xl glass px-3 py-2 text-xs"
                    />
                    <button
                      onClick={() => copyShareLink(showQRCode)}
                      className="cursor-pointer px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
                    >
                      {t("billSplit.copyLink")}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {deleteConfirmId && (
          <ConfirmDialog
            isOpen={!!deleteConfirmId}
            onClose={() => setDeleteConfirmId(null)}
            onConfirm={() => deleteBill(deleteConfirmId)}
            title={t("billSplit.delete")}
            message={t("billSplit.confirmDelete")}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
