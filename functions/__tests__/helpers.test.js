import { vi, describe, it, expect, beforeEach } from "vitest"

const {
  escapeHtml,
  sanitizeGenerationConfig,
  checkRateLimit,
  ALLOWED_GROQ_MODELS,
  rateLimits,
} = require("../helpers.js")

// ========================================
// Unit tests: escapeHtml
// ========================================
describe("escapeHtml", () => {
  it("returns empty string for null", () => {
    expect(escapeHtml(null)).toBe("")
  })

  it("returns empty string for undefined", () => {
    expect(escapeHtml(undefined)).toBe("")
  })

  it("returns empty string for empty string", () => {
    expect(escapeHtml("")).toBe("")
  })

  it("escapes ampersand", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b")
  })

  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;")
  })

  it("escapes double quotes", () => {
    expect(escapeHtml('"hi"')).toBe("&quot;hi&quot;")
  })

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#039;s")
  })

  it("converts non-string to string", () => {
    expect(escapeHtml(123)).toBe("123")
  })

  it("escapes multiple entities in one string", () => {
    expect(escapeHtml('<b class="x">a&b</b>')).toBe(
      "&lt;b class=&quot;x&quot;&gt;a&amp;b&lt;/b&gt;",
    )
  })
})

// ========================================
// Unit tests: sanitizeGenerationConfig
// ========================================
describe("sanitizeGenerationConfig", () => {
  it("returns undefined for null", () => {
    expect(sanitizeGenerationConfig(null)).toBeUndefined()
  })

  it("returns undefined for undefined", () => {
    expect(sanitizeGenerationConfig(undefined)).toBeUndefined()
  })

  it("returns undefined for non-object", () => {
    expect(sanitizeGenerationConfig("string")).toBeUndefined()
    expect(sanitizeGenerationConfig(42)).toBeUndefined()
  })

  it("whitelists allowed fields", () => {
    const result = sanitizeGenerationConfig({
      temperature: 0.5,
      topK: 20,
    })
    expect(result).toEqual({ temperature: 0.5, topK: 20 })
  })

  it("strips non-allowed fields", () => {
    const result = sanitizeGenerationConfig({
      temperature: 0.5,
      maliciousField: "hack",
      anotherBad: 123,
    })
    expect(result).toEqual({ temperature: 0.5 })
    expect(result.maliciousField).toBeUndefined()
    expect(result.anotherBad).toBeUndefined()
  })

  it("returns undefined when no allowed fields present", () => {
    expect(sanitizeGenerationConfig({ foo: 1 })).toBeUndefined()
  })

  it("handles all allowed fields", () => {
    const config = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
      stopSequences: ["END"],
      candidateCount: 1,
    }
    const result = sanitizeGenerationConfig(config)
    expect(result).toEqual(config)
  })
})

// ========================================
// Unit tests: checkRateLimit
// ========================================
describe("checkRateLimit", () => {
  beforeEach(() => {
    rateLimits.clear()
  })

  it("allows first request", () => {
    const uid = "user-first-" + Date.now()
    expect(checkRateLimit(uid)).toBe(true)
  })

  it("allows 10 requests", () => {
    const uid = "user-ten-" + Date.now()
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(uid)).toBe(true)
    }
  })

  it("blocks the 11th request", () => {
    const uid = "user-block-" + Date.now()
    for (let i = 0; i < 10; i++) {
      checkRateLimit(uid)
    }
    expect(checkRateLimit(uid)).toBe(false)
  })

  it("tracks different users independently", () => {
    const ts = Date.now()
    const uid1 = "user-a-" + ts
    const uid2 = "user-b-" + ts

    for (let i = 0; i < 10; i++) {
      checkRateLimit(uid1)
    }
    expect(checkRateLimit(uid1)).toBe(false)
    expect(checkRateLimit(uid2)).toBe(true)
  })

  it("resets after window expires", () => {
    const uid = "user-reset-" + Date.now()
    for (let i = 0; i < 10; i++) {
      checkRateLimit(uid)
    }
    expect(checkRateLimit(uid)).toBe(false)

    // Simulate time passing
    const record = rateLimits.get(uid)
    record.resetAt = Date.now() - 1

    expect(checkRateLimit(uid)).toBe(true)
  })
})

// ========================================
// ALLOWED_GROQ_MODELS constant
// ========================================
describe("ALLOWED_GROQ_MODELS", () => {
  it("contains expected models", () => {
    expect(ALLOWED_GROQ_MODELS).toContain("llama-3.3-70b-versatile")
    expect(ALLOWED_GROQ_MODELS).toContain("llama-3.1-8b-instant")
    expect(ALLOWED_GROQ_MODELS).toContain("gemma2-9b-it")
    expect(ALLOWED_GROQ_MODELS).toContain("mixtral-8x7b-32768")
  })

  it("does not contain arbitrary models", () => {
    expect(ALLOWED_GROQ_MODELS).not.toContain("evil-model")
    expect(ALLOWED_GROQ_MODELS).not.toContain("gpt-4")
  })
})
