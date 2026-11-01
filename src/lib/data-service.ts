import raw from "@/data/constituencies.json";
import type { Candidate, Constituency, Dataset, SearchEntry } from "./types";

const data = raw as unknown as Dataset;

export const getDisclaimer = () => data.disclaimer;
export const getSources = () => data.sources;
export const getConstituencies = (): Constituency[] => data.constituencies;
export const getCandidates = (): Candidate[] => data.candidates;

export const getConstituency = (slug: string) => data.constituencies.find((c) => c.slug === slug);
export const getCandidate = (id: string) => data.candidates.find((c) => c.id === id);
export const getCandidatesFor = (slug: string) => data.candidates.filter((c) => c.constituency === slug);

export function getSearchIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const c of data.constituencies) {
    entries.push({
      type: "constituency",
      label: c.name,
      sub: c.state,
      href: `/constituency/${c.slug}`,
      haystack: [c.name, c.state, ...c.pins].join(" ").toLowerCase(),
    });
  }
  for (const k of data.candidates) {
    const c = getConstituency(k.constituency);
    entries.push({
      type: "candidate",
      label: k.name,
      sub: `${k.party} · ${c?.name ?? ""}`,
      href: `/candidate/${k.id}`,
      haystack: [k.name, k.party, c?.name, c?.state].join(" ").toLowerCase(),
    });
  }
  return entries;
}

export interface NationalSummary {
  constituencies: number;
  candidates: number;
  avgAssetGrowth: number;
  avgMpladsUtilisation: number;
  cleanCount: number;
  criminalCount: number;
  seriousCount: number;
}

export function getNationalSummary(): NationalSummary {
  const cs = data.constituencies;
  const ks = data.candidates;
  const criminal = ks.filter((k) => k.cases.serious.length + k.cases.other.length > 0);
  return {
    constituencies: cs.length,
    candidates: ks.length,
    avgAssetGrowth: Math.round(ks.reduce((s, k) => s + k.assetGrowthPct, 0) / ks.length),
    avgMpladsUtilisation: Math.round(cs.reduce((s, c) => s + utilisationPct(c), 0) / cs.length),
    cleanCount: ks.length - criminal.length,
    criminalCount: criminal.length,
    seriousCount: ks.filter((k) => k.cases.serious.length > 0).length,
  };
}

export const utilisationPct = (c: Constituency) => Math.round((c.mplads.utilized / c.mplads.allocated) * 100);
