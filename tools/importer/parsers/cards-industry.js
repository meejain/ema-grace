/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-industry block
 *
 * Source: https://grace.com/
 * Base Block: cards
 *
 * Block Structure (from markdown example):
 * - Row per card: Image cell | Linked title cell
 *
 * Source HTML Pattern (from captured DOM):
 * <div class="card-group">
 *   <div class="card">
 *     <div class="card-item none-bkgd black">
 *       <a href="/industries/refining-technologies/" class="cmp-card text-on-bkgd small">
 *         <div class="card-content">
 *           <div class="image"><img src="..." alt="..."></div>
 *           <div class="content">
 *             <div class="cta btn-track">Refining Technologies <i class="fas fa-chevron-right"></i></div>
 *           </div>
 *         </div>
 *       </a>
 *     </div>
 *   </div>
 *   ... (6 cards total)
 * </div>
 *
 * Generated: 2026-02-26
 */
export default function parse(element, { document }) {
  // Find all industry card elements
  // VALIDATED: Found <a class="cmp-card ... small"> at lines 477, 494, 511, 528, 545, 562
  let cards = Array.from(element.querySelectorAll('.cmp-card.small'));

  if (!cards.length) {
    // Fallback: find by card-group > card structure
    cards = Array.from(element.querySelectorAll('.card .cmp-card'));
  }

  if (!cards.length) {
    // Broader fallback
    cards = Array.from(element.querySelectorAll('.cmp-card'));
  }

  // Build cells array - one row per card with 2 columns (image | linked title)
  const cells = [];

  cards.forEach((card) => {
    // Extract image
    // VALIDATED: Found <div class="image"><img src="..." alt="Image of card"> at line 480
    const img = card.querySelector('.image img')
      || card.querySelector('.card-content img')
      || card.querySelector('img');

    // Extract linked title text
    // VALIDATED: Found <div class="cta btn-track">Refining Technologies</div> at line 483
    const ctaDiv = card.querySelector('.cta.btn-track')
      || card.querySelector('.cta')
      || card.querySelector('.content');
    const titleText = ctaDiv ? ctaDiv.textContent.trim() : '';

    // Extract link href
    // VALIDATED: Card itself is an <a> element with href at line 477
    const href = card.href || card.closest('a')?.href || '';

    // Build content cell (column 2): linked title
    const contentCell = [];
    if (href && titleText) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = titleText;
      contentCell.push(link);
    } else if (titleText) {
      const p = document.createElement('p');
      p.textContent = titleText;
      contentCell.push(p);
    }

    // Build row: [image cell, content cell]
    const imageCell = img ? [img] : [];
    cells.push([imageCell, contentCell]);
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Industry', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
