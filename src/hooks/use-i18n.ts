import { useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import {
  translations,
  type TranslationKey,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type Lang,
} from "@/i18n/translations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setNested(obj: any, path: string, value: string) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

export function useI18n() {
  const { lang } = useLang();
  const nested = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj: Record<string, any> = {};
    for (const key of Object.keys(translations) as TranslationKey[]) {
      const val = translations[key]?.[lang] ?? translations[key]?.["en"] ?? key;
      setNested(obj, key, val);
    }
    return obj;
  }, [lang]);
  return { t: nested, lang };
}
