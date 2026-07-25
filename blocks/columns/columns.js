/*
 * Consolidated columns block. The base decoration tags image/text columns for
 * simple side-by-side variants; variants with bespoke DOM needs (teaser
 * overlays, checklist normalisation, people cards, etc.) are dispatched to
 * their own decorate function keyed by the variant class on the block.
 */

const VARIANTS = ['app-promo', 'brochure-promo', 'checklist', 'history-item', 'horizontal-teaser', 'image-left', 'image-right', 'image-teaser', 'image-text-list', 'location-detail', 'people', 'profile-detail'];

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

function decorateImageTextList(block) {
  tagImageTextCols(block, 'columns-image-text-list');
}

function decorateLocationDetail(block) {
  tagImageTextCols(block, 'columns-location-detail', { imgSelector: 'picture, img' });
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

function decorateHorizontalTeaser(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;
  const cols = [...row.children];
  const imgCol = cols.find((col) => col.querySelector('picture'));
  const textCol = cols.find((col) => !col.querySelector('picture'));
  if (imgCol) {
    const pic = imgCol.querySelector('picture');
    const anchor = pic.closest('a');
    if (anchor && anchor.childElementCount === 1) anchor.replaceWith(pic);
    imgCol.classList.add('columns-horizontal-teaser-bg');
  }
  const overlay = document.createElement('div');
  overlay.className = 'columns-horizontal-teaser-overlay';
  row.append(overlay);
  if (textCol) textCol.classList.add('columns-horizontal-teaser-content');
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
      if (heading) {
        const title = document.createElement('p');
        title.classList.add('columns-image-teaser-title');
        title.textContent = heading.textContent;
        imgWrapper.append(title);
      }
      const overlay = document.createElement('div');
      overlay.classList.add('columns-image-teaser-overlay');
      imgWrapper.append(overlay);

      const body = document.createElement('div');
      body.classList.add('columns-image-teaser-body');
      [...col.querySelectorAll('p')].forEach((p) => {
        if (p.querySelector('picture')) return;
        if (p.querySelector('a') && !p.textContent.replace(p.querySelector('a').textContent, '').trim()) return;
        if (!p.textContent.trim()) return;
        const caption = document.createElement('p');
        caption.classList.add('columns-image-teaser-caption');
        caption.innerHTML = p.innerHTML;
        body.append(caption);
      });
      const cta = document.createElement('span');
      cta.classList.add('columns-image-teaser-cta');
      cta.textContent = 'Learn More';
      body.append(cta);

      col.textContent = '';
      col.classList.add('columns-image-teaser-card');
      if (href) {
        const wrap = document.createElement('a');
        wrap.href = href;
        wrap.setAttribute('aria-label', heading ? heading.textContent : 'Read more');
        wrap.append(imgWrapper, body);
        col.append(wrap);
      } else {
        col.append(imgWrapper, body);
      }
    });
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
  }
  const listCol = block.querySelector('.columns-checklist-list-col');
  if (listCol) {
    listCol.querySelectorAll('h4, h5, h6').forEach((h) => h.classList.add('columns-checklist-heading'));
    listCol.querySelectorAll('ul').forEach((ul) => ul.classList.add('columns-checklist-list'));
  }
}

function decoratePeople(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const imgLink = col.querySelector('a > img, a > picture');
      const pic = col.querySelector('picture') || (imgLink ? imgLink.parentElement : null);
      if (!pic) return;
      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('columns-people-img-col');
      const imgEl = pic.tagName === 'A' ? pic : pic.closest('a') || pic;
      imgWrapper.appendChild(imgEl.cloneNode(true));
      if (imgEl.parentElement) imgEl.remove();
      const textWrapper = document.createElement('div');
      textWrapper.classList.add('columns-people-text-col');
      while (col.firstChild) textWrapper.appendChild(col.firstChild);
      col.appendChild(imgWrapper);
      col.appendChild(textWrapper);
    });
  });
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
  'image-text-list': decorateImageTextList,
  'location-detail': decorateLocationDetail,
  people: decoratePeople,
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
