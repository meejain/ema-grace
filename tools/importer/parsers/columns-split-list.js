/* eslint-disable */
/* global WebImporter */
/**
 * columns-split-list -> EDS `Columns` (base, no variant) from a `.rich-text.split-list` body list.
 * Source: grace.com/.../unipol-pp-process/ — a lead-in <p> ("…enables your success:") + a single
 * <ul> that the source renders across TWO CSS columns (column-count:2). We preserve the lead-in
 * paragraph BEFORE the block, then split the <ul>'s items into two balanced <ul> cells so the base
 * Columns block lays them side-by-side (>=900px), stacked on mobile — matching the source.
 */
export default function parse(element, { document }) {
  const ul = element.querySelector(':scope > ul, :scope > div > ul, ul');
  if (!ul) return;
  const items = Array.from(ul.children).filter((li) => li.tagName === 'LI');
  if (items.length < 4) return;

  // lead-in paragraph(s) that precede the list (kept as content above the columns block).
  const lead = [];
  Array.from(element.querySelectorAll('p')).forEach((p) => {
    if ((p.textContent || '').trim()) lead.push(p.cloneNode(true));
  });

  // Split items into two balanced columns (first half | second half — matches the source's
  // column-fill:balance top-to-bottom-then-next-column flow closely enough for parity).
  const mid = Math.ceil(items.length / 2);
  const mkUl = (slice) => {
    const list = document.createElement('ul');
    slice.forEach((li) => list.appendChild(li.cloneNode(true)));
    return list;
  };
  const cellA = [mkUl(items.slice(0, mid))];
  const cellB = [mkUl(items.slice(mid))];

  const block = WebImporter.Blocks.createBlock(document, { name: 'Columns', cells: [[cellA, cellB]] });

  // Replace the split-list block with: [lead paragraphs] + [columns block].
  const frag = document.createElement('div');
  lead.forEach((p) => frag.appendChild(p));
  frag.appendChild(block);
  element.replaceWith(...frag.childNodes);
}
