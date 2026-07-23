/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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

  // tools/importer/import-grace-homepage.js
  var import_grace_homepage_exports = {};
  __export(import_grace_homepage_exports, {
    default: () => import_grace_homepage_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const bgImage = element.querySelector(":scope > img") || element.querySelector("img");
    const heading = element.querySelector(".hero__heading h1") || element.querySelector("h1") || element.querySelector("h2");
    const ctaLink = element.querySelector(".hero__button a.btn-primary") || element.querySelector(".hero__button a") || element.querySelector(".button__section a");
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (ctaLink) {
      const link = document.createElement("a");
      link.href = ctaLink.href;
      link.textContent = ctaLink.textContent.trim();
      contentCell.push(link);
    }
    cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document, { name: "Hero-Banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse2(element, { document }) {
    let cards;
    if (element.classList.contains("cmp-card") && element.classList.contains("bio")) {
      const parentRow = element.closest(".row") || element.closest("article") || element.parentElement;
      cards = Array.from(parentRow.querySelectorAll(".cmp-card.bio"));
    } else {
      cards = Array.from(element.querySelectorAll(".cmp-card.bio"));
    }
    if (!cards.length) {
      cards = Array.from(element.querySelectorAll(".cmp-card"));
    }
    const cells = [];
    cards.forEach((card) => {
      var _a;
      const img = card.querySelector(".image img") || card.querySelector(".card-content img") || card.querySelector("img");
      const title = card.querySelector(".title") || card.querySelector(".h4") || card.querySelector("h3, h4");
      const descEl = card.querySelector(".spt-copy p") || card.querySelector(".spt-copy") || card.querySelector(".content p:not(.h4):not(.h5)");
      const href = card.href || ((_a = card.closest("a")) == null ? void 0 : _a.href) || "";
      const contentCell = [];
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title.textContent.trim();
        contentCell.push(h3);
      }
      if (descEl) {
        const p = document.createElement("p");
        p.textContent = descEl.textContent.trim();
        contentCell.push(p);
      }
      if (href) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = title ? title.textContent.trim() : "Learn more";
        contentCell.push(link);
      }
      const imageCell = img ? [img] : [];
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards-Product", cells });
    const groupContainer = element.closest(".row") || element.closest("article") || element.parentElement;
    (groupContainer || element).replaceWith(block);
  }

  // tools/importer/parsers/columns-people.js
  function parse3(element, { document }) {
    let container = element;
    if (element.classList.contains("cmp-image__link") || element.tagName === "A" || element.tagName === "IMG") {
      let ancestor = element.parentElement;
      while (ancestor && ancestor.tagName !== "BODY") {
        if (ancestor.querySelectorAll(".col-lg-6").length >= 2) break;
        ancestor = ancestor.parentElement;
      }
      container = ancestor || element.closest(".row") || element.closest("section") || element.parentElement;
    }
    let columns = Array.from(container.querySelectorAll(":scope > .col-lg-6"));
    if (!columns.length) {
      columns = Array.from(container.querySelectorAll(".col-lg-6"));
    }
    const row = [];
    columns.forEach((col) => {
      const cellContent = [];
      const img = col.querySelector(".cmp-image__image") || col.querySelector(".cmp-image img") || col.querySelector("img");
      if (img) {
        cellContent.push(img.cloneNode(true));
      }
      const textEl = col.querySelector(".rich-text p") || col.querySelector(".rich-text") || col.querySelector(".text p");
      if (textEl) {
        const p = document.createElement("p");
        p.innerHTML = textEl.innerHTML;
        cellContent.push(p);
      }
      const ctaLink = col.querySelector(".btn-primary") || col.querySelector(".button__section a") || col.querySelector(".button a");
      if (ctaLink) {
        const link = document.createElement("a");
        link.href = ctaLink.href;
        link.textContent = ctaLink.textContent.trim();
        cellContent.push(link);
      }
      row.push(cellContent.filter(Boolean));
    });
    const cleanRow = row.filter((c) => c.length > 0);
    if (!cleanRow.length) {
      return;
    }
    const cells = [cleanRow];
    const block = WebImporter.Blocks.createBlock(document, { name: "Columns-People", cells });
    (container && container !== element ? container : element).replaceWith(block);
  }

  // tools/importer/parsers/cards-industry.js
  function parse4(element, { document }) {
    let cards = Array.from(element.querySelectorAll(".cmp-card.small"));
    if (!cards.length) {
      cards = Array.from(element.querySelectorAll(".card .cmp-card"));
    }
    if (!cards.length) {
      cards = Array.from(element.querySelectorAll(".cmp-card"));
    }
    const cells = [];
    cards.forEach((card) => {
      var _a;
      const img = card.querySelector(".image img") || card.querySelector(".card-content img") || card.querySelector("img");
      const ctaDiv = card.querySelector(".cta.btn-track") || card.querySelector(".cta") || card.querySelector(".content");
      const titleText = ctaDiv ? ctaDiv.textContent.trim() : "";
      const href = card.href || ((_a = card.closest("a")) == null ? void 0 : _a.href) || "";
      const contentCell = [];
      if (href && titleText) {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = titleText;
        contentCell.push(link);
      } else if (titleText) {
        const p = document.createElement("p");
        p.textContent = titleText;
        contentCell.push(p);
      }
      const imageCell = img ? [img] : [];
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards-Industry", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/embed-video.js
  function parse5(element, { document }) {
    const posterImg = element.querySelector(".media-video .img img") || element.querySelector(".img img") || element.querySelector("img");
    const iframe = element.querySelector('.media-modal iframe[src*="youtube"]') || element.querySelector('iframe[src*="youtube"]') || element.querySelector("iframe[title]");
    let videoUrl = "";
    if (iframe) {
      const src = iframe.src || iframe.getAttribute("src") || "";
      const videoIdMatch = src.match(/\/embed\/([a-zA-Z0-9_-]+)/);
      if (videoIdMatch) {
        videoUrl = `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
      } else {
        videoUrl = src.startsWith("//") ? `https:${src}` : src;
      }
    }
    const cells = [];
    if (posterImg) {
      cells.push([posterImg]);
    }
    if (videoUrl) {
      const link = document.createElement("a");
      link.href = videoUrl;
      link.textContent = videoUrl;
      cells.push([link]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "Embed-Video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insight.js
  function parse6(element, { document }) {
    let mediaCallouts;
    let groupScope = null;
    if (element.classList.contains("media-callout") || element.classList.contains("cmp-media-callout")) {
      groupScope = element.closest("section#blogs") || element.closest("#blogs") || element.closest("section");
      mediaCallouts = groupScope ? Array.from(groupScope.querySelectorAll(".media-callout")) : [element];
      if (!mediaCallouts.length) mediaCallouts = [element];
    } else {
      groupScope = element;
      mediaCallouts = Array.from(element.querySelectorAll(".media-callout, .cmp-media-callout"));
    }
    const cells = [];
    mediaCallouts.forEach((callout) => {
      const img = callout.querySelector(".media-image .img img") || callout.querySelector(".media-image img") || callout.querySelector(".img img") || callout.querySelector("img");
      const categoryEl = callout.querySelector(".subhead-small h5") || callout.querySelector("h5");
      const category = categoryEl ? categoryEl.textContent.trim() : "";
      const titleLink = callout.querySelector(".subhead-small p a") || callout.querySelector(".subhead-small a");
      const titleText = titleLink ? titleLink.textContent.trim() : "";
      const titleHref = titleLink ? titleLink.href : "";
      const readMoreLinks = Array.from(callout.querySelectorAll(".subhead-small p a"));
      const readMoreLink = readMoreLinks.length > 1 ? readMoreLinks[readMoreLinks.length - 1] : null;
      const readMoreHref = readMoreLink ? readMoreLink.href : titleHref;
      const contentCell = [];
      if (category) {
        const catP = document.createElement("p");
        catP.textContent = category;
        contentCell.push(catP);
      }
      if (titleText) {
        const titleP = document.createElement("p");
        const titleA = document.createElement("a");
        titleA.href = titleHref || readMoreHref;
        titleA.textContent = titleText;
        titleP.appendChild(titleA);
        contentCell.push(titleP);
      }
      if (readMoreHref) {
        const rmP = document.createElement("p");
        const rmA = document.createElement("a");
        rmA.href = readMoreHref;
        rmA.textContent = "Read more >";
        rmP.appendChild(rmA);
        contentCell.push(rmP);
      }
      const imageCell = img ? [img] : [];
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "Cards-Insight", cells });
    let groupContainer = null;
    if (mediaCallouts.length > 1) {
      let ancestor = element.parentElement;
      while (ancestor && ancestor.tagName !== "BODY") {
        if (ancestor.querySelectorAll(".media-callout").length >= mediaCallouts.length) {
          groupContainer = ancestor;
          break;
        }
        ancestor = ancestor.parentElement;
      }
    }
    (groupContainer || groupScope || element).replaceWith(block);
  }

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

  // tools/importer/import-grace-homepage.js
  var parsers = {
    "hero-banner": parse,
    "cards-product": parse2,
    "columns-people": parse3,
    "cards-industry": parse4,
    "embed-video": parse5,
    "cards-insight": parse6
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "grace-homepage",
    description: "Grace.com homepage with hero banner, product cards, people columns, industry cards, video embed, and insight cards sections",
    urls: ["https://grace.com/"],
    blocks: [
      { name: "hero-banner", instances: [".hero__section"] },
      { name: "cards-product", instances: [".cmp-card.bio"] },
      { name: "columns-people", instances: [".cmp-image__link"] },
      { name: "cards-industry", instances: ["section.background-image .card-group"] },
      { name: "embed-video", instances: [".cmp-media-callout.slate-bkgd .media-video"] },
      { name: "cards-insight", instances: ["section#blogs .media-callout"] }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function createSectionMetadata(document, styleValue) {
    return WebImporter.Blocks.createBlock(document, {
      name: "Section Metadata",
      cells: [["Style", styleValue]]
    });
  }
  function rewriteInternalLinks(main, document) {
    const anchors = main.querySelectorAll("a[href]");
    anchors.forEach((a) => {
      let href = a.getAttribute("href");
      if (!href) return;
      if (href.startsWith("//")) href = `https:${href}`;
      try {
        if (/^https?:\/\//i.test(href)) {
          const u = new URL(href);
          const host = u.hostname;
          const isInternal = host === "grace.com" || host.endsWith(".grace.com") && host !== "jobs.grace.com" || host.includes("xmod-gracev1") || host.includes("--ema-grace--") || host.includes("aem.live") || host.includes("aem.page");
          if (isInternal) {
            let path = u.pathname;
            path = path.replace(/^\/content\/grace\/us\/en/, "");
            path = path.replace(/\.html$/, "");
            if (path.length > 1) path = path.replace(/\/$/, "");
            if (path === "") path = "/";
            a.setAttribute("href", path);
          }
          return;
        }
        if (href.startsWith("/")) {
          let path = href.replace(/^\/content\/grace\/us\/en/, "").replace(/\.html$/, "");
          if (path.length > 1) path = path.replace(/\/$/, "");
          if (path === "") path = "/";
          a.setAttribute("href", path);
        }
      } catch (e) {
      }
    });
  }
  var import_grace_homepage_default = {
    transform: (payload) => {
      var _a, _b;
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      const introEl = (() => {
        const p = Array.from(document.querySelectorAll("p")).find((el) => /global leader in specialty chemicals/i.test(el.textContent));
        return p ? p.closest("article") || p.parentElement : null;
      })();
      const embedBlockEl = ((_a = pageBlocks.find((b) => b.name === "embed-video")) == null ? void 0 : _a.element) || null;
      const embedSectionEl = embedBlockEl ? embedBlockEl.closest(".cmp-media-callout") || embedBlockEl.closest("article") : null;
      const insightBlockEl = ((_b = pageBlocks.find((b) => b.name === "cards-insight")) == null ? void 0 : _b.element) || null;
      const insightSectionEl = insightBlockEl ? insightBlockEl.closest("section#blogs") : null;
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      if (introEl && introEl.parentNode) {
        introEl.appendChild(createSectionMetadata(document, "light-gray"));
        introEl.parentNode.insertBefore(document.createElement("hr"), introEl.nextSibling);
      }
      if (embedSectionEl && embedSectionEl.parentNode) {
        embedSectionEl.appendChild(createSectionMetadata(document, "dark"));
        embedSectionEl.parentNode.insertBefore(document.createElement("hr"), embedSectionEl);
      }
      if (insightSectionEl && insightSectionEl.parentNode) {
        insightSectionEl.appendChild(createSectionMetadata(document, "light-gray"));
        insightSectionEl.parentNode.insertBefore(document.createElement("hr"), insightSectionEl);
      }
      rewriteInternalLinks(main, document);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_grace_homepage_exports);
})();
