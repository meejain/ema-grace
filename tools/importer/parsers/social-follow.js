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
    const icon = card.querySelector('i.fa, .icon');
    let network = '';
    if (icon) network = (icon.className.match(/fa-([a-z-]+)/) || [])[1] || '';
    if (!network && href) { try { network = new URL(href).hostname.replace(/^www\.|\.com$/g, '').split('.')[0]; } catch (e) { network = ''; } }
    const label = (card.querySelector('.text, .cta') || {}).textContent || 'Follow us';
    const linkEl = document.createElement('a'); linkEl.href = href; linkEl.textContent = href;
    cells.push([network || 'link', [linkEl], label.trim()]);
  });
  const block = WebImporter.Blocks.createBlock(document, { name: 'Social (follow)', cells });
  const host = element.closest('.card-list') || element;
  host.replaceWith(block);
}
