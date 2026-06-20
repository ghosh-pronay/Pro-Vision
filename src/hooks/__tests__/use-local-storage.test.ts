import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../use-local-storage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return initial value when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("should return stored value from localStorage", () => {
    localStorage.setItem("test-key", JSON.stringify("stored-value"));

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
    expect(result.current[0]).toBe("stored-value");
  });

  it("should update value and localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
  });

  it("should handle function updates", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(localStorage.getItem("test-key")).toBe("1");
  });

  it("should handle JSON serialization for objects", () => {
    const initial = { name: "test", count: 0 };
    const { result } = renderHook(() => useLocalStorage("test-key", initial));

    act(() => {
      result.current[1]({ name: "updated", count: 5 });
    });

    expect(result.current[0]).toEqual({ name: "updated", count: 5 });
    expect(JSON.parse(localStorage.getItem("test-key")!)).toEqual({
      name: "updated",
      count: 5,
    });
  });

  it("should handle JSON serialization for arrays", () => {
    const initial = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage("test-key", initial));

    act(() => {
      result.current[1]([4, 5, 6]);
    });

    expect(result.current[0]).toEqual([4, 5, 6]);
    expect(JSON.parse(localStorage.getItem("test-key")!)).toEqual([4, 5, 6]);
  });

  it("should handle invalid JSON in localStorage", () => {
    localStorage.setItem("test-key", "invalid-json");

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "fallback"),
    );
    expect(result.current[0]).toBe("fallback");
  });

  it("should handle different keys independently", () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage("key-1", "value-1"),
    );
    const { result: result2 } = renderHook(() =>
      useLocalStorage("key-2", "value-2"),
    );

    act(() => {
      result1.current[1]("updated-1");
    });

    expect(result1.current[0]).toBe("updated-1");
    expect(result2.current[0]).toBe("value-2");
  });

  it("should handle boolean values", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", false));

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem("test-key")).toBe("true");
  });

  it("should handle null values", () => {
    const { result } = renderHook(() =>
      useLocalStorage<string | null>("test-key", null),
    );

    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1]("not-null");
    });

    expect(result.current[0]).toBe("not-null");
  });

  it("should use different keys for different hooks", () => {
    const { result: result1 } = renderHook(() =>
      useLocalStorage("unique-key-1", "value-1"),
    );
    const { result: result2 } = renderHook(() =>
      useLocalStorage("unique-key-2", "value-2"),
    );

    act(() => {
      result1.current[1]("new-value-1");
    });

    expect(result1.current[0]).toBe("new-value-1");
    expect(result2.current[0]).toBe("value-2");
  });
});
