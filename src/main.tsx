import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router"
import { LanguageProvider } from "@/i18n/LanguageContext"
import { AccessibilityProvider } from "@/contexts/AccessibilityContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { initSentry, logger } from "@/lib/logger"
import App from "./App"
import "./index.css"

initSentry()

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, _info: React.ErrorInfo) {
    logger.error("RootErrorBoundary", "RootErrorBoundary caught", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#121820",
            color: "#e8ecf1",
            fontFamily: "system-ui, sans-serif",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#8b95a5", marginBottom: "1.5rem" }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#1a6fb5",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <AccessibilityProvider>
              <App />
            </AccessibilityProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  </RootErrorBoundary>,
)
