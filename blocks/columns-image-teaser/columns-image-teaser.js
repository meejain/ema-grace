export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-image-teaser-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // The picture is the teaser image; the first heading is the overlaid title.
      const pic = col.querySelector('picture');
      if (!pic) return;

      const link = col.querySelector('a[href]');
      const href = link ? link.getAttribute('href') : null;

      // Build image wrapper with overlaid title.
      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('columns-image-teaser-img');

      const picClone = pic.cloneNode(true);
      imgWrapper.append(picClone);

      // Title: first heading (h2-h6) becomes the overlaid title.
      const heading = col.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        const title = document.createElement('p');
        title.classList.add('columns-image-teaser-title');
        title.textContent = heading.textContent;
        imgWrapper.append(title);
      }
      const overlay = document.createElement('div');
      overlay.classList.add('columns-image-teaser-overlay');
      imgWrapper.append(overlay);

      // Body: remaining paragraphs (caption) go into a copy wrapper.
      const body = document.createElement('div');
      body.classList.add('columns-image-teaser-body');
      [...col.querySelectorAll('p')].forEach((p) => {
        // Skip the paragraph that only wraps the picture.
        if (p.querySelector('picture')) return;
        // Skip a paragraph that is only a link (the "Learn More" CTA).
        if (p.querySelector('a') && !p.textContent.replace(p.querySelector('a').textContent, '').trim()) return;
        if (!p.textContent.trim()) return;
        const caption = document.createElement('p');
        caption.classList.add('columns-image-teaser-caption');
        caption.innerHTML = p.innerHTML;
        body.append(caption);
      });

      // CTA "Learn More" chevron link.
      const cta = document.createElement('span');
      cta.classList.add('columns-image-teaser-cta');
      cta.textContent = 'Learn More';
      body.append(cta);

      // Rebuild the column.
      col.textContent = '';
      col.classList.add('columns-image-teaser-card');
      if (href) {
        const wrap = document.createElement('a');
        wrap.href = href;
        wrap.setAttribute('aria-label', heading ? heading.textContent : 'Read more');
        wrap.append(imgWrapper, body);
        col.append(wrap);
      } else {
        col.append(imgWrapper, body);
      }
    });
  });
}
