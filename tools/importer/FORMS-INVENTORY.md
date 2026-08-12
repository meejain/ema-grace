# WR Grace — Site-wide Forms Inventory

Purpose: catalogue every form on grace.com ahead of the **AEM Adaptive Forms** migration pass
(forms were DEFERRED during the products/insights/newsroom work — see MIGRATION-PLAYBOOK §5). This is
the tracking doc the LLM-ONBOARDING prompt points to.

**Method:** enumerated the full URL universe from `https://grace.com/sitemap.xml` (478 URLs), then
fetched + parsed each `/forms/` page and the modal-form source pages server-side (curl), classifying
by the form component class (`.contact-us-form-cmp`, `.newsletter-signup-form-cmp`,
`.gated-asset-simplified`), visible field counts (input/select/textarea), conditional logic
(`request_type` branch, `form-row hidden`), and multi-step markers. Field labels captured per form.

**Form engine:** these are NOT Marketo/HubSpot embeds. They are **custom AEM components backed by
Pardot** (`pardot_extra_field`, `g-recaptcha-response`, `gdpr_consent` hidden fields), server-rendered
with real `<label>`/`<input>`/`<select>` markup + client-side conditional show/hide + jQuery-chosen
selects + reCAPTCHA. Two exceptions are iframe embeds (see below). For the EDS migration these map to
**Adaptive Form JSON**; the conditional branches (Select Your Request / Role / Industry→Segment
cascades) are the main complexity.

Last updated: 2026-08-12. Status: **INVENTORY (no forms migrated yet — 0/‹count›).**

---

## A. The 5 report variants (block-library reference) → real pages

The reference report (`reference/front-end-report-gracev1.html`) defines 5 Form variants. Mapping to
the live examples given + what each actually is:

| Report variant | Example URL | What it is (measured) |
|---|---|---|
| **Form Contact Simple** (Campaign) | `/campaign/ludox-colloidal-silica-pic/` | Simplified gated lead form embedded inline/modal on a campaign page (`.gated-asset-simplified`, ~name/email/company). |
| **Form Lead Generation** (Contact) | `/forms/contact-us-product-and-services/` | The big conditional product-&-services contact form (19 inputs / 34 selects / 3 textareas, Role→Industry→Segment cascade). |
| **Form Modal Download** (Product Detail) | `/products/syloid-mx-silica-series/` | Download-gated modal on product pages (`.gated-asset-simplified`) — fires from the green "Download …" buttons. |
| **Form Newsletter Signup** | `/forms/coatings-newsletter-sign-up/` | Newsletter registration (`.newsletter-signup-form-cmp`, 12 inputs / 3 selects + topic checkboxes). |
| **Form Multi Step** (Contact) | `/forms/contact-us-corporate/` | Conditional corporate contact form (12 inputs / 3 selects / 3 textareas, "Select Your Request" reveals SDS / description branches). |

> Note: grace.com's forms are conditional-branch, not literal wizard "steps" (only `/forms/sds/` has a
> step marker). "Multi Step" in the report = the request-type conditional reveal.

---

## B. Standalone `/forms/` pages (15 — full list from sitemap)

Grouped by the underlying form component. `TY` = thank-you confirmation page (no form, just a message).

### B1. Contact forms — `.contact-us-form-cmp` (conditional)
| URL | Fields (input/select/textarea) | Conditional | Notes |
|---|---|---|---|
| `/forms/contact-us-product-and-services/` | 19 / 34 / 3 | ✅ Role→Request→Industry→Segment | The master lead-gen form; large select cascade. |
| `/forms/contact-us-product-and-services-single/` | 19 / 34 / 3 | ✅ | Single-column layout variant of the above (`.contact-us-form-single`). |
| `/forms/contact-us-corporate/` | 12 / 3 / 3 | ✅ Select Your Request (+ SDS branch) | Non-product corporate contact (`.contact-us-form-corporate`). |
| `/forms/sds/` | 26 / 35 / 3 | ✅ (+ 1 step marker) | Safety-Data-Sheet request; richest form (SDS product rows). |
| `/forms/contact-us-customer-service/` | **iframe embed** | — | External embedded form (not a native cmp). |

### B2. Newsletter forms — `.newsletter-signup-form-cmp`
All 4 share the SAME structure (12 inputs / 3 selects + topic checkboxes: First/Last, Business Email,
Phone, Job Title, Company, Country + interest checkboxes). They differ only by pre-selected topic/segment.
| URL | Notes |
|---|---|
| `/forms/newsletter-sign-up/` | Generic. |
| `/forms/coatings-newsletter-sign-up/` | Coatings topic. |
| `/forms/pharma-newsletter-sign-up/` | Pharma topic. |
| `/forms/nutra-newsletter-sign-up/` | Nutraceutical topic. |

### B3. Tradeshow
| URL | Fields | Notes |
|---|---|---|
| `/forms/tradeshow-meeting-request/` | 13 / 3 / 1 | Conditional (Select Your Role); meeting-request lead form. |

### B4. Thank-you confirmation pages (NO form — message only)
`/forms/contact-us-thank-you/`, `/forms/download-thank-you/`, `/forms/newsletter-thank-you/`,
`/forms/tradeshow-thank-you/`. (4 pages — migrate as simple content pages, not forms.)

### B5. Index
`/forms/` — the forms landing/index page.

**Standalone `/forms/` tally:** 15 URLs = **9 real forms** (4 contact-cmp + 1 iframe + 4 newsletter +
1 tradeshow — note the 4 newsletters are 1 template ×4) + **4 thank-you** pages + **1 index**.

---

## C. Modal / gated forms embedded ACROSS the site (fire from buttons)

These are NOT separate `/forms/` URLs — they open as a modal/lightbox when a button is clicked, using
`.gated-asset-simplified` / gated-lightbox markup. Sources by page type:

| Where | Trigger | Form | Count of source pages |
|---|---|---|---|
| **Product detail pages** | Green "Download <asset>" buttons | Form Modal Download (gated simplified) | ~35 product-detail pages (each gated download opens it) |
| **Campaign pages** | Inline / "Get the …" CTA | Form Contact Simple (gated simplified lead) | 17 campaign pages (e.g. ludox-colloidal-silica-pic, excipients, chromatography) |
| **Insights (some)** | Gated ebook/whitepaper CTAs | Gated simplified | subset of 165 insights (gated assets only) |

The gated modal is a **single reusable component** (`.gated-asset-simplified`) parameterised per asset —
so it's ~1 form template with many invocation points, not many distinct forms.

---

## D. Distinct form TEMPLATES to build (the real migration work)

Deduping B + C by structure, the site has **~6 distinct form templates**:

1. **Contact – Product & Services** (conditional lead-gen, Role→Industry→Segment cascade) — also its
   single-column variant.
2. **Contact – Corporate** (conditional, request-type reveal).
3. **SDS request** (conditional + product rows; richest).
4. **Newsletter signup** (1 template, 4 topic-preset instances).
5. **Tradeshow meeting request**.
6. **Gated asset / modal download + simple campaign lead** (`.gated-asset-simplified`, reused for
   product downloads, campaign lead capture, gated insights).
Plus **4 thank-you** confirmation content pages (not forms) and **1 iframe embed**
(`contact-us-customer-service`, external — decide keep-iframe vs rebuild).

---

## E. Full URL universe (for reference)

478 URLs in `https://grace.com/sitemap.xml`. By section: insights 165, industries 102, about-grace 39,
products 36, newsroom 29, campaign 17, assets 17, forms 15, vendor-suppliers 12, compliance 11,
people-and-careers 7, resources 5, + ~15 one-offs. Saved to `/tmp/all-urls.txt` during this pass
(regenerate with `curl -s https://grace.com/sitemap.xml | grep -o '<loc>[^<]*</loc>'`).

---

## F. Next steps (Adaptive Forms pass — NOT started)

- Enable the `forms-excat` plugin (AEM Forms migration tools — HTML form → Adaptive Form JSON).
- Build the 6 templates above as Adaptive Forms; wire the conditional branches + reCAPTCHA + GDPR
  consent + Pardot/endpoint mapping (confirm the target submission endpoint with the client).
- Map thank-you pages as redirect targets.
- Decide iframe (`contact-us-customer-service`) strategy.
- Track per-template migration status here as it proceeds.
