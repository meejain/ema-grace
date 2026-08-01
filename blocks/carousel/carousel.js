/*
 * Carousel block family. The default (base) carousel is an editorial
 * full-bleed image slider with overlay content and a text control bar
 * (Previous / Next / Pause / Play) plus slide dots below the stage — mirroring
 * grace.com/insights/. Future variants can add their own decorate module here
 * and register it in DECORATORS, dispatched by the matching variant class.
 */
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
  slide.className = 'carousel-slide';
  slide.setAttribute('role', 'tabpanel');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.id = `carousel-slide-${index}`;

  const imgCell = cells.find((c) => c.querySelector('picture, img'));
  const media = document.createElement('div');
  media.className = 'carousel-media';
  if (imgCell) {
    const img = imgCell.querySelector('img');
    if (img) {
      const pic = createOptimizedPicture(img.src, img.alt, index === 0, [{ width: '1200' }]);
      media.append(pic);
    }
  }

  const overlay = document.createElement('div');
  overlay.className = 'carousel-overlay';

  const content = document.createElement('div');
  content.className = 'carousel-content';

  const link = row.querySelector('a');
  const linkCell = link ? link.closest('div') : null;
  const textCells = cells.filter((c) => c !== imgCell && c !== linkCell);
  const [categoryCell, titleCell, excerptCell] = textCells;

  if (categoryCell) {
    const category = document.createElement('p');
    category.className = 'carousel-category';
    category.textContent = categoryCell.textContent.trim();
    content.append(category);
  }
  if (titleCell) {
    const title = document.createElement('h2');
    title.className = 'carousel-title';
    title.textContent = titleCell.textContent.trim();
    content.append(title);
  }
  if (excerptCell) {
    const excerpt = document.createElement('p');
    excerpt.className = 'carousel-excerpt';
    excerpt.textContent = excerptCell.textContent.trim();
    content.append(excerpt);
  }
  if (link) {
    const cta = document.createElement('a');
    cta.className = 'carousel-cta button primary';
    cta.href = link.getAttribute('href');
    cta.textContent = link.textContent.trim();
    content.append(cta);
  }

  slide.append(media, overlay, content);
  return slide;
}

/**
 * Decorates the default (base) carousel: builds slides from authored rows and
 * wires up autoplay plus a below-stage nav bar (Previous / Next / Pause / Play)
 * and centered slide dots.
 * @param {Element} block The block element
 */
function decorateCarousel(block) {
  const rows = [...block.children];
  const track = document.createElement('div');
  track.className = 'carousel-track';

  const slides = rows.map((row, i) => buildSlide(row, i));
  slides.forEach((s) => track.append(s));

  block.textContent = '';
  block.append(track);

  const total = slides.length;
  let current = 0;
  let timer = null;
  let dots = null;
  let pauseBtn = null;
  let playBtn = null;

  const setPlayingUI = (playing) => {
    if (pauseBtn) pauseBtn.disabled = !playing;
    if (playBtn) playBtn.disabled = playing;
  };

  const stop = ({ userInitiated = false } = {}) => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (userInitiated) setPlayingUI(false);
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
    if (timer) clearInterval(timer);
    timer = setInterval(() => setActive(current + 1), AUTOPLAY_DELAY);
    setPlayingUI(true);
  };

  if (total > 1) {
    // Text control bar below the stage: Previous / Next / Pause / Play
    const nav = document.createElement('div');
    nav.className = 'carousel-nav';

    const controls = document.createElement('div');
    controls.className = 'carousel-controls';

    const makeBtn = (label, cls) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `carousel-control ${cls}`;
      b.textContent = label;
      return b;
    };
    const prev = makeBtn('Previous', 'carousel-prev');
    const next = makeBtn('Next', 'carousel-next');
    pauseBtn = makeBtn('Pause', 'carousel-pause');
    playBtn = makeBtn('Play', 'carousel-play');
    controls.append(prev, next, pauseBtn, playBtn);

    dots = document.createElement('div');
    dots.className = 'carousel-dots';
    dots.setAttribute('role', 'tablist');
    dots.setAttribute('aria-label', 'Choose a slide to display');
    slides.forEach((s, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
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
    pauseBtn.addEventListener('click', () => stop({ userInitiated: true }));
    playBtn.addEventListener('click', () => start());

    nav.append(controls, dots);
    block.append(nav);

    setActive(0);
    start();
  } else {
    setActive(0);
  }
}

// Variant decorators keyed by class. The base carousel runs when no variant
// class matches, so new variants only need an entry here.
const DECORATORS = {};

/**
 * loads and decorates the carousel block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const variant = Object.keys(DECORATORS).find((v) => block.classList.contains(v));
  if (variant) {
    await DECORATORS[variant](block);
  } else {
    decorateCarousel(block);
  }
}
