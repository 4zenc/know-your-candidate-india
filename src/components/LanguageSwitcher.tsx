"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Globe, Search } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { LANGUAGES, completeness } from "@/i18n/translations";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const needle = q.trim().toLowerCase();
  const list = LANGUAGES.filter((l) => !needle || l.name.toLowerCase().includes(needle) || l.native.toLowerCase().includes(needle) || l.code.includes(needle));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm hover:border-zinc-500"
      >
        <Globe className="h-4 w-4" />
        <span className="max-w-[7rem] truncate">{current.native}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-line bg-[#0c0c0e] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-line px-3">
            <Search className="h-4 w-4 text-muted" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("langSearch")}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
            />
          </div>
          <ul role="listbox" className="max-h-72 overflow-y-auto p-1">
            {list.map((l) => {
              const pct = Math.round(completeness(l.code) * 100);
              return (
                <li key={l.code}>
                  <button
                    role="option"
                    aria-selected={l.code === lang}
                    onClick={() => {
                      setLang(l.code);
                      setOpen(false);
                      setQ("");
                    }}
                    className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-zinc-800", l.code === lang && "bg-zinc-800")}
                  >
                    <span>
                      {l.native} <span className="ml-1 text-xs text-muted">{l.name}</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted">
                      {pct < 100 && <span title="Partial translation — English shown for the rest">{pct}%</span>}
                      {l.code === lang && <Check className="h-4 w-4 text-foreground" />}
                    </span>
                  </button>
                </li>
              );
            })}
            {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">—</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
