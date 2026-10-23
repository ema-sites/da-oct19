import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Product cards: one row per card (background image | text).
 * Text: optional eyebrow, heading or logo image, description, CTA, optional footnote.
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-product-card';
    const body = document.createElement('div');
    body.className = 'cards-product-card-body';
    let hasImage = false;

    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !cell.textContent.trim() && !hasImage) {
        const img = pic.querySelector('img');
        const imageWrap = document.createElement('div');
        imageWrap.className = 'cards-product-card-image';
        imageWrap.append(img
          ? createOptimizedPicture(img.src, img.alt, false, [{ width: '1000' }])
          : pic);
        li.append(imageWrap);
        hasImage = true;
        return;
      }
      body.append(...cell.childNodes);
    });

    // Classify body parts defensively; authors may omit any of them.
    const children = [...body.children];
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    const ctaIndex = children.findIndex((el) => el.querySelector('a'));
    children.forEach((el, i) => {
      if (el.matches('h1, h2, h3, h4, h5, h6')) {
        el.classList.add('cards-product-title');
      } else if (el.querySelector('picture') && !el.textContent.trim()) {
        el.classList.add('cards-product-logo');
      } else if (el.querySelector('a')) {
        el.classList.add('cards-product-cta');
      } else if (heading && children.indexOf(heading) > i) {
        el.classList.add('cards-product-eyebrow');
      } else if (ctaIndex > -1 && i > ctaIndex) {
        el.classList.add('cards-product-footnote');
      } else if (!heading && i === 0 && children.length > 2
        && children[1]?.querySelector('picture')) {
        el.classList.add('cards-product-eyebrow');
      } else {
        el.classList.add('cards-product-description');
      }
    });

    if (!hasImage && !body.children.length) return;
    if (!hasImage) li.classList.add('no-image');
    li.append(body);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
