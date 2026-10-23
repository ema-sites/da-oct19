/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-promo (Elementor container with CSS background image).
 * Row 1: background image (from CSS background-image, e.g. bg-Exclusive-1.jpg).
 * Row 2: heading, description, CTA link.
 */
const BG_FALLBACK = {
  f4e421d: 'https://bradescobank.com/wp-content/uploads/2024/10/bg-Exclusive-1.jpg',
};

function getBackgroundUrl(el, document) {
  const extract = (value) => {
    const m = (value || '').match(/url\(\s*["']?([^"')]+)["']?\s*\)/);
    return m ? m[1] : null;
  };
  let url = extract(el.style && el.style.backgroundImage);
  if (!url) {
    try {
      const view = document.defaultView || (typeof window !== 'undefined' ? window : null);
      if (view && view.getComputedStyle) url = extract(view.getComputedStyle(el).backgroundImage);
    } catch (e) { /* ignore */ }
  }
  if (!url) {
    const idClass = [...el.classList].find((c) => /^elementor-element-[0-9a-f]{7}$/.test(c));
    if (idClass) url = BG_FALLBACK[idClass.replace('elementor-element-', '')] || null;
  }
  return url;
}

export default function parse(element, { document }) {
  const cells = [];

  // Row 1: background image
  const directImg = element.querySelector(':scope > img');
  let bgImg = null;
  if (directImg) {
    bgImg = directImg;
  } else {
    const bg = getBackgroundUrl(element, document);
    if (bg) {
      bgImg = document.createElement('img');
      bgImg.src = bg;
      bgImg.alt = '';
    }
  }
  if (bgImg) cells.push([bgImg]);

  // Row 2: text content + CTA
  const content = [];
  element.querySelectorAll('.elementor-widget-text-editor .elementor-widget-container, .elementor-widget-heading .elementor-widget-container')
    .forEach((container) => {
      [...container.children].forEach((child) => {
        if (child.textContent.trim()) content.push(child);
      });
    });
  element.querySelectorAll('.elementor-widget-button a').forEach((btn) => {
    const a = document.createElement('a');
    a.href = btn.getAttribute('href') || '';
    a.textContent = btn.textContent.trim();
    const p = document.createElement('p');
    p.append(a);
    content.push(p);
  });
  cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-promo', cells });
  element.replaceWith(block);
}
