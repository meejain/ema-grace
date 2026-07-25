/**
 * Accordion FAQ
 * Each EDS row becomes one Q/A item rendered as a native <details>/<summary>
 * element, providing accessible keyboard + click expand/collapse behaviour.
 * Row cell 1 = question text, cell 2 = answer HTML.
 * @param {Element} block The accordion-faq block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const [questionCell, answerCell] = row.children;
    if (!questionCell) return;

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';

    // summary = clickable question row with the +/- indicator
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    const label = document.createElement('span');
    label.className = 'accordion-faq-item-title';
    label.innerHTML = questionCell.innerHTML;
    summary.append(label);
    details.append(summary);

    // body = answer panel
    const body = document.createElement('div');
    body.className = 'accordion-faq-item-body';
    if (answerCell) {
      body.append(...answerCell.childNodes);
    }
    details.append(body);

    row.replaceWith(details);
  });
}
