/* eslint-disable */
/* global WebImporter */

/**
 * MASTER IMPORTER — block-complete, catalog-driven, one script for the whole site.
 *
 * Replaces the page-specific importers (homepage-only / sidebar-only). One catalog
 * (component-library.json → catalog-data.js) describes EVERY block variant on grace.com,
 * so any block on any page is recognized and never silently dropped.
 *
 * Design (see MASTER-IMPORTER-STRATEGY.md):
 *  - The catalog is imported as an ES MODULE (catalog-data.js), not via globalThis or a
 *    `.json` import: the bundler (esbuild via @adobe/aem-import-helper) inlines ES imports
 *    but does NOT populate globals, and eslint rejects `.json` import extensions.
 *  - Page-type DISPATCH. grace.com content pages come in two structural shapes that need
 *    opposite handling, both already validated pixel-perfect:
 *      • sidebar pages (left section-nav + main + contact widget, e.g. /compliance/*,
 *        /locations, insight articles) → REBUILD `main` from scratch with the validated
 *        recipe (hero banner + sidebar-nav + rich-text + contact-split banner + metadata).
 *      • everything else → DECORATE `document.body` in place using catalog block discovery.
 *  - Discovery is priority-ordered (catalog is pre-sorted): specific component selectors
 *    first, generic grid/matcher blocks last. A block with a registered parser is parsed;
 *    a block WITHOUT one is left in place and logged — content is preserved, never dropped.
 *  - Form pages are flagged (deferred to the Adaptive Forms pass), never half-imported.
 */

import CATALOG from './catalog-data.js';
import DRAFT_SEEDS from './draft-seeds.js';

// PARSER IMPORTS — only parsers that exist today. Register more here as they are authored
// and visually validated; until then a catalog block with no parser is left in place.
import heroBannerParser from './parsers/hero-banner.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsIndustryParser from './parsers/cards-industry.js';
import cardsInsightParser from './parsers/cards-insight.js';
import columnsPeopleParser from './parsers/columns-people.js';
import embedVideoParser from './parsers/embed-video.js';
import tableProductComparisonParser from './parsers/table-product-comparison.js';
import tableThreeColumnParser from './parsers/table-three-column.js';
import tableLinkListParser from './parsers/table-link-list.js';
import tableDataGridParser from './parsers/table-data-grid.js';
import tableTwoColumnContentParser from './parsers/table-two-column-content.js';
import tableContactMatrixParser from './parsers/table-contact-matrix.js';
import { parseRealTables } from './parsers/_table-utils.js';
import cardsIconGridParser from './parsers/cards-icon-grid.js';
import cardsCategoryGridParser from './parsers/cards-category-grid.js';
import cardsBenefitsGridParser from './parsers/cards-benefits-grid.js';
import cardsImageTextGridParser from './parsers/cards-image-text-grid.js';
import cardsLocationGridParser from './parsers/cards-location-grid.js';
import cardsContactOptionsParser from './parsers/cards-contact-options.js';
import cardsProfileGridParser from './parsers/cards-profile-grid.js';
import cardsSolutionGridParser from './parsers/cards-solution-grid.js';
import columnsImageLeftParser from './parsers/columns-image-left.js';
import columnsImageRightParser from './parsers/columns-image-right.js';
import columnsTwoColumnTextParser from './parsers/columns-two-column-text.js';
import columnsSplitListParser from './parsers/columns-split-list.js';
import columnsHistoryItemParser from './parsers/columns-history-item.js';
import columnsProfileDetailParser from './parsers/columns-profile-detail.js';
import columnsLocationDetailParser from './parsers/columns-location-detail.js';
import columnsAppPromoParser from './parsers/columns-app-promo.js';
import columnsBrochurePromoParser from './parsers/columns-brochure-promo.js';
import columnsChecklistParser from './parsers/columns-checklist.js';
import columnsHorizontalTeaserParser from './parsers/columns-horizontal-teaser.js';
import columnsHorizontalTeaserFeaturedParser from './parsers/columns-horizontal-teaser-featured.js';
import columnsImageTeaserParser from './parsers/columns-image-teaser.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import accordionNestedParser from './parsers/accordion-nested.js';
import quoteHighlightParser from './parsers/quote-highlight.js';
import quoteTestimonialParser from './parsers/quote-testimonial.js';
import bannerResourceDownloadParser from './parsers/banner-resource-download.js';
import socialShareParser from './parsers/social-share.js';
import socialFollowParser from './parsers/social-follow.js';
import carouselParser from './parsers/carousel.js';
import mapEmbeddedParser from './parsers/map-embedded.js';
import featuredProductSelectorParser from './parsers/featured-product-selector.js';
import customWidgetContactPanelParser from './parsers/custom-widget-contact-panel.js';
import customWidgetNewsArchiveParser from './parsers/custom-widget-news-archive.js';
import bannerCtaParser from './parsers/banner-cta.js';
import quoteCtaParser from './parsers/quote-cta.js';
import videoOverlayParser from './parsers/video-overlay.js';
import bannerContactSplitParser from './parsers/banner-contact-split.js';
import cardsRelatedArticlesParser from './parsers/cards-related-articles.js';
import videoGridParser from './parsers/video-grid.js';
import cardsFeaturedContentParser from './parsers/cards-featured-content.js';

// TRANSFORMER IMPORTS — site-wide chrome cleanup (page-agnostic).
import graceCleanupTransformer from './transformers/grace-cleanup.js';
// Dynamic Media / Scene7: preserve DM image URLs as carrier anchors so they
// survive the markdown round-trip (rebuilt into <picture> client-side by
// buildDynamicMediaImages in scripts/scripts.js) instead of being DAM-ingested.
import graceDmImagesTransformer from './transformers/grace-dm-images.js';

// ---------------------------------------------------------------------------
// REGISTRIES
// ---------------------------------------------------------------------------
const parsers = {
  'hero-banner': heroBannerParser,
  'hero-full-width': heroBannerParser,
  'hero-campaign': heroBannerParser,
  'hero-event': heroBannerParser,
  'hero-product': heroBannerParser,
  'cards-product': cardsProductParser,
  'cards-industry': cardsIndustryParser,
  'cards-insight': cardsInsightParser,
  'columns-people': columnsPeopleParser,
  'cards-people': columnsPeopleParser,
  'embed-video': embedVideoParser,
  'table-product-comparison': tableProductComparisonParser,
  'table-three-column': tableThreeColumnParser,
  'table-link-list': tableLinkListParser,
  'table-data-grid': tableDataGridParser,
  'table-two-column-content': tableTwoColumnContentParser,
  'table-contact-matrix': tableContactMatrixParser,
  'cards-icon-grid': cardsIconGridParser,
  'cards-category-grid': cardsCategoryGridParser,
  'cards-benefits-grid': cardsBenefitsGridParser,
  'cards-image-text-grid': cardsImageTextGridParser,
  'cards-location-grid': cardsLocationGridParser,
  'cards-contact-options': cardsContactOptionsParser,
  'cards-profile-grid': cardsProfileGridParser,
  'cards-solution-grid': cardsSolutionGridParser,
  'columns-image-left': columnsImageLeftParser,
  'columns-image-right': columnsImageRightParser,
  'columns-two-column-text': columnsTwoColumnTextParser,
  'columns-split-list': columnsSplitListParser,
  'columns-history-item': columnsHistoryItemParser,
  'columns-profile-detail': columnsProfileDetailParser,
  'columns-location-detail': columnsLocationDetailParser,
  'columns-app-promo': columnsAppPromoParser,
  'columns-brochure-promo': columnsBrochurePromoParser,
  'columns-checklist': columnsChecklistParser,
  'columns-horizontal-teaser': columnsHorizontalTeaserParser,
  'columns-horizontal-teaser-featured': columnsHorizontalTeaserFeaturedParser,
  'columns-image-teaser': columnsImageTeaserParser,
  'accordion-faq': accordionFaqParser,
  'accordion-nested': accordionNestedParser,
  'quote-highlight': quoteHighlightParser,
  'quote-testimonial': quoteTestimonialParser,
  'banner-resource-download': bannerResourceDownloadParser,
  'social-share': socialShareParser,
  'social-follow': socialFollowParser,
  'carousel': carouselParser,
  'map-embedded': mapEmbeddedParser,
  'featured-product-selector': featuredProductSelectorParser,
  'custom-widget-contact-panel': customWidgetContactPanelParser,
  'custom-widget-news-archive': customWidgetNewsArchiveParser,
  // These 3 have real per-page content on COMMON selectors, so they PARSE (not seed) — seeding
  // literal draft text onto every .media-callout / div.quote / .media-video would be destructive.
  'banner-cta': bannerCtaParser,
  'quote-cta': quoteCtaParser,
  'video-overlay': videoOverlayParser,
  // Default-path parser for the contact-split banner (sidebar pages build it via PATH A's
  // buildContactSplitBanner; this covers non-sidebar pages carrying the same fragment).
  'banner-contact-split': bannerContactSplitParser,
  'cards-related-articles': cardsRelatedArticlesParser,
  'video-grid': videoGridParser,
  // Real parser for the "Latest Insights"/related block — REPLACES the earlier seed-from-draft
  // (which injected placeholder draft images + wrong articles). Registering here makes the
  // seed-from-draft discovery branch fall through to this parser.
  'cards-featured-content': cardsFeaturedContentParser,
};

const transformers = [graceCleanupTransformer, graceDmImagesTransformer];

/**
 * Structural test: is this `.cmp-card-list.grid.three-columns` a CATEGORY GRID (→ Cards
 * (category-grid)) rather than a product-hub nav grid (→ Cards (product))? A category grid has a
 * section `.heading` (H2 title, e.g. "Food and beverage solutions", "Purification Solutions") AND
 * its cards are simple image + `.h4.title` + "Learn more" tiles with NO descriptive body
 * (`.spt-copy` / `<ul>`). This is href-agnostic so it works for BOTH industries solution grids
 * (links → /industries/…) and product-page purification grids (vyvid → /products/…). The
 * product-DETAIL benefit grid has `.spt-copy`/`<ul>` card bodies; the product-HUB nav grid has no
 * `.heading` section title — both fail this test and stay Cards (product).
 */
function isCategoryGrid(list) {
  if (!list || !list.querySelector) return false;
  const heading = list.querySelector(':scope > .heading, :scope > .card-list-header');
  if (!heading) return false;
  // Match ANY `a.cmp-card` tile, not only `.bio` — the "promotion" grids on 5 industries
  // solution pages use imageless text tiles (`a.cmp-card.text-on-bkgd.none-image.generic`) that
  // are NOT `.bio`. Accept a SINGLE-card grid too (agriculture pages have one promotion tile).
  const cards = Array.from(list.querySelectorAll('a.cmp-card'));
  if (cards.length < 1) return false;
  // A category/promotion tile has a `.h4`/`.title` card title AND a link, with NO descriptive
  // body (`.spt-copy` / `<ul>`). Image is OPTIONAL — imageless `none-image` text tiles qualify.
  // The `.h5` "PROMOTION" eyebrow is NOT part of this test (the parser drops it). The `.spt-copy`
  // guard keeps product-DETAIL benefit grids (bullet-list bodies) out; the `> .heading`
  // requirement above keeps product-HUB nav grids (no section heading) as Cards (product).
  return cards.every((c) => (c.querySelector('.h4.title, .title, .h4'))
    && (c.matches('a[href]') || c.querySelector('a[href]'))
    && !c.querySelector('.spt-copy, .content ul, .content ol, ul, ol'));
}

// MATCHER REGISTRY — non-component blocks whose identity is position / column order /
// heading / table-column-count, not a CSS class. A matcher returns block-root elements.
// Used for coverage discovery; a matched block with no parser is left in place + logged.
const MATCHERS = {
  'columns-image-left': (doc) => rowsByColumnOrder(doc, 'image'),
  'columns-image-right': (doc) => rowsByColumnOrder(doc, 'text'),
  // two-column TEXT row (text|text, no image) → base Columns block (side-by-side ≥900px).
  'columns-two-column-text': (doc) => rowsTwoColumnText(doc),
  // split-list body LIST (source `.rich-text.split-list` renders its <ul> across 2 CSS columns,
  // e.g. unipol-pp-process "…enables your success:" benefits list). NOT the davisil standalone
  // two-column-content (that has a gated download → table-two-column-content). Claim a plain body
  // split-list whose <ul> has ≥4 items and NO gated download in its section → Columns (2 balanced
  // list cells, side-by-side). Excludes MIXED prose blocks (handled as inline body content).
  'columns-split-list': (doc) => Array.from(doc.querySelectorAll('.rich-text.split-list'))
    .filter((sl) => {
      const section = sl.closest('section, article');
      if (section && section.querySelector('.button__section, button[data-gated-id], a[href$=".pdf"]')) return false;
      const ul = sl.querySelector(':scope > ul, :scope > div > ul, ul');
      if (!ul || ul.children.length < 4) return false;
      // list-dominant: no substantial prose paragraphs besides a short lead-in (≤1 non-trivial <p>).
      const paras = Array.from(sl.querySelectorAll('p'))
        .filter((p) => (p.textContent || '').replace(/\s+/g, ' ').trim().length > 40);
      return paras.length <= 1;
    }),
  // news-archive: an .accordion-comp whose dd's hold .media-callout PDF covers (per-year issue
  // archive). Checked before the other accordions so it wins that shell.
  'custom-widget-news-archive': (doc) => Array.from(doc.querySelectorAll('.accordion-comp'))
    .filter((ac) => ac.querySelector('dd .media-callout, dd .col-lg-6 picture, dd a[href*="pdf"]')
      && !ac.closest('dd')),
  // accordion-nested: an .accordion-comp whose dd contains a nested .accordion-comp (no media-callout).
  'accordion-nested': (doc) => Array.from(doc.querySelectorAll('.accordion-comp'))
    .filter((ac) => ac.querySelector('dd .accordion-comp')
      && !ac.querySelector('dd .media-callout')
      && !ac.parentElement.closest('.accordion-comp')), // outer only
  // accordion-faq: a flat .accordion-comp (Q&A dls, no nested accordion, no media-callout).
  'accordion-faq': (doc) => Array.from(doc.querySelectorAll('.accordion-comp'))
    .filter((ac) => ac.querySelector('dl')
      && !ac.querySelector('dd .accordion-comp')
      && !ac.querySelector('.media-callout')
      && !ac.closest('dd')), // not itself a nested inner accordion
  // banner-cta: a .media-callout that is a CTA banner — has a heading AND a real CTA link, but
  // is NOT the app-promo (no multi-paragraph intro) and not inside a card grid. Kept narrow so
  // it doesn't claim every .media-callout on the site.
  'banner-cta': (doc) => {
    const callouts = Array.from(doc.querySelectorAll('.media-callout, .cmp-media-callout'))
      .filter((mc) => mc.querySelector('h2, h3, .h2, .h3')
        && mc.querySelector('.button a, a.btn-primary, .cta a')
        && !mc.closest('.card-group, .cmp-card-list')
        && mc.querySelectorAll('.text p, .rich-text p, p').length <= 2);
    // ALSO: a decorative background-image banner SECTION (source `section.none-bkgd.background-image`
    // carrying a Scene7 geo-hex bg, e.g. e-catalysts "Sample Analysis and Technical Service Portal")
    // that holds a heading + a CTA link. This is the full-width `Banner (cta)` treatment (white text
    // over the photo/graphic). NOT a hero. The parser reads the section's bg URL for the image.
    const bannerSections = Array.from(doc.querySelectorAll('section.background-image[style*="background-image"], section.none-bkgd[style*="background-image"]'))
      .filter((sec) => {
        if (sec.closest('.generic-hero, .hero__section')) return false;
        const styleAttr = sec.getAttribute('style') || '';
        if (!/background-image\s*:\s*url\(/i.test(styleAttr) || /gradient/i.test(styleAttr)) return false;
        return sec.querySelector('h1, h2, h3, h4') && sec.querySelector('.button a, a.btn-primary, .cta a, a[href]');
      });
    return [...callouts, ...bannerSections];
  },
  // quote-cta: a div.quote with a CTA link but NOT a testimonial (.quote-section) or a
  // statistic highlight (.cmp-card.statistic).
  'quote-cta': (doc) => Array.from(doc.querySelectorAll('div.quote'))
    .filter((q) => q.querySelector('a[href]')
      && !q.querySelector('.quote-section')
      && !q.closest('.cmp-card.statistic')
      && !q.querySelector('.cmp-card.statistic')),
  // cards-product: two shapes, both → Cards (product).
  //   1. HUB product-nav grid — the existing `.cmp-card-list.grid.three-columns` of anchor cards
  //      (`.card-group` container). Reproduces the prior catalog selector verbatim so the 6 hubs
  //      + 17 validated cards-product pages are unchanged; excludes the "Related Articles" /
  //      "Follow us" card-lists (handled by their own matchers).
  //   2. PRODUCT-DETAIL benefit grid — a plain `.row` holding ≥2 non-anchor `.cmp-card.bio` cards
  //      (image + `.h4` title + `.spt-copy` bullet list), NOT inside a `.cmp-card-list`. These
  //      were previously unmatched and leaked into the body as raw text/lists (TRISYL). Return the
  //      `.row` container so the parser groups all its cards into ONE block.
  'cards-product': (doc) => {
    const hubGroups = Array.from(doc.querySelectorAll('.cmp-card-list.grid.three-columns:has(a.cmp-card.bio) .card-group'))
      .filter((cg) => {
        const list = cg.closest('.cmp-card-list');
        const heading = (list && (list.querySelector('.heading, h3') || list.previousElementSibling) || {}).textContent || '';
        if (/related articles|follow us/i.test(heading)) return false;
        // CATEGORY GRID vs product-nav grid — a STRUCTURAL split (not href-based, so it holds for
        // both /industries/ solution grids AND /products/ purification grids like vyvid). A grid is
        // a `Cards (category-grid)` when it has a section `.heading` (H2 title like "Food and
        // beverage solutions" / "Purification Solutions") AND its cards are simple image+title+
        // "Learn more" tiles with NO descriptive body (no `.spt-copy`/`<ul>`). The product-hub nav
        // grid has no such section heading; the product-detail BENEFIT grid has `.spt-copy`/`<ul>`
        // bodies (handled by benefitRows below). Exclude category grids here — cards-category-grid
        // claims them.
        if (isCategoryGrid(list)) return false;
        return true;
      });
    // Benefit cards are `<a class="cmp-card bio">` WITHOUT an href (target=_self only), so match
    // `.cmp-card.bio` regardless of tag. Hub product-nav grids are excluded by the "not inside a
    // .cmp-card-list" + "no .card-group" guards (those are returned by hubGroups above).
    const benefitRows = Array.from(doc.querySelectorAll('article .row, section .row, .row'))
      .filter((row) => !row.closest('.cmp-card-list')
        && row.querySelectorAll('.cmp-card.bio').length >= 2
        && !row.querySelector('.card-group'))
      // de-dup nested rows: keep the innermost row that directly wraps the cards
      .filter((row, _i, all) => !all.some((other) => other !== row && row.contains(other)
        && other.querySelectorAll('.cmp-card.bio').length >= 2));
    return [...hubGroups, ...benefitRows];
  },
  // cards-related-articles: a .cmp-card-list.grid.three-columns whose heading says "Related
  // Articles" (distinguishes from cards-product grids and the Follow-us social card-list).
  'cards-related-articles': (doc) => Array.from(doc.querySelectorAll('.cmp-card-list.grid.three-columns, .card-list .cmp-card-list'))
    .filter((cl) => /related articles/i.test((cl.querySelector('.heading, h3') || cl.previousElementSibling || {}).textContent || '')
      && cl.querySelector('a.cmp-card.bio, a.cmp-card')),
  // social-follow: a .cmp-card-list with a "Follow us" heading + external social icon links.
  'social-follow': (doc) => Array.from(doc.querySelectorAll('.card-list .cmp-card-list, .cmp-card-list'))
    .filter((cl) => /follow us/i.test((cl.querySelector('.heading, h3') || {}).textContent || '')
      && cl.querySelector('a.cmp-card.style-icon, a.cmp-card[href^="http"]')),
  // featured-product-selector: a slate-bkgd feature-set explicitly headed "Featured Products"
  // (subhead-large / heading). The runtime block renders these as dark SELECTABLE product tiles
  // (title → reveals description + Learn More) exactly matching source. Only claim the ones with
  // the "Featured Products" label; other slate-bkgd carousels (value-creation, chemical-processing
  // dark teasers) stay on the columns-horizontal-teaser-featured path below.
  'featured-product-selector': (doc) => featureSetContainers(doc, 'slate-bkgd')
    .filter((root) => isFeaturedProductsSet(root)),
  // checklist: a .row.section-66-33 pairing a .quote with a checklist (.text h4 + ul steps).
  'columns-checklist': (doc) => Array.from(doc.querySelectorAll('.row.section-66-33'))
    .filter((r) => r.querySelector('.quote') && r.querySelector('.text ul, .rich-text ul')),
  // history-item: .row.section-66-33 with a year <h2> + image, but NOT the checklist (no quote).
  'columns-history-item': (doc) => Array.from(doc.querySelectorAll('article .row.section-66-33, .row.section-66-33'))
    .filter((r) => !r.querySelector('.quote')
      && r.querySelector('h2')
      && r.querySelector('.image, picture, img')),
  // Feature-set teaser carousels share ONE component; the item variant class distinguishes them:
  //   image-teaser = a.item.tab-img (has image); featured = a.item.slate-bkgd (dark, no image);
  //   horizontal-teaser = plain a.item (no image, not slate, not tab-img). Match the carousel
  //   CONTAINER whose items are predominantly the given variant, so each fires at most once.
  'columns-image-teaser': (doc) => featureSetContainers(doc, 'tab-img'),
  // slate-bkgd feature-sets (dark cards) → featured columns block, EXCEPT the ones headed
  // "Featured Products" (those route to featured-product-selector above — dark selectable tiles).
  'columns-horizontal-teaser-featured': (doc) => featureSetContainers(doc, 'slate-bkgd')
    .filter((root) => !isFeaturedProductsSet(root)),
  'columns-horizontal-teaser': (doc) => featureSetContainers(doc, 'plain'),
  // brochure-promo: a .row with a brochure cover + a gated DOWNLOAD (button/pdf) on one side
  // and a rich-text description with a bullet list on the other. The gated download + list
  // distinguishes it from profile/benefit grids that also pair media-callout with text.
  'columns-brochure-promo': (doc) => Array.from(doc.querySelectorAll('section > article > div.row, article > div.row, .row'))
    .filter((r) => {
      const cols = Array.from(r.children).filter((c) => /col-lg-6/.test(c.className));
      if (cols.length !== 2) return false;
      const hasDownload = r.querySelector('button[data-gated-id], a[href$=".pdf"], .button__section, a[href*="/products/"]')
        && /download/i.test(r.textContent || '');
      return hasDownload && r.querySelector('ul, ol') && r.querySelector('.image, picture, img');
    }),
  // location-detail: a .row pairing a jobs.grace.com "Join the team" CTA with an image AND a
  // postal-address signature (street + a Tel/ZIP). The address requirement stops it claiming
  // careers pages (e.g. ausbildung checklist) that merely link to jobs.grace.com.
  'columns-location-detail': (doc) => {
    const detailRows = Array.from(doc.querySelectorAll('section.none-bkgd .row, section .row'))
      .filter((r) => r.querySelector('a.btn-primary[href*="jobs.grace.com"], .button a[href*="jobs.grace.com"]')
        && r.querySelector('.image, picture, img')
        && /\b\d{4,5}\b/.test(r.textContent || '') // ZIP/postal code
        && /(street|road|rd\b|st\b|drive|avenue|ave\b|\+\d|tel[:.]?)/i.test(r.textContent || ''))
      // The location page nests the real address+photo row (two `col-lg-6` halves: text | image)
      // INSIDE the col-lg-3/col-lg-9 layout wrapper — and BOTH match the predicate above (the wrapper
      // contains the jobs link + image + address transitively). querySelectorAll returns the wrapper
      // FIRST, so buildTwoColumn would split it as [empty col-lg-3 nav | col-lg-9 everything] and the
      // PHOTO (nested in the inner col-lg-6) is lost. Drop any matched row that CONTAINS another
      // matched row — keep only the innermost two-half content rows.
      .filter((r, _i, arr) => !arr.some((other) => other !== r && r.contains(other)));
    // Locations LANDING "Worldwide Headquarters" featured card: a `.row.section-75-25` whose col-lg-9
    // stacks the HQ photo + a `<strong>` location title + "Worldwide Headquarters"/address/"Tel:"
    // (col-lg-3 empty). Not a jobs-CTA detail row and not a grid card — capture it here so it renders
    // as a Columns (location-detail) image+text card under "Locations Worldwide" like the source.
    const hqRows = Array.from(doc.querySelectorAll('.row.section-75-25')).filter((row) => {
      const wide = row.querySelector('.col-lg-9');
      if (!wide) return false;
      return !!wide.querySelector('.image, .cmp-image, picture, img')
        && Array.from(wide.querySelectorAll('strong')).some((s) => (s.textContent || '').trim())
        && /Headquarters|Tel[:.]?/i.test(wide.textContent || '');
    });
    return [...detailRows, ...hqRows];
  },
  // app-promo: a .cmp-media-callout whose text side has a heading + intro paragraph + link
  // (the download promo) — distinguishes from a bare profile/CEO media-callout headshot.
  'columns-app-promo': (doc) => Array.from(doc.querySelectorAll('div.cmp-media-callout'))
    .filter((mc) => mc.querySelector('h1, h2, h3, .subhead-small')
      && mc.querySelector('p')
      && mc.querySelector('a[href]')
      && mc.querySelector('.image, picture, img')),
  // Composed card grids: matchers return ONE container (LCA of all matching items) so the whole
  // grid → one block. Distinguishing predicates keep variants that share a column width from
  // colliding (location vs contact-options both use .col-lg-4; the .col-lg-6 grids differ by
  // heading/link/media-callout signatures).
  // solution-grid: stacked centered h2 + SHORT tagline sections (product "solutions"), no
  // image/list/link. The short body (<220 chars) distinguishes them from long article era
  // intros (e.g. our-history) that also use centered h2 + p. Needs 3+ to be a grid.
  'cards-solution-grid': (doc) => cardGridContainers(doc, '.col-lg-12 .text .rich-text, .col-lg-12 .rich-text',
    (rt) => {
      const h2 = rt.querySelector(':scope > h2');
      const p = rt.querySelector(':scope > p');
      if (!h2 || !p) return false;
      if (rt.querySelector('img, picture, ul, ol, a')) return false;
      return (p.textContent || '').trim().length < 220;
    }, 3),
  // location-grid: .col-lg-4 location cards — a city-name <strong> heading (linked to the detail
  // page for plant sites, plain text for sales offices) + an address `<p>`. Do NOT require a "Tel:"
  // line or an image: ~9 sales-office tiles (Beijing, Tokyo, Antwerp, Sohar, …) have neither, and
  // requiring them dropped those tiles entirely. Exclude contact-options (has <h4>+<ul>) and
  // section-header cards (bare h2). The parser re-selects the same cards inside the LCA container.
  'cards-location-grid': (doc) => cardGridContainers(doc, '.col-lg-4',
    (c) => !c.querySelector('h2, h4, ul')
      && Array.from(c.querySelectorAll('strong')).some((s) => (s.textContent || '').trim())
      && Array.from((c.querySelector('.text, .rich-text') || c).querySelectorAll('p'))
        .some((p) => (p.textContent || '').trim()), 3),
  // contact-options: .col-lg-4 with <h4> + <ul> of options (no phone address).
  'cards-contact-options': (doc) => cardGridContainers(doc, '.col-lg-4',
    (c) => hasImageAndText(c) && !!c.querySelector('h4') && !!c.querySelector('ul'), 2),
  // profile-grid: .col-lg-6 with a media-callout headshot + h3 name.
  'cards-profile-grid': (doc) => cardGridContainers(doc, '.col-lg-6',
    (c) => c.querySelector('.media-callout') && c.querySelector('h3'), 3),
  // benefits-grid: .col-lg-6 with image + h3 heading + paragraph, no link, no media-callout.
  'cards-benefits-grid': (doc) => cardGridContainers(doc, '.col-lg-6',
    (c) => hasImageAndText(c) && !!c.querySelector('h3') && !c.querySelector('.media-callout, a'), 3),
  // image-text-grid: .col-lg-6 with image + paragraph, NO heading, NO link, no media-callout.
  'cards-image-text-grid': (doc) => cardGridContainers(doc, '.col-lg-6',
    (c) => hasImageAndText(c) && !c.querySelector('h3, h4, a, .media-callout'), 3),
  'columns-checklist': (doc) => Array.from(doc.querySelectorAll('.row.section-66-33'))
    .filter((r) => r.querySelector('.quote') && r.querySelector('.text ul')),
  // Real authored tables share the .rich-text > table shell; disambiguate by border class
  // + column count so the variants are mutually exclusive:
  //   link-list = 1 col + .vertical-border; three-column = 3 col + .vertical-border;
  //   product-comparison = 5 col + .vertical-border; data-grid = 5 col, NO .vertical-border.
  'table-link-list': (doc) => tablesByColumns(doc, '.rich-text.vertical-border > table', 1),
  'table-three-column': (doc) => tablesByColumns(doc, '.rich-text.vertical-border > table', 3),
  'table-product-comparison': (doc) => tablesByColumns(doc, '.rich-text.vertical-border table', 5),
  'table-data-grid': (doc) => {
    // Original: 5-col full-width cookie-policy tables (no .vertical-border).
    const cookieGrids = Array.from(doc.querySelectorAll(".rich-text:not(.vertical-border) > table[width='100%']"))
      .filter((t) => { const r = t.querySelector('tr'); return r && r.children.length === 5; });
    // Industries features/benefits table: a 2-column table with a header row inside
    // .rich-text.vertical-border (e.g. beverage "SYLOID® XDP silica Features | Performance
    // benefits"). It's a genuine data table (header + list cells), NOT the davisil split-list
    // two-column-content. The 1/3/5-col vertical-border matchers don't claim 2-col tables, so
    // this is safe and mutually exclusive.
    const featureTables = Array.from(doc.querySelectorAll('.rich-text.vertical-border > table'))
      .filter((t) => {
        const r = t.querySelector('tr');
        return r && r.children.length === 2;
      });
    return [...cookieGrids, ...featureTables];
  },
  // contact-matrix: the col-lg-9 content column of a 75/25 split, but ONLY when it holds the
  // Industries / Customer Service Number header pair (avoids matching generic 75/25 columns).
  'table-contact-matrix': (doc) => {
    const col = doc.querySelector('.section-75-25 .col-lg-9');
    if (!col) return [];
    const heads = Array.from(col.querySelectorAll('h3, h4, p')).map((h) => (h.textContent || '').toLowerCase());
    const hasSig = heads.some((t) => t.includes('industries'))
      && heads.some((t) => t.includes('customer service'));
    return hasSig ? [col] : [];
  },
  // two-column-content: a .split-list <ul> that is a STANDALONE two-column feature (davisil),
  // i.e. accompanied by gated download CTAs in the same section — NOT an inline body list.
  'table-two-column-content': (doc) => Array.from(doc.querySelectorAll('.rich-text.split-list'))
    .filter((sl) => {
      const section = sl.closest('section, article');
      if (!(section && section.querySelector('.button__section, button[data-gated-id], a[href$=".pdf"]'))) return false;
      // The davisil split-list is a STANDALONE two-column <ul> (the whole block IS the list).
      // On some pages (e.g. hydrogenation-catalysts) `.rich-text.split-list` is a MIXED rich-text
      // block: several body paragraphs + a Contact button INTERLEAVED with the list. Claiming it
      // would replaceWith() the 2-col list table and DROP all those paragraphs. Only claim when the
      // block is list-DOMINANT — i.e. it has no substantial paragraph prose besides a short list
      // lead-in (≤1 non-trivial <p>). Otherwise leave it as inline body content.
      const paras = Array.from(sl.querySelectorAll(':scope > p, :scope > div > p'))
        .filter((p) => (p.textContent || '').replace(/\s+/g, ' ').trim().length > 40);
      return paras.length <= 1;
    }),
  'video-grid': (doc) => {
    const vids = Array.from(doc.querySelectorAll('.media-video'));
    return vids.length > 1 ? [vids[0].closest('section, article') || vids[0].parentElement] : [];
  },
  // video-overlay: a SINGLE standalone .media-video (2+ on a page is a video-grid). This guard
  // stops video-overlay from greedily claiming each still on a multi-video page.
  'video-overlay': (doc) => {
    const vids = Array.from(doc.querySelectorAll('.media-video'));
    return vids.length === 1 ? [vids[0]] : [];
  },
  'cards-category-grid': (doc) => {
    // Shape 1 (original): bare .cmp-card-list (no `grid`) of a.cmp-card.small — the homepage
    // "Industries" category tiles.
    const bare = Array.from(doc.querySelectorAll('.cmp-card-list'))
      .filter((cl) => !cl.classList.contains('grid') && cl.querySelector('a.cmp-card.small'))
      .map((cl) => cl.querySelector('.card-group'));
    // Shape 2 (industries + product category grids): a .cmp-card-list.grid.three-columns with a
    // section `.heading` (H2) + simple image+title+"Learn more" cards, NO descriptive body. Covers
    // both industries ("Food and beverage solutions" → /industries/…) AND product pages
    // ("Purification Solutions" on vyvid → /products/davisil…). Structural test (isCategoryGrid),
    // so it does NOT depend on the link target. Mutually exclusive with the product-hub nav grid
    // (no heading) and the benefit grid (has .spt-copy/<ul> bodies).
    const categoryGrids = Array.from(doc.querySelectorAll('.cmp-card-list.grid.three-columns:has(a.cmp-card)'))
      .filter((cl) => isCategoryGrid(cl))
      .map((cl) => cl.querySelector('.card-group'));
    return [...bare, ...categoryGrids].filter(Boolean);
  },
  // icon-grid: small icon+label+desc cards (generic cmp-card). Return ONE container (LCA) so
  // the whole set → one block. Item = a generic card with an icon image + a .h4 title, no link.
  'cards-icon-grid': (doc) => cardGridContainers(
    doc, 'a.cmp-card.generic, .cmp-card.generic',
    (c) => c.querySelector('.h4, .title, p') && (c.querySelector('.image, picture, img')), 2,
  ),
};

/**
 * Standalone 2-column feature rows (image|text or text|image), for columns-image-left/right.
 * A row qualifies only when it has EXACTLY two col-lg-6 children — one image-only, one
 * text-only — AND it is NOT part of a multi-card grid (its section holds just this one such
 * row). This keeps composed card grids (3+ image+text columns) out of the columns variants.
 */
function rowsByColumnOrder(doc, firstKind) {
  const rows = Array.from(doc.querySelectorAll('article .row, section .row'));
  return rows.filter((row) => {
    // Accept a balanced 50/50 row (two col-lg-6) OR a wide text|image split:
    //  • `.section-75-25` with col-lg-9 text + col-lg-3 image (parent hydroprocessing "ART
    //    Hydroprocessing" intro), OR
    //  • a plain `.row` with col-lg-7 text + col-lg-3 image (hydroprocessing SUB-pages —
    //    resid-hydrotreating / resid-hydrocracking / distillate-hydrotreating: body text left,
    //    ART logo right).
    // In every case, text left + ART logo right → columns-image-right. Match exactly TWO columns.
    let cols = Array.from(row.children).filter((c) => /col-lg-6/.test(c.className));
    let isWideSplit = false;
    if (cols.length === 0) {
      // A two-column wide split: one wide col (lg-9/8/7) + one narrow col (lg-3), in EITHER order.
      // Covers (a) text-left+logo-right intros (hydroprocessing) AND (b) the locations "Locations
      // Worldwide" HQ card = wide IMAGE (col-lg-9) left + narrow address TEXT (col-lg-3) right.
      const wideCols = Array.from(row.children)
        .filter((c) => /col-lg-9|col-lg-8|col-lg-7|col-lg-3/.test(c.className));
      const hasWide = wideCols.some((c) => /col-lg-9|col-lg-8|col-lg-7/.test(c.className));
      const hasNarrow = wideCols.some((c) => /col-lg-3/.test(c.className));
      if (wideCols.length === 2 && hasWide && hasNarrow) {
        cols = wideCols;
        isWideSplit = true;
      }
    }
    const is7525 = isWideSplit; // (kept name for the grid-guard skip below)
    if (cols.length !== 2) return false;
    const col0Image = !!cols[0].querySelector('.image, .cmp-image, picture, img');
    const col1Image = !!cols[1].querySelector('.image, .cmp-image, picture, img');
    const col0Text = !!cols[0].querySelector('.rich-text, .text, h1, h2, h3, p');
    const col1Text = !!cols[1].querySelector('.rich-text, .text, h1, h2, h3, p');
    // Exactly one image column and one text column (image|text pairing).
    const imageThenText = col0Image && !col0Text && col1Text;
    const textThenImage = col1Image && !col1Text && col0Text;
    if (!imageThenText && !textThenImage) return false;
    // Exclude rows that belong to a multi-item grid: count sibling 2-col rows in the section.
    // (75/25 splits are always standalone page rows, never grids — skip the grid guard for them.)
    if (!is7525) {
      const section = row.closest('section, article');
      const siblingRows = section
        ? Array.from(section.querySelectorAll('.row')).filter((r) => Array.from(r.children)
          .filter((c) => /col-lg-6/.test(c.className)).length === 2)
        : [row];
      if (siblingRows.length > 2) return false; // part of a grid, not a standalone feature row
    }
    return firstKind === 'image' ? imageThenText : textThenImage;
  });
}

/**
 * Standalone TWO-COLUMN TEXT rows (text|text) — both `.col-lg-6` children hold text (heading /
 * paragraph / list / button), NEITHER holds an image. Source lays these side-by-side (e.g.
 * pe-solution "Grace Solution Process Offerings" → Activators | Metallocenes). These are missed by
 * rowsByColumnOrder (which requires exactly ONE image column) and would otherwise flatten into a
 * single stacked run. Returns the `.row` containers. Kept narrow: exactly two col-lg-6 text
 * columns, not part of a 3+ card grid.
 */
function rowsTwoColumnText(doc) {
  const rows = Array.from(doc.querySelectorAll('article .row, section .row'));
  return rows.filter((row) => {
    const cols = Array.from(row.children).filter((c) => /col-lg-6/.test(c.className));
    if (cols.length !== 2) return false;
    const hasImg = (c) => !!c.querySelector('.image, .cmp-image, picture, img');
    // Require SUBSTANTIAL text (a heading, or a paragraph/list with real prose) in EACH column —
    // not merely a button. A row of two download buttons (e.g. trisyl) is NOT a two-column-text
    // feature; it should fall through to the normal button-group handling.
    const hasSubstantialText = (c) => {
      if (c.querySelector('h1, h2, h3, h4, h5, h6')) return true;
      return Array.from(c.querySelectorAll('p, li')).some((el) => {
        // Ignore a paragraph that is JUST a button/link (a gated download wrapped as
        // <p><strong><a>… by normalizeGatedDownloads) — that's a CTA, not prose.
        const link = el.querySelector('a');
        const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (link && (link.textContent || '').replace(/\s+/g, ' ').trim() === txt) return false;
        return txt.length > 25;
      });
    };
    // BOTH columns substantial text, NEITHER image.
    if (hasImg(cols[0]) || hasImg(cols[1])) return false;
    if (!hasSubstantialText(cols[0]) || !hasSubstantialText(cols[1])) return false;
    // Not part of a 3+ two-col grid (keep it a standalone feature pair).
    const section = row.closest('section, article');
    const siblingRows = section
      ? Array.from(section.querySelectorAll('.row')).filter((r) => Array.from(r.children)
        .filter((c) => /col-lg-6/.test(c.className)).length === 2)
      : [row];
    if (siblingRows.length > 2) return false;
    return true;
  });
}

/** True when a column item pairs an image/callout with text content — a composed card. */
function hasImageAndText(c) {
  return !!(c.querySelector('.image, .cmp-image, .media-callout, picture, img'))
    && !!c.querySelector('.text, .rich-text, .embed, p, h3, h4');
}

/** Lowest common ancestor of a set of elements (or null). */
function lowestCommonAncestor(els) {
  if (!els.length) return null;
  let lca = els[0];
  for (let i = 1; i < els.length; i += 1) {
    let a = lca;
    while (a && !a.contains(els[i])) a = a.parentElement;
    lca = a;
    if (!lca) return null;
  }
  return lca;
}

/**
 * Composed-grid discovery: collect ALL column items on the page matching `itemSel` + `accept`,
 * and return a SINGLE container — their lowest common ancestor — so the whole grid becomes ONE
 * block (grace splits big grids across many sibling <article>s; per-article grouping would
 * fragment them). Returns [] when fewer than `minItems` match. The parser re-selects the same
 * items inside that container.
 */
function cardGridContainers(doc, itemSel, accept, minItems) {
  const items = Array.from(doc.querySelectorAll(itemSel)).filter((it) => {
    try { return accept ? accept(it) : true; } catch (e) { return false; }
  });
  if (items.length < (minItems || 2)) return [];
  const lca = lowestCommonAncestor(items);
  if (!lca) return [];
  // GUARD against an over-broad LCA that would SWALLOW unrelated content. grace mixes these grids
  // INTO a rich content column (col-lg-7) alongside headings, rich-text, accordions and tables
  // (e.g. about-grace/community: 2 two-card rows scattered among 7 rich-text blocks + 4 accordions).
  // The parser does element.replaceWith(block) on the returned container, so returning that whole
  // column DESTROYS the surrounding content (5234 chars → a 4-card grid). If the LCA carries far
  // more text than the grid items themselves, it is a content column, NOT a tight grid wrapper —
  // fall back to the per-row/card-list wrappers that tightly contain the items instead.
  const itemsText = items.reduce((n, it) => n + (it.textContent || '').replace(/\s+/g, ' ').trim().length, 0);
  const lcaText = (lca.textContent || '').replace(/\s+/g, ' ').trim().length;
  const isWideCol = /\bcol-lg-(7|8|9|10|12)\b/.test(lca.className);
  if ((isWideCol || lcaText > itemsText * 1.6) && lcaText > itemsText + 400) {
    // regroup the items by their nearest dedicated grid wrapper (a `.row`, `.card-list`, or
    // `.cmp-card-list`); each such wrapper becomes its OWN container so only grid content is claimed
    // and the sibling rich-text/accordions/tables are left in place for default-content preservation.
    const wrappers = [];
    const seen = new Set();
    items.forEach((it) => {
      const w = it.closest('.row, .card-list, .cmp-card-list') || it.parentElement;
      if (w && !seen.has(w)) { seen.add(w); wrappers.push(w); }
    });
    return wrappers.length ? wrappers : [lca];
  }
  return [lca];
}

/**
 * Feature-set teaser carousels, classified by their dominant item variant so the three
 * teaser blocks are mutually exclusive:
 *   variant 'tab-img'    -> a.item.tab-img (image cards)  -> image-teaser
 *   variant 'slate-bkgd' -> a.item.slate-bkgd (dark)      -> horizontal-teaser-featured
 *   variant 'plain'      -> a.item, not tab-img/slate      -> horizontal-teaser
 * Returns the carousel containers (.feature-set / .cmp-feature-set) whose items are
 * predominantly the requested variant.
 */
/** A feature-set that renders as the interactive PRODUCT-SELECTOR (a white label tile beside a
 *  single ROW of dark selectable tiles) → routes to the featured-product-selector block.
 *  Grace distinguishes the two dark "Featured Products"-style layouts purely by the
 *  feature-set-section variant (NOT the heading text — the same "Featured Product(s)" label is
 *  used for both):
 *    • `.feature-set-section.tab`  → interactive SELECTOR, ONE row of tiles (wood "Featured
 *      Products"; nutraceutical "Products for Nutraceutical Formulators").
 *    • `.feature-set-section.list` → STACKED horizontal banners, title|desc|chevron per card
 *      (general-industrial-coatings "Featured Products"; nutraceutical "Featured Product") — these
 *      stay on the columns-horizontal-teaser-featured path, which reproduces the stacked-banner look.
 *  Key on the `.tab` section; a `.list` (or no `.tab`) feature-set is NOT a selector. */
function isFeaturedProductsSet(root) {
  if (root.querySelector('.feature-set-section.list')) return false;
  return !!root.querySelector('.feature-set-section.tab');
}

function featureSetContainers(doc, variant) {
  const carousels = Array.from(doc.querySelectorAll('.feature-set, .cmp-feature-set, .feature-set-section.list'));
  const seen = new Set();
  const out = [];
  carousels.forEach((c) => {
    const root = c.closest('.feature-set') || c;
    if (seen.has(root)) return;
    seen.add(root);
    const items = Array.from(root.querySelectorAll('a.item'));
    if (!items.length) return;
    const kindOf = (it) => {
      // slate-bkgd wins over tab-img: a dark "Featured" card can carry BOTH classes
      // (e.g. value-creation, chemical-processing — a slate card WITH a left image).
      // Those belong to the featured (dark) treatment, not the white image-teaser overlay.
      if (it.classList.contains('slate-bkgd')) return 'slate-bkgd';
      if (it.classList.contains('tab-img') || it.querySelector('.image img, picture img')) return 'tab-img';
      return 'plain';
    };
    const counts = { 'tab-img': 0, 'slate-bkgd': 0, plain: 0 };
    items.forEach((it) => { counts[kindOf(it)] += 1; });
    // Dominant variant wins the whole carousel.
    const dominant = Object.keys(counts).reduce((a, b) => (counts[b] > counts[a] ? b : a), 'plain');
    if (dominant === variant) out.push(root);
  });
  return out;
}

/** Tables inside `sel` whose first row has exactly `cols` cells. */
function tablesByColumns(doc, sel, cols) {
  return Array.from(doc.querySelectorAll(sel)).filter((t) => {
    const first = t.querySelector('tr');
    return first && first.children.length === cols;
  });
}

// ---------------------------------------------------------------------------
// FORM DETECTION — flag any page with a form; forms are deferred to the Adaptive
// Forms pass. The bulk runner appends flagged URLs to forms-register.json.
// ---------------------------------------------------------------------------
const FORM_SELECTORS = [
  'form', '.cmp-form', '.marketo-form', 'form.mktoForm', '[data-form-id]',
  '.gated-modal-form', "iframe[src*='marketo']", "iframe[src*='pardot']",
];

function detectForm(document) {
  return FORM_SELECTORS.some((sel) => {
    try { return !!document.querySelector(sel); } catch (e) { return false; }
  });
}

// ---------------------------------------------------------------------------
// PAGE-TYPE DISPATCH
// ---------------------------------------------------------------------------
/**
 * Insights ARTICLE (blog-detail) page: a 3-column row (col-lg-2 left rail with SHARE + POSTED/
 * INDUSTRY, col-lg-7 body, col-lg-3 widget). This is NOT the compliance section-nav sidebar —
 * the left col-lg-2 holds social share + post metadata, not a page nav — so it needs its own
 * extraction. Detect on the share container + POSTED/INDUSTRY <dl> signature (the col-lg-2
 * heuristic below would otherwise misroute these to the compliance recipe).
 */
function isInsightsArticle(document, url) {
  const path = (() => { try { return new URL(url || '').pathname; } catch (e) { return ''; } })();
  const looksInsights = /\/insights\/.+/.test(path) || !!document.querySelector('.blog-detail, .cmp-blog-detail');
  const hasShare = !!document.querySelector('.social-share-container');
  const hasPostMeta = Array.from(document.querySelectorAll('article dl dt'))
    .some((dt) => /posted|industry/i.test(dt.textContent || ''));
  return (looksInsights && (hasShare || hasPostMeta)) || (hasShare && hasPostMeta);
}

/** Sidebar pages: left section-navigation column beside the main content. */
function isSidebarPage(document) {
  return !!document.querySelector(
    '.section-navigation, [aria-label="Section navigation"], article .row > .col-lg-2, article .col-lg-2 a',
  );
}

/**
 * Industries DETAIL page (solution/application pages under /industries/*, depth ≥ 2): a rich
 * product-style body (Hero product + rich text + gated downloads + Featured Products + optional
 * table + category-grid + Latest Insights) PLUS a left section-navigation rail. These take the
 * SAME rich pipeline as product-detail pages (buildDefaultPage: image hero via discovery, source
 * DOM order via sectionizeFlatBody, geo-hex on the Latest-Insights band, contactus widget), with
 * the nav rail injected + `template: sidebar` for the 3-column grid.
 *
 * Deliberately distinct from isSidebarPage() (compliance, product hubs) — those keep the
 * rebuild-main buildSidebarPage recipe. Industries depth-1 LANDINGS have NO section-nav, so they
 * fall through to the plain default path (contactus 2-col). Gate on the /industries/ path so
 * other section-nav families are unaffected.
 */
function isIndustriesDetailPage(document, url) {
  const path = (() => { try { return new URL(url || '').pathname; } catch (e) { return ''; } })();
  if (!/\/industries\/.+/.test(path)) return false;
  return isSidebarPage(document);
}

/**
 * about-grace SIDEBAR page: an `/about-grace/*` page with a left section-navigation rail. Measured
 * live at 1280px, these render nav-rail (~280px) LEFT of content (~880px) — the SIDEBAR shape (nav
 * left of content), NOT the contactus 2-col layout (which has no left rail; the section-nav only
 * collapses to a mobile dropdown). Covers: this-is-grace, our-history, our-history/asbestos-trusts,
 * the locations LANDING + all 20 location detail pages, environmental-health-and-safety, community,
 * sustainability. Takes the SAME rich pipeline as industries-detail (buildDefaultPage + image hero
 * via discovery + sectionizeFlatBody + geo-hex + the nav rail injected + `template: sidebar`).
 *
 * about-grace pages WITHOUT a section-nav (leadership-team landing, the /about-grace/ root, awards-
 * and-recognition, all leadership bios) have NO left rail on live → they fall through to the plain
 * default path (centered profile/cards + geo-hex Latest-Insights, all handled by catalog discovery).
 */
/**
 * PLAIN full-width about-grace landings — NO left section-nav and NO contact widget on the source;
 * they render as a centered cards grid + Latest-Insights, exactly like the /about-grace/ root.
 * Verified against LIVE grace.com: leadership-team ("Meet the Grace Leadership Team" profile grid)
 * and awards-and-recognition have no `.section-navigation` in the static HTML and show no left rail
 * or Contact-Us widget. They must take the plain default path — NOT the sidebar/contactus layout.
 * (The section pages community/EHS/sustainability/this-is-grace/our-history + the locations landing
 * DO carry the family section-nav and stay on the sidebar path.)
 */
function isAboutGracePlainLanding(path) {
  return /\/about-grace\/(leadership-team|awards-and-recognition)\/?$/.test(path);
}

function isAboutGraceDetailPage(document, url) {
  const path = (() => { try { return new URL(url || '').pathname; } catch (e) { return ''; } })();
  if (!/\/about-grace\/.+/.test(path)) return false;
  // The leadership BIOS (/about-grace/leadership-team/<name>/, depth 3) are NOT sidebar pages —
  // they render as a centered profile-detail + Latest-Insights on the default path.
  const isBio = /\/about-grace\/leadership-team\/[^/]+\/?$/.test(path);
  if (isBio) return false;
  // The PLAIN landings (leadership-team, awards-and-recognition) render full-width on the source —
  // no left nav, no contact widget — so they also take the plain default path, not the sidebar one.
  if (isAboutGracePlainLanding(path)) return false;
  // Every remaining non-bio /about-grace/<child> page is a sidebar page. Do NOT rely solely on
  // isSidebarPage() — several section pages (community, EHS, sustainability, this-is-grace) ship
  // their `.section-navigation` ONLY via client JS, so the STATIC HTML has no nav and isSidebarPage()
  // returns false, dropping them to the wrong (full-width) layout. buildSidebarNav emits the
  // canonical about-grace family nav for these, so route them all to the sidebar path.
  return true;
}

/**
 * A TEXT-ONLY about-grace sidebar page (e.g. our-history/asbestos-trusts): a sidebar page whose
 * content column is essentially rich text — no image-columns, cards, table, or featured blocks. These
 * must take the REBUILD-MAIN buildSidebarPage recipe (clean hero → nav → content → contact-banner
 * sections), NOT buildDefaultPage's in-place flatten — the flatten can't sectionize a table-less page,
 * so the hero+content merge into one section and the nav drops to the bottom. Image/card-rich section
 * pages (this-is-grace, our-history, community…) stay on buildDefaultPage (their images/columns need it).
 */
function isAboutGraceTextSidebar(document, url) {
  if (!isAboutGraceDetailPage(document, url)) return false;
  const art = document.querySelector('article') || document.body;
  // block-producing content in the body → NOT text-only (keep it on buildDefaultPage).
  const hasBlocks = !!art.querySelector(
    '.cmp-card-list, .cmp-card, .media-callout, .cmp-media-callout, .feature-set, .featured-blog-cmp, '
    + '.accordion-comp, table, .cmp-image, [data-cmp-is="image"]',
  );
  // a standalone content image in the body also means rich (image-columns page).
  const hasContentImg = Array.from(art.querySelectorAll('img, picture'))
    .some((im) => !im.closest('header, footer, nav, .section-navigation'));
  return !hasBlocks && !hasContentImg;
}

/**
 * Build the left section-nav as a top-level EDS section (a <ul> of sibling-page links + Section
 * Metadata Style=sidebar-nav) from the source `.section-navigation`, then REMOVE every source nav
 * container from the DOM so its stray <ul>/links don't leak into default-path discovery or
 * sectionizeFlatBody. Returns the built section <div> (or null). The mobile <select> filter is
 * rebuilt at render time by templates/sidebar/sidebar.js from this authored <ul>.
 */
function extractAndRemoveSidebarNav(document) {
  const navSection = buildSidebarNav(document);
  // Strip the source nav wherever it lives so it isn't re-collected as content below.
  document.querySelectorAll(
    '.section-navigation, [aria-label="Section navigation"], article .row > .col-lg-2, article > .col-lg-2, .col-xs-12.col-lg-2',
  ).forEach((el) => {
    // only remove the left-rail nav column, not the wide content column
    if (el.matches('.col-lg-7, .col-lg-8, .col-lg-9')) return;
    el.remove();
  });
  return navSection;
}

/** A contact-us sticky/cmp element that actually carries CONTENT (a button, an inquiry link, or a
 * tagline) — NOT an empty placeholder. Some pages (e.g. hydroprocessing) ship an empty
 * `.contact-us-sticky` wrapper that renders nothing; treating its mere presence as "has widget"
 * wrongly emits `contactus: true` and reserves a right rail (shifting content left). */
function contactWidgetEl(document) {
  const els = Array.from(document.querySelectorAll('.contact-us-sticky, .contact-us__cmp, .contact-us-cmp'));
  return els.find((el) => el.querySelector('button, a[href], .contactus__text, .contact-us-title, .contact-us-subtitle')
    || (el.textContent || '').replace(/\s+/g, ' ').trim().length > 0) || null;
}

/** Contact-us sticky widget present WITH content (metadata-driven, auto-built by scripts.js). */
function hasContactWidget(document) {
  return !!contactWidgetEl(document);
}

// ---------------------------------------------------------------------------
// SHARED HELPERS
// ---------------------------------------------------------------------------
function executeTransformers(hookName, element, payload) {
  transformers.forEach((fn) => {
    try { fn.call(null, hookName, element, payload); } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function createSectionMetadata(document, styleValue) {
  return WebImporter.Blocks.createBlock(document, {
    name: 'Section Metadata',
    cells: [['Style', styleValue]],
  });
}

/**
 * Build the Metadata block directly. WebImporter.rules.createMetadata emits only
 * standard fields (Title/Description/Image) and, at transform time, the block is a
 * <table> (the `.metadata` class is added later during markdown conversion), so custom
 * page metadata (template, contactus, …) must be assembled into the block cells here.
 */
function buildMetadataBlock(document, extraPairs) {
  const cells = [];
  const title = document.querySelector('title');
  if (title) cells.push(['Title', title.textContent.replace(/[\n\t]/gm, '').trim()]);
  const desc = document.querySelector('meta[name="description"]');
  if (desc && desc.content) cells.push(['Description', desc.content.trim()]);
  extraPairs.forEach(([k, v]) => cells.push([k, v]));
  return WebImporter.Blocks.createBlock(document, { name: 'Metadata', cells });
}

// Collapse consecutive hyphens within each path segment so internal LINK hrefs match the SAVED
// file path. finalizePath() runs the target page's URL through WebImporter.FileUtils.sanitizePath,
// which collapses `--` → `-` (e.g. grace's `unipol--pp-process-technology` slug saves as
// `unipol-pp-process-technology`). rewriteInternalLinks must apply the SAME collapse or links to
// those pages 404. Only affects segments with `--` (validated sets have none), so it is safe.
function collapsePathHyphens(path) {
  return path.split('/').map((seg) => seg.replace(/-{2,}/g, '-')).join('/');
}

/** Rewrite grace.com / AEM /content/grace/us/en links to root-relative paths. */
function rewriteInternalLinks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    let href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('//')) href = `https:${href}`;
    try {
      if (/^https?:\/\//i.test(href)) {
        const u = new URL(href);
        const host = u.hostname;
        // jobs. and marketing. are separate external Grace properties (careers portal,
        // marketing/whitepaper landing pages) — NOT part of the EDS site, so keep their
        // absolute URLs instead of rewriting to a broken same-site relative path.
        const externalGraceSubdomains = ['jobs.grace.com', 'marketing.grace.com'];
        const isInternal = host === 'grace.com'
          || (host.endsWith('.grace.com') && !externalGraceSubdomains.includes(host))
          || host.includes('xmod-gracev1') || host.includes('--ema-grace--')
          || host.includes('aem.live') || host.includes('aem.page');
        // DAM assets (…/content/dam/…, e.g. gated brochure PDFs) are NOT part of the EDS site
        // tree — keep their absolute grace.com URL so they resolve to the real downloadable file
        // instead of being turned into a broken same-site relative path.
        if (isInternal && /^\/content\/dam\//.test(u.pathname)) return;
        if (isInternal) {
          let path = u.pathname.replace(/^\/content\/grace\/us\/en/, '').replace(/\.html$/, '');
          if (path.length > 1) path = path.replace(/\/$/, '');
          a.setAttribute('href', collapsePathHyphens(path) || '/');
        }
        return;
      }
      if (href.startsWith('/')) {
        // DAM assets (…/content/dam/…, e.g. corporate PDFs like the GRI/EHS-policy
        // downloads) are NOT part of the EDS site tree. A root-relative DAM path left
        // as-is is treated by the markdown round-trip as an internal doc link and gets
        // slugified — spaces→hyphens, lowercased, and the `.pdf` extension collapsed to
        // `-pdf` — so the download 404s (the "DA slug trap"). Promote it to an ABSOLUTE
        // grace.com URL so it round-trips as an external link and resolves to the real
        // file. Match the absolute-URL branch above which already early-returns for DAM.
        if (/^\/content\/dam\//.test(href.split(/[?#]/)[0])) {
          a.setAttribute('href', `https://grace.com${href}`);
          return;
        }
        let path = href.replace(/^\/content\/grace\/us\/en/, '').replace(/\.html$/, '');
        if (path.length > 1) path = path.replace(/\/$/, '');
        a.setAttribute('href', collapsePathHyphens(path) || '/');
      }
    } catch (e) { /* leave malformed hrefs */ }
  });
}

function finalizePath(params) {
  return WebImporter.FileUtils.sanitizePath(
    new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
  );
}

// ===========================================================================
// PATH A — SIDEBAR PAGES (validated rebuild-main recipe, proven pixel-perfect
// on /compliance/compliance-gdpr-de). Builds a fresh <main>:
//   [ hero banner | sidebar-nav | main rich-text | contact-split banner | metadata ]
// ===========================================================================

/** Hero as the EXISTING `hero` block, banner variant — hero.js auto-generates the
 *  breadcrumb from the URL and paints the #004990 no-image band. We emit only the H1.
 *  Used by buildSidebarPage (compliance + product hubs). Industries detail pages do NOT use
 *  this — they route through buildDefaultPage, whose discovery-based hero-banner parser keeps
 *  the photo background + CTA (Hero (product)). */
function buildHeroBlock(document) {
  const h1src = document.querySelector('article h1, .hero h1, h1');
  const title = h1src ? (h1src.textContent || '').trim() : (document.title || '').trim();
  if (!title) return null;
  const h1 = document.createElement('h1');
  h1.textContent = title;
  return WebImporter.Blocks.createBlock(document, { name: 'Hero (banner)', cells: [[h1]] });
}

/** Left section-nav as a leading section, tagged Section Metadata Style=sidebar-nav so
 *  templates/sidebar/sidebar.css pins it to col 1. The SOURCE nav is a 2-level list: a parent
 *  <li> (the section hub, e.g. "FCC Catalyst Solutions") whose href is the current section root,
 *  holding a nested <ul> of sibling-page options. We PRESERVE that hierarchy — parent <li> + a
 *  child <ul> — so the CSS can style the parent as a bold title (border top/bottom of the whole
 *  list) and indent the children (no per-item borders). Falls back to a flat <ul> when the source
 *  has no nesting (older/simple nav rails), so existing sidebar pages are unaffected. */
function buildSidebarNav(document) {
  // Is this an /about-grace/ page? Derive from the canonical/og:url meta (present pre-cleanup) or the
  // authored breadcrumb — so the canonical about-grace nav fallback below can fire even when the
  // source nav list is JS-hydrated/empty.
  const canon = (document.querySelector('link[rel="canonical"]') || {}).href
    || (document.querySelector('meta[property="og:url"]') || {}).content || '';
  const crumbHrefs = Array.from(document.querySelectorAll('.cmp-breadcrumb a, nav[aria-label*="readcrumb" i] a'))
    .map((a) => a.getAttribute('href') || '').join(' ');
  const aboutGraceUrl = /\/about-grace(\/|$|\.html)/.test(canon) || /\/about-grace\//.test(crumbHrefs);

  // Prefer the real nav LIST container (the desktop <ul>), NOT `.col-lg-2 a` — the left column also
  // holds a resource card (e.g. "Iron Tolerance") whose link would otherwise leak into the nav.
  const sourceUl = document.querySelector(
    '.section-nav-container ul, article [aria-label="Section navigation"] ~ ul, article .section-navigation ul, article .section-nav ul',
  );

  const anchorInfo = (a) => {
    const text = (a.textContent || '').replace(/\s+/g, ' ').trim();
    const href = a.getAttribute('href') || '';
    return (text && href) ? { text, href } : null;
  };
  const mkLi = (info) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.setAttribute('href', info.href);
    link.textContent = info.text;
    li.append(link);
    return li;
  };

  const ul = document.createElement('ul');

  // Structured path: source has a parent <li> with a nested <ul>.
  const parentLi = sourceUl && sourceUl.querySelector(':scope > li:has(> ul), :scope > li > ul')
    ? (sourceUl.querySelector(':scope > li > ul') ? sourceUl.querySelector(':scope > li > ul').closest('li') : null)
    : null;
  if (parentLi) {
    const pInfo = anchorInfo(parentLi.querySelector(':scope > a'));
    const nested = parentLi.querySelector(':scope > ul');
    const childInfos = Array.from(nested.querySelectorAll(':scope > li > a')).map(anchorInfo).filter(Boolean);
    if (pInfo && childInfos.length) {
      const pLi = mkLi(pInfo);
      const childUl = document.createElement('ul');
      const seenC = new Set();
      childInfos.forEach((ci) => {
        const norm = ci.href.replace(/^\/content\/grace\/us\/en/, '').replace(/\.html$/, '').replace(/\/$/, '');
        if (seenC.has(norm)) return;
        seenC.add(norm);
        childUl.append(mkLi(ci));
      });
      pLi.append(childUl);
      ul.append(pLi);
    }
  }

  // Flat fallback: no nested structure found → collect the nav-list anchors (NOT the whole column,
  // so the resource card link is excluded). Only used when the structured path produced nothing.
  if (!ul.children.length) {
    const flatAnchors = sourceUl
      ? Array.from(sourceUl.querySelectorAll('a'))
      : Array.from(document.querySelectorAll('article [aria-label="Section navigation"] a, article .section-nav a'));
    const seen = new Set();
    flatAnchors.map(anchorInfo).filter(Boolean).forEach((info) => {
      const norm = info.href.replace(/^\/content\/grace\/us\/en/, '').replace(/\.html$/, '').replace(/\/$/, '');
      if (seen.has(norm)) return;
      seen.add(norm);
      ul.append(mkLi(info));
    });
  }
  // ABOUT-GRACE canonical nav fallback. The about-grace section-nav is a FIXED family list, but on
  // several pages (community, environmental-health-and-safety, sustainability, this-is-grace) the
  // source nav <ul> is JS-hydrated — the STATIC HTML the importer sees has 0 (or a partial 3-4) of
  // the links, so the extracted rail is empty/incomplete and the sidebar layout renders with a blank
  // left column. When building an /about-grace/ page, emit the full canonical list (parent
  // "About Grace" + its 8 children, verified from the fully-hydrated source) so every section page
  // gets the identical, complete left rail like the source. Overwrites any partial extraction.
  //
  // EXCEPTION — the LOCATION DETAIL pages (/about-grace/locations/<city>/) carry their OWN richer
  // sibling-nav in static HTML: a parent "Locations" <li> with a nested <ul> of all ~23 city links
  // (NOT the 8-item About Grace family menu). The source shows THAT sub-tree, not the family menu,
  // so when the extraction already produced a parent <li> with a substantial nested child list
  // (≥5 children), keep it and SKIP the canonical overwrite.
  const extractedParent = ul.querySelector(':scope > li > ul');
  const hasRichSubTree = extractedParent
    && extractedParent.querySelectorAll(':scope > li').length >= 5;
  if (aboutGraceUrl && !hasRichSubTree) {
    const AG_NAV = [
      { text: 'Awards and Recognition', href: '/about-grace/awards-and-recognition/' },
      { text: 'Community', href: '/about-grace/community/' },
      { text: 'Environmental, Health & Safety', href: '/about-grace/environmental-health-and-safety/' },
      { text: 'Leadership Team', href: '/about-grace/leadership-team/' },
      { text: 'Locations', href: '/about-grace/locations/' },
      { text: 'Our History', href: '/about-grace/our-history/' },
      { text: 'Sustainability', href: '/about-grace/sustainability/' },
      { text: 'This is Grace', href: '/about-grace/this-is-grace/' },
    ];
    const agUl = document.createElement('ul');
    const parentLiEl = mkLi({ text: 'About Grace', href: '/about-grace/' });
    const childUl = document.createElement('ul');
    AG_NAV.forEach((ci) => childUl.append(mkLi(ci)));
    parentLiEl.append(childUl);
    agUl.append(parentLiEl);
    ul.replaceChildren(...agUl.childNodes);
  }

  if (!ul.children.length) return null;

  const section = document.createElement('div');
  section.append(ul);

  // SIDEBAR PROMO CARD (e.g. "Iron Tolerance Advancements"): the left nav column can hold a resource
  // card below the nav — an image + a heading/link (source: `.col-lg-2 .embed img` + a sibling
  // `h6 > a`). It's NOT a nav item (excluded above), so re-emit it here as a Cards (industry) image
  // card appended to the nav section, so it renders in the nav column beneath the links like source.
  const promo = buildSidebarPromoCard(document);
  if (promo) section.append(promo);

  section.append(createSectionMetadata(document, 'sidebar-nav'));
  return section;
}

/** Build a Cards (industry) image card from a left-column resource promo (image + heading link),
 *  e.g. the "Iron Tolerance Advancements Download Now" whitepaper card. Returns the block or null. */
function buildSidebarPromoCard(document) {
  // The promo lives in the left column (col-lg-2), NOT in the wide content column (col-lg-7).
  const leftCol = document.querySelector('article .col-lg-2, article .row > .col-lg-2, .col-xs-12.col-lg-2');
  if (!leftCol) return null;

  // CASE 1 — IMAGE promo (e.g. resid-conversion "Iron Tolerance Advancements"): an image + a
  // heading link (h6/h5/h4 > a) pointing OUT of the nav. Emits Cards (industry) [image][link].
  const img = leftCol.querySelector('.embed img, img');
  const headingLink = leftCol.querySelector('h6 a, h5 a, h4 a');
  if (img && headingLink) {
    const href = headingLink.getAttribute('href') || '';
    const text = (headingLink.textContent || '').replace(/\s+/g, ' ').trim();
    if (href && text) {
      const picImg = document.createElement('img');
      // DAM assets (…/content/dam/…) are NOT part of the EDS tree — a root-relative src would resolve
      // against the EDS host and 404. Anchor it to the absolute live grace.com URL.
      let picSrc = img.getAttribute('src') || '';
      if (picSrc.startsWith('/content/dam/')) picSrc = `https://grace.com${picSrc}`;
      picImg.setAttribute('src', picSrc);
      picImg.setAttribute('alt', img.getAttribute('alt') || text);
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = text;
      return WebImporter.Blocks.createBlock(document, { name: 'Cards (industry)', cells: [[[picImg], [link]]] });
    }
  }

  // CASE 2 — IMAGE-LESS "PROMOTION" tile (e.g. technical-service-expertise "Specialized Evaluation
  // Tools"): a dark-background `a.cmp-card.none-image.promotion` in the left column, with a
  // `.h5` PROMOTION eyebrow, `.h4.title` title, a `.spt-copy` description, and the card href. Emits
  // Cards (industry, promotion) — one text cell holding eyebrow + title + description + Learn-more
  // link, styled as the dark promo tile by blocks/cards/cards.css.
  const promoCard = leftCol.querySelector('a.cmp-card.promotion, a.cmp-card.none-image, a.cmp-card.text-on-bkgd');
  if (promoCard) {
    const href = promoCard.getAttribute('href') || '';
    const titleEl = promoCard.querySelector('.h4.title, .h4, .title');
    const title = titleEl ? titleEl.textContent.replace(/\s+/g, ' ').trim() : '';
    if (href && title) {
      const eyebrowEl = promoCard.querySelector('.h5');
      const bodyEl = promoCard.querySelector('.spt-copy, .subhead-small');
      const cell = [];
      if (eyebrowEl && eyebrowEl.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = eyebrowEl.textContent.replace(/\s+/g, ' ').trim();
        cell.push(p);
      }
      const h = document.createElement('h3');
      h.textContent = title;
      cell.push(h);
      if (bodyEl) {
        bodyEl.querySelectorAll('p').forEach((bp) => {
          if (bp.textContent.trim()) cell.push(bp.cloneNode(true));
        });
      }
      const p2 = document.createElement('p');
      const a2 = document.createElement('a');
      a2.setAttribute('href', href);
      a2.textContent = 'Learn more';
      p2.append(a2);
      cell.push(p2);
      // Emit the `promotion` option so cards.css renders the dark background tile; single text cell
      // (no image) — the imageless promo shape.
      return WebImporter.Blocks.createBlock(document, { name: 'Cards (industry, promotion)', cells: [[cell]] });
    }
  }

  return null;
}

/** Materialize AEM lazy image components as real <img> so they survive extraction and get rewritten
 *  by the DM/Scene7 transformer into carrier anchors. Grace's `.image` components ship as
 *  `<div data-cmp-is="image" data-cmp-src="scene7…?wid={.width}" data-asset="/content/dam/…">` with
 *  NO plain <img> until client JS hydrates (which doesn't happen in the headless importer) — so body
 *  diagrams like the hydrogenation-catalysts RANEY flowchart vanished. Prefer the Scene7 `data-cmp-src`
 *  (kept as a LIVE reference by grace-dm-images.js), fall back to the DAM `data-asset` absolutized to
 *  grace.com. Idempotent: skips components that already contain an <img>/<picture>. */
function materializeLazyImages(document) {
  document.querySelectorAll('[data-cmp-is="image"], [data-cmp-src], [data-eds-src]').forEach((el) => {
    // pick the component root (the element carrying the cmp attrs).
    const root = el.hasAttribute('data-cmp-src') || el.hasAttribute('data-eds-src')
      ? el : (el.querySelector('[data-cmp-src], [data-eds-src]') || el);
    if (root.closest('picture')) return;
    // Prefer the onLoad-stashed hydrated URL (data-eds-src): some components (about-grace LOCATION
    // photos) only expose their Scene7 src via client JS, captured into data-eds-src during onLoad.
    if (root.hasAttribute('data-eds-src') && !root.querySelector('img')) {
      const edsSrc = root.getAttribute('data-eds-src');
      const img = document.createElement('img');
      img.setAttribute('src', edsSrc);
      const edsAlt = (root.getAttribute('data-eds-alt') || '').trim();
      if (edsAlt) {
        img.setAttribute('alt', edsAlt);
      } else {
        let base = '';
        try { base = new URL(edsSrc).pathname.split('/').pop().replace(/\.[a-z0-9]+$/i, ''); } catch (e) { base = ''; }
        img.setAttribute('alt', base.replace(/[-_]+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase()));
      }
      (root.querySelector('.cmp-image') || root).appendChild(img);
      return;
    }
    // resolve the real Scene7/DAM src from the component attrs.
    let src = root.getAttribute('data-cmp-src') || root.getAttribute('data-eds-src') || '';
    // strip AEM responsive width template tokens so the URL resolves to a real asset.
    src = src.replace(/([?&])wid=(%7B|\{)[^&]*(%7D|\})/i, '$1').replace(/\{\.width\}/g, '')
      .replace(/[?&]$/, '');
    if (!src) {
      const asset = root.getAttribute('data-asset') || '';
      if (asset.startsWith('/content/dam/')) src = `https://grace.com${asset}`;
    }
    if (!src) return;
    // If grace.com's lazy-load JS already hydrated this component into an <img> — often with a
    // useless runtime `blob:` src (or a low-res placeholder) — REPAIR that <img>'s src to the real
    // Scene7 URL instead of adding a duplicate. Otherwise create a fresh <img>.
    const existing = root.querySelector('img');
    if (existing) {
      const cur = existing.getAttribute('src') || '';
      if (/^blob:/i.test(cur) || (!/\/is\/image\//.test(cur) && !cur.startsWith('https://grace.com/content/dam/'))) {
        existing.setAttribute('src', src);
        existing.removeAttribute('srcset');
      }
      if (!(existing.getAttribute('alt') || '').trim()) {
        const asset2 = root.getAttribute('data-asset') || '';
        let base2 = asset2 ? asset2.split('/').pop().replace(/\.[a-z0-9]+$/i, '') : '';
        if (!base2) { try { base2 = new URL(src).pathname.split('/').pop(); } catch (e) { base2 = ''; } }
        const a2 = base2.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
        if (a2) existing.setAttribute('alt', a2);
      }
      return;
    }
    const img = document.createElement('img');
    img.setAttribute('src', src);
    let alt = (root.getAttribute('alt') || root.getAttribute('data-cmp-alt')
      || root.getAttribute('aria-label') || '').replace(/<[^>]*>/g, '').trim();
    // No authored alt on these AEM image components. Derive a readable alt from the asset/Scene7
    // filename (e.g. `chart-raney-hydrogenation-catalysts` → "Chart Raney Hydrogenation Catalysts")
    // so the DM carrier doesn't fall back to the "Image without alt text" sentinel and the published
    // image has meaningful, accessible alt text.
    if (!alt) {
      const asset = root.getAttribute('data-asset') || '';
      let base = '';
      if (asset) {
        base = asset.split('/').pop().replace(/\.[a-z0-9]+$/i, '');
      } else {
        try { base = new URL(src).pathname.split('/').pop(); } catch (e) { base = ''; }
      }
      alt = base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    img.setAttribute('alt', alt);
    (root.querySelector('.cmp-image') || root).appendChild(img);
  });
}

/** Extract the main content column (.col-lg-7 rich text) as clean default content;
 *  drop empty component shells. Returns an array of content nodes or []. */
function extractMainContent(document) {
  const mainCol = document.querySelector('article .col-lg-7')
    || (document.querySelector('article h2') && document.querySelector('article h2').closest('[class*="col-"]'));
  if (!mainCol) return [];
  // The content column can hold MULTIPLE `.text`/`.rich-text` blocks (e.g. asbestos-trusts splits its
  // article into 2 rich-text boxes: the intro + the "Background/Bankruptcy/…" sections). Grabbing only
  // the FIRST `.rich-text` dropped ~85% of the copy. Gather children from EVERY outermost text box in
  // document order; fall back to the column itself when it has no text boxes.
  const keep = (el) => {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return false;
    return (el.textContent || '').trim().length > 0 || el.querySelector('img, picture');
  };
  const boxes = Array.from(mainCol.querySelectorAll('.rich-text, .text'))
    // outermost only (a .text wrapping a .rich-text would double-count)
    .filter((tb, _i, arr) => !arr.some((o) => o !== tb && o.contains(tb)));
  if (boxes.length) {
    return boxes.flatMap((box) => Array.from(box.children).filter(keep));
  }
  return Array.from(mainCol.children).filter(keep);
}

/** "Want to talk to an expert?" contact-split banner above the footer (source
 *  .contact-us-cmp). Emits the EDS Banner (contact-split) block. Returns block or null. */
function buildContactSplitBanner(document) {
  const cmp = document.querySelector('.contact-us-cmp');
  if (!cmp) return null;

  const titleEl = cmp.querySelector('.contact-us-title, h2');
  const title = titleEl ? (titleEl.textContent || '').replace(/\s+/g, ' ').trim() : 'Want to talk to an expert?';

  const cols = Array.from(cmp.querySelectorAll('.row.has-title > [class*="col-lg-6"], .row.has-title > [class*="col-"]'));
  const halfCells = cols.map((col) => {
    const cell = [];
    const h3 = col.querySelector('h3');
    if (h3) {
      const h = document.createElement('h3');
      h.textContent = (h3.textContent || '').trim();
      cell.push(h);
    }
    const cta = col.querySelector('.button__section a, a.btn-primary, a[href]');
    if (cta) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cta.getAttribute('href') || '#';
      a.textContent = (cta.textContent || '').replace(/\s+/g, ' ').trim();
      p.append(a);
      cell.push(p);
    }
    const introP = Array.from(col.querySelectorAll('.rich-text p')).find((p) => (p.textContent || '').trim());
    if (introP) {
      const p = document.createElement('p');
      p.innerHTML = introP.innerHTML;
      cell.push(p);
    }
    const list = col.querySelector('ul, ol');
    if (list) cell.push(list.cloneNode(true));
    return cell;
  }).filter((c) => c.length);

  if (!halfCells.length) return null;
  return WebImporter.Blocks.createBlock(document, { name: 'Banner (contact-split)', cells: [[title], halfCells] });
}

/**
 * Build an insights ARTICLE (blog-detail) page. Source layout (verified live):
 *   article > .row [ col-lg-2 SHARE + POSTED/INDUSTRY | col-lg-7 body | col-lg-3 widget ].
 * There is NO blue hero band — the H1 is plain serif text at the top of the content column and
 * the microscope image is the article's LEAD image (a .media-callout inside the body, not a
 * hero). The body col-lg-7 holds, in order:
 *   .text(H1) · .media-callout(lead image) · .text(the article: paragraphs + headings) ·
 *   .section(Featured Service card) · .divider · .text(References) · trailing empty shells +
 *   a .card-list (related articles — handled by discovery).
 * Left rail (col-lg-2) = SHARE social links + POSTED/INDUSTRY metadata, tagged sidebar-nav so
 * the template pins it to the left column (matching the source).
 */
function buildInsightsArticle(document, url, params) {
  const main = document.createElement('main');

  // Detect the decorative geoAndHex background on the related-articles section BEFORE any DOM is
  // detached. On the source, the related-cards (.featured-blog-cmp) sit inside a full-bleed
  // `section.light-gray-bkgd.geoAndHex` on SOME articles (e.g. a-brewery-goes-green) but a plain
  // `section` on others (e.g. 5-things-to-consider-when-selecting-a-chromatography-silica). Only
  // when that class is present do we tag the emitted cards section so the CSS paints the gray
  // hexagon band — otherwise the cards render on plain white, matching the source per-page.
  const featuredBlog = document.querySelector('.featured-blog-cmp, .feature-blog, [class*="featured-blog"]');
  const relatedHasGeoHex = !!(featuredBlog && featuredBlog.closest('.geoAndHex, .light-gray-bkgd'));
  // Capture the related-articles section heading ("Latest Insights from Grace") NOW, before the
  // block is parsed/detached. The heading lives in `.header .title h2` inside the featured-blog
  // region; the invalid `<p><h2>` wrapper can hoist the <h2> out of `.title` during parsing, so
  // fall back to any descendant h2 mentioning "insight", then to the site-wide default string.
  let relatedTitle = '';
  if (featuredBlog) {
    const scope = featuredBlog.closest('.feature-blog') || featuredBlog;
    const titleEl = scope.querySelector('.header .title h2, .header h2, .featured-blog-header h2')
      || Array.from(scope.querySelectorAll('h2')).find((h) => /insight/i.test(h.textContent || ''));
    relatedTitle = (titleEl && (titleEl.textContent || '').replace(/\s+/g, ' ').trim())
      || 'Latest Insights from Grace';
  }

  // ---- Left rail: Social (share) block + POSTED/INDUSTRY (dl), tagged sidebar-nav ----
  // NOTE: the breadcrumb is NOT authored/emitted. It is auto-blocked at render
  // time (scripts.js buildBreadcrumbBlock) from the URL path, which also
  // re-creates the `.breadcrumb-container` section hook the sidebar CSS uses.
  // Keeping it out of the content keeps the authoring surface clean.
  const railInner = document.createElement('div');
  let railHasContent = false;

  const share = document.querySelector('.social-share-container');
  if (share) {
    // Emit the `Social (share)` block: a single cell listing the networks (incl. Print, matching
    // the source's 5 icons). The block JS renders the circular share buttons for the page.
    const networks = Array.from(share.querySelectorAll('a[href], a'))
      .map((a) => (a.getAttribute('aria-label') || a.textContent || '').replace(/share via/i, '').trim())
      .filter(Boolean);
    // Ensure Print is present (source's 5th icon; its link often has empty text/aria).
    if (!networks.some((n) => /print/i.test(n))) networks.push('Print');
    const list = networks.length ? networks.join(', ') : 'Facebook, X, LinkedIn, Email, Print';
    const shareBlock = WebImporter.Blocks.createBlock(document, { name: 'Social (share)', cells: [[list]] });
    railInner.append(shareBlock);
    railHasContent = true;
  }

  // POSTED / INDUSTRY are PAGE METADATA, not content — extract them here and emit
  // them as `published` / `industry` rows in the page Metadata block (below). They
  // are NOT authored as a Post Meta block anymore; the rail's POSTED/INDUSTRY panel
  // is rebuilt at render time from these meta values (scripts.js buildPostMetaBlock),
  // matching the source visually while keeping all page data in one Metadata table.
  let publishedMeta = '';
  let industryMeta = '';
  const dl = document.querySelector('article dl');
  if (dl) {
    Array.from(dl.querySelectorAll('dt')).forEach((dt) => {
      const dd = dt.nextElementSibling && dt.nextElementSibling.tagName === 'DD' ? dt.nextElementSibling : null;
      const label = (dt.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const val = dd ? (dd.textContent || '').replace(/\s+/g, ' ').trim() : '';
      if (!val) return;
      if (/post|publish|date/.test(label)) publishedMeta = val;
      else if (/industr/.test(label)) industryMeta = val;
    });
  }

  if (railHasContent) {
    railInner.append(createSectionMetadata(document, 'sidebar-nav'));
    main.append(railInner);
    main.append(document.createElement('hr'));
  }

  // ---- Body: parse in-body BLOCKS first, then collect the rest as default content ----
  const h1el = document.querySelector('article h1');
  const bodyCol = (h1el && h1el.closest('[class*="col-lg-7"]'))
    || document.querySelector('article .col-lg-7');

  const bodyBlocks = []; // { after: <node cloned into contentNodes to anchor order>, block }
  const contentNodes = [];
  if (bodyCol) {
    Array.from(bodyCol.children).forEach((el) => {
      if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return;
      if (el.matches('.divider')) return;
      // A bare `.card-list` direct child: skip ONLY if it's NOT a "Related Articles" grid.
      // The sibling "Latest Insights" region is handled by discovery, but an IN-BODY
      // "Related Articles" card-list (6 pages) is inside col-lg-7 where discovery never runs —
      // so let it fall through to the Related Articles branch below (which parses it).
      if (el.matches('.card-list') && !/related articles/i.test(el.textContent || '')) return;

      // In-body VIDEO (source .media-video: a poster still + play button; the real video URL
      // lives in a sibling `.media-modal .active-video[data-video-type] <video src>`). A bare
      // clone would flatten it to just the poster image + "Watch the video" text, losing the
      // video. Emit a `Video (overlay)` block instead: poster picture + the video URL link
      // (the block JS swaps the poster for an autoplaying embed on click).
      const mediaVideo = el.matches('.media-video') ? el : el.querySelector('.media-video');
      if (mediaVideo) {
        // Poster image (Scene7 still).
        const posterImg = mediaVideo.querySelector('.img img, .media-image img, picture, img');
        // Video URL: prefer the .media-modal video/iframe src in the same .cmp-media-callout.
        const callout = mediaVideo.closest('.cmp-media-callout, .media-callout') || el;
        const src = (() => {
          const v = callout.querySelector('.media-modal video[src], .media-modal iframe[src], video[src], iframe[src]');
          let raw = v ? (v.getAttribute('src') || '') : '';
          if (!raw) return '';
          if (raw.startsWith('//')) raw = `https:${raw}`;
          // Normalize a YouTube embed/nocookie URL to the watch?v= form the overlay
          // block's embedYoutube() understands; strip player query params.
          const ytId = raw.match(/(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([\w-]{6,})/);
          if (ytId) return `https://www.youtube.com/watch?v=${ytId[1]}`;
          const vimeo = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/);
          if (vimeo) return `https://vimeo.com/${vimeo[1]}`;
          // HTML5/DAM mp4: anchor a /content/dam/… path to the absolute live URL.
          if (raw.startsWith('/content/dam/')) return `https://grace.com${raw}`;
          return raw;
        })();
        if (posterImg && src) {
          const posterCell = [posterImg.cloneNode(true)];
          const a = document.createElement('a');
          a.href = src;
          a.textContent = src;
          const block = WebImporter.Blocks.createBlock(document, { name: 'Video (overlay)', cells: [[posterCell, [a]]] });
          contentNodes.push(block);
          return;
        }
        // No resolvable URL (e.g. JS-only player) → fall through so the poster is at least kept.
      }

      // In-body "Featured Service" promo: a .feature-set-section with an a.item.slate-bkgd card.
      // Parse it as the columns-horizontal-teaser-featured block (dark card) rather than flatten.
      // NOTE: multi-card feature-set carousels (e.g. a "Learn More About:" product grid) live in
      // a col-lg-8 sibling, NOT this col-lg-7 body, and are correctly claimed by the discovery
      // phase's columns-image-teaser matcher (which renders ALL cards) — so no multi-card handling
      // is needed here.
      const featureSet = el.matches('.feature-set-section, .feature-set, .cmp-feature-set')
        ? el : el.querySelector('.feature-set-section, .feature-set, .cmp-feature-set');
      if (featureSet && featureSet.querySelector('a.item')) {
        // (1) Green "Download the whitepaper" gated CTA sits just before the feature card (a
        // .btn-primary link inside/adjacent to the feature-set). Emit it as a Button
        // (primary-green) block ABOVE the featured block, matching the source order.
        const dlLink = (el.querySelector('a.btn-primary, .button__section a, a[target="_blank"][href*="marketing.grace"]')
          || featureSet.querySelector('a.btn-primary, .cta a, a[target="_blank"]'));
        if (dlLink && !dlLink.closest('a.item')) {
          // A lone link in its own <p> is auto-decorated by EDS into a button. Wrap in <strong>
          // so decorateButtons() gives it the PRIMARY (filled) style; the insights CSS paints
          // that primary button Grace-green to match the source "Download the whitepaper" CTA.
          const p = document.createElement('p');
          const strong = document.createElement('strong');
          const a = document.createElement('a');
          a.href = dlLink.getAttribute('href') || '#';
          if (dlLink.getAttribute('target')) a.setAttribute('target', dlLink.getAttribute('target'));
          a.textContent = (dlLink.textContent || 'Download').replace(/\s+/g, ' ').trim();
          strong.append(a);
          p.append(strong);
          p.className = 'insights-download-cta';
          contentNodes.push(p);
        }
        // (2) "Featured Service" label. Source is a <p class="subhead-large"> (a styled
        // label, NOT a heading), so emit a plain <p> to match its semantics. The insights
        // CSS styles the <p> that immediately precedes the featured columns block as the
        // subhead-large label (markdown strips the class, so target it structurally).
        const labelEl = featureSet.querySelector('.subhead-large, .header .title, .heading');
        const label = labelEl ? (labelEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
        if (label) { const p = document.createElement('p'); p.textContent = label; contentNodes.push(p); }
        // (3) The featured dark card itself.
        const before = new Set(document.querySelectorAll('table'));
        try { columnsHorizontalTeaserFeaturedParser(featureSet, { document, url, params }); } catch (e) { /* leave */ }
        const created = Array.from(document.querySelectorAll('table')).find((t) => !before.has(t) && !t.closest('td'));
        if (created) { contentNodes.push(created); return; }
      }

      // Statistic highlight card (source .cmp-card.statistic — the big "61%" number + caption on
      // a gray tile). The markdown round-trip would flatten it to loose "PROMOTION / 61% / …"
      // paragraphs, so parse it into the Quote (highlight) block instead (its JS/CSS render the
      // large number + caption). Emit the created block table in place.
      const statCard = el.matches('.cmp-card.statistic') ? el : el.querySelector('.cmp-card.statistic');
      if (statCard) {
        const before = new Set(document.querySelectorAll('table'));
        try { quoteHighlightParser(statCard, { document, url, params }); } catch (e) { /* leave */ }
        const created = Array.from(document.querySelectorAll('table')).find((t) => !before.has(t) && !t.closest('td'));
        if (created) { contentNodes.push(created); return; }
      }

      // Pull-quote / testimonial (source div.quote.quote-section — quote text + author +
      // position, e.g. the Ken Bryden FCC quote). Parse into the Quote (testimonial) block so the
      // citation survives; a raw clone would flatten it to plain paragraphs.
      const quoteEl = el.matches('.quote') ? el : el.querySelector('.quote-section, div.quote');
      if (quoteEl && (quoteEl.querySelector('.quote-text, .citation') || /quote-section/.test(quoteEl.className || ''))) {
        const before = new Set(document.querySelectorAll('table'));
        try { quoteTestimonialParser(quoteEl, { document, url, params }); } catch (e) { /* leave */ }
        const created = Array.from(document.querySelectorAll('table')).find((t) => !before.has(t) && !t.closest('td'));
        if (created) { contentNodes.push(created); return; }
      }

      // Bare pull-quote: a rich-text `<blockquote>` (no .quote-section wrapper), optionally
      // followed by an author `<p>` shaped "- Name<br>Title<br>…" (e.g. giving-grace). The
      // markdown round-trip keeps the <blockquote> but renders it as a plain unstyled quote;
      // emit a Quote (testimonial) block so it gets the styled treatment (quote + author +
      // position rows) matching the source pull-quote.
      const bq = el.matches('blockquote') ? el : el.querySelector(':scope > blockquote, blockquote');
      if (bq && (bq.textContent || '').trim()) {
        const quoteText = (bq.textContent || '').replace(/\s+/g, ' ').trim();
        const cells = [[quoteText]];
        // Author block: the <p> immediately after the blockquote, lines split on <br>,
        // leading "- " stripped from the name. First line → author, second → position.
        const authorP = (bq.nextElementSibling && bq.nextElementSibling.tagName === 'P')
          ? bq.nextElementSibling
          : (el.matches('blockquote') ? null : el.querySelector('blockquote + p'));
        if (authorP) {
          const lines = (authorP.innerHTML || '').split(/<br\s*\/?>/i)
            .map((s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
            .filter(Boolean);
          if (lines[0]) cells.push([lines[0].replace(/^[-–—]\s*/, '')]);
          if (lines.length > 1) cells.push([lines.slice(1).join(', ')]);
          if (authorP.parentNode) authorP.remove();
        }
        const block = WebImporter.Blocks.createBlock(document, { name: 'Quote (testimonial)', cells });
        contentNodes.push(block);
        return;
      }

      // .media-callout mid-content image(s): keep the image AND its caption. The source renders
      // these as sizeable figures with an italic caption below (e.g. "Catalyst Evaluation 1964");
      // a bare <p><img> lost the caption and shrank the image.
      //
      // TWO layouts, matching the source:
      //   • A single callout → emit the figure inline as <p><img></p> + italic caption
      //     <p><em>…</em></p> (the insights CSS styles that caption paragraph).
      //   • MULTIPLE callouts grouped in one row (the source pairs two figures in a
      //     `.row` of two `.col-lg-6`, e.g. 80-years-of-fcc) → emit a `Columns (media-figures)`
      //     block so they render SIDE BY SIDE on desktop and stack on mobile — the markdown
      //     round-trip drops the source's Bootstrap columns, so we rebuild them as a real block.
      if (el.matches('.media-callout') || el.querySelector('.media-callout')) {
        const callouts = el.matches('.media-callout') ? [el] : Array.from(el.querySelectorAll('.media-callout'));
        const list = callouts.length ? callouts : [el];
        // Build [imgClone, captionParagraph|null] for each callout, dropping ones with no image.
        const figures = list.map((mc) => {
          const img = mc.querySelector('.media-image img, .img img, picture, img');
          if (!img) return null;
          const capEl = mc.querySelector('.caption, .media-caption');
          const capText = capEl ? (capEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
          let cap = null;
          if (capText) {
            cap = document.createElement('p');
            const em = document.createElement('em');
            em.textContent = capText;
            cap.append(em);
            cap.className = 'media-caption';
          }
          return { img: img.cloneNode(true), cap };
        }).filter(Boolean);
        if (!figures.length) return;

        if (figures.length >= 2) {
          // Side-by-side: one Columns (media-figures) row, one cell per figure.
          // Each cell keeps the image AND its italic caption (e.g. "Catalyst
          // Evaluation 1964" / "Grace's Technical Service Team, 1961"), matching
          // the source's captioned paired figures.
          const cells = [figures.map((f) => {
            const p = document.createElement('p');
            p.append(f.img);
            return f.cap ? [p, f.cap] : [p];
          })];
          const block = WebImporter.Blocks.createBlock(document, { name: 'Columns (media-figures)', cells });
          contentNodes.push(block);
          return;
        }

        // Single figure: inline image + caption paragraphs.
        figures.forEach((f) => {
          const p = document.createElement('p');
          p.append(f.img);
          contentNodes.push(p);
          if (f.cap) contentNodes.push(f.cap);
        });
        return;
      }

      // Data TABLE in the body (e.g. syloid-mx110 "Applications and features": a 3-col
      // Application | End-Use Industries | Features table in .rich-text.vertical-border).
      // A raw clone passes the <table> to markdown, whose round-trip turns the first header
      // cell ("Application") into a BLOCK NAME → <div class="application"> → EDS 404s trying
      // to load blocks/application/. Parse it into a proper Table block instead (variant by
      // column count), so it emits `Table (three-column)` etc. and renders as a real table.
      const bodyTable = el.matches('table') ? el : el.querySelector(':scope table, :scope > .rich-text table');
      if (bodyTable && bodyTable.querySelector('tr')) {
        const firstRow = bodyTable.querySelector('tr');
        const cols = firstRow ? firstRow.querySelectorAll('td, th').length : 0;
        const variant = cols >= 3 ? 'three-column' : (cols === 2 ? 'two-column-content' : 'data-grid');
        const clone = el.cloneNode(true);
        const before = new Set(document.querySelectorAll('table'));
        try {
          parseRealTables(clone, document, `Table (${variant})`);
          // The created block table is now inside `clone`; find it and push.
          const created = Array.from(clone.querySelectorAll('table')).find((t) => !before.has(t) && !t.closest('td'));
          if (created) { contentNodes.push(created); return; }
        } catch (e) { /* fall through to raw clone */ }
      }

      // In-body "Related Articles" card grid (source `.cmp-card-list` whose heading is
      // "Related Articles" — a CURATED 3-card grid of a.cmp-card.bio, distinct from the
      // JS-hydrated "Latest Insights" carousel and the "Featured Products" promo). It lives in
      // the col-lg-7 body, so discovery never sees it and a raw clone drops it entirely (the
      // "Related Articles" section was missing on migrated pages). Emit a heading + a proper
      // `Cards (related-articles)` block. MUST run BEFORE the generic a.cmp-card.bio product
      // branch below, since a Related-Articles list also contains a.cmp-card.bio cards.
      const relCardList = el.matches('.cmp-card-list, .card-list') ? el : el.querySelector('.cmp-card-list, .card-list');
      const relHeading = relCardList && (relCardList.querySelector('.heading, h2, h3') || {}).textContent;
      if (relCardList && relHeading && /related articles/i.test(relHeading) && relCardList.querySelector('a.cmp-card')) {
        const h2 = document.createElement('h2');
        h2.textContent = relHeading.replace(/\s+/g, ' ').trim();
        contentNodes.push(h2);
        const before = new Set(document.querySelectorAll('table'));
        try { cardsRelatedArticlesParser(relCardList, { document, url, params }); } catch (e) { /* leave */ }
        const created = Array.from(document.querySelectorAll('table')).find((t) => !before.has(t) && !t.closest('td'));
        if (created) { contentNodes.push(created); return; }
      }

      // In-body PRODUCT-CARD grid (source `a.cmp-card.bio` — a "Featured Products" promo of 1+
      // cards with a PROMOTION eyebrow + title + CTA, e.g. vitafoods-europe-2022). These live in
      // the col-lg-7 body, so discovery (which only runs on the related region) never sees them;
      // a raw clone flattens them to loose "PROMOTION / title / Learn more" paragraphs. Run the
      // cards-product parser so they emit a proper `Cards (product)` block (eyebrow dropped).
      if (el.querySelector('a.cmp-card.bio')) {
        const before = new Set(document.querySelectorAll('table'));
        try { cardsProductParser(el, { document, url, params }); } catch (e) { /* leave */ }
        const created = Array.from(document.querySelectorAll('table')).find((t) => !before.has(t) && !t.closest('td'));
        if (created) { contentNodes.push(created); return; }
      }

      const hasContent = (el.textContent || '').trim().length > 0 || el.querySelector('img, picture');
      if (hasContent) contentNodes.push(el.cloneNode(true));
    });
  }
  void bodyBlocks;
  if (contentNodes.length) {
    const section = document.createElement('div');
    contentNodes.forEach((n) => section.append(n));
    // Clean the source's inert link scaffolding + now-empty wrapper paragraphs.
    section.querySelectorAll('a').forEach((a) => {
      const href = (a.getAttribute('href') || '').trim();
      if ((!href || href === '#') && !a.textContent.trim() && !a.querySelector('img, picture')) a.remove();
    });
    section.querySelectorAll('p').forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector('img, picture, a[href], br, table')) p.remove();
    });
    // D3-import: promote the article's gated/download CTA to an EDS primary button.
    // On grace.com the CTA is an `<a class="btn-primary btn-primary-green">` (or a
    // gated-asset trigger) — a class-based button that the markdown round-trip drops,
    // leaving a plain text link. The feature-card branch above already promotes the
    // CTA when it sits beside a "Featured Service" card; this covers STANDALONE CTAs
    // (e.g. the wood-coatings eBook link, which has no feature card). Detect the source
    // button by class/gated attributes on the CURRENT DOM (still present pre-markdown)
    // and wrap it in <strong> so decorateButtons() turns it into a primary button
    // (insights CSS paints it Grace-green). Skip DM image carrier anchors and links
    // inside the feature card / tables. The anchor need not be a lone <p><a> yet — the
    // source may wrap it in a button container; we promote the anchor in place.
    section.querySelectorAll('a.btn-primary, a[data-gated-id], a[data-trigger-type]').forEach((a) => {
      if (a.closest('strong') || a.closest('a.item') || a.closest('table')) return;
      if (a.querySelector('img, picture')) return; // not an image link
      const strong = document.createElement('strong');
      a.replaceWith(strong);
      strong.append(a);
      a.removeAttribute('class');
      a.removeAttribute('data-gated-id');
      a.removeAttribute('data-trigger-type');
    });
    // Some gated download CTAs are authored as a <button href=...> (e.g. the "Download DAVISIL®
    // brochure" gated-modal trigger), NOT an <a>. A raw <button> has no link semantics and is
    // dropped by the markdown round-trip, so the CTA vanishes. Convert any such button that
    // carries an href (or gated attributes) into the same promoted <strong><a> primary CTA so
    // decorateButtons() paints it Grace-green like the anchor case above. Skip buttons inside
    // tables / feature cards (handled elsewhere) and content-less/JS-only buttons (no href).
    section.querySelectorAll('button.btn-primary, button[data-gated-id], button[data-trigger-type], button[href]').forEach((btn) => {
      if (btn.closest('strong') || btn.closest('a.item') || btn.closest('table')) return;
      let href = (btn.getAttribute('href') || '').trim();
      const text = (btn.textContent || '').replace(/\s+/g, ' ').trim();
      if (!href || !text) return; // need a real destination + label
      // grace.com's gated-modal JS base64-ENCODES the button's href in the rendered DOM the
      // importer captures (e.g. "L2NvbnRlbnQv…" → "/content/dam/…"). Decode it back to the real
      // path when it isn't already a normal URL/path and it base64-decodes to one.
      if (!/^(https?:\/\/|\/|#|mailto:)/i.test(href) && /^[A-Za-z0-9+/=]+$/.test(href)) {
        try {
          const decoded = (typeof atob === 'function' ? atob(href) : href);
          if (/^\/(content|[a-z])/i.test(decoded)) href = decoded;
        } catch (e) { /* leave as-is if not valid base64 */ }
      }
      // The gated CTA points at a DAM asset (/content/dam/…pdf). Such paths are NOT part of the
      // EDS site tree, so anchor them to the ABSOLUTE live grace.com URL (the real PDF). Strip
      // any Pardot gate handler suffix so the link resolves straight to the asset.
      if (/^\/content\/dam\//.test(href)) {
        href = `https://grace.com${href.replace(/\.pardot\.handler.*$/i, '')}`;
      }
      const strong = document.createElement('strong');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      if (btn.getAttribute('target')) a.setAttribute('target', btn.getAttribute('target'));
      strong.append(a);
      btn.replaceWith(strong);
    });
    // D4: the "Go here to learn more" whitepaper link. In the source DOM the link
    // text is wrapped in <em> INSIDE the <a> (<a><em>…</em></a>); markdown would flip
    // that to <em><a>…</a></em> (italic). Live renders it upright, so unwrap the inner
    // <em> — move its text up into the <a> — for whitepaper links. Handle both nestings.
    section.querySelectorAll('a[href*="machine-learning-whitepaper"] em, a[href*="marketing.grace"] em').forEach((em) => {
      while (em.firstChild) em.parentNode.insertBefore(em.firstChild, em);
      em.remove();
    });
    section.querySelectorAll('em > a[href*="machine-learning-whitepaper"]:only-child, em > a[href*="marketing.grace"]:only-child').forEach((a) => {
      const em = a.parentElement;
      if (em && em.tagName === 'EM') em.replaceWith(a);
    });
    const leadImg = section.querySelector('img[alt="Image of Media Callout"], img[alt=""]');
    if (leadImg && h1el) leadImg.setAttribute('alt', (h1el.textContent || '').replace(/\s+/g, ' ').trim());
    main.append(section);
  }

  // DETACH consumed regions (left rail + body column) before discovery, so discovery only sees
  // the sibling related-articles block (no duplicates). Also remove EVERY .social-share-container
  // (the page has a second mobile/bottom one after the article) so discovery can't re-emit a
  // duplicate share block — we already put the share block in the left rail.
  if (share) { const sc = share.closest('[class*="col-lg-2"]') || share; if (sc && sc.parentNode) sc.remove(); }
  if (bodyCol && bodyCol.parentNode) bodyCol.remove();
  document.querySelectorAll('.social-share-container').forEach((s) => { if (s.parentNode) s.remove(); });

  // Related-articles (.featured-blog-cmp) via catalog discovery — full-width below the article.
  const extra = discoverAndParseBlocks(document, url, params, { excludeSidebarHandled: true });
  extra.rendered.forEach((blockEl, i) => {
    main.append(document.createElement('hr'));
    const section = document.createElement('div');
    const blockName = (extra.parsedNames[i] || '').toLowerCase();
    const isFeaturedCards = blockName.includes('featured-content')
      || (blockEl.textContent || '').toLowerCase().includes('featured-content');
    // Section heading — prepend "Latest Insights from Grace" (captured pre-detach) as default
    // content ABOVE the cards block, in the same section, so the cards.css featured-content
    // header styling picks it up. Emitted here (not in the parser) because the parser's created
    // <table> is all that discovery collects — an <h2> added there would be dropped.
    if (isFeaturedCards && relatedTitle) {
      const h2 = document.createElement('h2');
      h2.textContent = relatedTitle;
      section.append(h2);
      // "View all articles ›" link — source renders it right-aligned on the heading row
      // (a.all-articles-cta → /insights/). Emit as a <p><a> next to the H2; cards.css styles
      // the heading div (h2 + p) and this link.
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = '/insights';
      a.textContent = 'View all articles';
      p.append(a);
      section.append(p);
    }
    section.append(blockEl);
    // Tag ONLY the related-cards section with the geo-hex section style WHEN the source wrapped it
    // in .geoAndHex/.light-gray-bkgd. The CSS keys the gray hexagon background off this class, so
    // pages without the source class render the cards on plain white — per-page parity.
    if (relatedHasGeoHex && isFeaturedCards) {
      section.append(createSectionMetadata(document, 'geo-hex'));
    }
    main.append(section);
  });

  // "Want to talk to an expert?" contact-split banner (source .contact-us-cmp). Present on
  // MANY insights articles above the footer, but was only emitted on the buildSidebarPage
  // path — so insights pages that carry it (e.g. a-brewery-goes-green) were missing the blue
  // banner. Build it here too (same helper, same placement: after the related cards, before
  // the page metadata). Returns null when the page has no .contact-us-cmp, so pages without
  // it are unaffected.
  const contactBanner = buildContactSplitBanner(document);
  if (contactBanner) {
    main.append(document.createElement('hr'));
    const bannerSection = document.createElement('div');
    bannerSection.append(contactBanner);
    main.append(bannerSection);
  }

  // Page metadata: sidebar template (left rail layout) + contactus widget. Tagline reads the
  // source contact widget's SUBHEAD/text ("Talk to our experts about how we can help your
  // business."), not just its title, so the widget copy matches live.
  // The contact widget copy is JS-hydrated (often absent from the captured DOM at transform
  // time), so read it if present, else use the insights-article default copy (which the source
  // uses site-wide on articles): "Talk to our experts about how we can help your business."
  const t = document.querySelector(
    '.contactus__content-desktop .contactus__text, .contactus__text, .contact-us-sticky .contactus__text, .contact-us-cmp .contact-us-subtitle',
  );
  const pageMeta = [['template', 'sidebar'], ['contactus', 'true']];
  const tagline = (t && (t.textContent || '').trim())
    ? (t.textContent || '').replace(/\s+/g, ' ').trim()
    : 'Talk to our experts about how we can help your business.';
  pageMeta.push(['contactus-tagline', tagline]);
  const title = h1el ? (h1el.textContent || '').replace(/\s+/g, ' ').trim() : '';
  if (title) pageMeta.push(['breadcrumb-title', title]);
  // POSTED / INDUSTRY → page metadata (rendered into the left-rail panel at runtime).
  if (publishedMeta) pageMeta.push(['published', publishedMeta]);
  if (industryMeta) pageMeta.push(['industry', industryMeta]);

  rewriteInternalLinks(main);
  WebImporter.rules.transformBackgroundImages(main, document);
  WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
  // afterTransform transformers (e.g. DM/Scene7 image → carrier anchor) run on the
  // assembled article main, after blocks are built. buildInsightsArticle constructs
  // its own <main> rather than going through buildDefaultPage, so the transformer
  // pass must be invoked here too.
  executeTransformers('afterTransform', main, { document, url, params });
  main.appendChild(document.createElement('hr'));
  main.appendChild(buildMetadataBlock(document, pageMeta));

  return {
    element: main,
    path: finalizePath(params),
    report: {
      title: document.title,
      pageType: 'insights-article',
      pageMetadata: pageMeta.map((p) => p[0]),
      contentNodes: contentNodes.length,
      blocks: extra.parsedNames,
      blocksLeftInPlace: extra.unparsed,
    },
  };
}

function buildSidebarPage(document, url, params) {
  const main = document.createElement('main');

  const heroBlock = buildHeroBlock(document);
  if (heroBlock) {
    const heroSection = document.createElement('div');
    heroSection.append(heroBlock);
    main.append(heroSection);
    main.append(document.createElement('hr'));
  }

  const navSection = buildSidebarNav(document);
  if (navSection) main.append(navSection);

  const contentNodes = extractMainContent(document);
  if (contentNodes.length) {
    // EDS splits sections on <hr>. Without it the nav + content merge and the
    // sidebar-nav style bleeds onto the body.
    if (navSection) main.append(document.createElement('hr'));
    const contentSection = document.createElement('div');
    contentNodes.forEach((n) => contentSection.append(n));
    main.append(contentSection);
  }

  // Sidebar pages also carry catalog BLOCKS in sibling articles (e.g. a product-comparison
  // table on /industries/food-beverage/beer, a contact-matrix on the customer-service page).
  // extractMainContent only grabs the .col-lg-7 rich text, so run catalog discovery over the
  // rest of the document and append any generated block as its own section. Each block is
  // emitted in place by its parser, then MOVED into the rebuilt main.
  const extraBlocks = discoverAndParseBlocks(document, url, params, { excludeSidebarHandled: true });
  extraBlocks.rendered.forEach((blockEl) => {
    main.append(document.createElement('hr'));
    const section = document.createElement('div');
    section.append(blockEl);
    main.append(section);
  });

  const contactBanner = buildContactSplitBanner(document);
  if (contactBanner) {
    main.append(document.createElement('hr'));
    const bannerSection = document.createElement('div');
    bannerSection.append(contactBanner);
    main.append(bannerSection);
  }

  // Page metadata: sidebar template + contactus widget flag + dynamic tagline/breadcrumb.
  const cmpTitleEl = document.querySelector('.contact-us-cmp .contact-us-title, .contact-us-cmp h2');
  const contactTagline = cmpTitleEl
    ? (cmpTitleEl.textContent || '').replace(/\s+/g, ' ').trim()
    : 'Want to talk to an expert?';
  const crumbItems = Array.from(document.querySelectorAll(
    'nav[aria-label*="readcrumb" i] li, .breadcrumb li, [class*="breadcrumb"] li',
  ));
  const lastCrumb = crumbItems.length
    ? (crumbItems[crumbItems.length - 1].textContent || '').replace(/\s+/g, ' ').trim()
    : '';

  const pageMeta = [
    ['template', 'sidebar'],
    ['contactus', 'true'],
    ['contactus-tagline', contactTagline],
  ];
  if (lastCrumb) pageMeta.push(['breadcrumb-title', lastCrumb]);

  rewriteInternalLinks(main);
  WebImporter.rules.transformBackgroundImages(main, document);
  WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
  main.appendChild(document.createElement('hr'));
  main.appendChild(buildMetadataBlock(document, pageMeta));

  return {
    element: main,
    path: finalizePath(params),
    report: {
      title: document.title,
      pageType: 'sidebar',
      pageMetadata: pageMeta.map((p) => p[0]),
      sidebarNav: !!navSection,
      contentNodes: contentNodes.length,
      contactSplitBanner: !!contactBanner,
      blocks: extraBlocks.parsedNames,
      blocksLeftInPlace: extraBlocks.unparsed,
    },
  };
}

// ===========================================================================
// PATH B — DEFAULT PAGES (catalog block discovery, decorate document.body in place).
// Applies the whole catalog priority-ordered; parses blocks that have a registered
// parser; leaves (and logs) blocks that don't, so content is preserved.
// ===========================================================================

/** Discover every catalog block present on the page (selector OR matcher). */
function findBlocksOnPage(document) {
  const found = [];
  CATALOG.blocks.forEach((def) => {
    if (def.render === 'skip-existing' || def.render === 'forms-pass') return;
    let elements = [];
    const matcher = MATCHERS[def.name];
    if (matcher) {
      try { elements = matcher(document) || []; } catch (e) {
        console.error(`[master] matcher "${def.name}" failed:`, e); elements = [];
      }
    } else if (def.selector) {
      try { elements = Array.from(document.querySelectorAll(def.selector)); } catch (e) { elements = []; }
    }
    elements.forEach((element) => found.push({ def, element }));
  });
  // Emit in SOURCE-DOM order, not catalog-iteration order — otherwise two blocks discovered
  // by different catalog entries come out in catalog/priority order and can be swapped relative
  // to the source layout (e.g. cards-featured-content "Latest Insights" is priority 40 but sits
  // BEFORE social-follow priority 20 in the DOM; priority-first sorting wrongly flipped them).
  // DOM POSITION is primary; priority is only the tie-breaker when two entries match the SAME
  // element (which one claims it first). compareDocumentPosition works on the still-attached
  // source DOM (before any parser detaches a node).
  found.sort((a, b) => {
    if (a.element !== b.element) {
      const rel = a.element.compareDocumentPosition(b.element);
      // eslint-disable-next-line no-bitwise
      if (rel & 0x02) return 1; // b precedes a in the DOM
      // eslint-disable-next-line no-bitwise
      if (rel & 0x04) return -1; // a precedes b in the DOM
      return 0;
    }
    // same element matched by two entries → more-specific (lower priority number) first
    const pa = a.def.priority == null ? 999 : a.def.priority;
    const pb = b.def.priority == null ? 999 : b.def.priority;
    return pa - pb;
  });
  return found;
}

/**
 * Seed a JS-hydrated placeholder block from its draft markup. DRAFT_SEEDS[name] holds the
 * authored block in DA plain-html form: `<div class="name variant"><div>row…<div>cell…`.
 * We can't just insert that div — at transform time a block must be a proper table built by
 * WebImporter.Blocks.createBlock, or markdown conversion unwraps it. So we read the block's
 * name (from its class) and its row/cell structure, and rebuild it via createBlock, then
 * replace the live placeholder `element`. Returns true when a seed was applied.
 */
function seedFromDraft(def, element, document) {
  const markup = DRAFT_SEEDS[def.name];
  if (!markup) return false;
  const tpl = document.createElement('div');
  tpl.innerHTML = markup;
  const blockDiv = tpl.firstElementChild;
  if (!blockDiv) return false;

  // Block name: "custom-widget search-filter" -> "Custom-Widget (search-filter)" style is
  // not needed; createBlock lowercases + hyphenates the name back to the classes. Use the
  // raw class list turned into a createBlock name that reproduces the same classes.
  const classes = Array.from(blockDiv.classList);
  const name = classes.length > 1
    ? `${classes[0]} (${classes.slice(1).join(' ')})`
    : classes[0];

  // Rows = direct children; cells = each row's direct children. Cell content = cell's children
  // (or the cell itself when it holds inline content).
  const rows = Array.from(blockDiv.children);
  const cells = rows.map((row) => Array.from(row.children).map((cell) => {
    const kids = Array.from(cell.childNodes).filter((n) => n.nodeType === 1
      || (n.nodeType === 3 && n.textContent.trim()));
    return kids.length ? kids.map((n) => n.cloneNode(true)) : [document.createTextNode((cell.textContent || '').trim())];
  }));

  const block = WebImporter.Blocks.createBlock(document, { name, cells });
  element.replaceWith(block);
  return true;
}

// Regions the SIDEBAR path builds itself from source (hero band + contact-split banner).
// Discovery must NOT re-parse blocks inside them, or it would duplicate the hero and strip
// the banner's inquiry lists (mis-claimed as two-column tables). Also skip the block families
// that ARE the hero / contact-split banner regardless of container.
const SIDEBAR_HANDLED_CONTAINERS = '.hero__section, .generic-hero, .contact-us-cmp';
const SIDEBAR_HANDLED_BLOCKS = new Set([
  'hero-banner', 'hero-full-width', 'hero-campaign', 'hero-event', 'hero-product',
  'banner-contact-split',
]);

/**
 * Run catalog discovery + parsers over the document. Each parser replaceWith()s a block in
 * place. We capture the created block node (it takes `element`'s slot) so callers can either
 * leave it in the body (default path) or MOVE it into a rebuilt main (sidebar path).
 *
 * @param {object} [opts]
 * @param {boolean} [opts.excludeSidebarHandled] skip hero + contact-split regions/blocks that
 *        the sidebar path constructs itself (prevents duplicate hero / stripped banner lists).
 * @returns {{ rendered: Element[], parsedNames: string[], unparsed: string[] }}
 */
function discoverAndParseBlocks(document, url, params, opts = {}) {
  const pageBlocks = findBlocksOnPage(document);
  const rendered = [];
  const parsedNames = [];
  const unparsed = [];

  pageBlocks.forEach(({ def, element }) => {
    if (!element || !element.parentNode) return; // already consumed by an earlier parser
    if (opts.excludeSidebarHandled) {
      if (SIDEBAR_HANDLED_BLOCKS.has(def.name)) return;
      if (element.closest && element.closest(SIDEBAR_HANDLED_CONTAINERS)) return;
    }
    // Robustly capture created blocks by diffing the document's block-<table> set before/after
    // (works whether the parser replaces `element` itself OR an ancestor).
    const before = new Set(document.querySelectorAll('table'));
    const collectCreated = () => {
      Array.from(document.querySelectorAll('table')).forEach((t) => {
        if (!before.has(t) && !t.closest('table td')) rendered.push(t);
      });
    };

    if (def.render === 'seed-from-draft') {
      // JS-hydrated placeholder widgets with no server content: replace the placeholder with
      // the block-table markup authored in the draft (seed). Parser blocks (banner-cta,
      // quote-cta, video-overlay) are NOT seeded — they fall through to their parsers below.
      if (!parsers[def.name]) {
        try {
          if (seedFromDraft(def, element, document)) { parsedNames.push(def.name); collectCreated(); }
        } catch (e) { console.error(`[master] seed ${def.name} failed:`, e); }
        return;
      }
    }

    const parser = parsers[def.name];
    if (!parser) {
      if (!unparsed.includes(def.name)) unparsed.push(def.name);
      return;
    }
    try {
      parser(element, { document, url, params });
      parsedNames.push(def.name);
      collectCreated();
    } catch (e) {
      console.error(`[master] failed rendering ${def.name}:`, e);
    }
  });

  return { rendered, parsedNames, unparsed };
}

/**
 * Product-page gated download buttons + leaked gated forms.
 * grace.com product pages render each "Download …" CTA as a `<button data-trigger-type="gated-modal"
 * href="<base64-path>">` that pops a gated Marketo-style form (lazily injected). Two problems for
 * import:
 *   1. The button carries NO real href — its target is base64 in the `href` attr — so it round-trips
 *      to plain text ("Download …"), losing the PDF link.
 *   2. The gated form markup (First Name*, Business Email*, Submit, privacy copy…) sometimes
 *      hydrates into the DOM and leaks into the body as a wall of stray text.
 * Fix, run BEFORE discovery/markdown:
 *   • Replace each gated-modal <button> with a real <a href="decoded.pdf"> (keeps the download CTA).
 *   • Remove the gated form containers (lightbox / gated-asset / form.gated) — forms are handled in
 *     the dedicated Adaptive Forms pass, not dumped as text here.
 */
function normalizeGatedDownloads(root, document) {
  const decode = (raw) => {
    if (!raw) return '';
    if (/^(https?:|\/|#|mailto:)/i.test(raw)) return raw;
    try {
      const d = (typeof atob === 'function' ? atob(raw) : Buffer.from(raw, 'base64').toString('utf8'));
      return /^\/|^https?:/i.test(d) ? d : '';
    } catch (e) { return ''; }
  };
  // 1. gated-modal download buttons → real anchors
  root.querySelectorAll('button[data-trigger-type="gated-modal"], a[data-trigger-type="gated-modal"]').forEach((btn) => {
    const target = decode(btn.getAttribute('href') || '');
    const label = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (!label) { btn.remove(); return; }
    const a = document.createElement('a');
    a.href = target || '#';
    a.textContent = label;
    // Wrap the anchor in <strong> inside its own <p>: scripts.js decorateButtons only promotes a
    // link to a styled `.button.primary` when it's wrapped in <strong>/<em> (matching grace's
    // source `<strong><a>` download CTAs). A bare <a> stays plain inline text (invisible on white).
    const strong = document.createElement('strong');
    strong.append(a);
    const p = document.createElement('p');
    p.append(strong);
    btn.replaceWith(p);
  });
  // 2. strip leaked gated form modals (deferred to the Adaptive Forms pass). NOTE: do NOT remove
  //    `.media-modal` here — the video-overlay parser reads the YouTube embed from the media-callout's
  //    `.media-modal .active-video` during discovery (which runs after this). The gated download form
  //    lives in its OWN lightbox/gated-asset containers, distinct from the video modal.
  root.querySelectorAll('.lightbox-container, .gated-asset-simplified, form.gated, .gated-modal-form').forEach((el) => el.remove());
}

/**
 * Sectionize a flat default-path body with `<hr>` breaks so each BLOCK table lands in its OWN EDS
 * section. Without this, aem.js merges the whole body into a single `.section` that stacks every
 * block's `*-container` class on one element — so, e.g. `.columns-container:has(.columns.horizontal-teaser)`
 * (which paints the geo/hex background) applies to the ENTIRE page, bleeding the hexa band above
 * the hero and across all content. One block per section keeps each block's container styling scoped.
 *
 * The WebImporter serializer turns each DIRECT child of the returned root into an EDS section (and
 * `<hr>` children become section breaks). But the default path decorates `document.body` in place,
 * so all blocks + content sit inside ONE source wrapper (one section) — every block's
 * `*-container` class stacks on that single section and, e.g. the columns geo/hex background spans
 * the whole page. Fix: REBUILD the root's flow as a flat sequence of sections. Walk the deepest
 * single-child wrapper that holds the real flow, then regroup its children so each block table is
 * its own section and contiguous default content forms its own section, joined by `<hr>`s at ROOT
 * level (where the serializer acts). Returns the new root to use in place of `main`.
 */
function sectionizeFlatBody(main, document, splitFingerprints = []) {
  // The parsers leave each block <table> buried in the ORIGINAL AEM grid nesting (e.g.
  // TABLE < .generic-hero < .aem-Grid < .responsivegrid …), and default content is scattered
  // through that same tree. A depth-based regroup can't handle the varying depths, so FLATTEN by
  // document order instead:
  //   1. collect the block tables in order;
  //   2. for each block, gather the "loose" flow content (headings/paragraphs/lists/images) that
  //      appears BEFORE it and hasn't been claimed yet — that content belongs to the section above
  //      the block (e.g. the intro h3+paras before the cards, the "used in processes" line before
  //      the teaser);
  //   3. rebuild main as a flat list of <div> sections in order: [loose-before-block-1][block-1]
  //      [loose-before-block-2][block-2]…[trailing-loose]. Each direct-child <div> becomes one EDS
  //      section, so no block's *-container class stacks with another's.
  const blocks = Array.from(main.querySelectorAll('table')).filter((t) => !t.closest('td, th'));
  if (blocks.length < 2) return main; // nothing to isolate

  // Ordered list of "content leaves" — text-bearing flow elements NOT inside a block table and not
  // nested inside another leaf (e.g. a <p> inside an <li>). querySelectorAll returns them in
  // document order; interleave with the block tables (also in document order) to form `seq`.
  const LEAF = 'h1, h2, h3, h4, h5, h6, p, ul, ol, blockquote, pre, figure';
  // A standalone CONTENT image (e.g. the hydrogenation-catalysts RANEY flowchart diagram) is its
  // own `.image` component in the body flow. It isn't in LEAF (which is text-flow only), so it never
  // became a content leaf and vanished. Treat a top-level content <picture>/<img> as a leaf too —
  // but ONLY when it's NOT inside a block table, a card/hero/teaser wrapper, or a link (those are
  // handled by their own parsers). leafParentOk already rejects TABLE/LI/A ancestors; also reject
  // the block-ish component wrappers so we don't double-count card/hero imagery.
  const IMG_LEAF = 'picture, img';
  const imgAncestorBad = (el) => !!el.closest('.hero, .cards, .columns, .card, .cmp-card, table, picture');
  const isBlock = (el) => el.tagName === 'TABLE';
  const leafParentOk = (el) => {
    let p = el.parentElement;
    while (p && p !== main) {
      if (p.matches(LEAF) || p.tagName === 'TABLE' || p.tagName === 'LI' || p.tagName === 'A') return false;
      p = p.parentElement;
    }
    return true;
  };
  const leaves = Array.from(main.querySelectorAll(LEAF)).filter(leafParentOk);
  // Add standalone content images as leaves (a bare <img> whose closest LEAF-image is itself).
  Array.from(main.querySelectorAll(IMG_LEAF)).forEach((img) => {
    if (img.tagName === 'IMG' && img.closest('picture')) return; // the <picture> is the leaf
    if (imgAncestorBad(img) && img.tagName === 'IMG') return;
    if (img.tagName === 'PICTURE' && img.closest('.hero, .cards, .columns, .card, .cmp-card, table')) return;
    if (leafParentOk(img)) leaves.push(img);
  });
  // Add standalone DM/Scene7 image CARRIER ANCHORS as leaves. The afterTransform DM transformer
  // (grace-dm-images.js) runs BEFORE this and rewrites a materialized content <img> into an
  // `<a href="scene7…">alt</a>` carrier (the round-trip-safe form the client auto-block rebuilds into
  // a <picture>). Such an anchor is neither a LEAF nor a block table, so it was dropped when the body
  // was rebuilt — the RANEY flowchart defect. Collect a carrier anchor that is a DIRECT flow element
  // (not inside a card/hero/teaser/list/heading, which own their imagery) as its own content leaf.
  Array.from(main.querySelectorAll('a[href*="/is/image/"], a[href*="scene7"]')).forEach((a) => {
    if (a.closest('.hero, .cards, .columns, .card, .cmp-card, table, li, h1, h2, h3, h4, h5, h6, p')) return;
    // must be a bare image carrier (no other meaningful text/among siblings handled elsewhere)
    if (leafParentOk(a)) leaves.push(a);
  });
  // Add standalone CTA anchors as leaves. A bare text link that is a DIRECT flow child (e.g. the
  // "Learn more" → /about-grace/sustainability/ inside the value-creation/sustainability callout)
  // is neither a LEAF (h*/p/ul/…) nor an image carrier, so it was dropped when the body was rebuilt.
  // Wrap it in `<p><strong>…</strong></p>` so it survives AND `scripts.js` decorateButtons()
  // promotes it to a green PRIMARY button (source renders these standalone CTAs as solid green
  // buttons — the `.cta`/`btn` styling; decorateButtons only buttonizes a <strong>-wrapped anchor,
  // a bare <a> stays plain text). Skip image carriers (handled above), links already inside a
  // leaf/list/heading/card/block, and empty/anchor-only-fragment links.
  Array.from(main.querySelectorAll('a[href]')).forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (/\/is\/image\/|scene7/.test(href)) return; // image carrier — handled above
    if (href.startsWith('#') || !href.trim()) return; // in-page/empty
    if (a.querySelector('picture, img')) return; // image link
    if (!a.textContent.trim()) return; // no visible label
    if (a.closest('.hero, .cards, .columns, .card, .cmp-card, table, li, h1, h2, h3, h4, h5, h6, p, nav, .section-navigation')) return;
    if (!leafParentOk(a)) return;
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    a.replaceWith(p);
    strong.appendChild(a);
    p.appendChild(strong);
    leaves.push(p);
  });
  // Merge blocks + leaves into one document-ordered sequence.
  const all = [...blocks, ...leaves].sort((a, b) => {
    if (a === b) return 0;
    // eslint-disable-next-line no-bitwise
    return (a.compareDocumentPosition(b) & 0x04) ? -1 : 1; // a precedes b → -1
  });
  const seq = all.map((el) => ({ type: isBlock(el) ? 'block' : 'leaf', el }));
  if (!seq.length) return main;

  // Build ordered groups → sections. Each block is its own section. When a run of leaves precedes
  // a block, its TRAILING heading-led tail is that block's HEADING (e.g. the teaser's
  // "…used in the following processes:" H2, or the "Latest Insights" H2 + "View all articles" link)
  // — peel that tail and merge it INTO the block's section so cards/columns CSS styles the header
  // with the block. The rest of the run (intro body: heading + paragraphs + list + downloads) is
  // its own standalone content section. The tail starts at the LAST heading in the run (so an H2
  // plus a following link-<p> both travel with the block).
  const isHeading = (el) => /^H[1-6]$/.test(el.tagName);
  // A background-banded content run (gray-band / blue-border) must become its OWN section so the
  // section style applies only to it. Split a leaf run into sub-runs at each leaf whose text starts
  // a captured fingerprint. Returns an array of runs (one when no split points). No-op when
  // splitFingerprints is empty (products/other families keep byte-identical single-run behaviour).
  const fpNorm = (splitFingerprints || []).map((s) => (s || '').replace(/\s+/g, ' ').trim().slice(0, 60)).filter(Boolean);
  // A standalone content IMAGE (a DM/Scene7 carrier anchor, or a bare <img>/<picture> leaf) is its
  // OWN source section on grace.com — e.g. the RANEY flowchart sits on white BELOW the gray "Why are
  // catalysts" band, NOT inside it. Detect such an image leaf so splitRun breaks it into its own
  // section (and the content after it starts fresh too), so it doesn't inherit the preceding band.
  const isImageLeaf = (el) => {
    if (!el) return false;
    if (el.tagName === 'IMG' || el.tagName === 'PICTURE') return true;
    if (el.tagName === 'A') {
      // A DM/Scene7 carrier anchor IS an image leaf regardless of its link text — the text is the
      // image's alt (e.g. "Chart Raney Hydrogenation Catalysts"), not prose. Its href points at the
      // Scene7 asset and it has no child element other than (optionally) a picture/img.
      const href = el.getAttribute('href') || '';
      if (!/\/is\/image\/|scene7/.test(href)) return false;
      const childEls = Array.from(el.children).filter((c) => !/^(BR|SOURCE)$/.test(c.tagName));
      return childEls.length === 0 || childEls.every((c) => c.tagName === 'PICTURE' || c.tagName === 'IMG');
    }
    // a <p> whose only meaningful child is an image carrier anchor OR a <picture>/<img>
    if (el.tagName === 'P') {
      if (el.querySelector(':scope > picture, :scope > img')) return true;
      const a = el.querySelector(':scope > a[href*="/is/image/"], :scope > a[href*="scene7"]');
      if (!a) return false;
      // treat as an image leaf whenever the <p>'s only meaningful content is that carrier anchor
      // (regardless of the anchor's link text — it's the image's alt, not prose).
      const pText = (el.textContent || '').replace(/\s+/g, ' ').trim();
      const aText = (a.textContent || '').replace(/\s+/g, ' ').trim();
      return pText === aText;
    }
    return false;
  };
  const splitRun = (run) => {
    if (run.length < 2) return [run];
    const out = [];
    let cur = [];
    // Tracks when the current sub-run was STARTED by a gray/blue fingerprint (a banded promo box,
    // e.g. unipol "Read how UNIPOL…"). Such a box is short (its heading + a CTA link) and must NOT
    // absorb the NEXT section's heading + prose — otherwise the band bleeds over the following body
    // (the "banner merging with text below" defect). So once inside a fingerprint-started sub-run,
    // break again BEFORE the next heading (which begins non-banded content).
    let curIsFp = false;
    run.forEach((el, idx) => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const fpBoundary = fpNorm.length && t && fpNorm.some((fp) => t.startsWith(fp) || fp.startsWith(t));
      // break BEFORE an image leaf (it starts its own section) and BEFORE the element that follows
      // one (so the image is isolated). Combined with the fingerprint boundary.
      const imgBoundary = isImageLeaf(el) || (idx > 0 && isImageLeaf(run[idx - 1]));
      // close a fingerprint-started sub-run when a NEW heading appears (start of the next section),
      // so the banded box keeps only its own heading + CTA.
      const fpEndBoundary = curIsFp && !fpBoundary && isHeading(el) && cur.length;
      if ((fpBoundary || imgBoundary || fpEndBoundary) && cur.length) { out.push(cur); cur = []; curIsFp = false; }
      if (fpBoundary) curIsFp = true;
      cur.push(el);
    });
    if (cur.length) out.push(cur);
    return out;
  };
  const sections = [];
  let pending = [];
  const flushBody = (body) => { splitRun(body).forEach((r) => { if (r.length) sections.push(r); }); };
  seq.forEach((item) => {
    if (item.type === 'leaf') { pending.push(item.el); return; }
    // find the start of the trailing header tail: the last heading in `pending`, if any content
    // after it is only short (links/paragraph CTAs), treat from that heading to the end as the tail.
    let tailStart = -1;
    for (let i = pending.length - 1; i >= 0; i -= 1) {
      if (isHeading(pending[i])) { tailStart = i; break; }
    }
    // only peel when the heading is near the end of the run (its tail is ≤3 nodes: heading + CTA/p)
    let tail = (tailStart >= 0 && pending.length - tailStart <= 3) ? pending.slice(tailStart) : [];
    // Do NOT peel a tail that (a) leads with a heading matching a gray-band/blue-border fingerprint —
    // that's a STANDALONE banded content section, not this block's header (e.g. the "Why are catalysts"
    // gray band must not merge into the following Latest-Insights block); or (b) contains a standalone
    // image leaf (e.g. the RANEY flowchart) — those must split into their own section via flushBody.
    if (tail.length) {
      const headFp = (tail[0].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const headIsBand = fpNorm.length && headFp && fpNorm.some((fp) => headFp.startsWith(fp) || fp.startsWith(headFp));
      const hasImg = tail.some((el) => isImageLeaf(el));
      // A block-header tail is a heading + a SHORT CTA (link/eyebrow), NOT a heading followed by real
      // body prose or a list. When the tail after its heading carries a substantial paragraph
      // (>60 chars, not just a link) or a <ul>/<ol>, it's a STANDALONE content section — do NOT merge
      // it into the following block (e.g. the "Assistance" h3 + GCT paragraph + services list must
      // stay its own content section, not get absorbed into the following e-catalysts banner-cta,
      // which would drag the prose full-width with the banner).
      const tailBodyIsSubstantial = tail.slice(1).some((el) => {
        if (/^(UL|OL)$/.test(el.tagName)) return true;
        if (el.tagName === 'P') {
          const link = el.querySelector('a');
          const txt = (el.textContent || '').replace(/\s+/g, ' ').trim();
          if (link && (link.textContent || '').replace(/\s+/g, ' ').trim() === txt) return false; // CTA-only <p>
          return txt.length > 60;
        }
        return false;
      });
      if (headIsBand || hasImg || tailBodyIsSubstantial) tail = [];
    }
    const body = tail.length ? pending.slice(0, tailStart) : pending;
    if (body.length) flushBody(body);
    sections.push([...tail, item.el]);
    pending = [];
  });
  if (pending.length) flushBody(pending);

  // Rebuild main: detach each section's nodes from their old grid homes and re-append into fresh
  // top-level <div> sections in order. Clear main first (its old grid wrappers are now empty).
  const built = sections.map((group) => {
    const section = document.createElement('div');
    group.forEach((el) => section.appendChild(el)); // appendChild MOVES el out of its old parent
    return section;
  });
  while (main.firstChild) main.removeChild(main.firstChild);
  built.forEach((s, i) => {
    if (i > 0) main.appendChild(document.createElement('hr')); // <hr> is the EDS section delimiter
    main.appendChild(s);
  });
  return main;
}

function buildDefaultPage(document, url, params) {
  const main = document.body;

  // Product-page gated download buttons (base64 hrefs) + leaked gated forms — normalize BEFORE
  // discovery so the download CTAs survive as links and the form text doesn't dump into the body.
  normalizeGatedDownloads(main, document);

  // Tell the cards-featured-content parser to emit its own "Latest Insights from Grace" heading +
  // "View all articles" link as siblings before the block (default/product path). On the insights
  // path buildInsightsArticle emits the heading itself, so it leaves this flag unset to avoid a
  // duplicate.
  params.emitFeaturedHeading = true;

  const { parsedNames: rendered, unparsed } = discoverAndParseBlocks(document, url, params);

  executeTransformers('afterTransform', main, { document, url, params });

  // contactus widget (metadata-driven) can still apply on non-sidebar pages.
  const pageMeta = [];
  // Contact-us widget presence + tagline are captured in params BEFORE cleanup removes the
  // widget (see transform()); fall back to a live query for any caller that didn't pre-capture.
  // The PLAIN about-grace landings (leadership-team, awards-and-recognition) render full-width with
  // NO Contact-Us widget on the source — but their `.contact-us-sticky` hydrates late (during the
  // onLoad wait) and gets captured, wrongly emitting `contactus: true` + a right-rail layout. Suppress
  // it for these paths so they match the source's plain centered layout.
  const bcPath = (() => { try { return new URL((params && params.originalURL) || url || '').pathname; } catch (e) { return ''; } })();
  const hasCU = !isAboutGracePlainLanding(bcPath)
    && ((params && params.sourceHadContactWidget) || hasContactWidget(document));
  // An /industries/ LANDING page (banner hero, NO left section-nav, NO contact widget — e.g.
  // hydroprocessing) still uses the SAME constrained/left-aligned content layout as the contactus
  // template on the source (content column ~920px, not full-bleed centered). Give it the contactus
  // template + per-block sectionization so its body doesn't stretch edge-to-edge and its
  // category-grid can sit in its own gray band. It gets NO contactus widget/tagline (there is none).
  const isIndustriesLanding = !hasCU
    && !(params && params.industriesNav)
    && /\/industries\//.test((params && params.originalURL) || url || '')
    && !!(params && params.sourceHadBannerHero);
  if (hasCU) {
    // `template: contactus` drives templates/contactus/contactus.css — it narrows + left-aligns the
    // content column (max 920px) leaving a right gutter for the sticky Contact Us widget (source
    // layout: grace.com/products/ludox). Without it the content centers full-width and the widget
    // floats over it. The `contactus` flag + tagline feed scripts.js's auto-built sticky panel.
    // Default is the `contactus` template (2-col: content + widget gutter). Industries DETAIL
    // pages (left section-nav present) override to `sidebar` via params.forceTemplate so the
    // 3-col grid (nav | content | widget) engages — the nav rail is inserted below.
    pageMeta.push(['template', (params && params.forceTemplate) || 'contactus']);
    pageMeta.push(['contactus', 'true']);
    const tagline = (params && params.contactWidgetTagline) || '';
    if (tagline) pageMeta.push(['contactus-tagline', tagline]);
  } else if (params && params.forceTemplate) {
    // A forced template WITHOUT a contact widget — the about-grace section-nav pages (this-is-grace,
    // our-history, locations, EHS, community, sustainability). They render as `sidebar` (nav rail +
    // content) but ship NO contact-us widget, so the hasCU branch above never fires. Emit the
    // template row directly (NO `contactus` flag/tagline) so body.sidebar engages and the injected
    // nav rail is placed in column 1. (Industries-detail pages DO have a widget → they take the
    // hasCU branch and forceTemplate is honored there.)
    pageMeta.push(['template', params.forceTemplate]);
  } else if (isIndustriesLanding) {
    // contactus layout WITHOUT the widget: constrained/left-aligned content column, no right rail.
    pageMeta.push(['template', 'contactus']);
  }

  // Breadcrumb is ON by default (hero banner auto-derives it from the URL). When the SOURCE
  // page had NO breadcrumb (captured pre-cleanup in params.sourceHadBreadcrumb), opt this page
  // OUT with a `breadcrumb: false` metadata row — but only when the page actually renders a
  // banner hero (the thing that shows a breadcrumb), so we don't add noise elsewhere.
  if (params && params.sourceHadBannerHero && params.sourceHadBreadcrumb === false) {
    pageMeta.push(['breadcrumb', 'false']);
  }

  // Industries pages: the source breadcrumb's last crumb is the URL-derived label (e.g. "Refining
  // Technologies"), which DIFFERS from the hero H1 ("FCC Catalyst and Additive Solutions"). Emit it
  // as `breadcrumb-title` so hero.js uses it verbatim instead of falling back to og:title/
  // document.title (the H1). Only for /industries/ pages so newsroom PRs — whose source last crumb
  // IS the full title — keep their og:title fallback. Prefer the captured source crumb; fall back to
  // the humanized last URL segment.
  const isIndustries = /\/industries\//.test((params && params.originalURL) || url || '');
  if (isIndustries) {
    let crumb = (params && params.sourceLastCrumb) || '';
    if (!crumb) {
      try {
        const segs = new URL((params && params.originalURL) || url).pathname
          .replace(/\/$/, '').split('/').filter(Boolean);
        const last = segs[segs.length - 1] || '';
        crumb = last.replace(/-+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      } catch (e) { crumb = ''; }
    }
    if (crumb) pageMeta.push(['breadcrumb-title', crumb]);
  }

  // Real data <table>s left in the body: markdown's round-trip turns each table's FIRST header
  // cell into a BLOCK NAME (e.g. "Segment"/"Benefits" → <div class="segment"> → EDS 404). The
  // insights path handles this per-table; the default path did not, so product detail pages with
  // spec tables emitted phantom blocks. Convert every remaining real <table> into a proper
  // `Table (variant)` block (variant by column count), matching the insights body-loop treatment.
  Array.from(main.querySelectorAll('table')).forEach((table) => {
    if (table.closest('td, th')) return; // nested cell table — leave to its parent
    const firstRow = table.querySelector('tr');
    const cols = firstRow ? firstRow.querySelectorAll('td, th').length : 0;
    // CRITICAL: skip EDS block tables that createBlock already emitted. Those have a single-cell
    // header row holding the block NAME (e.g. "Hero (banner)", "Accordion (faq)"). Re-wrapping them
    // would turn real blocks into Table(data-grid). Genuine source data tables always have ≥2
    // columns in their first row, so only sweep those.
    if (cols < 2) return;
    const variant = cols >= 3 ? 'three-column' : 'two-column-content';
    try { parseRealTables(table, document, `Table (${variant})`); } catch (e) { /* leave in place */ }
  });

  rewriteInternalLinks(main);
  WebImporter.rules.transformBackgroundImages(main, document);
  WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

  // Targeted cleanup: some grace heroes carry the heading as an ESCAPED-HTML string ("<h1>…</h1>"
  // as text) which flows into the DM-image carrier-anchor's link text. Blank that anchor text so
  // the round-trip doesn't emit a garbage "[<h1>…</h1>](scene7-url)" alt. Scoped to anchors whose
  // href is a DM/scene7 image and whose text looks like escaped HTML — leaves real links alone.
  main.querySelectorAll('a[href*="scene7"], a[href*="/is/image/"]').forEach((a) => {
    if (/<\/?[a-z][^>]*>/i.test(a.textContent || '')) a.textContent = '';
  });
  // Same artifact on direct <img> (image heroes rendered as <img alt=…> not a carrier-anchor, e.g.
  // silsol): the escaped-HTML "<h1>…</h1>" leaked into alt. Blank it — a hero photo is decorative
  // (the real <h1> carries the meaning), so empty alt is correct and passes a11y.
  main.querySelectorAll('img[alt]').forEach((img) => {
    if (/<\/?[a-z][^>]*>/i.test(img.getAttribute('alt') || '')) img.setAttribute('alt', '');
  });

  // Sectionize the flat body so each block gets its own EDS section (prevents the columns-container
  // hexa background from spanning the whole page). Gated to contactus/product pages — the template
  // that needs per-block section isolation — so already-validated flat default pages (newsroom,
  // compliance) keep their current single-section output. `hasCU` is the product-detail signal;
  // an industries LANDING page (hydroprocessing) also needs it so its ART intro + category grid +
  // insights each become their own section (and the gray-band tag can land on the grid).
  // A featured "Latest Insights" band (geo-hex OR plain gray) means the page has ≥2 distinct sections
  // that MUST be isolated — otherwise the band's Section Metadata applies to the WHOLE merged section
  // and the preceding content (e.g. a leadership BIO's profile-detail block) wrongly inherits the
  // gray/hex background. Bios are default-path with no widget/forceTemplate, so add this signal.
  const hasFeaturedBand = !!(params && (params.sourceFeaturedHasGeoHex || params.sourceFeaturedIsPlainGray));
  if (hasCU || isIndustriesLanding || (params && params.forceTemplate === 'sidebar') || hasFeaturedBand) {
    // Pass gray-band/blue-border fingerprints so those banded content runs each become their OWN
    // section (the section style then applies only to them). Empty on non-industries pages → no-op.
    // `forceTemplate === 'sidebar'` covers about-grace section-nav pages (no contact widget, so
    // hasCU is false) — they still need per-block sections so the injected nav rail sits in its own
    // top-level section and the stacked image-left/right columns don't share one grid section.
    // `hasFeaturedBand` covers the leadership BIO pages (profile-detail + Latest-Insights geo-hex),
    // so the geo-hex tag lands ONLY on the featured section and the profile block stays on white.
    const splitFps = [...(params.sourceGrayBands || []), ...(params.sourceBlueBorders || [])];
    sectionizeFlatBody(main, document, splitFps);
  }

  // Industries DETAIL pages: inject the left section-nav rail (built + detached pre-pipeline) as
  // its OWN top-level section right AFTER the hero, so the sidebar grid places it in column 2
  // (nav) while the body sections flow down column 3. The hero is the section whose block table's
  // header cell names a Hero variant; insert the nav (already a section <div> from buildSidebarNav)
  // immediately after that hero section, delimited by <hr>s.
  if (params && params.industriesNav && params.industriesNav.children.length) {
    const navSection = params.industriesNav; // a <div> holding <ul> + sidebar-nav Section Metadata
    const topSections = Array.from(main.children).filter((c) => c.nodeType === 1 && c.tagName === 'DIV');
    const heroSection = topSections.find((c) => {
      const hdr = c.querySelector('table tr');
      return hdr && /hero\s*\(/i.test(hdr.textContent || '');
    });
    const hr = document.createElement('hr');
    if (heroSection) {
      // insert: <hero> <hr> <nav> <hr> …rest. anchor = node right after hero (could be an <hr>).
      const afterHero = heroSection.nextSibling;
      main.insertBefore(hr, afterHero);
      main.insertBefore(navSection, afterHero);
      main.insertBefore(document.createElement('hr'), navSection); // ensure hero↔nav split
    } else {
      main.insertBefore(hr, main.firstChild);
      main.insertBefore(navSection, main.firstChild);
    }

    // LOCATIONS landing: the "Americas/Asia/Europe Plant Sites" text index lives INSIDE the left
    // section-nav rail on the source (below the About Grace nav), NOT as a separate content section.
    // buildDefaultPage emits it as its own top-level section, which the sidebar grid then places in
    // the right content column (col 3) above the card grids — wrong. Move that index's paragraphs
    // INTO the nav section (before its Section Metadata) so it renders in the left rail like source.
    const plantIdxSection = Array.from(main.children).find((c) => {
      if (c.nodeType !== 1 || c === navSection) return false;
      const firstStrong = c.querySelector('p:first-child > strong, strong');
      return firstStrong && /Plant Sites\s*$/i.test((firstStrong.textContent || '').trim());
    });
    if (plantIdxSection) {
      // navSection is the <div> holding [ <ul> nav, (promo card), Section-Metadata <div> ]. Insert
      // the plant-index paragraphs before the Section-Metadata so they stay within the nav section.
      const metaDiv = Array.from(navSection.children)
        .find((n) => n.nodeType === 1 && n.querySelector && n.querySelector(':scope > div > div'))
        || null;
      // Move ONLY the plant-site index paragraphs into the rail. The section also contains the
      // "Locations Worldwide" <h2> (and it heads the RIGHT content column in the source), so STOP at
      // that heading — leave it + anything after it in the content section. Moving it too trapped it
      // in the narrow left rail and left the content column with no "Locations Worldwide" title.
      const kids = Array.from(plantIdxSection.children);
      const stopIdx = kids.findIndex((n) => /^H[1-6]$/.test(n.tagName) && /Locations Worldwide/i.test(n.textContent || ''));
      const toMove = stopIdx >= 0 ? kids.slice(0, stopIdx) : kids;
      toMove.forEach((node) => {
        if (metaDiv) navSection.insertBefore(node, metaDiv);
        else navSection.appendChild(node);
      });
      // If nothing meaningful remains in the index section (no "Locations Worldwide" heading), drop
      // it + an adjacent <hr>. Otherwise keep it (now starting at "Locations Worldwide") in col 3.
      if (stopIdx < 0) {
        const prev = plantIdxSection.previousSibling;
        const next = plantIdxSection.nextSibling;
        if (prev && prev.nodeName === 'HR') prev.remove();
        else if (next && next.nodeName === 'HR') next.remove();
        plantIdxSection.remove();
      }
    }
  }

  // Tag the "Latest Insights" featured-content section with a background section style matching the
  // SOURCE band (captured pre-cleanup): `.geoAndHex` → `geo-hex` (hexagon band); `.light-gray-bkgd`
  // only → `gray-band` (PLAIN gray, no hexagons). Pages whose source lacked any band stay white.
  // Locate the featured-content block table (header cell = "Cards (featured-content)") and append
  // Section Metadata to whichever top-level section <div> contains it.
  if (params && (params.sourceFeaturedHasGeoHex || params.sourceFeaturedIsPlainGray)) {
    // createBlock humanizes the variant in the header cell: `Cards (featured-content)` renders as
    // "Cards (featured Content)" (hyphen → space, title-cased). Match tolerantly on both.
    const featuredTable = Array.from(main.querySelectorAll('table')).find((t) => {
      const cell = t.querySelector('tr');
      return cell && /cards\s*\(\s*featured[\s-]*content/i.test((cell.textContent || ''));
    });
    const featuredSection = featuredTable
      && Array.from(main.children).find((c) => c.nodeType === 1 && c.contains(featuredTable));
    const style = params.sourceFeaturedHasGeoHex ? 'geo-hex' : 'gray-band';
    if (featuredSection) featuredSection.append(createSectionMetadata(document, style));
  }

  // Re-tag PLAIN default-content sections that the source painted with a background band. We
  // captured their text fingerprints pre-cleanup (params.sourceGrayBands / sourceBlueBorders);
  // match each rebuilt top-level section by the leading heading/first-paragraph text and append the
  // matching Section Metadata (`gray-band` = light-gray fill; `blue-border` = blue top/bottom bars).
  const tagSectionsByFingerprint = (fingerprints, styleName) => {
    if (!fingerprints || !fingerprints.length) return;
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    Array.from(main.children).forEach((sec) => {
      if (sec.nodeType !== 1 || sec.tagName !== 'DIV') return;
      if (sec.querySelector('table')) return; // block sections handle their own styling
      if (sec.querySelector('.section-metadata')) return; // already tagged
      const h = sec.querySelector('h1, h2, h3, h4');
      const p = sec.querySelector('p');
      const secFp = norm(h && h.textContent) || norm(p && p.textContent);
      if (secFp && fingerprints.some((fp) => fp && (secFp.startsWith(fp) || fp.startsWith(secFp)))) {
        sec.append(createSectionMetadata(document, styleName));
      }
    });
  };
  if (params) {
    tagSectionsByFingerprint(params.sourceBlueBorders, 'blue-border');
    tagSectionsByFingerprint(params.sourceGrayBands, 'gray-band');
  }

  // Category-grid sections whose SOURCE grid sat inside a `.light-gray-bkgd` band (e.g. refining
  // "A Broad Catalyst Portfolio") get `gray-band` too. These sections DO contain the cards block
  // table (so the fingerprint pass above skipped them) — match by the grid's section heading and
  // tag the section that holds both the heading and a `cards category-grid` table.
  if (params && params.sourceGrayCategoryHeadings && params.sourceGrayCategoryHeadings.length) {
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    const matchesGrayHeading = (fpText) => !!fpText && params.sourceGrayCategoryHeadings.some(
      (fp) => fp && (fpText.startsWith(fp) || fp.startsWith(fpText)),
    );
    const tagGray = (sec) => {
      if (sec && sec.nodeType === 1 && !sec.querySelector('.section-metadata')) {
        sec.append(createSectionMetadata(document, 'gray-band'));
      }
    };
    Array.from(main.children).forEach((sec) => {
      if (sec.nodeType !== 1 || sec.tagName !== 'DIV') return;
      if (sec.querySelector('.section-metadata')) return;
      const catTable = Array.from(sec.querySelectorAll('table')).find((t) => {
        const cell = t.querySelector('tr');
        return cell && /cards\s*\(\s*category[\s-]*grid/i.test((cell.textContent || ''));
      });
      if (!catTable) return;
      const h = sec.querySelector('h1, h2, h3');
      const secFp = norm(h && h.textContent);
      if (matchesGrayHeading(secFp)) { tagGray(sec); return; }
      // SPLIT CASE (e.g. coatings/general-industrial "Versatile Applications"): the grid's own
      // heading + intro were sectionized into the PRECEDING sibling, so this grid section's first
      // heading is a card title ("Wood Coatings"), not the gray heading. If the previous section's
      // heading matches a captured gray heading AND that section has no cards of its own (just the
      // heading+intro), treat them as one band — tag BOTH so the gray fill is continuous.
      // Walk backward past EMPTY separator sections (sectionizeFlatBody can leave a blank <div>
      // between the split-off heading/intro and the grid) to find the real preceding heading section.
      let prev = sec.previousElementSibling;
      while (prev && prev.nodeType === 1
        && !prev.querySelector('h1, h2, h3, table')
        && !(prev.textContent || '').trim()) {
        prev = prev.previousElementSibling;
      }
      const prevH = prev && prev.nodeType === 1 ? prev.querySelector('h1, h2, h3') : null;
      const prevFp = norm(prevH && prevH.textContent);
      if (prev && !prev.querySelector('table, .section-metadata') && matchesGrayHeading(prevFp)) {
        tagGray(prev);
        tagGray(sec);
      }
    });
  }

  // Industries pages only: remove EMPTY top-level <div> sections (e.g. the emptied .col-lg-2 shell
  // left behind after the nav rail was lifted out) — an empty top-level <div> serializes to a blank
  // EDS section. Then collapse resulting adjacent/edge <hr> delimiters. Scoped to industriesNav
  // pages so validated sets (products/newsroom/compliance) keep byte-identical output.
  if (params && params.industriesNav) {
    Array.from(main.children).forEach((c) => {
      if (c.nodeType === 1 && c.tagName === 'DIV'
        && !(c.textContent || '').trim()
        && !c.querySelector('img, picture, table, ul, ol, a, hr')) {
        c.remove();
      }
    });
    Array.from(main.children).forEach((c) => {
      if (c.tagName === 'HR') {
        const prev = c.previousElementSibling;
        if (!prev || prev.tagName === 'HR' || !c.nextElementSibling) c.remove();
      }
    });
  }

  // Breadcrumb for HERO-LESS default pages whose SOURCE showed a breadcrumb. Most default pages get
  // their breadcrumb from the banner-hero (hero.js derives it from the URL). But the about-grace
  // leadership BIO pages have NO hero — just a `columns profile-detail` — yet the source DOES show a
  // breadcrumb (Home / About Grace / Leadership Team). Emit a standalone `breadcrumb` block as the
  // FIRST section; blocks/breadcrumb/breadcrumb.js rebuilds the trail from the URL (dropping the
  // current page), matching source. Gate: source had a breadcrumb, page has NO banner hero, and no
  // hero block was emitted — so we never double up with the hero-derived breadcrumb.
  const emittedHero = !!Array.from(main.querySelectorAll('table tr')).find((tr) => /hero\s*\(/i.test(tr.textContent || ''));
  if (params && params.sourceHadBreadcrumb && !params.sourceHadBannerHero && !emittedHero) {
    // LOCATION DETAIL pages (/about-grace/locations/<city>/) show the CURRENT page as a trailing
    // leaf crumb (source: "Home / About Grace / Locations / Aiken, SC, USA"), UNLIKE the leadership
    // BIO pages which drop the leaf ("Home / About Grace / Leadership Team"). Both emit this
    // hero-less standalone breadcrumb, so pass a `leaf` cell to tell blocks/breadcrumb/breadcrumb.js
    // to KEEP the current page for location details only. The leaf label is the SOURCE breadcrumb's
    // last crumb (e.g. "Aiken, SC, USA"), captured pre-cleanup as params.sourceLastCrumb.
    let bcUrlPath = '';
    try { bcUrlPath = new URL(params.originalURL || url).pathname; } catch (e) { bcUrlPath = ''; }
    const isLocationDetail = /\/about-grace\/locations\/[^/]+\/?$/.test(bcUrlPath.replace(/\.html$/, ''));
    const leafLabel = isLocationDetail ? (params.sourceLastCrumb || document.title || '').trim() : '';
    const crumbCells = leafLabel ? [['leaf'], [leafLabel]] : [['']];
    const crumbBlock = WebImporter.Blocks.createBlock(document, { name: 'Breadcrumb', cells: crumbCells });
    const crumbSection = document.createElement('div');
    crumbSection.append(crumbBlock);
    main.insertBefore(document.createElement('hr'), main.firstChild);
    main.insertBefore(crumbSection, main.firstChild);
  }

  main.appendChild(document.createElement('hr'));
  main.appendChild(buildMetadataBlock(document, pageMeta));

  if (unparsed.length) {
    console.warn(`[master] ${unparsed.length} block type(s) left in place (no parser yet): ${unparsed.join(', ')}`);
  }

  return {
    element: main,
    path: finalizePath(params),
    report: {
      title: document.title,
      pageType: 'default',
      blocks: rendered,
      blocksLeftInPlace: unparsed,
      pageMetadata: pageMeta.map((p) => p[0]),
    },
  };
}

// ===========================================================================
// TRANSFORM ENTRY POINT
// ===========================================================================
export default {
  // onLoad runs IN-PAGE (live DOM) before transform, and the runner awaits it. Two jobs, both
  // fixing grace.com's client-side hydration (the raw HTML is a skeleton; JS builds the real
  // content + applies inline background-images after load — the runner can serialize too early):
  //   1. WAIT for hydration — poll until the main content region has real text (product
  //      category-hub pages were captured EMPTY otherwise). Bounded; non-fatal on timeout.
  //   2. INLINE background-images — grace heroes carry the photo as inline
  //      `style="background-image:url(scene7…)"`, NOT an <img>, so the hero parser missed it and
  //      emitted a plain band. Materialize each such bg-image as a real <img> inside its element
  //      so the existing hero (and other) parsers pick it up.
  onLoad: async ({ document }) => {
    // 1. hydration wait
    const deadline = Date.now() + 12000;
    const bodyReady = () => {
      const el = document.querySelector('main, article, .root.responsivegrid');
      return el && (el.textContent || '').replace(/\s+/g, ' ').trim().length > 400;
    };
    // eslint-disable-next-line no-await-in-loop
    while (!bodyReady() && Date.now() < deadline) { await new Promise((r) => { setTimeout(r, 300); }); }
    // small settle so late inline-style bg-images are applied
    await new Promise((r) => { setTimeout(r, 800); });

    // 1b. Some grace heroes leave a STRAY escaped-HTML text node in the heading wrapper — literally
    // the string "<h1>Title</h1>" as text, ALONGSIDE the real <h1>. Left in place it becomes the
    // hero image's carrier-anchor text (garbage alt like "<h1>TRISYL…</h1>"). Remove any text node
    // whose content looks like escaped HTML tags so only the real elements remain.
    document.querySelectorAll('.hero__heading, .hero__headings, .hero__content-inner').forEach((host) => {
      [...host.childNodes].forEach((n) => {
        if (n.nodeType === 3 && /<\/?[a-z][^>]*>/i.test(n.textContent || '')) n.remove();
      });
    });

    // 2. materialize inline background-images as <img> (hero + any block)
    document.querySelectorAll('[style*="background-image"]').forEach((el) => {
      if (el.querySelector(':scope > img')) return;
      const m = /background-image\s*:\s*url\((['"]?)([^'")]+)\1\)/i.exec(el.getAttribute('style') || '');
      const src = m && m[2];
      if (!src || /gradient/i.test(src)) return;
      const img = document.createElement('img');
      img.src = src;
      // alt: prefer a clean aria-label; else a plain-text page title (strip any stray HTML/escapes
      // some grace heroes carry an escaped "<h1>…</h1>" string — never use that as alt).
      let alt = (el.getAttribute('aria-label') || '').trim();
      if (!alt) {
        alt = (document.title || '').replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();
      }
      img.setAttribute('alt', alt);
      // prepend so it reads as the section's leading image (hero image row)
      el.insertBefore(img, el.firstChild);
    });

    // NOTE: do NOT materialize lazy component images HERE (in-browser onLoad). grace.com's own
    // lazy-load JS is live in this context and rewrites a freshly-inserted <img src="scene7…"> into a
    // runtime `blob:` URL, which is useless once serialized. Materialization happens in transform()
    // instead — on the cleaned, STATIC DOM where no site JS runs — so the Scene7 src is preserved.
    //
    // 3. STASH hydrated image sources for transform(). Some `.cmp-image` components (e.g. the
    // about-grace LOCATION-detail photo) inject their `data-cmp-src`/`data-asset` ONLY via client JS
    // — the static server HTML has an empty `.image` shell. So transform()'s materializeLazyImages
    // (which runs on the static DOM) never sees them and the image is LOST. Here, in the hydrated
    // DOM, copy the resolved Scene7 URL + alt onto STABLE `data-eds-*` attrs that survive cleanup +
    // serialization. We only COPY strings (no live <img> insertion → no blob: rewrite). transform's
    // materializeLazyImages then builds the real <img> from data-eds-src.
    //
    // First WAIT (bounded) for the image components to hydrate their src — the `.cmp-image`
    // shells appear in the DOM before their `data-cmp-src`/`<img>` is populated by grace's JS, and
    // the earlier text-based hydration gate can fire before that. Poll until every in-article
    // `.cmp-image` has a resolvable src (or the deadline hits), so the stash below never runs early.
    const imgDeadline = Date.now() + 6000;
    const imgReady = () => {
      const comps = [...document.querySelectorAll('article .cmp-image, article [data-cmp-is="image"]')]
        .filter((c) => !c.closest('header, footer, nav'));
      if (!comps.length) return true;
      return comps.every((c) => {
        const r = c.hasAttribute('data-cmp-src') ? c : (c.querySelector('[data-cmp-src]') || c);
        if (r.getAttribute('data-cmp-src')) return true;
        const im = r.querySelector('img');
        const cur = im && (im.getAttribute('src') || '');
        return !!(cur && !/^blob:/i.test(cur));
      });
    };
    // eslint-disable-next-line no-await-in-loop
    while (!imgReady() && Date.now() < imgDeadline) { await new Promise((r) => { setTimeout(r, 300); }); }

    document.querySelectorAll('[data-cmp-src], [data-cmp-is="image"], .cmp-image').forEach((el) => {
      const root = el.hasAttribute('data-cmp-src') ? el : (el.querySelector('[data-cmp-src]') || el);
      let src = root.getAttribute('data-cmp-src') || '';
      if (!src) {
        const im = root.querySelector('img');
        const cur = im && (im.getAttribute('src') || '');
        // a hydrated <img> with a real Scene7/DAM src (NOT a blob: placeholder) is also usable
        if (cur && !/^blob:/i.test(cur) && (/\/is\/image\//.test(cur) || cur.includes('/content/dam/'))) src = cur;
      }
      if (!src) {
        const asset = root.getAttribute('data-asset') || '';
        if (asset.startsWith('/content/dam/')) src = `https://grace.com${asset}`;
      }
      if (!src) return;
      // strip AEM responsive width template tokens so it resolves to a real asset.
      src = src.replace(/([?&])wid=(%7B|\{)[^&]*(%7D|\})/i, '$1').replace(/\{\.width\}/g, '').replace(/[?&]$/, '');
      root.setAttribute('data-eds-src', src);
      const alt = (root.getAttribute('data-title') || root.getAttribute('alt')
        || (root.querySelector('img') && root.querySelector('img').getAttribute('alt')) || '').replace(/<[^>]*>/g, '').trim();
      if (alt) root.setAttribute('data-eds-alt', alt);
    });
  },
  transform: (payload) => {
    const { document, url, params } = payload;

    // 0. capture whether the SOURCE page shipped a breadcrumb BEFORE cleanup strips it.
    //    Breadcrumb is ON by default at render time; pages whose source had none get a
    //    `breadcrumb: false` metadata row so the hero banner skips it (matches source per page).
    params.sourceHadBreadcrumb = !!document.querySelector('.cmp-breadcrumb, nav[aria-label*="readcrumb" i]');
    // The reduce-height banner hero is what renders a breadcrumb; capture its presence too
    // (pre-cleanup) so we only emit a breadcrumb-off metadata row on pages that actually show one.
    params.sourceHadBannerHero = !!document.querySelector('.hero__section.hero-reduce-height');
    // Capture the SOURCE breadcrumb's LAST crumb text (pre-cleanup). grace.com industries pages show
    // the URL-derived label as the last crumb (e.g. "Refining Technologies"), which DIFFERS from the
    // hero H1 ("FCC Catalyst and Additive Solutions"). hero.js falls back to og:title/document.title
    // (= the H1) when no breadcrumb-title is authored, producing the wrong crumb — so capture the real
    // last crumb here and emit it as breadcrumb-title for industries pages (below).
    const crumbLis = Array.from(document.querySelectorAll(
      '.cmp-breadcrumb li, nav[aria-label*="readcrumb" i] li',
    ));
    params.sourceLastCrumb = crumbLis.length
      ? (crumbLis[crumbLis.length - 1].textContent || '').replace(/\s+/g, ' ').trim()
      : '';

    // Capture the contact-us sticky widget BEFORE cleanup removes it. beforeTransform's
    // grace-cleanup strips `.contact-us-sticky`, but the default path decides the `contactus`
    // metadata AFTER cleanup — so read presence + tagline here or detection always sees nothing.
    // Use the content-aware check: an EMPTY `.contact-us-sticky` placeholder (hydroprocessing) must
    // NOT count as a widget — otherwise the page gets `contactus: true` + a reserved right rail that
    // shifts its content left with nothing in the rail.
    const cuWidget = contactWidgetEl(document);
    params.sourceHadContactWidget = !!cuWidget;

    // Capture the SOURCE background band around the "Latest Insights" related-articles block BEFORE
    // cleanup. TWO distinct source treatments — must NOT be conflated (per-source parity):
    //   • `.geoAndHex`        → the hexagon band → `geo-hex` Section Metadata (white hex + geo lines)
    //   • `.light-gray-bkgd` only (NO geoAndHex) → PLAIN gray band → `gray-band` Section Metadata
    // Most industries pages use plain `.light-gray-bkgd` (e.g. unipol-pp-process) — those must NOT
    // get hexagons. Only the few with an explicit `.geoAndHex` do.
    const featuredBlogEl = document.querySelector('.featured-blog-cmp');
    // geoAndHex is the hexagon band. It is NOT always an ANCESTOR of the featured-blog — on the
    // about-grace leadership BIO pages it is a zero-height decorative SIBLING element that draws the
    // hex pattern behind the Latest-Insights band via CSS pseudo-elements. So treat "the page has a
    // `.geoAndHex` element AND a featured-blog" as the geo-hex signal (covers both the ancestor case
    // — industries — and the sibling case — bios). A page with a featured-blog in `.light-gray-bkgd`
    // but NO `.geoAndHex` anywhere is the PLAIN-gray case (industries unipol) — stays gray-band.
    const pageHasGeoAndHex = !!document.querySelector('.geoAndHex');
    params.sourceFeaturedHasGeoHex = !!(featuredBlogEl
      && (featuredBlogEl.closest('.geoAndHex') || pageHasGeoAndHex));
    params.sourceFeaturedIsPlainGray = !!(featuredBlogEl
      && !params.sourceFeaturedHasGeoHex
      && featuredBlogEl.closest('.light-gray-bkgd'));

    // Capture PLAIN default-content sections that the source paints with a background band, keyed by
    // a text fingerprint (leading heading or first paragraph) so we can re-tag the matching rebuilt
    // section AFTER sectionizeFlatBody (which discards the source wrapper classes). Two source
    // treatments on industries pages:
    //   • `.light-gray-bkgd` box holding rich text (NOT featured-blog, NOT contact widget) → gray-band
    //   • content bracketed by blue `.divider-line` bars (Grace #004990) → blue-border
    const fingerprint = (host) => {
      const h = host.querySelector('h1, h2, h3, h4');
      if (h && (h.textContent || '').trim()) return (h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const p = host.querySelector('p');
      return p ? (p.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) : '';
    };
    params.sourceGrayBands = [];
    // Category-grid section heading, when the grid sits inside a `.light-gray-bkgd` band (e.g.
    // refining "A Broad Catalyst Portfolio") — its emitted section (H2 + intro + cards) gets gray.
    params.sourceGrayCategoryHeadings = [];
    document.querySelectorAll('.light-gray-bkgd').forEach((el) => {
      if (el.querySelector('.featured-blog-cmp, .contact-us-cmp, .cmp-feature-set, .feature-set')) return;
      const catList = el.querySelector('.cmp-card-list');
      if (catList) {
        // record the category grid's section heading so we can tag its rebuilt section gray.
        const h = el.querySelector('.heading h1, .heading h2, .heading h3, h2, h3');
        const t = h ? (h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) : '';
        if (t) params.sourceGrayCategoryHeadings.push(t);
        return;
      }
      const fp = fingerprint(el);
      if (fp) params.sourceGrayBands.push(fp);
    });
    params.sourceBlueBorders = [];
    // A blue-border block is CONTENT sandwiched between a PAIR of `.divider-line` bars (Grace
    // #004990) — the UNIPOL PCF paragraphs. Bars + content share a `.col-lg-7`, so use DOCUMENT
    // ORDER: take the first & last bar, then capture the fingerprint of the first `.rich-text`/`.text`
    // block that falls BETWEEN them (position bitmask 4 = follows). Robust to the shared-parent shape.
    const bars = Array.from(document.querySelectorAll('.divider-line'));
    if (bars.length >= 2) {
      const first = bars[0];
      const last = bars[bars.length - 1];
      const between = Array.from(document.querySelectorAll('.rich-text, .text')).find((el) => {
        // eslint-disable-next-line no-bitwise
        const afterFirst = (first.compareDocumentPosition(el) & 4) !== 0;
        // eslint-disable-next-line no-bitwise
        const beforeLast = (el.compareDocumentPosition(last) & 4) !== 0;
        return afterFirst && beforeLast && !el.contains(first) && !el.contains(last) && fingerprint(el);
      });
      if (between) {
        const fp = fingerprint(between);
        if (fp) params.sourceBlueBorders.push(fp);
      }
    }
    if (cuWidget) {
      // The tagline is the SUBTITLE ("Talk to our experts…"), held in `.contactus__text` /
      // `.contact-us-subtitle`. Do NOT fall back to a bare heading — the sticky widget's toggle
      // button reads "Contact Us", which is the panel title, not the tagline.
      const t = cuWidget.querySelector(
        '.contactus__content-desktop .contactus__text, .contactus__text, .contact-us-subtitle',
      );
      let tagline = t ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '';
      if (/^contact us$/i.test(tagline)) tagline = '';
      params.contactWidgetTagline = tagline;
    }

    // 1. site-wide chrome cleanup
    executeTransformers('beforeTransform', document.body, payload);

    // 1.5. materialize AEM lazy image components (data-cmp-src / data-asset) into real <img> on the
    //      cleaned DOM — belt-and-suspenders with the onLoad pass (headless lazy images never hydrate,
    //      so body diagrams like the RANEY flowchart otherwise vanish). Runs before dispatch/discovery
    //      so both sectionizeFlatBody and the DM/Scene7 carrier-anchor transformer see the image.
    materializeLazyImages(document);

    // 2. form detection (deferred handling — flag only)
    const hasForm = detectForm(document);

    // 3. dispatch by page type — insights articles FIRST (their col-lg-2 share rail would
    //    otherwise be misread as a compliance section-nav sidebar).
    let result;
    if (isInsightsArticle(document, params.originalURL || url)) {
      result = buildInsightsArticle(document, url, params);
    } else if (isIndustriesDetailPage(document, params.originalURL || url)) {
      // Industries solution/detail pages: rich product-style body + a left section-nav rail.
      // Capture the nav (and remove it from the source) BEFORE the default pipeline runs, then
      // let buildDefaultPage build the body (image hero, order, geo-hex, contactus). It reads
      // params.forceTemplate/industriesNav to emit `template: sidebar` + inject the nav section.
      params.forceTemplate = 'sidebar';
      params.industriesNav = extractAndRemoveSidebarNav(document);
      result = buildDefaultPage(document, url, params);
    } else if (isAboutGraceTextSidebar(document, params.originalURL || url)) {
      // TEXT-ONLY about-grace sidebar page (asbestos-trusts): rebuild main cleanly (hero → nav →
      // content → contact-banner) via buildSidebarPage. buildDefaultPage's in-place flatten can't
      // sectionize a table-less page, so the hero + content merge and the nav drops to the bottom.
      result = buildSidebarPage(document, url, params);
    } else if (isAboutGraceDetailPage(document, params.originalURL || url)) {
      // about-grace section-nav pages (this-is-grace, our-history[/asbestos-trusts], locations
      // landing + all location details, EHS, community, sustainability). Live layout = sidebar
      // (nav-rail left of content), so take the SAME rich pipeline as industries-detail: build the
      // body via buildDefaultPage (image hero via discovery, doc order via sectionizeFlatBody,
      // geo-hex on Latest-Insights) with the nav rail injected + `template: sidebar`. Reuses the
      // already-built columns-image-left/right, columns-history-item, columns-location-detail,
      // cards-location-grid parsers (all originally tuned against these exact pages).
      params.forceTemplate = 'sidebar';
      params.industriesNav = extractAndRemoveSidebarNav(document);
      result = buildDefaultPage(document, url, params);
    } else if (isSidebarPage(document)) {
      result = buildSidebarPage(document, url, params);
    } else {
      result = buildDefaultPage(document, url, params);
    }

    // 4. attach the form flag (bulk runner appends url to forms-register.json when true)
    result.report.hasForm = hasForm;
    return [result];
  },
};
