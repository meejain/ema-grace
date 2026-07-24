/**
 * Pagination Numbered
 * Reads a total page count and current page from the authored block table,
 * then renders a numbered pagination nav with previous/next controls.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Read configuration from the authored rows (key/value cells).
  const config = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      config[key] = value;
    }
  });

  const total = Math.max(1, parseInt(config.pages, 10) || 1);
  const current = Math.min(total, Math.max(1, parseInt(config.current, 10) || 1));

  const nav = document.createElement('nav');
  nav.className = 'pagination-numbered-nav';
  nav.setAttribute('aria-label', 'Pagination');

  const list = document.createElement('ul');
  list.className = 'pagination-list';

  // Helper to build a control list item (prev/next arrow).
  const buildControl = (label, glyph, targetPage, extraClass) => {
    const li = document.createElement('li');
    li.className = extraClass;
    const disabled = targetPage < 1 || targetPage > total;
    const link = document.createElement('a');
    link.className = 'pagination-arrow';
    link.href = disabled ? '#' : `?page=${targetPage}`;
    link.setAttribute('aria-label', label);
    link.textContent = glyph;
    if (disabled) {
      link.setAttribute('aria-disabled', 'true');
      link.tabIndex = -1;
    }
    li.append(link);
    return li;
  };

  // Previous control.
  list.append(buildControl('Previous page', '‹', current - 1, 'prev'));

  // Numbered page links.
  for (let i = 1; i <= total; i += 1) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'pagination-button';
    link.href = `?page=${i}`;
    link.textContent = i;
    if (i === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
    li.append(link);
    list.append(li);
  }

  // Next control.
  list.append(buildControl('Next page', '›', current + 1, 'next'));

  nav.append(list);
  block.textContent = '';
  block.append(nav);
}
