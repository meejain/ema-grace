export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector(':scope > picture, :scope > p > picture');
      const hasBadges = col.querySelector('p a picture');

      if (pic && !hasBadges) {
        // Image-only column
        col.classList.add('columns-app-promo-img-col');
      } else {
        // Promo text column (heading, body, links, app-store badges)
        col.classList.add('columns-app-promo-text-col');

        // Tag the app-store badge paragraph (a > picture) for badge styling
        col.querySelectorAll('p').forEach((p) => {
          if (p.querySelector('a picture')) {
            p.classList.add('columns-app-promo-badges');
          }
        });
      }
    });
  });
}
