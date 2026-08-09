#!/usr/bin/env python3
"""Predict the page-template + expected blocks for a URL, from block-intelligence.json.

Answers "which blocks must the importer render for THIS page?" before migrating it — so the
richest-representative page is chosen deliberately and no block type is discovered late (mid-bulk).

Usage:
    python3 tools/importer/block-intelligence-lookup.py <url-or-path> [...]
    python3 tools/importer/block-intelligence-lookup.py --templates         # list all templates
    python3 tools/importer/block-intelligence-lookup.py --type "Product Detail"   # blocks for a type

Classification is coarse (path-prefix + keyword heuristics from the report's example URLs); it names
the LIKELY template(s) and the blocks seen on that page-type. Always confirm against the live page —
this narrows the search, it does not replace analysis (playbook §2).
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
IDX = os.path.join(HERE, 'block-intelligence.json')

# path pattern → template name (ordered; first match wins). Derived from the report's template URLs.
PATH_RULES = [
    (r'^/?insights/.+', 'Insight Article'),
    (r'^/?newsroom/press-releases/\d', 'Press Release'),
    (r'^/?products/[^/]+$', 'Product Detail'),
    (r'^/?about-grace/leadership-team/[^/]+$', 'Profile Detail'),
    (r'^/?about-grace/locations/[^/]+$', 'Location Detail'),
    (r'^/?about-grace/locations/?$', 'Locations Directory'),
    (r'^/?about-grace/our-history', 'History Content Page'),
    (r'^/?compliance/.+', 'Legal Policy Page'),
    (r'^/?campaign/.+', 'Campaign Landing'),
    (r'^/?industries/[^/]+/[^/]+/.+', 'Solution Content Page'),  # deep industry = solution content
    (r'^/?industries/[^/]+/[^/]+/?$', 'Solution Detail'),        # depth-3 industry = solution detail
    (r'^/?industries/[^/]+/?$', 'Solution Detail'),              # industry landing → solution-ish
    (r'^/?$', 'Homepage'),
]


def classify(path):
    path = re.sub(r'https?://grace\.com', '', path)
    path = '/' + path.strip('/')
    for pat, tmpl in PATH_RULES:
        if re.search(pat, path):
            return tmpl
    return None


def main():
    idx = json.load(open(IDX, encoding='utf-8'))
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return
    if args[0] == '--templates':
        for n, t in sorted(idx['templates'].items(), key=lambda x: -(x[1]['matchCount'] or 0)):
            print(f"  {t['matchCount'] or '?':>4} pages  {n:26} {t['url']}")
        return
    if args[0] == '--type':
        t = args[1]
        print(f"[{t}] blocks:")
        for b in idx['pageTypeToBlocks'].get(t, []):
            print(f"   - {b}  →  {idx['blocks'].get(b, {}).get('url', '')}")
        return

    # map template name → its page-type badge(s) by looking at which page-types share its blocks.
    # simpler: the report's badges ARE the page-types; join template name loosely to a badge.
    for url in args:
        tmpl = classify(url)
        print(f"\n{url}")
        if not tmpl:
            print("  template: (unclassified — inspect live page)")
            continue
        t = idx['templates'].get(tmpl, {})
        print(f"  template: {tmpl}  (example: {t.get('url','?')}, {t.get('matchCount','?')} pages match)")
        # best-effort: expected blocks = blocks whose badge matches the template's page-type words
        words = set(re.findall(r'[a-z]+', tmpl.lower()))
        expected = []
        for pt, bl in idx['pageTypeToBlocks'].items():
            if words & set(re.findall(r'[a-z]+', pt.lower())):
                expected += bl
        expected = sorted(set(expected))
        if expected:
            print(f"  likely blocks ({len(expected)}): {', '.join(expected)}")
        else:
            print("  (no direct page-type match; check --type for the closest page-type)")


if __name__ == '__main__':
    main()
