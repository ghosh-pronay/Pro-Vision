import { useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { translations, type TranslationKey } from "@/i18n/translations";

// Recursive type for nested translation objects
interface TranslationNode {
  [key: string]: TranslationNode | string;
}

function setNested(obj: TranslationNode, path: string, value: string) {
  const parts = path.split(".");
  let cur: TranslationNode = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!cur[key] || typeof cur[key] !== "object") {
      cur[key] = {};
    }
    cur = cur[key] as TranslationNode;
  }
  cur[parts[parts.length - 1]] = value;
}

export function useI18n() {
  const { lang } = useLang();
  const nested = useMemo(() => {
    const obj: TranslationNode = {};
    for (const key of Object.keys(translations) as TranslationKey[]) {
      const val = translations[key]?.[lang] ?? translations[key]?.["en"] ?? key;
      setNested(obj, key, val);
    }
    return obj;
  }, [lang]);
  return { t: nested, lang };
}
