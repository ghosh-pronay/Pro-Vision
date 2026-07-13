import { Component, type ReactNode } from "react"
import { AlertTriangle, Copy, Home, RefreshCw } from "lucide-react"
import { logger } from "@/lib/logger"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string
}

function generateErrorId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `${timestamp}-${random}`
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorId: "" }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorId: generateErrorId() }
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    logger.error("ErrorBoundary", "ErrorBoundary caught", error)
  }

  handleCopyError = async () => {
    const { errorId } = this.state
    const details = [`Error ID: ${errorId}`].join("\n\n")

    try {
      await navigator.clipboard.writeText(details)
    } catch {
      // Clipboard API may fail in non-HTTPS or permission-denied contexts
    }
  }

  handleGoHome = () => {
    window.location.href = "/dashboard"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="glass flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">
            An unexpected error occurred
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Error ID: {this.state.errorId}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                this.setState({ hasError: false, error: null, errorId: "" })
              }
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={this.handleCopyError}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Copy className="h-4 w-4" />
              Copy Error
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Home className="h-4 w-4" />
              Go Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
