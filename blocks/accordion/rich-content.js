/**
 * Accordion Rich Content
 * Each authored row becomes a collapsible item:
 *   cell 1 = header label
 *   cell 2 = rich HTML panel (headings, paragraphs, lists, links preserved)
 * Rendered as native <details>/<summary> for built-in accessibility & keyboard support.
 * @param {Element} block The accordion-rich-content block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const panelCell = cells[1];
    if (!labelCell || !panelCell) return;

    const details = document.createElement('details');
    details.className = 'accordion-rich-content-item';

    const summary = document.createElement('summary');
    summary.className = 'accordion-rich-content-header';
    // Preserve any inline markup in the label while keeping <summary> semantics.
    summary.innerHTML = labelCell.innerHTML.trim();

    const body = document.createElement('div');
    body.className = 'accordion-rich-content-panel';
    // Move the rich content nodes over, preserving headings/lists/links/structure.
    while (panelCell.firstChild) {
      body.append(panelCell.firstChild);
    }

    details.append(summary, body);
    row.replaceWith(details);
  });

  // Single-open behavior: opening one item closes its siblings.
  const items = [...block.querySelectorAll(':scope > .accordion-rich-content-item')];
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
}
