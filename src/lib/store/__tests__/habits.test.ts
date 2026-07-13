import { describe, it, expect, beforeEach } from "vitest"
import { habits } from "../habits"

describe("habits store", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("creates a habit with empty completedDates", () => {
    const item = habits.create({ name: "Exercise" })
    expect(item._id).toBeDefined()
    expect(item.completedDates).toEqual([])
    expect(item.name).toBe("Exercise")
  })

  it("lists habits", () => {
    habits.create({ name: "Read" })
    habits.create({ name: "Meditate" })
    expect(habits.list()).toHaveLength(2)
  })

  it("check-in toggles a date on", () => {
    const item = habits.create({ name: "Run" })
    const date = Date.now()
    habits.checkIn(item._id, date)

    const stored = habits.list()[0]
    expect(stored.completedDates as number[]).toContain(date)
  })

  it("check-in toggles the same date off", () => {
    const item = habits.create({ name: "Run" })
    const date = new Date(2025, 0, 1).getTime()
    habits.checkIn(item._id, date)
    expect(habits.list()[0].completedDates as number[]).toHaveLength(1)

    habits.checkIn(item._id, date)
    expect(habits.list()[0].completedDates as number[]).toHaveLength(0)
  })

  it("check-in is a no-op for unknown id", () => {
    habits.create({ name: "Real habit" })
    habits.checkIn("nonexistent", Date.now())
    expect(habits.list()).toHaveLength(1)
  })

  it("removes a habit", () => {
    const item = habits.create({ name: "Drop me" })
    habits.remove(item._id)
    expect(habits.list()).toHaveLength(0)
  })

  it("updates a habit", () => {
    const item = habits.create({ name: "Original" })
    habits.update(item._id, { name: "Updated" })
    expect(habits.list()[0].name).toBe("Updated")
  })

  it("stats returns correct totals", () => {
    habits.create({ name: "A" })
    habits.create({ name: "B" })
    const s = habits.stats()
    expect(s.total).toBe(2)
    expect(s.todayCompleted).toBe(0)
    expect(s.avgRate).toBe(0)
  })

  it("persists to localStorage", () => {
    habits.create({ name: "Persist" })
    const raw = localStorage.getItem("pv_habits")
    expect(raw).toBeDefined()
    expect(JSON.parse(raw!)).toHaveLength(1)
  })
})
