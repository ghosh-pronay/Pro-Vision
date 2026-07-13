import { logger } from "@/lib/logger"

export type StoredRecord = { _id: string; [key: string]: unknown }

export function getStore<T extends StoredRecord>(key: string): T[] {
  try {
    const raw = localStorage.getItem(`pv_${key}`)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    logger.error("store", `Failed to parse localStorage key "${key}"`, e)
    return []
  }
}

export function setStore<T extends StoredRecord>(key: string, data: T[]) {
  localStorage.setItem(`pv_${key}`, JSON.stringify(data))
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function now(): number {
  return Date.now()
}

export interface Collection<T extends StoredRecord> {
  list(): T[]
  create(data: Record<string, unknown>): T
  remove(id: string): void
  update(id: string, data: Partial<T>): void
}

export function createCollection<T extends StoredRecord>(
  key: string,
  options?: { prepend?: boolean },
): Collection<T> {
  return {
    list(): T[] {
      return getStore<T>(key)
    },
    create(data: Record<string, unknown>): T {
      const items = getStore<T>(key)
      const item = {
        _id: generateId(),
        createdAt: now(),
        updatedAt: now(),
        ...data,
      } as unknown as T
      if (options?.prepend) {
        items.unshift(item)
      } else {
        items.push(item)
      }
      setStore(key, items)
      return item
    },
    remove(id: string): void {
      setStore(
        key,
        getStore<T>(key).filter((item) => item._id !== id),
      )
    },
    update(id: string, data: Partial<T>): void {
      const items = getStore<T>(key)
      const index = items.findIndex((item) => item._id === id)
      if (index !== -1) {
        items[index] = { ...items[index], ...data }
        setStore(key, items)
      }
    },
  }
}
