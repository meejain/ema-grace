/*
 * Consolidated video block. Each variant keeps its own decorate module in
 * this folder; the family block dispatches to the matching one by variant class.
 */
import decorateGrid from './grid.js';
import decorateOverlay from './overlay.js';

const DECORATORS = {
  grid: decorateGrid,
  overlay: decorateOverlay,
};

export default async function decorate(block) {
  const variant = Object.keys(DECORATORS).find((v) => block.classList.contains(v));
  if (variant) await DECORATORS[variant](block);
}
