/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-segment (4-up linked image tiles, Elementor "services" section).
 * Each tile is an <a class="e-con e-child"> whose image is a CSS background.
 * One row per tile: image cell | label cell (link).
 */

// Desktop background images from Elementor post CSS (fallback when computed styles are unavailable)
const BG_FALLBACK = {
  '9c67a4b': 'https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-2.jpg',
  '109f75e': 'https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-1.jpg',
  'a6eeed4': 'https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-4.jpg',
  'a264488': 'https://bradescobank.com/wp-content/uploads/2024/05/desk-thumb-discovery-3.jpg',
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

  const tiles = [...element.querySelectorAll(':scope > a.e-con, :scope > .e-con-inner > a.e-con')];
  tiles.forEach((tile) => {
    const labelEl = tile.querySelector('.title-services .elementor-widget-container, .elementor-widget-text-editor .elementor-widget-container');
    const labelText = (labelEl ? labelEl.textContent : tile.textContent).trim();

    const imgCell = [];
    const existingImg = tile.querySelector('img');
    const bg = getBackgroundUrl(tile, document);
    if (existingImg) {
      imgCell.push(existingImg);
    } else if (bg) {
      const img = document.createElement('img');
      img.src = bg;
      img.alt = labelText;
      imgCell.push(img);
    }

    const a = document.createElement('a');
    a.href = tile.getAttribute('href') || '';
    a.textContent = labelText;
    const p = document.createElement('p');
    p.append(a);

    cells.push([imgCell, [p]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-segment', cells });
  element.replaceWith(block);
}
