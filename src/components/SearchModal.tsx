"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search, User } from "lucide-react";
import type { SearchEntry } from "@/lib/types";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function SearchModal({ index }: { index: SearchEntry[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
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
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = n ? index.filter((e) => e.haystack.includes(n)) : index.filter((e) => e.type === "constituency");
    return list.slice(0, 12);
  }, [q, index]);

  const go = (e: SearchEntry) => {
    setOpen(false);
    router.push(e.href);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-[12vh]" onMouseDown={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label={t("search")} className="w-full max-w-xl overflow-hidden rounded-xl border border-line bg-[#0c0c0e] shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
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
            placeholder={t("search")}
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-zinc-500"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-1">
          {results.map((r, i) => (
            <li key={r.href}>
              <button onClick={() => go(r)} onMouseEnter={() => setActive(i)} className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left", i === active && "bg-zinc-800")}>
                {r.type === "constituency" ? <MapPin className="h-4 w-4 text-muted" /> : <User className="h-4 w-4 text-muted" />}
                <span className="flex-1">
                  <span className="block text-sm">{r.label}</span>
                  <span className="block text-xs text-muted">{r.sub}</span>
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No matches</li>}
        </ul>
      </div>
    </div>
  );
}
