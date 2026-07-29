/**
 * Banner Resource Download
 * Image-left / content-right promo for downloading a resource (e.g. a magazine
 * or PDF). Row 1 = the resource image. Row 2 = the content: an eyebrow line
 * (plain paragraph before the heading), a heading, a subheading paragraph, and
 * a call-to-action link.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const imageCell = rows[0]?.querySelector(':scope > div') || rows[0];
  const contentCell = rows[1]?.querySelector(':scope > div') || rows[1];

  const media = document.createElement('div');
  media.className = 'banner-resource-download-media';
  if (imageCell) media.append(...imageCell.childNodes);

  const content = document.createElement('div');
  content.className = 'banner-resource-download-content';

  const heading = contentCell?.querySelector('h1, h2, h3, h4, h5, h6');
  const nodes = contentCell ? [...contentCell.children] : [];
  let seenHeading = false;

  nodes.forEach((el) => {
    const link = el.tagName === 'A' ? el : el.querySelector(':scope > a');
    if (link && el.textContent.trim() === link.textContent.trim()) {
      // Standalone link -> CTA button.
      link.classList.add('button', 'secondary');
      content.append(link);
    } else if (/^H[1-6]$/.test(el.tagName)) {
      el.classList.add('banner-resource-download-title');
      content.append(el);
      seenHeading = true;
    } else if (!seenHeading && heading) {
      // Plain paragraph before the heading acts as the eyebrow.
      el.classList.add('banner-resource-download-eyebrow');
      content.append(el);
    } else {
      el.classList.add('banner-resource-download-text');
      content.append(el);
    }
  });

  block.textContent = '';
  block.append(media, content);
}
