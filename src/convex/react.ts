import { useState, useEffect, useCallback, useRef } from "react";
import { localDB } from "@/lib/data-store";

if (import.meta.env.PROD) {
  console.error(
    "Convex shim loaded in production! This should use the real Convex backend.",
  );
  if (typeof window !== "undefined") {
    window.__CONVEX_SHIM_ACTIVE__ = true;
  }
}

type QueryResult<T> = T | undefined;

type QueryFn = (...args: unknown[]) => unknown;
type MutationFn = (...args: unknown[]) => unknown;

const _listeners = new Set<() => void>();

export function notifyDataChange() {
  _listeners.forEach((l) => l());
}

export function useQuery<T = unknown>(
  fn: QueryFn,
  args?: Record<string, unknown>,
): QueryResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const fnRef = useRef(fn);
  const argsRef = useRef(args);

  useEffect(() => {
    fnRef.current = fn;
    argsRef.current = args;
  });

  useEffect(() => {
    const listener = () => {
      try {
        const result = fnRef.current(argsRef.current);
        Promise.resolve(result).then((resolved) => {
          setData(resolved as T);
        });
      } catch (e) {
        console.error("[Convex shim] Query listener failed:", e);
      }
    };
    _listeners.add(listener);

    try {
      const result = fn(args);
      Promise.resolve(result).then((resolved) => {
        setData(resolved as T);
      });
    } catch (e) {
      console.error("[Convex shim] Initial query failed:", e);
    }

    return () => {
      _listeners.delete(listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, JSON.stringify(args)]);

  return data;
}

export function useMutation(fn: MutationFn) {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  return useCallback(async (...args: unknown[]) => {
    const result = await fnRef.current(...args);
    notifyDataChange();
    return result;
  }, []);
}

export function useAction(fn: MutationFn) {
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  return useCallback(async (...args: unknown[]) => {
    return await fnRef.current(...args);
  }, []);
}

export { localDB };
