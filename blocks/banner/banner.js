/*
 * Consolidated banner block. Each variant keeps its own decorate module in
 * this folder; the family block dispatches to the matching one by variant class.
 */
import decorateContactSplit from './contact-split.js';
import decorateCta from './cta.js';

const DECORATORS = {
  'contact-split': decorateContactSplit,
  cta: decorateCta,
};

export default async function decorate(block) {
  const variant = Object.keys(DECORATORS).find((v) => block.classList.contains(v));
  if (variant) await DECORATORS[variant](block);
}
