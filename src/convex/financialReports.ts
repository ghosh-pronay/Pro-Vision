import { query } from "./_generated/server"
import { v } from "convex/values"

export const balanceSheet = query({
  args: {
    asOfDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) return null

    const asOf = args.asOfDate || Date.now()

    const wallets = await ctx.db
      .query("wallets")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    const receivables = await ctx.db
      .query("receivables")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    const payables = await ctx.db
      .query("payables")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    const loans = await ctx.db
      .query("loans")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    const shortTermCutoff = asOf + 365 * 24 * 60 * 60 * 1000

    // IAS 1 Presentation of Financial Statements
    // Current Assets: expected to be realized within 12 months
    const cashAndEquivalents = wallets
      .filter(
        (w) =>
          w.type === "cash" ||
          w.type === "bank" ||
          w.type === "savings" ||
          w.type === "digital",
      )
      .reduce((sum, w) => sum + w.balance, 0)

    const cashBreakdown = wallets
      .filter(
        (w) =>
          w.type === "cash" ||
          w.type === "bank" ||
          w.type === "savings" ||
          w.type === "digital",
      )
      .map((w) => ({ name: w.name, type: w.type, amount: w.balance }))

    const tradeReceivables = receivables
      .filter((r) => r.status !== "completed" && r.createdAt <= asOf)
      .reduce((sum, r) => sum + (r.amount - r.receivedAmount), 0)

    const currentAssets = cashAndEquivalents + tradeReceivables

    // Non-current Assets: loans given to others
    const loansGivenTotal = loans
      .filter(
        (l) =>
          l.type === "given" && l.status !== "completed" && l.createdAt <= asOf,
      )
      .reduce((sum, l) => sum + (l.amount - l.paidAmount), 0)

    const nonCurrentAssets = loansGivenTotal

    const totalAssets = currentAssets + nonCurrentAssets

    // Current Liabilities: due within 12 months
    const tradePayables = payables
      .filter((p) => p.status !== "completed" && p.createdAt <= asOf)
      .reduce((sum, p) => sum + (p.amount - p.paidAmount), 0)

    const shortTermLoans = loans
      .filter(
        (l) =>
          l.type === "taken" &&
          l.status !== "completed" &&
          l.dueDate &&
          l.dueDate <= shortTermCutoff &&
          l.createdAt <= asOf,
      )
      .reduce((sum, l) => sum + (l.amount - l.paidAmount), 0)

    const currentLiabilities = tradePayables + shortTermLoans

    // Non-current Liabilities: loans taken due after 12 months or no due date
    const longTermLoans = loans
      .filter(
        (l) =>
          l.type === "taken" &&
          l.status !== "completed" &&
          (!l.dueDate || l.dueDate > shortTermCutoff) &&
          l.createdAt <= asOf,
      )
      .reduce((sum, l) => sum + (l.amount - l.paidAmount), 0)

    const nonCurrentLiabilities = longTermLoans

    const totalLiabilities = currentLiabilities + nonCurrentLiabilities

    // Net Worth (Equity) = Assets - Liabilities
    const netWorth = totalAssets - totalLiabilities

    return {
      asOf,
      assets: {
        current: currentAssets,
        currentBreakdown: [
          {
            label: "Cash and Cash Equivalents",
            amount: cashAndEquivalents,
            breakdown: cashBreakdown,
          },
          { label: "Trade and Other Receivables", amount: tradeReceivables },
        ],
        nonCurrent: nonCurrentAssets,
        nonCurrentBreakdown: [
          { label: "Loans Given to Others", amount: loansGivenTotal },
        ],
        total: totalAssets,
      },
      liabilities: {
        current: currentLiabilities,
        currentBreakdown: [
          { label: "Trade and Other Payables", amount: tradePayables },
          { label: "Short-term Loans Taken", amount: shortTermLoans },
        ],
        nonCurrent: nonCurrentLiabilities,
        nonCurrentBreakdown: [
          { label: "Long-term Loans Taken", amount: longTermLoans },
        ],
        total: totalLiabilities,
      },
      netWorth,
    }
  },
})

export const incomeExpense = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    comparisonStartDate: v.optional(v.number()),
    comparisonEndDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) return null

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect()

    // Default comparison period: same length, immediately before the selected period
    const periodLength = args.endDate - args.startDate
    const compStart = args.comparisonStartDate ?? args.startDate - periodLength
    const compEnd = args.comparisonEndDate ?? args.startDate

    // Year-to-date: from Jan 1 of the start year to the end date
    const startYear = new Date(args.startDate).getFullYear()
    const yearStart = new Date(startYear, 0, 1).getTime()

    // IAS 1 Presentation: Revenue and Expenses for the period
    const incomeCategories: Record<string, number> = {}
    const expenseCategories: Record<string, number> = {}
    const compIncomeCategories: Record<string, number> = {}
    const compExpenseCategories: Record<string, number> = {}

    let totalIncome = 0
    let totalExpense = 0
    let periodIncome = 0
    let periodExpense = 0
    let compIncome = 0
    let compExpense = 0
    let yearIncome = 0
    let yearExpense = 0

    for (const t of transactions) {
      const isIncome = t.type === "income"
      const isExpense = t.type === "expense"

      if (!isIncome && !isExpense) continue

      // Selected period
      if (t.date >= args.startDate && t.date <= args.endDate) {
        if (isIncome) {
          incomeCategories[t.category] =
            (incomeCategories[t.category] || 0) + t.amount
          totalIncome += t.amount
          periodIncome += t.amount
        } else {
          expenseCategories[t.category] =
            (expenseCategories[t.category] || 0) + t.amount
          totalExpense += t.amount
          periodExpense += t.amount
        }
      }

      // Comparison period
      if (t.date >= compStart && t.date < compEnd) {
        if (isIncome) {
          compIncomeCategories[t.category] =
            (compIncomeCategories[t.category] || 0) + t.amount
          compIncome += t.amount
        } else {
          compExpenseCategories[t.category] =
            (compExpenseCategories[t.category] || 0) + t.amount
          compExpense += t.amount
        }
      }

      // Year-to-date
      if (t.date >= yearStart && t.date <= args.endDate) {
        if (isIncome) yearIncome += t.amount
        else if (isExpense) yearExpense += t.amount
      }
    }

    const periodIncomeByCategory = Object.entries(incomeCategories)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: periodIncome > 0 ? Math.round((amount / periodIncome) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    const periodExpenseByCategory = Object.entries(expenseCategories)
      .map(([name, amount]) => ({
        name,
        amount,
        pct: periodExpense > 0 ? Math.round((amount / periodExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    const compIncomeByCategory = Object.entries(compIncomeCategories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)

    const compExpenseByCategory = Object.entries(compExpenseCategories)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)

    // Period-over-period changes
    const incomeChange =
      compIncome > 0
        ? Math.round(((periodIncome - compIncome) / compIncome) * 100)
        : periodIncome > 0
          ? 100
          : 0

    const expenseChange =
      compExpense > 0
        ? Math.round(((periodExpense - compExpense) / compExpense) * 100)
        : periodExpense > 0
          ? 100
          : 0

    // Format date labels
    const formatDateRange = (start: number, end: number) => {
      const s = new Date(start)
      const e = new Date(end)
      const opts: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
      return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}`
    }

    return {
      period: {
        selected: formatDateRange(args.startDate, args.endDate),
        comparison: formatDateRange(compStart, compEnd),
        year: startYear,
      },
      summary: {
        totalIncome,
        totalExpense,
        netIncome: totalIncome - totalExpense,
        periodIncome,
        periodExpense,
        periodNet: periodIncome - periodExpense,
        compIncome,
        compExpense,
        compNet: compIncome - compExpense,
        yearIncome,
        yearExpense,
        yearNet: yearIncome - yearExpense,
        incomeChange,
        expenseChange,
      },
      selectedPeriod: {
        income: { total: periodIncome, categories: periodIncomeByCategory },
        expense: { total: periodExpense, categories: periodExpenseByCategory },
      },
      comparisonPeriod: {
        income: { total: compIncome, categories: compIncomeByCategory },
        expense: { total: compExpense, categories: compExpenseByCategory },
      },
    }
  },
})
