/*
 * Consolidated custom-widget block. Each variant keeps its own decorate module in
 * this folder; the family block dispatches to the matching one by variant class.
 */
import decorateContactPanel from './contact-panel.js';
import decorateContactSticky from './contact-sticky.js';
import decorateDocumentViewer from './document-viewer.js';
import decorateNewsArchive from './news-archive.js';
import decorateSearchFilter from './search-filter.js';
import decorateSearchResults from './search-results.js';

const DECORATORS = {
  'contact-panel': decorateContactPanel,
  'contact-sticky': decorateContactSticky,
  'document-viewer': decorateDocumentViewer,
  'news-archive': decorateNewsArchive,
  'search-filter': decorateSearchFilter,
  'search-results': decorateSearchResults,
};

export default async function decorate(block) {
  const variant = Object.keys(DECORATORS).find((v) => block.classList.contains(v));
  if (variant) await DECORATORS[variant](block);
}
