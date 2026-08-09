/* eslint-disable */
/* global WebImporter */
/**
 * social-follow -> EDS `Social (follow)`
 * Source: .cmp-card-list.grid.three-columns with .heading 'Follow us' + a.cmp-card.style-icon
 * external links. Receives the card-list container. Emits heading row + one row per network:
 * [network, link, cta-label].
 */
export default function parse(element, { document }) {
  const headingEl = element.querySelector('.heading h3, .heading, h3');
  const heading = headingEl ? headingEl.textContent.trim() : 'Follow us';
  const cards = Array.from(element.querySelectorAll('a.cmp-card.style-icon, a.cmp-card[href], .card a[href]'));
  if (!cards.length) return;
  const cells = [[heading]];
  cards.forEach((card) => {
    const href = card.getAttribute('href') || '';
    // Network key: prefer the FontAwesome icon class (fa-linkedin/youtube/twitter),
    // else infer from href. (The card's `.text` block also holds a "PROMOTION" eyebrow
    // + the network name + a CTA — do NOT use the whole block as the label.)
    const icon = card.querySelector('i.fa, i[class*="fa-"], .icon i, .icon');
    let network = '';
    if (icon) network = (String(icon.className).match(/fa-([a-z-]+)/) || [])[1] || '';
    if (!network && href) { try { network = new URL(href).hostname.replace(/^www\.|\.com$/g, '').split('.')[0]; } catch (e) { network = ''; } }
    // Clean network label = the card TITLE (`.h4.title`), NOT the PROMOTION eyebrow (`.h5`).
    const titleEl = card.querySelector('.h4.title, .title, .h4');
    const title = titleEl ? (titleEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
    // CTA = the explicit cta element if present, else a sensible per-network default.
    const ctaEl = card.querySelector('.cta, .link-text, .button');
    let cta = ctaEl ? (ctaEl.textContent || '').replace(/\s+/g, ' ').trim() : '';
    if (!cta) cta = /youtu/i.test(network) ? 'Subscribe' : 'Follow us';
    const linkEl = document.createElement('a'); linkEl.href = href; linkEl.textContent = href;
    cells.push([network || title || 'link', [linkEl], cta]);
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Social (follow)', cells });
  const host = element.closest('.card-list') || element;
  host.replaceWith(block);
}
