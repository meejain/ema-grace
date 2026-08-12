# Industries family — cluster + richest-representative analysis (step 1)

Per MIGRATION-PLAYBOOK §3.1–3.2: cluster by RENDERED template, then pick the richest representative
BY LOOKING. Method used (hybrid, per client precedent): scored ALL 102 industries pages for richness
(distinct block-type signatures ×3 + tables/images/embeds/cards/headings volume, scoped to the article
body between the header/footer experience-fragments), took per-tier standouts (≥ tier average) + top-3
per tier → a **45-page coverage shortlist**, then confirmed the top candidates VISUALLY in the browser.

Date: 2026-08-12. Source: live grace.com (102 pages fetched to `/tmp/ind/`), sitemap = 102 industries URLs.

## Clusters (by rendered template)

block-intelligence.json labels 3 template names for industries, BUT the rendered-DOM comparison shows
they are **ONE template ("Solution Detail") with optional sections**, not 3 structurally different
templates. The block vocabulary is consistent across depth-1 landings, depth-2/3 detail, depth-4 —
pages differ only in WHICH optional blocks they include. Depth tiers (proxy for position in tree):

| Tier | Pages | Note |
|---|---|---|
| depth-1 landings | 11 | industry roots (e.g. /coatings) — no sidebar-nav rail (top of tree), otherwise same blocks |
| depth-2 | 44 | the bulk — solution/application detail; richest pages live here |
| depth-3 | 42 | sub-solutions; same template |
| depth-4 | 4 | pharma fine-chemicals facilities/services; same template |

## RICHEST REPRESENTATIVE (drives the importer bundle)

**`https://grace.com/industries/food-beverage/beverage/`** — 13 distinct block types, the widest
single-page vocabulary; visually confirmed. Co-richest (cross-check): `nutraceutical-solutions/traditional-herbal-medicine` (13). Secondary rich: the nutraceutical-solutions
depth-2 set (nutraceutical-cdmo, cbd-/lipid-purification, 12 each) and `consultative-services/r-d` (d4).

### Section → block contract (from the beverage rep, all reuse EXISTING blocks where possible)

1. **Hero (product)** — dark photo bg + H1 + green CTA ("Start a Conversation") → `template: contactus`
   + Contact-Us floating widget (same as products detail). scene7/DAM hero bg.
2. **Sidebar-nav** — left rail: parent industry + nested sibling sub-items (e.g. "Food and Beverage" →
   Beer / Edible Oil / Food Processing / Beverage). Same `sidebar-nav` block + template as product hubs;
   likely needs the mobile `<select>` filter too. (Absent on depth-1 landings.)
3. **Rich text** — H3 section headings + paragraphs + bullet lists (Fining / Beverage fortification).
4. **Gated download buttons** — green "Download …" gated-modal buttons (`gated-asset-simplified`);
   reuse `normalizeGatedDownloads` + `.button-group` from the products pass. → Forms pass for the modal.
5. **Data table** — native 2-col features/benefits table, black header row (SYLOID XDP). Reuse table styling.
6. **Featured Products** — dark product cards (LUDOX® / SYLOID®) linking to product detail — a
   product-selector / `cards` variant (NEW-ish: "featured-product-selector"; check drafts/catalog).
7. **Cards category-grid** — "Food and beverage solutions" (image + green title + Learn more, gray band).
   Reuse the `cards category-grid` variant built for vyvid.
8. **Cards featured-content** — "Latest Insights from Grace" (4 cards + "View all articles"), often in a
   geo-hex band. Reuse the products `cards featured-content` + geo-hex section style.
9. **Contact-split banner + Social follow** (tail) — reuse existing `banner contact-split` + `social follow`.

### New / to-confirm blocks (vs existing catalog)
- **Featured Products selector** (#6) — dark product cards w/ chevron; confirm against drafts + catalog,
  may need a new `cards`/`columns` variant or `featured-product-selector` parser.
- Everything else maps to blocks ALREADY built for insights/newsroom/products (hero product, sidebar-nav,
  rich text, gated downloads, table, category-grid cards, featured-content cards, contact-split, social).

## Coverage shortlist (for post-import validation, not all need separate analysis)
45 pages (per-tier standouts + top-3/tier) saved to `/tmp/ind-shortlist.txt`. Use these to validate the
bundle covers the block variety after the representative-driven importer extension.

## Next steps (per §3)
3. EXTEND importer: add an industries page-type dispatch if needed (likely reuses the products default
   path + `sectionizeFlatBody` + `template:contactus`); add the Featured-Products selector parser/variant.
4. REBUNDLE → 5. import the beverage rep alone → §4a visual gate → 6. bulk import 102 in chunks →
   7-8. validate + prove no regression on insights/newsroom/products samples → 9. snapshot backup set.
