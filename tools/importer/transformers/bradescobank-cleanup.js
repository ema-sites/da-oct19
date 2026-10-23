/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for bradescobank.com (WordPress / Elementor / Blocksy).
 * Removes non-authorable site chrome; keeps Vimeo iframes used by hero-video parsers.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Overlays / widgets that can interfere with block matching
    WebImporter.DOMUtils.remove(element, [
      '#cookie-notice',
      'div.ct-drawer-canvas',
      '#offcanvas',
      'a.skip-link',
      'access-widget-ui',
      'a.acsb-sr-only',
      '.acsb-trigger',
      '.otgs-development-site-front-end',
    ]);

    // Thin decorative red stripe spacers (no content)
    WebImporter.DOMUtils.remove(element, [
      '.elementor-element-df3b3d3',
      '.elementor-element-1191c87',
    ]);

    // Mobile/tablet-only duplicate of the desktop hero
    WebImporter.DOMUtils.remove(element, ['.elementor-element-b9a3d24']);

    // Sections hidden on every breakpoint (not visible on the source site)
    element.querySelectorAll('.elementor-hidden-desktop.elementor-hidden-laptop.elementor-hidden-tablet.elementor-hidden-mobile')
      .forEach((el) => el.remove());
  }

  if (hookName === 'afterTransform') {
    // Global header / footer chrome
    WebImporter.DOMUtils.remove(element, [
      '#header',
      'header.ct-header',
      'footer.elementor',
      'footer.elementor-location-footer',
      'nav.mobile-menu',
      'script',
      'style',
      'noscript',
      'link',
      'iframe:not([src])',
    ]);

    // accessiBe screen-reader hint injected at runtime without a stable selector
    [...element.querySelectorAll('p, span, div')]
      .filter((el) => !el.children.length && /^Press Option\+1 for screen-reader mode/.test(el.textContent.trim()))
      .forEach((el) => el.remove());

    // Strip tracking / builder attributes
    element.querySelectorAll('[data-elementor-id], [data-id], [data-element_type], [data-settings], [data-widget_type], [onclick], [data-track]').forEach((el) => {
      ['data-elementor-id', 'data-id', 'data-element_type', 'data-settings', 'data-widget_type', 'onclick', 'data-track']
        .forEach((attr) => el.removeAttribute(attr));
    });
  }
}
