export default function decorate(block) {
  if (!block.querySelector(':scope > div:first-child picture') && !block.querySelector(':scope > div:first-child img')) {
    block.classList.add('no-image');
  }

  // The heading and CTA are separate elements in the original design. When the
  // authored content nests the CTA link inside the heading, lift it out so it
  // renders as a distinct button below the heading.
  const heading = block.querySelector('h1, h2, h3');
  const nestedLink = heading?.querySelector('a');
  if (nestedLink) {
    nestedLink.remove();
    heading.after(nestedLink);
  }
}
