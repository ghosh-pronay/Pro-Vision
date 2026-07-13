import * as Sentry from "@sentry/react"

const isDev = import.meta.env.DEV
const isBrowser = typeof window !== "undefined"

let initialized = false

export function initSentry() {
  if (initialized || !isBrowser) return
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) {
    if (!isDev) {
      // eslint-disable-next-line no-console
      console.warn(
        "[logger] VITE_SENTRY_DSN not set — errors will only be logged to console",
      )
    }
    initialized = true
    return
  }
  Sentry.init({
    dsn,
    environment: isDev ? "development" : "production",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
    integrations: [Sentry.browserTracingIntegration()],
  })
  initialized = true
}

function captureError(
  level: "error" | "warning",
  tag: string,
  message: string,
  error?: unknown,
) {
  if (isDev) {
    const fn = level === "error" ? console.error : console.warn
    fn(`[${tag}]`, message, error ?? "")
    return
  }

  Sentry.withScope((scope) => {
    scope.setTag("source", tag)
    scope.setLevel(level)
    if (error instanceof Error) {
      scope.setExtras({ originalMessage: message })
      Sentry.captureException(error)
    } else {
      Sentry.captureMessage(`${message}`, level)
    }
  })
}

export const logger = {
  error(tag: string, message: string, error?: unknown) {
    captureError("error", tag, message, error)
  },
  warn(tag: string, message: string, error?: unknown) {
    captureError("warning", tag, message, error)
  },
}
