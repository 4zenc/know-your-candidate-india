import type { Metadata } from "next";
import { RtiForm } from "@/components/RtiForm";
import { getMPs } from "@/lib/data-service";

export const metadata: Metadata = { title: "RTI application generator" };

export default function RtiPage({ searchParams }: { searchParams: { c?: string } }) {
  const places = getMPs().map((m) => ({ slug: m.slug, name: m.constituency, state: m.state ?? "" })).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">RTI application generator</h1>
      <p className="mb-8 mt-2 max-w-2xl text-sm text-muted">Pick your constituency and a local issue. You get a Section 6(1) Right to Information application you can edit, copy, save as PDF, and file.</p>
      <RtiForm places={places} initial={searchParams.c} />
    </div>
  );
}
