/* eslint-disable */
/* global WebImporter */
/**
 * video-overlay -> EDS `Video (overlay)`
 * Source: a single .media-video (poster still + a video/YouTube link). Extracts real content.
 * Receives the .media-video.
 *
 * Block structure — matches the repo's authored contract (content/drafts/video-overlay.plain.html)
 * and the 5 already-imported media-video pages: ONE content row with TWO cells,
 * [ poster <picture> | source <a> ]. blocks/video/overlay.js reads the poster and anchor by
 * selector, so this renders identically; we keep the 2-cell shape for consistency with existing
 * pages rather than the generic 1-cell library default.
 */

// Normalize a YouTube embed/nocookie/short URL to the canonical watch?v= form the Video block
// expects. Leaves non-YouTube (Vimeo, .mp4) URLs untouched.
function normalizeVideoUrl(raw) {
  if (!raw) return '';
  let u = raw.trim();
  if (u.startsWith('//')) u = `https:${u}`;
  const yt = /(?:youtube(?:-nocookie)?\.com\/(?:embed|v)\/|youtu\.be\/)([\w-]{6,})/i.exec(u);
  if (yt) return `https://www.youtube.com/watch?v=${yt[1]}`;
  const watch = /[?&]v=([\w-]{6,})/i.exec(u);
  if (watch && /youtube/i.test(u)) return `https://www.youtube.com/watch?v=${watch[1]}`;
  return u;
}

export default function parse(element, { document }) {
  const img = element.querySelector('picture, img');

  // Video URL. Simple case: an <a>/[data-video-url] inside the .media-video. Grace's product-page
  // media-callout instead hides the URL in a sibling `.media-modal .active-video video[src]` /
  // `iframe[src]` (a youtube-nocookie embed) — so if no direct link is present, look up into the
  // enclosing .media-callout for that embed. Normalize any YouTube embed to a watch?v= URL.
  const link = element.querySelector('a[href], [data-video-url]');
  let href = link ? (link.getAttribute('href') || link.getAttribute('data-video-url') || '') : '';
  if (!href) {
    const scope = element.closest('.media-callout, .cmp-media-callout') || element;
    const media = scope.querySelector('.media-modal .active-video video[src], .media-modal iframe[src], .active-video iframe[src], iframe[src*="youtu"], video[src*="youtu"]');
    if (media) href = media.getAttribute('src') || '';
  }
  href = normalizeVideoUrl(href);

  if (!img && !href) return;

  // Caption title (source: `.media-video > p.subhead-large.header-on-mobile`, mirrored in
  // `.video-hover .subhead-large.header-on-desktop`). The parser previously dropped it, so the
  // migrated video lost its "Grace ActivCat® Catalyst Overview"-style heading. Capture the first
  // non-empty subhead and emit it as a sibling <h3> BEFORE the block (default content in the same
  // section) — keeps the block's 2-cell contract intact while restoring the visible title.
  const captionScope = element.closest('.media-callout, .cmp-media-callout') || element;
  const titleEl = captionScope.querySelector('.subhead-large');
  const captionTitle = titleEl ? (titleEl.textContent || '').replace(/\s+/g, ' ').trim() : '';

  // ONE content row, TWO cells: [ poster image | source link ] — the repo contract.
  const imageCell = img ? [img.cloneNode(true)] : [];
  const linkCell = [];
  if (href) { const a = document.createElement('a'); a.href = href; a.textContent = href; linkCell.push(a); }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Video (overlay)', cells: [[imageCell, linkCell]] });
  if (captionTitle) {
    const h = document.createElement('h3');
    h.textContent = captionTitle;
    element.replaceWith(h, block);
  } else {
    element.replaceWith(block);
  }
}
