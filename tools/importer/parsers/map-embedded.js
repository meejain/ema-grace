/* eslint-disable */
/* global WebImporter */
/**
 * map-embedded -> EDS `Map Embedded`
 * Source: .embed-code .mapouter with iframe#gmap_canvas. On the SERVER DOM the iframe src is
 * JS-populated (empty at capture), so we cannot always recover the maps URL. Preferred: emit
 * the Google Maps iframe URL when present. Fallback: emit the adjacent ADDRESS block (name +
 * address + phone) so the location content survives; the map itself is wired later.
 * Strips embed-boilerplate backlinks (fmovies / embedgooglemap) + inline <style>.
 */
export default function parse(element, { document }) {
  const iframe = element.querySelector('iframe[src*="google.com/maps"], iframe[src*="maps.google"], iframe[src*="output=embed"]');
  const src = iframe ? iframe.getAttribute('src') : '';

  const cells = [];
  if (src && /^https?:/i.test(src)) {
    const a = document.createElement('a'); a.href = src; a.textContent = src;
    cells.push([[a]]);
  } else {
    // Fallback: the address block that sits beside the map in the same row/article.
    const article = element.closest('article, .row, section') || element.parentElement;
    const addressCol = article
      ? Array.from(article.querySelectorAll('.rich-text, .text, [class*="col-"]'))
        .find((c) => /address/i.test(c.textContent || '') && !c.querySelector('iframe'))
      : null;
    const nodes = [];
    if (addressCol) {
      Array.from(addressCol.children).forEach((el) => {
        if (el.querySelector && el.querySelector('iframe')) return;
        if ((el.textContent || '').trim()) nodes.push(el.cloneNode(true));
      });
    }
    if (!nodes.length) return; // nothing usable — leave in place rather than emit empty
    cells.push([nodes]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'Map Embedded', cells });
  const host = element.closest('.embed-code') || element;
  host.replaceWith(block);
}
