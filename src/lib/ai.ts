import { getFunctions, httpsCallable } from "firebase/functions"
import app from "./firebase"
import { logger } from "@/lib/logger"

const functions = getFunctions(app)

const GROQ_MODEL = "llama-3.3-70b-versatile"

export interface GeminiMessage {
  role: "user" | "model"
  parts: string
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

function isQuotaError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return (
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("rate limit") ||
      msg.includes("resource exhausted")
    )
  }
  return false
}

async function callGeminiProxy(payload: {
  contents: Array<{
    role: string
    parts: Array<{
      text?: string
      inlineData?: { mimeType: string; data: string }
    }>
  }>
  systemInstruction?: { parts: Array<{ text: string }> }
  generationConfig?: Record<string, unknown>
}): Promise<GeminiResponse> {
  const proxyFn = httpsCallable(functions, "geminiProxy")
  const result = await proxyFn(payload)
  return result.data as GeminiResponse
}

async function callGroqProxy(
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; max_tokens?: number },
): Promise<string> {
  const proxyFn = httpsCallable(functions, "groqProxy")
  const result = await proxyFn({
    messages,
    model: GROQ_MODEL,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.max_tokens ?? 1024,
  })
  const data = result.data as {
    choices?: Array<{ message?: { content?: string } }>
  }
  return data.choices?.[0]?.message?.content ?? ""
}

async function callGroqChat(
  messages: GeminiMessage[],
  systemPrompt?: string,
): Promise<string> {
  const groqMessages: Array<{ role: string; content: string }> = []
  if (systemPrompt) {
    groqMessages.push({ role: "system", content: systemPrompt })
  }
  groqMessages.push(
    ...messages.map((m) => ({
      role: m.role === "model" ? "assistant" : m.role,
      content: m.parts,
    })),
  )

  return callGroqProxy(groqMessages)
}

export async function generateGeminiResponse(
  messages: GeminiMessage[],
  systemPrompt?: string,
): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.parts }],
  }))

  const systemInstruction = systemPrompt
    ? { systemInstruction: { parts: [{ text: systemPrompt }] } }
    : {}

  const generationConfig = {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }

  try {
    const data = await callGeminiProxy({
      contents,
      ...systemInstruction,
      generationConfig,
    })

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return "I received an empty response. Please try again."
    }
    return text
  } catch (error) {
    logger.error("AI", "Gemini API call failed", error)

    if (isQuotaError(error)) {
      logger.warn("AI", "Gemini quota exhausted, falling back to Groq")
      try {
        return await callGroqChat(messages, systemPrompt)
      } catch (groqError) {
        logger.error("AI", "Groq fallback also failed", groqError)
        return "AI service is temporarily unavailable. Please try again later."
      }
    }

    return "Unable to connect to AI service. Please check your internet connection and try again."
  }
}

export async function analyzeImageWithGemini(
  imageBase64: string,
  prompt: string,
): Promise<string> {
  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64

  const payload = {
    contents: [
      {
        role: "user" as const,
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
    },
  }

  try {
    const data = await callGeminiProxy(payload)

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No analysis available."
    )
  } catch (error) {
    logger.error("AI", "Gemini image analysis failed", error)

    if (isQuotaError(error)) {
      logger.warn("AI", "Gemini quota exhausted, falling back to Groq")
      try {
        return await callGroqProxy(
          [
            {
              role: "user",
              content: `${prompt}\n\n[Image analysis requested - Groq fallback does not support images]`,
            },
          ],
          { temperature: 0.4 },
        )
      } catch (groqError) {
        logger.error("AI", "Groq fallback for image analysis failed", groqError)
        return "Image analysis is temporarily unavailable. Please try again later."
      }
    }

    return "Unable to analyze image. Please try again."
  }
}

export function isGeminiConfigured(): boolean {
  return true
}

export function isGroqConfigured(): boolean {
  return true
}

export function isAIConfigured(): boolean {
  return true
}
