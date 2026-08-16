# LLM Onboarding Prompt — grace.com → EDS migration

Paste the block below **verbatim** into a fresh session to bring a new LLM up to speed on how to run
the importer and how to create backup sets. Fill in `<FAMILY>` with the page family to migrate
(e.g. `about-grace leadership bios`, `campaign`, `industries`). Everything it needs to know lives in
`tools/importer/MIGRATION-PLAYBOOK.md`; this prompt just points there and encodes the non-negotiables.

---

```
You are continuing the migration of grace.com → AEM Edge Delivery Services (EDS) in this repo
(meejain/ema-grace). Before doing anything, get fully oriented:

1. READ, in full, `tools/importer/MIGRATION-PLAYBOOK.md`. It is the single source of truth.
   Start with its "START HERE" block, then §0 mental model → §1 architecture → §2 principles →
   §3 the per-family loop → §4/§4a validation → §5 scope + per-template recipes → §6 commands →
   §7 backups. Then skim the companion docs in the same folder: MASTER-IMPORTER-STRATEGY.md,
   component-library.json (the block catalog), block-intelligence.json, MIGRATED-PAGES.tsv,
   and backups/README.md.
2. READ the memory notes the playbook lists (kebab-case slugs) — they hold the deep detail behind
   each recipe (esp. product-detail-template, products-hydration-fix, authored-option-and-emits,
   block-intelligence-and-richest-rep, visual-parity-completion-standard, importer-bundle-backups).

Hard rules you must follow (from the playbook — do not deviate):
- ONE master importer → ONE live bundle serves ALL templates via page-type dispatch. Editing any
  centralized source (import-grace-master.js / component-library.json / parsers/ / transformers/)
  rebundles for EVERY family, so a change for one set can silently regress another. Prove no
  regression after any source edit.
- Reuse ladder: authored OPTION ▸ VARIANT ▸ new block. Prefer authored options over JS heuristics.
- Styling/decoration fixes belong in RUNTIME files (blocks/*, templates/{name}/*, scripts.js) — no
  reimport. Structure/naming/selection fixes belong in the IMPORTER — rebundle + reimport. Keep
  template-specific behavior in templates/{name}/{name}.{js,css}, NOT in global scripts.js/styles.css.
- Never claim a set "done" without the §4a visual-parity gate: 3+ full-page side-by-side screenshots,
  migrated (localhost:3000) vs LIVE grace.com, region by region.
- Content is git-ignored and served from Document Authoring (DA), not the repo. "Migrated + validated
  locally" ≠ published. NEVER upload/publish to DA without my explicit go-ahead.

How to RUN the importer (from §6):
- Edit centralized sources under tools/importer/. If component-library.json changed:
  `python3 tools/importer/gen-catalog-module.py`
- Rebundle:
  `bash /home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts/aem-import-bundle.sh --importjs tools/importer/import-grace-master.js`
  Then verify your new logic is actually in the bundle (grep it; esbuild strips comments).
- Import a 1–2 page sample first:
  `WORKSPACE_PATH=/workspace/current node <runner>/run-bulk-import.js --import-script tools/importer/import-grace-master.bundle.js --urls <urls.txt>`
- Run the §4a visual gate on the sample → fix → then import the rest IN BATCHES OF ~5 (a large run
  can time out ~10 min, and a JS-hydrated page can serialize EMPTY under load). After each batch,
  AUDIT byte size + section count and reimport any tiny/empty page.
- Quality gate before "done": `npm run lint` · `node tools/quality/breakpoint-check.mjs` ·
  `npm run test:a11y <localhost url>` · confirm visually at localhost:3000. Paste the actual output.

How to AUDIT an already-migrated family per-page (grade every page OK/COSMETIC/MAJOR — from §4b):
- Compare RENDERED source vs RENDERED migrated. Source = live grace.com; migrated = the production
  PREVIEW `https://{branch}--{repo}--{owner}.aem.page/<path>`. **PROVE the preview equals your on-disk
  output first** (inject a marker into a local `.plain.html` + curl localhost to see localhost proxies
  remote; diff preview `.plain.html` block-classes/bytes vs local) — never assume. If the local dev
  server won't stay up, or was started with `--html-folder` (which proxies `/family/*` from remote),
  the preview IS your faithful target; if the preview 404s (not pushed to DA), you MUST use a plain
  `aem up` localhost serving local `content/` or you have nothing valid to compare.
- Pre-flag cheaply: byte size + block count per migrated `.plain.html` (tiny files = JS-hydrated
  content-loss suspects). Then fan out ONE sub-agent per batch of ~6–10 pages, run batches
  SEQUENTIALLY (they share one browser). Each renders both URLs at 1280×900, waits ~2.5–4s for
  hydration, extracts a compact ordered component inventory (blocks + headings + element/column
  counts) via `browser_evaluate`, and diffs region-by-region — NOT full-page screenshots. Judge an
  image broken only if `naturalWidth===0` AFTER scrolling into view. Use `content/drafts/<block>` as
  the block reference. Report cross-cutting defects ONCE (systemic → shared parser/transformer/runtime).

How to CREATE a backup set when a family is COMPLETE (from §7 — do this every time):
- Snapshot to `tools/importer/backups/<set>/` (one folder per completed set):
  1. `cp tools/importer/import-grace-master.bundle.js tools/importer/backups/<set>/import-grace-master.bundle.js`
     — the frozen, self-contained bundle that produced the set (catalog/parsers/transformers are
     inlined; it's the only file needed to re-run that set's import). First confirm the live bundle
     is byte-identical to what produced the set and contains that set's fixes (grep).
  2. `tools/importer/backups/<set>/urls.txt` — the set's exact source URLs (pull from the report
     JSONs in tools/importer/reports/<set>/ so casing matches).
  3. `tools/importer/backups/<set>/MANIFEST.md` — provenance (git sha or "working tree"), the delta
     over the previous set's bundle, which fixes are RUNTIME (in blocks/templates — NOT in the
     bundle), page count, known gaps, and snapshot date. Match the format of the existing
     insights/newsroom/products MANIFESTs.
- Update the playbook §7 "Snapshotted so far" line to include the new set.
- NEVER duplicate sources into backup folders and never gather sources from a backup — sources stay
  centralized; backups hold only the frozen bundle + urls + manifest.
- These backups are the rollback net; the live bundle is overwritten on every rebundle. To recover an
  older set's exact bundle, use backups/<set>/ or `git show <sha>:tools/importer/import-grace-master.bundle.js`.
- To reproduce/rollback a set: run the runner with
  `--import-script tools/importer/backups/<set>/import-grace-master.bundle.js --urls tools/importer/backups/<set>/urls.txt`

Task: migrate the `<FAMILY>` pages following the §3 per-family loop — cluster by RENDERED template,
pick the richest representative BY LOOKING (block-intelligence is a hint, not a ranker), derive the
section→block contract from that page's rendered DOM, extend the importer (reuse ladder), rebundle,
sample-import, run the §4a visual gate, then batch-import the rest and audit. When the family is
complete and gated, CREATE its backup set as above. Show me the quality-gate output and the
side-by-side screenshots before you claim done. Do not publish to DA without my go-ahead.
```

---

## Notes for the human using this

- **Where:** `tools/importer/LLM-ONBOARDING-PROMPT.md` (this file). The playbook it references is
  `tools/importer/MIGRATION-PLAYBOOK.md`.
- **How:** open a new session, paste the fenced block above, replace `<FAMILY>`. The LLM will read
  the playbook + memory notes first, then run the per-family loop and create the backup set.
- **Completed sets (already done + backed up):** insights (165), newsroom (28), products (34 = 28
  detail + 6 hubs — hubs fully closed 2026-08-12: the 2 late-hydrating hub lists, catalysts +
  synthetic-silicas, were reconstructed by hand from the LIVE source DOM; see playbook "Product hub /
  sidebar recipe"), **INDUSTRIES (102) — COMPLETE, published to live 2026-08-14; a further sidebar
  page-by-page QA pass (rev 5-6, 2026-08-15) reimported the 78 left-nav pages + landed 9 more fixes,
  local-only, awaiting client publish go-ahead.**
- **INDUSTRIES — DONE (102 pages, live on `main--ema-grace--meejain.aem.live`).** Built as ONE template,
  two dispatch branches keyed on section-nav presence (detail → `forceTemplate:sidebar`; landing →
  `template:contactus`). Full record: `backups/industries/MANIFEST.md` (revs 1-6) + memory
  `industries-migration.md` (revs 1-12). Live-vs-source parity audit + full 204-screenshot visual montage
  pass done (`tools/importer/shots/VISUAL-FINDINGS.md`, `compare-logs/PARITY-AUDIT.md`; harnesses
  `compare-eds-vs-source.mjs`, `audit-cardgrids.mjs`, `shoot-pairs.mjs`, `build-montage.sh`). Post-QA fixes
  landed: (a) imageless promotion card-grids (`isCategoryGrid` relaxed → Cards(category-grid), 18 pages
  reimported); (b) category-grid phantom-image empty cells (blocks/cards/cards.js drops empty cells —
  runtime, global); (c) banner-resource-download was 1-row/2-cell → fixed to 2 rows so the CTA renders
  (17 refining pages reimported). KNOWN-OPEN: `/industries` ROOT is 404 on live (exists on disk, not in
  the client's publish list — needs DA publish); two cosmetic non-defects (landing Featured-Products
  layout variant; biofuels benefit icons monochrome vs source green — Scene7 param). Screenshots are
  gitignored under `tools/importer/shots/` (regenerable; do NOT commit — 291MB).
- **INDUSTRIES rev 5-6 sidebar QA (2026-08-15) — what changed since the published rev 4.** All local,
  NOT yet published (client must give go-ahead). Bundle grew 170850 → **178300**; frozen at
  `backups/industries/rev6-2026-08-15/` (bundle + importer source + the 2 touched parsers + runtime
  sidebar.css/sidebar.js/cards.css). The 78 left-nav (sidebar-template) pages were all reimported.
  Full detail in `backups/industries/MANIFEST.md` REVISION 5 + 6 and memory `industries-migration.md`.
  Key durable lessons a new session must know:
  - **NESTED section-nav** (importer `buildSidebarNav`): builds a parent-hub `<li>` + nested child
    `<ul>` when the SOURCE nav nests (`.collapse` sub-list); flat fallback otherwise. RUNTIME CSS in
    templates/sidebar/sidebar.css styles parent (Roboto 900, top+bottom border) vs children (500,
    indented). `sidebar.js` mobile `<select>` collects ALL nested anchors (a flat-only `> li > a`
    selector blanked the mobile nav). Agriculture/hydroprocessing etc. are genuinely FLAT in source —
    flat output there is correct, not a regression.
  - **Iron Tolerance promo card** (`buildSidebarPromoCard`): only resid-conversion has it in source.
  - **Lazy body-diagram images** (`materializeLazyImages`, IMPORTER): AEM `.image` components carry
    `data-cmp-src`/`data-asset` and NO `<img>` until JS hydrates (never headless). Materialize on the
    STATIC cleaned DOM in transform() — NOT onLoad (grace.com lazy JS turns a fresh `<img>` into a
    useless `blob:` there). It also REPAIRS a `blob:` img back to Scene7 and derives alt from the
    filename. grace-dm-images.js then makes it a Scene7 carrier anchor (live ref → `<picture>` at render).
  - **sectionizeFlatBody image handling**: a standalone `<img>`/`<picture>`/Scene7 carrier `<a>` is now
    a content LEAF and `splitRun` gives it its OWN section (tail-peel skips gray-band-fingerprint heads
    and image leaves) — so a diagram sits on white BELOW a preceding gray band, not merged in.
  - **Mixed `.rich-text.split-list`**: the two-column-content matcher only claims LIST-DOMINANT blocks
    (≤1 substantial `<p>`) — a mixed block (prose + list + button) flows through as body content, else
    `replaceWith` drops the prose.
  - **RUNTIME sidebar layout rules** (templates/sidebar/sidebar.css): grouped download buttons → equal
    thirds (standalone buttons keep natural width); `.cards.product` benefit grid spans cols 2-4;
    a picture-only `.section` spans cols 2-5 (wide diagrams); Latest-Insights gray band flush to footer
    (`:last-of-type { margin-bottom:0 }`); category-grid gray band re-inset to cols 3-5.
- **NEXT UP → about-grace leadership bios** (person-profile, ~30 uniform) → campaign → forms. FORMS is
  fully scoped: `tools/importer/FORMS-INVENTORY.md` (6 templates; 200 form pages; 191 = one shared
  gated modal) + `FORMS-URLS.txt` (every form URL). Submission = server-side AEM `.pardot.handler` →
  Pardot; the endpoint won't exist on EDS — GET the Pardot form-handler URLs from the client before
  building submit (FORMS-INVENTORY §D2). See playbook §5 for the full scope table + status.
- **Forms-page hero + hexagon sharpness:** contact-us form pages use a dark-blue `hero campaign
  no-image` banner with the `geoAndHexBottom` pattern (h1 + subhead in ONE cell; `template: contactus`
  + `contactus: true` metadata; relative form-JSON href). The hex/geo crispness is an ASSET-RESOLUTION
  matter, not CSS — swap in the SOURCE's high-res PNGs and downscale with ImageMagick (hex → 3000w,
  geo → 2000w/64-color) into `blocks/hero/hero-hex-mask.png` + `hero-geo-lines.png`. Full steps +
  source asset URLs in playbook "Hero (contact) + hexagon/geo background recipe".
- **Hand-editing `.plain.html`:** after any manual merge/split, verify `<div>` open/close balance AND
  run `aem.decorateSections` on the served file — an off-by-one div silently merges sections and leaks
  `Style:` metadata onto the wrong section (see playbook "DIV-BALANCE LESSON").
- Keep this prompt in sync with the playbook's "START HERE" block if the process changes.
```
