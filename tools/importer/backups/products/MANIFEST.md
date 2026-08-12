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
- **~~KNOWN GAP~~ CLOSED 2026-08-12:** the 2 hubs (synthetic-silicas, catalysts) that missed the
  late-hydrating product-list were reconstructed BY HAND from the LIVE source DOM (two `<ul>` groups
  + nested sub-items + `<strong>` product names + suffix text), plus hero bg images
  (`sc_catalysts_employee_v2`, `mt-synthetic-silicas-worms-employee-flipped`). These are content-side
  edits to `content/products/{catalysts,synthetic-silicas}.plain.html` (NOT in the bundle — the
  bundle still produces the pre-hydration skeleton; re-running it will NOT reproduce these lists).
- **ADDITIONAL RUNTIME fixes since snapshot (2026-08-11/12, NOT in bundle):**
  - `styles/lazy-styles.css`: `geo-hex` selector broadened to `.cards.category-grid` (vyvid
    Purification Solutions); NEW `gray-callout` GLOBAL section style (product-stewardship reps panel).
  - `templates/sidebar/sidebar.css`: product-hub-scoped sidebar-nav `<li>` dividers (1px #c4c4c4 +
    12px pad), 50px hero→content gap kept for hubs (insights alignment rules scoped to
    `.breadcrumb-container`), gray-callout gap tightening.
  - `blocks/columns/columns.css`: `body.contactus .columns.image-right` uncropped-diagram override
    (trisyl-silica benefits + circular chart).
  - `blocks/video/overlay.js` + `video.css`: video-overlay title/scrim.
  - Several content-side hand-edits verified but PENDING DA publish (product content is proxied from
    remote DA, so edits don't render on localhost/preview until uploaded).
- **import note:** onLoad hydration wait makes pages slow → import in batches of ~5 (a 28-page run
  times out ~10 min and a page can serialize empty under load; audit byte size after). HUB lists that
  don't hydrate in time: reconstruct from LIVE source DOM, not the `/tmp/qa-src` cache.
- **snapshot date:** 2026-08-10 (bundle); hub + runtime deltas logged 2026-08-12.
