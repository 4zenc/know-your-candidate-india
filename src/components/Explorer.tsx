"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Constituency } from "@/lib/types";
import { useI18n } from "@/i18n/provider";
import { Progress } from "./ui";
import { cn, formatNumber } from "@/lib/utils";

export interface ExplorerItem {
  c: Constituency;
  mpName: string;
  mpParty: string;
  utilisation: number;
  clean: number;
  total: number;
}

export function Explorer({ items }: { items: ExplorerItem[] }) {
  const { t } = useI18n();
  const states = useMemo(() => Array.from(new Set(items.map((i) => i.c.state))).sort(), [items]);
  const [state, setState] = useState<string | null>(null);
  const shown = items.filter((i) => !state || i.c.state === state);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {[null, ...states].map((s) => (
          <button key={s ?? "all"} onClick={() => setState(s)} className={cn("rounded-full border px-3 py-1 text-xs", state === s ? "border-foreground bg-foreground text-background" : "border-line text-muted hover:border-zinc-500")}>
            {s ?? "All"}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(({ c, mpName, mpParty, utilisation, clean, total }) => (
          <Link key={c.slug} href={`/constituency/${c.slug}`} className="group rounded-xl border border-line bg-surface p-5 transition hover:border-zinc-500">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">{c.name}</h3>
                <p className="text-xs text-muted">{c.state} · {formatNumber(c.electors)}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:text-foreground" />
            </div>
            <p className="mt-3 text-sm text-muted">{mpName} <span className="text-zinc-500">· {mpParty}</span></p>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted"><span>{t("mplads")}</span><span className="text-foreground">{utilisation}%</span></div>
                <Progress value={utilisation} label={t("mplads")} />
              </div>
              <div className="flex justify-between text-xs text-muted"><span>{t("clean")}</span><span className="text-foreground">{clean}/{total}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
