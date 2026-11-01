import type { Metadata } from "next";
import { Directory } from "@/components/Directory";
import { getDirectory } from "@/lib/data-service";

export const metadata: Metadata = { title: "All 543 MPs" };

export default function DirectoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">All Lok Sabha constituencies</h1>
      <p className="mb-6 mt-2 text-sm text-muted">Winners of the 2024 general election. If a seat has changed hands since (by-election or resignation), PRS and Sansad show the current member.</p>
      <Directory rows={getDirectory()} />
    </div>
  );
}
