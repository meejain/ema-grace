/*
 * Consolidated columns block. The base decoration tags image/text columns for
 * simple side-by-side variants; variants with bespoke DOM needs (teaser
 * overlays, checklist normalisation, people cards, etc.) are dispatched to
 * their own decorate function keyed by the variant class on the block.
 */

const VARIANTS = ['app-promo', 'brochure-promo', 'checklist', 'history-item', 'horizontal-teaser', 'image-left', 'image-right', 'image-teaser', 'location-detail', 'media-figures', 'profile-detail'];

function getVariant(block) {
  return VARIANTS.find((v) => block.classList.contains(v)) || null;
}

/* Generic image/text column tagging shared by most variants. The class prefix
   matches the variant so existing CSS selectors keep working. */
function tagImageTextCols(block, prefix, { imgSelector = 'picture' } = {}) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector(imgSelector) || col.querySelector('img');
      col.classList.add(pic ? `${prefix}-img-col` : `${prefix}-text-col`);
    });
  });
}

function decorateDefault(block) {
  // Original boilerplate columns behaviour: tag pure-image columns.
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) picWrapper.classList.add('columns-img-col');
      }
    });
  });
}

function decorateImageLeft(block) {
  tagImageTextCols(block, 'columns-image-left');
}

function decorateImageRight(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-image-right-row');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-image-right-img-col');
        if (pic.parentElement && pic.parentElement.tagName === 'P') pic.parentElement.replaceWith(pic);
      } else {
        col.classList.add('columns-image-right-text-col');
      }
    });
    const imgCol = row.querySelector('.columns-image-right-img-col');
    if (imgCol && imgCol !== row.lastElementChild) row.appendChild(imgCol);
  });
}

function decorateLocationDetail(block) {
  tagImageTextCols(block, 'columns-location-detail', { imgSelector: 'picture, img' });
}

/* Media figures: two (or more) captioned insight images shown side by side on
   desktop and stacked on mobile. Each column holds a <picture> and an italic
   caption paragraph. Tag the caption so the CSS styles it (small italic gray),
   and lift the picture out of its wrapping <p> so it sizes cleanly. */
function decorateMediaFigures(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      col.classList.add('columns-media-figures-col');
      const pic = col.querySelector('picture');
      if (pic && pic.parentElement && pic.parentElement.tagName === 'P') {
        pic.parentElement.replaceWith(pic);
      }
      const caption = [...col.querySelectorAll('p')].find((p) => p.querySelector('em') && !p.querySelector('picture, img'));
      if (caption) caption.classList.add('columns-media-figures-caption');
    });
  });
}

function decorateProfileDetail(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-profile-detail-img-col');
        const wrappingP = pic.closest('p');
        if (wrappingP && wrappingP.parentElement === col) wrappingP.replaceWith(pic);
      } else {
        col.classList.add('columns-profile-detail-text-col');
      }
    });
  });
}

function decorateHistoryItem(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-history-item-img-col');
        const link = pic.closest('a');
        const keep = link || pic;
        [...col.children].forEach((child) => {
          if (child !== keep && !child.contains(keep)) child.remove();
        });
      } else {
        col.classList.add('columns-history-item-text-col');
      }
    });
  });
}

function decorateAppPromo(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector(':scope > picture, :scope > p > picture');
      const hasBadges = col.querySelector('p a picture');
      if (pic && !hasBadges) {
        col.classList.add('columns-app-promo-img-col');
      } else {
        col.classList.add('columns-app-promo-text-col');
        col.querySelectorAll('p').forEach((p) => {
          if (p.querySelector('a picture')) p.classList.add('columns-app-promo-badges');
        });
      }
    });
  });
}

function decorateBrochurePromo(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('columns-brochure-promo-img-col');
        const buttonWrapper = col.querySelector('.button-wrapper');
        if (buttonWrapper) col.appendChild(buttonWrapper);
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

/* Mobile: the source presents the process cards as a swipeable single-card
   carousel. CSS turns the block into a horizontal scroll-snap track below the
   900px breakpoint; this adds dot pagination that stays in sync with scroll
   and is hidden via CSS on desktop (where the layout reverts to a stack). */
function setupTeaserCarousel(block) {
  const cards = [...block.children];
  if (cards.length <= 1) return;

  const dots = document.createElement('div');
  dots.className = 'columns-horizontal-teaser-dots';
  dots.setAttribute('role', 'tablist');

  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'columns-horizontal-teaser-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
    dots.append(dot);
  });
  block.after(dots);

  /* All slides are equal height (CSS), so sliding is a pure horizontal move
     with no height change – this is what makes the source carousel seamless.
     The dots just track which slide is in view. */
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
        setActive(cards.indexOf(entry.target));
      }
    });
  }, { root: block, threshold: 0.6 });
  cards.forEach((card) => observer.observe(card));
}

/* Horizontal teaser = "used in the following processes" process cards.
   Each block row is one card: cell 0 = title, cell 1 = description (which
   may contain a "Learn More" link). Cards render as full-width white rows
   over a light-gray hexagon/geo-line patterned background; the whole card is
   clickable when the description carries a link, and a chevron is appended. */
function decorateHorizontalTeaser(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const titleCell = cells[0];
    const bodyCell = cells[1] || cells[0];
    if (titleCell) titleCell.classList.add('columns-horizontal-teaser-title');
    if (bodyCell) bodyCell.classList.add('columns-horizontal-teaser-desc');

    row.classList.add('columns-horizontal-teaser-card');

    /* the whole card links to the destination if the body has a link */
    const link = bodyCell ? bodyCell.querySelector('a') : null;
    if (link) {
      row.dataset.href = link.getAttribute('href');
      row.setAttribute('role', 'link');
      row.tabIndex = 0;
      const go = () => { window.location.href = row.dataset.href; };
      row.addEventListener('click', go);
      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') go();
      });
      /* keep the anchor out of the flow – source shows only a chevron */
      const wrapper = link.closest('p');
      if (wrapper && wrapper.textContent.trim() === link.textContent.trim()) wrapper.remove();
      else link.remove();
    }

    /* CTA: "Learn More" label + chevron. On desktop CSS hides the label and
       shows just the chevron on the right; on mobile the source shows the
       full "Learn More ›" centered below the copy. */
    const cta = document.createElement('span');
    cta.className = 'columns-horizontal-teaser-arrow';
    const ctaLabel = document.createElement('span');
    ctaLabel.className = 'columns-horizontal-teaser-arrow-label';
    ctaLabel.textContent = 'Learn More';
    const ctaIcon = document.createElement('span');
    ctaIcon.className = 'columns-horizontal-teaser-arrow-icon';
    ctaIcon.setAttribute('aria-hidden', 'true');
    cta.append(ctaLabel, ctaIcon);
    row.append(cta);
  });

  setupTeaserCarousel(block);
}

/* Mobile: the source presents the insight cards as a swipeable single-card
   carousel (Owl carousel). CSS turns the card row into a horizontal scroll-snap
   track below 900px; this adds dot pagination that tracks the scroll position
   and is hidden via CSS on desktop (where the layout reverts to a stack). */
function setupImageTeaserCarousel(row) {
  const cards = [...row.children].filter((c) => c.classList.contains('columns-image-teaser-card'));
  if (cards.length <= 1) return;

  const dots = document.createElement('div');
  dots.className = 'columns-image-teaser-dots';
  dots.setAttribute('role', 'tablist');

  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'columns-image-teaser-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
    dots.append(dot);
  });
  row.after(dots);

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
        setActive(cards.indexOf(entry.target));
      }
    });
  }, { root: row, threshold: 0.6 });
  cards.forEach((card) => observer.observe(card));
}

function decorateImageTeaser(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (!pic) return;
      const link = col.querySelector('a[href]');
      const href = link ? link.getAttribute('href') : null;

      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('columns-image-teaser-img');
      imgWrapper.append(pic.cloneNode(true));

      const heading = col.querySelector('h1, h2, h3, h4, h5, h6');
      const overlay = document.createElement('div');
      overlay.classList.add('columns-image-teaser-overlay');
      imgWrapper.append(overlay);

      // desktop title: white, overlaid on the (small) image
      if (heading) {
        const title = document.createElement('p');
        title.classList.add('columns-image-teaser-title');
        title.textContent = heading.textContent;
        imgWrapper.append(title);
      }

      const body = document.createElement('div');
      body.classList.add('columns-image-teaser-body');

      // mobile title: the source overlays the title + caption + "Learn More"
      // together on the image, so the body carries its own title (shown only
      // on mobile; the desktop title above is hidden there).
      if (heading) {
        const mobileTitle = document.createElement('p');
        mobileTitle.classList.add('columns-image-teaser-title-mobile');
        mobileTitle.textContent = heading.textContent;
        body.append(mobileTitle);
      }

      [...col.querySelectorAll('p')].forEach((p) => {
        if (p.querySelector('picture')) return;
        if (p.querySelector('a') && !p.textContent.replace(p.querySelector('a').textContent, '').trim()) return;
        if (!p.textContent.trim()) return;
        const caption = document.createElement('p');
        caption.classList.add('columns-image-teaser-caption');
        caption.innerHTML = p.innerHTML;
        body.append(caption);
      });

      // mobile CTA: "Learn More >" text, shown over the image (mobile only)
      const cta = document.createElement('span');
      cta.classList.add('columns-image-teaser-cta');
      cta.textContent = 'Learn More';
      body.append(cta);

      // desktop CTA: large chevron on the far right (no "Learn More" text)
      const chevron = document.createElement('span');
      chevron.classList.add('columns-image-teaser-chevron');
      chevron.setAttribute('aria-hidden', 'true');

      col.textContent = '';
      col.classList.add('columns-image-teaser-card');
      if (href) {
        const wrap = document.createElement('a');
        wrap.href = href;
        wrap.setAttribute('aria-label', heading ? heading.textContent : 'Read more');
        wrap.append(imgWrapper, body, chevron);
        col.append(wrap);
      } else {
        col.append(imgWrapper, body, chevron);
      }
    });

    setupImageTeaserCarousel(row);
  });
}

function decorateChecklist(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const hasMedia = col.querySelector('picture, img');
      col.classList.add(hasMedia ? 'columns-checklist-media-col' : 'columns-checklist-list-col');
    });
  });
  const mediaCol = block.querySelector('.columns-checklist-media-col');
  if (mediaCol) {
    const wrapper = mediaCol.querySelector('p:has(picture), p:has(img)');
    if (wrapper) {
      const frag = document.createDocumentFragment();
      const pic = wrapper.querySelector('picture, img');
      if (pic) frag.appendChild(pic.closest('picture') || pic);
      [...wrapper.querySelectorAll(':scope > p')].forEach((p) => frag.appendChild(p));
      wrapper.replaceWith(frag);
    }
    const firstP = mediaCol.querySelector('p');
    if (firstP) firstP.classList.add('columns-checklist-quote');
    /* wrap the quote + citation paragraphs in a bordered container (source
       draws blue rules above and below this group, separate from the image) */
    const paragraphs = [...mediaCol.querySelectorAll(':scope > p')];
    if (paragraphs.length) {
      const quoteContainer = document.createElement('div');
      quoteContainer.className = 'columns-checklist-quote-container';
      paragraphs[0].before(quoteContainer);
      paragraphs.forEach((p) => quoteContainer.append(p));
    }
  }
  const listCol = block.querySelector('.columns-checklist-list-col');
  if (listCol) {
    listCol.querySelectorAll('h4, h5, h6').forEach((h) => h.classList.add('columns-checklist-heading'));
    listCol.querySelectorAll('ul').forEach((ul) => ul.classList.add('columns-checklist-list'));
  }
}

const DECORATORS = {
  'app-promo': decorateAppPromo,
  'brochure-promo': decorateBrochurePromo,
  checklist: decorateChecklist,
  'history-item': decorateHistoryItem,
  'horizontal-teaser': decorateHorizontalTeaser,
  'image-left': decorateImageLeft,
  'image-right': decorateImageRight,
  'image-teaser': decorateImageTeaser,
  'location-detail': decorateLocationDetail,
  'media-figures': decorateMediaFigures,
  'profile-detail': decorateProfileDetail,
};

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const variant = getVariant(block);
  if (variant && DECORATORS[variant]) {
    DECORATORS[variant](block);
  } else {
    decorateDefault(block);
  }
}
