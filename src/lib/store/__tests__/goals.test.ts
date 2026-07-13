import { describe, it, expect, beforeEach } from "vitest"
import { goals } from "../goals"

describe("goals store", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("creates a goal with default fields", () => {
    const item = goals.create({ title: "Learn React" })
    expect(item._id).toBeDefined()
    expect(item.progress).toBe(0)
    expect(item.status).toBe("active")
    expect(item.milestones).toEqual([])
    expect(item.title).toBe("Learn React")
  })

  it("allows overriding default fields", () => {
    const item = goals.create({
      title: "Custom",
      progress: 50,
      status: "completed",
    })
    expect(item.progress).toBe(50)
    expect(item.status).toBe("completed")
  })

  it("lists goals", () => {
    goals.create({ title: "A" })
    goals.create({ title: "B" })
    expect(goals.list()).toHaveLength(2)
  })

  it("removes a goal", () => {
    const item = goals.create({ title: "Drop" })
    goals.remove(item._id)
    expect(goals.list()).toHaveLength(0)
  })

  it("updates a goal", () => {
    const item = goals.create({ title: "Old" })
    goals.update(item._id, { progress: 75 })
    expect(goals.list()[0].progress).toBe(75)
  })

  it("persists to localStorage", () => {
    goals.create({ title: "Persist" })
    const raw = localStorage.getItem("pv_goals")
    expect(raw).toBeDefined()
    expect(JSON.parse(raw!)).toHaveLength(1)
  })
})
