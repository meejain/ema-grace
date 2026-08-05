/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-sidebar-test.js
  var import_sidebar_test_exports = {};
  __export(import_sidebar_test_exports, {
    default: () => import_sidebar_test_default
  });

  // tools/importer/transformers/grace-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        ".onetrust-pc-dark-filter",
        "iframe.aamIframeLoaded",
        'iframe[src*="demdex.net"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".grecaptcha-badge",
        'iframe[src*="recaptcha"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-experiencefragment--footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".contact-us-sticky"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".skip-content"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".alert-banner"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        'link[href*="clientlibs"]',
        'link[href*="/etc.clientlibs/"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        'iframe[src*="youtube-nocookie"]',
        "iframe.hidden",
        "video.hidden"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".media-modal"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "noscript",
        "source"
      ]);
      const allElements = element.querySelectorAll("[data-cmp-data-layer-enabled]");
      allElements.forEach((el) => {
        el.removeAttribute("data-cmp-data-layer-enabled");
      });
      const body = element.querySelector("[data-published-date]");
      if (body) {
        body.removeAttribute("data-published-date");
        body.removeAttribute("data-industry");
        body.removeAttribute("data-operating-segment");
        body.removeAttribute("data-site-sections");
        body.removeAttribute("data-template");
      }
    }
  }

  // tools/importer/import-sidebar-test.js
  var transformers = [transform];
  function executeTransformers(hookName, element, payload) {
    transformers.forEach((fn) => {
      try {
        fn.call(null, hookName, element, payload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function createSectionMetadata(document, styleValue) {
    return WebImporter.Blocks.createBlock(document, {
      name: "Section Metadata",
      cells: [["Style", styleValue]]
    });
  }
  function buildMetadataBlock(document, extraPairs) {
    const cells = [];
    const title = document.querySelector("title");
    if (title) cells.push(["Title", title.textContent.replace(/[\n\t]/gm, "").trim()]);
    const desc = document.querySelector('meta[name="description"]');
    if (desc && desc.content) cells.push(["Description", desc.content.trim()]);
    extraPairs.forEach(([k, v]) => cells.push([k, v]));
    return WebImporter.Blocks.createBlock(document, { name: "Metadata", cells });
  }
  function rewriteInternalLinks(main) {
    main.querySelectorAll("a[href]").forEach((a) => {
      let href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("//")) href = `https:${href}`;
      try {
        if (/^https?:\/\//i.test(href)) {
          const u = new URL(href);
          const host = u.hostname;
          const isInternal = host === "grace.com" || host.endsWith(".grace.com") && host !== "jobs.grace.com" || host.includes("xmod-gracev1") || host.includes("--ema-grace--") || host.includes("aem.live") || host.includes("aem.page");
          if (isInternal) {
            let path = u.pathname.replace(/^\/content\/grace\/us\/en/, "").replace(/\.html$/, "");
            if (path.length > 1) path = path.replace(/\/$/, "");
            a.setAttribute("href", path || "/");
          }
          return;
        }
        if (href.startsWith("/")) {
          let path = href.replace(/^\/content\/grace\/us\/en/, "").replace(/\.html$/, "");
          if (path.length > 1) path = path.replace(/\/$/, "");
          a.setAttribute("href", path || "/");
        }
      } catch (e) {
      }
    });
  }
  function buildSidebarNav(document, currentPath) {
    const navAnchors = Array.from(document.querySelectorAll(
      'article [aria-label="Section navigation"] a, article .section-nav a, article .col-lg-2 a'
    ));
    if (!navAnchors.length) return null;
    const seen = /* @__PURE__ */ new Set();
    const ul = document.createElement("ul");
    navAnchors.forEach((a) => {
      const text = (a.textContent || "").replace(/\s+/g, " ").trim();
      let href = a.getAttribute("href") || "";
      if (!text || !href) return;
      const norm = href.replace(/^\/content\/grace\/us\/en/, "").replace(/\.html$/, "").replace(/\/$/, "");
      if (seen.has(norm)) return;
      seen.add(norm);
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.setAttribute("href", href);
      link.textContent = text;
      li.append(link);
      ul.append(li);
    });
    if (!ul.children.length) return null;
    const section = document.createElement("div");
    section.append(ul);
    section.append(createSectionMetadata(document, "sidebar-nav"));
    return section;
  }
  function extractMainContent(document) {
    const mainCol = document.querySelector("article .col-lg-7") || document.querySelector("article h2") && document.querySelector("article h2").closest('[class*="col-"]');
    if (!mainCol) return [];
    const rich = mainCol.querySelector(".rich-text") || mainCol;
    const nodes = Array.from(rich.children).filter((el) => {
      if (/^(SCRIPT|STYLE|NOSCRIPT|LINK|IFRAME)$/.test(el.tagName)) return false;
      return (el.textContent || "").trim().length > 0 || el.querySelector("img");
    });
    return nodes;
  }
  function buildHeroBlock(document) {
    const h1src = document.querySelector("article h1, .hero h1, h1");
    const title = h1src ? (h1src.textContent || "").trim() : (document.title || "").trim();
    if (!title) return null;
    const h1 = document.createElement("h1");
    h1.textContent = title;
    return WebImporter.Blocks.createBlock(document, { name: "Hero (banner)", cells: [[h1]] });
  }
  function buildContactSplitBanner(document) {
    const cmp = document.querySelector(".contact-us-cmp");
    if (!cmp) return null;
    const titleEl = cmp.querySelector(".contact-us-title, h2");
    const title = titleEl ? (titleEl.textContent || "").replace(/\s+/g, " ").trim() : "Want to talk to an expert?";
    const cols = Array.from(cmp.querySelectorAll('.row.has-title > [class*="col-lg-6"], .row.has-title > [class*="col-"]'));
    const halfCells = cols.map((col) => {
      const cell = [];
      const h3 = col.querySelector("h3");
      if (h3) {
        const h = document.createElement("h3");
        h.textContent = (h3.textContent || "").trim();
        cell.push(h);
      }
      const cta = col.querySelector(".button__section a, a.btn-primary, a[href]");
      if (cta) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = cta.getAttribute("href") || "#";
        a.textContent = (cta.textContent || "").replace(/\s+/g, " ").trim();
        p.append(a);
        cell.push(p);
      }
      const introP = Array.from(col.querySelectorAll(".rich-text p")).find((p) => (p.textContent || "").trim());
      if (introP) {
        const p = document.createElement("p");
        p.innerHTML = introP.innerHTML;
        cell.push(p);
      }
      const list = col.querySelector("ul, ol");
      if (list) cell.push(list.cloneNode(true));
      return cell;
    }).filter((c) => c.length);
    if (!halfCells.length) return null;
    const cells = [[title], halfCells];
    return WebImporter.Blocks.createBlock(document, { name: "Banner (contact-split)", cells });
  }
  var import_sidebar_test_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      executeTransformers("beforeTransform", document.body, payload);
      const currentPath = new URL(params.originalURL).pathname;
      const main = document.createElement("main");
      const heroBlock = buildHeroBlock(document);
      if (heroBlock) {
        const heroSection = document.createElement("div");
        heroSection.append(heroBlock);
        main.append(heroSection);
        main.append(document.createElement("hr"));
      }
      const navSection = buildSidebarNav(document, currentPath);
      if (navSection) main.append(navSection);
      const contentNodes = extractMainContent(document);
      if (contentNodes.length) {
        if (navSection) main.append(document.createElement("hr"));
        const contentSection = document.createElement("div");
        contentNodes.forEach((n) => contentSection.append(n));
        main.append(contentSection);
      }
      const contactBanner = buildContactSplitBanner(document);
      if (contactBanner) {
        main.append(document.createElement("hr"));
        const bannerSection = document.createElement("div");
        bannerSection.append(contactBanner);
        main.append(bannerSection);
      }
      const cmpTitleEl = document.querySelector(".contact-us-cmp .contact-us-title, .contact-us-cmp h2");
      const contactTagline = cmpTitleEl ? (cmpTitleEl.textContent || "").replace(/\s+/g, " ").trim() : "Want to talk to an expert?";
      const crumbItems = Array.from(document.querySelectorAll(
        'nav[aria-label*="readcrumb" i] li, .breadcrumb li, [class*="breadcrumb"] li'
      ));
      const lastCrumb = crumbItems.length ? (crumbItems[crumbItems.length - 1].textContent || "").replace(/\s+/g, " ").trim() : "";
      const pageMeta = [
        ["template", "sidebar"],
        ["contactus", "true"],
        ["contactus-tagline", contactTagline]
      ];
      if (lastCrumb) pageMeta.push(["breadcrumb-title", lastCrumb]);
      rewriteInternalLinks(main);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      main.appendChild(document.createElement("hr"));
      main.appendChild(buildMetadataBlock(document, pageMeta));
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: "sidebar",
          pageMetadata: pageMeta.map((p) => p[0]),
          sidebarNav: !!navSection,
          contentNodes: contentNodes.length
        }
      }];
    }
  };
  return __toCommonJS(import_sidebar_test_exports);
})();
