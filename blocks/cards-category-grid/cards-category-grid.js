import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector('img'))) {
        div.className = 'cards-category-grid-card-image';
      } else div.className = 'cards-category-grid-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  /* keep the "Learn more" link as a plain text CTA (undo EDS button decoration) */
  ul.querySelectorAll('.cards-category-grid-card-body a').forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    const wrapper = a.closest('.button-container');
    if (wrapper) wrapper.replaceWith(a);
  });
  block.textContent = '';
  block.append(ul);
}
