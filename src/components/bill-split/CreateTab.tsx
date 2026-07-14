import { motion, AnimatePresence } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { useState, useMemo } from "react"
import { Plus, Calculator, History, X, Trash2 } from "lucide-react"
import { formatBanglaCurrency } from "@/lib/bangla-numbers"
import { toastError } from "@/lib/toast-helpers"
import {
  type SplitMethod,
  type BillCategory,
  type Participant,
  type Bill,
  type Friend,
  CATEGORIES,
  CURRENCIES,
  fadeUp,
  slideIn,
  getCategoryIcon,
  getCategoryColor,
  getStatusColor,
  formatCurrency,
} from "./types"

interface CreateTabProps {
  bills: Bill[]
  friends: Friend[]
  t: (key: string) => string
  onCreateBill: (bill: Omit<Bill, "_id" | "status" | "paidAmount">) => void
  onNavigateToHistory: () => void
  onNavigateToBalances: () => void
}

export function CreateTab({
  bills,
  friends,
  t,
  onCreateBill,
  onNavigateToHistory,
  onNavigateToBalances,
}: CreateTabProps) {
  const { lang } = useLang()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [splitMethod, setSplitMethod] = useState<SplitMethod>("equal")
  const [participants, setParticipants] = useState<Participant[]>([])

  const [formData, setFormData] = useState({
    title: "",
    totalAmount: "",
    category: "food" as BillCategory,
    currency: "BDT" as "BDT" | "USD",
    date: new Date().toISOString().split("T")[0],
  })

  const remainingPercentage = useMemo(() => {
    const total = participants.reduce((s, p) => s + p.percentage, 0)
    return 100 - total
  }, [participants])

  const calculateSplit = () => {
    const total = parseFloat(formData.totalAmount) || 0
    if (participants.length === 0 || total === 0) return

    if (splitMethod === "equal") {
      const share = total / participants.length
      setParticipants(
        participants.map((p) => ({
          ...p,
          amount: Math.round(share * 100) / 100,
          percentage: 100 / participants.length,
        })),
      )
    } else if (splitMethod === "percentage") {
      setParticipants(
        participants.map((p) => ({
          ...p,
          amount: Math.round(((total * p.percentage) / 100) * 100) / 100,
        })),
      )
    }
  }

  const addParticipant = (name?: string) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: name || "",
      amount: 0,
      percentage: 0,
      paid: false,
    }
    setParticipants([...participants, newParticipant])
    if (name) calculateSplit()
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id))
  }

  const updateParticipant = (
    id: string,
    field: keyof Participant,
    value: string | number | boolean,
  ) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    )
    if (field === "percentage" || field === "amount") {
      setTimeout(calculateSplit, 0)
    }
  }

  const createBill = () => {
    if (!formData.title || !formData.totalAmount || participants.length === 0) {
      toastError(
        lang === "bn"
          ? "অনুগ্রহ করে সব তথ্য পূরণ করুন"
          : "Please fill all fields",
      )
      return
    }

    const total = parseFloat(formData.totalAmount)
    if (splitMethod === "percentage") {
      const totalPct = participants.reduce((s, p) => s + p.percentage, 0)
      if (Math.abs(totalPct - 100) > 0.01) {
        toastError(t("billSplit.percentageMismatch"))
        return
      }
    }
    if (splitMethod === "custom") {
      const totalCustom = participants.reduce((s, p) => s + p.amount, 0)
      if (Math.abs(totalCustom - total) > 0.01) {
        toastError(t("billSplit.amountMismatch"))
        return
      }
    }

    onCreateBill({
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
      createdBy: participants[0]?.name || "You",
    })

    setShowCreateForm(false)
    setFormData({
      title: "",
      totalAmount: "",
      category: "food",
      currency: "BDT",
      date: new Date().toISOString().split("T")[0],
    })
    setParticipants([])
    setSplitMethod("equal")
  }

  return (
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
                {lang === "bn" ? "নতুন বিল তৈরি করুন" : "Create a new bill"}
              </p>
            </button>
            <button
              onClick={onNavigateToHistory}
              className="cursor-pointer glass rounded-xl p-4 text-left hover:bg-foreground/5 transition-all"
            >
              <History className="h-5 w-5 text-blue-500 mb-2" />
              <p className="font-medium">{t("billSplit.viewHistory")}</p>
              <p className="text-xs text-muted-foreground">
                {lang === "bn" ? "পূর্ববর্তী বিল দেখুন" : "View past bills"}
              </p>
            </button>
            <button
              onClick={onNavigateToBalances}
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
                const CatIcon = getCategoryIcon(bill.category)
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
                            {new Date(bill.date).toLocaleDateString(
                              lang === "bn" ? "bn-BD" : "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}{" "}
                            · {bill.participants.length}{" "}
                            {lang === "bn" ? "জন" : "people"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
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
                    </div>
                  </motion.div>
                )
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
                setShowCreateForm(false)
                setParticipants([])
              }}
              className="cursor-pointer p-2 rounded-lg hover:bg-foreground/5"
              aria-label="Close"
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
                  lang === "bn" ? "বিলের শিরোনাম" : "e.g. Dinner at Restaurant"
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
                    setFormData({ ...formData, totalAmount: e.target.value })
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
                {(["equal", "percentage", "custom"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setSplitMethod(method)
                      if (method === "equal" && participants.length > 0) {
                        setTimeout(calculateSplit, 0)
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
                ))}
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
                            addParticipant(e.target.value)
                            e.target.value = ""
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
                            updateParticipant(p.id, "name", e.target.value)
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
                                  formatBanglaCurrency,
                                )
                              : "০.০০ টাকা"}
                          </span>
                        )}
                        <button
                          onClick={() => removeParticipant(p.id)}
                          className="cursor-pointer p-1.5 rounded-lg hover:bg-destructive/10"
                          aria-label="Remove participant"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {splitMethod === "percentage" && participants.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <span
                    className={remainingPercentage < 0 ? "text-red-500" : ""}
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
  )
}
