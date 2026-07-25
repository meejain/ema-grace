/*
 * Consolidated quote block. Each variant keeps its own decorate module in
 * this folder; the family block dispatches to the matching one by variant class.
 */
import decorateCta from './cta.js';
import decorateHighlight from './highlight.js';
import decorateTestimonial from './testimonial.js';

const DECORATORS = {
  cta: decorateCta,
  highlight: decorateHighlight,
  testimonial: decorateTestimonial,
};

export default async function decorate(block) {
  const variant = Object.keys(DECORATORS).find((v) => block.classList.contains(v));
  if (variant) await DECORATORS[variant](block);
}
