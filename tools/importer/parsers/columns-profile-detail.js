/* eslint-disable */
/* global WebImporter */
/**
 * columns-profile-detail -> EDS `Columns (profile-detail)`
 * Source: grace.com/about-grace/leadership-team/anthony-yoo/ — .row with .col-lg-4
 * (.media-callout headshot) + .col-lg-8 (.rich-text h1 name + h4 role + body). Receives the .row.
 * Emits ONE row with TWO cells: [text, image].
 *
 * MUST emit the TEXT cell FIRST and the IMAGE cell SECOND (matches the validated draft
 * content/drafts/columns-profile-detail.plain.html). The source authors the headshot `.col-lg-4`
 * FIRST, so a plain document-order build would put the image in cell 1 — but a `columns` block whose
 * FIRST cell is a lone image is treated as an auto-hero by the runtime (the block's decorate() never
 * runs → the photo blows up full-width and the bio drops into a gray band below — the reported
 * defect). blocks/columns/columns.css pulls the image LEFT with `order:-1` precisely because it
 * expects the image authored SECOND. So force text|image order here regardless of source order.
 */
import { buildTwoColumn, cellNodes } from './_columns-utils.js';

export default function parse(element, { document }) {
  const cols = Array.from(element.children).filter((c) => /col-(lg|xs|md|sm)-/.test(c.className));
  if (cols.length >= 2) {
    const cells = cols.slice(0, 2).map((c) => cellNodes(c));
    // the image cell holds only a picture/img (no substantial text of its own).
    const isImageCell = (nodes) => nodes.length
      && nodes.every((n) => n.tagName === 'PICTURE' || n.tagName === 'IMG'
        || (n.querySelector && n.querySelector('picture, img') && !(n.textContent || '').replace(/\s+/g, ' ').trim()));
    if (isImageCell(cells[0]) && !isImageCell(cells[1])) {
      // image authored first → re-emit as [text, image] (one row, two cells).
      const block = WebImporter.Blocks.createBlock(document, {
        name: 'Columns (profile-detail)',
        cells: [[cells[1], cells[0]]],
      });
      element.replaceWith(block);
      return;
    }
  }
  // already text|image (or unrecognized shape) → default document-order build.
  const block = buildTwoColumn(element, document, 'Columns (profile-detail)');
  if (block) element.replaceWith(block);
}
