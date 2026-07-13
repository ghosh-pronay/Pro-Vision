import { describe, it, expect, beforeEach } from "vitest"
import { moods } from "../mood"

describe("moods store", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("creates a mood entry", () => {
    const item = moods.create({ mood: "happy", value: 5 })
    expect(item._id).toBeDefined()
    expect(item.mood).toBe("happy")
    expect(item.value).toBe(5)
  })

  it("lists moods", () => {
    moods.create({ mood: "happy", value: 5 })
    moods.create({ mood: "sad", value: 2 })
    expect(moods.list()).toHaveLength(2)
  })

  it("removes a mood", () => {
    const item = moods.create({ mood: "ok", value: 3 })
    moods.remove(item._id)
    expect(moods.list()).toHaveLength(0)
  })

  it("stats with no moods returns defaults", () => {
    const s = moods.stats()
    expect(s.moodStreak).toBe(0)
    expect(s.todayMood).toBeNull()
    expect(s.avgMood).toBe(0)
  })

  it("stats computes average mood", () => {
    moods.create({ mood: "happy", value: 4 })
    moods.create({ mood: "sad", value: 2 })
    const s = moods.stats()
    expect(s.avgMood).toBe(3)
  })

  it("stats finds today's mood", () => {
    moods.create({ mood: "great", value: 5, date: Date.now() })
    const s = moods.stats()
    expect(s.todayMood).toEqual({ mood: "great", value: 5 })
  })

  it("persists to localStorage", () => {
    moods.create({ mood: "Persist", value: 1 })
    const raw = localStorage.getItem("pv_moods")
    expect(raw).toBeDefined()
    expect(JSON.parse(raw!)).toHaveLength(1)
  })
})
