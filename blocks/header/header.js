// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

// section order in the nav fragment
const SECTION_CLASSES = ['topbar', 'brand', 'sections', 'tools'];

/**
 * Fetches the nav fragment: /content first (local preview), then the site root (DA/EDS).
 * @returns {Promise<Element|null>} wrapper holding the fragment sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = await resp.text();
  // resolve relative image paths against the fragment location, not the page
  wrapper.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), resp.url).href;
  });
  return wrapper;
}

/**
 * Closes every open dropdown inside the nav
 * @param {Element} nav the nav element
 * @param {Element} [except] dropdown to leave untouched
 */
function closeDropdowns(nav, except) {
  nav.querySelectorAll('.nav-drop').forEach((drop) => {
    if (drop === except) return;
    drop.classList.remove('is-open');
    drop.querySelector(':scope > button').setAttribute('aria-expanded', 'false');
    drop.querySelector(':scope > .nav-drop-panel').inert = true;
  });
}

/**
 * Opens or closes the mobile menu
 * @param {Element} nav the nav element
 * @param {boolean} [force] expanded state to force
 */
function toggleMenu(nav, force) {
  const expanded = force !== undefined ? force : nav.getAttribute('aria-expanded') !== 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  button.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = expanded && !isDesktop.matches ? 'hidden' : '';
  if (!expanded) closeDropdowns(nav);
}

/**
 * Turns every list item that holds a nested list into a click-toggled dropdown
 * @param {Element} nav the nav element
 * @param {Element} container section holding the lists
 */
function decorateDropdowns(nav, container) {
  container.querySelectorAll(':scope > ul').forEach((ul) => ul.classList.add('nav-list'));
  container.querySelectorAll(':scope > ul > li').forEach((li) => {
    const subList = li.querySelector(':scope > ul');
    if (!subList) {
      li.querySelector(':scope > a')?.classList.add('nav-trigger');
      return;
    }
    li.classList.add('nav-drop');
    subList.classList.add('nav-drop-panel');
    subList.inert = true;
    const button = document.createElement('button');
    button.className = 'nav-trigger';
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    const label = document.createElement('span');
    label.textContent = li.querySelector(':scope > p')?.textContent.trim()
      || [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim();
    const chevron = document.createElement('span');
    chevron.className = 'nav-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    button.append(label, chevron);
    [...li.childNodes].forEach((node) => { if (node !== subList) node.remove(); });
    li.prepend(button);
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !li.classList.contains('is-open');
      closeDropdowns(nav, li);
      li.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      subList.inert = !open;
    });
  });
}

/**
 * Classifies the tool lists: dropdown CTA lists and image-only (locale) lists
 * @param {Element} tools the tools section
 */
function decorateTools(tools) {
  tools.querySelectorAll(':scope > ul').forEach((ul) => {
    const items = [...ul.children];
    if (ul.querySelector('.nav-drop')) {
      ul.classList.add('nav-cta');
    } else if (items.length && items.every((li) => li.querySelector('img') && !li.textContent.trim())) {
      ul.classList.add('nav-locale');
      // the entry without a link is the current locale
      items.forEach((li) => { if (!li.querySelector('a')) li.classList.add('is-current'); });
    }
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;

  block.textContent = '';
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  const sections = [...fragment.children];
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  sections.forEach((section, i) => {
    const name = SECTION_CLASSES[i];
    if (!name) return;
    section.classList.add(`nav-${name}`);
    if (name === 'topbar') {
      const inner = document.createElement('div');
      inner.className = 'nav-topbar-inner';
      inner.append(...section.childNodes);
      section.append(inner);
      navWrapper.append(section);
    } else {
      nav.append(section);
    }
  });

  // brand: first logo is the default (over hero), a second logo is the solid-state variant
  const brand = nav.querySelector('.nav-brand');
  if (brand) {
    const logos = brand.querySelectorAll(':scope > p');
    logos[0]?.classList.add('nav-logo-default');
    logos[1]?.classList.add('nav-logo-solid');
  }

  const navSections = nav.querySelector('.nav-sections');
  const navTools = nav.querySelector('.nav-tools');
  [navSections, navTools].forEach((s) => { if (s) decorateDropdowns(nav, s); });
  if (navTools) decorateTools(navTools);

  // sections and tools form one menu: right-aligned group on desktop, drawer on mobile
  const navMenu = document.createElement('div');
  navMenu.className = 'nav-menu';
  navMenu.append(...[navSections, navTools].filter(Boolean));
  nav.append(navMenu);

  // links leaving the site open in a new tab, like the source
  nav.querySelectorAll('a[href^="http"]').forEach((a) => {
    if (new URL(a.href).host !== window.location.host && a.closest('.nav-drop-panel')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  const navBar = document.createElement('div');
  navBar.className = 'nav-bar';
  navBar.append(nav);
  navWrapper.append(navBar);
  block.append(navWrapper);

  // transparent header only when a hero sits directly behind it
  const firstSection = document.querySelector('main > .section');
  if (firstSection?.querySelector('[class*="hero"]')) navWrapper.classList.add('is-transparent');

  // close dropdowns on outside click and Escape
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) closeDropdowns(nav); });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.nav-drop.is-open > button');
    closeDropdowns(nav);
    if (open) open.focus();
    else if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') toggleMenu(nav, false);
  });

  // solid sticky bar once the top bar has scrolled away
  const onScroll = () => {
    const topbar = navWrapper.querySelector('.nav-topbar');
    const threshold = topbar && isDesktop.matches ? topbar.offsetHeight : 0;
    navWrapper.classList.toggle('is-sticky', window.scrollY > threshold);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // reset menu state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    onScroll();
  });
}
