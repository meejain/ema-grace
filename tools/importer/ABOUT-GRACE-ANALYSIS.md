# about-grace — family analysis (richness tiering + representative set)

Per MIGRATION-PLAYBOOK §3: cluster by RENDERED template, rank richness BY LOOKING (not raw counts).
39 URLs from `about-grace-urls.txt`. Rendered-DOM scan: `about-grace-richness.mjs` →
`reports/about-grace/richness.json`. **The automated score inverted reality on several pages exactly
as the playbook warns** — `our-history` (a ~40-item timeline) scored 1; the two card-grid landings
scored 0-2 — so the tiers below are corrected by VISUALLY inspecting candidates in the browser.

⚠️ **Chrome-leak caveat:** the identical `accordion:8 / mediaCallout:2 / cardList:2 / quote:1`
signature that appears on ALL 20 location pages AND several section pages is the shared MEGAMENU
HEADER + FOOTER chrome captured by the `article` selector, NOT page content (confirmed by looking at
Houston: a location page's real content is nav-select + ONE columns block + intro + a small list).
Real content signal = heading counts + images + text length + tables + confirmed structure.

## Template clusters (by rendered layout)

| Cluster | Count | Template | Shape |
|---|---|---|---|
| **location detail** | 20 | Location Detail (sidebar) | nav-`<select>` + address/jobs-CTA/photo **columns** block + intro paragraphs + "Info" list. Thin + uniform. |
| **leadership bio** | 9 | Profile Detail | image-left **columns (profile-detail)**: photo + H1 name + H4 title + prose + "Latest Insights" featured-content carousel. Thin + uniform. |
| **section pages** | 5 | sidebar / rich content | awards, community, EHS, sustainability, this-is-grace — varied richness. |
| **history** | 2 | sidebar | our-history (timeline) + asbestos-trusts (prose sub-page). |
| **landings** | 2 | grid | leadership-team (9 profile cards + featured), locations (20 location cards). |
| **root** | 1 | grid | about-grace: 8 section-link cards. |

## Richness tiers — 5 representatives each (the visual-walk / contract-driving set)

### LARGEST / richest 5 — these DEFINE the full block contract the importer must cover
1. **`/about-grace/this-is-grace/`** — sidebar-nav + **5× alternating Columns (image-left/image-right)**
   + intro rich-text. 9206 chars (richest by text). Confirmed by look.
2. **`/about-grace/our-history/`** — sidebar-nav + **~40-item dated TIMELINE** (year H2 + paragraph +
   photo per item; history-item / image-columns) + intro + closing. Confirmed by look. Richest by block count.
3. **`/about-grace/leadership-team/`** (landing) — hero + **Cards profile-grid (9)** + **Cards
   featured-content "Latest Insights"** carousel. Confirmed by look.
4. **`/about-grace/locations/`** (landing) — hero + **Cards location-grid (20)** + intro (42 images).
5. **`/about-grace/environmental-health-and-safety/`** — sidebar-nav + **8 content sections (8 h2)**,
   text-heavy multi-section rich page (5292 chars). [confirm internal blocks at build]

### MEDIUM 5 — mid-complexity section / sub-pages
1. **`/about-grace/community/`** — sidebar-nav + multi-section, 4 h3 + 3 h4 + 5 images (5234 chars).
2. **`/about-grace/sustainability/`** — sidebar-nav + 4 h4 + **1 data table** + image (2766 chars).
3. **`/about-grace/awards-and-recognition/`** — list-heavy: 2 h2 + 7 h4 + 26 `<li>` (2585 chars).
4. **`/about-grace/our-history/asbestos-trusts/`** — history sub-page: 1 h2 + 5 h3 + prose + list (3818).
5. **`/about-grace/`** (root) — **Cards grid** of 8 section-link tiles (thin text, card landing).

### LEAST / thinnest 5 — the uniform thin templates (bulk of the family)
Representatives drawn from the two big uniform clusters (their siblings are near-identical):
1. **`/about-grace/locations/houston/`** — nav-select + 1 columns block + intro + info list (~1500 chars). Confirmed.
2. **`/about-grace/locations/aiken/`** — location detail (1981 chars).
3. **`/about-grace/locations/tyrone/`** — location detail (2571 chars).
4. **`/about-grace/leadership-team/mark-cluff/`** — bio: profile-detail columns + featured-content. Confirmed.
5. **`/about-grace/leadership-team/anthony-yoo/`** — bio (1404 chars).

## Block contract (draft — reuses existing blocks; confirm vs catalog at build)
- **Hero (banner)** breadcrumb+title (landings/section pages) — reuse.
- **sidebar template** + section-nav `<select>` (location/bio/history/section pages) — reuse products/industries sidebar.
- **Columns (profile-detail)** — bio pages (already built: `columns-profile-detail`, validated on anthony-yoo).
- **Columns (location-detail)** — location pages (already built: `columns-location-detail`).
- **Columns (image-left / image-right)** — this-is-grace alternating sections (already built).
- **Cards (profile grid)** — leadership landing (already built: `cards-profile-grid`, validated on leadership).
- **Cards (location grid)** — locations landing (already built: `cards-location-grid`, validated on locations).
- **Cards (featured-content)** "Latest Insights" — bios + landings (already built).
- **history-item / timeline** — our-history (`columns-history-item` built; confirm the ~40-item timeline shape).
- **Table (data-grid)** — sustainability (already built).
- Root/landings card grids for section links.

**Read:** nearly everything REUSES blocks already built for products/insights/industries. The one to
scrutinize is the **our-history timeline** (is `columns-history-item` sufficient for ~40 dated items,
or does it need a variant?). NEW blocks look unlikely — confirm at build against `component-library.json`.

---

## BUILD OUTCOME (2026-08-18) — all 39 pages migrated ✅

**Dispatch (importer):** added `isAboutGraceDetailPage()` — `/about-grace/*` pages WITH a source
section-nav → the same rich pipeline as industries-detail (`buildDefaultPage` + `forceTemplate:sidebar`
+ nav-rail injection + `sectionizeFlatBody`) → `template: sidebar`. Pages WITHOUT section-nav
(leadership-team landing, root, awards, bios) → plain default path. **Template choice was
LIVE-MEASURED, not assumed:** this-is-grace renders nav-rail(280px)-left + content(880px)-right at
1280px = the SIDEBAR shape, NOT contactus (contactus has no left rail; the nav only collapses to a
dropdown on mobile). So the user's "contactus" instinct → corrected to `sidebar` per the "whichever
template matches, use that" rule.

**Two importer fixes made during sample validation:**
1. `buildDefaultPage`: emit the `template` metadata row when `forceTemplate` is set even WITHOUT a
   contact widget (about-grace sidebar pages have no CU widget, so the old `hasCU`-gated branch never
   emitted `template: sidebar`).
2. `sectionizeFlatBody` gate extended to `forceTemplate === 'sidebar'` so about-grace sidebar pages
   get per-block sections (nav rail in its own section; stacked image-left/right columns separated).

**One shared-parser fix (`_columns-utils.js` `cellNodes`):** an image-only wrapper (`.media-callout`
holding just the headshot + an empty video-modal shell) was emitted IN ADDITION to the standalone
`<img>`, duplicating the leadership-bio profile photo. Fixed the `textEls` filter to exclude a
wrapper whose only substantive node is the already-captured image. Verified no regression on the
this-is-grace image-left/right rows.

**Block emission (verified on samples):** this-is-grace → hero banner + columns image-left/right;
our-history → hero banner + columns history-item (14 blocks); locations/* → columns location-detail;
leadership-team → hero banner + cards profile-grid + cards featured-content; bios → columns
profile-detail + cards featured-content; root → hero banner + cards product. All REUSE existing blocks.

**Regression proof (§3 step 8):** newsroom byte-identical to baseline; insights + industries
byte-identical between the rev7 (pre-about-grace) bundle and the new bundle (any diff vs older
on-disk baselines is pre-existing hydration nondeterminism, reproduced by BOTH bundles). products
trisyl now 301-redirects on grace.com (source removed — unrelated to this work; on-disk baseline
preserved). Quality gate: `npm run lint` exit 0, breakpoint-check passed. No runtime CSS/JS changed.

**Audit:** 39/39 pages, 0 tiny/empty/404. Bundle 193721 bytes.

**STILL LOCAL-ONLY — not published to DA** (awaiting client go-ahead per playbook §0).
Backup of the new bundle + `backups/about-grace/` snapshot still TODO.

---

## VISUAL + CONTENT PARITY PASS (2026-08-19) — no content/image loss

Ran a headless local-vs-LIVE parity audit over all 39 pages (`about-grace-parity.mjs` →
`reports/about-grace/parity*.json`): renders both sides at 1280×900, waits for hydration, scrolls to
trigger lazy images, and diffs ordered content inventory (headings, paragraphs, images+naturalWidth).
First pass: 16 OK / 23 MAJOR. After fixes: **37 OK / 2 false-positives**.

**3 systemic defects found + fixed (all in the shared importer — rebundled, regression-proven):**

1. **Location detail photo dropped (all 20 location pages).** The `columns-location-detail` MATCHER
   (`section .row` broad) returned the OUTER col-lg-3/col-lg-9 layout wrapper (first querySelectorAll
   hit) instead of the inner col-lg-6/col-lg-6 address+photo row, so buildTwoColumn split it as
   [empty nav | everything] and the photo was lost. FIX: (a) tightened the catalog SELECTOR to
   `section.none-bkgd .row:has(> [class*="col-lg-6"] .button):has(> [class*="col-lg-6"] .image)`;
   (b) added an "innermost row wins" filter to the matcher (drop a matched row that contains another
   matched row). Now the photo (Scene7 carrier) lands in cell 2. Verified img naturalWidth=800 on render.
   Also hardened `materializeLazyImages` + an onLoad `data-eds-src` stash + a bounded image-hydration
   wait for `.cmp-image` components whose Scene7 src is JS-injected (belt-and-suspenders).

2. **community: 5234→1497 chars content loss (the LCA-swallow bug).** `cardGridContainers` computed
   the lowest-common-ancestor of 4 scattered `.col-lg-6` image-text cards = the ENTIRE col-lg-7 content
   column (5234 chars incl. 7 rich-text headings, accordions, tables); the parser's
   `element.replaceWith(block)` then destroyed all of it, emitting only a 4-card grid. FIX: guard in
   `cardGridContainers` — if the LCA is a wide content column (`col-lg-7/8/9/10/12`) or carries far
   more text than the items themselves, regroup by the tight per-`.row`/`.card-list` wrappers instead
   of returning the whole column, so surrounding rich-text/accordions survive as default content.
   community recovered to 5770 chars, all headings present. **Regression-proven: industries beverage /
   purification card-grids + insights + newsroom all byte-identical block structure after the change.**

3. (Earlier, from the build pass) leadership-bio profile photo duplicated — fixed in `_columns-utils.js`
   `cellNodes` (image-only wrapper no longer double-emitted).

**2 remaining parity "MAJOR" flags are FALSE POSITIVES (verified by hand):**
- `locations` landing: harness text 3261 vs 5110 — but the page has ALL 29 Tel: addresses (29/29 vs
  source), every region list + detailed card (Aiken…Worms, incl. no-detail-page sites like Chennai,
  Hong Kong, Singapore, Dubai, Poznań), region headings + Legend. The delta is the harness's
  breadcrumb/contactus text filters + duplicated mobile markup, not content loss.
- `our-history`: 13 vs 14 images — the "missing" one is the source's **Print icon** (chrome), not
  content. All 26 real content images + 14 history-item year blocks present.

**Final audit:** 39/39 pages, 0 tiny/empty. Bundle 196697 bytes. Quality gate: lint 0, breakpoint pass.
All fixes LOCAL-ONLY — not published to DA. New `backups/about-grace/` snapshot still TODO.

---

## LAYOUT FIX (2026-08-19) — profile-detail cell order (all 9 leadership bios)

Reported: the bio profile-detail block rendered "off" — the headshot blew up full-width with the
name below it, and the bio dropped into a separate gray band (block NOT decorating), unlike the
working draft and the source (image-left / name+title+bio-right).

ROOT CAUSE: the importer emitted the profile-detail block with the IMAGE cell FIRST (source authors
the `.col-lg-4` headshot before the `.col-lg-8` text). A `columns` block whose FIRST cell is a lone
image is treated as an AUTO-HERO by the runtime, so `blocks/columns/columns.js decorateProfileDetail`
never ran → no img-col/text-col classes → the CSS side-by-side layout never engaged. The draft works
precisely because it authors TEXT first, IMAGE second (columns.css pulls the image left with
`order:-1`, expecting image-second).

FIX (`tools/importer/parsers/columns-profile-detail.js`): detect the image cell and, when it is
authored first, re-emit the block as ONE row of TWO cells `[text, image]` (matching the draft).
Verified: cell 1 now leads with `<h1>` on all 9 bios; block decorates; at 1280px the block is
side-by-side (img-col 400px left @x=40, text-col 760px right @x=480, aligned top), image loads.
Regression scope contained — only leadership bios use `columns-profile-detail`. Quality gate green
(lint 0, breakpoint pass). Bundle rebundled; all 9 bios reimported. LOCAL-ONLY (not published).

---

## VISUAL POLISH PASS (2026-08-19, cont.) — per-page review fixes

All fixes below verified via headless measurement against LIVE grace.com at matching viewport.
Runtime CSS changes are in the repo (apply at render, NO reimport); importer/parser changes were
rebundled. Everything LOCAL-ONLY — not published to DA.

**IMPORTER/PARSER (rebundled):**
1. **cards-product — stray "PROMOTION" eyebrow + duplicate title in card body**
   (`parsers/cards-product.js`). Section-landing cards (about-grace root: 8 topic tiles) carry only an
   eyebrow `.h5` ("PROMOTION") + a `.h4.title` in `.spt-copy` — no real description. The old parser
   dumped both into the card body (so each card showed "PROMOTION" + the title twice). FIX: the `rich`
   filter now EXCLUDES `.h5` (eyebrow) and `.h4.title`/`.title`/`.h4` (the title, already emitted as
   the card `<h3>`), and the raw-text fallback is guarded by `anyStructured` so it only fires for
   genuine bare-text bodies. Verified: about-grace root PROMOTION count = 0; homepage product-tile
   descriptions ("Purify your processes…" etc.) preserved. Regression scope = any `cards-product`.

**RUNTIME CSS (repo, no reimport):**
2. **about-grace root card grid — 3-per-row** (`blocks/cards/cards.css`). Base `.cards.product` is a
   4-across row (homepage's 4 product tiles). The about-grace root has 8 tiles and the source lays
   them out 3-3-2. Added `@media (width >= 900px) .cards.product:not(.cta):has(> ul > li:nth-child(5)) > ul
   { grid-template-columns: repeat(3, minmax(0,1fr)) }` — any product grid with a 5th tile is a
   section landing → 3-up. Homepage (exactly 4) unaffected; insights `.cta` (3) and benefit grids
   (exactly 3) excluded. Verified 3-3-2 on migrated, matches source.
3. **banner-hero header gap** (`styles/styles.css`). Imported `.hero.banner` image bands sat flush
   against the fixed header. Added `main > .section.hero-container:has(> .hero-wrapper > .hero.banner)
   { margin-top: var(--spacing-l) }` → 50px gap below header. Scoped to `.hero.banner` so the
   homepage's intentionally full-bleed `.hero` (no `.banner`) stays flush (verified gap=0).
4. **leadership bio alignment/spacing** (`blocks/columns/columns.css`, `blocks/breadcrumb/breadcrumb.css`).
   Breadcrumb, headshot, and title aligned to the GRACE-logo vertical line (bio-page-scoped
   `padding-inline: 20px; max-width: 1240px`); breadcrumb weight 400→600; breadcrumb→header gap 45px
   (source), profile block `margin-top: 68px` (was over-tight). Global container change was tried and
   REJECTED by the user — reverted; fix is bio-scoped only.
5. **section-page + text-only sidebar layout** (`templates/sidebar/sidebar.css`). About-grace sidebar
   pages: left nav rail + wide right content; about-grace image exception keeps images in
   `grid-column: 3/5` (not diagram 2/5, which broke the grid); no-widget pages span content across
   `3/5`. asbestos-trusts (text-only) routed to `buildSidebarPage` with fixed `extractMainContent`
   (gathers ALL outermost `.rich-text/.text` boxes, was dropping ~85%).

**Quality gate this pass:** `npm run lint` exit 0 (only pre-existing `no-console` warnings in
unrelated form/test files), `node tools/quality/breakpoint-check.mjs` PASS, stylelint on changed CSS
exit 0. Bundle rebuilt clean (201790 bytes) with all latest logic present (anyStructured,
isAboutGraceTextSidebar, isAboutGraceDetailPage, sourceFeaturedHasGeoHex, materializeLazyImages).

**Known pre-existing warning (not introduced here):** `import-grace-master.js` defines
`columns-checklist` twice (lines ~318 broad `.text ul, .rich-text ul` and ~398 narrow `.text ul`).
esbuild keeps the LATER (narrow) one — which is what all validated industries/products pages were
tested against. Left as-is to avoid regressing validated families; flagged for future cleanup.

---

## VALIDATION STATE — about-grace (what's done, what remains)

**DONE (visually gated vs live source):** bios (profile-detail + breadcrumb + geo-hex + alignment),
section pages (this-is-grace, community, EHS, sustainability — sidebar nav + wide content),
our-history (timeline), asbestos-trusts (text-only 3-col sidebar), locations landing + location
details (photos restored), leadership-team landing (profile-grid + Latest Insights), about-grace root
(3-3-2 card grid, title-only, header gap). Parity harness: 37 OK / 2 false-positives. 39/39 imported,
0 tiny/empty/404.

**REMAINING before sign-off:**
- ~~Full a11y sweep on 3-4 representatives~~ ✅ DONE (2026-08-19): `npm run test:a11y` PASSED on all 4
  reps — about-grace root, this-is-grace (section page), anthony-yoo (bio), aiken (location detail).
  (Chromium headless shell had to be installed first: `npx playwright install chromium`.)
- Optional: user visual spot-check of any not-yet-reviewed section page (awards-and-recognition).
- PUBLISH TO DA is still GATED on explicit client go-ahead (playbook §0). Nothing pushed/committed.
- Product hubs must NOT be reimported (hand-reconstructed; reimport degrades them).
