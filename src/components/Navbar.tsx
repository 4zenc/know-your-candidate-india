"use client";

import Link from "next/link";
import { Landmark, Search } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/i18n/provider";

export function Navbar() {
  const { t } = useI18n();
  const nav = [
    { href: "/directory", label: t("directory") },
    { href: "/compare", label: t("compareMps") },
    { href: "/tools/rti-generator", label: t("rtiTool") },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Landmark className="h-5 w-5" />
            <span className="hidden lg:inline">{t("title")}</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
            {nav.map((n) => <Link key={n.href} href={n.href} className="hover:text-foreground">{n.label}</Link>)}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.dispatchEvent(new Event("open-search"))} className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-muted hover:border-zinc-500" aria-label={t("searchMp")}>
            <Search className="h-4 w-4" />
            <kbd className="hidden rounded border border-line px-1.5 text-xs sm:inline">⌘K</kbd>
          </button>
          <LanguageSwitcher />
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t border-line px-4 py-2 text-xs text-muted md:hidden">
        {nav.map((n) => <Link key={n.href} href={n.href} className="shrink-0 hover:text-foreground">{n.label}</Link>)}
      </nav>
    </header>
  );
}
