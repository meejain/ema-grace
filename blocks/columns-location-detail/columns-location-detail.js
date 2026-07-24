export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-location-detail-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // Find an image (picture or img) in this cell
      const pic = col.querySelector('picture, img');

      if (pic) {
        // This is the image column
        col.classList.add('columns-location-detail-img-col');
      } else {
        // This is the text/detail column
        col.classList.add('columns-location-detail-text-col');
      }
    });
  });
}
