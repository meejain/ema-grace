export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cols = [...row.children];
    row.classList.add('columns-image-right-row');

    cols.forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-image-right-img-col');
        // unwrap picture from any auto-generated <p> wrapper
        if (pic.parentElement && pic.parentElement.tagName === 'P') {
          pic.parentElement.replaceWith(pic);
        }
      } else {
        col.classList.add('columns-image-right-text-col');
      }
    });

    // Guarantee image sits on the right via DOM order (image col last).
    const imgCol = row.querySelector('.columns-image-right-img-col');
    if (imgCol && imgCol !== row.lastElementChild) {
      row.appendChild(imgCol);
    }
  });
}
