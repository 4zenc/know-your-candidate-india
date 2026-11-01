import { Suspense } from "react";
import type { Metadata } from "next";
import { CompareTool, type CompareRow } from "@/components/CompareTool";
import { getMPs } from "@/lib/data-service";

export const metadata: Metadata = { title: "Compare MPs" };

export default function ComparePage() {
  const rows: CompareRow[] = getMPs().map((m) => ({
    id: m.id, name: m.name, party: m.party, constituency: m.constituency, state: m.state ?? "", education: m.education,
    assets: m.assetsLakh, liabilities: m.liabilitiesLakh, net: m.netWorthLakh, cases: m.cases,
    attendance: m.prs?.attendance ?? null, questions: m.prs?.questions ?? null, debates: m.prs?.debates ?? null, prs: m.prs?.slug ?? null,
  }));
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Compare two MPs</h1>
      <p className="mb-8 mt-2 text-sm text-muted">Side-by-side declared wealth, criminal cases and parliament record. Figures come from affidavits and PRS; open the originals to verify.</p>
      <Suspense><CompareTool rows={rows} /></Suspense>
    </div>
  );
}
