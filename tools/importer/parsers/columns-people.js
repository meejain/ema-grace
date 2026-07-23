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
  // Find columns - navigate to the container with col-lg-6 children
  // VALIDATED: Found two .col-lg-6 siblings at lines 393 and 424
  let container = element;

  // If element is a link or image inside the columns, navigate up to row container
  if (element.classList.contains('cmp-image__link') || element.tagName === 'A') {
    container = element.closest('.row') || element.closest('article') || element.closest('section');
  }

  // Find column containers
  let columns = Array.from(container.querySelectorAll(':scope > .col-lg-6'));
  if (!columns.length) {
    columns = Array.from(container.querySelectorAll('.col-lg-6'));
  }
  if (!columns.length) {
    // Fallback: look for .col-lg-6 in parent
    const parentRow = container.closest('.row');
    if (parentRow) {
      columns = Array.from(parentRow.querySelectorAll(':scope > .col-lg-6'));
    }
  }

  // Build cells array - single row with N columns
  const row = [];

  columns.forEach((col) => {
    const cellContent = [];

    // Extract image
    // VALIDATED: Found <img class="cmp-image__image" alt="..." src="..."> at lines 402, 433
    const img = col.querySelector('.cmp-image__image')
      || col.querySelector('.cmp-image img')
      || col.querySelector('img');
    if (img) {
      cellContent.push(img);
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

    row.push(cellContent);
  });

  const cells = [row];

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns-People', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
