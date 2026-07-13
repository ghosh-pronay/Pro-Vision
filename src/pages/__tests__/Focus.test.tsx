import { describe, it, expect, vi } from "vitest"
import { screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import { renderWithProviders } from "@/test-utils"

vi.mock("convex/react", () => ({
  useQuery: () => undefined,
  useMutation: () => vi.fn(),
}))

vi.mock("@/convex/_generated/api", () => ({
  api: new Proxy(
    {},
    {
      get: () =>
        new Proxy(
          {},
          {
            get: () => "mock-endpoint",
          },
        ),
    },
  ),
}))

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: true,
    isEmailVerified: true,
    user: { name: "Test User", email: "test@test.com" },
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInAnonymously: vi.fn(),
    signOut: vi.fn(),
    sendVerificationEmail: vi.fn(),
    reloadUser: vi.fn(),
  }),
}))

vi.mock("@/store", () => ({
  useAppStore: () => ({
    theme: "dark",
    language: "en",
    setTheme: vi.fn(),
    setLanguage: vi.fn(),
    dashboardWidgets: [],
  }),
}))

const translationsProxy = new Proxy({} as Record<string, unknown>, {
  get: (_target: unknown, prop: string) => {
    if (typeof prop === "string") {
      return new Proxy(
        {},
        {
          get: (_t: unknown, child: string) =>
            `${String(prop)}.${String(child)}`,
        },
      )
    }
    return ""
  },
})

vi.mock("@/hooks/use-i18n", () => ({
  useI18n: () => ({
    t: translationsProxy,
    lang: "en",
  }),
}))

vi.mock("@/i18n/LanguageContext", () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
  useLang: () => ({ lang: "en", setLang: vi.fn() }),
}))

vi.mock("@/i18n/translations", () => ({
  t: (key: string) => key,
}))

vi.mock("@/contexts/AccessibilityContext", () => ({
  AccessibilityProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}))

vi.mock("sonner", () => ({
  Toaster: () => null,
}))

vi.mock("@/components/AmbientSounds", () => ({
  default: () => <div>AmbientSounds</div>,
}))

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: () => {
        return ({
          children,
          ...props
        }: React.PropsWithChildren<Record<string, unknown>>) => {
          const domProps: Record<string, unknown> = {}
          for (const key of Object.keys(props)) {
            if (
              key.startsWith("on") ||
              key === "className" ||
              key === "style" ||
              key === "id" ||
              key === "data-testid"
            ) {
              domProps[key] = props[key]
            }
          }
          return <div {...domProps}>{children}</div>
        }
      },
    },
  ),
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}))

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>()
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    useNavigate: () => vi.fn(),
  }
})

describe("Focus page", () => {
  it("renders the page title", async () => {
    const Focus = (await import("../Focus")).default
    renderWithProviders(<Focus />)
    expect(screen.getByText("nav.focus")).toBeInTheDocument()
  })

  it("renders the subtitle", async () => {
    const Focus = (await import("../Focus")).default
    renderWithProviders(<Focus />)
    expect(screen.getByText("focus.subtitle")).toBeInTheDocument()
  })

  it("renders mode selector buttons", async () => {
    const Focus = (await import("../Focus")).default
    renderWithProviders(<Focus />)
    expect(screen.getByText("focus.modes.pomodoro")).toBeInTheDocument()
    expect(screen.getByText("focus.modes.short")).toBeInTheDocument()
    expect(screen.getByText("focus.modes.long")).toBeInTheDocument()
    expect(screen.getByText("focus.modes.deep")).toBeInTheDocument()
  })

  it("shows timer display with initial pomodoro time", async () => {
    const Focus = (await import("../Focus")).default
    renderWithProviders(<Focus />)
    expect(screen.getByText("25:00")).toBeInTheDocument()
  })

  it("shows working state by default", async () => {
    const Focus = (await import("../Focus")).default
    renderWithProviders(<Focus />)
    expect(screen.getByText("focus.working")).toBeInTheDocument()
  })

  it("renders timer control buttons", async () => {
    const Focus = (await import("../Focus")).default
    renderWithProviders(<Focus />)
    const buttons = screen.getAllByRole("button")
    expect(buttons.length).toBeGreaterThanOrEqual(7)
  })

  it("renders stats cards with zero defaults", async () => {
    const Focus = (await import("../Focus")).default
    renderWithProviders(<Focus />)
    expect(screen.getByText("focus.sessions")).toBeInTheDocument()
    expect(screen.getByText("focus.totalMinutes")).toBeInTheDocument()
    expect(screen.getByText("focus.totalHours")).toBeInTheDocument()
  })

  it("shows zero values when no stats data", async () => {
    const Focus = (await import("../Focus")).default
    renderWithProviders(<Focus />)
    expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText("0h")).toBeInTheDocument()
  })

  it("hides recent sessions when no data", async () => {
    const Focus = (await import("../Focus")).default
    renderWithProviders(<Focus />)
    expect(screen.queryByText("Recent Sessions")).not.toBeInTheDocument()
  })

  it("renders ambient sounds component", async () => {
    const Focus = (await import("../Focus")).default
    renderWithProviders(<Focus />)
    expect(screen.getByText("AmbientSounds")).toBeInTheDocument()
  })

  it("renders without crashing", async () => {
    const Focus = (await import("../Focus")).default
    const { container } = renderWithProviders(<Focus />)
    expect(container.querySelector("div")).toBeInTheDocument()
  })
})
