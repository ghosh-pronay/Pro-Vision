import { describe, it, expect, vi, beforeEach } from "vitest"
import { screen } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import { renderWithProviders } from "@/test-utils"

const mockTasks = [
  {
    _id: "task1",
    title: "Buy groceries",
    completed: false,
    priority: "high",
    description: "Milk, eggs, bread",
    dueDate: Date.now() + 86400000,
    tags: ["errands"],
    createdAt: Date.now(),
  },
  {
    _id: "task2",
    title: "Read a book",
    completed: true,
    priority: "low",
    description: undefined,
    dueDate: undefined,
    tags: ["learning"],
    createdAt: Date.now(),
  },
]

let tasks = [...mockTasks]

vi.mock("convex/react", () => ({
  useQuery: () => tasks,
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

vi.mock("@/lib/toast-helpers", () => ({
  handleMutationError: vi.fn(),
  handleMutationSuccess: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock("@/components/tasks/KanbanBoard", () => ({
  default: () => <div>KanbanBoard</div>,
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

describe("Todo page", () => {
  beforeEach(() => {
    tasks = [...mockTasks]
  })

  it("renders the page title", async () => {
    const Todo = (await import("../Todo")).default
    renderWithProviders(<Todo />)
    expect(screen.getByText("nav.todo")).toBeInTheDocument()
  })

  it("renders task items in the task list", async () => {
    const Todo = (await import("../Todo")).default
    renderWithProviders(<Todo />)
    const groceryElements = screen.getAllByText("Buy groceries")
    expect(groceryElements.length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText("Read a book")).toBeInTheDocument()
  })

  it("shows task descriptions", async () => {
    const Todo = (await import("../Todo")).default
    renderWithProviders(<Todo />)
    expect(screen.getByText("Milk, eggs, bread")).toBeInTheDocument()
  })

  it("renders the add task button", async () => {
    const Todo = (await import("../Todo")).default
    renderWithProviders(<Todo />)
    expect(screen.getByText("todo.addTask")).toBeInTheDocument()
  })

  it("shows suggested tasks when few tasks exist", async () => {
    const Todo = (await import("../Todo")).default
    renderWithProviders(<Todo />)
    expect(screen.getByText("Suggested Tasks")).toBeInTheDocument()
  })

  it("renders filter tabs", async () => {
    const Todo = (await import("../Todo")).default
    renderWithProviders(<Todo />)
    expect(screen.getByText("todo.filter.all")).toBeInTheDocument()
  })

  it("shows task count", async () => {
    const Todo = (await import("../Todo")).default
    renderWithProviders(<Todo />)
    expect(screen.getByText(/1\/2/)).toBeInTheDocument()
  })
})

describe("Todo page empty state", () => {
  beforeEach(() => {
    tasks = []
  })

  it("shows empty state when no tasks exist", async () => {
    const Todo = (await import("../Todo")).default
    renderWithProviders(<Todo />)
    expect(screen.getByText("todo.empty")).toBeInTheDocument()
  })
})
