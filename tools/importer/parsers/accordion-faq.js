/* eslint-disable */
/* global WebImporter */
/**
 * accordion-faq -> EDS `Accordion (faq)`
 *
 * Block table shape (EDS Accordion convention): 2 columns, multiple rows. Row 1 is the
 * block name ("Accordion (faq)"). Each subsequent row is one accordion item as two cells:
 *   [ Title cell (mandatory) , Content cell (mandatory) ].
 *
 * Source: grace.com/campaign/curtis-bay-FUSRAP/ — div.accordion-comp with
 * .accordion-comp-list > dl.plus-minus.accordion; each dl: dt>button>span.h6 (title) +
 * dd .rich-text (content). One row per dl.
 *
 * GROUPING: some pages (e.g. industries/personal-care/cosmetics) author each accordion
 * ROW as its OWN `.accordion-comp` wrapper — 6 sibling accordions that visually read as a
 * single accordion. The catalog discovers each `.accordion-comp` separately, so without
 * grouping we emit N one-row accordions instead of one. When invoked on the FIRST comp of
 * such a group we collect all sibling comps that share the content container and emit ONE
 * block, then detach the rest (discovery's `!element.parentNode` guard then skips them).
 * A page with a single multi-`dl` accordion-comp (curtis-bay) is unaffected — the group is
 * just that one element.
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
  // Group sibling accordion-comps that share the content container so all their rows land
  // in ONE accordion block. `.accordion-comp` is nested inside a `<div class="accordion">`
  // wrapper on these pages; the wrappers are siblings under the content column.
  const wrapper = element.closest('.accordion') || element;
  const container = wrapper.parentElement || element.parentElement;
  let comps = [element];
  if (container) {
    const all = Array.from(container.querySelectorAll('.accordion-comp'))
      // exclude nested accordion-comps (dd contains a child accordion — accordion-nested handles those)
      .filter((c) => !(c.parentElement && c.parentElement.closest('.accordion-comp')));
    if (all.length > 1 && all.includes(element)) comps = all;
  }

  const dls = [];
  comps.forEach((comp) => {
    Array.from(comp.querySelectorAll('dl.accordion, .accordion-comp-list > dl, dl'))
      .forEach((dl) => dls.push(dl));
  });
  if (!dls.length) return;

  const cells = dls.map((dl) => qa(dl, document));
  const block = WebImporter.Blocks.createBlock(document, { name: 'Accordion (faq)', cells });

  // Emit once (replace the first comp's wrapper) and detach the remaining comps' wrappers so
  // discovery skips them — no duplicate one-row accordions.
  const firstWrapper = comps[0].closest('.accordion') || comps[0];
  firstWrapper.replaceWith(block);
  comps.slice(1).forEach((comp) => {
    const w = comp.closest('.accordion') || comp;
    if (w.parentNode) w.remove();
  });
}
