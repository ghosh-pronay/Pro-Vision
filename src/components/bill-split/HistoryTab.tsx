import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/i18n/LanguageContext";
import {
  Receipt,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Link2,
  QrCode,
  CheckCircle,
  Check,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBanglaCurrency } from "@/lib/bangla-numbers";
import {
  type Bill,
  type BillStatus,
  fadeUp,
  slideIn,
  getCategoryIcon,
  getCategoryColor,
  getStatusColor,
  formatCurrency,
} from "./types";

interface HistoryTabProps {
  bills: Bill[];
  t: (key: string) => string;
  expandedBill: string | null;
  onToggleExpand: (id: string | null) => void;
  onMarkPaid: (billId: string, participantId: string) => void;
  onSettle: (billId: string) => void;
  onDelete: (billId: string) => void;
  onCopyLink: (billId: string) => void;
  onShowQR: (billId: string) => void;
}

export function HistoryTab({
  bills,
  t,
  expandedBill,
  onToggleExpand,
  onMarkPaid,
  onSettle,
  onDelete,
  onCopyLink,
  onShowQR,
}: HistoryTabProps) {
  const { lang } = useLang();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(
      lang === "bn" ? "bn-BD" : "en-US",
      { day: "numeric", month: "short", year: "numeric" },
    );
  };

  if (bills.length === 0) {
    return (
      <motion.div
        key="history"
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, y: -10 }}
        variants={fadeUp}
        className="space-y-4"
      >
        <EmptyState
          icon={Receipt}
          title={t("billSplit.noBills")}
          description={t("billSplit.noBillsDesc")}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="history"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      variants={fadeUp}
      className="space-y-4"
    >
      {bills.map((bill) => {
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
              onClick={() => onToggleExpand(isExpanded ? null : bill._id)}
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
                      {formatDate(bill.date)} · {bill.participants.length}{" "}
                      {lang === "bn" ? "জন" : "people"} ·{" "}
                      {t(`billSplit.${bill.splitMethod}Split`)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-bold">
                      {formatCurrency(
                        bill.totalAmount,
                        bill.currency,
                        formatBanglaCurrency,
                      )}
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
                                onMarkPaid(bill._id, p.id);
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
                              {formatCurrency(
                                p.amount,
                                bill.currency,
                                formatBanglaCurrency,
                              )}
                            </span>
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
                            onCopyLink(bill._id);
                          }}
                          className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg glass text-xs hover:bg-foreground/5"
                        >
                          <Link2 className="h-3 w-3" />
                          {t("billSplit.copyLink")}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowQR(bill._id);
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
                              onSettle(bill._id);
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
                            onDelete(bill._id);
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
      })}
    </motion.div>
  );
}
