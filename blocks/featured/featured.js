/*
 * Consolidated featured block. Each variant keeps its own decorate module in
 * this folder; the family block dispatches to the matching one by variant class.
 */
import decorateProductSelector from './product-selector.js';

const DECORATORS = {
  'product-selector': decorateProductSelector,
};

export default async function decorate(block) {
  const variant = Object.keys(DECORATORS).find((v) => block.classList.contains(v));
  if (variant) await DECORATORS[variant](block);
}
