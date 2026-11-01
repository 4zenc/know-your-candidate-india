#!/usr/bin/env python3
"""
scraper_myneta.py — ingest candidate summary rows from an ADR/MyNeta election page.

Usage:
    python scripts/scraper_myneta.py --url "https://myneta.info/<election>/index.php?action=show_candidates&constituency_id=<id>" \
        --constituency-slug mumbai-south --out scripts/out/mumbai-south.json

The output matches the `Candidate` shape in src/lib/types.ts (money in ₹ lakh) and can be
merged into src/data/constituencies.json or loaded into the Prisma/Postgres schema.

Be polite: respect robots.txt and ADR's terms of use, throttle requests, and always keep
the source URL on every record so the UI can link to primary sources.
Requires: pip install requests beautifulsoup4
"""
from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "civic-transparency-bot/0.1 (research; contact: you@example.org)"}
RUPEE_RE = re.compile(r"Rs\s*([\d,]+)")


def rupees_to_lakh(text: str) -> float:
    """'Rs 1,23,45,678 ~ 1 Crore+' -> lakh (float). Returns 0 when absent."""
    m = RUPEE_RE.search(text or "")
    if not m:
        return 0.0
    return round(int(m.group(1).replace(",", "")) / 100_000, 2)


def fetch(url: str) -> BeautifulSoup:
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def parse_candidates(soup: BeautifulSoup, constituency_slug: str, source_url: str) -> list[dict]:
    """Parse the candidate table. Column layout varies by election; adjust the indexes if needed."""
    rows = []
    for tr in soup.select("table tr"):
        cells = [td.get_text(" ", strip=True) for td in tr.find_all("td")]
        if len(cells) < 7 or not cells[0].isdigit():
            continue
        _, name, party, criminal_cases, education, age, assets, liabilities = (cells + [""] * 8)[:8]
        total_assets = rupees_to_lakh(assets)
        liab = rupees_to_lakh(liabilities)
        rows.append(
            {
                "name": name,
                "party": party,
                "constituency": constituency_slug,
                "age": int(age) if age.isdigit() else None,
                "education": education,
                "criminalCaseCount": int(criminal_cases) if criminal_cases.isdigit() else 0,
                # MyNeta's table only shows totals; split movable/immovable from the detail page.
                "assets": {"movable": total_assets, "immovable": 0.0},
                "liabilities": liab,
                "netWorth": round(total_assets - liab, 2),
                "source": {"label": "ADR / MyNeta", "url": source_url},
            }
        )
    return rows


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--url", required=True)
    ap.add_argument("--constituency-slug", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    soup = fetch(args.url)
    candidates = parse_candidates(soup, args.constituency_slug, args.url)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(candidates, indent=2, ensure_ascii=False))
    print(f"Wrote {len(candidates)} candidates to {out}")
    time.sleep(1)  # throttle between runs when scripted in a loop


if __name__ == "__main__":
    main()
