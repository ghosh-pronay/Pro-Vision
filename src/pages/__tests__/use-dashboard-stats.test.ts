import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDashboardStats } from "../use-dashboard-stats";

vi.mock("convex/react", () => ({
  useQuery: () => undefined,
  useMutation: () => vi.fn(),
}));

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
}));

vi.mock("@/lib/data-store", () => ({
  localDB: {
    tasks: {
      list: () => [],
    },
    habits: {
      list: () => [],
    },
    transactions: {
      list: () => [],
    },
    focusSessions: {
      list: () => [],
    },
    goals: {
      list: () => [],
    },
    wallets: {
      list: () => [],
    },
    moods: {
      list: () => [],
    },
    sleepLogs: {
      list: () => [],
    },
    userProfiles: {
      get: () => ({ displayName: "Test" }),
    },
  },
}));

describe("useDashboardStats", () => {
  it("returns default stats when no data", () => {
    const { result } = renderHook(() => useDashboardStats());

    expect(result.current.taskStats).toBeDefined();
    expect(result.current.habitStats).toBeDefined();
    expect(result.current.transactionStats).toBeDefined();
    expect(result.current.focusStats).toBeDefined();
    expect(result.current.goalStats).toBeDefined();
    expect(result.current.walletBalance).toBeDefined();
    expect(result.current.moodStats).toBeDefined();
    expect(result.current.sleepStats).toBeDefined();
  });

  it("calculates transactionStats correctly", () => {
    const { result } = renderHook(() => useDashboardStats());
    const stats = result.current.transactionStats;

    expect(stats.totalIncome).toBe(0);
    expect(stats.totalExpense).toBe(0);
    expect(stats.balance).toBe(0);
    expect(stats.thisMonthIncome).toBe(0);
    expect(stats.thisMonthExpense).toBe(0);
    expect(stats.expenseScore).toBeDefined();
  });

  it("calculates taskStats correctly", () => {
    const { result } = renderHook(() => useDashboardStats());
    const stats = result.current.taskStats;

    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.overdue).toBe(0);
  });

  it("calculates habitStats correctly", () => {
    const { result } = renderHook(() => useDashboardStats());
    const stats = result.current.habitStats;

    expect(stats.total).toBe(0);
    expect(stats.todayCompleted).toBe(0);
  });

  it("calculates focusStats correctly", () => {
    const { result } = renderHook(() => useDashboardStats());
    const stats = result.current.focusStats;

    expect(stats.sessions).toBe(0);
    expect(stats.totalMinutes).toBe(0);
    expect(stats.totalHours).toBe(0);
    expect(stats.todayMinutes).toBe(0);
  });

  it("calculates goalStats correctly", () => {
    const { result } = renderHook(() => useDashboardStats());
    const stats = result.current.goalStats;

    expect(stats.total).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.active).toBe(0);
  });

  it("returns isLoading flag", () => {
    const { result } = renderHook(() => useDashboardStats());
    expect(typeof result.current.isLoading).toBe("boolean");
  });

  it("returns profile data", () => {
    const { result } = renderHook(() => useDashboardStats());
    expect(result.current.profile).toBeUndefined();
    expect(result.current.walletBalance).toBeDefined();
  });
});
