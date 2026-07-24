export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-checklist-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const hasMedia = col.querySelector('picture, img');
      if (hasMedia) {
        col.classList.add('columns-checklist-media-col');
      } else {
        col.classList.add('columns-checklist-list-col');
      }
    });
  });

  // EDS wraps bare <picture> in a <p>; sibling <p> elements authored after it
  // collapse into that same wrapper. Normalise the media column so the image,
  // quote, name and role are direct children again.
  const mediaCol = block.querySelector('.columns-checklist-media-col');
  if (mediaCol) {
    const wrapper = mediaCol.querySelector('p:has(picture), p:has(img)');
    if (wrapper) {
      const frag = document.createDocumentFragment();
      const pic = wrapper.querySelector('picture, img');
      if (pic) frag.appendChild(pic.closest('picture') || pic);
      [...wrapper.querySelectorAll(':scope > p')].forEach((p) => frag.appendChild(p));
      wrapper.replaceWith(frag);
    }
    // First remaining paragraph is the quote.
    const firstP = mediaCol.querySelector('p');
    if (firstP) firstP.classList.add('columns-checklist-quote');
  }

  // In the checklist column, style the section headings (rendered by EDS as
  // headings) and the check-marked list items.
  const listCol = block.querySelector('.columns-checklist-list-col');
  if (listCol) {
    listCol.querySelectorAll('h4, h5, h6').forEach((h) => {
      h.classList.add('columns-checklist-heading');
    });
    listCol.querySelectorAll('ul').forEach((ul) => {
      ul.classList.add('columns-checklist-list');
    });
  }
}
