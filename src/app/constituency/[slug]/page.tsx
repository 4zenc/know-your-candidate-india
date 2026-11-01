import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, Progress, ProjectBadge, SectionTitle } from "@/components/ui";
import { MpladsChart } from "@/components/charts";
import { ComparisonMatrix } from "@/components/ComparisonMatrix";
import { SourceVerification } from "@/components/SourceVerification";
import { ShareReportCard } from "@/components/ShareReportCard";
import { T } from "@/i18n/provider";
import { getCandidate, getCandidatesFor, getConstituencies, getConstituency, utilisationPct } from "@/lib/data-service";
import { formatINR, formatNumber } from "@/lib/utils";

export const generateStaticParams = () => getConstituencies().map((c) => ({ slug: c.slug }));

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = getConstituency(params.slug);
  return { title: c ? `${c.name}, ${c.state}` : "Constituency" };
}

export default function ConstituencyPage({ params }: { params: { slug: string } }) {
  const c = getConstituency(params.slug);
  if (!c) notFound();
  const cands = getCandidatesFor(c.slug);
  const mp = getCandidate(c.sittingMp.candidateId);
  const util = utilisationPct(c);
  const releasedPct = Math.round((c.mplads.released / c.mplads.allocated) * 100);
  const clean = cands.filter((k) => !k.cases.serious.length && !k.cases.other.length).length;
  const summary = `${c.name} (${c.state}) report card — MPLADS utilised ${util}%, MP attendance ${c.sittingMp.attendancePct}%, ${clean}/${cands.length} candidates with clean records. Verify at myneta.info`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">{c.state} · {c.type} · {formatNumber(c.electors)}</p>
          <h1 className="text-4xl font-semibold tracking-tight">{c.name}</h1>
          <p className="mt-1 text-xs text-muted">PIN: {c.pins.join(", ")}</p>
        </div>
        <ShareReportCard
          heading={c.name}
          sub={c.state}
          path={`/constituency/${c.slug}`}
          summary={summary}
          stats={[
            { label: "MPLADS used", value: `${util}%` },
            { label: "MP attendance", value: `${c.sittingMp.attendancePct}%` },
            { label: "Clean records", value: `${clean}/${cands.length}` },
            { label: "Projects done", value: `${c.projects.filter((p) => p.status === "Completed").length}/${c.projects.length}` },
          ]}
        />
      </div>

      {mp && (
        <Card>
          <SectionTitle>Sitting MP performance</SectionTitle>
          <div className="mb-5 flex items-baseline gap-3">
            <Link href={`/candidate/${mp.id}`} className="text-xl font-medium underline-offset-4 hover:underline">{mp.name}</Link>
            <span className="text-sm text-muted">{mp.party}</span>
          </div>
          <div className="grid gap-6 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted"><T k="attendance" /></p>
              <p className="mt-1 text-3xl font-semibold">{c.sittingMp.attendancePct}%</p>
              <div className="mt-2"><Progress value={c.sittingMp.attendancePct} label="attendance" /></div>
            </div>
            <div><p className="text-xs uppercase tracking-wider text-muted"><T k="debates" /></p><p className="mt-1 text-3xl font-semibold">{c.sittingMp.debates}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-muted"><T k="questions" /></p><p className="mt-1 text-3xl font-semibold">{c.sittingMp.questions}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-muted">Private bills</p><p className="mt-1 text-3xl font-semibold">{c.sittingMp.privateBills}</p></div>
          </div>
        </Card>
      )}

      <Card>
        <SectionTitle>MPLADS budget tracker</SectionTitle>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            {([["allocated", c.mplads.allocated, 100], ["released", c.mplads.released, releasedPct], ["utilized", c.mplads.utilized, util]] as const).map(([k, v, pct]) => (
              <div key={k}>
                <div className="mb-1 flex justify-between text-sm"><span className="text-muted"><T k={k} /></span><span>{formatINR(v)} <span className="text-muted">({pct}%)</span></span></div>
                <Progress value={pct} label={k} tone={k === "utilized" ? "light" : "dim"} />
              </div>
            ))}
          </div>
          <MpladsChart {...c.mplads} />
        </div>
        <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted">Local infrastructure projects</h3>
        <ul className="divide-y divide-line">
          {c.projects.map((p) => (
            <li key={p.title} className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><p className="text-sm">{p.title}</p><p className="text-xs text-muted">{p.category} · {formatINR(p.costLakh)}</p></div>
                <ProjectBadge status={p.status} />
              </div>
              <div className="mt-2"><Progress value={p.completionPct} label={p.title} tone={p.completionPct === 100 ? "light" : "dim"} /></div>
            </li>
          ))}
        </ul>
      </Card>

      <ComparisonMatrix candidates={cands} />
      <SourceVerification />
    </div>
  );
}
