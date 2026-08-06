/**
 * Post Meta block.
 * Authored as one row per label/value pair (two cells: label, value). Decorates
 * into a semantic definition list <dl><dt>LABEL</dt><dd>VALUE</dd>…</dl> matching
 * the source's POSTED / INDUSTRY article metadata.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const dl = document.createElement('dl');

  rows.forEach((row) => {
    const cells = [...row.children];
    const label = (cells[0]?.textContent || '').replace(/\s+/g, ' ').trim();
    const value = (cells[1]?.textContent || '').replace(/\s+/g, ' ').trim();
    if (!label) return;
    const dt = document.createElement('dt');
    dt.textContent = label;
    dl.append(dt);
    if (value) {
      const dd = document.createElement('dd');
      dd.textContent = value;
      dl.append(dd);
    }
  });

  block.replaceChildren(dl);
}
