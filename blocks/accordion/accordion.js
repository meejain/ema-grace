/*
 * Consolidated accordion block. Each variant keeps its own decorate module in
 * this folder; the family block dispatches to the matching one by variant class.
 */
import decorateFaq from './faq.js';
import decorateNested from './nested.js';
import decorateRichContent from './rich-content.js';

const DECORATORS = {
  faq: decorateFaq,
  nested: decorateNested,
  'rich-content': decorateRichContent,
};

export default async function decorate(block) {
  const variant = Object.keys(DECORATORS).find((v) => block.classList.contains(v));
  if (variant) await DECORATORS[variant](block);
}
