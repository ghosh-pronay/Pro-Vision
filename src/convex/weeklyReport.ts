import { v } from "convex/values"
import { internalAction } from "./_generated/server"
import * as api from "../convex/_generated/api"
const internal = (api as any).internal ?? {}
import type { Doc } from "./_generated/dataModel"

export const sendWeeklyReport = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.users.listPremiumUsers)

    for (const user of users) {
      const userId = user._id
      const email = user.email

      if (!email) continue

      const now = Date.now()
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000

      const transactions = await ctx.runQuery(
        internal.transactions.listByDateRange,
        {
          userId,
          startDate: weekAgo,
          endDate: now,
        },
      )

      const tasks = await ctx.runQuery(internal.tasks.listByDateRange, {
        userId,
        startDate: weekAgo,
        endDate: now,
      })

      const habits = await ctx.runQuery(internal.habits.listByDateRange, {
        userId,
        startDate: weekAgo,
        endDate: now,
      })

      const moods = await ctx.runQuery(internal.moods.listByDateRange, {
        userId,
        startDate: weekAgo,
        endDate: now,
      })

      const totalIncome = transactions
        .filter((t: Doc<"transactions">) => t.type === "income")
        .reduce((sum: number, t: Doc<"transactions">) => sum + t.amount, 0)

      const totalExpenses = transactions
        .filter((t: Doc<"transactions">) => t.type === "expense")
        .reduce((sum: number, t: Doc<"transactions">) => sum + t.amount, 0)

      const completedTasks = tasks.filter(
        (t: Doc<"tasks">) => t.completed,
      ).length
      const totalTasks = tasks.length

      const habitCheckins = habits.reduce(
        (sum: number, h: Doc<"habits">) =>
          sum + h.completedDates.filter((d) => d >= weekAgo && d <= now).length,
        0,
      )

      const avgMood =
        moods.length > 0
          ? moods.reduce((sum: number, m: Doc<"moods">) => sum + m.value, 0) /
            moods.length
          : 0

      const report = {
        period: `${new Date(weekAgo).toLocaleDateString()} - ${new Date(now).toLocaleDateString()}`,
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalIncome - totalExpenses,
        tasksCompleted: completedTasks,
        totalTasks,
        habitCheckins,
        avgMood: Math.round(avgMood * 10) / 10,
        transactions: transactions.length,
      }

      await ctx.scheduler.runAfter(
        0,
        internal.weeklyReport.sendWeeklyReportEmail,
        {
          userId,
          email,
          report,
        },
      )
    }
  },
})

export const sendWeeklyReportEmail = internalAction({
  args: {
    userId: v.id("users"),
    email: v.string(),
    report: v.object({
      period: v.string(),
      income: v.number(),
      expenses: v.number(),
      savings: v.number(),
      tasksCompleted: v.number(),
      totalTasks: v.number(),
      habitCheckins: v.number(),
      avgMood: v.number(),
      transactions: v.number(),
    }),
  },
  handler: async (_ctx, args) => {
    const { email, report } = args

    const subject = `Your Weekly Report - ${report.period}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #6366f1;">📊 Weekly Report</h1>
        <p style="color: #666;">${report.period}</p>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="margin-top: 0;">💰 Financial Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;">Income</td>
              <td style="padding: 8px 0; text-align: right; color: #22c55e;">৳${report.income.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Expenses</td>
              <td style="padding: 8px 0; text-align: right; color: #ef4444;">৳${report.expenses.toLocaleString()}</td>
            </tr>
            <tr style="border-top: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; font-weight: bold;">Net Savings</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: ${report.savings >= 0 ? "#22c55e" : "#ef4444"};">৳${report.savings.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="margin-top: 0;">✅ Tasks & Habits</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;">Tasks Completed</td>
              <td style="padding: 8px 0; text-align: right;">${report.tasksCompleted}/${report.totalTasks}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Habit Check-ins</td>
              <td style="padding: 8px 0; text-align: right;">${report.habitCheckins}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">Transactions Tracked</td>
              <td style="padding: 8px 0; text-align: right;">${report.transactions}</td>
            </tr>
          </table>
        </div>

        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="margin-top: 0;">😊 Wellbeing</h2>
          <p>Average Mood: ${report.avgMood > 0 ? report.avgMood.toFixed(1) : "N/A"}</p>
        </div>

        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 40px;">
          Keep up the great work! 🚀
        </p>
      </div>
    `

    const apiKey = process.env.RESEND_API_KEY
    const fromAddress = process.env.WEEKLY_REPORT_FROM_EMAIL

    if (!apiKey || !fromAddress) {
      // Fails loudly instead of silently "succeeding" via console.log, so
      // missing config shows up in the Convex dashboard logs as an error.
      console.error(
        "[weeklyReport] Email not sent: set RESEND_API_KEY and WEEKLY_REPORT_FROM_EMAIL " +
          "as Convex environment variables to enable weekly report emails.",
      )
      return
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: email,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(
        `[weeklyReport] Resend API error (${res.status}): ${errText}`,
      )
    }
  },
})
