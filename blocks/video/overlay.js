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
  block.textContent = '';

  const frame = document.createElement('div');
  frame.className = 'video-overlay-frame';

  const poster = document.createElement('div');
  poster.className = 'video-overlay-poster';
  if (picture) poster.append(picture);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'video-overlay-play';
  button.setAttribute('aria-label', 'Play video');

  poster.append(button);
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
