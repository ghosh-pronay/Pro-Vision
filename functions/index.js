const { initializeApp } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")
const { onDocumentUpdated } = require("firebase-functions/v2/firestore")
const { onRequest } = require("firebase-functions/v2/https")
const functions = require("firebase-functions")

initializeApp()

const ALLOWED_ORIGINS = [
  "https://pro-visions.web.app",
  ...(process.env.FUNCTIONS_EMULATOR === "true"
    ? ["http://localhost:5173"]
    : []),
]

const ALLOWED_GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "gemma2-9b-it",
  "mixtral-8x7b-32768",
]

const ALLOWED_GEMINI_FIELDS = [
  "temperature",
  "topK",
  "topP",
  "maxOutputTokens",
  "stopSequences",
  "candidateCount",
]

function escapeHtml(str) {
  if (!str) return ""
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function sanitizeGenerationConfig(config) {
  if (!config || typeof config !== "object") return undefined
  const sanitized = {}
  for (const field of ALLOWED_GEMINI_FIELDS) {
    if (field in config) {
      sanitized[field] = config[field]
    }
  }
  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

const rateLimits = new Map()
const RATE_LIMIT_WINDOW = 60000
const RATE_LIMIT_MAX = 10

function checkRateLimit(uid) {
  const now = Date.now()
  const record = rateLimits.get(uid) || {
    count: 0,
    resetAt: now + RATE_LIMIT_WINDOW,
  }
  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + RATE_LIMIT_WINDOW
  }
  record.count++
  rateLimits.set(uid, record)
  return record.count <= RATE_LIMIT_MAX
}

async function verifyAuth(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  const idToken = authHeader.split("Bearer ")[1]
  try {
    return await getAuth().verifyIdToken(idToken)
  } catch {
    return null
  }
}

exports.geminiProxy = onRequest(
  {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
    region: "us-central1",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" })
      return
    }

    const decoded = await verifyAuth(req)
    if (!decoded) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    if (!checkRateLimit(decoded.uid)) {
      res.status(429).json({ error: "Rate limit exceeded" })
      return
    }

    const apiKey =
      functions.config().gemini?.api_key || process.env.GEMINI_API_KEY
    if (!apiKey) {
      res.status(500).json({ error: "Gemini API key not configured on server" })
      return
    }

    try {
      const { contents, systemInstruction, generationConfig } = req.body

      if (
        !Array.isArray(contents) ||
        contents.length === 0 ||
        contents.length > 50
      ) {
        res
          .status(400)
          .json({ error: "Invalid contents: expected 1-50 messages" })
        return
      }
      for (const part of contents) {
        if (!part || typeof part !== "object") {
          res.status(400).json({ error: "Invalid content part" })
          return
        }
        if (Array.isArray(part.parts) && part.parts.length > 20) {
          res.status(400).json({ error: "Too many parts per message (max 20)" })
          return
        }
      }

      const sanitizedConfig = sanitizeGenerationConfig(generationConfig)
      const payload = {
        contents,
        generationConfig: sanitizedConfig || {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }
      if (systemInstruction) {
        payload.systemInstruction = systemInstruction
      }

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(payload),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        console.error("[geminiProxy] Upstream error:", response.status)
        const clientStatus = response.status >= 500 ? 502 : response.status
        res
          .status(clientStatus)
          .json({ error: "Upstream API error", status: response.status })
        return
      }

      res.json(data)
    } catch (error) {
      console.error("[geminiProxy] Error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  },
)

exports.groqProxy = onRequest(
  {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
    },
    region: "us-central1",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" })
      return
    }

    const decoded = await verifyAuth(req)
    if (!decoded) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }

    if (!checkRateLimit(decoded.uid)) {
      res.status(429).json({ error: "Rate limit exceeded" })
      return
    }

    const apiKey = functions.config().groq?.api_key || process.env.GROQ_API_KEY
    if (!apiKey) {
      res.status(500).json({ error: "Groq API key not configured on server" })
      return
    }

    try {
      const { messages, model, temperature, max_tokens } = req.body

      if (
        !Array.isArray(messages) ||
        messages.length === 0 ||
        messages.length > 50
      ) {
        res
          .status(400)
          .json({ error: "Invalid messages: expected 1-50 messages" })
        return
      }

      const safeModel =
        model && ALLOWED_GROQ_MODELS.includes(model)
          ? model
          : "llama-3.3-70b-versatile"
      const safeTemperature =
        typeof temperature === "number"
          ? Math.max(0, Math.min(2, temperature))
          : 0.7
      const safeMaxTokens =
        typeof max_tokens === "number"
          ? Math.max(1, Math.min(4096, Math.floor(max_tokens)))
          : 1024

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: safeModel,
            messages,
            temperature: safeTemperature,
            max_tokens: safeMaxTokens,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        console.error("[groqProxy] Upstream error:", response.status)
        const clientStatus = response.status >= 500 ? 502 : response.status
        res
          .status(clientStatus)
          .json({ error: "Upstream API error", status: response.status })
        return
      }

      res.json(data)
    } catch (error) {
      console.error("[groqProxy] Error:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  },
)

exports.sendWelcomeEmail = onDocumentUpdated(
  "users/{userId}",
  async (event) => {
    const before = event.data?.before?.data()
    const after = event.data?.after?.data()

    if (!after?.email) return
    if (before?.emailVerified && after?.emailVerified) return
    if (!after?.emailVerified) return

    const { getFirestore } = require("firebase-admin/firestore")
    const db = getFirestore()

    const name = escapeHtml(after.email.split("@")[0])

    await db.collection("mail").add({
      to: after.email,
      message: {
        subject: "Welcome to Pro-Vision!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1A6FB5; margin-bottom: 8px;">Welcome to Pro-Vision!</h1>
              <p style="color: #666; font-size: 16px;">Plan · Focus · Achieve</p>
            </div>

            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #1e293b;">Hi ${name},</h2>
              <p style="color: #475569; line-height: 1.6;">
                Your email has been verified! Welcome aboard. Here's what you can do:
              </p>
              <ul style="color: #475569; line-height: 1.8; padding-left: 20px;">
                <li><strong>Track Tasks &amp; Habits</strong> — Stay organized with daily to-dos and habit tracking</li>
                <li><strong>Manage Finances</strong> — Log expenses, set savings goals, and monitor budgets</li>
                <li><strong>Monitor Wellbeing</strong> — Track mood, sleep, nutrition, and exercise</li>
                <li><strong>Set Goals</strong> — Define and track personal and professional goals</li>
                <li><strong>Get Insights</strong> — AI-powered recommendations based on your data</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://pro-visions.web.app/dashboard"
                 style="background: linear-gradient(135deg, #1A6FB5, #155a94); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                Go to Dashboard
              </a>
            </div>

            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 40px;">
              Questions? Just reply to this email — we're here to help!
            </p>
          </div>
        `,
      },
    })

    const maskedEmail = after.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    console.log(`[welcomeEmail] Queued welcome email to ${maskedEmail}`)
  },
)
