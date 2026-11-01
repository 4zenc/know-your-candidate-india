import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Card, SectionTitle } from "@/components/ui";
import { AssetsDonut, WealthChart } from "@/components/charts";
import { PromiseTracker } from "@/components/PromiseTracker";
import { SourceVerification } from "@/components/SourceVerification";
import { ShareReportCard } from "@/components/ShareReportCard";
import { T } from "@/i18n/provider";
import { getCandidate, getCandidates, getConstituency } from "@/lib/data-service";
import { formatINR } from "@/lib/utils";

export const generateStaticParams = () => getCandidates().map((c) => ({ id: c.id }));

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const k = getCandidate(params.id);
  return { title: k ? `${k.name} (${k.party})` : "Candidate" };
}

export default function CandidatePage({ params }: { params: { id: string } }) {
  const k = getCandidate(params.id);
  if (!k) notFound();
  const c = getConstituency(k.constituency);
  const total = k.cases.serious.length + k.cases.other.length;
  const fulfilled = k.promises.filter((p) => p.status === "Fulfilled").length;
  const summary = `${k.name} (${k.party}), ${c?.name}: net worth ${formatINR(k.netWorth)}, ${total} declared case(s), ${fulfilled}/${k.promises.length} promises fulfilled. Verify at myneta.info`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {c && <Link href={`/constituency/${c.slug}`} className="text-xs uppercase tracking-wider text-muted hover:text-foreground">← {c.name}, {c.state}</Link>}
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">{k.name}</h1>
          <p className="text-muted">{k.party} · {k.age} · {k.education}{k.incumbent && " · Sitting MP"}</p>
        </div>
        <ShareReportCard
          heading={k.name}
          sub={`${k.party} · ${c?.name ?? ""}`}
          path={`/candidate/${k.id}`}
          summary={summary}
          stats={[
            { label: "Net worth", value: formatINR(k.netWorth) },
            { label: "Liabilities", value: formatINR(k.liabilities) },
            { label: "Declared cases", value: String(total) },
            { label: "Promises kept", value: `${fulfilled}/${k.promises.length}` },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-xs uppercase tracking-wider text-muted"><T k="netWorth" /></p><p className="mt-2 text-3xl font-semibold">{formatINR(k.netWorth)}</p></Card>
        <Card><p className="text-xs uppercase tracking-wider text-muted"><T k="liabilities" /></p><p className="mt-2 text-3xl font-semibold">{formatINR(k.liabilities)}</p></Card>
        <Card><p className="text-xs uppercase tracking-wider text-muted"><T k="assetGrowth" /></p><p className="mt-2 text-3xl font-semibold">+{k.assetGrowthPct}%</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Form 26 affidavit — assets</SectionTitle>
          <AssetsDonut movable={k.assets.movable} immovable={k.assets.immovable} labels={["Movable", "Immovable"]} />
        </Card>
        <Card>
          <SectionTitle>5-year wealth trajectory</SectionTitle>
          <WealthChart data={k.wealthHistory} />
        </Card>
      </div>

      <Card>
        <SectionTitle><T k="criminal" /></SectionTitle>
        {total === 0 ? (
          <p className="text-sm text-muted">No criminal cases declared in the affidavit.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {([["serious", k.cases.serious], ["Other cases", k.cases.other]] as const).map(([label, list]) => (
              <div key={label}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{label === "serious" ? <T k="serious" /> : label} ({list.length})</h3>
                {list.length === 0 ? <p className="text-sm text-zinc-500">None</p> : (
                  <ul className="space-y-2">{list.map((x) => <li key={x.section} className="text-sm"><span className="font-medium">{x.section}</span> <span className="text-muted">— {x.description}</span></li>)}</ul>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-zinc-500">A declared case is an allegation, not a conviction.</p>
      </Card>

      <PromiseTracker promises={k.promises} />
      <SourceVerification />
    </div>
  );
}
