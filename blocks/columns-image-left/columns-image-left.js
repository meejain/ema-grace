export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-image-left-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // Find the image (picture or a > picture/img) in this cell
      const pic = col.querySelector('picture');
      const hasImage = !!pic || !!col.querySelector('img');

      if (hasImage) {
        // Image cell: tag it so CSS can place it on the left
        col.classList.add('columns-image-left-img-col');
      } else {
        // Text cell: tag it so CSS can place it on the right
        col.classList.add('columns-image-left-text-col');
      }
    });
  });
}
