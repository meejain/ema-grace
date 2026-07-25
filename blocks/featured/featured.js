/*
 * Consolidated featured block. Each variant keeps its own decorate module in
 * this folder; the family block dispatches to the matching one by variant class.
 */
import decorateHorizontal from './horizontal.js';
import decorateInsights from './insights.js';
import decorateProductSelector from './product-selector.js';
import decorateProducts from './products.js';

const DECORATORS = {
  horizontal: decorateHorizontal,
  insights: decorateInsights,
  'product-selector': decorateProductSelector,
  products: decorateProducts,
};

export default async function decorate(block) {
  const variant = Object.keys(DECORATORS).find((v) => block.classList.contains(v));
  if (variant) await DECORATORS[variant](block);
}
