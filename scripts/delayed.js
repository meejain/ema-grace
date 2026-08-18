// add delayed functionality here
import { loadScript } from './aem.js';

// Adobe Launch (Adobe Experience Platform Tags) — WR Grace production container.
// Loaded in the delayed phase (post-LCP) so analytics never blocks page rendering.
// The container itself loads Adobe Analytics (AppMeasurement), the ECID/Visitor
// service, Adobe Target and GA. NOTE: many of Grace's Launch rules are driven by
// `window.adobeDataLayer` pushes that AEM components emitted; those events will not
// fire until an EDS-side data-layer shim reproduces them. This loads the container only.
loadScript('https://assets.adobedtm.com/fcc152dfd7eb/961baaee4974/launch-3906774dfe97.min.js', { async: 'true' });
