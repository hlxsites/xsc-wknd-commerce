/* eslint-disable import/no-unresolved */

import { events } from '@dropins/elsie/event-bus.js';
import { fetchPlaceholders, getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

function addAnimation() {
  window.addEventListener('scroll', () => {
    const header = document.getElementsByClassName('header-nav-wrapper')[0];
    const scrollPosition = window.scrollY;
    const viewportWidth = window.innerWidth;

    if (viewportWidth > 900) {
      if (scrollPosition > 168) {
        header.classList.add('minimized');
      } else {
        header.classList.remove('minimized');
      }
    } else {
      header.classList.remove('minimized');
    }
  });
}

function setActiveTab() {
  const currentPath = window.location.pathname;
  const matchResult = currentPath.match(/^\/([^/]+)/);
  const path = matchResult ? matchResult[1] : null;
  const navTabLinks = document.querySelector('.nav-sections ul');

  [...navTabLinks.children].forEach((tab) => {
    const link = tab.querySelector('a');
    const linkTitle = link.title.toLowerCase();

    if (linkTitle === path) {
      link.classList.add('active');
    }
  });

  /* temp - only for the demo since the adventures landing page is the "home page"
  */
  if (!path) {
    const adventureTab = navTabLinks.querySelector('a[title="Adventures"],a[title="adventures"]');
    adventureTab.classList.add('active');
  }
}

// function getDirectTextContent(menuItem) {
//   const menuLink = menuItem.querySelector(':scope > a');
//   if (menuLink) {
//     return menuLink.textContent.trim();
//   }
//   return Array.from(menuItem.childNodes)
//     .filter((n) => n.nodeType === Node.TEXT_NODE)
//     .map((n) => n.textContent)
//     .join(' ');
// }

// async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
//   const crumbs = [];

//   const homeUrl = document.querySelector('.nav-brand a').href;

//   let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
//   if (menuItem) {
//     do {
//       const link = menuItem.querySelector(':scope > a');
//       crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
//       menuItem = menuItem.closest('ul')?.closest('li');
//     } while (menuItem);
//   } else if (currentUrl !== homeUrl) {
//     crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
//   }

//   const placeholders = await fetchPlaceholders();
//   const homePlaceholder = placeholders.breadcrumbsHomeLabel || 'Home';

//   crumbs.unshift({ title: homePlaceholder, url: homeUrl });

//   // last link is current page and should not be linked
//   if (crumbs.length > 1) {
//     crumbs[crumbs.length - 1].url = null;
//   }
//   crumbs[crumbs.length - 1]['aria-current'] = 'page';
//   return crumbs;
// }

// async function buildBreadcrumbs() {
//   const breadcrumbs = document.createElement('nav');
//   breadcrumbs.className = 'breadcrumbs';

//   const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

//   const ol = document.createElement('ol');
//   ol.append(...crumbs.map((item) => {
//     const li = document.createElement('li');
//     if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
//     if (item.url) {
//       const a = document.createElement('a');
//       a.href = item.url;
//       a.textContent = item.title;
//       li.append(a);
//     } else {
//       li.textContent = item.title;
//     }
//     return li;
//   }));

//   breadcrumbs.append(ol);
//   return breadcrumbs;
// }
function buildCustomBreadcrumbs() {
  const path = window.location.pathname.split('/').slice(1).map((word) => word.charAt(0).toUpperCase() + word.slice(1).replace(/-/g, ' '));

  const breadcrumbContainer = document.createElement('div');
  breadcrumbContainer.className = 'breadcrumb-container';

  path.forEach((text, index) => {
    const element = document.createElement(index === 0 ? 'a' : 'span');
    if (index === 0) {
      element.href = `/${text.toLowerCase().replace(/ /g, '-')}`;
    }
    element.textContent = text;
    breadcrumbContainer.appendChild(element);
    if (index < path.length - 1) {
      breadcrumbContainer.appendChild(document.createTextNode(' • '));
    }
  });

  document.querySelector('main').prepend(breadcrumbContainer);
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  const navTools = nav.querySelector('.nav-tools');

  // Search
  const searchInput = document.createRange().createContextualFragment('<div class="nav-search-input hidden"><form action="/search" method="GET"><input type="search" name="q" placeholder="Search" /></form></div>');
  document.body.querySelector('header').append(searchInput);

  const searchButton = document.createRange().createContextualFragment('<button type="button" class="nav-search-button">Search</button>');
  navTools.append(searchButton);
  navTools.querySelector('.nav-search-button').addEventListener('click', () => {
    document.querySelector('header .nav-search-input').classList.toggle('hidden');
  });

  // Minicart
  const minicartButton = document.createRange().createContextualFragment(`<div class="minicart-wrapper">
    <button type="button" class="nav-cart-button">&nbsp;&nbsp;</button>
    <div class="minicart-panel"></div>
  </div>`);
  navTools.append(minicartButton);

  // TODO: Toggle Mini Cart; Mini Cart Drop-in is not yet available, go to Cart page instead.
  // const minicartPanel = navTools.querySelector('.minicart-panel');
  // let cartVisible = false;
  navTools.querySelector('.nav-cart-button').addEventListener('click', async () => {
  //   cartVisible = !cartVisible;
  //   minicartPanel.classList.toggle('minicart-panel-visible', cartVisible);
    window.location.href = '/cart';
  });

  // Cart Item Counter
  events.on('cart/data', (data) => {
    navTools.querySelector('.nav-cart-button').textContent = data?.totalQuantity || '0';
  }, { eager: true });

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'header-nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  addAnimation();
  setActiveTab();

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    // navWrapper.append(await buildBreadcrumbs());
    buildCustomBreadcrumbs();
  }
}
