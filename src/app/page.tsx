import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Card, Progress, SectionTitle } from "@/components/ui";
import { T } from "@/i18n/provider";
import { getFeatured, getMeta, getSummary } from "@/lib/data-service";

export default function Home() {
  const s = getSummary();
  const meta = getMeta();
  return (
    <div className="space-y-12">
      <Hero />
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs uppercase tracking-wider text-muted"><T k="constituencies" /></p><p className="mt-3 text-5xl font-semibold">{s.seats}</p><p className="mt-1 text-xs text-muted">{meta.election}</p></Card>
        <Card><p className="text-xs uppercase tracking-wider text-muted">Average declared assets</p><p className="mt-3 text-5xl font-semibold">₹{s.avgAssetsCr} Cr</p><p className="mt-1 text-xs text-muted">per MP, 2024 affidavits</p></Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-muted">MPs with declared cases</p>
          <p className="mt-3 text-5xl font-semibold">{s.withCasesPct}%</p>
          <div className="mt-3"><Progress value={s.withCasesPct} label="MPs with declared cases" /></div>
          <p className="mt-1 text-xs text-muted">{s.withCases} of {s.seats}</p>
        </Card>
        <Card><p className="text-xs uppercase tracking-wider text-muted"><T k="attendance" /></p><p className="mt-3 text-5xl font-semibold">{s.avgAttendance ?? "—"}%</p><p className="mt-1 text-xs text-muted">average across MPs (PRS)</p></Card>
      </div>
      <section>
        <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted">
          {s.topParties.map((p) => <span key={p.party} className="rounded-full border border-line px-3 py-1">{p.party} · {p.seats}</span>)}
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <SectionTitle><T k="explore" /></SectionTitle>
          <Link href="/directory" className="mb-4 text-sm text-muted underline underline-offset-4 hover:text-foreground"><T k="directory" /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {getFeatured().map((m) => (
            <Link key={m.slug} href={`/constituency/${m.slug}`} className="group rounded-xl border border-line bg-surface p-5 transition hover:border-zinc-500">
              <div className="flex items-start justify-between">
                <div><h3 className="text-lg font-medium">{m.constituency}</h3><p className="text-xs text-muted">{m.state}</p></div>
                <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-foreground" />
              </div>
              <p className="mt-3 text-sm">{m.name} <span className="text-muted">· {m.party}</span></p>
              <p className="mt-1 text-xs text-muted">{m.cases} declared case{m.cases === 1 ? "" : "s"}{m.prs?.attendance != null ? ` · ${m.prs.attendance}% attendance` : ""}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
