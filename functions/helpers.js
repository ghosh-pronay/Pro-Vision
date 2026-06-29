const ALLOWED_ORIGINS = ["https://pro-visions.web.app", "http://localhost:5173"]

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

module.exports = {
  ALLOWED_ORIGINS,
  ALLOWED_GROQ_MODELS,
  ALLOWED_GEMINI_FIELDS,
  escapeHtml,
  sanitizeGenerationConfig,
  checkRateLimit,
  rateLimits,
  RATE_LIMIT_WINDOW,
  RATE_LIMIT_MAX,
}
