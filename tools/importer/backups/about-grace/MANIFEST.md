# about-grace — importer snapshot

- **set:** about-grace (39 pages: 1 root card landing + 2 landings [leadership-team, locations] +
  5 section pages + 2 history [our-history, asbestos-trusts] + 9 leadership bios + 20 location details).
- **bundle:** `import-grace-master.bundle.js` (frozen; the live bundle that produced this set).
- **bundle size:** 201790 bytes.
- **bundle provenance:** working tree at snapshot (parent commit `2302375` "Update importer"; importer
  source + bundle + runtime CSS all uncommitted at snapshot time — the frozen bundle here IS the record
  for importer output; runtime CSS lives in the repo working tree, see RUNTIME below).
- **URL list:** `urls.txt` (39 — from grace.com `/about-grace/` subtree).

## Shape — ONE master importer, page-type dispatch (delta over industries bundle)

Dispatch order (first match wins), all keyed on path + source DOM:
- `isInsightsArticle` → insights pipeline (unchanged).
- `isIndustriesDetailPage` → industries-detail pipeline (unchanged).
- **`isAboutGraceTextSidebar`** (NEW) — `isAboutGraceDetailPage` AND no block-producing content
  (`.cmp-card-list, .cmp-card, .media-callout, .feature-set, .featured-blog-cmp, .accordion-comp,
  table, .cmp-image`…) AND no content images → `buildSidebarPage`. Routes the text-only history
  sub-page (asbestos-trusts) so its prose isn't dropped by the flat-body sectionizer.
- **`isAboutGraceDetailPage`** (NEW) — false for bios (`/leadership-team/[^/]+/`), true for all other
  `/about-grace/.+` pages regardless of `isSidebarPage` (source navs are JS-hydrated, absent from the
  static HTML the importer fetches) → `buildDefaultPage` + `forceTemplate:'sidebar'` + canonical
  about-grace nav fallback.
- `isSidebarPage` → sidebar pipeline (unchanged).
- default → `buildDefaultPage`.

## Contains (delta over industries/products bundle)
- `isAboutGraceDetailPage()` + `isAboutGraceTextSidebar()` dispatch predicates.
- `buildSidebarNav`: canonical about-grace nav fallback (parent "About Grace" + 8 children: Awards and
  Recognition, Community, Environmental Health & Safety, Leadership Team, Locations, Our History,
  Sustainability, This is Grace) injected via `ul.replaceChildren(...)` when the about-grace URL is
  detected (canonical/og:url meta or breadcrumb hrefs) — because the source section-nav is
  JS-hydrated and empty in static HTML. Scoped to about-grace (0 leaks into industries).
- `extractMainContent`: gathers children from ALL outermost `.rich-text, .text` boxes (was only the
  first — dropped ~85% of asbestos-trusts prose).
- `buildDefaultPage`: emits `template` metadata when `forceTemplate` set even without a CU widget;
  `sectionizeFlatBody` gate = `hasCU || isIndustriesLanding || forceTemplate==='sidebar' || hasFeaturedBand`;
  breadcrumb block emitted for hero-less pages (`sourceHadBreadcrumb && !sourceHadBannerHero && !emittedHero`).
- `materializeLazyImages` + onLoad `data-eds-src` stash + bounded image-hydration wait (location photos).
- geo-hex detection: `params.sourceFeaturedHasGeoHex` (Latest Insights band on bios/landings).
- **`parsers/columns-location-detail.js`**: selector tightened to
  `section.none-bkgd .row:has(> [class*="col-lg-6"] .button):has(> [class*="col-lg-6"] .image)`;
  matcher gets an innermost-row filter (drops an outer matched row containing another) — restores the
  location photo (was lost to the outer col-lg-3/9 wrapper).
- **`parsers/columns-profile-detail.js`**: re-emit as `[text, image]` when the image is authored first
  (a lone-image first cell is treated as auto-hero by the runtime → block never decorates).
- **`parsers/_columns-utils.js` `cellNodes`**: image-only wrapper no longer double-emitted (fixed the
  duplicated leadership-bio headshot).
- **`parsers/cards-product.js`**: `rich` filter excludes `.h5` eyebrow ("PROMOTION") + `.h4.title`
  duplicate; raw-text fallback guarded by `anyStructured` (about-grace root cards now title-only).

## RUNTIME fixes (NOT in the bundle — in repo working tree, apply at render, NO reimport)
- `blocks/cards/cards.css` — `.cards.product:not(.cta):has(> ul > li:nth-child(5)) > ul` → 3-up grid
  for section landings (about-grace root 3-3-2). Homepage 4-tile row + insights `.cta` + benefit
  grids unaffected.
- `styles/styles.css` — `main > .section.hero-container:has(> .hero-wrapper > .hero.banner)` gets
  `margin-top: var(--spacing-l)` (50px gap below header for banner heroes). Full-bleed homepage
  `.hero` (no `.banner`) stays flush.
- `blocks/columns/columns.css` — profile-detail desktop layout (image col + gap); bio-page-scoped
  container `padding-inline: 20px; max-width: 1240px`; breadcrumb→header 45px; profile `margin-top: 68px`.
- `blocks/breadcrumb/breadcrumb.css` — `font-weight: 600` on `.breadcrumb nav ol`.
- `templates/sidebar/sidebar.css` — about-grace image exception (`grid-column: 3/5`); about-grace
  no-widget content span rule.

## Validation
- **Visual parity vs LIVE grace.com** (headless, matching viewport): bios, section pages, our-history,
  asbestos-trusts, locations landing + details, leadership-team landing, about-grace root all gated.
  Parity harness (`about-grace-parity.mjs`): 37 OK / 2 false-positives (locations harness-filter text
  delta; our-history print-icon counted as image).
- **Audit:** 39/39 imported, 0 tiny/empty/404.
- **Regression proof:** newsroom byte-identical to baseline; insights + industries byte-identical
  between rev7 (pre-about-grace) bundle and this bundle (residual deltas = pre-existing hydration
  nondeterminism, reproduced by BOTH bundles). Canonical nav scoped to about-grace (0 industries leaks).
- **Quality gate:** `npm run lint` exit 0, `breakpoint-check` PASS, stylelint on changed CSS exit 0.

## REMAINING before sign-off
- Full a11y sweep (`npm run test:a11y <url>`) on 3-4 representatives — not yet run.
- Optional user spot-check of awards-and-recognition.
- **PUBLISH TO DA gated on explicit client go-ahead** (playbook §0). Nothing pushed/committed.

## KNOWN NOTES
- `import-grace-master.js` defines `columns-checklist` twice (broad line ~318 / narrow line ~398);
  esbuild keeps the narrow one — the behavior all validated families were tested against. Left as-is.
- Product hubs are hand-reconstructed and must NOT be reimported (reimport degrades them).
- Import batches of ~5 (onLoad hydration wait ~60-70s/page; a large single run times out ~10 min).
