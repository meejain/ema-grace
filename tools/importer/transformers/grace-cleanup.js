/* eslint-disable */
/* global WebImporter */

/**
 * Transformer for Grace.com page cleanup
 * Purpose: Remove non-content elements (cookie consent, reCAPTCHA, tracking iframes, AEM grid artifacts)
 * Applies to: grace.com (all templates)
 * Generated: 2026-02-26
 *
 * SELECTORS EXTRACTED FROM:
 * - Captured DOM during migration workflow (cleaned.html)
 * - Found: OneTrust cookie consent, reCAPTCHA badge, demdex tracking iframe,
 *   AEM Grid wrapper classes, clientlib link elements, contact-us-sticky,
 *   search-bar component, alert-banner, skip-content link
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent elements
    // EXTRACTED: Found in captured DOM - OneTrust consent banner comment at line 987-990
    // Also found: demdex tracking iframe with class="aamIframeLoaded"
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '.onetrust-pc-dark-filter',
      'iframe.aamIframeLoaded',
      'iframe[src*="demdex.net"]',
    ]);

    // Remove reCAPTCHA widget
    // EXTRACTED: Found in captured DOM at line 992-996 - <div class="grecaptcha-badge">
    WebImporter.DOMUtils.remove(element, [
      '.grecaptcha-badge',
      'iframe[src*="recaptcha"]',
    ]);

    // Remove header/navigation experience fragment
    // EXTRACTED: Found in captured DOM - <div class="cmp-experiencefragment--header">
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--header',
    ]);

    // Remove footer experience fragment
    // EXTRACTED: Found in captured DOM at line 925-984 - <div class="cmp-experiencefragment--footer">
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--footer',
    ]);

    // Remove contact-us sticky component
    // EXTRACTED: Found in captured DOM at line 228 - <div class="contact-us-sticky">
    WebImporter.DOMUtils.remove(element, [
      '.contact-us-sticky',
    ]);

    // Remove skip-to-content link
    // EXTRACTED: Found in captured DOM at line 2 - <a class="sr-only sr-only-focusable skip-content">
    WebImporter.DOMUtils.remove(element, [
      '.skip-content',
    ]);

    // Remove alert banner
    // EXTRACTED: Found in captured DOM at line 9 - <div class="alert-banner">
    WebImporter.DOMUtils.remove(element, [
      '.alert-banner',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove clientlib link elements left behind
    // EXTRACTED: Found multiple <link href="/etc.clientlibs/grace/..."> in captured DOM
    WebImporter.DOMUtils.remove(element, [
      'link[href*="clientlibs"]',
      'link[href*="/etc.clientlibs/"]',
    ]);

    // Remove remaining iframes (tracking, videos handled by embed parser)
    WebImporter.DOMUtils.remove(element, [
      'iframe[src*="youtube-nocookie"]',
      'iframe.hidden',
      'video.hidden',
    ]);

    // Remove media-modal overlay divs (video modals)
    // EXTRACTED: Found in captured DOM at lines 640-659, 703-722 etc.
    WebImporter.DOMUtils.remove(element, [
      '.media-modal',
    ]);

    // Remove empty noscript and source tags
    WebImporter.DOMUtils.remove(element, [
      'noscript',
      'source',
    ]);

    // Clean up data-cmp-data-layer attributes
    // EXTRACTED: Found data-cmp-data-layer-enabled="" on body tag
    const allElements = element.querySelectorAll('[data-cmp-data-layer-enabled]');
    allElements.forEach((el) => {
      el.removeAttribute('data-cmp-data-layer-enabled');
    });

    // Clean up data-published-date and other AEM tracking attributes
    const body = element.querySelector('[data-published-date]');
    if (body) {
      body.removeAttribute('data-published-date');
      body.removeAttribute('data-industry');
      body.removeAttribute('data-operating-segment');
      body.removeAttribute('data-site-sections');
      body.removeAttribute('data-template');
    }
  }
}
