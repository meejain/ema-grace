/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-product block
 *
 * Source: https://grace.com/
 * Base Block: cards
 *
 * Block Structure (from markdown example):
 * - Row per card: Image cell | Title + Description + Link cell
 *
 * Source HTML Pattern (from captured DOM):
 * <a class="cmp-card text-on-bkgd bio" href="/products/adsorbents/">
 *   <div class="card-content">
 *     <div class="image"><img src="..." alt="..."></div>
 *     <div class="content">
 *       <div class="text">
 *         <p class="h5">PROMOTION</p>
 *         <p class="h4 title none-subtitle">Adsorbents</p>
 *         <div class="h6 spt-copy"><p>Description text</p></div>
 *       </div>
 *     </div>
 *   </div>
 * </a>
 *
 * Generated: 2026-02-26
 */
export default function parse(element, { document }) {
  // Find all product card elements
  // VALIDATED: Found <a class="cmp-card ... bio"> at lines 292, 316, 340, 364
  // The element may be an individual card or a container with multiple cards
  let cards;

  if (element.classList.contains('cmp-card') && element.classList.contains('bio')) {
    // Element IS a card - look for siblings in parent container
    const parentRow = element.closest('.row') || element.closest('article') || element.parentElement;
    cards = Array.from(parentRow.querySelectorAll('.cmp-card.bio'));
  } else {
    // Element is a container - find cards within
    cards = Array.from(element.querySelectorAll('.cmp-card.bio'));
  }

  if (!cards.length) {
    cards = Array.from(element.querySelectorAll('.cmp-card'));
  }

  // Build cells array - one row per card with 2 columns (image | content)
  const cells = [];

  cards.forEach((card) => {
    // Extract image
    // VALIDATED: Found <div class="image"><img src="..." alt="..."> at line 294
    const img = card.querySelector('.image img')
      || card.querySelector('.card-content img')
      || card.querySelector('img');

    // Extract title
    // VALIDATED: Found <p class="h4 title none-subtitle">Adsorbents</p> at line 300
    const title = card.querySelector('.title')
      || card.querySelector('.h4')
      || card.querySelector('h3, h4');

    // Extract description body. Two shapes occur:
    //   • hub product-nav cards: a short prose paragraph in `.spt-copy p`.
    //   • product-detail BENEFIT cards: a BULLET LIST in `.spt-copy > ul` (no <p>). Flattening a
    //     <ul> to one <p> (old behaviour) destroys the list, so preserve the rich body: clone the
    //     `.spt-copy` children (ul/ol/p) verbatim. Fall back to a plain <p> for bare-text bodies.
    const descHost = card.querySelector('.spt-copy') || card.querySelector('.content .text');
    const descNodes = [];
    if (descHost) {
      const rich = Array.from(descHost.children).filter((c) => {
        if (!/^(UL|OL|P|H4|H5|H6)$/.test(c.tagName)) return false;
        // EXCLUDE the eyebrow label (`.h5`, e.g. "PROMOTION") and the TITLE (`.h4.title`/`.title`/
        // `.h4` — already emitted as the card <h3> above). Otherwise a card with NO real description
        // (the about-grace root section cards) wrongly emits "PROMOTION" + a DUPLICATE title as body.
        if (c.matches('.h5')) return false;
        if (title && (c === title || c.matches('.h4.title, .title, .h4'))) return false;
        return true;
      });
      // structured children that ARE description candidates (before the eyebrow/title exclusion).
      const anyStructured = Array.from(descHost.children).some((c) => /^(UL|OL|P|H4|H5|H6)$/.test(c.tagName));
      if (rich.length) {
        rich.forEach((c) => descNodes.push(c.cloneNode(true)));
      } else if (!anyStructured) {
        // ONLY fall back to raw text when there were no structured children at all (a bare-text
        // description). If the children existed but were all the eyebrow (`.h5`) + title (`.h4`),
        // there is NO real description — emit nothing (don't dump "PROMOTION" + the duplicate title).
        const txt = (descHost.textContent || '').trim();
        if (txt) { const p = document.createElement('p'); p.textContent = txt; descNodes.push(p); }
      }
    } else {
      const p2 = card.querySelector('.content p:not(.h4):not(.h5)');
      if (p2) { const p = document.createElement('p'); p.textContent = p2.textContent.trim(); descNodes.push(p); }
    }

    // Extract link href. Hub cards ARE anchors (card.href); benefit cards are plain divs with no
    // link — skip the link entirely rather than emit an empty <a> (which round-trips to "[](​)").
    const href = card.href || card.closest('a')?.href || '';

    // Build content cell (column 2): title + description body + optional link
    const contentCell = [];

    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      contentCell.push(h3);
    }

    descNodes.forEach((n) => contentCell.push(n));

    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = title ? title.textContent.trim() : 'Learn more';
      contentCell.push(link);
    }

    // Build row: [image cell, content cell]
    const imageCell = img ? [img] : [];
    cells.push([imageCell, contentCell]);
  });

  // Create block using WebImporter utility
  // EDS block naming: "Cards (product)" → class "cards product" → blocks/cards/ (variant
  // `product`). The earlier "Cards-Product" slugified to a "cards-product" class, which EDS
  // resolved to a non-existent blocks/cards-product/ folder (404) so the block never decorated.
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards (product)', cells });

  // Replace the whole card group (the .row containing all cards) once, so the
  // selector matching each individual card does not create duplicate blocks and
  // does not leave stray card markup behind. The import script skips elements
  // already detached from the DOM on subsequent matches.
  const groupContainer = element.closest('.row') || element.closest('article') || element.parentElement;
  (groupContainer || element).replaceWith(block);
}
