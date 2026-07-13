import { useState, useEffect, useCallback, useRef } from "react"
import { localDB } from "@/lib/store/index"
import { logger } from "@/lib/logger"

if (import.meta.env.PROD) {
  logger.error(
    "ConvexShim",
    "Convex shim loaded in production! This should use the real Convex backend.",
  )
  if (typeof window !== "undefined") {
    window.__CONVEX_SHIM_ACTIVE__ = true
  }
}

type QueryResult<T> = T | undefined

type QueryFn = (...args: unknown[]) => unknown
type MutationFn = (...args: unknown[]) => unknown

const queryListeners = new Map<string, Set<() => void>>()
const fnKeyMap = new WeakMap<QueryFn | MutationFn, string>()
let fnKeyCounter = 0

function getFnKey(fn: QueryFn | MutationFn): string {
  let key = fnKeyMap.get(fn)
  if (!key) {
    key = `fn_${fnKeyCounter++}`
    fnKeyMap.set(fn, key)
  }
  return key
}

export function notifyDataChange(collectionKey?: string) {
  if (collectionKey) {
    const listeners = queryListeners.get(collectionKey)
    if (listeners) {
      listeners.forEach((l) => l())
    }
  } else {
    queryListeners.forEach((listeners) => {
      listeners.forEach((l) => l())
    })
  }
}

export function useQuery<T = unknown>(
  fn: QueryFn,
  args?: Record<string, unknown>,
): QueryResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const fnRef = useRef(fn)
  const argsRef = useRef(args)
  const argsKeyRef = useRef(JSON.stringify(args))
  const listenerKeyRef = useRef<string>("")

  const fnKey = getFnKey(fn)
  const argsKey = JSON.stringify(args)
  const queryKey = `${fnKey}_${argsKey}`

  useEffect(() => {
    fnRef.current = fn
    argsRef.current = args

    const newKey = queryKey
    const oldKey = listenerKeyRef.current

    if (oldKey && oldKey !== newKey) {
      queryListeners
        .get(oldKey)
        ?.delete(listenerKeyRef.current as unknown as () => void)
      const currentListeners = queryListeners.get(oldKey)
      if (currentListeners && currentListeners.size === 0) {
        queryListeners.delete(oldKey)
      }
    }

    listenerKeyRef.current = newKey
    argsKeyRef.current = argsKey

    if (!queryListeners.has(newKey)) {
      queryListeners.set(newKey, new Set())
    }

    const listener = () => {
      try {
        const result = fnRef.current(argsRef.current)
        Promise.resolve(result).then((resolved) => {
          setData(resolved as T)
        })
      } catch (e) {
        logger.error("ConvexShim", "Query listener failed", e)
      }
    }
    queryListeners.get(newKey)!.add(listener)

    try {
      const result = fn(args)
      Promise.resolve(result).then((resolved) => {
        setData(resolved as T)
      })
    } catch (e) {
      logger.error("ConvexShim", "Initial query failed", e)
    }

    return () => {
      queryListeners.get(newKey)?.delete(listener)
      const currentListeners = queryListeners.get(newKey)
      if (currentListeners && currentListeners.size === 0) {
        queryListeners.delete(newKey)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, argsKey])

  return data
}

export function useMutation(fn: MutationFn, collectionKey?: string) {
  const fnRef = useRef(fn)
  const collectionKeyRef = useRef(collectionKey)

  useEffect(() => {
    fnRef.current = fn
    collectionKeyRef.current = collectionKey
  })

  return useCallback(async (...args: unknown[]) => {
    const result = await fnRef.current(...args)
    notifyDataChange(collectionKeyRef.current)
    return result
  }, [])
}

export function useAction(fn: MutationFn) {
  const fnRef = useRef(fn)

  useEffect(() => {
    fnRef.current = fn
  })

  return useCallback(async (...args: unknown[]) => {
    return await fnRef.current(...args)
  }, [])
}

export { localDB }
