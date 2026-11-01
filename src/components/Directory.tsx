"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import type { DirectoryRow } from "@/lib/types";
import { links } from "@/lib/links";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

export function Directory({ rows }: { rows: DirectoryRow[] }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [limit, setLimit] = useState(60);
  const states = useMemo(() => Array.from(new Set(rows.map((r) => r.state))).filter(Boolean).sort(), [rows]);
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    return rows.filter((r) => (!state || r.state === state) && (!n || `${r.constituency} ${r.mp} ${r.party} ${r.state}`.toLowerCase().includes(n)));
  }, [rows, q, state]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(60); }} placeholder={t("searchMp")} className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-500" />
        </div>
        <select value={state} onChange={(e) => { setState(e.target.value); setLimit(60); }} aria-label="State" className="h-11 rounded-lg border border-line bg-surface px-3 text-sm">
          <option value="">All states / UTs</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <p className="mb-3 text-xs text-muted">{filtered.length} of {rows.length}</p>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="p-3">Constituency</th><th className="p-3">State</th><th className="p-3">MP (2024 winner)</th><th className="p-3">Party</th><th className="p-3">Official records</th></tr>
          </thead>
          <tbody>
            {filtered.slice(0, limit).map((r) => (
              <tr key={r.slug} className="border-t border-line hover:bg-surface">
                <td className="p-3"><Link href={`/constituency/${r.slug}`} className="font-medium underline-offset-4 hover:underline">{r.constituency}</Link></td>
                <td className="p-3 text-muted">{r.state}</td>
                <td className="p-3"><Link href={`/candidate/${r.id}`} className="hover:underline">{r.mp}</Link></td>
                <td className="p-3 text-muted">{r.party}</td>
                <td className="p-3">
                  <div className={cn("flex gap-3 text-xs text-muted")}>
                    <a className="inline-flex items-center gap-1 hover:text-foreground" target="_blank" rel="noopener noreferrer" href={r.prs ? `https://prsindia.org/mptrack/18th-lok-sabha/${r.prs}` : "https://prsindia.org/mptrack"}>PRS <ExternalLink className="h-3 w-3" /></a>
                    <a className="inline-flex items-center gap-1 hover:text-foreground" target="_blank" rel="noopener noreferrer" href={links.myneta(r.id)}>MyNeta <ExternalLink className="h-3 w-3" /></a>
                    <a className="inline-flex items-center gap-1 hover:text-foreground" target="_blank" rel="noopener noreferrer" href={links.sansad}>Sansad <ExternalLink className="h-3 w-3" /></a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {limit < filtered.length && (
        <button onClick={() => setLimit((l) => l + 120)} className="mx-auto mt-4 block rounded-lg border border-line px-4 py-2 text-sm hover:border-zinc-500">Show more</button>
      )}
    </div>
  );
}
