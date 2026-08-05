/* eslint-disable */
/* global WebImporter */
/**
 * social-share -> EDS `Social (share)`
 * Source: .social-share-container — .heading 'SHARE' + a.social-link[data-channel]. hrefs are
 * empty until JS, so we emit the CHANNEL LIST as content. Receives the .social-share-container.
 * Draft target: one cell listing the channels.
 */
export default function parse(element, { document }) {
  const links = Array.from(element.querySelectorAll('a.social-link, .share-button, [data-channel]'));
  const channels = links.map((a) => (a.getAttribute('data-channel') || a.getAttribute('aria-label') || a.textContent || '').trim())
    .filter(Boolean);
  const uniq = [...new Set(channels.map((c) => c.replace(/^./, (m) => m.toUpperCase())))];
  const text = uniq.length ? uniq.join(', ') : 'Facebook, X, LinkedIn, Email, Print';
  const block = WebImporter.Blocks.createBlock(document, { name: 'Social (share)', cells: [[text]] });
  element.replaceWith(block);
}
