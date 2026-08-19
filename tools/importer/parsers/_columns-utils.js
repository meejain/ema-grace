/* eslint-disable */
/* global WebImporter */

/**
 * Shared helpers for the `columns` block family.
 *
 * Most columns variants are a single two-column row (image|text, text|image, or text|text)
 * built from a Bootstrap `.row` with two `.col-lg-*` children. The EDS target is uniform:
 *   <div class="columns {variant}">
 *     <div><div>CELL A</div><div>CELL B</div></div>   // one 2-cell row
 *   </div>
 * Multi-item variants (history-item) emit ONE such block per row.
 *
 * cellNodes() preserves the meaningful markup of a column (headings, paragraphs, lists,
 * links, and any image/picture) and drops empty spacer wrappers.
 */

/** Clone a column's meaningful children (image + text markup), dropping empty wrappers. */
export function cellNodes(col) {
  const out = [];
  const pushClone = (el) => { if (el) out.push(el.cloneNode(true)); };

  // Image (picture preferred so srcset/DM variants survive).
  const img = col.querySelector('.image picture, .cmp-image picture, picture, .image img, img');

  // Text container, else the column itself. A column may hold MULTIPLE `.text`/`.rich-text` boxes
  // (e.g. the hydroprocessing col-lg-9: box1 = <h2>, box2 = <h3> + intro <p>). Scoping to only the
  // first box would drop the rest, so when there are several, gather their children in order.
  const textboxes = Array.from(col.querySelectorAll('.text, .rich-text'))
    // keep only OUTERMOST text boxes (a .text wrapping a .rich-text would double-count)
    .filter((tb, _i, arr) => !arr.some((other) => other !== tb && other.contains(tb)));
  const textbox = textboxes[0] || null;
  const scope = textbox || col;

  // If the column is purely an image, emit just the image.
  const textEls = (textboxes.length ? textboxes : [scope]).flatMap((box) => Array.from(box.children)
    .filter((el) => {
      if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return false;
      if (el.matches('.image, .cmp-image, picture') || el.tagName === 'IMG') return false;
      // An image-only WRAPPER (e.g. a `.media-callout` holding just the headshot + an empty
      // video-modal shell) must NOT count as a text element — otherwise it is emitted in ADDITION
      // to the standalone `img` captured below, duplicating the image (leadership-bio profile photo
      // rendered twice). Treat a subtree with a real text run OR an anchor as content; a subtree
      // whose only substantive node is the same image we already have is not.
      const hasText = (el.textContent || '').replace(/\s+/g, ' ').trim().length > 0;
      const hasLink = !!el.querySelector('a[href]');
      if (hasText || hasLink) return true;
      // no text, no link: keep only if it carries an image that is NOT the one captured above.
      return !!el.querySelector('img') && !(img && (el === img || el.contains(img)));
    }));

  if (img && !textEls.length) return [img.cloneNode(true)];

  // Mixed/text column: keep image first (if inline in this column), then text markup.
  if (img && col.contains(img) && scope.contains(img)) pushClone(img);
  if (textEls.length) {
    textEls.forEach(pushClone);
  } else {
    scope.querySelectorAll('h1,h2,h3,h4,h5,h6,p,ul,ol,a').forEach((el) => {
      if ((el.textContent || '').trim()) pushClone(el);
    });
  }
  // A CTA button/link often sits in a SIBLING `.button`/`.button__section` div OUTSIDE the
  // `.text`/`.rich-text` box (e.g. the pe-solution "Learn more about our activators" link). When
  // we scoped to the text box above, that CTA was dropped. Re-collect a button link that lives in
  // the column but outside `scope`, wrapping it in a <p> so decorateButtons promotes it.
  if (textbox) {
    const doc = col.ownerDocument;
    col.querySelectorAll('.button a[href], .button__section a[href], a.btn-primary, a.btn-secondary').forEach((a) => {
      if (scope.contains(a)) return; // already captured inside the text box
      const label = (a.textContent || '').replace(/\s+/g, ' ').trim();
      const href = a.getAttribute('href') || '';
      if (!label || !href) return;
      const p = doc.createElement('p');
      const link = doc.createElement('a');
      link.setAttribute('href', href);
      link.textContent = label;
      p.append(link);
      out.push(p);
    });
  }
  return out.length ? out : [scope.cloneNode(true)];
}

/**
 * Build a two-column `Columns (variant)` block from a `.row` (two .col-lg-* children).
 * @returns {Element|null}
 */
export function buildTwoColumn(row, document, blockName) {
  const cols = Array.from(row.children).filter((c) => /col-(lg|xs|md|sm)-/.test(c.className));
  if (cols.length < 2) return null;
  const cellsRow = cols.slice(0, 2).map((c) => cellNodes(c));
  if (!cellsRow.some((c) => c.length)) return null;
  return WebImporter.Blocks.createBlock(document, { name: blockName, cells: [cellsRow] });
}
