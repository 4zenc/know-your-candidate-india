"use client";

import { useI18n } from "@/i18n/provider";
import type { NationalSummary } from "@/lib/data-service";
import { Progress } from "./ui";

export function StatCards({ s }: { s: NationalSummary }) {
  const { t } = useI18n();
  const cleanPct = Math.round((s.cleanCount / s.candidates) * 100);
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="rounded-xl border border-line bg-surface p-5 md:col-span-1">
        <p className="text-xs uppercase tracking-wider text-muted">{t("constituencies")}</p>
        <p className="mt-3 text-5xl font-semibold">{s.constituencies}</p>
        <p className="mt-1 text-xs text-muted">{s.candidates} candidates</p>
      </div>
      <div className="rounded-xl border border-line bg-surface p-5 md:col-span-1">
        <p className="text-xs uppercase tracking-wider text-muted">{t("assetGrowth")}</p>
        <p className="mt-3 text-5xl font-semibold">+{s.avgAssetGrowth}%</p>
        <p className="mt-1 text-xs text-muted">2019 → 2024</p>
      </div>
      <div className="rounded-xl border border-line bg-surface p-5 md:col-span-2">
        <p className="text-xs uppercase tracking-wider text-muted">{t("mplads")}</p>
        <p className="mt-3 text-5xl font-semibold">{s.avgMpladsUtilisation}%</p>
        <div className="mt-4"><Progress value={s.avgMpladsUtilisation} label={t("mplads")} /></div>
      </div>
      <div className="rounded-xl border border-line bg-surface p-5 md:col-span-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex gap-10">
            <div><p className="text-xs uppercase tracking-wider text-muted">{t("clean")}</p><p className="mt-2 text-4xl font-semibold">{s.cleanCount}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-muted">{t("criminal")}</p><p className="mt-2 text-4xl font-semibold text-zinc-400">{s.criminalCount}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-muted">{t("serious")}</p><p className="mt-2 text-4xl font-semibold text-zinc-400">{s.seriousCount}</p></div>
          </div>
          <div className="w-full max-w-sm">
            <div className="mb-1 flex justify-between text-xs text-muted"><span>{t("clean")}</span><span>{cleanPct}%</span></div>
            <Progress value={cleanPct} label={t("clean")} />
          </div>
        </div>
      </div>
    </div>
  );
}
