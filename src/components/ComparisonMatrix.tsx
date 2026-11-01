import Link from "next/link";
import type { Candidate } from "@/lib/types";
import { T } from "@/i18n/provider";
import { formatINR } from "@/lib/utils";
import { Card, SectionTitle } from "./ui";

export function ComparisonMatrix({ candidates }: { candidates: Candidate[] }) {
  const rows: { label: React.ReactNode; cell: (c: Candidate) => React.ReactNode }[] = [
    { label: "Party", cell: (c) => c.party },
    { label: <T k="education" />, cell: (c) => c.education },
    { label: "Age", cell: (c) => c.age },
    { label: <T k="netWorth" />, cell: (c) => <span className="font-medium">{formatINR(c.netWorth)}</span> },
    { label: <T k="liabilities" />, cell: (c) => formatINR(c.liabilities) },
    { label: <T k="assetGrowth" />, cell: (c) => `+${c.assetGrowthPct}%` },
    {
      label: <T k="serious" />,
      cell: (c) => (
        <div>
          <span className={c.cases.serious.length ? "font-semibold" : "text-muted"}>{c.cases.serious.length}</span>
          <div className="mt-1 text-xs text-muted">{c.cases.serious.map((x) => x.section).join(", ")}</div>
        </div>
      ),
    },
    {
      label: "Other cases",
      cell: (c) => (
        <div>
          <span className={c.cases.other.length ? "" : "text-muted"}>{c.cases.other.length}</span>
          <div className="mt-1 text-xs text-muted">{c.cases.other.map((x) => x.section).join(", ")}</div>
        </div>
      ),
    },
  ];
  return (
    <Card>
      <SectionTitle><T k="compare" /></SectionTitle>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="w-40 py-3 pr-4 font-normal text-muted" />
              {candidates.map((c) => (
                <th key={c.id} className="py-3 pr-4 align-top">
                  <Link href={`/candidate/${c.id}`} className="font-medium underline-offset-4 hover:underline">{c.name}</Link>
                  {c.incumbent && <span className="ml-2 rounded border border-line px-1.5 py-0.5 text-[10px] font-normal text-muted">Sitting MP</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-line/60 last:border-0">
                <th scope="row" className="py-3 pr-4 text-left align-top font-normal text-muted">{r.label}</th>
                {candidates.map((c) => <td key={c.id} className="py-3 pr-4 align-top">{r.cell(c)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
