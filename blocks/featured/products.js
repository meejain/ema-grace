/**
 * Featured Products block.
 * Each authored row has three cells: product name, description, and a link.
 * The row is transformed into a single anchor "card" that shows the product
 * name over a dark tile and reveals the description plus a chevron CTA on hover,
 * mirroring the source module's behaviour.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const nameCell = cells[0];
    const descCell = cells[1];
    const linkCell = cells[2];

    const sourceLink = linkCell ? linkCell.querySelector('a') : null;
    const href = sourceLink ? sourceLink.getAttribute('href') : '#';
    const ctaText = sourceLink ? sourceLink.textContent.trim() : 'Learn More';

    const li = document.createElement('li');

    const card = document.createElement('a');
    card.className = 'featured-products-card';
    card.href = href;

    const image = document.createElement('div');
    image.className = 'featured-products-image';
    const name = document.createElement('p');
    name.className = 'featured-products-name';
    // unwrap the cell's paragraph so we don't nest <p> inside <p>
    const nameSource = nameCell && nameCell.querySelector('p') ? nameCell.querySelector('p') : nameCell;
    name.innerHTML = nameSource ? nameSource.innerHTML : '';
    image.append(name);

    const copy = document.createElement('div');
    copy.className = 'featured-products-copy';
    copy.innerHTML = descCell ? descCell.innerHTML : '';

    const cta = document.createElement('span');
    cta.className = 'featured-products-cta';
    cta.setAttribute('aria-hidden', 'true');
    cta.textContent = ctaText;

    card.append(image, copy, cta);
    li.append(card);
    ul.append(li);
  });

  block.textContent = '';
  block.append(ul);
}
