# Modal (form-modal button)

Opens the shared gated-download **form** in a native `<dialog>` when an authored
button is clicked. The form block (`blocks/form/`) is reused as-is — the modal
adds only the dialog shell, open/close/focus behavior, and the submit behavior.

## Authoring convention — the "Download" button

Author a **normal button** (a bold link, so `decorateButtons` styles it as a
button) whose **visible text begins with "Download"** and whose href is the
**download asset** for that page:

```
[**Download DARACLAR® FA 300 silica technical data sheet**](/assets/insights/a-brewers-challenge/daraclar-fa-300-technical-data-sheet.pdf)
```

- Any link whose text **starts with "Download"** (case-insensitive) is a
  "form-modal button" — clicking it opens the shared form in a modal instead of
  navigating. This text rule is robust through Document Authoring, which
  slugifies `#modal`-style hash markers and `.pdf` extensions.
- On a **valid submit**, the modal opens the asset (the link's href) in a new
  tab **and** shows a "Thank you! Enjoy your download." confirmation.
- Change the button text so it no longer starts with "Download" and it reverts
  to a plain link.

> Alternative marker: an href ending in `#modal` (case-insensitive) is also
> honored, for buttons whose label is not "Download …". Prefer the text rule for
> DA-authored pages.

## Authoring the link in Document Authoring

The href must be a **real anchor to a clean URL** (use DA's link tool). A raw
path typed into the doc body gets slugified — `.pdf` becomes `-pdf` and any
hash is dropped — which breaks the download target. Link text still controls
whether the modal opens, but the download only works if the href is intact.

### Which form is shown

The form is the shared definition at **`/forms/download.json`** (authored in
Document Authoring, not code — edit that sheet and republish to change the form
for every page at once). Each page only supplies its own PDF via the button
href, so the same form serves all gated pages.

### Per-page heading (overriding the default)

The form JSON's `heading` ("Before you download **the brochure**, can we get some
information?" — the most common wording site-wide) is the **default** and shows
on every page unless overridden.

To change it for a page, author a **visible paragraph immediately after the
Download button** that starts with "Before you download …", e.g.:

```
[**Download the technical data sheet**](/assets/.../sheet.pdf)

Before you download the technical data sheet, can we get some information?
```

At decoration time the modal code reads that paragraph as the heading and
**hides it from the page** (it only appears inside the modal). Omit it and the
default JSON heading is used. This keeps the override visible and editable in the
DA document — no hidden attributes, no code changes.

### Alternative: link directly to a form JSON

If the href points at a forms JSON ending with `#modal`
(e.g. `/forms/download.json#modal`), that form is shown in the modal with no
gated asset — useful for a plain "open this form in a dialog" case. For extra
copy around the form, author a `/modals/<name>` fragment page containing a Form
block and link to it instead.

## Security

Only same-origin or the project's `*.aem.page` / `*.aem.live` hosts are fetched
or opened; any other target is ignored. DOM is built with
`createElement`/`textContent` — no untrusted `innerHTML`.

## Accessibility

Native `<dialog>.showModal()` provides the focus trap, `Esc` handling, and
`::backdrop`. Focus moves to the first form field on open and returns to the
trigger on close; the close button has a labelled, visible focus ring and a
44×44px target. The page is scroll-locked while open.
