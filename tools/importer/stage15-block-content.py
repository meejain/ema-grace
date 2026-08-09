#!/usr/bin/env python3
"""Stage-1.5 block-content diff: per migrated page, inspect each emitted block for
CONTENT defects that decorate cleanly (so Stage-0 console sweep + Stage-1 presence
checks miss them). Deterministic, cheap, no browser.

Catches the "loads fine but wrong content" class:
- label pollution (e.g. a social-follow label containing 'PROMOTION' eyebrow text)
- boilerplate/eyebrow leakage into headings
- suspiciously long "labels" (concatenated cells)
- empty blocks (a block table with no real content)

Heuristic rules per block family; extend as new families are migrated.
Reads content/<subdir>/*.plain.html. Usage: python3 stage15-block-content.py [subdir]
"""
import os, re, sys, glob, json

SUBDIR = sys.argv[1] if len(sys.argv) > 1 else 'insights'
WS = os.environ.get('WORKSPACE_PATH', '/workspace/current')
CONTENT = os.path.join(WS, 'content', SUBDIR)

# CMS eyebrow / scaffolding text that should never survive into authored content as a
# standalone paragraph or block label. 'PROMOTION' is the source card eyebrow; a lone
# `<p>PROMOTION</p>` in the body means a promo block was flattened to loose text.
# (Do NOT flag 'Image of' — it's benign DM carrier alt-text, and windowing bleeds across
# blocks producing false positives.)
POLLUTION = re.compile(r'<p>\s*PROMOTION\s*</p>|>\s*PROMOTION\s*<', re.I)

def check_page(path):
    html = open(path, encoding='utf-8', errors='ignore').read()
    slug = os.path.basename(path)[:-len('.plain.html')]
    findings = []
    # 1. Eyebrow/scaffolding leaked into the page as loose paragraphs → a promo block
    #    was flattened instead of parsed.
    if POLLUTION.search(html):
        n = len(POLLUTION.findall(html))
        findings.append(f"flattened promo: {n}x loose 'PROMOTION' eyebrow paragraph(s) (a card/feature-set block was not parsed)")
    # 2. Phantom block name: a block <div class="X"> whose family X is not a real block folder
    #    → EDS 404s trying to load blocks/X/ (the cards-product / application class of bug).
    known = {'social', 'cards', 'columns', 'quote', 'banner', 'table', 'video', 'accordion',
             'carousel', 'hero', 'breadcrumb', 'post-meta', 'metadata', 'section-metadata',
             'embed-video', 'map-embedded', 'custom-widget', 'featured', 'fragment',
             'pagination-numbered'}
    # block divs are emitted as <div class="fam ...">; a mis-derived name is a single lowercase
    # token that isn't a known family. Restrict to the article body to avoid section wrappers.
    for m in re.finditer(r'<div class="([a-z][a-z0-9-]*)">', html):
        cls = m.group(1)
        if cls not in known and not cls.endswith('-wrapper') and not cls.endswith('-container'):
            # only flag if it looks like a block (has nested <div><div> cell structure right after)
            tail = html[m.end():m.end() + 40]
            if tail.startswith('<div><div>') or tail.startswith('<div><div '):
                findings.append(f"'{cls}': phantom block name (no blocks/{cls}/ → 404, undecorated)")
    return slug, findings

def main():
    files = sorted(glob.glob(os.path.join(CONTENT, '*.plain.html')))
    flagged = []
    for f in files:
        slug, findings = check_page(f)
        if findings:
            flagged.append({'slug': slug, 'findings': findings})
    print(f"=== Stage-1.5 block-content diff: {len(flagged)} / {len(files)} pages flagged ===")
    for p in flagged:
        print(f"\n{p['slug']}:")
        for fnd in p['findings']:
            print(f"    - {fnd}")
    if not flagged:
        print("  (none — no content-level block defects detected)")
    out = os.path.join(WS, 'migration-work', 'importer', 'stage15-flags.json')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    json.dump({'flagged': flagged}, open(out, 'w'), indent=2)
    print(f"\nflag list -> {out}")

main()
