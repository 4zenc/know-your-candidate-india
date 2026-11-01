import { cn } from "@/lib/utils";

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
