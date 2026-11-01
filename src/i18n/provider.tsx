"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LANG, LANGUAGES, translate, type TKey, type XKey } from "./translations";

interface Ctx {
  lang: string;
  setLang: (l: string) => void;
  t: (k: TKey | XKey) => string;
}

const I18nContext = createContext<Ctx>({ lang: DEFAULT_LANG, setLang: () => {}, t: (k) => translate(DEFAULT_LANG, k) });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved && LANGUAGES.some((l) => l.code === saved)) setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const meta = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = meta?.rtl ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: string) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, setLang, t: (k) => translate(lang, k) }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

/** Inline translated label for use inside server components. */
export function T({ k }: { k: TKey | XKey }) {
  const { t } = useI18n();
  return <>{t(k)}</>;
}
