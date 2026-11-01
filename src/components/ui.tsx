import { cn } from "@/lib/utils";
import type { PromiseStatus, ProjectStatus } from "@/lib/types";
import type { TKey } from "@/i18n/translations";
import { T } from "@/i18n/provider";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-xl border border-line bg-surface p-5", className)}>{children}</section>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">{children}</h2>;
}

export function Progress({ value, label, tone = "light" }: { value: number; label?: string; tone?: "light" | "dim" }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div className={cn("h-full rounded-full", tone === "light" ? "bg-foreground" : "bg-zinc-500")} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

const PROMISE: Record<PromiseStatus, { key: TKey; cls: string; mark: string }> = {
  Fulfilled: { key: "fulfilled", cls: "border-zinc-200 bg-zinc-100 text-zinc-900", mark: "✓" },
  "In Progress": { key: "inProgress", cls: "border-zinc-500 text-zinc-200", mark: "◐" },
  Stalled: { key: "stalled", cls: "border-zinc-600 border-dashed text-zinc-400", mark: "‖" },
  Broken: { key: "broken", cls: "border-zinc-600 text-zinc-500 line-through decoration-zinc-500", mark: "✕" },
};

export function PromiseBadge({ status }: { status: PromiseStatus }) {
  const s = PROMISE[status];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", s.cls)}>
      <span aria-hidden>{s.mark}</span>
      <T k={s.key} />
    </span>
  );
}

export function ProjectBadge({ status }: { status: ProjectStatus }) {
  const dim = status === "Delayed" || status === "Stalled";
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-xs", dim ? "border-zinc-600 border-dashed text-zinc-400" : "border-zinc-500 text-zinc-200")}>
      {status}
    </span>
  );
}
