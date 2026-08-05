# Master Importer Strategy

Status: **implemented, bundling, and validated end-to-end.** The master importer runs
through the bulk runner and reproduces the validated single-page output byte-for-byte on
`/compliance/compliance-gdpr-de`. Per-family parser registration is the remaining work.

Artifacts:
- `component-library.json` — the master catalog. **67 blocks; every draft block page has a
  usable source `selector` (or a named `matcher`).** Fields: selector | matcher | item |
  render (parse / seed-from-draft / skip-existing / forms-pass) | family. Applied in full to
  every page, priority-ordered (clean component selectors first, matcher/generic-grid last).
- `catalog-data.js` — **GENERATED** ES module (`export default` of the catalog) produced from
  `component-library.json` by `gen-catalog-module.py`. Imported by the master importer.
  Rationale: the bundler (esbuild via `@adobe/aem-import-helper`) inlines ES `import`s but
  does NOT populate `globalThis`, and eslint rejects `.json` import extensions — so a
  `globalThis.COMPONENT_LIBRARY` placeholder (earlier approach) would bundle to an EMPTY
  catalog. Verified: the bundle inlines all 67 blocks. Re-run the generator after any catalog
  edit: `python3 tools/importer/gen-catalog-module.py`.
- `import-grace-master.js` — catalog-driven engine with **page-type dispatch**:
  - `isSidebarPage()` → **PATH A** rebuilds `<main>` from scratch with the validated sidebar
    recipe (hero banner + sidebar-nav section + main rich-text + contact-split banner +
    Metadata), emitting `template:sidebar`, `contactus:true`, and dynamic `contactus-tagline`
    / `breadcrumb-title` read from source. This is the pixel-perfect recipe proven on
    compliance-gdpr-de, folded in verbatim.
  - otherwise → **PATH B** decorates `document.body` in place via full-catalog discovery
    (selector OR matcher). A block with a registered parser is parsed; a block WITHOUT one is
    **left in place and logged** (`blocksLeftInPlace`), so content is preserved, never dropped.
  - 16 matchers implemented for non-component blocks (column-order / heading /
    table-column-count / sequence). Form pages flagged via `hasForm` (deferred).
  - Parses + lints clean; bundles cleanly; validated (see below).
- `selector-harvest.json` — verified source selectors for all 61 report blocks (live grace.com).
- `forms-register.json` — pages containing forms (deferred to the Forms pass).

Validation (run on 2026-08-05):
- `bash …/aem-import-bundle.sh --importjs tools/importer/import-grace-master.js` → bundle with
  all 67 catalog blocks inlined, `CustomImportScript.default.transform` present, no leftover
  ES imports / globalThis catalog refs.
- `run-bulk-import.js --import-script …master.bundle.js --urls urls-sidebar-test.txt` →
  `Success: 1/1`; report `pageType:sidebar`, all 4 metadata pairs, sidebarNav+contactSplitBanner
  true, `hasForm:false`; output **`diff`-identical** to the validated sidebar-test baseline.
- Browser note: the runner uses its own Playwright 1.58.0 → needs `chromium-headless-shell`
  **rev 1208** (install via the runner's own playwright, not the project's).

Parser families — progress:
- **table (6/6 DONE + validated, 2026-08-05):** shared `parsers/_table-utils.js`
  (`extractTableCells` flattens rowspan/colspan → repeated cells; strips zero-width chars;
  preserves strong/em/br/links/lists). Variants: product-comparison, three-column, link-list,
  data-grid (real `<table>`s, mutually exclusive by border-class + column count);
  two-column-content (splits one `.split-list` <ul> into 2 balanced column cells);
  contact-matrix (reconstructs a 2-col table from `.section-75-25 .col-lg-9` rows, matcher
  gated on the Industries/Customer Service header signature). Validated on cookie-policy
  (4 data-grids), davisil (2 two-column), beer (product-comparison), forms/contact-us-customer-
  service (contact-matrix → renders as <table> with tel: linkified phones).
- **cards (9 DONE, 2026-08-05):** `parsers/_cards-utils.js` (`buildCardsFromColumns` + LCA
  container discovery). icon-grid, category-grid (real cmp-cards), benefits/image-text/location/
  contact-options/profile grids (composed, distinguishing predicates so shared col widths don't
  collide), solution-grid (no-images, short-tagline gate). Validated on leadership/locations/
  contact-us/community/ludox/polypropylene/unipol.
- **columns (11 DONE, 2026-08-05):** `parsers/_columns-utils.js` (`buildTwoColumn`). image-left/
  right (column-order, standalone-row gate), history-item, profile-detail, location-detail,
  app-promo, brochure-promo (gated-download signature), checklist, + 3 feature-set teasers
  (image-teaser/horizontal/featured, mutually exclusive via `featureSetContainers` dominant-item
  class). Validated on this-is-grace/our-history/anthony-yoo/shieldex/ludox/agriculture/classification.
- **accordion + quote (4 DONE, 2026-08-05):** accordion-faq / accordion-nested (recurse; matchers
  split on nested `.accordion-comp` vs `.media-callout`), quote-highlight (statistic card),
  quote-testimonial. Validated on benefits/south-haven/refining-value/promega insights.
- **banner + widgets + social + misc (8 DONE, 2026-08-05):** banner-resource-download, social-share,
  social-follow, carousel, map-embedded (emits maps URL, address fallback), featured-product-selector,
  custom-widget-contact-panel, custom-widget-news-archive. Validated on their source pages.
- **seed-from-draft (8 DONE, 2026-08-05):** 3 with real content on common selectors PARSE
  (banner-cta, quote-cta, video-overlay — tightened matchers so they don't over-fire on every
  `.media-callout`/`div.quote`); 5 JS-hydrated shells SEED from draft via `draft-seeds.js`
  (generated by `gen-draft-seeds.py`) + `seedFromDraft` (rebuilds via createBlock so the block
  survives markdown). cards-featured-content + search-filter seeds validated live.

**Robust block capture:** `discoverAndParseBlocks` captures each parser's output by diffing the
document's `<table>` set before/after (not fragile sibling-tracking) — works whether a parser
replaces `element` or an ancestor; this is what lets sidebar pages keep parser/seed output.

Status: **ALL 67 catalog blocks handled** — parse (real content), seed (dynamic shells),
skip-existing (header/footer/hero-full-width), or forms-pass (5 form pages, deferred). Every
parser validated on a real source page; compliance-gdpr-de stays byte-identical (regression
guard); lint/breakpoint/a11y green. Matcher-precision notes in memory `parser-matcher-precision`.

Remaining/known-minor: pagination-numbered seed can be dropped when its placeholder sits under
a container a later parser replaces (1 page); search-results/document-viewer seeds not yet hit
on a live page (mechanism proven via the other seeds). Forms are the separate Adaptive Forms pass.

Coverage audit (2026-08-05, re-run after full build):
- Cross-checked catalog vs importer programmatically: **0 blocks without a handler, 0
  matcher-only blocks** (every discoverable block has a renderer). All 46 parser import files
  resolve; all catalog selectors syntactically valid (no runtime `[master]` selector errors on
  live pages). Handler split: 22 parser, 30 parser+matcher, 5 seed, 5 forms-deferred, 4 skip,
  1 (video-grid) matcher+parser = 67.
- Audit caught + fixed 4 gaps: (1) `banner-contact-split` had no DEFAULT-path parser (only the
  sidebar builder) → added `parsers/banner-contact-split.js`; (2) `cards-related-articles` had
  no parser/matcher → added parser + "Related Articles" heading matcher; (3) `video-grid` was
  matcher-only → added parser; (4) `video-overlay` (single) greedily claimed each `.media-video`
  on multi-video pages → gated to a single video so 2+ go to video-grid. Also tightened
  `columns-location-detail` (require postal-address signature, not just a jobs.grace.com link)
  so it stops mis-claiming careers/checklist pages.
- Template + widget recognition verified: compliance-gdpr-de metadata block emits
  `template:sidebar`, `contactus:true`, `contactus-tagline`, `breadcrumb-title`; widget placement
  validated pixel-perfect in earlier sessions. Regression guard (compliance byte-identical) held
  through all audit fixes; lint/breakpoint/a11y green.

---

## 1. Goal

One **block-complete master importer** that migrates 400+ pages without page-specific scripts, losing no content regardless of which blocks a page contains. Replaces the current homepage-only importer (6 parsers) that silently drops any block it doesn't know.

---

## 2. Block classes (from the harvest) and how each is handled

Every block has a **recognizable placeholder container in the source HTML** — confirmed for all 61, including the empty/dynamic ones. The importer keys off that placeholder selector.

### A. Server-rendered blocks (~44)
Content is in the raw HTML. Parser extracts real content -> EDS block table. Standard path.

### B. Dynamic / JS-hydrated blocks (placeholder-seed strategy)
The source container exists but its content is injected at runtime (or held in a `data-*` attribute we are NOT wiring up yet). Confirmed placeholders:

| Block | Placeholder selector | Runtime data source (for LATER wiring) |
|---|---|---|
| cards-featured-content | `.featured-blog-cmp` | `data-blogs` JSON |
| custom-widget-search-filter | `.blog-list-cmp` | `data-bloglist` JSON |
| pagination-numbered | `#pagenation` | generated from `data-bloglist` |
| custom-widget-document-viewer | `a.fbo-embed` | FlippingBook `data-fbo-*` + external script |
| custom-widget-search-results | `.cmp-search__results` | client-side search API (no embedded data) |

**Strategy for these (agreed):**
1. The importer **recognizes the placeholder** by its selector (the insertion point).
2. It does **NOT** try to scrape/execute the dynamic content now.
3. It **seeds the block with exactly what already exists in the draft** for that variant
   (`content/drafts/{variant}.plain.html`) — i.e. emit the block table as authored in the draft, in place, so the section is present and correct-looking.
4. **Later** (once all pages are previewed & published), the dynamic wiring is instrumented:
   fetch the latest JSON (`data-blogs` / `data-bloglist`, etc.) and feed it into the live EDS block.
   The importer's job for now is only to place the block and preserve the slot.

This same "recognize placeholder -> seed from draft as-is" rule also applies to blocks whose
component renders as an **empty shell** server-side:

| Block | URL | Placeholder | State |
|---|---|---|---|
| video-overlay | https://grace.com/ | `.media-video` / `.media-callout` | homepage "We Are Grace" video (already an embed-video block on index) |
| banner-cta | https://grace.com/campaign/chromatography/ | `.media-callout` | empty shell server-side |
| quote-cta | https://grace.com/industries/refining-technologies/value-creation/sustainability/ | `.quote` | empty shell server-side |

For these: recognize the placeholder, seed from the draft block content as-is.

### C. Non-component blocks (~10)
Generic `.row`/`.col-lg-*` grids or rich-text with **no identifying class**
(e.g. columns-image-left/right, cards-image-text-grid, table-contact-matrix, cards-solution-grid).
These need a **matcher function** (column order, heading text, sibling/position pattern),
not a plain CSS selector. See `selector-harvest.json` per-block `risk` + `notes`.

### D. Forms (5) — DEFERRED
Not parsed as blocks. Tracked in `forms-register.json`; handled later via AEM Forms ->
Adaptive Form JSON. The importer must **detect** forms on ANY page and append the URL to
`forms-register.json > detectedFormPages[]` so none are missed.

---

## 2c. VALIDATED sidebar-page recipe (from import-sidebar-test.js)

The sidebar template + contactus widget was proven end-to-end on
`grace.com/compliance/compliance-gdpr-de/` at 1440px (DOM + computed-style diff vs live,
all quality gates green: lint / breakpoint / a11y). Fold these into the master importer when
generating the sidebar/compliance template family. Reference impl: `import-sidebar-test.js`.

Per sidebar page the importer emits, in order, a fresh `<main>` of `<hr>`-separated sections:
1. **Hero** — `Hero (banner)` block, one cell = page H1. Reuses the existing `hero` block:
   banner variant → blue #004990 reduce-height band (178px) + auto-breadcrumb; `no-image`
   auto-added. Do NOT hand-roll a title band.
2. **Sidebar nav** — a `<ul>` of sibling-page links + Section Metadata `Style = sidebar-nav`
   (built from the rendered `.section-navigation`/`col-lg-2` links; deduped).
3. **Main content** — the `.col-lg-7` rich-text as default content; empty component shells skipped.
4. **Contact-split banner** — `Banner (contact-split)` block from the source `.contact-us-cmp`
   (title row + two inquiry-column halves). Full-width section above the footer.
5. **Metadata block** built directly (createMetadata only emits Title/Description/Image), with:
   - `template: sidebar` (→ body.sidebar → templates/sidebar/sidebar.css)
   - `contactus: true` (→ auto contact-sticky widget) + `contactus-tagline` read from the
     source `.contact-us-title` (e.g. "Want to talk to an expert?")
   - `breadcrumb-title` read from the source breadcrumb's last crumb (e.g.
     "Compliance - GDPR (German)") — hero.js prefers this over the humanized URL slug.

Layout tuning that achieved pixel parity (all in `templates/sidebar/sidebar.css` +
`blocks/hero/hero.css`, viewport-verified at 1440/1728px vs live):
- body `p` line-height 1.7 (source 14px×1.7 = 23.8px);
- banner breadcrumb pulled up 23px (margin-top:-23 / **margin-bottom:13** — NOT 33; the
  H1 must follow up so it lands 68px below the hero top, breadcrumb→H1 gap = 13px);
- breadcrumb letter-spacing normal;
- nav list `padding-left:20px` (links start ~x=100) with a full-width top divider on the
  section wrapper; main content wrapper `padding-inline:20px` (text at x=313/right=1020,
  matching source `.rich-text` inset);
- **hero→content section gap = 50px** (source article padding-top 5rem). The GLOBAL desktop
  rule `main > .section { margin: var(--spacing-xl)=80px 0 }` is 30px too much for sidebar
  pages, so scope 50px to them:
  `body.sidebar main > .section:not(.hero-container) { margin-block: var(--spacing-l) }`.
  The `:not(.hero-container)` is REQUIRED — that selector out-specifies the global
  `.section.hero-container { margin:0 }` reset, so without it the hero gains a 50px bottom
  margin and the gap becomes 100px. Do NOT change the global rule (keeps homepage at 80px);
- widget rests at hero-top+78 then sticks fixed top:106 on scroll (contact-sticky.js re-reads
  its resting offset each non-stuck scroll so template CSS applied after decoration still works);
- hero gradient on `::before` (z-index 0, under text) so white title/breadcrumb never wash out.

**NOTE — metadata rule mechanism gap:** the master importer's `PAGE_METADATA_RULES[].meta()`
currently returns STATIC pairs. To emit the dynamic `contactus-tagline` / `breadcrumb-title`
(read from source DOM per page), extend `meta` to receive the `document` (already passed to
`detect`) and return computed values — mirror `import-sidebar-test.js`'s
`buildContactSplitBanner` / breadcrumb-title / tagline extraction.

---

## 3. Proposed "visual verification gate" (requested)

Idea: while an importer run processes a page, allow a step that **visually checks what a block
actually is**, compares it to the set of known blocks, and decides which block to render so the
result matches the source site 100%.

Recommended shape (to keep the importer itself fast & deterministic):
- The importer stays deterministic (selector/matcher -> parser). It records, per detected block,
  a `confidence` and the `candidateVariants` it chose between.
- A **separate post-import verification pass** (not inline in the parser) renders the imported
  EDS page at `localhost:3000` and the source URL, captures both, and compares block-by-block.
  On mismatch it reports the block + suggests the better-matching variant. This is where the
  `excat-visual-critique` capability fits.
- Ambiguous cases (the class-C non-component blocks, and any block with 2+ candidate variants)
  are the ones routed to visual comparison; unambiguous server-rendered blocks skip it for speed.

This keeps import reproducible while adding a review gate exactly where variant choice is uncertain.
Decision on whether the gate runs automatically for every page or only for flagged/ambiguous
blocks is still open.

---

## 4. Master importer architecture (target)

1. **One component-library catalog** (promote `page-templates.json` -> full catalog): every block
   with `{ name, baseBlock, match: {selector | matcherFn}, priority, render: 'parse' | 'seed-from-draft' }`.
2. Apply the WHOLE catalog to EVERY page. A block not present just matches zero elements (logged no-op).
3. **Ordered, specificity-safe discovery**: most-specific selector first; rely on the existing
   "element already detached -> skip" guard so each source node is consumed once (no duplicate blocks).
4. Full **parser registry** — one per block; drafts are the expected-output fixtures.
5. `render: 'seed-from-draft'` blocks emit the draft's authored table as-is (class B & empty shells).
6. **Form detection** appends to `forms-register.json`.
7. Unchanged tail: cleanup transformer, link rewriting, section metadata, `WebImporter.rules.*`, path sanitization.

---

## 4b. Page-level metadata rules (templates & widgets) — REQUIRED

Some source pages change **page layout + activate a widget** purely via page metadata, not via
an authored block. The master importer MUST emit this metadata or the page migrates with the
wrong layout and a missing widget. This runs as a metadata step, separate from block parsing.

### contactus template + sticky widget
Mechanism (traced in code):
- `template: contactus` metadata → `decorateTemplateAndTheme()` adds `body.contactus`
  (`scripts/aem.js`) and `loadTemplate()` loads `templates/contactus/contactus.css`
  (`scripts/scripts.js`), which narrows main content to a ~920px LEFT column with a right
  gutter on desktop (>=900px) so content never sits under the widget. **This is the layout change.**
- `contactus: true` metadata → `buildContactStickyBlock()` auto-injects the sticky
  `.custom-widget.contact-sticky` panel after the hero. Optional overrides:
  `contactus-heading`, `contactus-tagline`.

**Importer rule:** if the source page contains the contact sticky widget
(`.contact-us-sticky`, `.contact-us__cmp`), add BOTH metadata rows to the page's Metadata block:
```
| template  | contactus |
| contactus | true      |
```
Do NOT author a `custom-widget` block for it — the widget is synthesized from the flag.
Reference draft showing the exact metadata table: `content/drafts/columns-horizontal-teaser.plain.html`
(source: grace.com/products/ludox). Confirmed present on grace.com/products/synthetic-silicas/classification/.

### sidebar template (left section-nav + main content [+ right contact widget])
Common content-page layout (compliance, locations, insights articles). Measured live from
grace.com: a 1280px band split Bootstrap 2 / 7 / 3 — left section-nav (16.67%), main content
(58.33%), right contact widget (25%) — engaging at 992px (mapped to the project's 900px).
Full measured spec + CSS: `templates/sidebar/SIDEBAR-LAYOUT-SPEC.md`, `templates/sidebar/sidebar.css`.

**Importer rule:** if the source page has a left section-navigation column
(`.section-nav`, `[aria-label="Section navigation"]`, `article .row > .col-lg-2`), emit
`template: sidebar`. The left-nav section must also be tagged with section style `sidebar-nav`
so the template pins it to column 1. If the contactus rule ALSO fires, `body.sidebar.contactus`
switches the grid to the 3-column 2 / 7 / 3 ratio and pins the widget to column 3 — the
"3 portions" case. Without the widget it is `body.sidebar` = 2 columns (nav + main).

### General template metadata
Any page whose source maps to a named template (currently only `contactus`) must emit a
`template: <name>` metadata row so the matching `templates/<name>/<name>.css` (+ optional .js)
applies. New page templates are added to `PAGE_METADATA_RULES` in the importer as discovered.

## 5. Decisions
- **Visual gate: AMBIGUOUS-ONLY (decided).** The gate runs only for blocks flagged
  `visualGate: true` in the catalog — the ~10 non-component blocks and the shared-component
  variant families (heroes, feature-set teasers, vertical-border tables). Unambiguous
  server-rendered blocks skip the gate for speed.
- Dynamic wiring (class B) timing: confirmed LATER, after preview/publish of all pages.
- Forms: confirmed DEFERRED (tracked in `forms-register.json`).
