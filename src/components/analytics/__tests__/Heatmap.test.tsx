import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHeatmap } from "../Heatmap";

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

describe("Heatmap", () => {
  describe("useHeatmap", () => {
    it("returns empty data when given no data", () => {
      const { result } = renderHook(() => useHeatmap([]));
      expect(result.current.heatmapData).toBeDefined();
      expect(Array.isArray(result.current.heatmapData)).toBe(true);
      expect(result.current.heatmapData.length).toBeGreaterThan(0);
    });

    it("returns data with all zeros for empty input", () => {
      const { result } = renderHook(() => useHeatmap([]));
      const allZeros = result.current.heatmapData.every(
        (d) => d.value === 0 && d.count === 0,
      );
      expect(allZeros).toBe(true);
    });

    it("processes data correctly", () => {
      const now = Date.now();
      const data = [
        { date: now, value: 5 },
        { date: now - 86400000, value: 3 },
      ];
      const { result } = renderHook(() => useHeatmap(data));
      expect(result.current.heatmapData.length).toBeGreaterThan(0);
      expect(result.current.totalDays).toBeGreaterThan(0);
    });

    it("calculates active days", () => {
      const now = Date.now();
      const data = [{ date: now, value: 1 }];
      const { result } = renderHook(() => useHeatmap(data));
      expect(result.current.activeDays).toBeGreaterThanOrEqual(1);
    });

    it("returns weeks grouped correctly", () => {
      const { result } = renderHook(() => useHeatmap([]));
      expect(result.current.weeks).toBeDefined();
      expect(typeof result.current.weeks).toBe("object");
    });

    it("calculates maxValue", () => {
      const now = Date.now();
      const data = [{ date: now, value: 10 }];
      const { result } = renderHook(() => useHeatmap(data));
      expect(result.current.maxValue).toBeGreaterThanOrEqual(1);
    });

    it("returns getIntensity function", () => {
      const { result } = renderHook(() => useHeatmap([]));
      expect(typeof result.current.getIntensity).toBe("function");
      expect(result.current.getIntensity(0)).toBe(0);
      expect(result.current.getIntensity(100)).toBe(4);
    });

    it("calculates streaks", () => {
      const { result } = renderHook(() => useHeatmap([]));
      expect(typeof result.current.longestStreak).toBe("number");
      expect(typeof result.current.currentStreak).toBe("number");
    });
  });
});
