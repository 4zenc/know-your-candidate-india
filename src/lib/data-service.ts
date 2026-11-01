import raw from "@/data/lok-sabha.json";
import type { DirectoryRow, MP, SearchEntry } from "./types";
import type { Dataset } from "./types";

const data = raw as unknown as Dataset;

export const getMeta = () => ({ generated: data.generated, election: data.election, prsPeriod: data.prsPeriod });
export const getMPs = (): MP[] => data.mps;
export const getMPBySlug = (slug: string) => data.mps.find((m) => m.slug === slug);
export const getMPById = (id: string) => data.mps.find((m) => m.id === id);
export const getFeatured = (): MP[] => data.featured.map((s) => getMPBySlug(s)).filter((m): m is MP => !!m);
export const isFeatured = (slug: string) => data.featured.includes(slug);

export function getSearchIndex(): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const m of data.mps) {
    out.push({ t: "c", label: m.constituency, sub: `${m.state ?? ""} · ${m.name} (${m.party})`, href: `/constituency/${m.slug}`, h: [m.constituency, m.state, m.name, m.party].join(" ").toLowerCase() });
  }
  return out;
}

export function getDirectory(): DirectoryRow[] {
  return data.mps.map((m) => ({ slug: m.slug, constituency: m.constituency, state: m.state ?? "", mp: m.name, party: m.party, id: m.id, prs: m.prs?.slug ?? null }));
}

export interface Summary {
  seats: number;
  avgAssetsCr: number;
  withCasesPct: number;
  withCases: number;
  avgAttendance: number | null;
  topParties: { party: string; seats: number }[];
}

export function getSummary(): Summary {
  const mps = data.mps;
  const assets = mps.map((m) => m.assetsLakh).filter((v): v is number => v != null);
  const att = mps.map((m) => m.prs?.attendance).filter((v): v is number => v != null);
  const withCases = mps.filter((m) => m.cases > 0).length;
  const counts: Record<string, number> = {};
  for (const m of mps) counts[m.party] = (counts[m.party] ?? 0) + 1;
  return {
    seats: mps.length,
    avgAssetsCr: Math.round(assets.reduce((a, b) => a + b, 0) / assets.length / 100 * 10) / 10,
    withCasesPct: Math.round((withCases / mps.length) * 100),
    withCases,
    avgAttendance: att.length ? Math.round(att.reduce((a, b) => a + b, 0) / att.length) : null,
    topParties: Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([party, seats]) => ({ party, seats })),
  };
}
