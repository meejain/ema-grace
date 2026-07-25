import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector('img'))) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  /* Some variants (e.g. category-grid) present links as plain text CTAs rather
     than EDS buttons; undo the auto button decoration so CSS can style them. */
  ul.querySelectorAll('.cards-card-body a.button').forEach((a) => {
    a.classList.remove('button', 'primary', 'secondary', 'accent');
    const wrapper = a.closest('.button-container');
    if (wrapper) wrapper.replaceWith(a);
  });
  block.replaceChildren(ul);
}
