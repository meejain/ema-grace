# Industries EDS-live vs grace.com-source — parity audit (2026-08-13)

Method: headless fingerprint sweep of all 102 pages (desktop 1440 + mobile 390),
extracting hero/H1/headings/section-types/cards/tables/nav/bullets/text-length;
diffed vs source; flagged pages drilled visually via Playwright DOM snapshots.

## Result
- **102 pages compared. 0 MAJOR. ~97 GOOD. 5 pages with a REAL defect.**
- The 50 "h2 count" flags were FINGERPRINT NOISE — grace.com lazy-injects
  Latest-Insights/carousel headings, so the source fingerprint under-counts; EDS
  content is actually complete (verified on refining-technologies: EDS has all 3
  correct H2s, source fp captured 1).
- "nav rail missing" on hydroprocessing/ppartner = NOT a defect — the SOURCE
  pages don't render a populated section-nav rail either (empty decorative
  `.section-navigation`); EDS correctly omits it.

## THE REAL DEFECT (5 pages): undecorated "PROMOTION" card grid
The bottom card grid (source: a `.cmp-card-list` of promotion cards — image +
title + "Learn more") imported as FLAT `<p><a>PROMOTION</a></p>` /
`<p><a>Title</a></p>` / `<p><a>Learn more</a></p>` paragraphs instead of a `Cards`
block. Stray "PROMOTION" eyebrow leaks as visible text.

Affected:
- /industries/refining-technologies/hydroprocessing/resid-hydrotreating-solutions
- /industries/refining-technologies/hydroprocessing/resid-hydrocracking-solutions
- /industries/refining-technologies/hydroprocessing/distillate-hydrotreating-solutions
- /industries/agriculture/agriculture-cdmo
- /industries/agriculture/animal-feed-agricultural-active-solutions

Root cause: parser cards/category-grid matcher doesn't recognize this card-list
variant (promotion cards: image + `.h4/.title` + "Learn more", no `.bio` class,
links to sibling /industries/ pages). → importer parser fix + reimport these 5.

## Secondary (verify): traditional-herbal-medicine cards=0 vs src=1
May be the same card-grid pattern OR a legit single media-callout. Verify during fix.
