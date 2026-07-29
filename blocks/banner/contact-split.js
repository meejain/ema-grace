/**
 * Banner Contact Split
 * Two-half contact banner: a section title above two side-by-side inquiry columns.
 * Row 1 = title cell. Row 2 = two half cells (the split).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // First row holds the banner title.
  const titleRow = rows[0];
  const titleText = titleRow ? titleRow.textContent.trim() : '';
  if (titleRow) titleRow.remove();

  const title = document.createElement('h2');
  title.className = 'banner-contact-split-title';
  title.textContent = titleText;

  // Remaining row holds the two halves (one cell each).
  const contentRow = rows[1] || block.firstElementChild;
  const halves = contentRow ? [...contentRow.children] : [];

  const grid = document.createElement('div');
  grid.className = 'banner-contact-split-grid';

  halves.forEach((half) => {
    half.classList.add('banner-contact-split-half');

    // Promote the CTA link to a styled button.
    const cta = half.querySelector('a');
    if (cta) {
      cta.classList.add('banner-contact-split-cta');
      const wrapper = cta.closest('p');
      if (wrapper) {
        wrapper.classList.add('banner-contact-split-cta-wrapper');
        // Source shows a full-width white rule between the CTA and the
        // "For all ... including:" copy.
        const divider = document.createElement('div');
        divider.className = 'banner-contact-split-divider';
        divider.setAttribute('aria-hidden', 'true');
        wrapper.after(divider);
      }
    }

    grid.append(half);
  });

  block.textContent = '';
  block.append(title, grid);
}
