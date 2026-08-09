#!/usr/bin/env python3
"""Build block-intelligence.json from the reference Templates & Blocks report.

Source: reference/front-end-report-gracev1.html — an offline audit of grace.com that catalogs,
for the WHOLE site: 18 page TEMPLATES (each with a canonical example URL + how many pages match it)
and 61 BLOCKS (each tagged with a page-type badge + an example URL where it appears).

This reverses that into migration intelligence:
  • templates:   name → { url (richest example), matchCount, pageType }
  • blocks:      name → { badges (page-types it appears on), url (example) }
  • pageTypeToBlocks: page-type → [blocks] — "for a page of THIS type, expect THESE blocks"
  • pathPrefixToTemplates: URL path prefix → [templates] — a coarse classifier from the example URLs

Use it (see block-intelligence-lookup.py) to predict, for any URL to migrate, which template it is
and therefore which blocks the importer must render — so the richest-representative page is chosen
deliberately and no block type is discovered late (mid-bulk). Regenerate:
    python3 tools/importer/build-block-intelligence.py
"""
import json
import os
import re
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
REPORT = os.path.join(HERE, '..', '..', 'reference', 'front-end-report-gracev1.html')
OUT = os.path.join(HERE, 'block-intelligence.json')


def clean(s):
    return re.sub(r'\s+', ' ', s or '').strip()


def main():
    html = open(REPORT, encoding='utf-8', errors='ignore').read()

    # --- Blocks: <div class="block-card"> <h3>Name</h3> badges + block-url ---
    blocks = {}
    page_type_to_blocks = defaultdict(list)
    for c in re.split(r'<div class="block-card">', html)[1:]:
        m = re.search(r'<h3>([^<]+)</h3>', c)
        if not m:
            continue
        name = clean(m.group(1))
        urls = re.findall(r'class="block-url"[^>]*href="([^"]+)"', c)
        badges = [clean(b) for b in re.findall(r'badge[^>]*>([^<]+)</span>', c)]
        # drop generic badge classes that aren't page-types
        badges = [b for b in badges if b and not b.lower().startswith('badge')]
        blocks[name] = {'badges': badges, 'url': urls[0] if urls else ''}
        for b in badges:
            page_type_to_blocks[b].append(name)

    # --- Templates: <div class="template-card"> name + url + "N pages match" ---
    templates = {}
    for c in re.split(r'<div class="template-card">', html)[1:]:
        nm = re.search(r'template-name"[^>]*>([^<]+)', c)
        url = re.search(r'template-url"[^>]*href="([^"]+)"', c)
        match = re.search(r'([0-9]+)\s+pages?\s+match', c)
        note = re.search(r'template-note"[^>]*>([^<]+)', c)
        if not nm:
            continue
        name = clean(nm.group(1))
        templates[name] = {
            'url': clean(url.group(1)) if url else '',
            'matchCount': int(match.group(1)) if match else None,
            'note': clean(note.group(1)) if note else '',
        }

    # --- Coarse path-prefix → templates classifier (from template example URLs) ---
    path_prefix_to_templates = defaultdict(list)
    for name, t in templates.items():
        p = re.sub(r'https?://grace\.com', '', t['url']).strip('/').split('/')
        prefix = p[0] if p and p[0] else '(home)'
        path_prefix_to_templates[prefix].append(name)

    out = {
        '_meta': {
            'source': 'reference/front-end-report-gracev1.html',
            'purpose': 'Predict page-template + expected blocks for any URL to migrate. '
                       'Template/block example URLs are the RICHEST representatives (playbook §2 mandate).',
            'blockCount': len(blocks),
            'templateCount': len(templates),
        },
        'templates': templates,
        'blocks': blocks,
        'pageTypeToBlocks': {k: sorted(set(v)) for k, v in sorted(page_type_to_blocks.items())},
        'pathPrefixToTemplates': {k: sorted(v) for k, v in sorted(path_prefix_to_templates.items())},
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f'wrote {OUT}')
    print(f'  {len(templates)} templates, {len(blocks)} blocks, '
          f'{len(page_type_to_blocks)} page-types')


if __name__ == '__main__':
    main()
