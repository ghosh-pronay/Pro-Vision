import { useState, useEffect, useRef, useCallback } from "react";

const cache = new Map<string, unknown>();
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 100;
const timestamps = new Map<string, number>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60 * 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [k, ts] of timestamps) {
    if (now - ts > CACHE_TTL) {
      cache.delete(k);
      timestamps.delete(k);
    }
  }
}

function evictOldest() {
  if (cache.size <= MAX_CACHE_SIZE) return;
  const evictCount = Math.max(1, Math.floor((cache.size - MAX_CACHE_SIZE) / 2));
  const entries: [string, number][] = [];
  for (const [k, ts] of timestamps) {
    entries.push([k, ts]);
  }
  entries.sort((a, b) => a[1] - b[1]);
  for (let i = 0; i < Math.min(evictCount, entries.length); i++) {
    cache.delete(entries[i][0]);
    timestamps.delete(entries[i][0]);
  }
}

export function useCachedQuery<T>(
  key: string,
  liveData: T | undefined,
): { data: T | undefined; retry: () => void } {
  const [data, setData] = useState<T | undefined>(() => {
    cleanupExpired();
    const ts = timestamps.get(key);
    if (ts && Date.now() - ts < CACHE_TTL) {
      return cache.get(key) as T;
    }
    return undefined;
  });
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);
  const keyRef = useRef(key);

  useEffect(() => {
    mountedRef.current = true;
    keyRef.current = key;
    return () => {
      mountedRef.current = false;
    };
  }, [key]);

  useEffect(() => {
    if (liveData !== undefined) {
      cache.set(keyRef.current, liveData);
      timestamps.set(keyRef.current, Date.now());
      cleanupExpired();
      evictOldest();
      if (mountedRef.current) {
        setData(liveData);
        setRetryCount(0);
      }
    } else if (
      liveData === undefined &&
      retryCount > 0 &&
      retryCount < MAX_RETRIES
    ) {
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setRetryCount((c) => c + 1);
        }
      }, RETRY_DELAY * retryCount);
      return () => clearTimeout(timer);
    }
  }, [liveData, retryCount]);

  const retry = useCallback(() => {
    setRetryCount(1);
  }, []);

  return { data, retry };
}
