/**
 * Quote Highlight block
 * A large, emphasized pull-quote / highlighted statement (no CTA).
 *
 * Expected authored structure (rows, single cell each):
 *   row 1: quote text (required)
 *   row 2: attribution name (optional)
 *   row 3: attribution role / organization (optional)
 *
 * Renders a semantic <blockquote> with an optional <cite> attribution.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [quoteRow, nameRow, roleRow] = rows;

  const getText = (row) => {
    if (!row) return '';
    const cell = row.firstElementChild || row;
    return cell.textContent.trim();
  };

  const quoteText = getText(quoteRow);
  const nameText = getText(nameRow);
  const roleText = getText(roleRow);

  block.textContent = '';

  const blockquote = document.createElement('blockquote');

  const quoteP = document.createElement('p');
  quoteP.className = 'quote-highlight-text';
  // Wrap in smart quotes only if the author has not already done so.
  const trimmed = quoteText.replace(/^["“”]+|["“”]+$/g, '').trim();
  quoteP.textContent = `“${trimmed}”`;
  blockquote.append(quoteP);

  if (nameText || roleText) {
    const cite = document.createElement('cite');
    cite.className = 'quote-highlight-citation';
    if (nameText) {
      const name = document.createElement('span');
      name.className = 'quote-highlight-author';
      name.textContent = nameText;
      cite.append(name);
    }
    if (roleText) {
      const role = document.createElement('span');
      role.className = 'quote-highlight-role';
      role.textContent = roleText;
      cite.append(role);
    }
    blockquote.append(cite);
  }

  block.append(blockquote);
}
