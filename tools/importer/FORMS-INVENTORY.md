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

## C. Modal / gated "Before you download" forms — SITE-WIDE DEEP DIVE (crawled 2026-08-12)

These are NOT separate `/forms/` URLs — a `.gated-asset-simplified` lightbox ("Before you download can
we get some information?") opens when a "Download <asset>" button is clicked. It is server-rendered
INLINE in each page (not JS-injected), so it's reliably detectable by crawling. Fields: First Name,
Last Name, Business Email, Company, Job Title, Country (select) + acknowledgement consent checkbox +
reCAPTCHA — ONE reusable component parameterised per asset (same field set everywhere; verified on
a-matte-that-lasts, syloid-mx, ludox-campaign).

**Actual counts — crawled all 453 live pages (sitemap minus /assets/ + 8 malformed sitemap entries):**

| Section | Pages WITH gated download modal |
|---|---|
| **insights** | **96** (of 165) |
| **industries** | **71** (of 102) |
| **products** | **18** |
| resources | 2 |
| campaign | 2 |
| forms | 1 |
| ironsolution | 1 |
| **TOTAL** | **191 pages (≈42% of the site)** |

Full page list saved during the crawl to `/tmp/gated-pages.txt` (regenerate: crawl each URL, grep
`gated-asset-simplified` / "Before you download"). This **corrects the earlier inventory**, which called
insights gated forms "a subset" without a count — it is 96 insights + 71 industries, the dominant form
footprint on the site. Still ONE template (many invocation points), but the migration must wire the
gated modal into ~191 pages' Download buttons, not just products/campaign.

**Also found inline (not the modal): 4 INSIGHTS pages embed a full `contact-us-form-cmp`** (the big
conditional contact form, in the article body — NOT the standalone /forms/ set):
`/insights/syloid-cat-11-silica-a-matting-additive-with-superior-efficiency/`,
`/insights/colloidal-silica-as-a-foundation-for-3-d-printed-replacement-tissues/`,
`/insights/colloidal-silica-takes-on-extreme-environments/`,
`/insights/powerful-technology-through-tiny-particles/`.

> Detection caveat: a raw `<form>`-tag count hits 442/453 because the header search box is a `<form>`
> on every page — IGNORE that. The real content forms are the component classes counted above
> (`gated-asset-simplified`, `contact-us-form-cmp`, `newsletter-signup-form`).

### C1. IS IT THE SAME FORM? — verified field-set comparison across ALL 191 gated pages (2026-08-12)

**Yes — it is essentially ONE reusable modal, opened per-asset.** Extracted the field names from every
gated page (not a sample):

| Variant | Component class | Fields | Pages |
|---|---|---|---|
| **Simplified (6-field)** | `gated-asset-simplified` | first_name, last_name, email_address (Business Email), company, job_title, country + consent + reCAPTCHA | **184** |
| **Download + Phone (7-field)** | `gated-asset-download` | same 6 **+ phone_number** | **1** (`/insights/how-to-achieve-a-matte-wood-finish-without-compromising-performa/`) |
| **Both variants on one page** | (page gates 2 assets) | — | **6** (e.g. `/industries/chemical-processing/catalyst-supports/`) |

190/191 pages use the **identical 6-field** modal — same names, labels, order, everywhere
(insights=industries=products=campaign=resources). So for the Adaptive Forms build this is **ONE
gated-modal template** (6-field) + a **minor 7-field variant** (adds Phone) for the edge case. The
modal is parameterised only by which asset it downloads, not by different fields.

**Net: distinct form TEMPLATES to build ≈ 6** (unchanged): the big conditional Contact–Product&Services
(+single-col), Contact–Corporate, SDS, Newsletter (×4 topics), Tradeshow, and the **gated-modal
(6-field, +7-field variant)**. Full per-URL list: `tools/importer/FORMS-URLS.txt` (200 pages).

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

## D2. SUBMISSION MECHANISM — where the payload goes (inspected 2026-08-12)

Verified by inspecting the live source forms (contact-us-product-and-services + the a-matte-that-lasts
gated modal). ALL grace.com forms submit the SAME way:

### The form markup
```html
<form class="contact-us" method="POST"
      data-name="Contact Us (Product and Service) Form"
      data-type="Contact Us"                         <!-- or "Download" for gated modal -->
      action="L2NvbnRlbnQvZ3JhY2Uv…cGFyZG90LmhhbmRsZXI=">  <!-- BASE64-ENCODED -->
  … visible fields (first_name, email_address, …) …
  <input type="hidden" name="form_type"           value="CONTACTUS_PRODUCT_AND_SERVICE">
  <input type="hidden" name="utmParams"           value="">
  <input type="hidden" name="pagePath"            value="">
  <input type="hidden" name="g-recaptcha-response" value="">
</form>
```

### The `action` is base64 — decodes to an AEM **Pardot handler servlet** (server-side, per-component)
- contact form → `/content/grace/us/en/forms/contact-us-product-and-services/jcr:content/root/container/section/col2/contact_us_form.pardot.handler`
- gated modal → `/content/grace/us/en/insights/a-matte-that-lasts/jcr:content/root/container/lightbox/content/gated_asset_simplifi.pardot.handler`
- Pattern: `<page JCR path>/<component node>.pardot.handler` — unique per form instance.

### The full flow (what happens on submit)
1. **reCAPTCHA v3** (invisible, score-based) runs on load — Google `recaptcha/api.js?render=6LfxaiAqAAAAAAOU3RPqe4IUpf5M6v7BaTCRb7U7`
   (site key `6LfxaiAqAAAA…`) writes a token into the hidden `g-recaptcha-response` field.
2. jQuery form JS (`/etc.clientlibs/grace/clientlibs/clientlib-dependencies.min.js`) collects the
   visible fields + the hidden `form_type` / `utmParams` / `pagePath` / recaptcha token.
3. It **POSTs to the AEM `.pardot.handler` servlet** (the decoded `action` path) — an endpoint on
   grace.com's own AEM instance, NOT a third party.
4. **AEM is the middleman:** the `.pardot.handler` servlet forwards the lead **server-to-server to
   Salesforce Pardot (Account Engagement)**. The browser only ever talks to grace.com; the real Pardot
   endpoint is hidden server-side and is NOT visible in page source.
5. On success → redirect to the matching thank-you page (`/forms/download-thank-you/`,
   `/forms/contact-us-thank-you/`, `/forms/newsletter-thank-you/`, `/forms/tradeshow-thank-you/`).

### Backend discriminators (what tells Pardot which form this is)
- **`form_type`** hidden field — e.g. `CONTACTUS_PRODUCT_AND_SERVICE` (the routing/tagging key).
- **`data-type`** (`Contact Us` / `Download`) + **`data-name`** (human label).
- The per-component `.pardot.handler` path.

### ⚠️ MIGRATION IMPLICATION (blocker to resolve with client)
The submit target is an **AEM-server-side Pardot handler servlet** — it will **NOT exist on Edge
Delivery**. Copying the `action` verbatim is impossible. Rebuilding on EDS needs a decision on the
target endpoint:
- **A** — POST directly to Pardot's public form-handler URL (`pi.pardot.com/l/…`); needs the client to
  provide the Pardot form-handler endpoints + field-name mapping.
- **B** — an EDS form-submission function / serverless proxy that forwards to Pardot server-side
  (mirrors today's AEM behaviour), keeping reCAPTCHA.
- **C** — AEM Adaptive Forms native submit action with a Pardot/Marketo connector.
Field names (`first_name`, `email_address`, `form_type`, …) + reCAPTCHA site key carry over regardless.
**ACTION: get the Pardot form-handler endpoint URLs from the client before building submit.**

---

## F. Next steps (Adaptive Forms pass — NOT started)

- Enable the `forms-excat` plugin (AEM Forms migration tools — HTML form → Adaptive Form JSON).
- Build the 6 templates above as Adaptive Forms; wire the conditional branches + reCAPTCHA + GDPR
  consent + Pardot/endpoint mapping. **See §D2 for the submission flow — the current `action` is a
  server-side AEM `.pardot.handler` servlet that won't exist on EDS; get the Pardot form-handler
  endpoint URLs from the client before building submit.**
- Map thank-you pages as redirect targets.
- Decide iframe (`contact-us-customer-service`) strategy.
- Track per-template migration status here as it proceeds.
