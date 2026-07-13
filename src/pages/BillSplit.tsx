import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { useState, useMemo } from "react"
import { Receipt, Wallet, AlertCircle, TrendingDown } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { formatBanglaCurrency } from "@/lib/bangla-numbers"
import { toastSuccess } from "@/lib/toast-helpers"
import { logger } from "@/lib/logger"
import {
  CreateTab,
  HistoryTab,
  BalancesTab,
  AddFriendModal,
  SettleModal,
  QRCodeModal,
} from "@/components/bill-split"
import {
  type Bill,
  type Friend,
  type BillStatus,
  fadeUp,
  formatCurrency,
} from "@/components/bill-split/types"

const NOW = Date.now()

export default function BillSplit() {
  const { lang } = useLang()
  const [activeTab, setActiveTab] = useState<"create" | "history" | "balances">(
    "create",
  )
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
      date: NOW - 86400000,
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
      date: NOW - 172800000,
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
      date: NOW - 259200000,
      status: "pending",
      createdBy: "Rahim",
      paidAmount: 200,
    },
  ])
  const [friends, setFriends] = useState<Friend[]>([
    { _id: "1", name: "Rahim", phone: "+8801712345678" },
    { _id: "2", name: "Karim", phone: "+8801812345678" },
    { _id: "3", name: "Jamal" },
    { _id: "4", name: "Salam", phone: "+8801912345678" },
  ])
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [showSettleModal, setShowSettleModal] = useState<string | null>(null)
  const [showQRCode, setShowQRCode] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [expandedBill, setExpandedBill] = useState<string | null>(null)

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
    }
    return translations[key]?.[lang] || translations[key]?.en || key
  }

  const stats = useMemo(() => {
    const totalBills = bills.length
    const totalAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0)
    const unsettled = bills.filter((b) => b.status !== "settled").length
    const totalOwed = bills.reduce(
      (sum, b) => sum + (b.totalAmount - b.paidAmount),
      0,
    )
    return { totalBills, totalAmount, unsettled, totalOwed }
  }, [bills])

  const netBalances = useMemo(() => {
    const net: Record<string, number> = {}
    bills
      .filter((b) => b.status !== "settled")
      .forEach((bill) => {
        bill.participants.forEach((p) => {
          if (!p.paid) {
            net[p.name] = (net[p.name] || 0) - p.amount
          }
        })
        net[bill.createdBy] =
          (net[bill.createdBy] || 0) + (bill.totalAmount - bill.paidAmount)
      })
    const debtors = Object.entries(net)
      .filter(([, v]) => v < 0)
      .map(([name, amount]) => ({ name, amount: Math.abs(amount) }))
    const creditors = Object.entries(net)
      .filter(([, v]) => v > 0)
      .map(([name, amount]) => ({ name, amount }))
    const transactions: { from: string; to: string; amount: number }[] = []
    let i = 0,
      j = 0
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].amount, creditors[j].amount)
      if (amount > 0) {
        transactions.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount,
        })
      }
      debtors[i].amount -= amount
      creditors[j].amount -= amount
      if (debtors[i].amount === 0) i++
      if (creditors[j].amount === 0) j++
    }
    return transactions
  }, [bills])

  const createBill = (
    billData: Omit<Bill, "_id" | "status" | "paidAmount">,
  ) => {
    const newBill: Bill = {
      ...billData,
      _id: Date.now().toString(),
      status: "pending",
      paidAmount: 0,
    }
    setBills([newBill, ...bills])
    toastSuccess(t("billSplit.billCreated"))
  }

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
    )
    setShowSettleModal(null)
    toastSuccess(t("billSplit.billSettled"))
  }

  const markParticipantPaid = (billId: string, participantId: string) => {
    setBills(
      bills.map((b) => {
        if (b._id !== billId) return b
        const updatedParticipants = b.participants.map((p) =>
          p.id === participantId ? { ...p, paid: !p.paid } : p,
        )
        const newPaidAmount = updatedParticipants
          .filter((p) => p.paid)
          .reduce((sum, p) => sum + p.amount, 0)
        const allPaid = updatedParticipants.every((p) => p.paid)
        return {
          ...b,
          participants: updatedParticipants,
          paidAmount: newPaidAmount,
          status: allPaid
            ? "settled"
            : newPaidAmount > 0
              ? "partial"
              : "pending",
        }
      }),
    )
  }

  const deleteBill = (billId: string) => {
    setBills(bills.filter((b) => b._id !== billId))
    setDeleteConfirmId(null)
    toastSuccess(t("billSplit.billDeleted"))
  }

  const addFriend = (name: string, phone: string) => {
    if (!name) return
    const newFriend: Friend = {
      _id: Date.now().toString(),
      name,
      phone: phone || undefined,
    }
    setFriends([...friends, newFriend])
    setShowAddFriend(false)
    toastSuccess(t("billSplit.friendAdded"))
  }

  const deleteFriend = (friendId: string) => {
    setFriends(friends.filter((f) => f._id !== friendId))
    toastSuccess(t("billSplit.friendDeleted"))
  }

  const copyShareLink = (billId: string) => {
    const link = `${window.location.origin}/bill/${billId}`
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toastSuccess(t("billSplit.linkCopied"))
      })
      .catch((e) => logger.error("BillSplit", "copy link failed", e))
  }

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
            {formatCurrency(stats.totalAmount, undefined, formatBanglaCurrency)}
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
            {formatCurrency(stats.totalOwed, undefined, formatBanglaCurrency)}
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
          <CreateTab
            bills={bills}
            friends={friends}
            t={t}
            onCreateBill={createBill}
            onNavigateToHistory={() => setActiveTab("history")}
            onNavigateToBalances={() => setActiveTab("balances")}
          />
        )}

        {activeTab === "history" && (
          <HistoryTab
            bills={bills}
            t={t}
            expandedBill={expandedBill}
            onToggleExpand={setExpandedBill}
            onMarkPaid={markParticipantPaid}
            onSettle={(id) => setShowSettleModal(id)}
            onDelete={(id) => setDeleteConfirmId(id)}
            onCopyLink={copyShareLink}
            onShowQR={(id) => setShowQRCode(id)}
          />
        )}

        {activeTab === "balances" && (
          <BalancesTab
            bills={bills}
            friends={friends}
            netBalances={netBalances}
            t={t}
            onShowAddFriend={() => setShowAddFriend(true)}
            onDeleteFriend={deleteFriend}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddFriend && (
          <AddFriendModal
            t={t}
            onAdd={addFriend}
            onClose={() => setShowAddFriend(false)}
          />
        )}

        {showSettleModal && (
          <SettleModal
            billId={showSettleModal}
            t={t}
            onSettle={settleBill}
            onClose={() => setShowSettleModal(null)}
          />
        )}

        {showQRCode && (
          <QRCodeModal
            billId={showQRCode}
            onCopyLink={copyShareLink}
            onClose={() => setShowQRCode(null)}
          />
        )}

        {deleteConfirmId && (
          <ConfirmDialog
            open={!!deleteConfirmId}
            onCancel={() => setDeleteConfirmId(null)}
            onConfirm={() => deleteBill(deleteConfirmId)}
            title={t("billSplit.delete")}
            description={t("billSplit.confirmDelete")}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
