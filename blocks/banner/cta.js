/**
 * Banner CTA block.
 *
 * A full-width call-to-action banner on the brand green background: a heading,
 * a short supporting line of text, and one or more CTA buttons.
 *
 * Expected authored structure (block table rows):
 *   Row 1: the heading (h2/h3 or plain text).
 *   Row 2: the short supporting text (paragraph).
 *   Row 3: the call-to-action link(s).
 *
 * Any of the rows are optional and their order is tolerated: headings, plain
 * paragraphs and links are classified by element type rather than position.
 * A link nested inside the heading is lifted out so it renders as a button.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const content = document.createElement('div');
  content.className = 'banner-cta-content';

  const actions = document.createElement('div');
  actions.className = 'banner-cta-actions';

  const cells = [...block.querySelectorAll(':scope > div > div')];

  cells.forEach((cell) => {
    // Lift a link nested inside a heading out so it becomes a standalone CTA.
    const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
    const nestedLink = heading?.querySelector('a');
    if (nestedLink) {
      nestedLink.remove();
      cell.append(nestedLink);
    }

    [...cell.childNodes].forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node;
      const link = el.tagName === 'A' ? el : el.querySelector(':scope > a');

      if (link && el.textContent.trim() === link.textContent.trim()) {
        // Standalone link -> CTA button.
        link.classList.add('button', 'secondary');
        actions.append(link);
      } else if (/^H[1-6]$/.test(el.tagName)) {
        el.classList.add('banner-cta-heading');
        content.append(el);
      } else {
        el.classList.add('banner-cta-text');
        content.append(el);
      }
    });
  });

  block.textContent = '';
  block.append(content);
  if (actions.children.length) block.append(actions);
}
