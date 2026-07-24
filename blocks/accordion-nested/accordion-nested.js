/**
 * Nested Accordion
 * Two levels of expand/collapse rendered as nested <details>/<summary>.
 *
 * Authored markup (EDS block table):
 *   .accordion-nested > div            -> one outer section (a row)
 *     > div:first-child                -> outer summary label
 *     > div:last-child                 -> inner content: a sequence of
 *         <h3> inner title, followed by any elements (answer) until the
 *         next <h3>. Each <h3> group becomes a nested inner accordion.
 *
 * @param {Element} block The block element
 */

/**
 * Builds a <summary> element wrapping the given label content.
 * @param {string} labelHtml inner HTML for the summary label
 * @param {string} levelClass extra class for the summary
 * @returns {HTMLElement} the summary element
 */
function buildSummary(labelHtml, levelClass) {
  const summary = document.createElement('summary');
  summary.className = levelClass;
  const label = document.createElement('span');
  label.className = 'accordion-nested-label';
  label.innerHTML = labelHtml;
  const indicator = document.createElement('span');
  indicator.className = 'accordion-nested-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  summary.append(label, indicator);
  return summary;
}

/**
 * Splits the body cell into inner accordion groups keyed by <h3>.
 * @param {Element} body the outer content cell
 * @returns {Array<{title: Element, content: Element[]}>} inner groups
 */
function collectInnerGroups(body) {
  const groups = [];
  let current = null;
  [...body.children].forEach((el) => {
    if (el.tagName === 'H3') {
      current = { title: el, content: [] };
      groups.push(current);
    } else if (current) {
      current.content.push(el);
    }
  });
  return groups;
}

/**
 * Creates an inner-level <details> for a group.
 * @param {{title: Element, content: Element[]}} group inner group
 * @returns {HTMLElement} the inner details element
 */
function buildInner(group) {
  const details = document.createElement('details');
  details.className = 'accordion-nested-item accordion-nested-item-inner';
  details.append(buildSummary(group.title.innerHTML, 'accordion-nested-summary accordion-nested-summary-inner'));
  const content = document.createElement('div');
  content.className = 'accordion-nested-content accordion-nested-content-inner';
  content.append(...group.content);
  details.append(content);
  return details;
}

export default function decorate(block) {
  const rows = [...block.children];
  const items = rows.map((row) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const bodyCell = cells[1] || document.createElement('div');

    const outer = document.createElement('details');
    outer.className = 'accordion-nested-item accordion-nested-item-outer';
    outer.append(buildSummary(labelCell.innerHTML, 'accordion-nested-summary accordion-nested-summary-outer'));

    const outerContent = document.createElement('div');
    outerContent.className = 'accordion-nested-content accordion-nested-content-outer';

    const groups = collectInnerGroups(bodyCell);
    if (groups.length) {
      groups.forEach((group) => outerContent.append(buildInner(group)));
    } else {
      // no inner headings: keep body content as-is
      outerContent.append(...bodyCell.children);
    }

    outer.append(outerContent);
    return outer;
  });

  block.textContent = '';
  block.append(...items);
}
