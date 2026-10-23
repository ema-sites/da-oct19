import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Promo banner: background image with overlaid heading, text and CTA.
 * @param {Element} block
 */
export default function decorate(block) {
  const background = document.createElement('div');
  background.className = 'hero-promo-background';
  const content = document.createElement('div');
  content.className = 'hero-promo-content';

  const cells = [...block.children].flatMap((row) => [...row.children]);
  cells.forEach((cell) => {
    const pic = cell.querySelector('picture');
    const isImageOnly = pic && !cell.textContent.trim();
    if (isImageOnly && !background.children.length) {
      const img = pic.querySelector('img');
      if (img) {
        background.append(createOptimizedPicture(img.src, img.alt, false, [
          { media: '(min-width: 900px)', width: '2000' },
          { width: '900' },
        ]));
      }
      return;
    }
    if (cell.textContent.trim() || cell.querySelector('picture, img')) {
      content.append(...cell.childNodes);
    }
  });

  content.querySelectorAll('a.button').forEach((a) => a.classList.add('hero-promo-cta'));

  block.replaceChildren();
  if (background.children.length) block.append(background);
  else block.classList.add('no-background');
  block.append(content);
}
