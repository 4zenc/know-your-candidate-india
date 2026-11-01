"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, ExternalLink, Printer } from "lucide-react";
import { AUTHORITY, PRESET_IDS, RTI_LANGS, RTI_UNAVAILABLE, buildRti, type PresetId } from "@/lib/rti";
import { links } from "@/lib/links";
import { cn } from "@/lib/utils";

export interface Place {
  slug: string;
  name: string;
  state: string;
}

const field = "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-zinc-400";

export function RtiForm({ places, initial }: { places: Place[]; initial?: string }) {
  const [slug, setSlug] = useState(places[0]?.slug ?? "");
  const [q, setQ] = useState("");
  const [langCode, setLangCode] = useState("en");
  const [preset, setPreset] = useState<PresetId | "custom">("mplads");
  const [custom, setCustom] = useState("");
  const [period, setPeriod] = useState("April 2024 to date");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [draft, setDraft] = useState("");
  const [edited, setEdited] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initial && places.some((p) => p.slug === initial)) setSlug(initial);
  }, [initial, places]);

  const place = places.find((p) => p.slug === slug) ?? places[0];
  const lang = RTI_LANGS.find((l) => l.code === langCode) ?? RTI_LANGS[0];
  const issue = preset === "custom" ? custom.trim() || "…" : lang.presets[PRESET_IDS.indexOf(preset)];

  const generated = useMemo(
    () => (place ? buildRti({ lang, preset, issue, period, constituency: place.name, state: place.state, name, address }) : ""),
    [lang, preset, issue, period, place, name, address],
  );
  useEffect(() => { if (!edited) setDraft(generated); }, [generated, edited]);

  const matches = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (n ? places.filter((p) => `${p.name} ${p.state}`.toLowerCase().includes(n)) : places).slice(0, 8);
  }, [q, places]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(draft); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { window.prompt("Copy:", draft); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([draft], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `RTI-${slug}-${lang.code}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <div className="space-y-5 print:hidden">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted">Constituency</label>
          <input className={field} placeholder="Type to search 543 constituencies" value={q} onChange={(e) => setQ(e.target.value)} />
          <ul className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-line">
            {matches.map((p) => (
              <li key={p.slug}><button onClick={() => { setSlug(p.slug); setEdited(false); }} className={cn("flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-zinc-800", p.slug === slug && "bg-zinc-800")}><span>{p.name}</span><span className="text-xs text-muted">{p.state}</span></button></li>
            ))}
          </ul>
          {place && <p className="mt-2 text-xs text-muted">Selected: <span className="text-foreground">{place.name}, {place.state}</span></p>}
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted">Local issue</label>
          <div className="space-y-1">
            {PRESET_IDS.map((id, i) => (
              <label key={id} className={cn("flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm", preset === id ? "border-zinc-400" : "border-line")}>
                <input type="radio" name="preset" checked={preset === id} onChange={() => { setPreset(id); setEdited(false); }} className="mt-1" /> {lang.presets[i]}
              </label>
            ))}
            <label className={cn("flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm", preset === "custom" ? "border-zinc-400" : "border-line")}>
              <input type="radio" name="preset" checked={preset === "custom"} onChange={() => { setPreset("custom"); setEdited(false); }} className="mt-1" /> Something else
            </label>
          </div>
          {preset === "custom" && <textarea className="mt-2 w-full rounded-lg border border-line bg-surface p-3 text-sm outline-none focus:border-zinc-400" rows={3} placeholder="Describe the issue and the place, e.g. repair of the road from X to Y" value={custom} onChange={(e) => { setCustom(e.target.value); setEdited(false); }} />}
        </div>

        <div><label className="mb-1 block text-xs uppercase tracking-wider text-muted">Period</label><input className={field} value={period} onChange={(e) => { setPeriod(e.target.value); setEdited(false); }} /></div>
        <div className="grid grid-cols-1 gap-3">
          <input className={field} placeholder="Your name (optional)" value={name} onChange={(e) => { setName(e.target.value); setEdited(false); }} />
          <textarea className="w-full rounded-lg border border-line bg-surface p-3 text-sm outline-none focus:border-zinc-400" rows={2} placeholder="Your postal address (optional)" value={address} onChange={(e) => { setAddress(e.target.value); setEdited(false); }} />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted">Language</label>
          <select className={field} value={langCode} onChange={(e) => { setLangCode(e.target.value); setEdited(false); }}>
            {RTI_LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <p className="mt-2 text-xs text-zinc-500">
            Not yet available: {RTI_UNAVAILABLE.join(", ")}. Non-English drafts are good-faith translations — have a fluent reader check them. English and Hindi are accepted by every Central public authority.
          </p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap gap-2 print:hidden">
          <button onClick={copy} className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-zinc-200">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}</button>
          <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm hover:border-zinc-500"><Printer className="h-4 w-4" /> Save as PDF</button>
          <button onClick={download} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm hover:border-zinc-500"><Download className="h-4 w-4" /> .txt</button>
          <a href={links.rtionline} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm hover:border-zinc-500">File at rtionline.gov.in <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
        <textarea
          id="rti-print"
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setEdited(true); }}
          rows={26}
          spellCheck={false}
          className="w-full whitespace-pre-wrap rounded-xl border border-line bg-surface p-5 font-mono text-sm leading-relaxed outline-none focus:border-zinc-400 print:border-0 print:bg-white print:p-0 print:text-black"
        />
        {edited && <button onClick={() => setEdited(false)} className="mt-2 text-xs text-muted underline underline-offset-4 print:hidden">Discard my edits and regenerate</button>}
        <div className="mt-6 space-y-2 text-xs text-zinc-500 print:hidden">
          <p>How to file: the Central RTI portal (rtionline.gov.in) takes applications to Central ministries and bodies. Many states run their own portals; otherwise post the printed letter with the ₹10 fee (fees vary by state) to the office named at the top. Replace bracketed text such as [District] before sending.</p>
          <p>The Public Information Officer must reply within 30 days. If not, you can file a first appeal. This is a drafting aid, not legal advice. Official guide: rti.gov.in.</p>
          <p>Authority for this issue: {AUTHORITY[preset].split("\n")[1] ?? ""}</p>
        </div>
      </div>
    </div>
  );
}
