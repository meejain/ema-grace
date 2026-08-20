/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-location-grid  ->  EDS `Cards (location-grid)`
 * Source: https://grace.com/about-grace/locations/
 *
 * EDS convention (Cards): a 2-column table — first row = block name; each subsequent row = ONE card
 * as `image | content`, where content may hold a heading, description, and a CTA link.
 *
 * The source content column interleaves THREE kinds of block among sibling `<article>`s:
 *   • location CARDS — a `.col-lg-4` (or single wide `.col-lg-12`) with an optional photo, a
 *     `<strong>` city-name heading (a link to the detail page for plant sites, plain text for sales
 *     offices), and address/phone paragraphs;
 *   • region SECTION HEADERS — a bare `<h2>` ("Americas", "Asia", "Europe and Middle East",
 *     "Locations Worldwide");
 *   • the LEGEND — an `.embed` with an `<h4>Legend</h4>` + icon rows.
 *
 * The matcher hands us the LCA container spanning ALL of these. We must NOT blow the whole column
 * away (that dropped the h2 headers + Legend). Instead we walk the container in document order,
 * COALESCE consecutive card runs into one `Cards (location-grid)` block each, and leave the h2
 * headers + Legend embed in place as default content — preserving the source's ordered layout.
 *
 * NOTE: earlier versions required a "Tel:" phone line and used the generic `_cards-utils`
 * `contentFrom`, which (a) dropped the ~9 phone-less sales-office tiles and (b) discarded the
 * `<strong>` title link (it lives OUTSIDE the address `.text` box). This parser handles every card
 * regardless of phone/image/link so no tile is lost and every title links correctly.
 */

const imageOf = (item) => item.querySelector('.image picture, .cmp-image picture, picture')
  || item.querySelector('.image img, .cmp-image img, img')
  || null;

/** The city-name heading: the first `<strong>` carrying text (usually wrapping an <a>). */
function titleOf(item) {
  return Array.from(item.querySelectorAll('strong')).find((s) => (s.textContent || '').trim()) || null;
}

/** Address/phone paragraphs — the `<p>`s that are NOT the title strong. */
function addressParas(item, titleStrong) {
  const scope = item.querySelector('.text, .rich-text') || item;
  return Array.from(scope.querySelectorAll('p')).filter((p) => {
    if (!(p.textContent || '').trim()) return false;
    if (titleStrong && (titleStrong.contains(p) || p.contains(titleStrong))) return false;
    return true;
  });
}

/** True when this element is a location card (title strong + ≥1 address paragraph, no h2/h4). */
function isCard(el) {
  if (el.querySelector('h2, h4')) return false;
  const t = titleOf(el);
  if (!t) return false;
  return addressParas(el, t).length > 0;
}

/** Build one `image | content` cell pair for a card. */
function cardCells(item, document) {
  const img = imageOf(item);
  const imageCell = img ? [img.cloneNode(true)] : [];
  const title = titleOf(item);
  const content = [];
  if (title) {
    const p = document.createElement('p');
    p.appendChild(title.cloneNode(true));
    content.push(p);
  }
  addressParas(item, title).forEach((p) => content.push(p.cloneNode(true)));
  return [imageCell, content];
}

export default function parse(element, { document }) {
  // Collect, in document order, the leaf cards AND the interleaved non-card content (region h2
  // headers, the Legend embed) so we can rebuild the column preserving order.
  const cardSel = '.col-lg-4, .col-lg-12';
  const cards = Array.from(element.querySelectorAll(cardSel))
    .filter(isCard)
    .filter((c, _i, arr) => !arr.some((o) => o !== c && c.contains(o)));
  if (!cards.length) return;
  const cardSet = new Set(cards);

  // The card "rows" are sibling article/column wrappers. Walk the container's flow in document order,
  // classifying each top-level chunk as either a card (→ accumulate into the current grid block) or
  // non-card content (region header h2 / Legend embed → flush the grid, then keep the node inline).
  // We iterate the ordered union of cards + heading/legend nodes and group runs.
  const headings = Array.from(element.querySelectorAll('h2, h4'))
    .filter((h) => (h.textContent || '').trim());
  const ordered = [];
  const pushIf = (node, type) => { if (node) ordered.push({ node, type }); };
  cards.forEach((c) => pushIf(c, 'card'));
  headings.forEach((h) => {
    // keep only the region headers / Legend that live in THIS container and aren't inside a card
    if (![...cardSet].some((c) => c.contains(h))) pushIf(h, 'other');
  });
  // sort by document order (DOCUMENT_POSITION_FOLLOWING === 4; avoid depending on the Node global).
  ordered.sort((a, b) => {
    if (a.node === b.node) return 0;
    // eslint-disable-next-line no-bitwise
    return (a.node.compareDocumentPosition(b.node) & 4) ? -1 : 1;
  });

  // Build the replacement fragment: coalesced card blocks + preserved header/legend nodes.
  const frag = document.createDocumentFragment();
  let run = [];
  const flush = () => {
    if (!run.length) return;
    const cells = run.map((c) => cardCells(c, document));
    frag.appendChild(WebImporter.Blocks.createBlock(document, { name: 'Cards (location-grid)', cells }));
    run = [];
  };
  ordered.forEach(({ node, type }) => {
    if (type === 'card') { run.push(node); return; }
    flush();
    // Preserve the header / Legend as default content. For the Legend embed, emit the <h4> then one
    // clean text `<p>` per legend `<strong>` row. The rows carry a FontAwesome `<i>` glyph that won't
    // render in EDS (no icon font) and bare inline `<strong>`s get dropped by the markdown round-trip,
    // so rebuild each as a plain-text `<p>` (icon stripped) that survives as body content — preserving
    // the legend LABELS ("= Headquarters", "= Manufacturing", …) for content parity.
    if (/^H4$/.test(node.tagName) && /legend/i.test(node.textContent || '')) {
      const embed = node.closest('.embed, .cmp-embed') || node.parentElement;
      const h4 = document.createElement('h4');
      h4.textContent = (node.textContent || '').trim();
      frag.appendChild(h4);
      Array.from(embed.querySelectorAll('strong')).forEach((s) => {
        const label = (s.textContent || '').replace(/\s+/g, ' ').trim();
        if (!label) return;
        const p = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = label;
        p.appendChild(strong);
        frag.appendChild(p);
      });
    } else {
      frag.appendChild(node.cloneNode(true));
    }
  });
  flush();

  element.replaceWith(frag);
}
