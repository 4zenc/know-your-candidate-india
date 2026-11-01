# Know Your Candidate — Indian Civic Transparency

Non-partisan, dark-mode-first Next.js app that visualises candidate affidavits (Form 26), criminal disclosures,
MPLADS fund utilisation and manifesto-promise tracking for Indian constituencies, in English + all 22 scheduled languages.

> **Data notice:** the bundled dataset (`src/data/constituencies.json`) is *illustrative*. Constituencies are real;
> candidate names, parties, assets, cases and promises are fictional placeholders. Replace via the ingestion scripts before real use.

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind · Recharts · lucide-react

## Run
```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Layout
- `src/lib/data-service.ts` — typed data layer over the JSON (swap for Prisma later)
- `prisma/schema.prisma` — PostgreSQL/Supabase schema for scale
- `scripts/` — `scraper_myneta.py`, `pdf_affidavit_parser.py` (ingestion), `generate_seed.mjs` (regenerates the sample JSON)
- `src/i18n/` — dictionary (`translations.ts`), provider, and Bhashini/LLM dynamic-translation hook (`bhashini.ts`)

## Translations
Untranslated keys fall back to English. Bodo, Manipuri, Santali and most of Kashmiri are intentionally empty pending native-speaker review.
