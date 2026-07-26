import { createOptimizedPicture } from '../../scripts/aem.js';

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

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector('img'))) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
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
