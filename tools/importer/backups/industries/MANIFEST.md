# industries — importer snapshot
- **set:** industries (102 pages: 1 root landing + 11 depth-1 landings + 90 depth-2/3/4 solution/detail pages)
- **bundle:** import-grace-master.bundle.js (frozen; the live bundle that produced this set)
- **bundle provenance:** working tree at snapshot (parent commit `c35279d` "Update importer"; importer
  source + bundle uncommitted at snapshot time — the frozen bundle here IS the record).
- **shape — ONE template, two dispatch branches keyed on section-nav presence:**
  - DETAIL pages (depth ≥2, have `.section-navigation`) → `isIndustriesDetailPage()` (path `/industries/`
    + `isSidebarPage`) routes to `buildDefaultPage` with `params.forceTemplate='sidebar'` +
    `params.industriesNav`. Reuses the products-detail pipeline (image hero via discovery, source DOM
    order via `sectionizeFlatBody`, geo-hex, contactus); injects the nav rail as its own section after
    the hero; emits `template: sidebar` (3-col grid nav|content|widget).
  - LANDING pages (depth-1, NO section-nav, e.g. plastics-and-polymers) → plain `buildDefaultPage`,
    `template: contactus` (2-col content + widget gutter).
- **contains (delta over products bundle):**
  - `isIndustriesDetailPage()` + `extractAndRemoveSidebarNav()` + nav-rail injection into buildDefaultPage;
    `params.forceTemplate` override so detail pages emit `template: sidebar`.
  - `isCategoryGrid()` STRUCTURAL discriminator: a `.cmp-card-list.grid.three-columns` bio grid with a
    section `.heading` (H2) + simple image+`.h4.title`+"Learn more" cards (NO `.spt-copy`/`<ul>` body) →
    `Cards (category-grid)`; used by BOTH the cards-product matcher (to exclude) and cards-category-grid
    (to claim). href-agnostic → works for industries solution grids AND product purification grids (vyvid).
  - `cards-category-grid` parser: title from `.h4.title` (drops `.h5` "PROMOTION" eyebrow); preserves the
    section H2+intro authored INSIDE `.cmp-card-list > .heading` (else replaceWith destroys it).
  - `table-data-grid` matcher extended to catch a 2-col bordered features/benefits table
    (`.rich-text.vertical-border > table`, 2 cols, header row) → `Table (data-grid)`.
  - `featured-product-selector` wins over `columns-horizontal-teaser-featured` for slate "Featured
    Products" carousels (the latter excludes "Featured Products" headings).
  - `collapsePathHyphens()` in `rewriteInternalLinks`: collapses `--`→`-` in internal link paths to match
    the saved file path (finalizePath/sanitizePath collapses it) — fixes the `unipol--pp-process-technology`
    link/file mismatch. Validated sets have no `--` links so it is a no-op there.
  - Empty top-level `<div>` section cleanup + `<hr>` collapse (scoped to `params.industriesNav` pages) —
    removes the emptied `.col-lg-2` shell left after the nav rail is lifted out.
  - Hero background image: relies on the existing transform `onLoad` hook that materializes inline
    `style="background-image:url(scene7…)"` into a leading `<img>` so the discovery hero-banner parser
    emits `Hero (product)` WITH the photo (the previously-missed hero-image class of bug — now covered on
    the industries detail path because it routes through buildDefaultPage, not the stripped buildSidebarPage).
- **RUNTIME fixes (NOT in the bundle — in repo, apply at render):** `blocks/table/table.js` —
  data-grid + three-column scroll wrappers get `tabindex=0` + `role=group` + `aria-label` (fixes axe
  `scrollable-region-focusable` serious violation surfaced by the beverage SYLOID data-grid). All other
  rendering reuses existing hero/cards/featured/sidebar/contactus block+template code (unchanged).
- **URL list:** `urls.txt` (102 — from grace.com/sitemap.xml `/industries/` subtree).
- **KNOWN NOTES:**
  - `unipol--pp-process-technology` (double-hyphen source slug) saves + links as single-hyphen
    `unipol-pp-process-technology` (6 pages). Consistent internally; if the live EDS site must resolve the
    exact double-hyphen URL, a DA-side redirect/alias may be needed.
  - Section-nav is emitted as a FLAT `<ul>` (source nests the current industry as a parent `<li>` with
    sibling sub-items); flattening keeps all links but drops the visual parent/child nesting. Cosmetic.
  - `products/trisyl-xge-catalyst` source now 301s (removed/relocated) — unrelated to this set; the stale
    on-disk product file was kept.
- **validation:** 3 reps visually gated vs live grace.com (beverage = detail+table+category; wood =
  detail+geo-hex; plastics-and-polymers = landing/no-nav). All 102 imported, byte-size audit found 0
  tiny/empty pages. a11y passed on all 3 reps. Prove-no-regression: silsol/ludox products reimport →
  identical block classes (byte deltas were pre-existing on-disk/older-bundle drift, not from these edits).
- **import note:** onLoad hydration wait makes pages slow (~60-70s/page) → imported in batches of 5
  (20 chunks). A large single run times out ~10 min and a page can serialize empty under load.
- **REVISION 2 (2026-08-13, post-visual-review fixes):**
  - **Breadcrumb:** industries pages emit `breadcrumb-title` = the SOURCE breadcrumb's last crumb
    (captured pre-cleanup, e.g. "Refining Technologies"), so hero.js shows the URL-derived label, NOT
    the hero H1 ("FCC Catalyst and Additive Solutions"). hero.js unchanged (newsroom keeps og:title).
  - **ART featured teaser:** parser now emits `Columns (horizontal-teaser, featured-products)`
    (variant + option, matching draft + columns.css) instead of the merged `horizontal-teaser-featured`
    token that failed columns.js getVariant() → block stayed undecorated white. Now slate cards.
  - **Latest Insights band:** split `geo-hex` (source `.geoAndHex` → hexagons) from `gray-band`
    (source `.light-gray-bkgd` only → PLAIN gray, no hexagons). Most industries pages are plain gray.
  - **NEW section styles (styles/lazy-styles.css):** `gray-band` (light-gray fill rgb(230 231 232))
    + `blue-border` (5px #004990 top/bottom bars). Full-bleed re-inset for sidebar pages in
    templates/sidebar/sidebar.css. Draft samples: content/drafts/section-gray-band.plain.html,
    section-blue-border.plain.html.
  - **Section tagging:** captured pre-cleanup fingerprints of `.light-gray-bkgd` content boxes,
    category grids inside light-gray, and `.divider-line`-bracketed content → tag rebuilt sections
    `gray-band`/`blue-border`. sectionizeFlatBody now splits leaf runs at those fingerprints so each
    banded content run becomes its own section.
  - RUNTIME additions: blocks/hero/hero.js unchanged; styles/lazy-styles.css + templates/sidebar/sidebar.css.
  - Verified on refining-technologies (breadcrumb, ART slate, Broad-Catalyst gray full-bleed) +
    unipol-pp-process (gas-phase gray-band, PCF blue-border, Latest-Insights gray). a11y green; products
    prove-no-regression identical. Full 102-page reimport with this bundle in progress.
- **REVISION 3 (2026-08-13, full clean reimport — no source changes):** regenerated catalog
  (`gen-catalog-module.py`) + rebundled; the bundle came out BYTE-IDENTICAL (170847 bytes) to the rev-2
  frozen snapshot — confirming the importer source was already fully in sync (the interim mobile-parity
  work was all RUNTIME CSS/JS: styles.css, hero.css, header.css, templates/sidebar/*, which do NOT change
  importer markup). Re-ran the ENTIRE set (102 URLs) via 4 parallel `run-bulk-import.js` chunks
  (24+23+27+28) — **102/102 saved, 0 failures**, and `git status` showed **0 changed content files**
  (every page reproduced byte-identically). This retires the earlier interrupted reimport: all 101
  on-disk industries pages are now provably current. The `atob`/base64 + <90% completeness console
  warnings are known false-lows from the source carousel/duplicate-card markup, not dropped content.
  Coverage audit: 74 gray-band, 1 blue-border, 78 sidebar-template, 0 geo-hex (correct — industries
  Latest-Insights bands are plain gray; geo-hex only on `.geoAndHex` sources = products/insights).
  No re-snapshot needed (live bundle == frozen backup).
- **REVISION 4 (2026-08-14, published to live + visual QA against source + 3 parser/block fixes):**
  All 102 published to `main--ema-grace--meejain.aem.live` by the client. Ran a live-vs-source parity
  pass: headless structural sweep (`tools/importer/compare-eds-vs-source.mjs`), a systematic per-page
  card-grid audit (`audit-cardgrids.mjs`), and a FULL 204-screenshot visual montage
  (`shoot-pairs.mjs` + `build-montage.sh` → `shots/`, gitignored). Findings +fixes:
  1. **Imageless promotion card-grids dropped/undecorated** on 18 pages (refining + plastics subtree) —
     the earlier full reimport ran with the pre-fix bundle. FIX in import-grace-master.js: relaxed
     `isCategoryGrid` (accept `a.cmp-card` not only `.bio`; ≥1 card; image OPTIONAL; keep the `>.heading`
     + no-`.spt-copy` guards so hub/product/related grids are untouched) + the cards-category-grid shape-2
     matcher `:has(a.cmp-card)`. Reimported the 18. PROMOTION-leak now 0/102.
  2. **category-grid phantom images** — imageless cards kept an EMPTY leading image `<div></div>` that
     rendered as a blank gap. FIX (RUNTIME, blocks/cards/cards.js): drop empty cells per card. Global.
  3. **banner-resource-download rendered image-only (no CTA)** — parser built `cells:[[c1,c2]]` (1 row/
     2 cells) but the block's decorate() reads rows[0]=image, rows[1]=content → content dropped. FIX
     (tools/importer/parsers/banner-resource-download.js): `cells:[[c1],[c2]]` (2 rows, matches the
     drafts sample). Reimported the 17 refining pages carrying the banner.
  Rebundled → **170850 bytes** (this frozen backup refreshed to match). Everything else visually in
  parity across all clusters. TWO cosmetic non-defects left (design variants, not fixed): landing
  Featured-Products layout; biofuels benefit icons monochrome vs source green (Scene7 param).
  KNOWN-OPEN: `/industries` ROOT is 404 on live (on disk, not in client publish list → needs DA publish).
- **REVISION 5 (2026-08-15, sidebar-nav parity pass — nested nav + promo card + banner de-dup):**
  Deep visual QA of the left-nav (sidebar-template) pages against source, driven page-by-page on
  refining-technologies/fcc-catalyst-application/resid-conversion, then rolled out to all 78
  sidebar-template industries pages. Fixes:
  1. **NESTED section-nav** — importer `buildSidebarNav` builds a parent-hub `<li>` + nested child
     `<ul>` when the SOURCE nav nests (source `.collapse` sub-list); flat fallback when the source
     nav is genuinely single-level. Result across 78: 70 nested, 8 flat (agriculture ×2,
     custom-catalysts, unipol ppartner-program, hydroprocessing ×4 — all verified single-level or
     nav-less in source, NOT regressions).
  2. **Iron Tolerance promo card** — new `buildSidebarPromoCard()` extracts the left-column
     whitepaper promo (`.embed img` + heading link) and emits a `Cards (industry)` block appended to
     the nav section. Only resid-conversion carries it in source (verified: sibling FCC pages do NOT —
     the earlier "ironsolution" hits were false positives from the global nav-menu JSON blob). DAM
     image src absolutized to `https://grace.com/content/dam/…` (root-relative 404s on the EDS host).
  3. **banner-resource-download DE-DUP** — parser emitted TWO identical "Download Issue" links (the
     description-paragraph sweep grabbed the gated-modal's duplicate anchor, then the CTA was added
     again). FIX: skip any `<p>` that already contains a link/button, scope description to
     `.subhead-large/.text` (not the modal's nested `.content`), and pull the CTA from `.buttons`.
     dup-download now 0/78.
  - RUNTIME (templates/sidebar/*, blocks/cards/*): nested-nav CSS (parent 900/bordered top+bottom,
    children 500/indented), promo-card styling (image within nav column + divider borders on desktop,
    centered ~330px + 10px gutter on mobile, underlined 16px link, no chevron), and sidebar.js mobile
    `<select>` now collects nested anchors (flat-only selector had blanked the mobile nav). Nav +
    content top-aligned (both margin-block 50px desktop).
  - Rebundled → **173453 bytes** (frozen backup NOT yet refreshed — do so at publish time).
  - **NOT yet published to live** — awaiting client go-ahead. resid-conversion validated desktop+mobile
    by the client; coatings/wood spot-checked (nested nav renders, top-aligned). Full 78 reimported
    on disk (78/78, 0 failures).
- **snapshot date:** 2026-08-14 (rev 4 — QA-fixed bundle 170850, published to live).
  rev 5 bundle (173453) is the working tree; refresh this frozen backup when rev 5 is published.
