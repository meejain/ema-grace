import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeAllDropdowns(navSections) {
  if (!navSections) return;
  navSections.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((drop) => {
    drop.setAttribute('aria-expanded', 'false');
  });
  const overlay = document.querySelector('.nav-overlay');
  if (overlay) overlay.classList.remove('active');
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (!expanded && !isDesktop.matches) {
    closeAllDropdowns(navSections);
  }

  // Reset mobile slide nav to root when closing
  const mobileNav = navSections?.querySelector('.mobile-slide-nav');
  if (mobileNav && mobileNav.renderRoot) {
    mobileNav.renderRoot();
  }
}

/* === Mobile slide-in-panel navigation === */

function extractNavTree(ul) {
  return [...ul.children].filter((li) => li.querySelector(':scope > a, :scope > p > a')).map((li) => {
    const a = li.querySelector(':scope > a, :scope > p > a');
    const sub = li.querySelector(':scope > ul');
    return {
      label: a.textContent.trim(),
      href: a.getAttribute('href') || '#',
      children: sub ? extractNavTree(sub) : [],
    };
  });
}

function buildMobileSlideNav(navTree, utilityItems) {
  const container = document.createElement('div');
  container.className = 'mobile-slide-nav';

  let path = [];

  function getItemsAtPath() {
    return path.reduce((items, crumb) => {
      const found = items.find((it) => it.label === crumb.label);
      return found ? found.children : items;
    }, navTree);
  }

  function render() {
    container.innerHTML = '';
    const currentItems = getItemsAtPath();

    if (path.length > 0) {
      const back = document.createElement('a');
      back.className = 'mobile-slide-back';
      back.href = '#';
      back.innerHTML = '<span class="mobile-slide-back-icon">\u00AB</span> MAIN MENU';
      back.addEventListener('click', (e) => {
        e.preventDefault();
        path = [];
        render();
      });
      container.append(back);

      const bc = document.createElement('div');
      bc.className = 'mobile-slide-breadcrumb';
      path.forEach((p, i) => {
        if (i > 0) bc.append(document.createTextNode(' / '));
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = p.label;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          path = path.slice(0, i + 1);
          render();
        });
        bc.append(link);
      });
      container.append(bc);
    }

    const ul = document.createElement('ul');
    ul.className = 'mobile-slide-items';
    currentItems.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;

      if (item.children.length > 0) {
        li.classList.add('has-children');
        a.addEventListener('click', (e) => {
          e.preventDefault();
          path.push({ label: item.label });
          render();
        });
      }
      li.append(a);
      ul.append(li);
    });
    container.append(ul);

    // Show utility links at root level (dark area)
    if (path.length === 0 && utilityItems.length > 0) {
      const utilSection = document.createElement('div');
      utilSection.className = 'mobile-slide-utility';
      utilityItems.forEach((item) => {
        const a = document.createElement('a');
        a.href = item.href;
        a.textContent = item.label;
        utilSection.append(a);
      });
      container.append(utilSection);
    }
  }

  render();

  container.renderRoot = () => { path = []; render(); };
  return container;
}

function buildMegamenuPanel(navDrop) {
  const subList = navDrop.querySelector(':scope > ul');
  if (!subList) return;

  const items = [...subList.children];
  const hasDeepNesting = items.some((li) => li.querySelector(':scope > ul > li > ul'));

  if (!hasDeepNesting) return;

  const panel = document.createElement('div');
  panel.className = 'megamenu-panel';

  const categoryCol = document.createElement('div');
  categoryCol.className = 'megamenu-categories';

  const contentCol = document.createElement('div');
  contentCol.className = 'megamenu-content';

  items.forEach((li, idx) => {
    const link = li.querySelector(':scope > a, :scope > p > a');
    const deepContent = li.querySelector(':scope > ul');

    const catItem = document.createElement('div');
    catItem.className = 'megamenu-category-item';
    if (idx === 0) catItem.classList.add('active');

    const catLink = link.cloneNode(true);
    catItem.append(catLink);
    categoryCol.append(catItem);

    if (deepContent) {
      const contentPane = document.createElement('div');
      contentPane.className = 'megamenu-content-pane';
      if (idx === 0) contentPane.classList.add('active');
      contentPane.dataset.index = idx;

      const groups = [...deepContent.children];
      const groupContainer = document.createElement('div');
      groupContainer.className = 'megamenu-groups';

      let promoBlock = null;
      let flatLinksGroup = null;

      groups.forEach((groupLi) => {
        const groupLink = groupLi.querySelector(':scope > a, :scope > p > a');
        const groupSubList = groupLi.querySelector(':scope > ul');

        if (groupSubList) {
          const promoImg = groupSubList.querySelector(':scope > li > img, :scope > li > p > picture img');
          if (promoImg) {
            promoBlock = document.createElement('div');
            promoBlock.className = 'megamenu-promo';
            const promoLink = document.createElement('a');
            promoLink.href = groupLink ? groupLink.href : '#';
            promoLink.append(promoImg.cloneNode(true));
            const promoTitle = document.createElement('div');
            promoTitle.className = 'megamenu-promo-title';
            promoTitle.textContent = groupLink ? groupLink.textContent : '';
            promoLink.append(promoTitle);
            const descPs = [...groupSubList.querySelectorAll(':scope > li > p')];
            const promoDesc = descPs.find((p) => !p.querySelector('picture, img'));
            if (promoDesc) {
              const desc = document.createElement('p');
              desc.className = 'megamenu-promo-desc';
              desc.textContent = promoDesc.textContent;
              promoLink.append(desc);
            }
            promoBlock.append(promoLink);
          } else {
            const group = document.createElement('div');
            group.className = 'megamenu-group';
            if (groupLink) {
              const heading = document.createElement('div');
              heading.className = 'megamenu-group-heading';
              const headingLink = groupLink.cloneNode(true);
              heading.append(headingLink);
              group.append(heading);
            }
            const groupItems = document.createElement('ul');
            groupItems.className = 'megamenu-group-items';
            [...groupSubList.children].forEach((subLi) => {
              const item = document.createElement('li');
              const subLink = subLi.querySelector('a');
              if (subLink) item.append(subLink.cloneNode(true));
              groupItems.append(item);
            });
            group.append(groupItems);
            groupContainer.append(group);
          }
        } else if (groupLink) {
          // Flat link without sub-groups — collect into a single flat links group
          if (!flatLinksGroup) {
            flatLinksGroup = document.createElement('div');
            flatLinksGroup.className = 'megamenu-group';
            const flatItems = document.createElement('ul');
            flatItems.className = 'megamenu-group-items';
            flatLinksGroup.append(flatItems);
            groupContainer.append(flatLinksGroup);
          }
          const item = document.createElement('li');
          item.append(groupLink.cloneNode(true));
          flatLinksGroup.querySelector('.megamenu-group-items').append(item);
        }
      });

      contentPane.append(groupContainer);
      if (promoBlock) contentPane.append(promoBlock);
      contentCol.append(contentPane);
    }

    catItem.addEventListener('mouseenter', () => {
      categoryCol.querySelectorAll('.megamenu-category-item').forEach((c) => c.classList.remove('active'));
      catItem.classList.add('active');
      contentCol.querySelectorAll('.megamenu-content-pane').forEach((p) => p.classList.remove('active'));
      const pane = contentCol.querySelector(`[data-index="${idx}"]`);
      if (pane) pane.classList.add('active');
    });
  });

  panel.append(categoryCol);
  panel.append(contentCol);

  subList.replaceWith(panel);
  navDrop.classList.add('has-megamenu');
}

function buildSimpleDropdownPanel(navDrop) {
  const subList = navDrop.querySelector(':scope > ul');
  if (!subList || navDrop.classList.contains('has-megamenu')) return;

  const panel = document.createElement('div');
  panel.className = 'dropdown-panel';

  const leftCol = document.createElement('div');
  leftCol.className = 'dropdown-panel-categories';

  const rightCol = document.createElement('div');
  rightCol.className = 'dropdown-panel-content';

  // Check for items with nested sub-lists (e.g. Locations with city sub-items)
  const items = subList.querySelectorAll(':scope > li');
  items.forEach((li, idx) => {
    const nestedUl = li.querySelector(':scope > ul');
    if (nestedUl) {
      li.classList.add('has-sub-content');
      li.setAttribute('data-sub-index', idx);

      // Build a content pane for this item's sub-items
      const pane = document.createElement('div');
      pane.className = 'dropdown-sub-pane';
      pane.setAttribute('data-index', idx);

      const subGrid = document.createElement('div');
      subGrid.className = 'dropdown-sub-grid';
      nestedUl.querySelectorAll(':scope > li').forEach((subLi) => {
        const link = subLi.querySelector('a');
        if (link) {
          const clone = link.cloneNode(true);
          subGrid.appendChild(clone);
        }
      });

      pane.appendChild(subGrid);
      rightCol.appendChild(pane);

      // Remove the nested ul from the left column (keep only the parent link)
      nestedUl.remove();
    }
  });

  // Set first item as active by default
  const firstItem = subList.querySelector(':scope > li');
  if (firstItem) firstItem.classList.add('active');

  // If first item has sub-content, show its pane
  const firstPane = rightCol.querySelector('.dropdown-sub-pane');
  if (firstItem?.classList.contains('has-sub-content') && firstPane) {
    firstPane.classList.add('active');
  }

  // Add hover handlers on ALL category items for active state management
  items.forEach((li) => {
    li.addEventListener('mouseenter', () => {
      // Remove active from all items
      subList.querySelectorAll(':scope > li').forEach((c) => c.classList.remove('active'));
      li.classList.add('active');

      // Show matching sub-pane if this item has sub-content
      rightCol.querySelectorAll('.dropdown-sub-pane').forEach((p) => p.classList.remove('active'));
      if (li.classList.contains('has-sub-content')) {
        const idx2 = li.getAttribute('data-sub-index');
        const pane2 = rightCol.querySelector(`.dropdown-sub-pane[data-index="${idx2}"]`);
        if (pane2) pane2.classList.add('active');
      }
    });
  });

  leftCol.appendChild(subList);
  panel.appendChild(leftCol);
  panel.appendChild(rightCol);
  navDrop.appendChild(panel);
}

function positionDropdownPanel(navDrop, navEl) {
  const panel = navDrop.querySelector('.dropdown-panel, .megamenu-panel');
  if (!panel || !isDesktop.matches) return;
  const navRect = navEl.getBoundingClientRect();
  const liRect = navDrop.getBoundingClientRect();
  panel.style.left = `${navRect.left - liRect.left}px`;
  panel.style.width = `${navRect.width}px`;
  panel.style.top = `${navRect.bottom - liRect.top}px`;
}

function buildSearchOverlay(nav) {
  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';

  // Build top searched products from nav tools section (ul > li with nested ul)
  const navTools = nav.querySelector('.nav-tools');
  const toolsUl = navTools?.querySelector('ul');
  let topProductsHTML = '';
  if (toolsUl) {
    const parentLi = toolsUl.querySelector('li');
    if (parentLi) {
      const heading = parentLi.childNodes[0]?.textContent?.trim() || 'Top Searched Products';
      const nestedUl = parentLi.querySelector('ul');
      if (nestedUl) {
        const links = [...nestedUl.querySelectorAll('a')];
        const half = Math.ceil(links.length / 2);
        const col1 = links.slice(0, half).map((a) => `<li><a href="${a.href}">${a.textContent}<span class="chevron">›</span></a></li>`).join('');
        const col2 = links.slice(half).map((a) => `<li><a href="${a.href}">${a.textContent}<span class="chevron">›</span></a></li>`).join('');
        topProductsHTML = `<div class="nav-search-suggestions-section">
          <h3>${heading}</h3>
          <div class="nav-search-suggestions-grid">
            <ul>${col1}</ul>
            <ul>${col2}</ul>
          </div>
        </div>`;
      }
    }
    // Remove the suggestions list from visible utility bar
    toolsUl.remove();
  }

  overlay.innerHTML = `<div class="search-overlay-content">
      <button class="search-close" aria-label="Close search"><span>&times;</span></button>
      <div class="search-form">
        <input type="search" placeholder="Search our site" aria-label="Search our site">
        <button class="search-submit" aria-label="Search"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
      </div>
      <div class="search-options">
        <label><input type="checkbox" name="products-only"> Show products only</label>
      </div>
      ${topProductsHTML}
    </div>`;

  overlay.querySelector('.search-close').addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.style.overflowY = '';
  });

  nav.closest('.nav-wrapper').append(overlay);
  return overlay;
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand?.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  // Build utility bar from tools section
  const navTools = nav.querySelector('.nav-tools');
  const utilityBar = document.createElement('div');
  utilityBar.className = 'nav-utility';
  if (navTools) {
    const utilityLinks = navTools.querySelectorAll('p > a');
    utilityLinks.forEach((link) => {
      if (link.textContent.trim().toLowerCase() !== 'search') {
        const utilLink = link.cloneNode(true);
        utilityBar.append(utilLink);
      }
    });
  }

  // Search button in main nav
  const searchBtn = document.createElement('button');
  searchBtn.className = 'nav-search-btn';
  searchBtn.setAttribute('aria-label', 'Search');
  searchBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>';

  // Background overlay for dropdowns
  const navOverlay = document.createElement('div');
  navOverlay.className = 'nav-overlay';
  navOverlay.addEventListener('click', () => {
    closeAllDropdowns(nav.querySelector('.nav-sections'));
  });

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    // Extract nav tree BEFORE desktop transforms for mobile slide-in nav
    const navList = navSections.querySelector('.default-content-wrapper > ul');
    const navTree = navList ? extractNavTree(navList) : [];

    // Extract utility items for mobile (paragraph links only, not nested list)
    const utilityItems = [];
    if (navTools) {
      navTools.querySelectorAll('p > a').forEach((a) => {
        if (a.textContent.trim().toLowerCase() !== 'search') {
          utilityItems.push({
            label: a.textContent.trim(),
            href: a.getAttribute('href') || '#',
          });
        }
      });
    }

    // Build mobile slide-in nav
    const mobileSlideNav = buildMobileSlideNav(navTree, utilityItems);
    navSections.append(mobileSlideNav);

    // Desktop transforms
    let dropCloseTimeout;
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        navSection.setAttribute('aria-expanded', 'false');

        buildMegamenuPanel(navSection);
        buildSimpleDropdownPanel(navSection);

        // Desktop: hover to open (with delay to bridge gap between link and panel)
        navSection.addEventListener('mouseenter', () => {
          if (isDesktop.matches) {
            clearTimeout(dropCloseTimeout);
            closeAllDropdowns(navSections);
            navSection.setAttribute('aria-expanded', 'true');
            positionDropdownPanel(navSection, nav);
            navOverlay.classList.add('active');
          }
        });

        navSection.addEventListener('mouseleave', () => {
          if (isDesktop.matches) {
            dropCloseTimeout = setTimeout(() => {
              navSection.setAttribute('aria-expanded', 'false');
              navOverlay.classList.remove('active');
            }, 150);
          }
        });
      }
    });

    // Append search button after nav links (desktop only)
    if (navList) {
      const searchLi = document.createElement('li');
      searchLi.className = 'nav-search-item';
      searchLi.append(searchBtn);
      navList.append(searchLi);
    }
  }

  // Mobile search icon (visible in header bar on mobile)
  const mobileSearch = document.createElement('div');
  mobileSearch.className = 'nav-mobile-search';
  const mobileSearchBtn = document.createElement('button');
  mobileSearchBtn.className = 'nav-search-btn';
  mobileSearchBtn.setAttribute('aria-label', 'Search');
  mobileSearchBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>';
  mobileSearch.append(mobileSearchBtn);
  nav.append(mobileSearch);

  // Hamburger
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(utilityBar);
  navWrapper.append(nav);
  navWrapper.append(navOverlay);
  block.append(navWrapper);

  // Search overlay
  const searchOverlay = buildSearchOverlay(nav);
  searchBtn.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    document.body.style.overflowY = 'hidden';
    searchOverlay.querySelector('input').focus();
  });
  mobileSearchBtn.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    document.body.style.overflowY = 'hidden';
    searchOverlay.querySelector('input').focus();
  });

  // Handle resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, navSections, isDesktop.matches);
    closeAllDropdowns(navSections);
  });

  // Close on escape
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeAllDropdowns(navSections);
      const so = document.querySelector('.search-overlay.active');
      if (so) {
        so.classList.remove('active');
        document.body.style.overflowY = '';
      }
      if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
        toggleMenu(nav, navSections);
      }
    }
  });
}
