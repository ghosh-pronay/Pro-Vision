import { useMemo } from "react"
import { useLang } from "@/i18n/LanguageContext"
import { en } from "@/i18n/translations-en"
import { bn } from "@/i18n/translations-bn"

interface TranslationNode {
  [key: string]: TranslationNode | string
}

function setNested(obj: TranslationNode, path: string, value: string) {
  const parts = path.split(".")
  let cur: TranslationNode = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    if (!cur[key] || typeof cur[key] !== "object") {
      cur[key] = {}
    }
    cur = cur[key] as TranslationNode
  }
  cur[parts[parts.length - 1]] = value
}

export function useI18n() {
  const { lang } = useLang()
  const nested = useMemo(() => {
    const obj: TranslationNode = {}
    const map = lang === "bn" ? bn : en
    for (const key of Object.keys(map) as Array<keyof typeof map>) {
      setNested(obj, key, map[key])
    }
    return obj
  }, [lang])
  return { t: nested as any, lang }
}
