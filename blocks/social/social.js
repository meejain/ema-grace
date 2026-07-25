/*
 * Consolidated social block. Each variant keeps its own decorate module in
 * this folder; the family block dispatches to the matching one by variant class.
 */
import decorateFollow from './follow.js';
import decorateShare from './share.js';

const DECORATORS = {
  follow: decorateFollow,
  share: decorateShare,
};

export default async function decorate(block) {
  const variant = Object.keys(DECORATORS).find((v) => block.classList.contains(v));
  if (variant) await DECORATORS[variant](block);
}
