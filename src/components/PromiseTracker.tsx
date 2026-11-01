import { ExternalLink } from "lucide-react";
import type { Promise_ } from "@/lib/types";
import { T } from "@/i18n/provider";
import { Card, PromiseBadge, SectionTitle } from "./ui";

export function PromiseTracker({ promises }: { promises: Promise_[] }) {
  return (
    <Card>
      <SectionTitle><T k="promises" /></SectionTitle>
      <ul className="divide-y divide-line">
        {promises.map((p) => (
          <li key={p.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <p className="text-sm">{p.text}</p>
              <a href={p.source.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-muted hover:text-foreground">
                {p.source.label} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <PromiseBadge status={p.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
