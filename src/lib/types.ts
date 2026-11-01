export type PromiseStatus = "Fulfilled" | "In Progress" | "Stalled" | "Broken";
export type ProjectStatus = "Completed" | "In Progress" | "Sanctioned" | "Delayed" | "Stalled";

export interface SourceLink {
  label: string;
  url: string;
}

export interface CaseRecord {
  section: string;
  description: string;
}

export interface Promise_ {
  id: string;
  text: string;
  status: PromiseStatus;
  source: SourceLink;
}

/** All monetary values are in ₹ lakh (1 crore = 100 lakh). */
export interface Candidate {
  id: string;
  name: string;
  party: string;
  constituency: string;
  age: number;
  education: string;
  incumbent: boolean;
  assets: { movable: number; immovable: number };
  liabilities: number;
  netWorth: number;
  assetGrowthPct: number;
  wealthHistory: { year: number; netWorth: number }[];
  cases: { serious: CaseRecord[]; other: CaseRecord[] };
  promises: Promise_[];
}

export interface Project {
  title: string;
  category: string;
  costLakh: number;
  status: ProjectStatus;
  completionPct: number;
}

export interface Constituency {
  slug: string;
  name: string;
  state: string;
  type: string;
  pins: string[];
  electors: number;
  sittingMp: { candidateId: string; attendancePct: number; debates: number; questions: number; privateBills: number };
  mplads: { allocated: number; released: number; utilized: number };
  projects: Project[];
  candidateIds: string[];
}

export interface Dataset {
  disclaimer: string;
  sources: SourceLink[];
  constituencies: Constituency[];
  candidates: Candidate[];
}

export interface SearchEntry {
  type: "constituency" | "candidate";
  label: string;
  sub: string;
  href: string;
  haystack: string;
}
