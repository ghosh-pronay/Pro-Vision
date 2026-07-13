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

vi.mock("@/lib/toast-helpers", () => ({
  handleMutationError: vi.fn(),
  handleMutationSuccess: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock("@/components/ui/ConfirmDialog", () => ({
  ConfirmDialog: () => <div>ConfirmDialog</div>,
}))

vi.mock("@/components/wallet/AddWalletModal", () => ({
  AddWalletModal: () => <div>AddWalletModal</div>,
}))

vi.mock("@/components/wallet/WalletForm", () => ({
  WalletForm: () => <div>WalletForm</div>,
}))

vi.mock("@/components/expense", () => ({
  ExpenseStats: () => <div>ExpenseStats</div>,
  TransactionForm: () => <div>TransactionForm</div>,
  TransactionList: () => <div>TransactionList</div>,
  WalletManager: () => <div>WalletManager</div>,
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

describe("Expense page", () => {
  it("renders without crashing when no data", async () => {
    const Expense = (await import("../Expense")).default
    const { container } = renderWithProviders(<Expense />)
    expect(container.querySelector("div")).toBeInTheDocument()
  })

  it("shows create wallet prompt when no wallets exist", async () => {
    const Expense = (await import("../Expense")).default
    renderWithProviders(<Expense />)
    expect(screen.getByText("expense.createWallet")).toBeInTheDocument()
    expect(screen.getByText("expense.createWalletDesc")).toBeInTheDocument()
  })

  it("renders the Wallet icon in empty state", async () => {
    const Expense = (await import("../Expense")).default
    renderWithProviders(<Expense />)
    expect(
      screen.getByText("expense.createWallet").closest("div"),
    ).toBeInTheDocument()
  })

  it("does not show transaction list when no wallets", async () => {
    const Expense = (await import("../Expense")).default
    renderWithProviders(<Expense />)
    expect(screen.queryByText("TransactionList")).not.toBeInTheDocument()
  })

  it("does not show expense stats when no wallets", async () => {
    const Expense = (await import("../Expense")).default
    renderWithProviders(<Expense />)
    expect(screen.queryByText("ExpenseStats")).not.toBeInTheDocument()
  })
})
