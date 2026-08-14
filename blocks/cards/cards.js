import { createOptimizedPicture } from '../../scripts/aem.js';

/* Only AEM-hosted (same-origin or relative) images can be run through
   createOptimizedPicture — it rewrites the src with ?width/&format/&optimize
   params the origin's media pipeline understands. External absolute URLs
   (e.g. grace.scene7.com) would be mangled into a 404, so leave those as-is. */
function isOptimizable(src) {
  try {
    const url = new URL(src, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function optimizeCardImages(ul) {
  ul.querySelectorAll('picture > img').forEach((img) => {
    if (!isOptimizable(img.src)) return;
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
}

/* featured-content becomes a swipeable single-card carousel on mobile.
   CSS handles the scroll-snap track; this adds dot pagination that stays
   in sync with the scroll position. Dots are hidden via CSS on
   tablet/desktop, where the layout reverts to a grid. */
function setupCarousel(ul) {
  const slides = [...ul.children];
  if (slides.length <= 1) return;

  const dots = document.createElement('div');
  dots.className = 'cards-carousel-dots';
  dots.setAttribute('role', 'tablist');

  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'cards-carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => {
      slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
    dots.append(dot);
  });
  ul.after(dots);

  const setActive = (idx) => {
    [...dots.children].forEach((dot, i) => {
      const active = i === idx;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  };
  setActive(0);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        setActive(slides.indexOf(entry.target));
      }
    });
  }, { root: ul, threshold: 0.6 });
  slides.forEach((slide) => observer.observe(slide));
}

/* people variant: each authored card is a single cell holding an image (link),
   a paragraph (with a bold inline phrase) and a CTA link. Split that into an
   image cell + a body cell (paragraph + centered CTA), one <li> per card.
   Flat, unboxed, centered layout — matches grace.com homepage "people" section. */
function decoratePeople(block) {
  const ul = document.createElement('ul');
  const cells = [...block.querySelectorAll(':scope > div > div')];
  cells.forEach((cell) => {
    if (!cell.querySelector('picture, img')) return;
    const li = document.createElement('li');

    const imageDiv = document.createElement('div');
    imageDiv.className = 'cards-card-image';
    // the image (its wrapping link, if any) becomes the image cell
    const pic = cell.querySelector('picture') || cell.querySelector('img');
    const imgNode = pic.closest('a') || pic;
    imageDiv.append(imgNode);

    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'cards-card-body';
    // remaining nodes (paragraph + CTA link) go to the body
    [...cell.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
      bodyDiv.append(node);
    });

    // the CTA link may have been auto-wrapped into the paragraph alongside the
    // body copy; lift a trailing text link out to its own line (matches source)
    const para = bodyDiv.querySelector('p');
    if (para) {
      const trailingLink = para.querySelector(':scope > a:last-child:not(:has(img))');
      if (trailingLink && para.lastElementChild === trailingLink) {
        bodyDiv.append(trailingLink);
      }
    }

    li.append(imageDiv, bodyDiv);
    ul.append(li);
  });

  optimizeCardImages(ul);
  // CTA links are plain text CTAs, not EDS buttons
  ul.querySelectorAll('.cards-card-body a.button').forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    const wrapper = a.closest('.button-container');
    if (wrapper) wrapper.replaceWith(a);
  });
  block.replaceChildren(ul);
}

export default function decorate(block) {
  if (block.classList.contains('people')) {
    decoratePeople(block);
    return;
  }
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector('img'))) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    /* Imageless cards (e.g. category-grid promotion tiles: title + "Learn more",
       no image) still carry an EMPTY leading image cell from the import table.
       Left in place it renders as a blank gap / phantom image at the card top.
       Drop any empty cell so text-only cards sit flush (matches grace.com). */
    [...li.children].forEach((div) => {
      if (!div.textContent.trim() && !div.querySelector('picture, img')) div.remove();
    });
    ul.append(li);
  });
  optimizeCardImages(ul);
  /* Some variants (e.g. category-grid) present links as plain text CTAs rather
     than EDS buttons; undo the auto button decoration so CSS can style them. */
  ul.querySelectorAll('.cards-card-body a.button').forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    const wrapper = a.closest('.button-container');
    if (wrapper) wrapper.replaceWith(a);
  });

  block.replaceChildren(ul);

  if (block.classList.contains('featured-content')) {
    setupCarousel(ul);
  }
}
