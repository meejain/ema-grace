/* eslint-disable */
/* global WebImporter */
/**
 * custom-widget-contact-panel -> EDS `Custom Widget (contact-panel)`
 * Source: .contact-us-sticky .contact-us__cmp — DUPLICATE mobile + desktop DOM (CSS toggle);
 * .contactus__heading + .contactus__text p + .button__section a.btn-primary -> /forms/.
 * Receives the .contact-us-sticky (or .contact-us__cmp). Dedupes to ONE panel; emits
 * heading row, tagline row, then one row per CTA link.
 */
export default function parse(element, { document }) {
  // Prefer the desktop panel to avoid duplicating the mobile copy.
  const panel = element.querySelector('.contact-us__cmp, .contactus__content-desktop, .contactus__content') || element;
  const heading = (panel.querySelector('.contactus__heading, h2, h3, h4') || {}).textContent || 'Contact Us';
  const tagline = (panel.querySelector('.contactus__text, p') || {}).textContent || '';
  const cells = [[heading.trim()]];
  if (tagline.trim()) cells.push([tagline.trim()]);
  const seen = new Set();
  panel.querySelectorAll('.button__section a, a.btn-primary, a[href*="/forms/"]').forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (!href || seen.has(href)) return; seen.add(href);
    const link = document.createElement('a'); link.href = href; link.textContent = (a.textContent || '').replace(/\s+/g, ' ').trim();
    cells.push([[link]]);
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Custom Widget (contact-panel)', cells });
  const host = element.closest('.contact-us-sticky') || element;
  host.replaceWith(block);
}
