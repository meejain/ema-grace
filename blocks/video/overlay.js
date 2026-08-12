/*
 * Video Overlay Block
 * Poster image with a play button. On click the poster is replaced by an
 * autoplaying YouTube/Vimeo iframe. Mirrors Grace's cmp-media-callout pattern
 * and reuses the embed approach from blocks/embed-video/embed-video.js.
 */

const embedYoutube = (url) => {
  const usp = new URLSearchParams(url.search);
  let vid = usp.get('v') ? encodeURIComponent(usp.get('v')) : '';
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  const src = vid
    ? `https://www.youtube.com/embed/${vid}?rel=0&autoplay=1&mute=1`
    : `https://www.youtube.com${url.pathname}`;
  return `<iframe src="${src}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
      allowfullscreen scrolling="no" title="Content from YouTube" loading="lazy"></iframe>`;
};

const embedVimeo = (url) => {
  const [, video] = url.pathname.split('/');
  return `<iframe src="https://player.vimeo.com/video/${video}?autoplay=1&muted=1"
      allow="autoplay; fullscreen; picture-in-picture" allowfullscreen
      title="Content from Vimeo" loading="lazy"></iframe>`;
};

const getDefaultEmbed = (url) => `<iframe src="${url.href}" allow="encrypted-media"
    allowfullscreen scrolling="no" title="Content from ${url.hostname}" loading="lazy"></iframe>`;

const EMBEDS_CONFIG = [
  { match: ['youtube', 'youtu.be'], embed: embedYoutube },
  { match: ['vimeo'], embed: embedVimeo },
];

const loadVideo = (frame, link) => {
  if (frame.classList.contains('video-overlay-is-loaded')) return;
  const url = new URL(link);
  const config = EMBEDS_CONFIG.find((e) => e.match.some((m) => link.includes(m)));
  frame.innerHTML = config ? config.embed(url) : getDefaultEmbed(url);
  frame.classList.add('video-overlay-is-loaded');
};

export default function decorate(block) {
  const picture = block.querySelector('picture');
  const anchor = block.querySelector('a');
  const link = anchor ? anchor.href : '';

  // Caption title (source: `.media-video .subhead-large`). The importer emits it as a sibling
  // heading immediately before the block (default content in the same section). Adopt it into the
  // poster as a centered overlay caption — matching grace.com, where the title sits over the poster
  // above the play button and a "Watch video ›" affordance sits below it. Read it before we clear.
  // After decorateSections the heading sits in the PRECEDING `.default-content-wrapper` (the video
  // block is in its own `*-wrapper`), so check both the block's own previous sibling (unwrapped)
  // and the wrapper's previous sibling's LAST child (wrapped). Only adopt a bare heading, and only
  // when it directly precedes the video (last child) so an unrelated subheading isn't taken.
  const headingBefore = (el) => {
    const p = el.previousElementSibling;
    if (p && /^H[1-6]$/.test(p.tagName)) return p;
    return null;
  };
  const wrapper = block.parentElement;
  const wrapperPrev = wrapper && wrapper.classList.contains('video-wrapper')
    ? wrapper.previousElementSibling : null;
  const wrappedHeading = wrapperPrev && wrapperPrev.classList.contains('default-content-wrapper')
    && /^H[1-6]$/.test(wrapperPrev.lastElementChild?.tagName || '')
    ? wrapperPrev.lastElementChild : null;
  const captionEl = headingBefore(block) || wrappedHeading;
  const captionText = captionEl ? captionEl.textContent.trim() : '';
  if (captionEl) captionEl.remove();

  block.textContent = '';

  const frame = document.createElement('div');
  frame.className = 'video-overlay-frame';

  const poster = document.createElement('div');
  poster.className = 'video-overlay-poster';
  if (picture) poster.append(picture);

  // Title overlay near the top-center of the poster (source parity).
  if (captionText) {
    const title = document.createElement('p');
    title.className = 'video-overlay-title';
    title.textContent = captionText;
    poster.append(title);
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-overlay-play';
  button.setAttribute('aria-label', captionText ? `Play video: ${captionText}` : 'Play video');

  poster.append(button);

  // "Watch video ›" affordance below the play button (source parity).
  const watch = document.createElement('span');
  watch.className = 'video-overlay-watch';
  watch.textContent = 'Watch video';
  watch.setAttribute('aria-hidden', 'true');
  poster.append(watch);

  frame.append(poster);
  block.append(frame);

  const play = () => {
    if (!link) return;
    loadVideo(frame, link);
    poster.remove();
  };

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    play();
  });
  poster.addEventListener('click', play);
}
