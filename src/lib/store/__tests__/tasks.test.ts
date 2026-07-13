import { describe, it, expect, beforeEach } from "vitest"
import { tasks } from "../tasks"

describe("tasks store", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("creates a task with completed: false by default", () => {
    const item = tasks.create({ title: "Buy groceries" })
    expect(item._id).toBeDefined()
    expect(item.completed).toBe(false)
    expect(item.title).toBe("Buy groceries")
  })

  it("allows overriding default fields", () => {
    const item = tasks.create({ title: "Read", completed: true })
    expect(item.completed).toBe(true)
  })

  it("lists tasks (prepend order)", () => {
    tasks.create({ title: "First" })
    tasks.create({ title: "Second" })
    const items = tasks.list()
    expect(items).toHaveLength(2)
    expect(items[0].title).toBe("Second")
    expect(items[1].title).toBe("First")
  })

  it("toggles task completion", () => {
    const item = tasks.create({ title: "Toggle me" })
    expect(item.completed).toBe(false)

    tasks.toggle(item._id)
    expect(tasks.list()[0].completed).toBe(true)

    tasks.toggle(item._id)
    expect(tasks.list()[0].completed).toBe(false)
  })

  it("toggle is a no-op for unknown id", () => {
    tasks.create({ title: "Real task" })
    tasks.toggle("nonexistent")
    expect(tasks.list()).toHaveLength(1)
  })

  it("removes a task", () => {
    const item = tasks.create({ title: "Remove me" })
    expect(tasks.list()).toHaveLength(1)

    tasks.remove(item._id)
    expect(tasks.list()).toHaveLength(0)
  })

  it("updates a task", () => {
    const item = tasks.create({ title: "Original" })
    tasks.update(item._id, { title: "Updated" })
    expect(tasks.list()[0].title).toBe("Updated")
  })

  it("stats returns correct counts", () => {
    tasks.create({ title: "Pending", completed: false })
    tasks.create({ title: "Done", completed: true })
    tasks.create({
      title: "Overdue",
      completed: false,
      dueDate: Date.now() - 1000,
    })

    const s = tasks.stats()
    expect(s.total).toBe(3)
    expect(s.completed).toBe(1)
    expect(s.pending).toBe(2)
    expect(s.overdue).toBe(1)
  })

  it("stats with no tasks returns zeros", () => {
    const s = tasks.stats()
    expect(s.total).toBe(0)
    expect(s.completed).toBe(0)
    expect(s.pending).toBe(0)
    expect(s.overdue).toBe(0)
  })

  it("persists to localStorage", () => {
    tasks.create({ title: "Persist" })
    const raw = localStorage.getItem("pv_tasks")
    expect(raw).toBeDefined()
    const parsed = JSON.parse(raw!)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].title).toBe("Persist")
  })
})
