/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-product (2-up photo cards with overlay text, Elementor containers).
 * One row per card: background image cell | text cell
 * (eyebrow, heading or logo image, description, CTA link, optional footnote).
 */

// Desktop background images from Elementor post CSS (fallback when computed styles are unavailable)
const BG_FALLBACK = {
  e274826: 'https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-home-investments-2.jpg',
  '1391f39': 'https://bradescobank.com/wp-content/uploads/2024/10/desk-thumb-produto-3.jpg',
  f9193f1: 'https://bradescobank.com/wp-content/uploads/2026/08/thumb-bradesco-credit-home-1.webp',
  '3618faf': 'https://bradescobank.com/wp-content/uploads/2025/12/home-zelle-2.webp',
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

// Collect the content of an Elementor widget container as block-level elements.
function widgetContent(container, document) {
  const out = [];
  let loose = null;
  [...container.childNodes].forEach((node) => {
    const isBlockEl = node.nodeType === 1 && /^(P|H[1-6]|UL|OL|DIV|TABLE|BLOCKQUOTE)$/.test(node.tagName);
    if (isBlockEl) {
      loose = null;
      if (node.textContent.trim() || node.querySelector('img')) out.push(node);
      return;
    }
    if (node.nodeType === 3 && !node.textContent.trim()) {
      if (loose) loose.append(node);
      return;
    }
    if (!loose) {
      loose = document.createElement('p');
      out.push(loose);
    }
    loose.append(node);
  });
  return out.filter((el) => el.textContent.trim() || el.querySelector('img'));
}

export default function parse(element, { document }) {
  const cells = [];

  const cards = [...element.querySelectorAll(':scope > .e-con.e-child')];
  cards.forEach((card) => {
    // Image cell: direct child img (materialized background) or CSS background
    const imgCell = [];
    const directImg = card.querySelector(':scope > img');
    if (directImg) {
      imgCell.push(directImg);
    } else {
      const bg = getBackgroundUrl(card, document);
      if (bg) {
        const img = document.createElement('img');
        img.src = bg;
        img.alt = '';
        imgCell.push(img);
      }
    }

    // Text cell
    const textCell = [];
    const textWrap = card.querySelector('.discovery-product');
    if (textWrap) {
      textWrap.querySelectorAll('.elementor-widget').forEach((widget) => {
        const container = widget.querySelector('.elementor-widget-container') || widget;
        if (widget.classList.contains('elementor-widget-image')) {
          const img = container.querySelector('img');
          if (img) {
            const p = document.createElement('p');
            p.append(img);
            textCell.push(p);
          }
          return;
        }
        textCell.push(...widgetContent(container, document));
      });
    }

    // CTA button
    const btn = card.querySelector(':scope > .elementor-widget-button a[href], :scope > .elementor-widget-button a');
    if (btn) {
      const a = document.createElement('a');
      a.href = btn.getAttribute('href') || '';
      a.textContent = btn.textContent.trim();
      const p = document.createElement('p');
      p.append(a);
      textCell.push(p);
    }

    // Footnote(s): text-editor widgets that are direct children after the button
    card.querySelectorAll(':scope > .elementor-widget-text-editor').forEach((widget) => {
      const container = widget.querySelector('.elementor-widget-container') || widget;
      textCell.push(...widgetContent(container, document));
    });

    if (!imgCell.length && !textCell.length) return;
    cells.push([imgCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
