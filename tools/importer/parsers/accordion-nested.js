/* eslint-disable */
/* global WebImporter */
/**
 * accordion-nested -> EDS `Accordion (nested)`
 * Source: grace.com/people-and-careers/benefits/us-employee-benefits-summary/ — same shell as
 * accordion-faq but a dd may contain a nested .accordion-comp (2-level). Receives the OUTER
 * .accordion-comp (the one whose dd's contain nested accordions). Emits Q|A rows where a
 * branch answer keeps its nested Q&A markup inline.
 */
function answerCell(dd, document) {
  const cell = [];
  const nested = dd.querySelector('.accordion-comp');
  Array.from((dd.querySelector('.rich-text, .text') || dd).children).forEach((el) => {
    if (el.classList && el.classList.contains('accordion-comp')) return;
    if (el.textContent.trim()) cell.push(el.cloneNode(true));
  });
  if (nested) {
    // Flatten nested Q&A as sub-paragraphs (Q as <strong>, A as <p>) so no content is lost.
    nested.querySelectorAll('dl').forEach((dl) => {
      const q = dl.querySelector('dt .h6, dt button, dt');
      const a = dl.querySelector('dd .rich-text, dd .text, dd');
      if (q && q.textContent.trim()) { const p = document.createElement('p'); const s = document.createElement('strong'); s.textContent = q.textContent.trim(); p.append(s); cell.push(p); }
      if (a && a.textContent.trim()) { const p = document.createElement('p'); p.textContent = a.textContent.trim(); cell.push(p); }
    });
  }
  if (!cell.length && dd.textContent.trim()) { const p = document.createElement('p'); p.textContent = dd.textContent.trim(); cell.push(p); }
  return cell;
}
export default function parse(element, { document }) {
  // Outer dls are the direct children of this accordion's list (not the nested ones).
  const list = element.querySelector(':scope > .accordion-comp-list') || element;
  const dls = Array.from(list.children).filter((el) => el.tagName === 'DL')
    .concat(Array.from(list.querySelectorAll(':scope > dl')));
  const outer = dls.length ? dls : Array.from(element.querySelectorAll('dl'));
  if (!outer.length) return;
  const cells = outer.map((dl) => {
    const q = dl.querySelector('dt .h6, dt button, dt');
    const dd = dl.querySelector('dd');
    const qCell = [];
    if (q && q.textContent.trim()) { const p = document.createElement('p'); p.textContent = q.textContent.trim(); qCell.push(p); }
    return [qCell, dd ? answerCell(dd, document) : []];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Accordion (nested)', cells });
  element.replaceWith(block);
}
