import { Hero } from "@/components/Hero";
import { StatCards } from "@/components/StatCards";
import { Explorer, type ExplorerItem } from "@/components/Explorer";
import { T } from "@/i18n/provider";
import { SectionTitle } from "@/components/ui";
import { getCandidate, getCandidatesFor, getConstituencies, getNationalSummary, utilisationPct } from "@/lib/data-service";

export default function Home() {
  const items: ExplorerItem[] = getConstituencies().map((c) => {
    const mp = getCandidate(c.sittingMp.candidateId);
    const cands = getCandidatesFor(c.slug);
    return {
      c,
      mpName: mp?.name ?? "—",
      mpParty: mp?.party ?? "",
      utilisation: utilisationPct(c),
      clean: cands.filter((k) => k.cases.serious.length + k.cases.other.length === 0).length,
      total: cands.length,
    };
  });
  return (
    <div className="space-y-12">
      <Hero />
      <StatCards s={getNationalSummary()} />
      <section>
        <SectionTitle><T k="explore" /></SectionTitle>
        <Explorer items={items} />
      </section>
    </div>
  );
}
