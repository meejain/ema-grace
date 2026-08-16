/* eslint-disable */
/* global WebImporter */
/**
 * custom-widget-news-archive -> EDS `Custom Widget (news-archive)`
 * Source: .accordion .accordion-comp with dl.plus-minus.accordion per YEAR; dt = year,
 * dd > .col-lg-6 .media-callout (cover img + PDF download link). Receives the .accordion-comp.
 * Emits one row per year: [year, image + download-link(s)].
 */
export default function parse(element, { document }) {
  const dls = Array.from(element.querySelectorAll('dl.accordion, .accordion-comp-list > dl, dl'));
  if (!dls.length) return;
  const cells = dls.map((dl) => {
    const year = (dl.querySelector('dt .h6, dt button, dt') || {}).textContent || '';
    const dd = dl.querySelector('dd');
    const content = [];
    if (dd) {
      // Collect the content blocks WITHOUT double-counting. The source nests a `.media-callout`
      // (cover image) INSIDE a `.col-lg-6`, and there may be a second `.col-lg-6` holding the PDF
      // download link. Prefer `.media-callout` units; if none, fall back to the columns. Selecting
      // both `.media-callout` AND its ancestor `.col-lg-6` (the old behavior) pushed the same image
      // twice → the "2 images per year" defect. De-dup by tracking already-captured images/links.
      let blocks = Array.from(dd.querySelectorAll('.media-callout'));
      if (!blocks.length) blocks = Array.from(dd.querySelectorAll('.col-lg-6, .col-lg-4'));
      const seenImg = new Set();
      const seenLink = new Set();
      const pushImg = (cb) => {
        const img = cb.querySelector('picture img, img');
        const key = img ? (img.getAttribute('src') || img.currentSrc || img.outerHTML) : '';
        if (img && !seenImg.has(key)) { seenImg.add(key); content.push((cb.querySelector('picture') || img).cloneNode(true)); }
      };
      const pushLink = (cb) => {
        const link = cb.querySelector('a[href]');
        if (!link) return;
        const href = link.getAttribute('href') || '#';
        if (seenLink.has(href)) return;
        seenLink.add(href);
        // Wrap the download link in <strong> so scripts.js decorateButtons() promotes it to
        // a.button.primary, which custom-widget.css styles as the green "Download …" button
        // (the block's CSS already targets `.custom-widget-news-archive-body a.button`). A bare
        // <a> stayed a plain black underlined link — the catalagram-archive "buttons not green" defect.
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        const a = document.createElement('a');
        a.href = href;
        a.textContent = (link.textContent || 'Download').replace(/\s+/g, ' ').trim();
        strong.append(a);
        p.append(strong);
        content.push(p);
      };
      // Image(s) first, then the download link(s) — matching source order (cover, then button).
      blocks.forEach(pushImg);
      // Links can live in a sibling column, not necessarily the media-callout — scan the whole dd.
      Array.from(dd.querySelectorAll('.col-lg-6, .col-lg-4, .media-callout')).forEach(pushLink);
      if (!content.length) { dd.querySelectorAll('picture,img,a[href]').forEach((n) => content.push(n.cloneNode(true))); }
    }
    return [[(year || '').trim()], content];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Custom Widget (news-archive)', cells });
  element.replaceWith(block);
}
