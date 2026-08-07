/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Grace.com Dynamic Media / Scene7 images.
 *
 * Purpose: preserve DM/Scene7 image URLs as LIVE references instead of letting
 * DA ingest a static copy. It rewrites every DM `<img>` into an anchor that
 * carries the DM URL — `<a href="DM-URL">alt</a>` for an unlinked image, or
 * `<a href="/page" title="DM-URL">alt</a>` for a linked image (DM URL stashed in
 * `title` so the navigation href is preserved). The `[text](url "title")` carrier
 * survives the docx → markdown round-trip, which a raw `<img src>` would not.
 * The client-side auto-block in scripts/scripts.js (buildDynamicMediaImages)
 * rebuilds a responsive `<picture>` from these anchors at render time.
 *
 * Runs only in afterTransform: block parsers run between beforeTransform and
 * afterTransform and extract <img> into block cells (cards/carousel image cells).
 * Rewriting to anchors before the parsers run would leave them with empty image
 * cells. Running afterTransform lets parsers build their cells first; we then walk
 * the parser-modified DOM and rewrite DM imgs wherever they ended up.
 *
 * Canonical helpers copied from excat dm-scene7-helpers.js — keep byte-identical.
 */

// ---- Begin canonical helpers (from dm-scene7-helpers.js) ----
function detectDynamicMediaUrl(urlStr) {
  let u;
  try { u = new URL(urlStr, 'https://x/'); } catch { return false; }
  // Scene7 detected by path alone — hostname is irrelevant because customer
  // sites routinely CNAME a vanity domain to Scene7.
  if (u.pathname.startsWith('/is/image/')) {
    return 'scene7';
  }
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

// Walk up from a DM <img> through allow-listed inline wrappers (currently just
// <picture>) to find the carrier anchor for the linked-image round-trip.
// Returns the outer <a> when the img is the sole meaningful descendant; null
// otherwise. Keep byte-identical with dm-scene7-helpers.js.
const LINKED_DM_INLINE_WRAPPER_TAGS = new Set(['PICTURE']);
const LINKED_DM_WRAPPER_SIBLING_TAGS = new Set(['SOURCE']);
function findLinkedDmCarrier(img) {
  if (!img || !img.parentElement) return null;
  let node = img;
  let parent = img.parentElement;
  while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
    let foundNode = false;
    for (const child of parent.children) {
      if (child === node) {
        foundNode = true;
      } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
        return null;
      }
    }
    if (!foundNode) return null;
    node = parent;
    parent = parent.parentElement;
  }
  if (!parent || parent.tagName !== 'A') return null;
  if (parent.children.length !== 1 || parent.children[0] !== node) return null;
  if (parent.textContent.trim() !== '') return null;
  return parent;
}

const EMPTY_ALT_SENTINEL = 'Image without alt text';

function altToLinkText(alt) {
  return alt || EMPTY_ALT_SENTINEL;
}
// ---- End canonical helpers ----

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const doc = element.ownerDocument;

  element.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (!detectDynamicMediaUrl(src)) return;

    // Preserve alt verbatim, including empty string for decorative images. The
    // auto-block uses the URL pattern (not the text) to find these anchors, so
    // the link text is purely a Document-view UX cue. When alt is empty we
    // substitute EMPTY_ALT_SENTINEL so authors editing the doc see a visible
    // cell; the auto-block translates it back to alt="" via linkTextToAlt().
    const alt = img.getAttribute('alt') || '';

    // Linked image (incl. parser-wrapped <a><picture><img></picture></a>).
    // Stash DM URL in title, keep outer href; textContent replaces wrapper
    // descendants with the link text.
    const linkedAnchor = findLinkedDmCarrier(img);
    if (linkedAnchor) {
      linkedAnchor.setAttribute('title', src);
      linkedAnchor.textContent = altToLinkText(alt);
      return;
    }

    // Inside an anchor but not a sole-meaningful-child shape — mixed content.
    // No clean single-anchor markdown representation; skip.
    const parent = img.parentElement;
    if (parent && parent.tagName === 'A') {
      console.warn('DM image inside mixed-content anchor, skipped:', src);
      return;
    }

    // Unlinked image: create an anchor whose href is the DM URL.
    const a = doc.createElement('a');
    a.href = src;
    a.textContent = altToLinkText(alt);
    img.replaceWith(a);
  });
}
