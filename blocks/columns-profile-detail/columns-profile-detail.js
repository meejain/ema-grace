export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-profile-detail-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        // image cell (unwrap any paragraph wrapping the picture)
        col.classList.add('columns-profile-detail-img-col');
        const wrappingP = pic.closest('p');
        if (wrappingP && wrappingP.parentElement === col) {
          wrappingP.replaceWith(pic);
        }
      } else {
        // text cell (name + title + bio)
        col.classList.add('columns-profile-detail-text-col');
      }
    });
  });
}
