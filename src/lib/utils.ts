import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export { generateId } from "./store/types";

export function getMostRecent<T>(items: T[], key: keyof T): T | undefined {
  if (items.length === 0) return undefined;
  return items.reduce((latest, item) => {
    const latestVal = (latest[key] as number) ?? 0;
    const itemVal = (item[key] as number) ?? 0;
    return itemVal > latestVal ? item : latest;
  });
}
