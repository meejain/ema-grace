/**
 * Social Share block
 * Renders a horizontal row of circular social-share buttons that open share
 * intents (LinkedIn, X/Twitter, Facebook, Email) for the current page URL.
 *
 * Expected authored structure (single cell listing the desired networks):
 *   <div class="social-share">
 *     <div><div>LinkedIn, X, Email, Facebook</div></div>
 *   </div>
 *
 * The first cell may optionally hold a heading/label (e.g. "Share"); any cell
 * that contains a comma-separated list of known network names is treated as the
 * network list. If no list is authored, all networks are rendered by default.
 *
 * @param {Element} block The block element
 */

/* Inline brand SVGs (24x24 viewBox), so we do not depend on an icon font. */
const ICONS = {
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.58-6.64 7.58H.48l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.48 3.24H4.29L17.61 20.65Z"/></svg>',
  email: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2 4h20c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Zm10 7.42L21.6 5.4A.99.99 0 0 0 21 5.2H3c-.22 0-.42.07-.6.2L12 11.42Zm0 2.35L2.2 7.63c-.13.2-.2.43-.2.7V17c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V8.33c0-.27-.07-.5-.2-.7L12 13.77Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"/></svg>',
};

/* Network definitions: aliases, aria label, and share URL builder. */
const NETWORKS = {
  linkedin: {
    aliases: ['linkedin', 'linked-in'],
    label: 'Share via LinkedIn',
    icon: ICONS.linkedin,
    url: (u) => `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(u)}`,
  },
  x: {
    aliases: ['x', 'twitter', 'x/twitter'],
    label: 'Share via X',
    icon: ICONS.x,
    url: (u) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}`,
  },
  email: {
    aliases: ['email', 'e-mail', 'mail'],
    label: 'Share via Email',
    icon: ICONS.email,
    url: (u) => `mailto:?body=${encodeURIComponent(u)}`,
  },
  facebook: {
    aliases: ['facebook', 'fb'],
    label: 'Share via Facebook',
    icon: ICONS.facebook,
    url: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
};

const DEFAULT_ORDER = ['linkedin', 'x', 'email', 'facebook'];

function resolveNetwork(token) {
  const key = token.trim().toLowerCase();
  return Object.keys(NETWORKS).find(
    (k) => NETWORKS[k].aliases.includes(key),
  );
}

export default function decorate(block) {
  const pageUrl = window.location.href;

  // Collect any authored network tokens from the block cells.
  const tokens = [];
  let label = '';
  block.querySelectorAll(':scope > div > div, :scope > div').forEach((cell) => {
    const text = (cell.textContent || '').trim();
    if (!text) return;
    const parts = text.split(',').map((p) => p.trim()).filter(Boolean);
    const resolved = parts.map(resolveNetwork).filter(Boolean);
    if (resolved.length && resolved.length === parts.length) {
      tokens.push(...resolved);
    } else if (!label && parts.length === 1 && !resolved.length) {
      label = text; // optional heading such as "Share"
    }
  });

  const order = tokens.length
    ? [...new Set(tokens)]
    : DEFAULT_ORDER;

  block.textContent = '';

  const container = document.createElement('div');
  container.className = 'social-share-list';

  order.forEach((key) => {
    const net = NETWORKS[key];
    if (!net) return;
    const link = document.createElement('a');
    link.className = 'social-share-button';
    link.href = net.url(pageUrl);
    link.title = net.label;
    link.setAttribute('aria-label', net.label);
    link.dataset.channel = key;
    if (key !== 'email') {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.innerHTML = net.icon;
    container.append(link);
  });

  if (label) {
    const heading = document.createElement('span');
    heading.className = 'social-share-label';
    heading.textContent = label;
    block.append(heading);
  }
  block.append(container);
}
