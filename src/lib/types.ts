/** All money values are ₹ lakh (1 crore = 100 lakh). Source: self-declared 2024 affidavits via ADR/MyNeta. */
export interface PriorAsset {
  election: string;
  assetsLakh: number | null;
}

export interface PrsStats {
  slug: string;
  attendance: number | null;
  attendance_nat: number | null;
  debates: number | null;
  debates_nat: number | null;
  questions: number | null;
  questions_nat: number | null;
  private_bills: number | null;
  period: string | null;
}

export interface RunnerUp {
  name: string;
  party: string;
  votes: number | null;
  voteShare: number | null;
  id?: string | null;
  cases?: number;
  education?: string;
  assetsLakh?: number | null;
  liabilitiesLakh?: number | null;
  netWorthLakh?: number | null;
  caseSummaries?: string[];
  priorAssets?: PriorAsset[];
}

export interface ByElection {
  id: string;
  name: string;
  party: string;
  date: string | null;
  assetsLakh: number | null;
  liabilitiesLakh: number | null;
  cases: number;
  prsSlug: string | null;
}

export interface MP {
  id: string; // MyNeta candidate id
  name: string;
  party: string;
  constituency: string;
  slug: string;
  state: string | null;
  reserved: "SC" | "ST" | null;
  age: number | null;
  education: string;
  assetsLakh: number | null;
  liabilitiesLakh: number | null;
  netWorthLakh: number | null;
  movableLakh: number | null;
  immovableLakh: number | null;
  priorAssets: PriorAsset[];
  cases: number;
  caseSummaries: string[];
  votes: number | null;
  voteShare: number | null;
  margin: number | null;
  runnerUp: RunnerUp | null;
  prs: PrsStats | null;
  byElection?: ByElection;
}

export interface Dataset {
  generated: string;
  election: string;
  featured: string[];
  prsPeriod: string | null;
  mps: MP[];
}

export interface SearchEntry {
  t: "c" | "m";
  label: string;
  sub: string;
  href: string;
  h: string;
}

export interface DirectoryRow {
  slug: string;
  constituency: string;
  state: string;
  mp: string;
  party: string;
  id: string;
  prs: string | null;
}
