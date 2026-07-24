const ICON_SVG = `<svg class="custom-widget-contact-panel-icon" viewBox="0 0 340 150" role="img" aria-label="tablet icon" xmlns="http://www.w3.org/2000/svg">
  <g fill="#363f40">
    <rect x="118.4" y="18.2" width="103.1" height="4.7"/>
    <rect x="118.4" y="126.1" width="103.1" height="4.7"/>
    <path d="M209.8,149.5h-79.7c-7.8,0-14.1-6.3-14.1-14.1V13.6c0-7.8,6.3-14.1,14.1-14.1h79.7c7.8,0,14.1,6.3,14.1,14.1v121.9C223.9,143.2,217.6,149.5,209.8,149.5L209.8,149.5z M130.2,4.2c-5.2,0-9.4,4.2-9.4,9.4v121.9c0,5.2,4.2,9.4,9.4,9.4h79.7c5.2,0,9.4-4.2,9.4-9.4V13.6c0-5.2-4.2-9.4-9.4-9.4L130.2,4.2L130.2,4.2z"/>
    <rect x="155.9" y="8.9" width="28.1" height="4.7"/>
    <rect x="165.3" y="135.4" width="9.4" height="4.7"/>
    <path d="M214.5,121.4h-89.1V27.6h89.1V121.4L214.5,121.4z M130.1,116.7h79.7V32.3h-79.7L130.1,116.7L130.1,116.7z"/>
  </g>
  <g fill="#7ac143">
    <path d="M170,86.2c-6.5,0-11.7-5.3-11.7-11.7s5.3-11.7,11.7-11.7s11.7,5.3,11.7,11.7S176.5,86.2,170,86.2z M170,67.5c-3.9,0-7,3.2-7,7s3.1,7,7,7s7-3.2,7-7S173.9,67.5,170,67.5z"/>
    <path d="M170,100.3c-14.2,0-25.8-11.6-25.8-25.8s11.6-25.8,25.8-25.8s25.8,11.6,25.8,25.8v2.3c0,5.2-4.2,9.4-9.4,9.4c-5.2,0-9.4-4.2-9.4-9.4V62.8h4.7v14.1c0,2.6,2.1,4.7,4.7,4.7s4.7-2.1,4.7-4.7v-2.3c0-11.6-9.5-21.1-21.1-21.1s-21.1,9.5-21.1,21.1s9.5,21.1,21.1,21.1c4.6,0,9-1.5,12.7-4.2l2.8,3.8C181,98.5,175.6,100.3,170,100.3L170,100.3z"/>
  </g>
</svg>`;

/**
 * Convert bare phone / email text nodes inside a list item into tel:/mailto: links.
 * @param {HTMLLIElement} li list item to process
 */
function linkifyContact(li) {
  if (li.querySelector('a')) return;
  const text = li.textContent.trim();
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const phoneMatch = text.match(/(\+?[\d][\d\s().-]{6,}\d)/);
  if (emailMatch) {
    const a = document.createElement('a');
    a.href = `mailto:${emailMatch[0]}`;
    a.textContent = text;
    li.replaceChildren(a);
  } else if (phoneMatch) {
    const tel = phoneMatch[0].replace(/[^\d+]/g, '');
    const a = document.createElement('a');
    a.href = `tel:${tel}`;
    a.textContent = text;
    li.replaceChildren(a);
  }
}

/**
 * loads and decorates the contact panel
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Row 1: heading text
  const headingRow = rows[0];
  const headingText = headingRow ? headingRow.textContent.trim() : '';
  const heading = document.createElement('h4');
  heading.className = 'custom-widget-contact-panel-heading';
  heading.textContent = headingText;

  // Row 2: list of contact links
  const listRow = rows[1];
  const list = listRow ? listRow.querySelector('ul, ol') : null;
  if (list) {
    list.classList.add('custom-widget-contact-panel-list');
    list.querySelectorAll('li').forEach(linkifyContact);
  }

  // Rebuild the panel: icon, heading, list
  const iconWrap = document.createElement('div');
  iconWrap.className = 'custom-widget-contact-panel-icon-wrap';
  iconWrap.innerHTML = ICON_SVG;

  block.replaceChildren(iconWrap, heading);
  if (list) block.append(list);
}
