import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AffidavitPanel, ByElectionNotice, PrsPanel, ResultLine, Verification } from "@/components/MpBlocks";
import { ShareReportCard } from "@/components/ShareReportCard";
import { getMPById, getMPs } from "@/lib/data-service";
import { formatINR } from "@/lib/utils";

export const generateStaticParams = () => getMPs().map((m) => ({ id: m.id }));

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const m = getMPById(params.id);
  return { title: m ? `${m.name} (${m.party}), ${m.constituency}` : "MP" };
}

export default function CandidatePage({ params }: { params: { id: string } }) {
  const mp = getMPById(params.id);
  if (!mp) notFound();
  const summary = `${mp.name} (${mp.party}), MP for ${mp.constituency}: declared assets ${mp.assetsLakh != null ? formatINR(mp.assetsLakh) : "n/a"}, ${mp.cases} declared case(s)${mp.prs?.attendance != null ? `, ${mp.prs.attendance}% attendance` : ""}. Check the originals: myneta.info / prsindia.org`;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href={`/constituency/${mp.slug}`} className="text-xs uppercase tracking-wider text-muted hover:text-foreground">← {mp.constituency}, {mp.state}</Link>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight">{mp.name}</h1>
          <p className="text-muted">{mp.party}{mp.age ? ` · ${mp.age}` : ""} · {mp.education}</p>
          <div className="mt-1"><ResultLine mp={mp} /></div>
        </div>
        <ShareReportCard
          heading={mp.name}
          sub={`${mp.party} · ${mp.constituency}`}
          path={`/candidate/${mp.id}`}
          summary={summary}
          stats={[
            { label: "Declared assets", value: mp.assetsLakh != null ? formatINR(mp.assetsLakh) : "—" },
            { label: "Liabilities", value: mp.liabilitiesLakh != null ? formatINR(mp.liabilitiesLakh) : "—" },
            { label: "Declared cases", value: String(mp.cases) },
            { label: "Attendance", value: mp.prs?.attendance != null ? `${mp.prs.attendance}%` : "—" },
          ]}
        />
      </div>
      <ByElectionNotice mp={mp} />
      <AffidavitPanel mp={mp} />
      <PrsPanel mp={mp} />
      <Verification mp={mp} />
    </div>
  );
}
