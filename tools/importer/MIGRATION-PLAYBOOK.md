# WR Grace — Migration Playbook (end-to-end strategy)

The repeatable process for migrating a grace.com page family to EDS. Insights (165) and newsroom
(28) are complete and validated with this loop; every other family follows the same steps.
Companion docs: `MASTER-IMPORTER-STRATEGY.md` (architecture deep-dive), `component-library.json`
(the catalog), `backups/README.md` (per-set frozen bundles). Memory notes: `console-error-sweep-validation`,
`breadcrumb-url-derived`, `post-meta-is-metadata`, `parser-matcher-precision`, `insights-video-overlay`,
`visual-parity-completion-standard`, `importer-bundle-backups`, `hero-banner-name-fix`,
`authored-option-and-emits`.

**Two hard rules from experience — read these first:**
1. **Never claim a set "done" without the visual-parity gate (§4a): 3+ full-page side-by-side
   screenshots, migrated vs LIVE grace.com.** Console/structural sweeps pass on broken visuals.
2. **On completing a set, snapshot its frozen bundle to `backups/<set>/` (§7). There is ONE live
   bundle for ALL templates — a source edit for one family can silently regress another.**

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
- **2 of ~12 families proven (insights 165 + newsroom 28 = 193/470).** The loop generalized from
  insights (custom `buildInsightsArticle`) to newsroom (default path) — but each new family still
  needs its own analysis + visual gate; don't assume the default path covers everything.
- **Publishing to DA is unproven at scale.** Everything is local so far (see §0 — content is
  git-ignored, EDS serves from DA). No family has been pushed to `.aem.page`/`.aem.live` yet.

---

## 5. Site scope (470 URLs) — status + remaining

| Section | Sitemap | Migrated | Shape / template clusters |
|---|---|---|---|
| insights | 165 | 165 ✅ | insights-article template — DONE |
| newsroom | 28 | 28 ✅ | 26 press-releases (default path + Hero (banner) + URL breadcrumb) + 2 landing (hero + year-accordion + featured cards) — DONE |
| industries | 102 | 8 | deep (depth 2-5): landing → application → detail; most varied |
| about-grace | 39 | 8 | section pages + ~30 leadership bios (person-profile template) |
| products | 36 | 5 | product detail pages, mostly flat depth-2 |
| campaign | 17 | 2 | flat campaign/landing pages |
| forms | 15 | 1 | DEFERRED → AEM Adaptive Forms pass |
| vendor-suppliers | 12 | 0 | — |
| compliance | 11 | 1 | sidebar template |
| people-and-careers | 7 | 1 | — |
| resources | 5 | 0 | — |
| misc one-offs | ~10 | ~few | privacy/cookie/terms/search/404/etc. |

Recommended order (ROI): ~~newsroom~~ ✅ → **leadership bios** (about-grace, person-profile template,
~30 uniform) → products → campaign → industries (largest/most varied, last) → forms (Adaptive Forms pass).

**Newsroom template notes (reference for similar default-path families):** press releases take the
**default path** (`buildDefaultPage`) — no new page-type needed; the whole body (dateline, quotes,
About-boilerplates, forward-looking statement, trademark, contact) is preserved as default content.
The only work was the hero. Three fixes landed here that generalize:
1. **Hero parser emits `Hero (banner)`** (was `Hero-Banner` → `blocks/hero-banner/` 404). The
   `banner` variant styles the dark-blue band AND auto-derives the breadcrumb from the URL. Fixed
   13 already-imported non-newsroom pages too (`git grep 'class="hero-banner"'`).
2. **Hero `<p>`-title → `<h1>`.** Some heroes put the title in a bare `.hero__heading > p` (no
   h-tag; 2025 PRs) → parser promotes it to `<h1>` or it shrinks to 14px body text.
3. **grace-cleanup strips the authored `.cmp-breadcrumb`** — the source ships one, and we derive our
   own from the URL; keeping both rendered a duplicate numbered list above the hero (13 of 26 PRs).
Plus a RUNTIME CSS fix: no-image banner band was near-black (a `::before` gradient meant for
photo heroes) → solid `#004990` for `.hero.banner.no-image` in `blocks/hero/hero.css`.

---

## 6. Operational commands (quick reference)

- Rebundle: `bash /home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/aem-import-bundle.sh --importjs tools/importer/import-grace-master.js`
- Import: `WORKSPACE_PATH=/workspace/current node …/run-bulk-import.js --import-script tools/importer/import-grace-master.bundle.js --urls <urls.txt>`
- Parallel: split URLs into chunks, run ≤4 concurrent `run-bulk-import.js` processes (see prior sessions' pattern).
- Regenerate catalog after JSON edit: `python3 tools/importer/gen-catalog-module.py`
- Console sweep: `WORKSPACE_PATH=/workspace/current node tools/importer/console-error-sweep.mjs <subdir>`
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
strip / no hero `<p>`→h1) · `backups/newsroom/` (working bundle with those fixes). See
`backups/README.md` and memory `importer-bundle-backups`.
