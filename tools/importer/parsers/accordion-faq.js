/* eslint-disable */
/* global WebImporter */
/**
 * accordion-faq -> EDS `Accordion (faq)`
 * Source: grace.com/campaign/curtis-bay-FUSRAP/ — div.accordion-comp with
 * .accordion-comp-list > dl.plus-minus.accordion; each dl: dt>button>span.h6 (question) +
 * dd .rich-text (answer). Receives the .accordion-comp; emits one Q|A row per dl.
 */
function qa(dl, document) {
  const q = dl.querySelector('dt .h6, dt button, dt');
  const a = dl.querySelector('dd .rich-text, dd .text, dd');
  const qCell = [];
  if (q && q.textContent.trim()) { const p = document.createElement('p'); p.textContent = q.textContent.trim(); qCell.push(p); }
  const aCell = [];
  if (a) {
    const nested = a.querySelector('.accordion-comp');
    if (nested) { aCell.push(a.cloneNode(true)); } // nested handled by accordion-nested; keep content
    else Array.from(a.children).forEach((el) => { if (el.textContent.trim()) aCell.push(el.cloneNode(true)); });
    if (!aCell.length && a.textContent.trim()) { const p = document.createElement('p'); p.textContent = a.textContent.trim(); aCell.push(p); }
  }
  return [qCell, aCell];
}
export default function parse(element, { document }) {
  const dls = Array.from(element.querySelectorAll('dl.accordion, .accordion-comp-list > dl, dl'));
  if (!dls.length) return;
  const cells = dls.map((dl) => qa(dl, document));
  const block = WebImporter.Blocks.createBlock(document, { name: 'Accordion (faq)', cells });
  element.replaceWith(block);
}
