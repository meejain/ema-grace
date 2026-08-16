# WR Grace — Migration Playbook (end-to-end strategy)

The repeatable process for migrating a grace.com page family to EDS. Insights (165), newsroom (28)
and product-detail (28) are complete and validated with this loop; every other family follows the
same steps. Companion docs: `MASTER-IMPORTER-STRATEGY.md` (architecture deep-dive), `component-library.json`
(the catalog), `backups/README.md` (per-set frozen bundles), `block-intelligence.json` (reference
report → template/block↔URL index; see §2). Memory notes: `console-error-sweep-validation`,
`breadcrumb-url-derived`, `post-meta-is-metadata`, `parser-matcher-precision`, `insights-video-overlay`,
`visual-parity-completion-standard`, `importer-bundle-backups`, `hero-banner-name-fix`,
`authored-option-and-emits`, `block-intelligence-and-richest-rep`, `products-hydration-fix`,
`product-detail-template`.

**Two hard rules from experience — read these first:**
1. **Never claim a set "done" without the visual-parity gate (§4a): 3+ full-page side-by-side
   screenshots, migrated vs LIVE grace.com.** Console/structural sweeps pass on broken visuals.
2. **On completing a set, snapshot its frozen bundle to `backups/<set>/` (§7). There is ONE live
   bundle for ALL templates — a source edit for one family can silently regress another.**

### START HERE — onboarding a new LLM to migrate the next family

**Kicking off a fresh session?** Paste the ready-made prompt in `tools/importer/LLM-ONBOARDING-PROMPT.md`
(fill in `<FAMILY>`) — it encodes the run-the-importer + create-the-backup discipline and points here.

This file (`tools/importer/MIGRATION-PLAYBOOK.md`) is the single entry point. Read order:
1. This playbook end-to-end (§0 mental model → §1 architecture → §2 principles → §3 the loop →
   §4/§4a validation → §5 scope/recipes → §6 commands → §7 backups).
2. The memory notes listed above (kebab-case slugs) for the deep detail behind each recipe.
3. `MASTER-IMPORTER-STRATEGY.md` only if you need the architecture deep-dive.

Then follow the per-family loop (§3): pick the next family from §5 → **cluster by rendered template,
pick the RICHEST page per cluster BY LOOKING** (§1–§2 mandate; block-intelligence is a hint, not a
ranker) → read that page's rendered DOM to derive the section→block contract → extend the importer
(reuse ladder: authored option ▸ variant ▸ new block) → rebundle → import a 1–2 page sample →
**visual-parity gate (§4a)** → import the rest in batches → snapshot the frozen bundle (§7).

**Kickoff prompt to paste to a fresh LLM:**
> Read `tools/importer/MIGRATION-PLAYBOOK.md` in full (and the memory notes it lists), then migrate
> the `<FAMILY>` pages to EDS following its per-family loop. Cluster by rendered template and pick
> the richest representative by LOOKING (not an auto count). Reuse existing blocks where possible.
> Rebundle, import a 1–2 page sample, run the §4a visual-parity gate (side-by-side vs live grace.com),
> fix, then import the rest in batches of ~5 and audit byte size. Do NOT publish to DA without my
> go-ahead. Show me the quality-gate output and screenshots before claiming done.

---

## 0. Mental model — two layers + a validation layer

1. **IMPORTER (build-time)** — `tools/importer/import-grace-master.js` + parsers + catalog +
   transformers → bundled to `import-grace-master.bundle.js`. Turns live grace.com HTML into
   `content/**/*.plain.html`. A change here needs **rebundle + reimport** to take effect.
2. **RUNTIME (render-time)** — `scripts/scripts.js` + `blocks/*` + `templates/*`. Decorates the
   already-imported `.plain.html` in the browser on every view. A change here applies to existing
   content **immediately on reload — no reimport**.
3. **VALIDATION (post-import, read-only)** — scripts that *inspect output and flag problems*; they
   never fix. They tell you which of layers 1/2 to change.

Rule of thumb: **styling/decoration fix → runtime (no reimport). Structure/naming/selection fix →
importer (rebundle + reimport).**

**Where content lives (why EDS `.aem.page` URLs 404 for migrated pages).** The generated
`content/**/*.plain.html` is **git-ignored** — EDS does NOT serve content from the code repo. It
serves from **Document Authoring (DA)**. So a migrated page renders at `localhost:3000` (local dev
serves the working copy) but 404s at `https://main--{repo}--{owner}.aem.page/...` until it is
**uploaded to DA and previewed**. "Migrated + validated locally" ≠ "published". Publishing = POST
each `.html` to the DA source API (`admin.da.live/source/{org}/{repo}/{path}.html`, no auth header —
injected) then preview via `admin.hlx.page`. That is a separate, outward-facing step — do it only on
explicit user go-ahead.

---

## 1. The importer architecture (what composes the bundle)

- **Catalog** — `component-library.json` (source of truth, 68 blocks) → generated `catalog-data.js`
  (ES module, inlined by the bundler; regenerate with `gen-catalog-module.py` after any edit). Each
  block: `selector` (or named `matcher`), `item`, `render` (parse | seed-from-draft | skip-existing |
  forms-pass), `family`, `priority`, and optional **`emits`** (the EDS block NAME the parser produces
  incl. variant + options — present only when it differs from the catalog `name`, i.e. the parser
  reuses another block/variant or adds an authored option; e.g. `cards-related-articles` →
  `emits: "Cards (product, cta)"`). The catalog is the universal "what blocks exist + how to
  recognize them on the SOURCE DOM."
- **Body-loop-built blocks are `skip-existing` with `selector: null`.** A few blocks are constructed
  INSIDE a page-type body loop (they consume the source nodes before catalog discovery runs), so
  they must NOT also carry a discovery selector — that would double-emit and collide. They live in
  the catalog as documentary `skip-existing` entries (with `emits` + `item` for reference) so the
  variant is still catalog-visible and has a draft sample. Today: `columns-media-figures`
  (`.media-callout` pairs → `Columns (media-figures)`, would otherwise collide with
  `columns-app-promo`'s `div.cmp-media-callout`).
- **Parsers** — `parsers/*.js` (50), one per block; take recognized source HTML → EDS block table.
  Shared helpers: `_cards-utils`, `_columns-utils`, `_table-utils`.
- **Transformers** — `transformers/*.js` (2, page-agnostic): `grace-cleanup` (strip chrome,
  beforeTransform) + `grace-dm-images` (Scene7/DM `<img>` → carrier anchor, afterTransform).
- **Page-type dispatch** — `transform()` picks the page shape:
  `isInsightsArticle()` → `buildInsightsArticle()`; `isSidebarPage()` → `buildSidebarPage()`;
  else `buildDefaultPage()` (pure catalog discovery in place).
- **ONE bundle** contains all paths; template recognition happens at runtime inside the bundle,
  not by choosing a different bundle. The runner injects the **bundle**, never the source.

Key guarantees:
- Discovery iterates the catalog ("is THIS known block on the page?"). A truly-new block type
  (no catalog entry) is **invisible** — its text falls through to default content (preserved,
  unstyled). This is the inherent limit → why the validation layer (§4) exists.
- A recognized block with no parser is **left in place + logged** (`blocksLeftInPlace`) — never dropped.
- "Already consumed" guard (`!element.parentNode`) means first match wins → **priority + selector
  precision matter** (a broad selector steals a block from a more specific one). Keep matchers
  mutually exclusive.

---

## 2. Authoring principles learned (apply to every family)

- **EDS block naming is `Name (variant, option, …)`** → class `name variant option` → `blocks/name/`.
  Every comma-separated token inside the parens becomes a class; `classList[0]` (the base name) is
  what loads `blocks/name/{name}.js|css`. NEVER `Name-Variant` (slugifies to `name-variant` → 404 on
  a non-existent folder, block never decorates). Verify via the imported `.plain.html`:
  `Cards (product, cta)` must serialize to `<div class="cards product cta">`.
- **Reuse ladder — option ▸ variant ▸ new block.** Prefer reusing an existing block and adding an
  authored **option** class; only add a **variant** if the layout genuinely differs; only add a new
  **block** as a last resort. Example: the insights "Related Articles" grid reuses `cards/product`
  and adds the `cta` option (`.cards.product.cta` → visible "Read more ›"), NOT a `related-articles`
  variant or block. Record the emitted name in the catalog `emits` field (see §1).
- **Behavior follows an explicit authored signal, not a content heuristic.** The "Read more" CTA is
  driven by the authored `cta` option, not by JS guessing (e.g. "link text ≠ title"). Heuristics are
  fragile and invisible to authors; an option is explicit, catalog-modeled, and draft-testable.
- **Every variant AND option needs a `content/drafts/<name>.plain.html` sample.** It makes the block
  authorable, renders it in isolation, and is the regression fixture when there's no live source.
  Two slipped through (`cards-product-cta`, `columns-media-figures`) — treat draft coverage as part
  of "done," not an afterthought. (See §4 gap: no automated draft-coverage check yet.)
- **Assert parity with measured computed styles, not eyeballing.** Read the live target in pixels at
  a fixed breakpoint (column widths, gaps, margins) and gate on `browser_evaluate` computed styles;
  screenshot only to confirm. Craft learned: use `minmax(0, 1fr)` (not bare `1fr`) for truly-equal
  grid tracks; do grid math against the real container width (insights body column = 707px).
- **In-body components need an explicit body-loop branch.** `buildInsightsArticle` only handles a
  component if it has a branch (video-overlay, real tables, related-articles, media-figures);
  everything else falls through to raw clone + flatten. A catalog entry alone is not enough for
  in-body content — the branch consumes the source nodes before sibling-region discovery runs.
- **Page metadata, not content blocks:** things that are page-level facts belong in the Metadata
  block + a render-time auto-block, NOT an authored content block. Done for:
  - breadcrumb → auto-blocked from URL (`Home / <ancestors>`, current page dropped)
  - POSTED/INDUSTRY → `published` / `industry` metadata rows → rail panel rebuilt at render time
  Auto-blocks that co-locate in one section must key off a STABLE authored signal (e.g. the share
  block), NOT off each other (ordering hazard).
- **Preserve Scene7/DM image URLs as-is** (DA hashes them on upload); don't localize to /media-da/.
- **Round-trip hazards:** markdown drops authored classes/attributes and can turn a `<table>`'s
  first header cell into a block name; `wrapTextNodes` can co-wrap a picture + its caption into one
  `<p>`. Parse structurally, and when lifting a `<picture>` out of a `<p>`, unwrap preserving siblings.

---

## 3. The per-family migration loop (repeat for each section)

1. **SCOPE & GROUP — CLUSTER BY TEMPLATE FIRST (MANDATE).** From the sitemap
   (`https://grace.com/sitemap.xml`, 470 URLs), take the family's sub-tree and split it into
   **template clusters** by RENDERED LAYOUT, not by URL prefix. A single URL folder can hold
   MULTIPLE templates: `/products/` contains BOTH rich *detail* pages (silsol, trisyl — hero +
   feature sections) AND thin *category-hub* pages (synthetic-silicas, adsorbents — sidebar-nav +
   product link-list). Treating them as one cluster is the mistake that broke the products pass.
   Each cluster gets its OWN representative + its own analysis.
2. **PICK THE RICHEST page per cluster BY LOOKING (MANDATE).** The representative MUST be the
   visually richest page in the cluster — the one with the most DISTINCT, STYLED content sections —
   NOT a random/first page. **Judge it VISUALLY: open candidates in the browser (or screenshot
   them) and compare rendered pages.** Do NOT rank by an automated block count — BOTH a raw-HTML
   `grep` of block-class signatures AND a rendered-DOM selector count MISLEAD: the raw HTML is a
   pre-hydration skeleton full of script-island/chrome noise, and loose selectors over-count
   structural wrappers, so a THIN hub (synthetic-silicas) scored 7–8 "blocks" while a genuinely
   RICH detail page (silsol) scored 6. The count inverted reality; the eye did not. (Real example:
   an early raw-HTML rank picked synthetic-silicas as "richest products page" — it is one of the
   thinnest.) Use `block-intelligence.json` (below) only as a HINT for which blocks a page-type
   *should* have, never as the richness ranker.
   - **Block-intelligence index (hint only).** `reference/front-end-report-gracev1.html` → parsed to
     `tools/importer/block-intelligence.json` by `build-block-intelligence.py`. 18 page **templates**
     (name → canonical example URL + "N pages match") + 61 **blocks** (name → page-type badge +
     example URL). Query: `python3 tools/importer/block-intelligence-lookup.py <url>` /
     `… --type "Product Detail"` / `… --templates`. Tells you which blocks a page-type SHOULD have —
     use to confirm coverage, not to rank richness.
   Then identify sections + blocks against the catalog and note new blocks / new page-type.
   ⚠️ **Beware JS-hydrated bodies.** Some pages (e.g. product CATEGORY-HUB pages like
   `products/synthetic-silicas`) render their main column via client JS; the importer's headless
   capture (`domcontentloaded` fallback) serialized BEFORE hydration → body dropped, file ~1.6 KB,
   console-sweep still 0 (nothing broke, just empty). Detect by BYTE SIZE (a hub at 1.6 KB vs a
   detail page at 6–9 KB) — the richest-representative mandate surfaces this immediately.
3. **EXTEND the importer** — add page-type dispatch if the shape is new; add/adjust catalog
   selectors + parsers; reuse existing blocks wherever possible.
4. **REBUNDLE** — `bash …/aem-import-bundle.sh --importjs tools/importer/import-grace-master.js`.
   Verify the change is in the bundle (grep for the new logic; esbuild strips comments).
5. **VALIDATE ON ONE PAGE** first — import a single representative URL, check content + render +
   console. Only then bulk.
6. **BULK REIMPORT** the cluster — split URLs into chunks of ~10, run 4-wide in parallel
   (`run-bulk-import.js` per chunk). ~60s/page (grace.com never network-idles → 45s fallback).
7. **VALIDATE (§4)** — the 3-stage funnel across ALL pages, THEN the **visual-parity gate (§4a):
   3+ full-page side-by-side screenshots vs live source**. Do NOT say "done" before §4a passes.
8. **PROVE NO REGRESSION** — if step 3 edited any CENTRALIZED source (shared parser/transformer/
   catalog), reimport ONE sample from each PREVIOUSLY-COMPLETED set and diff against its on-disk
   `.plain.html` (or its `backups/<set>/` bundle output). One bundle serves all templates, so a
   shared edit can silently change another family. Confirm byte-parity before claiming done.
9. **SNAPSHOT (§7)** — copy the frozen bundle + urls + MANIFEST to `backups/<set>/`.
10. **CAPTURE** — save any non-obvious fix as a memory note.

---

## 4. Validation funnel (the net that catches silent breakage)

Run in order; each stage is cheaper-first, and only escalates on flags:

- **Stage 0 — console-error sweep** (deterministic, cheap, no screenshots):
  `WORKSPACE_PATH=/workspace/current node tools/importer/console-error-sweep.mjs <subdir>`
  Renders every page headless, flags `failed to load block X (404)` / decoration errors. Catches
  the whole "content preserved but block broken" class that text/structural audits miss. Target: **0**.
- **Stage 1 — structural component diff** (`tools/importer/stage1-structural.py`, adapt per family):
  source component signatures vs migrated blocks → flags **missing** components. Precise (insights
  went from 164 false-flags on text-completeness to 1 real flag here).
- **Stage 2 — visual critique** on Stage-0/1 flags + a small random sample: render source vs
  migrated, compare the article/content region (ignore nav/cookie/JS-hydrated zones), judge
  semantically. Use `excat-visual-critique` / `excat-import-validation`.

Note: the runner's **content-completeness %** is a blunt text-similarity heuristic — it false-flags
~100% of grace.com pages (their nav/megamenu/JS-hydrated text isn't in clean output). Treat it as
noise, NOT a gate. The 3-stage funnel above is the real net.

### 4a. Visual-parity gate — MANDATORY before claiming any set "done"

Stages 0–1 are deterministic but **blind to visual defects** (wrong color, wrong font size, a
duplicate breadcrumb, a collapsed hero). Real examples this caught that console/DOM checks passed:
press-release hero rendered near-black instead of blue; a `<p>` hero title shrank to 14px; a
duplicated authored breadcrumb rendered as a numbered list above the hero. So:

**Before stating a family/template complete, run a full-page side-by-side SCREENSHOT comparison —
migrated (`localhost:3000`) vs LIVE source (grace.com) — on at least 3 representative sample pages,
and report a region-by-region table (hero, breadcrumb, body, boilerplate, footer…) with ✅/⚠️ per
region. Fix every ⚠️ before claiming done.** Console + structural sweeps still run over ALL pages;
the 3+ visual comparisons are the GATE.

- grace.com **does** render headless for most templates: `browser_navigate` to the live URL +
  `browser_take_screenshot fullPage:true`; do the same for the localhost page; compare.
- Pick samples that exercise **structural variety** within the cluster, not 3 near-identical pages —
  e.g. newsroom: an h1-title PR, a `<p>`-title PR, a page whose source carried an authored breadcrumb.
  Two look-alike samples missed both the `<p>`-title and duplicate-breadcrumb defects.
- Sample = 3+ per template cluster, NOT every page (full screenshots at 165-page scale is wasteful
  on a uniform template). Console/structural still cover 100%.
- If a specific source page genuinely won't load headless (heavy JS / geo-gated / JS-hydrated list
  like the press-releases landing), **say so explicitly** — never skip silently and imply coverage.

### 4b. Rendered-inventory comparison — the scaled, per-page audit method (products, 34 pages)

§4a's 3-sample screenshot gate confirms a template *looks* right; when you need to grade EVERY page
in a family for content fidelity (not just 3 samples), use this token-efficient rendered-DOM diff
instead of screenshotting dozens of pages. This is how the products family (34 pages) was fully
audited and segregated into OK ✅ / COSMETIC ⚠️ / MAJOR ❌.

**Pick the two endpoints — and PROVE they're equivalent first.**
- Source = live `https://grace.com/<path>/`. Migrated = the **production PREVIEW**
  `https://{branch}--{repo}--{owner}.aem.page/<path>` (NOT localhost — the local dev server is
  flaky here and, when started with `--html-folder`, PROXIES `.plain.html` from remote instead of
  serving your working copy). Before trusting the preview as a stand-in for your on-disk output,
  PROVE they match: (a) inject a unique marker comment into a local `.plain.html` and curl localhost
  to see if it's reflected (it usually is NOT → confirms localhost proxies remote), and (b) diff the
  preview's `.plain.html` block classes + byte size against your local file for one page. Only once
  byte/structure-identical is the preview a faithful proxy for "what the migration produced."
  ⚠️ Never assume — this equivalence check is the load-bearing step.
- Fallback if the preview 404s (page not yet pushed to DA): you MUST use a working `localhost:3000`
  serving local `content/` (plain `aem up`, no `--html-folder`), or you have nothing faithful to
  compare. Say so rather than comparing against stale remote.

**Pre-flag cheaply before rendering anything.** Map each source slug → migrated file (handle casing,
e.g. `TRISYL-XGE-Catalyst` → `trisyl-xge-catalyst`). Record **byte size + block count** per migrated
`.plain.html`: tiny files (hubs at 1.5–2.6 KB vs detail pages at 6–13 KB) pre-flag JS-hydrated
content-loss suspects before you look at a pixel. A curl of the SOURCE gives a rough component
signature too — but treat it as a HINT ONLY (raw grace.com HTML is a pre-hydration skeleton; §3 step 2).

**Fan out — one sub-agent per batch of ~6–10 pages** (Task/Agent tool, `general-purpose`). Run
batches SEQUENTIALLY, not concurrently — they share one headless browser and will fight over it.
Each sub-agent, per page:
1. Renders BOTH URLs at a fixed **1280×900 desktop** viewport (Playwright MCP).
2. **Waits ~2.5–4 s for hydration** (EDS blocks + JS-hydrated hub lists populate after load; use a
   `setTimeout` Promise in `browser_evaluate`).
3. Extracts a **compact component inventory** from each side via `browser_evaluate` — the ORDERED
   list of sections/blocks, heading text, and COUNTS of key elements (images, CTAs, cards, accordion
   items, tables **+ column counts**, video embeds). Comparing two structured inventories is the core
   — NOT dumping screenshots.
4. Diffs the inventories **region by region** against a checklist: hero (bg/breadcrumb/H1/subtitle/
   CTA), contact widget, body-copy completeness (is EVERY source heading/paragraph/download present?),
   columns teaser, cards "Latest Insights", accordion, video, tables, layout.
5. Uses `content/drafts/<block>.plain.html` as the REFERENCE for what a given EDS block should look
   like whenever a block's identity is ambiguous.

**Two verification rules that keep the OK list trustworthy (avoid false positives):**
- **Lazy-load guard:** call an image "broken" ONLY if `naturalWidth === 0` *after scrolling it into
  view*. This clears lazy "Latest Insights" thumbnails (false alarm) while still catching a genuinely
  broken image (`src=about:error`, naturalWidth 0).
- **Element-scoped screenshots ONLY as a last resort** — for a specific color/spacing/font judgment,
  never `fullPage`. Every finding must cite what was actually observed in the rendered inventory.

**Classify + roll up:** each region ✅/⚠️/❌ → per-page severity. **OK ✅** = no user-visible diff
worth fixing; **COSMETIC ⚠️** = content correct, only visual polish differs (color, spacing, font,
alignment, image sizing, a rendered-as-list-not-table); **MAJOR ❌** = missing/empty/broken/wrong
content or broken layout (empty hub list, dropped paragraph/section, 404 links, broken image).

**Report cross-cutting patterns separately so they're fixed ONCE, not per page.** The products audit
surfaced: header breadcrumb rendering as bare `› › › › ›` (all 34 pages — one runtime fix);
video-overlay dropping its caption title/description (parser); `.pdf` download hrefs rewritten to
`-pdf` → 404 (transformer); a stray mid-page `Home / Products` breadcrumb before Follow-Us tails;
and duplicated table columns / duplicated brochure images. Systemic → fix in the shared
parser/transformer/runtime and re-verify a sample; per-page content loss → fix and reimport that page.

**Caveat to record every time:** this grades the RENDERED PREVIEW vs LIVE grace.com — it proves
migration fidelity, NOT that anything is published to DA (§0). Keep that distinction explicit.

### Known misses (gaps the funnel does NOT yet cover)

- **No draft-coverage check.** Nothing verifies every catalog variant/option has a matching
  `content/drafts/*.plain.html`. This is why `cards-product-cta` / `columns-media-figures` slipped.
  → cheap fix: a script that diffs catalog names + `emits` options against `content/drafts/`.
- **No positive content-preservation gate.** Stage 0 catches *broken* blocks, Stage 1 catches
  *missing* blocks; neither confirms authored body text/links actually survived, and completeness %
  is too noisy to serve as that gate. Body components that fall through the body loop flatten
  silently (preserved but unstyled) and only Stage 2 (manual) catches them.
- **Parity is fully manual.** The computed-style comparison vs live grace.com (§2) is by hand per
  page; there's no automated "diff migrated vs live measurements" pass.
- **Stage 1 is per-family.** Signatures are hand-tuned to insights; each new family needs its own.
- **3 of ~12 families proven (insights 165 + newsroom 28 + products 34 = 227/470).** The loop
  generalized from insights (custom `buildInsightsArticle`) to newsroom + products (default path) —
  but each new family still needs its own analysis + visual gate; don't assume the default path covers
  everything.
- **Late-hydration hub lists need a live-DOM fallback.** The onLoad wait can serialize a JS-hydrated
  hub before its product-nav list appears. The `/tmp/qa-src` cache is ALSO pre-hydration (missing
  nested sub-items), so the fallback is the LIVE source DOM (Playbook "Product hub / sidebar recipe"),
  not the cache. No automated detector for "list didn't hydrate" yet — caught by manual visual gate.
- **Publishing to DA is unproven at scale.** Everything is local so far (see §0 — content is
  git-ignored, EDS serves from DA). No family has been pushed to `.aem.page`/`.aem.live` yet.

---

## 5. Site scope (470 URLs) — status + remaining

| Section | Sitemap | Migrated | Shape / template clusters |
|---|---|---|---|
| insights | 165 | 165 ✅ | insights-article template — DONE |
| newsroom | 28 | 28 ✅ | 26 press-releases (default path + Hero (banner) + URL breadcrumb) + 2 landing (hero + year-accordion + featured cards) — DONE |
| products (detail) | 28 | 28 ✅ | Product Detail template — DONE. Default path + `template: contactus` + Hero (product) + `sectionizeFlatBody`. See "Product Detail recipe" below |
| products (hubs) | 6 | 6 ✅ | JS-hydrated CATEGORY-HUB pages (synthetic-silicas, adsorbents, catalysts, fine-chemicals, product-stewardship, quality-management). Imported via onLoad hydration-wait. The 2 hubs whose product-list didn't hydrate in time (catalysts, synthetic-silicas) were reconstructed by HAND from the LIVE source DOM (see "Product hub / sidebar recipe" below) — DONE 2026-08-12 |
| industries | 102 | 102 ✅ | DONE + PUBLISHED TO LIVE + QA'd against source (2026-08-14). ONE template, TWO dispatch branches keyed on section-nav: DETAIL (depth ≥2, section-nav) → `template: sidebar` 3-col (nav\|content\|widget); LANDINGS (depth-1) → `template: contactus` 2-col. Blocks reuse existing (Hero product + sidebar-nav + rich text + gated downloads + Table data-grid + Featured product-selector + Cards category-grid + Cards featured-content + geo-hex + banner-resource-download). Hero image FIX: routes through buildDefaultPage so onLoad materializes inline bg-image → Hero (product) with photo. POST-QA fixes (2026-08-14, live-vs-source visual audit): (a) imageless promotion card-grids → `isCategoryGrid` relaxed to accept `a.cmp-card` (not only `.bio`), ≥1 card, image-optional → Cards(category-grid); 18 pages reimported; (b) category-grid phantom-image empty cells → blocks/cards/cards.js drops empty cells (runtime, global); (c) banner-resource-download emitted 1-row/2-cell → fixed parser to 2 rows (`cells:[[c1],[c2]]`) so the CTA renders; 17 refining pages reimported. See "Industries recipe" + `backups/industries/MANIFEST.md` (revs 1-6) + `shots/VISUAL-FINDINGS.md`. KNOWN-OPEN: `/industries` root 404 on live (on disk, not in client publish list → needs DA publish) |
| about-grace | 39 | 8 | section pages + ~30 leadership bios (person-profile template) |
| campaign | 17 | 2 | flat campaign/landing pages |
| forms | 15 | 1 | DEFERRED → AEM Adaptive Forms pass |
| vendor-suppliers | 12 | 0 | — |
| compliance | 11 | 1 | sidebar template |
| people-and-careers | 7 | 1 | — |
| resources | 5 | 0 | — |
| misc one-offs | ~10 | ~few | privacy/cookie/terms/search/404/etc. |

Recommended order (ROI): ~~newsroom~~ ✅ → ~~products (detail)~~ ✅ → ~~products (hubs)~~ ✅ →
~~industries~~ ✅ (102, published + QA'd 2026-08-14) → **leadership bios**
(about-grace, person-profile template, ~30 uniform) → campaign → forms (Adaptive Forms pass —
inventory + submission flow DONE, see `FORMS-INVENTORY.md`). Products set fully complete (28 detail +
6 hubs). Industries fully complete (102) — next up is about-grace leadership bios.

**Newsroom template notes (reference for similar default-path families):** press releases take the
**default path** (`buildDefaultPage`) — no new page-type needed; the whole body (dateline, quotes,
About-boilerplates, forward-looking statement, trademark, contact) is preserved as default content.
All the work was the hero — see the "Hero (banner) recipe" below. Newsroom = 26 PRs (of which
4 gradient heroes, 12 breadcrumb-off) + 2 landing pages. 0 console errors; 3-sample visual gate passed.

### Hero (banner) recipe — the accumulated, PER-SOURCE truth (reference for every family)

The grace.com short page banner is `hero__section hero-reduce-height`. It is **NOT one fixed style** —
read each source page and emit accordingly. Parser: `parsers/hero-banner.js`; styles: `blocks/hero/hero.css`.

1. **Block name (importer).** Emit `Hero (banner)` → class `hero banner` → loads `blocks/hero/`. NEVER
   `Hero-Banner` (→ `blocks/hero-banner/` 404). Fixed 13 non-newsroom pages too (`git grep 'class="hero-banner"'`).
2. **Background — detect per source (importer + CSS).** Source has TWO flavours, distinguished by the
   source hero's `gradient` class:
   - no `gradient` → **solid blue** `#004990` (`.hero.banner.no-image`; suppress the base `::before`
     overlay or it goes near-black). e.g. PARAGON, braskem.
   - `gradient` → solid blue **+ a left→right black overlay** (`linear-gradient(to right,#000,transparent)`).
     Parser emits the `gradient` OPTION → `Hero (banner, gradient)` → `.hero.banner.no-image.gradient::before`
     re-enables the overlay. e.g. molecule-one, ART. (Only for the no-image band; image heroes carry their photo.)
3. **Title `<p>`→`<h1>` (importer).** Some heroes put the title in a bare `.hero__heading > p` (no h-tag;
   2025 PRs) → parser promotes it to `<h1>`, else it shrinks to 14px body text.
4. **min-height = 178px (CSS), NOT 100px.** The source floor is `min-height:100px`, but the intended
   banner look is modeled on `about-grace/this-is-grace` where breadcrumb + single-line title fill it
   to ~178px. Do NOT drop it to 100px (a mid-session mistake — short-title banners are meant to be 178px).
   Content taller than that grows the band naturally (padding 68px top / 30px bottom at all viewports).
5. **Body spacing (RUNTIME CSS).** Default-path pages put hero + body in ONE `.section.hero-container`
   (margin 0), so the body wrapper is flush to the band and the last line butts the footer. Source leaves
   **50px on BOTH ends** → `main > .section.hero-container > .hero-wrapper:has(.hero.banner) +
   .default-content-wrapper { margin: var(--spacing-l) 0 }`. Scoped to `.hero.banner` so insights/sidebar unaffected.
6. **Centered body subhead (RUNTIME CSS).** The italic `<h3><em>` subhead (e.g. "Novel AI Application…")
   is `text-align:center` in source (markdown drops the inline style) → re-center via
   `…+ .default-content-wrapper > h3:has(> em:only-child) { text-align:center }`.

### Breadcrumb — ON by default + `breadcrumb: false` metadata (per source)

Breadcrumb is auto-derived from the URL by the hero `banner` variant and shows BY DEFAULT. Two moving parts:
- **grace-cleanup strips the authored source `.cmp-breadcrumb`** (else it renders a duplicate numbered
  list above the hero — the source ships one; we derive our own).
- **Per-page opt-out:** some source pages have NO breadcrumb (e.g. 2025 PRs). The importer captures
  `params.sourceHadBreadcrumb` **before cleanup strips it**, and `buildDefaultPage` emits a
  `breadcrumb: false` Metadata row on banner-hero pages whose source lacked one. `blocks/hero/hero.js`
  reads `getMetadata('breadcrumb')` and skips the breadcrumb only when it's `false`/`no`/`off`. So:
  source has breadcrumb → shows; source lacks it → `breadcrumb:false` → hidden. Faithful per page.

### Hero (contact) + hexagon/geo background recipe — form pages (Contact Us)

Standalone `/forms/contact-us-*` pages use a dark-blue banner with the source's
`geoAndHexBottom` decoration (triangle line-network behind a white hexagon mask).
Author as **`hero campaign no-image`** (reuse the campaign variant — do NOT make a
new `hero contact` variant). Put the `<h1>` AND the subhead `<p>` in ONE content
cell (the campaign desktop inset targets `> div:last-child`; two cells leave the
h1 un-inset/clipped). `blocks/hero/hero.css` `.hero.campaign.no-image` adds:
solid `#004990` bg, white copy, suppressed photo gradient (`::after{content:none}`),
`min-height:35vw` (source scales ~35vw: 448px @1280, 504px @1440), h1 42px/weight 100,
subhead 20px. Also set page metadata `template: contactus` + `contactus: true`
(green sticky widget) and a relative form-JSON href (`/forms/….json`, NOT absolute
— absolute cross-origin fails CORS on preview).

**HEX/GEO SHARPNESS (asset-resolution rule).** The geoAndHex bottom edge is drawn
with two PNG masks (`blocks/hero/hero-hex-mask.png` = white hexagon mask,
`hero-geo-lines.png` = triangle network), rendered `background-size:cover`. It is
NOT a missing CSS property — sharpness depends entirely on **source PNG
resolution**. The original low-res crops looked dull/blurry when scaled up. To make
the hexagons + lines crisp and bright, swap in the SOURCE's own high-res assets:
- Hex mask: `https://grace.com/etc.clientlibs/grace/clientlibs/clientlib-site/resources/WR_Grace_hexagon_pattern_mask_final.png` (13083×1372)
- Geo lines: `https://grace.com/etc.clientlibs/grace/clientlibs/clientlib-site/resources/WR_Grace_Home_triangle_pattern_1_mobile.png` (5949×1171)

Full-res is heavy (~438KB total). Downscale with ImageMagick to stay crisp but lean
(committed-asset budget), preserving alpha:
```
convert WR_Grace_hexagon_pattern_mask_final.png -resize 3000x -strip hero-hex-mask.png      # ~24KB
convert WR_Grace_Home_triangle_pattern_1_mobile.png -resize 2000x -colors 64 -strip hero-geo-lines.png   # ~132KB
```
Overwrite `blocks/hero/hero-hex-mask.png` + `hero-geo-lines.png`. No CSS change
needed — same `cover` rendering, just higher-res source artwork. The source uses the
SAME technique (verified in `clientlib-site.min.css`: `.geoAndHexBottom:before/:after`),
so crispness is purely an asset-resolution matter.

### Product Detail recipe — the accumulated, PER-SOURCE truth (28 pages, DONE)

`grace.com/products/<slug>/` detail pages take the **default path** (`buildDefaultPage`) — no new
page-type. block-intelligence has NO separate hub template (every `/products/*` → "Product Detail",
rep `TRISYL-XGE-Catalyst`), so the section→block contract came from READING the page. Full contract in
memory `product-detail-template`. Section order → block, all reusing EXISTING blocks:

1. **Hero (product)** — `parsers/hero-banner.js`. Discriminator: `hero-reduce-height` **+ a CTA**
   (`.button__section`/`.hero__button`) ⇒ `Hero (product)`; reduce-height **without** a CTA ⇒
   `Hero (banner)` (breadcrumb+title only, e.g. syloid-rad, this-is-grace); the tall homepage hero has
   a CTA but is NOT reduce-height ⇒ stays banner. The hero CTA is often a gated-download `<button>` whose
   real href is base64 in the `href` attr → decode. Subtitle is a bare `<p>` in `.hero__content` (no
   class) → captured as subheading. CSS: `.hero.product h1 { display:block }` (base `.hero h1` is
   flex-column and stacks the ® `<sup>` on its own line, ballooning hero height).
2. **Contact-us widget → metadata.** Emit `template: contactus` + `contactus: true` + `contactus-tagline`
   (the `.contactus__text` subtitle — NOT the "Contact Us" button label). `template: contactus` drives
   `templates/contactus/contactus.css` (narrow 920px LEFT column + right rail for the sticky panel);
   without it content centers full-width and the widget floats over it. Presence + tagline MUST be
   captured into `params` **pre-cleanup** (`params.sourceHadContactWidget/contactWidgetTagline`) because
   grace-cleanup strips `.contact-us-sticky` in beforeTransform, before `buildDefaultPage` checks — same
   pattern as `sourceHadBreadcrumb`.
3. **Video (overlay)** — `.media-callout .media-video`; the URL is in the sibling
   `.media-modal .active-video video[src]/iframe[src]` (youtube-nocookie embed) → normalize to `watch?v=`.
4. **3 benefit cards → Cards (product)** — `.cmp-card.bio` (href-less anchors) in a plain `.row`
   (NOT a `.cmp-card-list`). Body is a `.spt-copy > ul` bullet list — parser preserves ul/ol (don't flatten
   to a `<p>`), skips the empty link. Matcher unions hub product-nav grids + these benefit rows.
5. **2 download buttons** — gated-modal `<button>`s: `normalizeGatedDownloads` decodes the base64 href +
   wraps in `<strong><a>` so `scripts.js` `decorateButtons` promotes to `.button.primary` (green). Runs of
   ≥2 button-wrappers → `scripts.js` `groupButtons()` wraps them in `.button-group` (centered flex row on
   desktop, stacked on mobile). It also strips leaked gated forms (`.lightbox-container`,
   `.gated-asset-simplified`, `form.gated`) — forms are deferred to the Adaptive Forms pass.
6. **Accordion (faq)** — `.accordion`.
7. **Tail (silsol/syloid-rad):** **Columns (horizontal-teaser)** inside a `.geoAndHex/.light-gray-bkgd`
   section (hexa band; columns.css keys it off `.columns-container:has(.columns.horizontal-teaser)`, incl
   the intro `.subhead-large` h2 the parser now emits) + **Cards (featured-content)** "Latest Insights"
   (heading + "View all articles" emitted when `params.emitFeaturedHeading`, set by buildDefaultPage).

**CRITICAL — flat-body section isolation (`sectionizeFlatBody`, gated to `hasCU`).** buildDefaultPage
decorates `document.body` in place, so ALL blocks stay in ONE source AEM-grid section → every block's
`*-container` class stacks on one `.section`, and e.g. the columns hexa background bleeds across the WHOLE
page (above the hero, everywhere). Fix: after discovery, FLATTEN by document order — collect block
`<table>`s + text leaves (`h*/p/ul/ol/blockquote/figure`) via `querySelectorAll` (doc order), regroup so
each block is its own section; a TRAILING heading-led run (≤3 nodes: the block's own H2 + optional CTA
`<p>`) merges INTO the block's section (so teaser / Latest-Insights headings travel with their block),
larger content runs stay standalone. Rebuild `main` as flat `<div>` sections joined by `<hr>` (the EDS
section delimiter — the serializer maps `<hr>`/top-level-`<div>` → sections). Gated to `hasCU` so
validated flat pages (newsroom/compliance) keep their single-section output.

**Batch-import hydration caveat.** The onLoad hydration wait makes each product page slow: a 28-page run
**times out at ~10 min**, AND under load a page can serialize EMPTY (trisyl-xge-catalyst came out 967B
once). Import in **batches of ~5**, then AUDIT byte size / section count and reimport any tiny page. (A
per-page completeness ⚠️ ~50% is EXPECTED here — the runner compares against the pre-hydration skeleton.)

### Product hub / sidebar recipe — the accumulated, PER-SOURCE truth (6 hubs, DONE 2026-08-12)

The 6 `/products/` HUB pages (adsorbents, catalysts, fine-chemicals, synthetic-silicas,
product-stewardship, quality-management) use `template: sidebar` (left section-nav + wide content
column). The nav list is authored as a plain `<ul>` + Section Metadata `Style: sidebar-nav`. All 6
share ONE structure; the recurring gaps + their fixes:

- **JS-hydrated product-nav list.** The main-column product list hydrates late; the importer's onLoad
  wait sometimes serialized the page BEFORE it appeared (catalysts + synthetic-silicas came out with
  only the intro). FIX: reconstruct BY HAND from the **LIVE source DOM** (`grace.com/products/<hub>/`
  via Playwright `browser_evaluate`, walking the ULs), NOT from the `/tmp/qa-src` cache — the cache is
  the pre-hydration skeleton and is MISSING the nested sub-items. The live list has **two top-level
  `<ul>` groups** (rendered as two columns) with nested `<ul>` sub-items and trailing descriptive text
  (e.g. catalysts: CONSISTA®/LYNX® PP/HYAMPP® under Polypropylene; RANEY® "…for hydrogenation";
  synthetic-silicas: DARACLAR® "Beer Stabilizer & Clarifier", PERKASIL® "Precipitated Silica" + 2 subs).
  Product names are wrapped in `<strong>`. Match the WORKING hubs (adsorbents/fine-chemicals) pattern:
  `<li><p><strong>NAME®</strong> <a href="…">label</a></p></li>`.
- **Hero background image.** Hub heroes are `Hero (banner)` (breadcrumb + title, no CTA) WITH a photo
  background — NOT the solid-blue no-image band. Source bg is a DAM path, but a scene7 equivalent
  exists (catalysts `sc_catalysts_employee_v2`, synthetic-silicas `mt-synthetic-silicas-worms-employee-flipped`
  — probe `grace.scene7.com/is/image/grace/<name>` for 200). Author it as the hero's FIRST-row anchor
  `<div class="hero banner"><div><div><a href="https://grace.scene7.com/is/image/grace/<name>"></a></div></div><div><div><h1>…`
  → buildDynamicMediaImages converts it to a `<picture>` → image banner with the left→right gradient.
- **Sidebar-nav dividers + top spacing (RUNTIME, `templates/sidebar/sidebar.css`).** Source
  `.section-navigation li` = `border-top:1px solid rgb(196 196 196)` + `padding:12px 0` (a bordered
  list). Content sits 50px below the hero (source article `padding-top:5rem`). The insights alignment
  rules (nav `margin-top:0` + first-content `margin-top:0`) must be SCOPED to insights
  (`:has(> .section.sidebar-nav.breadcrumb-container)`); product hubs (plain `sidebar-nav`, NO
  breadcrumb-container) keep the 50px gap and get the per-`<li>` dividers. Scope everything with
  `body.sidebar main:not(:has(> .section.sidebar-nav.breadcrumb-container))` so insights are untouched.
- **Gray callout section (`gray-callout`, GLOBAL in `styles/lazy-styles.css`).** The
  product-stewardship "contact one of the following Grace representatives" panel is
  `section.light-gray-bkgd.black` = rgb(230 231 232), centered, h4 Roboto Slab 18/600. Do NOT reuse
  the global `.section.light-gray` (its intro-paragraph rule balloons body text to heading-xl); add a
  dedicated `gray-callout` style. Tag the section with Section Metadata `Style: gray-callout`. On
  product hubs, tighten the gap before it (grid margins don't collapse → zero the preceding section's
  bottom margin + give the callout `margin-top:20px` ≈ source 21px).
- **"Products" heading above the nav.** Source `.section-navigation` opens with
  `<h4><strong>Products</strong></h4>` (Roboto Slab 18px/**600** black, `margin-bottom:30px`). Author
  it in content as `<h4 id="products"><strong>Products</strong></h4>` before the nav `<ul>` (all 6
  hubs); style product-hub-scoped in sidebar.css. NOTE: source renders ALL product-hub nav links bold
  (weight **900**), not just the first — override the `li:first-child a` weight for hubs.
- **Hero images.** Hub heroes are `Hero (banner)` (breadcrumb+title, no CTA) WITH a photo bg. Source
  uses DAM paths but a scene7 rendition of the SAME basename resolves (probe
  `grace.scene7.com/is/image/grace/<basename>` for 200 — worked for all 6): adsorbents
  `mt-adsorbents-employee-FINAL-3000x1360`, catalysts `sc_catalysts_employee_v2`, fine-chemicals
  `sc-chemicals-woman-lab-looking-3000x1360`, synthetic-silicas `mt-synthetic-silicas-worms-employee-flipped`,
  product-stewardship `ehs-product-risk-management-worms-ecat-lab`, quality
  `ehs-quality-management-screen-plant-control-system-blue`. Author as the hero's first-row anchor →
  buildDynamicMediaImages converts to `<picture>`.
- **Two-column product list (catalysts, synthetic-silicas only).** Source lays the product list as TWO
  side-by-side `<ul>` groups (~313px each, 40px gap). Author as two consecutive top-level `<ul>`s in the
  content wrapper; CSS `.default-content-wrapper:has(> ul + ul) > ul { display:inline-block; width:calc(50% - 20px) }`
  + `+ ul { margin-left:40px }` from 600px (only engages when 2 groups → single-list hubs stay full-width).
- **MOBILE section-nav `<select>` "filter" (<900px).** Source collapses the nav `<ul>` into a native
  `<select>` (current hub selected, onchange → navigate); desktop shows the `<ul>`. Implemented in NEW
  `templates/sidebar/sidebar.js` (builds the select from the authored `<ul>`, product-hub-scoped) +
  sidebar.css (mobile shows select/hides `<ul>`; `>=900px` flips). Select style: bg rgb(239 239 239),
  1px rgb(196 196 196), Roboto 16/500, appearance:none, 40px, "+" indicator via wrapper `::after`.

**⚠️ DIV-BALANCE LESSON (hand-editing `.plain.html`).** When merging/splitting sections by hand, an
off-by-one `<div>` (e.g. forgetting to close a `table two-column-content` block) SILENTLY merges two
top-level sections — the browser's parser folds them, and a following section's `Style:` metadata then
applies to the merged super-section (product-stewardship: `gray-callout` bled over the WHOLE content
column). ALWAYS after a hand edit: (1) `python3 -c` count `<div>` opens vs `</div>` closes (must be
equal); (2) run `aem.decorateSections` on the served `.plain.html` (via `--html-folder <tmp>
--prefer-plain-html` + Playwright `import('/scripts/aem.js')`) and assert the expected section count +
that each `Style:` landed on the intended section ONLY.

**Dev-server + proxy caveat (verifying content edits).** Product `.plain.html` is PROXIED from remote
DA on both localhost AND the `.aem.page` preview, so hand-edits to `content/products/*.plain.html` do
NOT render there until published to DA. To verify locally: copy the edited file into a throwaway
folder and serve with `aem up --html-folder <tmp> --prefer-plain-html`, then fetch
`/<tmp>/<slug>.plain.html` and run the decoration in-browser. CSS/JS (blocks, templates, styles) ARE
served locally and render immediately.

### Industries recipe — ✅ COMPLETE (102 pages, built 2026-08-13, published + QA'd 2026-08-14)

STATUS: all 102 imported, published to live, and visually QA'd against grace.com (full 204-screenshot
montage pass + card-grid audit). Post-QA fixes landed — see the `industries` row in the scope table
above for the fix list, `backups/industries/MANIFEST.md` (revs 1-6) for the frozen bundle record, and
`shots/VISUAL-FINDINGS.md` + `compare-logs/PARITY-AUDIT.md` for the audit. Reusable QA harnesses:
`compare-eds-vs-source.mjs` (structural sweep), `audit-cardgrids.mjs` (per-page card-grid parity),
`shoot-pairs.mjs` + `build-montage.sh` (screenshot montage). ONE KNOWN-OPEN item: the `/industries`
root landing is 404 on live (content on disk, not yet published to DA).

Full original analysis in `tools/importer/INDUSTRIES-ANALYSIS.md`. Summary (kept for reference):

- **It is ONE template ("Solution Detail") with optional sections**, NOT 3. block-intelligence.json
  labels 3 names (Solution Detail / Solution Content Page / Solution Detail Rich) but the rendered-DOM
  comparison shows one shared block vocabulary; pages differ only in WHICH optional blocks they include.
  Depth tiers (11 landings d1 / 44 d2 / 42 d3 / 4 d4) are positions in the tree, not separate templates.
- **RICHEST-representative SET (drives the importer bundle) — use BOTH, no single page covers all:**
  1. `https://grace.com/industries/food-beverage/beverage/` — 13 blocks; has gated-download + featured-
     products + data-table + accordion + both card variants + contact-split.
  2. `https://grace.com/industries/pharmaceutical-solutions/fine-chemicals/consultative-services/r-d/`
     — adds the **media-callout figure-pairs** (4×, its unique block) + h4 rich-text + 3-col table.
  Cross-check page: `nutraceutical-solutions/traditional-herbal-medicine` (also 13 blocks).
- **Tiered visual-walk set (5 upper / 5 mid / 5 low) already chosen** (see INDUSTRIES-ANALYSIS.md §
  tier table): upper = beverage, traditional-herbal-medicine, cbd-/lipid-/nutraceutical-cdmo;
  mid (8 blocks) = coatings/wood, food-beverage/beer, general-industrial/refractory-additives,
  pharma…/active-ingredient-delivery, plastics…/unipol--pp-process-technology; low (5 blocks) =
  fine-chemicals/fcms-case-study, plastics…/custom-catalysts, …/plastic-additives,
  …/polyethylene-catalysts/pe-hybrid, …/tire-and-rubber-additives.
- **Section → block contract** (from the rep set — nearly all REUSE existing blocks):
  Hero (product) + `template: contactus` + Contact-Us widget · sidebar-nav (parent industry + nested
  siblings; +mobile `<select>` filter like product hubs) · rich text (h3/h4 + bullet lists) ·
  gated-download buttons (reuse `normalizeGatedDownloads` + `.button-group`; modal = Forms pass) ·
  native data table · **Featured Products selector** (dark product cards → /products/ — the ONE
  likely-new block; confirm vs drafts/catalog) · cards category-grid (reuse vyvid's) · cards
  featured-content "Latest Insights" (+ geo-hex) · contact-split banner + social follow ·
  **media-callout figure-pairs** (r-d — captioned 2-up image rows; confirm block/variant).
- **NEW/confirm blocks:** (1) Featured-Products selector, (2) media-callout figure-pairs. Everything
  else already built for products/insights/newsroom.
- **NEXT (per §3):** extend importer (likely reuse products default-path + `sectionizeFlatBody` +
  `template:contactus`; add the 2 new parsers) → rebundle → import the 2 reps → §4a visual gate →
  bulk-import 102 in chunks → prove-no-regression on prior sets → snapshot `backups/industries/`.

---

## 6. Operational commands (quick reference)

- Rebundle: `bash /home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/aem-import-bundle.sh --importjs tools/importer/import-grace-master.js`
- Import: `WORKSPACE_PATH=/workspace/current node …/run-bulk-import.js --import-script tools/importer/import-grace-master.bundle.js --urls <urls.txt>`
- Parallel: split URLs into chunks, run ≤4 concurrent `run-bulk-import.js` processes (see prior sessions' pattern).
- Regenerate catalog after JSON edit: `python3 tools/importer/gen-catalog-module.py`
- Console sweep: `WORKSPACE_PATH=/workspace/current node tools/importer/console-error-sweep.mjs <subdir>`
- Block-intelligence (which blocks a page needs, from the reference report):
  `python3 tools/importer/build-block-intelligence.py` (regenerate `block-intelligence.json` from
  `reference/front-end-report-gracev1.html`) · `python3 tools/importer/block-intelligence-lookup.py <url>`
  (predict template + blocks) · `… --type "<PageType>"` (exact block set) · `… --templates` (all, by match-count).
- Quality gate (before "done"): `npm run lint` · `node tools/quality/breakpoint-check.mjs` ·
  `npm run test:a11y <url>` · confirm at localhost:3000.

---

## 7. Bundle backups & the one-bundle risk

**There is ONE master importer** (`import-grace-master.js` + shared catalog/parsers/transformers)
→ ONE live bundle → it serves EVERY template via page-type dispatch. Consequence: editing any
**centralized source** rebundles for ALL families. A change intended for family X can silently
regress family Y. This is the single biggest footgun — hence step 8 (prove-no-regression) and §4a.

**Sources stay centralized — never duplicated.** The one canonical editable copy is
`tools/importer/{import-grace-master.js, component-library.json, catalog-data.js, parsers/, transformers/}`.
To change the importer: edit there → `gen-catalog-module.py` (if catalog changed) → rebundle. Do NOT
copy sources into backup folders; do NOT gather sources from a backup.

**Per-set frozen backups (`tools/importer/backups/<set>/`).** On completing a set, snapshot:
- `import-grace-master.bundle.js` — the self-contained bundle that produced the set. This is the
  ONLY file needed to RE-RUN that set's import (catalog/parsers/transformers are inlined; no external
  refs). External deps at run time = the runner + injected `helix-importer.js` + Chromium (from the
  excat skill, not the repo).
- `urls.txt` — the set's URL list.
- `MANIFEST.md` — provenance: git sha (or "working tree"), what the bundle contains vs the previous
  set's, page count, snapshot date.

**Reproduce/rollback a set:** run the runner with
`--import-script tools/importer/backups/<set>/import-grace-master.bundle.js --urls .../<set>/urls.txt`.

**The live bundle is overwritten on every rebundle** — so the exact bundle that produced an earlier
set is only recoverable from `backups/` or git history. Snapshot BEFORE starting the next family, and
if the live bundle has already moved on, recover the earlier set's bundle from git (`git show
<sha>:tools/importer/import-grace-master.bundle.js`) rather than copying the current one.

Snapshotted so far: `backups/insights/` (pre-newsroom bundle, from git HEAD — no `.cmp-breadcrumb`
strip / no hero `<p>`→h1 / no gradient detection) · `backups/newsroom/` (bundle with ALL the
hero-recipe fixes: `Hero (banner[, gradient])`, `<p>`→h1, breadcrumb-metadata, `.cmp-breadcrumb` strip)
· `backups/products/` (bundle at commit `bd7bc39` with the Product Detail work: `Hero (product)`,
`template: contactus`, `normalizeGatedDownloads`, `sectionizeFlatBody`, cards-product benefit grid,
video-from-media-modal, featured-content + teaser headings — 34 URLs incl. 6 hubs)
· `backups/industries/` (working-tree bundle, 2026-08-13, with the Industries work: `isIndustriesDetailPage`
dispatch + nav-rail injection + `forceTemplate:sidebar`, `isCategoryGrid` structural discriminator,
category-grid title/heading preservation, `table-data-grid` 2-col match, `collapsePathHyphens` link fix,
empty-section cleanup — 102 URLs. RUNTIME: `blocks/table/table.js` scroll-region `tabindex`).
Re-snapshot a set's folder whenever the shared bundle gains more fixes affecting that set. See
`backups/README.md` and memory `importer-bundle-backups`, `product-detail-template`, `industries-migration`.

**Runtime vs importer — the mobile-parity pass (2026-08-13) needed NO rebundle/reimport.** A round of
mobile design-token parity (10px page gutters, mobile-first line-heights 1.3→1.7@900px, the rich-text
lead `<h4>` restyled to Roboto Slab 16/18px black, the product-hero mobile CTA to full-width 13px, and
the section-nav `<select>` preselecting the CURRENT page) was ALL runtime — `styles/styles.css`,
`blocks/hero/hero.css`, `templates/sidebar/sidebar.{css,js}`. None changed the markup the importer
emits (the lead is already an authored `<h4>`; the select is built by sidebar.js from the existing nav
`<ul>`), so the 101 saved industries pages render the fixes immediately and a reimport would produce
byte-identical files. Rule of thumb: only rebundle+reimport when the block/section MARKUP contract
changes (new block name, new Section Metadata Style, changed DOM order) — pure CSS/JS decoration never
requires it. The sidebar.js select-normalize also strips a leading `/content` and collapses `--`→`-`
so the current-page option matches on local preview AND prod.
