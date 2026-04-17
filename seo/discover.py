#!/usr/bin/env python3
"""
cup-ui/seo/discover.py — Dynamic SEO keyword discovery.

Discovers what people are actively searching for using free, public APIs.
Outputs a JSON file with keyword recommendations for any site.

Usage:
    python3 discover.py --seeds "DBQ evaluation,nexus letter,veteran disability"
    python3 discover.py --config seo-seeds.json
    python3 discover.py --seeds "web design" --output keywords.json

No API keys. No accounts. No cost.
"""

import json
import sys
import time
import urllib.request
import urllib.parse
import argparse
from datetime import datetime, timezone
from pathlib import Path


# ── Google Autocomplete ──────────────────────────────────────────────
# Free, unauthenticated. Returns what people are typing RIGHT NOW.

def fetch_autocomplete(query, lang="en", country="us"):
    """Fetch Google autocomplete suggestions for a query."""
    params = urllib.parse.urlencode({
        "client": "firefox",
        "q": query,
        "hl": lang,
        "gl": country,
    })
    url = f"https://suggestqueries.google.com/complete/search?{params}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            # Response format: ["query", ["suggestion1", "suggestion2", ...]]
            return data[1] if len(data) > 1 else []
    except Exception as e:
        print(f"  [warn] autocomplete failed for '{query}': {e}", file=sys.stderr)
        return []


def expand_seed(seed, lang="en", country="us"):
    """Expand a seed keyword into autocomplete suggestions + alphabet expansions."""
    results = []

    # Direct suggestions
    direct = fetch_autocomplete(seed, lang, country)
    for s in direct:
        results.append({"term": s, "source": "autocomplete", "seed": seed})

    time.sleep(0.3)  # be polite

    # Alphabet expansion: "seed a", "seed b", ... "seed z"
    # This reveals long-tail keywords Google associates with the seed
    for letter in "abcdefghijklmnopqrstuvwxyz":
        expanded = fetch_autocomplete(f"{seed} {letter}", lang, country)
        for s in expanded:
            results.append({"term": s, "source": f"alpha-{letter}", "seed": seed})
        time.sleep(0.15)

    # Question prefixes: "how to", "what is", "why", "when to"
    for prefix in ["how to", "what is", "why", "can I", "should I", "when to"]:
        q_expanded = fetch_autocomplete(f"{prefix} {seed}", lang, country)
        for s in q_expanded:
            results.append({"term": s, "source": f"question-{prefix}", "seed": seed})
        time.sleep(0.15)

    # Deduplicate while preserving order
    seen = set()
    unique = []
    for r in results:
        key = r["term"].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(r)

    return unique


# ── Site Scanner ─────────────────────────────────────────────────────
# Scans existing HTML files for current SEO terms to compare against.

def scan_site_terms(site_dir):
    """Extract current meta descriptions, titles, and headings from HTML files."""
    site_path = Path(site_dir)
    terms = {"titles": [], "descriptions": [], "headings": [], "files": []}

    for html_file in sorted(site_path.glob("*.html")):
        content = html_file.read_text(encoding="utf-8", errors="ignore")
        terms["files"].append(html_file.name)

        # Title
        import re
        title_match = re.search(r"<title[^>]*>(.*?)</title>", content, re.IGNORECASE)
        if title_match:
            terms["titles"].append(title_match.group(1).strip())

        # Meta description
        desc_match = re.search(
            r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',
            content, re.IGNORECASE
        )
        if desc_match:
            terms["descriptions"].append(desc_match.group(1).strip())

        # Headings (h1, h2)
        for h_match in re.finditer(r"<h[12][^>]*>(.*?)</h[12]>", content, re.IGNORECASE):
            text = re.sub(r"<[^>]+>", "", h_match.group(1)).strip()
            if text:
                terms["headings"].append(text)

    return terms


def find_gaps(discoveries, site_terms):
    """Find keywords that people search for but aren't on the site."""
    # Build a set of words currently on the site
    site_text = " ".join(
        site_terms.get("titles", [])
        + site_terms.get("descriptions", [])
        + site_terms.get("headings", [])
    ).lower()

    gaps = []
    for d in discoveries:
        term = d["term"].lower()
        # Check if any significant words from the discovery are missing
        words = [w for w in term.split() if len(w) > 3]
        missing_words = [w for w in words if w not in site_text]
        if missing_words:
            gaps.append({
                **d,
                "missing_words": missing_words,
                "gap_score": len(missing_words) / max(len(words), 1),
            })

    # Sort by gap score (higher = more missing)
    gaps.sort(key=lambda g: g["gap_score"], reverse=True)
    return gaps


# ── Main ─────────────────────────────────────────────────────────────

def discover(seeds, site_dir=None, lang="en", country="us"):
    """Run full discovery for a list of seed keywords."""
    all_discoveries = []
    for seed in seeds:
        print(f"  Expanding: {seed}", file=sys.stderr)
        results = expand_seed(seed.strip(), lang, country)
        all_discoveries.extend(results)
        print(f"    → {len(results)} terms", file=sys.stderr)

    # Deduplicate across all seeds
    seen = set()
    unique = []
    for d in all_discoveries:
        key = d["term"].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(d)

    output = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "seeds": seeds,
        "total_discoveries": len(unique),
        "discoveries": unique,
    }

    # If a site directory is provided, scan and find gaps
    if site_dir and Path(site_dir).exists():
        site_terms = scan_site_terms(site_dir)
        gaps = find_gaps(unique, site_terms)
        output["site_scan"] = {
            "directory": str(site_dir),
            "files_scanned": site_terms["files"],
            "current_titles": site_terms["titles"],
            "current_descriptions": site_terms["descriptions"],
        }
        output["gaps"] = gaps[:50]  # top 50 gaps
        output["gap_count"] = len(gaps)

    return output


def main():
    parser = argparse.ArgumentParser(description="SEO keyword discovery")
    parser.add_argument(
        "--seeds", type=str,
        help="Comma-separated seed keywords"
    )
    parser.add_argument(
        "--config", type=str,
        help="JSON config file with seeds array"
    )
    parser.add_argument(
        "--site", type=str, default=None,
        help="Path to site directory to scan for gaps"
    )
    parser.add_argument(
        "--output", type=str, default=None,
        help="Output JSON file (default: stdout)"
    )
    parser.add_argument(
        "--lang", type=str, default="en",
        help="Language code (default: en)"
    )
    parser.add_argument(
        "--country", type=str, default="us",
        help="Country code (default: us)"
    )
    args = parser.parse_args()

    # Get seeds
    if args.config:
        with open(args.config) as f:
            config = json.load(f)
            seeds = config.get("seeds", [])
    elif args.seeds:
        seeds = [s.strip() for s in args.seeds.split(",")]
    else:
        parser.error("Provide --seeds or --config")
        return

    print(f"SEO Discovery — {len(seeds)} seeds", file=sys.stderr)
    result = discover(seeds, site_dir=args.site, lang=args.lang, country=args.country)

    output_json = json.dumps(result, indent=2, ensure_ascii=False)

    if args.output:
        Path(args.output).write_text(output_json, encoding="utf-8")
        print(f"Written to {args.output}", file=sys.stderr)
    else:
        print(output_json)

    print(f"\nDone: {result['total_discoveries']} terms discovered", file=sys.stderr)
    if "gap_count" in result:
        print(f"Gaps: {result['gap_count']} keyword gaps found", file=sys.stderr)


if __name__ == "__main__":
    main()
