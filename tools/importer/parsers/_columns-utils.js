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

  // Text container, else the column itself.
  const textbox = col.querySelector('.text, .rich-text');
  const scope = textbox || col;

  // If the column is purely an image, emit just the image.
  const textEls = Array.from(scope.children).filter((el) => {
    if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return false;
    if (el.matches('.image, .cmp-image, picture') || el.tagName === 'IMG') return false;
    return (el.textContent || '').trim() || el.querySelector('a, img');
  });

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
