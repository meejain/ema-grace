/*
 * Template: contactus (JS)
 * Runs in the lazy phase for pages with `template` metadata = `contactus` (product/solution detail
 * pages). Groups each run of consecutive `.button-wrapper` paragraphs into a single
 * `<div class="button-group">` so adjacent CTAs (e.g. the two "Download …" buttons) render as ONE
 * centered row instead of stacking. Scoped to this template so other pages are unaffected.
 * @param {Element} main The main element
 */
export default function decorate(main) {
  const wrappers = [...main.querySelectorAll('p.button-wrapper')];
  const seen = new Set();
  wrappers.forEach((first) => {
    if (seen.has(first)) return;
    // collect a run of consecutive button-wrapper siblings
    const run = [first];
    let next = first.nextElementSibling;
    while (next && next.matches('p.button-wrapper')) {
      run.push(next);
      seen.add(next);
      next = next.nextElementSibling;
    }
    if (run.length < 2) return; // leave single buttons alone
    const group = document.createElement('div');
    group.className = 'button-group';
    first.parentNode.insertBefore(group, first);
    run.forEach((w) => group.appendChild(w));
  });
}
