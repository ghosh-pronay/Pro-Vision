import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

vi.mock("convex/react", () => ({
  useQuery: () => undefined,
  useMutation: () => vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: new Proxy(
    {},
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      get: (target, prop) =>
        new Proxy(
          {},
          {
            get: () => "mock-endpoint",
          },
        ),
    },
  ),
}));

const mockUseAuth = {
  isLoading: false,
  isAuthenticated: false,
  isEmailVerified: false,
  user: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
  sendVerificationEmail: vi.fn(),
  reloadUser: vi.fn(),
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth,
}));

vi.mock("@/store", () => ({
  useAppStore: () => ({
    theme: "dark",
    language: "en",
    setTheme: vi.fn(),
    setLanguage: vi.fn(),
    dashboardWidgets: [],
  }),
}));

const translationsProxy: Record<string, unknown> = new Proxy(
  {},
  {
    get: (_target, prop: string) => {
      if (typeof prop === "string") {
        return new Proxy(
          {},
          {
            get: (_t, child: string) => `${String(prop)}.${String(child)}`,
          },
        );
      }
      return "";
    },
  },
);

vi.mock("@/hooks/use-i18n", () => ({
  useI18n: () => ({
    t: translationsProxy,
    lang: "en",
  }),
}));

vi.mock("@/i18n/LanguageContext", () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
  useLang: () => ({ lang: "en", setLang: vi.fn() }),
}));

vi.mock("@/i18n/translations", () => ({
  t: (key: string) => key,
}));

vi.mock("@/contexts/AccessibilityContext", () => ({
  AccessibilityProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock("sonner", () => ({
  Toaster: () => null,
}));

vi.mock("@/components/NotificationsPanel", () => ({
  default: () => <div>NotificationsPanel</div>,
}));

vi.mock("@/components/ui/DataBackup", () => ({
  DataBackup: () => <div>DataBackup</div>,
}));

vi.mock("@/components/DashboardWidgetCustomizer", () => ({
  default: () => <div>DashboardWidgetCustomizer</div>,
}));

vi.mock("@/components/StreakFreeze", () => ({
  default: () => <div>StreakFreeze</div>,
}));

vi.mock("@/components/SmartInsights", () => ({
  default: () => <div>SmartInsights</div>,
}));

vi.mock("@/components/SectionSuggestion", () => ({
  default: () => <div>SectionSuggestion</div>,
}));

vi.mock("@/components/DashboardDateTime", () => ({
  default: () => <div>DashboardDateTime</div>,
}));

vi.mock("@/components/DailyInspiration", () => ({
  default: () => <div>DailyInspiration</div>,
}));

vi.mock("@/lib/bangladesh-holidays", () => ({
  getUpcomingHolidays: () => [],
}));

vi.mock("@/lib/bangla-greetings", () => ({
  getTimeBasedGreeting: () => "Good morning",
  getNameWithTitle: (name: string) => name,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
  getMostRecent: () => null,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) => {
      const domProps: Record<string, unknown> = {};
      for (const key of Object.keys(props)) {
        if (
          key.startsWith("on") ||
          key === "className" ||
          key === "style" ||
          key === "id" ||
          key === "data-testid"
        ) {
          domProps[key] = props[key];
        }
      }
      return <div {...domProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";

describe("Page smoke tests", () => {
  it("Auth page renders sign in form", async () => {
    const Auth = (await import("../Auth")).default;
    renderWithProviders(<Auth />);

    expect(screen.getAllByText(/sign in/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("Dashboard page renders without crashing", async () => {
    const Dashboard = (await import("../Dashboard")).default;
    renderWithProviders(<Dashboard />);

    expect(screen.getByText("dash.just2Minutes")).toBeInTheDocument();
  });

  it("Settings page renders without crashing", async () => {
    const Settings = (await import("../Settings")).default;
    renderWithProviders(<Settings />);

    expect(screen.getByText("settings.title")).toBeInTheDocument();
  });

  it("Todo page renders without crashing", async () => {
    const Todo = (await import("../Todo")).default;
    renderWithProviders(<Todo />);
    expect(screen.getByText("nav.todo")).toBeInTheDocument();
  });

  it("Habits page renders without crashing", async () => {
    const Habits = (await import("../Habits")).default;
    renderWithProviders(<Habits />);
    expect(screen.getByText("nav.habits")).toBeInTheDocument();
  });

  it("Expense page renders without crashing", async () => {
    const Expense = (await import("../Expense")).default;
    renderWithProviders(<Expense />);
    expect(screen.getByText("nav.expense")).toBeInTheDocument();
  });

  it("Wellbeing page renders without crashing", async () => {
    const Wellbeing = (await import("../Wellbeing")).default;
    renderWithProviders(<Wellbeing />);
    expect(screen.getByText("nav.wellbeing")).toBeInTheDocument();
  });

  it("Focus page renders without crashing", async () => {
    const Focus = (await import("../Focus")).default;
    renderWithProviders(<Focus />);
    expect(screen.getByText("nav.focus")).toBeInTheDocument();
  });

  it("Goals page renders without crashing", async () => {
    const Goals = (await import("../Goals")).default;
    renderWithProviders(<Goals />);
    expect(screen.getByText("nav.goals")).toBeInTheDocument();
  });

  it("Journal page renders without crashing", async () => {
    const Journal = (await import("../Journal")).default;
    renderWithProviders(<Journal />);
    expect(screen.getByText("nav.journal")).toBeInTheDocument();
  });

  it("Analytics page renders without crashing", async () => {
    const Analytics = (await import("../Analytics")).default;
    renderWithProviders(<Analytics />);
    expect(screen.getByText("nav.analytics")).toBeInTheDocument();
  });

  it("Reports page renders without crashing", async () => {
    const Reports = (await import("../Reports")).default;
    renderWithProviders(<Reports />);
    expect(screen.getByText("reports.title")).toBeInTheDocument();
  });

  it("Reading page renders without crashing", async () => {
    const Reading = (await import("../Reading")).default;
    renderWithProviders(<Reading />);
    expect(screen.getByText("nav.reading")).toBeInTheDocument();
  });

  it("Gamification page renders without crashing", async () => {
    const Gamification = (await import("../Gamification")).default;
    renderWithProviders(<Gamification />);
    expect(screen.getByText("nav.gamification")).toBeInTheDocument();
  });
});
