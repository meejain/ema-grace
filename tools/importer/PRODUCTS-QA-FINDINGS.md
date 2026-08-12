# Products QA — running findings log

Live running log of fixes needed for the **products** family, gathered by comparing RENDERED source
(grace.com) vs RENDERED migrated (production preview `main--ema-grace--meejain.aem.page`) region by
region (method = MIGRATION-PLAYBOOK §4b). **Do NOT start fixing until the whole set is walked** — we
are still collecting. Each item tagged with the LIKELY fix layer:

- **[IMPORTER]** structure/naming/selection/content — needs parser/transformer/catalog edit → rebundle + reimport
- **[RUNTIME]** styling/decoration — `blocks/*`, `templates/*`, `scripts.js` → applies on reload, no reimport
- **[?]** root cause not yet confirmed — investigate before deciding layer

Status legend per page: ✅ OK · ⚠️ COSMETIC · ❌ MAJOR. Provenance: audit batches 1–4 (34 pages) +
user spot-checks (dated).

---

## FIX LOG (this iteration — RUNTIME first, local-only, validate on 127.0.0.1:3000 vs source)

- ✅/🔁 **geo-hex hexa background — CSS globalized (runtime done); trigger needs importer.**
  CORRECTED APPROACH (my first attempt wrongly invented a flat gray-band rule keyed to cards — reverted).
  The right model: `geo-hex` is a SECTION-LEVEL style. Source wraps certain sections in
  `section.light-gray-bkgd.geoAndHex` → importer emits Section Metadata `Style: geo-hex` → aem.js adds
  the `geo-hex` class to the `.section`. The hexa treatment (full-bleed gray band + white hexagon top
  edge + geo-line network, using blocks/columns/teaser-*.png) must then apply to the WHOLE section
  regardless of block or template.
  - **RUNTIME (DONE):** moved the geo-hex CSS OUT of `templates/sidebar/sidebar.css` (was locked to
    `body.sidebar main > .section.cards-container.geo-hex:has(.cards.featured-content)`) INTO
    `styles/lazy-styles.css` keyed on **`main .section.geo-hex`** — now global, block-agnostic,
    template-agnostic. sidebar.css keeps ONLY its desktop grid re-inset (widget-gutter specific).
    Verified: insights 80-years-of-fcc (has geo-hex) still renders full treatment ✅; product activcat
    with `geo-hex` added → renders band + both hex PNGs ✅ (body.contactus). lint:css + breakpoint ✅.
  - **⚠️ CSS REVERTED 2026-08-11 (user request):** the global-CSS move (lazy-styles.css) was REVERTED
    because it changed the approved insights hexa spacing. `styles/lazy-styles.css` +
    `templates/sidebar/sidebar.css` are back to original HEAD — geo-hex CSS is again `body.sidebar`-scoped
    ONLY. CONSEQUENCE: the importer now EMITS `Style: geo-hex` on product featured-content sections, but
    there is NO product-facing CSS for it (products are body.contactus), so the hexa band does NOT render
    on product pages yet. To finish product hexa WITHOUT touching insights: add a SEPARATE product-scoped
    rule (e.g. `body.contactus main .section.geo-hex` / `body:not(.sidebar)`) in a product/global sheet,
    tuned so it does NOT alter the sidebar rules. Deferred — revisit after the other importer fixes.
  - **IMPORTER (DONE):** `import-grace-master.js` — `transform()` captures `params.sourceFeaturedHasGeoHex`
    pre-cleanup (`.featured-blog-cmp` inside `.geoAndHex`/`.light-gray-bkgd`); `buildDefaultPage` finds
    the `Cards (featured-content)` block section post-sectionize and appends `Section Metadata Style=geo-hex`
    when the flag is set. NOTE: createBlock humanizes the header to "Cards (featured Content)" — matcher
    regex tolerates hyphen/space/case. Rebundled (verified `sourceFeaturedHasGeoHex` in bundle, debug
    removed). Reimported activcat → `.plain.html` now carries `<div class="section-metadata">Style geo-hex</div>`
    on the featured-content section ✅ (structurally verified on disk). Per-source gating confirmed working.
    RENDER verification blocked by local dev-server instability (won't hold listener) — CSS half proven
    separately (JS-injected geo-hex class → full hexa band). Will show on preview once reimported pages
    are on DA, or when the dev server is stable.

- ✅ **DONE — trisyl-xge benefit cards too thin.** `blocks/cards/cards.css`: added
  `@media(>=900px){.cards.product:not(.cta):has(> ul > li:nth-child(3):last-child) > ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`.
  The 3 benefit cards (`.cards.product`) were squeezed into 3 of 4 tracks (~1/4 width → bullets
  wrapped every 2-3 words). Now 3 even 288px columns @1280. Verified ✅. Safe: matches ONLY exactly-3
  grids (homepage 4-card grid unaffected) and excludes `.cta` insights variant.

- 🔁 **RECLASSIFIED to IMPORTER — shieldex teaser black background.** NOT a runtime miss. The block
  was emitted as `Columns (horizontal-teaser-featured)` → single hyphenated class
  `columns horizontal-teaser-featured` → no decorator runs (not in columns.js VARIANTS), no styling.
  The CORRECT class is `columns horizontal-teaser featured-products` (as the DRAFT uses) — ALL the
  black/slate CSS + JS already exists for that. Root cause: parser
  `tools/importer/parsers/columns-horizontal-teaser-featured.js` emits the wrong name (violates the
  `Name (variant, option)` rule). FIX in importer pass: emit `Columns (horizontal-teaser, featured-products)`
  → reimport shieldex. (Runtime CSS confirmed already correct at `.columns.horizontal-teaser.featured-products`.)

- 🔁 **RECLASSIFIED to IMPORTER — shieldex brochure-promo duplicate image.** The dup is baked into the
  `.plain.html` (same `shieldex-silica-brochure-cover` `<picture>` emitted TWICE in the brochure-promo
  block). Parser bug → reimport. NOTE the brochure-promo section-background half MAY still be runtime;
  re-check after reimport.

- ✅ **DONE — stray mid-page "Home / Products" breadcrumb (syloid-mx, syloid-rad, reflectn).**
  `scripts/scripts.js`: gated `buildBreadcrumbBlock` + `buildPostMetaBlock` (both insights-rail
  auto-blocks) to `getMetadata('template')==='sidebar'`. Root cause: they ran on EVERY page and the
  rail heuristic (`.social.share` / `.social`) matched the product "Follow Us" block, injecting a
  breadcrumb mid-page. Verified: syloid-rad now has 0 main-breadcrumb blocks ✅; regression — insights
  (template:sidebar) STILL gets its `Home / Insights` breadcrumb + POSTED/INDUSTRY panel ✅. Also
  clears syloid-mx + reflectn (same trigger). Lint back to baseline; breakpoint-check ✅.

- 🔁 **RECLASSIFIED to ENV ARTIFACT (not a defect) — bare breadcrumb `› › › › ›` on all 34 pages.**
  Investigated: this renders in the HEADER `<banner>` region — the nav's own `.chevron` spans
  (blocks/header/header.js:365, 5 chevrons = 5 nav items) showing raw because the header block isn't
  fully decorated in the LOCAL proxied-content preview. Live grace.com header shows proper nav links,
  no bare chevrons. Product-detail pages don't use the breadcrumb block at all (hero handles the
  breadcrumb). So this is a local-preview rendering quirk, NOT a migration defect — no fix needed.
  (Will re-confirm on a properly-served page; drop from the defect list.)

---

## A. Systemic / cross-cutting (fix ONCE, clears many pages)

- **[?] Header breadcrumb renders as bare `› › › › ›` (no labels)** — ALL 34 product pages. On pages
  whose source HAS a top breadcrumb (e.g. trisyl-silica "Home / Products") this is a real regression;
  on the rest it's a stray artifact. One fix in the header/breadcrumb decoration clears every page.
  Likely RUNTIME (header block) — confirm root cause + whether it also hits insights/newsroom.
- **[IMPORTER] Video (overlay) drops its caption title + "Watch the video" text** — the video-overlay
  parser emits the poster/embed but loses the callout's caption title + description. Pages: trisyl-xge,
  syloid-silica, activcat, (vyvid injects a wrong caption). Fix in the video-overlay parser, reimport.
- **[?] Stray mid-page "Home / Products" breadcrumb** injected before a Follow-Us / expert tail
  section, where source has none. Pages: syloid-mx, syloid-rad, syloid-xdp, reflectn. Confirm layer.
- **[IMPORTER] `.pdf` download hrefs rewritten to `-pdf` → 404** — seen on product-stewardship (21
  summary links + one more). Almost certainly a slug/extension normalization bug in a transformer;
  likely affects download links on OTHER families too — check broadly. Reimport affected pages.
- **[IMPORTER] Two-column bullet/heading lists collapse to one full-width column** — where source
  lays content in TWO side-by-side columns, the migration stacks it full-width. Confirmed pages:
  **syloid-mx** (5 application groups: heading+list pairs, item 1 of its detail), **unipol-unippac**
  (9 "key operating metrics" bullets split 5/4). The importer flattens these into a single `<ul>` /
  single column. FIX: recognize the source 2-col layout (`.row > .col-lg-6` or the source's split
  structure) and emit a Columns block (2-col; text-only variant — compare `columns-image-left/right`
  minus image, or provision a plain 2-col text variant if none fits). Reimport. Likely clears both
  pages + any others with source 2-col text.
- **[?] Missing HEXA background band on styled sections** — the source's hexagon/`geoAndHex`
  (`light-gray-bkgd`) decorative band is lost on the migrated page. Confirmed pages: **consista**
  (some section), **activcat-catalysts** ("Latest Insights from Grace" section), **shieldex**
  ("Latest Insights from Grace" section). Per the
  product-detail recipe, the hexa band is keyed in `columns.css` off
  `.columns-container:has(.columns.horizontal-teaser)` — but "Latest Insights" is a
  `Cards (featured-content)` block, NOT columns, so the hexa styling almost certainly isn't attached
  to it. INVESTIGATE: (a) in source, which wrapper carries the hexa band and which block(s) sit inside
  it; (b) does the importer need to emit a section-style/option (e.g. a section metadata `style` or a
  block option) so the runtime can paint the hexa background; (c) is this RUNTIME CSS (add a
  `:has(.cards.featured-content)` / section-style selector) or IMPORTER (emit the section style).
  Likely a shared fix that clears several detail pages — check ALL detail pages for a source hexa band
  once root cause is known (silsol/syloid-rad already carry hexa via horizontal-teaser per recipe;
  featured-content-on-hexa is the newly-found gap).

---

## B. MAJOR ❌ — content loss / broken (importer fix + reimport)

| page (grace URL slug) | issue | layer |
|---|---|---|
| catalysts (hub) | product link-list EMPTY — 0 of ~14 nested product links migrated (JS-hydrated body dropped) | IMPORTER |
| synthetic-silicas (hub) | product link-list EMPTY — 0 of ~15 product families migrated | IMPORTER |
| quality-management (hub) | cuts off mid-sentence: missing certifications bullet list (ISO 9001, HACCP, Halal, Kosher…) + 2 closing QMS paragraphs incl. product-stewardship link | IMPORTER |
| product-stewardship | missing "Animal Testing Policy" H3 + para AND closing contact-reps block (2 mailto links); + the `.pdf`→`-pdf` 404 links (see §A) | IMPORTER |
| trisyl-silica | benefits "chart-trisyl" image broken (`src=about:error`) AND rendered twice; video caption dropped; hero "Skip to safety FAQs ›" links to `/` not the FAQ anchor | IMPORTER |
| syloid-xdp-f-silica | nutraceutical "chart-nutraceutical" chart image MISSING after the "…offering:" heading; source 2-col bordered table rendered as flat two-column-content (borders lost); stray mid-page breadcrumb | IMPORTER |
| vyvid | "Purification Solutions" heading + intro paragraph MISSING above product cards; DAVISIL/VYDAC cards show stray "PROMOTION" label + duplicated title text; video caption wrong; "View all articles" wrong href | IMPORTER |
| metallocenes | intro paragraph under H2 "Stay Competitive. Differentiate Your Portfolio." MISSING (source had it as a non-`<p>` node → importer dropped it) | IMPORTER |
| polytrak-catalysts | two body paragraphs under H2 "A Catalyst that Works for You" MISSING | IMPORTER |
| sylosiv | closing support/collaboration paragraph under "Demand a Higher Standard…" MISSING | IMPORTER |

---

## C. COSMETIC ⚠️ — content correct, polish differs

| page | issue | layer |
|---|---|---|
| trisyl-xge-catalyst | (1) benefits section "Benefits of TRISYL® XGE Catalyst for GE reduction Compared to Alternative Methods" — 3 `cards.product` columns render TOO THIN/NARROW vs source (excessive text wrapping in the bullet lists; see user screenshot 2026-08-11). (2) video-overlay caption dropped (see §A) | RUNTIME (card width) + IMPORTER (video) |
| syloid-mx-silica-series | **(4 sub-issues, user spot-check 2026-08-11)** — see detailed list below | IMPORTER + RUNTIME |
| syloid-silica | video-overlay caption title dropped; description leaks out as stray body copy | IMPORTER |
| activcat-catalysts | (1) video-overlay drops caption title + "Watch the video" [IMPORTER]. (2) **missing HEXA background on the "Latest Insights from Grace" section** (user spot-check 2026-08-11) — see hexa pattern note below | IMPORTER + ? |
| syloid-rad-silica-series | (1) **wrong hero variant — migrated as `Hero (banner)`, should be `Hero (product)`** (user 2026-08-11). Source hero HAS the product signature: `hero-reduce-height` + a CTA (`hero__button`/`button__section`) — same as ludox which correctly got `hero product`. The hero-banner.js discriminator misclassified it. Check why (is the CTA outside the captured hero node? base64/gated button not detected?) and fix so reduce-height+CTA ⇒ product. [IMPORTER, reimport]. (2) stray mid-page "Home / Products" breadcrumb before Follow-Us [?] | IMPORTER |
| shieldex | **(multiple issues, user spot-check 2026-08-11)** — see detailed list below | IMPORTER + RUNTIME |
| reflectn-digital-plant-simulator-software | (1) **MISSING blue tagline banner** (user 2026-08-11, screenshot) — source has a `blue-bkgd banner` band (confirmed source classes: `banner` + `blue-bkgd`) holding ONLY the centered white tagline "REFLECTN™ digital plant simulator is the most realistic and accurate training tool available on the market today for UNIPOL® PP technology." No CTA, no heading — just text on solid blue (#004990). Migrated dropped it entirely (page has `banner contact-split` from the page tail, but NOT this blue band). FIX: emit a banner block for it — first try reusing `banner cta` (draft `content/drafts/banner-cta.plain.html` = title+desc+CTA rows) but that variant expects a CTA; this band is text-only, so more likely needs a NEW banner variant (e.g. `Banner (tagline)` / blue text-only) → provision block variant + draft + CSS (solid blue, centered white text). Decide reuse-vs-new per reuse ladder. [IMPORTER: recognize `banner.blue-bkgd` → emit; + RUNTIME CSS for the variant]. (2) stray mid-page "Home / Products" breadcrumb before Follow-Us [?] | IMPORTER + RUNTIME |
| unipol-unippac-process-control-software | **MISSING 2-column layout for the metrics pointers** (user 2026-08-11, screenshot). Under "UNIPOL UNIPPAC® Process Control Software drives improvements to key operating metrics", source shows the 9 bullets in TWO side-by-side columns (left 5: Throughput increase 5-9% / Off Grade reduction 3-6% / Onstream time 3% / Monomer efficiency improvement 35% / More time for operators…; right 4: Decreased reactor downtime / Improved continuity / More time between reactor cleanings / Fewer unplanned outages). Migrated renders them as ONE full-width `<ul>` (1 UL). Put into a Columns block so they sit side by side. SAME ROOT CAUSE as syloid-mx item 1 → see §A "two-column bullet lists" note. [IMPORTER, reimport] | IMPORTER |
| vydac | **(2 issues, user 2026-08-11, screenshot)** — see detailed list below | IMPORTER + RUNTIME |
| **consista** | **missing HEXA background** on a section (user spot-check 2026-08-11) — investigate which section carries the `geoAndHex`/hexagon band in source and why the migrated page lost it. NOTE: consista was graded ✅ in the batch audit (content complete), so this is a background/styling miss the inventory diff didn't catch | ? |

---

## C-detail. syloid-mx-silica-series (user spot-check 2026-08-11, with source screenshots)

1. **[IMPORTER] "difficult-to-matte applications" grouping should be a COLUMN block (2-up).** Source
   lays the 5 application groups (General Industrial, Coil Coatings, Leather, Industrial Wood, Overprint
   Varnishes) — each a `<h3>` + bullet list — SIDE BY SIDE in two columns. Migrated stacks them in one
   full-width column. Put these heading+list pairs into a Columns block so they render side by side
   (2 columns desktop, stacked mobile). Check which existing columns variant fits (likely a text-only
   2-col; ref `content/drafts/columns-*` — compare `columns-image-left/right` structure minus the image,
   or a plain 2-col). Reimport.
2. **[IMPORTER] The 3 download buttons should be SIDE BY SIDE (button-group), not stacked.** Source
   shows "Download Coatings brochure ›", "Download SYLOID® MX application overview ›",
   "Download SYLOID® Coil Coatings selection guide ›" as a centered row (2 on top row + 1 below,
   flex-wrapped). Migrated stacks them vertically. This is the `groupButtons()` / `.button-group`
   behavior (per product-detail recipe: runs of ≥2 `<strong><a>` button-wrappers → `.button-group`
   centered flex row). Confirm why it's not grouping here (are the buttons separated by other nodes so
   the run breaks?) and fix so they wrap side by side. Likely IMPORTER (adjacency) possibly + RUNTIME CSS.
3. **[IMPORTER] Table mismatch — "SYLOID® MX Silica Generation Applications and Grades".** Source table
   genuinely has **5 columns**: Segment | Technology | System Type | System Type | Suitable Products
   (yes, "System Type" legitimately appears TWICE in the source header — it is NOT a migration
   duplicate; my batch-audit note was WRONG on that). Verify the migrated table reproduces all 5
   columns + every row exactly (Industrial Wood / Coil Coatings / Decorative and Trade Paints / Leather
   rows with their Solventborne/Waterborne/100% UV/… values and SYLOID® MX grade lists). Re-diff
   migrated table vs source cell-by-cell and fix the table parser output.

> **CORRECTION to earlier finding:** batch-1 audit reported syloid-mx table had a "DUPLICATED System
> Type column (5 vs source 4)". That was incorrect — source has 5 cols with two "System Type" headers
> by design. Re-audit the real table fidelity per item 3 above.

---

## C-detail. shieldex (user spot-check 2026-08-11, with source screenshot)

Current migrated blocks (in order): `hero product` · `columns brochure-promo` · `columns
horizontal-teaser-featured` · `cards featured-content`.

1. **[RUNTIME] "SHIELDEX® silica brochure" → use the `columns brochure-promo` block WITH a section
   background.** Block is already emitted as `columns brochure-promo` (correct), but the section
   background/framing is missing vs source — the brochure promo should sit on its own styled section
   band. Compare against the draft sample `content/drafts/columns-brochure-promo.plain.html` for the
   intended look & feel, and add the section background in `blocks/columns/columns.css` (scope to
   `:has(.columns.brochure-promo)`). ALSO the earlier-found bug: brochure-promo image rendered TWICE
   (duplicate) — dedupe [IMPORTER, parser]. Confirm which layer each half needs.
2. **[RUNTIME] "This product is used in the following processes:" cards need the BLACK background.**
   Source (screenshot) shows each teaser card (Coil, General Industrial Coatings) as a `slate-bkgd`
   BLACK band: white bold left title + white description + white `›` arrow on the right, on a hexa
   backdrop section. Migrated emits `columns horizontal-teaser-featured` but WITHOUT the black card
   background. Source signature confirmed: `feature-set-section list` + `slate-bkgd` (×3) +
   `owl-carousel`. The `horizontal-teaser-featured` variant = "featured = slate-bkgd, no img" per
   catalog — so the BLACK styling belongs to this variant; fix `blocks/columns/columns.css` so
   `.columns.horizontal-teaser-featured` cards render with the black/slate background + white text +
   arrow. Cross-check the draft `content/drafts/columns-horizontal-teaser-featured.plain.html`.
   NOTE: also confirm which teaser VARIANT is correct here — the batch audit earlier saw teaser cards
   render as normal (Coil + General Industrial Coatings, "Learn More"); source wants them slate-black.
3. **[?] "Latest Insights from Grace" missing HEXA background section** — same pattern as consista /
   activcat (see §A hexa note). `Cards (featured-content)` block not painted on the hexa band.

---

## C-detail. vydac (user spot-check 2026-08-11, with source screenshot)

1. **[IMPORTER+RUNTIME] "VYDAC® Chromatography Resin Portfolio" table** — source is a 2-column table
   with a BLACK header row (col1 "VYDAC® Chromatography Resin Portfolio", col2 "Recommended for the
   separation of:"), then rows pairing each resin (219TP Diphenyl / 214TP C4 / 208TP C8 / 218TP & 238TP
   C18) with a bulleted list of separations, thin row separators. Migrated renders it as a flat stacked
   text list (borders + 2-col pairing + black header lost). Fix the table parser to preserve the 2-col
   bordered structure (this went through `table-two-column-content`/`split-list`); style black header +
   row separators in `blocks/table/table.css`.
2. **[IMPORTER] Download buttons placement** — source shows "Download Pharmaceutical brochure ›" and
   "Download Nutraceutical brochure ›" SIDE BY SIDE (button-group row) ABOVE the table, and "Download
   VYDAC® Sales Sheet ›" as a centered single button BELOW the table. Migrated placement/ grouping is
   off. Same `groupButtons()`/`.button-group` mechanism as syloid-mx item 2 — ensure adjacent buttons
   group into a centered flex row and the pre/post-table positions are preserved. [IMPORTER adjacency
   + RUNTIME CSS].

---

## D. OK ✅ — faithful, no fixes (aside from site-wide breadcrumb §A)

Detail (13): activators-custom-organoborate-boron-compounds, consista*, davisil, hyampp-catalysts-and-donors,
ludox, lynx-pe, lynx-pp, magnapore, shac, silsol, sylopol-cr-catalysts, sylopol-zn-catalysts, unipol-donors.
Hubs (2): adsorbents, fine-chemicals.

\* consista moved to §C on 2026-08-11 (hexa background miss).

Minor parity note (not counted as defect): the 4 hub pages whose source had no contact panel
(adsorbents, catalysts, fine-chemicals, synthetic-silicas) each gained an injected "Contact Us / Want
to talk to an expert" widget in migrated main — harmless addition; flag only if strict parity required.

---

## E. Open user spot-checks awaiting me (append here as they come in)

- 2026-08-11 — consista hexa background (logged §C).
- 2026-08-11 — TRISYL-XGE benefits cards too thin (logged §C).

---

## F. Hub product-navigation lists — RECONSTRUCTED 2026-08-11 (task #8, MAJOR)

The importer dropped the main-column nested product-navigation list from two hub pages (only the
sidebar-nav + intro H2/paragraphs survived). Reconstructed from the source cache
(`/tmp/qa-src/{catalysts,synthetic-silicas}.html`), matching the WORKING hub pattern already present
on `adsorbents.plain.html` / `fine-chemicals.plain.html`: a `<ul>` appended inside the intro section,
each family a `<li><p><strong>NAME®</strong> <a href="…">label</a></p></li>`, with nested `<ul>` for
sub-items. Hand-edited `content/products/*.plain.html` (per user go-ahead; uploads to DA later).

- ✅ **catalysts** — 7 top-level categories restored (ART® Hydroprocessing, FCC Additives, FCC
  Catalysts, Catalyst Carriers and Binders, Chemical Catalysts [+3 nested: RANEY®, DAVICAT® Supports,
  DAVICAT® Custom Development], Polypropylene Catalyst, Polyethylene Catalysts). Links → /industries/…
  as on source.
- ✅ **synthetic-silicas** — 15 families restored preserving source nesting (SYLOID® Silicas [+4
  nested], SHIELDEX®, SYLOWHITE™, SYLOJET®, LUDOX®, SYLOBLOC®, TRISYL® [+2 nested], DARACLAR®,
  SYLODENT® & SYLOBLANC®, SILSOL®, DAVISIL®, VYDAC®, VYVID™, PERKASIL® [+2 nested]) + trailing
  "Learn about the potential classification of SAS" link.

**PRODUCTS SET COMPLETE** — all 13 tracked tasks closed. Final gate 2026-08-11:
`npm run lint` → 0 errors (7 baseline no-console warnings only), `lint:css` clean;
`node tools/quality/breakpoint-check.mjs` → passed (600/900/1200 min-width only).

---

## G. Validation spot-checks — trisyl-silica (2026-08-12, user)

Two defects found during user validation of the major set, both hand-fixed in
`content/products/trisyl-silica.plain.html`:

- ✅ **Accordion fragmented into 6 separate blocks.** The importer emitted each FAQ as its own
  `<div class="accordion faq">` in its own section → rendered as 6 disconnected accordions. Source
  is ONE continuous accordion with 6 rows. Merged all rows into a single `accordion faq` block by
  removing the intervening section/accordion boundaries (`class="accordion faq"` count now = 1;
  6 rows verified: 5 questions + References). [IMPORTER root cause — accordion rows split per
  section; fix page-level now, revisit parser if it recurs.]
- ✅ **Missing 2-column benefits block with circular diagram.** Source "Benefits for edible oil…"
  is a Bootstrap `col-4` bullet list beside a `col-8` circular benefits diagram
  (`chart-trisyl-pie-chart`, natural 1200×900 / 4:3). The importer had (a) dropped the 2-col layout
  (bullets rendered full-width) and (b) mis-placed the pie-chart INSIDE the first FAQ answer (source
  FAQ answer #1 has only `chart-trisyl-table` + `chart-trisyl-bar-chart`). Fix: removed pie-chart
  from the FAQ; wrapped the bullets + pie-chart into `columns image-right` (text left / diagram
  right). Added `body.contactus`-scoped override in `blocks/columns/columns.css` so the diagram
  renders UNCROPPED (`aspect-ratio:auto; object-fit:contain`) at a 1/3-text : 2/3-image full-width
  split (matches source col-4/col-8). No product page used image-right before, so override is safe.
  Gate: `lint:css` clean + breakpoint ✅.

- ✅ **vyvid — Purification Solutions: geo-hex background + category-grid cards + "Learn more" CTA.**
  Source wraps this section in `<section class="light-gray-bkgd"><div class="geoAndHex">` (confirmed
  in `/tmp/qa-src/vyvid.html`), and its cards are `.card-item.white-bkgd` with a green title + a
  "Learn more" CTA (source card body: `<p class="h4 title">DAVISIL®…</p><div class="cta">Learn
  more</div>`). Three fixes in `content/products/vyvid.plain.html`:
    1. Switched the block from `cards product` → `cards category-grid` (the matching draft/variant:
       `content/drafts/cards-category-grid.plain.html` — white card, centered green 18/600 title,
       "Learn more ›" CTA).
    2. Replaced the repeated product-name link with the "Learn more" CTA label on each card
       (DAVISIL® / VYDAC®), matching source.
    3. Appended `Section Metadata Style=geo-hex` to the section.
  CSS: broadened the geo-hex selector in `styles/lazy-styles.css` to
  `:has(.cards.featured-content, .cards.category-grid)` (8 rules + the heading→cards margin). Safe:
  vyvid is the ONLY geo-hex section containing a `.cards.category-grid` block (checked all content/),
  so no other page is affected. The category-grid `li` already has `background-color: var(--white)`,
  giving the white card panels over the gray hexa band. Gate: `lint:css` clean + breakpoint ✅.

- ✅ **product-stewardship — hero bg, sidebar-nav dividers, top spacing, gray callout, summaries gap.**
  Five defects verified against LIVE source (measured via Playwright getComputedStyle on
  grace.com/products/product-stewardship):
    1. **Hero missing bg image.** Source `generic-hero` has bg `ehs-product-risk-management-worms-ecat-lab`
       (cover), 178px. Migrated was a solid-blue `no-image` banner. Fix: added the scene7 DM anchor as
       the hero's first row in `content/products/product-stewardship.plain.html` (converts to <picture>
       at runtime → image banner with the left→right gradient).
    2. **Sidebar-nav missing dividers.** Source `.section-navigation li` = `border-top:1px solid
       rgb(196 196 196)` + `padding:12px 0`. Migrated had only `margin-bottom:16px` (no lines). Fix in
       `templates/sidebar/sidebar.css`: product-hub-scoped (`:not(:has(> .sidebar-nav.breadcrumb-container))`)
       per-<li> top border + 12px padding; dropped the container's own top border/padding to avoid a
       doubled top line. Verified live: `1px solid rgb(196,196,196)`, `12px 0`.
    3. **Content too close to header.** Source article sits 50px below the hero (padding-top:5rem).
       The insights alignment rule (`.sidebar-nav + .section {margin-top:0}` + nav `margin-top:0`) was
       un-scoped and zeroed it for product hubs too → 0px gap. Fix: scoped BOTH the nav-zero and the
       first-content-zero to insights (`:has(> .sidebar-nav.breadcrumb-container)`) only; product hubs
       keep the 50px. Verified live: hero→content gap now 50px.
    4. **Animal Testing / reps box needs a background.** Source reps panel ("…contact one of the
       following Grace representatives") is `section.light-gray-bkgd.black` = rgb(230 231 232),
       centered, h4 Roboto Slab 18/600. (The "Animal Testing Policy" heading itself is white/no-bg in
       source — the gray box is the reps panel below it.) Fix: new GLOBAL `gray-callout` section style
       in `styles/lazy-styles.css` (bg rgb(230 231 232), centered, h4 18/600, body text stays 14px —
       deliberately NOT the global `.section.light-gray` whose intro rule blows body text to
       heading-xl); tagged the reps section `Style: gray-callout`. Verified live via injected element:
       bg rgb(230,231,232), centered, h4 Roboto Slab 18/600, links 14px. ✅
    5. **Summaries: too much space.** Source heading→list gap is only 20px; migrated split the
       "Available Product Stewardship Summaries" H3 and the two-column list into two sections (~113px of
       inter-section margins). Fix: merged the H3 into the same section as the `table two-column-content`
       list (removes both 50px section margins). [content edit]
  NOTE: product content is PROXIED from remote DA on local/preview, so the 4 content-side edits
  (hero anchor, gray-callout tag, summaries merge, + earlier reps section) render only AFTER these
  pages are published to DA. All CSS edits (nav dividers, top-spacing scope, gray-callout style) are
  served locally and verified live. Gate: `npm run lint` 0 errors + `lint:css` clean + breakpoint ✅.

- ✅ **product-stewardship — excess vertical space around Animal Testing + reps box (follow-up).**
  User flagged big empty gaps between the summaries list → "Animal Testing Policy" → gray reps box.
  Root cause: these were three SEPARATE grid sections; grid margins don't collapse, so each
  `margin-block: 50px` stacked → ~100px gaps (source: 52px list→AT heading, 21px AT→gray box, measured
  live). Fix: (1) merged "Animal Testing Policy" into the SAME content section as the summaries list
  (source has them in one `<article>`), so that gap becomes normal in-flow heading margin (~50px ≈
  source 52px); (2) in `templates/sidebar/sidebar.css`, product-hub-scoped: zero the bottom margin of
  the section preceding a `.section.gray-callout` and give the callout `margin-top: 20px` → total
  gap ≈ 20px (≈ source 21px), instead of the doubled 100px. Verified live via injected structure:
  preceding-section margin-bottom 0, callout margin-top 20px, bg rgb(230,231,232). Insights untouched
  (scoped away from `.breadcrumb-container`). Gate: `lint:css` clean + breakpoint ✅.

- ✅ **product-stewardship — gray background bled over the WHOLE content column (regression fix).**
  After the Animal-Testing merge, the gray `gray-callout` background covered the entire main content
  (intro + Characterization + …), not just the reps box. ROOT CAUSE: the merge edit left the
  `<div class="table two-column-content">` block UNCLOSED — the content section had 5 `<div>` opens
  vs 4 closes (whole-file diff +1). The unbalanced div made the browser fold the reps section (with
  its `Style: gray-callout` metadata) INTO the content section, so aem.js applied gray-callout to the
  merged super-section. Verified by running `aem.decorateSections` on the served plain.html: only 3
  sections, section #2 = gray-callout wrapping all content. FIX: added the missing `</div>` to close
  the two-column-content block before the Animal Testing H3. Re-verified: 5 clean sections, section #2
  = content (no gray), section #3 = gray-callout wrapping ONLY the reps box. File div-balance now
  38/38. Gate: `lint:css` clean + breakpoint ✅. LESSON: after hand-merging sections in `.plain.html`,
  ALWAYS re-check `<div>` open/close balance — an off-by-one silently merges sections + leaks section
  styles.

- ✅ **ALL 6 product hubs — "Products" heading, hero images, two-column product list (2026-08-12).**
  User validation of the hubs surfaced 3 gaps (measured against LIVE source via Playwright
  getComputedStyle):
    1. **Missing "Products" heading above the sidebar-nav.** Source `.section-navigation` opens with
       `<h4><strong>Products</strong></h4>` (Roboto Slab 18px/600 black, margin-bottom 30px → 30px gap
       to first nav item). Added `<h4 id="products"><strong>Products</strong></h4>` before the nav
       `<ul>` in ALL 6 hub `.plain.html` files; styled it in `templates/sidebar/sidebar.css`
       (product-hub-scoped, `:not(:has(> .sidebar-nav.breadcrumb-container))`). Verified live: 18/600,
       Roboto Slab, mb 30px.
    2. **Hero images missing on 3 hubs.** catalysts/synthetic-silicas/product-stewardship already had
       them; adsorbents/fine-chemicals/quality-management did not. Source heroes are DAM paths but all
       resolve as scene7 asset IDs (probed 200): adsorbents `mt-adsorbents-employee-FINAL-3000x1360`,
       fine-chemicals `sc-chemicals-woman-lab-looking-3000x1360`, quality `ehs-quality-management-screen-plant-control-system-blue`.
       Added each as the hero's first-row scene7 anchor. All 6 hubs now carry a hero bg image.
    3. **Product-nav list not in two columns.** Source lays the main product list as TWO side-by-side
       `<ul>` groups (~313px each, 40px gap) — only catalysts + synthetic-silicas have two groups
       (adsorbents/fine-chemicals have one, stay full-width). Added `templates/sidebar/sidebar.css`
       rule scoped to product hubs + `.default-content-wrapper:has(> ul + ul) > ul` →
       `display:inline-block; width:calc(50% - 20px)` with `margin-left:40px` on the 2nd group, from
       600px up. Verified live: `:has(> ul + ul)` matches, both ULs inline-block 50%-20px, 2nd ml 40px,
       sideBySide=true. Single-list hubs unaffected.
  Also: source renders ALL product-hub nav links at weight 900 (not just first-child) — updated the
  nav-link rule accordingly. All 6 hubs div-balanced. Gate: `lint:css` clean + breakpoint ✅.
  (Content-side edits — Products heading + hero anchors — render on preview only AFTER DA publish;
  the CSS/spacing/2-col is served locally and verified live.)

- ✅ **ALL 6 product hubs — MOBILE section-nav "filter" <select> (2026-08-12).**
  Source collapses the product-hub left section-navigation on mobile (<900px) into a native
  `<select>` "filter": the current hub is the selected option; choosing another navigates to it.
  Desktop (>=900px) shows the plain `<ul>` list. Measured source select: bg rgb(239 239 239),
  1px solid rgb(196 196 196), no radius, Roboto 16px/500, padding 0 30px 0 15px, appearance:none, 40px
  tall, "+" (fa-plus) indicator on the right, current page `[selected]`, onchange → navigate.
  IMPLEMENTATION (no content change — built from the authored `<ul>`):
    - NEW `templates/sidebar/sidebar.js` (default export, called with `main` in the lazy phase by
      `scripts.js` loadTemplate). Scoped to product-hub nav (`.section.sidebar-nav:not(.breadcrumb-container)`):
      builds a `<select class="section-nav-select">` from the top-level nav `<li> > a` links, marks the
      current pathname's option selected, wires `change` → `window.location.assign(value)`, inserts it
      (wrapped in `.section-nav-select-wrapper`) before the `<ul>`. Insights rails untouched.
    - `templates/sidebar/sidebar.css`: product-hub-scoped select styling to source spec + "+" indicator
      via wrapper `::after`; mobile-first show/hide — base (mobile) shows the select + hides the `<ul>`,
      `@media (width >= 900px)` flips it (list shown, select hidden).
  Verified live locally: at 390px the select builds with all 6 options (Adsorbents selected), styled to
  spec, `<ul>` hidden; at 1280px the select wrapper is `display:none` and the `<ul>` is `display:block`.
  Gate: `npm run lint` 0 errors (new sidebar.js clean) + `lint:css` clean + breakpoint ✅.
