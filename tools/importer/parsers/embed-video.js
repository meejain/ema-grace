/* eslint-disable */
/* global WebImporter */

/**
 * Parser for embed-video block
 *
 * Source: https://grace.com/
 * Base Block: embed
 *
 * Block Structure (from markdown example):
 * - Row 1: Poster image
 * - Row 2: YouTube URL link
 *
 * Source HTML Pattern (from captured DOM):
 * <div class="media-video">
 *   <p class="subhead-large header-on-mobile">We Are Grace</p>
 *   <div class="img">
 *     <img src="...Video-Still-We-Are-Grace.jpg" alt="...">
 *     <button class="play-button"><i class="fas fa-play"></i></button>
 *   </div>
 *   ...
 * </div>
 * <div class="media-modal">
 *   <div class="active-video">
 *     <iframe src="//www.youtube-nocookie.com/embed/n1hZEU19AfI?..." title="We Are Grace"></iframe>
 *   </div>
 * </div>
 *
 * Generated: 2026-02-26
 */
export default function parse(element, { document }) {
  // Extract poster image
  // VALIDATED: Found <img src="...Video-Still-We-Are-Grace.jpg" alt="..."> at line 608
  const posterImg = element.querySelector('.media-video .img img')
    || element.querySelector('.img img')
    || element.querySelector('img');

  // Extract YouTube video URL from iframe or video source
  // VALIDATED: Found iframe with src="//www.youtube-nocookie.com/embed/n1hZEU19AfI?..." at line 645
  const iframe = element.querySelector('.media-modal iframe[src*="youtube"]')
    || element.querySelector('iframe[src*="youtube"]')
    || element.querySelector('iframe[title]');

  let videoUrl = '';
  if (iframe) {
    const src = iframe.src || iframe.getAttribute('src') || '';
    // Extract video ID from youtube-nocookie or youtube embed URLs
    const videoIdMatch = src.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    if (videoIdMatch) {
      videoUrl = `https://www.youtube.com/watch?v=${videoIdMatch[1]}`;
    } else {
      // Fallback: use the iframe src directly, fixing protocol
      videoUrl = src.startsWith('//') ? `https:${src}` : src;
    }
  }

  // Build cells array matching Embed block table structure
  const cells = [];

  // Row 1: Poster image (optional)
  if (posterImg) {
    cells.push([posterImg]);
  }

  // Row 2: YouTube URL as a link
  if (videoUrl) {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.textContent = videoUrl;
    cells.push([link]);
  }

  // Create block using WebImporter utility
  const block = WebImporter.Blocks.createBlock(document, { name: 'Embed-Video', cells });

  // Replace original element with structured block table
  element.replaceWith(block);
}
