---
name: forms-enablement
description: How to enable Adobe EDS Forms in a customer repo (DA doc-based and/or Universal Editor), author a form as a DA/Excel spreadsheet, turn a form screenshot into a copy-paste DA sheet, and style per-form CSS. Use when standing up forms on a new customer site, authoring a form spreadsheet, converting a form design/screenshot to a sheet, or adding a new form's styles.
---

Adobe EDS Forms ships as ONE block (`blocks/form/`, from [aem-boilerplate-forms](https://github.com/adobe-rnd/aem-boilerplate-forms)) that renders TWO ways: from a **DA/Excel spreadsheet** (`:type: sheet` — no code deploy to change fields) or from **Adaptive Form JSON** authored in **Universal Editor** (needs xwalk component wiring). Copying the block is step 1 of several; DA works out of the box, UE needs extra config.

## Part A — Enable the block

1. **Copy the block** — `blocks/form/` (+ `blocks/modal/` if you want modal/gated forms) from aem-boilerplate-forms. Keep the whole tree: `components/`, `models/`, `rules/`, `rules-doc/`, `transform.js`, `form.js`.
2. **`.hlxignore` → add `_*`** — stops the `_*.json` model/definition files from being served. This is what keeps UE modelling OFF while DA still works. Leave it in for a DA-only site.
3. **`.eslintignore`** — exclude the vendored rule engine: `blocks/form/rules/formula/*`, `blocks/form/rules/model/*`, `blocks/form/rules/functions.js`.
4. **DA doc-based path is now READY.** Author a sheet + reference it (Part B). Nothing else required.

### Turning ON Universal Editor (xwalk) modelling — extra wiring
Only if authors need to build forms in UE (drag-drop field components). DA and UE can coexist.
- **Remove `_*` from `.hlxignore`** (or narrow it) so the `_*.json` definitions/models/filters serve.
- **Aggregate the models** into repo-root `component-models.json`, `component-definition.json`, `component-filters.json` — each block's `_*.json` (e.g. `blocks/form/_form.json`, `models/form-components/_*.json`) merges into these. Add a `build:json` script (the boilerplate's merge tool) and run it on change.
- **Register the form** in the root filters/definitions so it appears in the UE component rail (`_form.json` already declares `resourceType: fd/franklin/components/form/v1/form`).
- **fstab/UE mountpoint** must point at an AEM authoring instance. Confirm the project is a crosswalk (xwalk) project, not doc-only.
- **Verify:** open UE, confirm the Form + field components show in the rail. If the rail is empty, the root `component-*.json` didn't get the merge.

## Part B — Author a form as a DA sheet (the doc-based path)

**Each row = one field. Column headers = field properties.** Save as a DA sheet at `/forms/<name>.json` (`:type: sheet`), then in the page add a `form` block whose single cell is a **real anchor** to that URL. **Starter sheet:** [`assets/form-template.csv`](assets/form-template.csv) — a ready-to-edit form covering every field type + the complex patterns in Part E.

### Columns this repo supports (authoritative — from `blocks/form/transform.js` `fieldPropertyMapping`)
| Column header | Meaning |
|---|---|
| `Name` (or `Field`) | field id/name — camelCase, no spaces |
| `Type` | field type — see table below |
| `Label` | visible label (for `plain-text`, the heading/paragraph text) |
| `Mandatory` | required — `true` or `x` = required; blank = optional |
| `Options` | `select`/`radio-group`/`checkbox-group` choices, **comma-separated** |
| `OptionNames` | display names for `Options` (comma-separated, parallel list) |
| `Value` | default value; for `submit`: a `https…` URL → redirect, else → thank-you message |
| `Placeholder` | input placeholder |
| `Default` | default value (alias) |
| `Description` | help text under the field |
| `Mandatory`/`Required Error Message` | error shown when a required field is empty |
| `Pattern` + `Pattern Error Message` | regex validation + its error |
| `Min` / `Max` | text: min/maxLength · number/date/range: min/max value · fieldset: min/maxOccur |
| `ReadOnly`, `Visible`, `Repeatable` | booleans (`true`/`x`) |
| `Fieldset` | group this row under the panel row whose `Name` matches this value |
| `Style` | CSS class(es) applied to the field (`appliedCssClassNames`) |
| `Value Expression` / `Visible Expression` | spreadsheet-style formula (starts `=`) for dynamic value / conditional show-hide |
| `Custom Type` | override internal `:type` |

### `Type` column values
Aliases resolved by `transform.js` (use these spellings): `text`, `number`, `datetime-local`, `file`, `select`, `radio-group`, `checkbox-group`, `checkbox`, `plain-text` (heading/paragraph), `textarea` (or `text-area`), `fieldset` (panel/group), `button`, `rating`. Native input types render directly too: `email`, `tel`, `date`, `url`, `password`, `range`. Buttons: `submit`, `reset`.

### Conventions & gotchas
- **Booleans are `true` or `x`** (not `yes`/`1`). Mandatory uses either.
- **`plain-text`** renders a heading/paragraph (no input) — use for form titles, privacy text.
- **`submit` Value**: a URL redirects on success; any other text becomes the inline thank-you message.
- **Commas inside an option** (e.g. long country names) break `Options` parsing — author comma-free and re-insert at runtime (grace does this in `modal.js` `COUNTRY_COMMA_LABELS`).
- **DA slugifies raw text URLs** (`.json` → `-json`) → the block renders the raw URL, not the form. The form-JSON link and any asset link MUST be a real DA anchor. See `tools/importer/FORMS-INVENTORY.md` §G.
- **Sheet name**: only `helix-default` / `shared-aem` are valid internal sheet names (Adobe constraint).

## Part C — Screenshot → copy-paste DA sheet

When given a form screenshot/design, produce a table the user can paste straight into a DA sheet. Method:

1. **Enumerate every visible field top-to-bottom** — one row each. Include the title (as `plain-text`), each input, consent checkboxes, fine-print (`plain-text`), and the button (`submit`).
2. **Pick `Type`** per the table above (email field → `email`, dropdown → `select`, "I agree" box → `checkbox`, phone → `tel`, message box → `textarea`).
3. **`Name`** = camelCase from the label (`Business Email` → `businessEmail`).
4. **`Mandatory`** = `true` for anything marked required (`*`) or clearly needed.
5. **`Options`** for selects/radios = read the choices from the screenshot, comma-separated (prepend a "Please select" placeholder for selects).
6. **`Value`** on the submit row = the success/thank-you text or redirect URL.
7. **Output as a markdown table with these exact headers** so it maps 1:1 to sheet columns: `Name | Type | Label | Mandatory | Options | Value | Required Error Message` (add columns only if the design needs them).

**Worked example** (a "Before you download" gated form → see `drafts/download.json`):

| Name | Type | Label | Mandatory | Options | Value | Required Error Message |
|---|---|---|---|---|---|---|
| heading | plain-text | Before you download, can we get some information? |  |  |  |  |
| businessEmail | email | Business Email | true |  |  | Please enter your business email |
| company | text | Company | true |  |  | This field is required |
| country | select | Country | true | Please select,United States,Canada,India | | Please select a country |
| consent | checkbox | I acknowledge W. R. Grace may contact me. | true |  |  | You must acknowledge to continue |
| privacy | plain-text | Our privacy policy can be found here. |  |  |  |  |
| btn_submit | submit | Download | | | Thank you! Your download will begin shortly. | |

## Part E — Complex forms (conditional logic, groups, panels, multi-step, validation)

### Conditional show/hide + dynamic values — `Visible Expression` / `Value Expression`
These columns hold **Excel-style formulas** (start with `=`) that reference OTHER fields **by their spreadsheet cell** (column letter + row number). Row 1 is the header, so the **first data field is row 2**. The rule engine (`blocks/form/rules-doc/`) recompiles cell refs to field ids and re-evaluates on every change.
- **Show a field only when another equals a value:** on the target row set `Visible Expression` = `=$C$3="SDS Request"` (show this row when the field in cell C3 equals "SDS Request"). Use the `Type` column's letter — whichever column holds the controlling field's value/selection.
- **Derived value:** `Value Expression` = `=getFullName($B$2,$B$3)` fills this field from two others.
- **Available functions:** json-formula built-ins (lowercase — `if`, `and`, `or`, `contains`, `length`, …) plus this repo's custom functions in `blocks/form/functions.js`: `getFullName(first,last)`, `days(endDate,startDate)`. Add more there (kebab/camel, referenced lowercase).
- Boolean cells coerce: `"true"`/`"false"` become real booleans; a checkbox contributes its `Value` only when checked.
- **Gotcha:** if you insert/delete/reorder rows, every cell reference shifts — re-check formulas. An `Unknown column used in excel formula` console log means a ref points at a non-field cell.

> grace.com's "multi-step" forms are actually **conditional reveals** (Select Your Request → SDS/description branch), not true wizard steps — build them with `Visible Expression`, not a wizard. See `tools/importer/FORMS-INVENTORY.md` §A.

### Grouping fields — panels / fieldsets (`Type: fieldset` + `Fieldset` column)
1. Add a row `Type: fieldset`, `Name: shippingGroup`, `Label: Shipping address`.
2. On each child field, set the **`Fieldset` column = `shippingGroup`** (the panel row's `Name`). Those rows render inside that `<fieldset>`.
- `Min`/`Max` on a fieldset row = `minOccur`/`maxOccur` (occurrence count), NOT length.

### Repeatable sections (add/remove instances)
On the `fieldset` row set `Repeatable: true` and `Min`/`Max` for the allowed instance count. The `repeat` component renders add/remove controls; radio/checkbox names are auto-suffixed per instance so groups stay isolated.

### Choice groups — `radio-group` / `checkbox-group`
- `Type: radio-group` (single) or `checkbox-group` (multiple).
- `Options` = stored values, comma-separated. `OptionNames` = parallel display labels (comma-separated, same count). Omit `OptionNames` to show the values themselves.
- A single `checkbox` (not `-group`) is a lone boolean (consent box); its `Value` is the checked value (defaults to `on`), `Checked: true` pre-selects it.

### Multi-step wizard / accordion (UE-authored, xwalk only)
`fieldset` panels with `fd:viewType: wizard` (or `accordion`) are Universal-Editor constructs (`blocks/form/components/wizard`, `.../accordion`). They require the **UE wiring in Part A** — a DA sheet cannot set `fd:viewType`. For DA-only sites, use conditional reveals or plain panels.

### Validation columns
| Column | Effect |
|---|---|
| `Mandatory` (`true`/`x`) + `Required Error Message` | required + its message |
| `Pattern` (regex) + `Pattern Error Message` | format validation + its message |
| `Min` / `Max` | text → min/maxLength · number/date/range → min/max value (+ `Min Error Message`/`Max Error Message`) |
| `Type: email` / `tel` / `url` / `number` / `date` | native browser + component validation |

### CAPTCHA / reCAPTCHA
Add a row `Type: captcha` — rendered by `blocks/form/integrations/recaptcha.js` (needs the site's reCAPTCHA key configured). DOM validation runs client-side for doc-based forms; real spam protection + submission is server-side (see Pitfalls / FORMS-INVENTORY §D2).

### File upload
`Type: file`, `Accept` = comma-separated types (`.pdf,.docx`), `Max` for size where supported. Rendered by `blocks/form/components/file/`.

## Part D — Per-form CSS pattern (this repo's convention)

The shared block CSS is `blocks/form/form.css`. **Each distinct form gets its OWN scoped CSS file, `@import`ed at the top of `form.css`.** Do not pile form-specific rules into `form.css`.

- `blocks/form/form.css` → `@import url('./download.css'); @import url('./contact-us.css');`
- `blocks/form/download.css` → scoped to `.download-form` (form rendered inside `dialog.modal`, i.e. OUTSIDE `<main>`, so `main .form` rules never reach it — hence its own scope class + import).
- `blocks/form/contact-us.css` → scoped to `body.contactus` (inline form; neutralizes the shared card and matches source width).

**To style a NEW form type:** create `blocks/form/<formname>.css`, scope every selector to that form (a `body.<template>` class for inline forms, or a `.<name>-form` scope class for modal forms), add one `@import url('./<formname>.css');` line to `form.css`. Keep media queries mobile-first `min-width` 600/900/1200 (`responsive-breakpoints`).

## Pitfalls
- Copying the block but leaving `_*` OUT of `.hlxignore` on a DA-only site → `_*.json` serve needlessly (and imply UE support that isn't wired). Add `_*`.
- Expecting the form on `*.aem.page`/`.aem.live` before pushing → block JS/CSS come from git; the sheet comes from DA. Push code AND preview/publish the sheet.
- `_form.json` / `models/_form.json` 404 at runtime is BY DESIGN (`.hlxignore` blocks `_*`) — doc-based forms don't need them.
- Submission: the boilerplate submits to a spreadsheet by default. Real CRM/Pardot/Marketo submit is a separate decision (endpoint + reCAPTCHA) — see `tools/importer/FORMS-INVENTORY.md` §D2.

See also: `tools/importer/FORMS-INVENTORY.md` (customer-specific grace forms + history), `security` (sanitize/validate any injected form HTML), `responsive-breakpoints` (form CSS media queries), `accessibility` (real `<label>`, focus, alt).
