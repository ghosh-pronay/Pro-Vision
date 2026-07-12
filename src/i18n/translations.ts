import { en } from "./translations-en"
import { bn } from "./translations-bn"

export type Lang = "en" | "bn"

export type TranslationKey = keyof typeof en

export function t(key: TranslationKey, lang: Lang): string {
  return (lang === "bn" ? bn[key] : en[key]) ?? key
}
