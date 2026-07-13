import { describe, it, expect, beforeEach } from "vitest"
import { wallets } from "../wallets"

describe("wallets store", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("creates a wallet", () => {
    const item = wallets.create({ name: "Cash" })
    expect(item._id).toBeDefined()
    expect(item.name).toBe("Cash")
    expect(item.createdAt).toBeDefined()
  })

  it("lists wallets", () => {
    wallets.create({ name: "Bank" })
    wallets.create({ name: "Card" })
    expect(wallets.list()).toHaveLength(2)
  })

  it("removes a wallet", () => {
    const item = wallets.create({ name: "Temp" })
    wallets.remove(item._id)
    expect(wallets.list()).toHaveLength(0)
  })

  it("updates a wallet", () => {
    const item = wallets.create({ name: "Old" })
    wallets.update(item._id, { name: "New" })
    expect(wallets.list()[0].name).toBe("New")
  })

  it("persists to localStorage", () => {
    wallets.create({ name: "Saved" })
    const raw = localStorage.getItem("pv_wallets")
    expect(raw).toBeDefined()
    expect(JSON.parse(raw!)).toHaveLength(1)
  })

  it("generates unique ids", () => {
    const a = wallets.create({ name: "A" })
    const b = wallets.create({ name: "B" })
    expect(a._id).not.toBe(b._id)
  })
})
