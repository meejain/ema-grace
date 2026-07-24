export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cols = [...row.children];
  const imgCol = cols.find((col) => col.querySelector('picture'));
  const textCol = cols.find((col) => !col.querySelector('picture'));

  if (imgCol) {
    const pic = imgCol.querySelector('picture');
    const anchor = pic.closest('a');
    if (anchor && anchor.childElementCount === 1) {
      anchor.replaceWith(pic);
    }
    // promote picture to full-bleed background layer
    imgCol.classList.add('columns-horizontal-teaser-bg');
  }

  // gradient overlay layer
  const overlay = document.createElement('div');
  overlay.className = 'columns-horizontal-teaser-overlay';
  row.append(overlay);

  if (textCol) {
    textCol.classList.add('columns-horizontal-teaser-content');
  }
}
