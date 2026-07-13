import { describe, it, expect, beforeEach } from "vitest"
import { focusSessions } from "../focus"

describe("focusSessions store", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("creates a focus session", () => {
    const item = focusSessions.create({ duration: 25, task: "Coding" })
    expect(item._id).toBeDefined()
    expect(item.duration).toBe(25)
    expect(item.task).toBe("Coding")
  })

  it("lists focus sessions", () => {
    focusSessions.create({ duration: 25 })
    focusSessions.create({ duration: 15 })
    expect(focusSessions.list()).toHaveLength(2)
  })

  it("removes a focus session", () => {
    const item = focusSessions.create({ duration: 10 })
    focusSessions.remove(item._id)
    expect(focusSessions.list()).toHaveLength(0)
  })

  it("stats with no sessions returns zeros", () => {
    const s = focusSessions.stats()
    expect(s.sessions).toBe(0)
    expect(s.totalMinutes).toBe(0)
    expect(s.totalHours).toBe(0)
    expect(s.todayMinutes).toBe(0)
  })

  it("stats computes totals", () => {
    const now = Date.now()
    focusSessions.create({ duration: 30, completedAt: now })
    focusSessions.create({ duration: 60, completedAt: now })
    const s = focusSessions.stats()
    expect(s.sessions).toBe(2)
    expect(s.totalMinutes).toBe(90)
    expect(s.totalHours).toBe(1.5)
    expect(s.todayMinutes).toBe(90)
  })

  it("persists to localStorage", () => {
    focusSessions.create({ duration: 25 })
    const raw = localStorage.getItem("pv_focusSessions")
    expect(raw).toBeDefined()
    expect(JSON.parse(raw!)).toHaveLength(1)
  })
})
