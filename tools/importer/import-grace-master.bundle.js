/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-grace-master.js
  var import_grace_master_exports = {};
  __export(import_grace_master_exports, {
    default: () => import_grace_master_default
  });

  // tools/importer/catalog-data.js
  var catalog_data_default = {
    "_meta": {
      "purpose": "Master component-library catalog for the block-complete importer. Every block a draft page exists for has a usable source selector (or a named matcher for non-component blocks). Applied in full to EVERY page.",
      "generated": "2026-08-05",
      "fields": {
        "selector": "CSS querySelectorAll target on the SOURCE DOM (verified against live grace.com)",
        "matcher": "name of a JS matcher fn in the importer (block identity is column-order/heading/position, not a class); when present, used instead of/with selector",
        "item": "selector for ONE repeated item within the block (for parsers)",
        "render": "parse = run block parser | seed-from-draft = emit draft block as-is (dynamic/empty-shell) | skip-existing = header/footer/hero-lineage | forms-pass = defer to AEM Forms",
        "family": "base EDS block folder"
      },
      "counts": {
        "skip-existing": 4,
        "parse": 50,
        "seed-from-draft": 8,
        "forms-pass": 5,
        "total": 67,
        "needs_matcher": 16,
        "clean_selector_only": 47
      }
    },
    "blocks": [
      {
        "name": "contact-sticky-demo",
        "family": "custom-widget",
        "render": "skip-existing",
        "selector": null,
        "item": null,
        "note": "demo page; contactus widget synthesized from metadata flag, not a source block",
        "priority": 5
      },
      {
        "name": "footer-standard",
        "family": "footer",
        "render": "skip-existing",
        "selector": null,
        "item": null,
        "note": "footer orchestrator",
        "priority": 5
      },
      {
        "name": "header-mega-menu",
        "family": "header",
        "render": "skip-existing",
        "selector": null,
        "item": null,
        "note": "navigation orchestrator",
        "priority": 5
      },
      {
        "name": "hero-full-width",
        "family": "hero",
        "render": "skip-existing",
        "selector": ".generic-hero .hero__section",
        "item": null,
        "note": "homepage full-width; hero lineage",
        "priority": 5
      },
      {
        "name": "accordion-faq",
        "family": "accordion",
        "render": "parse",
        "selector": "div.accordion-comp",
        "item": ".accordion-comp-list > dl.plus-minus.accordion",
        "note": "flat FAQ",
        "priority": 20
      },
      {
        "name": "accordion-nested",
        "family": "accordion",
        "render": "parse",
        "selector": "div.accordion-comp:has(dd .accordion-comp)",
        "item": ".accordion-comp-list > dl.plus-minus.accordion",
        "note": "nested: dd contains child accordion (recurse)",
        "priority": 20
      },
      {
        "name": "banner-contact-split",
        "family": "banner",
        "render": "parse",
        "selector": ".contact-us-cmp",
        "item": ".row.has-title > .col-lg-6",
        "note": "want-to-talk banner; title + 2 halves",
        "priority": 20
      },
      {
        "name": "banner-resource-download",
        "family": "banner",
        "render": "parse",
        "selector": ".resource-download-comp",
        "item": null,
        "note": "issue+title+desc+gated download",
        "priority": 20
      },
      {
        "name": "cards-icon-grid",
        "family": "cards",
        "render": "parse",
        "selector": "a.cmp-card.generic",
        "item": ".card",
        "note": "icon grid; filter .cmp-card.generic",
        "priority": 20
      },
      {
        "name": "cards-industry",
        "family": "cards",
        "render": "parse",
        "selector": "section.background-image .card-group",
        "item": ".card",
        "note": "industry small cards",
        "priority": 20
      },
      {
        "name": "cards-insight",
        "family": "cards",
        "render": "parse",
        "selector": "section#blogs .media-callout",
        "item": ".media-callout",
        "note": "insight/blog callouts",
        "priority": 20
      },
      {
        "name": "cards-people",
        "family": "cards",
        "render": "parse",
        "selector": ".cmp-image__link",
        "item": null,
        "note": "people columns (homepage)",
        "priority": 20
      },
      {
        "name": "cards-product",
        "family": "cards",
        "render": "parse",
        "selector": ".cmp-card-list.grid.three-columns:has(a.cmp-card.bio) .card-group",
        "item": ".card-group > .card",
        "note": "product grid (bio cards only). MUST require a.cmp-card.bio \u2014 the broad selector also matched the Follow-Us social card-list (a.cmp-card.style-icon), stealing it from social-follow.",
        "priority": 20
      },
      {
        "name": "cards-related-articles",
        "family": "cards",
        "render": "parse",
        "selector": ".cmp-card-list.grid.three-columns .card-group .card",
        "item": "a.cmp-card.bio",
        "note": "related-articles list",
        "priority": 20
      },
      {
        "name": "carousel",
        "family": "carousel",
        "render": "parse",
        "selector": ".carousel .cmp-carousel",
        "item": ".cmp-carousel__item",
        "note": "AEM core carousel; server-rendered",
        "priority": 20
      },
      {
        "name": "columns-app-promo",
        "family": "columns",
        "render": "parse",
        "selector": "div.cmp-media-callout",
        "item": null,
        "note": "right-media callout",
        "priority": 20
      },
      {
        "name": "columns-brochure-promo",
        "family": "columns",
        "render": "parse",
        "selector": "section > article > div.row:has(.cmp-media-callout):has(.col-lg-6 .rich-text)",
        "item": ".col-lg-6",
        "note": "cover img + gated download button",
        "priority": 20
      },
      {
        "name": "columns-history-item",
        "family": "columns",
        "render": "parse",
        "selector": "article .row.section-66-33",
        "item": ".row.section-66-33",
        "note": "year+desc+img; strong discriminator",
        "priority": 20
      },
      {
        "name": "columns-horizontal-teaser",
        "family": "columns",
        "render": "parse",
        "selector": ".feature-set .cmp-feature-set .feature-set-section.list",
        "item": ".content.owl-carousel > a.item",
        "note": "teaser items (href on anchor)",
        "priority": 20
      },
      {
        "name": "columns-horizontal-teaser-featured",
        "family": "columns",
        "render": "parse",
        "selector": "div.feature-set-section.list",
        "item": ".content.owl-carousel > a.item.slate-bkgd",
        "note": "featured = slate-bkgd, no img",
        "priority": 20
      },
      {
        "name": "columns-image-teaser",
        "family": "columns",
        "render": "parse",
        "selector": "div.cmp-feature-set[data-size]",
        "item": ".content.owl-carousel > a.item.tab-img",
        "note": "image-teaser = tab-img + img",
        "priority": 20
      },
      {
        "name": "columns-location-detail",
        "family": "columns",
        "render": "parse",
        "selector": "section.none-bkgd .row:has(.text):has(.button):has(.image)",
        "item": null,
        "note": "address+jobs CTA+image",
        "priority": 20
      },
      {
        "name": "columns-people",
        "family": "columns",
        "render": "parse",
        "selector": ".cmp-image__link",
        "item": ".col-lg-6",
        "note": "people 2-col",
        "priority": 20
      },
      {
        "name": "columns-profile-detail",
        "family": "columns",
        "render": "parse",
        "selector": "article .row:has(> .col-lg-4 .media-callout):has(> .col-lg-8 .text)",
        "item": null,
        "note": "single profile row",
        "priority": 20
      },
      {
        "name": "custom-widget-contact-panel",
        "family": "custom-widget",
        "render": "parse",
        "selector": ".contact-us-sticky .contact-us__cmp",
        "item": null,
        "note": "sticky contact panel; dedupe mobile/desktop",
        "priority": 20
      },
      {
        "name": "custom-widget-news-archive",
        "family": "custom-widget",
        "render": "parse",
        "selector": ".accordion .accordion-comp:has(.media-callout)",
        "item": "dl.plus-minus.accordion",
        "note": "per-year accordion w/ media-callouts",
        "priority": 20
      },
      {
        "name": "embed-video",
        "family": "embed-video",
        "render": "parse",
        "selector": ".cmp-media-callout.slate-bkgd .media-video",
        "item": null,
        "note": "youtube embed",
        "priority": 20
      },
      {
        "name": "featured-product-selector",
        "family": "featured",
        "render": "parse",
        "selector": ".cmp-feature-set[data-size]",
        "item": ".content.owl-carousel > a.item",
        "priority": 20,
        "note": "Featured Products carousel; server-rendered, data-size = item count"
      },
      {
        "name": "hero-banner",
        "family": "hero",
        "render": "parse",
        "selector": ".hero__section",
        "item": null,
        "note": "homepage hero",
        "priority": 20
      },
      {
        "name": "hero-campaign",
        "family": "hero",
        "render": "parse",
        "selector": ".generic-hero .hero__section",
        "item": null,
        "note": "campaign immersive",
        "priority": 20
      },
      {
        "name": "hero-event",
        "family": "hero",
        "render": "parse",
        "selector": ".generic-hero .hero__section",
        "item": null,
        "note": "event band #004990",
        "priority": 20
      },
      {
        "name": "hero-product",
        "family": "hero",
        "render": "parse",
        "selector": ".generic-hero .hero__section",
        "item": null,
        "note": "product hero + subhead",
        "priority": 20
      },
      {
        "name": "map-embedded",
        "family": "map-embedded",
        "render": "parse",
        "selector": ".embed-code .mapouter",
        "item": "iframe#gmap_canvas",
        "note": "google maps iframe; strip junk backlinks",
        "priority": 20
      },
      {
        "name": "quote-highlight",
        "family": "quote",
        "render": "parse",
        "selector": ".card-item .cmp-card.statistic",
        "item": null,
        "note": "big stat number + caption",
        "priority": 20
      },
      {
        "name": "quote-testimonial",
        "family": "quote",
        "render": "parse",
        "selector": "div.quote .quote-section",
        "item": null,
        "note": "quote-text + citation",
        "priority": 20
      },
      {
        "name": "social-follow",
        "family": "social",
        "render": "parse",
        "selector": ".card-list .cmp-card-list.grid.three-columns:has(.cmp-card.style-icon)",
        "item": "a.cmp-card.style-icon",
        "note": "Follow us icon card-list",
        "priority": 20
      },
      {
        "name": "social-share",
        "family": "social",
        "render": "parse",
        "selector": ".social-share-container",
        "item": ".share-container > a.social-link",
        "note": "SHARE icons; hrefs runtime",
        "priority": 20
      },
      {
        "name": "table-product-comparison",
        "family": "table",
        "render": "parse",
        "selector": "div.rich-text.vertical-border table",
        "item": "tbody > tr",
        "note": "real table w/ rowspan; flatten",
        "priority": 20
      },
      {
        "name": "banner-cta",
        "family": "banner",
        "render": "seed-from-draft",
        "selector": ".media-callout",
        "item": null,
        "note": "empty shell server-side; seed from draft",
        "priority": 40
      },
      {
        "name": "cards-featured-content",
        "family": "cards",
        "render": "seed-from-draft",
        "selector": ".featured-blog-cmp",
        "item": null,
        "note": "data-blogs JSON; seed from draft, wire later",
        "priority": 40
      },
      {
        "name": "custom-widget-document-viewer",
        "family": "custom-widget",
        "render": "seed-from-draft",
        "selector": ".embed-code a.fbo-embed",
        "item": null,
        "note": "FlippingBook; seed from draft",
        "priority": 40
      },
      {
        "name": "custom-widget-search-filter",
        "family": "custom-widget",
        "render": "seed-from-draft",
        "selector": ".blog-list-cmp",
        "item": null,
        "note": "data-bloglist JSON; seed from draft",
        "priority": 40
      },
      {
        "name": "custom-widget-search-results",
        "family": "custom-widget",
        "render": "seed-from-draft",
        "selector": ".search-results__container",
        "item": null,
        "note": "client-side search API; seed from draft",
        "priority": 40
      },
      {
        "name": "pagination-numbered",
        "family": "pagination-numbered",
        "render": "seed-from-draft",
        "selector": ".pagination#pagenation",
        "item": null,
        "note": "JS-generated numbers; seed from draft",
        "priority": 40
      },
      {
        "name": "quote-cta",
        "family": "quote",
        "render": "seed-from-draft",
        "selector": "div.quote",
        "item": null,
        "note": "empty shell server-side; seed from draft",
        "priority": 40
      },
      {
        "name": "video-overlay",
        "family": "video",
        "render": "seed-from-draft",
        "selector": ".media-video",
        "item": null,
        "note": "homepage video; seed from draft",
        "priority": 40
      },
      {
        "name": "cards-category-grid",
        "family": "cards",
        "render": "parse",
        "selector": ".cmp-card-list .card-group",
        "item": ".card-group > .card",
        "matcher": "cardsCategoryGrid",
        "note": "bare card-list (no grid modifier); disambiguate by .small variant + preceding H2 Industries",
        "priority": 60
      },
      {
        "name": "columns-checklist",
        "family": "columns",
        "render": "parse",
        "matcher": "columnsChecklist",
        "selector": "section > article > div.row.section-66-33",
        "item": "[class*=col-lg-]",
        "note": "quote + checklist richtext; match by .quote + h4/ul",
        "priority": 60
      },
      {
        "name": "table-data-grid",
        "family": "table",
        "render": "parse",
        "matcher": "tableDataGrid",
        "selector": "div.rich-text > table[width='100%']",
        "item": "tbody > tr",
        "note": "5-col, no vertical-border, multiple tables",
        "priority": 60
      },
      {
        "name": "table-link-list",
        "family": "table",
        "render": "parse",
        "matcher": "tableLinkList",
        "selector": "div.rich-text.vertical-border > table",
        "item": "tbody > tr",
        "note": "1-col + vertical-border",
        "priority": 60
      },
      {
        "name": "table-three-column",
        "family": "table",
        "render": "parse",
        "matcher": "tableThreeColumn",
        "selector": "div.rich-text.vertical-border > table",
        "item": "tbody > tr",
        "note": "3-col + vertical-border",
        "priority": 60
      },
      {
        "name": "table-two-column-content",
        "family": "table",
        "render": "parse",
        "matcher": "tableTwoColumnContent",
        "selector": "div.rich-text.split-list",
        "item": "ul > li",
        "note": "split-list ul + separate gated CTAs; merge",
        "priority": 60
      },
      {
        "name": "video-grid",
        "family": "video",
        "render": "parse",
        "selector": ".media-video",
        "item": null,
        "matcher": "videoGrid",
        "note": "multiple video stills grid; refine on ausbildung",
        "priority": 60
      },
      {
        "name": "cards-benefits-grid",
        "family": "cards",
        "render": "parse",
        "matcher": "cardsBenefitsGrid",
        "selector": null,
        "item": ".col-lg-6",
        "note": "image+text col-lg-6 in light-gray section",
        "priority": 80
      },
      {
        "name": "cards-contact-options",
        "family": "cards",
        "render": "parse",
        "matcher": "cardsContactOptions",
        "selector": null,
        "item": ".col-lg-4",
        "note": "svg-icon+text col-lg-4; anchor to How can we help H2",
        "priority": 80
      },
      {
        "name": "cards-image-text-grid",
        "family": "cards",
        "render": "parse",
        "matcher": "cardsImageTextGrid",
        "selector": null,
        "item": ".row > .col-lg-6",
        "note": "image+text pairs in .row; scope by section, no card class",
        "priority": 80
      },
      {
        "name": "cards-location-grid",
        "family": "cards",
        "render": "parse",
        "matcher": "cardsLocationGrid",
        "selector": null,
        "item": ".row > .col-lg-4",
        "note": "image+embed+text col-lg-4; grouped by region H2",
        "priority": 80
      },
      {
        "name": "cards-profile-grid",
        "family": "cards",
        "render": "parse",
        "matcher": "cardsProfileGrid",
        "selector": null,
        "item": ".row > .col-lg-6",
        "note": "media-callout+text+button; scope white-bkgd grid",
        "priority": 80
      },
      {
        "name": "cards-solution-grid",
        "family": "cards",
        "render": "parse",
        "matcher": "cardsSolutionGrid",
        "selector": null,
        "item": null,
        "note": "stacked centered-h2 rich-text; sequence-based",
        "priority": 80
      },
      {
        "name": "columns-image-left",
        "family": "columns",
        "render": "parse",
        "matcher": "columnsImageLeft",
        "selector": null,
        "item": ".col-lg-6",
        "note": "2-col row, IMAGE column first (order-based)",
        "priority": 80
      },
      {
        "name": "columns-image-right",
        "family": "columns",
        "render": "parse",
        "matcher": "columnsImageRight",
        "selector": null,
        "item": ".col-lg-6",
        "note": "2-col row, TEXT column first (order-based)",
        "priority": 80
      },
      {
        "name": "table-contact-matrix",
        "family": "table",
        "render": "parse",
        "matcher": "tableContactMatrix",
        "selector": null,
        "item": "div.row",
        "note": "stacked .row col-lg-6 pairs; reconstruct, not a <table>",
        "priority": 80
      },
      {
        "name": "form-contact-simple",
        "family": "form",
        "render": "forms-pass",
        "selector": "form, .cmp-form, .mktoForm",
        "item": null,
        "note": "Adaptive Form path",
        "priority": 95
      },
      {
        "name": "form-lead-generation",
        "family": "form",
        "render": "forms-pass",
        "selector": "form, .cmp-form, .mktoForm",
        "item": null,
        "note": "Adaptive Form path",
        "priority": 95
      },
      {
        "name": "form-modal-download",
        "family": "form",
        "render": "forms-pass",
        "selector": "form, .cmp-form, .mktoForm",
        "item": null,
        "note": "gated modal form",
        "priority": 95
      },
      {
        "name": "form-multi-step",
        "family": "form",
        "render": "forms-pass",
        "selector": "form, .cmp-form, .mktoForm",
        "item": null,
        "note": "multi-step",
        "priority": 95
      },
      {
        "name": "form-newsletter-signup",
        "family": "form",
        "render": "forms-pass",
        "selector": "form, .cmp-form, .mktoForm",
        "item": null,
        "note": "newsletter",
        "priority": 95
      }
    ]
  };

  // tools/importer/draft-seeds.js
  var draft_seeds_default = {
    "cards-featured-content": '<div class="cards featured-content"> <div> <div><picture><img src="/media-da/drafts/cards-featured-content/media-1dc3e783b0b7139d5c154297a3868d405fc21b223-4bab6325-a6a900ee-b3ab3872-22299656-baea9620-faa3ebb3.jpg" alt="Unlock premium film performance with ActivCat\xAE 104 catalyst"></picture></div> <div><strong>PLASTICS AND POLYMERS</strong> <a href="/insights/unlock-premium-film-performance-with-activcat-104-catalyst">Unlock premium film performance with ActivCat\xAE 104 catalyst</a> <strong><a href="/insights/unlock-premium-film-performance-with-activcat-104-catalyst">Read more &gt;</a></strong></div> </div> <div> <div><picture><img src="/media-da/drafts/cards-featured-content/media-105549bd60da604c138fe77220684c9d109487349-9c6265e6-fab48f99-e99ad92b-06d218f9-2b2fc94a-ac4ad25e.jpg" alt="Reflections from techX 2025: Advancing UNIPOL\xAE Polypropylene Process Technology"></picture></div> <div><strong>PLASTICS AND POLYMERS</strong> <a href="/insights">Reflections from techX 2025: Advancing UNIPOL\xAE Polypropylene Process Technology</a> <strong><a href="/insights">Read more &gt;</a></strong></div> </div> <div> <div><picture><img src="/media-da/drafts/cards-featured-content/media-16313fb15c68e67394fafc0577a0180c881850e47-56501989-370532ec-1d3c82c2-fdc08b31-11ba8729-fb48c7ae.jpg" alt="Insights from the 2025 ACI Future of Chemical Recycling Conference"></picture></div> <div><strong>PLASTICS AND POLYMERS</strong> <a href="/insights/insights-from-the-2025-aci-future-of-chemical-recycling-conference">Insights from the 2025 ACI Future of Chemical Recycling Conference</a> <strong><a href="/insights/insights-from-the-2025-aci-future-of-chemical-recycling-conference">Read more &gt;</a></strong></div> </div> <div> <div><picture><img src="/media-da/drafts/cards-featured-content/media-10ac0906d8b35c9c472f065a56c2f3409f12cc78a-21be5c36-74cd0f34-622edcff-ef1737ec-8a2bcb49-648bc481.jpg" alt="Unlock Peak Performance and Efficiency in UNIPOL\xAE Polypropylene Process Technology using CONSISTA\xAE Catalysts"></picture></div> <div><strong>PLASTICS AND POLYMERS</strong> <a href="/insights">Unlock Peak Performance and Efficiency in UNIPOL\xAE Polypropylene Process Technology using CONSISTA\xAE Catalysts</a> <strong><a href="/insights">Read more &gt;</a></strong></div> </div> </div>',
    "custom-widget-search-filter": '<div class="custom-widget search-filter"> <div> <div>Search our insights</div> </div> <div> <div> <ul> <li>All</li> <li>Our Culture</li> <li>Refining</li> <li>Chemical Processing</li> <li>Plastics and Polymers</li> <li>Coatings</li> <li>General Industrial</li> <li>Pharmaceutical Solutions</li> <li>Nutraceutical Solutions</li> <li>Food and Beverage</li> <li>Biofuels</li> </ul> </div> </div> </div>',
    "custom-widget-search-results": '<div class="custom-widget search-results"> <div> <div>Search Hero</div> <div></div> </div> <div> <div>Results: 13</div> </div> <div> <div>Refine Results by:</div> <div> <ul> <li>Product (8)</li> <li>Corporate (1)</li> <li>Refining (2)</li> <li>Chemical Processing (2)</li> <li>Plastics and Polymers (2)</li> <li>Coatings (2)</li> <li>General Industrial (2)</li> <li>Pharmaceutical Solutions (2)</li> <li>Nutraceutical Solutions (0)</li> <li>Agriculture (0)</li> <li>Personal Care (2)</li> <li>Food &amp; Beverage (3)</li> <li><strong>Biofuels (13)</strong></li> </ul> </div> </div> <div> <div>Showing 1-13 of 13</div> </div> <div> <div>Pagination</div> <div>1</div> </div> <div> <div><a href="/insights/the-trisyl-silica-advantage-for-renewable-feedstock-pretreatment">The TRISYL\xAE Silica Advantage for Renewable Feedstock Pretreatment</a></div> <div>Maximizing productivity, sustainability and safety for renewable feedstock pretreatment with TRISYL\xAE silica from Grace.</div> </div> <div> <div><a href="/insights/a-better-way-to-dehydrate-ethanol">A Better Way to Dehydrate Ethanol</a></div> <div>SYLOBEAD\xAE molecular sieve technology translates to cost savings in ethanol production</div> </div> <div> <div><a href="/insights/cleaner-greener-biofuel">Cleaner Greener Biofuel</a></div> <div>Cutting waste and improving efficiency with TRISYL\xAE silica adsorbent</div> </div> <div> <div><a href="/industries/biofuels/biodiesel">Biodiesel</a></div> <div>In biodiesel and renewable diesel feedstock pre-treatment, TRISYL\xAE silica helps to reduce the content of phospholipids, trace metals, and soaps from feedstock oils and fats below the required catalyst(s) specifications</div> </div> <div> <div><a href="/insights/feedstock-pre-treatment-for-renewable-diesel">Feedstock Pre-treatment for Renewable Diesel</a></div> <div>Our silica adsorbents refine a variety of feedstock sources at a fraction of the dosage and reduce solid waste disposal by up to 85%. Learn more.</div> </div> <div> <div><a href="/industries/biofuels/biomass-based-diesel">Biomass-based Diesel</a></div> <div>In biodiesel and renewable diesel feedstock pre-treatment, TRISYL\xAE silica helps to reduce the content of phospholipids, animal proteins, trace metals, and their associated metal soaps from feedstock oils and fats below the required catalyst(s) specifications.</div> </div> <div> <div><a href="/industries/biofuels/biomass-based-diesel/first-generation-biodiesel">First Generation Biodiesel</a></div> <div>From pre-treatment to final polishing, TRISYL\xAE silica helps clean biodiesel feedstock while substantially reducing the need for water washing post-treatment.</div> </div> <div> <div><a href="/industries/biofuels/biomass-based-diesel/renewable-diesel">Renewable Diesel</a></div> <div>Learn how Grace\u2019s TRISYL\xAE silica helps maximize service life of catalysts, reduces costs on spent solids and disposal, and reduces oil lost during pre-treatment.</div> </div> <div> <div><a href="/industries/biofuels/bioethanol">Bioethanol</a></div> <div>In bioethanol dehydration, SYLOBEAD\xAE molecular sieves dry ethanol that is produced from edible feedstock, cellulosic feedstocks, and synthetically produced ethanol.</div> </div> <div> <div><a href="/products/trisyl-silica">TRISYL\xAE Silica</a></div> <div>Grace\u2019s synthetic amorphous silica technology is used to refine edible oil and biofuel feedstock by removing polar and ionic impurities while minimizing environmental footprint. Learn more.</div> </div> <div> <div><a href="/industries/biofuels">Biofuels</a></div> <div>Grace offers several products designed to help overcome biomass conversion and renewable technology challenges to make biorefining simpler, more efficient and sustainable.</div> </div> <div> <div><a href="/insights">Insights</a></div> <div>Get the latest news and insights from Grace</div> </div> <div> <div><a href="/industries">Industries</a></div> <div>Through our R&amp;D and in partnership with our customers, we develop, manufacture, license, and support technologies in catalysts, silica-based materials, and more.</div> </div> </div>',
    "custom-widget-document-viewer": '<div class="custom-widget document-viewer"> <div> <div>ratio</div> <div>3:2</div> </div> <div> <div><a href="https://online.flippingbook.com/view/960887719/">Grace-The-Essential-Articles-Vol-1 WEB</a></div> </div> </div>',
    "pagination-numbered": '<div class="pagination-numbered"> <div> <div>Pages</div> <div>11</div> </div> <div> <div>Current</div> <div>1</div> </div> </div>'
  };

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(":scope > img") || element.querySelector("img");
    const heading = element.querySelector(".hero__heading h1") || element.querySelector("h1") || element.querySelector("h2");
    const ctaLink = element.querySelector(".hero__button a.btn-primary") || element.querySelector(".hero__button a") || element.querySelector(".button__section a");
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (ctaLink) {
      const link = document.createElement("a");
      link.href = ctaLink.href;
      link.textContent = ctaLink.textContent.trim();
      contentCell.push(link);
    }
    cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document, { name: "Hero-Banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse2(element, { document }) {
    let cards;
    if (element.classList.contains("cmp-card") && element.classList.contains("bio")) {
      const parentRow = element.closest(".row") || element.closest("article") || element.parentElement;
      cards = Array.from(parentRow.querySelectorAll(".cmp-card.bio"));
    } else {
      cards = Array.from(element.querySelectorAll(".cmp-card.bio"));
    }
    if (!cards.length) {
      cards = Array.from(element.querySelectorAll(".cmp-card"));
    }
    const cells = [];
    cards.forEach((card) => {
      var _a;
      const img = card.querySelector(".image img") || card.querySelector(".card-content img") || card.querySelector("img");
      const title = card.querySelector(".title") || card.querySelector(".h4") || card.querySelector("h3, h4");
      const descEl = card.querySelector(".spt-copy p") || card.querySelector(".spt-copy") || card.querySelector(".content p:not(.h4):not(.h5)");
      const href = card.href || ((_a = card.closest("a")) == null ? void 0 : _a.href) || "";
      const contentCell = [];
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title.textContent.trim();
        contentCell.push(h3);
      }
      if (descEl) {
        const p = document.createElement("p");
        p.textContent = descEl.textContent.trim();
        contentCell.push(p);
      }
      if (href) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = title ? title.textContent.trim() : "Learn more";
        contentCell.push(link);
      }
      const imageCell = img ? [img] : [];
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (product)", cells });
    const groupContainer = element.closest(".row") || element.closest("article") || element.parentElement;
    (groupContainer || element).replaceWith(block);
  }

  // tools/importer/parsers/cards-industry.js
  function parse3(element, { document }) {
    let cards = Array.from(element.querySelectorAll(".cmp-card.small"));
    if (!cards.length) {
      cards = Array.from(element.querySelectorAll(".card .cmp-card"));
    }
    if (!cards.length) {
      cards = Array.from(element.querySelectorAll(".cmp-card"));
    }
    const cells = [];
    cards.forEach((card) => {
      var _a;
      const img = card.querySelector(".image img") || card.querySelector(".card-content img") || card.querySelector("img");
      const ctaDiv = card.querySelector(".cta.btn-track") || card.querySelector(".cta") || card.querySelector(".content");
      const titleText = ctaDiv ? ctaDiv.textContent.trim() : "";
      const href = card.href || ((_a = card.closest("a")) == null ? void 0 : _a.href) || "";
      const contentCell = [];
      if (href && titleText) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = titleText;
        contentCell.push(link);
      } else if (titleText) {
        const p = document.createElement("p");
        p.textContent = titleText;
        contentCell.push(p);
      }
      const imageCell = img ? [img] : [];
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (industry)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insight.js
  function parse4(element, { document }) {
    let mediaCallouts;
    let groupScope = null;
    if (element.classList.contains("media-callout") || element.classList.contains("cmp-media-callout")) {
      groupScope = element.closest("section#blogs") || element.closest("#blogs") || element.closest("section");
      mediaCallouts = groupScope ? Array.from(groupScope.querySelectorAll(".media-callout")) : [element];
      if (!mediaCallouts.length) mediaCallouts = [element];
    } else {
      groupScope = element;
      mediaCallouts = Array.from(element.querySelectorAll(".media-callout, .cmp-media-callout"));
    }
    const cells = [];
    mediaCallouts.forEach((callout) => {
      const img = callout.querySelector(".media-image .img img") || callout.querySelector(".media-image img") || callout.querySelector(".img img") || callout.querySelector("img");
      const categoryEl = callout.querySelector(".subhead-small h5") || callout.querySelector("h5");
      const category = categoryEl ? categoryEl.textContent.trim() : "";
      const titleLink = callout.querySelector(".subhead-small p a") || callout.querySelector(".subhead-small a");
      const titleText = titleLink ? titleLink.textContent.trim() : "";
      const titleHref = titleLink ? titleLink.href : "";
      const readMoreLinks = Array.from(callout.querySelectorAll(".subhead-small p a"));
      const readMoreLink = readMoreLinks.length > 1 ? readMoreLinks[readMoreLinks.length - 1] : null;
      const readMoreHref = readMoreLink ? readMoreLink.href : titleHref;
      const contentCell = [];
      if (category) {
        const catP = document.createElement("p");
        catP.textContent = category;
        contentCell.push(catP);
      }
      if (titleText) {
        const titleP = document.createElement("p");
        const titleA = document.createElement("a");
        titleA.href = titleHref || readMoreHref;
        titleA.textContent = titleText;
        titleP.appendChild(titleA);
        contentCell.push(titleP);
      }
      if (readMoreHref) {
        const rmP = document.createElement("p");
        const rmA = document.createElement("a");
        rmA.href = readMoreHref;
        rmA.textContent = "Read more >";
        rmP.appendChild(rmA);
        contentCell.push(rmP);
      }
      const imageCell = img ? [img] : [];
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (insight)", cells });
    let groupContainer = null;
    if (mediaCallouts.length > 1) {
      let ancestor = element.parentElement;
      while (ancestor && ancestor.tagName !== "BODY") {
        if (ancestor.querySelectorAll(".media-callout").length >= mediaCallouts.length) {
          groupContainer = ancestor;
          break;
        }
        ancestor = ancestor.parentElement;
      }
    }
    (groupContainer || groupScope || element).replaceWith(block);
  }

  // tools/importer/parsers/columns-people.js
  function parse5(element, { document }) {
    let container = element;
    if (element.classList.contains("cmp-image__link") || element.tagName === "A" || element.tagName === "IMG") {
      let ancestor = element.parentElement;
      while (ancestor && ancestor.tagName !== "BODY") {
        if (ancestor.querySelectorAll(".col-lg-6").length >= 2) break;
        ancestor = ancestor.parentElement;
      }
      container = ancestor || element.closest(".row") || element.closest("section") || element.parentElement;
    }
    let columns = Array.from(container.querySelectorAll(":scope > .col-lg-6"));
    if (!columns.length) {
      columns = Array.from(container.querySelectorAll(".col-lg-6"));
    }
    const row = [];
    columns.forEach((col) => {
      const cellContent2 = [];
      const img = col.querySelector(".cmp-image__image") || col.querySelector(".cmp-image img") || col.querySelector("img");
      if (img) {
        cellContent2.push(img.cloneNode(true));
      }
      const textEl = col.querySelector(".rich-text p") || col.querySelector(".rich-text") || col.querySelector(".text p");
      if (textEl) {
        const p = document.createElement("p");
        p.innerHTML = textEl.innerHTML;
        cellContent2.push(p);
      }
      const ctaLink = col.querySelector(".btn-primary") || col.querySelector(".button__section a") || col.querySelector(".button a");
      if (ctaLink) {
        const link = document.createElement("a");
        link.href = ctaLink.href;
        link.textContent = ctaLink.textContent.trim();
        cellContent2.push(link);
      }
      row.push(cellContent2.filter(Boolean));
    });
    const cleanRow = row.filter((c) => c.length > 0);
    if (!cleanRow.length) {
      return;
    }
    const cells = [cleanRow];
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns-People", cells });
    (container && container !== element ? container : element).replaceWith(block);
  }

  // tools/importer/parsers/embed-video.js
  function parse6(element, { document }) {
    const posterImg = element.querySelector(".media-video .img img") || element.querySelector(".img img") || element.querySelector("img");
    const iframe = element.querySelector('.media-modal iframe[src*="youtube"]') || element.querySelector('iframe[src*="youtube"]') || element.querySelector("iframe[title]");
    let videoUrl = "";
    if (iframe) {
      const src = iframe.src || iframe.getAttribute("src") || "";
      const videoIdMatch = src.match(/\/embed\/([a-zA-Z0-9_-]+)/);
      if (videoIdMatch) {
        videoUrl = `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
      } else {
        videoUrl = src.startsWith("//") ? `https:${src}` : src;
      }
    }
    const cells = [];
    if (posterImg) {
      cells.push([posterImg]);
    }
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.textContent = videoUrl;
      cells.push([link]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Embed-Video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/_table-utils.js
  function isEmptyNode(node) {
    if (node.nodeType === 3) return !node.textContent.trim();
    if (node.nodeType !== 1) return true;
    const el = node;
    if (el.querySelector("img, a, ul, ol, br")) return false;
    return !(el.textContent || "").trim();
  }
  function stripZeroWidth(node) {
    if (node.nodeType === 3) {
      node.nodeValue = node.nodeValue.replace(/[​‌‍﻿]/g, "");
      return;
    }
    if (node.nodeType !== 1) return;
    node.childNodes.forEach(stripZeroWidth);
  }
  function cellContent(td, document) {
    const out = [];
    Array.from(td.childNodes).forEach((n) => {
      if (isEmptyNode(n)) return;
      const clone = n.cloneNode(true);
      stripZeroWidth(clone);
      out.push(clone);
    });
    if (!out.length) {
      const text = (td.textContent || "").replace(/[​‌‍﻿]/g, "").trim();
      if (text) out.push(document.createTextNode(text));
    }
    return out;
  }
  function extractTableCells(tableEl, document) {
    const trs = Array.from(tableEl.querySelectorAll("tr"));
    const grid = [];
    const pending = [];
    trs.forEach((tr, rowIdx) => {
      const rowCells = [];
      let col = 0;
      const placeCarried = () => {
        while (pending[col] && pending[col].rowsLeft > 0) {
          rowCells[col] = pending[col].nodes.map((n) => n.cloneNode(true));
          pending[col].rowsLeft -= 1;
          if (pending[col].rowsLeft === 0) pending[col] = null;
          col += 1;
        }
      };
      placeCarried();
      Array.from(tr.children).forEach((td) => {
        if (!/^(TD|TH)$/.test(td.tagName)) return;
        placeCarried();
        const nodes = cellContent(td, document);
        const colspan = parseInt(td.getAttribute("colspan") || "1", 10) || 1;
        const rowspan = parseInt(td.getAttribute("rowspan") || "1", 10) || 1;
        for (let c = 0; c < colspan; c += 1) {
          rowCells[col] = nodes.map((n) => n.cloneNode(true));
          if (rowspan > 1) pending[col] = { nodes, rowsLeft: rowspan - 1 };
          col += 1;
          if (c < colspan - 1) placeCarried();
        }
      });
      placeCarried();
      for (let i = 0; i < rowCells.length; i += 1) if (!rowCells[i]) rowCells[i] = [];
      if (rowCells.some((cell) => cell.length)) grid.push(rowCells);
    });
    return grid;
  }
  function parseRealTables(element, document, blockName) {
    const tables = element.matches && element.matches("table") ? [element] : Array.from(element.querySelectorAll("table"));
    if (!tables.length) return;
    tables.forEach((table) => {
      const cells = extractTableCells(table, document);
      if (!cells.length) return;
      const block = WebImporter.Blocks.createBlock(document, { name: blockName, cells });
      table.replaceWith(block);
    });
  }

  // tools/importer/parsers/table-product-comparison.js
  function parse7(element, { document }) {
    parseRealTables(element, document, "Table (product-comparison)");
  }

  // tools/importer/parsers/table-three-column.js
  function parse8(element, { document }) {
    parseRealTables(element, document, "Table (three-column)");
  }

  // tools/importer/parsers/table-link-list.js
  function parse9(element, { document }) {
    parseRealTables(element, document, "Table (link-list)");
  }

  // tools/importer/parsers/table-data-grid.js
  function parse10(element, { document }) {
    parseRealTables(element, document, "Table (data-grid)");
  }

  // tools/importer/parsers/table-two-column-content.js
  function parse11(element, { document }) {
    const list = element.querySelector("ul, ol");
    if (!list) return;
    const items = Array.from(list.children).filter((li) => li.tagName === "LI");
    if (!items.length) return;
    const mid = Math.ceil(items.length / 2);
    const makeList = (slice) => {
      const el = document.createElement(list.tagName.toLowerCase());
      slice.forEach((li) => el.append(li.cloneNode(true)));
      return el;
    };
    const leftCell = [makeList(items.slice(0, mid))];
    const rightCell = mid < items.length ? [makeList(items.slice(mid))] : [];
    const cells = [[leftCell, rightCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "Table (two-column-content)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-contact-matrix.js
  function parse12(element, { document }) {
    const rows = Array.from(element.querySelectorAll(".row")).filter((row) => {
      if (row.classList.contains("section-75-25")) return false;
      const cols = Array.from(row.children).filter((c) => /col-lg-6/.test(c.className));
      return cols.length === 2;
    });
    if (!rows.length) return;
    const clean = (node) => {
      node.querySelectorAll("*").forEach((el) => {
        el.childNodes.forEach((n) => {
          if (n.nodeType === 3) n.nodeValue = n.nodeValue.replace(/[​‌‍﻿]/g, "");
        });
      });
      return node;
    };
    const cellFrom = (col) => {
      const parts = Array.from(col.children).filter((el) => (el.textContent || "").trim());
      return (parts.length ? parts : [col]).map((el) => {
        if (el.tagName === "H3") {
          const p = document.createElement("p");
          p.textContent = (el.textContent || "").trim();
          return p;
        }
        return clean(el.cloneNode(true));
      });
    };
    const cells = rows.map((row) => {
      const cols = Array.from(row.children).filter((c) => /col-lg-6/.test(c.className));
      return cols.map(cellFrom);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Table (contact-matrix)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon-grid.js
  function parse13(element, { document }) {
    const cards = Array.from(element.querySelectorAll("a.cmp-card.generic, .cmp-card.generic"));
    if (!cards.length) return;
    const cells = cards.map((card) => {
      const img = card.querySelector(".image picture, .image img, picture, img");
      const imageCell = img ? [img.cloneNode(true)] : [];
      const content = [];
      let titleText = "";
      const titleEl = card.querySelector(".h4.title, .h4, .title");
      if (titleEl) titleText = titleEl.textContent.trim();
      const paras = Array.from(card.querySelectorAll("p")).filter((p) => p.textContent.trim() && !/^promotion$/i.test(p.textContent.trim()));
      if (!titleText && paras.length) titleText = paras.shift().textContent.trim();
      if (titleText) {
        const h = document.createElement("h3");
        h.textContent = titleText;
        content.push(h);
      }
      const body = card.querySelector(".spt-copy, .copy");
      if (body && body.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = body.textContent.trim();
        content.push(p);
      } else {
        paras.forEach((p) => {
          if (p.textContent.trim() !== titleText) {
            const np = document.createElement("p");
            np.textContent = p.textContent.trim();
            content.push(np);
          }
        });
      }
      return [imageCell, content];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (icon-grid)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category-grid.js
  function parse14(element, { document }) {
    const cards = Array.from(element.querySelectorAll("a.cmp-card.small, a.cmp-card"));
    if (!cards.length) return;
    const cells = cards.map((card) => {
      const img = card.querySelector(".image picture, .image img, picture, img");
      const imageCell = img ? [img.cloneNode(true)] : [];
      const labelEl = card.querySelector(".cta.btn-track, .cta, .content");
      const label = labelEl ? labelEl.textContent.trim() : (card.getAttribute("aria-label") || "").trim();
      const href = card.getAttribute("href") || "";
      const content = [];
      if (label) {
        const h = document.createElement("h3");
        h.textContent = label;
        content.push(h);
      }
      if (href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = "Learn more";
        p.append(a);
        content.push(p);
      }
      return [imageCell, content];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (category-grid)", cells });
    const host = element.closest(".cmp-card-list") || element;
    host.replaceWith(block);
  }

  // tools/importer/parsers/_cards-utils.js
  function imageOf(item) {
    return item.querySelector(".image picture, .cmp-image picture, picture") || item.querySelector(".image img, .cmp-image img, img") || null;
  }
  function contentFrom(item, document) {
    const textbox = item.querySelector(".text, .rich-text");
    const scope = textbox || item;
    const out = [];
    Array.from(scope.children).forEach((el) => {
      if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return;
      if (el.matches(".image, .cmp-image, picture") || el.querySelector("picture, img") === el) return;
      if (el.tagName === "IMG" || el.querySelector(":scope > picture")) return;
      if (!(el.textContent || "").trim() && !el.querySelector("a")) return;
      out.push(el.cloneNode(true));
    });
    if (!out.length) {
      scope.querySelectorAll("h1,h2,h3,h4,h5,h6,p,ul,ol,a").forEach((el) => {
        if ((el.textContent || "").trim()) out.push(el.cloneNode(true));
      });
    }
    return out;
  }
  function buildCardsFromColumns(container, document, blockName, itemSelector, accept) {
    const items = Array.from(container.querySelectorAll(itemSelector)).filter((it) => {
      if (accept && !accept(it)) return false;
      return imageOf(it) || (it.textContent || "").trim();
    });
    if (!items.length) return null;
    const cells = items.map((item) => {
      const img = imageOf(item);
      const imageCell = img ? [img.cloneNode(true)] : [];
      const contentCell = contentFrom(item, document);
      return [imageCell, contentCell];
    });
    return WebImporter.Blocks.createBlock(document, { name: blockName, cells });
  }
  function emitCards(container, block) {
    if (block) container.replaceWith(block);
  }

  // tools/importer/parsers/cards-benefits-grid.js
  var isBenefit = (c) => !!c.querySelector("h3") && !c.querySelector(".media-callout, a");
  function parse15(element, { document }) {
    const block = buildCardsFromColumns(element, document, "Cards (benefits-grid)", ".col-lg-6", isBenefit);
    emitCards(element, block);
  }

  // tools/importer/parsers/cards-image-text-grid.js
  var isImageText = (c) => !c.querySelector("h3, h4, a, .media-callout");
  function parse16(element, { document }) {
    const block = buildCardsFromColumns(element, document, "Cards (image-text-grid)", ".col-lg-6", isImageText);
    emitCards(element, block);
  }

  // tools/importer/parsers/cards-location-grid.js
  var isLocation = (c) => /tel:/i.test(c.textContent || "") && !c.querySelector("h4, ul");
  function parse17(element, { document }) {
    const block = buildCardsFromColumns(element, document, "Cards (location-grid)", ".col-lg-4", isLocation);
    emitCards(element, block);
  }

  // tools/importer/parsers/cards-contact-options.js
  var isContactOption = (c) => !!c.querySelector("h4") && !!c.querySelector("ul");
  function parse18(element, { document }) {
    const block = buildCardsFromColumns(element, document, "Cards (contact-options)", ".col-lg-4", isContactOption);
    emitCards(element, block);
  }

  // tools/importer/parsers/cards-profile-grid.js
  var isProfile = (c) => c.querySelector(".media-callout") && c.querySelector("h3");
  function parse19(element, { document }) {
    const block = buildCardsFromColumns(element, document, "Cards (profile-grid)", ".col-lg-6", isProfile);
    emitCards(element, block);
  }

  // tools/importer/parsers/cards-solution-grid.js
  function parse20(element, { document }) {
    const container = element.closest("article, section") || element.parentElement;
    if (!container || container.dataset.cardsSolutionGridDone) return;
    container.dataset.cardsSolutionGridDone = "1";
    const sections = Array.from(container.querySelectorAll(".col-lg-12 .text .rich-text, .col-lg-12 .rich-text")).filter((rt) => rt.querySelector(":scope > h2") && rt.querySelector(":scope > p"));
    if (sections.length < 2) return;
    const cells = sections.map((rt) => {
      const cell = [];
      const h2 = rt.querySelector(":scope > h2");
      if (h2) {
        const h = document.createElement("h3");
        h.textContent = h2.textContent.trim();
        cell.push(h);
      }
      rt.querySelectorAll(":scope > p").forEach((p) => {
        if (p.textContent.trim()) cell.push(p.cloneNode(true));
      });
      return [cell];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (solution-grid)", cells });
    sections.forEach((rt, i) => {
      const host = rt.closest(".col-lg-12") || rt;
      if (i === 0) host.replaceWith(block);
      else host.remove();
    });
  }

  // tools/importer/parsers/_columns-utils.js
  function cellNodes(col) {
    const out = [];
    const pushClone = (el) => {
      if (el) out.push(el.cloneNode(true));
    };
    const img = col.querySelector(".image picture, .cmp-image picture, picture, .image img, img");
    const textbox = col.querySelector(".text, .rich-text");
    const scope = textbox || col;
    const textEls = Array.from(scope.children).filter((el) => {
      if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return false;
      if (el.matches(".image, .cmp-image, picture") || el.tagName === "IMG") return false;
      return (el.textContent || "").trim() || el.querySelector("a, img");
    });
    if (img && !textEls.length) return [img.cloneNode(true)];
    if (img && col.contains(img) && scope.contains(img)) pushClone(img);
    if (textEls.length) {
      textEls.forEach(pushClone);
    } else {
      scope.querySelectorAll("h1,h2,h3,h4,h5,h6,p,ul,ol,a").forEach((el) => {
        if ((el.textContent || "").trim()) pushClone(el);
      });
    }
    return out.length ? out : [scope.cloneNode(true)];
  }
  function buildTwoColumn(row, document, blockName) {
    const cols = Array.from(row.children).filter((c) => /col-(lg|xs|md|sm)-/.test(c.className));
    if (cols.length < 2) return null;
    const cellsRow = cols.slice(0, 2).map((c) => cellNodes(c));
    if (!cellsRow.some((c) => c.length)) return null;
    return WebImporter.Blocks.createBlock(document, { name: blockName, cells: [cellsRow] });
  }

  // tools/importer/parsers/columns-image-left.js
  function parse21(element, { document }) {
    const block = buildTwoColumn(element, document, "Columns (image-left)");
    if (block) element.replaceWith(block);
  }

  // tools/importer/parsers/columns-image-right.js
  function parse22(element, { document }) {
    const block = buildTwoColumn(element, document, "Columns (image-right)");
    if (block) element.replaceWith(block);
  }

  // tools/importer/parsers/columns-history-item.js
  function parse23(element, { document }) {
    const block = buildTwoColumn(element, document, "Columns (history-item)");
    if (block) element.replaceWith(block);
  }

  // tools/importer/parsers/columns-profile-detail.js
  function parse24(element, { document }) {
    const block = buildTwoColumn(element, document, "Columns (profile-detail)");
    if (block) element.replaceWith(block);
  }

  // tools/importer/parsers/columns-location-detail.js
  function parse25(element, { document }) {
    const block = buildTwoColumn(element, document, "Columns (location-detail)");
    if (block) element.replaceWith(block);
  }

  // tools/importer/parsers/columns-app-promo.js
  function parse26(element, { document }) {
    const row = element.querySelector(":scope > .row, .row") || element;
    const block = buildTwoColumn(row, document, "Columns (app-promo)");
    if (block) element.replaceWith(block);
  }

  // tools/importer/parsers/columns-brochure-promo.js
  function parse27(element, { document }) {
    const block = buildTwoColumn(element, document, "Columns (brochure-promo)");
    if (block) element.replaceWith(block);
  }

  // tools/importer/parsers/columns-checklist.js
  function parse28(element, { document }) {
    const block = buildTwoColumn(element, document, "Columns (checklist)");
    if (block) element.replaceWith(block);
  }

  // tools/importer/parsers/columns-horizontal-teaser.js
  function parse29(element, { document }) {
    const items = Array.from(element.querySelectorAll("a.item")).filter((it) => !it.classList.contains("slate-bkgd") && !it.classList.contains("tab-img") && !it.querySelector(".image img, picture img"));
    if (!items.length) return;
    const cells = items.map((item) => {
      const titleEl = item.querySelector(".image p.h4, p.h4, .h4, .title");
      const bodyEl = item.querySelector(".spt-copy");
      const href = item.getAttribute("href") || "";
      const c1 = [];
      if (titleEl && titleEl.textContent.trim()) {
        const h = document.createElement("h3");
        h.textContent = titleEl.textContent.trim();
        c1.push(h);
      }
      const c2 = [];
      if (bodyEl) bodyEl.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) c2.push(p.cloneNode(true));
      });
      if (href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = "Learn More";
        p.append(a);
        c2.push(p);
      }
      return [c1, c2];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns (horizontal-teaser)", cells });
    const host = element.closest(".feature-set") || element;
    host.replaceWith(block);
  }

  // tools/importer/parsers/columns-horizontal-teaser-featured.js
  function parse30(element, { document }) {
    const items = Array.from(element.querySelectorAll("a.item.slate-bkgd"));
    if (!items.length) return;
    const cells = items.map((item) => {
      const titleEl = item.querySelector(".image p.h4, p.h4, .h4, .title");
      const bodyEl = item.querySelector(".spt-copy");
      const href = item.getAttribute("href") || "";
      const c1 = [];
      if (titleEl && titleEl.textContent.trim()) {
        const h = document.createElement("h3");
        h.textContent = titleEl.textContent.trim();
        c1.push(h);
      }
      const c2 = [];
      if (bodyEl) bodyEl.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) c2.push(p.cloneNode(true));
      });
      if (href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = "Learn More";
        p.append(a);
        c2.push(p);
      }
      return [c1, c2];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns (horizontal-teaser-featured)", cells });
    const host = element.closest(".feature-set") || element;
    host.replaceWith(block);
  }

  // tools/importer/parsers/columns-image-teaser.js
  function parse31(element, { document }) {
    const items = Array.from(element.querySelectorAll("a.item")).filter((it) => it.classList.contains("tab-img") || it.querySelector(".image img, picture img"));
    if (!items.length) return;
    const cells = items.map((item) => {
      const img = item.querySelector(".image picture, .image img, picture, img");
      const c1 = img ? [img.cloneNode(true)] : [];
      const titleEl = item.querySelector("p.h4, .h4, h4, .title");
      const bodyEl = item.querySelector(".spt-copy");
      const href = item.getAttribute("href") || "";
      const c2 = [];
      if (titleEl && titleEl.textContent.trim()) {
        const h = document.createElement("h3");
        h.textContent = titleEl.textContent.trim();
        c2.push(h);
      }
      if (bodyEl) bodyEl.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) c2.push(p.cloneNode(true));
      });
      if (href) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = "Learn More";
        p.append(a);
        c2.push(p);
      }
      return [c1, c2];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns (image-teaser)", cells });
    const host = element.closest(".feature-set") || element;
    host.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function qa(dl, document) {
    const q = dl.querySelector("dt .h6, dt button, dt");
    const a = dl.querySelector("dd .rich-text, dd .text, dd");
    const qCell = [];
    if (q && q.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = q.textContent.trim();
      qCell.push(p);
    }
    const aCell = [];
    if (a) {
      const nested = a.querySelector(".accordion-comp");
      if (nested) {
        aCell.push(a.cloneNode(true));
      } else Array.from(a.children).forEach((el) => {
        if (el.textContent.trim()) aCell.push(el.cloneNode(true));
      });
      if (!aCell.length && a.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = a.textContent.trim();
        aCell.push(p);
      }
    }
    return [qCell, aCell];
  }
  function parse32(element, { document }) {
    const dls = Array.from(element.querySelectorAll("dl.accordion, .accordion-comp-list > dl, dl"));
    if (!dls.length) return;
    const cells = dls.map((dl) => qa(dl, document));
    const block = WebImporter.Blocks.createBlock(document, { name: "Accordion (faq)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-nested.js
  function answerCell(dd, document) {
    const cell = [];
    const nested = dd.querySelector(".accordion-comp");
    Array.from((dd.querySelector(".rich-text, .text") || dd).children).forEach((el) => {
      if (el.classList && el.classList.contains("accordion-comp")) return;
      if (el.textContent.trim()) cell.push(el.cloneNode(true));
    });
    if (nested) {
      nested.querySelectorAll("dl").forEach((dl) => {
        const q = dl.querySelector("dt .h6, dt button, dt");
        const a = dl.querySelector("dd .rich-text, dd .text, dd");
        if (q && q.textContent.trim()) {
          const p = document.createElement("p");
          const s = document.createElement("strong");
          s.textContent = q.textContent.trim();
          p.append(s);
          cell.push(p);
        }
        if (a && a.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = a.textContent.trim();
          cell.push(p);
        }
      });
    }
    if (!cell.length && dd.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = dd.textContent.trim();
      cell.push(p);
    }
    return cell;
  }
  function parse33(element, { document }) {
    const list = element.querySelector(":scope > .accordion-comp-list") || element;
    const dls = Array.from(list.children).filter((el) => el.tagName === "DL").concat(Array.from(list.querySelectorAll(":scope > dl")));
    const outer = dls.length ? dls : Array.from(element.querySelectorAll("dl"));
    if (!outer.length) return;
    const cells = outer.map((dl) => {
      const q = dl.querySelector("dt .h6, dt button, dt");
      const dd = dl.querySelector("dd");
      const qCell = [];
      if (q && q.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = q.textContent.trim();
        qCell.push(p);
      }
      return [qCell, dd ? answerCell(dd, document) : []];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Accordion (nested)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-highlight.js
  function parse34(element, { document }) {
    const numberEl = element.querySelector(".h4.title, .h4, .title, .statistic-number");
    const captionEl = element.querySelector(".h6.spt-copy, .spt-copy, .h6, .caption");
    const number = numberEl ? numberEl.textContent.trim() : "";
    const caption = captionEl && !/^promotion$/i.test(captionEl.textContent.trim()) ? captionEl.textContent.trim() : "";
    if (!number && !caption) return;
    const cells = [];
    if (number) cells.push([number]);
    if (caption) cells.push([caption]);
    const block = WebImporter.Blocks.createBlock(document, { name: "Quote (highlight)", cells });
    const host = element.closest(".card-item") || element;
    host.replaceWith(block);
  }

  // tools/importer/parsers/quote-testimonial.js
  function parse35(element, { document }) {
    const scope = element.querySelector(".quote-section") || element;
    const quoteEl = scope.querySelector(".quote-text, .quote-container p, blockquote, p");
    const authorEl = scope.querySelector(".citation .author, .author");
    const posEl = scope.querySelector(".citation .position, .position");
    const quote = quoteEl ? quoteEl.textContent.trim() : "";
    if (!quote) return;
    const cells = [[quote]];
    if (authorEl && authorEl.textContent.trim()) cells.push([authorEl.textContent.trim()]);
    if (posEl && posEl.textContent.trim()) cells.push([posEl.textContent.trim()]);
    const block = WebImporter.Blocks.createBlock(document, { name: "Quote (testimonial)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/banner-resource-download.js
  function parse36(element, { document }) {
    const img = element.querySelector(".image picture, .image img, picture, img");
    const c1 = img ? [img.cloneNode(true)] : [];
    const c2 = [];
    const issue = element.querySelector(".h5");
    if (issue && issue.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = issue.textContent.trim();
      c2.push(p);
    }
    const title = element.querySelector(".h2, h2, .title");
    if (title && title.textContent.trim()) {
      const h = document.createElement("h2");
      h.textContent = title.textContent.trim();
      c2.push(h);
    }
    element.querySelectorAll(".subhead-large p, .content p, .text p").forEach((p) => {
      if (p.textContent.trim()) c2.push(p.cloneNode(true));
    });
    const cta = element.querySelector("a[href], button[data-gated-id]");
    if (cta) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = cta.getAttribute("href") || "#";
      a.textContent = (cta.textContent || "Download").trim();
      p.append(a);
      c2.push(p);
    }
    if (!c1.length && !c2.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "Banner (resource-download)", cells: [[c1, c2]] });
    const host = element.closest(".cmp-experiencefragment--resource-download") || element;
    host.replaceWith(block);
  }

  // tools/importer/parsers/social-share.js
  function parse37(element, { document }) {
    const links = Array.from(element.querySelectorAll("a.social-link, .share-button, [data-channel]"));
    const channels = links.map((a) => (a.getAttribute("data-channel") || a.getAttribute("aria-label") || a.textContent || "").trim()).filter(Boolean);
    const uniq = [...new Set(channels.map((c) => c.replace(/^./, (m) => m.toUpperCase())))];
    const text = uniq.length ? uniq.join(", ") : "Facebook, X, LinkedIn, Email, Print";
    const block = WebImporter.Blocks.createBlock(document, { name: "Social (share)", cells: [[text]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/social-follow.js
  function parse38(element, { document }) {
    const headingEl = element.querySelector(".heading h3, .heading, h3");
    const heading = headingEl ? headingEl.textContent.trim() : "Follow us";
    const cards = Array.from(element.querySelectorAll("a.cmp-card.style-icon, a.cmp-card[href], .card a[href]"));
    if (!cards.length) return;
    const cells = [[heading]];
    cards.forEach((card) => {
      const href = card.getAttribute("href") || "";
      const icon = card.querySelector('i.fa, i[class*="fa-"], .icon i, .icon');
      let network = "";
      if (icon) network = (String(icon.className).match(/fa-([a-z-]+)/) || [])[1] || "";
      if (!network && href) {
        try {
          network = new URL(href).hostname.replace(/^www\.|\.com$/g, "").split(".")[0];
        } catch (e) {
          network = "";
        }
      }
      const titleEl = card.querySelector(".h4.title, .title, .h4");
      const title = titleEl ? (titleEl.textContent || "").replace(/\s+/g, " ").trim() : "";
      const ctaEl = card.querySelector(".cta, .link-text, .button");
      let cta = ctaEl ? (ctaEl.textContent || "").replace(/\s+/g, " ").trim() : "";
      if (!cta) cta = /youtu/i.test(network) ? "Subscribe" : "Follow us";
      const linkEl = document.createElement("a");
      linkEl.href = href;
      linkEl.textContent = href;
      cells.push([network || title || "link", [linkEl], cta]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Social (follow)", cells });
    const host = element.closest(".card-list") || element;
    host.replaceWith(block);
  }

  // tools/importer/parsers/carousel.js
  function parse39(element, { document }) {
    const items = Array.from(element.querySelectorAll(".cmp-carousel__item, .carousel-item, .item"));
    if (!items.length) return;
    const cells = items.map((item) => {
      const img = item.querySelector("picture, img");
      const c1 = img ? [img.cloneNode(true)] : [];
      const c2 = [];
      const eyebrow = item.querySelector(".eyebrow, .h6, .category");
      if (eyebrow && eyebrow.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = eyebrow.textContent.trim();
        c2.push(p);
      }
      const title = item.querySelector("h1, h2, h3, .h2, .title");
      if (title && title.textContent.trim()) {
        const h = document.createElement("h3");
        h.textContent = title.textContent.trim();
        c2.push(h);
      }
      item.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim() && p !== eyebrow) c2.push(p.cloneNode(true));
      });
      const link = item.querySelector("a[href]");
      if (link) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.getAttribute("href") || "#";
        a.textContent = (link.textContent || "Read more").trim();
        p.append(a);
        c2.push(p);
      }
      return [c1, c2];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/map-embedded.js
  function parse40(element, { document }) {
    const iframe = element.querySelector('iframe[src*="google.com/maps"], iframe[src*="maps.google"], iframe[src*="output=embed"]');
    const src = iframe ? iframe.getAttribute("src") : "";
    const cells = [];
    if (src && /^https?:/i.test(src)) {
      const a = document.createElement("a");
      a.href = src;
      a.textContent = src;
      cells.push([[a]]);
    } else {
      const article = element.closest("article, .row, section") || element.parentElement;
      const addressCol = article ? Array.from(article.querySelectorAll('.rich-text, .text, [class*="col-"]')).find((c) => /address/i.test(c.textContent || "") && !c.querySelector("iframe")) : null;
      const nodes = [];
      if (addressCol) {
        Array.from(addressCol.children).forEach((el) => {
          if (el.querySelector && el.querySelector("iframe")) return;
          if ((el.textContent || "").trim()) nodes.push(el.cloneNode(true));
        });
      }
      if (!nodes.length) return;
      cells.push([nodes]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Map Embedded", cells });
    const host = element.closest(".embed-code") || element;
    host.replaceWith(block);
  }

  // tools/importer/parsers/featured-product-selector.js
  function parse41(element, { document }) {
    const headingEl = element.querySelector(".subhead-large, .heading");
    const heading = headingEl ? headingEl.textContent.trim() : "Featured Products";
    const seen = /* @__PURE__ */ new Set();
    const items = Array.from(element.querySelectorAll(".content a.item, a.item")).filter((it) => {
      const href = it.getAttribute("href") || it.textContent.trim();
      if (seen.has(href)) return false;
      seen.add(href);
      return true;
    });
    if (!items.length) return;
    const cells = [[heading]];
    items.forEach((item) => {
      const title = (item.querySelector(".image p.h4, p.h4, .h4, .title") || {}).textContent || "";
      const bodyEl = item.querySelector(".spt-copy");
      const href = item.getAttribute("href") || "";
      const bodyNodes = [];
      if (bodyEl) bodyEl.querySelectorAll("p").forEach((p) => {
        if (p.textContent.trim()) bodyNodes.push(p.cloneNode(true));
      });
      const linkNodes = [];
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = "Learn More";
        linkNodes.push(a);
      }
      cells.push([title.trim(), bodyNodes, linkNodes]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Featured (product-selector)", cells });
    const host = element.closest(".feature-set") || element;
    host.replaceWith(block);
  }

  // tools/importer/parsers/custom-widget-contact-panel.js
  function parse42(element, { document }) {
    const panel = element.querySelector(".contact-us__cmp, .contactus__content-desktop, .contactus__content") || element;
    const heading = (panel.querySelector(".contactus__heading, h2, h3, h4") || {}).textContent || "Contact Us";
    const tagline = (panel.querySelector(".contactus__text, p") || {}).textContent || "";
    const cells = [[heading.trim()]];
    if (tagline.trim()) cells.push([tagline.trim()]);
    const seen = /* @__PURE__ */ new Set();
    panel.querySelectorAll('.button__section a, a.btn-primary, a[href*="/forms/"]').forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (!href || seen.has(href)) return;
      seen.add(href);
      const link = document.createElement("a");
      link.href = href;
      link.textContent = (a.textContent || "").replace(/\s+/g, " ").trim();
      cells.push([[link]]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Custom Widget (contact-panel)", cells });
    const host = element.closest(".contact-us-sticky") || element;
    host.replaceWith(block);
  }

  // tools/importer/parsers/custom-widget-news-archive.js
  function parse43(element, { document }) {
    const dls = Array.from(element.querySelectorAll("dl.accordion, .accordion-comp-list > dl, dl"));
    if (!dls.length) return;
    const cells = dls.map((dl) => {
      const year = (dl.querySelector("dt .h6, dt button, dt") || {}).textContent || "";
      const dd = dl.querySelector("dd");
      const content = [];
      if (dd) {
        dd.querySelectorAll(".media-callout, .col-lg-6, .col-lg-4").forEach((cb) => {
          const img = cb.querySelector("picture, img");
          if (img) content.push(img.cloneNode(true));
          const link = cb.querySelector("a[href]");
          if (link) {
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = link.getAttribute("href") || "#";
            a.textContent = (link.textContent || "Download").replace(/\s+/g, " ").trim();
            p.append(a);
            content.push(p);
          }
        });
        if (!content.length) {
          dd.querySelectorAll("picture,img,a[href]").forEach((n) => content.push(n.cloneNode(true)));
        }
      }
      return [[(year || "").trim()], content];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Custom Widget (news-archive)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/banner-cta.js
  function parse44(element, { document }) {
    const title = element.querySelector("h2, h3, .h2, .h3, .subhead-large");
    const paras = Array.from(element.querySelectorAll(".text p, .rich-text p, p")).filter((p) => p.textContent.trim());
    const cta = element.querySelector(".button a, a.btn-primary, .cta a, a[href]");
    if (!title && !paras.length) return;
    const titleCell = [];
    if (title && title.textContent.trim()) {
      const h = document.createElement("h2");
      h.textContent = title.textContent.trim();
      titleCell.push(h);
    }
    const bodyCell = [];
    paras.slice(0, 2).forEach((p) => {
      if (!cta || !p.contains(cta)) bodyCell.push(p.cloneNode(true));
    });
    if (cta) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = cta.getAttribute("href") || "#";
      a.textContent = (cta.textContent || "Learn more").trim();
      p.append(a);
      bodyCell.push(p);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Banner (cta)", cells: [[titleCell], [bodyCell]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-cta.js
  function parse45(element, { document }) {
    if (element.querySelector(".quote-section")) return;
    const paras = Array.from(element.querySelectorAll("p")).filter((p) => p.textContent.trim());
    if (!paras.length) return;
    const cta = element.querySelector("a[href]");
    const statementCell = [];
    paras.forEach((p) => {
      if (!cta || !p.contains(cta)) statementCell.push(p.cloneNode(true));
    });
    const cells = [[statementCell]];
    if (cta) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = cta.getAttribute("href") || "#";
      a.textContent = (cta.textContent || "Learn more").trim();
      p.append(a);
      cells.push([[p]]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Quote (cta)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-overlay.js
  function parse46(element, { document }) {
    const img = element.querySelector("picture, img");
    const link = element.querySelector("a[href], [data-video-url]");
    const href = link ? link.getAttribute("href") || link.getAttribute("data-video-url") || "" : "";
    if (!img && !href) return;
    const imageCell = img ? [img.cloneNode(true)] : [];
    const linkCell = [];
    if (href) {
      const a = document.createElement("a");
      a.href = href;
      a.textContent = href;
      linkCell.push(a);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Video (overlay)", cells: [[imageCell, linkCell]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/banner-contact-split.js
  function parse47(element, { document }) {
    const titleEl = element.querySelector(".contact-us-title, h2");
    const title = titleEl ? (titleEl.textContent || "").replace(/\s+/g, " ").trim() : "Want to talk to an expert?";
    const cols = Array.from(element.querySelectorAll('.row.has-title > [class*="col-lg-6"], .row.has-title > [class*="col-"]'));
    const halfCells = cols.map((col) => {
      const cell = [];
      const h3 = col.querySelector("h3");
      if (h3) {
        const h = document.createElement("h3");
        h.textContent = (h3.textContent || "").trim();
        cell.push(h);
      }
      const cta = col.querySelector(".button__section a, a.btn-primary, a[href]");
      if (cta) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = cta.getAttribute("href") || "#";
        a.textContent = (cta.textContent || "").replace(/\s+/g, " ").trim();
        p.append(a);
        cell.push(p);
      }
      const introP = Array.from(col.querySelectorAll(".rich-text p")).find((p) => (p.textContent || "").trim());
      if (introP) {
        const p = document.createElement("p");
        p.innerHTML = introP.innerHTML;
        cell.push(p);
      }
      const list = col.querySelector("ul, ol");
      if (list) cell.push(list.cloneNode(true));
      return cell;
    }).filter((c) => c.length);
    if (!halfCells.length) return;
    const block = WebImporter.Blocks.createBlock(document, { name: "Banner (contact-split)", cells: [[title], halfCells] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-related-articles.js
  function parse48(element, { document }) {
    const container = element.classList && element.classList.contains("cmp-card-list") ? element : element.closest(".cmp-card-list") || element;
    const cards = Array.from(container.querySelectorAll("a.cmp-card.bio, .card a.cmp-card, a.cmp-card"));
    if (!cards.length) return;
    const cells = cards.map((card) => {
      const img = card.querySelector(".image picture, .image img, picture, img");
      const imageCell = img ? [img.cloneNode(true)] : [];
      const content = [];
      const titleEl = card.querySelector(".h4.title, .h4, .title");
      const title = titleEl ? (titleEl.textContent || "").replace(/\s+/g, " ").trim() : "";
      const href = card.getAttribute("href") || (card.closest("a") || {}).href || "";
      if (title) {
        const s = document.createElement("strong");
        s.textContent = title;
        content.push(s);
      }
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = "Read more";
        content.push(a);
      }
      return [imageCell, content];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (product, cta)", cells });
    const host = container.closest(".card-list") || container;
    host.replaceWith(block);
  }

  // tools/importer/parsers/video-grid.js
  function parse49(element, { document }) {
    const vids = Array.from(element.querySelectorAll(".media-video"));
    if (vids.length < 2) return;
    const cells = vids.map((v) => {
      const img = v.querySelector("picture, img");
      const link = v.querySelector("a[href], [data-video-url]");
      const href = link ? link.getAttribute("href") || link.getAttribute("data-video-url") || "" : "";
      const capEl = v.querySelector(".caption, .h4, .title, figcaption") || (v.querySelector(".media-caption") || {});
      const imgCell = img ? [img.cloneNode(true)] : [];
      const linkCell = [];
      if (href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = href;
        linkCell.push(a);
      }
      const caption = (capEl.textContent || (img ? img.getAttribute("alt") : "") || "").trim();
      return caption ? [imgCell, linkCell, [document.createTextNode(caption)]] : [imgCell, linkCell];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Video (grid)", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-featured-content.js
  function parse50(element, { document }) {
    const cmp = element.classList && element.classList.contains("featured-blog-cmp") ? element : element.closest(".featured-blog-cmp") || element;
    const items = Array.from(cmp.querySelectorAll(".featured-blog-list .item, a.item, .item"));
    if (!items.length) return;
    const cells = items.map((item) => {
      var _a, _b;
      let img = item.querySelector(".image img, picture img, img");
      const imageCell = [];
      if (img) {
        imageCell.push(img.cloneNode(true));
      } else {
        const imgDiv = item.querySelector('.image[style*="background-image"]');
        const m = imgDiv && (imgDiv.getAttribute("style") || "").match(/url\((['"]?)(.*?)\1\)/);
        if (m && m[2]) {
          const el = document.createElement("img");
          el.src = m[2];
          el.alt = "";
          imageCell.push(el);
        }
      }
      const href = item.getAttribute("href") || ((_b = (_a = item.querySelector("a[href]") || {}).getAttribute) == null ? void 0 : _b.call(_a, "href")) || "";
      const category = (item.querySelector(".tag") || {}).textContent || "";
      const title = (item.querySelector(".blog-heading, .blog-title") || {}).textContent || "";
      const content = [];
      if (category.trim()) {
        const s = document.createElement("strong");
        s.textContent = category.trim();
        content.push(s);
      }
      if (title.trim()) {
        const a = document.createElement("a");
        a.href = href || "#";
        a.textContent = title.trim();
        content.push(a);
      }
      if (href) {
        const s = document.createElement("strong");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = "Read more >";
        s.append(a);
        content.push(s);
      }
      return [imageCell, content];
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards (featured-content)", cells });
    const host = element.closest(".featured-blog-cmp") || cmp;
    host.replaceWith(block);
  }

  // tools/importer/transformers/grace-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".onetrust-pc-dark-filter",
        "iframe.aamIframeLoaded",
        'iframe[src*="demdex.net"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".grecaptcha-badge",
        'iframe[src*="recaptcha"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".contact-us-sticky"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".skip-content"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".alert-banner"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        'link[href*="clientlibs"]',
        'link[href*="/etc.clientlibs/"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        'iframe[src*="youtube-nocookie"]',
        "iframe.hidden",
        "video.hidden"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".media-modal"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "noscript",
        "source"
      ]);
      const allElements = element.querySelectorAll("[data-cmp-data-layer-enabled]");
      allElements.forEach((el) => {
        el.removeAttribute("data-cmp-data-layer-enabled");
      });
      const body = element.querySelector("[data-published-date]");
      if (body) {
        body.removeAttribute("data-published-date");
        body.removeAttribute("data-industry");
        body.removeAttribute("data-operating-segment");
        body.removeAttribute("data-site-sections");
        body.removeAttribute("data-template");
      }
    }
  }

  // tools/importer/transformers/grace-dm-images.js
  function detectDynamicMediaUrl(urlStr) {
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) {
      return "scene7";
    }
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
  function findLinkedDmCarrier(img) {
    if (!img || !img.parentElement) return null;
    let node = img;
    let parent = img.parentElement;
    while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
      let foundNode = false;
      for (const child of parent.children) {
        if (child === node) {
          foundNode = true;
        } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
          return null;
        }
      }
      if (!foundNode) return null;
      node = parent;
      parent = parent.parentElement;
    }
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const doc = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!detectDynamicMediaUrl(src)) return;
      const alt = img.getAttribute("alt") || "";
      const linkedAnchor = findLinkedDmCarrier(img);
      if (linkedAnchor) {
        linkedAnchor.setAttribute("title", src);
        linkedAnchor.textContent = altToLinkText(alt);
        return;
      }
      const parent = img.parentElement;
      if (parent && parent.tagName === "A") {
        console.warn("DM image inside mixed-content anchor, skipped:", src);
        return;
      }
      const a = doc.createElement("a");
      a.href = src;
      a.textContent = altToLinkText(alt);
      img.replaceWith(a);
    });
  }

  // tools/importer/import-grace-master.js
  var parsers = {
    "hero-banner": parse,
    "hero-full-width": parse,
    "hero-campaign": parse,
    "hero-event": parse,
    "hero-product": parse,
    "cards-product": parse2,
    "cards-industry": parse3,
    "cards-insight": parse4,
    "columns-people": parse5,
    "cards-people": parse5,
    "embed-video": parse6,
    "table-product-comparison": parse7,
    "table-three-column": parse8,
    "table-link-list": parse9,
    "table-data-grid": parse10,
    "table-two-column-content": parse11,
    "table-contact-matrix": parse12,
    "cards-icon-grid": parse13,
    "cards-category-grid": parse14,
    "cards-benefits-grid": parse15,
    "cards-image-text-grid": parse16,
    "cards-location-grid": parse17,
    "cards-contact-options": parse18,
    "cards-profile-grid": parse19,
    "cards-solution-grid": parse20,
    "columns-image-left": parse21,
    "columns-image-right": parse22,
    "columns-history-item": parse23,
    "columns-profile-detail": parse24,
    "columns-location-detail": parse25,
    "columns-app-promo": parse26,
    "columns-brochure-promo": parse27,
    "columns-checklist": parse28,
    "columns-horizontal-teaser": parse29,
    "columns-horizontal-teaser-featured": parse30,
    "columns-image-teaser": parse31,
    "accordion-faq": parse32,
    "accordion-nested": parse33,
    "quote-highlight": parse34,
    "quote-testimonial": parse35,
    "banner-resource-download": parse36,
    "social-share": parse37,
    "social-follow": parse38,
    "carousel": parse39,
    "map-embedded": parse40,
    "featured-product-selector": parse41,
    "custom-widget-contact-panel": parse42,
    "custom-widget-news-archive": parse43,
    // These 3 have real per-page content on COMMON selectors, so they PARSE (not seed) — seeding
    // literal draft text onto every .media-callout / div.quote / .media-video would be destructive.
    "banner-cta": parse44,
    "quote-cta": parse45,
    "video-overlay": parse46,
    // Default-path parser for the contact-split banner (sidebar pages build it via PATH A's
    // buildContactSplitBanner; this covers non-sidebar pages carrying the same fragment).
    "banner-contact-split": parse47,
    "cards-related-articles": parse48,
    "video-grid": parse49,
    // Real parser for the "Latest Insights"/related block — REPLACES the earlier seed-from-draft
    // (which injected placeholder draft images + wrong articles). Registering here makes the
    // seed-from-draft discovery branch fall through to this parser.
    "cards-featured-content": parse50
  };
  var transformers = [transform, transform2];
  var MATCHERS = {
    "columns-image-left": (doc) => rowsByColumnOrder(doc, "image"),
    "columns-image-right": (doc) => rowsByColumnOrder(doc, "text"),
    // news-archive: an .accordion-comp whose dd's hold .media-callout PDF covers (per-year issue
    // archive). Checked before the other accordions so it wins that shell.
    "custom-widget-news-archive": (doc) => Array.from(doc.querySelectorAll(".accordion-comp")).filter((ac) => ac.querySelector('dd .media-callout, dd .col-lg-6 picture, dd a[href*="pdf"]') && !ac.closest("dd")),
    // accordion-nested: an .accordion-comp whose dd contains a nested .accordion-comp (no media-callout).
    "accordion-nested": (doc) => Array.from(doc.querySelectorAll(".accordion-comp")).filter((ac) => ac.querySelector("dd .accordion-comp") && !ac.querySelector("dd .media-callout") && !ac.parentElement.closest(".accordion-comp")),
    // outer only
    // accordion-faq: a flat .accordion-comp (Q&A dls, no nested accordion, no media-callout).
    "accordion-faq": (doc) => Array.from(doc.querySelectorAll(".accordion-comp")).filter((ac) => ac.querySelector("dl") && !ac.querySelector("dd .accordion-comp") && !ac.querySelector(".media-callout") && !ac.closest("dd")),
    // not itself a nested inner accordion
    // banner-cta: a .media-callout that is a CTA banner — has a heading AND a real CTA link, but
    // is NOT the app-promo (no multi-paragraph intro) and not inside a card grid. Kept narrow so
    // it doesn't claim every .media-callout on the site.
    "banner-cta": (doc) => Array.from(doc.querySelectorAll(".media-callout, .cmp-media-callout")).filter((mc) => mc.querySelector("h2, h3, .h2, .h3") && mc.querySelector(".button a, a.btn-primary, .cta a") && !mc.closest(".card-group, .cmp-card-list") && mc.querySelectorAll(".text p, .rich-text p, p").length <= 2),
    // quote-cta: a div.quote with a CTA link but NOT a testimonial (.quote-section) or a
    // statistic highlight (.cmp-card.statistic).
    "quote-cta": (doc) => Array.from(doc.querySelectorAll("div.quote")).filter((q) => q.querySelector("a[href]") && !q.querySelector(".quote-section") && !q.closest(".cmp-card.statistic") && !q.querySelector(".cmp-card.statistic")),
    // cards-related-articles: a .cmp-card-list.grid.three-columns whose heading says "Related
    // Articles" (distinguishes from cards-product grids and the Follow-us social card-list).
    "cards-related-articles": (doc) => Array.from(doc.querySelectorAll(".cmp-card-list.grid.three-columns, .card-list .cmp-card-list")).filter((cl) => /related articles/i.test((cl.querySelector(".heading, h3") || cl.previousElementSibling || {}).textContent || "") && cl.querySelector("a.cmp-card.bio, a.cmp-card")),
    // social-follow: a .cmp-card-list with a "Follow us" heading + external social icon links.
    "social-follow": (doc) => Array.from(doc.querySelectorAll(".card-list .cmp-card-list, .cmp-card-list")).filter((cl) => /follow us/i.test((cl.querySelector(".heading, h3") || {}).textContent || "") && cl.querySelector('a.cmp-card.style-icon, a.cmp-card[href^="http"]')),
    // featured-product-selector: a feature-set carousel whose heading says "Featured Products".
    "featured-product-selector": (doc) => Array.from(doc.querySelectorAll(".feature-set, .cmp-feature-set")).filter((fs) => /featured products/i.test((fs.querySelector(".subhead-large, .heading") || {}).textContent || "")).map((fs) => fs.closest(".feature-set") || fs).filter((v, i, a) => a.indexOf(v) === i),
    // checklist: a .row.section-66-33 pairing a .quote with a checklist (.text h4 + ul steps).
    "columns-checklist": (doc) => Array.from(doc.querySelectorAll(".row.section-66-33")).filter((r) => r.querySelector(".quote") && r.querySelector(".text ul, .rich-text ul")),
    // history-item: .row.section-66-33 with a year <h2> + image, but NOT the checklist (no quote).
    "columns-history-item": (doc) => Array.from(doc.querySelectorAll("article .row.section-66-33, .row.section-66-33")).filter((r) => !r.querySelector(".quote") && r.querySelector("h2") && r.querySelector(".image, picture, img")),
    // Feature-set teaser carousels share ONE component; the item variant class distinguishes them:
    //   image-teaser = a.item.tab-img (has image); featured = a.item.slate-bkgd (dark, no image);
    //   horizontal-teaser = plain a.item (no image, not slate, not tab-img). Match the carousel
    //   CONTAINER whose items are predominantly the given variant, so each fires at most once.
    "columns-image-teaser": (doc) => featureSetContainers(doc, "tab-img"),
    // Exclude carousels explicitly headed "Featured Products" — those are featured-product-selector.
    "columns-horizontal-teaser-featured": (doc) => featureSetContainers(doc, "slate-bkgd").filter((fs) => !/featured products/i.test((fs.querySelector(".subhead-large, .heading") || {}).textContent || "")),
    "columns-horizontal-teaser": (doc) => featureSetContainers(doc, "plain"),
    // brochure-promo: a .row with a brochure cover + a gated DOWNLOAD (button/pdf) on one side
    // and a rich-text description with a bullet list on the other. The gated download + list
    // distinguishes it from profile/benefit grids that also pair media-callout with text.
    "columns-brochure-promo": (doc) => Array.from(doc.querySelectorAll("section > article > div.row, article > div.row, .row")).filter((r) => {
      const cols = Array.from(r.children).filter((c) => /col-lg-6/.test(c.className));
      if (cols.length !== 2) return false;
      const hasDownload = r.querySelector('button[data-gated-id], a[href$=".pdf"], .button__section, a[href*="/products/"]') && /download/i.test(r.textContent || "");
      return hasDownload && r.querySelector("ul, ol") && r.querySelector(".image, picture, img");
    }),
    // location-detail: a .row pairing a jobs.grace.com "Join the team" CTA with an image AND a
    // postal-address signature (street + a Tel/ZIP). The address requirement stops it claiming
    // careers pages (e.g. ausbildung checklist) that merely link to jobs.grace.com.
    "columns-location-detail": (doc) => Array.from(doc.querySelectorAll("section.none-bkgd .row, section .row")).filter((r) => r.querySelector('a.btn-primary[href*="jobs.grace.com"], .button a[href*="jobs.grace.com"]') && r.querySelector(".image, picture, img") && /\b\d{4,5}\b/.test(r.textContent || "") && /(street|road|rd\b|st\b|drive|avenue|ave\b|\+\d|tel[:.]?)/i.test(r.textContent || "")),
    // app-promo: a .cmp-media-callout whose text side has a heading + intro paragraph + link
    // (the download promo) — distinguishes from a bare profile/CEO media-callout headshot.
    "columns-app-promo": (doc) => Array.from(doc.querySelectorAll("div.cmp-media-callout")).filter((mc) => mc.querySelector("h1, h2, h3, .subhead-small") && mc.querySelector("p") && mc.querySelector("a[href]") && mc.querySelector(".image, picture, img")),
    // Composed card grids: matchers return ONE container (LCA of all matching items) so the whole
    // grid → one block. Distinguishing predicates keep variants that share a column width from
    // colliding (location vs contact-options both use .col-lg-4; the .col-lg-6 grids differ by
    // heading/link/media-callout signatures).
    // solution-grid: stacked centered h2 + SHORT tagline sections (product "solutions"), no
    // image/list/link. The short body (<220 chars) distinguishes them from long article era
    // intros (e.g. our-history) that also use centered h2 + p. Needs 3+ to be a grid.
    "cards-solution-grid": (doc) => cardGridContainers(
      doc,
      ".col-lg-12 .text .rich-text, .col-lg-12 .rich-text",
      (rt) => {
        const h2 = rt.querySelector(":scope > h2");
        const p = rt.querySelector(":scope > p");
        if (!h2 || !p) return false;
        if (rt.querySelector("img, picture, ul, ol, a")) return false;
        return (p.textContent || "").trim().length < 220;
      },
      3
    ),
    // location-grid: .col-lg-4 with image + a "Tel:" address (phone signature), no <h4>/<ul>.
    "cards-location-grid": (doc) => cardGridContainers(
      doc,
      ".col-lg-4",
      (c) => hasImageAndText(c) && /tel:/i.test(c.textContent || "") && !c.querySelector("h4, ul"),
      3
    ),
    // contact-options: .col-lg-4 with <h4> + <ul> of options (no phone address).
    "cards-contact-options": (doc) => cardGridContainers(
      doc,
      ".col-lg-4",
      (c) => hasImageAndText(c) && !!c.querySelector("h4") && !!c.querySelector("ul"),
      2
    ),
    // profile-grid: .col-lg-6 with a media-callout headshot + h3 name.
    "cards-profile-grid": (doc) => cardGridContainers(
      doc,
      ".col-lg-6",
      (c) => c.querySelector(".media-callout") && c.querySelector("h3"),
      3
    ),
    // benefits-grid: .col-lg-6 with image + h3 heading + paragraph, no link, no media-callout.
    "cards-benefits-grid": (doc) => cardGridContainers(
      doc,
      ".col-lg-6",
      (c) => hasImageAndText(c) && !!c.querySelector("h3") && !c.querySelector(".media-callout, a"),
      3
    ),
    // image-text-grid: .col-lg-6 with image + paragraph, NO heading, NO link, no media-callout.
    "cards-image-text-grid": (doc) => cardGridContainers(
      doc,
      ".col-lg-6",
      (c) => hasImageAndText(c) && !c.querySelector("h3, h4, a, .media-callout"),
      3
    ),
    "columns-checklist": (doc) => Array.from(doc.querySelectorAll(".row.section-66-33")).filter((r) => r.querySelector(".quote") && r.querySelector(".text ul")),
    // Real authored tables share the .rich-text > table shell; disambiguate by border class
    // + column count so the variants are mutually exclusive:
    //   link-list = 1 col + .vertical-border; three-column = 3 col + .vertical-border;
    //   product-comparison = 5 col + .vertical-border; data-grid = 5 col, NO .vertical-border.
    "table-link-list": (doc) => tablesByColumns(doc, ".rich-text.vertical-border > table", 1),
    "table-three-column": (doc) => tablesByColumns(doc, ".rich-text.vertical-border > table", 3),
    "table-product-comparison": (doc) => tablesByColumns(doc, ".rich-text.vertical-border table", 5),
    "table-data-grid": (doc) => Array.from(doc.querySelectorAll(".rich-text:not(.vertical-border) > table[width='100%']")).filter((t) => {
      const r = t.querySelector("tr");
      return r && r.children.length === 5;
    }),
    // contact-matrix: the col-lg-9 content column of a 75/25 split, but ONLY when it holds the
    // Industries / Customer Service Number header pair (avoids matching generic 75/25 columns).
    "table-contact-matrix": (doc) => {
      const col = doc.querySelector(".section-75-25 .col-lg-9");
      if (!col) return [];
      const heads = Array.from(col.querySelectorAll("h3, h4, p")).map((h) => (h.textContent || "").toLowerCase());
      const hasSig = heads.some((t) => t.includes("industries")) && heads.some((t) => t.includes("customer service"));
      return hasSig ? [col] : [];
    },
    // two-column-content: a .split-list <ul> that is a STANDALONE two-column feature (davisil),
    // i.e. accompanied by gated download CTAs in the same section — NOT an inline body list.
    "table-two-column-content": (doc) => Array.from(doc.querySelectorAll(".rich-text.split-list")).filter((sl) => {
      const section = sl.closest("section, article");
      return section && section.querySelector('.button__section, button[data-gated-id], a[href$=".pdf"]');
    }),
    "video-grid": (doc) => {
      const vids = Array.from(doc.querySelectorAll(".media-video"));
      return vids.length > 1 ? [vids[0].closest("section, article") || vids[0].parentElement] : [];
    },
    // video-overlay: a SINGLE standalone .media-video (2+ on a page is a video-grid). This guard
    // stops video-overlay from greedily claiming each still on a multi-video page.
    "video-overlay": (doc) => {
      const vids = Array.from(doc.querySelectorAll(".media-video"));
      return vids.length === 1 ? [vids[0]] : [];
    },
    "cards-category-grid": (doc) => Array.from(doc.querySelectorAll(".cmp-card-list")).filter((cl) => !cl.classList.contains("grid") && cl.querySelector("a.cmp-card.small")).map((cl) => cl.querySelector(".card-group")).filter(Boolean),
    // icon-grid: small icon+label+desc cards (generic cmp-card). Return ONE container (LCA) so
    // the whole set → one block. Item = a generic card with an icon image + a .h4 title, no link.
    "cards-icon-grid": (doc) => cardGridContainers(
      doc,
      "a.cmp-card.generic, .cmp-card.generic",
      (c) => c.querySelector(".h4, .title, p") && c.querySelector(".image, picture, img"),
      2
    )
  };
  function rowsByColumnOrder(doc, firstKind) {
    const rows = Array.from(doc.querySelectorAll("article .row, section .row"));
    return rows.filter((row) => {
      const cols = Array.from(row.children).filter((c) => /col-lg-6/.test(c.className));
      if (cols.length !== 2) return false;
      const col0Image = !!cols[0].querySelector(".image, .cmp-image, picture, img");
      const col1Image = !!cols[1].querySelector(".image, .cmp-image, picture, img");
      const col0Text = !!cols[0].querySelector(".rich-text, .text, h1, h2, h3, p");
      const col1Text = !!cols[1].querySelector(".rich-text, .text, h1, h2, h3, p");
      const imageThenText = col0Image && !col0Text && col1Text;
      const textThenImage = col1Image && !col1Text && col0Text;
      if (!imageThenText && !textThenImage) return false;
      const section = row.closest("section, article");
      const siblingRows = section ? Array.from(section.querySelectorAll(".row")).filter((r) => Array.from(r.children).filter((c) => /col-lg-6/.test(c.className)).length === 2) : [row];
      if (siblingRows.length > 2) return false;
      return firstKind === "image" ? imageThenText : textThenImage;
    });
  }
  function hasImageAndText(c) {
    return !!c.querySelector(".image, .cmp-image, .media-callout, picture, img") && !!c.querySelector(".text, .rich-text, .embed, p, h3, h4");
  }
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
  function cardGridContainers(doc, itemSel, accept, minItems) {
    const items = Array.from(doc.querySelectorAll(itemSel)).filter((it) => {
      try {
        return accept ? accept(it) : true;
      } catch (e) {
        return false;
      }
    });
    if (items.length < (minItems || 2)) return [];
    const lca = lowestCommonAncestor(items);
    return lca ? [lca] : [];
  }
  function featureSetContainers(doc, variant) {
    const carousels = Array.from(doc.querySelectorAll(".feature-set, .cmp-feature-set, .feature-set-section.list"));
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    carousels.forEach((c) => {
      const root = c.closest(".feature-set") || c;
      if (seen.has(root)) return;
      seen.add(root);
      const items = Array.from(root.querySelectorAll("a.item"));
      if (!items.length) return;
      const kindOf = (it) => {
        if (it.classList.contains("tab-img") || it.querySelector(".image img, picture img")) return "tab-img";
        if (it.classList.contains("slate-bkgd")) return "slate-bkgd";
        return "plain";
      };
      const counts = { "tab-img": 0, "slate-bkgd": 0, plain: 0 };
      items.forEach((it) => {
        counts[kindOf(it)] += 1;
      });
      const dominant = Object.keys(counts).reduce((a, b) => counts[b] > counts[a] ? b : a, "plain");
      if (dominant === variant) out.push(root);
    });
    return out;
  }
  function tablesByColumns(doc, sel, cols) {
    return Array.from(doc.querySelectorAll(sel)).filter((t) => {
      const first = t.querySelector("tr");
      return first && first.children.length === cols;
    });
  }
  var FORM_SELECTORS = [
    "form",
    ".cmp-form",
    ".marketo-form",
    "form.mktoForm",
    "[data-form-id]",
    ".gated-modal-form",
    "iframe[src*='marketo']",
    "iframe[src*='pardot']"
  ];
  function detectForm(document) {
    return FORM_SELECTORS.some((sel) => {
      try {
        return !!document.querySelector(sel);
      } catch (e) {
        return false;
      }
    });
  }
  function isInsightsArticle(document, url) {
    const path = (() => {
      try {
        return new URL(url || "").pathname;
      } catch (e) {
        return "";
      }
    })();
    const looksInsights = /\/insights\/.+/.test(path) || !!document.querySelector(".blog-detail, .cmp-blog-detail");
    const hasShare = !!document.querySelector(".social-share-container");
    const hasPostMeta = Array.from(document.querySelectorAll("article dl dt")).some((dt) => /posted|industry/i.test(dt.textContent || ""));
    return looksInsights && (hasShare || hasPostMeta) || hasShare && hasPostMeta;
  }
  function isSidebarPage(document) {
    return !!document.querySelector(
      '.section-navigation, [aria-label="Section navigation"], article .row > .col-lg-2, article .col-lg-2 a'
    );
  }
  function hasContactWidget(document) {
    return !!document.querySelector(".contact-us-sticky, .contact-us__cmp, .contact-us-cmp");
  }
  function executeTransformers(hookName, element, payload) {
    transformers.forEach((fn) => {
      try {
        fn.call(null, hookName, element, payload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function createSectionMetadata(document, styleValue) {
    return WebImporter.Blocks.createBlock(document, {
      name: "Section Metadata",
      cells: [["Style", styleValue]]
    });
  }
  function buildMetadataBlock(document, extraPairs) {
    const cells = [];
    const title = document.querySelector("title");
    if (title) cells.push(["Title", title.textContent.replace(/[\n\t]/gm, "").trim()]);
    const desc = document.querySelector('meta[name="description"]');
    if (desc && desc.content) cells.push(["Description", desc.content.trim()]);
    extraPairs.forEach(([k, v]) => cells.push([k, v]));
    return WebImporter.Blocks.createBlock(document, { name: "Metadata", cells });
  }
  function rewriteInternalLinks(main) {
    main.querySelectorAll("a[href]").forEach((a) => {
      let href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("//")) href = `https:${href}`;
      try {
        if (/^https?:\/\//i.test(href)) {
          const u = new URL(href);
          const host = u.hostname;
          const externalGraceSubdomains = ["jobs.grace.com", "marketing.grace.com"];
          const isInternal = host === "grace.com" || host.endsWith(".grace.com") && !externalGraceSubdomains.includes(host) || host.includes("xmod-gracev1") || host.includes("--ema-grace--") || host.includes("aem.live") || host.includes("aem.page");
          if (isInternal && /^\/content\/dam\//.test(u.pathname)) return;
          if (isInternal) {
            let path = u.pathname.replace(/^\/content\/grace\/us\/en/, "").replace(/\.html$/, "");
            if (path.length > 1) path = path.replace(/\/$/, "");
            a.setAttribute("href", path || "/");
          }
          return;
        }
        if (href.startsWith("/")) {
          let path = href.replace(/^\/content\/grace\/us\/en/, "").replace(/\.html$/, "");
          if (path.length > 1) path = path.replace(/\/$/, "");
          a.setAttribute("href", path || "/");
        }
      } catch (e) {
      }
    });
  }
  function finalizePath(params) {
    return WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
    );
  }
  function buildHeroBlock(document) {
    const h1src = document.querySelector("article h1, .hero h1, h1");
    const title = h1src ? (h1src.textContent || "").trim() : (document.title || "").trim();
    if (!title) return null;
    const h1 = document.createElement("h1");
    h1.textContent = title;
    return WebImporter.Blocks.createBlock(document, { name: "Hero (banner)", cells: [[h1]] });
  }
  function buildSidebarNav(document) {
    const navAnchors = Array.from(document.querySelectorAll(
      'article [aria-label="Section navigation"] a, article .section-nav a, article .col-lg-2 a'
    ));
    if (!navAnchors.length) return null;
    const seen = /* @__PURE__ */ new Set();
    const ul = document.createElement("ul");
    navAnchors.forEach((a) => {
      const text = (a.textContent || "").replace(/\s+/g, " ").trim();
      const href = a.getAttribute("href") || "";
      if (!text || !href) return;
      const norm = href.replace(/^\/content\/grace\/us\/en/, "").replace(/\.html$/, "").replace(/\/$/, "");
      if (seen.has(norm)) return;
      seen.add(norm);
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.setAttribute("href", href);
      link.textContent = text;
      li.append(link);
      ul.append(li);
    });
    if (!ul.children.length) return null;
    const section = document.createElement("div");
    section.append(ul);
    section.append(createSectionMetadata(document, "sidebar-nav"));
    return section;
  }
  function extractMainContent(document) {
    const mainCol = document.querySelector("article .col-lg-7") || document.querySelector("article h2") && document.querySelector("article h2").closest('[class*="col-"]');
    if (!mainCol) return [];
    const rich = mainCol.querySelector(".rich-text") || mainCol;
    return Array.from(rich.children).filter((el) => {
      if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return false;
      return (el.textContent || "").trim().length > 0 || el.querySelector("img");
    });
  }
  function buildContactSplitBanner(document) {
    const cmp = document.querySelector(".contact-us-cmp");
    if (!cmp) return null;
    const titleEl = cmp.querySelector(".contact-us-title, h2");
    const title = titleEl ? (titleEl.textContent || "").replace(/\s+/g, " ").trim() : "Want to talk to an expert?";
    const cols = Array.from(cmp.querySelectorAll('.row.has-title > [class*="col-lg-6"], .row.has-title > [class*="col-"]'));
    const halfCells = cols.map((col) => {
      const cell = [];
      const h3 = col.querySelector("h3");
      if (h3) {
        const h = document.createElement("h3");
        h.textContent = (h3.textContent || "").trim();
        cell.push(h);
      }
      const cta = col.querySelector(".button__section a, a.btn-primary, a[href]");
      if (cta) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = cta.getAttribute("href") || "#";
        a.textContent = (cta.textContent || "").replace(/\s+/g, " ").trim();
        p.append(a);
        cell.push(p);
      }
      const introP = Array.from(col.querySelectorAll(".rich-text p")).find((p) => (p.textContent || "").trim());
      if (introP) {
        const p = document.createElement("p");
        p.innerHTML = introP.innerHTML;
        cell.push(p);
      }
      const list = col.querySelector("ul, ol");
      if (list) cell.push(list.cloneNode(true));
      return cell;
    }).filter((c) => c.length);
    if (!halfCells.length) return null;
    return WebImporter.Blocks.createBlock(document, { name: "Banner (contact-split)", cells: [[title], halfCells] });
  }
  function buildInsightsArticle(document, url, params) {
    const main = document.createElement("main");
    const featuredBlog = document.querySelector('.featured-blog-cmp, .feature-blog, [class*="featured-blog"]');
    const relatedHasGeoHex = !!(featuredBlog && featuredBlog.closest(".geoAndHex, .light-gray-bkgd"));
    let relatedTitle = "";
    if (featuredBlog) {
      const scope = featuredBlog.closest(".feature-blog") || featuredBlog;
      const titleEl = scope.querySelector(".header .title h2, .header h2, .featured-blog-header h2") || Array.from(scope.querySelectorAll("h2")).find((h) => /insight/i.test(h.textContent || ""));
      relatedTitle = titleEl && (titleEl.textContent || "").replace(/\s+/g, " ").trim() || "Latest Insights from Grace";
    }
    const railInner = document.createElement("div");
    let railHasContent = false;
    const share = document.querySelector(".social-share-container");
    if (share) {
      const networks = Array.from(share.querySelectorAll("a[href], a")).map((a) => (a.getAttribute("aria-label") || a.textContent || "").replace(/share via/i, "").trim()).filter(Boolean);
      if (!networks.some((n) => /print/i.test(n))) networks.push("Print");
      const list = networks.length ? networks.join(", ") : "Facebook, X, LinkedIn, Email, Print";
      const shareBlock = WebImporter.Blocks.createBlock(document, { name: "Social (share)", cells: [[list]] });
      railInner.append(shareBlock);
      railHasContent = true;
    }
    let publishedMeta = "";
    let industryMeta = "";
    const dl = document.querySelector("article dl");
    if (dl) {
      Array.from(dl.querySelectorAll("dt")).forEach((dt) => {
        const dd = dt.nextElementSibling && dt.nextElementSibling.tagName === "DD" ? dt.nextElementSibling : null;
        const label = (dt.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
        const val = dd ? (dd.textContent || "").replace(/\s+/g, " ").trim() : "";
        if (!val) return;
        if (/post|publish|date/.test(label)) publishedMeta = val;
        else if (/industr/.test(label)) industryMeta = val;
      });
    }
    if (railHasContent) {
      railInner.append(createSectionMetadata(document, "sidebar-nav"));
      main.append(railInner);
      main.append(document.createElement("hr"));
    }
    const h1el = document.querySelector("article h1");
    const bodyCol = h1el && h1el.closest('[class*="col-lg-7"]') || document.querySelector("article .col-lg-7");
    const bodyBlocks = [];
    const contentNodes = [];
    if (bodyCol) {
      Array.from(bodyCol.children).forEach((el) => {
        if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return;
        if (el.matches(".divider")) return;
        if (el.matches(".card-list") && !/related articles/i.test(el.textContent || "")) return;
        const mediaVideo = el.matches(".media-video") ? el : el.querySelector(".media-video");
        if (mediaVideo) {
          const posterImg = mediaVideo.querySelector(".img img, .media-image img, picture, img");
          const callout = mediaVideo.closest(".cmp-media-callout, .media-callout") || el;
          const src = (() => {
            const v = callout.querySelector(".media-modal video[src], .media-modal iframe[src], video[src], iframe[src]");
            let raw = v ? v.getAttribute("src") || "" : "";
            if (!raw) return "";
            if (raw.startsWith("//")) raw = `https:${raw}`;
            const ytId = raw.match(/(?:youtube(?:-nocookie)?\.com\/embed\/|youtu\.be\/)([\w-]{6,})/);
            if (ytId) return `https://www.youtube.com/watch?v=${ytId[1]}`;
            const vimeo = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/);
            if (vimeo) return `https://vimeo.com/${vimeo[1]}`;
            if (raw.startsWith("/content/dam/")) return `https://grace.com${raw}`;
            return raw;
          })();
          if (posterImg && src) {
            const posterCell = [posterImg.cloneNode(true)];
            const a = document.createElement("a");
            a.href = src;
            a.textContent = src;
            const block = WebImporter.Blocks.createBlock(document, { name: "Video (overlay)", cells: [[posterCell, [a]]] });
            contentNodes.push(block);
            return;
          }
        }
        const featureSet = el.matches(".feature-set-section, .feature-set, .cmp-feature-set") ? el : el.querySelector(".feature-set-section, .feature-set, .cmp-feature-set");
        if (featureSet && featureSet.querySelector("a.item")) {
          const dlLink = el.querySelector('a.btn-primary, .button__section a, a[target="_blank"][href*="marketing.grace"]') || featureSet.querySelector('a.btn-primary, .cta a, a[target="_blank"]');
          if (dlLink && !dlLink.closest("a.item")) {
            const p = document.createElement("p");
            const strong = document.createElement("strong");
            const a = document.createElement("a");
            a.href = dlLink.getAttribute("href") || "#";
            if (dlLink.getAttribute("target")) a.setAttribute("target", dlLink.getAttribute("target"));
            a.textContent = (dlLink.textContent || "Download").replace(/\s+/g, " ").trim();
            strong.append(a);
            p.append(strong);
            p.className = "insights-download-cta";
            contentNodes.push(p);
          }
          const labelEl = featureSet.querySelector(".subhead-large, .header .title, .heading");
          const label = labelEl ? (labelEl.textContent || "").replace(/\s+/g, " ").trim() : "";
          if (label) {
            const p = document.createElement("p");
            p.textContent = label;
            contentNodes.push(p);
          }
          const before = new Set(document.querySelectorAll("table"));
          try {
            parse30(featureSet, { document, url, params });
          } catch (e) {
          }
          const created = Array.from(document.querySelectorAll("table")).find((t2) => !before.has(t2) && !t2.closest("td"));
          if (created) {
            contentNodes.push(created);
            return;
          }
        }
        const statCard = el.matches(".cmp-card.statistic") ? el : el.querySelector(".cmp-card.statistic");
        if (statCard) {
          const before = new Set(document.querySelectorAll("table"));
          try {
            parse34(statCard, { document, url, params });
          } catch (e) {
          }
          const created = Array.from(document.querySelectorAll("table")).find((t2) => !before.has(t2) && !t2.closest("td"));
          if (created) {
            contentNodes.push(created);
            return;
          }
        }
        const quoteEl = el.matches(".quote") ? el : el.querySelector(".quote-section, div.quote");
        if (quoteEl && (quoteEl.querySelector(".quote-text, .citation") || /quote-section/.test(quoteEl.className || ""))) {
          const before = new Set(document.querySelectorAll("table"));
          try {
            parse35(quoteEl, { document, url, params });
          } catch (e) {
          }
          const created = Array.from(document.querySelectorAll("table")).find((t2) => !before.has(t2) && !t2.closest("td"));
          if (created) {
            contentNodes.push(created);
            return;
          }
        }
        const bq = el.matches("blockquote") ? el : el.querySelector(":scope > blockquote, blockquote");
        if (bq && (bq.textContent || "").trim()) {
          const quoteText = (bq.textContent || "").replace(/\s+/g, " ").trim();
          const cells = [[quoteText]];
          const authorP = bq.nextElementSibling && bq.nextElementSibling.tagName === "P" ? bq.nextElementSibling : el.matches("blockquote") ? null : el.querySelector("blockquote + p");
          if (authorP) {
            const lines = (authorP.innerHTML || "").split(/<br\s*\/?>/i).map((s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()).filter(Boolean);
            if (lines[0]) cells.push([lines[0].replace(/^[-–—]\s*/, "")]);
            if (lines.length > 1) cells.push([lines.slice(1).join(", ")]);
            if (authorP.parentNode) authorP.remove();
          }
          const block = WebImporter.Blocks.createBlock(document, { name: "Quote (testimonial)", cells });
          contentNodes.push(block);
          return;
        }
        if (el.matches(".media-callout") || el.querySelector(".media-callout")) {
          const callouts = el.matches(".media-callout") ? [el] : Array.from(el.querySelectorAll(".media-callout"));
          const list = callouts.length ? callouts : [el];
          const figures = list.map((mc) => {
            const img = mc.querySelector(".media-image img, .img img, picture, img");
            if (!img) return null;
            const capEl = mc.querySelector(".caption, .media-caption");
            const capText = capEl ? (capEl.textContent || "").replace(/\s+/g, " ").trim() : "";
            let cap = null;
            if (capText) {
              cap = document.createElement("p");
              const em = document.createElement("em");
              em.textContent = capText;
              cap.append(em);
              cap.className = "media-caption";
            }
            return { img: img.cloneNode(true), cap };
          }).filter(Boolean);
          if (!figures.length) return;
          if (figures.length >= 2) {
            const cells = [figures.map((f) => {
              const p = document.createElement("p");
              p.append(f.img);
              return f.cap ? [p, f.cap] : [p];
            })];
            const block = WebImporter.Blocks.createBlock(document, { name: "Columns (media-figures)", cells });
            contentNodes.push(block);
            return;
          }
          figures.forEach((f) => {
            const p = document.createElement("p");
            p.append(f.img);
            contentNodes.push(p);
            if (f.cap) contentNodes.push(f.cap);
          });
          return;
        }
        const bodyTable = el.matches("table") ? el : el.querySelector(":scope table, :scope > .rich-text table");
        if (bodyTable && bodyTable.querySelector("tr")) {
          const firstRow = bodyTable.querySelector("tr");
          const cols = firstRow ? firstRow.querySelectorAll("td, th").length : 0;
          const variant = cols >= 3 ? "three-column" : cols === 2 ? "two-column-content" : "data-grid";
          const clone = el.cloneNode(true);
          const before = new Set(document.querySelectorAll("table"));
          try {
            parseRealTables(clone, document, `Table (${variant})`);
            const created = Array.from(clone.querySelectorAll("table")).find((t2) => !before.has(t2) && !t2.closest("td"));
            if (created) {
              contentNodes.push(created);
              return;
            }
          } catch (e) {
          }
        }
        const relCardList = el.matches(".cmp-card-list, .card-list") ? el : el.querySelector(".cmp-card-list, .card-list");
        const relHeading = relCardList && (relCardList.querySelector(".heading, h2, h3") || {}).textContent;
        if (relCardList && relHeading && /related articles/i.test(relHeading) && relCardList.querySelector("a.cmp-card")) {
          const h2 = document.createElement("h2");
          h2.textContent = relHeading.replace(/\s+/g, " ").trim();
          contentNodes.push(h2);
          const before = new Set(document.querySelectorAll("table"));
          try {
            parse48(relCardList, { document, url, params });
          } catch (e) {
          }
          const created = Array.from(document.querySelectorAll("table")).find((t2) => !before.has(t2) && !t2.closest("td"));
          if (created) {
            contentNodes.push(created);
            return;
          }
        }
        if (el.querySelector("a.cmp-card.bio")) {
          const before = new Set(document.querySelectorAll("table"));
          try {
            parse2(el, { document, url, params });
          } catch (e) {
          }
          const created = Array.from(document.querySelectorAll("table")).find((t2) => !before.has(t2) && !t2.closest("td"));
          if (created) {
            contentNodes.push(created);
            return;
          }
        }
        const hasContent = (el.textContent || "").trim().length > 0 || el.querySelector("img, picture");
        if (hasContent) contentNodes.push(el.cloneNode(true));
      });
    }
    if (contentNodes.length) {
      const section = document.createElement("div");
      contentNodes.forEach((n) => section.append(n));
      section.querySelectorAll("a").forEach((a) => {
        const href = (a.getAttribute("href") || "").trim();
        if ((!href || href === "#") && !a.textContent.trim() && !a.querySelector("img, picture")) a.remove();
      });
      section.querySelectorAll("p").forEach((p) => {
        if (!p.textContent.trim() && !p.querySelector("img, picture, a[href], br, table")) p.remove();
      });
      section.querySelectorAll("a.btn-primary, a[data-gated-id], a[data-trigger-type]").forEach((a) => {
        if (a.closest("strong") || a.closest("a.item") || a.closest("table")) return;
        if (a.querySelector("img, picture")) return;
        const strong = document.createElement("strong");
        a.replaceWith(strong);
        strong.append(a);
        a.removeAttribute("class");
        a.removeAttribute("data-gated-id");
        a.removeAttribute("data-trigger-type");
      });
      section.querySelectorAll("button.btn-primary, button[data-gated-id], button[data-trigger-type], button[href]").forEach((btn) => {
        if (btn.closest("strong") || btn.closest("a.item") || btn.closest("table")) return;
        let href = (btn.getAttribute("href") || "").trim();
        const text = (btn.textContent || "").replace(/\s+/g, " ").trim();
        if (!href || !text) return;
        if (!/^(https?:\/\/|\/|#|mailto:)/i.test(href) && /^[A-Za-z0-9+/=]+$/.test(href)) {
          try {
            const decoded = typeof atob === "function" ? atob(href) : href;
            if (/^\/(content|[a-z])/i.test(decoded)) href = decoded;
          } catch (e) {
          }
        }
        if (/^\/content\/dam\//.test(href)) {
          href = `https://grace.com${href.replace(/\.pardot\.handler.*$/i, "")}`;
        }
        const strong = document.createElement("strong");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = text;
        if (btn.getAttribute("target")) a.setAttribute("target", btn.getAttribute("target"));
        strong.append(a);
        btn.replaceWith(strong);
      });
      section.querySelectorAll('a[href*="machine-learning-whitepaper"] em, a[href*="marketing.grace"] em').forEach((em) => {
        while (em.firstChild) em.parentNode.insertBefore(em.firstChild, em);
        em.remove();
      });
      section.querySelectorAll('em > a[href*="machine-learning-whitepaper"]:only-child, em > a[href*="marketing.grace"]:only-child').forEach((a) => {
        const em = a.parentElement;
        if (em && em.tagName === "EM") em.replaceWith(a);
      });
      const leadImg = section.querySelector('img[alt="Image of Media Callout"], img[alt=""]');
      if (leadImg && h1el) leadImg.setAttribute("alt", (h1el.textContent || "").replace(/\s+/g, " ").trim());
      main.append(section);
    }
    if (share) {
      const sc = share.closest('[class*="col-lg-2"]') || share;
      if (sc && sc.parentNode) sc.remove();
    }
    if (bodyCol && bodyCol.parentNode) bodyCol.remove();
    document.querySelectorAll(".social-share-container").forEach((s) => {
      if (s.parentNode) s.remove();
    });
    const extra = discoverAndParseBlocks(document, url, params, { excludeSidebarHandled: true });
    extra.rendered.forEach((blockEl, i) => {
      main.append(document.createElement("hr"));
      const section = document.createElement("div");
      const blockName = (extra.parsedNames[i] || "").toLowerCase();
      const isFeaturedCards = blockName.includes("featured-content") || (blockEl.textContent || "").toLowerCase().includes("featured-content");
      if (isFeaturedCards && relatedTitle) {
        const h2 = document.createElement("h2");
        h2.textContent = relatedTitle;
        section.append(h2);
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = "/insights";
        a.textContent = "View all articles";
        p.append(a);
        section.append(p);
      }
      section.append(blockEl);
      if (relatedHasGeoHex && isFeaturedCards) {
        section.append(createSectionMetadata(document, "geo-hex"));
      }
      main.append(section);
    });
    const contactBanner = buildContactSplitBanner(document);
    if (contactBanner) {
      main.append(document.createElement("hr"));
      const bannerSection = document.createElement("div");
      bannerSection.append(contactBanner);
      main.append(bannerSection);
    }
    const t = document.querySelector(
      ".contactus__content-desktop .contactus__text, .contactus__text, .contact-us-sticky .contactus__text, .contact-us-cmp .contact-us-subtitle"
    );
    const pageMeta = [["template", "sidebar"], ["contactus", "true"]];
    const tagline = t && (t.textContent || "").trim() ? (t.textContent || "").replace(/\s+/g, " ").trim() : "Talk to our experts about how we can help your business.";
    pageMeta.push(["contactus-tagline", tagline]);
    const title = h1el ? (h1el.textContent || "").replace(/\s+/g, " ").trim() : "";
    if (title) pageMeta.push(["breadcrumb-title", title]);
    if (publishedMeta) pageMeta.push(["published", publishedMeta]);
    if (industryMeta) pageMeta.push(["industry", industryMeta]);
    rewriteInternalLinks(main);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    executeTransformers("afterTransform", main, { document, url, params });
    main.appendChild(document.createElement("hr"));
    main.appendChild(buildMetadataBlock(document, pageMeta));
    return {
      element: main,
      path: finalizePath(params),
      report: {
        title: document.title,
        pageType: "insights-article",
        pageMetadata: pageMeta.map((p) => p[0]),
        contentNodes: contentNodes.length,
        blocks: extra.parsedNames,
        blocksLeftInPlace: extra.unparsed
      }
    };
  }
  function buildSidebarPage(document, url, params) {
    const main = document.createElement("main");
    const heroBlock = buildHeroBlock(document);
    if (heroBlock) {
      const heroSection = document.createElement("div");
      heroSection.append(heroBlock);
      main.append(heroSection);
      main.append(document.createElement("hr"));
    }
    const navSection = buildSidebarNav(document);
    if (navSection) main.append(navSection);
    const contentNodes = extractMainContent(document);
    if (contentNodes.length) {
      if (navSection) main.append(document.createElement("hr"));
      const contentSection = document.createElement("div");
      contentNodes.forEach((n) => contentSection.append(n));
      main.append(contentSection);
    }
    const extraBlocks = discoverAndParseBlocks(document, url, params, { excludeSidebarHandled: true });
    extraBlocks.rendered.forEach((blockEl) => {
      main.append(document.createElement("hr"));
      const section = document.createElement("div");
      section.append(blockEl);
      main.append(section);
    });
    const contactBanner = buildContactSplitBanner(document);
    if (contactBanner) {
      main.append(document.createElement("hr"));
      const bannerSection = document.createElement("div");
      bannerSection.append(contactBanner);
      main.append(bannerSection);
    }
    const cmpTitleEl = document.querySelector(".contact-us-cmp .contact-us-title, .contact-us-cmp h2");
    const contactTagline = cmpTitleEl ? (cmpTitleEl.textContent || "").replace(/\s+/g, " ").trim() : "Want to talk to an expert?";
    const crumbItems = Array.from(document.querySelectorAll(
      'nav[aria-label*="readcrumb" i] li, .breadcrumb li, [class*="breadcrumb"] li'
    ));
    const lastCrumb = crumbItems.length ? (crumbItems[crumbItems.length - 1].textContent || "").replace(/\s+/g, " ").trim() : "";
    const pageMeta = [
      ["template", "sidebar"],
      ["contactus", "true"],
      ["contactus-tagline", contactTagline]
    ];
    if (lastCrumb) pageMeta.push(["breadcrumb-title", lastCrumb]);
    rewriteInternalLinks(main);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    main.appendChild(document.createElement("hr"));
    main.appendChild(buildMetadataBlock(document, pageMeta));
    return {
      element: main,
      path: finalizePath(params),
      report: {
        title: document.title,
        pageType: "sidebar",
        pageMetadata: pageMeta.map((p) => p[0]),
        sidebarNav: !!navSection,
        contentNodes: contentNodes.length,
        contactSplitBanner: !!contactBanner,
        blocks: extraBlocks.parsedNames,
        blocksLeftInPlace: extraBlocks.unparsed
      }
    };
  }
  function findBlocksOnPage(document) {
    const found = [];
    catalog_data_default.blocks.forEach((def) => {
      if (def.render === "skip-existing" || def.render === "forms-pass") return;
      let elements = [];
      const matcher = MATCHERS[def.name];
      if (matcher) {
        try {
          elements = matcher(document) || [];
        } catch (e) {
          console.error(`[master] matcher "${def.name}" failed:`, e);
          elements = [];
        }
      } else if (def.selector) {
        try {
          elements = Array.from(document.querySelectorAll(def.selector));
        } catch (e) {
          elements = [];
        }
      }
      elements.forEach((element) => found.push({ def, element }));
    });
    found.sort((a, b) => {
      if (a.element !== b.element) {
        const rel = a.element.compareDocumentPosition(b.element);
        if (rel & 2) return 1;
        if (rel & 4) return -1;
        return 0;
      }
      const pa = a.def.priority == null ? 999 : a.def.priority;
      const pb = b.def.priority == null ? 999 : b.def.priority;
      return pa - pb;
    });
    return found;
  }
  function seedFromDraft(def, element, document) {
    const markup = draft_seeds_default[def.name];
    if (!markup) return false;
    const tpl = document.createElement("div");
    tpl.innerHTML = markup;
    const blockDiv = tpl.firstElementChild;
    if (!blockDiv) return false;
    const classes = Array.from(blockDiv.classList);
    const name = classes.length > 1 ? `${classes[0]} (${classes.slice(1).join(" ")})` : classes[0];
    const rows = Array.from(blockDiv.children);
    const cells = rows.map((row) => Array.from(row.children).map((cell) => {
      const kids = Array.from(cell.childNodes).filter((n) => n.nodeType === 1 || n.nodeType === 3 && n.textContent.trim());
      return kids.length ? kids.map((n) => n.cloneNode(true)) : [document.createTextNode((cell.textContent || "").trim())];
    }));
    const block = WebImporter.Blocks.createBlock(document, { name, cells });
    element.replaceWith(block);
    return true;
  }
  var SIDEBAR_HANDLED_CONTAINERS = ".hero__section, .generic-hero, .contact-us-cmp";
  var SIDEBAR_HANDLED_BLOCKS = /* @__PURE__ */ new Set([
    "hero-banner",
    "hero-full-width",
    "hero-campaign",
    "hero-event",
    "hero-product",
    "banner-contact-split"
  ]);
  function discoverAndParseBlocks(document, url, params, opts = {}) {
    const pageBlocks = findBlocksOnPage(document);
    const rendered = [];
    const parsedNames = [];
    const unparsed = [];
    pageBlocks.forEach(({ def, element }) => {
      if (!element || !element.parentNode) return;
      if (opts.excludeSidebarHandled) {
        if (SIDEBAR_HANDLED_BLOCKS.has(def.name)) return;
        if (element.closest && element.closest(SIDEBAR_HANDLED_CONTAINERS)) return;
      }
      const before = new Set(document.querySelectorAll("table"));
      const collectCreated = () => {
        Array.from(document.querySelectorAll("table")).forEach((t) => {
          if (!before.has(t) && !t.closest("table td")) rendered.push(t);
        });
      };
      if (def.render === "seed-from-draft") {
        if (!parsers[def.name]) {
          try {
            if (seedFromDraft(def, element, document)) {
              parsedNames.push(def.name);
              collectCreated();
            }
          } catch (e) {
            console.error(`[master] seed ${def.name} failed:`, e);
          }
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
    executeTransformers("afterTransform", main, { document, url, params });
    const pageMeta = [];
    if (hasContactWidget(document)) {
      pageMeta.push(["contactus", "true"]);
      const t = document.querySelector(".contact-us-cmp .contact-us-title, .contact-us-cmp h2, .contact-us__cmp .contactus__heading");
      const tagline = t ? (t.textContent || "").replace(/\s+/g, " ").trim() : "";
      if (tagline) pageMeta.push(["contactus-tagline", tagline]);
    }
    rewriteInternalLinks(main);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    main.appendChild(document.createElement("hr"));
    main.appendChild(buildMetadataBlock(document, pageMeta));
    if (unparsed.length) {
      console.warn(`[master] ${unparsed.length} block type(s) left in place (no parser yet): ${unparsed.join(", ")}`);
    }
    return {
      element: main,
      path: finalizePath(params),
      report: {
        title: document.title,
        pageType: "default",
        blocks: rendered,
        blocksLeftInPlace: unparsed,
        pageMetadata: pageMeta.map((p) => p[0])
      }
    };
  }
  var import_grace_master_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      executeTransformers("beforeTransform", document.body, payload);
      const hasForm = detectForm(document);
      let result;
      if (isInsightsArticle(document, params.originalURL || url)) {
        result = buildInsightsArticle(document, url, params);
      } else if (isSidebarPage(document)) {
        result = buildSidebarPage(document, url, params);
      } else {
        result = buildDefaultPage(document, url, params);
      }
      result.report.hasForm = hasForm;
      return [result];
    }
  };
  return __toCommonJS(import_grace_master_exports);
})();
