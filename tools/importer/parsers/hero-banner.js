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
  const subText = subEl ? (subEl.textContent || '').replace(/\s+/g, ' ').trim() : '';

  // Extract CTA button/link
  // VALIDATED: Found <a class="btn-primary btn-primary-green" href="/products/"> at line 217
  const ctaLink = element.querySelector('.hero__button a.btn-primary')
    || element.querySelector('.hero__button a')
    || element.querySelector('.button__section a');

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
    // Create a clean link element
    const link = document.createElement('a');
    link.href = ctaLink.href;
    link.textContent = ctaLink.textContent.trim();
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
  const name = (!hasImage && sourceHasGradient) ? 'Hero (banner, gradient)' : 'Hero (banner)';

  // Create block using WebImporter utility.
  // Emit the EXISTING `hero` block + `banner` variant → class "hero banner" → loads blocks/hero/.
  // NOT "Hero-Banner" (which slugifies to class "hero-banner" → blocks/hero-banner/ → 404, the
  // block never decorates). blocks/hero/hero.js handles the `banner` variant (styling + a
  // URL-derived breadcrumb). Base block name must be a real folder under blocks/.
  const block = WebImporter.Blocks.createBlock(document, { name, cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
