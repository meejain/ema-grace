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

    // Extract description
    // VALIDATED: Found <div class="spt-copy"><p>...</p></div> at line 303
    const descEl = card.querySelector('.spt-copy p')
      || card.querySelector('.spt-copy')
      || card.querySelector('.content p:not(.h4):not(.h5)');

    // Extract link href
    // VALIDATED: Card itself is an <a> element with href at line 292
    const href = card.href || card.closest('a')?.href || '';

    // Build content cell (column 2): title + description + link
    const contentCell = [];

    if (title) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      contentCell.push(h3);
    }

    if (descEl) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      contentCell.push(p);
    }

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
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Product', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
