/* eslint-disable */
/* global WebImporter */
/**
 * video-grid -> EDS `Video (grid)`
 * Source: a section with 2+ .media-video stills (poster + YouTube link + caption).
 * Receives the container (matcher returns the section/article holding the .media-video items).
 * Emits one row per video: image | video-URL link | caption.
 */
export default function parse(element, { document }) {
  const vids = Array.from(element.querySelectorAll('.media-video'));
  if (vids.length < 2) return; // a single video is video-overlay, not a grid
  const cells = vids.map((v) => {
    const img = v.querySelector('picture, img');
    const link = v.querySelector('a[href], [data-video-url]');
    const href = link ? (link.getAttribute('href') || link.getAttribute('data-video-url') || '') : '';
    const capEl = v.querySelector('.caption, .h4, .title, figcaption')
      || (v.querySelector('.media-caption') || {});
    const imgCell = img ? [img.cloneNode(true)] : [];
    const linkCell = [];
    if (href) { const a = document.createElement('a'); a.href = href; a.textContent = href; linkCell.push(a); }
    const caption = (capEl.textContent || (img ? img.getAttribute('alt') : '') || '').trim();
    return caption ? [imgCell, linkCell, [document.createTextNode(caption)]] : [imgCell, linkCell];
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Video (grid)', cells });
  element.replaceWith(block);
}
