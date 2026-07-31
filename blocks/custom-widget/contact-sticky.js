/*
 * Custom Widget: Contact Sticky (green "Contact Us" panel).
 *
 * Source: grace.com contact-us-sticky clientlib. On desktop the green panel
 * overlaps the bottom-right of the hero and, once the hero scrolls out of view,
 * sticks (fixed) just below the header. On mobile it collapses to a fixed
 * bottom bar ("Contact Us") that expands on tap to reveal the tagline + buttons.
 *
 * Content model (rows delivered by the author or the auto-block):
 *   Row 0: heading text            e.g. "Contact Us"
 *   Row 1: tagline text            e.g. "Talk to our experts ..."
 *   Row 2: list of CTA links       <ul><li><a href>…</a></li>…</ul>
 */

// Collapsed (contact/phone) / expanded (minus) icons for the mobile toggle bar.
// The source uses a small Font Awesome phone glyph, not a link/chain icon.
const ICON_PHONE = '<svg class="contact-sticky-mobile-icon" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path fill="currentColor" d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"/></svg>';
const ICON_MINUS = '<svg class="contact-sticky-mobile-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4" y="11" width="16" height="2.5" fill="currentColor"/></svg>';

/**
 * Build the shared inner content (tagline + CTA buttons) used by both the
 * desktop panel and the mobile expandable content.
 * @param {string} tagline tagline text
 * @param {HTMLElement|null} list authored <ul>/<ol> of CTA links (may be null)
 * @returns {DocumentFragment}
 */
function buildBody(tagline, list) {
  const frag = document.createDocumentFragment();

  if (tagline) {
    const p = document.createElement('p');
    p.className = 'contact-sticky-text';
    p.textContent = tagline;
    frag.append(p);
  }

  const buttons = document.createElement('div');
  buttons.className = 'contact-sticky-buttons';
  if (list) {
    [...list.querySelectorAll('a')].forEach((a) => {
      const btn = document.createElement('a');
      btn.className = 'contact-sticky-btn';
      btn.href = a.getAttribute('href') || '#';
      const label = document.createElement('span');
      label.className = 'contact-sticky-btn-label';
      label.textContent = a.textContent.trim();
      btn.append(label);
      buttons.append(btn);
    });
  }
  frag.append(buttons);
  return frag;
}

// y-offset (px) at which the panel locks once stuck — just below the collapsed
// sticky header (55px nav + ~51px gap). Mirrors the source's fixed landing spot
// (grace.com locks contactus__content-desktop at top:106px).
const STUCK_TOP = 106;

/**
 * Wire up sticky-on-scroll behaviour for the desktop panel (source parity).
 *
 * Two phases, matching grace.com's contactus cmp:
 *  1. Below the threshold the panel is `absolute` and scrolls 1:1 with the page.
 *  2. Once the panel's natural top reaches STUCK_TOP, it switches to `fixed` and
 *     locks at that exact y for the rest of the scroll — no jump, because the
 *     switch happens at the precise scroll position where the two tops coincide.
 * @param {HTMLElement} block the block element
 */
function initSticky(block) {
  const panel = block.querySelector('.contact-sticky-desktop');
  if (!panel) return;

  // Distance (px) the panel's natural top sits below its containing block. The
  // panel is absolutely positioned at top:-190px within the block, so its
  // document-space top is blockDocTop - 190. Read the value actually in effect
  // so the threshold stays correct if the offset is ever tweaked in CSS.
  const panelOffset = parseFloat(getComputedStyle(panel).top) || 0; // e.g. -190

  let stuck = false;

  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset;
    // The block is always in normal flow (height:0, never fixed), so its viewport
    // top plus scroll gives a stable document position — safe to read every
    // scroll and recompute the threshold unconditionally. This self-corrects
    // after the hero image loads and never locks against a stale measurement.
    const blockDocTop = block.getBoundingClientRect().top + y;
    const panelDocTop = blockDocTop + panelOffset;
    const threshold = panelDocTop - STUCK_TOP;
    // Never stick at the very top, and never trust a non-positive threshold
    // (which only arises from a premature/incomplete layout measurement, e.g.
    // before the fixed header's spacer is applied during eager decoration).
    const shouldStick = y > 0 && threshold > 0 && y >= threshold;
    if (shouldStick !== stuck) {
      stuck = shouldStick;
      block.classList.toggle('is-stuck', stuck);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // Re-run after the hero image loads, since it changes the block's flow position.
  window.addEventListener('load', onScroll);
  onScroll();
}

/**
 * loads and decorates the contact sticky widget
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const heading = rows[0] ? rows[0].textContent.trim() : 'Contact Us';
  const tagline = rows[1] ? rows[1].textContent.trim() : '';
  const list = rows[2] ? rows[2].querySelector('ul, ol') : null;

  // --- Desktop panel ---------------------------------------------------
  const desktop = document.createElement('div');
  desktop.className = 'contact-sticky-desktop';
  const dHeading = document.createElement('h4');
  dHeading.className = 'contact-sticky-heading';
  dHeading.textContent = heading;
  desktop.append(dHeading, buildBody(tagline, list));

  // --- Mobile bottom bar ----------------------------------------------
  const mobile = document.createElement('div');
  mobile.className = 'contact-sticky-mobile';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'contact-sticky-mobile-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  const mLabel = document.createElement('span');
  mLabel.className = 'contact-sticky-mobile-label';
  mLabel.textContent = heading;
  const mIcon = document.createElement('span');
  mIcon.className = 'contact-sticky-mobile-icon-wrap';
  mIcon.innerHTML = ICON_PHONE;
  toggle.append(mLabel, mIcon);

  const mContent = document.createElement('div');
  mContent.className = 'contact-sticky-mobile-content';
  mContent.hidden = true;
  mContent.append(buildBody(tagline, list));

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    mContent.hidden = expanded;
    mIcon.innerHTML = expanded ? ICON_PHONE : ICON_MINUS;
  });

  mobile.append(toggle, mContent);

  block.replaceChildren(desktop, mobile);

  initSticky(block);
}
