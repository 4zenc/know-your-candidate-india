import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";
import { AffidavitPanel, ByElectionNotice, PrsPanel, ResultLine, Verification } from "@/components/MpBlocks";
import { ShareReportCard } from "@/components/ShareReportCard";
import { T } from "@/i18n/provider";
import { getMPBySlug, getMPs, isFeatured } from "@/lib/data-service";
import { formatINR } from "@/lib/utils";

export const generateStaticParams = () => getMPs().map((m) => ({ slug: m.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const m = getMPBySlug(params.slug);
  return { title: m ? `${m.constituency} — ${m.name} (${m.party})` : "Constituency" };
}

export default function ConstituencyPage({ params }: { params: { slug: string } }) {
  const mp = getMPBySlug(params.slug);
  if (!mp) notFound();
  const ru = mp.runnerUp;
  const featured = isFeatured(mp.slug);
  const rows: [React.ReactNode, React.ReactNode, React.ReactNode][] = ru && ru.id ? [
    ["Party", mp.party, ru.party],
    [<T key="e" k="education" />, mp.education, ru.education ?? "—"],
    [<T key="n" k="netWorth" />, mp.netWorthLakh != null ? formatINR(mp.netWorthLakh) : "—", ru.netWorthLakh != null ? formatINR(ru.netWorthLakh) : "—"],
    [<T key="l" k="liabilities" />, mp.liabilitiesLakh != null ? formatINR(mp.liabilitiesLakh) : "—", ru.liabilitiesLakh != null ? formatINR(ru.liabilitiesLakh) : "—"],
    ["Declared cases", mp.cases, ru.cases ?? "—"],
    ["Votes", mp.votes?.toLocaleString("en-IN") ?? "—", ru.votes?.toLocaleString("en-IN") ?? "—"],
  ] : [];
  const summary = `${mp.constituency} (${mp.state}) — 2024 winner ${mp.name} (${mp.party}). Declared assets ${mp.assetsLakh != null ? formatINR(mp.assetsLakh) : "n/a"}, ${mp.cases} declared case(s)${mp.prs?.attendance != null ? `, ${mp.prs.attendance}% attendance` : ""}. Check the originals: myneta.info / prsindia.org`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">{mp.state}{mp.reserved ? ` · Reserved (${mp.reserved})` : ""} · Lok Sabha</p>
          <h1 className="text-4xl font-semibold tracking-tight">{mp.constituency}</h1>
          <p className="mt-2 text-lg">
            <Link href={`/candidate/${mp.id}`} className="underline-offset-4 hover:underline">{mp.name}</Link> <span className="text-muted">· {mp.party} · 2024 winner</span>
          </p>
          <div className="mt-1"><ResultLine mp={mp} /></div>
        </div>
        <ShareReportCard
          heading={mp.constituency}
          sub={`${mp.name} · ${mp.party}`}
          path={`/constituency/${mp.slug}`}
          summary={summary}
          stats={[
            { label: "Declared assets", value: mp.assetsLakh != null ? formatINR(mp.assetsLakh) : "—" },
            { label: "Declared cases", value: String(mp.cases) },
            { label: "Attendance", value: mp.prs?.attendance != null ? `${mp.prs.attendance}%` : "—" },
            { label: "Questions", value: mp.prs?.questions != null ? String(mp.prs.questions) : "—" },
          ]}
        />
      </div>
      <p className="text-xs text-zinc-500">Shows the winner of the 2024 general election. If the seat changed through a by-election or resignation, PRS and Sansad list the current member.</p>

      <ByElectionNotice mp={mp} />
      <PrsPanel mp={mp} />

      {featured && rows.length > 0 && ru && (
        <Card>
          <SectionTitle><T k="compare" /> — winner vs runner-up</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead><tr className="border-b border-line text-left"><th className="w-40 py-3 pr-4" /><th className="py-3 pr-4 font-medium">{mp.name} <span className="text-xs font-normal text-muted">Winner</span></th><th className="py-3 pr-4 font-medium">{ru.name} <span className="text-xs font-normal text-muted">Runner-up</span></th></tr></thead>
              <tbody>
                {rows.map(([label, a, b], i) => (
                  <tr key={i} className="border-b border-line/60 last:border-0"><th scope="row" className="py-3 pr-4 text-left font-normal text-muted">{label}</th><td className="py-3 pr-4">{a}</td><td className="py-3 pr-4">{b}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {ru.id && <a className="mt-3 inline-block text-xs text-muted underline underline-offset-4 hover:text-foreground" target="_blank" rel="noopener noreferrer" href={`https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=${ru.id}`}>Runner-up affidavit on MyNeta</a>}
        </Card>
      )}

      <AffidavitPanel mp={mp} />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-medium"><FileText className="h-4 w-4" /> Ask for local accountability</h2>
            <p className="mt-1 text-sm text-muted">Unspent MPLADS funds, roads, water, hospitals — generate a ready-to-file RTI application for {mp.constituency}.</p>
          </div>
          <Link href={`/tools/rti-generator?c=${mp.slug}`} className="inline-flex h-10 items-center rounded-lg border border-zinc-500 px-4 text-sm hover:bg-zinc-800">Create RTI draft</Link>
        </div>
      </Card>

      <Verification mp={mp} />
    </div>
  );
}
