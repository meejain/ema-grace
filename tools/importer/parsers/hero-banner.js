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

  // Extract heading
  // VALIDATED: Found <h1><strong>...</strong></h1> inside .hero__heading at line 210-212
  const heading = element.querySelector('.hero__heading h1')
    || element.querySelector('h1')
    || element.querySelector('h2');

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

  // Row 2: Content - heading + CTA in one cell
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (ctaLink) {
    // Create a clean link element
    const link = document.createElement('a');
    link.href = ctaLink.href;
    link.textContent = ctaLink.textContent.trim();
    contentCell.push(link);
  }
  cells.push(contentCell);

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Hero-Banner', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
