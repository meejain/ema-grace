# WR Grace — Migration Playbook (end-to-end strategy)

The repeatable process for migrating a grace.com page family to EDS. Insights (165 pages)
is complete and validated with this loop; every other family follows the same steps.
Companion docs: `MASTER-IMPORTER-STRATEGY.md` (architecture deep-dive), `component-library.json`
(the catalog). Memory notes: `console-error-sweep-validation`, `breadcrumb-url-derived`,
`post-meta-is-metadata`, `parser-matcher-precision`, `insights-video-overlay`.

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

1. **SCOPE & GROUP** — from the sitemap (`https://grace.com/sitemap.xml`, 470 URLs), take the
   family's sub-tree; group by URL depth/pattern into **template clusters** (near-identical pages
   share a template, e.g. newsroom press-releases, leadership bios).
2. **ANALYZE a representative page** per cluster — fetch source, identify sections + blocks against
   the catalog. Note new blocks / new page-type.
3. **EXTEND the importer** — add page-type dispatch if the shape is new; add/adjust catalog
   selectors + parsers; reuse existing blocks wherever possible.
4. **REBUNDLE** — `bash …/aem-import-bundle.sh --importjs tools/importer/import-grace-master.js`.
   Verify the change is in the bundle (grep for the new logic; esbuild strips comments).
5. **VALIDATE ON ONE PAGE** first — import a single representative URL, check content + render +
   console. Only then bulk.
6. **BULK REIMPORT** the cluster — split URLs into chunks of ~10, run 4-wide in parallel
   (`run-bulk-import.js` per chunk). ~60s/page (grace.com never network-idles → 45s fallback).
7. **VALIDATE (§4)** — the 3-stage funnel.
8. **CAPTURE** — save any non-obvious fix as a memory note.

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
- **Only insights (165/470) is proven.** The loop is validated on one family; newsroom is the next
  test of whether it generalizes.

---

## 5. Site scope (470 URLs) — status + remaining

| Section | Sitemap | Migrated | Shape / template clusters |
|---|---|---|---|
| insights | 165 | 165 ✅ | insights-article template — DONE |
| industries | 102 | 8 | deep (depth 2-5): landing → application → detail; most varied |
| about-grace | 39 | 8 | section pages + ~30 leadership bios (person-profile template) |
| products | 36 | 5 | product detail pages, mostly flat depth-2 |
| newsroom | 29 | 0 | 26 press-releases (depth-4, by year) = ONE template + 3 landing |
| campaign | 17 | 2 | flat campaign/landing pages |
| forms | 15 | 1 | DEFERRED → AEM Adaptive Forms pass |
| vendor-suppliers | 12 | 0 | — |
| compliance | 11 | 1 | sidebar template |
| people-and-careers | 7 | 1 | — |
| resources | 5 | 0 | — |
| misc one-offs | ~10 | ~few | privacy/cookie/terms/search/404/etc. |

Recommended order (ROI): **newsroom press-releases** (uniform, 0 done) → leadership bios →
products → campaign → industries (largest/most varied, last) → forms (Adaptive Forms pass).

---

## 6. Operational commands (quick reference)

- Rebundle: `bash /home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/aem-import-bundle.sh --importjs tools/importer/import-grace-master.js`
- Import: `WORKSPACE_PATH=/workspace/current node …/run-bulk-import.js --import-script tools/importer/import-grace-master.bundle.js --urls <urls.txt>`
- Parallel: split URLs into chunks, run ≤4 concurrent `run-bulk-import.js` processes (see prior sessions' pattern).
- Regenerate catalog after JSON edit: `python3 tools/importer/gen-catalog-module.py`
- Console sweep: `WORKSPACE_PATH=/workspace/current node tools/importer/console-error-sweep.mjs <subdir>`
- Quality gate (before "done"): `npm run lint` · `node tools/quality/breakpoint-check.mjs` ·
  `npm run test:a11y <url>` · confirm at localhost:3000.
