# people-and-careers — importer snapshot

- **set:** people-and-careers (7 pages: landing + early-career-programs + germany-apprenticeships +
  internships + life-at-grace + view-all-jobs + benefits/us-employee-benefits-summary).
- **bundle:** `import-grace-master.bundle.js` (frozen; 212593 bytes, 2026-08-21). Dated snapshot:
  `rev-2026-08-21/`.
- **URL list:** `urls.txt` (7 — from grace.com `/people-and-careers/` subtree).

## Chosen as next-richest set
After vendor-suppliers, block-marker sampling put people-and-careers top of the remaining sections:
germany-apprenticeships + benefits pages hit 6 block types each (accordion, card, card-list, columns,
image/table, media-callout) — above compliance (5) and campaign (1). It also re-exercises the two
importer fixes shipped for vendor-suppliers.

## Uses the vendor-suppliers-era fixed bundle (no new importer changes)
- accordion-theft fix (extractMainContent skips accordion/card-list subtrees) and
- download-card fix (cards-icon-grid absorbs `.cmp-card.small` + single-card LCA).
Verified on this set: germany-apprenticeships + benefits each emit ONE accordion block with 0 empty
answers. Their `cmp-card-list`s are empty shells in source (no real cards) → correctly nothing emitted.

## Known-open
Completeness 49–84% (heuristic counts nav/footer boilerplate + empty component shells). Real content
verified present on the rich pages. A separate follow-up (shared with vendor-suppliers) is chasing
media-callout / benefits-table drops on the thinner pages. LOCAL-ONLY — not published to DA.
