export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-image-text-list-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // Identify the image column vs the text column
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1 && col.firstElementChild === pic) {
        col.classList.add('columns-image-text-list-img-col');
      } else if (pic) {
        // Mixed cell: image accompanies text (rare) - still mark as image col
        col.classList.add('columns-image-text-list-img-col');
      } else {
        col.classList.add('columns-image-text-list-text-col');
      }
    });
  });
}
