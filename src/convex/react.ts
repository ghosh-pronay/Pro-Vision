import { useState, useEffect, useCallback, useRef } from "react";
import { localDB } from "@/lib/data-store";

type QueryResult<T> = T | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryFn = (...args: any[]) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MutationFn = (...args: any[]) => any;

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
      } catch {
        // query failed
      }
    };
    _listeners.add(listener);

    try {
      const result = fn(args);
      Promise.resolve(result).then((resolved) => {
        setData(resolved as T);
      });
    } catch {
      // query failed
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
