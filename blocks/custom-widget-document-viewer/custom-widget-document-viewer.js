/*
 * Custom Widget Document Viewer
 * Renders an embedded, responsive document/flipbook viewer (FlippingBook, Issuu,
 * generic PDF/iframe). Falls back to a lazy-loaded iframe for any embed URL.
 * The source widget (grace.com) embeds a FlippingBook publication at a fixed
 * 3:2 aspect ratio filling 100% of the available width.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

// Default aspect ratio (width:height) matching the source FlippingBook embed.
const DEFAULT_RATIO = '3:2';

/**
 * Parse an aspect ratio token like "3:2" or "16:9" into a padding-bottom %.
 * @param {string} ratio ratio token
 * @returns {number} padding-bottom percentage
 */
function ratioToPadding(ratio) {
  const [w, h] = String(ratio).split(':').map(Number);
  if (!w || !h) return (2 / 3) * 100; // fallback to 3:2
  return (h / w) * 100;
}

/**
 * Build the responsive iframe embed markup.
 * @param {string} src embed URL
 * @param {string} title accessible title
 * @param {number} paddingBottom aspect-ratio padding percentage
 * @returns {HTMLElement} embed wrapper
 */
function buildEmbed(src, title, paddingBottom) {
  const wrapper = document.createElement('div');
  wrapper.className = 'custom-widget-document-viewer-embed';
  wrapper.style.paddingBottom = `${paddingBottom}%`;

  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.title = title || 'Document viewer';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'fullscreen; clipboard-write; encrypted-media');
  wrapper.append(iframe);
  return wrapper;
}

export default function decorate(block) {
  const rows = [...block.children];

  // Config-driven: rows may be "ratio | 3:2", "title | ...". The last/only
  // remaining row that contains a link is the document embed.
  let ratio = DEFAULT_RATIO;
  let title = '';
  let link = null;
  let cover = null;

  rows.forEach((row) => {
    const cells = [...row.children];
    const anchor = row.querySelector('a[href]');
    const picture = row.querySelector('picture');
    const key = cells[0] ? cells[0].textContent.trim().toLowerCase() : '';

    if (anchor && !link) {
      link = anchor;
    } else if (picture && !cover) {
      cover = picture;
    } else if (key === 'ratio' && cells[1]) {
      ratio = cells[1].textContent.trim() || DEFAULT_RATIO;
    } else if (key === 'title' && cells[1]) {
      title = cells[1].textContent.trim();
    }
  });

  block.textContent = '';

  if (!link) {
    // No embed URL: nothing to render.
    return;
  }

  const src = link.href;
  const paddingBottom = ratioToPadding(ratio);
  const iframeTitle = title || link.textContent.trim() || 'Document viewer';

  // Optional heading above the viewer (only when explicitly authored).
  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'custom-widget-document-viewer-title';
    heading.textContent = title;
    block.append(heading);
  }

  // Optional cover image (download-panel style) rendered before the embed.
  if (cover) {
    const img = cover.querySelector('img');
    const optimized = createOptimizedPicture(
      img ? img.src : '',
      img ? img.alt : title,
      false,
      [{ width: '750' }],
    );
    const coverWrap = document.createElement('div');
    coverWrap.className = 'custom-widget-document-viewer-cover';
    coverWrap.append(optimized);
    block.append(coverWrap);
  }

  block.append(buildEmbed(src, iframeTitle, paddingBottom));
}
