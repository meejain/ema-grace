import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
} from './aem.js';

// --- BEGIN DM/Scene7 auto-block (excat-generated) ---
// Rebuilds responsive <picture> elements at render time from the carrier anchors
// the import transformer (tools/importer/transformers/grace-dm-images.js) emits
// for Dynamic Media / Scene7 image URLs. Preserving the DM URL (rather than
// letting DA ingest a static copy) keeps the images as live DM references.

const DM_BREAKPOINTS = [
  { media: '(min-width: 600px)', width: 2000 }, // desktop
  { width: 750 }, // mobile / fallback (no media)
];

// ---- Canonical helpers (keep in sync with excat dm-scene7-helpers.js) ----
function detectDynamicMediaUrl(urlStr) {
  // Reject relative URLs up front — without this guard, the auto-block scans
  // every anchor in <main> and a normal site link like `<a href="/is/image/foo">`
  // would be classified as DM and replaced by a <picture>.
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch { return false; }
  // Scene7 detected by path alone — hostname is irrelevant because customer
  // sites routinely CNAME a vanity domain to Scene7.
  if (u.pathname.startsWith('/is/image/')) {
    return 'scene7';
  }
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

function buildScene7Rendition(src, { width, format }) {
  // Manipulate the query string verbatim — URL.searchParams percent-encodes `$`,
  // but Scene7's IS/Image template-parameter syntax (`$image=`, `$badge=`, etc.)
  // requires the literal `$`. The encoded form is silently dropped by Scene7's
  // parser, returning the bare template image instead of the personalized composite.
  const normalized = src.startsWith('//') ? `https:${src}` : src;
  const qIdx = normalized.indexOf('?');
  const base = qIdx >= 0 ? normalized.slice(0, qIdx) : normalized;
  const query = qIdx >= 0 ? normalized.slice(qIdx + 1) : '';
  const pairs = query.split('&').filter((p) => p);
  const filtered = pairs.filter((p) => {
    const k = p.split('=')[0];
    return k !== 'wid' && k !== 'fmt';
  });
  filtered.push(`wid=${width}`);
  filtered.push(`fmt=${format}`);
  return `${base}?${filtered.join('&')}`;
}

function buildDmOpenApiRendition(src, { width }) {
  const url = new URL(src, 'https://x/');
  url.searchParams.set('width', String(width));
  return url.toString();
}

function findDmOnAnchor(a) {
  if (!a || typeof a.getAttribute !== 'function') return null;
  const href = a.getAttribute('href') || '';
  if (detectDynamicMediaUrl(href)) return { mode: 'unlinked', dmUrl: href };
  const title = a.getAttribute('title') || '';
  if (detectDynamicMediaUrl(title)) return { mode: 'linked', dmUrl: title };
  return null;
}

// True when the anchor is the sole child of a markdown-generated <p> wrapper
// that should be unwrapped so the picture becomes a top-level grid cell.
// P only — NEVER DIV: EDS block content uses <div> cells (cards/carousel/columns
// decorators detect image cells via `div.querySelector('picture')`); unwrapping a
// <div> collapses the block's row structure and stops images rendering in blocks.
function isUnwrappableMarkdownParagraph(anchor) {
  const parent = anchor && anchor.parentElement;
  if (!parent || parent.tagName !== 'P') return false;
  if (parent.children.length !== 1 || parent.firstElementChild !== anchor) return false;
  return parent.textContent.trim() === anchor.textContent.trim();
}

// Sentinel used by the transformer when source <img> alt is empty. Translated
// back to alt="" here so screen readers correctly skip decorative images. Must
// stay byte-identical to the transformer's EMPTY_ALT_SENTINEL.
const EMPTY_ALT_SENTINEL = 'Image without alt text';

function linkTextToAlt(linkText) {
  return linkText === EMPTY_ALT_SENTINEL ? '' : linkText;
}

// ---- Rendering ----
function appendSource(picture, { type, srcset, media }) {
  const source = document.createElement('source');
  if (type) source.type = type;
  source.srcset = srcset;
  if (media) source.setAttribute('media', media);
  picture.append(source);
}

function renderScene7Picture(src, alt) {
  const picture = document.createElement('picture');
  DM_BREAKPOINTS.forEach((bp) => appendSource(picture, {
    type: 'image/webp',
    srcset: buildScene7Rendition(src, { width: bp.width, format: 'webp' }),
    media: bp.media,
  }));
  DM_BREAKPOINTS.forEach((bp) => appendSource(picture, {
    type: 'image/jpeg',
    srcset: buildScene7Rendition(src, { width: bp.width, format: 'jpg' }),
    media: bp.media,
  }));
  const img = document.createElement('img');
  img.src = buildScene7Rendition(src, { width: 750, format: 'jpg' });
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

function renderDmOpenApiPicture(src, alt) {
  const picture = document.createElement('picture');
  DM_BREAKPOINTS.forEach((bp) => appendSource(picture, {
    srcset: buildDmOpenApiRendition(src, { width: bp.width }),
    media: bp.media,
  }));
  const img = document.createElement('img');
  img.src = buildDmOpenApiRendition(src, { width: 750 });
  img.alt = alt;
  img.loading = 'lazy';
  picture.append(img);
  return picture;
}

function buildDynamicMediaImages(main) {
  main.querySelectorAll('a').forEach((a) => {
    const match = findDmOnAnchor(a);
    if (!match) return;

    const { mode, dmUrl } = match;
    const alt = linkTextToAlt(a.textContent.trim());
    const picture = detectDynamicMediaUrl(dmUrl) === 'scene7'
      ? renderScene7Picture(dmUrl, alt)
      : renderDmOpenApiPicture(dmUrl, alt);

    // If decorateButtons already promoted the plain-text DM anchor to a button,
    // strip the button classes/container before rebuilding so no stray border
    // wraps the picture. Idempotent — no-op when the classes aren't present.
    a.classList.remove('button', 'primary', 'secondary');
    if (a.classList.length === 0) a.removeAttribute('class');
    const buttonContainer = a.parentElement;
    if (
      buttonContainer
      && buttonContainer.classList.contains('button-container')
      && buttonContainer.children.length === 1
    ) {
      buttonContainer.classList.remove('button-container');
      if (buttonContainer.classList.length === 0) buttonContainer.removeAttribute('class');
    }

    if (mode === 'linked') {
      // Keep the outer <a> and its navigation href; drop the consumed DM title
      // and replace the anchor's content with the picture.
      a.removeAttribute('title');
      a.replaceChildren(picture);
      return;
    }

    // Unlinked: the whole anchor is just a carrier for the DM URL. Unwrap a
    // markdown <p> wrapper so the picture becomes a top-level grid cell; NEVER
    // unwrap <div> (block-content cells).
    if (isUnwrappableMarkdownParagraph(a)) {
      a.parentElement.replaceWith(picture);
    } else {
      a.replaceWith(picture);
    }
  });
}

// Register the DM dispatcher for createOptimizedPicture interop. A matching
// aem.js patch (not applied in this project — aem.js is untouchable) would
// delegate DM URLs here; standalone DM images render via buildDynamicMediaImages
// regardless, and blocks/cards already skips createOptimizedPicture for
// cross-origin src. No-op for non-DM URLs (returns null).
// eslint-disable-next-line no-underscore-dangle
window.__dmRender__ = (src, alt) => {
  const family = detectDynamicMediaUrl(src);
  if (!family) return null;
  return family === 'scene7'
    ? renderScene7Picture(src, alt)
    : renderDmOpenApiPicture(src, alt);
};
// --- END DM/Scene7 auto-block ---

// Default content for the metadata-driven "Contact Us" sticky widget.
// Authors opt in per page via a `contactus` metadata flag; the heading,
// tagline and CTA links can be overridden with `contactus-*` metadata.
const CONTACT_STICKY_DEFAULTS = {
  heading: 'Contact Us',
  tagline: 'Talk to our experts to see how we can best help your business',
  links: [
    { label: 'Product and service inquiries', href: '/forms/contact-us-product-and-services/' },
    { label: 'Non-product related inquiries', href: '/forms/contact-us-corporate/' },
  ],
};

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    // Check if h1 or picture is already inside a hero block
    if (h1.closest('[class*="hero"]') || picture.closest('[class*="hero"]')) {
      return; // Don't create a duplicate hero block
    }
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * Builds the metadata-driven "Contact Us" sticky widget and inserts it right
 * after the hero (or at the top of main) when the page metadata opts in via a
 * `contactus` flag. Content defaults to the standard Contact Us copy but can be
 * overridden with `contactus-heading` / `contactus-tagline` metadata.
 * @param {Element} main The container element
 */
function buildContactStickyBlock(main) {
  // Only inject into the real page main. Fragments (header/footer) run through
  // decorateMain on a detached main and must not receive the widget.
  if (!document.body.contains(main)) return;
  const flag = getMetadata('contactus').trim().toLowerCase();
  if (!flag || ['false', 'no', '0', 'off'].includes(flag)) return;
  if (main.querySelector('.custom-widget.contact-sticky')) return;

  const heading = getMetadata('contactus-heading').trim() || CONTACT_STICKY_DEFAULTS.heading;
  const tagline = getMetadata('contactus-tagline').trim() || CONTACT_STICKY_DEFAULTS.tagline;
  const list = document.createElement('ul');
  CONTACT_STICKY_DEFAULTS.links.forEach(({ label, href }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    li.append(a);
    list.append(li);
  });

  const block = buildBlock('custom-widget', [[heading], [tagline], [{ elems: [list] }]]);
  block.classList.add('contact-sticky');
  const section = document.createElement('div');
  section.append(block);

  const hero = main.querySelector('.hero, [class*="hero"]');
  const heroSection = hero ? hero.closest('main > div') : null;
  if (heroSection) heroSection.after(section);
  else main.prepend(section);
}

/**
 * Auto-block the insights-article breadcrumb. The breadcrumb is NOT authored —
 * blocks/breadcrumb/breadcrumb.js derives the whole trail from the URL path
 * (Home + ancestor segments, current page dropped, e.g. "Home / Insights"), so
 * we synthesize an empty breadcrumb block at the top of the article's left rail
 * at render time. This keeps the breadcrumb out of the authoring surface while
 * still producing the `.breadcrumb-container` section wrapper the sidebar
 * template CSS keys the insights rail layout off of.
 *
 * The rail is identified by its Post Meta block (insights-article specific).
 * Rails that already carry an authored `.breadcrumb` (legacy content not yet
 * re-imported) are skipped, so this is safe during the transition.
 * @param {Element} main The container element
 */
function buildBreadcrumbBlock(main) {
  if (!document.body.contains(main)) return;
  // The insights left rail is identified by the Social (share) block (present on
  // every article rail). Post Meta is NOT a reliable signal — it is itself
  // auto-blocked (buildPostMetaBlock) and may not exist yet.
  const rail = [...main.querySelectorAll(':scope > div')].find(
    (d) => d.querySelector('.social.share, .social') && !d.querySelector('.breadcrumb'),
  );
  if (!rail) return;
  // Content is ignored by breadcrumb.js (it rebuilds from the URL); an empty
  // cell is enough to make this a recognized block.
  const block = buildBlock('breadcrumb', [['']]);
  rail.prepend(block);
}

/**
 * Auto-block the insights-article POSTED / INDUSTRY panel. These are page-level
 * metadata (`published` + `industry` rows in the Metadata block), NOT authored
 * content, so we rebuild the left-rail definition-list panel at render time from
 * `getMetadata()`. Matches the source visually (POSTED label + date, INDUSTRY
 * label + value) while keeping all page data in the single Metadata table.
 *
 * Reuses the existing `post-meta` block (its CSS/JS render the styled <dl>); we
 * synthesize the block's authored table shape (row = [label, value]) so the
 * block JS produces the same markup as before. Placed in the rail after any
 * existing content. Skipped when neither value is present, or when the rail
 * already carries an authored `.post-meta` (legacy content not yet re-imported).
 * @param {Element} main The container element
 */
function buildPostMetaBlock(main) {
  if (!document.body.contains(main)) return;
  const published = getMetadata('published').trim();
  const industry = getMetadata('industry').trim();
  if (!published && !industry) return;
  const rail = [...main.querySelectorAll(':scope > div')].find(
    (d) => (d.querySelector('.social.share, .social') || d.querySelector('.breadcrumb')) && !d.querySelector('.post-meta'),
  );
  if (!rail) return;
  const rows = [];
  if (published) rows.push(['POSTED', published]);
  if (industry) rows.push(['INDUSTRY', industry]);
  const block = buildBlock('post-meta', rows);
  rail.append(block);
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    // auto load `*/fragments/*` references
    const fragments = [...main.querySelectorAll('a[href*="/fragments/"]')].filter((f) => !f.closest('.fragment'));
    if (fragments.length > 0) {
      // eslint-disable-next-line import/no-cycle
      import('../blocks/fragment/fragment.js').then(({ loadFragment }) => {
        fragments.forEach(async (fragment) => {
          try {
            const { pathname } = new URL(fragment.href);
            const frag = await loadFragment(pathname);
            fragment.parentElement.replaceWith(...frag.children);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Fragment loading failed', error);
          }
        });
      });
    }

    // Rebuild DM/Scene7 carrier anchors into <picture> FIRST — buildHeroBlock
    // below looks for a <picture> after the H1, which only exists once the
    // hero's DM anchor has been converted.
    buildDynamicMediaImages(main);
    buildHeroBlock(main);
    buildContactStickyBlock(main);
    // Breadcrumb + POSTED/INDUSTRY rail panels are insights-article (sidebar
    // template) specific. Gate them to the sidebar template — otherwise a
    // non-insights page that merely carries a Social ("Follow Us") block (e.g.
    // product-detail syloid-rad / syloid-mx / reflectn) matches the rail
    // heuristic and gets a stray mid-page "Home / Products" breadcrumb injected.
    if (getMetadata('template').trim().toLowerCase() === 'sidebar') {
      buildBreadcrumbBlock(main);
      buildPostMetaBlock(main);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    // quick structural checks
    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    // skip URL display links
    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch { /* continue */ }

    // require authored formatting for buttonization
    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) { // high-impact call-to-action
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Removes inert empty anchors (`<a href="">` with no text/image), which are decorative
 * scaffolding left over from some source components (e.g. the "statistic" stat-card, whose
 * clickable wrapper anchor is emitted around now-flattened content). They carry no
 * destination or label, so they render as invisible zero-content links that fail the
 * WCAG "link has discernible text" (link-name) check. Strip them at decoration time; if the
 * anchor is the only child of a wrapper `<p>`, drop the emptied paragraph too.
 * @param {Element} main The main element
 */
function removeEmptyLinks(main) {
  main.querySelectorAll('a').forEach((a) => {
    const href = (a.getAttribute('href') || '').trim();
    const hasDestination = href && href !== '#';
    const hasContent = a.textContent.trim() || a.querySelector('img, picture, svg');
    if (hasDestination || hasContent) return;
    const parent = a.parentElement;
    a.remove();
    if (parent && parent.tagName === 'P' && !parent.textContent.trim()
      && !parent.querySelector('img, picture, a, br, table')) {
      parent.remove();
    }
  });
}

/**
 * Opens cross-origin links in a new tab. Authored `target="_blank"` is stripped by
 * the markdown round-trip, so external links (different origin, http/https) get the
 * new-tab behavior + safe rel here at decoration time, matching the source site.
 * @param {Element} main The main element
 */
function decorateExternalLinks(main) {
  main.querySelectorAll('a[href]').forEach((a) => {
    const { href } = a;
    if (!/^https?:\/\//i.test(href)) return;
    try {
      if (new URL(href).origin === window.location.origin) return;
    } catch {
      return;
    }
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
  removeEmptyLinks(main);
  decorateExternalLinks(main);
}

/**
 * Normalizes the `template` metadata value to a safe file/dir name, or returns
 * an empty string when no template is set.
 * @returns {string} the sanitized template name (e.g. `sidebar`) or ''
 */
function getTemplateName() {
  const template = getMetadata('template');
  if (!template) return '';
  return template.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

/**
 * Loads a page template's CSS EAGERLY (blocking) so the template layout is in
 * place at first paint. The body is hidden (`display:none` until `.appear`)
 * during eager load, so awaiting the CSS here means the correct layout paints
 * immediately with no flash-of-default-layout / layout shift (CLS). Called
 * before `body.appear` is added.
 */
async function loadTemplateCSS() {
  const name = getTemplateName();
  if (!name) return;
  try {
    await loadCSS(`${window.hlx.codeBasePath}/templates/${name}/${name}.css`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Template ${name} CSS failed to load`, e);
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    // Load the template CSS BEFORE revealing the body so the template layout
    // (e.g. the sidebar grid) paints on the first frame — otherwise the body
    // appears in the default single-column layout and shifts when the template
    // CSS arrives later in the lazy phase (flash of unstyled layout / CLS).
    await loadTemplateCSS();
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads a page template's optional JS in the lazy phase. Template files live in
 * /templates/{name}/{name}.{css,js}; the JS default export (if any) is called
 * with the main element. The CSS is loaded eagerly by loadTemplateCSS().
 * @param {Element} main The main element
 */
async function loadTemplate(main) {
  const name = getTemplateName();
  if (!name) return;
  try {
    const mod = await import(`${window.hlx.codeBasePath}/templates/${name}/${name}.js`);
    if (mod.default) await mod.default(main);
  } catch (e) {
    // template has no JS (CSS-only) — ignore
  }
}

async function loadLazy(doc) {
  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  await loadTemplate(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
