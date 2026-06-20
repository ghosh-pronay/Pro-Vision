import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("should debounce value with default delay", () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: "initial" },
    });

    expect(result.current).toBe("initial");

    rerender({ value: "updated" });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("updated");
  });

  it("should debounce with custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } },
    );

    rerender({ value: "updated", delay: 500 });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe("initial");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("updated");
  });

  it("should reset timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "first" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "second" });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "third" });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("third");
  });

  it("should handle zero delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(result.current).toBe("updated");
  });

  it("should clean up timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "updated" });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("should handle number values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } },
    );

    rerender({ value: 42 });
    expect(result.current).toBe(0);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(42);
  });

  it("should handle object values", () => {
    const initial = { name: "test" };
    const updated = { name: "updated" };

    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: initial } },
    );

    rerender({ value: updated });
    expect(result.current).toBe(initial);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(updated);
  });
});
