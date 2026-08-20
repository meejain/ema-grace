/* eslint-disable */
/* global WebImporter */

/**
 * Shared helpers for the `cards` block family.
 *
 * grace.com builds most card grids NOT as a real card component but as generic Bootstrap
 * grids: a container (section/article) holding one or more `.row`s, each with N column items
 * (`.col-lg-6`, `.col-lg-4`, …). Every item pairs an image (`.image`/`.cmp-image`/`picture`)
 * with text (`.text`/`.rich-text`, headings, links).
 *
 * The EDS target (see content/drafts/cards-*.plain.html) is uniform across these variants:
 *   <div class="cards {variant}">
 *     <div><div>IMAGE</div><div>TEXT</div></div>   // one row per card
 *     ...
 *   </div>
 *
 * So a composed-grid parser receives the CONTAINER, collects its column items across all
 * rows, and emits one 2-cell row (image | content) per item. `contentFrom` keeps the
 * meaningful text markup (headings, paragraphs, lists, links) and drops empty wrappers.
 */

/** First real image node in an item (picture preferred so srcset/DM variants survive). */
function imageOf(item) {
  return item.querySelector('.image picture, .cmp-image picture, picture')
    || item.querySelector('.image img, .cmp-image img, img')
    || null;
}

/**
 * Meaningful content nodes of an item's text side (headings/paragraphs/lists/links).
 * @param {Element} item the card item
 * @param {Document} document
 * @param {{includeSiblingCta?: boolean}} [opts] when includeSiblingCta is set, also pick up a CTA
 *   link authored as a SIBLING of the text box (`.button__section > a` / `.button > a`) — e.g. the
 *   leadership-team "Read more → bio" link, which lives OUTSIDE `.text`. Off by default so other card
 *   variants (insights featured-content, industries grids) keep their exact prior output.
 */
function contentFrom(item, document, opts) {
  // Prefer an explicit text container; else take everything that isn't the image.
  const textbox = item.querySelector('.text, .rich-text');
  const scope = textbox || item;
  const out = [];
  Array.from(scope.children).forEach((el) => {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return;
    if (el.matches('.image, .cmp-image, picture') || el.querySelector('picture, img') === el) return;
    if (el.tagName === 'IMG' || el.querySelector(':scope > picture')) return;
    if (!(el.textContent || '').trim() && !el.querySelector('a')) return;
    out.push(el.cloneNode(true));
  });
  if (textbox && opts && opts.includeSiblingCta) {
    const ctaAnchor = Array.from(item.querySelectorAll('.button__section a[href], .button a[href], a.button[href]'))
      .find((a) => (a.textContent || '').trim() && !textbox.contains(a));
    if (ctaAnchor && !out.some((n) => n.querySelector && n.querySelector('a[href]'))) {
      const p = document.createElement('p');
      p.appendChild(ctaAnchor.cloneNode(true));
      out.push(p);
    }
  }
  if (!out.length) {
    // Fallback: clone any headings/paragraphs/links found anywhere in the item.
    scope.querySelectorAll('h1,h2,h3,h4,h5,h6,p,ul,ol,a').forEach((el) => {
      if ((el.textContent || '').trim()) out.push(el.cloneNode(true));
    });
  }
  void document;
  return out;
}

/**
 * Build a `Cards (variant)` block from a container's column items.
 * @param {Element} container the section/article/row holding the card items
 * @param {Document} document
 * @param {string} blockName e.g. 'Cards (benefits-grid)'
 * @param {string} itemSelector e.g. '.col-lg-6' — the repeated card item
 * @param {(item:Element)=>boolean} [accept] optional extra filter per item
 * @param {{includeSiblingCta?: boolean}} [opts] forwarded to contentFrom (e.g. profile-grid CTA)
 * @returns {Element|null} the created block (already NOT inserted), or null if no cards
 */
export function buildCardsFromColumns(container, document, blockName, itemSelector, accept, opts) {
  const items = Array.from(container.querySelectorAll(itemSelector)).filter((it) => {
    if (accept && !accept(it)) return false;
    return imageOf(it) || (it.textContent || '').trim();
  });
  if (!items.length) return null;

  const cells = items.map((item) => {
    const img = imageOf(item);
    const imageCell = img ? [img.cloneNode(true)] : [];
    const contentCell = contentFrom(item, document, opts);
    return [imageCell, contentCell];
  });

  return WebImporter.Blocks.createBlock(document, { name: blockName, cells });
}

/** Replace `container` in the DOM with the built block (no-op if block is null). */
export function emitCards(container, block) {
  if (block) container.replaceWith(block);
}

export { imageOf, contentFrom };
