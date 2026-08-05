#!/usr/bin/env python3
"""Generate draft-seeds.js from the 5 dynamic-shell draft files.

These blocks are JS-hydrated widgets with no server-rendered content to parse, so the
importer SEEDS them: it recognizes the placeholder selector on the live page and replaces
it with the block-table markup authored in content/drafts/<name>.plain.html. Only the block
div (class="...") is captured — the trailing `.metadata` wrapper is dropped.

Run after editing any of these drafts:
    python3 tools/importer/gen-draft-seeds.py
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DRAFTS = os.path.join(HERE, '..', '..', 'content', 'drafts')
DST = os.path.join(HERE, 'draft-seeds.js')

# block name -> (draft file, block class to extract)
SEEDS = {
    'cards-featured-content': ('cards-featured-content', 'cards featured-content'),
    'custom-widget-search-filter': ('custom-widget-search-filter', 'custom-widget search-filter'),
    'custom-widget-search-results': ('custom-widget-search-results', 'custom-widget search-results'),
    'custom-widget-document-viewer': ('custom-widget-document-viewer', 'custom-widget document-viewer'),
    'pagination-numbered': ('pagination-numbered', 'pagination-numbered'),
}


def extract_block(html, cls):
    """Extract the outer <div> whose class == cls, balancing nested divs."""
    m = re.search(r'<div class="' + re.escape(cls) + r'"\s*>', html)
    if not m:
        return None
    start = m.start()
    i = m.end()
    depth = 1
    for tag in re.finditer(r'<(/?)div\b[^>]*>', html[i:]):
        depth += -1 if tag.group(1) else 1
        if depth == 0:
            end = i + tag.end()
            return html[start:end]
    return None


seeds = {}
for name, (fname, cls) in SEEDS.items():
    path = os.path.join(DRAFTS, fname + '.plain.html')
    if not os.path.exists(path):
        print(f'  WARN: {path} missing')
        continue
    html = open(path, encoding='utf-8').read()
    block = extract_block(html, cls)
    if block:
        seeds[name] = re.sub(r'\s+', ' ', block).strip()
    else:
        print(f'  WARN: block .{cls} not found in {fname}')

body = json.dumps(seeds, ensure_ascii=False, indent=2)
out = (
    '/* eslint-disable */\n'
    '/**\n'
    ' * GENERATED — do not edit by hand.  Regenerate: python3 tools/importer/gen-draft-seeds.py\n'
    ' * Draft block markup for JS-hydrated placeholder widgets that have no server content to\n'
    ' * parse. The importer replaces the live placeholder selector with this markup (seed).\n'
    ' */\n'
    f'export default {body};\n'
)
open(DST, 'w', encoding='utf-8').write(out)
print(f'wrote {DST}: {len(seeds)} seeds ({", ".join(seeds)})')
