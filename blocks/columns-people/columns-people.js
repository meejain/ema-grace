export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-people-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // Find the first image link (a > img or picture)
      const imgLink = col.querySelector('a > img, a > picture');
      const pic = col.querySelector('picture') || (imgLink ? imgLink.parentElement : null);

      if (pic) {
        // Create image wrapper
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('columns-people-img-col');

        // Move the picture/image link to the wrapper
        const imgEl = pic.tagName === 'A' ? pic : pic.closest('a') || pic;
        imgWrapper.appendChild(imgEl.cloneNode(true));

        // Remove original image element from the text content
        if (imgEl.parentElement) {
          imgEl.remove();
        }

        // Wrap remaining text content
        const textWrapper = document.createElement('div');
        textWrapper.classList.add('columns-people-text-col');
        while (col.firstChild) {
          textWrapper.appendChild(col.firstChild);
        }

        // Rebuild column: image on top, text below
        col.appendChild(imgWrapper);
        col.appendChild(textWrapper);
      }
    });
  });
}
