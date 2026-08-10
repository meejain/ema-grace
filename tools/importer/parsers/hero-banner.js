/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-banner block
 *
 * Source: https://grace.com/
 * Base Block: hero
 *
 * Block Structure (from markdown example):
 * - Row 1: Background image
 * - Row 2: Heading + CTA link
 *
 * Source HTML Pattern (from captured DOM):
 * <div class="hero__section ... background-image ...">
 *   <img src="...hero-image.jpg">
 *   <div class="hero__content">
 *     <div class="hero__headings">
 *       <div class="hero__heading h1"><h1><strong>Heading</strong></h1></div>
 *       <div class="hero__button">
 *         <a class="btn-primary" href="/products/"><span class="cmp-button__text">CTA</span></a>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-26
 */
export default function parse(element, { document }) {
  // Extract background image
  // VALIDATED: Found <img src="..."> as direct child of .hero__section at line 200
  const bgImage = element.querySelector(':scope > img')
    || element.querySelector('img');

  // Extract heading. Prefer an explicit heading tag, but some Grace heroes put the TITLE in a
  // bare <p> inside `.hero__heading` (e.g. `.hero__heading.h2 > p`, no h-tag — the 2025 press
  // releases). In that case promote the primary .hero__heading's text to an <h1> so it renders
  // as the large hero title, not 14px body text. Without this the title falls through to the
  // subheading path and shrinks (a real defect caught by side-by-side visual comparison).
  const headingHost = element.querySelector('.hero__headings .hero__heading, .hero__heading');
  let heading = element.querySelector('.hero__heading h1, .hero__heading h2, .hero__heading h3')
    || element.querySelector('h1')
    || element.querySelector('h2');
  if (!heading && headingHost) {
    const t = (headingHost.textContent || '').replace(/\s+/g, ' ').trim();
    if (t) { heading = document.createElement('h1'); heading.textContent = t; }
  }

  // Extract subheading / additional hero text (the EDS Hero convention allows a subheading in
  // the content row). Grace heroes carry secondary text as a subheading, a second-level
  // .hero__heading, or a legal .patent-number line — capture whichever is present so no source
  // text is dropped. Exclude the element used as the heading (headingHost) and the CTA region.
  const subCandidates = element.querySelectorAll('.hero__subheading, .hero__heading.h2, .hero__heading.h3, .patent-number');
  const subEl = Array.from(subCandidates).find((el) => el !== headingHost);
  let subText = subEl ? (subEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
  // Product heroes carry the subtitle as a BARE <p> in `.hero__content`/`.hero__content-inner`
  // (no subheading class) — a sibling of the title, before the `.button__section` CTA. If no
  // classed subheading was found, take the first content <p> whose text differs from the title
  // and isn't part of the button region, so the subtitle ("Reduce Glycidyl Esters…") isn't lost.
  if (!subText) {
    const headingText = heading ? (heading.textContent || '').replace(/\s+/g, ' ').trim() : '';
    const contentHost = element.querySelector('.hero__content-inner, .hero__content');
    if (contentHost) {
      const p = Array.from(contentHost.querySelectorAll('p')).find((el) => {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        return t && t !== headingText && !el.closest('.button__section, .hero__button');
      });
      if (p) subText = (p.textContent || '').replace(/\s+/g, ' ').trim();
    }
  }

  // Extract CTA button/link. Grace's PRODUCT hero carries a CTA inside `.button__section`, and
  // that CTA is frequently a gated-download `<button>` (not an <a>): its real target is a base64
  // string in the `href` attribute (data-trigger-type="gated-modal"). So look for a <button>
  // there too and decode it. Banner heroes (press releases, about-grace) have NO such CTA.
  const decodeGatedHref = (el) => {
    if (!el) return '';
    if (el.tagName === 'A' && el.getAttribute('href')) return el.getAttribute('href');
    const raw = el.getAttribute('href') || '';
    // gated buttons store a base64-encoded path in href; decode when it isn't already a URL/path.
    if (raw && !/^(https?:|\/|#|mailto:)/i.test(raw)) {
      try { const d = (typeof atob === 'function' ? atob(raw) : Buffer.from(raw, 'base64').toString('utf8')); if (/^\/|^https?:/i.test(d)) return d; } catch (e) { /* not base64 */ }
    }
    return raw;
  };
  const ctaEl = element.querySelector('.hero__button a.btn-primary')
    || element.querySelector('.hero__button a, .hero__button button')
    || element.querySelector('.button__section a, .button__section button');
  const ctaHref = decodeGatedHref(ctaEl);
  const ctaLink = ctaEl && (ctaEl.tagName === 'A' || ctaHref) ? ctaEl : null;

  // Build cells array matching Hero block table structure
  const cells = [];

  // Row 1: Background image (optional)
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: Content - heading + optional subheading + CTA in one cell
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subText && (!heading || subText !== (heading.textContent || '').replace(/\s+/g, ' ').trim())) {
    const sub = document.createElement('p');
    sub.textContent = subText;
    contentCell.push(sub);
  }
  if (ctaLink) {
    // Create a clean link element (works for both <a> heroes and decoded gated <button> CTAs).
    const link = document.createElement('a');
    link.href = ctaHref || ctaLink.href || '';
    link.textContent = (ctaLink.textContent || '').trim();
    contentCell.push(link);
  }
  // ONE row, ONE cell holding heading + subheading + CTA together (hero.css targets the content
  // row as `.hero > div:last-child`). Wrap in an extra array so all elements land in a single
  // cell — a flat `contentCell` would spread them into separate sibling cells and misalign.
  cells.push([contentCell]);

  // Background style, read FROM THE SOURCE. grace.com's reduce-height blue band comes in two
  // flavours, distinguished by the source hero's `gradient` class:
  //   • no `gradient`  → a plain SOLID blue band (#004990), e.g. the PARAGON / braskem PRs
  //   • `gradient`     → the same blue band with a left→right black overlay
  //                      (linear-gradient(to right,#000,transparent)), e.g. molecule-one / ART PRs
  // Only meaningful for the no-image band (an image hero carries its own photo). Emit the authored
  // `gradient` option so `.hero.banner.gradient` CSS paints the overlay; without it the band is solid.
  const hasImage = !!bgImage;
  const sourceHasGradient = (element.className || '').split(/\s+/).includes('gradient');

  // Variant selection:
  //   • PRODUCT hero → the REDUCE-HEIGHT hero of a product/solution page. It carries a CTA in
  //     `.button__section`/`.hero__button` (often a gated-download button). Emits `Hero (product)`
  //     → blocks/hero/ `.hero.product` (left column, green CTA). Requires BOTH the reduce-height
  //     band class AND a CTA: banner heroes (press releases, about-grace) are reduce-height but
  //     have breadcrumb + title only (no CTA), and the tall homepage/full-width hero has a CTA but
  //     is NOT reduce-height — so both stay out of the product branch.
  //   • BANNER hero → short breadcrumb+title band. `Hero (banner)`, or `Hero (banner, gradient)`
  //     for the no-image blue band whose source hero has the `gradient` class.
  const isReduceHeight = (element.className || '').split(/\s+/).includes('hero-reduce-height');
  const isProduct = !!ctaLink && isReduceHeight;
  let name;
  if (isProduct) {
    name = 'Hero (product)';
  } else if (!hasImage && sourceHasGradient) {
    name = 'Hero (banner, gradient)';
  } else {
    name = 'Hero (banner)';
  }

  // Create block using WebImporter utility.
  // Emit the EXISTING `hero` block + `banner` variant → class "hero banner" → loads blocks/hero/.
  // NOT "Hero-Banner" (which slugifies to class "hero-banner" → blocks/hero-banner/ → 404, the
  // block never decorates). blocks/hero/hero.js handles the `banner` variant (styling + a
  // URL-derived breadcrumb). Base block name must be a real folder under blocks/.
  const block = WebImporter.Blocks.createBlock(document, { name, cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
