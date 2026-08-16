import {
  buildBlock, decorateBlock, loadBlock, loadCSS,
} from '../../scripts/aem.js';

// The shared gated-download form definition (content, authored in DA). One form
// serves every gated page; the per-page PDF is carried by the trigger button.
const FORM_DEFINITION_URL = '/forms/download.json';
const CLOSE_LABEL = 'Close';

// Hard-coded (non-authored) UI glyphs. Constant markup, never user input.
const CLOSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const CHECK_ICON = '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="24"/><path d="M14 24l7 7 13-14" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Guard so only one dialog is open at a time.
let currentDialog = null;

/**
 * Only same-origin or the project's AEM preview/live hosts may be fetched or
 * opened — prevents a crafted `#modal` link from pointing the fetch/open at an
 * arbitrary third party. See skills/security.
 * @param {URL} url
 * @returns {boolean}
 */
function isAllowedUrl(url) {
  const host = url.hostname;
  return url.origin === window.location.origin
    || host === 'localhost'
    || /(^|\.)aem\.(page|live)$/i.test(host);
}

/**
 * Opens the gated-download form in a modal dialog, reusing blocks/form as-is.
 * @param {string} triggerHref The trigger link's href (may end with `#modal`).
 *   If it points to a forms JSON, that form is shown on its own; otherwise the
 *   href is treated as the download asset (e.g. a PDF) gated behind the shared
 *   download form and opened in a new tab on successful submit.
 * @param {{ triggerEl?: Element, title?: string }} [options]
 *   title — optional per-page heading that REPLACES the form's default heading
 *   (the form JSON's `heading` field remains the default when no title is given).
 */
export async function openFormModal(triggerHref, { triggerEl, title } = {}) {
  if (currentDialog) return; // never stack two dialogs

  let url;
  try {
    url = new URL(triggerHref, window.location.href);
  } catch {
    return;
  }
  url.hash = '';
  const cleanHref = url.href;

  // Resolve which JSON defines the form and which asset (if any) to download.
  let formUrl;
  let downloadUrl = null;
  if (/\/forms\/[^/]+\.json$/i.test(url.pathname)) {
    formUrl = cleanHref;
  } else {
    formUrl = new URL(FORM_DEFINITION_URL, window.location.href).href;
    downloadUrl = cleanHref;
  }

  if (!isAllowedUrl(new URL(formUrl))
    || (downloadUrl && !isAllowedUrl(new URL(downloadUrl)))) {
    // eslint-disable-next-line no-console
    console.warn('modal: refused to open a disallowed URL', formUrl, downloadUrl);
    return;
  }

  const base = window.hlx?.codeBasePath || '';
  loadCSS(`${base}/blocks/modal/modal.css`);

  // --- Build the dialog shell -------------------------------------------------
  const dialog = document.createElement('dialog');
  dialog.className = 'modal';
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', 'Download form');

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-close';
  closeBtn.setAttribute('aria-label', CLOSE_LABEL);
  closeBtn.innerHTML = CLOSE_ICON;

  // Fixed header (stays put); the form heading is moved here after load so only
  // the fields scroll — mirrors the source lightbox .header + .content split.
  const header = document.createElement('div');
  header.className = 'modal-header';

  const content = document.createElement('div');
  content.className = 'modal-content';

  const loading = document.createElement('p');
  loading.className = 'modal-loading';
  loading.textContent = 'Loading…';
  content.append(loading);

  dialog.append(closeBtn, header, content);
  document.body.append(dialog);
  currentDialog = dialog;
  document.body.classList.add('modal-open');
  dialog.showModal();

  // --- Close / cleanup --------------------------------------------------------
  let closed = false;
  const cleanup = () => {
    if (closed) return;
    closed = true;
    document.body.classList.remove('modal-open');
    if (dialog.open) dialog.close();
    dialog.remove();
    currentDialog = null;
    if (triggerEl) triggerEl.focus();
  };
  closeBtn.addEventListener('click', cleanup);
  dialog.addEventListener('close', cleanup); // native Esc closes the dialog
  dialog.addEventListener('click', (e) => {
    // click outside the dialog card (on the ::backdrop) closes it
    if (e.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    const inside = e.clientX >= rect.left && e.clientX <= rect.right
      && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if (!inside) cleanup();
  });

  // --- Thank-you state --------------------------------------------------------
  const showThankYou = () => {
    content.replaceChildren();
    const panel = document.createElement('div');
    panel.className = 'modal-thankyou';
    const badge = document.createElement('span');
    badge.className = 'modal-thankyou-badge';
    badge.innerHTML = CHECK_ICON;
    const thankYouTitle = document.createElement('h2');
    thankYouTitle.textContent = 'Thank you!';
    const msg = document.createElement('p');
    msg.textContent = 'Enjoy your download.';
    panel.append(badge, thankYouTitle, msg);
    content.append(panel);
    dialog.setAttribute('aria-label', 'Thank you');
    closeBtn.focus();
  };

  // --- Render the shared form block -------------------------------------------
  const link = document.createElement('a');
  link.href = formUrl;
  link.textContent = formUrl;
  const formBlock = buildBlock('form', link);
  // `download-form` is the scoping hook for the dedicated download-form styles
  // (blocks/form/download.css). The form block lives inside dialog.modal, i.e.
  // OUTSIDE <main>, so the main `main .form` rules never reach it.
  formBlock.classList.add('download-form');
  const wrapper = document.createElement('div');
  wrapper.className = 'form-wrapper download-form-wrapper';
  wrapper.append(formBlock);

  // Intercept a VALID submit before the form block's own handler runs (capture
  // phase on the wrapper fires ahead of the block's target-phase listener) so no
  // network POST is attempted. Backend (Pardot) wiring is deferred; for now a
  // valid submit opens the gated asset and shows the thank-you message.
  wrapper.addEventListener('submit', (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.checkValidity()) return; // let the form block surface errors
    e.preventDefault();
    e.stopImmediatePropagation();
    if (downloadUrl) window.open(downloadUrl, '_blank', 'noopener');
    showThankYou();
  }, { capture: true });

  decorateBlock(formBlock);
  try {
    await loadBlock(formBlock);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('modal: failed to load the form', err);
    loading.textContent = 'Sorry, the form could not be loaded. Please try again later.';
    return;
  }

  loading.remove();
  content.append(wrapper);

  // Per-page title override: if the author supplied a title, replace the form's
  // default heading text with it (the form JSON heading is the fallback default).
  if (title) {
    const headingText = wrapper.querySelector('.field-heading p, .field-heading');
    if (headingText) headingText.textContent = title;
  }

  // Move the heading into the fixed header so it stays put while the fields
  // scroll (matches the source: fixed .header, scrollable .content).
  const headingField = wrapper.querySelector('.field-heading');
  if (headingField) header.append(headingField);

  // Show the placeholder ("Please select") as the default on any select whose
  // value didn't match an option (the form leaves the field empty, so a first
  // option with a non-empty value like "Please select" would otherwise render
  // as a blank box — the source shows the placeholder selected).
  wrapper.querySelectorAll('select').forEach((sel) => {
    if (sel.selectedIndex === -1 && sel.options.length) sel.selectedIndex = 0;
  });

  // Restore the commas in the long-form country names. The shared form parser
  // splits the Options column on commas, so the source labels (e.g. "Bolivia,
  // Plurinational State of") are authored comma-free in download.json to survive
  // parsing; we re-insert the commas here for display parity. Scoped to the
  // download form only — does not touch the shared parser or other forms.
  const COUNTRY_COMMA_LABELS = [
    'Bolivia, Plurinational State of',
    'Bonaire, Sint Eustatius and Saba',
    'Congo, the Democratic Republic of the',
    'Iran, Islamic Republic of',
    'Macedonia, the former Yugoslav Republic of',
    'Moldova, Republic of',
    'Palestinian Territory, Occupied',
    'Saint Helena, Ascension and Tristan da Cunha',
    'Samoa,American',
    'Tanzania, United Republic of',
    'Virgin Islands, British',
  ];
  const commaByStripped = new Map(
    COUNTRY_COMMA_LABELS.map((label) => [label.replace(/,\s*/g, ' ').replace(/\s+/g, ' ').trim(), label]),
  );
  wrapper.querySelectorAll('select[name="country"] option').forEach((opt) => {
    const canonical = commaByStripped.get(opt.textContent.trim());
    if (canonical) {
      opt.textContent = canonical;
      opt.value = canonical;
    }
  });

  // Label the dialog from the heading (now in the fixed header) and move focus
  // into the form.
  const heading = header.querySelector('.field-heading p, .field-heading')
    || wrapper.querySelector('h1, h2');
  if (heading) {
    if (!heading.id) heading.id = 'modal-form-heading';
    dialog.setAttribute('aria-labelledby', heading.id);
    dialog.removeAttribute('aria-label');
  }
  const firstField = wrapper.querySelector('input, select, textarea');
  if (firstField) firstField.focus();
}

export default openFormModal;
