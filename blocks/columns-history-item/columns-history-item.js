export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // Find the first image (picture or a > picture) in the cell
      const pic = col.querySelector('picture');

      if (pic) {
        // This is the image column
        col.classList.add('columns-history-item-img-col');
        const link = pic.closest('a');
        // keep only the image (or its link) in this column
        const keep = link || pic;
        [...col.children].forEach((child) => {
          if (child !== keep && !child.contains(keep)) child.remove();
        });
      } else {
        // This is the text column (year heading + description)
        col.classList.add('columns-history-item-text-col');
      }
    });
  });
}
