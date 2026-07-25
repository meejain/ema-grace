import { createOptimizedPicture } from '../../scripts/aem.js';

const AUTOPLAY_DELAY = 4500;

/**
 * Builds one slide from an authored row.
 * Expected cell order: [image, category, title, excerpt, link]
 * @param {Element} row authored block row
 * @param {number} index slide index
 * @returns {Element} slide element
 */
function buildSlide(row, index) {
  const cells = [...row.children];
  const slide = document.createElement('div');
  slide.className = 'featured-insights-slide';
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.id = `featured-insights-slide-${index}`;

  const imgCell = cells.find((c) => c.querySelector('picture, img'));
  const media = document.createElement('div');
  media.className = 'featured-insights-media';
  if (imgCell) {
    const img = imgCell.querySelector('img');
    if (img) {
      const pic = createOptimizedPicture(img.src, img.alt, index === 0, [{ width: '1200' }]);
      media.append(pic);
    }
  }

  const overlay = document.createElement('div');
  overlay.className = 'featured-insights-overlay';

  const content = document.createElement('div');
  content.className = 'featured-insights-content';

  const link = row.querySelector('a');
  const linkCell = link ? link.closest('div') : null;
  const textCells = cells.filter((c) => c !== imgCell && c !== linkCell);
  const [categoryCell, titleCell, excerptCell] = textCells;

  if (categoryCell) {
    const category = document.createElement('p');
    category.className = 'featured-insights-category';
    category.textContent = categoryCell.textContent.trim();
    content.append(category);
  }
  if (titleCell) {
    const title = document.createElement('h2');
    title.className = 'featured-insights-title';
    title.textContent = titleCell.textContent.trim();
    content.append(title);
  }
  if (excerptCell) {
    const excerpt = document.createElement('p');
    excerpt.className = 'featured-insights-excerpt';
    excerpt.textContent = excerptCell.textContent.trim();
    content.append(excerpt);
  }
  if (link) {
    const cta = document.createElement('a');
    cta.className = 'featured-insights-cta button primary';
    cta.href = link.getAttribute('href');
    cta.textContent = link.textContent.trim();
    content.append(cta);
  }

  slide.append(media, overlay, content);
  return slide;
}

/**
 * loads and decorates the featured-insights block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const track = document.createElement('div');
  track.className = 'featured-insights-track';

  const slides = rows.map((row, i) => buildSlide(row, i));
  slides.forEach((s) => track.append(s));

  block.textContent = '';
  block.append(track);

  const total = slides.length;
  let current = 0;
  let timer = null;
  let dots = null;

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const setActive = (idx) => {
    current = (idx + total) % total;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    if (dots) {
      [...dots.children].forEach((d, i) => {
        const active = i === current;
        d.classList.toggle('is-active', active);
        d.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }
  };

  const start = () => {
    stop();
    timer = setInterval(() => setActive(current + 1), AUTOPLAY_DELAY);
  };

  if (total > 1) {
    const controls = document.createElement('div');
    controls.className = 'featured-insights-controls';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'featured-insights-arrow featured-insights-prev';
    prev.setAttribute('aria-label', 'Previous slide');
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'featured-insights-arrow featured-insights-next';
    next.setAttribute('aria-label', 'Next slide');
    controls.append(prev, next);

    dots = document.createElement('div');
    dots.className = 'featured-insights-dots';
    dots.setAttribute('role', 'tablist');
    slides.forEach((s, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'featured-insights-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.setAttribute('aria-controls', s.id);
      dot.addEventListener('click', () => {
        setActive(i);
        start();
      });
      dots.append(dot);
    });

    prev.addEventListener('click', () => {
      setActive(current - 1);
      start();
    });
    next.addEventListener('click', () => {
      setActive(current + 1);
      start();
    });
    block.addEventListener('mouseenter', stop);
    block.addEventListener('mouseleave', start);

    block.append(controls, dots);
    setActive(0);
    start();
  } else {
    setActive(0);
  }
}
