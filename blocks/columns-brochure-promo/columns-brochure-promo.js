export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-brochure-promo-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-brochure-promo-img-col');

        // EDS may merge the bare image and the button link into a single <p>.
        // Split them so the picture and the button become siblings of the col
        // (nested <p> is invalid and breaks layout).
        const buttonWrapper = col.querySelector('.button-wrapper');

        // move the button wrapper out so the picture's paragraph holds the
        // image only (EDS may otherwise merge the bare image and the button
        // link into one paragraph, producing invalid nested markup).
        if (buttonWrapper) {
          col.appendChild(buttonWrapper);
        }

        // tag the picture's own paragraph as the image wrapper so we avoid
        // introducing extra block-level nodes that EDS re-wraps in <p> tags
        const picWrapper = pic.closest('p') || pic.parentElement;
        if (picWrapper && picWrapper !== col) {
          picWrapper.classList.add('columns-brochure-promo-img');
        } else {
          const wrap = document.createElement('div');
          wrap.classList.add('columns-brochure-promo-img');
          pic.replaceWith(wrap);
          wrap.appendChild(pic);
        }
      } else {
        col.classList.add('columns-brochure-promo-text-col');
      }
    });
  });
}
