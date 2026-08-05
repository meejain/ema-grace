/* eslint-disable */
/* global WebImporter */
/**
 * video-overlay -> EDS `Video (overlay)`
 * Source: a single .media-video (poster still + a video/YouTube link). Extracts real content.
 * Receives the .media-video. Emits image | video-URL link.
 */
export default function parse(element, { document }) {
  const img = element.querySelector('picture, img');
  const link = element.querySelector('a[href], [data-video-url]');
  const href = link ? (link.getAttribute('href') || link.getAttribute('data-video-url') || '') : '';
  if (!img && !href) return;
  const imageCell = img ? [img.cloneNode(true)] : [];
  const linkCell = [];
  if (href) { const a = document.createElement('a'); a.href = href; a.textContent = href; linkCell.push(a); }
  const block = WebImporter.Blocks.createBlock(document, { name: 'Video (overlay)', cells: [[imageCell, linkCell]] });
  element.replaceWith(block);
}
