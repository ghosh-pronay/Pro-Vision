import { describe, it, expect, vi, beforeEach } from "vitest"

const mockCallable = vi.fn()
vi.mock("firebase/functions", () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(() => mockCallable),
}))
vi.mock("../firebase", () => ({ default: {} }))

describe("AI Utility", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCallable.mockReset()
  })

  describe("isGeminiConfigured", () => {
    it("returns true (Cloud Functions handle API keys)", async () => {
      vi.resetModules()
      const { isGeminiConfigured } = await import("../ai")
      expect(isGeminiConfigured()).toBe(true)
    })
  })

  describe("generateGeminiResponse", () => {
    it("calls the proxy function with correct payload", async () => {
      mockCallable.mockResolvedValue({
        data: {
          candidates: [{ content: { parts: [{ text: "Hello back" }] } }],
        },
      })
      vi.stubEnv("VITE_GEMINI_API_KEY", "")
      vi.resetModules()

      const { generateGeminiResponse } = await import("../ai")
      const messages = [
        { role: "user" as const, parts: "Hi there" },
        { role: "model" as const, parts: "Hello!" },
      ]
      await generateGeminiResponse(messages, "Be helpful")

      expect(mockCallable).toHaveBeenCalledOnce()
      const payload = mockCallable.mock.calls[0][0]
      expect(payload.contents).toHaveLength(2)
      expect(payload.contents[0]).toEqual({
        role: "user",
        parts: [{ text: "Hi there" }],
      })
      expect(payload.contents[1]).toEqual({
        role: "model",
        parts: [{ text: "Hello!" }],
      })
      expect(payload.systemInstruction).toEqual({
        parts: [{ text: "Be helpful" }],
      })
      expect(payload.generationConfig).toEqual({
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      })
    })

    it("returns error message when proxy fails", async () => {
      mockCallable.mockRejectedValue(new Error("Network error"))
      vi.stubEnv("VITE_GEMINI_API_KEY", "")
      vi.resetModules()

      const { generateGeminiResponse } = await import("../ai")
      const result = await generateGeminiResponse([
        { role: "user" as const, parts: "test" },
      ])

      expect(result).toBe(
        "Unable to connect to AI service. Please check your internet connection and try again.",
      )
    })

    it("falls back to Groq when Gemini returns quota error", async () => {
      let callCount = 0
      mockCallable.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.reject(new Error("429 quota exceeded"))
        }
        return Promise.resolve({
          data: {
            choices: [{ message: { content: "Groq fallback response" } }],
          },
        })
      })
      vi.stubEnv("VITE_GEMINI_API_KEY", "")
      vi.resetModules()

      const { generateGeminiResponse } = await import("../ai")
      const result = await generateGeminiResponse([
        { role: "user" as const, parts: "test" },
      ])

      expect(result).toBe("Groq fallback response")
      expect(mockCallable).toHaveBeenCalledTimes(2)
    })

    it("returns unavailable message when both Gemini and Groq fail", async () => {
      mockCallable.mockRejectedValue(new Error("429 quota exceeded"))
      vi.stubEnv("VITE_GEMINI_API_KEY", "")
      vi.resetModules()

      const { generateGeminiResponse } = await import("../ai")
      const result = await generateGeminiResponse([
        { role: "user" as const, parts: "test" },
      ])

      expect(result).toBe(
        "AI service is temporarily unavailable. Please try again later.",
      )
    })

    it("returns empty response message when no candidates", async () => {
      mockCallable.mockResolvedValue({ data: {} })
      vi.stubEnv("VITE_GEMINI_API_KEY", "")
      vi.resetModules()

      const { generateGeminiResponse } = await import("../ai")
      const result = await generateGeminiResponse([
        { role: "user" as const, parts: "test" },
      ])

      expect(result).toBe("I received an empty response. Please try again.")
    })
  })

  describe("analyzeImageWithGemini", () => {
    it("sends correct payload with inlineData", async () => {
      mockCallable.mockResolvedValue({
        data: {
          candidates: [{ content: { parts: [{ text: "A cat sitting" }] } }],
        },
      })
      vi.stubEnv("VITE_GEMINI_API_KEY", "")
      vi.resetModules()

      const { analyzeImageWithGemini } = await import("../ai")
      const result = await analyzeImageWithGemini("aGVsbG8=", "What is this?")

      expect(mockCallable).toHaveBeenCalledOnce()
      const payload = mockCallable.mock.calls[0][0]
      expect(payload.contents[0].parts).toEqual([
        { text: "What is this?" },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: "aGVsbG8=",
          },
        },
      ])
      expect(payload.generationConfig).toEqual({
        temperature: 0.4,
        maxOutputTokens: 1024,
      })
      expect(result).toBe("A cat sitting")
    })

    it("handles base64 with data URI prefix", async () => {
      mockCallable.mockResolvedValue({
        data: {
          candidates: [{ content: { parts: [{ text: "Analysis done" }] } }],
        },
      })
      vi.stubEnv("VITE_GEMINI_API_KEY", "")
      vi.resetModules()

      const { analyzeImageWithGemini } = await import("../ai")
      await analyzeImageWithGemini(
        "data:image/png;base64,iVBORw0KGgo",
        "Describe this",
      )

      const payload = mockCallable.mock.calls[0][0]
      expect(payload.contents[0].parts[1].inlineData.data).toBe("iVBORw0KGgo")
    })

    it("handles base64 without data URI prefix", async () => {
      mockCallable.mockResolvedValue({
        data: {
          candidates: [{ content: { parts: [{ text: "Done" }] } }],
        },
      })
      vi.stubEnv("VITE_GEMINI_API_KEY", "")
      vi.resetModules()

      const { analyzeImageWithGemini } = await import("../ai")
      await analyzeImageWithGemini("iVBORw0KGgo", "Describe this")

      const payload = mockCallable.mock.calls[0][0]
      expect(payload.contents[0].parts[1].inlineData.data).toBe("iVBORw0KGgo")
    })

    it("returns fallback when no candidates", async () => {
      mockCallable.mockResolvedValue({ data: {} })
      vi.stubEnv("VITE_GEMINI_API_KEY", "")
      vi.resetModules()

      const { analyzeImageWithGemini } = await import("../ai")
      const result = await analyzeImageWithGemini("aGVsbG8=", "Describe")

      expect(result).toBe("No analysis available.")
    })

    it("returns error message when proxy fails", async () => {
      mockCallable.mockRejectedValue(new Error("Service unavailable"))
      vi.stubEnv("VITE_GEMINI_API_KEY", "")
      vi.resetModules()

      const { analyzeImageWithGemini } = await import("../ai")
      const result = await analyzeImageWithGemini("aGVsbG8=", "Describe")

      expect(result).toBe("Unable to analyze image. Please try again.")
    })
  })
})
