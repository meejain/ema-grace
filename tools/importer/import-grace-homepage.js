/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import cardsProductParser from './parsers/cards-product.js';
import columnsPeopleParser from './parsers/columns-people.js';
import cardsIndustryParser from './parsers/cards-industry.js';
import embedVideoParser from './parsers/embed-video.js';
import cardsInsightParser from './parsers/cards-insight.js';

// TRANSFORMER IMPORTS
import graceCleanupTransformer from './transformers/grace-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'cards-product': cardsProductParser,
  'columns-people': columnsPeopleParser,
  'cards-industry': cardsIndustryParser,
  'embed-video': embedVideoParser,
  'cards-insight': cardsInsightParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  graceCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'grace-homepage',
  description: 'Grace.com homepage with hero banner, product cards, people columns, industry cards, video embed, and insight cards sections',
  urls: ['https://grace.com/'],
  blocks: [
    { name: 'hero-banner', instances: ['.hero__section'] },
    { name: 'cards-product', instances: ['.cmp-card.bio'] },
    { name: 'columns-people', instances: ['.cmp-image__link'] },
    { name: 'cards-industry', instances: ['section.background-image .card-group'] },
    { name: 'embed-video', instances: ['.cmp-media-callout.slate-bkgd .media-video'] },
    { name: 'cards-insight', instances: ['section#blogs .media-callout'] },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

/**
 * Create a Section Metadata block table with the given style value.
 */
function createSectionMetadata(document, styleValue) {
  return WebImporter.Blocks.createBlock(document, {
    name: 'Section Metadata',
    cells: [['Style', styleValue]],
  });
}

/**
 * Rewrite internal links (old xmod-gracev1 preview host, grace.com absolute,
 * and AEM /content/grace/us/en paths) to root-relative paths.
 */
function rewriteInternalLinks(main, document) {
  const anchors = main.querySelectorAll('a[href]');
  anchors.forEach((a) => {
    let href = a.getAttribute('href');
    if (!href) return;

    // Normalize protocol-relative
    if (href.startsWith('//')) href = `https:${href}`;

    try {
      // Absolute URL handling
      if (/^https?:\/\//i.test(href)) {
        const u = new URL(href);
        const host = u.hostname;
        const isInternal = host === 'grace.com'
          || host.endsWith('.grace.com') && host !== 'jobs.grace.com'
          || host.includes('xmod-gracev1')
          || host.includes('--ema-grace--')
          || host.includes('aem.live')
          || host.includes('aem.page');
        // Keep truly external links (jobs.grace.com, linkedin, standardindustries) intact
        if (isInternal) {
          let path = u.pathname;
          // Strip AEM content path prefix
          path = path.replace(/^\/content\/grace\/us\/en/, '');
          // Strip .html extension
          path = path.replace(/\.html$/, '');
          // Collapse trailing slash (but keep root)
          if (path.length > 1) path = path.replace(/\/$/, '');
          if (path === '') path = '/';
          a.setAttribute('href', path);
        }
        return;
      }

      // Relative path handling (already root-relative or ./)
      if (href.startsWith('/')) {
        let path = href.replace(/^\/content\/grace\/us\/en/, '').replace(/\.html$/, '');
        if (path.length > 1) path = path.replace(/\/$/, '');
        if (path === '') path = '/';
        a.setAttribute('href', path);
      }
    } catch (e) {
      // Leave malformed hrefs untouched
    }
  });
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // Capture anchor sections BEFORE parsing (parsers replace elements).
    const introEl = (() => {
      // Intro "A global leader..." lives in the first article after hero.
      const p = Array.from(document.querySelectorAll('p'))
        .find((el) => /global leader in specialty chemicals/i.test(el.textContent));
      return p ? (p.closest('article') || p.parentElement) : null;
    })();
    const embedBlockEl = pageBlocks.find((b) => b.name === 'embed-video')?.element || null;
    const embedSectionEl = embedBlockEl
      ? (embedBlockEl.closest('.cmp-media-callout') || embedBlockEl.closest('article')) : null;
    const insightBlockEl = pageBlocks.find((b) => b.name === 'cards-insight')?.element || null;
    const insightSectionEl = insightBlockEl ? insightBlockEl.closest('section#blogs') : null;

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform cleanup
    executeTransformers('afterTransform', main, payload);

    // 5. Section styling: append Section Metadata after the intro (light-gray),
    //    embed video section (dark), and insights section (light-gray).
    if (introEl && introEl.parentNode) {
      introEl.appendChild(createSectionMetadata(document, 'light-gray'));
      introEl.parentNode.insertBefore(document.createElement('hr'), introEl.nextSibling);
    }
    if (embedSectionEl && embedSectionEl.parentNode) {
      embedSectionEl.appendChild(createSectionMetadata(document, 'dark'));
      embedSectionEl.parentNode.insertBefore(document.createElement('hr'), embedSectionEl);
    }
    if (insightSectionEl && insightSectionEl.parentNode) {
      insightSectionEl.appendChild(createSectionMetadata(document, 'light-gray'));
      insightSectionEl.parentNode.insertBefore(document.createElement('hr'), insightSectionEl);
    }

    // 6. Rewrite internal links to root-relative before adjustImageUrls
    rewriteInternalLinks(main, document);

    // 7. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 8. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
