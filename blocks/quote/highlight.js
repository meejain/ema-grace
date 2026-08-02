/**
 * Quote Highlight block
 * A large, emphasized statistic / highlighted statement framed by blue rules
 * (source: grace.com stat callout — a big number over a supporting sentence).
 *
 * Expected authored structure (rows, single cell each):
 *   row 1: the emphasized value / headline (e.g. "75%") — required
 *   row 2: the supporting statement (optional)
 *
 * Renders the value as a large heading with the statement below. Text is used
 * verbatim (no smart-quote wrapping) so numbers/percentages render cleanly.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [valueRow, statementRow] = rows;

  const getText = (row) => {
    if (!row) return '';
    const cell = row.firstElementChild || row;
    return cell.textContent.trim();
  };

  const valueText = getText(valueRow);
  const statementText = getText(statementRow);

  block.textContent = '';

  if (valueText) {
    const value = document.createElement('p');
    value.className = 'quote-highlight-text';
    value.textContent = valueText;
    block.append(value);
  }

  if (statementText) {
    const statement = document.createElement('p');
    statement.className = 'quote-highlight-statement';
    statement.textContent = statementText;
    block.append(statement);
  }
}
