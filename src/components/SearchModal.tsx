"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import type { SearchEntry } from "@/lib/types";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function SearchModal() {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<SearchEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 10);
    if (index.length === 0) {
      fetch("/search-index.json").then((r) => r.json()).then(setIndex).catch(() => {});
    }
  }, [open, index.length]);

  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return index.slice(0, 8);
    const starts: SearchEntry[] = [];
    const contains: SearchEntry[] = [];
    for (const e of index) {
      if (e.label.toLowerCase().startsWith(n)) starts.push(e);
      else if (e.h.includes(n)) contains.push(e);
    }
    return [...starts, ...contains].slice(0, 12);
  }, [q, index]);

  const go = (e: SearchEntry) => {
    setOpen(false);
    router.push(e.href);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[12vh]" onMouseDown={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label={t("searchMp")} className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-[#0c0c0e] shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && results[active]) go(results[active]);
            }}
            placeholder={t("searchMp")}
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-1">
          {results.map((r, i) => (
            <li key={r.href}>
              <button onClick={() => go(r)} onMouseEnter={() => setActive(i)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left", i === active && "bg-zinc-800")}>
                <MapPin className="h-4 w-4 shrink-0 text-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{r.label}</span>
                  <span className="block truncate text-xs text-muted">{r.sub}</span>
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">{index.length ? "No matches" : "Loading…"}</li>}
        </ul>
      </div>
    </div>
  );
}
