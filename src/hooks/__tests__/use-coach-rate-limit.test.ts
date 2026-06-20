import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCoachRateLimit } from "../use-coach-rate-limit";

describe("useCoachRateLimit", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it("should initialize with zero usage", () => {
    const { result } = renderHook(() => useCoachRateLimit(false));

    expect(result.current.usage).toBe(0);
    expect(result.current.remaining).toBe(50);
    expect(result.current.isLimitReached).toBe(false);
  });

  it("should have 50 limit for free users", () => {
    const { result } = renderHook(() => useCoachRateLimit(false));

    expect(result.current.dailyLimit).toBe(50);
  });

  it("should have 200 limit for premium users", () => {
    const { result } = renderHook(() => useCoachRateLimit(true));

    expect(result.current.dailyLimit).toBe(200);
  });

  it("should increment usage", () => {
    const { result } = renderHook(() => useCoachRateLimit(false));

    act(() => {
      const success = result.current.incrementUsage();
      expect(success).toBe(true);
    });

    expect(result.current.usage).toBe(1);
    expect(result.current.remaining).toBe(49);
  });

  it("should not exceed daily limit", () => {
    const { result } = renderHook(() => useCoachRateLimit(false));

    for (let i = 0; i < 50; i++) {
      act(() => {
        result.current.incrementUsage();
      });
    }

    expect(result.current.isLimitReached).toBe(true);
    expect(result.current.remaining).toBe(0);

    const success = act(() => result.current.incrementUsage());
    expect(success).toBe(false);
  });

  it("should reset usage", () => {
    const { result } = renderHook(() => useCoachRateLimit(false));

    act(() => {
      result.current.incrementUsage();
      result.current.incrementUsage();
    });

    expect(result.current.usage).toBe(2);

    act(() => {
      result.current.resetUsage();
    });

    expect(result.current.usage).toBe(0);
    expect(result.current.remaining).toBe(50);
  });

  it("should persist usage to localStorage", () => {
    const { result } = renderHook(() => useCoachRateLimit(false));

    act(() => {
      result.current.incrementUsage();
      result.current.incrementUsage();
    });

    const stored = JSON.parse(localStorage.getItem("pv-coach-usage") || "{}");
    expect(stored.count).toBe(2);
  });

  it("should load persisted usage on mount", () => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      "pv-coach-usage",
      JSON.stringify({ date: today, count: 10 }),
    );

    const { result } = renderHook(() => useCoachRateLimit(false));

    expect(result.current.usage).toBe(10);
    expect(result.current.remaining).toBe(40);
  });

  it("should reset if date changes", () => {
    localStorage.setItem(
      "pv-coach-usage",
      JSON.stringify({ date: "2020-01-01", count: 10 }),
    );

    const { result } = renderHook(() => useCoachRateLimit(false));

    expect(result.current.usage).toBe(0);
    expect(result.current.remaining).toBe(50);
  });
});
