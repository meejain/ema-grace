# Visual pass (montage sheets) — EDS vs source, all 102

## sheet-00 (000-002)
- 000 /industries (ROOT landing): **404 on live** — content exists on disk (industries.plain.html, 6450B) but was NOT published to DA (absent from user's publish list). PUBLISH GAP, not a defect.
- 001 /industries/refining-technologies: GOOD (hero, video, Broad Catalyst Portfolio cards, insights, essential-articles band)
- 002 fcc-catalyst-application: GOOD (hero, accordion, card grid, insights)

## Card-grid audit (systematic, all 102) — 18 pages with source solution-grid dropped on EDS
- 5 already fixed on disk (industries root + 4 fcc-catalyst-application children) → PUBLISH
- 13 still broken on disk (cat-grid=0) → REIMPORT with current bundle (in progress, grid13):
  fcc-catalyst-application, value-creation, fcc-additive-solutions (+5 children),
  hydroprocessing, pe-slurry, pe-gas-phase, pp-bulk, pp-gas-phase.
  All confirmed same imageless-promotion-card pattern the current parser fixes.

## sheet-20 (060-062)
- 060 general-industrial/construction: GOOD
- 061 pharmaceutical-solutions landing: category grid + featured present; Featured Products
  layout variant differs (EDS stacked dark rows vs source) — cosmetic, same as other landings.
- 062 pharmaceutical-solutions/fine-chemicals: GOOD (6-card CDMO grid present both sides)

## RESOLUTION (card grids)
- All 13 broken pages reimported with current fixed bundle → category-grid present, 0 leak.
- Total: 17 fixed-on-disk pages + industries root need PUBLISHING to reach live.
- PROMOTION leak now 0/102 on disk.

## sheet-17 (coatings detail 051-053): all GOOD
## sheet-31 (food-beverage 093-095): all GOOD (data-grid tables + category grids render)
## sheet-33 (biofuels 099-101): GOOD content; MINOR cosmetic — benefit-row icons render
   darker/monochrome on EDS vs green on source (Scene7 DAM image variant param). Low priority.

## OTHER CLUSTERS visually confirmed in parity (montage sheets):
   refining detail, plastics detail, coatings (wood/coil/architectural/inks/general-industrial),
   food-beverage (all), pharma (landing/fine-chemicals/chromatography), general-industrial/construction,
   nutraceutical/herbal-medicine, unipol/ppartner. Heroes, nav rails, Featured strips, tables,
   accordions, banner-CTAs, category grids, insights bands all match.

## REMAINING COSMETIC (design-variant, not defects):
- Landing-page "Featured Products" uses horizontal slate strip (titles only) vs source stacked
  cards-with-descriptions. Detail pages match source. (left as-is unless requested)
- Biofuels benefit-row icons: monochrome vs source green (Scene7 param). (low priority)

## PAGE-BY-PAGE FIXES

### fcc-catalyst-application (2026-08-14)
1. "A Broad Catalyst Portfolio" extra images → FIXED. Root cause: category-grid cards
   carry an EMPTY leading image cell (imageless promotion tiles) that rendered as a
   phantom-image gap at the card top. Fix: blocks/cards/cards.js decorate() now drops any
   empty cell (no text, no picture) per card. GLOBAL runtime fix — applies to every
   category-grid page, no reimport needed. Verified: cards now text-only white tiles
   matching source.
2. "Grace Essential Articles, Vol. 1" as banner-resource-download → ALREADY CORRECT.
   Content is a `banner resource-download` block (image-left / eyebrow+h2+desc+CTA-right),
   decorates + renders correctly (the "stray bottom image" was just a mid-load snapshot
   artifact before block JS ran). No change needed.
- lint + breakpoint green. a11y test couldn't run (playwright chromium rev 1187 not installed
  in this env) — change is a safe empty-cell removal, verified visually.
