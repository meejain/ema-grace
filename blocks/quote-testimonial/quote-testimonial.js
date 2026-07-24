/**
 * Quote Testimonial block
 * Expected authored structure (rows, single cell each):
 *   row 1: quote text
 *   row 2: attribution name
 *   row 3: attribution title / role (optional)
 * Renders semantic <blockquote> + attribution (<cite>).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [quoteRow, nameRow, titleRow] = rows;

  const getText = (row) => {
    if (!row) return '';
    const cell = row.firstElementChild || row;
    return cell.textContent.trim();
  };

  const quoteText = getText(quoteRow);
  const nameText = getText(nameRow);
  const titleText = getText(titleRow);

  block.textContent = '';

  const blockquote = document.createElement('blockquote');
  const quoteP = document.createElement('p');
  quoteP.className = 'quote-testimonial-text';
  // Ensure smart quotes wrap the quote if not already present.
  const trimmed = quoteText.replace(/^["“]+|["”]+$/g, '');
  quoteP.textContent = `“${trimmed}”`;
  blockquote.append(quoteP);

  if (nameText || titleText) {
    const cite = document.createElement('cite');
    cite.className = 'quote-testimonial-citation';
    if (nameText) {
      const name = document.createElement('span');
      name.className = 'quote-testimonial-author';
      name.textContent = nameText;
      cite.append(name);
    }
    if (titleText) {
      const title = document.createElement('span');
      title.className = 'quote-testimonial-position';
      title.textContent = titleText;
      cite.append(title);
    }
    blockquote.append(cite);
  }

  block.append(blockquote);
}
