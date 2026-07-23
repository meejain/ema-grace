/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-insight block
 *
 * Source: https://grace.com/
 * Base Block: cards
 *
 * Block Structure (from markdown example):
 * - Row per card: Image cell | Category + Title + Read-more link cell
 *
 * Source HTML Pattern (from captured DOM):
 * <div class="cmp-media-callout none-bkgd">
 *   <div class="single-media image row"> or <div class="right-media image row">
 *     <div class="media-caption col-xs-12">
 *       <div class="media">
 *         <div class="media-image">
 *           <div class="img"><img src="..." alt="..."></div>
 *         </div>
 *       </div>
 *     </div>
 *     <div class="subhead-small col-xs-12">
 *       <h5>FOOD & BEVERAGE</h5>
 *       <p><a href="...">Article title</a></p>
 *       <p><a href="..."><strong>Read more ></strong></a></p>
 *     </div>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-26
 */
export default function parse(element, { document }) {
  // Find all insight/blog card elements
  // VALIDATED: Found .cmp-media-callout within section#blogs at lines 679, 733, 789, 846
  let mediaCallouts = Array.from(element.querySelectorAll('.cmp-media-callout'));

  if (!mediaCallouts.length) {
    // If element itself is a media-callout
    if (element.classList.contains('cmp-media-callout') || element.classList.contains('media-callout')) {
      mediaCallouts = [element];
    }
  }

  // Build cells array - one row per card with 2 columns (image | content)
  const cells = [];

  mediaCallouts.forEach((callout) => {
    // Extract image
    // VALIDATED: Found <div class="img"><img src="..." alt="..."> at lines 684, 738, 794, 851
    const img = callout.querySelector('.media-image .img img')
      || callout.querySelector('.media-image img')
      || callout.querySelector('.img img')
      || callout.querySelector('img');

    // Extract category
    // VALIDATED: Found <h5>FOOD & BEVERAGE</h5> within .subhead-small at line 691
    const categoryEl = callout.querySelector('.subhead-small h5')
      || callout.querySelector('h5');
    const category = categoryEl ? categoryEl.textContent.trim() : '';

    // Extract article title and link
    // VALIDATED: Found <p><a href="...">Article title</a></p> within .subhead-small at line 692-694
    const titleLink = callout.querySelector('.subhead-small p a')
      || callout.querySelector('.subhead-small a');
    const titleText = titleLink ? titleLink.textContent.trim() : '';
    const titleHref = titleLink ? titleLink.href : '';

    // Extract read-more link
    // VALIDATED: Found <a href="..."><strong>Read more ></strong></a> at lines 696-698
    const readMoreLinks = Array.from(callout.querySelectorAll('.subhead-small p a'));
    const readMoreLink = readMoreLinks.length > 1 ? readMoreLinks[readMoreLinks.length - 1] : null;
    const readMoreHref = readMoreLink ? readMoreLink.href : titleHref;

    // Build content cell (column 2): category + title + read-more link
    const contentCell = [];

    if (category) {
      const catP = document.createElement('p');
      catP.textContent = category;
      contentCell.push(catP);
    }

    if (titleText) {
      const titleP = document.createElement('p');
      const titleA = document.createElement('a');
      titleA.href = titleHref || readMoreHref;
      titleA.textContent = titleText;
      titleP.appendChild(titleA);
      contentCell.push(titleP);
    }

    if (readMoreHref) {
      const rmP = document.createElement('p');
      const rmA = document.createElement('a');
      rmA.href = readMoreHref;
      rmA.textContent = 'Read more >';
      rmP.appendChild(rmA);
      contentCell.push(rmP);
    }

    // Build row: [image cell, content cell]
    const imageCell = img ? [img] : [];
    cells.push([imageCell, contentCell]);
  });

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Cards-Insight', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
