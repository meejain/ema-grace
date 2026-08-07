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

// MATCHER REGISTRY — non-component blocks whose identity is position / column order /
// heading / table-column-count, not a CSS class. A matcher returns block-root elements.
// Used for coverage discovery; a matched block with no parser is left in place + logged.
const MATCHERS = {
  'columns-image-left': (doc) => rowsByColumnOrder(doc, 'image'),
  'columns-image-right': (doc) => rowsByColumnOrder(doc, 'text'),
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
  'banner-cta': (doc) => Array.from(doc.querySelectorAll('.media-callout, .cmp-media-callout'))
    .filter((mc) => mc.querySelector('h2, h3, .h2, .h3')
      && mc.querySelector('.button a, a.btn-primary, .cta a')
      && !mc.closest('.card-group, .cmp-card-list')
      && mc.querySelectorAll('.text p, .rich-text p, p').length <= 2),
  // quote-cta: a div.quote with a CTA link but NOT a testimonial (.quote-section) or a
  // statistic highlight (.cmp-card.statistic).
  'quote-cta': (doc) => Array.from(doc.querySelectorAll('div.quote'))
    .filter((q) => q.querySelector('a[href]')
      && !q.querySelector('.quote-section')
      && !q.closest('.cmp-card.statistic')
      && !q.querySelector('.cmp-card.statistic')),
  // cards-related-articles: a .cmp-card-list.grid.three-columns whose heading says "Related
  // Articles" (distinguishes from cards-product grids and the Follow-us social card-list).
  'cards-related-articles': (doc) => Array.from(doc.querySelectorAll('.cmp-card-list.grid.three-columns, .card-list .cmp-card-list'))
    .filter((cl) => /related articles/i.test((cl.querySelector('.heading, h3') || cl.previousElementSibling || {}).textContent || '')
      && cl.querySelector('a.cmp-card.bio, a.cmp-card')),
  // social-follow: a .cmp-card-list with a "Follow us" heading + external social icon links.
  'social-follow': (doc) => Array.from(doc.querySelectorAll('.card-list .cmp-card-list, .cmp-card-list'))
    .filter((cl) => /follow us/i.test((cl.querySelector('.heading, h3') || {}).textContent || '')
      && cl.querySelector('a.cmp-card.style-icon, a.cmp-card[href^="http"]')),
  // featured-product-selector: a feature-set carousel whose heading says "Featured Products".
  'featured-product-selector': (doc) => Array.from(doc.querySelectorAll('.feature-set, .cmp-feature-set'))
    .filter((fs) => /featured products/i.test((fs.querySelector('.subhead-large, .heading') || {}).textContent || ''))
    .map((fs) => fs.closest('.feature-set') || fs)
    .filter((v, i, a) => a.indexOf(v) === i),
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
  // Exclude carousels explicitly headed "Featured Products" — those are featured-product-selector.
  'columns-horizontal-teaser-featured': (doc) => featureSetContainers(doc, 'slate-bkgd')
    .filter((fs) => !/featured products/i.test((fs.querySelector('.subhead-large, .heading') || {}).textContent || '')),
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
  'columns-location-detail': (doc) => Array.from(doc.querySelectorAll('section.none-bkgd .row, section .row'))
    .filter((r) => r.querySelector('a.btn-primary[href*="jobs.grace.com"], .button a[href*="jobs.grace.com"]')
      && r.querySelector('.image, picture, img')
      && /\b\d{4,5}\b/.test(r.textContent || '') // ZIP/postal code
      && /(street|road|rd\b|st\b|drive|avenue|ave\b|\+\d|tel[:.]?)/i.test(r.textContent || '')),
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
  // location-grid: .col-lg-4 with image + a "Tel:" address (phone signature), no <h4>/<ul>.
  'cards-location-grid': (doc) => cardGridContainers(doc, '.col-lg-4',
    (c) => hasImageAndText(c) && /tel:/i.test(c.textContent || '') && !c.querySelector('h4, ul'), 3),
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
  'table-data-grid': (doc) => Array.from(doc.querySelectorAll(".rich-text:not(.vertical-border) > table[width='100%']"))
    .filter((t) => { const r = t.querySelector('tr'); return r && r.children.length === 5; }),
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
      return section && section.querySelector('.button__section, button[data-gated-id], a[href$=".pdf"]');
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
  'cards-category-grid': (doc) => Array.from(doc.querySelectorAll('.cmp-card-list'))
    .filter((cl) => !cl.classList.contains('grid') && cl.querySelector('a.cmp-card.small'))
    .map((cl) => cl.querySelector('.card-group')).filter(Boolean),
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
    const cols = Array.from(row.children).filter((c) => /col-lg-6/.test(c.className));
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
    const section = row.closest('section, article');
    const siblingRows = section
      ? Array.from(section.querySelectorAll('.row')).filter((r) => Array.from(r.children)
        .filter((c) => /col-lg-6/.test(c.className)).length === 2)
      : [row];
    if (siblingRows.length > 2) return false; // part of a grid, not a standalone feature row
    return firstKind === 'image' ? imageThenText : textThenImage;
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
  return lca ? [lca] : [];
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
      if (it.classList.contains('tab-img') || it.querySelector('.image img, picture img')) return 'tab-img';
      if (it.classList.contains('slate-bkgd')) return 'slate-bkgd';
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

/** Contact-us sticky widget present (metadata-driven, auto-built by scripts.js). */
function hasContactWidget(document) {
  return !!document.querySelector('.contact-us-sticky, .contact-us__cmp, .contact-us-cmp');
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
          a.setAttribute('href', path || '/');
        }
        return;
      }
      if (href.startsWith('/')) {
        let path = href.replace(/^\/content\/grace\/us\/en/, '').replace(/\.html$/, '');
        if (path.length > 1) path = path.replace(/\/$/, '');
        a.setAttribute('href', path || '/');
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
 *  breadcrumb from the URL and paints the #004990 no-image band. We emit only the H1. */
function buildHeroBlock(document) {
  const h1src = document.querySelector('article h1, .hero h1, h1');
  const title = h1src ? (h1src.textContent || '').trim() : (document.title || '').trim();
  if (!title) return null;
  const h1 = document.createElement('h1');
  h1.textContent = title;
  return WebImporter.Blocks.createBlock(document, { name: 'Hero (banner)', cells: [[h1]] });
}

/** Left section-nav as a leading section: a UL of sibling-page links, tagged with
 *  Section Metadata Style = sidebar-nav so templates/sidebar/sidebar.css pins it to col 1. */
function buildSidebarNav(document) {
  const navAnchors = Array.from(document.querySelectorAll(
    'article [aria-label="Section navigation"] a, article .section-nav a, article .col-lg-2 a',
  ));
  if (!navAnchors.length) return null;

  const seen = new Set();
  const ul = document.createElement('ul');
  navAnchors.forEach((a) => {
    const text = (a.textContent || '').replace(/\s+/g, ' ').trim();
    const href = a.getAttribute('href') || '';
    if (!text || !href) return;
    const norm = href.replace(/^\/content\/grace\/us\/en/, '').replace(/\.html$/, '').replace(/\/$/, '');
    if (seen.has(norm)) return;
    seen.add(norm);
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.setAttribute('href', href);
    link.textContent = text;
    li.append(link);
    ul.append(li);
  });
  if (!ul.children.length) return null;

  const section = document.createElement('div');
  section.append(ul);
  section.append(createSectionMetadata(document, 'sidebar-nav'));
  return section;
}

/** Extract the main content column (.col-lg-7 rich text) as clean default content;
 *  drop empty component shells. Returns an array of content nodes or []. */
function extractMainContent(document) {
  const mainCol = document.querySelector('article .col-lg-7')
    || (document.querySelector('article h2') && document.querySelector('article h2').closest('[class*="col-"]'));
  if (!mainCol) return [];
  const rich = mainCol.querySelector('.rich-text') || mainCol;
  return Array.from(rich.children).filter((el) => {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return false;
    return (el.textContent || '').trim().length > 0 || el.querySelector('img');
  });
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

  // ---- Left rail: breadcrumb + Social (share) block + POSTED/INDUSTRY (dl), tagged sidebar-nav ----
  const railInner = document.createElement('div');
  let railHasContent = false;

  // Breadcrumb (e.g. "Home / Insights") — emitted at the top of the left rail.
  // The block JS derives the WHOLE trail from the current URL path (Home + each
  // ancestor segment, current page dropped), so we do NOT scrape the source
  // crumbs — that avoids capturing stale/localized crumb text and keeps the
  // trail correct on every page. We still emit the block so its section gains
  // the `breadcrumb-container` class the sidebar layout CSS keys off; a single
  // seed cell (a Home link) keeps the block table non-empty through the markdown
  // round-trip. The seed content is ignored at render time — the JS rebuilds it.
  const homeSeed = document.createElement('a');
  homeSeed.href = '/';
  homeSeed.textContent = 'Home';
  const crumbBlock = WebImporter.Blocks.createBlock(document, { name: 'Breadcrumb', cells: [[homeSeed]] });
  railInner.append(crumbBlock);
  railHasContent = true;

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

  // POSTED / INDUSTRY as a Post Meta block — one row per label/value pair. The block
  // JS renders a semantic <dl><dt>LABEL</dt><dd>VALUE</dd> (markdown can't carry a raw
  // <dl>, so a block preserves the definition-list semantics through the round-trip).
  const dl = document.querySelector('article dl');
  if (dl) {
    const rows = [];
    Array.from(dl.querySelectorAll('dt')).forEach((dt) => {
      const dd = dt.nextElementSibling && dt.nextElementSibling.tagName === 'DD' ? dt.nextElementSibling : null;
      const label = (dt.textContent || '').replace(/\s+/g, ' ').trim();
      const val = dd ? (dd.textContent || '').replace(/\s+/g, ' ').trim() : '';
      if (!label) return;
      rows.push([label, val]);
    });
    if (rows.length) {
      const metaBlock = WebImporter.Blocks.createBlock(document, { name: 'Post Meta', cells: rows });
      railInner.append(metaBlock);
      railHasContent = true;
    }
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
      if (el.matches('.card-list')) return; // related articles → discovery (below)

      // In-body "Featured Service" promo: a .feature-set-section with an a.item.slate-bkgd card.
      // Parse it as the columns-horizontal-teaser-featured block (dark card) rather than flatten.
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

/** Discover every catalog block present on the page (selector OR matcher), priority-ordered. */
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

function buildDefaultPage(document, url, params) {
  const main = document.body;
  const { parsedNames: rendered, unparsed } = discoverAndParseBlocks(document, url, params);

  executeTransformers('afterTransform', main, { document, url, params });

  // contactus widget (metadata-driven) can still apply on non-sidebar pages.
  const pageMeta = [];
  if (hasContactWidget(document)) {
    pageMeta.push(['contactus', 'true']);
    const t = document.querySelector('.contact-us-cmp .contact-us-title, .contact-us-cmp h2, .contact-us__cmp .contactus__heading');
    const tagline = t ? (t.textContent || '').replace(/\s+/g, ' ').trim() : '';
    if (tagline) pageMeta.push(['contactus-tagline', tagline]);
  }

  rewriteInternalLinks(main);
  WebImporter.rules.transformBackgroundImages(main, document);
  WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
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
  transform: (payload) => {
    const { document, url, params } = payload;

    // 1. site-wide chrome cleanup
    executeTransformers('beforeTransform', document.body, payload);

    // 2. form detection (deferred handling — flag only)
    const hasForm = detectForm(document);

    // 3. dispatch by page type — insights articles FIRST (their col-lg-2 share rail would
    //    otherwise be misread as a compliance section-nav sidebar).
    let result;
    if (isInsightsArticle(document, params.originalURL || url)) {
      result = buildInsightsArticle(document, url, params);
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
