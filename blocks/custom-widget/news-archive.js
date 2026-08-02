/**
 * Custom Widget News Archive
 * Renders a year-grouped press release archive as an accessible accordion.
 * Each authored EDS row = one year group:
 *   cell 1 = year label (e.g. "2025")
 *   cell 2 = list of press releases as <p><a> links
 * The block builds a <dl> where each <dt> holds a toggle button (with a
 * plus/minus indicator) and each <dd> holds that year's releases.
 * @param {Element} block The custom-widget-news-archive block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const dl = document.createElement('dl');
  dl.className = 'custom-widget-news-archive-list';

  rows.forEach((row, index) => {
    const [yearCell, listCell] = row.children;
    if (!yearCell) return;

    const year = yearCell.textContent.trim();
    const bodyId = `news-archive-body-${index}`;
    const btnId = `news-archive-btn-${index}`;

    // Year heading with toggle button
    const dt = document.createElement('dt');
    dt.className = 'custom-widget-news-archive-heading';

    // First (latest) year is expanded by default, matching grace.com.
    const openByDefault = index === 0;

    const button = document.createElement('button');
    button.type = 'button';
    button.id = btnId;
    button.className = 'custom-widget-news-archive-btn';
    button.setAttribute('aria-expanded', String(openByDefault));
    button.setAttribute('aria-controls', bodyId);

    const label = document.createElement('span');
    label.className = 'custom-widget-news-archive-year';
    label.textContent = year;

    const icon = document.createElement('span');
    icon.className = 'custom-widget-news-archive-icon';
    icon.setAttribute('aria-hidden', 'true');

    button.append(label, icon);
    dt.append(button);

    // Year body with the list of releases. The region role/labelledby live on
    // an inner wrapper — NOT the <dd> — so the <dd> keeps its implicit role and
    // stays a valid direct child of the <dl> (WCAG definition-list rule).
    const dd = document.createElement('dd');
    dd.id = bodyId;
    dd.className = 'custom-widget-news-archive-body';
    dd.hidden = !openByDefault;

    const region = document.createElement('div');
    region.className = 'custom-widget-news-archive-region';
    region.setAttribute('role', 'region');
    region.setAttribute('aria-labelledby', btnId);
    if (listCell) {
      region.append(...listCell.childNodes);
    }
    dd.append(region);

    dl.append(dt, dd);
  });

  block.textContent = '';
  block.append(dl);

  // Event delegation for expand/collapse
  dl.addEventListener('click', (e) => {
    const button = e.target.closest('.custom-widget-news-archive-btn');
    if (!button) return;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    const body = document.getElementById(button.getAttribute('aria-controls'));
    if (body) body.hidden = expanded;
  });
}
