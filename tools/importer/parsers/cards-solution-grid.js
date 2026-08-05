/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-solution-grid  ->  EDS `Cards (solution-grid)` (a NO-IMAGES cards variant)
 * Source: https://grace.com/products/unipol-unippac-process-control-software/
 * Matcher: stacked centered-<h2> rich-text sections (title + body <p>, no image, no link).
 *
 * Receives ONE such rich-text section per match. Collect all sibling solution sections from
 * the shared container on the first call. Convention: 1-column Cards (no images) — one cell
 * per card holding <h3>title</h3> + <p>body</p>.
 */
export default function parse(element, { document }) {
  const container = element.closest('article, section') || element.parentElement;
  if (!container || container.dataset.cardsSolutionGridDone) return;
  container.dataset.cardsSolutionGridDone = '1';

  const sections = Array.from(container.querySelectorAll('.col-lg-12 .text .rich-text, .col-lg-12 .rich-text'))
    .filter((rt) => rt.querySelector(':scope > h2') && rt.querySelector(':scope > p'));
  if (sections.length < 2) return; // a single centered block isn't a grid

  const cells = sections.map((rt) => {
    const cell = [];
    const h2 = rt.querySelector(':scope > h2');
    if (h2) {
      const h = document.createElement('h3');
      h.textContent = h2.textContent.trim();
      cell.push(h);
    }
    rt.querySelectorAll(':scope > p').forEach((p) => {
      if (p.textContent.trim()) cell.push(p.cloneNode(true));
    });
    return [cell];
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (solution-grid)', cells });
  // Replace the first section; remove the rest (they've been folded into the block).
  sections.forEach((rt, i) => {
    const host = rt.closest('.col-lg-12') || rt;
    if (i === 0) host.replaceWith(block);
    else host.remove();
  });
}
