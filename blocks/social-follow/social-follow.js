// Inline SVG icons keyed by network. Recreated as simple monochrome glyphs so
// no proprietary icon font (FontAwesome on the source) is required.
const ICONS = {
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.98 3.5A2.5 2.5 0 1 0 5 8.5a2.5 2.5 0 0 0-.02-5zM3 9h4v12H3V9zm6 0h3.8v1.64h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9V9z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M23 12s0-3.2-.4-4.74a2.5 2.5 0 0 0-1.76-1.77C19.28 5.08 12 5.08 12 5.08s-7.28 0-8.84.41A2.5 2.5 0 0 0 1.4 7.26C1 8.8 1 12 1 12s0 3.2.4 4.74a2.5 2.5 0 0 0 1.76 1.77c1.56.41 8.84.41 8.84.41s7.28 0 8.84-.41a2.5 2.5 0 0 0 1.76-1.77C23 15.2 23 12 23 12zM9.75 15.02V8.98L15 12l-5.25 3.02z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.29 3.9 12.15 12.15 0 0 1-8.82-4.47 4.28 4.28 0 0 0 1.32 5.71c-.7-.02-1.36-.21-1.94-.53v.05a4.28 4.28 0 0 0 3.43 4.19c-.63.17-1.3.2-1.94.07a4.28 4.28 0 0 0 4 2.97A8.6 8.6 0 0 1 2 18.57a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.19-6.53 12.19-12.19l-.01-.56A8.7 8.7 0 0 0 22.46 6z"/></svg>',
};

// Human-readable labels for each network key.
const LABELS = {
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  twitter: 'Twitter',
};

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // First row acts as an optional label ("Follow us") when it has a single
  // cell that does not describe a network link.
  let heading;
  const first = rows[0];
  const firstCells = first ? [...first.children] : [];
  const firstHasLink = firstCells.some((c) => c.querySelector('a') || /^https?:/i.test(c.textContent.trim()));
  if (first && firstCells.length === 1 && !firstHasLink) {
    const text = first.textContent.trim();
    if (text) {
      heading = document.createElement('h3');
      heading.className = 'social-follow-title';
      heading.textContent = text;
    }
    rows.shift();
  }

  const list = document.createElement('ul');
  list.className = 'social-follow-list';

  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    // Determine network key: prefer an explicit key cell, else infer from href.
    const linkEl = row.querySelector('a');
    const href = linkEl ? linkEl.getAttribute('href') : (cells[1]?.textContent.trim() || cells[0]?.textContent.trim());
    if (!href) return;

    let key = cells[0]?.textContent.trim().toLowerCase();
    if (!ICONS[key]) {
      const h = href.toLowerCase();
      if (h.includes('linkedin')) key = 'linkedin';
      else if (h.includes('youtube') || h.includes('youtu.be')) key = 'youtube';
      else if (h.includes('twitter') || h.includes('x.com')) key = 'twitter';
      else key = '';
    }

    // CTA text: last cell, defaulting sensibly per network.
    let cta = cells[cells.length - 1]?.textContent.trim();
    if (!cta || /^https?:/i.test(cta) || cta.toLowerCase() === key) {
      cta = key === 'youtube' ? 'Subscribe' : 'Follow us';
    }

    const label = LABELS[key] || (cells[0]?.textContent.trim() || 'Follow');

    const li = document.createElement('li');
    li.className = 'social-follow-item';

    const a = document.createElement('a');
    a.className = 'social-follow-link';
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', `${cta} on ${label}`);

    const icon = document.createElement('span');
    icon.className = 'social-follow-icon';
    if (ICONS[key]) icon.innerHTML = ICONS[key];

    const content = document.createElement('span');
    content.className = 'social-follow-content';

    const name = document.createElement('span');
    name.className = 'social-follow-name';
    name.textContent = label;

    const action = document.createElement('span');
    action.className = 'social-follow-cta';
    action.textContent = cta;

    content.append(name, action);
    a.append(icon, content);
    li.append(a);
    list.append(li);
  });

  block.textContent = '';
  if (heading) block.append(heading);
  block.append(list);
}
