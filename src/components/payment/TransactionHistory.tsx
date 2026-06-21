import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Smartphone,
  Building2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  description?: string;
}

interface TransactionHistoryProps {
  transactions?: Transaction[];
  onExport?: (transactions: Transaction[]) => void;
  onTransactionClick?: (transaction: Transaction) => void;
}

const METHOD_LABELS: Record<
  PaymentMethod,
  { en: string; bn: string; icon: typeof Smartphone }
> = {
  bkash: { en: "bKash", bn: "বিকাশ", icon: Smartphone },
  nagad: { en: "Nagad", bn: "নগদ", icon: Smartphone },
  rocket: { en: "Rocket", bn: "রকেট", icon: Smartphone },
  bank: { en: "Bank Transfer", bn: "ব্যাংক ট্রান্সফার", icon: Building2 },
  card: { en: "Card", bn: "কার্ড", icon: CreditCard },
  paypal: { en: "PayPal", bn: "পেপাল", icon: CreditCard },
  stripe: { en: "Stripe", bn: "স্ট্রাইপ", icon: CreditCard },
};

const STATUS_CONFIG: Record<
  TransactionStatus,
  {
    icon: typeof CheckCircle2;
    color: string;
    label: { en: string; bn: string };
  }
> = {
  completed: {
    icon: CheckCircle2,
    color: "text-green-400",
    label: { en: "Completed", bn: "সম্পন্ন" },
  },
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    label: { en: "Pending", bn: "মুলতুবি" },
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    label: { en: "Failed", bn: "ব্যর্থ" },
  },
};

const ITEMS_PER_PAGE = 8;

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN001",
    date: "2026-06-18T10:30:00Z",
    amount: 500,
    currency: "৳",
    method: "bkash",
    status: "completed",
    recipient: "01712345678",
    description: "Send Money",
  },
  {
    id: "TXN002",
    date: "2026-06-17T14:15:00Z",
    amount: 1200,
    currency: "৳",
    method: "nagad",
    status: "completed",
    recipient: "01812345678",
    description: "Payment",
  },
  {
    id: "TXN003",
    date: "2026-06-16T09:45:00Z",
    amount: 350,
    currency: "৳",
    method: "rocket",
    status: "pending",
    recipient: "01912345678",
    description: "Transfer",
  },
  {
    id: "TXN004",
    date: "2026-06-15T16:20:00Z",
    amount: 2500,
    currency: "৳",
    method: "bank",
    status: "completed",
    recipient: "DBBL-1234567890",
    description: "Bank Transfer",
  },
  {
    id: "TXN005",
    date: "2026-06-14T11:00:00Z",
    amount: 49.99,
    currency: "$",
    method: "card",
    status: "completed",
    recipient: "Netflix",
    description: "Subscription",
  },
  {
    id: "TXN006",
    date: "2026-06-13T08:30:00Z",
    amount: 800,
    currency: "৳",
    method: "bkash",
    status: "failed",
    recipient: "01612345678",
    description: "Send Money",
  },
  {
    id: "TXN007",
    date: "2026-06-12T13:45:00Z",
    amount: 15.99,
    currency: "$",
    method: "paypal",
    status: "completed",
    recipient: "Amazon",
    description: "Purchase",
  },
  {
    id: "TXN008",
    date: "2026-06-11T10:15:00Z",
    amount: 2000,
    currency: "৳",
    method: "stripe",
    status: "completed",
    recipient: "Pro-Vision Premium",
    description: "Subscription",
  },
];

export default function TransactionHistory({
  transactions = MOCK_TRANSACTIONS,
  onExport,
  onTransactionClick,
}: TransactionHistoryProps) {
  const { lang } = useLang();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | "all">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "all">(
    "all",
  );
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        searchQuery === "" ||
        txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.recipient?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMethod =
        filterMethod === "all" || txn.method === filterMethod;
      const matchesStatus =
        filterStatus === "all" || txn.status === filterStatus;

      const txnDate = new Date(txn.date);
      const matchesDateRange =
        (!dateRange.start || txnDate >= new Date(dateRange.start)) &&
        (!dateRange.end || txnDate <= new Date(dateRange.end + "T23:59:59"));

      return (
        matchesSearch && matchesMethod && matchesStatus && matchesDateRange
      );
    });
  }, [transactions, searchQuery, filterMethod, filterStatus, dateRange]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleExport = () => {
    if (onExport) {
      onExport(filteredTransactions);
      return;
    }

    const headers = [
      "ID",
      "Date",
      "Amount",
      "Currency",
      "Method",
      "Status",
      "Recipient",
      "Description",
    ];
    const rows = filteredTransactions.map((txn) => [
      txn.id,
      new Date(txn.date).toISOString(),
      txn.amount.toString(),
      txn.currency,
      txn.method,
      txn.status,
      txn.recipient || "",
      txn.description || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      className="space-y-4"
    >
      <motion.div
        variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
            <History className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold">
            {lang === "bn" ? "লেনদেনের ইতিহাস" : "Transaction History"}
          </h3>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="glass"
        >
          <Download className="w-4 h-4" />
          {lang === "bn" ? "CSV এক্সপোর্ট" : "Export CSV"}
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={
                lang === "bn"
                  ? "ট্রানজেকশন আইডি খুঁজুন..."
                  : "Search transaction ID..."
              }
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="glass pl-9"
            />
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="icon"
            className={`glass ${showFilters ? "bg-primary/10" : ""}`}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-xl p-4 space-y-3 hover-row">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">
                      {lang === "bn" ? "পদ্ধতি" : "Method"}
                    </label>
                    <select
                      value={filterMethod}
                      onChange={(e) => {
                        setFilterMethod(
                          e.target.value as PaymentMethod | "all",
                        );
                        setCurrentPage(1);
                      }}
                      className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all" className="bg-gray-900">
                        {lang === "bn" ? "সব" : "All"}
                      </option>
                      {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map(
                        (method) => (
                          <option
                            key={method}
                            value={method}
                            className="bg-gray-900"
                          >
                            {METHOD_LABELS[method][lang]}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">
                      {lang === "bn" ? "অবস্থা" : "Status"}
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(
                          e.target.value as TransactionStatus | "all",
                        );
                        setCurrentPage(1);
                      }}
                      className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all" className="bg-gray-900">
                        {lang === "bn" ? "সব" : "All"}
                      </option>
                      {(Object.keys(STATUS_CONFIG) as TransactionStatus[]).map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                            className="bg-gray-900"
                          >
                            {STATUS_CONFIG[status].label[lang]}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">
                      {lang === "bn" ? "শুরুর তারিখ" : "Start Date"}
                    </label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => {
                        setDateRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }));
                        setCurrentPage(1);
                      }}
                      className="glass text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">
                      {lang === "bn" ? "শেষ তারিখ" : "End Date"}
                    </label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => {
                        setDateRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }));
                        setCurrentPage(1);
                      }}
                      className="glass text-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-2">
        {paginatedTransactions.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center text-muted-foreground">
            {lang === "bn"
              ? "কোনো লেনদেন পাওয়া যায়নি"
              : "No transactions found"}
          </div>
        ) : (
          <AnimatePresence>
            {paginatedTransactions.map((txn, index) => {
              const methodConfig = METHOD_LABELS[txn.method];
              const statusConfig = STATUS_CONFIG[txn.status];
              const MethodIcon = methodConfig.icon;
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onTransactionClick?.(txn)}
                  className="glass rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-white/5">
                    <MethodIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">
                        {txn.id}
                      </span>
                      <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
                    </div>
                    <div className="text-sm truncate">
                      {txn.description || methodConfig[lang]}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(txn.date).toLocaleDateString(
                        lang === "bn" ? "bn-BD" : "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {txn.currency}
                      {txn.amount.toFixed(2)}
                    </div>
                    <div className={`text-xs ${statusConfig.color}`}>
                      {statusConfig.label[lang]}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>

      {totalPages > 1 && (
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between glass rounded-xl p-3"
        >
          <span className="text-sm text-muted-foreground">
            {lang === "bn" ? "পৃষ্ঠ" : "Page"} {currentPage} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="glass"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
              className="glass"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
