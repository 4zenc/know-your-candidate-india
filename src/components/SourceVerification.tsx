import { ExternalLink, ShieldCheck } from "lucide-react";
import { T } from "@/i18n/provider";
import { getSources } from "@/lib/data-service";
import { Card } from "./ui";

export function SourceVerification() {
  return (
    <Card className="border-zinc-600">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="h-4 w-4" />
        <T k="verify" />
      </div>
      <p className="mb-4 text-sm text-muted">
        Figures here are summaries. Verify every number against the original Form 26 affidavit and official portals before sharing or voting.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {getSources().map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm hover:border-zinc-500">
              {s.label} <ExternalLink className="h-3.5 w-3.5 text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
