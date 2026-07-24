/**
 * Quote CTA block.
 *
 * Expected authored structure (block table rows):
 *   Row 1: the quote / highlighted statement (one or more paragraphs). An
 *          optional citation may be supplied on the last line, marked up with
 *          <em> or as a paragraph beginning with an en/em dash.
 *   Row 2: the call-to-action link.
 *
 * Decorates into a semantic <blockquote> (statement + optional <cite>) followed
 * by the CTA rendered as a primary button.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const quoteCell = rows[0]?.querySelector(':scope > div') || rows[0];
  const ctaCell = rows[1]?.querySelector(':scope > div') || rows[1];

  const figure = document.createElement('figure');
  figure.className = 'quote-cta-figure';

  const blockquote = document.createElement('blockquote');
  blockquote.className = 'quote-cta-quote';

  // Move the statement paragraphs into the blockquote. If the last paragraph is
  // an italicized/dash-prefixed attribution, treat it as the citation.
  if (quoteCell) {
    const paragraphs = [...quoteCell.querySelectorAll(':scope > p')];
    const last = paragraphs[paragraphs.length - 1];
    const isCitation = last
      && (last.querySelector(':scope > em')
        || /^\s*[—–-]/.test(last.textContent));

    paragraphs.forEach((p) => {
      if (p === last && isCitation) return;
      blockquote.append(p);
    });

    // The attribution line acts as the callout title/heading on the source
    // design and is rendered ABOVE the statement.
    if (isCitation) {
      const title = document.createElement('p');
      title.className = 'quote-cta-title';
      const em = last.querySelector(':scope > em');
      title.innerHTML = (em || last).innerHTML.replace(/^\s*[—–-]\s*/, '');
      figure.append(title);
    }

    figure.append(blockquote);
  } else {
    figure.append(blockquote);
  }

  // Decorate the CTA link as a primary button (no auto arrow — matches source).
  if (ctaCell) {
    const link = ctaCell.querySelector('a');
    if (link) {
      link.classList.add('button', 'primary');
      const wrapper = document.createElement('p');
      wrapper.className = 'quote-cta-action';
      link.replaceWith(wrapper);
      wrapper.append(link);
      figure.append(wrapper);
    }
  }

  block.textContent = '';
  block.append(figure);
}
