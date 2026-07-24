/**
 * Map Embedded block.
 *
 * Renders a keyless, responsive map for a facility location using an
 * OpenStreetMap iframe embed (no API key required, renders locally).
 *
 * Authored structure (EDS block table). Cells are read by role:
 *  - a "lat,long" coordinate cell (e.g. "42.4030,-86.2739") drives the map center
 *  - a cell with a facility name (heading or strong text)
 *  - a cell with the address / phone text becomes the caption
 * Order-independent: coordinates are detected by pattern, remaining text is
 * used for the caption. If no coordinates are authored, South Haven, MI is
 * used as a graceful default.
 */

const DEFAULT_COORDS = { lat: 42.403, lng: -86.2739 };
const DEFAULT_ZOOM = 14;

/** Parse a "lat,long" (optionally with trailing zoom "lat,long,zoom") string. */
function parseCoords(text) {
  if (!text) return null;
  const match = text.match(/(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)(?:\s*,\s*(\d{1,2}))?/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)
    || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }
  const zoom = match[3] ? parseInt(match[3], 10) : DEFAULT_ZOOM;
  return { lat, lng, zoom };
}

/** Build an OpenStreetMap embed URL centered on coords with a marker. */
function buildOsmSrc({ lat, lng }, zoom) {
  // bbox sized from zoom so the marker sits roughly centered
  const span = 360 / 2 ** zoom;
  const left = (lng - span).toFixed(6);
  const right = (lng + span).toFixed(6);
  const top = (lat + span / 2).toFixed(6);
  const bottom = (lat - span / 2).toFixed(6);
  const params = new URLSearchParams({
    bbox: `${left},${bottom},${right},${top}`,
    layer: 'mapnik',
    marker: `${lat},${lng}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

export default function decorate(block) {
  const rows = [...block.children];
  let coords = null;
  const captionNodes = [];
  let title = '';

  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      const text = cell.textContent.trim();
      const parsed = parseCoords(text);
      // treat a cell as coordinates only if it is essentially just the pair
      if (parsed && /^-?\d{1,3}(\.\d+)?\s*,\s*-?\d{1,3}(\.\d+)?(\s*,\s*\d{1,2})?$/.test(text)) {
        coords = parsed;
      } else if (text) {
        const heading = cell.querySelector('h1,h2,h3,h4,h5,h6');
        const strong = cell.querySelector('strong');
        if (!title && (heading || strong)) {
          title = (heading || strong).textContent.trim();
        }
        captionNodes.push(...cell.childNodes);
      }
    });
  });

  const center = coords || { ...DEFAULT_COORDS, zoom: DEFAULT_ZOOM };
  const zoom = center.zoom || DEFAULT_ZOOM;

  block.textContent = '';

  // Map frame
  const frame = document.createElement('div');
  frame.className = 'map-embedded-frame';

  const iframe = document.createElement('iframe');
  iframe.className = 'map-embedded-iframe';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('title', title ? `Map of ${title}` : 'Location map');
  iframe.setAttribute('src', buildOsmSrc(center, zoom));
  frame.append(iframe);
  block.append(frame);

  // Caption (facility name + address / phone)
  if (title || captionNodes.length) {
    const caption = document.createElement('figcaption');
    caption.className = 'map-embedded-caption';

    if (title) {
      const heading = document.createElement('p');
      heading.className = 'map-embedded-title';
      heading.textContent = title;
      caption.append(heading);
    }

    captionNodes
      .filter((node) => node.textContent && node.textContent.trim()
        && node.textContent.trim() !== title)
      .forEach((node) => caption.append(node.cloneNode(true)));

    // "View larger map" link (opens OSM in a new tab, keyless)
    const link = document.createElement('a');
    link.className = 'map-embedded-link';
    link.href = `https://www.openstreetmap.org/?mlat=${center.lat}&mlon=${center.lng}#map=${zoom}/${center.lat}/${center.lng}`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'View larger map';
    caption.append(link);

    block.append(caption);
  }
}
