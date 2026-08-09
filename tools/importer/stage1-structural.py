#!/usr/bin/env python3
"""Stage-1 structural gap scorer: per page, count SOURCE component signatures that
have NO corresponding EDS block in the migrated output. Produces a ranked flag list
for Stage-2 visual critique. Scoped to the article body (excludes nav/footer/related)."""
import os, re, json

SRC = '/tmp/src-audit2'
CONTENT = '/workspace/current/content/insights'

# component -> (source body regex, [acceptable migrated block signatures])
SIGS = {
    'video':        (r'class="media-video"',                    ['video overlay', 'video grid', 'embed-video']),
    'quote':        (r'quote-section|<blockquote',              ['quote testimonial', 'quote highlight', 'quote cta', '<blockquote']),
    'stat-card':    (r'cmp-card[^"]*statistic',                 ['quote highlight']),
    'feature-set':  (r'feature-set-section|cmp-feature-set',    ['horizontal-teaser', 'image-teaser', 'columns']),
    'data-table':   (r'<table',                                 ['table ', 'columns ', '<table']),
    'accordion':    (r'accordion-comp-list"[^>]*>\s*<dl',       ['accordion']),
    'carousel-img': (r'gallery|image-carousel|slick-slide',     ['carousel', 'columns media-figures']),
}

def body_region(html):
    m = re.search(r'<article[\s>]', html); start = m.start() if m else 0
    end = len(html)
    for mk in ['featured-blog-cmp', 'recommendations-cmp', '<footer']:
        i = html.find(mk, start)
        if i != -1: end = min(end, i)
    return html[start:end]

def norm(s): return re.sub(r'-+', '-', s.lower()).strip('-')
IDX = {norm(p[:-len('.plain.html')]): os.path.join(CONTENT, p)
       for p in os.listdir(CONTENT) if p.endswith('.plain.html')}

def migrated(slug):
    p = IDX.get(norm(slug))
    return open(p, encoding='utf-8', errors='ignore').read() if p else None

rows = []
for line in open(os.path.join(SRC, 'manifest.txt')):
    line = line.strip()
    if not line: continue
    url = line.split('|')[0]
    slug = url.replace('https://grace.com/insights/', '').rstrip('/')
    sp = os.path.join(SRC, slug.replace('/', '_') + '.html')
    if not os.path.exists(sp): continue
    body = body_region(open(sp, encoding='utf-8', errors='ignore').read())
    mig = migrated(slug)
    if mig is None: continue
    ml = mig.lower()
    gaps = []
    for label, (rx, blocks) in SIGS.items():
        if re.search(rx, body, re.I) and not any(b.lower() in ml for b in blocks):
            gaps.append(label)
    if gaps:
        rows.append({'slug': slug, 'gaps': gaps})

rows.sort(key=lambda r: -len(r['gaps']))
print(f"=== Stage-1 structural flags: {len(rows)} / 164 pages have a possible gap ===")
for r in rows:
    print(f"  [{','.join(r['gaps'])}]  {r['slug']}")

# write flag list for Stage 2
out = '/workspace/current/migration-work/importer/stage1-flags.json'
os.makedirs(os.path.dirname(out), exist_ok=True)
json.dump({'flagged': [r['slug'] for r in rows], 'detail': rows}, open(out, 'w'), indent=2)
print(f"\nflag list -> {out}")
