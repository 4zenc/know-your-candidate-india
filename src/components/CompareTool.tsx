"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Copy, MessageCircle, X } from "lucide-react";
import { links } from "@/lib/links";
import { formatINR } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";

export interface CompareRow {
  id: string;
  name: string;
  party: string;
  constituency: string;
  state: string;
  education: string;
  assets: number | null;
  liabilities: number | null;
  net: number | null;
  cases: number;
  attendance: number | null;
  questions: number | null;
  debates: number | null;
  prs: string | null;
}

function Picker({ rows, value, onChange, label }: { rows: CompareRow[]; value: string; onChange: (id: string) => void; label: string }) {
  const [q, setQ] = useState("");
  const sel = rows.find((r) => r.id === value);
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (n ? rows.filter((r) => `${r.name} ${r.constituency} ${r.party} ${r.state}`.toLowerCase().includes(n)) : rows).slice(0, 6);
  }, [q, rows]);
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-wider text-muted">{label}</p>
      {sel && (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-zinc-500 px-3 py-2 text-sm">
          <span>{sel.name} <span className="text-muted">· {sel.constituency}</span></span>
          <button onClick={() => onChange("")} aria-label="Clear"><X className="h-4 w-4 text-muted" /></button>
        </div>
      )}
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search MP, constituency, party…" className="h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-zinc-400" />
      {q && (
        <ul className="mt-1 overflow-hidden rounded-lg border border-line">
          {list.map((r) => (
            <li key={r.id}><button onClick={() => { onChange(r.id); setQ(""); }} className="flex w-full justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-800"><span>{r.name} <span className="text-muted">({r.party})</span></span><span className="text-xs text-muted">{r.constituency}</span></button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CompareTool({ rows }: { rows: CompareRow[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const [a, setA] = useState(params.get("a") ?? "");
  const [b, setB] = useState(params.get("b") ?? "");
  const [copied, setCopied] = useState(false);
  const A = rows.find((r) => r.id === a);
  const B = rows.find((r) => r.id === b);

  useEffect(() => {
    const p = new URLSearchParams();
    if (a) p.set("a", a);
    if (b) p.set("b", b);
    router.replace(p.toString() ? `/compare?${p}` : "/compare", { scroll: false });
  }, [a, b, router]);

  const money = (v: number | null) => (v == null ? "—" : formatINR(v));
  const spec: [string, (r: CompareRow) => string][] = [
    ["Party", (r) => r.party],
    ["Constituency", (r) => `${r.constituency}, ${r.state}`],
    [t("education"), (r) => r.education],
    ["Declared assets", (r) => money(r.assets)],
    [t("liabilities"), (r) => money(r.liabilities)],
    [t("netWorth"), (r) => money(r.net)],
    ["Declared criminal cases", (r) => String(r.cases)],
    [t("attendance"), (r) => (r.attendance != null ? `${r.attendance}%` : "—")],
    [t("debates"), (r) => (r.debates != null ? String(r.debates) : "—")],
    [t("questions"), (r) => (r.questions != null ? String(r.questions) : "—")],
  ];

  const text = A && B
    ? `${A.name} (${A.party}, ${A.constituency}) vs ${B.name} (${B.party}, ${B.constituency})\n` +
      `Assets: ${money(A.assets)} vs ${money(B.assets)}\nDeclared cases: ${A.cases} vs ${B.cases}\n` +
      `Attendance: ${A.attendance ?? "—"}% vs ${B.attendance ?? "—"}%\nSources: myneta.info, prsindia.org\n${typeof window !== "undefined" ? window.location.href : ""}`
    : "";

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt("Copy:", text); }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Picker rows={rows} value={a} onChange={setA} label="MP 1" />
        <Picker rows={rows} value={b} onChange={setB} label="MP 2" />
      </div>
      {A && B ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="border-b border-line text-left"><th className="w-44 p-4" /><th className="p-4 font-medium">{A.name}</th><th className="p-4 font-medium">{B.name}</th></tr></thead>
              <tbody>
                {spec.map(([label, f]) => (
                  <tr key={label} className="border-b border-line/60 last:border-0"><th scope="row" className="p-4 text-left font-normal text-muted">{label}</th><td className="p-4">{f(A)}</td><td className="p-4">{f(B)}</td></tr>
                ))}
                <tr><th scope="row" className="p-4 text-left font-normal text-muted">Originals</th>
                  {[A, B].map((r) => (
                    <td key={r.id} className="space-x-3 p-4 text-xs"><a className="underline" target="_blank" rel="noopener noreferrer" href={links.myneta(r.id)}>MyNeta</a><a className="underline" target="_blank" rel="noopener noreferrer" href={r.prs ? `https://prsindia.org/mptrack/18th-lok-sabha/${r.prs}` : "https://prsindia.org/mptrack"}>PRS</a></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={copy} className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-zinc-200">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : t("share")}</button>
            <a target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(text)}`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm hover:border-zinc-500"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
            <a target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm hover:border-zinc-500"><X className="h-4 w-4" /> Post</a>
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">Pick two MPs to compare their declared wealth, cases and parliament record.</p>
      )}
    </div>
  );
}
