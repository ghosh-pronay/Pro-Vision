export type StoredRecord = { _id: string; [key: string]: unknown };

export function getStore<T extends StoredRecord>(key: string): T[] {
  try {
    const raw = localStorage.getItem(`pv_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`[data-store] Failed to parse localStorage key "${key}":`, e);
    return [];
  }
}

export function setStore<T extends StoredRecord>(key: string, data: T[]) {
  localStorage.setItem(`pv_${key}`, JSON.stringify(data));
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function now(): number {
  return Date.now();
}
