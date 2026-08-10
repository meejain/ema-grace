# products — importer snapshot
- **set:** products (34 pages: 28 Product Detail + 6 category HUBs)
- **bundle:** import-grace-master.bundle.js (frozen; the live bundle that produced this set)
- **bundle provenance:** committed at `bd7bc39` ("Add hero block, update importer"); working tree clean at snapshot.
- **contains (delta over newsroom bundle):**
  - Hero parser: emits `Hero (product)` for reduce-height heroes WITH a CTA (`.button__section`);
    decodes gated-modal base64 download hrefs; captures the bare-`<p>` product subtitle.
  - `buildDefaultPage`: emits `template: contactus` + `contactus`/`contactus-tagline` (captured
    PRE-cleanup via `params.sourceHadContactWidget`/`contactWidgetTagline`).
  - `normalizeGatedDownloads`: gated `<button>` → `<strong><a>` link (base64 decode); strips leaked
    gated forms (`.lightbox-container`/`.gated-asset-simplified`/`form.gated`).
  - `sectionizeFlatBody` (gated to `hasCU`): flattens the default body into one `<div>` section per
    block so block `*-container` styling can't stack (fixes the columns hexa bleeding across the page).
  - cards-product matcher unions hub product-nav grids + plain-row `.cmp-card.bio` benefit grids;
    parser preserves `.spt-copy` bullet lists.
  - video-overlay parser reads the YouTube embed from `.media-callout .media-modal .active-video`
    and normalizes to `watch?v=`.
  - cards-featured-content: heading + "View all articles" emitted when `params.emitFeaturedHeading`.
  - columns-horizontal-teaser: emits the `.subhead-large` intro H2 above the teaser cards.
- **RUNTIME fixes (NOT in the bundle — in repo, apply at render):** `blocks/hero/hero.css`
  (`.hero.product h1 { display:block }`; image-banner gradient overlay), `templates/contactus/`
  (`contactus.css` narrow-left column; `contactus.js` groups adjacent download buttons into a
  centered `.button-group`).
- **URL list:** `urls.txt` (34 — 28 detail + 6 hubs).
- **KNOWN GAP:** 2 hubs (synthetic-silicas, catalysts) miss a late-hydrating product-list.
- **import note:** onLoad hydration wait makes pages slow → import in batches of ~5 (a 28-page run
  times out ~10 min and a page can serialize empty under load; audit byte size after).
- **snapshot date:** 2026-08-10
