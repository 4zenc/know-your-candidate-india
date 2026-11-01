import { getSearchIndex } from "@/lib/data-service";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getSearchIndex(), { headers: { "Cache-Control": "public, max-age=3600" } });
}
