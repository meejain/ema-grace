import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Loads and decorates the featured-horizontal block.
 * First row is the section label ("Featured Products"). Each subsequent row is a
 * product card with an optional image cell and a content cell (title, copy, CTA).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [headerRow, ...cardRows] = rows;

  // Label block (left / top).
  const label = document.createElement('div');
  label.className = 'featured-horizontal-label';
  if (headerRow) {
    const cell = headerRow.firstElementChild || headerRow;
    label.innerHTML = `<span>${cell.textContent.trim()}</span>`;
    headerRow.remove();
  }

  // Cards track (right / stacked).
  const track = document.createElement('div');
  track.className = 'featured-horizontal-track';

  cardRows.forEach((row) => {
    const cells = [...row.children];
    const imgCell = cells.find((c) => c.querySelector('picture, img'));
    const textCell = cells
      .filter((c) => c !== imgCell && c.textContent.trim())
      .pop() || cells[cells.length - 1];

    const card = document.createElement('a');
    card.className = 'featured-horizontal-card';

    // Optimize image and use as card background media.
    const img = imgCell ? imgCell.querySelector('img') : null;
    if (img) {
      card.classList.add('has-image');
      const media = document.createElement('span');
      media.className = 'featured-horizontal-card-media';
      const pic = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]);
      media.append(pic);
      card.append(media);
    }

    const body = document.createElement('span');
    body.className = 'featured-horizontal-card-body';

    const title = textCell.querySelector('h1, h2, h3, h4, h5, h6');
    const links = [...textCell.querySelectorAll('a')];
    const cta = links[links.length - 1];
    const href = (title && title.querySelector('a') && title.querySelector('a').href)
      || (cta && cta.href);
    if (href) card.href = href;

    if (title) {
      const heading = document.createElement('span');
      heading.className = 'featured-horizontal-card-title';
      heading.innerHTML = title.innerHTML;
      // Unwrap any anchor inside the title so the whole card is the link.
      heading.querySelectorAll('a').forEach((a) => a.replaceWith(...a.childNodes));
      body.append(heading);
    }

    const copyParas = [...textCell.querySelectorAll('p')]
      .filter((p) => !p.querySelector('a') || p.textContent.trim() !== (cta && cta.textContent.trim()));
    copyParas.forEach((p) => {
      if (p.querySelector('a')) return;
      const copy = document.createElement('span');
      copy.className = 'featured-horizontal-card-copy';
      copy.innerHTML = p.innerHTML;
      body.append(copy);
    });

    const ctaText = cta ? cta.textContent.trim() : 'Learn More';
    const ctaEl = document.createElement('span');
    ctaEl.className = 'featured-horizontal-card-cta';
    ctaEl.textContent = ctaText;
    body.append(ctaEl);

    card.append(body);
    track.append(card);
    row.remove();
  });

  block.textContent = '';
  block.append(label, track);
}
