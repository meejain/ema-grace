/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-people block
 *
 * Source: https://grace.com/
 * Base Block: columns
 *
 * Block Structure (from markdown example):
 * - Row 1: Column 1 content | Column 2 content
 *   Each column: Image + text paragraph + CTA button
 *
 * Source HTML Pattern (from captured DOM):
 * <div class="row">
 *   <div class="col-xs-12 col-lg-6">
 *     <div class="section">
 *       <section class="white-bkgd">
 *         <article>
 *           <div class="image">
 *             <div class="cmp-image">
 *               <a class="cmp-image__link" href="/people-and-careers/life-at-grace/">
 *                 <img class="cmp-image__image" alt="..." src="...">
 *               </a>
 *             </div>
 *           </div>
 *           <div class="text"><div class="rich-text"><p>Text content</p></div></div>
 *           <div class="button">
 *             <a class="btn-primary btn-primary-white" href="..."><span>CTA text</span></a>
 *           </div>
 *         </article>
 *       </section>
 *     </div>
 *   </div>
 *   <div class="col-xs-12 col-lg-6">...</div>
 * </div>
 *
 * Generated: 2026-02-26
 */
export default function parse(element, { document }) {
  // Find columns - navigate to the container that directly holds the two
  // .col-lg-6 columns. The image link is nested inside its own inner .row,
  // so closest('.row') returns the wrong (inner) container; walk up until we
  // reach an ancestor containing 2+ .col-lg-6 columns.
  // VALIDATED: two .col-lg-6 columns, each with image + rich-text + button.
  let container = element;
  if (element.classList.contains('cmp-image__link') || element.tagName === 'A' || element.tagName === 'IMG') {
    let ancestor = element.parentElement;
    while (ancestor && ancestor.tagName !== 'BODY') {
      if (ancestor.querySelectorAll('.col-lg-6').length >= 2) break;
      ancestor = ancestor.parentElement;
    }
    container = ancestor || element.closest('.row') || element.closest('section') || element.parentElement;
  }

  // Find column containers
  let columns = Array.from(container.querySelectorAll(':scope > .col-lg-6'));
  if (!columns.length) {
    columns = Array.from(container.querySelectorAll('.col-lg-6'));
  }

  // Build cells array - single row with N columns
  // (createBlock prepends the "Columns-People" name row per EDS convention;
  //  this content row has one cell per column, matching the columns block layout.)
  const row = [];

  columns.forEach((col) => {
    const cellContent = [];

    // Extract image
    // VALIDATED: Found <img class="cmp-image__image" alt="..." src="..."> at lines 402, 433
    const img = col.querySelector('.cmp-image__image')
      || col.querySelector('.cmp-image img')
      || col.querySelector('img');
    if (img) {
      // Clone so replacing one instance's ancestor cannot detach nodes
      // referenced while building the block table.
      cellContent.push(img.cloneNode(true));
    }

    // Extract text paragraph
    // VALIDATED: Found <div class="rich-text"><p>...</p></div> at lines 407, 438
    const textEl = col.querySelector('.rich-text p')
      || col.querySelector('.rich-text')
      || col.querySelector('.text p');
    if (textEl) {
      const p = document.createElement('p');
      p.innerHTML = textEl.innerHTML;
      cellContent.push(p);
    }

    // Extract CTA button/link
    // VALIDATED: Found <a class="btn-primary btn-primary-white" href="..."> at lines 413, 444
    const ctaLink = col.querySelector('.btn-primary')
      || col.querySelector('.button__section a')
      || col.querySelector('.button a');
    if (ctaLink) {
      const link = document.createElement('a');
      link.href = ctaLink.href;
      link.textContent = ctaLink.textContent.trim();
      cellContent.push(link);
    }

    // Only add non-empty cells; guard against undefined entries that would
    // crash WebImporter.createTable when it calls setAttribute.
    row.push(cellContent.filter(Boolean));
  });

  // Drop empty columns so we never emit a row of all-empty cells.
  const cleanRow = row.filter((c) => c.length > 0);
  if (!cleanRow.length) {
    // Nothing usable found — leave original DOM untouched.
    return;
  }

  const cells = [cleanRow];

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-People', cells });

  // Replace the whole column group (the container holding both .col-lg-6
  // columns) once, so the selector matching each column's image link does not
  // create duplicate blocks and does not leave stray text/CTA markup behind.
  // The import script skips elements already detached on subsequent matches.
  (container && container !== element ? container : element).replaceWith(block);
}
