/**
 * Map Embedded block.
 *
 * Renders a responsive Google Maps embed for a facility location using the
 * keyless `maps.google.com/maps?q=...&output=embed` URL — the same method the
 * source (grace.com facility pages) uses, so it shows real Google tiles and a
 * red pin with no API key required.
 *
 * Authored structure (EDS block table). Cells are read by role:
 *  - a "lat,long" coordinate cell (e.g. "42.4030,-86.2739") sets a fallback
 *    center / zoom when no address is authored
 *  - a cell with a facility name (heading or strong text)
 *  - a cell with the address / phone text becomes the caption
 * The Google embed is queried by facility name + address when available so the
 * pin lands on the actual business listing; coordinates are the fallback.
 */

const DEFAULT_COORDS = { lat: 42.403, lng: -86.2739 };
const DEFAULT_ZOOM = 13;

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

/**
 * Build a keyless Google Maps embed URL. Uses the facility query (name +
 * address) when available so the red pin lands on the business listing;
 * otherwise centers on the authored coordinates. Mirrors the source embed:
 * https://maps.google.com/maps?q=...&z=13&output=embed
 */
function buildGoogleSrc({ lat, lng }, zoom, query) {
  const q = query || `${lat},${lng}`;
  const params = new URLSearchParams({
    q,
    z: String(zoom),
    ie: 'UTF8',
    iwloc: '',
    output: 'embed',
  });
  return `https://maps.google.com/maps?${params.toString()}`;
}

export default function decorate(block) {
  const rows = [...block.children];
  let coords = null;
  const captionNodes = [];
  let title = '';
  let addressText = '';

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
        // capture the street/city line for the maps query (the paragraph that
        // follows an "ADDRESS:" heading, or the first plain address-looking p)
        const addrP = cell.querySelector('h5 + p, p');
        if (!addressText && addrP && /\d/.test(addrP.textContent)
          && !/phone/i.test(addrP.previousElementSibling?.textContent || '')) {
          // <br> inside the address must become a space, not collapse two
          // lines into one word ("StreetSouth Haven").
          const withBreaks = addrP.innerHTML.replace(/<br\s*\/?>/gi, ', ');
          const tmp = document.createElement('div');
          tmp.innerHTML = withBreaks;
          addressText = tmp.textContent.replace(/\s+/g, ' ').trim();
        }
        captionNodes.push(...cell.childNodes);
      }
    });
  });

  const center = coords || { ...DEFAULT_COORDS, zoom: DEFAULT_ZOOM };
  const zoom = center.zoom || DEFAULT_ZOOM;

  block.textContent = '';

  // Caption (facility name + address / phone). Source stacks the caption ABOVE
  // the map on mobile and places it to the LEFT of the map on desktop, so the
  // caption is appended first and the layout is handled with flex direction.
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

    block.append(caption);
  }

  // Map frame (fixed 350x300 to mirror the source Google embed)
  const frame = document.createElement('div');
  frame.className = 'map-embedded-frame';

  // Query by facility name + address so the red pin lands on the business
  // listing (as the source does); coordinates are the fallback. The Google
  // embed renders its own "Open in Maps" / "View larger map" controls, exactly
  // like the source, so no separate overlay button is needed.
  const mapsQuery = [title, addressText].filter(Boolean).join(', ');

  const iframe = document.createElement('iframe');
  iframe.className = 'map-embedded-iframe';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('title', title ? `Map of ${title}` : 'Location map');
  iframe.setAttribute('src', buildGoogleSrc(center, zoom, mapsQuery));
  frame.append(iframe);

  block.append(frame);
}
