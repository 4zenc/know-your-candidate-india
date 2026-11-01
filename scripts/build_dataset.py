#!/usr/bin/env python3
"""
build_dataset.py — builds src/data/lok-sabha.json from public sources (18th Lok Sabha, 2024).

Sources (all public):
  * MyNeta / ADR  (myneta.info/LokSabha2024)  winners table + each winner's affidavit page
                  -> party, education, declared assets/liabilities, declared criminal cases, past-election assets
  * Wikipedia "Results of the 2024 Indian general election" -> margin, votes, runner-up per seat
  * PRS Legislative Research MP Track (prsindia.org/mptrack) -> attendance, debates, questions

Every figure is copied from those pages; nothing is estimated. Missing values stay null.
Be polite: responses are cached under CACHE_DIR and requests are throttled.

Usage:  python scripts/build_dataset.py [--cache /tmp/kyc/cache] [--out src/data/lok-sabha.json]
Needs:  pip install requests beautifulsoup4 lxml
"""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

import requests
from bs4 import BeautifulSoup

UA = {"User-Agent": "Mozilla/5.0 (civic-transparency research; non-commercial)"}
MYNETA = "https://www.myneta.info/LokSabha2024"
PRS = "https://prsindia.org"
WIKI = "https://en.wikipedia.org/w/api.php?action=parse&page=Results_of_the_2024_Indian_general_election&prop=text&format=json&formatversion=2"

# Constituencies that get runner-up affidavit data (deep-dive set).
FEATURED = [
    "varanasi", "mumbai south", "bengaluru south", "bangalore south", "chennai central", "kolkata dakshin", "new delhi",
    "gandhinagar", "lucknow", "hyderabad", "wayanad", "guwahati", "jaipur", "patna sahib",
    "thiruvananthapuram", "pune", "rae bareli", "amethi", "mumbai north", "nagpur", "baramulla",
    "chandigarh", "bhopal", "ahmedabad west", "kolkata uttar", "bengaluru central", "bangalore central",
]

STATE_ABBR = {
    "AP": "Andhra Pradesh", "AR": "Arunachal Pradesh", "AS": "Assam", "BR": "Bihar", "CG": "Chhattisgarh", "GA": "Goa",
    "GJ": "Gujarat", "HR": "Haryana", "HP": "Himachal Pradesh", "JH": "Jharkhand", "KA": "Karnataka", "KL": "Kerala",
    "MP": "Madhya Pradesh", "MH": "Maharashtra", "MN": "Manipur", "ML": "Meghalaya", "MZ": "Mizoram", "NL": "Nagaland",
    "OD": "Odisha", "OR": "Odisha", "PB": "Punjab", "RJ": "Rajasthan", "SK": "Sikkim", "TN": "Tamil Nadu", "TS": "Telangana",
    "TG": "Telangana", "TR": "Tripura", "UP": "Uttar Pradesh", "UK": "Uttarakhand", "UT": "Uttarakhand", "WB": "West Bengal",
    "AN": "Andaman and Nicobar Islands", "CH": "Chandigarh", "DN": "Dadra and Nagar Haveli and Daman and Diu",
    "DD": "Dadra and Nagar Haveli and Daman and Diu", "DH": "Dadra and Nagar Haveli and Daman and Diu",
    "JK": "Jammu and Kashmir", "LA": "Ladakh", "LD": "Lakshadweep", "DL": "Delhi", "PY": "Puducherry", "PU": "Puducherry",
}

CACHE_DIR = Path("/tmp/kyc/cache")


def fetch(url: str, retries: int = 3) -> str:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    f = CACHE_DIR / (hashlib.md5(url.encode()).hexdigest() + ".html")
    if f.exists():
        return f.read_text(encoding="utf-8", errors="ignore")
    for i in range(retries):
        try:
            r = requests.get(url, headers=UA, timeout=40)
            if r.status_code == 200:
                f.write_text(r.text, encoding="utf-8")
                time.sleep(0.25)
                return r.text
        except requests.RequestException:
            pass
        time.sleep(1.5 * (i + 1))
    print("FAILED", url, file=sys.stderr)
    return ""


def pmap(fn, items, workers=8):
    with ThreadPoolExecutor(workers) as ex:
        return list(ex.map(fn, items))


def norm(s: str) -> str:
    s = re.sub(r"\((ST|SC)\)", "", s, flags=re.I)
    return re.sub(r"[^a-z0-9]", "", s.lower())


def tokens(s: str) -> set[str]:
    return {t for t in re.findall(r"[a-z]+", s.lower()) if len(t) > 1}


def name_overlap(a: str, b: str) -> float:
    ta, tb = tokens(a), tokens(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / min(len(ta), len(tb))


def rupees(text: str) -> int | None:
    m = re.search(r"Rs\s*([\d,]+)", text.replace("\xa0", " "))
    return int(m.group(1).replace(",", "")) if m else None


def lakh(r: int | None) -> float | None:
    return None if r is None else round(r / 100000, 2)


def slugify(s: str) -> str:
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", re.sub(r"\((ST|SC)\)", "", s, flags=re.I).lower())).strip("-")


def same_person(a: str, b: str) -> bool:
    return name_overlap(a, b) >= 0.75


def same_person_loose(a: str, b: str) -> bool:
    return name_overlap(a, b) >= 0.5


# ---------------------------------------------------------------- MyNeta
def _strip(x: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", x).replace("&nbsp;", " ").replace("&amp;", "&")).strip()


def myneta_winners() -> list[dict]:
    """The winners table drops some rows for each sort order (an injected script breaks the table),
    so the union of all sort orders is taken and de-duplicated by candidate id."""
    found: dict[str, dict] = {}
    for sort in ("default", "candidate", "party", "criminal", "edu", "asset", "liabi"):
        html = fetch(f"{MYNETA}/index.php?action=show_winners&sort={sort}")
        for block in html.split("<tr")[1:]:
            m = re.search(r"candidate_id=(\d+)", block)
            tds = [_strip(t) for t in re.findall(r"<td[^>]*>(.*?)</td>", block, re.S)]
            if not m or len(tds) < 8 or not tds[0].isdigit() or m.group(1) in found:
                continue
            const = tds[2]
            reserved = re.search(r"\((ST|SC)\)", const)
            found[m.group(1)] = {
                "myneta_id": m.group(1), "name": tds[1], "constituency_raw": const, "reserved": reserved.group(1) if reserved else None,
                "party": tds[3], "cases": int(tds[4]) if tds[4].isdigit() else 0, "education": tds[5],
                "assets": rupees(tds[6]), "liabilities": rupees(tds[7]),
            }
    return list(found.values())


def parse_candidate_page(html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    lines = [l for l in soup.get_text("\n", strip=True).split("\n")]
    text = "\n".join(lines)
    d: dict = {}
    m = re.search(r"Constituency-\s*(.*)\(([^()]+)\)\s*-\s*Affidavit", lines[0] if lines else "")
    d["state"] = m.group(2).title() if m else None
    a = soup.find("a", href=re.compile(r"action=show_candidates&constituency_id=(\d+)"))
    d["constituency_id"] = re.search(r"constituency_id=(\d+)", a["href"]).group(1) if a else None
    if "Age:" in lines:
        v = lines[lines.index("Age:") + 1]
        d["age"] = int(v) if v.isdigit() else None
    # past elections
    prior = []
    if "Declared Cases" in lines:
        i = lines.index("Declared Cases") + 1
        while i + 3 < len(lines) and not lines[i].startswith(("Click here", "Print Profile")):
            label, amt = lines[i], lines[i + 1]
            if amt.startswith("Rs"):
                prior.append({"election": label, "assetsLakh": lakh(rupees(amt))})
                i += 4
            else:
                i += 1
    seen, uniq = set(), []
    for p in prior:
        if p["election"] not in seen and "2024" not in p["election"]:
            seen.add(p["election"])
            uniq.append(p)
    d["prior_assets"] = uniq
    # The affidavit's "Totals Calculated" row before the immovable-assets readability note is the immovable total;
    # movable = total declared assets (from the winners table) minus immovable.
    j = text.find("Data Readability Report of Immovable Assets")
    seg = text[:j] if j > 0 else ""
    k = seg.rfind("Totals Calculated")
    figs = re.findall(r"Rs\s*([\d,]+)", seg[k:].replace("\xa0", " ")) if k >= 0 else []
    d["immovable"] = int(figs[-1].replace(",", "")) if figs else None
    # criminal cases
    cases: list[str] = []
    if "Brief Details of IPC / BNS" in text:
        s = text.split("Brief Details of IPC / BNS", 1)[1].split("Cases where Pending", 1)[0]
        cases = [l.strip() for l in s.split("\n") if l.strip() and not l.strip().isdigit()]
    d["case_summaries"] = cases
    conv = text.split("Cases where Convicted", 1)
    seg = conv[1].split("Disclaimer", 1)[0] if len(conv) > 1 else ""
    d["convicted"] = bool(seg) and "No Cases" not in seg
    return d


def myneta_constituency_candidates(cid: str) -> list[dict]:
    soup = BeautifulSoup(fetch(f"{MYNETA}/index.php?action=show_candidates&constituency_id={cid}"), "lxml")
    out = []
    for tr in soup.select("table tr"):
        tds = tr.find_all("td")
        if len(tds) < 7 or not tds[0].get_text(strip=True).isdigit():
            continue
        c = [td.get_text(" ", strip=True) for td in tds]
        a = tr.find("a", href=re.compile(r"candidate_id=(\d+)"))
        out.append({
            "myneta_id": re.search(r"candidate_id=(\d+)", a["href"]).group(1) if a else None,
            "name": re.sub(r"\s*\(Winner\)\s*", "", c[1]).strip(), "party": c[2],
            "cases": int(c[3]) if c[3].isdigit() else 0, "education": c[4],
            "assets": rupees(c[6]) if len(c) > 6 else None, "liabilities": rupees(c[7]) if len(c) > 7 else None,
        })
    return out


# ---------------------------------------------------------------- Wikipedia
def wiki_results() -> list[dict]:
    raw = json.loads(fetch(WIKI))
    soup = BeautifulSoup(raw["parse"]["text"], "lxml")
    table = next(t for t in soup.find_all("table") if "Runner-up" in t.get_text() and "Margin" in t.get_text() and len(t.find_all("tr")) > 500 and not t.find("table"))
    rows, state = [], None
    num = lambda s: int(re.sub(r"[^\d]", "", s)) if re.search(r"\d", s) else None
    for tr in table.find_all("tr"):
        cells = [re.sub(r"\[.*?\]", "", c.get_text(" ", strip=True)).strip() for c in tr.find_all(["th", "td"])]
        if not cells or cells[0] in ("State/UT", "No."):
            continue
        if not cells[0].isdigit():
            state, cells = cells[0], cells[1:]
        if len(cells) < 13 or not cells[0].isdigit():
            continue
        rows.append({
            "state_abbr": state, "name": cells[1], "winner": cells[2], "win_party": cells[4], "win_votes": num(cells[5]),
            "win_share": float(cells[6]) if re.match(r"^[\d.]+$", cells[6]) else None,
            "runner": cells[7], "runner_party": cells[9], "runner_votes": num(cells[10]),
            "runner_share": float(cells[11]) if re.match(r"^[\d.]+$", cells[11]) else None, "margin": num(cells[12]),
        })
    return rows


# ---------------------------------------------------------------- PRS
def prs_slugs() -> list[str]:
    def page(n):
        return re.findall(r"/mptrack/18th-lok-sabha/([a-z0-9-]+)", fetch(f"{PRS}/mptrack?slug1=18th-lok-sabha&page={n}&per-page=9"))
    slugs: list[str] = []
    for chunk in pmap(page, range(1, 66)):
        for s in chunk:
            if s not in slugs:
                slugs.append(s)
    return slugs


def parse_prs(slug: str) -> dict | None:
    html = fetch(f"{PRS}/mptrack/18th-lok-sabha/{slug}")
    if not html:
        return None
    lines = BeautifulSoup(html, "lxml").get_text("\n", strip=True).split("\n")
    top = lines
    # metrics live after the "Parliamentary Activity" heading; earlier matches are menu/filter text
    lines = lines[lines.index("Parliamentary Activity"):] if "Parliamentary Activity" in lines else lines
    def after(label, off=1, src=None):
        src = src or top
        return src[src.index(label) + off] if label in src else None
    def _unused(label, off=1):
        return lines[lines.index(label) + off] if label in lines else None
    def metric(label):
        if label not in lines:
            return None, None
        i = lines.index(label)
        vals = {}
        for j in range(i, min(i + 6, len(lines) - 1)):
            if lines[j] in ("Selected MP", "National Average") and lines[j] not in vals:
                vals[lines[j]] = lines[j + 1]
        return vals.get("Selected MP"), vals.get("National Average")
    num = lambda s: float(re.sub(r"[^\d.]", "", s)) if s and re.search(r"\d", s) else None
    att, att_nat = metric("Attendance")
    deb, deb_nat = metric("No. of\nDebates") if False else (None, None)
    # "No. of" / "Debates" are separate lines on the page
    def after_block(first, second):
        for i in range(len(lines) - 1):
            if lines[i] == first and lines[i + 1] == second:
                return i + 1
        return None
    def grab(i):
        vals = {}
        for j in range(i, min(i + 6, len(lines) - 1)):
            if lines[j] in ("Selected MP", "National Average") and lines[j] not in vals:
                vals[lines[j]] = lines[j + 1]
        return num(vals.get("Selected MP")), num(vals.get("National Average"))
    i_deb = after_block("No. of", "Debates")
    deb, deb_nat = grab(i_deb) if i_deb else (None, None)
    q, q_nat = metric("No. of Questions")
    pb, _ = metric("Private Member's Bills")
    period = next((l for l in top if l.startswith("Data corresponds to the period")), None)
    return {
        "slug": slug, "name": top[top.index("State :") - 1] if "State :" in top else None,
        "constituency": after("Constituency :"), "start_of_term": after("Start of Term :"),
        "attendance": num(att), "attendance_nat": num(att_nat), "debates": deb, "debates_nat": deb_nat,
        "questions": num(q), "questions_nat": num(q_nat), "private_bills": num(pb), "period": period,
    }


# ---------------------------------------------------------------- assemble
def main() -> None:
    global CACHE_DIR
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default=str(CACHE_DIR))
    ap.add_argument("--out", default="src/data/lok-sabha.json")
    args = ap.parse_args()
    CACHE_DIR = Path(args.cache)

    print("MyNeta winners…")
    winners = myneta_winners()
    print(" ", len(winners))
    print("Wikipedia results…")
    wiki = wiki_results()
    print(" ", len(wiki))
    print("MyNeta candidate pages…")
    details = pmap(lambda w: parse_candidate_page(fetch(f"{MYNETA}/candidate.php?candidate_id={w['myneta_id']}")), winners)
    print("PRS MP Track…")
    slugs = prs_slugs()
    print(" ", len(slugs), "MPs listed")
    prs = [p for p in pmap(parse_prs, slugs) if p and p["constituency"]]

    # wiki index: (state, const) and const
    wk_by_key, wk_by_const = {}, {}
    for r in wiki:
        st = STATE_ABBR.get(r["state_abbr"] or "", r["state_abbr"])
        r["state"] = st
        wk_by_key[(norm(st or ""), norm(r["name"]))] = r
        wk_by_const.setdefault(norm(r["name"]), []).append(r)
    wk_names = list(wk_by_const)
    prs_by_const: dict[str, list[dict]] = {}
    for p in prs:
        prs_by_const.setdefault(norm(p["constituency"]), []).append(p)

    unmatched_wiki, unmatched_prs = [], []
    mps = []
    used_slugs: set[str] = set()
    for w, d in zip(winners, details):
        cname = re.sub(r"\s*\((ST|SC)\)\s*", "", w["constituency_raw"], flags=re.I).strip()
        key = norm(cname)
        state = d["state"]
        wk = wk_by_key.get((norm(state or ""), key))
        if not wk:
            cands = wk_by_const.get(key) or []
            if len(cands) == 1:
                wk = cands[0]
            elif not cands:
                close = difflib.get_close_matches(key, wk_names, n=1, cutoff=0.85)
                if close and len(wk_by_const[close[0]]) == 1:
                    wk = wk_by_const[close[0]][0]
        if not wk:
            unmatched_wiki.append(w["constituency_raw"])
        pr = None
        for k in [key] + difflib.get_close_matches(key, list(prs_by_const), n=1, cutoff=0.85):
            for p in prs_by_const.get(k, []):
                gen = (p.get("start_of_term") or "").endswith("-06-2024")
                if same_person(p["name"] or "", w["name"]) or (gen and same_person_loose(p["name"] or "", w["name"])):
                    pr = p
                    break
            if pr:
                break
        if not pr:
            unmatched_prs.append(f"{w['name']} / {cname}")
        display = re.sub(r"\bBANGALORE\b", "BENGALURU", cname).title().replace(" And ", " and ")
        slug = slugify(display)
        if slug in used_slugs:
            slug = f"{slug}-{slugify(state or '')}"
        used_slugs.add(slug)
        immovable = d["immovable"]
        movable = w["assets"] - immovable if immovable is not None and w["assets"] is not None and immovable <= w["assets"] else None
        net = None if w["assets"] is None or w["liabilities"] is None else w["assets"] - w["liabilities"]
        mp = {
            "id": w["myneta_id"], "name": w["name"], "party": w["party"], "constituency": display, "slug": slug, "_key": key, "_raw": w["constituency_raw"],
            "state": state or (wk or {}).get("state"), "reserved": w["reserved"], "age": d.get("age"), "education": w["education"],
            "assetsLakh": lakh(w["assets"]), "liabilitiesLakh": lakh(w["liabilities"]), "netWorthLakh": lakh(net),
            "movableLakh": lakh(movable), "immovableLakh": lakh(immovable) if movable is not None else None,
            "priorAssets": d["prior_assets"], "cases": w["cases"], "caseSummaries": d["case_summaries"],
            "votes": (wk or {}).get("win_votes"), "voteShare": (wk or {}).get("win_share"), "margin": (wk or {}).get("margin"),
            "runnerUp": ({"name": wk["runner"], "party": wk["runner_party"], "votes": wk["runner_votes"], "voteShare": wk["runner_share"]} if wk else None),
            "prs": ({k: pr[k] for k in ("slug", "attendance", "attendance_nat", "debates", "debates_nat", "questions", "questions_nat", "private_bills", "period")} if pr else None),
            "constituencyId": d["constituency_id"],
        }
        mps.append(mp)

    # by-election winners: attach to the seat instead of listing the seat twice
    base = [m for m in mps if "BYE ELECTION" not in m["_raw"].upper()]
    by_key = {m["_key"]: m for m in base}
    for m in mps:
        if "BYE ELECTION" not in m["_raw"].upper():
            continue
        dm = re.search(r"BYE ELECTION ON\s*([\d-]+)", m["_raw"], re.I)
        seat = by_key.get(norm(m["_raw"].split(":")[0]))
        if seat:
            seat["byElection"] = {"id": m["id"], "name": m["name"], "party": m["party"], "date": dm.group(1) if dm else None,
                                  "assetsLakh": m["assetsLakh"], "liabilitiesLakh": m["liabilitiesLakh"], "cases": m["cases"],
                                  "prsSlug": None}
    for p in prs:
        for seat in base:
            be = seat.get("byElection")
            if be and not be["prsSlug"] and norm(p["constituency"]) == seat["_key"] and name_overlap(p["name"] or "", be["name"]) >= 0.75:
                be["prsSlug"] = p["slug"]
    mps = base

    # runner-up affidavits for featured seats
    feat = {slug for slug in (slugify(f) for f in FEATURED)}
    def add_runner(mp):
        if mp["slug"] not in feat or not mp["runnerUp"] or not mp["constituencyId"]:
            return
        for c in myneta_constituency_candidates(mp["constituencyId"]):
            if same_person(c["name"], mp["runnerUp"]["name"]) and c["name"].lower() != mp["name"].lower():
                ru = mp["runnerUp"]
                ru.update({"id": c["myneta_id"], "cases": c["cases"], "education": c["education"],
                           "assetsLakh": lakh(c["assets"]), "liabilitiesLakh": lakh(c["liabilities"]),
                           "netWorthLakh": lakh(c["assets"] - c["liabilities"]) if c["assets"] is not None and c["liabilities"] is not None else None})
                if c["myneta_id"]:
                    dd = parse_candidate_page(fetch(f"{MYNETA}/candidate.php?candidate_id={c['myneta_id']}"))
                    ru["caseSummaries"] = dd["case_summaries"]
                    ru["priorAssets"] = dd["prior_assets"]
                return
    for mp in mps:
        add_runner(mp)
    missing_feat = sorted(feat - {m["slug"] for m in mps})

    for mp in mps:
        mp.pop("constituencyId", None); mp.pop("_key", None); mp.pop("_raw", None)
    mps.sort(key=lambda m: (m["state"] or "", m["constituency"]))
    out = {
        "generated": date.today().isoformat(),
        "election": "18th Lok Sabha (2024 general election)",
        "featured": sorted(feat & {m["slug"] for m in mps}),
        "prsPeriod": next((m["prs"]["period"] for m in mps if m["prs"] and m["prs"]["period"]), None),
        "mps": mps,
    }
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(out, ensure_ascii=False, indent=1))
    print(f"\nWrote {len(mps)} MPs -> {args.out}")
    print("with state:", sum(1 for m in mps if m["state"]), "| with margin:", sum(1 for m in mps if m["margin"] is not None),
          "| with PRS:", sum(1 for m in mps if m["prs"]), "| featured:", len(out["featured"]))
    print("featured not found:", missing_feat)
    print("unmatched wiki:", unmatched_wiki[:20], len(unmatched_wiki))
    print("unmatched prs:", unmatched_prs[:15], len(unmatched_prs))


if __name__ == "__main__":
    main()
