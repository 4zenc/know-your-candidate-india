import { ExternalLink, ShieldCheck } from "lucide-react";
import type { MP } from "@/lib/types";
import { verificationLinks } from "@/lib/links";
import { formatINR, formatNumber } from "@/lib/utils";
import { T } from "@/i18n/provider";
import { AssetsDonut, AssetsHistoryChart } from "./charts";
import { Card, Progress, SectionTitle } from "./ui";

export function Verification({ mp }: { mp: MP }) {
  return (
    <Card className="border-zinc-600">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" /><T k="verify" /></div>
      <p className="mb-4 text-sm text-muted">Figures are copied from the sources below. Open the original before you rely on or share any number.</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {verificationLinks(mp).map((s) => (
          <li key={s.url + s.label}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:border-zinc-500">
              {s.label} <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Stat({ label, value, sub }: { label: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export function PrsPanel({ mp }: { mp: MP }) {
  const p = mp.prs;
  return (
    <Card>
      <SectionTitle>Parliament performance (PRS)</SectionTitle>
      {!p ? (
        <p className="text-sm text-muted">PRS has no matching record for this MP (for example if the seat changed hands since 2024). See PRS MP Track directly.</p>
      ) : p.attendance == null ? (
        <p className="text-sm text-muted">PRS does not publish attendance or question counts for this member (for example Ministers, the Prime Minister and the Speaker).</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-4">
            <div>
              <Stat label={<T k="attendance" />} value={p.attendance != null ? `${p.attendance}%` : "—"} sub={p.attendance_nat != null ? `National avg ${p.attendance_nat}%` : undefined} />
              {p.attendance != null && <div className="mt-2"><Progress value={p.attendance} label="attendance" /></div>}
            </div>
            <Stat label={<T k="debates" />} value={p.debates ?? "—"} sub={p.debates_nat != null ? `National avg ${p.debates_nat}` : undefined} />
            <Stat label={<T k="questions" />} value={p.questions ?? "—"} sub={p.questions_nat != null ? `National avg ${p.questions_nat}` : undefined} />
            <Stat label="Private bills" value={p.private_bills ?? "—"} />
          </div>
          {p.period && <p className="mt-4 text-xs text-zinc-500">{p.period}</p>}
        </>
      )}
    </Card>
  );
}

export function AffidavitPanel({ mp }: { mp: MP }) {
  const history = [...mp.priorAssets].reverse().filter((x) => x.assetsLakh != null).map((x) => ({ label: x.election.replace(/^Loksabha|^Lok Sabha/i, "LS").trim(), lakh: x.assetsLakh as number }));
  if (mp.assetsLakh != null) history.push({ label: "LS 2024", lakh: mp.assetsLakh });
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><Stat label={<T k="netWorth" />} value={mp.netWorthLakh != null ? formatINR(mp.netWorthLakh) : "—"} sub="Assets minus liabilities, 2024 affidavit" /></Card>
        <Card><Stat label="Declared assets" value={mp.assetsLakh != null ? formatINR(mp.assetsLakh) : "—"} /></Card>
        <Card><Stat label={<T k="liabilities" />} value={mp.liabilitiesLakh != null ? formatINR(mp.liabilitiesLakh) : "—"} /></Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>Form 26 — movable vs immovable</SectionTitle>
          {mp.movableLakh != null && mp.immovableLakh != null ? (
            <AssetsDonut movable={mp.movableLakh} immovable={Math.max(mp.immovableLakh, 0)} labels={["Movable", "Immovable"]} />
          ) : <p className="text-sm text-muted">Breakdown not available.</p>}
        </Card>
        <Card>
          <SectionTitle>Declared assets by election</SectionTitle>
          {history.length > 1 ? <AssetsHistoryChart data={history} /> : <p className="text-sm text-muted">No earlier affidavit on record.</p>}
        </Card>
      </div>
      <Card>
        <SectionTitle><T k="criminal" /></SectionTitle>
        <p className="text-sm">
          <span className="text-2xl font-semibold">{mp.cases}</span> <span className="text-muted">declared case{mp.cases === 1 ? "" : "s"}</span>
        </p>
        {mp.caseSummaries.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {mp.caseSummaries.map((c, i) => <li key={i}>• {c}</li>)}
          </ul>
        )}
        <p className="mt-4 text-xs text-zinc-500">As declared by the candidate in the 2024 affidavit. A pending case is an allegation, not a finding of guilt. Case status may have changed since.</p>
      </Card>
    </>
  );
}

export function ResultLine({ mp }: { mp: MP }) {
  if (mp.margin == null) return null;
  return (
    <p className="text-sm text-muted">
      Won by <span className="text-foreground">{formatNumber(mp.margin)}</span> votes
      {mp.votes != null && <> ({formatNumber(mp.votes)}{mp.voteShare != null ? `, ${mp.voteShare}%` : ""})</>}
      {mp.runnerUp && <> · runner-up {mp.runnerUp.name} ({mp.runnerUp.party})</>}
    </p>
  );
}

export function ByElectionNotice({ mp }: { mp: MP }) {
  const b = mp.byElection;
  if (!b) return null;
  return (
    <div className="rounded-xl border border-zinc-500 bg-surface p-4 text-sm">
      <p className="font-medium">Seat changed after the 2024 general election</p>
      <p className="mt-1 text-muted">
        A by-election{b.date ? ` on ${b.date}` : ""} was won by <span className="text-foreground">{b.name}</span> ({b.party}). Declared assets {b.assetsLakh != null ? formatINR(b.assetsLakh) : "—"}, {b.cases} declared case{b.cases === 1 ? "" : "s"}.{" "}
        <a className="underline" target="_blank" rel="noopener noreferrer" href={`https://www.myneta.info/LokSabha2024/candidate.php?candidate_id=${b.id}`}>MyNeta</a>
        {b.prsSlug && <> · <a className="underline" target="_blank" rel="noopener noreferrer" href={`https://prsindia.org/mptrack/18th-lok-sabha/${b.prsSlug}`}>PRS</a></>}
        . The figures below are for the 2024 general-election winner.
      </p>
    </div>
  );
}
