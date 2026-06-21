import { useMemo, useEffect, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import {
  translations,
  type TranslationKey,
  type Lang,
} from "@/i18n/translations";

function setNested(obj: Record<string, any>, path: string, value: string) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

const langCache: Record<string, Record<TranslationKey, string>> = {};

async function loadLang(lang: Lang): Promise<Record<TranslationKey, string>> {
  if (langCache[lang]) return langCache[lang];
  let mod;
  if (lang === "bn") {
    mod = await import("@/i18n/translations-bn");
    langCache[lang] = mod.bn;
  } else {
    mod = await import("@/i18n/translations-en");
    langCache[lang] = mod.en;
  }
  return langCache[lang];
}

export function useI18n() {
  const { lang } = useLang();
  const [langData, setLangData] = useState<Record<TranslationKey, string>>(
    () =>
      (langCache[lang] ?? (translations as any)[Object.keys(translations)[0]])
        ? translations
        : ({} as any),
  );

  useEffect(() => {
    loadLang(lang).then(setLangData);
  }, [lang]);

  const nested = useMemo(() => {
    const obj: Record<string, any> = {};
    const data = langData || translations;
    for (const key of Object.keys(translations) as TranslationKey[]) {
      const val =
        data[key] ??
        translations[key]?.[lang] ??
        translations[key]?.["en"] ??
        key;
      setNested(obj, key, val);
    }
    return obj;
  }, [lang, langData]);

  return { t: nested, lang };
}
