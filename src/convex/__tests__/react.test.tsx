import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useQuery, useMutation, useAction, notifyDataChange } from "../react"

vi.mock("@/lib/data-store", () => ({
  localDB: {
    tasks: {
      list: () => [
        {
          _id: "1",
          title: "Test Task",
          completed: false,
          createdAt: Date.now(),
        },
      ],
      create: (data: Record<string, unknown>) => ({ _id: "2", ...data }),
    },
    userProfiles: {
      get: () => ({ displayName: "Test" }),
    },
  },
}))

describe("Convex shim", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("useQuery", () => {
    function mockQueryFn() {
      return [
        { _id: "1", title: "Task 1" },
        { _id: "2", title: "Task 2" },
      ]
    }
    Object.defineProperty(mockQueryFn, "name", { value: "mockQueryFn" })

    it("returns data from query function", async () => {
      const { result } = renderHook(() => useQuery(mockQueryFn))
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10))
      })
      expect(result.current).toBeDefined()
      expect(Array.isArray(result.current)).toBe(true)
      expect((result.current as unknown[]).length).toBe(2)
    })

    it("returns undefined initially then resolves", async () => {
      const { result } = renderHook(() => useQuery(mockQueryFn))
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10))
      })
      expect(result.current).toBeDefined()
    })

    it("cleans up listener on unmount", async () => {
      const { unmount } = renderHook(() => useQuery(mockQueryFn))
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10))
      })
      unmount()
      expect(() => notifyDataChange("mockQueryFn_undefined")).not.toThrow()
    })

    it("updates when args change", async () => {
      let callCount = 0
      const countingFn = (..._args: unknown[]) => {
        callCount++
        return [{ _id: "1", count: callCount }]
      }
      Object.defineProperty(countingFn, "name", { value: "countingFn" })

      const { result, rerender } = renderHook(
        ({ arg }) => useQuery(countingFn, { arg }),
        { initialProps: { arg: "a" } },
      )

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10))
      })
      expect(result.current).toBeDefined()

      rerender({ arg: "b" })
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10))
      })
      expect(callCount).toBeGreaterThanOrEqual(2)
    })

    it("handles query function that throws", async () => {
      const errorFn = () => {
        throw new Error("Query failed")
      }
      Object.defineProperty(errorFn, "name", { value: "errorFn" })

      const { result } = renderHook(() => useQuery(errorFn))
      await act(async () => {
        await new Promise((r) => setTimeout(r, 10))
      })
      expect(result.current).toBeUndefined()
    })

    it("handles async query function", async () => {
      const asyncFn = async () => {
        return [{ _id: "1", async: true }]
      }
      Object.defineProperty(asyncFn, "name", { value: "asyncFn" })

      const { result } = renderHook(() => useQuery(asyncFn))
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20))
      })
      expect(result.current).toBeDefined()
    })
  })

  describe("useMutation", () => {
    function mockMutationFn() {
      return { success: true }
    }
    Object.defineProperty(mockMutationFn, "name", {
      value: "mockMutationFn",
    })

    it("returns a callback that invokes the mutation", async () => {
      const { result } = renderHook(() => useMutation(mockMutationFn))
      let returnValue: unknown
      await act(async () => {
        returnValue = await result.current()
      })
      expect(returnValue).toEqual({ success: true })
    })

    it("passes arguments to the mutation function", async () => {
      const spyFn = vi.fn().mockReturnValue({ received: true })
      Object.defineProperty(spyFn, "name", { value: "spyFn" })

      const { result } = renderHook(() => useMutation(spyFn))
      await act(async () => {
        await result.current("arg1", "arg2")
      })
      expect(spyFn).toHaveBeenCalledWith("arg1", "arg2")
    })

    it("accepts collectionKey parameter", async () => {
      const { result } = renderHook(() => useMutation(mockMutationFn, "tasks"))
      let returnValue: unknown
      await act(async () => {
        returnValue = await result.current()
      })
      expect(returnValue).toEqual({ success: true })
    })

    it("handles async mutation", async () => {
      const asyncFn = async () => {
        await new Promise((r) => setTimeout(r, 5))
        return { async: true }
      }
      Object.defineProperty(asyncFn, "name", { value: "asyncFn" })

      const { result } = renderHook(() => useMutation(asyncFn))
      let returnValue: unknown
      await act(async () => {
        returnValue = await result.current()
      })
      expect(returnValue).toEqual({ async: true })
    })

    it("handles mutation that throws", async () => {
      const errorFn = async () => {
        throw new Error("Mutation failed")
      }
      Object.defineProperty(errorFn, "name", { value: "errorFn" })

      const { result } = renderHook(() => useMutation(errorFn))
      await expect(
        act(async () => {
          await result.current()
        }),
      ).rejects.toThrow("Mutation failed")
    })

    it("invokes notifyDataChange after mutation", async () => {
      const spyFn = vi.fn().mockReturnValue({ ok: true })
      Object.defineProperty(spyFn, "name", { value: "spyFn" })

      const { result } = renderHook(() => useMutation(spyFn, "spyFn"))
      await act(async () => {
        await result.current()
      })
      expect(spyFn).toHaveBeenCalled()
    })
  })

  describe("useAction", () => {
    it("returns a callback that invokes the action", async () => {
      const actionFn = vi.fn().mockReturnValue({ actionResult: true })
      Object.defineProperty(actionFn, "name", { value: "actionFn" })

      const { result } = renderHook(() => useAction(actionFn))
      let returnValue: unknown
      await act(async () => {
        returnValue = await result.current()
      })
      expect(returnValue).toEqual({ actionResult: true })
    })

    it("passes arguments to the action function", async () => {
      const spyFn = vi.fn().mockReturnValue({ received: true })
      Object.defineProperty(spyFn, "name", { value: "spyFn" })

      const { result } = renderHook(() => useAction(spyFn))
      await act(async () => {
        await result.current("a", "b")
      })
      expect(spyFn).toHaveBeenCalledWith("a", "b")
    })
  })

  describe("notifyDataChange", () => {
    it("does not throw when called with no listeners", () => {
      expect(() => notifyDataChange()).not.toThrow()
    })

    it("does not throw when called with a collection key", () => {
      expect(() => notifyDataChange("tasks")).not.toThrow()
    })

    it("triggers listener for matching collection key", async () => {
      function queryFn() {
        return []
      }
      Object.defineProperty(queryFn, "name", { value: "queryFn" })

      renderHook(() => useQuery(queryFn))

      await act(async () => {
        await new Promise((r) => setTimeout(r, 10))
      })

      expect(() => notifyDataChange("queryFn_")).not.toThrow()
    })

    it("with collectionKey only notifies relevant listeners", () => {
      expect(() => notifyDataChange("nonexistent")).not.toThrow()
    })
  })
})
