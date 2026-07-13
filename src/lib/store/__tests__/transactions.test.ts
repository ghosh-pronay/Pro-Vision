import { describe, it, expect, beforeEach } from "vitest"
import { transactions } from "../transactions"

describe("transactions store", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("creates a transaction", () => {
    const item = transactions.create({
      title: "Salary",
      amount: 50000,
      type: "income",
    })
    expect(item._id).toBeDefined()
    expect(item.title).toBe("Salary")
    expect(item.amount).toBe(50000)
    expect(item.type).toBe("income")
  })

  it("lists transactions (prepend order)", () => {
    transactions.create({ title: "First" })
    transactions.create({ title: "Second" })
    const items = transactions.list()
    expect(items).toHaveLength(2)
    expect(items[0].title).toBe("Second")
    expect(items[1].title).toBe("First")
  })

  it("removes a transaction", () => {
    const item = transactions.create({ title: "Temp" })
    transactions.remove(item._id)
    expect(transactions.list()).toHaveLength(0)
  })

  it("remove is a no-op for unknown id", () => {
    transactions.create({ title: "Real" })
    transactions.remove("nonexistent")
    expect(transactions.list()).toHaveLength(1)
  })

  it("stats returns correct totals", () => {
    const now = Date.now()
    transactions.create({
      title: "Income",
      amount: 10000,
      type: "income",
      date: now,
    })
    transactions.create({
      title: "Expense",
      amount: 3000,
      type: "expense",
      date: now,
    })

    const s = transactions.stats()
    expect(s.totalIncome).toBe(10000)
    expect(s.totalExpense).toBe(3000)
    expect(s.balance).toBe(7000)
  })

  it("stats excludes unknown type", () => {
    transactions.create({ title: "Weird", amount: 500, type: "transfer" })
    const s = transactions.stats()
    expect(s.totalIncome).toBe(0)
    expect(s.totalExpense).toBe(0)
  })

  it("persists to localStorage", () => {
    transactions.create({ title: "Persist" })
    const raw = localStorage.getItem("pv_transactions")
    expect(raw).toBeDefined()
    expect(JSON.parse(raw!)).toHaveLength(1)
  })
})
