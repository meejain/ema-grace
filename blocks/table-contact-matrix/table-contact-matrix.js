/**
 * Table Contact Matrix
 * Decorates EDS block rows (div > div cells) into a semantic contact-matrix
 * <table> with a header row. The first EDS row becomes <thead> and the
 * remaining rows become <tbody> rows. Bare phone numbers and email addresses
 * inside cells are converted into `tel:`/`mailto:` links so they are
 * actionable and consistently styled.
 * @param {Element} block The block element
 */

const PHONE_RE = /(\+?[\d][\d\s().-]{6,}\d)/g;
const EMAIL_RE = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

/**
 * Wraps phone numbers and emails within a text node into anchor links.
 * @param {Text} node A DOM text node
 */
function linkify(node) {
  const text = node.nodeValue;
  if (!text || !text.trim()) return;

  // emails take priority, then phone numbers
  const emails = text.match(EMAIL_RE);
  if (emails) {
    const frag = document.createDocumentFragment();
    let rest = text;
    emails.forEach((email) => {
      const idx = rest.indexOf(email);
      if (idx > 0) frag.append(document.createTextNode(rest.slice(0, idx)));
      const a = document.createElement('a');
      a.href = `mailto:${email}`;
      a.textContent = email;
      frag.append(a);
      rest = rest.slice(idx + email.length);
    });
    if (rest) frag.append(document.createTextNode(rest));
    node.replaceWith(frag);
    return;
  }

  const phones = text.match(PHONE_RE);
  if (!phones) return;
  const frag = document.createDocumentFragment();
  let rest = text;
  phones.forEach((phone) => {
    const idx = rest.indexOf(phone);
    if (idx > 0) frag.append(document.createTextNode(rest.slice(0, idx)));
    const a = document.createElement('a');
    a.href = `tel:${phone.replace(/[^\d+]/g, '')}`;
    a.textContent = phone.trim();
    // preserve trailing spaces around the matched number
    const lead = phone.match(/^\s+/);
    const trail = phone.match(/\s+$/);
    if (lead) frag.append(document.createTextNode(lead[0]));
    frag.append(a);
    if (trail) frag.append(document.createTextNode(trail[0]));
    rest = rest.slice(idx + phone.length);
  });
  if (rest) frag.append(document.createTextNode(rest));
  node.replaceWith(frag);
}

/**
 * Walks a cell and linkifies phone/email text nodes.
 * @param {Element} cell The table cell element
 */
function linkifyCell(cell) {
  const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    // skip text already inside a link
    if (!n.parentElement.closest('a')) linkify(n);
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  rows.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    const cells = [...row.children];
    const isHeader = rowIndex === 0;

    cells.forEach((cell, cellIndex) => {
      const el = document.createElement(isHeader ? 'th' : 'td');
      if (isHeader) el.setAttribute('scope', 'col');
      // move authored content (paragraphs, text) into the cell as-is
      while (cell.firstChild) el.append(cell.firstChild);
      // the number/contact column (index 1+) gets phone/email links
      if (!isHeader && cellIndex > 0) linkifyCell(el);
      tr.append(el);
    });

    (isHeader ? thead : tbody).append(tr);
  });

  table.append(thead);
  if (tbody.children.length) table.append(tbody);

  // wrapper enables horizontal scroll on narrow viewports
  const scroller = document.createElement('div');
  scroller.className = 'table-contact-matrix-scroll';
  scroller.append(table);

  block.replaceChildren(scroller);
}
