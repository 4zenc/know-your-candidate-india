# Know Your MP — 18th Lok Sabha (2024)

Dark-mode, non-partisan Next.js app for all 543 Lok Sabha constituencies: the 2024 winner, margin and runner-up,
declared assets/liabilities/criminal cases from the candidate's affidavit, parliamentary attendance/debates/questions,
and links to the original sources. Also: MP comparison, and an RTI (Section 6(1)) application generator.

## Data (all copied from public sources, nothing estimated)
| What | Source |
|---|---|
| Winners, party, education, assets, liabilities, declared cases, past-election assets | ADR / MyNeta — myneta.info/LokSabha2024 |
| Votes, margin, runner-up | Wikipedia — Results of the 2024 Indian general election |
| Attendance, debates, questions | PRS MP Track — prsindia.org/mptrack |

Rebuild: `python scripts/build_dataset.py` (needs `requests beautifulsoup4 lxml`; responses are cached, requests throttled)
→ writes `src/data/lok-sabha.json`.

Not included because no clean public dataset was available: MPLADS project-level data, manifesto-promise tracking, PIN-code → constituency mapping.

## Run
```bash
npm install
npm run dev
npm run build
```

## Layout
- `src/lib/data-service.ts` — typed data layer · `prisma/schema.prisma` — Postgres schema for later scale
- `src/lib/rti.ts` — RTI letter templates (14 languages) · `src/components/RtiForm.tsx`
- `src/i18n/` — UI dictionary (English + 22 languages; Bodo, Manipuri, Santali and most Kashmiri still fall back to English), Bhashini/LLM hook
- `scripts/` — `build_dataset.py` (this dataset), `scraper_myneta.py`, `pdf_affidavit_parser.py` (affidavit PDF helper)
