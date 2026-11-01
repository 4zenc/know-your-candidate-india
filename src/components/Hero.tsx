"use client";

import { Search } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function Hero() {
  const { t } = useI18n();
  return (
    <div className="py-10 text-center sm:py-14">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{t("title")}</h1>
      <p className="mx-auto mt-4 max-w-xl text-muted">{t("subtitle")}</p>
      <button onClick={() => window.dispatchEvent(new Event("open-search"))} className="mx-auto mt-8 flex h-14 w-full max-w-xl items-center gap-3 rounded-xl border border-line bg-surface px-4 text-left text-muted hover:border-zinc-500">
        <Search className="h-5 w-5 shrink-0" />
        <span className="flex-1 truncate">{t("searchMp")}</span>
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 text-xs sm:inline">⌘K</kbd>
      </button>
    </div>
  );
}
