/* eslint-disable */
/* global WebImporter */

/**
 * TEST IMPORT SCRIPT — single page proof of the "sidebar" template.
 *
 * Target: https://grace.com/compliance/compliance-gdpr-de/
 *
 * What this page actually contains (verified live, rendered DOM):
 *  - Layout: left section-nav column + main content column + right contact-us widget.
 *    => emit page metadata `template: sidebar` and `contactus: true`.
 *  - Left section-nav: sibling Compliance links (JS-hydrated; present after networkidle).
 *    => emit as a leading section tagged with Section Metadata Style = `sidebar-nav`.
 *  - Main content column (.col-lg-7): one large rich-text block (h2/h3/p/ul) = default content.
 *  - All other components (media-callout, card-list, quote, accordion, table) render EMPTY
 *    on this page and must be skipped (never emit empty blocks).
 *
 * Scoped to THIS page/template only — not the 400-page master importer.
 */

import graceCleanupTransformer from './transformers/grace-cleanup.js';

const transformers = [graceCleanupTransformer];

function executeTransformers(hookName, element, payload) {
  transformers.forEach((fn) => {
    try { fn.call(null, hookName, element, payload); } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/** Section Metadata block with a Style value (e.g. sidebar-nav). */
function createSectionMetadata(document, styleValue) {
  return WebImporter.Blocks.createBlock(document, {
    name: 'Section Metadata',
    cells: [['Style', styleValue]],
  });
}

/**
 * Build the Metadata block ourselves. WebImporter.rules.createMetadata emits only
 * standard fields (Title/Description/Image) and, at transform time, the block is a
 * <table> (the `.metadata` class is added later during markdown conversion), so we
 * cannot append rows to it after the fact. Instead we assemble the full cell list —
 * Title + our custom page metadata (template, contactus) — and create one block.
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

/**
 * Rewrite grace.com / AEM /content/grace/us/en links to root-relative paths.
 * (Same rule as the homepage importer.)
 */
function rewriteInternalLinks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    let href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('//')) href = `https:${href}`;
    try {
      if (/^https?:\/\//i.test(href)) {
        const u = new URL(href);
        const host = u.hostname;
        const isInternal = host === 'grace.com'
          || (host.endsWith('.grace.com') && host !== 'jobs.grace.com')
          || host.includes('xmod-gracev1') || host.includes('--ema-grace--')
          || host.includes('aem.live') || host.includes('aem.page');
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

/**
 * Build the left section-nav as a leading section: a UL of sibling-page links,
 * tagged with Section Metadata Style = sidebar-nav so templates/sidebar/sidebar.css
 * pins it to column 1. Reads the rendered nav links; de-dupes; skips the current page.
 * Returns the built section element (or null if no nav found).
 */
function buildSidebarNav(document, currentPath) {
  // Rendered section-nav lives in the left col; links point to sibling compliance pages.
  const navAnchors = Array.from(document.querySelectorAll(
    'article [aria-label="Section navigation"] a, article .section-nav a, article .col-lg-2 a',
  ));
  if (!navAnchors.length) return null;

  const seen = new Set();
  const ul = document.createElement('ul');
  navAnchors.forEach((a) => {
    const text = (a.textContent || '').replace(/\s+/g, ' ').trim();
    let href = a.getAttribute('href') || '';
    if (!text || !href) return;
    // normalize to compare/dedupe (link rewriting happens later globally)
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

/**
 * Extract the main content column (.col-lg-7 rich text) as clean default content.
 * Returns an array of content nodes (headings / paragraphs / lists) or [].
 */
function extractMainContent(document) {
  // The main column holds the primary rich-text. Anchor via a heading inside col-lg-7.
  const mainCol = document.querySelector('article .col-lg-7')
    || (document.querySelector('article h2') && document.querySelector('article h2').closest('[class*="col-"]'));
  if (!mainCol) return [];
  const rich = mainCol.querySelector('.rich-text') || mainCol;
  // Only keep meaningful content elements; drop empty component shells.
  const nodes = Array.from(rich.children).filter((el) => {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return false;
    return (el.textContent || '').trim().length > 0 || el.querySelector('img');
  });
  return nodes;
}

/**
 * Build the hero as the EXISTING `hero` block, `banner` variant — reused, not
 * hand-rolled. The banner variant (source hero__section reduce-height, 178px):
 *   - `banner`   -> short breadcrumb+title band; hero.js auto-generates the
 *                   breadcrumb from the URL path,
 *   - `no-image` -> auto-added by hero.js when no picture is present; the banner
 *                   no-image case paints the solid blue #004990 band + white text.
 * So the importer only emits the block with the page H1 in one cell.
 * Returns the block element (a <table> at transform time) or null.
 */
function buildHeroBlock(document) {
  const h1src = document.querySelector('article h1, .hero h1, h1');
  const title = h1src ? (h1src.textContent || '').trim() : (document.title || '').trim();
  if (!title) return null;
  const h1 = document.createElement('h1');
  h1.textContent = title;
  // "Hero (banner)" -> block classes `hero banner`.
  return WebImporter.Blocks.createBlock(document, { name: 'Hero (banner)', cells: [[h1]] });
}

/**
 * Build the "Want to talk to an expert?" contact-split banner that sits above
 * the footer (source `.contact-us-cmp`, an experience fragment). Emits the EDS
 * `Banner (contact-split)` block: row 1 = title, row 2 = the two inquiry-column
 * halves. Each half keeps its heading, CTA link, intro copy and bullet list.
 * Returns the block element or null when the banner is absent.
 */
function buildContactSplitBanner(document) {
  const cmp = document.querySelector('.contact-us-cmp');
  if (!cmp) return null;

  const titleEl = cmp.querySelector('.contact-us-title, h2');
  const title = titleEl ? (titleEl.textContent || '').replace(/\s+/g, ' ').trim() : 'Want to talk to an expert?';

  // Each half is a .col-lg-6 inside the .row.has-title.
  const cols = Array.from(cmp.querySelectorAll('.row.has-title > [class*="col-lg-6"], .row.has-title > [class*="col-"]'));
  const halfCells = cols.map((col) => {
    const cell = [];
    // Heading (h3), CTA link, intro paragraph(s) and the bullet list, in order.
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
    // Intro paragraph ("For all ... including:") — the rich-text <p> that is not the heading.
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

  // Row 1: title (single cell). Row 2: one cell per half.
  const cells = [[title], halfCells];
  return WebImporter.Blocks.createBlock(document, { name: 'Banner (contact-split)', cells });
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    // 1. site-wide chrome cleanup
    executeTransformers('beforeTransform', document.body, payload);

    // 2. build the new main from scratch:
    //    [ hero/title band, sidebar-nav section, main content section ]
    const currentPath = new URL(params.originalURL).pathname;
    const main = document.createElement('main');

    const heroBlock = buildHeroBlock(document);
    if (heroBlock) {
      const heroSection = document.createElement('div');
      heroSection.append(heroBlock);
      main.append(heroSection);
      main.append(document.createElement('hr'));
    }

    const navSection = buildSidebarNav(document, currentPath);
    if (navSection) main.append(navSection);

    const contentNodes = extractMainContent(document);
    if (contentNodes.length) {
      // Section break: EDS separates sections on <hr> (-> ---). Without it the nav
      // and content merge into one section and the sidebar-nav style bleeds onto the body.
      if (navSection) main.append(document.createElement('hr'));
      const contentSection = document.createElement('div');
      contentNodes.forEach((n) => contentSection.append(n));
      main.append(contentSection);
    }

    // 2b. Contact-split banner ("Want to talk to an expert?") above the footer.
    //     Full-width section below the sidebar content, so give it its own section break.
    const contactBanner = buildContactSplitBanner(document);
    if (contactBanner) {
      main.append(document.createElement('hr'));
      const bannerSection = document.createElement('div');
      bannerSection.append(contactBanner);
      main.append(bannerSection);
    }

    // 3. page-level metadata: sidebar template + contactus widget flag.
    //    (contact widget is auto-built by scripts.js from the contactus flag — not authored.)
    // Contact widget tagline: source uses the short "Want to talk to an expert?"
    // line (read from the source contact-us-cmp title when present).
    const cmpTitleEl = document.querySelector('.contact-us-cmp .contact-us-title, .contact-us-cmp h2');
    const contactTagline = cmpTitleEl
      ? (cmpTitleEl.textContent || '').replace(/\s+/g, ' ').trim()
      : 'Want to talk to an expert?';

    // Breadcrumb current-page label: source uses the full page title
    // (e.g. "Compliance - GDPR (German)"), not the humanized URL slug. Read the
    // source breadcrumb's last crumb; the hero block uses `breadcrumb-title` metadata.
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

    // 4. links + image urls, then our own Metadata block (Title + template + contactus)
    rewriteInternalLinks(main);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    main.appendChild(document.createElement('hr'));
    main.appendChild(buildMetadataBlock(document, pageMeta));

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: 'sidebar',
        pageMetadata: pageMeta.map((p) => p[0]),
        sidebarNav: !!navSection,
        contentNodes: contentNodes.length,
      },
    }];
  },
};
