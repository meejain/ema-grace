/**
 * Loads and decorates the featured-horizontal block.
 * Mirrors the grace.com product "used in the following processes" feature-set:
 * an optional section label on top, followed by a vertical stack of full-width
 * white banner rows. Each row shows a product title (left), a description
 * (middle) and a chevron call to action (right). The whole row is a link.
 *
 * First authored row = single-cell section label ("Featured Products").
 * Each subsequent row = [optional image cell] [content cell: title, copy, link].
 * The source design uses no imagery in these banners, so any authored image
 * cell is ignored for rendering.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Detect a leading single-cell label row.
  let headerRow = null;
  if (rows.length && rows[0].children.length === 1) {
    [headerRow] = rows;
  }
  const cardRows = rows.filter((r) => r !== headerRow);

  const label = document.createElement('div');
  label.className = 'featured-horizontal-label';
  if (headerRow) {
    const cell = headerRow.firstElementChild || headerRow;
    label.innerHTML = `<span>${cell.textContent.trim()}</span>`;
  }

  const track = document.createElement('div');
  track.className = 'featured-horizontal-track';

  cardRows.forEach((row) => {
    const cells = [...row.children];
    // Pick the richest text cell (the one that isn't just an image).
    const textCell = cells
      .filter((c) => c.textContent.trim())
      .pop() || cells[cells.length - 1];

    const card = document.createElement('a');
    card.className = 'featured-horizontal-card';

    const title = textCell.querySelector('h1, h2, h3, h4, h5, h6');
    const links = [...textCell.querySelectorAll('a')];
    const cta = links[links.length - 1];
    const href = (title && title.querySelector('a') && title.querySelector('a').getAttribute('href'))
      || (cta && cta.getAttribute('href'));
    if (href) card.href = href;

    if (title) {
      const heading = document.createElement('span');
      heading.className = 'featured-horizontal-card-title';
      heading.innerHTML = title.innerHTML;
      // Unwrap any anchor inside the title so the whole card is the link.
      heading.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
      card.append(heading);
    }

    const ctaText = cta ? cta.textContent.trim() : 'Learn More';
    [...textCell.querySelectorAll('p')].forEach((p) => {
      if (p.querySelector('a')) return;
      const copy = document.createElement('span');
      copy.className = 'featured-horizontal-card-copy';
      copy.innerHTML = p.innerHTML;
      card.append(copy);
    });

    const ctaEl = document.createElement('span');
    ctaEl.className = 'featured-horizontal-card-cta';
    ctaEl.setAttribute('aria-hidden', 'true');
    ctaEl.textContent = ctaText;
    card.append(ctaEl);

    track.append(card);
  });

  block.textContent = '';
  if (headerRow) block.append(label);
  block.append(track);
}
