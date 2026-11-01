#!/usr/bin/env python3
"""
pdf_affidavit_parser.py — extract headline figures from a Form 26 affidavit PDF (ECI).

Usage:
    python scripts/pdf_affidavit_parser.py affidavit.pdf --candidate-id mh-1 --out scripts/out/mh-1.json

Extracts: movable assets, immovable assets, liabilities, and IPC/BNS sections listed in
the pending-cases part. Affidavits are scanned in many layouts, so every extracted value is
returned with the matched page number for human verification — never publish unverified.
Requires: pip install pdfplumber
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pdfplumber

AMOUNT = r"(?:Rs\.?|₹)\s*([\d,]+(?:\.\d+)?)"
PATTERNS = {
    "movable": re.compile(r"total\s+movable\s+assets.{0,80}?" + AMOUNT, re.I | re.S),
    "immovable": re.compile(r"total\s+immovable\s+assets.{0,80}?" + AMOUNT, re.I | re.S),
    "liabilities": re.compile(r"total\s+liabilit(?:y|ies).{0,80}?" + AMOUNT, re.I | re.S),
}
SECTION = re.compile(r"\b(?:IPC|BNS|Section)\s*(?:no\.?)?\s*(\d{2,3}[A-Z]?(?:/\d+)?)", re.I)
# Serious = punishable with 5+ years (ADR definition) — maintain from the statute, not this sample.
SERIOUS_SECTIONS = {"302", "307", "376", "420", "406", "468", "120B", "364", "395"}


def to_lakh(s: str) -> float:
    return round(float(s.replace(",", "")) / 100_000, 2)


def parse(path: Path) -> dict:
    found: dict[str, dict] = {}
    sections: dict[str, int] = {}
    with pdfplumber.open(path) as pdf:
        for page_no, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            for key, rx in PATTERNS.items():
                if key not in found and (m := rx.search(text)):
                    found[key] = {"lakh": to_lakh(m.group(1)), "page": page_no}
            for m in SECTION.finditer(text):
                sections.setdefault(m.group(1).upper(), page_no)
    return {
        "assets": {k: found.get(k, {}).get("lakh") for k in ("movable", "immovable")},
        "liabilities": found.get("liabilities", {}).get("lakh"),
        "cases": {
            "serious": [{"section": f"IPC {s}", "page": p} for s, p in sections.items() if s in SERIOUS_SECTIONS],
            "other": [{"section": f"IPC {s}", "page": p} for s, p in sections.items() if s not in SERIOUS_SECTIONS],
        },
        "evidence": found,
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf", type=Path)
    ap.add_argument("--candidate-id", required=True)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()

    result = {"id": args.candidate_id, **parse(args.pdf)}
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"Parsed {args.pdf.name} -> {args.out}")


if __name__ == "__main__":
    main()
