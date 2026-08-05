# Sidebar Layout Template — measured spec

Reproduces the grace.com "left section-nav + main content (+ optional right contact widget)" layout.
Sources measured live: grace.com/compliance/compliance-gdpr-de/ (3-portion, widget present),
grace.com/about-grace/locations/, grace.com/insights/<article>.

## Measured dimensions (live source)

Source = Bootstrap 12-col grid inside a **1280px centered band** (80px side gutters at 1440vw,
30px inter-column gutter). Layout engages at Bootstrap `lg` = **992px**; below that everything
stacks and the left nav collapses to a `<select>` dropdown.

| Region        | Source col   | Width @1440 | % of band | Ratio (of 12) |
|---------------|--------------|-------------|-----------|----------------|
| Left nav      | `col-lg-2`   | 213.33px    | 16.667%   | 2              |
| Main content  | `col-lg-7`   | 746.66px    | 58.333%   | 7              |
| Right widget  | `col-lg-3`   | 320px       | 25.000%   | 3              |

- 2-portion (no widget): nav + main. 3-portion (widget present): nav + main + widget.
- Container band: `max-width: 1280px`, centered; min side gutter 80px (desktop).
- Column gutter: 30px.

## Breakpoint mapping (project rule: 600 / 900 / 1200 min-width only)

Source switches at 992px. Nearest allowed project breakpoint = **900px**.
- `< 900px` (mobile/tablet): single column, everything stacked in DOM order (nav → content → widget).
- `>= 900px`: multi-column grid engages (matches source ratios exactly via fr units).

## DOM contract (what the importer / decoration must produce)

Activation: page metadata `template: sidebar` → `body.sidebar` (via `decorateTemplateAndTheme`,
loads `templates/sidebar/sidebar.css`).

The template lays out the DIRECT section children of `<main>`:
- **Left nav** section is marked with section style `sidebar-nav` → `main > .section.sidebar-nav`.
  Emitted by the importer as a section whose content is the section-nav (list of sibling-page links).
- **Right widget** = the auto-built contact-sticky section. When `contactus: true` is ALSO set,
  `buildContactStickyBlock()` injects `.custom-widget.contact-sticky` (its section wrapper becomes
  `.custom-widget-container`). The template pins it to the right column.
- **Main content** = every other direct section (default flow).

Placement technique (no content wrapper needed): `main` is a CSS grid; the nav pins to column 1 /
row 1 (sticky), the widget to the last column / row 1 (sticky), and all remaining sections take
column 2 so they flow down the middle across multiple rows.

3-portion vs 2-portion is toggled by whether the widget is present:
- `body.sidebar` (nav + main): `grid-template-columns: 2fr 10fr` (16.67% / 83.33%).
- `body.sidebar.contactus` (nav + main + widget): `grid-template-columns: 2fr 7fr 3fr`
  (16.67% / 58.33% / 25%) — exact source ratio.

## Open items
- 2-portion exact main width (nav + main, no widget) not directly measured on source; used
  Bootstrap `col-lg-10` (83.33%) as the complement of the measured `col-lg-2` nav. Verify against
  a real 2-portion page (locations / insights article) during visual QA.
- How the section-nav content is generated (authored vs auto-built from sibling pages) is a
  separate decision from this layout template.
