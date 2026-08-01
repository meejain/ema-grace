/*
 * Video Grid Block
 * Renders a grid of "media callout" video teasers. Each card mirrors Grace's
 * cmp-media-callout layout: a centered title above a 16:9 poster with a
 * centered play button, and a "Video ansehen" label below. Clicking a card
 * swaps the poster for an inline YouTube/Vimeo iframe that plays in place.
 */

import { createOptimizedPicture } from '../../scripts/aem.js';

const WATCH_LABEL = 'Video ansehen';

function buildEmbedUrl(rawUrl) {
  try {
    const url = new URL(rawUrl, window.location.href);
    const host = url.hostname.replace('www.', '');
    if (host.includes('youtube') || host.includes('youtu.be')) {
      let id = url.searchParams.get('v');
      if (!id && (host.includes('youtu.be') || url.pathname.includes('/embed/'))) {
        [, , id] = url.pathname.split('/');
        id = id || url.pathname.split('/').pop();
      }
      if (id) {
        return `https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0&autoplay=1`;
      }
    }
    if (host.includes('vimeo')) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url.href;
  } catch (e) {
    return rawUrl;
  }
}

function playVideo(card, embedUrl, title) {
  if (card.classList.contains('video-grid-card-playing')) return;
  card.classList.add('video-grid-card-playing');

  const frame = document.createElement('div');
  frame.className = 'video-grid-iframe';

  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', embedUrl);
  iframe.setAttribute('title', title || WATCH_LABEL);
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
  iframe.setAttribute('allowfullscreen', '');
  frame.append(iframe);

  const media = card.querySelector('.video-grid-media');
  media.replaceChildren(frame);
}

export default function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('ul');
  grid.className = 'video-grid-list';

  rows.forEach((row) => {
    const cells = [...row.children];
    const picture = cells[0] ? cells[0].querySelector('picture, img') : null;
    const link = cells[1] ? cells[1].querySelector('a') : null;
    const titleText = cells[2] ? cells[2].textContent.trim() : '';
    const rawUrl = link ? link.getAttribute('href') : '';

    const item = document.createElement('li');
    item.className = 'video-grid-card';

    // Title — a sibling of the media so it flows above the image on mobile and
    // is repositioned as an overlay on desktop (source responsive behaviour).
    let title = null;
    if (titleText) {
      title = document.createElement('p');
      title.className = 'video-grid-title';
      title.textContent = titleText;
      item.append(title);
    }

    const media = document.createElement('div');
    media.className = 'video-grid-media';

    // poster
    let poster = picture;
    if (poster && poster.tagName === 'IMG') {
      poster = createOptimizedPicture(poster.src, poster.alt || titleText, false);
    } else if (poster) {
      const img = poster.querySelector('img');
      if (img) poster = createOptimizedPicture(img.src, img.alt || titleText, false);
    }
    if (poster) {
      poster.classList.add('video-grid-poster');
      media.append(poster);
    }

    // dark gradient tint over the poster (desktop overlay only; hidden on mobile)
    const tint = document.createElement('span');
    tint.className = 'video-grid-tint';
    tint.setAttribute('aria-hidden', 'true');
    media.append(tint);

    // centered play button over the poster
    const play = document.createElement('button');
    play.type = 'button';
    play.className = 'video-grid-play';
    play.setAttribute('aria-label', `${WATCH_LABEL}: ${titleText}`.trim());
    media.append(play);

    item.append(media);

    // "Video ansehen" label — a sibling below the media (flows below on mobile,
    // repositioned as an overlay on desktop).
    const watch = document.createElement('p');
    watch.className = 'video-grid-watch';
    watch.textContent = WATCH_LABEL;
    item.append(watch);

    if (rawUrl) {
      const embedUrl = buildEmbedUrl(rawUrl);
      item.classList.add('video-grid-card-has-video');
      const trigger = () => playVideo(item, embedUrl, titleText);
      item.addEventListener('click', trigger);
      play.addEventListener('click', (e) => {
        e.stopPropagation();
        trigger();
      });
    }

    grid.append(item);
  });

  block.replaceChildren(grid);
}
