"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle, Share2, X } from "lucide-react";
import { useI18n } from "@/i18n/provider";

interface Props {
  heading: string;
  sub: string;
  stats: { label: string; value: string }[];
  summary: string;
  path: string;
}

export function ShareReportCard({ heading, sub, stats, summary, path }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = () => `${summary}\n${window.location.origin}${path}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy:", text());
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-zinc-200">
        <Share2 className="h-4 w-4" /> {t("share")}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onMouseDown={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label={t("share")} className="w-full max-w-md" onMouseDown={(e) => e.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-full border border-line p-2 hover:border-zinc-500"><X className="h-4 w-4" /></button>
            </div>
            <div className="rounded-2xl border border-zinc-600 bg-background p-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Citizen Report Card</p>
              <h3 className="mt-2 text-2xl font-semibold">{heading}</h3>
              <p className="text-sm text-muted">{sub}</p>
              <dl className="mt-6 grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-lg border border-line p-3">
                    <dt className="text-[11px] uppercase tracking-wider text-muted">{s.label}</dt>
                    <dd className="mt-1 text-lg font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-[11px] text-zinc-500">Sources: ADR/MyNeta affidavits · PRS MP Track</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button onClick={copy} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface text-sm hover:border-zinc-500">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
              </button>
              <a onClick={() => setOpen(false)} href={`https://wa.me/?text=${encodeURIComponent(typeof window === "undefined" ? summary : text())}`} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface text-sm hover:border-zinc-500">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a onClick={() => setOpen(false)} href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(typeof window === "undefined" ? summary : text())}`} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center justify-center gap-2 rounded-lg border border-line bg-surface text-sm hover:border-zinc-500">
                <X className="h-4 w-4" /> Post
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
